import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2,
  Package,
  CheckCircle,
  Timer,
  Store,
  UserPlus,
  CreditCard,
  DollarSign,
  Clock,
  User,
  Printer,
  Download,
  ArrowRight
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit?: number;
  currentDebt?: number;
}

type PaymentMethod = 'cash' | 'card' | 'credit';

export default function ExternalPOS() {
  const { branchId } = useParams<{ branchId: string }>();
  const defaultBranchId = branchId || '8';
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: ''
  });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch branch data (public endpoint)
  const { data: branch } = useQuery({
    queryKey: [`/api/public/branches/${defaultBranchId}`],
    queryFn: async () => {
      const response = await fetch(`/api/public/branches/${defaultBranchId}`);
      if (!response.ok) throw new Error('فشل في تحميل بيانات الفرع');
      return response.json();
    },
    enabled: !!defaultBranchId
  });

  // Fetch products for this branch (public endpoint)
  const { data: products = [] } = useQuery({
    queryKey: [`/api/public/branches/${defaultBranchId}/products`],
    queryFn: async () => {
      const response = await fetch(`/api/public/branches/${defaultBranchId}/products`);
      if (!response.ok) throw new Error('فشل في تحميل المنتجات');
      return response.json();
    },
    enabled: !!defaultBranchId
  });

  // Fetch existing customers for this branch
  const { data: existingCustomers = [] } = useQuery({
    queryKey: [`/api/public/branches/${defaultBranchId}/customers`],
    queryFn: async () => {
      const response = await fetch(`/api/public/branches/${defaultBranchId}/customers`);
      if (!response.ok) throw new Error('فشل في تحميل العملاء');
      return response.json();
    },
    enabled: !!defaultBranchId
  });

  // Fetch company information
  const { data: companyInfo } = useQuery({
    queryKey: ['/api/public/company-info'],
    queryFn: async () => {
      const response = await fetch('/api/public/company-info');
      if (!response.ok) throw new Error('فشل في تحميل بيانات الشركة');
      return response.json();
    }
  });

  // Filter products based on search term
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        code: product.code,
        price: parseFloat(product.price),
        quantity: 1,
        total: parseFloat(product.price)
      };
      setCart([...cart, newItem]);
    }
    
    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
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

  const clearCart = () => {
    setCart([]);
    toast({
      title: "تم مسح السلة",
      description: "تم مسح جميع المنتجات من السلة",
    });
  };

  // Add customer mutation to save to branch database
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await fetch(`/api/public/branches/${defaultBranchId}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        throw new Error('فشل في إضافة العميل');
      }
      
      return response.json();
    },
    onSuccess: (newCustomer) => {
      setSelectedCustomer(newCustomer);
      setShowAddCustomer(false);
      setCustomerFormData({ name: '', phone: '', email: '', address: '', creditLimit: '' });
      
      // Refresh customers list
      queryClient.invalidateQueries({ queryKey: [`/api/public/branches/${defaultBranchId}/customers`] });
      
      toast({
        title: "تم إضافة العميل",
        description: `تم إضافة العميل ${newCustomer.name} بنجاح وحفظه في نظام الفرع`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة العميل",
        description: error.message || "حدث خطأ أثناء إضافة العميل",
        variant: "destructive",
      });
    }
  });

  // Add customer function
  const handleAddCustomer = () => {
    if (!customerFormData.name || !customerFormData.phone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم العميل ورقم الهاتف على الأقل",
        variant: "destructive",
      });
      return;
    }

    addCustomerMutation.mutate({
      name: customerFormData.name,
      phone: customerFormData.phone,
      email: customerFormData.email,
      address: customerFormData.address,
      creditLimit: customerFormData.creditLimit ? parseFloat(customerFormData.creditLimit) : 0
    });
  };

  // Process sale mutation (public endpoint)
  const processSale = useMutation({
    mutationFn: async () => {
      const saleData = {
        branchId: parseInt(defaultBranchId),
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        total: calculateTotal(),
        paymentMethod: paymentMethod
      };
      
      const response = await fetch('/api/public/pos/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) {
        throw new Error('فشل في معالجة البيع');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentInvoice(data);
      setShowInvoiceDialog(true);
      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/public/branches/${defaultBranchId}/products`] });
      
      toast({
        title: "تم إنهاء البيع بنجاح",
        description: `تم حفظ الفاتورة رقم ${data.saleNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنهاء البيع",
        description: error.message || "حدث خطأ أثناء معالجة البيع",
        variant: "destructive",
      });
    }
  });

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateTotal();
    return subtotal * 0.15; // 15% tax
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

  // PDF Generation Function
  const generatePDF = async () => {
    try {
      const invoiceElement = document.querySelector('.invoice-content') as HTMLElement;
      if (!invoiceElement) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على محتوى الفاتورة",
          variant: "destructive"
        });
        return;
      }

      // Create canvas from invoice element
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with invoice number and date
      const filename = `فاتورة-${currentInvoice?.saleNumber || 'غير محدد'}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
      
      // Save PDF
      pdf.save(filename);

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ الفاتورة كملف PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في إنشاء PDF",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
        {/* Back to Main System Button */}
        <div className="mb-4">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للنظام الرئيسي
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-blue-500 p-3 rounded-full">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {branch?.name || 'نقطة البيع'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentTime.toLocaleString('en-US')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Timer className="h-5 w-5 text-blue-500" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString('en-US')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Package className="h-6 w-6 ml-2 text-blue-500" />
                    المنتجات
                  </h2>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {products.length} منتج
                  </Badge>
                </div>
                
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="البحث في المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {product.code}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {parseFloat(product.price).toFixed(2)} ر.س
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {product.quantity} {product.unit}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden h-fit">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ShoppingCart className="h-6 w-6 ml-2 text-green-500" />
                  السلة ({cart.length})
                </h2>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-6 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">السلة فارغة</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.code}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0 border-gray-300 hover:bg-gray-50 rounded-md"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0 border-gray-300 hover:bg-gray-50 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-left">
                            <div className="text-green-600 font-bold text-lg">
                              {item.total.toFixed(2)} ر.س
                            </div>
                            <div className="text-gray-500 text-xs">
                              {item.price.toFixed(2)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Section */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">العميل</span>
                      <div className="flex gap-2">
                        <Select 
                          onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddCustomer(true);
                              return;
                            }
                            const customer = existingCustomers.find((c: any) => c.id.toString() === value);
                            if (customer) {
                              setSelectedCustomer(customer);
                              toast({
                                title: "تم تحديد العميل",
                                description: `تم اختيار العميل: ${customer.name}`,
                              });
                            }
                          }}
                          value={selectedCustomer?.id.toString() || ""}
                        >
                          <SelectTrigger className="w-48 h-9">
                            <SelectValue placeholder="اختر عميل موجود" />
                          </SelectTrigger>
                          <SelectContent>
                            {existingCustomers.length > 0 ? (
                              <>
                                {existingCustomers.map((customer: any) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className="text-xs text-gray-500">{customer.phone}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                                <SelectItem value="add_new" className="border-t mt-1 pt-2">
                                  <div className="flex items-center text-blue-600">
                                    <UserPlus className="h-4 w-4 ml-2" />
                                    إضافة عميل جديد
                                  </div>
                                </SelectItem>
                              </>
                            ) : (
                              <SelectItem value="add_new">
                                <div className="flex items-center text-blue-600">
                                  <UserPlus className="h-4 w-4 ml-2" />
                                  إضافة أول عميل
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                              <UserPlus className="h-4 w-4 ml-2" />
                              جديد
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>إضافة عميل جديد</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="customerName">اسم العميل *</Label>
                                <Input
                                  id="customerName"
                                  value={customerFormData.name}
                                  onChange={(e) => setCustomerFormData(prev => ({...prev, name: e.target.value}))}
                                  placeholder="أدخل اسم العميل"
                                />
                              </div>
                              <div>
                                <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                                <Input
                                  id="customerPhone"
                                  value={customerFormData.phone}
                                  onChange={(e) => setCustomerFormData(prev => ({...prev, phone: e.target.value}))}
                                  placeholder="أدخل رقم الهاتف"
                                />
                              </div>
                              <div>
                                <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  value={customerFormData.email}
                                  onChange={(e) => setCustomerFormData(prev => ({...prev, email: e.target.value}))}
                                  placeholder="أدخل البريد الإلكتروني"
                                />
                              </div>
                              <div>
                                <Label htmlFor="customerAddress">العنوان</Label>
                                <Input
                                  id="customerAddress"
                                  value={customerFormData.address}
                                  onChange={(e) => setCustomerFormData(prev => ({...prev, address: e.target.value}))}
                                  placeholder="أدخل العنوان"
                                />
                              </div>
                              <div>
                                <Label htmlFor="creditLimit">الحد الائتماني</Label>
                                <Input
                                  id="creditLimit"
                                  type="number"
                                  value={customerFormData.creditLimit}
                                  onChange={(e) => setCustomerFormData(prev => ({...prev, creditLimit: e.target.value}))}
                                  placeholder="أدخل الحد الائتماني"
                                />
                              </div>
                              <Button 
                                onClick={handleAddCustomer} 
                                disabled={addCustomerMutation.isPending}
                                className="w-full"
                              >
                                {addCustomerMutation.isPending ? 'جاري الحفظ...' : 'إضافة العميل'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {selectedCustomer ? (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">{selectedCustomer.name}</p>
                              <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(null)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            إزالة
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-600 text-center">لم يتم تحديد عميل</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Section */}
                  <div className="space-y-3">
                    <span className="text-lg font-bold text-gray-900">طريقة الدفع</span>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('cash')}
                        className={`h-12 ${paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                      >
                        <DollarSign className="h-5 w-5 ml-2" />
                        نقداً
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('card')}
                        className={`h-12 ${paymentMethod === 'card' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}`}
                      >
                        <CreditCard className="h-5 w-5 ml-2" />
                        شبكة
                      </Button>
                      <Button
                        variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                        onClick={() => {
                          if (selectedCustomer) {
                            setPaymentMethod('credit');
                          } else {
                            toast({
                              title: "يجب تحديد عميل",
                              description: "يرجى تحديد عميل أولاً للدفع الآجل",
                              variant: "destructive",
                            });
                          }
                        }}
                        className={`h-12 ${paymentMethod === 'credit' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'border-gray-300 hover:bg-orange-50'} ${!selectedCustomer && paymentMethod !== 'credit' ? 'opacity-70' : ''}`}
                      >
                        <Clock className="h-5 w-5 ml-2" />
                        آجل
                      </Button>
                    </div>
                    {paymentMethod === 'credit' && !selectedCustomer && (
                      <p className="text-sm text-orange-600 text-center">يجب تحديد عميل للدفع الآجل</p>
                    )}
                  </div>
                </div>
              )}

              {/* Checkout Section */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-6 space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">المجموع الفرعي:</span>
                      <span className="text-gray-900 font-semibold">
                        {calculateTotal().toFixed(2)} ر.س
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">الضريبة (15%):</span>
                      <span className="text-gray-900 font-semibold">
                        {calculateTax().toFixed(2)} ر.س
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-2">
                      <div className="flex items-center justify-between text-2xl font-bold">
                        <span className="text-gray-900">الإجمالي النهائي:</span>
                        <span className="text-green-600 text-3xl">
                          {calculateFinalTotal().toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-12 rounded-xl font-bold"
                    >
                      <Trash2 className="h-5 w-5 ml-2" />
                      مسح الكل
                    </Button>
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      disabled={cart.length === 0 || (paymentMethod === 'credit' && !selectedCustomer)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-12 rounded-xl font-bold text-base shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5 ml-2" />
                      إنهاء البيع
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد عملية البيع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>الإجمالي:</span>
                <span className="font-bold text-green-600">{calculateTotal().toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>العميل:</span>
                <span className="font-medium">{selectedCustomer?.name || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة الدفع:</span>
                <span className="font-medium">
                  {paymentMethod === 'cash' && 'نقداً'}
                  {paymentMethod === 'card' && 'شبكة'}
                  {paymentMethod === 'credit' && 'آجل'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => processSale.mutate()}
                disabled={processSale.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processSale.isPending ? 'جاري المعالجة...' : 'تأكيد البيع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl mx-auto print:max-w-full print:shadow-none p-6" dir="rtl">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-center text-lg font-bold text-green-600">
              فاتورة البيع
            </DialogTitle>
          </DialogHeader>
          
          {currentInvoice && (
            <div className="bg-white print:bg-white">
              {/* Invoice for Print */}
              <div className="invoice-content print:p-8">
                {/* Company Header */}
                <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">
                    {companyInfo?.arabicName || companyInfo?.name || ''}
                  </h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    {branch?.name || 'الفرع الرئيسي'}
                  </h2>
                  <div className="text-gray-600 space-y-1">
                    <p>الرقم الضريبي: {companyInfo?.taxNumber || '300000000000003'}</p>
                    {companyInfo?.commercialRegister && (
                      <p>السجل التجاري: {companyInfo.commercialRegister}</p>
                    )}
                    <p>العنوان: {companyInfo?.address || branch?.address || 'الرياض، المملكة العربية السعودية'}</p>
                    <p>المدينة: {companyInfo?.city || 'الرياض'} - {companyInfo?.country || 'المملكة العربية السعودية'}</p>
                    <p>الهاتف: {companyInfo?.phone || branch?.phone || '+966 11 234 5678'}</p>
                    <p>البريد الإلكتروني: {companyInfo?.email || branch?.email || 'info@almohasebalazam.com'}</p>
                    {branch?.code && <p>كود الفرع: {branch.code}</p>}
                    {companyInfo?.website && <p>الموقع الإلكتروني: {companyInfo.website}</p>}
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">معلومات الفاتورة</h3>
                    <div className="space-y-2">
                      <p><span className="font-semibold">رقم الفاتورة:</span> {currentInvoice.saleNumber}</p>
                      <p><span className="font-semibold">التاريخ:</span> {new Date(currentInvoice.date).toLocaleDateString('en-GB')}</p>
                      <p><span className="font-semibold">الوقت:</span> {new Date().toLocaleTimeString('en-US')}</p>
                      <p><span className="font-semibold">طريقة الدفع:</span> 
                        {currentInvoice.paymentMethod === 'cash' && 'نقداً'}
                        {currentInvoice.paymentMethod === 'card' && 'شبكة'}
                        {currentInvoice.paymentMethod === 'credit' && 'آجل'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">معلومات العميل</h3>
                    {currentInvoice.customerId ? (
                      <div className="space-y-2">
                        <p><span className="font-semibold">الاسم:</span> {existingCustomers?.find((c: any) => c.id === currentInvoice.customerId)?.name}</p>
                        <p><span className="font-semibold">الهاتف:</span> {existingCustomers?.find((c: any) => c.id === currentInvoice.customerId)?.phone}</p>
                      </div>
                    ) : (
                      <p className="text-gray-600">عميل مرور</p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-right">الصنف</th>
                        <th className="border border-gray-300 p-3 text-center">الكمية</th>
                        <th className="border border-gray-300 p-3 text-center">السعر</th>
                        <th className="border border-gray-300 p-3 text-center">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item: any, index: number) => {
                        const product = products?.find((p: any) => p.id === item.productId);
                        return (
                          <tr key={index} className="border-b">
                            <td className="border border-gray-300 p-3">
                              <div>
                                <p className="font-medium">{product?.name}</p>
                                <p className="text-sm text-gray-600">{product?.code}</p>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                            <td className="border border-gray-300 p-3 text-center">{item.price.toFixed(2)} ر.س</td>
                            <td className="border border-gray-300 p-3 text-center font-semibold">{item.total.toFixed(2)} ر.س</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-80">
                    <div className="border border-gray-300 bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>المجموع الفرعي:</span>
                          <span className="font-semibold">{currentInvoice.total.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>الضريبة المضافة (15%):</span>
                          <span className="font-semibold">{currentInvoice.tax.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-gray-400 pt-3 text-lg font-bold">
                          <span>الإجمالي النهائي:</span>
                          <span className="text-green-600">{currentInvoice.finalTotal.toFixed(2)} ر.س</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center text-gray-600">
                  <p className="mb-2">شكراً لتعاملكم معنا</p>
                  <p className="text-sm">نسعد بخدمتكم دائماً</p>
                  <div className="mt-4 text-xs">
                    <p>تم الإنشاء بواسطة: نظام نقطة البيع</p>
                    <p>تاريخ الطباعة: {new Date().toLocaleString('en-US')}</p>
                  </div>
                </div>
              </div>

              {/* Actions - Hidden in print */}
              <div className="flex gap-2 pt-4 print:hidden">
                <Button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => generatePDF()}
                >
                  <Download className="w-4 h-4 ml-2" />
                  حفظ PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowInvoiceDialog(false)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}