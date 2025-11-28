import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  Warehouse,
  CreditCard,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface BranchDashboardProps {
  branchId: number;
}

interface BranchStats {
  totalClients: number;
  totalSuppliers: number;
  totalProducts: number;
  totalEmployees: number;
  totalSalesToday: number;
  totalSalesWeek: number;
  totalSalesMonth: number;
  totalSalesAll: number;
  salesCount: number;
  todaySalesCount: number;
  totalPurchasesToday: number;
  totalPurchasesWeek: number;
  totalPurchasesMonth: number;
  totalPurchasesAll: number;
  purchasesCount: number;
  totalSalesReturns: number;
  totalPurchaseReturns: number;
  salesReturnsCount: number;
  purchaseReturnsCount: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: string;
  totalActiveDebts: number;
  activeDebtsCount: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesGrowth: string;
  purchasesGrowth: string;
}

export default function BranchDashboard({ branchId }: BranchDashboardProps) {
  const { data: stats, isLoading } = useQuery<BranchStats>({
    queryKey: [`/api/branches/${branchId}/stats`],
    refetchInterval: 2000, // تحديث تلقائي كل ثانيتين
    refetchOnWindowFocus: true, // تحديث عند العودة للصفحة
    refetchIntervalInBackground: true, // تحديث حتى عند عدم التركيز
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#F59E0B', '#1F2937', '#6B7280', '#D1D5DB', '#9CA3AF'];

  // Prepare chart data
  const salesComparisonData = [
    {
      name: 'اليوم',
      المبيعات: stats?.totalSalesToday || 0,
      المشتريات: stats?.totalPurchasesToday || 0
    },
    {
      name: 'الأسبوع',
      المبيعات: stats?.totalSalesWeek || 0,
      المشتريات: stats?.totalPurchasesWeek || 0
    },
    {
      name: 'الشهر',
      المبيعات: stats?.totalSalesMonth || 0,
      المشتريات: stats?.totalPurchasesMonth || 0
    }
  ];

  const topProductsData = stats?.topProducts?.map((product: any) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    revenue: product.revenue
  })) || [];

  const inventoryStatusData = [
    { name: 'مخزون جيد', value: (stats?.totalProducts || 0) - (stats?.lowStockProducts || 0) - (stats?.outOfStockProducts || 0) },
    { name: 'مخزون منخفض', value: stats?.lowStockProducts || 0 },
    { name: 'مخزون نفذ', value: stats?.outOfStockProducts || 0 }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-6 text-white border border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-yellow-400">لوحة التحكم الاحترافية</h1>
            <p className="text-yellow-200">نظرة شاملة على أداء الفرع</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-yellow-200">صافي الربح</div>
            <div className="text-3xl font-bold text-green-400">{(stats?.netProfit || 0).toLocaleString('en-US')} ر.س</div>
            <div className="text-sm text-yellow-300">هامش الربح: {stats?.profitMargin}%</div>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Today */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-200 mb-1">مبيعات اليوم</p>
                <p className="text-2xl font-bold text-yellow-400">{(stats?.totalSalesToday || 0).toLocaleString('en-US')} ر.س</p>
                <div className="flex items-center gap-1 mt-2">
                  {parseFloat(stats?.salesGrowth || '0') >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-xs ${parseFloat(stats?.salesGrowth || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(parseFloat(stats?.salesGrowth || '0'))}% من الشهر الماضي
                  </span>
                </div>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-200 mb-1">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.salesCount || 0}</p>
                <p className="text-xs text-yellow-300 mt-2">{stats?.todaySalesCount || 0} طلب اليوم</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <ShoppingCart className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-200 mb-1">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-red-300 mt-2">{stats?.outOfStockProducts || 0} نفذ من المخزون</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Package className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-yellow-200 mb-1">قيمة المخزون</p>
                <p className="text-2xl font-bold text-yellow-400">{(stats?.totalInventoryValue || 0).toLocaleString('en-US')} ر.س</p>
                <p className="text-xs text-orange-300 mt-2">{stats?.lowStockProducts || 0} منتج مخزونه منخفض</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Warehouse className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">العملاء</p>
                <p className="text-xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الموردين</p>
                <p className="text-xl font-bold text-gray-900">{stats?.totalSuppliers || 0}</p>
              </div>
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الموظفين</p>
                <p className="text-xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ديون الموظفين</p>
                <p className="text-xl font-bold text-red-600">{(stats?.totalActiveDebts || 0).toLocaleString('en-US')} ر.س</p>
              </div>
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases Comparison */}
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-900 to-black">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
              <BarChart3 className="h-5 w-5" />
              مقارنة المبيعات والمشتريات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Arial' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => `${Number(value).toLocaleString('en-US')} ر.س`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Arial' }} />
                <Bar dataKey="المبيعات" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                <Bar dataKey="المشتريات" fill="#1F2937" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Status Pie Chart */}
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-900 to-black">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
              <Package className="h-5 w-5" />
              حالة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      {topProductsData.length > 0 && (
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-900 to-black">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
              <TrendingUp className="h-5 w-5" />
              المنتجات الأكثر مبيعاً (آخر 30 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Arial' }} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => `${Number(value).toLocaleString('en-US')} ر.س`}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">اليوم</span>
                <span className="font-bold text-green-600">{(stats?.totalSalesToday || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">الأسبوع</span>
                <span className="font-bold">{(stats?.totalSalesWeek || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">الشهر</span>
                <span className="font-bold">{(stats?.totalSalesMonth || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">إجمالي</span>
                  <span className="font-bold text-blue-600">{(stats?.totalSalesAll || 0).toLocaleString('en-US')} ر.س</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">اليوم</span>
                <span className="font-bold text-orange-600">{(stats?.totalPurchasesToday || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">الأسبوع</span>
                <span className="font-bold">{(stats?.totalPurchasesWeek || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">الشهر</span>
                <span className="font-bold">{(stats?.totalPurchasesMonth || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">إجمالي</span>
                  <span className="font-bold text-purple-600">{(stats?.totalPurchasesAll || 0).toLocaleString('en-US')} ر.س</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">المرتجعات والمصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">مرتجعات المبيعات</span>
                <span className="font-bold text-red-600">{(stats?.totalSalesReturns || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">مرتجعات المشتريات</span>
                <span className="font-bold text-green-600">{(stats?.totalPurchaseReturns || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">المصروفات اليومية</span>
                <span className="font-bold text-orange-600">{(stats?.totalExpenses || 0).toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">صافي الربح</span>
                  <span className={`font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats?.netProfit || 0).toLocaleString('en-US')} ر.س
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
