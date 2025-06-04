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

// Schema for purchase items
const purchaseItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون صفر أو أكبر'),
  total: z.number().min(0),
});

// Schema for form validation
const purchaseFormSchema = z.object({
  supplierId: z.number().optional(),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).optional(),
});

type PurchaseForm = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPurchase?: any;
  onSuccess?: () => void;
}

export default function PurchaseFormComponent({ open, onOpenChange, editingPurchase, onSuccess }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      total: editingPurchase?.total || '',
      notes: editingPurchase?.notes || '',
      items: editingPurchase?.items || [],
      supplierId: editingPurchase?.supplierId || undefined,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (data: PurchaseForm) => apiRequest({
      url: '/api/purchases',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة المشتريات بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating purchase:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المشتريات",
        variant: "destructive",
      });
    },
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PurchaseForm> }) => 
      apiRequest({
        url: `/api/purchases/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث المشتريات بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating purchase:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المشتريات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseForm) => {
    if (editingPurchase) {
      updatePurchaseMutation.mutate({ id: editingPurchase.id, data });
    } else {
      createPurchaseMutation.mutate(data);
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
    const quantity = form.watch(`items.${index}.quantity`);
    const unitPrice = form.watch(`items.${index}.unitPrice`);
    const total = quantity * unitPrice;
    form.setValue(`items.${index}.total`, total);
    calculateGrandTotal();
  };

  const calculateGrandTotal = () => {
    const items = form.watch('items') || [];
    const grandTotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    form.setValue('total', grandTotal.toFixed(2));
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = Array.isArray(products) ? products.find((p: any) => p.id === productId) : null;
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
          <DialogTitle>
            {editingPurchase ? 'تعديل فاتورة المشتريات' : 'إضافة فاتورة مشتريات جديدة'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المورد</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
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
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ الإجمالي</FormLabel>
                    <FormControl>
                      <Input placeholder="المبلغ الإجمالي" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">أصناف المشتريات</h3>
                <Button type="button" onClick={addNewItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صنف
                </Button>
              </div>

              {itemFields.length > 0 && (
                <div className="border rounded-lg p-4 space-y-4">
                  {itemFields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المنتج</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const productId = parseInt(value);
                                field.onChange(productId);
                                handleProductChange(index, productId);
                              }}
                              value={field.value?.toString() || ''}
                            >
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
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الكمية</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="الكمية"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value) || 0);
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
                                placeholder="السعر"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0);
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
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="الإجمالي"
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل أي ملاحظات إضافية"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createPurchaseMutation.isPending || updatePurchaseMutation.isPending}
              >
                <Save className="h-4 w-4 ml-2" />
                {editingPurchase ? 'تحديث المشتريات' : 'إضافة المشتريات'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}