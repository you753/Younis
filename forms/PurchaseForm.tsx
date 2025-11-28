import { useState } from 'react';
import React from 'react';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Save, Package, Check, ChevronsUpDown, Clock, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).optional(),
});

type PurchaseForm = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPurchase?: any;
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
  branchId?: number;
}

export default function PurchaseFormComponent({ open, onOpenChange, editingPurchase, initialData, isEdit = false, onSuccess, branchId }: PurchaseFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});
  const [paymentMethod, setPaymentMethod] = useState<'آجل' | 'تحويل بنكي' | 'شبكة' | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: branchId ? ['/api/products', branchId] : ['/api/products'],
    queryFn: async () => {
      const url = branchId ? `/api/products?branchId=${branchId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: branchId ? ['/api/suppliers', branchId] : ['/api/suppliers'],
    queryFn: async () => {
      const url = branchId ? `/api/suppliers?branchId=${branchId}` : '/api/suppliers';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    }
  });

  const currentData = initialData || editingPurchase;
  
  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      total: currentData?.total?.toString() || '',
      date: currentData?.date || new Date().toISOString().split('T')[0],
      notes: currentData?.notes || '',
      items: currentData?.items || [],
      supplierId: currentData?.supplierId || undefined,
    },
  });

  // تحديث النموذج عند تغيير البيانات
  React.useEffect(() => {
    if (currentData && open) {
      form.reset({
        total: currentData.total?.toString() || '',
        date: currentData.date || new Date().toISOString().split('T')[0],
        notes: currentData.notes || '',
        items: currentData.items || [],
        supplierId: currentData.supplierId || undefined,
      });
    }
  }, [currentData, open, form]);

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (data: PurchaseForm) => apiRequest('POST', '/api/purchases', data),
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
      apiRequest('PUT', `/api/purchases/${id}`, data),
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
    // تأكد من إرسال الأصناف مع البيانات
    const submissionData = {
      supplierId: form.watch('supplierId') || data.supplierId || undefined,
      branchId: branchId || undefined,
      total: data.total,
      date: data.date || new Date().toISOString().split('T')[0],
      notes: data.notes || undefined,
      paymentMethod: paymentMethod || undefined,
      sentToSupplierAccount: paymentMethod === 'آجل',
      items: itemFields.length > 0 ? itemFields.map((field, index) => ({
        productId: form.watch(`items.${index}.productId`) || 0,
        productName: form.watch(`items.${index}.productName`) || '',
        quantity: form.watch(`items.${index}.quantity`) || 1,
        unitPrice: form.watch(`items.${index}.unitPrice`) || 0,
        total: form.watch(`items.${index}.total`) || 0,
      })) : []
    };
    
    console.log('Submitting purchase data:', submissionData);
    
    if (isEdit && currentData) {
      updatePurchaseMutation.mutate({ id: currentData.id, data: submissionData });
    } else {
      createPurchaseMutation.mutate(submissionData);
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
            {isEdit ? 'تعديل فاتورة المشتريات' : 'إضافة فاتورة مشتريات جديدة'}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>المورد</FormLabel>
                    <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="supplier-search-button"
                          >
                            {field.value
                              ? (suppliers as any[]).find((supplier: any) => supplier.id === field.value)?.name
                              : "اختر المورد"}
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ابحث عن مورد..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج</CommandEmpty>
                            <CommandGroup>
                              {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                                <CommandItem
                                  key={supplier.id}
                                  value={supplier.name}
                                  onSelect={() => {
                                    field.onChange(supplier.id);
                                    setSupplierSearchOpen(false);
                                  }}
                                  data-testid={`supplier-option-${supplier.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      supplier.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {supplier.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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

            {/* تاريخ الفاتورة */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-purchase-date"
                      />
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
                          <FormItem className="flex flex-col">
                            <FormLabel>المنتج</FormLabel>
                            <Popover 
                              open={productSearchOpen[index]} 
                              onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, [index]: open})}
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid={`product-search-button-${index}`}
                                  >
                                    {field.value
                                      ? (products as any[]).find((product: any) => product.id === field.value)?.name
                                      : "اختر المنتج"}
                                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="ابحث عن منتج..." />
                                  <CommandList>
                                    <CommandEmpty>لا توجد نتائج</CommandEmpty>
                                    <CommandGroup>
                                      {Array.isArray(products) && products
                                        .filter((product: any) => product.id && product.name)
                                        .map((product: any) => (
                                          <CommandItem
                                            key={product.id}
                                            value={product.name}
                                            onSelect={() => {
                                              const productId = product.id;
                                              field.onChange(productId);
                                              handleProductChange(index, productId);
                                              setProductSearchOpen({...productSearchOpen, [index]: false});
                                            }}
                                            data-testid={`product-option-${product.id}`}
                                          >
                                            <Check
                                              className={cn(
                                                "ml-2 h-4 w-4",
                                                product.id === field.value ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {product.name}
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
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

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">طريقة الدفع</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={paymentMethod === 'آجل' ? 'default' : 'outline'}
                  className={`flex-1 h-9 ${paymentMethod === 'آجل' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                  onClick={() => setPaymentMethod('آجل')}
                  data-testid="button-payment-credit"
                >
                  <Clock className="h-3 w-3 ml-1" />
                  <span className="text-xs">آجل</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={paymentMethod === 'تحويل بنكي' ? 'default' : 'outline'}
                  className={`flex-1 h-9 ${paymentMethod === 'تحويل بنكي' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                  onClick={() => setPaymentMethod('تحويل بنكي')}
                  data-testid="button-payment-bank"
                >
                  <CreditCard className="h-3 w-3 ml-1" />
                  <span className="text-xs">تحويل بنكي</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={paymentMethod === 'شبكة' ? 'default' : 'outline'}
                  className={`flex-1 h-9 ${paymentMethod === 'شبكة' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                  onClick={() => setPaymentMethod('شبكة')}
                  data-testid="button-payment-pos"
                >
                  <Smartphone className="h-3 w-3 ml-1" />
                  <span className="text-xs">شبكة</span>
                </Button>
              </div>
              {paymentMethod === 'آجل' && (
                <p className="text-xs text-orange-600 font-medium">✅ سيتم إضافة القيمة لحساب المورد</p>
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