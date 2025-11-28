import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Receipt, DollarSign, TrendingDown, Search, Plus, Eye, FileText, Download, Calendar, User, History, AlertTriangle, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchClientAccountsProps {
  branchId?: number;
}

interface ClientAccount {
  id: number;
  client: {
    id: number;
    name: string;
    code: string;
  };
  openingBalance: number;
  currentBalance: number;
  totalSales: number;
  totalPayments: number;
  lastTransactionDate: string;
  creditLimit: number;
  status: string;
  phone: string;
  invoicesCount: number;
  paymentsCount: number;
}

export default function EnhancedBranchClientAccounts({ branchId }: BranchClientAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState('all');
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
  const [showStatementDialog, setShowStatementDialog] = useState(false);

  // جلب العملاء
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['/api/clients'],
    refetchInterval: 2000
  });

  // جلب سندات القبض
  const { data: receipts = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    refetchInterval: 2000
  });

  // جلب المبيعات
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    refetchInterval: 2000
  });

  // تحويل بيانات العملاء إلى تنسيق حسابات العملاء
  const clientAccounts: ClientAccount[] = clients.map((client: any) => {
    const clientReceipts = receipts.filter((r: any) => r.clientId === client.id);
    const clientSales = sales.filter((s: any) => s.clientId === client.id);
    
    const totalSales = clientSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
    const totalPayments = clientReceipts.reduce((sum: number, receipt: any) => sum + (receipt.amount || 0), 0);
    
    return {
      id: client.id,
      client: {
        id: client.id,
        name: client.name,
        code: client.code || `CLI${client.id}`
      },
      openingBalance: client.openingBalance || 0,
      currentBalance: client.balance || 0,
      totalSales,
      totalPayments,
      lastTransactionDate: clientSales.length > 0 ? clientSales[0].date : new Date().toISOString().split('T')[0],
      creditLimit: client.creditLimit || 0,
      status: client.balance > 0 ? 'overdue' : 'active',
      phone: client.phone || '',
      invoicesCount: clientSales.length,
      paymentsCount: clientReceipts.length
    };
  });

  const filteredAccounts = clientAccounts.filter((account) => {
    const matchesSearch = account.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone.includes(searchTerm);
    
    const matchesBalance = filterBalance === 'all' || 
                          (filterBalance === 'positive' && account.currentBalance > 0) ||
                          (filterBalance === 'negative' && account.currentBalance < 0) ||
                          (filterBalance === 'zero' && account.currentBalance === 0);
    
    return matchesSearch && matchesBalance;
  });

  // إحصائيات الحسابات
  const stats = {
    totalAccounts: clientAccounts.length,
    positiveBalance: clientAccounts.filter(a => a.currentBalance > 0).length,
    totalDebt: clientAccounts.reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0),
    totalCredit: Math.abs(clientAccounts.reduce((sum, a) => sum + Math.min(0, a.currentBalance), 0))
  };

  // كشف حساب العميل
  const generateStatement = (client: ClientAccount) => {
    const clientSales = sales.filter((s: any) => s.clientId === client.id);
    const clientReceipts = receipts.filter((r: any) => r.clientId === client.id);
    
    const transactions = [
      ...clientSales.map((sale: any) => ({
        date: sale.date,
        type: 'sale',
        description: `فاتورة مبيعات ${sale.invoiceNumber}`,
        debit: sale.total,
        credit: 0,
        balance: 0
      })),
      ...clientReceipts.map((receipt: any) => ({
        date: receipt.date,
        type: 'payment',
        description: `سند قبض ${receipt.voucherNumber}`,
        debit: 0,
        credit: receipt.amount,
        balance: 0
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // حساب الرصيد التراكمي
    let runningBalance = client.openingBalance;
    transactions.forEach(transaction => {
      runningBalance += transaction.debit - transaction.credit;
      transaction.balance = runningBalance;
    });

    return transactions;
  };

  // وظيفة طباعة كشف حساب العميل المبسط
  const printClientStatement = (client: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const transactions = generateStatement(client);

    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${client.client.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
            text-align: right;
            color: #000;
          }
          .header {
            text-align: center;
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
          }
          .report-title {
            font-size: 18px;
            margin-bottom: 10px;
          }
          .client-info {
            border: 1px solid #000;
            padding: 15px;
            margin-bottom: 20px;
          }
          .client-info h3 {
            margin: 0 0 15px 0;
            text-align: center;
            font-size: 16px;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .info-label {
            font-weight: bold;
            width: 40%;
          }
          .info-value {
            width: 60%;
            text-align: left;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          
          <div class="report-title">كشف حساب العميل</div>
        </div>
        
        <div class="client-info">
          <h3>معلومات العميل</h3>
          <div class="info-row">
            <span class="info-label">اسم العميل:</span>
            <span class="info-value">${client.client.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رمز العميل:</span>
            <span class="info-value">${client.client.code}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الافتتاحي:</span>
            <span class="info-value">${client.openingBalance.toLocaleString()} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الحالي:</span>
            <span class="info-value">${client.currentBalance.toLocaleString()} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">إجمالي المبيعات:</span>
            <span class="info-value">${client.totalSales.toLocaleString()} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">إجمالي المدفوعات:</span>
            <span class="info-value">${client.totalPayments.toLocaleString()} ريال</span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>البيان</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>الرصيد</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td>رصيد افتتاحي</td>
              <td>-</td>
              <td>-</td>
              <td>${client.openingBalance.toLocaleString()}</td>
            </tr>
            ${transactions.map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                <td>${transaction.description}</td>
                <td>${transaction.debit > 0 ? transaction.debit.toLocaleString() : '-'}</td>
                <td>${transaction.credit > 0 ? transaction.credit.toLocaleString() : '-'}</td>
                <td>${transaction.balance.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - عدد المعاملات: ${transactions.length}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-yellow-600">جاري تحميل حسابات العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">حسابات العملاء</h1>
            <p className="text-gray-600">إدارة احترافية لحسابات وأرصدة العملاء</p>
          </div>
        </div>

        {/* الإحصائيات المبسطة */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalAccounts}</div>
              <div className="text-gray-700 font-semibold">إجمالي الحسابات</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.positiveBalance}</div>
              <div className="text-gray-700 font-semibold">حسابات مدينة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalDebt.toLocaleString()}</div>
              <div className="text-gray-700 font-semibold">إجمالي المديونية</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalCredit.toLocaleString()}</div>
              <div className="text-gray-700 font-semibold">إجمالي الدائنية</div>
            </div>
          </div>
        </div>

        {/* البحث والتصفية المبسط */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="البحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500"
              />
            </div>
            <select
              value={filterBalance}
              onChange={(e) => setFilterBalance(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500"
            >
              <option value="all">جميع الأرصدة</option>
              <option value="positive">رصيد مدين</option>
              <option value="negative">رصيد دائن</option>
              <option value="zero">رصيد صفر</option>
            </select>
          </div>
        </div>

        {/* جدول حسابات العملاء المبسط */}
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b-2 border-gray-300 px-6 py-4">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              قائمة حسابات العملاء ({filteredAccounts.length})
            </h3>
          </div>

          {/* الجدول المبسط */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-400">
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">اسم العميل</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">رمز العميل</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">الرصيد الافتتاحي</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">الرصيد الحالي</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">إجمالي المبيعات</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">إجمالي المدفوعات</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">عدد الفواتير</th>
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">حالة الحساب</th>
                  <th className="px-4 py-3 text-center font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => (
                  <tr key={account.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200 border-b border-gray-200`}>
                    <td className="px-6 py-4 text-center text-gray-800 font-semibold border-r border-gray-200">
                      {account.client.name}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        {account.client.code}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-bold border-r border-gray-200">
                      <span className="text-blue-600 text-lg">
                        {account.openingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold border-r border-gray-200">
                      <span className={`text-lg ${account.currentBalance > 0 ? 'text-red-600' : account.currentBalance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {account.currentBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold border-r border-gray-200">
                      <span className="text-purple-600 text-lg">
                        {account.totalSales.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold border-r border-gray-200">
                      <span className="text-green-600 text-lg">
                        {account.totalPayments.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold border-r border-gray-200">
                      <span className="text-gray-700 text-lg">
                        {account.invoicesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-200">
                      <Badge 
                        variant={account.status === 'overdue' ? 'destructive' : 'default'}
                        className={account.status === 'overdue' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}
                      >
                        {account.status === 'overdue' ? 'متأخر' : 'نشط'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                            onClick={() => setSelectedClient(account)}
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            كشف حساب
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-white border-gray-200 text-gray-900">
                          <DialogHeader>
                            <div className="flex justify-between items-center">
                              <DialogTitle className="text-slate-700 text-xl">
                                كشف حساب - {selectedClient?.client.name}
                              </DialogTitle>
                              <Button
                                onClick={() => selectedClient && printClientStatement(selectedClient)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-bold"
                              >
                                <Printer className="h-4 w-4" />
                                طباعة كشف الحساب
                              </Button>
                            </div>
                          </DialogHeader>
                          
                          {selectedClient && (
                            <div className="space-y-6">
                              {/* معلومات العميل */}
                              <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <span className="text-slate-600 font-medium">رقم العميل: </span>
                                    <span className="text-slate-800 font-bold">{selectedClient.client.code}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600 font-medium">الرصيد الافتتاحي: </span>
                                    <span className="text-blue-600 font-bold">{selectedClient.openingBalance.toLocaleString('en-US')} ر.س</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600 font-medium">الرصيد الحالي: </span>
                                    <span className={`font-bold ${selectedClient.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {selectedClient.currentBalance.toLocaleString('en-US')} ر.س
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* جدول المعاملات */}
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-300">
                                  <thead>
                                    <tr className="bg-slate-600 text-white">
                                      <th className="border border-slate-400 p-3 text-center font-bold">التاريخ</th>
                                      <th className="border border-slate-400 p-3 text-center font-bold">البيان</th>
                                      <th className="border border-slate-400 p-3 text-center font-bold">مدين</th>
                                      <th className="border border-slate-400 p-3 text-center font-bold">دائن</th>
                                      <th className="border border-slate-400 p-3 text-center font-bold">الرصيد</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-slate-50">
                                      <td className="border border-slate-300 p-3 text-center text-slate-700">رصيد افتتاحي</td>
                                      <td className="border border-slate-300 p-3 text-center text-slate-700">الرصيد المرحل</td>
                                      <td className="border border-slate-300 p-3 text-center text-slate-500">-</td>
                                      <td className="border border-slate-300 p-3 text-center text-slate-500">-</td>
                                      <td className="border border-slate-300 p-3 text-center text-blue-600 font-bold">{selectedClient.openingBalance.toLocaleString('en-US')}</td>
                                    </tr>
                                    {generateStatement(selectedClient).map((transaction, index) => (
                                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="border border-slate-300 p-3 text-center text-slate-700">
                                          {new Date(transaction.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="border border-slate-300 p-3 text-center text-slate-700">{transaction.description}</td>
                                        <td className="border border-slate-300 p-3 text-center">
                                          {transaction.debit > 0 ? (
                                            <span className="text-red-600 font-bold">{transaction.debit.toLocaleString('en-US')}</span>
                                          ) : (
                                            <span className="text-slate-400">-</span>
                                          )}
                                        </td>
                                        <td className="border border-slate-300 p-3 text-center">
                                          {transaction.credit > 0 ? (
                                            <span className="text-green-600 font-bold">{transaction.credit.toLocaleString('en-US')}</span>
                                          ) : (
                                            <span className="text-slate-400">-</span>
                                          )}
                                        </td>
                                        <td className="border border-slate-300 p-3 text-center">
                                          <span className="text-slate-800 font-bold bg-slate-100 px-2 py-1 rounded">
                                            {transaction.balance.toLocaleString('en-US')}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* حالة عدم وجود بيانات */}
          {filteredAccounts.length === 0 && (
            <div className="text-center py-12 bg-gray-50">
              <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">لا توجد حسابات</h3>
              <p className="text-slate-500">لم يتم العثور على حسابات مطابقة للبحث</p>
            </div>
          )}

          {/* فوتر الجدول */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                تم إنشاء التقرير بتاريخ: {new Date().toLocaleDateString('en-GB')}
              </div>
              <div className="text-sm text-gray-600">
                عدد الحسابات المعروضة: {filteredAccounts.length} من {stats.totalAccounts}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}