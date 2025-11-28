import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown,
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Building, 
  Calculator,
  ArrowRight,
  Store,
  RefreshCw,
  FileText,
  CreditCard,
  Receipt,
  BookOpen,
  DollarSign,
  Wallet,
  UsersRound,
  UserMinus,
  Banknote,
  ScanBarcode,
  Menu,
  X
} from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchTopBarProps {
  branchId: number;
}

export default function BranchTopBar({ branchId }: BranchTopBarProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`]
  });

  const navigateTo = (href: string) => {
    setLocation(href);
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Branch Info & Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Building className="h-5 w-5 text-white" />
                <div>
                  <h2 className="font-bold text-white text-sm leading-tight">{branch?.name || 'الفرع'}</h2>
                  <Badge variant="outline" className="text-[10px] border-white/30 text-white">{branch?.code}</Badge>
                </div>
              </div>
            </div>

            {/* Desktop Menu Items */}
            <div className="hidden lg:flex items-center gap-1">
              
              {/* لوحة التحكم */}
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-white/10 h-9",
                  isActive(`/branch/${branchId}/dashboard`) && "bg-white/20"
                )}
                onClick={() => navigateTo(`/branch/${branchId}/dashboard`)}
                data-testid="nav-dashboard"
              >
                <Home className="h-4 w-4 ml-1" />
                <span className="text-sm">لوحة التحكم</span>
              </Button>

              {/* إدارة المخزون */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-9"
                    data-testid="nav-inventory"
                  >
                    <Package className="h-4 w-4 ml-1" />
                    <span className="text-sm">إدارة المخزون</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/products`)} data-testid="nav-products">
                    <Package className="h-4 w-4 ml-2" />
                    <span>المنتجات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/inventory-opening-balances`)} data-testid="nav-opening-balances">
                    <Calculator className="h-4 w-4 ml-2" />
                    <span>الأرصدة الافتتاحية</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/inventory-transfer`)} data-testid="nav-inventory-transfer">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    <span>نقل المخزون</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/barcodes`)} data-testid="nav-barcodes">
                    <ScanBarcode className="h-4 w-4 ml-2" />
                    <span>الباركود</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* المبيعات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-9"
                    data-testid="nav-sales"
                  >
                    <ShoppingCart className="h-4 w-4 ml-1" />
                    <span className="text-sm">المبيعات</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/sales`)} data-testid="nav-sales-invoices">
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    <span>فاتورة مبيعات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/quotes`)} data-testid="nav-quotes">
                    <FileText className="h-4 w-4 ml-2" />
                    <span>عروض الأسعار</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/sales-returns`)} data-testid="nav-sales-returns">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    <span>مرتجع المبيعات</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* العملاء */}
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-white/10 h-9",
                  isActive(`/branch/${branchId}/clients`) && "bg-white/20"
                )}
                onClick={() => navigateTo(`/branch/${branchId}/clients`)}
                data-testid="nav-clients"
              >
                <Users className="h-4 w-4 ml-1" />
                <span className="text-sm">العملاء</span>
              </Button>

              {/* المشتريات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-9"
                    data-testid="nav-purchases"
                  >
                    <Truck className="h-4 w-4 ml-1" />
                    <span className="text-sm">المشتريات</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/purchases`)} data-testid="nav-purchase-invoices">
                    <Truck className="h-4 w-4 ml-2" />
                    <span>فاتورة مشتريات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/purchase-returns`)} data-testid="nav-purchase-returns">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    <span>مرتجع المشتريات</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الموردين */}
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-white/10 h-9",
                  isActive(`/branch/${branchId}/suppliers`) && "bg-white/20"
                )}
                onClick={() => navigateTo(`/branch/${branchId}/suppliers`)}
                data-testid="nav-suppliers"
              >
                <Building className="h-4 w-4 ml-1" />
                <span className="text-sm">الموردين</span>
              </Button>

              {/* الحسابات */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-9"
                    data-testid="nav-accounts"
                  >
                    <Calculator className="h-4 w-4 ml-1" />
                    <span className="text-sm">الحسابات</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/supplier-payment-vouchers`)} data-testid="nav-supplier-payments">
                    <CreditCard className="h-4 w-4 ml-2" />
                    <span>سندات دفع للموردين</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/client-receipt-vouchers`)} data-testid="nav-client-receipts">
                    <Receipt className="h-4 w-4 ml-2" />
                    <span>سندات قبض من العملاء</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/journal-entries`)} data-testid="nav-journal">
                    <BookOpen className="h-4 w-4 ml-2" />
                    <span>القيود اليومية</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/accounts-payable`)} data-testid="nav-payable">
                    <DollarSign className="h-4 w-4 ml-2" />
                    <span>حسابات دائنة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/branch/${branchId}/accounts-receivable`)} data-testid="nav-receivable">
                    <Wallet className="h-4 w-4 ml-2" />
                    <span>حسابات مدينة</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الموظفين */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-9"
                    data-testid="nav-employees"
                  >
                    <UsersRound className="h-4 w-4 ml-1" />
                    <span className="text-sm">الموظفين</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigateTo(`/standalone-branch/${branchId}`)} data-testid="nav-employee-management">
                    <UsersRound className="h-4 w-4 ml-2" />
                    <span>إدارة الموظفين</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/standalone-branch/${branchId}`)} data-testid="nav-deductions">
                    <UserMinus className="h-4 w-4 ml-2" />
                    <span>الخصومات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo(`/standalone-branch/${branchId}`)} data-testid="nav-salaries">
                    <Banknote className="h-4 w-4 ml-2" />
                    <span>المرتبات</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

          </div>

          {/* Branch Info (Desktop - Bottom) */}
          {branch && (
            <div className="hidden lg:flex items-center gap-4 mt-2 text-xs text-white/80">
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
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-green-700 border-t border-white/10" dir="rtl">
            <div className="px-4 py-3 space-y-2">
              
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => navigateTo(`/branch/${branchId}/dashboard`)}
              >
                <Home className="h-4 w-4 ml-2" />
                <span>لوحة التحكم</span>
              </Button>

              <div className="border-t border-white/10 pt-2 mt-2">
                <p className="text-xs text-white/60 px-2 mb-2">إدارة المخزون</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm"
                  onClick={() => navigateTo(`/branch/${branchId}/products`)}
                >
                  <Package className="h-4 w-4 ml-2" />
                  <span>المنتجات</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm"
                  onClick={() => navigateTo(`/branch/${branchId}/inventory-transfer`)}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  <span>نقل المخزون</span>
                </Button>
              </div>

              <div className="border-t border-white/10 pt-2 mt-2">
                <p className="text-xs text-white/60 px-2 mb-2">المبيعات</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm"
                  onClick={() => navigateTo(`/branch/${branchId}/sales`)}
                >
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  <span>فاتورة مبيعات</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => navigateTo(`/branch/${branchId}/clients`)}
              >
                <Users className="h-4 w-4 ml-2" />
                <span>العملاء</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => navigateTo(`/branch/${branchId}/suppliers`)}
              >
                <Building className="h-4 w-4 ml-2" />
                <span>الموردين</span>
              </Button>

            </div>
          </div>
        )}
      </nav>
    </>
  );
}
