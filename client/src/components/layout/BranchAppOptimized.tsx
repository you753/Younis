import { useState, useCallback } from 'react';
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
import BranchPurchases from '@/pages/branch/BranchPurchases';
import BranchInventory from '@/pages/branch/BranchInventory';
import BranchEmployees from '@/pages/branch/BranchEmployees';
import BranchSettings from '@/pages/branch/BranchSettings';
import BranchReports from '@/pages/branch/BranchReports';
import BranchUsers from '@/pages/branch/BranchUsers';
import BranchAccounts from '@/pages/branch/BranchAccounts';
import BranchProductCategories from '@/pages/branch/BranchProductCategories';
import BranchSystem from '@/pages/branch/BranchSystem';

interface BranchAppProps {
  branchId: number;
}

// نوافذ المحتوى منفصلة لتحسين الأداء
function BranchDashboardContent({ branch, stats }: { branch?: Branch; stats: any }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{stats.totalSales} ر.س</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد العملاء</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيمة المخزون</p>
                <p className="text-2xl font-bold">{stats.inventoryValue} ر.س</p>
              </div>
              <Warehouse className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مبيعات اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.todaySales} ر.س</div>
            <p className="text-sm text-gray-600 mt-2">زيادة {stats.monthlyGrowth}% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>معلومات الفرع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">اسم الفرع:</span>
                <span className="font-medium">{branch?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">كود الفرع:</span>
                <span className="font-medium">{branch?.code}</span>
              </div>
              {branch?.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium">{branch.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BranchProductsContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة المنتجات - الفرع {branchId}</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">محتوى إدارة المنتجات</p>
      </div>
    </div>
  );
}

function BranchSalesContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">المبيعات - الفرع {branchId}</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">محتوى المبيعات</p>
      </div>
    </div>
  );
}

function BranchClientsContent({ branchId }: { branchId: number }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">العملاء - الفرع {branchId}</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">محتوى العملاء</p>
      </div>
    </div>
  );
}

