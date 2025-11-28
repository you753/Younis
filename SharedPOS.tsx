import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  DollarSign,
  User,
  Package,
  Building,
  Monitor
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export default function SharedPOS() {
  const params = useParams<{ branchId: string; terminalId: string }>();
  const branchId = parseInt(params.branchId!);
  const terminalId = parseInt(params.terminalId!);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientName, setClientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // جلب بيانات الفرع
  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId
  });

  // جلب المنتجات
  const { data: products } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    enabled: !!branchId
  });

  // جلب العملاء
  const { data: clients } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    enabled: !!branchId
  });

  // البحث عن المحطة بناءً على terminalId
  const terminals = [
    {
      id: 1,
      name: 'محطة الكاشير الرئيسي',
      code: 'POS-001',
      location: 'المدخل الرئيسي',
      isOnline: true,
      isActive: true,
      lastActivity: 'منذ 5 دقائق',
      employee: 'أحمد محمد'
    },
    {
      id: 2,
      name: 'محطة المبيعات السريعة',
      code: 'POS-002',
      location: 'قسم الخضروات',
      isOnline: false,
      isActive: true,
      lastActivity: 'منذ ساعة',
      employee: 'فاطمة علي'
    },
    {
      id: 3,
      name: 'محطة خدمة العملاء',
      code: 'POS-003',
      location: 'قسم خدمة العملاء',
      isOnline: true,
      isActive: false,
      lastActivity: 'منذ 30 دقيقة',
      employee: 'محمد حسن'
    }
  ];

  const currentTerminal = terminals.find(t => t.id === terminalId);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        total: parseFloat(product.price)
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const processSale = useMutation({
    mutationFn: async (saleData: any) => {
      return apiRequest(`/api/pos/sales`, 'POST', saleData);
    },
    onSuccess: () => {
      setCart([]);
      setClientName('');
      alert('تم إتمام البيع بنجاح');
      queryClient.invalidateQueries({ queryKey: [`/api/pos/daily-sales/${branchId}`] });
    },
    onError: () => {
      alert('حدث خطأ أثناء معالجة البيع');
    }
  });

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    const saleData = {
      branchId,
      terminalId,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      total: calculateTotal(),
      clientName: clientName || 'عميل عادي',
      paymentMethod,
      terminalName: currentTerminal?.name || 'محطة غير معروفة'
    };

    processSale.mutate(saleData);
  };

  const filteredProducts = (products || []).filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {currentTerminal?.name || 'محطة غير معروفة'}
                </h1>
                <div className="flex items-center text-gray-600">
                  <span className="text-lg font-medium">
                    {branch?.name || 'جاري التحميل...'} - {currentTerminal?.code}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                نشط - متاح للبيع
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* قسم المنتجات */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              {/* شريط البحث */}
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Input
                    placeholder="بحث بالقسم أو الرقم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white border-0 rounded-lg text-right"
                  />
                  <Button className="bg-blue-700 hover:bg-blue-800 border-0">
                    بحث
                  </Button>
                </div>
              </div>

              {/* شبكة المنتجات */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="relative bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all duration-200 cursor-pointer group hover:shadow-lg"
                      onClick={() => addToCart(product)}
                    >
                      {/* أيقونة سلة التسوق */}
                      <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      
                      <div className="p-4 text-center">
                        <div className="text-lg font-bold text-gray-900 mb-2 min-h-[3rem] flex items-center justify-center">
                          {product.name}
                        </div>
                        <div className="bg-blue-100 text-blue-700 text-sm font-bold py-2 px-3 rounded-lg">
                          {parseFloat(product.price).toFixed(2)} ريال
                        </div>
                        
                        {/* دائرة خضراء للمتاح */}
                        <div className="mt-3 flex justify-center">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* سلة المشتريات */}
          <div className="space-y-4">
            {/* السلة المفرغة */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center">
                <div className="bg-gray-100 p-8 rounded-xl">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">السلة فارغة</h3>
                  <p className="text-gray-500">اضغط منتجات السلة</p>
                </div>
              </div>
            </div>

            {/* أزرار نقطة البيع */}
            <div className="space-y-3">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-4 rounded-xl">
                ({cart.length}) السلة
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="py-3 rounded-xl border-2 hover:bg-blue-50 text-blue-600 border-blue-300"
                >
                  <User className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button 
                  variant="outline" 
                  className="py-3 rounded-xl border-2 hover:bg-blue-50 text-blue-600 border-blue-300"
                >
                  <Package className="h-4 w-4 ml-2" />
                  عرض
                </Button>
              </div>
            </div>

            {/* قائمة المنتجات في السلة - تظهر عند وجود عناصر */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4">سلة المشتريات ({cart.length})</h3>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-gray-600 text-xs">
                          {item.price.toFixed(2)} ر.س × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-2">
                        <span className="font-bold text-sm">
                          {item.total.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* المجموع الكلي */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold">المجموع الكلي:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {calculateTotal().toFixed(2)} ر.س
                    </span>
                  </div>

                  {/* طريقة الدفع */}
                  <div className="mb-4">
                    <Label>طريقة الدفع</Label>
                    <div className="flex space-x-2 space-x-reverse mt-2">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('cash')}
                        className="flex-1"
                      >
                        <DollarSign className="h-4 w-4 ml-1" />
                        نقداً
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('card')}
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 ml-1" />
                        بطاقة
                      </Button>
                    </div>
                  </div>

                  {/* زر إتمام البيع */}
                  <Button
                    onClick={handleCompleteSale}
                    disabled={processSale.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Calculator className="h-4 w-4 ml-2" />
                    {processSale.isPending ? 'جاري المعالجة...' : 'إتمام البيع'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}