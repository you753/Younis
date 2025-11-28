import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Receipt, 
  Search, 
  Eye,
  Trash2,
  Printer,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types
interface ClientReceiptVoucher {
  id: number;
  clientId?: number;
  client_id?: number;
  client_name?: string;
  voucherNumber: string;
  voucher_number?: string;
  amount: string;
  paymentMethod: string;
  payment_method?: string;
  receiptDate: string;
  receipt_date?: string;
  description?: string;
  reference?: string;
  status: string;
  notes?: string;
  payer?: string;
  receiver?: string;
  deductFrom?: 'balance' | 'creditLimit';
  createdAt?: Date;
  created_at?: string;
}

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
  openingBalance?: number;
  creditLimit?: number;
}

// Format number with Arabic locale
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// Format currency
const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${formatNumber(num)} ر.س`;
};

export default function ProfessionalClientReceiptVouchers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ClientReceiptVoucher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    paymentMethod: 'نقدي',
    description: '',
    reference: '',
    notes: '',
    deductFrom: 'balance' as 'balance' | 'creditLimit'
  });

  // Fetch data
  const { data: vouchers = [], refetch: refetchVouchers } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Mutations
  const createVoucherMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/client-receipt-vouchers', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم إنشاء سند القبض بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/client-receipt-vouchers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف سند القبض بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    },
  });

  // Functions
  const resetForm = () => {
    setFormData({
      clientId: '',
      amount: '',
      paymentMethod: 'نقدي',
      description: '',
      reference: '',
      notes: '',
      deductFrom: 'balance'
    });
  };

  const handleSubmit = () => {
    if (!formData.clientId || !formData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const voucherData = {
      ...formData,
      clientId: parseInt(formData.clientId),
      receiptDate: new Date().toISOString().split('T')[0],
      voucherNumber: `QBH-${String(Date.now()).slice(-6)}`,
      status: 'مؤكد'
    };

    createVoucherMutation.mutate(voucherData);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف سند القبض؟')) {
      deleteVoucherMutation.mutate(id);
    }
  };

  const handleView = (voucher: ClientReceiptVoucher) => {
    setSelectedVoucher(voucher);
    setIsViewDialogOpen(true);
  };

  const handlePrint = (voucher: ClientReceiptVoucher) => {
    const clientId = voucher.clientId || voucher.client_id;
    const client = clients.find(c => c.id === clientId);
    const clientName = voucher.client_name || voucher.payer || client?.name || 'غير محدد';
    const voucherNum = voucher.voucherNumber || voucher.voucher_number || '';
    const recDate = voucher.receiptDate || voucher.receipt_date || '';
    const payMethod = voucher.paymentMethod || voucher.payment_method || '';
    
    const printContent = `
      <div style="font-family: Arial; direction: rtl; text-align: right; padding: 20px;">
        <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">سند قبض</h2>
        <div style="margin: 20px 0;">
          <p><strong>رقم السند:</strong> ${voucherNum}</p>
          <p><strong>التاريخ:</strong> ${recDate}</p>
          <p><strong>العميل:</strong> ${clientName}</p>
          <p><strong>المبلغ:</strong> ${formatCurrency(voucher.amount)}</p>
          <p><strong>طريقة الدفع:</strong> ${payMethod}</p>
          ${voucher.description ? `<p><strong>الوصف:</strong> ${voucher.description}</p>` : ''}
          ${voucher.reference ? `<p><strong>المرجع:</strong> ${voucher.reference}</p>` : ''}
          ${voucher.receiver ? `<p><strong>المستلم:</strong> ${voucher.receiver}</p>` : ''}
          ${voucher.notes ? `<p><strong>ملاحظات:</strong> ${voucher.notes}</p>` : ''}
        </div>
        <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 20px;">
          <p>التوقيع: ________________</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Filter vouchers based on search
  const filteredVouchers = vouchers.filter(voucher => {
    const clientId = voucher.clientId || voucher.client_id;
    const client = clients.find(c => c.id === clientId);
    const clientName = voucher.client_name || voucher.payer || client?.name || '';
    const voucherNum = voucher.voucherNumber || voucher.voucher_number || '';
    const desc = voucher.description || '';
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           voucherNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
           desc.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate statistics
  const totalAmount = vouchers.reduce((sum, voucher) => sum + parseFloat(voucher.amount), 0);
  const averageAmount = vouchers.length > 0 ? totalAmount / vouchers.length : 0;
  const totalVouchers = vouchers.length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">سندات القبض</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              refetchVouchers();
              queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
            }}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            سند قبض جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السندات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات اليوم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">ر.س</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط المبلغ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(averageAmount)}</div>
            <p className="text-xs text-muted-foreground">ر.س</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في سندات القبض..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات القبض</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم السند</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => {
                const clientId = voucher.clientId || voucher.client_id;
                const client = clients.find(c => c.id === clientId);
                const clientName = voucher.client_name || voucher.payer || client?.name || 'غير محدد';
                const voucherNum = voucher.voucherNumber || voucher.voucher_number || '';
                const payMethod = voucher.paymentMethod || voucher.payment_method || '';
                const recDate = voucher.receiptDate || voucher.receipt_date || '';
                
                return (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucherNum}</TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>{formatCurrency(voucher.amount)}</TableCell>
                    <TableCell>{payMethod}</TableCell>
                    <TableCell>{recDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{voucher.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(voucher)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(voucher)}
                          className="h-8 w-8 p-0"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(voucher.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredVouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد سندات قبض
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إنشاء سند قبض جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">العميل</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
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
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقدي">نقدي</SelectItem>
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
                placeholder="وصف السند"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="reference">المرجع</Label>
              <Input
                id="reference"
                placeholder="رقم المرجع"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="deductFromCredit"
                checked={formData.deductFrom === 'creditLimit'}
                onCheckedChange={(checked) => 
                  setFormData({...formData, deductFrom: checked ? 'creditLimit' : 'balance'})
                }
              />
              <Label htmlFor="deductFromCredit" className="text-sm">
                خصم من الحد الائتماني
              </Label>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                placeholder="ملاحظات إضافية"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={createVoucherMutation.isPending}
                className="flex-1"
              >
                {createVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل سند القبض</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">رقم السند</Label>
                  <p className="font-medium">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">التاريخ</Label>
                  <p className="font-medium">{selectedVoucher.receiptDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">العميل</Label>
                  <p className="font-medium">
                    {clients.find(c => c.id === selectedVoucher.clientId)?.name || 'غير محدد'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">المبلغ</Label>
                  <p className="font-medium">{formatCurrency(selectedVoucher.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">طريقة الدفع</Label>
                  <p className="font-medium">{selectedVoucher.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">نوع الخصم</Label>
                  <p className="font-medium">
                    {selectedVoucher.deductFrom === 'balance' ? 'رصيد عادي' : 'حد ائتماني'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">الوصف</Label>
                <p className="font-medium">{selectedVoucher.description}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">المرجع</Label>
                <p className="font-medium">{selectedVoucher.reference}</p>
              </div>
              
              {selectedVoucher.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">ملاحظات</Label>
                  <p className="font-medium">{selectedVoucher.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handlePrint(selectedVoucher)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Printer className="h-4 w-4" />
                  طباعة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}