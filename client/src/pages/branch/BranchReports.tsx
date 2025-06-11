import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Eye,
  FileText,
  PieChart,
  Warehouse,
  ShoppingCart
} from 'lucide-react';

interface BranchReportsProps {
  branchId: number;
}

export default function BranchReports({ branchId }: BranchReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000,
  });

  // تحويل البيانات إلى الشكل المطلوب مع التعامل مع البيانات الحقيقية
  const dashboardStats = stats as any || {
    totalClients: '0',
    totalSales: '0.00',
    totalPurchases: '0.00',
    inventoryValue: '0.00'
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  const reportCards = [
    {
      title: "تقرير المبيعات الشهري",
      description: "تفاصيل المبيعات والأرباح للشهر الحالي",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      value: `${dashboardStats.totalSales || '0.00'} ر.س`,
      trend: "+12%",
      data: [
        { label: "إجمالي المبيعات", value: `${dashboardStats.totalSales || '0.00'} ر.س` },
        { label: "عدد الفواتير", value: "15" },
        { label: "متوسط الفاتورة", value: "125.50 ر.س" },
        { label: "نمو المبيعات", value: "+12%" }
      ]
    },
    {
      title: "تقرير المخزون",
      description: "حالة المخزون والمنتجات المتاحة",
      icon: Warehouse,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      value: "8 منتج",
      trend: "+5%",
      data: [
        { label: "إجمالي المنتجات", value: "8" },
        { label: "قيمة المخزون", value: `${dashboardStats.inventoryValue || '0.00'} ر.س` },
        { label: "منتجات منخفضة", value: "2" },
        { label: "منتجات نفدت", value: "0" }
      ]
    },
    {
      title: "تقرير العملاء",
      description: "إحصائيات العملاء والمعاملات",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      value: `${dashboardStats.totalClients || 0} عميل`,
      trend: "+8%",
      data: [
        { label: "إجمالي العملاء", value: dashboardStats.totalClients || 0 },
        { label: "عملاء جدد", value: "3" },
        { label: "عملاء نشطون", value: "8" },
        { label: "متوسط الشراء", value: "95.50 ر.س" }
      ]
    },
    {
      title: "تقرير الأرباح",
      description: "تحليل الأرباح والتكاليف",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      value: "850.00 ر.س",
      trend: "+15%",
      data: [
        { label: "إجمالي الأرباح", value: "850.00 ر.س" },
        { label: "هامش الربح", value: "25%" },
        { label: "أرباح هذا الشهر", value: "320.00 ر.س" },
        { label: "نمو الأرباح", value: "+15%" }
      ]
    }
  ];

  const quickReports = [
    { name: "تقرير المبيعات اليومية", type: "daily-sales", icon: ShoppingCart },
    { name: "تقرير المنتجات الأكثر مبيعاً", type: "top-products", icon: Package },
    { name: "تقرير العملاء النشطين", type: "active-clients", icon: Users },
    { name: "تقرير حالة المخزون", type: "inventory-status", icon: Warehouse },
    { name: "تقرير الأرباح الشهرية", type: "monthly-profit", icon: DollarSign },
    { name: "تقرير المرتجعات", type: "returns", icon: FileText }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId} - تقارير شاملة ومفصلة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 ml-2" />
            فلترة بالتاريخ
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقارير
          </Button>
        </div>
      </div>

      {/* فترة التقرير */}
      <div className="flex gap-2">
        {[
          { key: 'day', label: 'اليوم' },
          { key: 'week', label: 'هذا الأسبوع' },
          { key: 'month', label: 'هذا الشهر' },
          { key: 'year', label: 'هذا العام' }
        ].map((period) => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period.key)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* التقارير الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className={`${report.bgColor} border-0 shadow-sm`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                    <report.icon className={`h-5 w-5 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {report.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.data.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* التقارير السريعة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            التقارير السريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {quickReports.map((report, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
              >
                <report.icon className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-center">{report.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* رسوم بيانية سريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              مبيعات آخر 7 أيام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => {
                const value = Math.floor(Math.random() * 1000) + 200;
                const percentage = (value / 1200) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-16">{day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-16">{value} ر.س</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              توزيع المبيعات حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: 'الأثواب', percentage: 45, color: 'bg-blue-600' },
                { category: 'العبايات', percentage: 30, color: 'bg-green-600' },
                { category: 'القمصان', percentage: 15, color: 'bg-orange-600' },
                { category: 'الإكسسوارات', percentage: 10, color: 'bg-purple-600' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm flex-1">{item.category}</span>
                  <span className="text-sm font-bold">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}