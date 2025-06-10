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
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة المنتجات</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة منتجات الفرع</h3>
          <p className="text-gray-500">سيتم إضافة واجهة إدارة المنتجات الخاصة بالفرع هنا</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchSalesContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة المبيعات</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة مبيعات الفرع</h3>
          <p className="text-gray-500">سيتم إضافة واجهة إدارة المبيعات الخاصة بالفرع هنا</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchClientsContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة العملاء</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة عملاء الفرع</h3>
          <p className="text-gray-500">سيتم إضافة واجهة إدارة العملاء الخاصة بالفرع هنا</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchReportsContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تقارير الفرع</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير وإحصائيات الفرع</h3>
          <p className="text-gray-500">سيتم إضافة واجهة التقارير الخاصة بالفرع هنا</p>
        </CardContent>
      </Card>
    </div>
  );
}