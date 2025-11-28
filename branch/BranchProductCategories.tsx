import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Tag, Package, TrendingUp, AlertTriangle, Edit, Trash2, Search, Sparkles } from 'lucide-react';

interface BranchProductCategoriesProps {
  branchId: number;
}

export default function BranchProductCategories({ branchId }: BranchProductCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteCategory, setDeleteCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الفئات
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/product-categories', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/product-categories${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب المنتجات لحساب عدد المنتجات لكل فئة
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/products${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // إضافة/تعديل فئة
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCategory) {
        return apiRequest('PUT', `/api/product-categories/${editingCategory.id}`, data);
      }
      return apiRequest('POST', '/api/product-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      toast({
        title: "نجح ✓",
        description: editingCategory ? "تم تحديث الفئة بنجاح" : "تم إضافة الفئة بنجاح",
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الفئة",
        variant: "destructive",
      });
    },
  });

  // حذف فئة
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/product-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      toast({
        title: "تم الحذف ✓",
        description: `تم حذف الفئة "${deleteCategory?.name}" بنجاح`,
      });
      setDeleteCategory(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفئة",
        variant: "destructive",
      });
    },
  });

  // معالجة الإرسال
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      isActive: true,
      status: 'active',
      branchId: branchId // إضافة رقم الفرع
    });
  };

  // إغلاق النافذة
  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  // فتح نافذة التعديل
  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowAddDialog(true);
  };

  // حساب عدد المنتجات لكل فئة
  const getCategoryProductCount = (categoryName: string) => {
    return products.filter((p: any) => p.category === categoryName).length;
  };

  // تصفية الفئات
  const filteredCategories = categories.filter((cat: any) => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // الإحصائيات
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c: any) => c.isActive).length;
  const totalProducts = products.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">فئات الأصناف</h1>
            <p className="text-gray-500 text-sm">إدارة وتنظيم فئات المنتجات</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg"
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4 ml-2" />
          فئة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الفئات</p>
                <p className="text-2xl font-bold text-purple-600">{totalCategories}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الفئات النشطة</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="البحث في الفئات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          data-testid="input-search-categories"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد فئات</h3>
            <p className="text-gray-500 mb-4">ابدأ بإضافة فئة جديدة لتنظيم منتجاتك</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة فئة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category: any) => {
            const productCount = getCategoryProductCount(category.name);
            
            return (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200"
                data-testid={`card-category-${category.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Tag className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {category.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          {category.description || 'بدون وصف'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                      className={category.isActive ? "bg-green-100 text-green-700" : ""}
                    >
                      {category.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Product Count */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {productCount} منتج
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEdit(category)}
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      data-testid={`button-edit-${category.id}`}
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      onClick={() => setDeleteCategory(category)}
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                      data-testid={`button-delete-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                اسم الفئة *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: إلكترونيات"
                required
                data-testid="input-category-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                الوصف
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للفئة"
                data-testid="input-category-description"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={saveMutation.isPending}
                data-testid="button-submit-category"
              >
                {saveMutation.isPending ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">تأكيد الحذف</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-900 mb-2">الفئة المراد حذفها:</p>
                <p className="text-gray-700">• {deleteCategory?.name}</p>
                {deleteCategory && getCategoryProductCount(deleteCategory.name) > 0 && (
                  <p className="text-red-600 mt-2">
                    ⚠️ تحتوي على {getCategoryProductCount(deleteCategory.name)} منتج
                  </p>
                )}
              </div>
              <p className="text-gray-600">
                هل أنت متأكد من حذف هذه الفئة؟ سيتم إلغاء ربط جميع المنتجات بها.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
