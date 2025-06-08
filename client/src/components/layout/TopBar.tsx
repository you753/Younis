import { useState, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
} from '@/components/ui/command';

import { useTranslation } from '@/lib/translations';
import { useAppStore } from '@/lib/store';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserType } from '@shared/schema';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { t, language } = useTranslation();
  const { settings } = useAppStore();
  const [, setLocation] = useLocation();
  const { logout, user } = useAuth();
  
  // جلب بيانات البحث
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: searchOpen
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    enabled: searchOpen
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: searchOpen
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    enabled: searchOpen
  });

  // جلب بيانات المستخدم الحالي
  const { data: currentUser } = useQuery<UserType & { fullName?: string; phone?: string; address?: string; bio?: string; profession?: string; avatar?: string }>({
    queryKey: ['/api/auth/me']
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // تفعيل نظام الإشعارات
  useNotificationSystem();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // فتح البحث بالضغط على Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // فلترة نتائج البحث
  const filteredProducts = Array.isArray(products) ? products.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredClients = Array.isArray(clients) ? clients.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredSales = Array.isArray(sales) ? sales.filter((item: any) =>
    item.id?.toString().includes(searchQuery) ||
    item.total?.toString().includes(searchQuery)
  ) : [];

  const handleSearchSelect = (type: string, id: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    
    switch (type) {
      case 'product':
        setLocation('/products');
        break;
      case 'client':
        setLocation('/clients');
        break;
      case 'supplier':
        setLocation('/suppliers');
        break;
      case 'sale':
        setLocation('/sales');
        break;
      case 'page':
        setLocation(id);
        break;
    }
  };

  const formatTime = (date: Date) => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-l from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900 border-b border-blue-500/30 dark:border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* الترحيب والوقت */}
        <div className="flex items-center gap-6">
          <div className="text-white">
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
              {language === 'ar' ? 'مرحباً بك في المحاسب الأعظم' : 'Welcome to Al-Mohaseb Al-Azam'}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-blue-100 dark:text-slate-300 text-sm">{formatDate(currentTime)}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 dark:bg-cyan-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 dark:text-slate-300 text-sm font-mono">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="flex-1 max-w-md mx-8 relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400 dark:text-slate-400" />
            <Input
              placeholder="ابحث في المنتجات، العملاء، الموردين..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              className="pl-4 pr-10 bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-600/50 text-white dark:text-slate-200 placeholder:text-blue-200 dark:placeholder:text-slate-400 focus:bg-white/20 dark:focus:bg-slate-700/50 focus:border-white/40 dark:focus:border-slate-500"
            />
          </div>

          {/* نتائج البحث المنسدلة */}
          {searchQuery.length > 0 && showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {/* صفحات النظام */}
              {searchQuery.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">صفحات النظام</h4>
                  <div className="space-y-1">
                    {[
                      { name: 'لوحة التحكم', path: '/dashboard' },
                      { name: 'المبيعات', path: '/sales' },
                      { name: 'المشتريات', path: '/purchases' },
                      { name: 'المنتجات', path: '/products' },
                      { name: 'العملاء', path: '/clients' },
                      { name: 'الموردين', path: '/suppliers' },
                      { name: 'الموظفين', path: '/employees' },
                      { name: 'الإعدادات', path: '/settings' }
                    ].filter(page => page.name.toLowerCase().includes(searchQuery.toLowerCase())).map(page => (
                      <button
                        key={page.path}
                        onClick={() => handleSearchSelect('page', page.path)}
                        className="w-full text-right px-2 py-1 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                      >
                        {page.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* المنتجات */}
              {filteredProducts.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">المنتجات</h4>
                  <div className="space-y-1">
                    {filteredProducts.slice(0, 3).map((product: any) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchSelect('product', product.id)}
                        className="w-full text-right px-2 py-1 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded flex justify-between items-center"
                      >
                        <span>{product.name}</span>
                        <span className="text-xs text-gray-500">{product.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* العملاء */}
              {filteredClients.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">العملاء</h4>
                  <div className="space-y-1">
                    {filteredClients.slice(0, 3).map((client: any) => (
                      <button
                        key={client.id}
                        onClick={() => handleSearchSelect('client', client.id)}
                        className="w-full text-right px-2 py-1 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded flex justify-between items-center"
                      >
                        <span>{client.name}</span>
                        <span className="text-xs text-gray-500">{client.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* الموردين */}
              {filteredSuppliers.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">الموردين</h4>
                  <div className="space-y-1">
                    {filteredSuppliers.slice(0, 3).map((supplier: any) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSearchSelect('supplier', supplier.id)}
                        className="w-full text-right px-2 py-1 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded flex justify-between items-center"
                      >
                        <span>{supplier.name}</span>
                        <span className="text-xs text-gray-500">{supplier.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* لا توجد نتائج */}
              {filteredProducts.length === 0 && filteredClients.length === 0 && filteredSuppliers.length === 0 && searchQuery.length > 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                  لا توجد نتائج للبحث "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* الإشعارات وإعدادات المستخدم */}
        <div className="flex items-center gap-4">
          {/* الإشعارات */}
          <NotificationsDropdown />

          {/* حالة النظام */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-green-400 dark:bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-100 dark:text-emerald-300 text-xs font-medium">{t('systemRunning')}</span>
          </div>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/50 gap-2"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{currentUser?.fullName || currentUser?.username || 'المستخدم'}</p>
                  <p className="text-xs text-blue-200 dark:text-slate-400">{currentUser?.email || 'admin@company.com'}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={currentUser?.avatar ? currentUser.avatar : undefined} 
                    alt={currentUser?.username} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-cyan-500 text-white text-xs">
                    {currentUser?.fullName ? getInitials(currentUser.fullName) : 
                     currentUser?.username ? getInitials(currentUser.username) : 'UN'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setLocation('/profile')}>
                <User className="h-4 w-4" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setLocation('/settings')}>
                <Settings className="h-4 w-4" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-red-600 cursor-pointer"
                onClick={() => {
                  logout();
                  window.location.reload(); // إعادة تحميل الصفحة للعودة لصفحة تسجيل الدخول
                }}
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* شريط سفلي بمعلومات إضافية */}
      <div className="bg-black/10 dark:bg-slate-900/50 px-6 py-2 border-t border-white/10 dark:border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-emerald-100 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>{t('systemVersion')}</span>
            <span>•</span>
            <span>{t('lastUpdate')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{t('timezone')}</span>
            <span>•</span>
            <span>{t('currency')}</span>
          </div>
        </div>
      </div>


    </div>
  );
}