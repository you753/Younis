import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Search,
  Bell,
  User,
  ChevronLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  Monitor
} from 'lucide-react';

// استيراد الصفحات الاحترافية
import BranchSalesProfessional from './branch/BranchSalesProfessional';
import BranchProducts from './branch/BranchProducts';
import BranchClients from './branch/BranchClients';

import BranchEmployeeManagement from './branch/BranchEmployeeManagement';
import BranchPurchases from './branch/BranchPurchases';

import BranchPOS from './branch/BranchPOS';
import BranchSuppliersReport from './branch/reports/BranchSuppliersReport';
import BranchClientsReport from './branch/reports/BranchClientsReport';
import BranchSalesReport from './branch/reports/BranchSalesReport';
import BranchPurchasesReport from './branch/reports/BranchPurchasesReport';
import BranchProductsReport from './branch/reports/BranchProductsReport';
import BranchInventoryReport from './branch/reports/BranchInventoryReport';
import BranchEmployeesReport from './branch/reports/BranchEmployeesReport';

interface MobileBranchSystemProps {
  branchId: number;
}

export default function MobileBranchSystem({ branchId }: MobileBranchSystemProps) {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);

  // جلب بيانات الفرع
  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
  });

  // جلب الإحصائيات
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // قائمة الأقسام
  const sections = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: Home },
    { id: 'pos', name: 'نقاط البيع', icon: Monitor },
    { id: 'sales', name: 'المبيعات', icon: ShoppingCart },

    { id: 'clients', name: 'العملاء', icon: Users },
    { id: 'employees', name: 'الموظفين', icon: Users },
    { id: 'purchases', name: 'المشتريات', icon: ShoppingBag },
    { id: 'reports', name: 'التقارير', icon: BarChart3 },


  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Header */}
      <header className="bg-black text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Menu className="h-6 w-6 text-amber-400" />
            </button>

            {/* Logo and Title */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">MC</span>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-amber-400">نظام الفروع</h1>
                <p className="text-xs text-amber-300">{branch?.name || 'فرع رقم ' + branchId}</p>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-700 rounded-lg">
              <Bell className="h-6 w-6 text-amber-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-black text-white z-50 transform transition-transform">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">MC</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-400">نظام الفروع</h2>
                    <p className="text-sm text-amber-300">فرع {branch?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-6 w-6 text-amber-400" />
                </button>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-amber-600 text-black'
                        : 'text-amber-400 hover:bg-gray-800'
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <button 
                  onClick={() => setLocation('/branches')}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 bg-amber-600 text-black rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="font-medium">العودة للفروع</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="p-4 pb-20">
        {activeSection === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 mb-6 text-center shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-full shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xl mb-4 inline-block">
                MC
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-3">
                مرحباً بك في {branch?.name || 'الفرع'}
              </h2>
              <p className="text-lg text-amber-700 mb-4">نظام إدارة الفرع المحمول</p>
              <div className="flex justify-center items-center gap-4">
                <Badge className="bg-green-500 text-white px-4 py-2 text-base">
                  متصل ومُفعل
                </Badge>
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">آخر نشاط: الآن</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-600 text-sm font-medium">المنتجات</p>
                    <p className="text-xl font-bold text-blue-900">
                      {stats?.totalProducts || 125}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 text-sm font-medium">المبيعات</p>
                    <p className="text-lg font-bold text-green-900">
                      {(stats?.totalSales || 45250).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'SAR'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-purple-600 text-sm font-medium">العملاء</p>
                    <p className="text-xl font-bold text-purple-900">
                      {stats?.totalClients || 89}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-orange-600 text-sm font-medium">مبيعات اليوم</p>
                    <p className="text-lg font-bold text-orange-900">
                      {(1250).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'SAR'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-6 shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-xl font-bold text-amber-900">الإجراءات السريعة</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => setActiveSection('sales')}
                  >
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    <span className="text-base font-medium">مبيعة جديدة</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center border-2 border-amber-500 text-amber-700 hover:bg-amber-50 shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => setActiveSection('products')}
                  >
                    <Package className="h-8 w-8 mb-2" />
                    <span className="text-base font-medium">إدارة المخزون</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center border-2 border-amber-500 text-amber-700 hover:bg-amber-50 shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => setActiveSection('clients')}
                  >
                    <Users className="h-8 w-8 mb-2" />
                    <span className="text-base font-medium">العملاء</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center border-2 border-amber-500 text-amber-700 hover:bg-amber-50 shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => setActiveSection('reports')}
                  >
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span className="text-base font-medium">التقارير</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-xl font-bold text-blue-900">النشاط الأخير</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {[
                    { 
                      action: 'مبيعة جديدة', 
                      customer: 'شركة النور', 
                      amount: '1,250 ر.س', 
                      time: 'منذ 5 دقائق', 
                      icon: ShoppingCart, 
                      bgColor: 'bg-green-100', 
                      textColor: 'text-green-600' 
                    },
                    { 
                      action: 'إضافة منتج', 
                      customer: 'لابتوب HP', 
                      amount: '+50 قطعة', 
                      time: 'منذ 15 دقيقة', 
                      icon: Package, 
                      bgColor: 'bg-blue-100', 
                      textColor: 'text-blue-600' 
                    },
                    { 
                      action: 'دفع عميل', 
                      customer: 'أحمد محمد', 
                      amount: '3,500 ر.س', 
                      time: 'منذ ساعة', 
                      icon: DollarSign, 
                      bgColor: 'bg-purple-100', 
                      textColor: 'text-purple-600' 
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-r-4 border-amber-500 shadow-sm">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
                        <div className={`p-2 rounded-full ${activity.bgColor}`}>
                          <activity.icon className={`h-5 w-5 ${activity.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-gray-800">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.customer}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-base text-green-600">{activity.amount}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === 'pos' && <BranchPOS />}

        {activeSection === 'sales' && <BranchSalesProfessional />}

        {activeSection === 'products' && <BranchProducts />}

        {activeSection === 'clients' && <BranchClients />}

        {activeSection === 'employees' && <BranchEmployeeManagement />}

        {activeSection === 'purchases' && <BranchPurchases />}

        {activeSection === 'reports-suppliers' && <BranchSuppliersReport branchId={branchId} />}
        {activeSection === 'reports-clients' && <BranchClientsReport branchId={branchId} />}
        {activeSection === 'reports-sales' && <BranchSalesReport branchId={branchId} />}
        {activeSection === 'reports-purchases' && <BranchPurchasesReport branchId={branchId} />}
        {activeSection === 'reports-products' && <BranchProductsReport branchId={branchId} />}
        {activeSection === 'reports-inventory' && <BranchInventoryReport branchId={branchId} />}
        {activeSection === 'reports-employees' && <BranchEmployeesReport branchId={branchId} />}


      </main>
    </div>
  );
}