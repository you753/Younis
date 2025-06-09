import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import ProductForm from '@/components/forms/ProductForm';
import ProductsTable from '@/components/tables/ProductsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Search, Edit } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@shared/schema';

export default function Products() {
  const [location, setLocation] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // جلب بيانات المنتجات
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // فلترة المنتجات بناءً على البحث المحلي
  const filteredProducts = Array.isArray(products) ? products.filter((product: Product) => {
    if (!localSearchQuery.trim()) return true;
    
    const searchTerms = localSearchQuery.toLowerCase().trim().split(' ');
    const searchText = `${product.name || ''} ${product.code || ''} ${product.barcode || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  useEffect(() => {
    if (location === '/products/add') {
      setCurrentView('add');
      setCurrentPage('إضافة صنف جديد');
    } else if (location.startsWith('/products/edit/')) {
      const productId = parseInt(location.split('/').pop() || '');
      setEditProductId(productId);
      setCurrentView('edit');
      setCurrentPage('تعديل الصنف');
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
              {currentView === 'add' ? 'إضافة صنف جديد' : 
               currentView === 'edit' ? 'تعديل الصنف' : 'إدارة الأصناف'}
            </h2>
            <p className="text-gray-600">
              {currentView === 'add' 
                ? 'إضافة صنف جديد إلى المخزون مع تحديد الأسعار والكميات'
                : currentView === 'edit'
                ? 'تعديل بيانات الصنف الحالي وتحديث معلوماته'
                : 'عرض وإدارة جميع الأصناف المتاحة في المخزون'
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            {currentView === 'list' && <OnboardingTrigger tourName="products" />}
            {currentView === 'list' ? (
              <Button onClick={switchToAdd} className="btn-accounting-primary" data-onboarding="add-product">
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
      ) : currentView === 'edit' ? (
        <ProductForm productId={editProductId} />
      ) : (
        <>
          {/* شريط البحث المحلي */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <SearchBox
                placeholder="البحث عن منتج (الاسم، الكود، الباركود، الفئة...)"
                value={localSearchQuery}
                onChange={setLocalSearchQuery}
                className="max-w-md"
              />
              {localSearchQuery && (
                <div className="mt-3 text-sm text-gray-600">
                  النتائج: {filteredProducts.length} من أصل {products.length} منتج
                </div>
              )}
            </CardContent>
          </Card>

          {/* نتائج البحث */}
          {localSearchQuery && filteredProducts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>نتائج البحث ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 text-right">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 space-x-2 rtl:space-x-reverse">
                          {product.code && <Badge variant="outline">كود: {product.code}</Badge>}
                          {product.category && <Badge variant="secondary">{product.category}</Badge>}
                          {product.barcode && <span className="text-xs">🏷️ {product.barcode}</span>}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {product.salePrice && <span className="text-green-600 font-medium">سعر البيع: {product.salePrice} ر.س</span>}
                          {product.salePrice && product.quantity && <span className="mx-2">•</span>}
                          {product.quantity !== null && <span>الكمية: {product.quantity}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          عرض
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* رسالة عدم وجود نتائج */}
          {localSearchQuery && filteredProducts.length === 0 && (
            <Card className="mb-6">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-4">لم نجد أي منتجات تطابق البحث "{localSearchQuery}"</p>
                <Button variant="outline" onClick={() => setLocalSearchQuery('')}>
                  مسح البحث
                </Button>
              </CardContent>
            </Card>
          )}

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
          {!localSearchQuery && (
            <div data-onboarding="products-table">
              <ProductsTable />
            </div>
          )}
        </>
      )}
    </div>
  );
}
