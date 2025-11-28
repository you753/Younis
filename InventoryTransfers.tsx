import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, Package, Trash2, CheckCircle2, XCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const formatNumber = (num: number | string) => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  return Math.round(number).toString();
};

export default function InventoryTransfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('send');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sendForm, setSendForm] = useState({
    toBranchId: '',
    productId: '',
    quantity: '',
    notes: ''
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: transfers = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory-transfers'],
    refetchInterval: 3000
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/inventory-transfers/send', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم إرسال المخزون بنجاح',
        description: 'تم خصم الكمية من المخزون',
        className: 'bg-green-50 border-green-200'
      });
      setShowSendDialog(false);
      setSendForm({ toBranchId: '', productId: '', quantity: '', notes: '' });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الإرسال',
        description: error.message || 'فشل في إرسال المخزون',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const receiveMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return await apiRequest(`/api/inventory-transfers/${transferId}/receive`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم الاستلام بنجاح',
        description: 'تم إضافة الكمية للمخزون',
        className: 'bg-green-50 border-green-200'
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الاستلام',
        description: error.message || 'فشل في استلام المخزون',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return await apiRequest(`/api/inventory-transfers/${transferId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم الحذف بنجاح',
        description: 'تم حذف العملية',
        className: 'bg-green-50 border-green-200'
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الحذف',
        description: error.message || 'فشل في حذف العملية',
        variant: 'destructive'
      });
    }
  });

  const handleSendSubmit = () => {
    if (!sendForm.toBranchId || !sendForm.productId || !sendForm.quantity) {
      toast({
        title: '⚠️ بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    sendMutation.mutate({
      toBranchId: parseInt(sendForm.toBranchId),
      productId: parseInt(sendForm.productId),
      quantity: parseInt(sendForm.quantity),
      notes: sendForm.notes
    });
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'غير معروف';
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return 'المخزون الرئيسي';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'غير معروف';
  };

  const sentTransfers = transfers.filter(t => t.status === 'sent');
  const receivedTransfers = transfers.filter(t => t.status === 'received');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إرسال واستقبال المخزون</h1>
          <p className="text-gray-600 mt-1">إدارة نقل المخزون بين الفروع</p>
        </div>
        
        <Button
          onClick={() => setShowSendDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          <Send className="h-4 w-4 ml-2" />
          إرسال مخزون جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">قيد الإرسال</p>
                <p className="text-3xl font-bold text-blue-900">{sentTransfers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">تم الاستلام</p>
                <p className="text-3xl font-bold text-green-900">{receivedTransfers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">إجمالي العمليات</p>
                <p className="text-3xl font-bold text-purple-900">{transfers.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="send" className="text-base">
                <ArrowRight className="h-4 w-4 ml-2" />
                قيد الإرسال ({sentTransfers.length})
              </TabsTrigger>
              <TabsTrigger value="received" className="text-base">
                <ArrowDown className="h-4 w-4 ml-2" />
                تم الاستلام ({receivedTransfers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send">
              <div className="space-y-4">
                {sentTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد عمليات إرسال قيد الانتظار</p>
                    <Button
                      onClick={() => setShowSendDialog(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      إرسال مخزون الآن
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العملية</TableHead>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">من</TableHead>
                        <TableHead className="text-right">إلى</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                          <TableCell>{getProductName(transfer.productId)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {formatNumber(transfer.quantity)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getBranchName(transfer.fromBranchId)}</TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {getBranchName(transfer.toBranchId)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(transfer.sentAt).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              قيد الإرسال
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(transfer.id)}
                                disabled={deleteMutation.isPending}
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
              </div>
            </TabsContent>

            <TabsContent value="received">
              <div className="space-y-4">
                {receivedTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد عمليات مستلمة</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العملية</TableHead>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">من</TableHead>
                        <TableHead className="text-right">إلى</TableHead>
                        <TableHead className="text-right">تاريخ الاستلام</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivedTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                          <TableCell>{getProductName(transfer.productId)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {formatNumber(transfer.quantity)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getBranchName(transfer.fromBranchId)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {getBranchName(transfer.toBranchId)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(transfer.receivedAt).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 ml-1" />
                              تم الاستلام
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              إرسال مخزون جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>الفرع المستلم *</Label>
              <Select
                value={sendForm.toBranchId}
                onValueChange={(value) => setSendForm({ ...sendForm, toBranchId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>المنتج *</Label>
              <Select
                value={sendForm.productId}
                onValueChange={(value) => setSendForm({ ...sendForm, productId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (متوفر: {formatNumber(product.quantity)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الكمية *</Label>
              <Input
                type="number"
                min="1"
                value={sendForm.quantity}
                onChange={(e) => setSendForm({ ...sendForm, quantity: e.target.value })}
                className="mt-1"
                placeholder="أدخل الكمية"
              />
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Input
                value={sendForm.notes}
                onChange={(e) => setSendForm({ ...sendForm, notes: e.target.value })}
                className="mt-1"
                placeholder="ملاحظات إضافية (اختياري)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 ml-2" />
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال المخزون'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSendDialog(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
