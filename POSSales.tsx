import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Receipt, 
  Search, 
  Calendar,
  DollarSign,
  User,
  Package,
  CreditCard,
  Clock,
  Filter,
  Download,
  Eye,
  Printer,
  Home,
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  CheckCircle
} from "lucide-react";

interface POSSale {
  id: number;
  saleNumber: string;
  date: string;
  time: string;
  clientName?: string;
  clientPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  terminalName: string;
  cashierName: string;
  status: 'completed' | 'refunded' | 'cancelled';
}

export default function POSSales() {
  const { branchId } = useParams();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<POSSale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // جلب بيانات المبيعات من API
  const { data: salesData, isLoading } = useQuery({
    queryKey: [`/api/pos/daily-sales/${branchId}`],
    enabled: !!branchId
  });

  // بيانات وهمية للمبيعات (يمكن استبدالها بـ API حقيقي)
  const sales: POSSale[] = [
    {
      id: 1,
      saleNumber: "POS-2024-001",
      date: "2024-06-18",
      time: "14:30",
      clientName: "أحمد محمد الشهري",
      clientPhone: "0501234567",
      items: [
        { name: "مياه الهدا 500مل", quantity: 2, price: 1.5, total: 3.0 },
        { name: "كولا بيبسي 330مل", quantity: 1, price: 2.5, total: 2.5 },
        { name: "خبز أبيض طازج", quantity: 1, price: 3.0, total: 3.0 }
      ],
      subtotal: 8.5,
      discount: 0,
      tax: 1.28,
      total: 9.78,
      paymentMethod: "cash",
      terminalName: "محطة الكاشير الرئيسي",
      cashierName: "يونس المدير",
      status: "completed"
    },
    {
      id: 2,
      saleNumber: "POS-2024-002",
      date: "2024-06-18",
      time: "15:45",
      items: [
        { name: "حليب المراعي كامل الدسم 1لتر", quantity: 1, price: 8.5, total: 8.5 },
        { name: "تفاح أحمر", quantity: 0.5, price: 12.0, total: 6.0 }
      ],
      subtotal: 14.5,
      discount: 1.45,
      tax: 1.96,
      total: 15.01,
      paymentMethod: "card",
      terminalName: "محطة الكاشير الثانوي",
      cashierName: "سارة أحمد",
      status: "completed"
    },
    {
      id: 3,
      saleNumber: "POS-2024-003",
      date: "2024-06-18",
      time: "16:20",
      clientName: "فاطمة الحزمي",
      clientPhone: "0503695847",
      items: [
        { name: "بندورة طازجة", quantity: 1, price: 6.5, total: 6.5 },
        { name: "خبز أبيض طازج", quantity: 2, price: 3.0, total: 6.0 }
      ],
      subtotal: 12.5,
      discount: 0,
      tax: 1.88,
      total: 14.38,
      paymentMethod: "transfer",
      terminalName: "محطة التوصيل السريع",
      cashierName: "محمد علي",
      status: "completed"
    }
  ];

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter;
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const averageSale = totalAmount / totalSales;

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: "نقدي",
      card: "بطاقة ائتمان",
      transfer: "تحويل بنكي"
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "مكتمل", className: "bg-green-100 text-green-800" },
      refunded: { label: "مسترد", className: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "ملغي", className: "bg-red-100 text-red-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const viewSaleDetails = (sale: POSSale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  const printReceipt = (sale: POSSale) => {
    console.log('Printing receipt for sale:', sale.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
      {/* شريط علوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-green-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">مبيعات نقاط البيع</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                فرع {branchId}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                <Clock className="h-3 w-3 ml-1" />
                اليوم: {totalSales} معاملة
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
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-blue-600">{totalAmount.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">متوسط البيع</p>
                  <p className="text-2xl font-bold text-purple-600">{averageSale.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المبيعات المكتملة</p>
                  <p className="text-2xl font-bold text-orange-600">{completedSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أدوات البحث والفلترة */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 ml-2" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المبيعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فترة زمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="yesterday">أمس</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطرق</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="refunded">مسترد</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المبيعات */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 ml-2" />
                سجل المبيعات
              </CardTitle>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <h3 className="font-semibold text-gray-900">{sale.saleNumber}</h3>
                            {getStatusBadge(sale.status)}
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-green-600">{sale.total.toFixed(2)} ر.س</p>
                            <p className="text-sm text-gray-500">{getPaymentMethodLabel(sale.paymentMethod)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 ml-2" />
                            {sale.date} - {sale.time}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 ml-2" />
                            {sale.clientName || "عميل نقدي"}
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 ml-2" />
                            {sale.items.length} عنصر
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <span>المحطة: {sale.terminalName}</span>
                          <span className="mx-2">•</span>
                          <span>الكاشير: {sale.cashierName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse mr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewSaleDetails(sale)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          تفاصيل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printReceipt(sale)}
                        >
                          <Printer className="h-4 w-4 ml-1" />
                          طباعة
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* نافذة تفاصيل البيع */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل البيع - {selectedSale?.saleNumber}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* معلومات البيع */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">معلومات البيع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم البيع:</span>
                      <span>{selectedSale.saleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span>{selectedSale.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الوقت:</span>
                      <span>{selectedSale.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المحطة:</span>
                      <span>{selectedSale.terminalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الكاشير:</span>
                      <span>{selectedSale.cashierName}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">معلومات العميل</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span>{selectedSale.clientName || "عميل نقدي"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الهاتف:</span>
                      <span>{selectedSale.clientPhone || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span>{getPaymentMethodLabel(selectedSale.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span>{getStatusBadge(selectedSale.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* تفاصيل المنتجات */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">تفاصيل المنتجات</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">المنتج</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">الكمية</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">السعر</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSale.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.price.toFixed(2)} ر.س</td>
                          <td className="px-4 py-2 text-sm text-left font-medium">{item.total.toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ملخص المبالغ */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span>{selectedSale.subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="text-red-600">-{selectedSale.discount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ضريبة القيمة المضافة:</span>
                    <span>{selectedSale.tax.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>المجموع النهائي:</span>
                    <span className="text-green-600">{selectedSale.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              {/* أزرار العمل */}
              <div className="flex space-x-3 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowSaleDetails(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => printReceipt(selectedSale)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة الفاتورة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}