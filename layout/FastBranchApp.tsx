import { useState, lazy, Suspense, useCallback, memo } from 'react';
import { Route, Router } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  Zap,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  LogOut,
  TreePine,
  CreditCard
} from 'lucide-react';
import type { Branch } from '@shared/schema';

// التحميل البطيء للمكونات
const BranchProducts = lazy(() => import('@/pages/branch/BranchProducts'));
const BranchSales = lazy(() => import('@/pages/branch/BranchSalesProfessional'));
const BranchClients = lazy(() => import('@/pages/branch/BranchClients'));
const BranchSuppliers = lazy(() => import('@/pages/branch/BranchSuppliers'));
const BranchPurchases = lazy(() => import('@/pages/branch/BranchPurchases'));
const BranchInventory = lazy(() => import('@/pages/branch/BranchInventory'));

const BranchAccountingTree = lazy(() => import('@/pages/branch/BranchAccountingTree'));
const BranchPOS = lazy(() => import('@/pages/branch/BranchPOS'));
const BranchSuppliersReport = lazy(() => import('@/pages/branch/reports/BranchSuppliersReport'));
const BranchClientsReport = lazy(() => import('@/pages/branch/reports/BranchClientsReport'));
const BranchSalesReport = lazy(() => import('@/pages/branch/reports/BranchSalesReport'));
const BranchPurchasesReport = lazy(() => import('@/pages/branch/reports/BranchPurchasesReport'));
const BranchProductsReport = lazy(() => import('@/pages/branch/reports/BranchProductsReport'));

const BranchEmployeesReport = lazy(() => import('@/pages/branch/reports/BranchEmployeesReport'));

interface FastBranchAppProps {
  branchId: number;
}

// مكون تحميل سريع
const QuickLoader = memo(() => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2 text-blue-600">
      <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
      <span>جاري التحميل...</span>
    </div>
  </div>
));

// إحصائيات سريعة
const QuickStats = memo(({ branchId }: { branchId: number }) => {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 30000, // 30 ثانية
    refetchInterval: 60000, // دقيقة واحدة
  });

  const statsData = [
    { label: 'المبيعات اليوم', value: stats?.totalSales || '0', color: 'text-green-600', icon: TrendingUp },
    { label: 'العملاء', value: stats?.totalClients || '0', color: 'text-blue-600', icon: Users },
    { label: 'المنتجات', value: '0', color: 'text-purple-600', icon: Package },
    { label: 'المخزون', value: stats?.inventoryValue || '0', color: 'text-orange-600', icon: DollarSign }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {typeof stat.value === 'string' && stat.value.includes('.') 
                    ? `${parseFloat(stat.value).toFixed(0)} ر.س`
                    : stat.value
                  }
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// إجراءات سريعة
const QuickActions = memo(({ branchId }: { branchId: number }) => {
  const actions = [
    { label: 'بيع سريع', href: `/branch-app/${branchId}/sales`, icon: ShoppingCart, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'عميل جديد', href: `/branch-app/${branchId}/clients`, icon: Users, color: 'bg-purple-600 hover:bg-purple-700' },

    { label: 'شراء جديد', href: `/branch-app/${branchId}/purchases`, icon: Package, color: 'bg-blue-600 hover:bg-blue-700' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <Button key={index} asChild variant="outline" className="h-auto p-3">
          <a href={action.href} className={`${action.color} text-white border-0 flex flex-col items-center gap-2`}>
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </a>
        </Button>
      ))}
    </div>
  );
});

