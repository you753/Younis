import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Zap, BarChart3, TrendingUp, RefreshCw, Eye, Download, Calendar, ArrowUpDown, Filter, Search, FileText, Activity } from 'lucide-react';

interface BranchAdvancedInventoryProps {
  branchId?: number;
}

export default function BranchAdvancedInventory({ branchId }: BranchAdvancedInventoryProps) {
  const [activeTab, setActiveTab] = useState('optimization');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // بيانات تجريبية شاملة للعمليات المتقدمة
  const inventoryOptimization = {
    summary: {
      totalOptimizationOpportunities: 15,
      potentialSavings: 125000,
      overStockedItems: 8,
      underStockedItems: 7,
      optimalStockItems: 141,
      lastAnalysisDate: '2025-07-18'
    },
    opportunities: [
      {
        id: 1,
        type: 'overstock',
        product: {
          name: 'ماوس لاسلكي Logitech MX Master 3',
          code: 'LOG-MX-MST3',
          category: 'اكسسوارات'
        },
        currentStock: 45,
        optimalStock: 25,
        excess: 20,
        tiedUpCapital: 6400,
        suggestion: 'تخفيض كمية الطلب القادم بنسبة 40%',
        priority: 'medium',
        impact: 'medium'
      },
      {
        id: 2,
        type: 'understock',
        product: {
          name: 'هارد ديسك خارجي Western Digital 2TB',
          code: 'WD-EXT-2TB',
          category: 'التخزين'
        },
        currentStock: 3,
        optimalStock: 15,
        shortage: 12,
        lostSales: 8400,
        suggestion: 'زيادة كمية الطلب إلى 20 وحدة',
        priority: 'high',
        impact: 'high'
      },
      {
        id: 3,
        type: 'slow_moving',
        product: {
          name: 'سماعات بلوتوث Sony WH-1000XM4',
          code: 'SONY-WH-1000',
          category: 'صوتيات'
        },
        currentStock: 12,
        daysSinceLastSale: 45,
        averageMonthlyMovement: 2,
        tiedUpCapital: 9600,
        suggestion: 'تشغيل حملة ترويجية أو خفض السعر بنسبة 15%',
        priority: 'medium',
        impact: 'medium'
      },
      {
        id: 4,
        type: 'obsolete',
        product: {
          name: 'كيبورد سلكي Microsoft Wired',
          code: 'MS-KB-WRD',
          category: 'اكسسوارات'
        },
        currentStock: 8,
        daysSinceLastSale: 90,
        originalValue: 1600,
        suggestion: 'التخلص من المخزون بسعر التكلفة أو أقل',
        priority: 'low',
        impact: 'low'
      }
    ],
    performanceMetrics: {
      inventoryTurnover: 3.2,
      averageStockAge: 85,
      stockAccuracy: 97.5,
      fillRate: 94.2,
      carryingCostPercentage: 18.5,
      deadStockPercentage: 5.2
    }
  };

  const demandForecasting = {
    forecastAccuracy: 87.3,
    nextMonthDemand: [
      {
        product: 'لابتوب HP EliteBook 840 G7',
        code: 'HP-ELB-840',
        currentStock: 15,
        forecastedDemand: 18,
        confidence: 92,
        suggestedOrder: 25,
        trend: 'up'
      },
      {
        product: 'طابعة Canon PIXMA MG3620',
        code: 'CAN-PIX-3620',
        currentStock: 8,
        forecastedDemand: 12,
        confidence: 88,
        suggestedOrder: 15,
        trend: 'stable'
      },
      {
        product: 'ماوس لاسلكي Logitech MX Master 3',
        code: 'LOG-MX-MST3',
        currentStock: 45,
        forecastedDemand: 8,
        confidence: 85,
        suggestedOrder: 0,
        trend: 'down'
      }
    ],
    seasonalFactors: [
      {
        month: 'يوليو',
        factor: 1.15,
        description: 'زيادة الطلب في فصل الصيف'
      },
      {
        month: 'أغسطس',
        factor: 1.35,
        description: 'ذروة موسم العودة للمدارس'
      },
      {
        month: 'سبتمبر',
        factor: 1.28,
        description: 'استمرار موسم العودة للمدارس'
      }
    ]
  };

  const cycleCountingPlan = [
    {
      id: 1,
      zone: 'مخزن A - القسم 1',
      scheduledDate: '2025-07-20',
      itemsCount: 45,
      assignedTo: 'أحمد محمد المخزين',
      priority: 'high',
      status: 'scheduled',
      lastCount: '2025-06-15',
      accuracy: 98.2
    },
    {
      id: 2,
      zone: 'مخزن A - القسم 2',
      scheduledDate: '2025-07-22',
      itemsCount: 38,
      assignedTo: 'فاطمة أحمد',
      priority: 'medium',
      status: 'scheduled',
      lastCount: '2025-06-18',
      accuracy: 96.8
    },
    {
      id: 3,
      zone: 'مخزن B - قسم الاستقبال',
      scheduledDate: '2025-07-25',
      itemsCount: 22,
      assignedTo: 'سارة خالد',
      priority: 'low',
      status: 'pending',
      lastCount: '2025-06-20',
      accuracy: 99.1
    },
    {
      id: 4,
      zone: 'مخزن C - البضائع عالية القيمة',
      scheduledDate: '2025-07-19',
      itemsCount: 15,
      assignedTo: 'عبد الله علي',
      priority: 'critical',
      status: 'in_progress',
      lastCount: '2025-07-10',
      accuracy: 100.0
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">حرج</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">عالي</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">متوسط</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">منخفض</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">مجدول</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">معلق</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const renderOptimization = () => (
    <div className="space-y-6">
      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">فرص التحسين</p>
                <p className="text-2xl font-bold text-blue-600">{inventoryOptimization.summary.totalOptimizationOpportunities}</p>
                <p className="text-xs text-blue-600">فرصة متاحة</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">وفورات محتملة</p>
                <p className="text-2xl font-bold text-green-600">{inventoryOptimization.summary.potentialSavings.toLocaleString('en-US')}</p>
                <p className="text-xs text-green-600">ريال سعودي</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">دقة المخزون</p>
                <p className="text-2xl font-bold text-purple-600">{inventoryOptimization.performanceMetrics.stockAccuracy}%</p>
                <p className="text-xs text-purple-600">معدل الدقة</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة فرص التحسين */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg font-semibold">فرص تحسين المخزون</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {inventoryOptimization.opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{opportunity.product.name}</h3>
                        <span className="text-sm text-blue-600">{opportunity.product.code}</span>
                        <Badge variant="outline" className="text-xs">{opportunity.product.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">المخزون الحالي:</span>
                          <p className="font-bold text-gray-800">{opportunity.currentStock}</p>
                        </div>
                        {opportunity.optimalStock && (
                          <div>
                            <span className="text-gray-500">المخزون الأمثل:</span>
                            <p className="font-bold text-blue-600">{opportunity.optimalStock}</p>
                          </div>
                        )}
                        {opportunity.excess && (
                          <div>
                            <span className="text-gray-500">الفائض:</span>
                            <p className="font-bold text-red-600">{opportunity.excess}</p>
                          </div>
                        )}
                        {opportunity.shortage && (
                          <div>
                            <span className="text-gray-500">النقص:</span>
                            <p className="font-bold text-orange-600">{opportunity.shortage}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium text-blue-800">التوصية:</p>
                        <p className="text-sm text-blue-700">{opportunity.suggestion}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getPriorityBadge(opportunity.priority)}
                        <span className="text-sm text-gray-600">
                          التأثير: {opportunity.impact === 'high' ? 'عالي' : opportunity.impact === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                        {opportunity.tiedUpCapital && (
                          <span className="text-sm text-red-600">
                            رأس مال مقيد: {opportunity.tiedUpCapital.toLocaleString('en-US')} ريال
                          </span>
                        )}
                        {opportunity.lostSales && (
                          <span className="text-sm text-orange-600">
                            مبيعات مفقودة: {opportunity.lostSales.toLocaleString('en-US')} ريال
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        تطبيق التوصية
                      </Button>
                      <Button size="sm" variant="outline">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderForecasting = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">توقعات الطلب للشهر القادم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demandForecasting.nextMonthDemand.map((forecast, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{forecast.product}</h4>
                      <p className="text-sm text-gray-600">{forecast.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <span className="text-sm text-gray-600">{forecast.confidence}% دقة</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">المخزون:</span>
                      <p className="font-bold">{forecast.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">الطلب المتوقع:</span>
                      <p className="font-bold text-blue-600">{forecast.forecastedDemand}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">الطلب المقترح:</span>
                      <p className="font-bold text-green-600">{forecast.suggestedOrder}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">العوامل الموسمية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demandForecasting.seasonalFactors.map((factor, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{factor.month}</h4>
                    <span className={`text-lg font-bold ${factor.factor > 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {(factor.factor * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCycleCounting = () => (
    <Card>
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">خطة الجرد الدوري</CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700">
            إضافة جرد جديد
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                <th className="text-right p-4 font-semibold text-gray-700">المنطقة</th>
                <th className="text-right p-4 font-semibold text-gray-700">التاريخ المجدول</th>
                <th className="text-right p-4 font-semibold text-gray-700">عدد العناصر</th>
                <th className="text-right p-4 font-semibold text-gray-700">المسؤول</th>
                <th className="text-right p-4 font-semibold text-gray-700">الأولوية</th>
                <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                <th className="text-right p-4 font-semibold text-gray-700">دقة آخر جرد</th>
                <th className="text-right p-4 font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cycleCountingPlan.map((count, index) => (
                <tr key={count.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{count.zone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-800">{count.scheduledDate}</div>
                    <div className="text-xs text-gray-500">آخر جرد: {count.lastCount}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-lg font-medium text-blue-600">{count.itemsCount}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-800">{count.assignedTo}</div>
                  </td>
                  <td className="p-4">
                    {getPriorityBadge(count.priority)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(count.status)}
                  </td>
                  <td className="p-4">
                    <div className={`text-lg font-bold ${count.accuracy >= 99 ? 'text-green-600' : count.accuracy >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {count.accuracy}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        عرض
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        بدء
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Package className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون المتقدمة</h1>
          <p className="text-gray-600">تحسين وتحليل متقدم لأداء المخزون - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* شريط التبويب */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('optimization')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'optimization'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="h-4 w-4 inline ml-2" />
            تحسين المخزون
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'forecasting'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline ml-2" />
            توقعات الطلب
          </button>
          <button
            onClick={() => setActiveTab('cycle_counting')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cycle_counting'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <RefreshCw className="h-4 w-4 inline ml-2" />
            الجرد الدوري
          </button>
        </nav>
      </div>

      {/* محتوى التبويبات */}
      <div className="mt-6">
        {activeTab === 'optimization' && renderOptimization()}
        {activeTab === 'forecasting' && renderForecasting()}
        {activeTab === 'cycle_counting' && renderCycleCounting()}
      </div>
    </div>
  );
}