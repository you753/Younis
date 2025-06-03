import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { useEffect } from 'react';

export default function Reports() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('التقارير والإحصائيات');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h2>
            <p className="text-gray-600">عرض التقارير المالية والإحصائيات التفصيلية للنشاط التجاري</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
            <Button className="btn-accounting-primary">
              <Download className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="stats-card-icon bg-blue-100 text-blue-600 mr-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">تقارير المبيعات</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير المبيعات اليومية
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير المبيعات الشهرية
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              أفضل المنتجات مبيعاً
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير العملاء
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="stats-card-icon bg-purple-100 text-purple-600 mr-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">تقارير المشتريات</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير المشتريات اليومية
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير المشتريات الشهرية
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير الموردين
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تكلفة البضاعة المباعة
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="stats-card-icon bg-green-100 text-green-600 mr-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">التقارير المالية</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              قائمة الدخل
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              الميزانية العمومية
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير التدفق النقدي
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              تقرير الأرباح والخسائر
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">فلاتر سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="w-full">
            <Calendar className="ml-2 h-4 w-4" />
            اليوم
          </Button>
          <Button variant="outline" className="w-full">
            <Calendar className="ml-2 h-4 w-4" />
            هذا الأسبوع
          </Button>
          <Button variant="outline" className="w-full">
            <Calendar className="ml-2 h-4 w-4" />
            هذا الشهر
          </Button>
          <Button variant="outline" className="w-full">
            <Calendar className="ml-2 h-4 w-4" />
            هذا العام
          </Button>
        </div>
      </div>

      {/* Reports Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">نظام التقارير</h3>
          <p className="text-gray-600 mb-6">سيتم تطوير نظام التقارير المتكامل مع الرسوم البيانية التفاعلية قريباً</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Button variant="outline" className="w-full">
              <BarChart3 className="ml-2 h-4 w-4" />
              رسوم بيانية
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="ml-2 h-4 w-4" />
              تقارير PDF
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