export default function BranchApp({ branchId }: BranchAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['الموردين', 'العملاء', 'الأصناف', 'المشتريات', 'المبيعات']);

  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const stats = {
    totalProducts: 15,
    totalSales: '25,480.00',
    totalClients: 8,
    inventoryValue: '45,200.00',
    todaySales: '3,250.00',
    monthlyGrowth: 12
  };

  const exitBranch = useCallback(() => {
    setLocation('/branch-management');
  }, [setLocation]);

  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems(prev => {
      if (prev.includes(title)) {
        return prev.filter(item => item !== title);
      } else {
        return [title];
      }
    });
  }, []);

  const navigationItems = [
    { title: 'لوحة التحكم', icon: Home, href: `/branch-app/${branchId}/dashboard` },
    { title: 'نظام إدارة منفصل', icon: Settings, href: `/branch-app/${branchId}/system` },
    { title: 'إدارة المستخدمين', icon: Users, href: `/branch-app/${branchId}/users` },
    { 
      title: 'الموردين', 
      icon: Truck,
      children: [
        { title: 'قائمة الموردين', icon: Truck, href: `/branch-app/${branchId}/suppliers` },
        { title: 'إضافة مورد', icon: Plus, href: `/branch-app/${branchId}/suppliers/add` },
      ]
    },
    { 
      title: 'العملاء', 
      icon: UserCheck,
      children: [
        { title: 'قائمة العملاء', icon: UserCheck, href: `/branch-app/${branchId}/clients` },
        { title: 'عملاء نقدي', icon: Users, href: `/branch-app/${branchId}/cash-clients` },
      ]
    },
    { 
      title: 'الأصناف', 
      icon: Package,
      children: [
        { title: 'إدارة الأصناف', icon: Package, href: `/branch-app/${branchId}/products` },
        { title: 'فئات الأصناف', icon: Tags, href: `/branch-app/${branchId}/product-categories` },
      ]
    },
    { 
      title: 'المشتريات', 
      icon: ShoppingCart,
      children: [
        { title: 'فواتير المشتريات', icon: ShoppingCart, href: `/branch-app/${branchId}/purchases` },
        { title: 'مرتجعات المشتريات', icon: Minus, href: `/branch-app/${branchId}/purchase-returns` },
      ]
    },
    { 
      title: 'المبيعات', 
      icon: ScanBarcode,
      children: [
        { title: 'فواتير المبيعات', icon: ScanBarcode, href: `/branch-app/${branchId}/sales` },
        { title: 'مرتجعات المبيعات', icon: Minus, href: `/branch-app/${branchId}/sales-returns` },
      ]
    },
    { 
      title: 'المخزون', 
      icon: Warehouse,
      children: [
        { title: 'حالة المخزون', icon: Warehouse, href: `/branch-app/${branchId}/inventory` },
        { title: 'جرد المخزون', icon: List, href: `/branch-app/${branchId}/inventory-count` },
      ]
    },
    { 
      title: 'الموظفين', 
      icon: UsersRound,
      children: [
        { title: 'إدارة الموظفين', icon: Users, href: `/branch-app/${branchId}/employees` },
        { title: 'الرواتب', icon: DollarSign, href: `/branch-app/${branchId}/salaries` },
      ]
    },
    { 
      title: 'التقارير', 
      icon: BarChart3,
      children: [
        { title: 'التقارير اليومية', icon: FileText, href: `/branch-app/${branchId}/reports` },
        { title: 'تقارير المبيعات', icon: BarChart3, href: `/branch-app/${branchId}/reports/sales` },
      ]
    },
    { title: 'الحسابات', icon: DollarSign, href: `/branch-app/${branchId}/accounts` }
  ];

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
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.includes(item.title);
              const isActive = location === item.href;

              if (item.children) {
                return (
                  <div key={item.title} className="mb-1">
                    <Button
                      variant="ghost"
                      className={`w-full ${sidebarOpen ? 'justify-between' : 'justify-center'} p-3 text-gray-700 hover:bg-gray-100`}
                      onClick={() => sidebarOpen && toggleExpanded(item.title)}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4" />
                        {sidebarOpen && <span className="mr-3">{item.title}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                    
                    {sidebarOpen && isExpanded && (
                      <div className="mr-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = location === child.href;
                          
                          return (
                            <Button
                              key={child.title}
                              variant="ghost"
                              className={`w-full justify-start p-2 text-sm ${isChildActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'} hover:bg-gray-100`}
                              onClick={() => window.location.href = child.href}
                            >
                              <ChildIcon className="h-3 w-3" />
                              <span className="mr-2">{child.title}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} p-3 mb-1 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} hover:bg-gray-100`}
                    onClick={() => window.location.href = item.href!}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && <span className="mr-3">{item.title}</span>}
                  </Button>
                );
              }
            })}
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
            <Route path={`/branch-app/${branchId}/dashboard`}>
              <BranchDashboardContent branch={branch} stats={stats} />
            </Route>
            <Route path={`/branch-app/${branchId}`}>
              <BranchDashboardContent branch={branch} stats={stats} />
            </Route>
            <Route path={`/branch-app/${branchId}/products`}>
              <BranchProductsContent branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/sales`}>
              <BranchSalesContent branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/clients`}>
              <BranchClientsContent branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/suppliers`}>
              <BranchSuppliers branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/purchases`}>
              <BranchPurchases branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/inventory`}>
              <BranchInventory branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/reports`}>
              <BranchReports branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/employees`}>
              <BranchEmployees branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/settings`}>
              <BranchSettings branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/users`}>
              <BranchUsers branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/accounts`}>
              <BranchAccounts branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/product-categories`}>
              <BranchProductCategories branchId={branchId} />
            </Route>
            <Route path={`/branch-app/${branchId}/system`}>
              <BranchSystem branchId={branchId} />
            </Route>
          </Router>
        </main>
      </div>
    </div>
  );
}