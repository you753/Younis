import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { ClientReceiptVoucherForm } from '@/components/forms/ClientReceiptVoucherForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, Edit, Trash2, Calendar, FileText, DollarSign } from 'lucide-react';
import type { ClientReceiptVoucher, Client } from '@shared/schema';

export default function ClientReceiptVouchers() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [editingVoucher, setEditingVoucher] = useState<ClientReceiptVoucher | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('سندات قبض العملاء');
  }, [location, setCurrentPage]);

  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers']
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  // Handlers
  const handleAddVoucher = (clientId?: number) => {
    setSelectedClientId(clientId);
    setEditingVoucher(null);
    setShowVoucherForm(true);
  };

  const handleEditVoucher = (voucher: ClientReceiptVoucher) => {
    setEditingVoucher(voucher);
    setSelectedClientId(voucher.clientId);
    setShowVoucherForm(true);
  };

  const handleDeleteVoucher = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف سند القبض؟')) {
      try {
        const response = await fetch(`/api/client-receipt-vouchers/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete receipt voucher');
        
        queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        toast({
          title: "تم حذف سند القبض بنجاح",
          description: "تم إعادة المبلغ إلى دين العميل",
        });
      } catch (error) {
        console.error('Error deleting receipt voucher:', error);
        toast({
          title: "خطأ في حذف سند القبض",
          description: "حدث خطأ أثناء حذف سند القبض",
          variant: "destructive",
        });
      }
    }
  };

  // Helper functions
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'غير محدد';
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'check': return 'شيك';
      case 'credit_card': return 'بطاقة ائتمان';
      default: return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">في الانتظار</Badge>;
      case 'approved': return <Badge variant="default">معتمد</Badge>;
      case 'received': return <Badge variant="default" className="bg-green-100 text-green-800">تم الاستلام</Badge>;
      case 'cancelled': return <Badge variant="destructive">ملغي</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Statistics
  const totalAmount = vouchers.reduce((sum, voucher) => sum + parseFloat(voucher.amount || '0'), 0);
  const todayVouchers = vouchers.filter(voucher => 
    new Date(voucher.receiptDate).toDateString() === new Date().toDateString()
  );
  const todayAmount = todayVouchers.reduce((sum, voucher) => sum + parseFloat(voucher.amount || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">سندات قبض العملاء</h2>
          <p className="text-gray-600">إدارة سندات القبض من العملاء ومتابعة المدفوعات المستلمة</p>
        </div>
        <Button onClick={() => handleAddVoucher()} className="btn-accounting-primary">
          <Plus className="ml-2 h-4 w-4" />
          إضافة سند قبض
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">إجمالي السندات</p>
                <p className="text-2xl font-bold text-green-700">{vouchers.length}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Receipt className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المبلغ</p>
                <p className="text-2xl font-bold text-blue-700">
                  {totalAmount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">سندات اليوم</p>
                <p className="text-2xl font-bold text-purple-700">{todayVouchers.length}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">مبلغ اليوم</p>
                <p className="text-2xl font-bold text-orange-700">
                  {todayAmount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>سندات القبض</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchersLoading ? (
            <div className="text-center py-8">جاري تحميل السندات...</div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>لا توجد سندات قبض مسجلة</p>
              <Button onClick={() => handleAddVoucher()} className="mt-4">
                إضافة أول سند قبض
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم السند</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>تاريخ الاستلام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">#{voucher.voucherNumber}</TableCell>
                    <TableCell>{getClientName(voucher.clientId)}</TableCell>
                    <TableCell>{parseFloat(voucher.amount || '0').toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</TableCell>
                    <TableCell>{getPaymentMethodLabel(voucher.paymentMethod)}</TableCell>
                    <TableCell>{new Date(voucher.receiptDate).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVoucher(voucher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVoucher(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Voucher Form Modal */}
      <ClientReceiptVoucherForm
        isOpen={showVoucherForm}
        onClose={() => {
          setShowVoucherForm(false);
          setEditingVoucher(null);
          setSelectedClientId(undefined);
        }}
        clientId={selectedClientId}
        editingVoucher={editingVoucher}
      />
    </div>
  );
}