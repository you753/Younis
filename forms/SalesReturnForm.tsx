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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Save, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema for return items
const returnItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  quantity: z.number().min(0, 'الكمية يجب أن تكون صفر أو أكبر'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون صفر أو أكبر'),
  total: z.number().min(0),
});

// Schema for form validation
const salesReturnFormSchema = z.object({
  saleId: z.number().optional(),
  returnNumber: z.string().min(1, 'رقم المرتجع مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  reason: z.string().min(1, 'سبب الإرجاع مطلوب'),
  status: z.string().default('pending'),
  notes: z.string().optional(),
  items: z.array(returnItemSchema).optional(),
});

type SalesReturnForm = z.infer<typeof salesReturnFormSchema>;

interface SalesReturnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReturn?: any;
  onSuccess?: () => void;
}

export default function SalesReturnFormComponent({ open, onOpenChange, editingReturn, onSuccess }: SalesReturnFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saleSearchOpen, setSaleSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const form = useForm<SalesReturnForm>({
    resolver: zodResolver(salesReturnFormSchema),
    defaultValues: {
      returnNumber: editingReturn?.returnNumber || '',
      total: editingReturn?.total || '',
      reason: editingReturn?.reason || '',
      status: editingReturn?.status || 'pending',
      notes: editingReturn?.notes || '',
      items: editingReturn?.items || [],
      saleId: editingReturn?.saleId || undefined,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Reset form when editing or opening new return
  useEffect(() => {
    if (open) {
      if (editingReturn) {
        // Load editing data
        form.reset({
          returnNumber: editingReturn.returnNumber || '',
          total: editingReturn.total || '',
          reason: editingReturn.reason || '',
          status: editingReturn.status || 'pending',
          notes: editingReturn.notes || '',
          items: editingReturn.items || [],
          saleId: editingReturn.saleId || undefined,
        });
      } else {
        // New return - generate number and reset form
        const newReturnNumber = `RET-${Date.now()}`;
        form.reset({
          returnNumber: newReturnNumber,
          total: '',
          reason: '',
          status: 'pending',
          notes: '',
          items: [],
          saleId: undefined,
        });
      }
    }
  }, [open, editingReturn, form]);

  // Auto-fill items when sale is selected
  useEffect(() => {
    const saleId = form.watch('saleId');
    if (saleId && !editingReturn) {
      const selectedSale = (sales as any[]).find((s: any) => s.id === saleId);
      if (selectedSale && selectedSale.items && Array.isArray(selectedSale.items)) {
        // Clear existing items
        form.setValue('items', []);
        
        // Add items from the selected sale
        const saleItems = selectedSale.items.map((item: any) => ({
          productId: item.productId || 0,
          productName: item.productName || item.name || '',
          quantity: item.quantity || 1,
          unitPrice: parseFloat(item.unitPrice) || parseFloat(item.price) || 0,
          total: (item.quantity || 1) * (parseFloat(item.unitPrice) || parseFloat(item.price) || 0),
        }));
        
        form.setValue('items', saleItems);
        
        // Calculate grand total
        const grandTotal = saleItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
        form.setValue('total', grandTotal.toFixed(2));
      }
    }
  }, [form.watch('saleId'), sales, editingReturn]);

  const createReturnMutation = useMutation({
    mutationFn: (data: SalesReturnForm) => apiRequest({
      url: '/api/sales-returns',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة المرتجع بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating sales return:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المرتجع",
        variant: "destructive",
      });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SalesReturnForm> }) => 
      apiRequest({
        url: `/api/sales-returns/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المرتجع",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalesReturnForm) => {
    if (editingReturn) {
      updateReturnMutation.mutate({ id: editingReturn.id, data });
    } else {
      createReturnMutation.mutate(data);
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
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.salePrice));
      calculateItemTotal(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingReturn ? 'تعديل مرتجع المبيعات' : 'إضافة مرتجع مبيعات جديد'}
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
                      <Input placeholder="أدخل رقم المرتجع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>فاتورة البيع (اختياري)</FormLabel>
                    <Popover open={saleSearchOpen} onOpenChange={setSaleSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="sale-search-button"
                          >
                            {field.value
                              ? (() => {
                                  const sale = (sales as any[]).find((s: any) => s.id === field.value);
                                  return sale ? `${sale.invoiceNumber || `فاتورة #${sale.id}`} - ${sale.total} ر.س` : "اختر فاتورة البيع";
                                })()
                              : "اختر فاتورة البيع"}
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ابحث عن فاتورة..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج</CommandEmpty>
                            <CommandGroup>
                              {Array.isArray(sales) && sales.map((sale: any) => (
                                <CommandItem
                                  key={sale.id}
                                  value={`${sale.invoiceNumber || sale.id} ${sale.total}`}
                                  onSelect={() => {
                                    field.onChange(sale.id);
                                    setSaleSearchOpen(false);
                                  }}
                                  data-testid={`sale-option-${sale.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      sale.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {sale.invoiceNumber || `فاتورة #${sale.id}`} - {sale.total} ر.س
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبب الإرجاع</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر سبب الإرجاع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="defective">منتج معيب</SelectItem>
                        <SelectItem value="wrong_item">منتج خاطئ</SelectItem>
                        <SelectItem value="customer_request">طلب العميل</SelectItem>
                        <SelectItem value="quality_issue">مشكلة في الجودة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="approved">موافق عليه</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
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
                <h3 className="text-lg font-semibold">الأصناف المرتجعة</h3>
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
                                      ? (() => {
                                          const product = (products as any[]).find((p: any) => p.id === field.value);
                                          return product ? `${product.name} - ${product.salePrice} ر.س` : "اختر المنتج";
                                        })()
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
                                            value={`${product.name} ${product.salePrice}`}
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
                                            {product.name} - {product.salePrice} ر.س
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

            {/* Total and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div></div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createReturnMutation.isPending || updateReturnMutation.isPending}
              >
                <Save className="h-4 w-4 ml-2" />
                {editingReturn ? 'تحديث المرتجع' : 'إضافة المرتجع'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}