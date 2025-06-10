import { useState, useEffect } from 'react';
import { Route, Router } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  ArrowRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchAppProps {
  branchId: number;
}

export default function BranchApp({ branchId }: BranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();

  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`]
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/branches/${branchId}/stats`],
    queryFn: () => ({
      totalProducts: 15,
      totalSales: '25,480.00',
      totalClients: 8,
      inventoryValue: '45,200.00',
      todaySales: '3,250.00',
      monthlyGrowth: 12
    })
  });

  const exitBranch = () => {
    setLocation('/branch-management');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex h-screen">
        {/* الشريط الجانبي */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
          {/* هيدر الفرع */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-green-600"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exitBranch}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {sidebarOpen && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-6 w-6 text-green-600" />
                  <div>
                    <h2 className="font-bold text-green-900 text-sm">{branch?.name || 'الفرع'}</h2>
                    <Badge variant="outline" className="text-xs">{branch?.code}</Badge>
                  </div>
                </div>
                <p className="text-xs text-green-600">نظام إدارة منفصل</p>
              </div>
            )}
          </div>

          {/* قائمة التنقل */}
          <nav className="flex-1 overflow-y-auto p-2">
            {/* لوحة التحكم */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-2 ${location === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setLocation('/')}
            >
              <Home className="h-4 w-4" />
              {sidebarOpen && <span className="mr-3">لوحة التحكم</span>}
            </Button>

            {/* المنتجات */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-2 ${location === '/products' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setLocation('/products')}
            >
              <Package className="h-4 w-4" />
              {sidebarOpen && <span className="mr-3">المنتجات</span>}
            </Button>

            {/* المبيعات */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-2 ${location === '/sales' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setLocation('/sales')}
            >
              <ShoppingCart className="h-4 w-4" />
              {sidebarOpen && <span className="mr-3">المبيعات</span>}
            </Button>

            {/* العملاء */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-2 ${location === '/clients' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setLocation('/clients')}
            >
              <Users className="h-4 w-4" />
              {sidebarOpen && <span className="mr-3">العملاء</span>}
            </Button>

            {/* التقارير */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-2 ${location === '/reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setLocation('/reports')}
            >
              <BarChart3 className="h-4 w-4" />
              {sidebarOpen && <span className="mr-3">التقارير</span>}
            </Button>
          </nav>

          {/* معلومات الفرع */}
          {sidebarOpen && branch && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 space-y-1">
                {branch.address && (
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span>{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-1">
                    <span>📞</span>
                    <span>{branch.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 overflow-y-auto">
          <Router>
            <Route path="/">
              <BranchDashboardContent branch={branch} stats={stats} />
            </Route>
            <Route path="/products">
              <BranchProductsContent branchId={branchId} />
            </Route>
            <Route path="/sales">
              <BranchSalesContent branchId={branchId} />
            </Route>
            <Route path="/clients">
              <BranchClientsContent branchId={branchId} />
            </Route>
            <Route path="/reports">
              <BranchReportsContent branchId={branchId} />
            </Route>
          </Router>
        </main>
      </div>
    </div>
  );
}

// مكون لوحة التحكم للفرع
function BranchDashboardContent({ branch, stats }: { branch?: Branch; stats?: any }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">لوحة تحكم الفرع</h1>
        <p className="text-gray-600">مرحباً بك في {branch?.name || 'الفرع'}</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">{stats?.totalProducts || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">المبيعات</p>
                <p className="text-2xl font-bold text-green-700">{stats?.totalSales || '0.00'} ر.س</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">العملاء</p>
                <p className="text-2xl font-bold text-purple-700">{stats?.totalClients || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">قيمة المخزون</p>
                <p className="text-2xl font-bold text-orange-700">{stats?.inventoryValue || '0.00'} ر.س</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معلومات الفرع */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الفرع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">اسم الفرع</label>
              <p className="text-lg font-medium">{branch?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">كود الفرع</label>
              <p className="text-lg font-medium">{branch?.code}</p>
            </div>
            {branch?.address && (
              <div>
                <label className="text-sm font-medium text-gray-600">العنوان</label>
                <p className="text-lg font-medium">{branch.address}</p>
              </div>
            )}
            {branch?.phone && (
              <div>
                <label className="text-sm font-medium text-gray-600">الهاتف</label>
                <p className="text-lg font-medium">{branch.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// مكونات أخرى للصفحات
function BranchProductsContent({ branchId }: { branchId: number }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('فشل في جلب المنتجات');
      return response.json();
    }
  });

  const filteredProducts = products.filter((p: any) => p.branchId === branchId || !p.branchId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Package className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* إحصائيات المنتجات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                <p className="text-xl font-bold">{filteredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">متوفر</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredProducts.filter((p: any) => (p.quantity || 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">نفد المخزون</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredProducts.filter((p: any) => (p.quantity || 0) === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قريب النفاد</p>
                <p className="text-xl font-bold text-orange-600">
                  {filteredProducts.filter((p: any) => (p.quantity || 0) > 0 && (p.quantity || 0) < (p.minQuantity || 5)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            قائمة المنتجات - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة منتجات خاصة بهذا الفرع</p>
              <Button>
                <Package className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">المنتج</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الكود</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">السعر</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">المخزون</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const stockStatus = (product.quantity || 0) === 0 ? 'نفد' : 
                                      (product.quantity || 0) < (product.minQuantity || 5) ? 'قريب النفاد' : 'متوفر';
                    const stockColor = stockStatus === 'نفد' ? 'destructive' : 
                                     stockStatus === 'قريب النفاد' ? 'secondary' : 'default';
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500">{product.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{product.code || 'غير محدد'}</div>
                            {product.barcode && (
                              <div className="text-gray-500">{product.barcode}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{product.salePrice || '0'} ر.س</div>
                            {product.purchasePrice && (
                              <div className="text-gray-500">التكلفة: {product.purchasePrice} ر.س</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{product.quantity || 0}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={stockColor as any}>
                            {stockStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              عرض
                            </Button>
                            <Button variant="ghost" size="sm">
                              تعديل
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BranchSalesContent({ branchId }: { branchId: number }) {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/sales`],
    queryFn: async () => {
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('فشل في جلب المبيعات');
      return response.json();
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('فشل في جلب العملاء');
      return response.json();
    }
  });

  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : `عميل #${clientId}`;
  };

  const totalSales = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
  const todaySales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المبيعات</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="ml-2 h-4 w-4" />
            فاتورة جديدة
          </Button>
        </div>
      </div>

      {/* إحصائيات المبيعات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مبيعات اليوم</p>
                <p className="text-xl font-bold text-orange-600">{todaySales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قيمة مبيعات اليوم</p>
                <p className="text-xl font-bold text-purple-600">{todayTotal.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المبيعات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            فواتير المبيعات - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مبيعات في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإنشاء فواتير مبيعات خاصة بهذا الفرع</p>
              <Button>
                <ShoppingCart className="ml-2 h-4 w-4" />
                فاتورة جديدة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">رقم الفاتورة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">العميل</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">#{sale.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{getClientName(sale.clientId)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-green-600">{sale.total} ر.س</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">مكتملة</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            عرض
                          </Button>
                          <Button variant="ghost" size="sm">
                            طباعة
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            إلغاء
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BranchClientsContent({ branchId }: { branchId: number }) {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('فشل في جلب العملاء');
      return response.json();
    }
  });

  const totalBalance = clients.reduce((sum: number, client: any) => sum + parseFloat(client.balance || '0'), 0);
  const activeClients = clients.filter((client: any) => parseFloat(client.balance || '0') > 0);
  const clientsWithPhone = clients.filter((client: any) => client.phone);
  const clientsWithEmail = clients.filter((client: any) => client.email);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Users className="ml-2 h-4 w-4" />
            إضافة عميل
          </Button>
        </div>
      </div>

      {/* إحصائيات العملاء */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-xl font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">عملاء نشطون</p>
                <p className="text-xl font-bold text-green-600">{activeClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
                <p className="text-xl font-bold text-blue-600">{totalBalance.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">لديهم هاتف</p>
                <p className="text-xl font-bold text-orange-600">{clientsWithPhone.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول العملاء */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة العملاء - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة عملاء خاصين بهذا الفرع</p>
              <Button>
                <Users className="ml-2 h-4 w-4" />
                إضافة عميل جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">العميل</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">معلومات الاتصال</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الرصيد</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">تاريخ الإضافة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any) => {
                    const balance = parseFloat(client.balance || '0');
                    const balanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600';
                    
                    return (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">ID: {client.id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm space-y-1">
                            {client.phone && (
                              <div className="flex items-center gap-1">
                                <span>📞</span>
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <span>✉️</span>
                                <span>{client.email}</span>
                              </div>
                            )}
                            {!client.phone && !client.email && (
                              <span className="text-gray-400">غير محدد</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${balanceColor}`}>
                            {Math.abs(balance).toFixed(2)} ر.س
                            {balance > 0 && <span className="text-xs text-gray-500 block">دائن</span>}
                            {balance < 0 && <span className="text-xs text-gray-500 block">مدين</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              عرض
                            </Button>
                            <Button variant="ghost" size="sm">
                              تعديل
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BranchReportsContent({ branchId }: { branchId: number }) {
  const { data: sales = [] } = useQuery({
    queryKey: [`/api/branches/${branchId}/sales`],
    queryFn: async () => {
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('فشل في جلب المبيعات');
      return response.json();
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: [`/api/branches/${branchId}/products`],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('فشل في جلب المنتجات');
      return response.json();
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: [`/api/branches/${branchId}/clients`],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('فشل في جلب العملاء');
      return response.json();
    }
  });

  // إحصائيات متقدمة
  const totalSales = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
  const todaySales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const thisMonthSales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  });
  const lastMonthSales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthTotal = thisMonthSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
  const lastMonthTotal = lastMonthSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
  const growthRate = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;

  const totalInventoryValue = products.reduce((sum: number, product: any) => {
    return sum + ((product.quantity || 0) * parseFloat(product.salePrice || '0'));
  }, 0);

  const lowStockProducts = products.filter((p: any) => (p.quantity || 0) < (p.minQuantity || 5));
  const outOfStockProducts = products.filter((p: any) => (p.quantity || 0) === 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">تقارير الفرع</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير PDF
          </Button>
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <BarChart3 className="ml-2 h-4 w-4" />
            تقرير مفصل
          </Button>
        </div>
      </div>

      {/* نظرة عامة على الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-200 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-600">إجمالي المبيعات</p>
                <p className="text-xl font-bold text-green-700">{totalSales.toFixed(2)} ر.س</p>
                <p className="text-xs text-green-500">{sales.length} فاتورة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-200 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-600">مبيعات الشهر</p>
                <p className="text-xl font-bold text-blue-700">{thisMonthTotal.toFixed(2)} ر.س</p>
                <div className="flex items-center gap-1">
                  {growthRate >= 0 ? (
                    <span className="text-xs text-green-500">↗ +{growthRate.toFixed(1)}%</span>
                  ) : (
                    <span className="text-xs text-red-500">↘ {growthRate.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-200 p-2 rounded-full">
                <Package className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-600">قيمة المخزون</p>
                <p className="text-xl font-bold text-purple-700">{totalInventoryValue.toFixed(2)} ر.س</p>
                <p className="text-xs text-purple-500">{products.length} منتج</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-200 p-2 rounded-full">
                <Users className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-600">العملاء النشطون</p>
                <p className="text-xl font-bold text-orange-700">{clients.length}</p>
                <p className="text-xs text-orange-500">عميل مسجل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تقارير تفصيلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* تقرير المبيعات اليومية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              مبيعات اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">عدد الفواتير</span>
                <span className="font-bold text-green-600">{todaySales.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">إجمالي القيمة</span>
                <span className="font-bold text-green-600">
                  {todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0).toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">متوسط الفاتورة</span>
                <span className="font-bold text-blue-600">
                  {todaySales.length > 0 
                    ? (todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0) / todaySales.length).toFixed(2)
                    : '0.00'
                  } ر.س
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تقرير حالة المخزون */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              حالة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">منتجات متوفرة</span>
                <span className="font-bold text-green-600">
                  {products.filter((p: any) => (p.quantity || 0) > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">قريب النفاد</span>
                <span className="font-bold text-orange-600">{lowStockProducts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نفد المخزون</span>
                <span className="font-bold text-red-600">{outOfStockProducts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نسبة التوفر</span>
                <span className="font-bold text-blue-600">
                  {products.length > 0 
                    ? ((products.filter((p: any) => (p.quantity || 0) > 0).length / products.length) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تقارير سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تقرير المبيعات</h3>
            <p className="text-gray-600 mb-4">تقرير مفصل عن مبيعات الفرع</p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              عرض التقرير
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تقرير المخزون</h3>
            <p className="text-gray-600 mb-4">حالة المخزون والمنتجات</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              عرض التقرير
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تقرير العملاء</h3>
            <p className="text-gray-600 mb-4">إحصائيات وأنشطة العملاء</p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              عرض التقرير
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}