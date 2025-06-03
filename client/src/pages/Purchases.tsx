import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, TrendingDown, DollarSign } from 'lucide-react';
import { useEffect } from 'react';

export default function Purchases() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة المشتريات');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المشتريات</h2>
            <p className="text-gray-600">تسجيل المشتريات من الموردين وإدارة المخزون</p>
          </div>
          
          <Button className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            فاتورة مشتريات جديدة
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مشتريات اليوم</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-blue-100 text-blue-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">عدد الفواتير</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-orange-100 text-orange-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">متوسط الفاتورة</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-red-100 text-red-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مشتريات الشهر</p>
              <p className="text-2xl font-bold text-gray-900">- ر.س</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">إدارة المشتريات</h3>
          <p className="text-gray-600 mb-6">سيتم تطوير نظام إدارة المشتريات والفواتير قريباً</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button variant="outline" className="w-full">
              <Plus className="ml-2 h-4 w-4" />
              فاتورة نقدية
            </Button>
            <Button variant="outline" className="w-full">
              <ShoppingCart className="ml-2 h-4 w-4" />
              فاتورة آجلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
