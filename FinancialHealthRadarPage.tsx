import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import FinancialHealthRadar from '@/components/charts/FinancialHealthRadar';
import {
  Activity,
  Building,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  Target,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FinancialHealthRadarPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Fetch branches for selection
  const { data: branches = [] } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Fetch overall system health when no specific branch is selected
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/health/overview'],
    enabled: selectedBranch === 'all',
  });

  const handleExportReport = () => {
    // Export functionality
    console.log('Exporting health report for:', selectedBranch);
  };

  const handleRefreshData = () => {
    // Refresh all data
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            مؤشر الصحة المالية التفاعلي
          </h1>
          <p className="text-gray-600 mt-2">
            تحليل شامل وتفاعلي لأداء النظام والفروع عبر المؤشرات المالية الرئيسية
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">آخر سنة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفرع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              {(branches as any[]).map((branch: any) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setComparisonMode(!comparisonMode)}
            className={cn(comparisonMode && "bg-blue-50 border-blue-500")}
          >
            <PieChart className="h-4 w-4 mr-2" />
            مقارنة الفروع
          </Button>

          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>

          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الصحة العامة</p>
                <p className="text-2xl font-bold text-green-600">
                  {(systemHealth as any)?.healthScore ? Math.round((systemHealth as any).healthScore * 100) : 72}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                ممتاز
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">أداء المبيعات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(systemHealth as any)?.salesPerformance ? Math.round((systemHealth as any).salesPerformance * 100) : 85}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 font-medium">+12% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">صحة المخزون</p>
                <p className="text-2xl font-bold text-amber-600">
                  {(systemHealth as any)?.inventoryHealth ? Math.round((systemHealth as any).inventoryHealth * 100) : 68}%
                </p>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                جيد
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">رضا العملاء</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(systemHealth as any)?.customerSatisfaction ? Math.round((systemHealth as any).customerSatisfaction * 100) : 91}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 font-medium">+5% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Radar Chart */}
      <FinancialHealthRadar
        branchId={selectedBranch !== 'all' ? selectedBranch : undefined}
        className="w-full"
        showControls={true}
        autoRefresh={true}
        refreshInterval={60000}
      />

      {/* Branch Comparison Mode */}
      {comparisonMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              مقارنة أداء الفروع
            </CardTitle>
            <CardDescription>
              مقارنة شاملة لمؤشرات الأداء عبر جميع الفروع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(branches as any[])?.slice(0, 6).map((branch: any) => (
                <div key={branch.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                    <Badge variant="outline">{branch.code}</Badge>
                  </div>
                  
                  <FinancialHealthRadar
                    branchId={branch.id.toString()}
                    className="h-64"
                    showControls={false}
                    autoRefresh={false}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              تنبيهات الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-800">انخفاض السيولة النقدية</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  تراجع السيولة بنسبة 15% في فرع الرياض الرئيسي
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="font-medium text-amber-800">مستوى مخزون منخفض</span>
                </div>
                <p className="text-sm text-amber-600 mt-1">
                  بعض الأصناف تحتاج إعادة تموين في 3 فروع
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">أداء مبيعات ممتاز</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  تحقيق أهداف المبيعات بنسبة 120% هذا الشهر
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              توصيات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">تحسين إدارة المخزون</h4>
                  <p className="text-sm text-gray-600">
                    تطبيق نظام تنبيهات المخزون الذكي لتقليل النفاد
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-green-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">زيادة برامج ولاء العملاء</h4>
                  <p className="text-sm text-gray-600">
                    تفعيل برامج المكافآت لزيادة معدل العودة
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">تحسين التدفق النقدي</h4>
                  <p className="text-sm text-gray-600">
                    مراجعة شروط الدفع مع الموردين والعملاء
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}