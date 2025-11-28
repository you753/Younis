import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Package,
  CreditCard,
  Wallet,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventory: number;
  salesGrowth: number;
  profitMargin: number;
  liquidityRatio: number;
  debtToEquity: number;
  returnOnAssets: number;
}

interface HealthScore {
  overall: number;
  profitability: number;
  liquidity: number;
  efficiency: number;
  growth: number;
  risk: number;
}

interface Recommendation {
  id: string;
  type: 'warning' | 'opportunity' | 'success';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface TrendData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  score: number;
}

export default function FinancialHealthScore() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch financial data
  const { data: salesData = [] } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  const { data: purchasesData = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  const { data: clientsData = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: productsData = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: dashboardStats } = useQuery<any>({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate financial metrics
  const calculateMetrics = (): FinancialMetrics => {
    const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
    const totalExpenses = purchasesData.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Calculate inventory value
    const inventory = productsData.reduce((sum: number, product: any) => 
      sum + (parseFloat(product.price || 0) * parseInt(product.stock || 0)), 0);
    
    // Mock additional metrics for demonstration
    const accountsReceivable = totalRevenue * 0.15; // 15% of revenue typically outstanding
    const accountsPayable = totalExpenses * 0.12; // 12% of expenses typically owed
    const cashFlow = netProfit + (accountsPayable - accountsReceivable);
    const liquidityRatio = (inventory + accountsReceivable) / accountsPayable || 1;
    
    // Calculate growth (mock historical data)
    const salesGrowth = Math.random() * 20 - 10; // Random growth between -10% and 10%
    const debtToEquity = 0.3; // Mock ratio
    const returnOnAssets = netProfit / (inventory + accountsReceivable + 50000) * 100; // Mock total assets

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashFlow,
      accountsReceivable,
      accountsPayable,
      inventory,
      salesGrowth,
      profitMargin,
      liquidityRatio,
      debtToEquity,
      returnOnAssets
    };
  };

  // Calculate health score
  const calculateHealthScore = (metrics: FinancialMetrics): HealthScore => {
    // Profitability Score (0-100)
    const profitabilityScore = Math.max(0, Math.min(100, 50 + metrics.profitMargin * 2));
    
    // Liquidity Score (0-100)
    const liquidityScore = Math.max(0, Math.min(100, metrics.liquidityRatio * 50));
    
    // Efficiency Score (0-100) - based on revenue per product
    const revenuePerProduct = productsData.length > 0 ? metrics.totalRevenue / productsData.length : 0;
    const efficiencyScore = Math.max(0, Math.min(100, revenuePerProduct / 100));
    
    // Growth Score (0-100)
    const growthScore = Math.max(0, Math.min(100, 50 + metrics.salesGrowth * 2.5));
    
    // Risk Score (0-100) - inverse of debt ratio
    const riskScore = Math.max(0, Math.min(100, 100 - metrics.debtToEquity * 100));
    
    // Overall Score (weighted average)
    const overallScore = (
      profitabilityScore * 0.3 +
      liquidityScore * 0.25 +
      efficiencyScore * 0.2 +
      growthScore * 0.15 +
      riskScore * 0.1
    );

    return {
      overall: Math.round(overallScore),
      profitability: Math.round(profitabilityScore),
      liquidity: Math.round(liquidityScore),
      efficiency: Math.round(efficiencyScore),
      growth: Math.round(growthScore),
      risk: Math.round(riskScore)
    };
  };

  // Generate recommendations
  const generateRecommendations = (metrics: FinancialMetrics, score: HealthScore): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (score.profitability < 60) {
      recommendations.push({
        id: 'profit-low',
        type: 'warning',
        category: 'الربحية',
        title: 'تحسين هامش الربح مطلوب',
        description: 'هامش الربح الحالي أقل من المستوى المطلوب. اعتبر مراجعة الأسعار أو تقليل التكاليف.',
        impact: 'high',
        actionable: true
      });
    }

    if (score.liquidity < 50) {
      recommendations.push({
        id: 'liquidity-low',
        type: 'warning',
        category: 'السيولة',
        title: 'تحسين السيولة ضروري',
        description: 'نسبة السيولة منخفضة. فكر في تسريع تحصيل المستحقات أو زيادة رأس المال.',
        impact: 'high',
        actionable: true
      });
    }

    if (metrics.accountsReceivable > metrics.totalRevenue * 0.2) {
      recommendations.push({
        id: 'receivables-high',
        type: 'opportunity',
        category: 'التحصيل',
        title: 'تسريع تحصيل المستحقات',
        description: 'المبالغ المستحقة مرتفعة. تحسين عملية التحصيل سيزيد السيولة.',
        impact: 'medium',
        actionable: true
      });
    }

    if (score.growth > 70) {
      recommendations.push({
        id: 'growth-good',
        type: 'success',
        category: 'النمو',
        title: 'نمو ممتاز في المبيعات',
        description: 'معدل النمو الحالي ممتاز. استمر في الاستراتيجيات الحالية.',
        impact: 'high',
        actionable: false
      });
    }

    if (productsData.length > 0 && metrics.inventory / metrics.totalRevenue > 0.3) {
      recommendations.push({
        id: 'inventory-high',
        type: 'opportunity',
        category: 'المخزون',
        title: 'تحسين دوران المخزون',
        description: 'نسبة المخزون إلى المبيعات مرتفعة. فكر في تحسين إدارة المخزون.',
        impact: 'medium',
        actionable: true
      });
    }

    return recommendations;
  };

  // Generate trend data
  const generateTrendData = (metrics: FinancialMetrics): TrendData[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthName = format(date, 'MMM yyyy', { locale: ar });
      
      // Simulate historical data with some variance
      const variance = (Math.random() - 0.5) * 0.2;
      const revenue = metrics.totalRevenue * (1 + variance);
      const expenses = metrics.totalExpenses * (1 + variance * 0.8);
      const profit = revenue - expenses;
      const score = calculateHealthScore({ ...metrics, totalRevenue: revenue, totalExpenses: expenses, netProfit: profit }).overall;
      
      months.push({
        month: monthName,
        revenue,
        expenses,
        profit,
        score
      });
    }
    
    return months;
  };

  const metrics = calculateMetrics();
  const healthScore = calculateHealthScore(metrics);
  const recommendations = generateRecommendations(metrics, healthScore);
  const trendData = generateTrendData(metrics);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const scoreColors = ['#ef4444', '#f59e0b', '#10b981'];
  const pieData = [
    { name: 'الربحية', value: healthScore.profitability, color: '#3b82f6' },
    { name: 'السيولة', value: healthScore.liquidity, color: '#10b981' },
    { name: 'الكفاءة', value: healthScore.efficiency, color: '#f59e0b' },
    { name: 'النمو', value: healthScore.growth, color: '#8b5cf6' },
    { name: 'المخاطر', value: healthScore.risk, color: '#ef4444' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">نقاط الصحة المالية</h1>
          <p className="text-muted-foreground mt-1">تحليل شامل للوضع المالي مع توصيات مخصصة</p>
        </div>
        
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline" 
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                النتيجة الإجمالية للصحة المالية
              </h2>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(healthScore.overall)}`}>
                  {healthScore.overall}
                </div>
                <div className="text-2xl text-muted-foreground">/100</div>
                <Badge variant={getScoreBadgeVariant(healthScore.overall)} className="text-lg px-3 py-1">
                  {healthScore.overall >= 80 ? 'ممتاز' : healthScore.overall >= 60 ? 'جيد' : 'يحتاج تحسين'}
                </Badge>
              </div>
              <Progress value={healthScore.overall} className="w-64 mt-4" />
            </div>
            <div className="text-right">
              <Activity className="h-16 w-16 text-blue-500 mb-2" />
              <div className="text-sm text-muted-foreground">
                آخر تحديث: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="metrics">المؤشرات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  الربحية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.profitability)}`}>
                  {healthScore.profitability}
                </div>
                <Progress value={healthScore.profitability} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                  السيولة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.liquidity)}`}>
                  {healthScore.liquidity}
                </div>
                <Progress value={healthScore.liquidity} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  الكفاءة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.efficiency)}`}>
                  {healthScore.efficiency}
                </div>
                <Progress value={healthScore.efficiency} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  النمو
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.growth)}`}>
                  {healthScore.growth}
                </div>
                <Progress value={healthScore.growth} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  المخاطر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.risk)}`}>
                  {healthScore.risk}
                </div>
                <Progress value={healthScore.risk} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  +{Math.abs(metrics.salesGrowth).toFixed(1)}% من الشهر الماضي
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.totalExpenses)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  نسبة إلى الإيرادات: {((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netProfit)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  هامش الربح: {metrics.profitMargin.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">التدفق النقدي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.cashFlow)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  نسبة السيولة: {metrics.liquidityRatio.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع نقاط الصحة المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }: any) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المؤشرات المالية الرئيسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>هامش الربح الإجمالي</span>
                  <span className="font-bold">{metrics.profitMargin.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>نسبة السيولة السريعة</span>
                  <span className="font-bold">{metrics.liquidityRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>نسبة الدين إلى حقوق الملكية</span>
                  <span className="font-bold">{(metrics.debtToEquity * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>العائد على الأصول</span>
                  <span className="font-bold">{metrics.returnOnAssets.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>معدل نمو المبيعات</span>
                  <span className={`font-bold ${metrics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.salesGrowth.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأرصدة والمستحقات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>المبالغ المستحقة للعملاء</span>
                  <span className="font-bold">{formatCurrency(metrics.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>المبالغ المستحقة للموردين</span>
                  <span className="font-bold">{formatCurrency(metrics.accountsPayable)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>قيمة المخزون</span>
                  <span className="font-bold">{formatCurrency(metrics.inventory)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>رأس المال العامل</span>
                  <span className="font-bold">{formatCurrency(metrics.accountsReceivable - metrics.accountsPayable)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه نقاط الصحة المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اتجاه الإيرادات والمصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className={`border-l-4 ${
              rec.type === 'warning' ? 'border-l-red-500' :
              rec.type === 'opportunity' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rec.type === 'warning' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {rec.type === 'opportunity' && <TrendingUp className="h-5 w-5 text-yellow-500" />}
                    {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rec.category}</Badge>
                    <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'secondary' : 'outline'}>
                      {rec.impact === 'high' ? 'تأثير عالي' : rec.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{rec.description}</p>
                {rec.actionable && (
                  <Button variant="outline" size="sm" className="mt-3">
                    اتخاذ إجراء
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {recommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  وضع مالي ممتاز!
                </h3>
                <p className="text-muted-foreground">
                  لا توجد توصيات عاجلة في الوقت الحالي. استمر في الأداء الجيد.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}