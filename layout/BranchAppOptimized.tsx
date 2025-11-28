import { useState, useCallback, useMemo, memo } from 'react';
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
  LogOut,
  UserCheck,
  Truck,
  ScanBarcode,
  Warehouse,
  FileText,
  Settings,
  ChevronDown,
  UsersRound,
  DollarSign,
  Tags,
  List,
  Plus,
  Percent,
  Minus,
  AlertTriangle
} from 'lucide-react';
import type { Branch } from '@shared/schema';
import BranchSuppliers from '@/pages/branch/BranchSuppliers';
import BranchSupplierAdd from '@/pages/branch/BranchSupplierAdd';
import BranchSupplierAccounts from '@/pages/branch/BranchSupplierAccounts';
import BranchSupplierEvaluation from '@/pages/branch/BranchSupplierEvaluation';
import BranchSupplierPaymentVouchers from '@/pages/branch/BranchSupplierPaymentVouchers';
import BranchPurchases from '@/pages/branch/BranchPurchases';
import BranchInventory from '@/pages/branch/BranchInventory';
import BranchEmployees from '@/pages/branch/BranchEmployees';


import BranchUsers from '@/pages/branch/BranchUsers';
import BranchAccounts from '@/pages/branch/BranchAccounts';
import BranchProductsManagement from '@/pages/branch/BranchProductsManagement';
import BranchSystem from '@/pages/branch/BranchSystem';

interface BranchAppProps {
  branchId: number;
}

