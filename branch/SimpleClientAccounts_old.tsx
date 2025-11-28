import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Printer, Receipt, ShoppingCart, Plus, DollarSign, CreditCard, Calendar, User } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface Client {
  id: number;
  name: string;
  code: string;
  phone: string;
  balance: number;
  openingBalance: number;
}

interface Sale {
  id: number;
  clientId: number;
  invoiceNumber: string;
  date: string;
  total: number;
}

interface Receipt {
  id: number;
  clientId: number;
  voucherNumber: string;
  date: string;
  amount: number;
}

const SimpleClientAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptData, setReceiptData] = useState({
    clientId: 0,
    amount: '',
    paymentMethod: 'نقدي',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });


  // جلب البيانات
  const { data: clients = [] } = useQuery({ queryKey: ['/api/clients'] });
  const { data: sales = [] } = useQuery({ queryKey: ['/api/sales'] });
  const { data: receipts = [] } = useQuery({ queryKey: ['/api/client-receipt-vouchers'] });

  // Mutation لإنشاء سند قبض جديد
  const createReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      const voucherNumber = `RCV-${Date.now()}`;
      const receipt = {
        clientId: parseInt(data.clientId),
        voucherNumber,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        receiptDate: data.date,
        description: data.notes || 'سند قبض من العميل',
        notes: data.notes || 'سند قبض',
        status: 'مؤكد'
      };
      
      return await fetch('/api/client-receipt-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowReceiptForm(false);
      setReceiptData({ clientId: 0, amount: '', paymentMethod: 'نقدي', notes: '', date: new Date().toISOString().split('T')[0] });
    }
  });





  // إعداد بيانات العملاء
  const clientAccounts = (clients as Client[]).map(client => {
    const clientSales = (sales as Sale[]).filter(sale => sale.clientId === client.id);
    const clientReceipts = (receipts as Receipt[]).filter(receipt => receipt.clientId === client.id);
    
    const totalSales = clientSales.reduce((sum, sale) => sum + (parseFloat(sale.total.toString()) || 0), 0);
    const totalPayments = clientReceipts.reduce((sum, receipt) => sum + (parseFloat(receipt.amount.toString()) || 0), 0);
    const openingBalance = parseFloat(client.openingBalance?.toString() || '0') || 0;
    const currentBalance = openingBalance + totalSales - totalPayments;
    
    return {
      id: client.id,
      client,
      openingBalance,
      currentBalance,
      totalSales,
      totalPayments,
      invoicesCount: clientSales.length,
      status: currentBalance > 1000 ? 'overdue' : 'active'
    };
  });

  // تصفية العملاء
  const filteredAccounts = clientAccounts.filter(account => {
    const matchesSearch = account.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.client.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBalance === 'all' ||
                         (filterBalance === 'positive' && account.currentBalance > 0) ||
                         (filterBalance === 'negative' && account.currentBalance < 0) ||
                         (filterBalance === 'zero' && account.currentBalance === 0);
    
    return matchesSearch && matchesFilter;
  });

  // دالة التنسيق
  const formatCurrency = (amount: number | string) => {
    return `${parseFloat(amount.toString()).toLocaleString('en-US')} ريال`;
  };

  // إحصائيات
  const stats = {
    totalAccounts: clientAccounts.length,
    positiveBalance: clientAccounts.filter(a => a.currentBalance > 0).length,
    totalDebt: clientAccounts.filter(a => a.currentBalance > 0).reduce((sum, a) => sum + a.currentBalance, 0),
    totalCredit: Math.abs(clientAccounts.filter(a => a.currentBalance < 0).reduce((sum, a) => sum + a.currentBalance, 0))
  };

  // إنشاء كشف الحساب
  const generateStatement = (account: any) => {
    const clientSales = (sales as Sale[]).filter(sale => sale.clientId === account.client.id);
    const clientReceipts = (receipts as Receipt[]).filter(receipt => receipt.clientId === account.client.id);
    
    const transactions = [
      ...clientSales.map(sale => ({
        date: sale.date,
        description: `فاتورة مبيعات ${sale.invoiceNumber}`,
        debit: parseFloat(sale.total.toString()) || 0,
        credit: 0,
        balance: 0
      })),
      ...clientReceipts.map(receipt => ({
        date: receipt.date,
        description: `سند قبض ${receipt.voucherNumber}`,
        debit: 0,
        credit: parseFloat(receipt.amount.toString()) || 0,
        balance: 0
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = account.openingBalance || 0;
    transactions.forEach(transaction => {
      runningBalance = runningBalance + transaction.debit - transaction.credit;
      transaction.balance = runningBalance;
    });

    return transactions;
  };

  // طباعة كشف الحساب
  const printClientStatement = (account: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const transactions = generateStatement(account);

    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${account.client.name}</title>
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
            <span class="info-value">${account.client.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رمز العميل:</span>
            <span class="info-value">${account.client.code}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الافتتاحي:</span>
            <span class="info-value">${formatCurrency(account.openingBalance)} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الحالي:</span>
            <span class="info-value">${formatCurrency(account.currentBalance)} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">إجمالي المبيعات:</span>
            <span class="info-value">${formatCurrency(account.totalSales)} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">إجمالي المدفوعات:</span>
            <span class="info-value">${formatCurrency(account.totalPayments)} ريال</span>
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
              <td>${formatCurrency(account.openingBalance)}</td>
            </tr>
            ${transactions.map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                <td>${transaction.description}</td>
                <td>${transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}</td>
                <td>${transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}</td>
                <td>${formatCurrency(transaction.balance)}</td>
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان مع الأزرار */}
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">حسابات العملاء</h1>
            <p className="text-gray-600">إدارة بسيطة وعملية لحسابات العملاء</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowReceiptForm(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              إضافة سند قبض جديد
            </Button>
          </div>
        </div>

        {/* نافذة إضافة سند قبض احترافية */}
        <Dialog open={showReceiptForm} onOpenChange={setShowReceiptForm}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                إضافة سند قبض جديد
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 pt-6">
              {/* معلومات أساسية */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    المعلومات الأساسية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        العميل
                      </label>
                      <Select
                        value={receiptData.clientId.toString()}
                        onValueChange={(value) => setReceiptData({...receiptData, clientId: parseInt(value)})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                        <SelectContent>
                          {(clients as Client[]).map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} - {client.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        تاريخ السند
                      </label>
                      <Input
                        type="date"
                        value={receiptData.date}
                        onChange={(e) => setReceiptData({...receiptData, date: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* المعلومات المالية */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    المعلومات المالية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        المبلغ (ريال سعودي)
                      </label>
                      <Input
                        type="number"
                        value={receiptData.amount}
                        onChange={(e) => setReceiptData({...receiptData, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full text-lg font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        طريقة الدفع
                      </label>
                      <Select
                        value={receiptData.paymentMethod}
                        onValueChange={(value) => setReceiptData({...receiptData, paymentMethod: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="نقدي">نقدي</SelectItem>
                          <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                          <SelectItem value="شيك">شيك</SelectItem>
                          <SelectItem value="فيزا">فيزا</SelectItem>
                          <SelectItem value="ماستركارد">ماستركارد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ملاحظات */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    البيان والملاحظات
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البيان</label>
                    <Textarea
                      value={receiptData.notes}
                      onChange={(e) => setReceiptData({...receiptData, notes: e.target.value})}
                      className="w-full"
                      placeholder="بيان السند - مثال: دفعة من العميل، سداد فاتورة رقم..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* أزرار العمليات */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (receiptData.clientId && receiptData.amount) {
                      createReceiptMutation.mutate(receiptData);
                    }
                  }}
                  disabled={!receiptData.clientId || !receiptData.amount || createReceiptMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                  {createReceiptMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    <>
                      <Receipt className="h-5 w-5 mr-2" />
                      حفظ السند
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowReceiptForm(false)}
                  variant="outline"
                  className="px-8 py-3 border-2 hover:bg-gray-50"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

            <Button 
              onClick={() => window.location.href = '/branch/1/المبيعات/فواتير المبيعات'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl font-semibold"
            >
              <ShoppingCart className="h-5 w-5" />
              فواتير المبيعات
            </Button>
          </div>
        </div>>

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
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalDebt}</div>
              <div className="text-gray-700 font-semibold">إجمالي المديونية</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalCredit}</div>
              <div className="text-gray-700 font-semibold">إجمالي الدائنية</div>
            </div>
          </div>
        </div>

        {/* البحث والتصفية */}
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

        {/* الجدول المبسط */}
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b-2 border-gray-300 px-6 py-4">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              قائمة العملاء ({filteredAccounts.length})
            </h3>
          </div>

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
                  <th className="px-4 py-3 text-center font-bold border-r border-gray-300">الحالة</th>
                  <th className="px-4 py-3 text-center font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => (
                  <tr key={account.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 border-b border-gray-200`}>
                    <td className="px-4 py-3 text-center border-r border-gray-200 font-semibold">
                      {account.client.name}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      {account.client.code}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600 border-r border-gray-200">
                      {account.openingBalance}
                    </td>
                    <td className="px-4 py-3 text-center font-bold border-r border-gray-200">
                      <span className={account.currentBalance > 0 ? 'text-red-600' : account.currentBalance < 0 ? 'text-green-600' : 'text-gray-500'}>
                        {account.currentBalance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-purple-600 border-r border-gray-200">
                      {account.totalSales}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-green-600 border-r border-gray-200">
                      {account.totalPayments}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      {account.invoicesCount}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${account.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {account.status === 'overdue' ? 'متأخر' : 'نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedClient(account)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            كشف حساب
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-white border-gray-200 text-gray-900">
                          <DialogHeader>
                            <div className="flex justify-between items-center">
                              <DialogTitle className="text-gray-700 text-xl">
                                كشف حساب - {selectedClient?.client.name}
                              </DialogTitle>
                              <Button
                                onClick={() => selectedClient && printClientStatement(selectedClient)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"
                              >
                                <Printer className="h-4 w-4" />
                                طباعة كشف الحساب
                              </Button>
                            </div>
                          </DialogHeader>
                          
                          {selectedClient && (
                            <div className="space-y-6 mt-4">
                              {/* معلومات العميل */}
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-lg font-bold text-gray-800 mb-3">معلومات العميل</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div><span className="font-bold">الاسم:</span> {selectedClient.client.name}</div>
                                  <div><span className="font-bold">الكود:</span> {selectedClient.client.code}</div>
                                  <div><span className="font-bold">الهاتف:</span> {selectedClient.client.phone}</div>
                                  <div><span className="font-bold text-blue-600">الرصيد الافتتاحي:</span> {selectedClient.openingBalance}</div>
                                  <div><span className="font-bold">الرصيد الحالي:</span> 
                                    <span className={selectedClient.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                                      {selectedClient.currentBalance}
                                    </span>
                                  </div>
                                  <div><span className="font-bold text-green-600">إجمالي المدفوعات:</span> {selectedClient.totalPayments}</div>
                                </div>
                              </div>

                              {/* جدول المعاملات */}
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="px-4 py-2 text-center border-r border-gray-200">التاريخ</th>
                                      <th className="px-4 py-2 text-center border-r border-gray-200">البيان</th>
                                      <th className="px-4 py-2 text-center border-r border-gray-200">مدين</th>
                                      <th className="px-4 py-2 text-center border-r border-gray-200">دائن</th>
                                      <th className="px-4 py-2 text-center">الرصيد</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-blue-50">
                                      <td className="px-4 py-2 text-center border-r border-gray-200">-</td>
                                      <td className="px-4 py-2 text-center border-r border-gray-200 font-bold">رصيد افتتاحي</td>
                                      <td className="px-4 py-2 text-center border-r border-gray-200">-</td>
                                      <td className="px-4 py-2 text-center border-r border-gray-200">-</td>
                                      <td className="px-4 py-2 text-center font-bold text-blue-600">{selectedClient.openingBalance}</td>
                                    </tr>
                                    {generateStatement(selectedClient).map((transaction, index) => (
                                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-2 text-center border-r border-gray-200">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-4 py-2 text-center border-r border-gray-200">{transaction.description}</td>
                                        <td className="px-4 py-2 text-center border-r border-gray-200 text-red-600">{transaction.debit > 0 ? transaction.debit : '-'}</td>
                                        <td className="px-4 py-2 text-center border-r border-gray-200 text-green-600">{transaction.credit > 0 ? transaction.credit : '-'}</td>
                                        <td className="px-4 py-2 text-center font-bold text-blue-600">{transaction.balance}</td>
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
        </div>
      </div>
    </div>
  );
};

export default SimpleClientAccounts;