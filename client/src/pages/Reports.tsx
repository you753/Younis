import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BarChart3, FileText, TrendingUp, Download, Calendar, Filter, DollarSign, Package, Users, ShoppingCart, PrinterIcon, Search, Eye } from 'lucide-react';
import Calculator from '@/components/Calculator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage('التقارير المالية والإحصائيات');
  }, [setCurrentPage]);

  // Fetch data for reports
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate analytics data
  const salesArray = Array.isArray(sales) ? sales : [];
  const purchasesArray = Array.isArray(purchases) ? purchases : [];
  const productsArray = Array.isArray(products) ? products : [];
  const clientsArray = Array.isArray(clients) ? clients : [];

  const totalRevenue = salesArray.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
  const totalCosts = purchasesArray.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Monthly sales data
  const monthlySalesData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleDateString('ar-SA', { month: 'short' });
    const monthSales = salesArray.filter((sale: any) => {
      const saleDate = new Date(sale.date || sale.createdAt);
      return saleDate.getMonth() === i;
    });
    const monthPurchases = purchasesArray.filter((purchase: any) => {
      const purchaseDate = new Date(purchase.date || purchase.createdAt);
      return purchaseDate.getMonth() === i;
    });
    
    return {
      month,
      sales: monthSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0),
      purchases: monthPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0),
    };
  });

  // Top products by sales
  const productSalesMap = new Map();
  salesArray.forEach((sale: any) => {
    if (sale.items) {
      sale.items.forEach((item: any) => {
        const current = productSalesMap.get(item.productId) || 0;
        productSalesMap.set(item.productId, current + (item.quantity * item.unitPrice));
      });
    }
  });

  const topProducts = Array.from(productSalesMap.entries())
    .map(([productId, revenue]) => {
      const product = productsArray.find((p: any) => p.id === productId);
      return {
        name: product?.name || `منتج ${productId}`,
        revenue: revenue as number,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Inventory distribution
  const inventoryData = productsArray.map((product: any) => ({
    name: product.name,
    value: (product.quantity || 0) * parseFloat(product.salePrice || 0),
    quantity: product.quantity || 0
  })).filter((item: any) => item.value > 0).slice(0, 6);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header المحسن */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-blue-800 to-cyan-700 text-white rounded-2xl p-10 shadow-2xl mb-8 overflow-hidden">
          {/* خلفية زخرفية */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-cyan-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-300 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                      مركز التقارير المالية
                    </h1>
                    <p className="text-cyan-100 text-lg font-medium">
                      📊 نظام تحليل ذكي لمراقبة الأداء المالي وإدارة الأعمال بكفاءة عالية
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-44 bg-white/95 text-gray-800 border-0 shadow-lg">
                    <Calendar className="ml-2 h-4 w-4 text-blue-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">📅 اليوم</SelectItem>
                    <SelectItem value="week">📅 هذا الأسبوع</SelectItem>
                    <SelectItem value="month">📅 هذا الشهر</SelectItem>
                    <SelectItem value="quarter">📅 هذا الربع</SelectItem>
                    <SelectItem value="year">📅 هذا العام</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="secondary"
                  onClick={() => exportToCSV(salesArray, 'تقرير_مالي_شامل')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg px-6"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تصدير Excel
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => window.print()}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-lg px-6"
                >
                  <PrinterIcon className="ml-2 h-4 w-4" />
                  طباعة التقرير
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* مؤشرات الأداء الرئيسية المحسنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* بطاقة المبيعات */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-green-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-gray-700">💰 إجمالي المبيعات</CardTitle>
              <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-emerald-700 mb-3">{formatAmount(totalRevenue)}</div>
              <Badge className="bg-emerald-200 text-emerald-800 border-emerald-300 px-3 py-1 text-sm">
                📋 {salesArray.length} فاتورة مكتملة
              </Badge>
            </CardContent>
          </Card>

          {/* بطاقة المشتريات */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-rose-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-red-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-gray-700">🛒 إجمالي المشتريات</CardTitle>
              <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-red-700 mb-3">{formatAmount(totalCosts)}</div>
              <Badge className="bg-red-200 text-red-800 border-red-300 px-3 py-1 text-sm">
                📦 {purchasesArray.length} فاتورة مدفوعة
              </Badge>
            </CardContent>
          </Card>

          {/* بطاقة صافي الأرباح */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-gray-700">📈 صافي الأرباح</CardTitle>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-3xl font-bold mb-3 ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatAmount(netProfit)}
              </div>
              <Badge className={`px-3 py-1 text-sm ${netProfit >= 0 ? "bg-blue-200 text-blue-800 border-blue-300" : "bg-red-200 text-red-800 border-red-300"}`}>
                📊 {profitMargin.toFixed(1)}% هامش الربح
              </Badge>
            </CardContent>
          </Card>

          {/* بطاقة العملاء */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-violet-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-gray-700">👥 العملاء النشطون</CardTitle>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-purple-700 mb-3">{clientsArray.length}</div>
              <Badge className="bg-purple-200 text-purple-800 border-purple-300 px-3 py-1 text-sm">
                🎯 عميل مسجل
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* التقارير التفصيلية المحسنة */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-gradient-to-r from-gray-100 to-slate-200 rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <BarChart3 className="h-4 w-4" />
              📊 نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <DollarSign className="h-4 w-4" />
              💰 المبيعات
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <ShoppingCart className="h-4 w-4" />
              🛒 المشتريات
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <Package className="h-4 w-4" />
              📦 المخزون
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <TrendingUp className="h-4 w-4" />
              📈 التحليل المالي
            </TabsTrigger>
          </TabsList>

        {/* النظرة العامة */}
        <TabsContent value="overview" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-blue-800">اتجاه المبيعات والمشتريات الشهرية</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toFixed(2)} ر.س`, '']}
                      labelFormatter={(label) => `الشهر: ${label}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="المبيعات"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="purchases" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="المشتريات"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="text-green-800">أفضل المنتجات أداءً</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toFixed(2)} ر.س`, 'إجمالي المبيعات']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* آخر المعاملات */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
              <CardTitle className="text-gray-800">آخر العمليات المالية</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-right font-semibold">النوع</TableHead>
                    <TableHead className="text-right font-semibold">المبلغ</TableHead>
                    <TableHead className="text-right font-semibold">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold">الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...salesArray.slice(-5), ...purchasesArray.slice(-5)]
                    .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                    .slice(0, 8)
                    .map((transaction: any, index: number) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge variant={transaction.clientId ? "default" : "secondary"} className="px-3 py-1">
                          {transaction.clientId ? "💰 مبيعات" : "🛒 مشتريات"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-bold text-lg ${transaction.clientId ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(transaction.total)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(transaction.createdAt || transaction.date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-gray-700">{transaction.notes || 'لا توجد ملاحظات'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقارير المبيعات */}
        <TabsContent value="sales" className="space-y-6 mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                تقرير المبيعات التفصيلي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <Input
                  placeholder="🔍 البحث في الفواتير (رقم الفاتورة، العميل، المبلغ)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md border-2 border-gray-200 focus:border-green-500"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="text-right font-bold text-green-800">رقم الفاتورة</TableHead>
                    <TableHead className="text-right font-bold text-green-800">التاريخ</TableHead>
                    <TableHead className="text-right font-bold text-green-800">العميل</TableHead>
                    <TableHead className="text-right font-bold text-green-800">المبلغ الإجمالي</TableHead>
                    <TableHead className="text-right font-bold text-green-800">حالة الدفع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesArray.slice(0, 12).map((sale: any) => (
                    <TableRow key={sale.id} className="hover:bg-green-25 border-green-100">
                      <TableCell className="font-medium text-blue-600">#{sale.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell className="text-gray-600">{new Date(sale.date || sale.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell className="font-medium">
                        {clientsArray.find((c: any) => c.id === sale.clientId)?.name || 'عميل غير محدد'}
                      </TableCell>
                      <TableCell className="font-bold text-green-600 text-lg">{formatAmount(sale.total)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                          ✅ مدفوعة
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقارير المشتريات */}
        <TabsContent value="purchases" className="space-y-6 mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-lg">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                تقرير المشتريات التفصيلي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50 border-red-200">
                    <TableHead className="text-right font-bold text-red-800">رقم الفاتورة</TableHead>
                    <TableHead className="text-right font-bold text-red-800">التاريخ</TableHead>
                    <TableHead className="text-right font-bold text-red-800">المورد</TableHead>
                    <TableHead className="text-right font-bold text-red-800">المبلغ الإجمالي</TableHead>
                    <TableHead className="text-right font-bold text-red-800">حالة الاستلام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasesArray.slice(0, 12).map((purchase: any) => (
                    <TableRow key={purchase.id} className="hover:bg-red-25 border-red-100">
                      <TableCell className="font-medium text-blue-600">#{purchase.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell className="text-gray-600">{new Date(purchase.date || purchase.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell className="font-medium">{purchase.supplierName || 'مورد غير محدد'}</TableCell>
                      <TableCell className="font-bold text-red-600 text-lg">{formatAmount(purchase.total)}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 border-red-300 px-3 py-1">
                          ✅ مستلمة
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقارير المخزون */}
        <TabsContent value="inventory" className="space-y-6 mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Package className="h-5 w-5" />
                تقرير المخزون والمنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 border-blue-200">
                    <TableHead className="text-right font-bold text-blue-800">اسم المنتج</TableHead>
                    <TableHead className="text-right font-bold text-blue-800">الكود</TableHead>
                    <TableHead className="text-right font-bold text-blue-800">الكمية المتوفرة</TableHead>
                    <TableHead className="text-right font-bold text-blue-800">سعر البيع</TableHead>
                    <TableHead className="text-right font-bold text-blue-800">القيمة الإجمالية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsArray.slice(0, 12).map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-blue-25 border-blue-100">
                      <TableCell className="font-medium text-gray-800">{product.name}</TableCell>
                      <TableCell className="text-blue-600 font-mono">{product.code}</TableCell>
                      <TableCell className="font-bold text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          (product.quantity || 0) > 10 ? 'bg-green-100 text-green-800' : 
                          (product.quantity || 0) > 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">{formatAmount(product.salePrice)}</TableCell>
                      <TableCell className="font-bold text-purple-600 text-lg">
                        {formatAmount((product.quantity || 0) * parseFloat(product.salePrice || '0'))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التحليل المالي */}
        <TabsContent value="financial" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  بيان الأرباح والخسائر
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <span className="font-bold text-gray-700">💰 إجمالي الإيرادات</span>
                  <span className="font-bold text-green-700 text-xl">{formatAmount(totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <span className="font-bold text-gray-700">🛒 إجمالي المصروفات</span>
                  <span className="font-bold text-red-700 text-xl">{formatAmount(totalCosts)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-300 shadow-md">
                  <span className="font-bold text-gray-800 text-lg">📈 صافي الربح</span>
                  <span className={`font-bold text-2xl ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatAmount(netProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="font-bold text-gray-700">📊 هامش الربح</span>
                  <span className="font-bold text-purple-700 text-xl">{profitMargin.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  المؤشرات الرئيسية للأداء
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{salesArray.length}</div>
                    <div className="text-sm text-gray-600 font-medium">📋 إجمالي الفواتير</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-green-600 mb-2">{clientsArray.length}</div>
                    <div className="text-sm text-gray-600 font-medium">👥 العملاء المسجلين</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{productsArray.length}</div>
                    <div className="text-sm text-gray-600 font-medium">📦 المنتجات المتوفرة</div>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {salesArray.length > 0 ? formatAmount(totalRevenue / salesArray.length) : '0 ر.س'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">💳 متوسط قيمة الفاتورة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

        {/* الآلة الحاسبة */}
        <Calculator />
      </div>
    </div>
  );
}