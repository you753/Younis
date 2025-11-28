import { useState, useEffect } from 'react';
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
import { Plus, Trash2, Save, FileText } from 'lucide-react';

// Schema for quote items
const quoteItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون صفر أو أكبر'),
  total: z.number().min(0),
});

// Schema for form validation
const quoteFormSchema = z.object({
  clientId: z.number().optional(),
  quoteNumber: z.string().min(1, 'رقم العرض مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  tax: z.string().optional(),
  discount: z.string().optional(),
  status: z.string().default('pending'),
  validUntil: z.string().min(1, 'تاريخ انتهاء الصلاحية مطلوب'),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).optional(),
});

type QuoteForm = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingQuote?: any;
  onSuccess?: () => void;
}

export default function QuoteFormComponent({ 
  open, 
  onOpenChange, 
  editingQuote, 
  onSuccess 
}: QuoteFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const form = useForm<QuoteForm>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      quoteNumber: editingQuote?.quoteNumber || `QT-${Date.now()}`,
      total: editingQuote?.total || '',
      tax: editingQuote?.tax || '0',
      discount: editingQuote?.discount || '0',
      status: editingQuote?.status || 'pending',
      validUntil: editingQuote?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: editingQuote?.notes || '',
      items: editingQuote?.items || [],
      clientId: editingQuote?.clientId || undefined,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Update form when editingQuote changes
  useEffect(() => {
    if (editingQuote && open) {
      const items = editingQuote.items ? 
        (typeof editingQuote.items === 'string' ? JSON.parse(editingQuote.items) : editingQuote.items) 
        : [];
      
      form.reset({
        quoteNumber: editingQuote.quoteNumber || '',
        total: editingQuote.total || '',
        tax: editingQuote.tax || '0',
        discount: editingQuote.discount || '0',
        status: editingQuote.status || 'pending',
        validUntil: editingQuote.validUntil ? new Date(editingQuote.validUntil).toISOString().split('T')[0] : '',
        notes: editingQuote.notes || '',
        items: items,
        clientId: editingQuote.clientId || undefined,
      });
    } else if (!editingQuote && open) {
      form.reset({
        quoteNumber: `QT-${Date.now()}`,
        total: '',
        tax: '0',
        discount: '0',
        status: 'pending',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        items: [],
        clientId: undefined,
      });
    }
  }, [editingQuote, open, form]);

  const createQuoteMutation = useMutation({
    mutationFn: (data: QuoteForm) => apiRequest({
      url: '/api/quotes',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة عرض السعر بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating quote:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة عرض السعر",
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuoteForm> }) => 
      apiRequest({
        url: `/api/quotes/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث عرض السعر بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating quote:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث عرض السعر",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteForm) => {
    if (editingQuote) {
      updateQuoteMutation.mutate({ id: editingQuote.id, data });
    } else {
      createQuoteMutation.mutate(data);
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
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = parseFloat(form.getValues('tax') || '0');
    const discount = parseFloat(form.getValues('discount') || '0');
    const grandTotal = subtotal + tax - discount;
    form.setValue('total', grandTotal.toFixed(2));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = Array.isArray(products) ? products.find((p: any) => p.id === parseInt(productId)) : null;
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.salePrice));
      calculateItemTotal(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingQuote ? 'تعديل عرض السعر' : 'إضافة عرض سعر جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quoteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم العرض</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="رقم عرض السعر" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العميل (اختياري)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(clients) && clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
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
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صالح حتى تاريخ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                        <SelectItem value="accepted">مقبول</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                        <SelectItem value="expired">منتهي الصلاحية</SelectItem>
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
                <h3 className="text-lg font-semibold">أصناف العرض</h3>
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
                          <Select 
                            onValueChange={(value) => handleProductSelect(index, value)}
                            value={field.value?.toString()}
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

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الضريبة (ر.س)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          calculateGrandTotal();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الخصم (ر.س)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          calculateGrandTotal();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="ملاحظات حول عرض السعر" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createQuoteMutation.isPending || updateQuoteMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingQuote ? 'تحديث العرض' : 'حفظ العرض'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}