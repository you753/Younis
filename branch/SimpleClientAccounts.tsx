import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Receipt, ShoppingCart, Plus, User, Calendar, 
  DollarSign, CreditCard, Search, Filter, TrendingUp, 
  Users, BookOpen, Wallet, AlertTriangle, Upload, Download, FileSpreadsheet 
} from 'lucide-react';
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

const ProfessionalClientAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBalance, setFilterBalance] = useState('all');
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
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

  // إعداد استيراد Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "رمز العميل,اسم العميل,الهاتف,الرصيد الافتتاحي\n" +
      "C001,شركة الأمل التجارية,0501234567,10000\n" +
      "C002,مؤسسة التقدم,0507654321,5000\n" +
      "C003,شركة النجاح,0551122334,15000";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "قالب_الأرصدة_الافتتاحية.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processImport = async () => {
    if (!importFile) return;

    setImportProgress(0);
    
    // محاكاة عملية الاستيراد
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            setImportProgress((i / (lines.length - 1)) * 100);
            
            const values = lines[i].split(',');
            const clientData = {
              code: values[0]?.trim(),
              name: values[1]?.trim(),
              phone: values[2]?.trim(),
              openingBalance: parseFloat(values[3]?.trim()) || 0
            };

            if (clientData.code && clientData.name) {
              try {
                // محاولة إنشاء العميل
                await fetch('/api/clients', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(clientData)
                });
                successCount++;
              } catch (error) {
                errorCount++;
                errors.push(`خطأ في السطر ${i + 1}: ${clientData.name}`);
              }
            } else {
              errorCount++;
              errors.push(`بيانات ناقصة في السطر ${i + 1}`);
            }
            
            // توقف قصير لمحاكاة المعالجة
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        setImportResults({
          total: lines.length - 1,
          success: successCount,
          errors: errorCount,
          errorMessages: errors
        });

        // تحديث البيانات
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        
      } catch (error) {
        setImportResults({
          total: 0,
          success: 0,
          errors: 1,
          errorMessages: ['خطأ في قراءة الملف']
        });
      }
    };
    
    reader.readAsText(importFile, 'UTF-8');
  };

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
      status: currentBalance > 1000 ? 'overdue' : currentBalance > 0 ? 'due' : 'paid'
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
    const num = parseFloat(amount.toString());
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`;
  };

  // إحصائيات
  const stats = {
    totalAccounts: clientAccounts.length,
    overdueAccounts: clientAccounts.filter(a => a.status === 'overdue').length,
    totalDebt: clientAccounts.filter(a => a.currentBalance > 0).reduce((sum, a) => sum + a.currentBalance, 0),
    totalCredit: Math.abs(clientAccounts.filter(a => a.currentBalance < 0).reduce((sum, a) => sum + a.currentBalance, 0)),
    totalSales: clientAccounts.reduce((sum, a) => sum + a.totalSales, 0),
    totalPayments: clientAccounts.reduce((sum, a) => sum + a.totalPayments, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header الرئيسي */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    حسابات العملاء
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">نظام إدارة الحسابات المتقدم</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowReceiptForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Receipt className="h-6 w-6 mr-3" />
                إنشاء سند قبض
              </Button>
              
              <Button
                onClick={() => setShowImportDialog(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="h-6 w-6 mr-3" />
                استيراد أرصدة افتتاحية
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/branch/1/المبيعات/فواتير المبيعات'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                إدارة المبيعات
              </Button>
            </div>
          </div>
        </div>

        {/* لوحة الإحصائيات المتطورة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">إجمالي العملاء</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalAccounts}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">حسابات متأخرة</p>
                  <p className="text-3xl font-bold mt-2">{stats.overdueAccounts}</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">إجمالي الديون</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalDebt)}</p>
                </div>
                <BookOpen className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalPayments)}</p>
                </div>
                <Wallet className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalSales)}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">الرصيد الدائن</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalCredit)}</p>
                </div>
                <CreditCard className="h-12 w-12 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والتصفية المتطور */}
        <Card className="bg-white border-0 shadow-xl rounded-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="البحث بالاسم أو رمز العميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Select value={filterBalance} onValueChange={setFilterBalance}>
                  <SelectTrigger className="w-full lg:w-64 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحسابات</SelectItem>
                    <SelectItem value="positive">ديون مستحقة</SelectItem>
                    <SelectItem value="negative">أرصدة دائنة</SelectItem>
                    <SelectItem value="zero">أرصدة صفر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول العملاء المتطور */}
        <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="h-7 w-7 text-blue-600" />
              قائمة العملاء ({filteredAccounts.length})
            </h2>
          </div>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="text-right py-6 px-6 font-bold text-lg">معلومات العميل</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">الرصيد الافتتاحي</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">الرصيد الحالي</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">إجمالي المبيعات</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">إجمالي المدفوعات</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">عدد الفواتير</th>
                    <th className="text-right py-6 px-6 font-bold text-lg">الحالة</th>
                    <th className="text-center py-6 px-6 font-bold text-lg">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account, index) => (
                    <tr 
                      key={account.id} 
                      className={`transition-all duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } border-b border-gray-100`}
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                            {account.client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{account.client.name}</p>
                            <p className="text-gray-600 text-sm">كود: {account.client.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <span className="font-bold text-blue-600 text-lg">
                          {formatCurrency(account.openingBalance)}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <span className={`font-bold text-lg ${
                          account.currentBalance > 0 ? 'text-red-600' : 
                          account.currentBalance < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(Math.abs(account.currentBalance))}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <span className="font-bold text-orange-600 text-lg">
                          {formatCurrency(account.totalSales)}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(account.totalPayments)}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <Badge variant="secondary" className="text-lg px-4 py-2 bg-purple-100 text-purple-800">
                          {account.invoicesCount}
                        </Badge>
                      </td>
                      <td className="py-6 px-6">
                        <Badge 
                          className={`text-sm px-4 py-2 font-bold ${
                            account.status === 'overdue' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                            account.status === 'due' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                            'bg-green-100 text-green-800 hover:bg-green-100'
                          }`}
                        >
                          {account.status === 'overdue' ? 'متأخر' : 
                           account.status === 'due' ? 'مستحق' : 'مسدد'}
                        </Badge>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <Button
                          onClick={() => setSelectedClient(account)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <FileText className="h-5 w-5 mr-2" />
                          كشف الحساب
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نموذج سند القبض المتطور */}
        <Dialog open={showReceiptForm} onOpenChange={setShowReceiptForm}>
          <DialogContent className="max-w-2xl bg-white rounded-2xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-8 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-4">
                <Receipt className="h-8 w-8" />
                إنشاء سند قبض جديد
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-blue-600" />
                    العميل
                  </label>
                  <Select
                    value={receiptData.clientId.toString()}
                    onValueChange={(value) => setReceiptData({...receiptData, clientId: parseInt(value)})}
                  >
                    <SelectTrigger className="py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500">
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

                <div className="space-y-3">
                  <label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    تاريخ السند
                  </label>
                  <Input
                    type="date"
                    value={receiptData.date}
                    onChange={(e) => setReceiptData({...receiptData, date: e.target.value})}
                    className="py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    المبلغ (ريال سعودي)
                  </label>
                  <Input
                    type="number"
                    value={receiptData.amount}
                    onChange={(e) => setReceiptData({...receiptData, amount: e.target.value})}
                    placeholder="0.00"
                    className="py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    طريقة الدفع
                  </label>
                  <Select
                    value={receiptData.paymentMethod}
                    onValueChange={(value) => setReceiptData({...receiptData, paymentMethod: value})}
                  >
                    <SelectTrigger className="py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500">
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

              <div className="space-y-3">
                <label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-orange-600" />
                  البيان والملاحظات
                </label>
                <Textarea
                  value={receiptData.notes}
                  onChange={(e) => setReceiptData({...receiptData, notes: e.target.value})}
                  className="py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                  placeholder="بيان السند - مثال: دفعة من العميل، سداد فاتورة رقم..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => {
                    if (receiptData.clientId && receiptData.amount) {
                      createReceiptMutation.mutate(receiptData);
                    }
                  }}
                  disabled={!receiptData.clientId || !receiptData.amount || createReceiptMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {createReceiptMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    <>
                      <Receipt className="h-5 w-5 mr-3" />
                      حفظ السند
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowReceiptForm(false)}
                  variant="outline"
                  className="px-8 py-4 border-2 hover:bg-gray-50 rounded-xl text-lg font-bold"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة كشف الحساب */}
        {selectedClient && (
          <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className="max-w-4xl bg-white rounded-2xl border-0 shadow-2xl" dir="rtl">
              <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-8 -m-6 mb-6 rounded-t-2xl">
                <DialogTitle className="text-2xl font-bold">
                  كشف حساب العميل: {selectedClient.client.name}
                </DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-lg text-gray-700">كشف حساب مفصل للعميل سيتم عرضه هنا...</p>
                  <p className="text-sm text-gray-500 mt-2">يتضمن جميع المعاملات والفواتير وسندات القبض</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* نافذة استيراد الأرصدة الافتتاحية */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-3xl bg-white rounded-2xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 -m-6 mb-6 rounded-t-2xl">
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-4">
                <FileSpreadsheet className="h-8 w-8" />
                استيراد الأرصدة الافتتاحية من Excel
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-8 p-2">
              {!importResults ? (
                <>
                  {/* تحميل القالب */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
                      <Download className="h-6 w-6" />
                      الخطوة الأولى: تحميل القالب
                    </h3>
                    <p className="text-blue-700 mb-4">
                      احصل على قالب Excel المعد مسبقاً لإدخال بيانات العملاء والأرصدة الافتتاحية
                    </p>
                    <Button
                      onClick={downloadTemplate}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      تحميل قالب Excel
                    </Button>
                  </div>

                  {/* رفع الملف */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
                      <Upload className="h-6 w-6" />
                      الخطوة الثانية: رفع الملف
                    </h3>
                    <p className="text-orange-700 mb-4">
                      ارفع ملف Excel المحدّث مع بيانات العملاء والأرصدة الافتتاحية
                    </p>
                    
                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-white">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="import-file"
                      />
                      <label htmlFor="import-file" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-orange-100 p-4 rounded-full">
                            <FileSpreadsheet className="h-12 w-12 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">اضغط لاختيار الملف</p>
                            <p className="text-gray-500">أو اسحب الملف هنا</p>
                            <p className="text-sm text-gray-400 mt-2">CSV, Excel (.xlsx, .xls)</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {importFile && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-bold flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          تم اختيار الملف: {importFile.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* شريط التقدم */}
                  {importProgress > 0 && importProgress < 100 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-green-800 mb-4">جاري المعالجة...</h3>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-green-700 text-center font-bold">{Math.round(importProgress)}%</p>
                    </div>
                  )}

                  {/* أزرار التحكم */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={processImport}
                      disabled={!importFile || (importProgress > 0 && importProgress < 100)}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Upload className="h-5 w-5 mr-3" />
                      بدء الاستيراد
                    </Button>
                    <Button
                      onClick={() => {
                        setShowImportDialog(false);
                        setImportFile(null);
                        setImportProgress(0);
                        setImportResults(null);
                      }}
                      variant="outline"
                      className="px-8 py-4 border-2 hover:bg-gray-50 rounded-xl text-lg font-bold"
                    >
                      إلغاء
                    </Button>
                  </div>
                </>
              ) : (
                /* نتائج الاستيراد */
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      importResults.errors === 0 ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {importResults.errors === 0 ? (
                        <User className="h-10 w-10 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-10 w-10 text-yellow-600" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {importResults.errors === 0 ? 'تم الاستيراد بنجاح!' : 'اكتمل الاستيراد مع تحذيرات'}
                    </h3>
                  </div>

                  {/* إحصائيات النتائج */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{importResults.total}</p>
                      <p className="text-blue-800 font-medium">إجمالي السجلات</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{importResults.success}</p>
                      <p className="text-green-800 font-medium">تم بنجاح</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{importResults.errors}</p>
                      <p className="text-red-800 font-medium">أخطاء</p>
                    </div>
                  </div>

                  {/* رسائل الأخطاء */}
                  {importResults.errorMessages.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-bold text-red-800 mb-2">رسائل الأخطاء:</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        {importResults.errorMessages.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        setShowImportDialog(false);
                        setImportFile(null);
                        setImportProgress(0);
                        setImportResults(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg"
                    >
                      إنهاء
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ProfessionalClientAccounts;