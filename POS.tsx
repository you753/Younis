import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Calculator,
  Receipt,
  CreditCard,
  DollarSign,
  Users,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  code: string;
  barcode?: string;
  price: string;
  stock: number;
  unit: string;
  isActive: boolean;
}

interface Client {
  id: number;
  name: string;
  phone?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface SaleData {
  branchId: number;
  clientId?: number;
  items: CartItem[];
  total: number;
  discount: number;
  tax: number;
  finalTotal: number;
  paymentMethod: string;
  notes?: string;
}

export default function POS() {
  const { branchId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | undefined>();
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch products for this branch
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    enabled: !!branchId
  });

  // Fetch clients for this branch
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    enabled: !!branchId
  });

  // Fetch today's sales
  const { data: todaySales } = useQuery({
    queryKey: [`/api/pos/daily-sales/${branchId}`],
    enabled: !!branchId
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: SaleData) => {
      const response = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        throw new Error('فشل في إتمام البيع');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إتمام البيع بنجاح",
        description: "تم حفظ البيع وتحديث المخزون",
      });
      
      // Clear cart and reset form
      setCart([]);
      setSelectedClient(undefined);
      setDiscount(0);
      setNotes('');
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/products`] });
      queryClient.invalidateQueries({ queryKey: [`/api/pos/daily-sales/${branchId}`] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إتمام البيع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter products based on search
  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "تحذير",
          description: "لا يوجد مخزون كافي",
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        toast({
          title: "تحذير",
          description: "المنتج غير متوفر في المخزون",
          variant: "destructive",
        });
        return;
      }
      
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        unit: product.unit
      }]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find((p: Product) => p.id === id);
    if (product && quantity > product.stock) {
      toast({
        title: "تحذير",
        description: "الكمية المطلوبة أكبر من المخزون المتاح",
        variant: "destructive",
      });
      return;
    }
    
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * 0.15; // 15% VAT
  const discountAmount = subtotal * (discount / 100);
  const finalTotal = subtotal + taxAmount - discountAmount;

  // Process sale
  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب إضافة منتجات للسلة أولاً",
        variant: "destructive",
      });
      return;
    }

    const saleData: SaleData = {
      branchId: parseInt(branchId!),
      clientId: selectedClient,
      items: cart,
      total: subtotal,
      discount: discountAmount,
      tax: taxAmount,
      finalTotal: finalTotal,
      paymentMethod,
      notes: notes || undefined,
    };

    createSaleMutation.mutate(saleData);
  };

  if (productsLoading || clientsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل نقطة البيع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/branch/${branchId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">نقطة البيع</h1>
              <p className="text-sm text-gray-500">الفرع #{branchId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  المبيعات اليومية
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>المبيعات اليومية</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {todaySales?.summary?.totalAmount?.toFixed(2) || '0.00'} ر.س
                    </div>
                    <div className="text-sm text-blue-600">إجمالي المبيعات اليوم</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {todaySales?.summary?.totalTransactions || 0}
                    </div>
                    <div className="text-sm text-green-600">عدد المعاملات</div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Badge variant="secondary" className="text-sm">
              <ShoppingCart className="h-4 w-4 ml-1" />
              {cart.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Products Panel */}
        <div className="flex-1 p-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم أو الكود أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Products Grid */}
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product: Product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium mb-1 line-clamp-2">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      كود: {product.code}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        {parseFloat(product.price).toFixed(2)} ر.س
                      </span>
                      <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                        {product.stock} {product.unit}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Panel */}
        <div className="w-80 bg-white border-r shadow-lg">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="h-5 w-5 ml-2" />
              سلة المشتريات
            </h2>
          </div>

          <ScrollArea className="h-64">
            <div className="p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  السلة فارغة
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {item.price.toFixed(2)} × {item.quantity}
                        </div>
                        <div className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Customer Selection */}
          <div className="p-4 border-t">
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">العميل (اختياري)</label>
              <Select value={selectedClient?.toString()} onValueChange={(value) => setSelectedClient(value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: Client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Discount */}
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">خصم (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">طريقة الدفع</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>خصم ({discount}%):</span>
                  <span>-{discountAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{taxAmount.toFixed(2)} ر.س</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع النهائي:</span>
                <span>{finalTotal.toFixed(2)} ر.س</span>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={processSale}
              disabled={cart.length === 0 || createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري المعالجة...
                </div>
              ) : (
                <>
                  <Receipt className="h-4 w-4 ml-2" />
                  إتمام البيع
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}