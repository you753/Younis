import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingDown, TrendingUp, AlertCircle, Search, Printer } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchClientAccountsProps {
  branchId?: number;
}

export default function BranchClientAccounts({ branchId }: BranchClientAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات العملاء - فقط عملاء هذا الفرع
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/clients${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب سندات القبض - فقط سندات هذا الفرع
  const { data: receiptVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/client-receipt-vouchers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/client-receipt-vouchers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب فواتير المبيعات - فقط مبيعات هذا الفرع
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/sales${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب حسابات العملاء مع المعاملات
  const clientAccounts = clients.map((client: any) => {
    const clientSales = sales.filter((s: any) => 
      (s.clientId === client.id || s.client_id === client.id)
    );
    const clientReceipts = receiptVouchers.filter((v: any) => 
      (v.clientId === client.id || v.client_id === client.id)
    );

    const totalSales = clientSales.reduce((sum: number, s: any) => 
      sum + Number(s.total || 0), 0
    );
    const totalReceipts = clientReceipts.reduce((sum: number, v: any) => 
      sum + Number(v.amount || 0), 0
    );

    const openingBalance = Number(client.openingBalance || client.balance || 0);
    const currentBalance = openingBalance + totalSales - totalReceipts;

    // الحصول على تاريخ آخر معاملة
    const allTransactions = [
      ...clientSales.map((s: any) => ({ date: s.date || s.createdAt })),
      ...clientReceipts.map((v: any) => ({ date: v.receiptDate || v.createdAt }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastTransaction = allTransactions.length > 0 
      ? allTransactions[0].date 
      : client.createdAt;

    return {
      id: client.id,
      name: client.name,
      code: client.code || `CLI${client.id}`,
      openingBalance,
      debit: totalSales,
      credit: totalReceipts,
      currentBalance,
      lastTransaction,
      transactionCount: clientSales.length + clientReceipts.length,
      phone: client.phone || '-',
      status: currentBalance > 0 ? 'مدين' : currentBalance < 0 ? 'دائن' : 'متوازن',
      sales: clientSales,
      receipts: clientReceipts,
      createdAt: client.createdAt
    };
  });

  const filteredAccounts = clientAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredAccounts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm]
  });

  // دالة طباعة كشف الحساب
  const handlePrintStatement = (account: any) => {
    if (!account) return;
    
    // دمج جميع المعاملات
    const allTransactions: any[] = [];
    let runningBalance = account.openingBalance;
    
    // إضافة الرصيد الافتتاحي
    const openingDate = account.createdAt 
      ? new Date(account.createdAt).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');
    
    allTransactions.push({
      date: openingDate,
      type: 'رصيد افتتاحي',
      reference: '-',
      description: 'الرصيد الافتتاحي للعميل',
      debit: '-',
      credit: '-',
      balance: runningBalance
    });
    
    // دمج المبيعات والسندات وترتيبها حسب التاريخ
    const combinedTransactions = [
      ...(account.sales || []).map((s: any) => ({
        date: s.date || s.createdAt,
        type: 'فاتورة مبيعات',
        reference: s.invoiceNumber || `SAL-${s.id}`,
        description: s.notes || 'فاتورة مبيعات',
        debit: Number(s.total || 0),
        credit: 0,
        original: s
      })),
      ...(account.receipts || []).map((v: any) => ({
        date: v.receiptDate || v.createdAt,
        type: 'سند قبض',
        reference: v.voucherNumber || `REC-${v.id}`,
        description: v.description || 'دفعة على الحساب',
        debit: 0,
        credit: Number(v.amount || 0),
        original: v
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // إضافة المعاملات المرتبة مع الرصيد المتحرك
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
            <title>كشف حساب العميل - ${account.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
              .header h1 { margin: 0; font-size: 28px; color: #1a1a1a; }
              .header .branch-name { font-size: 22px; color: #495057; margin-bottom: 10px; }
              .info-section { margin-bottom: 20px; }
              .client-info { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
              .client-info h3 { margin-top: 0; color: #495057; font-size: 18px; }
              .info-row { margin: 8px 0; }
              .info-label { font-weight: bold; color: #495057; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
              .summary-item { text-align: center; padding: 15px; border: 2px solid #dee2e6; border-radius: 8px; background-color: #fff; }
              .summary-item .label { font-size: 12px; color: #6c757d; margin-bottom: 8px; }
              .summary-item .value { font-size: 20px; font-weight: bold; color: #212529; }
              .summary-item.opening { border-color: #0dcaf0; }
              .summary-item.debit { border-color: #dc3545; }
              .summary-item.credit { border-color: #198754; }
              .summary-item.balance { border-color: #6f42c1; }
              .transactions-section h3 { color: #495057; margin-bottom: 15px; font-size: 20px; }
              .transactions { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .transactions thead { background-color: #343a40; color: white; }
              .transactions th { padding: 12px 8px; text-align: right; font-weight: 600; border: 1px solid #495057; }
              .transactions td { padding: 10px 8px; text-align: right; border: 1px solid #dee2e6; }
              .transactions tbody tr:nth-child(even) { background-color: #f8f9fa; }
              .transactions tbody tr:hover { background-color: #e9ecef; }
              .transactions .opening-row { background-color: #e7f3ff; font-weight: bold; }
              .transactions .debit-cell { color: #dc3545; font-weight: 600; }
              .transactions .credit-cell { color: #198754; font-weight: 600; }
              .transactions .balance-cell { font-weight: bold; color: #212529; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6; text-align: center; font-size: 13px; color: #6c757d; }
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
              <h1>كشف حساب عميل</h1>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">تاريخ الإصدار:</span> ${new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
            
            <div class="client-info">
              <h3>معلومات العميل</h3>
              <div class="info-row">
                <span class="info-label">الاسم:</span> ${account.name}
              </div>
              <div class="info-row">
                <span class="info-label">الكود:</span> ${account.code}
              </div>
              <div class="info-row">
                <span class="info-label">الهاتف:</span> ${account.phone}
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
            
            <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              <div style="color: #fff; font-size: 16px; margin-bottom: 10px; font-weight: 500;">الرصيد الباقي عليه</div>
              <div style="color: #fff; font-size: 36px; font-weight: bold;">${runningBalance.toLocaleString('en-US')} ريال</div>
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

  const totalDebit = clientAccounts.reduce((sum, account) => sum + Math.max(0, account.currentBalance), 0);
  const totalCredit = Math.abs(clientAccounts.reduce((sum, account) => sum + Math.min(0, account.currentBalance), 0));
  const netBalance = totalDebit - totalCredit;

  const getStatusBadge = (status: string, balance: number) => {
    if (balance > 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">مدين</Badge>;
    } else if (balance < 0) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">دائن</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">متوازن</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* بطاقات الملخص */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalDebit.toLocaleString('en-US')} ريال</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCredit.toLocaleString('en-US')} ريال</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الرصيد</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{netBalance.toLocaleString('en-US')} ريال</div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الحسابات */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">كشف حساب العملاء</CardTitle>
              <p className="text-sm text-gray-500 mt-1">عرض وإدارة حسابات العملاء</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالاسم أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الكود</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الرصيد الافتتاحي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">مدين</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">دائن</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الرصيد الحالي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">آخر معاملة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{account.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.code}</td>
                    <td className="px-4 py-3 text-sm">{account.openingBalance.toLocaleString('en-US')} ريال</td>
                    <td className="px-4 py-3 text-sm text-red-600">{account.debit.toLocaleString('en-US')} ريال</td>
                    <td className="px-4 py-3 text-sm text-green-600">{account.credit.toLocaleString('en-US')} ريال</td>
                    <td className="px-4 py-3 text-sm font-bold">{account.currentBalance.toLocaleString('en-US')} ريال</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {account.lastTransaction ? new Date(account.lastTransaction).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(account.status, account.currentBalance)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintStatement(account)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>لا توجد حسابات عملاء</p>
              </div>
            )}
          </div>

          <PaginationControls
            currentPage={currentPage}
            pageCount={pageCount}
            totalItems={filteredAccounts.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            itemName="حساب عميل"
          />
        </CardContent>
      </Card>
    </div>
  );
}
