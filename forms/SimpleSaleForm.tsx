import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SimpleSaleFormProps {
  onClose: () => void;
}

export default function SimpleSaleForm({ onClose }: SimpleSaleFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [clientId, setClientId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create sale');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "تم إنشاء الفاتورة بنجاح",
        description: "تم حفظ فاتورة المبيعات وتحديث المخزون تلقائياً",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: error.message || "حدث خطأ أثناء حفظ الفاتورة",
        variant: "destructive",
      });
    }
  });

  const addItem = () => {
    setItems([...items, {
      productId: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    if (field === 'productId') {
      const product = (products as any[])?.find((p: any) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = parseFloat(product.salePrice) || parseFloat(product.purchasePrice) || 0;
        // حساب الإجمالي تلقائياً عند اختيار المنتج
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = () => {
    // التحقق من البيانات

    if (items.length === 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب إضافة صنف واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(item => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب اختيار المنتجات والكميات بشكل صحيح",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      clientId: clientId || 16,
      total: getTotalAmount().toString(),
      branchId: 1,
      notes: notes,
      items: validItems
    };

    console.log('Submitting sale data:', saleData);
    mutation.mutate(saleData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">فاتورة مبيعات جديدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">العميل (اختياري)</Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !clientId && "text-muted-foreground"
                    )}
                    data-testid="client-search-button"
                  >
                    {clientId
                      ? (clients as any[])?.find((c: any) => c.id === clientId)?.name || "عميل افتراضي"
                      : "عميل افتراضي"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن عميل..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {(clients as any[])?.map((client: any) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setClientId(client.id);
                              setClientSearchOpen(false);
                            }}
                            data-testid={`client-option-${client.id}`}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                client.id === clientId ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية (اختيارية)"
                rows={2}
              />
            </div>
          </div>

          {/* الأصناف */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">أصناف الفاتورة</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة صنف
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Label>الصنف</Label>
                    <Popover 
                      open={productSearchOpen[index]} 
                      onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, [index]: open})}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !item.productId && "text-muted-foreground"
                          )}
                          data-testid={`product-search-button-${index}`}
                        >
                          {item.productId && item.productName
                            ? item.productName
                            : "اختر الصنف"}
                          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ابحث عن منتج..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج</CommandEmpty>
                            <CommandGroup>
                              {(products as any[])?.map((product: any) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => {
                                    updateItem(index, 'productId', product.id);
                                    setProductSearchOpen({...productSearchOpen, [index]: false});
                                  }}
                                  data-testid={`product-option-${product.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      product.id === item.productId ? "opacity-100" : "opacity-0"
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
                  </div>

                  <div className="col-span-2">
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-3">
                    <Label>الإجمالي</Label>
                    <Input
                      type="number"
                      value={item.total.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* إجمالي الفاتورة */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>إجمالي الفاتورة:</span>
              <span>{getTotalAmount().toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}