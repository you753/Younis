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

  // بحث ذكي ومتقدم
  const searchTerms = searchQuery.toLowerCase().trim().split(' ');
  
  const filteredProducts = Array.isArray(products) ? products.filter((item: any) => {
    const searchText = `${item.name || ''} ${item.code || ''} ${item.barcode || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  const filteredClients = Array.isArray(clients) ? clients.filter((item: any) => {
    const searchText = `${item.name || ''} ${item.phone || ''} ${item.email || ''} ${item.address || ''}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((item: any) => {
    const searchText = `${item.name || ''} ${item.phone || ''} ${item.email || ''} ${item.address || ''}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  const filteredSales = Array.isArray(sales) ? sales.filter((item: any) => {
    const client = Array.isArray(clients) ? clients.find((c: any) => c.id === item.clientId) : null;
    const searchText = `${item.id || ''} ${item.total || ''} ${item.date || ''} ${item.notes || ''} ${client?.name || ''}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  // فلترة صفحات النظام
  const systemPages = [
    { name: 'لوحة التحكم', path: '/dashboard', keywords: 'dashboard home الرئيسية احصائيات' },
    { name: 'المبيعات', path: '/sales', keywords: 'sales فواتير invoices بيع' },
    { name: 'المشتريات', path: '/purchases', keywords: 'purchases شراء purchase orders' },
    { name: 'المنتجات', path: '/products', keywords: 'products items المخزون inventory' },
    { name: 'العملاء', path: '/clients', keywords: 'clients customers زبائن عملاء' },
    { name: 'الموردين', path: '/suppliers', keywords: 'suppliers vendors موردين' },
    { name: 'الموظفين', path: '/employees', keywords: 'employees staff موظفين عمال' },
    { name: 'المرتبات', path: '/salaries', keywords: 'salaries payroll رواتب مرتبات' },
    { name: 'التقارير', path: '/reports', keywords: 'reports تقارير analytics' },
    { name: 'الإعدادات', path: '/settings', keywords: 'settings configuration اعدادات' }
  ];

  const filteredPages = systemPages.filter(page => {
    const searchText = `${page.name} ${page.keywords}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  });

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
              {filteredPages.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">🏠 صفحات النظام</h4>
                  <div className="space-y-1">
                    {filteredPages.map(page => (
                      <button
                        key={page.path}
                        onClick={() => handleSearchSelect('page', page.path)}
                        className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-md transition-colors"
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
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">📦 المنتجات ({filteredProducts.length})</h4>
                  <div className="space-y-1">
                    {filteredProducts.slice(0, 5).map((product: any) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchSelect('product', product.id)}
                        className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700 rounded-md transition-colors flex justify-between items-center"
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{product.name}</span>
                          {product.category && (
                            <span className="text-xs text-gray-500">{product.category}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start text-xs">
                          <span className="bg-blue-100 text-blue-800 px-1 rounded">{product.code}</span>
                          {product.salePrice && (
                            <span className="text-green-600 font-medium">{product.salePrice} ر.س</span>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length > 5 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{filteredProducts.length - 5} منتج إضافي
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* العملاء */}
              {filteredClients.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">👥 العملاء ({filteredClients.length})</h4>
                  <div className="space-y-1">
                    {filteredClients.slice(0, 4).map((client: any) => (
                      <button
                        key={client.id}
                        onClick={() => handleSearchSelect('client', client.id)}
                        className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-md transition-colors flex justify-between items-center"
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{client.name}</span>
                          {client.email && (
                            <span className="text-xs text-gray-500">{client.email}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start text-xs">
                          <span className="bg-orange-100 text-orange-800 px-1 rounded">{client.phone}</span>
                          {client.address && (
                            <span className="text-gray-500 max-w-20 truncate">{client.address}</span>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredClients.length > 4 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{filteredClients.length - 4} عميل إضافي
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* الموردين */}
              {filteredSuppliers.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">🏢 الموردين ({filteredSuppliers.length})</h4>
                  <div className="space-y-1">
                    {filteredSuppliers.slice(0, 4).map((supplier: any) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSearchSelect('supplier', supplier.id)}
                        className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 rounded-md transition-colors flex justify-between items-center"
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.email && (
                            <span className="text-xs text-gray-500">{supplier.email}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start text-xs">
                          <span className="bg-purple-100 text-purple-800 px-1 rounded">{supplier.phone}</span>
                          {supplier.address && (
                            <span className="text-gray-500 max-w-20 truncate">{supplier.address}</span>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredSuppliers.length > 4 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{filteredSuppliers.length - 4} مورد إضافي
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* المبيعات */}
              {filteredSales.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">💰 المبيعات ({filteredSales.length})</h4>
                  <div className="space-y-1">
                    {filteredSales.slice(0, 3).map((sale: any) => {
                      const client = Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null;
                      return (
                        <button
                          key={sale.id}
                          onClick={() => handleSearchSelect('sale', sale.id)}
                          className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-yellow-50 dark:hover:bg-slate-700 rounded-md transition-colors flex justify-between items-center"
                        >
                          <div className="flex flex-col items-end">
                            <span className="font-medium">فاتورة #{sale.id}</span>
                            <span className="text-xs text-gray-500">{client?.name || 'عميل غير محدد'}</span>
                          </div>
                          <div className="flex flex-col items-start text-xs">
                            <span className="bg-green-100 text-green-800 px-1 rounded font-medium">{sale.total} ر.س</span>
                            <span className="text-gray-500">{new Date(sale.date).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </button>
                      );
                    })}
                    {filteredSales.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{filteredSales.length - 3} فاتورة إضافية
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* لا توجد نتائج */}
              {filteredProducts.length === 0 && filteredClients.length === 0 && filteredSuppliers.length === 0 && filteredSales.length === 0 && filteredPages.length === 0 && searchQuery.length > 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                  <div className="text-lg mb-2">🔍</div>
                  <div className="font-medium mb-1">لا توجد نتائج للبحث</div>
                  <div className="text-sm">جرب كلمات مختلفة أو تأكد من الإملاء</div>
                  <div className="text-xs mt-2 bg-gray-100 dark:bg-slate-700 p-2 rounded">
                    💡 يمكنك البحث في: أسماء المنتجات، أكواد المنتجات، أسماء العملاء، أرقام الهواتف، رقم الفاتورة
                  </div>
                </div>
              )}

              {/* إرشادات البحث */}
              {searchQuery.length === 0 && showDropdown && (
                <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                  <div className="text-lg mb-2">⌨️</div>
                  <div className="font-medium mb-2">نصائح البحث</div>
                  <div className="text-sm space-y-1">
                    <div>• ابحث عن المنتجات بالاسم أو الكود</div>
                    <div>• ابحث عن العملاء بالاسم أو رقم الهاتف</div>
                    <div>• ابحث عن الفواتير برقم الفاتورة</div>
                    <div>• استخدم مسافات للبحث المتقدم</div>
                  </div>
                  <div className="text-xs mt-3 bg-blue-50 dark:bg-slate-700 p-2 rounded">
                    💡 استخدم Ctrl+K لفتح البحث السريع
                  </div>
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
                onClick={async () => {
                  await logout();
                  setLocation('/login');
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