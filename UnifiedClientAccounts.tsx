import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, DollarSign, TrendingUp, Eye, RefreshCw, Receipt, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: string; // رصيد موحد
  status: string;
  group: string;
  accountType: string;
  createdAt: string;
}

interface ReceiptVoucher {
  id: number;
  clientId: number;
  voucherNumber: string;
  amount: string;
  paymentMethod: string;
  receiptDate: string;
  description: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function UnifiedClientAccounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    voucherNumber: '',
    amount: '',
    paymentMethod: 'نقدي',
    receiptDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب بيانات العملاء
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useQuery({
    queryKey: ['/api/clients'],
    refetchInterval: 3000
  });

  // جلب سندات القبض
  const { data: receiptVouchers = [], refetch: refetchVouchers } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    refetchInterval: 3000
  });

  // إنشاء سند قبض جديد
  const createVoucherMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      const response = await fetch('/api/client-receipt-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });
      if (!response.ok) throw new Error('فشل في إنشاء سند القبض');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء سند القبض وخصم المبلغ من الرصيد",
      });
      setIsReceiptDialogOpen(false);
      setVoucherForm({
        voucherNumber: '',
        amount: '',
        paymentMethod: 'نقدي',
        receiptDate: new Date().toISOString().split('T')[0],
        description: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند القبض",
        variant: "destructive"
      });
    }
  });

  // تنسيق الأرقام
  const formatNumber = (value: string | number) => {
    const num = parseFloat(value?.toString() || '0');
    return num.toLocaleString('en-US');
  };

  // حساب الإحصائيات
  const totalClients = clients.length;
  const activeClients = clients.filter((c: Client) => c.status === 'active').length;
  const totalBalance = clients.reduce((sum: number, c: Client) => sum + parseFloat(c.balance || '0'), 0);
  const highDebtClients = clients.filter((c: Client) => parseFloat(c.balance || '0') > 10000).length;

  // تصفية العملاء
  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // الحصول على معاملات العميل
  const getClientTransactions = (clientId: number) => {
    return receiptVouchers
      .filter((voucher: ReceiptVoucher) => voucher.clientId === clientId)
      .map((voucher: ReceiptVoucher) => ({
        id: voucher.id,
        date: voucher.receiptDate,
        description: `سند قبض ${voucher.voucherNumber}`,
        amount: parseFloat(voucher.amount),
        type: 'receipt',
        paymentMethod: voucher.paymentMethod
      }));
  };

  // إنشاء سند قبض
  const handleCreateVoucher = () => {
    if (!selectedClient || !voucherForm.amount) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار العميل وإدخال المبلغ",
        variant: "destructive"
      });
      return;
    }

    const voucherData = {
      ...voucherForm,
      clientId: selectedClient.id,
      voucherNumber: voucherForm.voucherNumber || `RCV-${Date.now()}`,
      status: 'مؤكد'
    };

    createVoucherMutation.mutate(voucherData);
  };

  // طباعة كشف الحساب
  const handlePrintStatement = () => {
    if (!selectedClient) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const clientTransactions = getClientTransactions(selectedClient.id);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب العميل - ${selectedClient.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .report-title { font-size: 18px; margin-bottom: 20px; }
          .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .info-box { border: 1px solid #ddd; padding: 10px; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; }
          .info-value { font-size: 14px; margin-top: 5px; }
          .balance-green { color: #16a34a; }
          .balance-blue { color: #2563eb; }
          .balance-purple { color: #9333ea; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .amount { color: #16a34a; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          
          <div class="report-title">كشف حساب العميل</div>
        </div>
        
        <div class="client-info">
          <div class="info-box">
            <div class="info-label">اسم العميل</div>
            <div class="info-value">${selectedClient.name}</div>
          </div>
          <div class="info-box">
            <div class="info-label">رقم الهاتف</div>
            <div class="info-value">${selectedClient.phone}</div>
          </div>
          <div class="info-box">
            <div class="info-label">الرصيد الافتتاحي</div>
            <div class="info-value balance-green">${formatNumber(selectedClient.balance)} ريال</div>
          </div>
          <div class="info-box">
            <div class="info-label">الرصيد الحالي</div>
            <div class="info-value balance-blue">${formatNumber(selectedClient.balance)} ريال</div>
          </div>
          <div class="info-box">
            <div class="info-label">نوع الحساب</div>
            <div class="info-value">${selectedClient.accountType}</div>
          </div>
          <div class="info-box">
            <div class="info-label">الرصيد النهائي</div>
            <div class="info-value balance-purple">${formatNumber(selectedClient.balance)} ريال</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الوصف</th>
              <th>المبلغ</th>
              <th>طريقة الدفع</th>
            </tr>
          </thead>
          <tbody>
            ${clientTransactions.length > 0 ? 
              clientTransactions.map(transaction => `
                <tr>
                  <td>${transaction.date}</td>
                  <td>${transaction.description}</td>
                  <td class="amount">-${formatNumber(transaction.amount)} ريال</td>
                  <td>${transaction.paymentMethod}</td>
                </tr>
              `).join('') : 
              '<tr><td colspan="4" style="text-align: center; color: #666;">لا توجد معاملات لهذا العميل</td></tr>'
            }
          </tbody>
        </table>

        <div class="footer">
          تم طباعة هذا التقرير في ${new Date().toLocaleDateString('en-GB')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // تحديث البيانات
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchClients(), refetchVouchers()]);
      toast({
        title: "تم التحديث",
        description: "تم تحديث جميع البيانات بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث البيانات",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان والأزرار */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">حسابات العملاء</h1>
            <p className="text-gray-600 mt-2">إدارة أرصدة العملاء مع النظام الموحد</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">العملاء النشطون</p>
                  <p className="text-2xl font-bold text-green-600">{activeClients}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الأرصدة</p>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(totalBalance)} ريال</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">أرصدة عالية</p>
                  <p className="text-2xl font-bold text-orange-600">{highDebtClients}</p>
                </div>
                <Phone className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="البحث في العملاء..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* جدول العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold">اسم العميل</th>
                    <th className="text-right p-3 font-semibold">الهاتف</th>
                    <th className="text-right p-3 font-semibold">الرصيد الحالي</th>
                    <th className="text-right p-3 font-semibold">الحالة</th>
                    <th className="text-right p-3 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client: Client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </td>
                      <td className="p-3">{client.phone}</td>
                      <td className="p-3">
                        <span className="font-semibold text-blue-600">
                          {formatNumber(client.balance)} ريال
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsStatementOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            كشف حساب
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsReceiptDialogOpen(true);
                            }}
                          >
                            <Receipt className="h-4 w-4 ml-1" />
                            سند قبض
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog كشف الحساب */}
        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>كشف حساب العميل</DialogTitle>
                <Button 
                  onClick={handlePrintStatement}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Printer className="h-4 w-4 ml-1" />
                  طباعة الكشف
                </Button>
              </div>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                {/* معلومات العميل */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">اسم العميل</Label>
                    <p className="font-semibold">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">رقم الهاتف</Label>
                    <p className="font-semibold">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الرصيد الافتتاحي</Label>
                    <p className="font-semibold text-green-600">
                      {formatNumber(selectedClient.balance)} ريال
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الرصيد الحالي</Label>
                    <p className="font-semibold text-blue-600">
                      {formatNumber(selectedClient.balance)} ريال
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">نوع الحساب</Label>
                    <p className="font-semibold">{selectedClient.accountType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الرصيد النهائي</Label>
                    <p className="font-semibold text-purple-600">
                      {formatNumber(selectedClient.balance)} ريال
                    </p>
                  </div>
                </div>

                {/* جدول المعاملات */}
                <div>
                  <h3 className="font-semibold mb-4">تاريخ المعاملات</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-right p-3 border">التاريخ</th>
                          <th className="text-right p-3 border">الوصف</th>
                          <th className="text-right p-3 border">المبلغ</th>
                          <th className="text-right p-3 border">طريقة الدفع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getClientTransactions(selectedClient.id).map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border">{transaction.date}</td>
                            <td className="p-3 border">{transaction.description}</td>
                            <td className="p-3 border text-green-600 font-semibold">
                              -{formatNumber(transaction.amount)} ريال
                            </td>
                            <td className="p-3 border">{transaction.paymentMethod}</td>
                          </tr>
                        ))}
                        {getClientTransactions(selectedClient.id).length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-500">
                              لا توجد معاملات لهذا العميل
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog إنشاء سند قبض */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء سند قبض جديد</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div>
                  <Label>العميل</Label>
                  <Input value={selectedClient.name} disabled />
                </div>
                <div>
                  <Label>رقم السند</Label>
                  <Input
                    value={voucherForm.voucherNumber}
                    onChange={(e) => setVoucherForm({...voucherForm, voucherNumber: e.target.value})}
                    placeholder="سيتم إنشاؤه تلقائياً"
                  />
                </div>
                <div>
                  <Label>المبلغ *</Label>
                  <Input
                    type="number"
                    value={voucherForm.amount}
                    onChange={(e) => setVoucherForm({...voucherForm, amount: e.target.value})}
                    placeholder="أدخل المبلغ"
                  />
                </div>
                <div>
                  <Label>طريقة الدفع</Label>
                  <Select
                    value={voucherForm.paymentMethod}
                    onValueChange={(value) => setVoucherForm({...voucherForm, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="بنك">تحويل بنكي</SelectItem>
                      <SelectItem value="شيك">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ الاستلام</Label>
                  <Input
                    type="date"
                    value={voucherForm.receiptDate}
                    onChange={(e) => setVoucherForm({...voucherForm, receiptDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={voucherForm.description}
                    onChange={(e) => setVoucherForm({...voucherForm, description: e.target.value})}
                    placeholder="وصف السند"
                  />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={voucherForm.notes}
                    onChange={(e) => setVoucherForm({...voucherForm, notes: e.target.value})}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateVoucher}
                    disabled={createVoucherMutation.isPending}
                    className="flex-1"
                  >
                    {createVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsReceiptDialogOpen(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}