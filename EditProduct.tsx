import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  code: z.string().min(1, 'كود المنتج مطلوب'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'فئة المنتج مطلوبة'),
  description: z.string().optional(),
  purchasePrice: z.string().min(1, 'سعر الشراء مطلوب'),
  salePrice: z.string().min(1, 'سعر البيع مطلوب'),
  quantity: z.string().min(1, 'الكمية مطلوبة'),
  minQuantity: z.string().min(1, 'الحد الأدنى مطلوب'),
  unit: z.string().min(1, 'وحدة القياس مطلوبة'),
  supplier: z.string().optional(),
  status: z.string().default('active'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProduct() {
  const [location, setLocation] = useLocation();
  const productId = parseInt(location.split('/')[3]); // Extract ID from /products/edit/:id
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب بيانات المنتج للتعديل
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: () => fetch(`/api/products/${productId}`).then(res => res.json()),
    enabled: !!productId,
  });

  // جلب فئات المنتجات
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/product-categories'],
    queryFn: () => fetch('/api/product-categories').then(res => res.json()),
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      code: '',
      barcode: '',
      category: '',
      description: '',
      purchasePrice: '',
      salePrice: '',
      quantity: '',
      minQuantity: '',
      unit: 'قطعة',
      supplier: '',
      status: 'active',
    },
  });

  // تحديث القيم عند تحميل البيانات
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        code: product.code || '',
        barcode: product.barcode || '',
        category: product.category || '',
        description: product.description || '',
        purchasePrice: product.purchasePrice?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        quantity: product.quantity?.toString() || '',
        minQuantity: product.minQuantity?.toString() || '',
        unit: product.unit || 'قطعة',
        supplier: product.supplier || '',
        status: product.status || 'active',
      });
    }
  }, [product, form]);

  // تحديث المنتج
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          purchasePrice: parseFloat(data.purchasePrice),
          salePrice: parseFloat(data.salePrice),
          quantity: parseInt(data.quantity),
          minQuantity: parseInt(data.minQuantity),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تحديث المنتج');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المنتج بنجاح",
      });
      
      // التحقق من المرجع (من أين جاء المستخدم)
      const referrer = document.referrer;
      console.log('Referrer:', referrer);
      console.log('Current path:', window.location.pathname);
      
      if (referrer && referrer.includes('/standalone-branch/')) {
        // إذا جاء من نظام الفروع، نعود له
        console.log('Came from branch system, going back');
        // استخراج معرف الفرع من الـ referrer
        const branchMatch = referrer.match(/\/standalone-branch\/(\d+)/);
        if (branchMatch) {
          const branchId = branchMatch[1];
          setLocation(`/standalone-branch/${branchId}`);
        } else {
          window.history.back();
        }
      } else {
        // إذا جاء من النظام الرئيسي
        console.log('Came from main system, going to /products');
        setLocation('/products');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateProductMutation.mutate(data);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>جاري تحميل بيانات المنتج...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">المنتج غير موجود</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على المنتج المطلوب</p>
          <Button onClick={() => {
            const referrer = document.referrer;
            if (referrer && referrer.includes('/standalone-branch/')) {
              const branchMatch = referrer.match(/\/standalone-branch\/(\d+)/);
              if (branchMatch) {
                const branchId = branchMatch[1];
                setLocation(`/standalone-branch/${branchId}`);
              } else {
                window.history.back();
              }
            } else {
              setLocation('/products');
            }
          }}>
            العودة لقائمة المنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              const referrer = document.referrer;
              if (referrer && referrer.includes('/standalone-branch/')) {
                const branchMatch = referrer.match(/\/standalone-branch\/(\d+)/);
                if (branchMatch) {
                  const branchId = branchMatch[1];
                  setLocation(`/standalone-branch/${branchId}`);
                } else {
                  window.history.back();
                }
              } else {
                setLocation('/products');
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة لقائمة المنتجات
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">تعديل المنتج: {product.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المنتج</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* اسم المنتج */}
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="أدخل اسم المنتج"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* كود المنتج */}
              <div className="space-y-2">
                <Label htmlFor="code">كود المنتج *</Label>
                <Input
                  id="code"
                  {...form.register('code')}
                  placeholder="أدخل كود المنتج"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-600">{form.formState.errors.code.message}</p>
                )}
              </div>

              {/* الباركود */}
              <div className="space-y-2">
                <Label htmlFor="barcode">الباركود</Label>
                <Input
                  id="barcode"
                  {...form.register('barcode')}
                  placeholder="أدخل الباركود (اختياري)"
                />
              </div>

              {/* فئة المنتج */}
              <div className="space-y-2">
                <Label htmlFor="category">فئة المنتج *</Label>
                <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>

              {/* سعر الشراء */}
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">سعر الشراء (ر.س) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...form.register('purchasePrice')}
                  placeholder="0.00"
                />
                {form.formState.errors.purchasePrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.purchasePrice.message}</p>
                )}
              </div>

              {/* سعر البيع */}
              <div className="space-y-2">
                <Label htmlFor="salePrice">سعر البيع (ر.س) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  {...form.register('salePrice')}
                  placeholder="0.00"
                />
                {form.formState.errors.salePrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.salePrice.message}</p>
                )}
              </div>

              {/* الكمية */}
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية الحالية *</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...form.register('quantity')}
                  placeholder="0"
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                )}
              </div>

              {/* الحد الأدنى */}
              <div className="space-y-2">
                <Label htmlFor="minQuantity">الحد الأدنى للكمية *</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  {...form.register('minQuantity')}
                  placeholder="1"
                />
                {form.formState.errors.minQuantity && (
                  <p className="text-sm text-red-600">{form.formState.errors.minQuantity.message}</p>
                )}
              </div>

              {/* وحدة القياس */}
              <div className="space-y-2">
                <Label htmlFor="unit">وحدة القياس *</Label>
                <Select value={form.watch('unit')} onValueChange={(value) => form.setValue('unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر وحدة القياس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قطعة">قطعة</SelectItem>
                    <SelectItem value="كيلو">كيلو</SelectItem>
                    <SelectItem value="جرام">جرام</SelectItem>
                    <SelectItem value="لتر">لتر</SelectItem>
                    <SelectItem value="متر">متر</SelectItem>
                    <SelectItem value="علبة">علبة</SelectItem>
                    <SelectItem value="كرتون">كرتون</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.unit && (
                  <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
                )}
              </div>

              {/* المورد */}
              <div className="space-y-2">
                <Label htmlFor="supplier">المورد</Label>
                <Input
                  id="supplier"
                  {...form.register('supplier')}
                  placeholder="اسم المورد (اختياري)"
                />
              </div>
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="وصف المنتج (اختياري)"
                rows={3}
              />
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateProductMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateProductMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const referrer = document.referrer;
                  if (referrer && referrer.includes('/standalone-branch/')) {
                    const branchMatch = referrer.match(/\/standalone-branch\/(\d+)/);
                    if (branchMatch) {
                      const branchId = branchMatch[1];
                      setLocation(`/standalone-branch/${branchId}`);
                    } else {
                      window.history.back();
                    }
                  } else {
                    setLocation('/products');
                  }
                }}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}