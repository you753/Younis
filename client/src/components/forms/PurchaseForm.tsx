import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { insertPurchaseSchema, type InsertPurchase } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseFormData extends Omit<InsertPurchase, 'items'> {
  items: PurchaseItem[];
}

export default function PurchaseForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(insertPurchaseSchema.extend({
      items: insertPurchaseSchema.shape.items
    })),
    defaultValues: {
      supplierId: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      status: 'completed',
      paymentMethod: 'cash',
      notes: '',
      items: []
    }
  });

  // Fetch suppliers and products
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertPurchase) => {
      const response = await apiRequest('/api/purchases', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      toast({
        title: "تم إنشاء فاتورة المشتريات بنجاح",
        description: "تم حفظ فاتورة المشتريات الجديدة",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: "حدث خطأ أثناء حفظ فاتورة المشتريات",
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
    updateTotal(newItems);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products?.find((p: any) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.price || 0;
      }
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
    updateTotal(newItems);
  };

  const updateTotal = (items: PurchaseItem[]) => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    form.setValue('totalAmount', total);
  };

  const onSubmit = (data: PurchaseFormData) => {
    const purchaseData: InsertPurchase = {
      ...data,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    };
    mutation.mutate(purchaseData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">فاتورة مشتريات جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supplierId">المورد</Label>
                <Select onValueChange={(value) => form.setValue('supplierId', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purchaseDate">تاريخ الفاتورة</Label>
                <Input 
                  type="date" 
                  {...form.register('purchaseDate')}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select onValueChange={(value) => form.setValue('paymentMethod', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items */}
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
                      <Select onValueChange={(value) => updateItem(index, 'productId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>الكمية</Label>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>السعر</Label>
                      <Input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        step="0.01"
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
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>الإجمالي:</span>
                  <span>{form.watch('totalAmount')?.toFixed(2) || '0.00'} ر.س</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Input {...form.register('notes')} placeholder="ملاحظات إضافية" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}