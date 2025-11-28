import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBasket,
  Warehouse,
  Users,
  Package,
  Building2,
  BarChart3,
  RefreshCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

const BRANCH_COLORS = ['#0F172A', '#F59E0B', '#FBBF24', '#78716C', '#D97706', '#92400E'];

export default function Dashboard() {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');

  useEffect(() => {
    setCurrentPage('لوحة التحكم الرئيسية');
  }, [setCurrentPage]);

  const { data: branchData, isLoading, refetch } = useQuery<any>({
    queryKey: [`/api/dashboard/branch-summary?dateFilter=${dateFilter}`],
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const branches = branchData?.branches || [];
  const bestBranch = branchData?.bestBranch;
  const recentBranches = branchData?.recentBranches || [];

  const pieData = branches.map((branch: any, index: number) => ({
    name: branch.branchName,
    value: branch.netProfit,
    color: BRANCH_COLORS[index % BRANCH_COLORS.length]
  }));

  const barData = branches.map((branch: any) => ({
    name: branch.branchName.split(' ')[0],
    مبيعات: branch.totalSales,
    مشتريات: branch.totalPurchases,
    مصروفات: branch.totalExpenses,
    أرباح: branch.netProfit
  }));

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:to-slate-800 p-4 md:p-6 space-y-6" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 rounded-xl p-6 md:p-8 text-white shadow-md">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">لوحة التحكم الرئيسية</h1>
            <p className="text-white/90 text-sm md:text-base">نظرة شاملة على أداء منظومة الفروع</p>
          </div>
        </div>
      </div>

      {/* Date Filter Buttons - Responsive */}
      <div className="grid grid-cols-4 gap-2 md:flex md:justify-center md:gap-3">
        <Button
          variant={dateFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateFilter('all')}
          className={`h-10 md:h-14 px-2 md:px-8 text-sm md:text-lg font-bold transition-all ${
            dateFilter === 'all' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg' 
              : 'hover:bg-blue-50'
          }`}
          data-testid="filter-all"
        >
          الكل
        </Button>
        <Button
          variant={dateFilter === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateFilter('today')}
          className={`h-10 md:h-14 px-2 md:px-8 text-sm md:text-lg font-bold transition-all ${
            dateFilter === 'today' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg' 
              : 'hover:bg-green-50'
          }`}
          data-testid="filter-today"
        >
          اليوم
        </Button>
        <Button
          variant={dateFilter === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateFilter('week')}
          className={`h-10 md:h-14 px-2 md:px-8 text-sm md:text-lg font-bold transition-all ${
            dateFilter === 'week' 
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg' 
              : 'hover:bg-orange-50'
          }`}
          data-testid="filter-week"
        >
          الأسبوع
        </Button>
        <Button
          variant={dateFilter === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDateFilter('month')}
          className={`h-10 md:h-14 px-2 md:px-8 text-sm md:text-lg font-bold transition-all ${
            dateFilter === 'month' 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg' 
              : 'hover:bg-purple-50'
          }`}
          data-testid="filter-month"
        >
          الشهر
        </Button>
      </div>

      {/* Best Performing Branch & Recent Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Branch */}
        {bestBranch && (
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800 shadow-lg" data-testid="card-best-branch">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <TrendingUp className="h-5 w-5" />
                أفضل فرع أداءً
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-amber-100">{bestBranch.branchName}</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">الفرع #{bestBranch.branchCode}</p>
                </div>
                <Badge className="bg-amber-600 text-white text-lg px-4 py-2">
                  {formatAmount(bestBranch.netProfit)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">المبيعات</p>
                  <p className="font-semibold text-slate-900 dark:text-amber-100">{formatAmount(bestBranch.totalSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">المنتجات</p>
                  <p className="font-semibold text-slate-900 dark:text-amber-100">{bestBranch.productsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">العملاء</p>
                  <p className="font-semibold text-slate-900 dark:text-amber-100">{bestBranch.clientsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">هامش الربح</p>
                  <p className="font-semibold text-slate-900 dark:text-amber-100">{bestBranch.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Branches */}
        <Card className="shadow-lg" data-testid="card-recent-branches">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-600" />
              الفروع المضافة حديثاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBranches.length > 0 ? (
              <div className="space-y-3">
                {recentBranches.map((branch: any, index: number) => (
                  <div 
                    key={branch.branchId} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`branch-item-${branch.branchId}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold`}
                           style={{ backgroundColor: BRANCH_COLORS[index % BRANCH_COLORS.length] }}>
                        {branch.branchCode}
                      </div>
                      <div>
                        <p className="font-semibold">{branch.branchName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(branch.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={branch.netProfit > 0 ? "default" : "secondary"}>
                      {formatAmount(branch.netProfit)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد فروع حديثة
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* All Branches Table */}
      <Card className="shadow-lg" data-testid="table-all-branches">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            جميع الفروع ({branches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-semibold">الفرع</th>
                  <th className="text-right p-3 font-semibold">المبيعات</th>
                  <th className="text-right p-3 font-semibold">المشتريات</th>
                  <th className="text-right p-3 font-semibold">المصروفات</th>
                  <th className="text-right p-3 font-semibold">الأرباح</th>
                  <th className="text-right p-3 font-semibold">هامش الربح</th>
                  <th className="text-right p-3 font-semibold">المنتجات</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch: any, index: number) => (
                  <tr 
                    key={branch.branchId} 
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    data-testid={`branch-row-${branch.branchId}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                             style={{ backgroundColor: BRANCH_COLORS[index % BRANCH_COLORS.length] }}>
                          {branch.branchCode}
                        </div>
                        <div>
                          <p className="font-medium">{branch.branchName}</p>
                          <p className="text-xs text-muted-foreground">{branch.branchManager}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-green-600">{formatAmount(branch.totalSales)}</td>
                    <td className="p-3 font-semibold text-orange-600">{formatAmount(branch.totalPurchases)}</td>
                    <td className="p-3 font-semibold text-red-600">{formatAmount(branch.totalExpenses)}</td>
                    <td className="p-3 font-semibold text-blue-600">{formatAmount(branch.netProfit)}</td>
                    <td className="p-3">
                      <Badge variant={branch.profitMargin > 10 ? "default" : "secondary"}>
                        {branch.profitMargin.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-center">{branch.productsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
