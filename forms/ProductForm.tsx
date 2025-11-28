import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { insertProductSchema, type InsertProduct, type Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ScanBarcode } from 'lucide-react';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProductFormProps {
  productId?: number | null;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch product data if editing
  const { data: productData, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!productId
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: '',
      code: '',
      barcode: '',
      description: '',
      category: '',
      purchasePrice: '0',
      salePrice: '0',
      quantity: 0,
      minQuantity: 0
    }
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (productData) {
      form.reset({
        name: productData.name || '',
        code: productData.code || '',
        barcode: productData.barcode || '',
        description: productData.description || '',
        category: productData.category || '',
        purchasePrice: productData.purchasePrice || '0',
        salePrice: productData.salePrice || '0',
        quantity: productData.quantity || 0,
        minQuantity: productData.minQuantity || 0
      });
    }
  }, [productData, form]);

  // Update form when product data is loaded
  useEffect(() => {
    if (productData && productId) {
      form.reset({
        name: productData.name || '',
        code: productData.code || '',
        barcode: productData.barcode || '',
        description: productData.description || '',
        category: productData.category || '',
        purchasePrice: productData.purchasePrice || '0',
        salePrice: productData.salePrice || '0',
        quantity: productData.quantity || 0,
        minQuantity: productData.minQuantity || 0
      });
    }
  }, [productData, productId, form]);

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest('POST', '/api/products', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إضافة الصنف');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('تم إضافة الصنف بنجاح');
      form.reset();
      setLocation('/products');
    },
    onError: (err: Error) => {
      console.error('Product creation error:', err);
      if (err.message.includes('كود الصنف موجود بالفعل')) {
        form.setError('code', { 
          type: 'manual', 
          message: 'كود الصنف موجود بالفعل، يرجى استخدام كود آخر' 
        });
      } else if (err.message.includes('الباركود موجود بالفعل')) {
        form.setError('barcode', { 
          type: 'manual', 
          message: 'الباركود موجود بالفعل، يرجى استخدام باركود آخر' 
        });
      }
      error(err.message || 'حدث خطأ أثناء إضافة الصنف');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest('PUT', `/api/products/${productId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('تم تحديث الصنف بنجاح');
      setLocation('/products');
    },
    onError: () => {
      error('حدث خطأ أثناء تحديث الصنف');
    }
  });

  const onSubmit = (data: InsertProduct) => {
    // Clear previous errors
    form.clearErrors();
    
    if (productId) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  if (isLoadingProduct && productId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {productId ? 'تعديل الصنف' : 'إضافة صنف جديد'}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الصنف *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الصنف" {...field} />
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
                  <FormLabel>الكود أو الرقم المرجعي *</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الصنف (مطلوب)" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ScanBarcode className="h-4 w-4" />
                    الباركود
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ادخل الباركود أو امسحه" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الشراء *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر البيع *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكمية الابتدائية</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحد الأدنى للكمية</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>التصنيف</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electronics">إلكترونيات</SelectItem>
                      <SelectItem value="clothing">ملابس</SelectItem>
                      <SelectItem value="food">مواد غذائية</SelectItem>
                      <SelectItem value="books">كتب</SelectItem>
                      <SelectItem value="household">منزلية</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وصف الصنف</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="وصف تفصيلي للصنف"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              className="btn-accounting-primary"
            >
              <Package className="ml-2 h-4 w-4" />
              {(createProductMutation.isPending || updateProductMutation.isPending) ? 'جاري الحفظ...' : (productId ? 'تحديث الصنف' : 'حفظ الصنف')}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation('/products')}
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
