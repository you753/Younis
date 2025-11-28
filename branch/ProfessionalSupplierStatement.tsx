import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  DollarSign,
  TrendingUp,
  Receipt,
  Filter,
  Truck
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProfessionalSupplierStatementProps {
  branchId?: number;
}

export default function ProfessionalSupplierStatement({ branchId }: ProfessionalSupplierStatementProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/purchases${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // Fetch supplier payment vouchers
  const { data: paymentVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/supplier-payment-vouchers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/supplier-payment-vouchers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // Fetch purchase returns
  const { data: purchaseReturns = [] } = useQuery<any[]>({
    queryKey: ['/api/purchase-returns'],
    refetchInterval: 2000
  });

  // Get selected supplier
  const selectedSupplier = useMemo(() => {
    if (!selectedSupplierId) return null;
    return suppliers.find((s: any) => s.id === selectedSupplierId);
  }, [selectedSupplierId, suppliers]);

  // Calculate total returned amount for a purchase
  const getReturnedAmount = (purchaseId: number) => {
    if (!purchaseReturns || !Array.isArray(purchaseReturns)) return 0;
    
    const relevantReturns = purchaseReturns.filter((ret: any) => 
      ret.purchaseId?.toString() === purchaseId.toString() || ret.purchaseId === purchaseId
    );
    
    return relevantReturns.reduce((total, returnItem) => {
      try {
        const returnItems = typeof returnItem.items === 'string' 
          ? JSON.parse(returnItem.items) 
          : (returnItem.items || []);
        
        if (!Array.isArray(returnItems)) return total;
        
        const returnTotal = returnItems.reduce((sum: number, item: any) => {
          const quantity = Number(item.quantity || 0);
          const price = Number(item.unitPrice || item.price || 0);
          return sum + (quantity * price);
        }, 0);
        
        return total + returnTotal;
      } catch (error) {
        return total;
      }
    }, 0);
  };

  // Filter transactions by supplier and date
  const transactions = useMemo(() => {
    if (!selectedSupplierId) return [];

    // المشتريات الآجلة المرحلة فقط (دائن - ديون علينا)
    const supplierPurchases = purchases
      .filter((purchase: any) => 
        purchase.supplierId === selectedSupplierId && 
        purchase.paymentMethod === 'آجل' &&
        purchase.sentToSupplierAccount === true
      )
      .map((purchase: any) => {
        const originalTotal = parseFloat(purchase.total || 0);
        const returnedAmount = getReturnedAmount(purchase.id);
        const effectiveTotal = originalTotal - returnedAmount;
        
        return {
          id: `purchase-${purchase.id}`,
          date: purchase.date || purchase.createdAt,
          type: 'purchase',
          description: `فاتورة مشتريات آجلة رقم ${purchase.invoiceNumber || purchase.id}${returnedAmount > 0 ? ` (بعد خصم مرتجع ${returnedAmount.toFixed(2)} ر.س)` : ''}`,
          debit: 0,
          credit: effectiveTotal,
          reference: purchase.invoiceNumber
        };
      });

    // سندات الصرف (مدين - تخفيض الديون)
    const supplierPayments = paymentVouchers
      .filter((payment: any) => payment.supplierId === selectedSupplierId || payment.supplier_id === selectedSupplierId)
      .map((payment: any) => ({
        id: `payment-${payment.id}`,
        date: payment.paymentDate || payment.payment_date || payment.date || payment.createdAt || payment.created_at,
        type: 'payment',
        description: `سند صرف رقم ${payment.voucherNumber || payment.voucher_number || payment.id}`,
        debit: parseFloat(payment.amount || 0),
        credit: 0,
        reference: payment.voucherNumber || payment.voucher_number
      }));

    let allTransactions = [...supplierPurchases, ...supplierPayments];

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      allTransactions = allTransactions.filter((t: any) => new Date(t.date) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      allTransactions = allTransactions.filter((t: any) => new Date(t.date) <= toDate);
    }

    // Sort by date
    allTransactions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance (للموردين: الرصيد = الافتتاحي + دائن - مدين)
    let balance = parseFloat(selectedSupplier?.openingBalance || '0');
    return allTransactions.map((t: any) => {
      balance += t.credit - t.debit;
      return { ...t, balance };
    });
  }, [selectedSupplierId, purchases, paymentVouchers, purchaseReturns, dateFrom, dateTo, selectedSupplier]);

  // Calculate totals
  const totalCredit = transactions.reduce((sum: number, t: any) => sum + t.credit, 0);
  const totalDebit = transactions.reduce((sum: number, t: any) => sum + t.debit, 0);
  const openingBalance = parseFloat(selectedSupplier?.openingBalance || '0');
  const finalBalance = openingBalance + totalCredit - totalDebit;

  const formatNumber = (num: number | string) => {
    if (!num) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return Math.round(number).toString();
  };

  const handlePrint = () => {
    if (!selectedSupplier) return;

    const printWindow = window.open('', '_blank');
    const branchName = branch?.name || '';
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${selectedSupplier.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            padding: 20px;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header h2 {
            font-size: 20px;
            font-weight: normal;
            color: #333;
          }
          .supplier-info {
            background: #f5f5f5;
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .info-row:last-child { border-bottom: none; }
          .info-label {
            font-weight: bold;
            min-width: 120px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 10px;
            text-align: center;
          }
          th {
            background: #000;
            color: #fff;
            font-weight: bold;
            font-size: 14px;
          }
          td {
            font-size: 13px;
          }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .summary {
            border: 3px solid #000;
            padding: 20px;
            margin-top: 20px;
            background: #f9f9f9;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            font-size: 16px;
          }
          .summary-row:last-child {
            border-bottom: none;
            border-top: 2px solid #000;
            padding-top: 15px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${branchName ? `<h1>${branchName}</h1>` : ''}
          <h2>كشف حساب مورد</h2>
        </div>

        <div class="supplier-info">
          <div class="info-row">
            <div><span class="info-label">اسم المورد:</span> ${selectedSupplier.name}</div>
            <div><span class="info-label">رقم الهاتف:</span> ${selectedSupplier.phone || '-'}</div>
          </div>
          <div class="info-row">
            <div><span class="info-label">البريد الإلكتروني:</span> ${selectedSupplier.email || '-'}</div>
            <div><span class="info-label">العنوان:</span> ${selectedSupplier.address || '-'}</div>
          </div>
          <div class="info-row">
            <div><span class="info-label">تاريخ الكشف:</span> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><span class="info-label">الفترة:</span> ${dateFrom && dateTo ? `من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}` : 'كامل الحساب'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%">التاريخ</th>
              <th style="width: 15%">المرجع</th>
              <th style="width: 30%" class="text-right">البيان</th>
              <th style="width: 13%">مدين</th>
              <th style="width: 13%">دائن</th>
              <th style="width: 14%">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            ${openingBalance !== 0 ? `
            <tr style="background: #f0f0f0; font-weight: bold;">
              <td colspan="3" class="text-right">الرصيد الافتتاحي</td>
              <td>${openingBalance < 0 ? formatNumber(Math.abs(openingBalance)) : '-'}</td>
              <td>${openingBalance > 0 ? formatNumber(openingBalance) : '-'}</td>
              <td>${formatNumber(openingBalance)}</td>
            </tr>
            ` : ''}
            ${transactions.map((t: any) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('en-GB')}</td>
                <td>${t.reference || '-'}</td>
                <td class="text-right">${t.description}</td>
                <td>${t.debit > 0 ? formatNumber(t.debit) : '-'}</td>
                <td>${t.credit > 0 ? formatNumber(t.credit) : '-'}</td>
                <td>${formatNumber(t.balance)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>الرصيد الافتتاحي:</span>
            <strong>${formatNumber(openingBalance)} ريال</strong>
          </div>
          <div class="summary-row">
            <span>إجمالي المشتريات الآجلة (دائن):</span>
            <strong>${formatNumber(totalCredit)} ريال</strong>
          </div>
          <div class="summary-row">
            <span>إجمالي المدفوعات (مدين):</span>
            <strong>${formatNumber(totalDebit)} ريال</strong>
          </div>
          <div class="summary-row">
            <span>الرصيد النهائي:</span>
            <strong style="font-size: 20px;">${formatNumber(finalBalance)} ريال</strong>
          </div>
        </div>

        <div class="footer">
          <p>تم الطباعة بتاريخ: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">كشف حساب الموردين</h1>
            <p className="text-gray-600">عرض احترافي لحركات حسابات الموردين</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5" />
            تصفية الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">اختر المورد</Label>
              <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-11",
                      !selectedSupplierId && "text-muted-foreground"
                    )}
                  >
                    {selectedSupplierId
                      ? suppliers.find((s: any) => s.id === selectedSupplierId)?.name || "اختر مورد"
                      : "اختر مورد"}
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن مورد..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier: any) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                              setSelectedSupplierId(supplier.id);
                              setSupplierSearchOpen(false);
                            }}
                          >
                            {supplier.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-11"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Info & Statement */}
      {selectedSupplier && (
        <>
          {/* Supplier Info Card */}
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <Truck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSupplier.name}</h2>
                    <p className="text-orange-100">رمز المورد: {selectedSupplier.code || selectedSupplier.id}</p>
                  </div>
                </div>
                <Button 
                  onClick={handlePrint}
                  className="bg-white text-orange-600 hover:bg-orange-50"
                >
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة الكشف
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">الهاتف</p>
                    <p className="font-semibold">{selectedSupplier.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                    <p className="font-semibold text-sm">{selectedSupplier.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">الرصيد الافتتاحي</p>
                    <p className="font-semibold">{formatNumber(selectedSupplier.openingBalance || 0)} ريال</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-md border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الرصيد الافتتاحي</p>
                    <p className="text-xl font-bold text-gray-800">{formatNumber(openingBalance)}</p>
                    <p className="text-xs text-gray-500">ريال</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">إجمالي المشتريات الآجلة</p>
                    <p className="text-xl font-bold text-red-600">{formatNumber(totalCredit)}</p>
                    <p className="text-xs text-gray-500">ريال (دائن)</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Receipt className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">إجمالي المدفوعات</p>
                    <p className="text-xl font-bold text-green-600">{formatNumber(totalDebit)}</p>
                    <p className="text-xs text-gray-500">ريال (مدين)</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-semibold">الرصيد النهائي</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(finalBalance)}</p>
                    <p className="text-xs text-gray-600">ريال</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                حركات الحساب
                <Badge variant="outline" className="mr-auto">
                  {transactions.length} حركة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد حركات في الفترة المحددة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="p-3 text-right">التاريخ</th>
                        <th className="p-3 text-right">المرجع</th>
                        <th className="p-3 text-right">البيان</th>
                        <th className="p-3 text-center">مدين</th>
                        <th className="p-3 text-center">دائن</th>
                        <th className="p-3 text-center">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openingBalance !== 0 && (
                        <tr className="bg-gray-100 border-b-2 border-gray-300 font-semibold">
                          <td colSpan={3} className="p-3 text-right">الرصيد الافتتاحي</td>
                          <td className="p-3 text-center">{openingBalance < 0 ? formatNumber(Math.abs(openingBalance)) : '-'}</td>
                          <td className="p-3 text-center">{openingBalance > 0 ? formatNumber(openingBalance) : '-'}</td>
                          <td className="p-3 text-center font-bold">{formatNumber(openingBalance)}</td>
                        </tr>
                      )}
                      {transactions.map((t: any, index: number) => (
                        <tr 
                          key={t.id} 
                          className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                        >
                          <td className="p-3">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {t.reference || '-'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2">
                              {t.type === 'purchase' ? (
                                <Receipt className="h-4 w-4 text-red-500" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-500" />
                              )}
                              {t.description}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {t.debit > 0 ? (
                              <span className="font-semibold text-green-600">{formatNumber(t.debit)}</span>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {t.credit > 0 ? (
                              <span className="font-semibold text-red-600">{formatNumber(t.credit)}</span>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn(
                              "font-bold",
                              t.balance > 0 ? "text-red-600" : t.balance < 0 ? "text-green-600" : "text-gray-600"
                            )}>
                              {formatNumber(t.balance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!selectedSupplier && (
        <Card className="shadow-lg border-0">
          <CardContent className="py-20">
            <div className="text-center">
              <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Truck className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">اختر مورد لعرض كشف الحساب</h3>
              <p className="text-gray-500">قم باختيار المورد من القائمة أعلاه</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
