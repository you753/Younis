import { Link, useLocation } from 'wouter';
import { 
  Home, Users, UserCheck, Package, ShoppingCart, 
  ScanBarcode, Warehouse, FileText, BarChart3, 
  Settings, X, Truck, DollarSign, Minus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  icon: any;
  href: string;
}

const navigationItems: NavItem[] = [
  { title: 'لوحة التحكم', icon: Home, href: '/' },
  { title: 'إدارة المستخدمين', icon: Users, href: '/users' },
  { title: 'الموردين', icon: Truck, href: '/suppliers' },
  { title: 'العملاء', icon: UserCheck, href: '/clients' },
  { title: 'الأصناف', icon: Package, href: '/products' },
  { title: 'المشتريات', icon: ShoppingCart, href: '/purchases' },
  { title: 'المبيعات', icon: ScanBarcode, href: '/sales' },
  { title: 'المخزون', icon: Warehouse, href: '/inventory' },
  { title: 'الموظفين', icon: Users, href: '/employees' },
  { title: 'الخصومات', icon: Minus, href: '/deductions' },
  { title: 'الرواتب', icon: DollarSign, href: '/salaries' },
  { title: 'التقارير', icon: BarChart3, href: '/reports' },
  { title: 'الإعدادات', icon: Settings, href: '/settings' }
];

export default function SimpleSidebar() {
  const [location] = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

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
          {navigationItems.map(item => (
            <Link key={item.title} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-right p-3 h-auto font-medium text-white hover:bg-white/10",
                  location === item.href && "bg-white/20 text-white"
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}