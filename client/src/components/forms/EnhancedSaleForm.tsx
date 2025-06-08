import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SaleItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface FormData {
  clientId: number;
  items: SaleItem[];
  notes: string;
}

interface EnhancedSaleFormProps {
  onClose: () => void;
}

export default function EnhancedSaleForm({ onClose }: EnhancedSaleFormProps) {
  const { toast } = useToast();
  const { format: formatAmount } = useCurrency();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>({
    clientId: 0,
    items: [],
    notes: ''
  });

  // Fetch clients and products
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
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
        description: "تم حفظ فاتورة المبيعات الجديدة",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: "حدث خطأ أثناء حفظ الفاتورة",
        variant: "destructive",
      });
    }
  });

  // Add new item
  const addItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      productId: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Update item
  const updateItem = (itemId: string, field: keyof SaleItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-fill product details when product is selected
          if (field === 'productId') {
            const product = products.find((p: any) => p.id === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.unitPrice = parseFloat(product.price) || 0;
              updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
            }
          }
          
          // Recalculate total when quantity or price changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Calculate grand total
  const grandTotal = formData.items.reduce((sum, item) => sum + item.total, 0);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast({
        title: "يرجى اختيار العميل",
        variant: "destructive",
      });
      return;
    }

    if (formData.items.length === 0) {
      toast({
        title: "يرجى إضافة صنف واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    const hasInvalidItems = formData.items.some(item => 
      !item.productId || item.quantity <= 0 || item.unitPrice <= 0
    );

    if (hasInvalidItems) {
      toast({
        title: "يرجى التأكد من بيانات جميع الأصناف",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      clientId: formData.clientId,
      total: grandTotal.toFixed(2),
      notes: formData.notes
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            فاتورة مبيعات جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-lg font-semibold mb-3 block">بيانات العميل</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId" className="text-sm font-medium">العميل *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({...prev, clientId: parseInt(value)}))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm font-medium">تاريخ الفاتورة</Label>
                  <Input 
                    type="date" 
                    className="mt-1"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">أصناف الفاتورة</Label>
                <Button type="button" onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة صنف
                </Button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لم يتم إضافة أي أصناف بعد</p>
                  <Button type="button" onClick={addItem} size="sm" className="mt-2">
                    إضافة أول صنف
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-100">
                        <TableHead className="text-right font-semibold">الصنف</TableHead>
                        <TableHead className="text-right font-semibold">الكمية</TableHead>
                        <TableHead className="text-right font-semibold">السعر</TableHead>
                        <TableHead className="text-right font-semibold">الإجمالي</TableHead>
                        <TableHead className="text-right font-semibold">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.id} className="border-b">
                          <TableCell className="w-80">
                            <Select 
                              onValueChange={(value) => updateItem(item.id, 'productId', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الصنف" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product: any) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name} - {formatAmount(parseFloat(product.salePrice || '0'))}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="w-32">
                            <Input 
                              type="number" 
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell className="w-32">
                            <Input 
                              type="number" 
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell className="w-32">
                            <div className="bg-gray-100 p-2 rounded text-center font-semibold">
                              {formatAmount(item.total)}
                            </div>
                          </TableCell>
                          <TableCell className="w-20">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Total Section */}
            {formData.items.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex justify-end">
                  <div className="text-right space-y-2">
                    <div className="text-lg">
                      <span className="font-medium">عدد الأصناف: </span>
                      <span className="font-bold">{formData.items.length}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      <span>الإجمالي الكلي: </span>
                      <span>{formatAmount(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">ملاحظات</Label>
              <Input 
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                placeholder="أي ملاحظات إضافية..."
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createSaleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 min-w-32"
              >
                {createSaleMutation.isPending ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}