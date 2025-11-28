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
import SimpleInvoiceReport from '@/components/SimpleInvoiceReport';
import PurchaseInvoiceReport from '@/components/PurchaseInvoiceReport';
import GeneralInvoiceReport from '@/components/GeneralInvoiceReport';
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
    const month = new Date(2024, i).toLocaleDateString('en-GB', { month: 'short' });
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
                  onClick={() => window.location.href = '/reports/daily'}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg px-6"
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  التقارير اليومية
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/reports/financial-health'}
                  className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg px-6"
                >
                  <TrendingUp className="ml-2 h-4 w-4" />
                  نقاط الصحة المالية
                </Button>
                
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

        {/* التقارير المتاحة */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">التقارير المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/daily'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50"
              >
                <Calendar className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">التقارير اليومية</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/financial-health'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50"
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">نقاط الصحة المالية</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/stock-valuation'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50"
              >
                <Package className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">مؤشر الصحة التفاعلي</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/purchases'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50"
              >
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">تقارير المشتريات</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/suppliers'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50"
              >
                <Users className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-medium">تقارير الموردين</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/inventory'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-teal-50"
              >
                <Package className="h-6 w-6 text-teal-600" />
                <span className="text-sm font-medium">تقارير المخزون</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/storage'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-cyan-50"
              >
                <Package className="h-6 w-6 text-cyan-600" />
                <span className="text-sm font-medium">تقارير المخازن</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/financial'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-emerald-50"
              >
                <DollarSign className="h-6 w-6 text-emerald-600" />
                <span className="text-sm font-medium">التقارير المالية</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/reports/employees'}
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-pink-50"
              >
                <Users className="h-6 w-6 text-pink-600" />
                <span className="text-sm font-medium">تقارير الموظفين</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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
          <TabsList className="grid w-full grid-cols-8 h-16 bg-gradient-to-r from-gray-100 to-slate-200 rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <BarChart3 className="h-4 w-4" />
              📊 نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <FileText className="h-4 w-4" />
              📄 تقرير فاتورة
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <PrinterIcon className="h-4 w-4" />
              🧾 الفواتير
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
            <TabsTrigger value="clients" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <Users className="h-4 w-4" />
              👥 العملاء
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2 h-12 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <TrendingUp className="h-4 w-4" />
              📈 التحليل المالي
            </TabsTrigger>
          </TabsList>

          {/* النظرة العامة المحسنة */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* مخطط اتجاه المبيعات والمشتريات */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    📈 اتجاه المبيعات والمشتريات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(2)} ر.س`, '']}
                        labelFormatter={(label) => `📅 الشهر: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        name="💰 المبيعات"
                        dot={{ fill: '#10b981', strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: '#059669' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="purchases" 
                        stroke="#ef4444" 
                        strokeWidth={4}
                        name="🛒 المشتريات"
                        dot={{ fill: '#ef4444', strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: '#dc2626' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* مخطط أفضل المنتجات */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    🏆 أفضل المنتجات أداءً
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(2)} ر.س`, '💰 إجمالي المبيعات']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#colorGradient)" 
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* آخر المعاملات المحسنة */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-gray-800 text-white rounded-t-2xl">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  📋 آخر العمليات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-gray-200 border-none">
                        <TableHead className="text-right font-bold text-slate-700 py-4">🏷️ النوع</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 py-4">💰 المبلغ</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 py-4">📅 التاريخ</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 py-4">📝 الملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...salesArray.slice(-5), ...purchasesArray.slice(-5)]
                        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                        .slice(0, 8)
                        .map((transaction: any, index: number) => (
                        <TableRow key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                          <TableCell className="py-4">
                            <Badge 
                              variant={transaction.clientId ? "default" : "secondary"} 
                              className={`px-4 py-2 text-sm font-bold rounded-full ${
                                transaction.clientId 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {transaction.clientId ? "💰 فاتورة مبيعات" : "🛒 فاتورة مشتريات"}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-bold text-xl py-4 ${transaction.clientId ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatAmount(transaction.total)}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium py-4">
                            {new Date(transaction.createdAt || transaction.date).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="text-slate-700 py-4">
                            {transaction.notes || '✅ عملية مكتملة بنجاح'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تقرير الفاتورة المطابق للصورة */}
          <TabsContent value="invoice" className="mt-8">
            <SimpleInvoiceReport />
          </TabsContent>

          {/* تقارير المبيعات المحسنة */}
          <TabsContent value="sales" className="space-y-8 mt-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-t-2xl">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign className="h-7 w-7" />
                  </div>
                  💰 تقرير المبيعات التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* شريط البحث المحسن */}
                <div className="mb-8 flex items-center gap-4">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                    <Input
                      placeholder="🔍 البحث في فواتير المبيعات (رقم الفاتورة، اسم العميل، المبلغ)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-12 h-12 border-2 border-emerald-200 focus:border-emerald-500 rounded-xl text-lg shadow-lg"
                    />
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 h-12 px-6 rounded-xl shadow-lg">
                    <Filter className="ml-2 h-5 w-5" />
                    تصفية
                  </Button>
                </div>

                {/* الجدول المحسن */}
                <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 shadow-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-emerald-500 to-green-600 border-none">
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📄 رقم الفاتورة</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📅 التاريخ</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">👤 العميل</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">💰 المبلغ الإجمالي</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">✅ حالة الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesArray.slice(0, 12).map((sale: any) => (
                        <TableRow key={sale.id} className="hover:bg-emerald-50 transition-all duration-200 border-b border-emerald-100">
                          <TableCell className="font-bold text-blue-600 py-4 text-lg">
                            #{sale.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell className="text-gray-700 font-medium py-4">
                            {new Date(sale.date || sale.createdAt).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="font-bold text-gray-800 py-4">
                            {clientsArray.find((c: any) => c.id === sale.clientId)?.name || 'عميل غير محدد'}
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 text-2xl py-4">
                            {formatAmount(sale.total)}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className="bg-emerald-200 text-emerald-800 border-emerald-400 px-4 py-2 text-sm font-bold rounded-full">
                              ✅ مدفوعة بالكامل
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تقارير المشتريات المحسنة */}
          <TabsContent value="purchases" className="space-y-8 mt-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-rose-50 to-red-50">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-t-2xl">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                  🛒 تقرير المشتريات التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="overflow-hidden rounded-2xl border-2 border-rose-200 shadow-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-rose-500 to-red-600 border-none">
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📄 رقم الفاتورة</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📅 التاريخ</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">🏪 المورد</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">💰 المبلغ الإجمالي</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📦 حالة الاستلام</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchasesArray.slice(0, 12).map((purchase: any) => (
                        <TableRow key={purchase.id} className="hover:bg-rose-50 transition-all duration-200 border-b border-rose-100">
                          <TableCell className="font-bold text-blue-600 py-4 text-lg">
                            #{purchase.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell className="text-gray-700 font-medium py-4">
                            {new Date(purchase.date || purchase.createdAt).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="font-bold text-gray-800 py-4">
                            {purchase.supplierName || 'مورد غير محدد'}
                          </TableCell>
                          <TableCell className="font-bold text-rose-600 text-2xl py-4">
                            {formatAmount(purchase.total)}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className="bg-rose-200 text-rose-800 border-rose-400 px-4 py-2 text-sm font-bold rounded-full">
                              ✅ مستلمة بالكامل
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تقارير المخزون المحسنة */}
          <TabsContent value="inventory" className="space-y-8 mt-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-t-2xl">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Package className="h-7 w-7" />
                  </div>
                  📦 تقرير المخزون والمنتجات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="overflow-hidden rounded-2xl border-2 border-cyan-200 shadow-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-cyan-500 to-blue-600 border-none">
                        <TableHead className="text-right font-bold text-white py-6 text-lg">🏷️ اسم المنتج</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">🔢 الكود</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">📊 الكمية المتوفرة</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">💰 سعر البيع</TableHead>
                        <TableHead className="text-right font-bold text-white py-6 text-lg">💎 القيمة الإجمالية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsArray.slice(0, 12).map((product: any) => (
                        <TableRow key={product.id} className="hover:bg-cyan-50 transition-all duration-200 border-b border-cyan-100">
                          <TableCell className="font-bold text-gray-800 py-4 text-lg">{product.name}</TableCell>
                          <TableCell className="text-blue-600 font-mono font-bold py-4">{product.code}</TableCell>
                          <TableCell className="font-bold text-center py-4">
                            <span className={`px-4 py-2 rounded-full text-lg font-bold ${
                              (product.quantity || 0) > 10 ? 'bg-emerald-200 text-emerald-800 border-2 border-emerald-300' : 
                              (product.quantity || 0) > 5 ? 'bg-amber-200 text-amber-800 border-2 border-amber-300' :
                              'bg-rose-200 text-rose-800 border-2 border-rose-300'
                            }`}>
                              {product.quantity || 0}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-cyan-600 py-4 text-xl">{formatAmount(product.salePrice)}</TableCell>
                          <TableCell className="font-bold text-purple-600 text-2xl py-4">
                            {formatAmount((product.quantity || 0) * parseFloat(product.salePrice || '0'))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* التحليل المالي المحسن */}
          <TabsContent value="financial" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* بيان الأرباح والخسائر */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-t-2xl">
                  <CardTitle className="text-white text-2xl font-bold flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    📊 بيان الأرباح والخسائر
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-center p-6 bg-emerald-100 rounded-2xl border-2 border-emerald-300 shadow-lg">
                    <span className="font-bold text-emerald-800 text-xl">💰 إجمالي الإيرادات</span>
                    <span className="font-bold text-emerald-700 text-3xl">{formatAmount(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-rose-100 rounded-2xl border-2 border-rose-300 shadow-lg">
                    <span className="font-bold text-rose-800 text-xl">🛒 إجمالي المصروفات</span>
                    <span className="font-bold text-rose-700 text-3xl">{formatAmount(totalCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-3 border-blue-400 shadow-xl">
                    <span className="font-bold text-blue-900 text-2xl">📈 صافي الربح</span>
                    <span className={`font-bold text-4xl ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {formatAmount(netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-purple-100 rounded-2xl border-2 border-purple-300 shadow-lg">
                    <span className="font-bold text-purple-800 text-xl">📊 هامش الربح</span>
                    <span className="font-bold text-purple-700 text-3xl">{profitMargin.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* المؤشرات الرئيسية للأداء */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-2xl">
                  <CardTitle className="text-white text-2xl font-bold flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BarChart3 className="h-7 w-7" />
                    </div>
                    🎯 المؤشرات الرئيسية للأداء
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl border-2 border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-5xl font-bold text-blue-700 mb-4">{salesArray.length}</div>
                      <div className="text-lg text-blue-800 font-bold">📋 إجمالي الفواتير</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl border-2 border-emerald-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-5xl font-bold text-emerald-700 mb-4">{clientsArray.length}</div>
                      <div className="text-lg text-emerald-800 font-bold">👥 العملاء المسجلين</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl border-2 border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-5xl font-bold text-purple-700 mb-4">{productsArray.length}</div>
                      <div className="text-lg text-purple-800 font-bold">📦 المنتجات المتوفرة</div>
                    </div>
                    <div className="text-center p-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-4xl font-bold text-orange-700 mb-4">
                        {salesArray.length > 0 ? formatAmount(totalRevenue / salesArray.length) : '0 ر.س'}
                      </div>
                      <div className="text-lg text-orange-800 font-bold">💳 متوسط قيمة الفاتورة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* قسم الفواتير مع الشعار وصورة المستخدم */}
          <TabsContent value="invoices" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* فاتورة المبيعات */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                  <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    فاتورة المبيعات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">فاتورة مبيعات كاملة مع شعار الشركة وصورة المستخدم</p>
                  <GeneralInvoiceReport invoiceType="sales" title="فاتورة المبيعات" />
                </CardContent>
              </Card>

              {/* فاتورة المشتريات */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
                  <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    فاتورة المشتريات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">فاتورة مشتريات كاملة مع شعار الشركة وصورة المستخدم</p>
                  <GeneralInvoiceReport invoiceType="purchase" title="فاتورة المشتريات" />
                </CardContent>
              </Card>

              {/* فاتورة عامة */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-t-lg">
                  <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    فاتورة عامة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">فاتورة عامة مع شعار الشركة وصورة المستخدم</p>
                  <GeneralInvoiceReport invoiceType="general" title="فاتورة عامة" />
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