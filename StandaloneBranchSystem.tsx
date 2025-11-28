import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Building,
  Home, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Search,
  User,
  ChevronLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  Monitor,
  Share2,
  Copy,
  Link,
  Link2,
  Receipt,
  Printer,
  RotateCcw,
  FileText,
  Warehouse,
  Truck,
  ArrowLeftRight,
  MapPin,
  ClipboardList,
  Minus,
  UserCircle,
  LogOut,
  CreditCard,
  TrendingDown,
  Database,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Calendar,
  Package,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// استيراد مكون عرض الأقسام الفرعية
import BranchSubsectionRenderer from '@/components/BranchSubsectionRenderer';
import BranchSuppliersReport from './branch/reports/BranchSuppliersReport';
import BranchClientsReport from './branch/reports/BranchClientsReport';
import BranchSalesReport from './branch/reports/BranchSalesReport';
import BranchPurchasesReport from './branch/reports/BranchPurchasesReport';
import BranchProductsReport from './branch/reports/BranchProductsReport';
import BranchEmployeesReport from './branch/reports/BranchEmployeesReport';
import BranchInventoryTransfers from './branch/BranchInventoryTransfers';
import NewBranchTransfers from './branch/NewBranchTransfers';

interface BranchSystemProps {
  branchId: number;
  isDirectAccess?: boolean;
}

