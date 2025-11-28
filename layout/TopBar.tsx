import { useState, useEffect } from 'react';
import { Search, LogOut, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/hooks/useAuth';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('pageZoom');
    return saved ? parseInt(saved) : 100;
  });
  const { t, language } = useTranslation();
  const { settings } = useAppStore();
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  // تطبيق مستوى التكبير عند التحميل وعند التغيير
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoomLevel}%`;
    localStorage.setItem('pageZoom', zoomLevel.toString());
  }, [zoomLevel]);

  // تكبير الصفحة
  const zoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(prev => Math.min(prev + 10, 150));
    }
  };

  // تصغير الصفحة
  const zoomOut = () => {
    if (zoomLevel > 70) {
      setZoomLevel(prev => Math.max(prev - 10, 70));
    }
  };

  // إعادة التكبير للوضع الافتراضي
  const resetZoom = () => {
    setZoomLevel(100);
  };

  // دالة تبديل وضع ملء الشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.log('خطأ في تفعيل ملء الشاشة:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.log('خطأ في إلغاء ملء الشاشة:', err);
      });
    }
  };

  // مراقبة تغيير حالة ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };
  
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

  // جلب إعدادات الشركة
  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any) => {
      // تحويل البيانات من التنسيق الجديد
      if (data?.company) {
        return {
          nameArabic: data.company.arabicName || '',
          nameEnglish: data.company.name || ''
        };
      }
      return {};
    }
  });

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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const arabicWeekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const weekday = arabicWeekdays[date.getDay()];
    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}، ${day} ${month} ${year}`;
  };

  return (
    <div className="bg-black dark:bg-black border-b border-amber-500/30 dark:border-amber-500/30 shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3">
        {/* معلومات الشركة */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-white">
            <h2 className="text-sm md:text-xl font-bold text-amber-400 leading-tight">
              {companySettings?.nameArabic || 'بوابة سوق البدو'}
            </h2>
          </div>
        </div>

        {/* الوقت والتاريخ - يظهر بشكل مختلف على الجوال */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="text-white text-left">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-0.5 md:gap-4">
              <p className="text-amber-300 dark:text-slate-300 text-[10px] md:text-sm hidden md:block">{formatDate(currentTime)}</p>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 dark:bg-cyan-400 rounded-full animate-pulse"></div>
                <p className="text-amber-300 dark:text-slate-300 text-xs md:text-sm font-mono">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث - محذوف */}
        <div className="hidden">
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
                        className="w-full text-right px-3 py-2 text-sm text-amber-400 dark:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 rounded-md transition-colors"
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
                          <span className="bg-amber-500 text-black px-1 rounded">{product.code}</span>
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
                            <span className="text-gray-500">{new Date(sale.date).toLocaleDateString('en-GB')}</span>
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
                  <div className="text-xs mt-3 bg-amber-500/10 dark:bg-amber-500/10 p-2 rounded text-amber-400">
                    💡 استخدم Ctrl+K لفتح البحث السريع
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* أزرار تكبير/تصغير الصفحة - احترافية */}
          <div className="flex items-center bg-gray-800/50 rounded-lg border border-amber-500/20 overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={zoomLevel <= 70}
              className="text-amber-400 hover:bg-amber-500/20 h-7 w-7 md:h-8 md:w-8 p-0 rounded-none border-l border-amber-500/20"
              title="تصغير الصفحة"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <button
              onClick={resetZoom}
              className="text-amber-400 text-xs md:text-sm font-mono px-2 hover:bg-amber-500/10 h-7 md:h-8 min-w-[40px] md:min-w-[48px]"
              title="إعادة للوضع الافتراضي"
              data-testid="button-zoom-reset"
            >
              {zoomLevel}%
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={zoomLevel >= 150}
              className="text-amber-400 hover:bg-amber-500/20 h-7 w-7 md:h-8 md:w-8 p-0 rounded-none border-r border-amber-500/20"
              title="تكبير الصفحة"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>

          {/* زر ملء الشاشة */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-amber-400 hover:bg-amber-500/20 flex items-center gap-1 px-2 h-7 md:h-8"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>

          {/* حالة النظام */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-green-400 dark:bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-100 dark:text-emerald-300 text-xs font-medium">{t('systemRunning')}</span>
          </div>

          {/* زر تسجيل الخروج */}
          <Button
            variant="outline"
            size="sm"
            className="text-white border-red-500/50 hover:bg-red-500/20 hover:border-red-500 flex items-center gap-1 md:gap-2 px-2 md:px-3 h-7 md:h-8"
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="button-logout"
          >
            {isLoggingOut ? (
              <>
                <div className="h-3 w-3 md:h-4 md:w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                <span className="hidden md:inline">جاري الخروج...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">تسجيل الخروج</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* شريط سفلي بمعلومات إضافية - مخفي على الجوال */}
      <div className="hidden md:block bg-black/10 dark:bg-slate-900/50 px-6 py-2 border-t border-white/10 dark:border-slate-700/50">
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