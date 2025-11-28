import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Eye, Edit, Trash2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for form validation
const categoryFormSchema = z.object({
  name: z.string().min(2, 'اسم الفئة يجب أن يكون على الأقل حرفين'),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryForm = z.infer<typeof categoryFormSchema>;

export default function ProductCategories() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('فئات الأصناف');
  }, [setCurrentPage]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/product-categories'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const response = await apiRequest('POST', '/api/product-categories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم إضافة الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CategoryForm> }) => {
      const response = await apiRequest('PUT', `/api/product-categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      setEditingCategory(null);
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم تحديث الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الفئة",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/product-categories/${id}`);
      if (response.status === 204) {
        return { success: true };
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-categories'] });
      toast({
        title: "نجح",
        description: "تم حذف الفئة بنجاح",
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الفئة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      code: category.code || '',
      description: category.description || '',
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    console.log('Delete button clicked for category ID:', id);
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      console.log('User confirmed deletion, calling mutation...');
      deleteCategoryMutation.mutate(id);
    } else {
      console.log('User cancelled deletion');
    }
  };

  const getCategoryProductCount = (categoryName: string) => {
    return Array.isArray(products) ? 
      products.filter((product: any) => product.category === categoryName).length : 0;
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FolderOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">فئات الأصناف</h2>
              <p className="text-gray-600">إدارة وتصنيف فئات المنتجات</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة فئة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">إجمالي الفئات</p>
                <p className="text-2xl font-bold text-indigo-700">{Array.isArray(categories) ? categories.length : 0}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">{Array.isArray(products) ? products.length : 0}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">فئات نشطة</p>
                <p className="text-2xl font-bold text-green-700">
                  {Array.isArray(categories) ? categories.filter((cat: any) => cat.isActive).length : 0}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة فئات الأصناف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">كود الفئة</TableHead>
                  <TableHead className="text-right">اسم الفئة</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">عدد المنتجات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-right">{category.code || 'غير محدد'}</TableCell>
                      <TableCell className="text-right font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">{category.description || 'لا يوجد وصف'}</TableCell>
                      <TableCell className="text-right">{getCategoryProductCount(category.name)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد فئات أصناف حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingCategory(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">اسم الفئة *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم الفئة" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">كود الفئة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل كود الفئة (اختياري)" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="أدخل وصف الفئة (اختياري)" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>الحالة</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        تفعيل أو إلغاء تفعيل الفئة
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 ml-1" />
                  {editingCategory ? 'تحديث' : 'إضافة'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}