// لوحة تحكم سريعة
const FastDashboard = memo(({ branchId }: { branchId: number }) => {
  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`],
    staleTime: 300000, // 5 دقائق
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-bold">لوحة التحكم السريعة</h2>
        <Badge variant="secondary" className="text-xs">
          {branch?.name || `فرع ${branchId}`}
        </Badge>
      </div>
      
      <QuickStats branchId={branchId} />
      <QuickActions branchId={branchId} />
      
      {/* معلومات سريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              نشاط اليوم
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المبيعات</span>
                <span className="text-green-600 font-medium">12 فاتورة</span>
              </div>
              <div className="flex justify-between">
                <span>العملاء الجدد</span>
                <span className="text-blue-600 font-medium">3 عملاء</span>
              </div>
              <div className="flex justify-between">
                <span>المنتجات المضافة</span>
                <span className="text-purple-600 font-medium">5 منتجات</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              أهم المنتجات
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>لابتوب Dell</span>
                <span className="text-green-600 font-medium">15 مبيعة</span>
              </div>
              <div className="flex justify-between">
                <span>ماوس لاسلكي</span>
                <span className="text-blue-600 font-medium">12 مبيعة</span>
              </div>
              <div className="flex justify-between">
                <span>سماعات بلوتوث</span>
                <span className="text-purple-600 font-medium">8 مبيعات</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default function FastBranchApp({ branchId }: FastBranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // جلب بيانات الفرع مع تخزين مؤقت طويل
  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`],
    staleTime: 300000, // 5 دقائق
    retry: 1,
  });

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const menuItems = [
    { title: 'الرئيسية', icon: Home, path: `/branch-app/${branchId}/dashboard` },
    { title: 'نقطة البيع', icon: CreditCard, path: `/branch-app/${branchId}/pos` },
    { title: 'المبيعات', icon: ShoppingCart, path: `/branch-app/${branchId}/sales` },
    { title: 'العملاء', icon: Users, path: `/branch-app/${branchId}/clients` },
    { title: 'الموردين', icon: Users, path: `/branch-app/${branchId}/suppliers` },
    { title: 'المشتريات', icon: ShoppingCart, path: `/branch-app/${branchId}/purchases` },
    { title: 'المخزون', icon: Package, path: `/branch-app/${branchId}/inventory` },
    { title: 'شجرة المحاسبة', icon: TreePine, path: `/branch-app/${branchId}/accounting-tree` },

  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* الشريط الجانبي */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-bold text-gray-900">{branch?.name || `فرع ${branchId}`}</h2>
              <p className="text-xs text-gray-600">إدارة سريعة</p>
            </div>
          </div>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
            </a>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href="/">
              <LogOut className="h-4 w-4 ml-2" />
              النظام الرئيسي
            </a>
          </Button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col">
        {/* الرأس */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h1 className="font-bold text-gray-900">{branch?.name || `الفرع ${branchId}`}</h1>
                <Badge variant="outline" className="text-xs">{branch?.code || `BR${branchId}`}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                سريع
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="/">العودة للنظام الرئيسي</a>
              </Button>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<QuickLoader />}>
            <Router base={`/branch-app/${branchId}`}>
              <Route path="/dashboard" component={() => <FastDashboard branchId={branchId} />} />
              <Route path="/" component={() => <FastDashboard branchId={branchId} />} />
              <Route path="/pos" component={() => <SimpleBranchPOS branchId={branchId} />} />
              <Route path="/products" component={() => <BranchProducts branchId={branchId} />} />
              <Route path="/sales" component={() => <BranchSales branchId={branchId} />} />
              <Route path="/clients" component={() => <BranchClients branchId={branchId} />} />
              <Route path="/suppliers" component={() => <div className="p-4">قائمة الموردين - قيد التطوير</div>} />
              <Route path="/purchases" component={() => <div className="p-4">المشتريات - قيد التطوير</div>} />
              <Route path="/inventory" component={() => <div className="p-4">المخزون - قيد التطوير</div>} />
              <Route path="/reports/suppliers" component={() => <BranchSuppliersReport branchId={branchId} />} />
              <Route path="/reports/clients" component={() => <BranchClientsReport branchId={branchId} />} />
              <Route path="/reports/sales" component={() => <BranchSalesReport branchId={branchId} />} />
              <Route path="/reports/purchases" component={() => <BranchPurchasesReport branchId={branchId} />} />
              <Route path="/reports/products" component={() => <BranchProductsReport branchId={branchId} />} />

              <Route path="/reports/employees" component={() => <BranchEmployeesReport branchId={branchId} />} />
              <Route path="/accounting-tree" component={() => <BranchAccountingTree branchId={branchId} />} />

            </Router>
          </Suspense>
        </main>
      </div>
    </div>
  );
}