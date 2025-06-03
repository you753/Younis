import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import ProductForm from '@/components/forms/ProductForm';
import ProductsTable from '@/components/tables/ProductsTable';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Products() {
  const [location, setLocation] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [currentView, setCurrentView] = useState<'list' | 'add'>('list');

  useEffect(() => {
    if (location === '/products/add') {
      setCurrentView('add');
      setCurrentPage('إضافة صنف جديد');
    } else {
      setCurrentView('list');
      setCurrentPage('إدارة الأصناف');
    }
  }, [location, setCurrentPage]);

  const switchToAdd = () => {
    setLocation('/products/add');
  };

  const switchToList = () => {
    setLocation('/products');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentView === 'add' ? 'إضافة صنف جديد' : 'إدارة الأصناف'}
            </h2>
            <p className="text-gray-600">
              {currentView === 'add' 
                ? 'إضافة صنف جديد إلى المخزون مع تحديد الأسعار والكميات'
                : 'عرض وإدارة جميع الأصناف المتاحة في المخزون'
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            {currentView === 'list' ? (
              <Button onClick={switchToAdd} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة صنف جديد
              </Button>
            ) : (
              <Button onClick={switchToList} variant="outline">
                <List className="ml-2 h-4 w-4" />
                عرض القائمة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Based on Current View */}
      {currentView === 'add' ? (
        <ProductForm />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="stats-card">
              <div className="flex items-center">
                <div className="stats-card-icon bg-blue-100 text-blue-600">
                  <List className="h-6 w-6" />
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
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">أصناف منخفضة المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center">
                <div className="stats-card-icon bg-green-100 text-green-600">
                  <span className="text-lg">💰</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">- ر.س</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <ProductsTable />
        </>
      )}
    </div>
  );
}
