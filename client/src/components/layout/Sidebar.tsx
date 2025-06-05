import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, ChevronDown, X, Truck, UsersRound,
  DollarSign, Tags, List, Plus, Percent, Minus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  icon: any;
  href?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { title: 'لوحة التحكم', icon: Home, href: '/' },
  { title: 'إدارة المستخدمين', icon: Users, href: '/users' },
  { 
    title: 'الموردين', 
    icon: Truck,
    children: [
      { title: 'قائمة الموردين', icon: Truck, href: '/suppliers' },
      { title: 'إضافة مورد', icon: Plus, href: '/suppliers/add' },
      { title: 'فئات الموردين', icon: Tags, href: '/supplier-categories' },
      { title: 'تقييم الموردين', icon: BarChart3, href: '/supplier-evaluation' }
    ]
  },
  { 
    title: 'العملاء', 
    icon: UserCheck,
    children: [
      { title: 'قائمة العملاء', icon: UserCheck, href: '/clients' },
      { title: 'عملاء نقدي', icon: Users, href: '/cash-clients' },
      { title: 'مجموعات العملاء', icon: Users, href: '/client-groups' },
      { title: 'حسابات العملاء', icon: FileText, href: '/client-accounts' }
    ]
  },
  { 
    title: 'الأصناف', 
    icon: Package,
    children: [
      { title: 'إدارة الأصناف', icon: Package, href: '/products' },
      { title: 'إضافة صنف', icon: Plus, href: '/products/add' },
      { title: 'فئات الأصناف', icon: Tags, href: '/product-categories' },
      { title: 'الباركود', icon: ScanBarcode, href: '/products/barcodes' }
    ]
  },
  { 
    title: 'المشتريات', 
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المشتريات', icon: ShoppingCart, href: '/purchases' },
      { title: 'مرتجعات المشتريات', icon: Minus, href: '/purchase-returns' },
      { title: 'طلبات الشراء', icon: List, href: '/purchase-orders' },
      { title: 'تقارير المشتريات', icon: BarChart3, href: '/purchase-reports' }
    ]
  },
  { 
    title: 'المبيعات', 
    icon: ScanBarcode,
    children: [
      { title: 'فواتير المبيعات', icon: ScanBarcode, href: '/sales' },
      { title: 'مرتجعات المبيعات', icon: Minus, href: '/sales-returns' },
      { title: 'عروض الأسعار', icon: FileText, href: '/quotes' },
      { title: 'حاسبة الضريبة', icon: Percent, href: '/tax-calculator' },
      { title: 'تقارير المبيعات', icon: BarChart3, href: '/sales-reports' }
    ]
  },
  { 
    title: 'المخزون', 
    icon: Warehouse,
    children: [
      { title: 'حالة المخزون', icon: Warehouse, href: '/inventory' },
      { title: 'جرد المخزون', icon: List, href: '/inventory-count' },
      { title: 'حركة المخزون', icon: FileText, href: '/inventory-movement' },
      { title: 'نقل المخزون', icon: Package, href: '/inventory-transfer' },
      { title: 'الباركود', icon: ScanBarcode, href: '/inventory/barcodes' }
    ]
  },
  { 
    title: 'الموظفين', 
    icon: UsersRound,
    children: [
      { title: 'إدارة الموظفين', icon: Users, href: '/employees' },
      { title: 'الحضور والانصراف', icon: FileText, href: '/attendance' },
      { title: 'الخصومات', icon: Minus, href: '/deductions' },
      { title: 'الرواتب', icon: DollarSign, href: '/salaries' },
      { title: 'الإجازات', icon: FileText, href: '/holidays' },
      { title: 'تقييم الأداء', icon: BarChart3, href: '/performance' }
    ]
  },
  { 
    title: 'التقارير', 
    icon: BarChart3,
    children: [
      { title: 'تقارير المبيعات', icon: BarChart3, href: '/reports/sales' },
      { title: 'تقارير المشتريات', icon: ShoppingCart, href: '/reports/purchases' },
      { title: 'تقارير المخزون', icon: Warehouse, href: '/reports/inventory' },
      { title: 'تقارير العملاء', icon: UserCheck, href: '/reports/clients' },
      { title: 'تقارير الموردين', icon: Truck, href: '/reports/suppliers' },
      { title: 'التقارير المالية', icon: DollarSign, href: '/reports/financial' },
      { title: 'تقارير الموظفين', icon: Users, href: '/reports/employees' }
    ]
  },
  { 
    title: 'الإعدادات', 
    icon: Settings,
    children: [
      { title: 'إعدادات عامة', icon: Settings, href: '/settings/general' },
      { title: 'معلومات الشركة', icon: FileText, href: '/settings/company' },
      { title: 'إعدادات المستخدمين', icon: Users, href: '/settings/users' },
      { title: 'إعدادات النظام', icon: Settings, href: '/settings/system' },
      { title: 'النسخ الاحتياطي', icon: FileText, href: '/settings/backup' },
      { title: 'الأمان والصلاحيات', icon: Settings, href: '/settings/security' }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { sidebarCollapsed, toggleSidebar, settings } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['الموردين', 'العملاء', 'الأصناف', 'المشتريات', 'المبيعات', 'المخزون', 'الموظفين', 'التقارير']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location === href || (href !== '/' && location.startsWith(href));
  };

  const hasActiveChild = (children?: NavItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };

  // فتح القوائم التي تحتوي على صفحات نشطة تلقائياً
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children && hasActiveChild(item.children)) {
        setExpandedItems(prev => 
          prev.includes(item.title) ? prev : [...prev, item.title]
        );
      }
    });
  }, [location]);

  const renderNavItem = (item: NavItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const hasActiveChildItem = hasActiveChild(item.children);

    if (hasChildren) {
      return (
        <div key={item.title} className="mb-1">
          {/* عنصر قابل للتوسيع */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between text-right p-3 h-auto font-medium text-white hover:bg-white/10",
              (isExpanded || hasActiveChildItem) && "bg-white/10"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          
          {/* العناصر الفرعية */}
          {isExpanded && item.children && (
            <div className="mt-2 mr-4 space-y-1 bg-white/5 rounded-lg p-2">
              {item.children.map((child, index) => (
                <Link key={`${child.title}-${index}`} href={child.href || '#'}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-right p-2 h-auto text-sm text-white/90 hover:bg-white/10 hover:text-white",
                      isActive(child.href) && "bg-white/20 text-white"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <child.icon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-right p-3 h-auto font-medium text-white hover:bg-white/10",
            level > 0 && "mr-2 text-sm bg-white/5",
            isItemActive && "bg-white/20 text-white"
          )}
          onClick={() => {
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
            <span>{item.title}</span>
          </div>
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 right-0 h-full min-h-screen w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-xl transition-transform duration-300 ease-in-out z-50",
        "lg:relative lg:translate-x-0",
        sidebarCollapsed ? "translate-x-full" : "translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{settings.companyName || 'المحاسب الأعظم'}</h1>
              <p className="text-blue-200 text-sm mt-1">نظام المحاسبة الاحترافي</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto pb-20">
          {navigationItems.map(item => renderNavItem(item))}
          
          {/* مساحة إضافية لضمان امتداد القائمة حتى النهاية */}
          <div className="h-32"></div>
        </nav>
      </aside>
    </>
  );
}