// مكونات محسنة للأداء
const BranchDashboardContent = memo(({ branch, stats }: { branch?: Branch; stats: any }) => {
  const dashboardCards = useMemo(() => [
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "إجمالي المبيعات",
      value: `${stats.totalSales || '0.00'} ر.س`,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "عدد العملاء",
      value: stats.totalClients || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "قيمة المخزون",
      value: `${stats.inventoryValue || '0.00'} ر.س`,
      icon: Warehouse,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ], [stats]);

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardCards.map((card) => (
          <Card key={card.title} className={`${card.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{card.title}</p>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">{card.value}</p>
                </div>
                <card.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* تقارير مختصرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* تقرير المبيعات اليومية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              تقرير المبيعات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">مبيعات اليوم</span>
                <span className="font-bold text-green-600">{stats.todaySales || '0.00'} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">عدد الفواتير</span>
                <span className="font-bold">{stats.todayInvoices || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">متوسط الفاتورة</span>
                <span className="font-bold">{stats.averageInvoice || '0.00'} ر.س</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((stats.todaySales || 0) / (stats.dailyTarget || 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">الهدف اليومي: {stats.dailyTarget || '1000.00'} ر.س</p>
            </div>
          </CardContent>
        </Card>

        {/* تقرير المخزون */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-orange-600" />
              حالة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">إجمالي القيمة</span>
                <span className="font-bold text-orange-600">{stats.inventoryValue || '0.00'} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">أصناف متاحة</span>
                <span className="font-bold text-green-600">{stats.availableProducts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">أصناف منخفضة</span>
                <span className="font-bold text-red-600">{stats.lowStockProducts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">أصناف نفدت</span>
                <span className="font-bold text-gray-600">{stats.outOfStockProducts || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تقارير إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* أفضل المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              أفضل المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "ثوب مطرز", sales: 25, revenue: "1250.00" },
                { name: "عباءة فاخرة", sales: 18, revenue: "900.00" },
                { name: "قميص قطني", sales: 12, revenue: "480.00" }
              ].map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} قطعة</p>
                  </div>
                  <span className="font-bold text-blue-600">{product.revenue} ر.س</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* أحدث المعاملات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              أحدث المعاملات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "مبيعة", amount: "150.00", time: "منذ 5 دقائق", status: "مكتملة" },
                { type: "مبيعة", amount: "75.50", time: "منذ 15 دقيقة", status: "مكتملة" },
                { type: "مرتجع", amount: "25.00", time: "منذ 30 دقيقة", status: "معالج" }
              ].map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-sm">{transaction.type}</p>
                    <p className="text-xs text-gray-500">{transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{transaction.amount} ر.س</p>
                    <p className="text-xs text-green-600">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تنبيهات المخزون */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "ثوب أبيض", stock: 5, status: "منخفض", color: "text-orange-600" },
                { name: "عباءة سوداء", stock: 0, status: "نفد", color: "text-red-600" },
                { name: "قميص أزرق", stock: 2, status: "منخفض", color: "text-orange-600" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">الكمية: {item.stock}</p>
                  </div>
                  <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اختصارات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">مبيعة جديدة</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">إدارة المشتريات</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">العملاء</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <Warehouse className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium">المخزون</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});



const BranchSalesContent = memo(({ branchId }: { branchId: number }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">المبيعات - الفرع {branchId}</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى المبيعات</p>
    </div>
  </div>
));

const BranchClientsContent = memo(({ branchId }: { branchId: number }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">العملاء - الفرع {branchId}</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">محتوى العملاء</p>
    </div>
  </div>
));

const OptimizedSidebar = memo(({ branchId, isOpen, onToggle }: { branchId: number; isOpen: boolean; onToggle: () => void }) => {
  const [location, setLocation] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['الموردين', 'العملاء', 'المشتريات', 'المبيعات', 'المخزون']);

  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems(prev => {
      if (prev.includes(title)) {
        return prev.filter(item => item !== title);
      } else {
        return [title];
      }
    });
  }, []);

  const navigationItems = useMemo(() => [
    { title: 'لوحة التحكم', icon: Home, href: `/branch-app/${branchId}/dashboard` },
    { title: 'إدارة المستخدمين', icon: Users, href: `/branch-app/${branchId}/users` },
    { 
      title: 'الموردين', 
      icon: Truck,
      children: [
        { title: 'قائمة الموردين', icon: Truck, href: `/branch-app/${branchId}/suppliers` },
        { title: 'إضافة مورد', icon: Plus, href: `/branch-app/${branchId}/suppliers/add` },
        { title: 'كشف حساب الموردين', icon: FileText, href: `/branch-app/${branchId}/supplier-accounts` },
        { title: 'تقييم الموردين', icon: BarChart3, href: `/branch-app/${branchId}/supplier-evaluation` },
        { title: 'سندات الصرف', icon: FileText, href: `/branch-app/${branchId}/supplier-payment-vouchers` }
      ]
    },
    { 
      title: 'العملاء', 
      icon: UserCheck,
      children: [
        { title: 'قائمة العملاء', icon: UserCheck, href: `/branch-app/${branchId}/clients` },
        { title: 'عملاء نقدي', icon: Users, href: `/branch-app/${branchId}/cash-clients` },
        { title: 'مجموعات العملاء', icon: Users, href: `/branch-app/${branchId}/client-groups` },
        { title: 'حسابات العملاء', icon: FileText, href: `/branch-app/${branchId}/client-accounts` },
        { title: 'سندات القبض', icon: FileText, href: `/branch-app/${branchId}/client-receipt-vouchers` }
      ]
    },

    { 
      title: 'المشتريات', 
      icon: ShoppingCart,
      children: [
        { title: 'فواتير المشتريات', icon: ShoppingCart, href: `/branch-app/${branchId}/purchases` },
        { title: 'مرتجعات المشتريات', icon: Minus, href: `/branch-app/${branchId}/purchase-returns` },
        { title: 'طلبات الشراء', icon: List, href: `/branch-app/${branchId}/purchase-orders` },
        { title: 'تقارير المشتريات', icon: BarChart3, href: `/branch-app/${branchId}/purchase-reports` }
      ]
    },
    { 
      title: 'المبيعات', 
      icon: ScanBarcode,
      children: [
        { title: 'فواتير المبيعات', icon: ScanBarcode, href: `/branch-app/${branchId}/sales` },
        { title: 'مرتجعات المبيعات', icon: Minus, href: `/branch-app/${branchId}/sales-returns` },
        { title: 'حاسبة الضريبة', icon: Percent, href: `/branch-app/${branchId}/tax-calculator` },

      ]
    },
    { 
      title: 'المخزون', 
      icon: Warehouse,
      children: [
        { title: 'حالة المخزون', icon: Warehouse, href: `/branch-app/${branchId}/inventory-status` },
        { title: 'الأرصدة الافتتاحية', icon: FileText, href: `/branch-app/${branchId}/inventory-opening-balances` },
        { title: 'حركة المخزون', icon: List, href: `/branch-app/${branchId}/inventory-movements` }
      ]
    },
    { 
      title: 'الموظفين', 
      icon: UsersRound,
      children: [
        { title: 'إدارة الموظفين', icon: Users, href: `/branch-app/${branchId}/employees` },
        { title: 'الحضور والانصراف', icon: FileText, href: `/branch-app/${branchId}/attendance` },
        { title: 'الخصومات', icon: Minus, href: `/branch-app/${branchId}/deductions` },
        { title: 'الرواتب', icon: DollarSign, href: `/branch-app/${branchId}/salaries` },
        { title: 'الإجازات', icon: FileText, href: `/branch-app/${branchId}/holidays` },
        { title: 'تقييم الأداء', icon: BarChart3, href: `/branch-app/${branchId}/performance` }
      ]
    },

    { title: 'نظام إدارة منفصل', icon: Settings, href: `/branch-app/${branchId}/system` }
  ], [branchId]);

  const isActive = useCallback((href: string) => location === href, [location]);

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6" />
            <div>
              <h2 className="font-bold">نظام الفرع {branchId}</h2>
              <p className="text-xs text-blue-200">واجهة إدارة منفصلة</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-white hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navigationItems.map((item) => (
          <div key={item.title} className="mb-2">
            {item.children ? (
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-right p-3 text-white hover:bg-white/10 mb-1"
                  onClick={() => toggleExpanded(item.title)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedItems.includes(item.title) ? 'rotate-180' : ''}`} />
                </Button>
                
                {expandedItems.includes(item.title) && item.children && (
                  <div className="mr-4 space-y-1 bg-white/5 rounded-lg p-2">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        className={`w-full justify-start text-right p-2 text-sm text-white/90 hover:bg-white/10 hover:text-white ${
                          isActive(child.href) ? 'bg-white/20 text-white' : ''
                        }`}
                        onClick={() => {
                          setLocation(child.href);
                          if (window.innerWidth < 1024) onToggle();
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <child.icon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                className={`w-full justify-start text-right p-3 text-white hover:bg-white/10 ${
                  isActive(item.href) ? 'bg-white/20' : ''
                }`}
                onClick={() => {
                  setLocation(item.href);
                  if (window.innerWidth < 1024) onToggle();
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
              </Button>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <Button 
          variant="ghost" 
          className="w-full text-white hover:bg-white/10"
          onClick={() => window.location.href = '/'}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للنظام الرئيسي
        </Button>
      </div>
    </div>
  );
});

export default function BranchAppOptimized({ branchId }: BranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    staleTime: 300000,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000,
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <OptimizedSidebar branchId={branchId} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="w-full">
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h1 className="font-bold text-gray-900">{branch?.name || `الفرع ${branchId}`}</h1>
                <Badge variant="secondary">{branch?.code || `BR${branchId}`}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">نشط</Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="/">النظام الرئيسي</a>
              </Button>
            </div>
          </div>
        </header>

        <main className="overflow-auto">
          <Router base={`/branch-app/${branchId}`}>
            <Route path="/dashboard" component={() => <BranchDashboardContent branch={branch} stats={stats} />} />

            <Route path="/sales" component={() => <BranchSalesContent branchId={branchId} />} />
            <Route path="/clients" component={() => <BranchClientsContent branchId={branchId} />} />
            <Route path="/suppliers" component={() => <BranchSuppliers branchId={branchId} />} />
            <Route path="/suppliers/add" component={() => <BranchSupplierAdd branchId={branchId} />} />
            <Route path="/supplier-accounts" component={() => <BranchSupplierAccounts branchId={branchId} />} />
            <Route path="/supplier-evaluation" component={() => <BranchSupplierEvaluation branchId={branchId} />} />
            <Route path="/supplier-payment-vouchers" component={() => <BranchSupplierPaymentVouchers branchId={branchId} />} />
            <Route path="/purchases" component={() => <BranchPurchases branchId={branchId} />} />
            <Route path="/inventory" component={() => <BranchInventory branchId={branchId} />} />
            <Route path="/employees" component={() => <BranchEmployees branchId={branchId} />} />

            <Route path="/users" component={() => <BranchUsers branchId={branchId} />} />
            <Route path="/system" component={() => <BranchSystem branchId={branchId} />} />
            <Route path="/" component={() => <BranchDashboardContent branch={branch} stats={stats} />} />
          </Router>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar}></div>
      )}
    </div>
  );
}