export default function StandaloneBranchSystem({ branchId, isDirectAccess = false }: BranchSystemProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [branchCode, setBranchCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('branchPageZoom');
    return saved ? parseInt(saved) : 100;
  });
  const { toast } = useToast();

  // التحقق من الدخول المباشر من رابط الفروع
  const isDirectBranchAccessFromStorage = localStorage.getItem('directBranchAccess') === 'true';
  const directBranchId = localStorage.getItem('directBranchId');
  const isInDirectMode = isDirectAccess || isDirectBranchAccessFromStorage;

  // منع الرجوع للوحة التحكم إذا كان الدخول مباشر
  useEffect(() => {
    if (isInDirectMode) {
      // حفظ حالة الدخول المباشر
      localStorage.setItem('directBranchAccess', 'true');
      localStorage.setItem('directBranchId', branchId.toString());
      
      // إضافة سجلات متعددة للتاريخ لمنع الرجوع
      for (let i = 0; i < 10; i++) {
        window.history.pushState({ directBranch: true, index: i }, '', window.location.href);
      }
      
      // منع زر الرجوع في المتصفح بشكل فوري
      const preventBack = (event: PopStateEvent) => {
        // إلغاء الحدث ومنع الرجوع
        event.preventDefault();
        event.stopPropagation();
        
        // إرجاع المستخدم للأمام فوراً
        window.history.go(1);
        
        // التأكد من البقاء في صفحة الفرع
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/direct-branch/')) {
          window.location.href = `/direct-branch/${branchId}`;
        }
      };
      
      window.addEventListener('popstate', preventBack);
      
      // منع التنقل عبر الروابط
      const preventNavigation = (event: BeforeUnloadEvent) => {
        // لا نمنع إغلاق الصفحة، فقط نحذر
      };
      
      return () => {
        window.removeEventListener('popstate', preventBack);
      };
    }
  }, [isInDirectMode, branchId]);

  // تطبيق مستوى التكبير عند التحميل وعند التغيير
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoomLevel}%`;
    localStorage.setItem('branchPageZoom', zoomLevel.toString());
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

  // دالة تبديل وضع ملء الشاشة (مع دعم iOS)
  const toggleFullscreen = () => {
    const elem = document.documentElement as any;
    
    // التحقق من دعم ملء الشاشة
    const requestFullscreen = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
    const exitFullscreen = (document as any).exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen;
    const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement;
    
    if (!requestFullscreen) {
      // ملء الشاشة غير مدعوم - تجاهل بدون خطأ
      return;
    }
    
    if (!fullscreenElement) {
      requestFullscreen.call(elem).then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // تجاهل الخطأ بصمت
      });
    } else if (exitFullscreen) {
      exitFullscreen.call(document).then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        // تجاهل الخطأ بصمت
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

  // تحديث التاريخ والوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // تنسيق التاريخ والوقت بالعربية مع الأرقام الإنجليزية
  const formatDateTime = () => {
    const arabicWeekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const weekday = arabicWeekdays[currentDateTime.getDay()];
    const day = currentDateTime.getDate();
    const month = arabicMonths[currentDateTime.getMonth()];
    const year = currentDateTime.getFullYear();
    const dateStr = `${weekday}، ${day} ${month} ${year}`;
    const timeStr = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  // اكتشاف الجوال
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // مستمع أحداث التنقل المخصصة
    const handleBranchNavigate = (event: any) => {
      const { section } = event.detail;
      setActiveSection(section);
    };

    window.addEventListener('branchNavigate', handleBranchNavigate);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('branchNavigate', handleBranchNavigate);
    };
  }, []);

  // بيانات الفرع
  const { data: branch, isLoading, error, refetch: refetchBranch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    retry: false,
  });


  // دالة التحديث الاحترافية - إعادة تحميل النظام
  const handleRefresh = () => {
    // عرض رسالة التحديث
    toast({
      title: "جاري إعادة تحميل النظام...",
      description: "سيتم تحديث جميع البيانات",
      duration: 2000,
    });

    // إعادة تحميل الصفحة بعد ثانيتين
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // إضافة دالة التنقل للنافذة لاستخدامها من Components
  useEffect(() => {
    (window as any).setBranchActiveSection = setActiveSection;
    return () => {
      delete (window as any).setBranchActiveSection;
    };
  }, [setActiveSection]);


  // دالة مشاركة الرابط المحسنة
  const shareBranchLink = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const branchUrl = `${protocol}//${host}/standalone-branch/${branchId}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(branchUrl).then(() => {
        toast({
          title: "تم نسخ الرابط بنجاح! 🔗",
          description: "رابط سريع ومحسن للجوال جاهز للمشاركة",
          duration: 3000,
        });
      }).catch(() => fallbackCopy(branchUrl));
    } else {
      fallbackCopy(branchUrl);
    }
  };

  // دالة مشاركة رابط الدخول المباشر الذهبي
  const shareDirectLoginLink = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const directLoginUrl = `${protocol}//${host}/direct-branch/${branchId}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(directLoginUrl).then(() => {
        toast({
          title: "تم نسخ الرابط المباشر! ✨",
          duration: 2000,
        });
      }).catch(() => fallbackCopy(directLoginUrl));
    } else {
      fallbackCopy(directLoginUrl);
    }
  };

  // دالة التحقق من كود الفرع
  const verifyBranchCode = () => {
    if (!branchCode.trim()) {
      setCodeError('يرجى إدخال كود الفرع');
      return;
    }

    const correctCode = (branch as any)?.code || '001';
    
    if (branchCode.trim() !== correctCode) {
      setCodeError('كود الفرع غير صحيح، حاول مرة أخرى');
      setBranchCode('');
      return;
    }

    setCodeError('');
    setIsCodeVerified(true);
    toast({
      title: "تم الدخول بنجاح ✅",
      description: `مرحباً بك في ${(branch as any)?.name || 'نظام الفرع'}`,
    });
  };

  // دالة احتياطية للنسخ
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast({
        title: "تم نسخ الرابط بنجاح! 📱",
        description: "رابط سريع ومحسن للجوال جاهز للمشاركة",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "خطأ في النسخ",
        description: "جرب مرة أخرى أو انسخ الرابط يدوياً",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // قائمة الأقسام مع الأقسام الفرعية - حسب الترتيب في الصورة
  const sections = [
    { 
      id: 'dashboard', 
      name: 'لوحة التحكم', 
      icon: Home, 
      priority: 1,
      subsections: []
    },
    { 
      id: 'suppliers', 
      name: 'الموردين', 
      icon: Truck, 
      priority: 2,
      subsections: [
        { id: 'suppliers-management', name: 'إدارة الموردين', icon: Truck },
        { id: 'suppliers-statement', name: 'كشف حساب جديد', icon: FileText },
        { id: 'suppliers-payments', name: 'سندات الصرف', icon: Receipt }
      ]
    },
    { 
      id: 'clients', 
      name: 'العملاء', 
      icon: Users, 
      priority: 3,
      subsections: [
        { id: 'clients-management', name: 'إدارة العملاء', icon: Users },
        { id: 'clients-statement', name: 'كشف حساب جديد', icon: FileText },
        { id: 'clients-receipts', name: 'سندات القبض', icon: Receipt },

      ]
    },

    { 
      id: 'purchases', 
      name: 'المشتريات', 
      icon: ShoppingBag, 
      priority: 5,
      subsections: [
        { id: 'purchases-invoices', name: 'فواتير المشتريات', icon: ShoppingBag },
        { id: 'goods-receipt', name: 'سندات إدخال البضاعة', icon: Package },
        { id: 'purchases-returns', name: 'مرتجعات المشتريات', icon: RotateCcw }
      ]
    },
    { 
      id: 'products', 
      name: 'الأصناف', 
      icon: ShoppingBag, 
      priority: 4,
      subsections: [
        { id: 'products-list', name: 'قائمة الأصناف', icon: ShoppingBag },
        { id: 'products-categories', name: 'فئات الأصناف', icon: FileText },
        { id: 'products-barcode', name: 'الباركود', icon: Printer }
      ]
    },
    { 
      id: 'sales', 
      name: 'المبيعات', 
      icon: ShoppingCart, 
      priority: 6,
      subsections: [
        { id: 'sales-invoices', name: 'فواتير المبيعات', icon: ShoppingCart },
        { id: 'sales-quotes', name: 'عروض الأسعار', icon: FileText },
        { id: 'sales-returns', name: 'مرتجعات المبيعات', icon: RotateCcw },
        { id: 'goods-issue', name: 'سند إخراج بضاعة', icon: FileText },
        { id: 'sales-receipt-vouchers', name: 'سندات قبض المبيعات', icon: Receipt }
      ]
    },
    { 
      id: 'inventory', 
      name: 'المخزون', 
      icon: Warehouse, 
      priority: 7,
      subsections: [
        { id: 'new-inventory-status', name: 'حالة المخزون', icon: Package },
        { id: 'inventory-count', name: 'جرد المخزون', icon: Package },
        { id: 'new-branch-transfers', name: '✨ تحويل المخزون الجديد', icon: ArrowLeftRight }
      ]
    },
    { 
      id: 'employees', 
      name: 'الموظفين', 
      icon: Users, 
      priority: 8,
      subsections: [
        { id: 'employees-management', name: 'إدارة الموظفين', icon: Users },
        { id: 'employee-statement', name: 'كشف حساب الموظف', icon: FileText },
        { id: 'employees-debts', name: 'الديون', icon: CreditCard },
        { id: 'employees-salaries', name: 'الرواتب', icon: DollarSign },
        { id: 'deductions-list', name: 'قائمة الخصومات', icon: TrendingDown },

      ]
    },
    { 
      id: 'daily-expenses', 
      name: 'المصروفات اليومية', 
      icon: Receipt, 
      priority: 8.5,
      subsections: [
        { id: 'daily-expenses-management', name: 'إدارة المصروفات', icon: Receipt }
      ]
    },
    { 
      id: 'reports', 
      name: 'التقارير', 
      icon: BarChart3, 
      priority: 9,
      subsections: [
        { id: 'reports-suppliers', name: 'تقارير الموردين', icon: TrendingUp },
        { id: 'reports-clients', name: 'تقارير العملاء', icon: Users },
        { id: 'reports-purchases', name: 'تقارير المشتريات', icon: ShoppingBag },
        { id: 'reports-sales', name: 'تقارير المبيعات', icon: ShoppingCart },
        { id: 'reports-inventory', name: 'تقارير المخزون', icon: Warehouse },
        { id: 'reports-employees', name: 'تقارير الموظفين', icon: Users },
        { id: 'reports-financial', name: 'التقارير المالية', icon: DollarSign }
      ]
    }

  ];

  // دالة التحكم في توسع الأقسام - قسم واحد فقط
  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? [] // إغلاق القسم الحالي
        : [sectionId] // فتح القسم الجديد وإغلاق الباقي
    );
  };

  // إذا كان جوال، اعرض النسخة المحمولة
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* نافذة إدخال كود الفرع - نسخة الجوال */}
        {!isCodeVerified && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <div className="text-center mb-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Building2 className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">دخول إلى الفرع</h2>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200">
                <h3 className="font-bold text-base mb-1">{(branch as any)?.name || ' - الفرع الرئيسي'}</h3>
                <p className="text-gray-600 text-xs">{(branch as any)?.address || 'جده البغداديه الشرقيه'}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    أدخل كود الفرع للدخول *
                  </label>
                  <Input
                    type="text"
                    placeholder="أدخل الكود"
                    value={branchCode}
                    onChange={(e) => {
                      setBranchCode(e.target.value);
                      setCodeError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        verifyBranchCode();
                      }
                    }}
                    className="text-center text-lg font-bold tracking-widest"
                    autoFocus
                  />
                  {codeError && (
                    <p className="text-red-500 text-xs mt-1 text-center">{codeError}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1 text-center">
                    يرجى التواصل مع المسؤول للحصول على الكود
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={verifyBranchCode}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm"
                  >
                    دخول
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* شريط علوي ثابت للجوال */}
        <div className="bg-black text-amber-400 p-3 sticky top-0 z-50 shadow-lg">
          {/* الصف الأول: معلومات الفرع والأزرار */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-amber-600 p-1.5 rounded-full">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold">{(branch as any)?.name || 'فرع غير محدد'}</h1>
                <p className="text-xs text-amber-300">{(branch as any)?.manager || 'مدير الفرع'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* أزرار تكبير/تصغير الصفحة - للجوال */}
              <div className="flex items-center bg-gray-800/50 rounded border border-amber-500/20 overflow-hidden">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= 70}
                  className="text-amber-400 hover:bg-amber-500/20 h-7 w-7 flex items-center justify-center disabled:opacity-50"
                  title="تصغير"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-amber-400 text-xs font-mono px-1 min-w-[32px] text-center">{zoomLevel}%</span>
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= 150}
                  className="text-amber-400 hover:bg-amber-500/20 h-7 w-7 flex items-center justify-center disabled:opacity-50"
                  title="تكبير"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                className="text-green-400 hover:bg-green-900/50 p-2"
                title="تحديث النظام"
                data-testid="button-refresh-mobile"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={shareDirectLoginLink}
                className="text-amber-400 hover:bg-amber-600/30 p-2 border border-amber-500/50"
                title="رابط الدخول المباشر الذهبي"
                data-testid="button-direct-login-link"
              >
                <Star className="h-4 w-4 fill-amber-400" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-amber-400 hover:bg-amber-900 p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* الصف الثاني: التاريخ والوقت */}
          <div className="flex items-center justify-center gap-3 bg-gray-800/50 rounded-lg p-2 border border-amber-500/20">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-400">{formatDateTime().dateStr}</span>
            </div>
            <div className="w-px h-4 bg-amber-500/30"></div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-400 font-mono" dir="ltr">{formatDateTime().timeStr}</span>
            </div>
          </div>
        </div>

        {/* نافذة القائمة في المنتصف */}
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* خلفية شفافة */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* نافذة القائمة في المنتصف */}
          <div 
            className={`absolute inset-x-3 top-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300 ease-out border border-amber-500/30 ${
              isMobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="bg-amber-600 rounded-t-2xl px-4 py-2 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">القائمة الرئيسية</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-white/20 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* محتوى القائمة */}
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <div className="space-y-0.5">
                {sections.map(section => {
                  const Icon = section.icon;
                  const hasSubsections = section.subsections && section.subsections.length > 0;
                  const isExpanded = expandedSections.includes(section.id);
                  const isActive = activeSection === section.id || section.subsections?.some(sub => sub.id === activeSection);
                  
                  return (
                    <div key={section.id}>
                      {/* القسم الرئيسي */}
                      <button
                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-amber-600 text-white' 
                            : 'bg-gray-800/60 text-amber-400 hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          if (section.id === 'reports') {
                            setActiveSection('reports-suppliers');
                            toggleSectionExpanded(section.id);
                          } else if (hasSubsections) {
                            toggleSectionExpanded(section.id);
                          } else {
                            setActiveSection(section.id);
                            setIsMobileMenuOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{section.name}</span>
                        </div>
                        {hasSubsections && (
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {/* الأقسام الفرعية */}
                      {hasSubsections && isExpanded && (
                        <div className="mt-0.5 mr-3 space-y-0.5 border-r border-amber-500/30 pr-2">
                          {section.subsections.map(subsection => {
                            const SubIcon = subsection.icon;
                            const isSubActive = activeSection === subsection.id;
                            return (
                              <button
                                key={subsection.id}
                                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-right transition-all ${
                                  isSubActive
                                    ? 'bg-amber-500 text-white'
                                    : 'text-amber-300 hover:bg-gray-700/50'
                                }`}
                                onClick={() => {
                                  setActiveSection(subsection.id);
                                  setIsMobileMenuOpen(false);
                                }}
                              >
                                <SubIcon className="h-3 w-3" />
                                <span className="text-xs">{subsection.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <main className="p-4">
          <BranchSubsectionRenderer activeSection={activeSection} branchId={branchId} setActiveSection={setActiveSection} />
        </main>
      </div>
    );
  }

  // النسخة المكتبية
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* نافذة إدخال كود الفرع */}
      {!isCodeVerified && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Building2 className="h-10 w-10 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">دخول إلى الفرع</h2>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
              <h3 className="font-bold text-lg mb-1">{(branch as any)?.name || ' - الفرع الرئيسي'}</h3>
              <p className="text-gray-600 text-sm">{(branch as any)?.address || 'جده البغداديه الشرقيه'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أدخل كود الفرع للدخول *
                </label>
                <Input
                  type="text"
                  placeholder="أدخل الكود"
                  value={branchCode}
                  onChange={(e) => {
                    setBranchCode(e.target.value);
                    setCodeError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      verifyBranchCode();
                    }
                  }}
                  className="text-center text-xl font-bold tracking-widest"
                  autoFocus
                />
                {codeError && (
                  <p className="text-red-500 text-sm mt-2 text-center">{codeError}</p>
                )}
                <p className="text-gray-500 text-xs mt-2 text-center">
                  يرجى التواصل مع المسؤول للحصول على الكود
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={verifyBranchCode}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  دخول
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* الشريط العلوي */}
      <div className="bg-black text-amber-400 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="bg-amber-600 p-2.5 rounded-full">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-extrabold">{(branch as any)?.name || 'فرع غير محدد'}</h1>
              <p className="text-sm text-amber-300">{(branch as any)?.manager || 'مدير الفرع'}</p>
            </div>
          </div>

          {/* التاريخ والوقت */}
          <div className="hidden md:flex items-center gap-4 text-center">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-amber-500/30">
              <Calendar className="h-5 w-5 text-amber-500" />
              <div className="text-right">
                <p className="text-sm font-medium text-amber-400">{formatDateTime().dateStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-amber-500/30">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-lg font-bold text-amber-400 font-mono" dir="ltr">{formatDateTime().timeStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* أزرار تكبير/تصغير الصفحة - احترافية */}
            <div className="hidden md:flex items-center bg-gray-800/50 rounded-lg border border-amber-500/20 overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={zoomLevel <= 70}
                className="text-amber-400 hover:bg-amber-500/20 h-8 w-8 p-0 rounded-none border-l border-amber-500/20"
                title="تصغير الصفحة"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <button
                onClick={resetZoom}
                className="text-amber-400 text-sm font-mono px-2 hover:bg-amber-500/10 h-8 min-w-[48px]"
                title="إعادة للوضع الافتراضي"
              >
                {zoomLevel}%
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={zoomLevel >= 150}
                className="text-amber-400 hover:bg-amber-500/20 h-8 w-8 p-0 rounded-none border-r border-amber-500/20"
                title="تكبير الصفحة"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            {/* زر تحديث النظام */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              className="text-green-400 hover:bg-green-900/50 gap-2"
              title="تحديث النظام"
              data-testid="button-refresh-system"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="hidden lg:inline">تحديث</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={shareDirectLoginLink}
              className="text-amber-400 hover:bg-amber-600/30 gap-2 border border-amber-500/50 rounded-lg"
              title="رابط الدخول المباشر الذهبي"
              data-testid="button-direct-login-desktop"
            >
              <Star className="h-5 w-5 fill-amber-400" />
              <span className="hidden lg:inline">رابط ذهبي</span>
            </Button>
          </div>
        </div>
      </div>
      {/* شريط القائمة للجوال - مربعات */}
      <div className="md:hidden bg-black border-b border-amber-500/30 p-3">
        <div className="grid grid-cols-3 gap-2">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id || section.subsections?.some(sub => sub.id === activeSection);
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-800 text-amber-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs text-center">{section.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* المحتوى والقائمة */}
      <div className="flex flex-1 overflow-hidden">
        {/* القائمة الجانبية على اليمين - للشاشات الكبيرة فقط */}
        <div className="hidden md:flex w-64 bg-black text-amber-400 flex-col">
          {/* قائمة الأقسام */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                const isExpanded = expandedSections.includes(section.id);
                const hasSubsections = section.subsections && section.subsections.length > 0;
                const isActive = activeSection === section.id || section.subsections?.some(sub => sub.id === activeSection);
                
                return (
                  <div key={section.id}>
                    {/* القسم الرئيسي */}
                    <Button
                      variant="ghost"
                      className={`w-full justify-between text-right ${
                        isActive
                          ? 'bg-amber-600 text-white hover:bg-amber-700' 
                          : 'text-amber-400 hover:bg-gray-800 hover:text-amber-300'
                      }`}
                      onClick={() => {
                        if (section.id === 'reports') {
                          setActiveSection('reports-suppliers');
                          toggleSectionExpanded(section.id);
                        } else {
                          setActiveSection(section.id);
                          if (hasSubsections) {
                            toggleSectionExpanded(section.id);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{section.name}</span>
                      </div>
                      {hasSubsections && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                    
                    {/* الأقسام الفرعية */}
                    {hasSubsections && isExpanded && (
                      <div className="mt-1 mr-6 space-y-1">
                        {section.subsections.map(subsection => {
                          const SubIcon = subsection.icon;
                          return (
                            <Button
                              key={subsection.id}
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-start text-right ${
                                activeSection === subsection.id
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'text-amber-300 hover:bg-gray-700 hover:text-amber-200'
                              }`}
                              onClick={() => setActiveSection(subsection.id)}
                            >
                              <SubIcon className="h-3 w-3 ml-2" />
                              <span className="text-xs">{subsection.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-3 md:p-6 overflow-auto bg-gray-50">
          <BranchSubsectionRenderer activeSection={activeSection} branchId={branchId} setActiveSection={setActiveSection} />
        </main>
      </div>
    </div>
  );
}