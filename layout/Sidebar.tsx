import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, ChevronDown, X, Truck, UsersRound,
  DollarSign, Tags, List, Plus, Percent, Minus, Building,
  Activity, CreditCard, Share2, Monitor, Calculator, User, Menu, Receipt
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

interface NavItem {
  title: string;
  icon: any;
  href?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { title: 'لوحة التحكم', icon: Home, href: '/' },
  { 
    title: 'الموردين', 
    icon: Truck,
    children: [
      { title: 'قائمة الموردين', icon: Truck, href: '/suppliers' },
      { title: 'كشف حساب احترافي', icon: FileText, href: '/supplier-accounts-statement' },
      { title: 'سندات الصرف', icon: FileText, href: '/supplier-payment-vouchers' }
    ]
  },
  { 
    title: 'العملاء', 
    icon: UserCheck,
    children: [
      { title: 'قائمة العملاء', icon: UserCheck, href: '/clients' },
      { title: 'حسابات العملاء الموحدة', icon: CreditCard, href: '/client-accounts' },
      { title: 'سندات القبض', icon: FileText, href: '/client-receipt-vouchers' }
    ]
  },
  { 
    title: 'الأصناف', 
    icon: Package,
    children: [
      { title: 'إدارة الأصناف', icon: Package, href: '/products' },
      { title: 'فئات الأصناف', icon: Tags, href: '/product-categories' },
      { title: 'الباركود', icon: ScanBarcode, href: '/products/barcodes' }
    ]
  },
  { 
    title: 'المشتريات', 
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المشتريات', icon: ShoppingCart, href: '/purchases' },
      { title: 'سندات إدخال البضاعة', icon: Package, href: '/goods-receipt' },
      { title: 'مرتجعات المشتريات', icon: Minus, href: '/purchase-returns' },
      { title: 'طلبات الشراء', icon: List, href: '/purchase-orders' }
    ]
  },
  { 
    title: 'المبيعات', 
    icon: ScanBarcode,
    children: [
      { title: 'فواتير المبيعات', icon: ScanBarcode, href: '/sales' },
      { title: 'سندات إخراج البضاعة', icon: Package, href: '/goods-issue' },
      { title: 'مرتجعات المبيعات', icon: Minus, href: '/sales-returns' },
      { title: 'عروض الأسعار', icon: FileText, href: '/quotes' },
      { title: 'سندات قبض المبيعات', icon: FileText, href: '/sales-receipt-vouchers' }
    ]
  },
  { 
    title: 'المخزون', 
    icon: Warehouse,
    children: [
      { title: 'حالة المخزون', icon: Warehouse, href: '/inventory' },
      { title: 'الأرصدة الافتتاحية', icon: FileText, href: '/inventory-opening-balances' },
      { title: 'حركة المخزون', icon: FileText, href: '/inventory-movement' },
      { title: 'إرسال واستقبال المخزون', icon: Truck, href: '/inventory-transfers' }
    ]
  },
  { 
    title: 'إدارة الفروع', 
    icon: Building,
    children: [
      { title: 'قائمة الفروع', icon: Building, href: '/branches' },
      { title: 'تقارير الفروع', icon: BarChart3, href: '/branch-reports' },
      { title: 'صلاحيات الفروع', icon: Settings, href: '/branch-permissions' }
    ]
  },
  { 
    title: 'الموظفين', 
    icon: UsersRound,
    children: [
      { title: 'إدارة الموظفين', icon: Users, href: '/employees' },
      { title: 'الديون', icon: CreditCard, href: '/employee-debts' },
      { title: 'الخصومات والديون', icon: Minus, href: '/deductions' },
      { title: 'كشف حساب الخصومات', icon: FileText, href: '/employee-statement' },
      { title: 'الرواتب', icon: DollarSign, href: '/salaries' },
      { title: 'الإجازات', icon: FileText, href: '/simple-holidays' }
    ]
  },
  { 
    title: 'المصروفات اليومية', 
    icon: Receipt,
    children: [
      { title: 'إدارة المصروفات', icon: Receipt, href: '/daily-expenses' }
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
      { title: 'التقارير المالية', icon: DollarSign, href: '/reports/financial' }
    ]
  },
  { title: 'الإعدادات', icon: Settings, href: '/settings' }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { sidebarCollapsed, toggleSidebar, settings } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['الموردين', 'العملاء', 'الأصناف', 'المشتريات', 'المبيعات', 'المخزون', 'إدارة الفروع', 'الموظفين', 'المصروفات اليومية', 'التقارير']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (title: string) => {
    if (isCollapsed) return; // لا نوسع القوائم في الوضع المطوي
    setExpandedItems(prev => {
      if (prev.includes(title)) {
        // إغلاق القائمة إذا كانت مفتوحة
        return prev.filter(item => item !== title);
      } else {
        // إغلاق جميع القوائم الأخرى وفتح القائمة الجديدة فقط
        return [title];
      }
    });
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedItems([]); // إغلاق جميع القوائم المفتوحة عند الطي
    }
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
              "w-full text-right h-auto font-medium text-amber-400 hover:bg-amber-600/20",
              isCollapsed ? "justify-center p-2" : "justify-between p-3",
              (isExpanded || hasActiveChildItem) && "bg-amber-600/20"
            )}
            onClick={() => toggleExpanded(item.title)}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3"
            )}>
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            )}
          </Button>
          
          {/* العناصر الفرعية */}
          {isExpanded && item.children && !isCollapsed && (
            <div className="mt-2 mr-4 space-y-1 bg-amber-600/10 rounded-lg p-2">
              {item.children.map((child, index) => (
                <Link key={`${child.title}-${index}`} href={child.href || '#'}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-right p-2 h-auto text-sm text-amber-300 hover:bg-amber-600/20 hover:text-amber-400",
                      isActive(child.href) && "bg-amber-600/30 text-amber-400"
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
            "w-full text-right h-auto font-medium text-white hover:bg-white/10",
            isCollapsed ? "justify-center p-2" : "justify-start p-3",
            level > 0 && !isCollapsed && "mr-2 text-sm bg-white/5",
            isItemActive && "bg-white/20 text-white"
          )}
          onClick={() => {
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
          title={isCollapsed ? item.title : undefined}
        >
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}>
            <item.icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
            {!isCollapsed && <span>{item.title}</span>}
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
      <aside 
        className={cn(
          "fixed top-0 right-0 h-full min-h-screen bg-black shadow-xl transition-all duration-300 ease-in-out z-50",
          "lg:relative lg:translate-x-0",
          isCollapsed ? "w-16" : "w-72 sm:w-80",
          sidebarCollapsed ? "translate-x-full" : "translate-x-0"
        )}
        data-onboarding="sidebar"
      >
        {/* Header */}
        <div className={cn(
          "border-b border-amber-600/50 transition-all duration-300",
          isCollapsed ? "p-3" : "p-6"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img 
                  src={logoAlmuhasebAlaathim} 
                  alt="المحاسب الأعظم" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-amber-400">المحاسب الأعظم</h1>
                  <p className="text-amber-300 text-sm mt-1">نظام إدارة الأعمال المتكامل</p>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <img 
                src={logoAlmuhasebAlaathim} 
                alt="المحاسب الأعظم" 
                className="w-8 h-8 object-contain"
              />
            )}
            
            {!isCollapsed && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 font-bold text-sm">
                MC
              </div>
            )}
            
            <div className={cn(
              "flex items-center gap-2",
              isCollapsed && "hidden"
            )}>
              <div className="scale-90">
                <ThemeToggle />
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
        </div>

        {/* زر الطي والتوسيع */}
        <div className={cn(
          "hidden lg:flex border-b border-white/20 transition-all duration-300",
          isCollapsed ? "justify-center p-2" : "justify-end p-3"
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="text-amber-400 hover:bg-amber-600/20 transition-colors"
            title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            <Menu className={cn(
              "h-4 w-4 transition-transform duration-200 text-amber-400",
              isCollapsed && "rotate-90"
            )} />
          </Button>
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
