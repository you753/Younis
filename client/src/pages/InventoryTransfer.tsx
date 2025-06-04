import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRightLeft, 
  Package, 
  Search,
  Plus,
  Trash2,
  Save,
  Building
} from 'lucide-react';

const mockWarehouses = [
  { id: 1, name: 'المستودع الرئيسي', location: 'الرياض' },
  { id: 2, name: 'مستودع جدة', location: 'جدة' },
  { id: 3, name: 'مستودع الدمام', location: 'الدمام' },
];

interface TransferItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  availableQuantity: number;
}

export default function InventoryTransfer() {
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addTransferItem = (product: Product) => {
    const existingItem = transferItems.find(item => item.productId === product.id);
    if (existingItem) {
      setTransferItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: TransferItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        availableQuantity: product.quantity || 0
      };
      setTransferItems(items => [...items, newItem]);
    }
    setSearchTerm('');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setTransferItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setTransferItems(items => items.filter(item => item.id !== itemId));
  };

  const submitTransfer = () => {
    if (!fromWarehouse || !toWarehouse || transferItems.length === 0) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (fromWarehouse === toWarehouse) {
      alert('لا يمكن التحويل إلى نفس المستودع');
      return;
    }

    // Here you would typically send the transfer data to your API
    console.log('Transfer Data:', {
      fromWarehouse,
      toWarehouse,
      items: transferItems,
      notes,
      date: new Date().toISOString()
    });

    alert('تم إنشاء أمر التحويل بنجاح');
    
    // Reset form
    setFromWarehouse('');
    setToWarehouse('');
    setTransferItems([]);
    setNotes('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تحويل المخزون</h1>
          <p className="text-gray-600 mt-2">نقل المنتجات بين المستودعات المختلفة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                تفاصيل التحويل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">من المستودع</label>
                <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستودع المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {warehouse.name} - {warehouse.location}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">إلى المستودع</label>
                <Select value={toWarehouse} onValueChange={setToWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستودع المستهدف" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {warehouse.name} - {warehouse.location}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Textarea
                  placeholder="أدخل ملاحظات حول التحويل..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                إضافة منتجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {searchTerm && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map((product: Product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addTransferItem(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">الكود: {product.code || 'غير محدد'}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm">المتوفر: {product.quantity || 0}</p>
                            <Badge variant="outline">
                              <Plus className="h-3 w-3 ml-1" />
                              إضافة
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="p-3 text-center text-gray-500">
                        لا توجد منتجات مطابقة
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Items */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات المحددة للتحويل</CardTitle>
          </CardHeader>
          <CardContent>
            {transferItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لم يتم تحديد أي منتجات للتحويل</p>
                <p className="text-sm text-gray-400 mt-2">ابحث عن المنتجات وأضفها من القائمة اليسرى</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>المتوفر</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.availableQuantity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max={item.availableQuantity}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">إجمالي المنتجات:</span>
                    <span className="text-lg font-bold">{transferItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">إجمالي الكميات:</span>
                    <span className="text-lg font-bold">
                      {transferItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <Button 
                    onClick={submitTransfer}
                    className="w-full"
                    disabled={!fromWarehouse || !toWarehouse || transferItems.length === 0}
                  >
                    <Save className="h-4 w-4 ml-2" />
                    تأكيد التحويل
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}