import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function Inventory() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة المخزون');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المخزون</h2>
            <p className="text-gray-600">متابعة مستويات المخزون وحركة البضائع</p>
          </div>
          
          <Button className="btn-accounting-primary">
            <RotateCcw className="ml-2 h-4 w-4" />
            جرد المخزون
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-blue-100 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الأصناف</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-yellow-100 text-yellow-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">تحت الحد الأدنى</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-red-100 text-red-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">أصناف نافدة</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <RotateCcw className="ml-2 h-4 w-4" />
              جرد شامل للمخزون
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="ml-2 h-4 w-4" />
              تقرير النواقص
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="ml-2 h-4 w-4" />
              حركة المخزون
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="ml-2 h-4 w-4" />
              تعديل الكميات
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات المخزون</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-900">لا توجد تنبيهات حالياً</p>
                <p className="text-xs text-gray-500">جميع الأصناف في مستوى آمن</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">إدارة المخزون</h3>
          <p className="text-gray-600">سيتم تطوير نظام إدارة المخزون المتكامل قريباً</p>
        </div>
      </div>
    </div>
  );
}
