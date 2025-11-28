import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings, Menu, X, Building, ChevronDown, Shield, Home, FileText } from 'lucide-react';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

export default function MainTopNav() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    return location === href || (href !== '/' && location.startsWith(href));
  };

  const navigateAndClose = (href: string) => {
    setLocation(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-black dark:bg-black text-white shadow-lg z-40 border-b border-amber-500/30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">

            {/* Desktop Menu Items */}
            <div className="hidden lg:flex items-center gap-1">

              {/* لوحة التحكم */}
              <Link href="/">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/10 h-9",
                    isActive('/') && location === '/' && "bg-white/20"
                  )}
                  data-testid="nav-dashboard"
                >
                  <Home className="h-4 w-4 ml-1" />
                  <span className="text-sm">لوحة التحكم</span>
                </Button>
              </Link>

              {/* إدارة الفروع */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-white hover:bg-white/10 h-9",
                      (isActive('/branches') || isActive('/branch-permissions') || isActive('/branch-reports')) && "bg-white/20"
                    )}
                    data-testid="nav-branches"
                  >
                    <Building className="h-4 w-4 ml-1" />
                    <span className="text-sm">إدارة الفروع</span>
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/branches">
                      <div className="flex items-center w-full cursor-pointer">
                        <Building className="h-4 w-4 ml-2" />
                        <span>إدارة الفروع</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/branch-permissions">
                      <div className="flex items-center w-full cursor-pointer">
                        <Shield className="h-4 w-4 ml-2" />
                        <span>صلاحيات الفروع</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/branch-reports">
                      <div className="flex items-center w-full cursor-pointer">
                        <FileText className="h-4 w-4 ml-2" />
                        <span>تقارير الفروع</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* الإعدادات */}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/10 h-9",
                    isActive('/settings') && "bg-white/20"
                  )}
                  data-testid="nav-settings"
                >
                  <Settings className="h-4 w-4 ml-1" />
                  <span className="text-sm">الإعدادات</span>
                </Button>
              </Link>

            </div>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
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

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-amber-700 border-t border-white/10 max-h-[80vh] overflow-y-auto" dir="rtl">
            <div className="px-4 py-3 space-y-1">
              
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => navigateAndClose('/')}
              >
                <Home className="h-4 w-4 ml-2" />
                <span>لوحة التحكم</span>
              </Button>

              <div className="border-t border-white/10 pt-2 mt-2">
                <p className="text-xs text-white/60 px-2 mb-2">إدارة الفروع</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm"
                  onClick={() => navigateAndClose('/branches')}
                >
                  <Building className="h-4 w-4 ml-2" />
                  <span>إدارة الفروع</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm"
                  onClick={() => navigateAndClose('/branch-permissions')}
                >
                  <Shield className="h-4 w-4 ml-2" />
                  <span>صلاحيات الفروع</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 mt-4"
                onClick={() => navigateAndClose('/settings')}
              >
                <Settings className="h-4 w-4 ml-2" />
                <span>الإعدادات</span>
              </Button>

            </div>
          </div>
        )}
      </nav>
    </>
  );
}
