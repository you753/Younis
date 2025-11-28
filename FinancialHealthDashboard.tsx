import FinancialHealthRadar from '@/components/charts/FinancialHealthRadar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function FinancialHealthDashboard() {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch branches data
  const { data: branches = [] } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Fetch company-wide stats
  const { data: companyStats = {}, refetch: refetchStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              لوحة الصحة المالية التفاعلية
            </h1>
            <p className="text-gray-600 mt-2">
              مراقبة وتحليل الأداء المالي بالوقت الفعلي مع رؤى تفاعلية شاملة
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={autoRefresh ? "default" : "secondary"} className="px-3 py-1">
              {autoRefresh ? 'تحديث تلقائي' : 'تحديث يدوي'}
            </Badge>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث البيانات
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {autoRefresh ? 'إيقاف التحديث' : 'تفعيل التحديث'}
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(companyStats as any)?.totalSales || '0'} ر.س
              </div>
              <p className="text-xs text-muted-foreground">
                من إجمالي {(companyStats as any)?.totalClients || '0'} عميل
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد الفروع النشطة</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(branches as any[])?.filter((b: any) => b.isActive).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                من إجمالي {(branches as any[])?.length || 0} فرع
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء النشطين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {companyStats?.totalClients || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                عميل مسجل في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نمو المبيعات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                +12.5%
              </div>
              <p className="text-xs text-muted-foreground">
                مقارنة بالشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs for Different Views */}
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              الصحة المالية للشركة
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              مقارنة الفروع
            </TabsTrigger>
          </TabsList>

          {/* Company-wide Financial Health */}
          <TabsContent value="company">
            <FinancialHealthRadar companyWide={true} />
          </TabsContent>

          {/* Branch Comparison */}
          <TabsContent value="branches" className="space-y-6">
            {/* Branch Selection */}
            <Card>
              <CardHeader>
                <CardTitle>اختيار الفرع للتحليل</CardTitle>
                <CardDescription>
                  اختر فرعاً لعرض تحليل مفصل للصحة المالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {branches?.map((branch: any) => (
                    <Card 
                      key={branch.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedBranch === branch.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBranch(branch.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <Badge variant={branch.isActive ? "default" : "secondary"}>
                            {branch.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        <CardDescription>
                          كود الفرع: {branch.code}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>العنوان:</span>
                            <span className="text-gray-600">{branch.address || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>الهاتف:</span>
                            <span className="text-gray-600">{branch.phone || 'غير محدد'}</span>
                          </div>
                          {selectedBranch === branch.id && (
                            <div className="mt-3 p-2 bg-blue-100 rounded text-center text-sm text-blue-700">
                              تم اختيار هذا الفرع للتحليل
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Branch Analysis */}
            {selectedBranch && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      تحليل الصحة المالية - فرع {branches?.find((b: any) => b.id === selectedBranch)?.name}
                    </CardTitle>
                    <CardDescription>
                      تحليل مفصل ومقارنة أداء الفرع مع المعايير العامة
                    </CardDescription>
                  </CardHeader>
                </Card>
                <FinancialHealthRadar branchId={selectedBranch} />
              </div>
            )}

            {!selectedBranch && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لم يتم اختيار فرع
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    اختر أحد الفروع أعلاه لعرض تحليل مفصل للصحة المالية والمؤشرات التفاعلية
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Additional Insights */}
        <Card>
          <CardHeader>
            <CardTitle>رؤى ونصائح تحليلية</CardTitle>
            <CardDescription>
              توجيهات مبنية على تحليل البيانات المالية الحالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">تحسين الأداء</h4>
                </div>
                <p className="text-sm text-blue-700">
                  يمكن تحسين الربحية بنسبة 15% من خلال تحسين إدارة المخزون وتقليل التكاليف التشغيلية
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">فرص النمو</h4>
                </div>
                <p className="text-sm text-green-700">
                  الفروع الجديدة تظهر نمواً إيجابياً، يُنصح بزيادة الاستثمار في التوسع الجغرافي
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">تنبيهات مهمة</h4>
                </div>
                <p className="text-sm text-orange-700">
                  بعض الفروع تحتاج لمراجعة السيولة المالية لضمان استمرارية العمليات
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}