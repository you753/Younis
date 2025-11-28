import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search,
  CreditCard,
  DollarSign,
  Calculator,
  User,
  Building,
  Monitor,
  Package,
  Clock,
  Receipt,
  UserPlus,
  Users,
  Moon,
  Sun
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  code?: string;
  unit?: string;
}

interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export default function ProfessionalPOS() {
  const { branchId, terminalId } = useParams<{ branchId: string; terminalId: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const queryClient = useQueryClient();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch branch info
  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId
  });

  // Fetch terminal info
  const { data: currentTerminal } = useQuery({
    queryKey: [`/api/branches/${branchId}/terminals/${terminalId}`],
    enabled: !!branchId && !!terminalId
  });

  // Fetch products from branch
  const { data: products = [] } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    enabled: !!branchId
  });

  // Fetch clients from branch
  const { data: clients = [] } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    enabled: !!branchId
  });

  // Add new client mutation
  const addClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clientData)
      });
      if (!response.ok) throw new Error('فشل في إضافة العميل');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/clients`] });
      setShowAddClientDialog(false);
      setNewClient({ name: '', phone: '', email: '' });
      alert('تم إضافة العميل بنجاح');
    },
    onError: () => {
      alert('حدث خطأ في إضافة العميل');
    }
  });

  // Process sale mutation
  const processSale = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(saleData)
      });
      if (!response.ok) throw new Error('فشل في معالجة البيع');
      return response.json();
    },
    onSuccess: () => {
      setCart([]);
      setSelectedClientId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pos/daily-sales/${branchId}`] });
      alert('تم إنجاز البيع وحفظ الفاتورة بنجاح!');
    },
    onError: () => {
      alert('حدث خطأ في معالجة البيع');
    }
  });

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        total: parseFloat(product.price),
        code: product.code,
        unit: product.unit
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    const saleData = {
      clientId: selectedClientId,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      total: calculateTotal(),
      paymentMethod,
      branchId: parseInt(branchId!),
      terminalId: parseInt(terminalId!),
      date: new Date().toISOString().split('T')[0]
    };
    
    processSale.mutate(saleData);
  };

  const handleAddClient = () => {
    if (!newClient.name.trim()) {
      alert('اسم العميل مطلوب');
      return;
    }
    addClientMutation.mutate(newClient);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`} dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* Header Bar */}
      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'} border-b px-6 py-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 space-x-reverse">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {branch?.name || 'جاري التحميل...'}
                </h1>
                <div className={`flex items-center text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <Monitor className="h-4 w-4 ml-2" />
                  <span>محطة: {currentTerminal?.name || 'غير محدد'} - {currentTerminal?.code || ''}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              size="sm"
              className={`${isDarkMode ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-900'} rounded-lg p-2`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className={`text-left px-4 py-2 rounded-lg ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <div className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`}>
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                {currentTime.toLocaleDateString('en-GB')}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-green-500 to-blue-500 text-white'}`}>
              ● متصل
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-90px)]">
        {/* Left Panel - Products */}
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
          {/* Search Bar */}
          <div className={`p-6 border-b ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            <div className="relative">
              <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
              <Input
                type="text"
                placeholder="البحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pr-12 h-12 text-lg rounded-xl focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className={`flex-1 p-6 overflow-y-auto ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredProducts.map((product: any) => (
                <Card 
                  key={product.id} 
                  className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:shadow-blue-500/20' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-blue-500/10'
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <div className="text-center">
                    <div className={`rounded-xl p-6 mb-3 shadow-inner ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-zinc-800 to-zinc-700' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <Package className="h-10 w-10 text-blue-400 mx-auto" />
                    </div>
                    <h3 className={`font-bold text-sm mb-2 truncate leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                    <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>كود: {product.code || 'غير محدد'}</p>
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg px-3 py-2 text-sm font-bold shadow-lg">
                      {parseFloat(product.price).toFixed(2)} ر.س
                    </div>
                    {product.quantity !== undefined && (
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>المخزون: {product.quantity}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className={`w-[420px] border-l flex flex-col shadow-2xl ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
        }`}>
          {/* Cart Header */}
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg ml-3">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                سلة التسوق
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                {cart.length} صنف
              </Badge>
            </div>
          </div>

          {/* Cart Items */}
          <div className={`flex-1 overflow-y-auto ${
            isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'
          }`}>
            {cart.length === 0 ? (
              <div className={`flex items-center justify-center h-full ${
                isDarkMode ? 'text-zinc-500' : 'text-gray-500'
              }`}>
                <div className="text-center">
                  <div className={`rounded-full p-8 mb-4 mx-auto w-fit ${
                    isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'
                  }`}>
                    <ShoppingCart className={`h-16 w-16 mx-auto ${
                      isDarkMode ? 'text-zinc-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-xl font-medium">السلة فارغة</p>
                  <p className={`text-sm mt-2 ${
                    isDarkMode ? 'text-zinc-600' : 'text-gray-400'
                  }`}>اضغط على المنتجات لإضافتها</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.map(item => (
                  <Card key={item.id} className={`p-4 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-sm flex-1 leading-tight ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:bg-red-500 hover:text-white p-1 h-auto rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-2 space-x-reverse rounded-lg p-1 ${
                        isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'
                      }`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 p-0 rounded-md ${
                            isDarkMode 
                              ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className={`font-bold w-10 text-center text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 p-0 rounded-md ${
                            isDarkMode 
                              ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-left">
                        <div className={`font-bold text-lg ${
                          isDarkMode ? 'text-emerald-400' : 'text-green-600'
                        }`}>
                          {item.total.toFixed(2)} ر.س
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-zinc-500' : 'text-gray-500'
                        }`}>
                          {item.price.toFixed(2)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {cart.length > 0 && (
            <div className={`border-t p-6 space-y-6 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-white'
            }`}>
              {/* Customer Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>العميل</label>
                  <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className={`text-sm rounded-lg ${
                        isDarkMode 
                          ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                      }`}>
                        <UserPlus className="h-4 w-4 ml-1" />
                        إضافة عميل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={`rounded-xl ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`} dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="text-right text-xl font-bold">إضافة عميل جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className={`text-sm font-medium ${
                            isDarkMode ? 'text-zinc-300' : 'text-gray-700'
                          }`}>الاسم *</Label>
                          <Input
                            value={newClient.name}
                            onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                            placeholder="اسم العميل"
                            className={`rounded-lg h-12 ${
                              isDarkMode 
                                ? 'bg-zinc-800 border-zinc-700 text-white' 
                                : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <Label className={`text-sm font-medium ${
                            isDarkMode ? 'text-zinc-300' : 'text-gray-700'
                          }`}>الهاتف</Label>
                          <Input
                            value={newClient.phone}
                            onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                            placeholder="رقم الهاتف"
                            className={`rounded-lg h-12 ${
                              isDarkMode 
                                ? 'bg-zinc-800 border-zinc-700 text-white' 
                                : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <Label className={`text-sm font-medium ${
                            isDarkMode ? 'text-zinc-300' : 'text-gray-700'
                          }`}>البريد الإلكتروني</Label>
                          <Input
                            value={newClient.email}
                            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                            placeholder="البريد الإلكتروني"
                            className={`rounded-lg h-12 ${
                              isDarkMode 
                                ? 'bg-zinc-800 border-zinc-700 text-white' 
                                : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddClientDialog(false)}
                            className={`rounded-lg px-6 ${
                              isDarkMode 
                                ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                            }`}
                          >
                            إلغاء
                          </Button>
                          <Button 
                            onClick={handleAddClient}
                            disabled={addClientMutation.isPending}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg px-6"
                          >
                            {addClientMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedClientId?.toString() || ''} onValueChange={(value) => setSelectedClientId(value ? parseInt(value) : null)}>
                  <SelectTrigger className={`h-12 rounded-xl ${
                    isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                  }`}>
                    <SelectValue placeholder="اختر العميل أو اتركه فارغاً للعميل العام" />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
                  }`}>
                    <SelectItem value="">عميل عام</SelectItem>
                    {Array.isArray(clients) && clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.phone ? `- ${client.phone}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <label className={`text-lg font-bold mb-3 block ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className={paymentMethod === 'cash' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12 rounded-xl' 
                      : `h-12 rounded-xl ${
                          isDarkMode 
                            ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                            : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                        }`}
                  >
                    <DollarSign className="h-5 w-5 ml-2" />
                    نقداً
                  </Button>
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={paymentMethod === 'card' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 rounded-xl' 
                      : `h-12 rounded-xl ${
                          isDarkMode 
                            ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white' 
                            : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                        }`}
                  >
                    <CreditCard className="h-5 w-5 ml-2" />
                    بطاقة
                  </Button>
                </div>
              </div>

              {/* Total and Actions */}
              <div className="space-y-4">
                <Separator className={isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} />
                
                <div className={`rounded-xl p-4 ${
                  isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center justify-between text-2xl font-bold">
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>الإجمالي:</span>
                    <span className={`text-3xl ${
                      isDarkMode ? 'text-emerald-400' : 'text-green-600'
                    }`}>{calculateTotal().toFixed(2)} ر.س</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className={`h-14 rounded-xl font-bold transition-all hover:bg-red-600 hover:text-white text-red-400 ${
                      isDarkMode 
                        ? 'border-zinc-600 bg-zinc-800' 
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Trash2 className="h-5 w-5 ml-2" />
                    مسح الكل
                  </Button>
                  <Button
                    onClick={handleCompleteSale}
                    disabled={processSale.isPending || cart.length === 0}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg transition-all"
                  >
                    <Receipt className="h-5 w-5 ml-2" />
                    {processSale.isPending ? 'جاري المعالجة...' : 'إنهاء البيع'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}