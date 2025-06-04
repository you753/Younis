import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, ChevronDown, X, Truck, UsersRound,
  DollarSign, Tags, List, Plus, Percent
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
    title: 'العملاء والموردين',
    icon: UsersRound,
    children: [
      { title: 'الموردين', icon: Truck, href: '/suppliers' },
      { title: 'العملاء', icon: UserCheck, href: '/clients' },
      { title: 'عملاء نقديين', icon: DollarSign, href: '/cash-clients' },
      { title: 'مجموعات العملاء', icon: Tags, href: '/client-groups' }
    ]
  },
  {
    title: 'الأصناف',
    icon: Package,
    children: [
      { title: 'قائمة الأصناف', icon: List, href: '/products' },
      { title: 'إضافة صنف', icon: Plus, href: '/products/add' },
      { title: 'باركود الأصناف', icon: ScanBarcode, href: '/products/barcodes' },
      { title: 'تصنيفات الأصناف', icon: Tags, href: '/product-categories' }
    ]
  },
  {
    title: 'المشتريات',
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المشتريات', icon: FileText, href: '/purchases' },
      { title: 'مرتجعات المشتريات', icon: Percent, href: '/purchase-returns' },
      { title: 'أوامر الشراء', icon: Plus, href: '/purchase-orders' },
      { title: 'تقارير المشتريات', icon: BarChart3, href: '/purchase-reports' }
    ]
  },
  {
    title: 'المبيعات',
    icon: ScanBarcode,
    children: [
      { title: 'فواتير المبيعات', icon: FileText, href: '/sales' },
      { title: 'مرتجعات المبيعات', icon: Percent, href: '/sales-returns' },
      { title: 'عروض الأسعار', icon: Tags, href: '/quotes' },
      { title: 'تقارير المبيعات', icon: BarChart3, href: '/sales-reports' }
    ]
  },
  {
    title: 'إدارة المخزون',
    icon: Warehouse,
    children: [
      { title: 'حالة المخزون', icon: List, href: '/inventory' },
      { title: 'جرد المخزون', icon: Plus, href: '/inventory/count' },
      { title: 'حركة المخزون', icon: BarChart3, href: '/inventory/movement' },
      { title: 'تحويل المخزون', icon: Truck, href: '/inventory/transfer' }
    ]
  },
  {
    title: 'الحسابات',
    icon: FileText,
    children: [
      { title: 'دليل الحسابات', icon: List, href: '/accounts' },
      { title: 'القيود اليومية', icon: FileText, href: '/journal-entries' },
      { title: 'الحسابات الدائنة', icon: DollarSign, href: '/accounts-payable' },
      { title: 'الحسابات المدينة', icon: UserCheck, href: '/accounts-receivable' }
    ]
  },
  {
    title: 'التقارير',
    icon: BarChart3,
    children: [
      { title: 'تقارير المبيعات', icon: ScanBarcode, href: '/reports/sales' },
      { title: 'تقارير المشتريات', icon: ShoppingCart, href: '/reports/purchases' },
      { title: 'التقارير المالية', icon: FileText, href: '/reports/financial' },
      { title: 'تقارير المخزون', icon: Warehouse, href: '/reports/inventory' }
    ]
  },
  {
    title: 'الإعدادات',
    icon: Settings,
    children: [
      { title: 'إعدادات النظام', icon: Settings, href: '/settings/system' },
      { title: 'إعدادات الطباعة', icon: FileText, href: '/settings/printing' },
      { title: 'إعدادات الضرائب', icon: Percent, href: '/settings/taxes' },
      { title: 'النسخ الاحتياطي', icon: Package, href: '/settings/backup' }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between text-right p-3 h-auto font-medium text-white hover:bg-white/10",
              level > 0 && "mr-4",
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
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
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
            level > 0 && "mr-8 text-sm",
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
        "fixed top-0 right-0 h-screen w-80 bg-gradient-to-b from-[hsl(var(--accounting-primary))] to-[hsl(var(--accounting-primary-dark))] text-white shadow-xl transition-transform duration-300 ease-in-out z-50",
        "lg:relative lg:translate-x-0",
        sidebarCollapsed ? "translate-x-full" : "translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">بوابة سوق البدو</h1>
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
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
      </aside>
    </>
  );
}
