import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ShoppingCart, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react';
import PurchaseFormComponent from '@/components/forms/PurchaseForm';
import { format } from 'date-fns';

export default function Purchases() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('المشتريات');
  }, [setCurrentPage]);

  // Fetch data
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/purchases/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      toast({
        title: "نجح",
        description: "تم حذف المشتريات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المشتريات",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (purchase: any) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف فاتورة المشتريات؟')) {
      deletePurchaseMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setEditingPurchase(null);
    setShowForm(false);
  };

  if (isLoading) return <div className="p-6">جاري تحميل البيانات...</div>;

  // Calculate stats
  const totalPurchases = Array.isArray(purchases) ? purchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0) : 0;
  const monthlyPurchases = Array.isArray(purchases) ? purchases.filter((purchase: any) => {
    const purchaseDate = new Date(purchase.createdAt);
    const currentDate = new Date();
    return purchaseDate.getMonth() === currentDate.getMonth() && 
           purchaseDate.getFullYear() === currentDate.getFullYear();
  }) : [];

  const averageOrderValue = Array.isArray(purchases) && purchases.length > 0 ? totalPurchases / purchases.length : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">المشتريات</h1>
          <p className="text-muted-foreground">إدارة فواتير المشتريات والموردين</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة فاتورة مشتريات
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-blue-700">{totalPurchases.toFixed(2)} ر.س</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">عدد الفواتير</p>
                <p className="text-2xl font-bold text-green-700">{Array.isArray(purchases) ? purchases.length : 0}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">مشتريات هذا الشهر</p>
                <p className="text-2xl font-bold text-purple-700">{monthlyPurchases.length}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">متوسط قيمة الفاتورة</p>
                <p className="text-2xl font-bold text-orange-700">{averageOrderValue.toFixed(2)} ر.س</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة فواتير المشتريات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>ملاحظات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(purchases) && purchases.length > 0 ? (
                purchases.map((purchase: any) => {
                  const supplier = Array.isArray(suppliers) ? suppliers.find((s: any) => s.id === purchase.supplierId) : null;
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">#{purchase.id}</TableCell>
                      <TableCell>{supplier?.name || 'غير محدد'}</TableCell>
                      <TableCell>{purchase.total} ر.س</TableCell>
                      <TableCell>
                        {purchase.createdAt ? format(new Date(purchase.createdAt), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell>{purchase.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(purchase)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد فواتير مشتريات حتى الآن
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purchase Form */}
      <PurchaseFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingPurchase={editingPurchase}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}