import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  PieChart,
  Home,
  RefreshCw,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  Clock,
  Target,
  Activity
} from "lucide-react";

export default function POSReports() {
  const { branchId } = useParams();
  
  const [reportType, setReportType] = useState("daily");
  const [dateFrom, setDateFrom] = useState("2024-06-18");
  const [dateTo, setDateTo] = useState("2024-06-18");

  // إحصائيات المبيعات
  const salesStats = {
    totalSales: 45,
    totalAmount: 1247.85,
    averageSale: 27.73,
    topSellingItems: [
      { name: "مياه الهدا 500مل", quantity: 15, revenue: 22.50 },
      { name: "كولا بيبسي 330مل", quantity: 12, revenue: 30.00 },
      { name: "خبز أبيض طازج", quantity: 10, revenue: 30.00 }
    ],
    paymentMethods: [
      { method: "نقدي", count: 25, percentage: 55.6 },
      { method: "بطاقة ائتمان", count: 15, percentage: 33.3 },
      { method: "تحويل بنكي", count: 5, percentage: 11.1 }
    ],
    hourlySales: [
      { hour: "09:00", sales: 3, amount: 45.20 },
      { hour: "10:00", sales: 5, amount: 78.50 },
      { hour: "11:00", sales: 8, amount: 156.30 },
      { hour: "12:00", sales: 12, amount: 234.75 },
      { hour: "13:00", sales: 7, amount: 189.40 },
      { hour: "14:00", sales: 10, amount: 298.70 }
    ]
  };

  const terminalStats = [
    {
      name: "محطة الكاشير الرئيسي",
      sales: 25,
      amount: 687.45,
      percentage: 55.1,
      status: "نشط"
    },
    {
      name: "محطة الكاشير الثانوي",
      sales: 15,
      amount: 412.30,
      percentage: 33.0,
      status: "نشط"
    },
    {
      name: "محطة التوصيل السريع",
      sales: 5,
      amount: 148.10,
      percentage: 11.9,
      status: "متوقف"
    }
  ];

  const generateReport = () => {
    console.log('Generating report for:', reportType, 'from', dateFrom, 'to', dateTo);
  };

  const exportReport = (format: string) => {
    console.log('Exporting report as:', format);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100" dir="rtl">
      {/* شريط علوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">تقارير نقاط البيع</h1>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                فرع {branchId}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                <Calendar className="h-3 w-3 ml-1" />
                {dateFrom} إلى {dateTo}
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
        {/* إعدادات التقرير */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 ml-2" />
              إعدادات التقرير
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">تقرير ساعي</SelectItem>
                  <SelectItem value="daily">تقرير يومي</SelectItem>
                  <SelectItem value="weekly">تقرير أسبوعي</SelectItem>
                  <SelectItem value="monthly">تقرير شهري</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="من تاريخ"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="إلى تاريخ"
              />

              <Button onClick={generateReport} className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="h-4 w-4 ml-2" />
                إنشاء التقرير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{salesStats.totalSales}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 ml-1" />
                    +12% من أمس
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">{salesStats.totalAmount.toFixed(2)} ر.س</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 ml-1" />
                    +8.5% من أمس
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">متوسط البيع</p>
                  <p className="text-2xl font-bold text-purple-600">{salesStats.averageSale.toFixed(2)} ر.س</p>
                  <p className="text-xs text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 ml-1" />
                    -2.1% من أمس
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">ذروة المبيعات</p>
                  <p className="text-2xl font-bold text-orange-600">12:00</p>
                  <p className="text-xs text-gray-500">أعلى نشاط</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* أفضل المنتجات مبيعاً */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 ml-2" />
                أفضل المنتجات مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {salesStats.topSellingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 ml-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-blue-600">{item.revenue.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* طرق الدفع */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 ml-2" />
                توزيع طرق الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {salesStats.paymentMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{method.method}</span>
                      <span className="text-sm text-gray-600">{method.count} معاملة ({method.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المبيعات حسب الساعة */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 ml-2" />
                المبيعات حسب الساعة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {salesStats.hourlySales.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-purple-600 ml-2" />
                        <span className="font-medium">{hour.hour}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-purple-600">{hour.amount.toFixed(2)} ر.س</p>
                        <p className="text-sm text-gray-500">{hour.sales} معاملة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* إحصائيات المحطات */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 ml-2" />
                أداء المحطات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {terminalStats.map((terminal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{terminal.name}</span>
                        <Badge 
                          variant={terminal.status === 'نشط' ? 'default' : 'secondary'}
                          className={`mr-2 ${terminal.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {terminal.status}
                        </Badge>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-orange-600">{terminal.amount.toFixed(2)} ر.س</p>
                        <p className="text-sm text-gray-500">{terminal.sales} معاملة</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${terminal.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-left">{terminal.percentage}% من إجمالي المبيعات</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}