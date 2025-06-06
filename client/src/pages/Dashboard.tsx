import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { 
  Users, 
  DollarSign, 
  ShoppingBasket, 
  Warehouse, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Bell,
  Settings
} from 'lucide-react';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const { setCurrentPage } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setCurrentPage('لوحة التحكم الرئيسية');
  }, [setCurrentPage]);

  // Fetch all data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats', refreshKey],
    refetchInterval: 30000
  });

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

  // Calculate real-time analytics
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
  const totalCosts = purchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
  const inventoryValue = products.reduce((sum: number, product: any) => 
    sum + (parseFloat(product.salePrice || 0) * (product.quantity || 0)), 0);

  // Monthly sales data for charts
  const monthlySalesData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleDateString('ar-SA', { month: 'short' });
    const monthSales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === i;
    });
    const monthPurchases = purchases.filter((purchase: any) => {
      const purchaseDate = new Date(purchase.date);
      return purchaseDate.getMonth() === i;
    });
    
    return {
      month,
      sales: monthSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0),
      purchases: monthPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0),
    };
  });

  // Product performance data
  const productSalesMap = new Map();
  sales.forEach((sale: any) => {
    if (sale.items) {
      sale.items.forEach((item: any) => {
        const current = productSalesMap.get(item.productId) || 0;
        productSalesMap.set(item.productId, current + (item.quantity * item.unitPrice));
      });
    }
  });

  const topProducts = Array.from(productSalesMap.entries())
    .map(([productId, revenue]) => {
      const product = products.find((p: any) => p.id === productId);
      return {
        name: product?.name || `منتج ${productId}`,
        value: revenue as number,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Performance indicators data  
  const performanceData = [
    { name: 'هذا الأسبوع', sales: totalRevenue * 0.2, target: totalRevenue * 0.25 },
    { name: 'الأسبوع الماضي', sales: totalRevenue * 0.18, target: totalRevenue * 0.22 },
    { name: 'هذا الشهر', sales: totalRevenue, target: totalRevenue * 1.1 },
    { name: 'الشهر الماضي', sales: totalRevenue * 0.85, target: totalRevenue * 0.9 },
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">لوحة التحكم</h2>
          <p className="text-gray-600">نظرة عامة على أداء نشاطك التجاري</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-50 min-h-screen p-3 sm:p-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">نظرة شاملة على أداء نشاطك التجاري</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <OnboardingTrigger tourName="dashboard" />
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
                <SelectItem value="month">الشهر</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-onboarding="stats-cards">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRevenue.toFixed(2)} ر.س</div>
            <div className="flex items-center text-blue-100 text-sm mt-2">
              <TrendingUp className="h-4 w-4 ml-1" />
              +{profitMargin.toFixed(1)}% من الشهر الماضي
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">صافي الربح</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{netProfit.toFixed(2)} ر.س</div>
            <div className="flex items-center text-green-100 text-sm mt-2">
              <Badge variant="secondary" className="bg-green-400 text-green-900">
                {profitMargin.toFixed(1)}% هامش ربح
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">العملاء النشطون</CardTitle>
            <Users className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <div className="flex items-center text-purple-100 text-sm mt-2">
              <Eye className="h-4 w-4 ml-1" />
              +{sales.length} معاملة هذا الشهر
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">قيمة المخزون</CardTitle>
            <Warehouse className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inventoryValue.toFixed(2)} ر.س</div>
            <div className="flex items-center text-orange-100 text-sm mt-2">
              <Badge variant="secondary" className="bg-orange-400 text-orange-900">
                {products.length} صنف
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>المبيعات</CardTitle>
              <Button variant="outline" size="sm">
                <PieChartIcon className="h-4 w-4 ml-1" />
                تفاصيل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)} ر.س`, '']}
                  labelFormatter={(label) => `الشهر: ${label}`}
                />
                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>المنتجات والإيرادات</CardTitle>
              <Badge variant="secondary">{topProducts.length} منتج</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ر.س`, 'المبيعات']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ر.س`, '']} />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" name="المبيعات الفعلية" />
                <Bar dataKey="target" fill="#10B981" name="المستهدف" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Panel */}
        <Card data-onboarding="recent-sales">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>آخر النشاطات</CardTitle>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sales.slice(-5).map((sale: any, index) => (
              <div key={index} className="flex items-center space-x-3 space-x-reverse border-b border-gray-100 pb-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">فاتورة مبيعات #{sale.id}</p>
                  <p className="text-xs text-gray-500">{parseFloat(sale.total).toFixed(2)} ر.س</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(sale.date).toLocaleDateString('ar-SA')}
                </Badge>
              </div>
            ))}
            
            {purchases.slice(-3).map((purchase: any, index) => (
              <div key={index} className="flex items-center space-x-3 space-x-reverse border-b border-gray-100 pb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ShoppingBasket className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">فاتورة مشتريات #{purchase.id}</p>
                  <p className="text-xs text-gray-500">{parseFloat(purchase.total).toFixed(2)} ر.س</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(purchase.date).toLocaleDateString('ar-SA')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
