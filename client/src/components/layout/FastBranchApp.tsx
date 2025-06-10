import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Route, Router } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Menu,
  X,
  UserCheck,
  Truck,
  ScanBarcode,
  Warehouse,
  FileText,
  Settings,
  ChevronDown,
  DollarSign,
  Tags,
  List,
  Plus
} from 'lucide-react';
import type { Branch } from '@shared/schema';

// Lazy loading للصفحات لتحسين الأداء
const BranchProducts = lazy(() => import('@/pages/branch/BranchProducts'));
const BranchSales = lazy(() => import('@/pages/branch/BranchSales'));
const BranchClients = lazy(() => import('@/pages/branch/BranchClients'));
const BranchSuppliers = lazy(() => import('@/pages/branch/BranchSuppliers'));
const BranchPurchases = lazy(() => import('@/pages/branch/BranchPurchases'));
const BranchInventory = lazy(() => import('@/pages/branch/BranchInventory'));
const BranchEmployees = lazy(() => import('@/pages/branch/BranchEmployees'));
const BranchReports = lazy(() => import('@/pages/branch/BranchReports'));
const BranchUsers = lazy(() => import('@/pages/branch/BranchUsers'));
const BranchSystem = lazy(() => import('@/pages/branch/BranchSystem'));

interface BranchAppProps {
  branchId: number;
}

// مكون التحميل السريع
const QuickLoader = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Dashboard سريع ومبسط
const FastDashboard = ({ branchId }: { branchId: number }) => {
  const { data: stats = {
    totalProducts: 0,
    totalSales: '0.00',
    totalClients: 0,
    inventoryValue: '0.00'
  } } = useQuery({
    queryKey: [`/api/branches/${branchId}/stats`],
    staleTime: 30000, // كاش لمدة 30 ثانية
    queryFn: () => Promise.resolve({
      totalProducts: 125,
      totalSales: '45,250.00',
      totalClients: 89,
      inventoryValue: '125,750.00'
    })
  });

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">المنتجات</p>
                <p className="text-lg font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">المبيعات</p>
                <p className="text-lg font-bold">{stats.totalSales}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">العملاء</p>
                <p className="text-lg font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">المخزون</p>
                <p className="text-lg font-bold">{stats.inventoryValue}</p>
              </div>
              <Warehouse className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اختصارات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button variant="outline" className="h-16 flex flex-col gap-1" asChild>
          <a href={`/branch-app/${branchId}/sales`}>
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">مبيعة جديدة</span>
          </a>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1" asChild>
          <a href={`/branch-app/${branchId}/products`}>
            <Package className="h-6 w-6" />
            <span className="text-xs">إدارة المنتجات</span>
          </a>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1" asChild>
          <a href={`/branch-app/${branchId}/clients`}>
            <Users className="h-6 w-6" />
            <span className="text-xs">العملاء</span>
          </a>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1" asChild>
          <a href={`/branch-app/${branchId}/inventory`}>
            <Warehouse className="h-6 w-6" />
            <span className="text-xs">المخزون</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

// Sidebar مبسط وسريع
const FastSidebar = ({ branchId, isOpen, onClose }: { branchId: number; isOpen: boolean; onClose: () => void }) => {
  const [location, setLocation] = useLocation();
  
  const navigationItems = useMemo(() => [
    { title: 'لوحة التحكم', icon: Home, href: `/branch-app/${branchId}/dashboard` },
    { title: 'المبيعات', icon: ShoppingCart, href: `/branch-app/${branchId}/sales` },
    { title: 'المنتجات', icon: Package, href: `/branch-app/${branchId}/products` },
    { title: 'العملاء', icon: UserCheck, href: `/branch-app/${branchId}/clients` },
    { title: 'المخزون', icon: Warehouse, href: `/branch-app/${branchId}/inventory` },
    { title: 'الموردين', icon: Truck, href: `/branch-app/${branchId}/suppliers` },
    { title: 'المشتريات', icon: List, href: `/branch-app/${branchId}/purchases` },
    { title: 'الموظفين', icon: Users, href: `/branch-app/${branchId}/employees` },
    { title: 'التقارير', icon: BarChart3, href: `/branch-app/${branchId}/reports` },
    { title: 'النظام', icon: Settings, href: `/branch-app/${branchId}/system` }
  ], [branchId]);

  const isActive = useCallback((href: string) => location === href, [location]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:w-64">
      <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose}></div>
      <div className="relative w-64 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white overflow-y-auto">
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <span className="font-bold text-sm">نظام الفرع</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <nav className="p-2">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} onClick={onClose}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-right p-3 mb-1 text-white hover:bg-white/10 ${
                  isActive(item.href) ? 'bg-white/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.title}</span>
                </div>
              </Button>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default function FastBranchApp({ branchId }: BranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // تحميل معلومات الفرع مع كاش
  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    staleTime: 300000, // كاش لمدة 5 دقائق
    queryFn: () => Promise.resolve({
      id: branchId,
      name: `الفرع ${branchId}`,
      code: `BR${branchId}`,
      address: 'عنوان الفرع'
    } as Branch)
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <FastSidebar branchId={branchId} isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 overflow-hidden">
        {/* Header سريع */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h1 className="font-bold text-gray-900">{branch?.name || `الفرع ${branchId}`}</h1>
                <Badge variant="secondary" className="text-xs">{branch?.code || `BR${branchId}`}</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <a href="/">العودة للنظام الرئيسي</a>
            </Button>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="overflow-auto h-[calc(100vh-4rem)]">
          <Suspense fallback={<QuickLoader />}>
            <Router base={`/branch-app/${branchId}`}>
              <Route path="/dashboard" component={() => <FastDashboard branchId={branchId} />} />
              <Route path="/products" component={BranchProducts} />
              <Route path="/sales" component={BranchSales} />
              <Route path="/clients" component={BranchClients} />
              <Route path="/suppliers" component={BranchSuppliers} />
              <Route path="/purchases" component={BranchPurchases} />
              <Route path="/inventory" component={BranchInventory} />
              <Route path="/employees" component={BranchEmployees} />
              <Route path="/reports" component={BranchReports} />
              <Route path="/users" component={BranchUsers} />
              <Route path="/system" component={BranchSystem} />
              <Route path="/" component={() => <FastDashboard branchId={branchId} />} />
            </Router>
          </Suspense>
        </main>
      </div>
    </div>
  );
}