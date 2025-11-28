import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Save, X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReturnItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SimplePurchaseReturnFormProps {
  onClose: () => void;
  editingReturn?: any;
}

export default function SimplePurchaseReturnForm({ onClose, editingReturn }: SimplePurchaseReturnFormProps) {
  const [purchaseId, setPurchaseId] = useState<number>(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [reason, setReason] = useState('بدون سبب');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([
    { productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Load data for editing
  useEffect(() => {
    if (editingReturn) {
      setPurchaseId(editingReturn.purchase_id || 0);
      setReason(editingReturn.reason || 'بدون سبب');
      setNotes(editingReturn.notes || '');
      
      // تحديث رقم الفاتورة عند التعديل
      if (editingReturn.purchase_id && Array.isArray(purchases)) {
        const selectedPurchase = purchases.find((p: any) => p.id === editingReturn.purchase_id);
        if (selectedPurchase) {
          setInvoiceNumber(selectedPurchase.id.toString());
        }
      }
      
      if (editingReturn.items) {
        try {
          const parsedItems = typeof editingReturn.items === 'string' 
            ? JSON.parse(editingReturn.items) 
            : editingReturn.items;
          setItems(Array.isArray(parsedItems) ? parsedItems : [
            { productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 }
          ]);
        } catch (e) {
          setItems([{ productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
        }
      }
    }
  }, [editingReturn, purchases]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editingReturn) {
        return apiRequest('PUT', `/api/purchase-returns/${editingReturn.id}`, data);
      } else {
        return apiRequest('POST', '/api/purchase-returns', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-returns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "نجح",
        description: editingReturn ? "تم تحديث مرتجع المشتريات وتحديث المخزون تلقائياً" : "تم إنشاء مرتجع المشتريات وتحديث المخزون تلقائياً",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error with purchase return:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ مرتجع المشتريات",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    setItems([...items, { productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ReturnItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = Array.isArray(products) ? products.find((p: any) => p.id === parseInt(value)) : null;
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = parseFloat(product.purchasePrice || product.salePrice || 0);
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

  // معالجة اختيار الفاتورة وتحديث رقم الفاتورة والأصناف تلقائياً
  const handlePurchaseChange = (value: string) => {
    const selectedId = parseInt(value);
    setPurchaseId(selectedId);
    
    if (selectedId && Array.isArray(purchases)) {
      const selectedPurchase = purchases.find((p: any) => p.id === selectedId);
      if (selectedPurchase) {
        setInvoiceNumber(selectedPurchase.id.toString());
        
        // إضافة الأصناف والكميات من الفاتورة تلقائياً
        if (selectedPurchase.items) {
          try {
            const purchaseItems = typeof selectedPurchase.items === 'string' 
              ? JSON.parse(selectedPurchase.items) 
              : selectedPurchase.items;
            
            if (Array.isArray(purchaseItems) && purchaseItems.length > 0) {
              const returnItems: ReturnItem[] = purchaseItems.map((item: any) => ({
                productId: item.productId || 0,
                productName: item.productName || '',
                quantity: item.quantity || 0,
                unitPrice: item.unitPrice || 0,
                total: (item.quantity || 0) * (item.unitPrice || 0)
              }));
              setItems(returnItems);
              
              toast({
                title: "تم التحميل",
                description: `تم إضافة ${returnItems.length} صنف من الفاتورة`,
              });
            }
          } catch (e) {
            console.error('Error parsing purchase items:', e);
          }
        }
      }
    } else {
      setInvoiceNumber('');
      setItems([{ productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  };

  const handleSubmit = () => {
    if (purchaseId === 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب اختيار فاتورة مشتريات",
        variant: "destructive",
      });
      return;
    }

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

    const returnData = {
      purchaseId: purchaseId,
      returnNumber: `RET-${Date.now()}`,
      total: getTotalAmount().toString(),
      reason: reason,
      status: 'approved',
      notes: notes,
      items: validItems
    };

    console.log('Submitting purchase return data:', returnData);
    mutation.mutate(returnData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            {editingReturn ? "تعديل مرتجع المشتريات" : "مرتجع مشتريات جديد"}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>فاتورة المشتريات</Label>
              <Select value={purchaseId.toString()} onValueChange={handlePurchaseChange}>
                <SelectTrigger data-testid="select-purchase-invoice">
                  <SelectValue placeholder="اختر فاتورة المشتريات" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(purchases) && purchases.map((purchase: any) => (
                    <SelectItem key={purchase.id} value={purchase.id.toString()}>
                      فاتورة #{purchase.id} - {purchase.total} ر.س
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الفاتورة</Label>
              <Input
                value={invoiceNumber}
                readOnly
                placeholder="رقم الفاتورة"
                className="bg-gray-50"
                data-testid="input-invoice-number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>سبب الإرجاع</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="سبب الإرجاع"
                data-testid="input-return-reason"
              />
            </div>
          </div>

          {/* الأصناف */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">أصناف المرتجع</Label>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                إضافة صنف
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg">
                  <div>
                    <Label>المنتج</Label>
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
                            : "اختر المنتج"}
                          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ابحث عن منتج..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج</CommandEmpty>
                            <CommandGroup>
                              {Array.isArray(products) && products.map((product: any) => (
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

                  <div>
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label>السعر</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>الإجمالي</Label>
                    <Input
                      value={item.total.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={() => removeItem(index)} 
                      variant="destructive" 
                      size="sm"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <Label>ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات إضافية..."
              rows={3}
            />
          </div>

          {/* المجموع */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>المجموع الكلي:</span>
              <span>{getTotalAmount().toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={mutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? "جاري الحفظ..." : (editingReturn ? "تحديث المرتجع" : "حفظ المرتجع")}
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}