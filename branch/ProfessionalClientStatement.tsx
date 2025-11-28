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
  Filter
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProfessionalClientStatementProps {
  branchId?: number;
}

export default function ProfessionalClientStatement({ branchId }: ProfessionalClientStatementProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/clients${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // Fetch sales
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/sales${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // Fetch receipt vouchers
  const { data: receiptVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/client-receipt-vouchers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/client-receipt-vouchers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // Get selected client
  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find((c: any) => c.id === selectedClientId);
  }, [selectedClientId, clients]);

  // Filter transactions by client and date
  const transactions = useMemo(() => {
    if (!selectedClientId) return [];

    const clientSales = sales
      .filter((sale: any) => 
        sale.clientId === selectedClientId && 
        sale.sentToClientAccount === true
      )
      .map((sale: any) => ({
        id: `sale-${sale.id}`,
        date: sale.date || sale.createdAt,
        type: 'sale',
        description: `فاتورة مبيعات رقم ${sale.invoiceNumber || sale.id}`,
        debit: parseFloat(sale.total || 0),
        credit: 0,
        reference: sale.invoiceNumber
      }));

    const clientReceipts = receiptVouchers
      .filter((receipt: any) => {
        const receiptClientId = receipt.clientId || receipt.client_id;
        return receiptClientId === selectedClientId;
      })
      .map((receipt: any) => ({
        id: `receipt-${receipt.id}`,
        date: receipt.receiptDate || receipt.receipt_date || receipt.date || receipt.createdAt || receipt.created_at,
        type: 'receipt',
        description: `سند قبض رقم ${receipt.voucherNumber || receipt.voucher_number || receipt.id}`,
        debit: 0,
        credit: parseFloat(receipt.amount || 0),
        reference: receipt.voucherNumber || receipt.voucher_number
      }));

    let allTransactions = [...clientSales, ...clientReceipts];

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

    // Calculate running balance
    let balance = parseFloat(selectedClient?.openingBalance || '0');
    return allTransactions.map((t: any) => {
      balance += t.debit - t.credit;
      return { ...t, balance };
    });
  }, [selectedClientId, sales, receiptVouchers, dateFrom, dateTo, selectedClient]);

  // Calculate totals
  const totalDebit = transactions.reduce((sum: number, t: any) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum: number, t: any) => sum + t.credit, 0);
  const openingBalance = parseFloat(selectedClient?.openingBalance || '0');
  const finalBalance = openingBalance + totalDebit - totalCredit;

  const formatNumber = (num: number | string) => {
    if (!num) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return Math.round(number).toString();
  };

  const handlePrint = () => {
    if (!selectedClient) return;

    const printWindow = window.open('', '_blank');
    const branchName = branch?.name || '';
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${selectedClient.name}</title>
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
          .client-info {
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
          <h2>كشف حساب عميل</h2>
        </div>

        <div class="client-info">
          <div class="info-row">
            <div><span class="info-label">اسم العميل:</span> ${selectedClient.name}</div>
            <div><span class="info-label">رقم الهاتف:</span> ${selectedClient.phone || '-'}</div>
          </div>
          <div class="info-row">
            <div><span class="info-label">البريد الإلكتروني:</span> ${selectedClient.email || '-'}</div>
            <div><span class="info-label">العنوان:</span> ${selectedClient.address || '-'}</div>
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
              <td>${openingBalance > 0 ? formatNumber(openingBalance) : '-'}</td>
              <td>${openingBalance < 0 ? formatNumber(Math.abs(openingBalance)) : '-'}</td>
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
            <span>إجمالي المبيعات (مدين):</span>
            <strong>${formatNumber(totalDebit)} ريال</strong>
          </div>
          <div class="summary-row">
            <span>إجمالي المدفوعات (دائن):</span>
            <strong>${formatNumber(totalCredit)} ريال</strong>
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
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">كشف حساب العملاء</h1>
            <p className="text-gray-600">عرض احترافي لحركات حسابات العملاء</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5" />
            تصفية الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">اختر العميل</Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-11",
                      !selectedClientId && "text-muted-foreground"
                    )}
                  >
                    {selectedClientId
                      ? clients.find((c: any) => c.id === selectedClientId)?.name || "اختر عميل"
                      : "اختر عميل"}
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن عميل..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client: any) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setSelectedClientId(client.id);
                              setClientSearchOpen(false);
                            }}
                          >
                            {client.name}
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

      {/* Client Info & Statement */}
      {selectedClient && (
        <>
          {/* Client Info Card */}
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                    <p className="text-blue-100">رمز العميل: {selectedClient.code || selectedClient.id}</p>
                  </div>
                </div>
                <Button 
                  onClick={handlePrint}
                  className="bg-white text-blue-600 hover:bg-blue-50"
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
                    <p className="font-semibold">{selectedClient.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                    <p className="font-semibold text-sm">{selectedClient.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">الرصيد الافتتاحي</p>
                    <p className="font-semibold">{formatNumber(selectedClient.openingBalance || 0)} ريال</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-md border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الرصيد الافتتاحي</p>
                    <p className="text-xl font-bold text-gray-800">{formatNumber(openingBalance)}</p>
                    <p className="text-xs text-gray-500">ريال</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">إجمالي المبيعات</p>
                    <p className="text-xl font-bold text-red-600">{formatNumber(totalDebit)}</p>
                    <p className="text-xs text-gray-500">ريال (مدين)</p>
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
                    <p className="text-xl font-bold text-green-600">{formatNumber(totalCredit)}</p>
                    <p className="text-xs text-gray-500">ريال (دائن)</p>
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
                          <td className="p-3 text-center">{openingBalance > 0 ? formatNumber(openingBalance) : '-'}</td>
                          <td className="p-3 text-center">{openingBalance < 0 ? formatNumber(Math.abs(openingBalance)) : '-'}</td>
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
                              {t.type === 'sale' ? (
                                <Receipt className="h-4 w-4 text-red-500" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-500" />
                              )}
                              {t.description}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {t.debit > 0 ? (
                              <span className="font-semibold text-red-600">{formatNumber(t.debit)}</span>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {t.credit > 0 ? (
                              <span className="font-semibold text-green-600">{formatNumber(t.credit)}</span>
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
      {!selectedClient && (
        <Card className="shadow-lg border-0">
          <CardContent className="py-20">
            <div className="text-center">
              <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">اختر عميل لعرض كشف الحساب</h3>
              <p className="text-gray-500">قم باختيار العميل من القائمة أعلاه</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
