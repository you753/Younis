import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { FileText, Calculator, TrendingUp, PieChart } from 'lucide-react';
import { useEffect } from 'react';

export default function Accounts() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة الحسابات');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الحسابات</h2>
            <p className="text-gray-600">إدارة الحسابات المالية والميزانيات والتقارير المحاسبية</p>
          </div>
          
          <Button className="btn-accounting-primary">
            <FileText className="ml-2 h-4 w-4" />
            إنشاء تقرير مالي
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-red-100 text-red-600">
              <TrendingUp className="h-6 w-6 rotate-180" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-blue-100 text-blue-600">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">صافي الربح</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-purple-100 text-purple-600">
              <PieChart className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">هامش الربح</p>
              <p className="text-2xl font-bold text-gray-900">-%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">التقارير المالية</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="ml-2 h-4 w-4" />
              قائمة الدخل
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <PieChart className="ml-2 h-4 w-4" />
              الميزانية العمومية
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="ml-2 h-4 w-4" />
              تقرير التدفق النقدي
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="ml-2 h-4 w-4" />
              تقرير الأرباح والخسائر
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">دليل الحسابات</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              حسابات الأصول
            </Button>
            <Button variant="outline" className="w-full justify-start">
              حسابات الخصوم
            </Button>
            <Button variant="outline" className="w-full justify-start">
              حسابات الإيرادات
            </Button>
            <Button variant="outline" className="w-full justify-start">
              حسابات المصروفات
            </Button>
          </div>
        </div>
      </div>

      {/* Accounts Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">إدارة الحسابات</h3>
          <p className="text-gray-600">سيتم تطوير النظام المحاسبي المتكامل قريباً</p>
        </div>
      </div>
    </div>
  );
}
