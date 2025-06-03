import { useQuery } from '@tanstack/react-query';
import { DashboardStats, RecentActivity } from '@/lib/types';
import StatsCard from '@/components/dashboard/StatsCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Users, DollarSign, ShoppingBasket, Warehouse } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Sample chart data - in a real app this would come from API
  const chartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    sales: [65000, 78000, 85000, 72000, 89000, 95000],
    purchases: [45000, 52000, 58000, 48000, 61000, 67000]
  };

  // Sample recent activities - in a real app this would come from API
  const recentActivities: RecentActivity[] = [];

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">لوحة التحكم</h2>
        <p className="text-gray-600">نظرة عامة على أداء نشاطك التجاري</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي العملاء"
          value={stats?.totalClients.toLocaleString('ar-SA') || '0'}
          icon={Users}
          color="blue"
          trend={{ value: '+12%', isPositive: true }}
        />
        <StatsCard
          title="إجمالي المبيعات"
          value={stats ? formatCurrency(stats.totalSales) : '0 ر.س'}
          icon={DollarSign}
          color="green"
          trend={{ value: '+8%', isPositive: true }}
        />
        <StatsCard
          title="إجمالي المشتريات"
          value={stats ? formatCurrency(stats.totalPurchases) : '0 ر.س'}
          icon={ShoppingBasket}
          color="purple"
          trend={{ value: '-3%', isPositive: false }}
        />
        <StatsCard
          title="رصيد المخزون"
          value={stats ? formatCurrency(stats.inventoryValue) : '0 ر.س'}
          icon={Warehouse}
          color="orange"
        />
      </div>

      {/* Charts and Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">المبيعات والمشتريات الشهرية</h3>
            <select className="text-sm border-gray-300 rounded-md">
              <option>آخر 6 أشهر</option>
              <option>آخر سنة</option>
            </select>
          </div>
          <SalesChart data={chartData} />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الأنشطة الأخيرة</h3>
          <RecentActivities activities={recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-[hsl(var(--accounting-primary))] hover:bg-blue-50 transition-colors">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--accounting-primary))]" />
            <span className="text-sm font-medium">فاتورة مبيعات</span>
          </button>
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-[hsl(var(--accounting-primary))] hover:bg-blue-50 transition-colors">
            <ShoppingBasket className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--accounting-primary))]" />
            <span className="text-sm font-medium">فاتورة مشتريات</span>
          </button>
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-[hsl(var(--accounting-primary))] hover:bg-blue-50 transition-colors">
            <Users className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--accounting-primary))]" />
            <span className="text-sm font-medium">عميل جديد</span>
          </button>
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-[hsl(var(--accounting-primary))] hover:bg-blue-50 transition-colors">
            <Warehouse className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--accounting-primary))]" />
            <span className="text-sm font-medium">منتج جديد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
