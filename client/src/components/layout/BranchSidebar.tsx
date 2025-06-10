import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Building, 
  Calculator,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  ArrowRight,
  Store,
  Receipt,
  FileSpreadsheet,
  UserCheck,
  Coins,
  BookOpen,
  TrendingUp,
  PieChart,
  Calendar,
  Archive,
  RefreshCw,
  DollarSign,
  CreditCard,
  Wallet,
  UsersRound,
  UserMinus,
  Banknote,
  ScanBarcode
} from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchSidebarProps {
  branchId: number;
  onClose?: () => void;
}

export default function BranchSidebar({ branchId, onClose }: BranchSidebarProps) {
  const [location, setLocation] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`]
  });

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const navigateTo = (href: string) => {
    setLocation(href);
    onClose?.();
  };

  // قائمة الأقسام الرئيسية للفرع (مطابقة للنظام الرئيسي)
  const menuItems = [
    { 
      title: 'لوحة التحكم', 
      icon: Home, 
      href: `/branch/${branchId}/dashboard` 
    },
    { 
      title: 'إدارة المخزون', 
      icon: Package,
      children: [
        { title: 'المنتجات', icon: Package, href: `/branch/${branchId}/products` },
        { title: 'إضافة منتج', icon: Package, href: `/branch/${branchId}/products/add` },
        { title: 'الفئات', icon: Archive, href: `/branch/${branchId}/product-categories` },
        { title: 'الأرصدة الافتتاحية', icon: Calculator, href: `/branch/${branchId}/inventory-opening-balances` },
        { title: 'نقل المخزون', icon: RefreshCw, href: `/branch/${branchId}/inventory-transfer` },
        { title: 'الباركود', icon: ScanBarcode, href: `/branch/${branchId}/barcodes` }
      ]
    },
    { 
      title: 'المبيعات', 
      icon: ShoppingCart,
      children: [
        { title: 'فاتورة مبيعات', icon: ShoppingCart, href: `/branch/${branchId}/sales` },
        { title: 'عروض الأسعار', icon: FileText, href: `/branch/${branchId}/quotes` },
        { title: 'مرتجع المبيعات', icon: RefreshCw, href: `/branch/${branchId}/sales-returns` }
      ]
    },
    { 
      title: 'العملاء', 
      icon: Users, 
      href: `/branch/${branchId}/clients` 
    },
    { 
      title: 'المشتريات', 
      icon: Truck,
      children: [
        { title: 'فاتورة مشتريات', icon: Truck, href: `/branch/${branchId}/purchases` },
        { title: 'مرتجع المشتريات', icon: RefreshCw, href: `/branch/${branchId}/purchase-returns` }
      ]
    },
    { 
      title: 'الموردين', 
      icon: Building, 
      href: `/branch/${branchId}/suppliers` 
    },
    { 
      title: 'الحسابات', 
      icon: Calculator,
      children: [
        { title: 'سندات دفع للموردين', icon: CreditCard, href: `/branch/${branchId}/supplier-payment-vouchers` },
        { title: 'سندات قبض من العملاء', icon: Receipt, href: `/branch/${branchId}/client-receipt-vouchers` },
        { title: 'القيود اليومية', icon: BookOpen, href: `/branch/${branchId}/journal-entries` },
        { title: 'حسابات دائنة', icon: DollarSign, href: `/branch/${branchId}/accounts-payable` },
        { title: 'حسابات مدينة', icon: Wallet, href: `/branch/${branchId}/accounts-receivable` }
      ]
    },
    { 
      title: 'الموظفين', 
      icon: UsersRound,
      children: [
        { title: 'إدارة الموظفين', icon: UsersRound, href: `/branch/${branchId}/employees` },
        { title: 'الخصومات', icon: UserMinus, href: `/branch/${branchId}/deductions` },
        { title: 'المرتبات', icon: Banknote, href: `/branch/${branchId}/salaries` }
      ]
    },
    { 
      title: 'التقارير', 
      icon: BarChart3,
      children: [
        { title: 'التقارير اليومية', icon: Calendar, href: `/branch/${branchId}/daily-reports` },
        { title: 'تقارير المبيعات', icon: TrendingUp, href: `/branch/${branchId}/sales-reports` },
        { title: 'تقارير المخزون', icon: PieChart, href: `/branch/${branchId}/inventory-reports` },
        { title: 'تقارير مالية', icon: FileSpreadsheet, href: `/branch/${branchId}/financial-reports` }
      ]
    },
    { 
      title: 'إعدادات الفرع', 
      icon: Settings, 
      href: `/branch/${branchId}/settings` 
    }
  ];

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* هيدر الفرع */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="font-bold text-green-900 text-sm">{branch?.name || 'الفرع'}</h2>
              <Badge variant="outline" className="text-xs">{branch?.code}</Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateTo('/branch-management')}
            className="text-green-600 hover:text-green-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-green-600">نظام إدارة منفصل</p>
      </div>

      {/* قائمة التنقل */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-right h-auto p-3",
                      "hover:bg-gray-100 transition-colors"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                      </div>
                      {expandedItems[item.title] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </Button>
                  {expandedItems[item.title] && (
                    <ul className="mt-2 mr-6 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-right h-auto p-2 text-sm",
                              location === child.href
                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                                : "hover:bg-gray-50 text-gray-600"
                            )}
                            onClick={() => navigateTo(child.href)}
                          >
                            <div className="flex items-center gap-2">
                              <child.icon className="h-3 w-3" />
                              <span>{child.title}</span>
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-right h-auto p-3",
                    location === item.href
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() => navigateTo(item.href)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* معلومات الفرع */}
      {branch && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            {branch.address && (
              <div className="flex items-center gap-1">
                <Store className="h-3 w-3" />
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
  );
}