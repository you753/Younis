import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, Package, AlertTriangle, CheckCircle } from 'lucide-react';

// Schema for inventory count items
const inventoryCountItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  currentQuantity: z.number().min(0),
  countedQuantity: z.number().min(0, 'الكمية المعدودة يجب أن تكون صفر أو أكبر'),
  difference: z.number(),
  notes: z.string().optional(),
});

// Schema for form validation
const inventoryCountFormSchema = z.object({
  countNumber: z.string().min(1, 'رقم الجرد مطلوب'),
  countDate: z.string().min(1, 'تاريخ الجرد مطلوب'),
  countedBy: z.string().min(1, 'اسم القائم بالجرد مطلوب'),
  status: z.string().default('in_progress'),
  notes: z.string().optional(),
  items: z.array(inventoryCountItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
});

type InventoryCountForm = z.infer<typeof inventoryCountFormSchema>;

interface InventoryCountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCount?: any;
  onSuccess?: () => void;
}

export default function InventoryCountFormComponent({ 
  open, 
  onOpenChange, 
  editingCount, 
  onSuccess 
}: InventoryCountFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const form = useForm<InventoryCountForm>({
    resolver: zodResolver(inventoryCountFormSchema),
    defaultValues: {
      countNumber: editingCount?.countNumber || `INV-${Date.now()}`,
      countDate: editingCount?.countDate || new Date().toISOString().split('T')[0],
      countedBy: editingCount?.countedBy || '',
      status: editingCount?.status || 'in_progress',
      notes: editingCount?.notes || '',
      items: editingCount?.items || [],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createCountMutation = useMutation({
    mutationFn: (data: InventoryCountForm) => apiRequest({
      url: '/api/inventory-counts',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إنشاء جرد المخزون بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating inventory count:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء جرد المخزون",
        variant: "destructive",
      });
    },
  });

  const updateCountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InventoryCountForm> }) => 
      apiRequest({
        url: `/api/inventory-counts/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث جرد المخزون بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating inventory count:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث جرد المخزون",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryCountForm) => {
    if (editingCount) {
      updateCountMutation.mutate({ id: editingCount.id, data });
    } else {
      createCountMutation.mutate(data);
    }
  };

  const addNewItem = () => {
    appendItem({
      productId: 0,
      productName: '',
      currentQuantity: 0,
      countedQuantity: 0,
      difference: 0,
      notes: '',
    });
  };

  const calculateDifference = (index: number) => {
    const currentQuantity = form.getValues(`items.${index}.currentQuantity`);
    const countedQuantity = form.getValues(`items.${index}.countedQuantity`);
    const difference = countedQuantity - currentQuantity;
    form.setValue(`items.${index}.difference`, difference);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = Array.isArray(products) ? products.find((p: any) => p.id === parseInt(productId)) : null;
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.currentQuantity`, product.quantity || 0);
      calculateDifference(index);
    }
  };

  const addAllProducts = () => {
    if (Array.isArray(products)) {
      products.forEach((product: any) => {
        appendItem({
          productId: product.id,
          productName: product.name,
          currentQuantity: product.quantity || 0,
          countedQuantity: product.quantity || 0,
          difference: 0,
          notes: '',
        });
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingCount ? 'تعديل جرد المخزون' : 'بدء جرد مخزون جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="countNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الجرد</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="رقم جرد المخزون" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الجرد</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القائم بالجرد</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="اسم الشخص القائم بالجرد" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الجرد</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة الجرد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات عامة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ملاحظات حول عملية الجرد" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">منتجات الجرد</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllProducts}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    إضافة جميع المنتجات
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة منتج
                  </Button>
                </div>
              </div>

              {itemFields.map((field, index) => {
                const difference = form.watch(`items.${index}.difference`);
                const isDifferent = Math.abs(difference) > 0;
                
                return (
                  <div key={field.id} className={`border rounded-lg p-4 space-y-4 ${
                    isDifferent ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">المنتج {index + 1}</h4>
                        {isDifferent && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">اختلاف في الكمية</span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المنتج</FormLabel>
                            <Select onValueChange={(value) => handleProductSelect(index, value)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المنتج" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(products) && products.map((product: any) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.currentQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الكمية الحالية</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.countedQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الكمية المعدودة</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value) || 0);
                                  calculateDifference(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.difference`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الفرق</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                readOnly 
                                className={`bg-gray-50 font-medium ${
                                  difference > 0 ? 'text-green-600' : 
                                  difference < 0 ? 'text-red-600' : 
                                  'text-gray-600'
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>ملاحظات</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ملاحظات خاصة بهذا المنتج" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}

              {itemFields.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">لم يتم إضافة أي منتجات للجرد بعد</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة أول منتج
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createCountMutation.isPending || updateCountMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingCount ? 'تحديث الجرد' : 'حفظ الجرد'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}