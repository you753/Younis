import { useState } from 'react';
// Updated sidebar with Reports & Settings section
import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, X, Truck, DollarSign, Minus, ChevronDown,
  Tags, List, Plus, Percent, Calculator, CreditCard, Calendar
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
  {
    title: 'المنتجات',
    icon: Package,
    children: [
      { title: 'قائمة المنتجات', icon: Package, href: '/products' },
      { title: 'الباركود', icon: ScanBarcode, href: '/product-barcodes' },
      { title: 'فئات المنتجات', icon: Tags, href: '/product-categories' }
    ]
  },
  {
    title: 'العملاء',
    icon: Users,
    children: [
      { title: 'قائمة العملاء', icon: Users, href: '/clients' },
      { title: 'عميل نقدي', icon: Users, href: '/cash-client' },
      { title: 'حسابات العملاء', icon: FileText, href: '/client-accounts-new' },
      { title: 'مجموعات العملاء', icon: List, href: '/client-groups' }
    ]
  },
  {
    title: 'الموردين',
    icon: Truck,
    children: [
      { title: 'قائمة الموردين', icon: Truck, href: '/suppliers' }
    ]
  },
  {
    title: 'المبيعات',
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المبيعات', icon: FileText, href: '/sales-invoices' },
      { title: 'مرتجع المبيعات', icon: Minus, href: '/sales-returns' },
      { title: 'عروض الأسعار', icon: List, href: '/quotes' },
      { title: 'حاسبة الضرائب', icon: Calculator, href: '/tax-calculator' }
    ]
  },
  {
    title: 'المشتريات',
    icon: ShoppingCart,
    children: [
      { title: 'فواتير المشتريات', icon: FileText, href: '/purchases' },
      { title: 'مرتجع المشتريات', icon: Minus, href: '/purchase-returns' },
      { title: 'أوامر الشراء', icon: List, href: '/purchase-orders' },
      { title: 'سند استلام البضاعة', icon: Package, href: '/goods-receipt' }
    ]
  },
  {
    title: 'المخزون',
    icon: Warehouse,
    children: [
      { title: 'إدارة المخزون', icon: Package, href: '/inventory' },
      { title: 'حركة المخزون', icon: Truck, href: '/inventory-movement' },
      { title: 'تقارير المخزون الشاملة', icon: FileText, href: '/comprehensive-inventory-reports' },
      { title: 'تحويل المخزون', icon: Truck, href: '/inventory-transfer' }
    ]
  },
  {
    title: 'إدارة الموظفين',
    icon: Users,
    children: [
      { title: 'قائمة الموظفين', icon: Users, href: '/employees' },
      { title: 'الديون', icon: CreditCard, href: '/debts' },
      { title: 'الإجازات', icon: Calendar, href: '/holidays' },
      { title: 'الرواتب', icon: DollarSign, href: '/salaries' },
      { title: 'الخصومات', icon: Minus, href: '/deductions' },
      { title: 'البدلات', icon: Plus, href: '/allowances' },
      { title: 'تقارير الموظفين', icon: FileText, href: '/employee-reports' }
    ]
  },
  {
    title: 'القوالب',
    icon: FileText,
    children: [
      { title: 'قوالب الفواتير', icon: FileText, href: '/invoice-templates' },
      { title: 'قوالب التقارير', icon: BarChart3, href: '/report-templates' },
      { title: 'قوالب الفروع', icon: Users, href: '/branch-templates' }
    ]
  },
  {
    title: 'التقارير والإعدادات',
    icon: BarChart3,
    children: [
      { title: 'تقارير المبيعات', icon: BarChart3, href: '/sales-reports' },
      { title: 'تقارير المشتريات', icon: BarChart3, href: '/purchase-reports' },
      { title: 'الصحة المالية التفاعلية', icon: BarChart3, href: '/financial-health-dashboard' },
      { title: 'الإعدادات العامة', icon: Settings, href: '/settings' },
      { title: 'إعدادات الشركة', icon: Settings, href: '/company-settings' },
      { title: 'إعدادات النظام', icon: Settings, href: '/system-settings' },
      { title: 'إعدادات المستخدمين', icon: Users, href: '/user-settings' },
      { title: 'النسخ الاحتياطي', icon: FileText, href: '/backup-settings' }
    ]
  },
  { title: 'إدارة الفروع', icon: Users, href: '/branches' }
];

export default function SimpleSidebar() {
  const [location] = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['إدارة الموظفين', 'التقارير والإعدادات']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = location === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full justify-between text-white hover:bg-white/10 font-medium",
              level > 0 && "pr-8"
            )}
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
            <div className="pr-4 space-y-1">
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href!}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 font-medium",
            isActive && "bg-white/20",
            level > 0 && "pr-8"
          )}
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