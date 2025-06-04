import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Package, CheckCircle, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import InventoryCountFormComponent from '@/components/forms/InventoryCountForm';
import { format } from 'date-fns';

export default function InventoryCount() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCount, setEditingCount] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('جرد المخزون');
  }, [setCurrentPage]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: inventoryCounts = [] } = useQuery({
    queryKey: ['/api/inventory-counts'],
  });

  const deleteCountMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/inventory-counts/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-counts'] });
      toast({
        title: "نجح",
        description: "تم حذف الجرد بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الجرد",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (count: any) => {
    setEditingCount(count);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الجرد؟')) {
      deleteCountMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setEditingCount(null);
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
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">جرد المخزون</h2>
              <p className="text-gray-600">عد وتحديث كميات المنتجات في المخزون</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            بدء جرد جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">{Array.isArray(products) ? products.length : 0}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">تم جردها</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">تحتاج جرد</p>
                <p className="text-2xl font-bold text-yellow-700">{Array.isArray(products) ? products.length : 0}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">قيمة المخزون</p>
                <p className="text-2xl font-bold text-purple-700">0.00 ر.س</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">جرد المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">كود المنتج</TableHead>
                  <TableHead className="text-right">اسم المنتج</TableHead>
                  <TableHead className="text-right">الكمية الحالية</TableHead>
                  <TableHead className="text-right">الكمية الفعلية</TableHead>
                  <TableHead className="text-right">الفرق</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(products) && products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد منتجات للجرد حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(products) && products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code || `P${product.id}`}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity || 0}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="w-20" 
                          placeholder="0" 
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-yellow-600">--</span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          غير مجرود
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Count Form */}
      <InventoryCountFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingCount={editingCount}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}