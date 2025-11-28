import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, Eye, CheckCircle, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import SalesReturnFormComponent from '@/components/forms/SalesReturnForm';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';



export default function SalesReturns() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [returnToDelete, setReturnToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation for approving/rejecting sales returns
  const updateReturnStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/sales-returns/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المرتجع",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (id: number, status: string) => {
    updateReturnStatusMutation.mutate({ id, status });
  };

  // Delete mutation
  const deleteReturnMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/sales-returns/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      setShowDeleteDialog(false);
      setReturnToDelete(null);
      setIsDeleting(false);
      toast({
        title: "✓ تم الحذف بنجاح",
        description: returnToDelete ? `تم حذف المرتجع "${returnToDelete.returnNumber}" من القائمة` : "تم حذف المرتجع بنجاح",
      });
    },
    onError: () => {
      setIsDeleting(false);
      toast({
        title: "خطأ",
        description: "فشل في حذف المرتجع",
        variant: "destructive",
      });
    },
  });

  // Handle edit - open form with selected return
  const handleEdit = (returnItem: any) => {
    setEditingReturn(returnItem);
    setShowForm(true);
  };

  // Confirm delete - show alert dialog
  const confirmDelete = (returnItem: any) => {
    setReturnToDelete(returnItem);
    setShowDeleteDialog(true);
  };

  // Handle delete - execute deletion
  const handleDelete = () => {
    if (returnToDelete) {
      setIsDeleting(true);
      deleteReturnMutation.mutate(returnToDelete.id);
    }
  };

  useEffect(() => {
    setCurrentPage('مرتجعات المبيعات');
  }, [setCurrentPage]);

  // Fetch sales returns data
  const { data: salesReturns = [], isLoading } = useQuery({
    queryKey: ['/api/sales-returns'],
  });

  // Fetch clients data for name lookup
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch sales data for client lookup
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });


  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      approved: { label: 'موافق عليه', variant: 'default' as const },
      completed: { label: 'مكتمل', variant: 'default' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const handleFormSuccess = () => {
    setEditingReturn(null);
    setShowForm(false);
  };

  // Handle form close - clear editing return
  const handleFormClose = (open: boolean) => {
    setShowForm(open);
    if (!open) {
      setEditingReturn(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowLeft className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مرتجعات المبيعات</h2>
              <p className="text-gray-600">إدارة مرتجعات المبيعات والاسترداد</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مرتجع
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">إجمالي المرتجعات</p>
                <p className="text-2xl font-bold text-red-700">{Array.isArray(salesReturns) ? salesReturns.length : 0}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">قيمة المرتجعات</p>
                <p className="text-2xl font-bold text-orange-700">
                  {Array.isArray(salesReturns) 
                    ? salesReturns.reduce((sum: number, ret: any) => sum + parseFloat(ret.total || 0), 0).toFixed(2)
                    : '0.00'} ر.س
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">مرتجعات معلقة</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {Array.isArray(salesReturns) 
                    ? salesReturns.filter((ret: any) => ret.status === 'pending').length 
                    : 0}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة مرتجعات المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">رقم المرتجع</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">السبب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد مرتجعات مبيعات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  salesReturns.map((returnItem: any) => {
                    // البحث عن الفاتورة الأصلية للحصول على العميل
                    const originalSale = sales.find((sale: any) => sale.id === returnItem.saleId);
                    const client = clients.find((c: any) => c.id === originalSale?.clientId);
                    const clientName = client?.name || 'عميل غير محدد';
                    
                    return (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">#{returnItem.returnNumber || returnItem.id}</TableCell>
                        <TableCell>{new Date(returnItem.createdAt || new Date()).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{clientName}</TableCell>
                        <TableCell>{parseFloat(returnItem.total || 0).toFixed(2)} ر.س</TableCell>
                        <TableCell>
                          {returnItem.reason === 'wrong_item' ? 'صنف خطأ' : 
                           returnItem.reason === 'damaged' ? 'تالف' : 
                           returnItem.reason === 'defective' ? 'معيوب' : 
                           returnItem.reason || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            returnItem.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : returnItem.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {returnItem.status === 'approved' 
                              ? 'مُعتمد' 
                              : returnItem.status === 'rejected' 
                                ? 'مرفوض'
                                : 'معلق'
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select 
                              value={returnItem.status || 'pending'}
                              onValueChange={(value) => handleStatusChange(returnItem.id, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">معلق</SelectItem>
                                <SelectItem value="approved">موافق عليه</SelectItem>
                                <SelectItem value="rejected">مرفوض</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                            onClick={() => handleEdit(returnItem)}
                            title="تعديل المرتجع"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            تعديل
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                            onClick={() => confirmDelete(returnItem)}
                            title="حذف المرتجع"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            حذف
                          </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sales Return Form */}
      <SalesReturnFormComponent
        open={showForm}
        onOpenChange={handleFormClose}
        editingReturn={editingReturn}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">تأكيد حذف المرتجع</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 pr-2">
              {returnToDelete && (
                <div className="space-y-3">
                  <p>هل أنت متأكد من حذف المرتجع التالي؟</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      {returnToDelete.returnNumber || `مرتجع #${returnToDelete.id}`}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <strong>التاريخ:</strong> {new Date(returnToDelete.createdAt || new Date()).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-green-600 font-semibold">
                        <strong>المبلغ:</strong> {parseFloat(returnToDelete.total || 0).toFixed(2)} ر.س
                      </p>
                      <p className="text-blue-600 font-semibold">
                        <strong>السبب:</strong> {
                          returnToDelete.reason === 'wrong_item' ? 'صنف خطأ' : 
                          returnToDelete.reason === 'damaged' ? 'تالف' : 
                          returnToDelete.reason === 'defective' ? 'معيوب' : 
                          returnToDelete.reason || 'غير محدد'
                        }
                      </p>
                      <p className={`font-semibold ${
                        returnToDelete.status === 'approved' ? 'text-green-600' : 
                        returnToDelete.status === 'rejected' ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        <strong>الحالة:</strong> {
                          returnToDelete.status === 'approved' ? 'مُعتمد' : 
                          returnToDelete.status === 'rejected' ? 'مرفوض' : 
                          'معلق'
                        }
                      </p>
                    </div>
                  </div>
                  <p className="text-red-600 font-medium">
                    ⚠️ سيتم حذف المرتجع نهائياً من السجلات!
                  </p>
                  <p className="text-red-600 font-medium">
                    هذا الإجراء لا يمكن التراجع عنه!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel 
              className="flex-1"
              disabled={isDeleting}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="ml-2">جاري الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف نهائي
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}