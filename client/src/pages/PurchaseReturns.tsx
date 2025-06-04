import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ArrowLeft, Eye, Edit, Trash2 } from 'lucide-react';
import PurchaseReturnFormComponent from '@/components/forms/PurchaseReturnForm';
import { format } from 'date-fns';

export default function PurchaseReturns() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('مرتجعات المشتريات');
  }, [setCurrentPage]);

  const { data: purchaseReturns = [], isLoading } = useQuery({
    queryKey: ['/api/purchase-returns'],
  });

  const deleteReturnMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/purchase-returns/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-returns'] });
      toast({
        title: "نجح",
        description: "تم حذف المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المرتجع",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (returnItem: any) => {
    setEditingReturn(returnItem);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المرتجع؟')) {
      deleteReturnMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setEditingReturn(null);
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ArrowLeft className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مرتجعات المشتريات</h2>
              <p className="text-gray-600">إدارة مرتجعات المشتريات والاسترداد من الموردين</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مرتجع
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">مرتجعات اليوم</p>
                <p className="text-2xl font-bold text-orange-700">0</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">قيمة المرتجعات</p>
                <p className="text-2xl font-bold text-red-700">0.00 ر.س</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">مرتجعات معلقة</p>
                <p className="text-2xl font-bold text-yellow-700">0</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة مرتجعات المشتريات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">رقم المرتجع</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المورد</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">السبب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(purchaseReturns) && purchaseReturns.length > 0 ? (
                  purchaseReturns.map((returnItem: any) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-medium">#{returnItem.returnNumber}</TableCell>
                      <TableCell>
                        {returnItem.createdAt ? format(new Date(returnItem.createdAt), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell>مورد غير محدد</TableCell>
                      <TableCell>{returnItem.total} ر.س</TableCell>
                      <TableCell>{returnItem.reason}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          returnItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                          returnItem.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          returnItem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {returnItem.status === 'completed' ? 'مكتمل' :
                           returnItem.status === 'approved' ? 'موافق عليه' :
                           returnItem.status === 'rejected' ? 'مرفوض' :
                           'قيد الانتظار'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(returnItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(returnItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد مرتجعات مشتريات حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Return Form */}
      <PurchaseReturnFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingReturn={editingReturn}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}