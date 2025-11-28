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
import { Plus, Trash2, Save, Package } from 'lucide-react';

// Schema for purchase return items
const purchaseReturnItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون صفر أو أكبر'),
  total: z.number().min(0),
});

// Schema for form validation
const purchaseReturnFormSchema = z.object({
  purchaseId: z.number().optional(),
  returnNumber: z.string().min(1, 'رقم المرتجع مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  reason: z.string().min(1, 'سبب الإرجاع مطلوب'),
  status: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseReturnItemSchema).optional(),
});

type PurchaseReturnForm = z.infer<typeof purchaseReturnFormSchema>;

interface PurchaseReturnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReturn?: any;
  onSuccess?: () => void;
}

export default function PurchaseReturnFormComponent({ 
  open, 
  onOpenChange, 
  editingReturn, 
  onSuccess 
}: PurchaseReturnFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const form = useForm<PurchaseReturnForm>({
    resolver: zodResolver(purchaseReturnFormSchema),
    defaultValues: {
      returnNumber: editingReturn?.returnNumber || `RET-${Date.now()}`,
      total: editingReturn?.total || '',
      reason: editingReturn?.reason || '',
      status: editingReturn?.status || 'pending',
      notes: editingReturn?.notes || '',
      items: editingReturn?.items || [],
      purchaseId: editingReturn?.purchaseId || undefined,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createReturnMutation = useMutation({
    mutationFn: (data: PurchaseReturnForm) => apiRequest('POST', '/api/purchase-returns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-returns'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة مرتجع المشتريات بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating purchase return:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة مرتجع المشتريات",
        variant: "destructive",
      });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PurchaseReturnForm> }) => 
      apiRequest('PUT', `/api/purchase-returns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-returns'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث مرتجع المشتريات بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating purchase return:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث مرتجع المشتريات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseReturnForm) => {
    // تأكد من إرسال الأصناف مع البيانات
    const submissionData = {
      ...data,
      items: itemFields.length > 0 ? itemFields.map((field, index) => ({
        productId: form.watch(`items.${index}.productId`) || 0,
        productName: form.watch(`items.${index}.productName`) || '',
        quantity: form.watch(`items.${index}.quantity`) || 1,
        unitPrice: form.watch(`items.${index}.unitPrice`) || 0,
        total: form.watch(`items.${index}.total`) || 0,
      })) : []
    };
    
    console.log('Submitting purchase return data:', submissionData);
    
    if (editingReturn) {
      updateReturnMutation.mutate({ id: editingReturn.id, data: submissionData });
    } else {
      createReturnMutation.mutate(submissionData);
    }
  };

  const addNewItem = () => {
    appendItem({
      productId: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  const calculateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitPrice = form.getValues(`items.${index}.unitPrice`);
    const total = quantity * unitPrice;
    form.setValue(`items.${index}.total`, total);
    calculateGrandTotal();
  };

  const calculateGrandTotal = () => {
    const items = form.getValues('items') || [];
    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    form.setValue('total', grandTotal.toFixed(2));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === parseInt(productId));
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.purchasePrice));
      calculateItemTotal(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingReturn ? 'تعديل مرتجع المشتريات' : 'إضافة مرتجع مشتريات جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="returnNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم المرتجع</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="رقم المرتجع" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>فاتورة المشتريات المرتبطة (اختياري)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فاتورة المشتريات" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchases.map((purchase: any) => (
                          <SelectItem key={purchase.id} value={purchase.id.toString()}>
                            فاتورة #{purchase.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبب الإرجاع</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="سبب إرجاع البضاعة" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="approved">موافق عليه</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">أصناف المرتجع</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  إضافة صنف
                </Button>
              </div>

              {itemFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">الصنف {index + 1}</h4>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                              {products.map((product: any) => (
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
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكمية</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseInt(e.target.value));
                                calculateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر الوحدة</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value));
                                calculateItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.total`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الإجمالي</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ الإجمالي (ر.س)</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-50 font-bold text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات إضافية</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ملاحظات حول المرتجع" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createReturnMutation.isPending || updateReturnMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingReturn ? 'تحديث المرتجع' : 'حفظ المرتجع'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}