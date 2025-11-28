import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard, 
  DollarSign,
  Receipt,
  User,
  Calculator,
  Package,
  ArrowLeft,
  Grid3X3,
  List,
  RefreshCw,
  CheckCircle,
  Clock,
  TrendingUp,
  Barcode,
  Printer,
  Home,
  PlusCircle,
  X,
  Smartphone
} from "lucide-react";

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
  phone: string;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

export default function POSSystem() {
  const { branchId } = useParams();
  const queryClient = useQueryClient();
  
  // حالات النظام
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // جلب البيانات
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    enabled: !!branchId
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    enabled: !!branchId
  });

  const { data: dailySales = { sales: [], summary: { totalAmount: 0, totalTransactions: 0 } } } = useQuery({
    queryKey: [`/api/pos/daily-sales/${branchId}`],
    enabled: !!branchId
  });

  // إجراء البيع
  const saleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (!response.ok) throw new Error('فشل في معالجة البيع');
      return response.json();
    },
    onSuccess: () => {
      setCart([]);
      setSelectedClient(null);
      setAmountPaid('');
      setDiscount(0);
      setNotes('');
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/pos/daily-sales/${branchId}`] });
    }
  });

  // حسابات السلة
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.15; // ضريبة القيمة المضافة 15%
  const total = subtotal - discountAmount + tax;
  const change = parseFloat(amountPaid) - total;

  // تصفية المنتجات
  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(barcodeSearch))
  );

  // إضافة منتج للسلة
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * parseFloat(item.price) }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        quantity: 1,
        total: parseFloat(product.price)
      }]);
    }
  };

  // تحديث كمية المنتج
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, total: newQuantity * parseFloat(item.price) }
        : item
    ));
  };

  // إزالة منتج من السلة
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // معالجة الدفع
  const processSale = () => {
    if (cart.length === 0) return;

    const saleData = {
      branchId: parseInt(branchId!),
      clientId: selectedClient?.id,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        total: item.total
      })),
      total: subtotal,
      discount: discountAmount,
      tax,
      finalTotal: total,
      paymentMethod,
      notes
    };

    saleMutation.mutate(saleData);
  };

  // البحث بالباركود
  useEffect(() => {
    if (barcodeSearch.length >= 8) {
      const product = products.find((p: Product) => p.barcode === barcodeSearch);
      if (product) {
        addToCart(product);
        setBarcodeSearch('');
      }
    }
  }, [barcodeSearch, products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* شريط علوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <div className="flex items-center bg-blue-100 rounded-lg p-2 ml-3">
                  <CreditCard className="h-6 w-6 text-blue-600 ml-2" />
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">نقطة البيع الاحترافية</h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                فرع {branchId}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 ml-1" />
                  المبيعات اليوم: {dailySales.summary?.totalAmount?.toFixed(2) || '0.00'} ر.س
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                <Clock className="h-3 w-3 ml-1" />
                {new Date().toLocaleTimeString('en-US')}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/branch/${branchId}`}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                العودة للفرع
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* قسم المنتجات */}
          <div className="lg:col-span-2 space-y-6">
            {/* البحث والتحكم */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 ml-2" />
                    المنتجات المتاحة
                  </CardTitle>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="text-white hover:bg-white/20"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="text-white hover:bg-white/20"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="البحث في المنتجات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Barcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="مسح الباركود..."
                      value={barcodeSearch}
                      onChange={(e) => setBarcodeSearch(e.target.value)}
                      className="pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* عرض المنتجات */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4">
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="mr-3 text-gray-600">جاري تحميل المنتجات...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product: Product) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-200 hover:border-blue-300"
                            onClick={() => addToCart(product)}
                          >
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Package className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                  {product.name}
                                </h3>
                                <div className="space-y-1">
                                  <p className="text-lg font-bold text-blue-600">
                                    {parseFloat(product.price).toFixed(2)} ر.س
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    المخزون: {product.stock} {product.unit}
                                  </p>
                                  <Badge 
                                    variant={product.stock > 10 ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {product.stock > 10 ? 'متوفر' : 'مخزون قليل'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredProducts.map((product: Product) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer transition-all duration-200 hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                            onClick={() => addToCart(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 space-x-reverse">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">
                                      {product.code} • المخزون: {product.stock} {product.unit}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="text-lg font-bold text-blue-600">
                                    {parseFloat(product.price).toFixed(2)} ر.س
                                  </p>
                                  <Badge 
                                    variant={product.stock > 10 ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {product.stock > 10 ? 'متوفر' : 'مخزون قليل'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* قسم السلة والدفع */}
          <div className="space-y-6">
            {/* معلومات العميل */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 ml-2" />
                  العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedClient ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedClient.name}</p>
                      <p className="text-sm text-gray-500">{selectedClient.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(null)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50"
                    onClick={() => setShowClientDialog(true)}
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    اختيار عميل
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* السلة */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 ml-2" />
                    السلة
                  </div>
                  <Badge variant="secondary" className="bg-white text-purple-700">
                    {cart.length} عنصر
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mb-3 text-gray-300" />
                      <p>السلة فارغة</p>
                      <p className="text-sm">اضغط على المنتجات لإضافتها</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {item.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-left">
                              <p className="text-sm text-gray-500">
                                {parseFloat(item.price).toFixed(2)} × {item.quantity}
                              </p>
                              <p className="font-semibold text-purple-600">
                                {item.total.toFixed(2)} ر.س
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* الملخص والدفع */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 ml-2" />
                  ملخص الفاتورة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-semibold">{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الخصم:</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-xs"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs text-gray-500">%</span>
                      <span className="font-semibold text-red-600">
                        -{discountAmount.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
                    <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">المجموع النهائي:</span>
                    <span className="font-bold text-orange-600">{total.toFixed(2)} ر.س</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 ml-2" />
                    مسح السلة
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={cart.length === 0 || saleMutation.isPending}
                  >
                    {saleMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <DollarSign className="h-4 w-4 ml-2" />
                    )}
                    {saleMutation.isPending ? 'جاري المعالجة...' : 'إتمام البيع'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* نافذة اختيار العميل */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>اختيار عميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-dashed"
                onClick={() => {
                  setSelectedClient(null);
                  setShowClientDialog(false);
                }}
              >
                <User className="h-4 w-4 ml-2" />
                عميل نقدي (بدون عميل)
              </Button>
              {clients.map((client: Client) => (
                <Button
                  key={client.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientDialog(false);
                  }}
                >
                  <div className="text-right">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة الدفع */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>إتمام الدفع</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع النهائي:</span>
                <span className="text-orange-600">{total.toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المبلغ المدفوع</label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
                {parseFloat(amountPaid) > total && (
                  <p className="text-sm text-green-600 mt-1">
                    الباقي: {change.toFixed(2)} ر.س
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات (اختياري)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات..."
                />
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={processSale}
                disabled={!amountPaid || parseFloat(amountPaid) < total || saleMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saleMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 ml-2" />
                )}
                {saleMutation.isPending ? 'جاري المعالجة...' : 'تأكيد البيع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}