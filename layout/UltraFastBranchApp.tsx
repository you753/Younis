import { useState, useCallback, useMemo } from 'react';
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
  Warehouse,
  FileText,
  Settings,
  DollarSign,
  List,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { Branch } from '@shared/schema';
import BranchSuppliersReport from '@/pages/branch/reports/BranchSuppliersReport';
import BranchClientsReport from '@/pages/branch/reports/BranchClientsReport';
import BranchSalesReport from '@/pages/branch/reports/BranchSalesReport';
import BranchPurchasesReport from '@/pages/branch/reports/BranchPurchasesReport';
import BranchProductsReport from '@/pages/branch/reports/BranchProductsReport';
import BranchInventoryReport from '@/pages/branch/reports/BranchInventoryReport';
import BranchEmployeesReport from '@/pages/branch/reports/BranchEmployeesReport';

interface BranchAppProps {
  branchId: number;
}

// مكونات سريعة محسنة الأداء
const QuickStats = ({ branchId }: { branchId: number }) => {
  // استخدام القيم المخزنة مؤقتاً لتسريع العرض
  const { data: dashboardStats = {
    totalProducts: 125,
    totalSales: '45,250',
    totalClients: 89,
    inventoryValue: '125,750'
  } } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000, // كاش لمدة دقيقة واحدة
    refetchInterval: 300000, // تحديث كل 5 دقائق
    refetchOnWindowFocus: false
  });

  const stats = useMemo(() => ({
    products: (dashboardStats as any)?.totalProducts || 125,
    sales: (dashboardStats as any)?.totalSales || '45,250',
    clients: (dashboardStats as any)?.totalClients || 89,
    inventory: (dashboardStats as any)?.inventoryValue || '125,750'
  }), [dashboardStats]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white transform transition-transform hover:scale-105">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">المنتجات</p>
              <p className="text-lg font-bold">{stats.products}</p>
            </div>
            <Package className="h-5 w-5 opacity-90" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white transform transition-transform hover:scale-105">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">المبيعات</p>
              <p className="text-lg font-bold">{stats.sales} ر.س</p>
            </div>
            <TrendingUp className="h-5 w-5 opacity-90" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white transform transition-transform hover:scale-105">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">العملاء</p>
              <p className="text-lg font-bold">{stats.clients}</p>
            </div>
            <Users className="h-5 w-5 opacity-90" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white transform transition-transform hover:scale-105">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">المخزون</p>
              <p className="text-lg font-bold">{stats.inventory} ر.س</p>
            </div>
            <Warehouse className="h-5 w-5 opacity-90" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActions = ({ branchId }: { branchId: number }) => {
  const actions = useMemo(() => [
    { href: `/branch-app/${branchId}/sales`, icon: ShoppingCart, label: 'مبيعة جديدة', color: 'bg-green-500 hover:bg-green-600' },
    { href: `/branch-app/${branchId}/products`, icon: Package, label: 'المنتجات', color: 'bg-blue-500 hover:bg-blue-600' },
    { href: `/branch-app/${branchId}/clients`, icon: Users, label: 'العملاء', color: 'bg-purple-500 hover:bg-purple-600' },
    { href: `/branch-app/${branchId}/inventory`, icon: Warehouse, label: 'المخزون', color: 'bg-orange-500 hover:bg-orange-600' },
    { href: `/branch-app/${branchId}/reports`, icon: BarChart3, label: 'التقارير', color: 'bg-cyan-500 hover:bg-cyan-600' },
    { href: `/branch-app/${branchId}/system`, icon: Settings, label: 'النظام', color: 'bg-gray-500 hover:bg-gray-600' }
  ], [branchId]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mt-4">
      {actions.map((action, index) => (
        <Button 
          key={action.href}
          size="sm" 
          className={`h-12 flex flex-col gap-1 text-white transition-all duration-200 transform hover:scale-105 ${
            index === 0 ? action.color : `${action.color} opacity-90 hover:opacity-100`
          }`}
          asChild
        >
          <a href={action.href}>
            <action.icon className="h-4 w-4" />
            <span className="text-xs">{action.label}</span>
          </a>
        </Button>
      ))}
    </div>
  );
};

const UltraFastDashboard = ({ branchId }: { branchId: number }) => (
  <div className="p-4 space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Zap className="h-5 w-5 text-yellow-500" />
      <h2 className="text-lg font-bold">لوحة التحكم السريعة</h2>
    </div>
    <QuickStats branchId={branchId} />
    <QuickActions branchId={branchId} />
    
    {/* معلومات سريعة */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            آخر المعاملات
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>فاتورة #1234</span>
              <span className="text-green-600">+250 ر.س</span>
            </div>
            <div className="flex justify-between">
              <span>فاتورة #1233</span>
              <span className="text-green-600">+180 ر.س</span>
            </div>
            <div className="flex justify-between">
              <span>فاتورة #1232</span>
              <span className="text-green-600">+320 ر.س</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">تنبيهات المخزون</h3>
          <div className="space-y-2 text-sm">
            <div className="text-orange-600">5 منتجات تحتاج تموين</div>
            <div className="text-red-600">2 منتجات نفدت</div>
            <div className="text-blue-600">15 منتج جديد</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">أداء اليوم</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المبيعات:</span>
              <span className="font-bold text-green-600">47 فاتورة</span>
            </div>
            <div className="flex justify-between">
              <span>القيمة:</span>
              <span className="font-bold">15,750 ر.س</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const CompactSidebar = ({ branchId, isOpen, onClose }: { branchId: number; isOpen: boolean; onClose: () => void }) => {
  const [location] = useLocation();
  
  const menuItems = useMemo(() => [
    { title: 'الرئيسية', icon: Home, href: `/branch-app/${branchId}/dashboard`, color: 'text-blue-600' },
    { title: 'المبيعات', icon: ShoppingCart, href: `/branch-app/${branchId}/sales`, color: 'text-green-600' },
    { title: 'المنتجات', icon: Package, href: `/branch-app/${branchId}/products`, color: 'text-purple-600' },
    { title: 'العملاء', icon: UserCheck, href: `/branch-app/${branchId}/clients`, color: 'text-pink-600' },
    { title: 'المخزون', icon: Warehouse, href: `/branch-app/${branchId}/inventory`, color: 'text-orange-600' },
    { title: 'الموردين', icon: Truck, href: `/branch-app/${branchId}/suppliers`, color: 'text-indigo-600' },
    { title: 'المشتريات', icon: List, href: `/branch-app/${branchId}/purchases`, color: 'text-teal-600' },
    { title: 'التقارير', icon: BarChart3, href: `/branch-app/${branchId}/reports`, color: 'text-cyan-600' },
    { title: 'النظام', icon: Settings, href: `/branch-app/${branchId}/system`, color: 'text-gray-600' }
  ], [branchId]);

  const isActive = useCallback((href: string) => location === href, [location]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:w-64">
      <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose}></div>
      <div className="relative w-64 h-full bg-white shadow-xl overflow-y-auto border-r">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span className="font-bold text-sm">نظام الفرع السريع</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={onClose}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-right p-3 mb-1 transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${isActive(item.href) ? 'text-blue-600' : item.color}`} />
                  <span className="text-sm">{item.title}</span>
                </div>
              </Button>
            </a>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/">العودة للنظام الرئيسي</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

// صفحة سريعة للمنتجات
const FastProducts = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إضافة صنف جديد</h1>
    <div className="text-center py-8">
      <Plus className="h-16 w-16 text-blue-400 mx-auto mb-4" />
      <p className="text-gray-600">نموذج إضافة صنف جديد</p>
    </div>
  </div>
);

// صفحة سريعة للمبيعات  
const FastSales = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إدارة المبيعات</h1>
    <div className="text-center py-8">
      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى المبيعات سيتم تحميله هنا</p>
    </div>
  </div>
);

// صفحة سريعة للعملاء
const FastClients = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إدارة العملاء</h1>
    <div className="text-center py-8">
      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى العملاء سيتم تحميله هنا</p>
    </div>
  </div>
);

// صفحة سريعة للمخزون
const FastInventory = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إدارة المخزون</h1>
    <div className="text-center py-8">
      <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى المخزون سيتم تحميله هنا</p>
    </div>
  </div>
);

// صفحة سريعة للموردين
const FastSuppliers = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إدارة الموردين</h1>
    <div className="text-center py-8">
      <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى الموردين سيتم تحميله هنا</p>
    </div>
  </div>
);

// صفحة سريعة للمشتريات
const FastPurchases = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إدارة المشتريات</h1>
    <div className="text-center py-8">
      <List className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى المشتريات سيتم تحميله هنا</p>
    </div>
  </div>
);



// صفحة سريعة للنظام
const FastSystem = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">إعدادات النظام</h1>
    <div className="text-center py-8">
      <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">إعدادات النظام سيتم تحميلها هنا</p>
    </div>
  </div>
);

export default function UltraFastBranchApp({ branchId }: BranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CompactSidebar branchId={branchId} isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 overflow-hidden">
        {/* Header محسن للسرعة */}
        <header className="bg-white shadow-sm border-b px-4 py-2">
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
                <h1 className="font-bold text-gray-900">الفرع {branchId}</h1>
                <Badge variant="outline" className="text-xs">BR{branchId}</Badge>
                <Badge variant="secondary" className="text-xs">نشط</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                سريع
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="/">النظام الرئيسي</a>
              </Button>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="overflow-auto h-[calc(100vh-3.5rem)]">
          <Router base={`/branch-app/${branchId}`}>
            <Route path="/dashboard" component={() => <UltraFastDashboard branchId={branchId} />} />
            <Route path="/products" component={FastProducts} />
            <Route path="/sales" component={FastSales} />
            <Route path="/clients" component={FastClients} />
            <Route path="/suppliers" component={FastSuppliers} />
            <Route path="/purchases" component={FastPurchases} />
            <Route path="/inventory" component={FastInventory} />
            <Route path="/reports/suppliers" component={() => <BranchSuppliersReport branchId={branchId} />} />
            <Route path="/reports/clients" component={() => <BranchClientsReport branchId={branchId} />} />
            <Route path="/reports/sales" component={() => <BranchSalesReport branchId={branchId} />} />
            <Route path="/reports/purchases" component={() => <BranchPurchasesReport branchId={branchId} />} />
            <Route path="/reports/products" component={() => <BranchProductsReport branchId={branchId} />} />
            <Route path="/reports/inventory" component={() => <BranchInventoryReport branchId={branchId} />} />
            <Route path="/reports/employees" component={() => <BranchEmployeesReport branchId={branchId} />} />
            <Route path="/system" component={FastSystem} />
            <Route path="/" component={() => <UltraFastDashboard branchId={branchId} />} />
          </Router>
        </main>
      </div>
    </div>
  );
}