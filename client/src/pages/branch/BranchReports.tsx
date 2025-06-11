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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId} - تقارير شاملة ومفصلة</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          تصدير التقارير
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* تقرير المبيعات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any)?.totalSales || '0.00'} ر.س</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        {/* تقرير العملاء */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any)?.totalClients || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +5 عملاء جدد هذا الشهر
            </p>
          </CardContent>
        </Card>

        {/* تقرير المنتجات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              منتجات متاحة
            </p>
          </CardContent>
        </Card>

        {/* تقرير المخزون */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any)?.inventoryValue || '0.00'} ر.س</div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>
      </div>

      {/* التقارير التفصيلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تقرير المبيعات الأسبوعية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => {
              const value = Math.floor(Math.random() * 500) + 100;
              const percentage = (value / 600) * 100;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm">{day}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-sm font-medium">{value} ر.س</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'ثوب مطرز', sales: 15, revenue: '1,500' },
              { name: 'عباية سوداء', sales: 8, revenue: '800' },
              { name: 'قميص قطني', sales: 5, revenue: '300' },
              { name: 'إكسسوارات', sales: 3, revenue: '150' }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.sales} مبيعة</div>
                </div>
                <div className="font-bold">{product.revenue} ر.س</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}