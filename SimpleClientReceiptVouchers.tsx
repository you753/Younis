import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Receipt, 
  DollarSign,
  Calendar,
  Users,
  Eye,
  Printer,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ClientReceiptVoucher {
  id: number;
  clientId: number;
  voucherNumber: string;
  amount: number;
  paymentMethod: string;
  description: string;
  date: string;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  phone?: string;
  balance: number;
  openingBalance: number;
}

export default function SimpleClientReceiptVouchers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ClientReceiptVoucher | null>(null);

  // جلب البيانات
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers'],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // إحصائيات
  const stats = {
    totalVouchers: vouchers.length,
    totalAmount: vouchers.reduce((sum, v) => sum + v.amount, 0),
    todayVouchers: vouchers.filter(v => 
      new Date(v.date).toDateString() === new Date().toDateString()
    ).length,
    avgAmount: vouchers.length > 0 ? vouchers.reduce((sum, v) => sum + v.amount, 0) / vouchers.length : 0
  };

  // إنشاء سند قبض جديد
  const createVoucherMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/client-receipt-vouchers', data);
    },
    onSuccess: () => {
      toast({
        title: "نجح",
        description: "تم إنشاء سند القبض بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند القبض",
        variant: "destructive",
      });
    },
  });

  // حذف سند قبض
  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/client-receipt-vouchers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "نجح",
        description: "تم حذف سند القبض بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف سند القبض",
        variant: "destructive",
      });
    },
  });

  const handleCreateVoucher = (formData: FormData) => {
    const clientId = parseInt(formData.get('clientId') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMethod = formData.get('paymentMethod') as string;
    const description = formData.get('description') as string || '';

    if (!clientId || !amount || !paymentMethod) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const voucherData = {
      clientId,
      amount,
      paymentMethod,
      description,
      date: new Date().toISOString(),
      voucherNumber: `RV-${Date.now()}`,
    };

    createVoucherMutation.mutate(voucherData);
  };

  const printVoucher = (voucher: ClientReceiptVoucher) => {
    const client = clients.find(c => c.id === voucher.clientId);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>سند قبض - ${voucher.voucherNumber}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body { 
                font-family: Arial, sans-serif; 
                direction: rtl; 
                margin: 0;
                padding: 20px;
                background: white;
                color: #000;
              }
              .voucher {
                max-width: 210mm;
                margin: 0 auto;
                background: white;
                border: 2px solid #000;
              }
              .header {
                border-bottom: 2px solid #000;
                padding: 15px;
                text-align: center;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .voucher-title {
                font-size: 18px;
                font-weight: bold;
              }
              .voucher-info {
                padding: 20px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: bold;
                width: 120px;
              }
              .value {
                flex: 1;
                text-align: left;
              }
              .amount-section {
                border: 2px solid #000;
                margin: 20px;
                padding: 20px;
                text-align: center;
              }
              .amount-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .amount-value {
                font-size: 28px;
                font-weight: bold;
                margin: 10px 0;
              }
              .payment-method {
                font-size: 14px;
                margin-top: 10px;
                padding: 5px 10px;
                border: 1px solid #000;
                display: inline-block;
              }
              .description {
                margin: 20px;
                padding: 15px;
                border: 1px solid #000;
                min-height: 60px;
              }
              .description-title {
                font-weight: bold;
                margin-bottom: 10px;
              }
              .signatures {
                display: flex;
                justify-content: space-between;
                margin: 30px 20px 20px 20px;
              }
              .signature-box {
                text-align: center;
                width: 200px;
                border-top: 1px solid #000;
                padding-top: 10px;
                font-weight: bold;
              }
              .print-info {
                text-align: center;
                font-size: 12px;
                margin-top: 20px;
                padding: 10px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="voucher">
              <div class="header">
                
                <div class="voucher-title">سند قبض</div>
              </div>
              
              <div class="voucher-info">
                <div class="info-row">
                  <span class="label">رقم السند:</span>
                  <span class="value">${voucher.voucherNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">التاريخ:</span>
                  <span class="value">${new Date(voucher.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div class="info-row">
                  <span class="label">اسم العميل:</span>
                  <span class="value">${client?.name || 'غير محدد'}</span>
                </div>
                <div class="info-row">
                  <span class="label">رقم الهاتف:</span>
                  <span class="value">${client?.phone || 'غير محدد'}</span>
                </div>
              </div>
              
              <div class="amount-section">
                <div class="amount-title">المبلغ المستلم</div>
                <div class="amount-value">${voucher.amount.toLocaleString('en-US')} ريال</div>
                <div class="payment-method">طريقة الدفع: ${voucher.paymentMethod}</div>
              </div>
              
              <div class="description">
                <div class="description-title">البيان:</div>
                <div>${voucher.description || 'لا يوجد'}</div>
              </div>
              
              <div class="signatures">
                <div class="signature-box">توقيع المستلم</div>
                <div class="signature-box">توقيع المسؤول</div>
              </div>
              
              <div class="print-info">
                تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (vouchersLoading || clientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والزر */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">سندات القبض</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />
              سند قبض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء سند قبض جديد</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateVoucher(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="clientId">العميل</Label>
                <Select name="clientId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select name="paymentMethod" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقد">نقد</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                    <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="وصف السند..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createVoucherMutation.isPending}>
                  {createVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السندات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayVouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط المبلغ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة السندات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات القبض</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>لا توجد سندات قبض</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم السند</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => {
                  const client = clients.find(c => c.id === voucher.clientId);
                  return (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                      <TableCell>{client?.name || 'غير محدد'}</TableCell>
                      <TableCell>
                        {voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{voucher.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>{new Date(voucher.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printVoucher(voucher)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteVoucherMutation.mutate(voucher.id)}
                            disabled={deleteVoucherMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* مودال عرض تفاصيل السند */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل سند القبض</DialogTitle>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم السند</Label>
                  <p className="font-medium">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <p>{new Date(selectedVoucher.date).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              
              <div>
                <Label>العميل</Label>
                <p className="font-medium">
                  {clients.find(c => c.id === selectedVoucher.clientId)?.name || 'غير محدد'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ</Label>
                  <p className="font-bold text-green-600">
                    {selectedVoucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </p>
                </div>
                <div>
                  <Label>طريقة الدفع</Label>
                  <Badge variant="outline">{selectedVoucher.paymentMethod}</Badge>
                </div>
              </div>
              
              <div>
                <Label>الوصف</Label>
                <p>{selectedVoucher.description || 'لا يوجد وصف'}</p>
              </div>
              
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => selectedVoucher && printVoucher(selectedVoucher)}>
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}