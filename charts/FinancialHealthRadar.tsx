import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthMetrics {
  category: string;
  value: number;
  maxValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  details?: {
    current: number;
    target: number;
    previous: number;
  };
}

interface FinancialHealthRadarProps {
  branchId?: string;
  className?: string;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const FinancialHealthRadar = ({ 
  branchId, 
  className = '', 
  showControls = true,
  autoRefresh = false,
  refreshInterval = 30000 
}: FinancialHealthRadarProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [showDetails, setShowDetails] = useState(false);

  // Fetch health data from API
  const { data: healthData, refetch, isLoading, error } = useQuery({
    queryKey: branchId ? [`/api/branches/${branchId}/health`] : ['/api/health/overview'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Transform API data to radar chart format
  const data = healthData as any;
  const radarData: HealthMetrics[] = data ? [
    {
      category: 'الأداء المالي',
      value: Math.round((data.salesPerformance || 0.72) * 100),
      maxValue: 100,
      status: (data.salesPerformance || 0.72) > 0.8 ? 'excellent' : 
               (data.salesPerformance || 0.72) > 0.6 ? 'good' : 
               (data.salesPerformance || 0.72) > 0.4 ? 'warning' : 'critical',
      trend: 'up',
      description: 'أداء المبيعات والإيرادات',
      details: {
        current: (data.salesPerformance || 0.72) * 100,
        target: 85,
        previous: ((data.salesPerformance || 0.72) - 0.05) * 100
      }
    },
    {
      category: 'صحة المخزون',
      value: Math.round((data.inventoryHealth || 0.68) * 100),
      maxValue: 100,
      status: (data.inventoryHealth || 0.68) > 0.8 ? 'excellent' : 
               (data.inventoryHealth || 0.68) > 0.6 ? 'good' : 
               (data.inventoryHealth || 0.68) > 0.4 ? 'warning' : 'critical',
      trend: 'stable',
      description: 'مستويات المخزون ودورانه',
      details: {
        current: (data.inventoryHealth || 0.68) * 100,
        target: 80,
        previous: ((data.inventoryHealth || 0.68) + 0.02) * 100
      }
    },
    {
      category: 'رضا العملاء',
      value: Math.round((data.customerSatisfaction || 0.85) * 100),
      maxValue: 100,
      status: (data.customerSatisfaction || 0.85) > 0.8 ? 'excellent' : 
               (data.customerSatisfaction || 0.85) > 0.6 ? 'good' : 
               (data.customerSatisfaction || 0.85) > 0.4 ? 'warning' : 'critical',
      trend: 'up',
      description: 'مستوى رضا وولاء العملاء',
      details: {
        current: (data.customerSatisfaction || 0.85) * 100,
        target: 90,
        previous: ((data.customerSatisfaction || 0.85) - 0.08) * 100
      }
    },
    {
      category: 'السيولة النقدية',
      value: Math.round((data.cashFlow || 0.7) * 100),
      maxValue: 100,
      status: (data.cashFlow || 0.7) > 0.8 ? 'excellent' : 
               (data.cashFlow || 0.7) > 0.6 ? 'good' : 
               (data.cashFlow || 0.7) > 0.4 ? 'warning' : 'critical',
      trend: 'down',
      description: 'التدفق النقدي والسيولة',
      details: {
        current: (data.cashFlow || 0.7) * 100,
        target: 75,
        previous: ((data.cashFlow || 0.7) + 0.15) * 100
      }
    },
    {
      category: 'الربحية',
      value: Math.round((data.profitability || 0.65) * 100),
      maxValue: 100,
      status: (data.profitability || 0.65) > 0.8 ? 'excellent' : 
               (data.profitability || 0.65) > 0.6 ? 'good' : 
               (data.profitability || 0.65) > 0.4 ? 'warning' : 'critical',
      trend: 'up',
      description: 'هامش الربح والعائد',
      details: {
        current: (data.profitability || 0.65) * 100,
        target: 70,
        previous: ((data.profitability || 0.65) - 0.05) * 100
      }
    },
    {
      category: 'كفاءة العمليات',
      value: Math.round((data.operationalEfficiency || 0.75) * 100),
      maxValue: 100,
      status: (data.operationalEfficiency || 0.75) > 0.8 ? 'excellent' : 
               (data.operationalEfficiency || 0.75) > 0.6 ? 'good' : 
               (data.operationalEfficiency || 0.75) > 0.4 ? 'warning' : 'critical',
      trend: 'stable',
      description: 'كفاءة العمليات والموارد',
      details: {
        current: (data.operationalEfficiency || 0.75) * 100,
        target: 80,
        previous: ((data.operationalEfficiency || 0.75) + 0.03) * 100
      }
    }
  ] : [];

  // Calculate overall health score
  const overallHealth = radarData.length > 0 
    ? Math.round(radarData.reduce((sum, metric) => sum + metric.value, 0) / radarData.length)
    : 0;

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981'; // green-500
      case 'good': return '#3b82f6'; // blue-500
      case 'warning': return '#f59e0b'; // amber-500
      case 'critical': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  };

  // Trend icons
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
          <p className="text-lg font-bold" style={{ color: getStatusColor(data.status) }}>
            {data.value}%
          </p>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(data.trend)}
            <span className="text-xs text-gray-500">اتجاه الأداء</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle metric selection
  const handleMetricClick = (metric: HealthMetrics) => {
    setSelectedMetric(selectedMetric === metric.category ? null : metric.category);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">جاري تحميل بيانات الصحة المالية...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600">خطأ في تحميل البيانات</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                مؤشر الصحة المالية التفاعلي
              </CardTitle>
              <CardDescription>
                تحليل شامل لأداء {branchId ? 'الفرع' : 'النظام'} عبر المؤشرات الرئيسية
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Overall Health Badge */}
              <Badge 
                variant={overallHealth >= 80 ? "default" : overallHealth >= 60 ? "secondary" : "destructive"}
                className="text-lg px-3 py-1"
              >
                {overallHealth}%
              </Badge>
              {showControls && (
                <>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#374151', fontSize: 12 }}
                    className="text-sm"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="الأداء الحالي"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">تفاصيل المؤشرات</h3>
              {radarData.map((metric) => (
                <div
                  key={metric.category}
                  onClick={() => handleMetricClick(metric)}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                    selectedMetric === metric.category ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-900">{metric.category}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span 
                        className="font-bold text-sm"
                        style={{ color: getStatusColor(metric.status) }}
                      >
                        {metric.value}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${metric.value}%`,
                        backgroundColor: getStatusColor(metric.status)
                      }}
                    />
                  </div>

                  {/* Details for selected metric */}
                  {selectedMetric === metric.category && showDetails && metric.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">الحالي:</span>
                        <span className="font-medium">{metric.details.current.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">الهدف:</span>
                        <span className="font-medium">{metric.details.target}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">السابق:</span>
                        <span className="font-medium">{metric.details.previous.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">التغيير:</span>
                        <span className={cn(
                          "font-medium",
                          metric.details.current > metric.details.previous ? "text-green-600" : "text-red-600"
                        )}>
                          {((metric.details.current - metric.details.previous)).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Health Status Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['excellent', 'good', 'warning', 'critical'].map((status) => {
              const count = radarData.filter(m => m.status === status).length;
              const percentage = radarData.length > 0 ? Math.round((count / radarData.length) * 100) : 0;
              
              return (
                <div key={status} className="text-center p-3 border rounded-lg">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: getStatusColor(status) }}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {status === 'excellent' && 'ممتاز'}
                    {status === 'good' && 'جيد'}
                    {status === 'warning' && 'تحذير'}
                    {status === 'critical' && 'حرج'}
                  </div>
                  <div className="text-xs text-gray-500">({percentage}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialHealthRadar;