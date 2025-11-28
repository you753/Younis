import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, Eye, Edit, Trash2 } from 'lucide-react';
import SimplePurchaseReturnForm from '@/components/forms/SimplePurchaseReturnForm';
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

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/purchase-returns/${id}/status`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-returns'] });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const todayReturns = Array.isArray(purchaseReturns) ? purchaseReturns.filter((ret: any) => {
    if (!ret.created_at) return false;
    try {
      const today = new Date().toISOString().split('T')[0];
      const returnDate = new Date(ret.created_at).toISOString().split('T')[0];
      return returnDate === today;
    } catch (e) {
      return false;
    }
  }).length : 0;

  const totalReturnsValue = Array.isArray(purchaseReturns) ? purchaseReturns.reduce((sum: number, ret: any) => {
    return sum + parseFloat(ret.total || 0);
  }, 0) : 0;

  const pendingReturns = Array.isArray(purchaseReturns) ? purchaseReturns.filter((ret: any) => ret.status === 'pending').length : 0;

  const deleteReturnMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/purchase-returns/${id}`),
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
      {/* رأس الطباعة */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            background: white !important;
            color: black !important;
          }
          
          body { 
            margin: 0; 
            padding: 0;
            background: white !important;
            font-family: 'Arial', 'Tahoma', sans-serif;
          }
          
          .print\\:hidden { 
            display: none !important; 
          }
          
          .print\\:block { 
            display: block !important; 
          }
          
          table { 
            page-break-inside: auto;
            border-collapse: collapse;
            width: 100%;
            margin-top: 15px;
          }
          
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto;
          }
          
          thead { 
            display: table-header-group;
          }
          
          thead th {
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
            padding: 12px 8px !important;
            font-weight: bold;
            font-size: 13px;
          }
          
          tbody td {
            border: 1px solid black !important;
            padding: 10px 8px !important;
            font-size: 12px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* رأس التقرير للطباعة */}
      <div className="hidden print:block mb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">تقرير مرتجعات المشتريات</h1>
          <p className="text-sm text-gray-700">التاريخ: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="border border-black p-2">
            <span className="font-bold">إجمالي المرتجعات:</span> {Array.isArray(purchaseReturns) ? purchaseReturns.length : 0}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">القيمة الإجمالية:</span> {totalReturnsValue.toFixed(2)} ر.س
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">المرتجعات المعلقة:</span> {pendingReturns}
          </div>
        </div>
      </div>

      <div className="mb-6 print:hidden">
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
          
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مرتجع
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">مرتجعات اليوم</p>
                <p className="text-2xl font-bold text-orange-700">{todayReturns}</p>
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
                <p className="text-2xl font-bold text-red-700">{totalReturnsValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</p>
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
                <p className="text-2xl font-bold text-yellow-700">{pendingReturns}</p>
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
                        {returnItem.created_at ? (() => {
                          try {
                            return format(new Date(returnItem.created_at), 'yyyy-MM-dd');
                          } catch (e) {
                            return '-';
                          }
                        })() : '-'}
                      </TableCell>
                      <TableCell>مورد غير محدد</TableCell>
                      <TableCell>{returnItem.total} ر.س</TableCell>
                      <TableCell>{returnItem.reason}</TableCell>
                      <TableCell>
                        <Select
                          value={returnItem.status || 'pending'}
                          onValueChange={(value) => updateStatusMutation.mutate({ id: returnItem.id, status: value })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className={`w-32 ${
                            returnItem.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
                            returnItem.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                            'bg-yellow-50 border-yellow-200 text-yellow-800'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="approved">موافق عليه</SelectItem>
                            <SelectItem value="rejected">مرفوض</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(returnItem)}
                            data-testid={`button-edit-${returnItem.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(returnItem.id)}
                            data-testid={`button-delete-${returnItem.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
      {showForm && (
        <SimplePurchaseReturnForm
          onClose={() => {
            setShowForm(false);
            setEditingReturn(null);
          }}
          editingReturn={editingReturn}
        />
      )}
    </div>
  );
}