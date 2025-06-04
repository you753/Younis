import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, X, Truck, DollarSign, Minus, ChevronDown,
  Tags, List, Plus, Percent, Calculator
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
    title: 'الموردين والعملاء',
    icon: Users,
    children: [
      { title: 'قائمة الموردين', icon: Truck, href: '/suppliers' },
      { title: 'قائمة العملاء', icon: UserCheck, href: '/clients' }
    ]
  },
  {
    title: 'الأصناف',
    icon: Package,
    children: [
      { title: 'قائمة الأصناف', icon: List, href: '/products' },
      { title: 'باركود الأصناف', icon: ScanBarcode, href: '/product-barcodes' },
      { title: 'تصنيفات الأصناف', icon: Tags, href: '/product-categories' }
    ]
  },
  {
    title: 'المشتريات',
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المشتريات', icon: FileText, href: '/purchases' },
      { title: 'مرتجعات المشتريات', icon: Percent, href: '/purchase-returns' }
    ]
  },
  {
    title: 'المبيعات',
    icon: ScanBarcode,
    children: [
      { title: 'فواتير المبيعات', icon: FileText, href: '/sales' },
      { title: 'عروض الأسعار', icon: Tags, href: '/quotes' },
      { title: 'مرتجعات المبيعات', icon: Percent, href: '/sales-returns' },
      { title: 'حساب الضرائب', icon: Calculator, href: '/tax-calculator' }
    ]
  },
  {
    title: 'إدارة المخزون',
    icon: Warehouse,
    children: [
      { title: 'حالة المخزون', icon: List, href: '/inventory' },
      { title: 'جرد المخزون', icon: Plus, href: '/inventory-count' },
      { title: 'حركة المخزون', icon: BarChart3, href: '/inventory-movement' },
      { title: 'تحويل المخزون', icon: Truck, href: '/inventory-transfer' }
    ]
  },
  { title: 'الموظفين', icon: Users, href: '/employees' },
  { title: 'الخصومات', icon: Minus, href: '/deductions' },
  { title: 'الرواتب', icon: DollarSign, href: '/salaries' },
  { title: 'التقارير', icon: BarChart3, href: '/reports' },
  { title: 'الإعدادات', icon: Settings, href: '/settings' }
];

export default function SimpleSidebar() {
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

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isItemActive = item.href === location;
    const isExpanded = expandedItems.includes(item.title);
    
    if (item.children) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between text-right p-3 h-auto font-medium text-white hover:bg-white/10",
              level > 0 && "mr-8 text-sm",
              isExpanded && "bg-white/10"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
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
              <h1 className="text-xl font-bold">نظام المحاسبة</h1>
              <p className="text-sm text-white/70">إدارة شاملة للأعمال</p>
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