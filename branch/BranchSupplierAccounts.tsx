import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreditCard, TrendingDown, TrendingUp, AlertCircle, Search, FileText, Download, Eye, Calendar, Printer, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchSupplierAccountsProps {
  branchId?: number;
}

export default function BranchSupplierAccounts({ branchId }: BranchSupplierAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

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
    enabled: !!branchId
  });

  // Fetch payment vouchers
  const { data: paymentVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/supplier-payment-vouchers'],
    queryFn: async () => {
      const response = await fetch('/api/supplier-payment-vouchers');
      return response.json();
    }
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
    queryFn: async () => {
      const response = await fetch('/api/purchases');
      return response.json();
    }
  });

  // Calculate supplier accounts with transactions
  const supplierAccounts = suppliers.map((supplier: any) => {
    const supplierPurchases = purchases.filter((p: any) => 
      (p.supplierId === supplier.id || p.supplier_id === supplier.id)
    );
    const supplierPayments = paymentVouchers.filter((v: any) => 
      (v.supplierId === supplier.id || v.supplier_id === supplier.id)
    );

    const totalPurchases = supplierPurchases.reduce((sum: number, p: any) => 
      sum + Number(p.total || 0), 0
    );
    const totalPayments = supplierPayments.reduce((sum: number, v: any) => 
      sum + Number(v.amount || 0), 0
    );

    const openingBalance = Number(supplier.openingBalance || supplier.balance || 0);
    const currentBalance = openingBalance + totalPurchases - totalPayments;

    // Get last transaction date
    const allTransactions = [
      ...supplierPurchases.map((p: any) => ({ date: p.date || p.createdAt })),
      ...supplierPayments.map((v: any) => ({ date: v.paymentDate || v.createdAt }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastTransaction = allTransactions.length > 0 
      ? allTransactions[0].date 
      : supplier.createdAt;

    return {
      id: supplier.id,
      name: supplier.name,
      code: supplier.code || `SUP${supplier.id}`,
      openingBalance,
      debit: totalPurchases,
      credit: totalPayments,
      currentBalance,
      lastTransaction,
      transactionCount: supplierPurchases.length + supplierPayments.length,
      category: supplier.category || 'عامة',
      paymentTerms: supplier.paymentTerms || '30 يوم',
      status: currentBalance > 0 ? 'مدين' : currentBalance < 0 ? 'دائن' : 'متوازن',
      purchases: supplierPurchases,
      payments: supplierPayments
    };
  });


  const filteredAccounts = supplierAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedAccounts,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredAccounts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm]
  });

  // دالة فتح كشف الحساب
  const handleAccountStatement = (account: any) => {
    setSelectedAccount(account);
    setShowStatementDialog(true);
  };

  // دالة عرض كشف الحساب
  const handleViewStatement = (account: any) => {
    setSelectedAccount(account);
    setShowStatementDialog(true);
  };

  // دالة التعديل
  const handleEdit = (account: any) => {
    const supplier = suppliers.find(s => s.id === account.id);
    setSelectedSupplier(supplier);
    setShowEditDialog(true);
  };

  // دالة الحذف
  const handleDelete = (account: any) => {
    const supplier = suppliers.find(s => s.id === account.id);
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    if (!selectedSupplier) return;
    
    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('تم حذف المورد بنجاح');
        setShowDeleteDialog(false);
        setSelectedSupplier(null);
        window.location.reload();
      } else {
        alert('فشل حذف المورد');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('حدث خطأ أثناء حذف المورد');
    }
  };

  // دالة طباعة كشف الحساب
  const handlePrintStatement = (account: any) => {
    if (!account) return;
    
    // Combine all transactions
    const allTransactions: any[] = [];
    let runningBalance = account.openingBalance;
    
    // Add opening balance
    const openingDate = account.createdAt 
      ? new Date(account.createdAt).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');
    
    allTransactions.push({
      date: openingDate,
      type: 'رصيد افتتاحي',
      reference: '-',
      description: 'الرصيد الافتتاحي للمورد',
      debit: '-',
      credit: '-',
      balance: runningBalance
    });
    
    // Combine purchases and payments, sort by date
    let combinedTransactions = [
      ...(account.purchases || []).map((p: any) => ({
        date: p.date || p.createdAt,
        type: 'فاتورة شراء',
        reference: p.invoiceNumber || `PUR-${p.id}`,
        description: p.notes || 'فاتورة شراء',
        debit: Number(p.total || 0),
        credit: 0,
        original: p
      })),
      ...(account.payments || []).map((v: any) => ({
        date: v.paymentDate || v.createdAt,
        type: 'سند دفع',
        reference: v.voucherNumber || `PAY-${v.id}`,
        description: v.notes || 'دفعة على الحساب',
        debit: 0,
        credit: Number(v.amount || 0),
        original: v
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // فلترة حسب التاريخ إذا كان محدداً
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      combinedTransactions = combinedTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= from && transactionDate <= to;
      });
    }
    
    // Add sorted transactions with running balance
    combinedTransactions.forEach(t => {
      runningBalance += t.debit - t.credit;
      allTransactions.push({
        date: new Date(t.date).toLocaleDateString('en-GB'),
        type: t.type,
        reference: t.reference,
        description: t.description,
        debit: t.debit > 0 ? t.debit.toLocaleString('en-US') : '-',
        credit: t.credit > 0 ? t.credit.toLocaleString('en-US') : '-',
        balance: runningBalance
      });
    });
    
    const printWindow = window.open('', '', 'height=800,width=1000');
    const branchName = branch?.name || (branchId ? `الفرع ${branchId}` : '');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>كشف حساب المورد - ${account.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 3px solid black; padding-bottom: 15px; margin-bottom: 25px; }
              .header h1 { margin: 0; font-size: 28px; color: black; }
              .header .branch-name { font-size: 22px; color: black; margin-bottom: 10px; }
              .info-section { margin-bottom: 20px; }
              .supplier-info { background-color: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; border: 2px solid black; }
              .supplier-info h3 { margin-top: 0; color: black; font-size: 18px; }
              .info-row { margin: 8px 0; }
              .info-label { font-weight: bold; color: black; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
              .summary-item { text-align: center; padding: 15px; border: 2px solid black; border-radius: 8px; background-color: white; }
              .summary-item .label { font-size: 12px; color: black; margin-bottom: 8px; }
              .summary-item .value { font-size: 20px; font-weight: bold; color: black; }
              .summary-item.opening { border-color: black; }
              .summary-item.debit { border-color: black; }
              .summary-item.credit { border-color: black; }
              .summary-item.balance { border-color: black; }
              .transactions-section h3 { color: black; margin-bottom: 15px; font-size: 20px; }
              .transactions { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .transactions thead { background-color: white; color: black; }
              .transactions th { padding: 12px 8px; text-align: right; font-weight: 600; border: 1px solid black; }
              .transactions td { padding: 10px 8px; text-align: right; border: 1px solid black; }
              .transactions tbody tr:nth-child(even) { background-color: white; }
              .transactions tbody tr:hover { background-color: white; }
              .transactions .opening-row { background-color: white; font-weight: bold; }
              .transactions .debit-cell { color: black; font-weight: 600; }
              .transactions .credit-cell { color: black; font-weight: 600; }
              .transactions .balance-cell { font-weight: bold; color: black; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid black; text-align: center; font-size: 13px; color: black; }
              @media print {
                body { margin: 10px; }
                .summary { page-break-inside: avoid; }
                .transactions { page-break-inside: auto; }
                .transactions tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${branchName ? `<div class="branch-name">${branchName}</div>` : ''}
              <h1>كشف حساب مورد</h1>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">تاريخ الإصدار:</span> ${new Date().toLocaleDateString('en-GB')}
              </div>
              ${fromDate && toDate ? `
              <div class="info-row" style="background: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 5px;">
                <span class="info-label">📅 الفترة المحددة:</span> من ${new Date(fromDate).toLocaleDateString('en-GB')} إلى ${new Date(toDate).toLocaleDateString('en-GB')}
              </div>
              ` : ''}
            </div>
            
            <div class="supplier-info">
              <h3>معلومات المورد</h3>
              <div class="info-row">
                <span class="info-label">الاسم:</span> ${account.name}
              </div>
              <div class="info-row">
                <span class="info-label">الكود:</span> ${account.code}
              </div>
              <div class="info-row">
                <span class="info-label">الفئة:</span> ${account.category}
              </div>
            </div>
            
            <div class="summary">
              <div class="summary-item opening">
                <div class="label">الرصيد الافتتاحي</div>
                <div class="value">${account.openingBalance.toLocaleString('en-US')} ريال</div>
              </div>
              <div class="summary-item debit">
                <div class="label">إجمالي المدين</div>
                <div class="value">${account.debit.toLocaleString('en-US')} ريال</div>
              </div>
              <div class="summary-item credit">
                <div class="label">إجمالي الدائن</div>
                <div class="value">${account.credit.toLocaleString('en-US')} ريال</div>
              </div>
              <div class="summary-item balance">
                <div class="label">الرصيد الحالي</div>
                <div class="value">${account.currentBalance.toLocaleString('en-US')} ريال</div>
              </div>
            </div>
            
            <div class="transactions-section">
              <h3>تفاصيل المعاملات</h3>
              <table class="transactions">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>نوع المعاملة</th>
                    <th>رقم المستند</th>
                    <th>البيان</th>
                    <th>مدين</th>
                    <th>دائن</th>
                    <th>الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  ${allTransactions.map(t => `
                    <tr class="${t.type === 'رصيد افتتاحي' ? 'opening-row' : ''}">
                      <td>${t.date}</td>
                      <td>${t.type}</td>
                      <td>${t.reference}</td>
                      <td>${t.description}</td>
                      <td class="debit-cell">${t.debit}</td>
                      <td class="credit-cell">${t.credit}</td>
                      <td class="balance-cell">${t.balance.toLocaleString('en-US')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div style="margin: 30px 0; padding: 25px; background: white; border: 3px solid black; border-radius: 12px; text-align: center;">
              <div style="color: black; font-size: 16px; margin-bottom: 10px; font-weight: 500;">الرصيد الباقي له</div>
              <div style="color: black; font-size: 36px; font-weight: bold;">${runningBalance.toLocaleString('en-US')} ريال</div>
            </div>
            
            <div class="footer">
              <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleString('en-US')}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalDebit = supplierAccounts.reduce((sum, account) => sum + Math.max(0, account.currentBalance), 0);
  const totalCredit = Math.abs(supplierAccounts.reduce((sum, account) => sum + Math.min(0, account.currentBalance), 0));
  const overdueAccounts = supplierAccounts.filter(account => {
    const lastTransactionDate = new Date(account.lastTransaction);
    const daysDiff = (new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24);
    const paymentDays = parseInt(account.paymentTerms);
    return daysDiff > paymentDays && account.currentBalance > 0;
  }).length;
  const netBalance = totalDebit - totalCredit;

  const getStatusBadge = (status: string, balance: number) => {
    if (balance > 0) {
      return <Badge className="bg-gray-100 text-black hover:bg-gray-100 border-gray-300">مدين</Badge>;
    } else if (balance < 0) {
      return <Badge className="bg-gray-100 text-black hover:bg-gray-100 border-gray-300">دائن</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">متوازن</Badge>;
    }
  };

  const getOverdueStatus = (account: any) => {
    const lastTransactionDate = new Date(account.lastTransaction);
    const daysDiff = (new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24);
    const paymentDays = parseInt(account.paymentTerms);
    
    if (daysDiff > paymentDays && account.currentBalance > 0) {
      return <Badge className="bg-gray-200 text-black hover:bg-gray-200 border-gray-400">متأخر</Badge>;
    } else if (daysDiff > (paymentDays * 0.8) && account.currentBalance > 0) {
      return <Badge className="bg-gray-100 text-black hover:bg-gray-100 border-gray-300">تحذير</Badge>;
    } else {
      return <Badge className="bg-white text-black hover:bg-white border-gray-300">عادي</Badge>;
    }
  };

  // دالة تصدير البيانات لملف CSV
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "كود المورد,اسم المورد,الرصيد الافتتاحي,المدين,الدائن,الرصيد الحالي,آخر معاملة,عدد المعاملات,الفئة,شروط الدفع,الحالة\n" +
      supplierAccounts.map(account => 
        `${account.code},${account.name},${account.openingBalance},${account.debit},${account.credit},${account.currentBalance},${account.lastTransaction},${account.transactionCount},${account.category},${account.paymentTerms},${account.status}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `حسابات-الموردين-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('تم تصدير البيانات بنجاح');
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gray-100 p-3 rounded-full">
          <CreditCard className="h-6 w-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-600">إدارة موردي الفرع - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المدينة</p>
                <p className="text-2xl font-bold text-black">{totalDebit.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-gray-600">مستحق للموردين</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الدائنة</p>
                <p className="text-2xl font-bold text-black">{totalCredit.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-gray-600">مدفوع مقدماً</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">حسابات متأخرة</p>
                <p className="text-2xl font-bold text-black">{overdueAccounts}</p>
                <p className="text-xs text-gray-600">تحتاج متابعة</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الرصيد الصافي</p>
                <p className="text-2xl font-bold text-black">{netBalance.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-gray-600">إجمالي المطلوب</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلترة حسب التاريخ */}
      <Card className="border-2 border-gray-900">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">تصفية حسب التاريخ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">من تاريخ</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">إلى تاريخ</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            </div>
            {(fromDate || toDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="mt-3 border-red-600 text-red-600 hover:bg-red-50"
              >
                إعادة تعيين التاريخ
              </Button>
            )}
            {fromDate && toDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-600">
                <p className="text-sm font-bold text-blue-800">
                  📅 عرض الفترة من {new Date(fromDate).toLocaleDateString('en-GB')} إلى {new Date(toDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* شريط البحث والأدوات */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الموردين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current-month">الشهر الحالي</option>
            <option value="last-month">الشهر الماضي</option>
            <option value="quarter">الربع الحالي</option>
            <option value="year">السنة الحالية</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">قائمة الموردين ({supplierAccounts.length})</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredAccounts.length} من أصل {supplierAccounts.length} مورد
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">المورد</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الفئة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الافتتاحي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المدين</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الدائن</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">آخر معاملة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((account, index) => (
                  <tr key={account.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-black">{account.code}</div>
                      <div className="text-xs text-gray-500">{account.transactionCount} معاملة</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {account.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {account.openingBalance.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-black">
                        {account.debit.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-black">
                        {account.credit.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-black">
                        {Math.abs(account.currentBalance).toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{account.lastTransaction}</div>
                      <div className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline ml-1" />
                        {account.paymentTerms}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {getStatusBadge(account.status, account.currentBalance)}
                        {getOverdueStatus(account)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleViewStatement(account)}
                          title="عرض كشف الحساب"
                          data-testid={`button-view-${account.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleEdit(account)}
                          title="تعديل المورد"
                          data-testid={`button-edit-${account.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(account)}
                          title="حذف المورد"
                          data-testid={`button-delete-${account.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="p-4 text-gray-900">الإجمالي</td>
                  <td className="p-4"></td>
                  <td className="p-4 text-gray-900">
                    {supplierAccounts.reduce((sum, acc) => sum + acc.openingBalance, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4 text-black">
                    {supplierAccounts.reduce((sum, acc) => sum + acc.debit, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4 text-black">
                    {supplierAccounts.reduce((sum, acc) => sum + acc.credit, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4 text-black text-lg">
                    {netBalance.toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على حسابات تطابق معايير البحث</p>
              <Button onClick={() => setSearchTerm('')}>
                مسح البحث
              </Button>
            </div>
          )}

          {pageCount > 1 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              totalItems={filteredAccounts.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              تعديل بيانات المورد
            </DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                لتعديل بيانات المورد، يرجى الانتقال إلى صفحة إدارة الموردين
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold">{selectedSupplier.name}</p>
                <p className="text-sm text-gray-600">{selectedSupplier.code}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد حذف المورد
            </DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ تحذير</p>
                <p className="text-sm text-red-700">
                  هل أنت متأكد من حذف المورد التالي؟
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold">{selectedSupplier.name}</p>
                <p className="text-sm text-gray-600">{selectedSupplier.code}</p>
              </div>
              <p className="text-sm text-gray-600">
                سيتم حذف جميع البيانات المرتبطة بهذا المورد. هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة كشف الحساب */}
      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              كشف حساب المورد
            </DialogTitle>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-4">
              {/* معلومات المورد */}
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="font-semibold text-black mb-2">معلومات المورد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">الاسم:</span> {selectedAccount.name}
                  </div>
                  <div>
                    <span className="font-medium">الكود:</span> {selectedAccount.code}
                  </div>
                  <div>
                    <span className="font-medium">الفئة:</span> {selectedAccount.category}
                  </div>
                  <div>
                    <span className="font-medium">شروط الدفع:</span> {selectedAccount.paymentTerms}
                  </div>
                </div>
              </div>

              {/* الملخص المالي */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg text-center border border-gray-300">
                  <div className="text-sm text-gray-600">الرصيد الافتتاحي</div>
                  <div className="text-lg font-bold text-black">
                    {selectedAccount.openingBalance.toLocaleString('en-US')} ريال
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center border border-gray-300">
                  <div className="text-sm text-gray-600">إجمالي المدين</div>
                  <div className="text-lg font-bold text-black">
                    {selectedAccount.debit.toLocaleString('en-US')} ريال
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center border border-gray-300">
                  <div className="text-sm text-gray-600">إجمالي الدائن</div>
                  <div className="text-lg font-bold text-black">
                    {selectedAccount.credit.toLocaleString('en-US')} ريال
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center border border-gray-300">
                  <div className="text-sm text-gray-600">الرصيد الحالي</div>
                  <div className="text-lg font-bold text-black">
                    {Math.abs(selectedAccount.currentBalance).toLocaleString('en-US')} ريال
                  </div>
                </div>
              </div>

              {/* تفاصيل المعاملات */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">تفاصيل المعاملات</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-right">التاريخ</th>
                        <th className="border border-gray-300 p-2 text-right">نوع المعاملة</th>
                        <th className="border border-gray-300 p-2 text-right">رقم المستند</th>
                        <th className="border border-gray-300 p-2 text-right">البيان</th>
                        <th className="border border-gray-300 p-2 text-center">مدين</th>
                        <th className="border border-gray-300 p-2 text-center">دائن</th>
                        <th className="border border-gray-300 p-2 text-center">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">2025-07-01</td>
                        <td className="border border-gray-300 p-2">رصيد افتتاحي</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2">الرصيد الافتتاحي للمورد</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          {selectedAccount.openingBalance.toLocaleString('en-US')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">2025-07-10</td>
                        <td className="border border-gray-300 p-2">فاتورة شراء</td>
                        <td className="border border-gray-300 p-2">PUR-001</td>
                        <td className="border border-gray-300 p-2">شراء معدات حاسوبية</td>
                        <td className="border border-gray-300 p-2 text-center text-black">15,000</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          {(selectedAccount.openingBalance + 15000).toLocaleString('en-US')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">2025-07-12</td>
                        <td className="border border-gray-300 p-2">سند صرف</td>
                        <td className="border border-gray-300 p-2">PAY-001</td>
                        <td className="border border-gray-300 p-2">دفعة على الحساب</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center text-black">8,000</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          {(selectedAccount.openingBalance + 15000 - 8000).toLocaleString('en-US')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">2025-07-15</td>
                        <td className="border border-gray-300 p-2">فاتورة شراء</td>
                        <td className="border border-gray-300 p-2">PUR-002</td>
                        <td className="border border-gray-300 p-2">شراء قطع غيار</td>
                        <td className="border border-gray-300 p-2 text-center text-black">10,000</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          {selectedAccount.currentBalance.toLocaleString('en-US')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatementDialog(false)}>
              إغلاق
            </Button>
            <Button 
              className="bg-black hover:bg-gray-800" 
              onClick={() => handlePrintStatement(selectedAccount)}
            >
              <Printer className="h-4 w-4 mr-2" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}