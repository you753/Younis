import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Printer, Plus, Search, DollarSign, FileText, Calendar } from 'lucide-react';
import type { ClientReceiptVoucher, Client } from '@shared/schema';

export default function SalesReceiptVoucher() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    payer: '',
    receiver: '',
    paymentMethod: 'cash',
    receiptDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  // Fetch receipt vouchers
  const { data: vouchers = [], isLoading } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers']
  });

  // Create receipt voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const voucherNumber = `RCV-${Date.now()}`;
      return apiRequest('/api/client-receipt-vouchers', 'POST', {
        ...data,
        clientId: parseInt(data.clientId),
        voucherNumber,
        status: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة سند القبض بنجاح',
      });
      // Reset form
      setFormData({
        clientId: '',
        amount: '',
        payer: '',
        receiver: '',
        paymentMethod: 'cash',
        receiptDate: new Date().toISOString().split('T')[0],
        description: '',
        notes: ''
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة سند القبض',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount || !formData.payer || !formData.receiver) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    createVoucherMutation.mutate(formData);
  };

  // Print voucher
  const printVoucher = (voucher: ClientReceiptVoucher) => {
    const client = clients.find(c => c.id === voucher.clientId);
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند قبض - ${voucher.voucherNumber}</title>
        <style>
          @media print { 
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 20px;
            background: white;
            color: black;
          }
          .voucher-container {
            border: 3px solid black;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid black;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: black;
            margin-bottom: 10px;
          }
          .voucher-number {
            font-size: 18px;
            color: black;
            font-weight: 600;
          }
          .info-section {
            margin: 25px 0;
            padding: 20px;
            border: 2px solid black;
            background: white;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #333;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: black;
            font-size: 16px;
          }
          .value {
            color: black;
            font-size: 16px;
            font-weight: 600;
          }
          .amount-section {
            margin: 30px 0;
            padding: 25px;
            border: 3px double black;
            text-align: center;
            background: white;
          }
          .amount-label {
            font-size: 18px;
            font-weight: bold;
            color: black;
            margin-bottom: 10px;
          }
          .amount-value {
            font-size: 36px;
            font-weight: bold;
            color: black;
          }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
          }
          .signature-box {
            text-align: center;
            padding: 20px;
            border-top: 2px solid black;
          }
          .signature-label {
            font-size: 16px;
            font-weight: bold;
            color: black;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: black;
            border-top: 2px solid black;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="voucher-container">
          <div class="header">
            <div class="title">سند قبض مبيعات</div>
            <div class="voucher-number">رقم السند: ${voucher.voucherNumber}</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">التاريخ:</span>
              <span class="value">${new Date(voucher.receiptDate).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="info-row">
              <span class="label">العميل:</span>
              <span class="value">${client?.name || 'غير محدد'}</span>
            </div>
            <div class="info-row">
              <span class="label">الدافع (من):</span>
              <span class="value">${voucher.payer || 'غير محدد'}</span>
            </div>
            <div class="info-row">
              <span class="label">المستلم (إلى):</span>
              <span class="value">${voucher.receiver || 'غير محدد'}</span>
            </div>
            <div class="info-row">
              <span class="label">طريقة الدفع:</span>
              <span class="value">${
                voucher.paymentMethod === 'cash' ? 'نقدي' :
                voucher.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                voucher.paymentMethod === 'check' ? 'شيك' : voucher.paymentMethod
              }</span>
            </div>
            ${voucher.description ? `
              <div class="info-row">
                <span class="label">الوصف:</span>
                <span class="value">${voucher.description}</span>
              </div>
            ` : ''}
          </div>

          <div class="amount-section">
            <div class="amount-label">المبلغ المستلم</div>
            <div class="amount-value">${parseFloat(voucher.amount as string).toFixed(2)} ريال</div>
          </div>

          ${voucher.notes ? `
            <div class="info-section">
              <div class="label">ملاحظات:</div>
              <div class="value" style="margin-top: 10px;">${voucher.notes}</div>
            </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div style="height: 60px;"></div>
              <div class="signature-label">توقيع الدافع</div>
              <div style="margin-top: 5px; font-size: 14px;">${voucher.payer || ''}</div>
            </div>
            <div class="signature-box">
              <div style="height: 60px;"></div>
              <div class="signature-label">توقيع المستلم</div>
              <div style="margin-top: 5px; font-size: 14px;">${voucher.receiver || ''}</div>
            </div>
          </div>

          <div class="footer">
            <div style="font-weight: bold;">تاريخ الطباعة: ${new Date().toLocaleString('en-US')}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    const client = clients.find(c => c.id === voucher.clientId);
    return (
      voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.payer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate statistics
  const totalAmount = filteredVouchers.reduce((sum, v) => sum + parseFloat(v.amount as string || '0'), 0);
  const todayVouchers = filteredVouchers.filter(v => 
    new Date(v.receiptDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">سندات قبض المبيعات</h1>
        <p className="text-gray-600 mt-2">إدارة سندات قبض المبيعات والمدفوعات</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي السندات</p>
                <p className="text-2xl font-bold text-gray-900">{filteredVouchers.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">سندات اليوم</p>
                <p className="text-2xl font-bold text-green-600">{todayVouchers}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبالغ</p>
                <p className="text-2xl font-bold text-purple-600">{totalAmount.toFixed(2)} ر.س</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Voucher Form */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة سند قبض جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">العميل *</label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المبلغ (ريال) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الدافع (من) *</label>
                <Input
                  value={formData.payer}
                  onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                  placeholder="اسم الشخص الذي يعطي المال"
                  data-testid="input-payer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المستلم (إلى) *</label>
                <Input
                  value={formData.receiver}
                  onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                  placeholder="اسم الشخص الذي يستلم المال"
                  data-testid="input-receiver"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التاريخ</label>
                <Input
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                  data-testid="input-date"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف السند"
                  data-testid="input-description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  rows={3}
                  data-testid="input-notes"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={createVoucherMutation.isPending}
              data-testid="button-submit"
            >
              {createVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ سند القبض'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث برقم السند، العميل، الدافع، أو المستلم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">سندات القبض</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-right font-semibold text-gray-700">رقم السند</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">التاريخ</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">العميل</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الدافع</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">المستلم</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">المبلغ</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد سندات قبض
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => {
                  const client = clients.find(c => c.id === voucher.clientId);
                  return (
                    <TableRow key={voucher.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {voucher.voucherNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(voucher.receiptDate).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-gray-700">{client?.name || 'غير محدد'}</TableCell>
                      <TableCell className="text-gray-700">{voucher.payer || 'غير محدد'}</TableCell>
                      <TableCell className="text-gray-700">{voucher.receiver || 'غير محدد'}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {parseFloat(voucher.amount as string).toFixed(2)} ر.س
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printVoucher(voucher)}
                          className="text-gray-900 hover:text-black hover:bg-gray-100 border-gray-900"
                          data-testid={`button-print-${voucher.id}`}
                        >
                          <Printer className="w-4 h-4 ml-1" />
                          طباعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
