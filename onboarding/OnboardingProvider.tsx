import React, { createContext, useContext, useState, useEffect } from 'react';
import { OnboardingTooltip, TooltipStep } from './OnboardingTooltip';

// Simple localStorage hook implementation
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

interface OnboardingContextType {
  startOnboarding: (tourName: string) => void;
  isOnboardingActive: boolean;
  currentTour: string | null;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: (tourName?: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

// Predefined onboarding tours
const onboardingTours: Record<string, TooltipStep[]> = {
  dashboard: [
    {
      id: 'welcome',
      target: 'body',
      title: 'مرحباً بك في نظام المحاسب الأعظم',
      content: 'مرحباً بك في النظام المحاسبي الشامل! سنأخذك في جولة تفصيلية لتتعرف على جميع الميزات والأدوات المتاحة. هذا النظام يوفر لك إدارة متكاملة لجميع العمليات التجارية والمحاسبية.',
      position: 'center'
    },
    {
      id: 'header-section',
      target: '[data-onboarding="header"]',
      title: 'شريط الرأس العلوي',
      content: 'يحتوي شريط الرأس على اسم الشركة الديناميكي الذي يمكن تغييره من الإعدادات، بالإضافة إلى إعدادات المستخدم والإشعارات.',
      position: 'bottom'
    },
    {
      id: 'sidebar-intro',
      target: '[data-onboarding="sidebar"]',
      title: 'القائمة الجانبية الرئيسية',
      content: 'القائمة الجانبية هي مركز التحكم في النظام. تحتوي على جميع الأقسام المنظمة بشكل منطقي: لوحة التحكم، إدارة الموردين والعملاء، المنتجات والمخزون، المبيعات والمشتريات، التقارير والإعدادات.',
      position: 'right'
    },
    {
      id: 'dashboard-title',
      target: '.text-xl.sm\\:text-2xl.lg\\:text-3xl',
      title: 'عنوان لوحة التحكم',
      content: 'لوحة التحكم الرئيسية تعطيك نظرة شاملة على أداء نشاطك التجاري. من هنا يمكنك مراقبة جميع الأنشطة والإحصائيات المهمة.',
      position: 'bottom'
    },
    {
      id: 'period-selector',
      target: '.w-32',
      title: 'محدد الفترة الزمنية',
      content: 'يمكنك تغيير الفترة الزمنية لعرض البيانات (يوم، أسبوع، شهر، سنة) لتحليل الأداء في فترات مختلفة.',
      position: 'left'
    },
    {
      id: 'stats-cards',
      target: '[data-onboarding="stats-cards"]',
      title: 'بطاقات المؤشرات الرئيسية',
      content: 'هذه البطاقات تعرض أهم مؤشرات الأداء: قيمة المخزون (إجمالي قيمة البضائع المتوفرة)، العملاء النشطين (عدد العملاء الذين تم التعامل معهم)، صافي الربح (الأرباح بعد خصم التكاليف)، وإجمالي المبيعات (مجموع قيم الفواتير).',
      position: 'bottom'
    },
    {
      id: 'inventory-card',
      target: '[data-onboarding="stats-cards"] > div:first-child',
      title: 'بطاقة قيمة المخزون',
      content: 'تعرض إجمالي قيمة البضائع الموجودة في المخزون حالياً. المخزون هو أساس نشاطك التجاري ويجب مراقبته باستمرار.',
      position: 'bottom'
    },
    {
      id: 'customers-card',
      target: '[data-onboarding="stats-cards"] > div:nth-child(2)',
      title: 'بطاقة العملاء النشطين',
      content: 'تظهر عدد العملاء الذين تمت معاملتهم هذا الشهر. العملاء النشطين مؤشر مهم على نمو قاعدة العملاء.',
      position: 'bottom'
    },
    {
      id: 'profit-card',
      target: '[data-onboarding="stats-cards"] > div:nth-child(3)',
      title: 'بطاقة صافي الربح',
      content: 'تعرض صافي الربح المحقق بعد خصم جميع التكاليف. هذا المؤشر يقيس الأداء المالي الحقيقي لنشاطك.',
      position: 'bottom'
    },
    {
      id: 'sales-card',
      target: '[data-onboarding="stats-cards"] > div:nth-child(4)',
      title: 'بطاقة إجمالي المبيعات',
      content: 'تظهر إجمالي قيمة المبيعات للفترة المحددة. نمو المبيعات يشير إلى نجاح استراتيجياتك التجارية.',
      position: 'bottom'
    },
    {
      id: 'charts-section',
      target: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6',
      title: 'قسم الرسوم البيانية والتحليلات',
      content: 'هذا القسم يحتوي على رسوم بيانية تفاعلية تساعدك في تحليل الاتجاهات والأنماط في بياناتك التجارية.',
      position: 'top'
    },
    {
      id: 'monthly-comparison',
      target: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6 > div:first-child',
      title: 'مقارنة المبيعات والمشتريات الشهرية',
      content: 'هذا الرسم البياني يقارن بين المبيعات والمشتريات على مدار الأشهر، مما يساعدك في فهم دورة النقد وتخطيط المشتريات.',
      position: 'top'
    },
    {
      id: 'top-products',
      target: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6 > div:nth-child(2)',
      title: 'أفضل المنتجات مبيعاً',
      content: 'رسم دائري يعرض المنتجات الأكثر مبيعاً وحصتها من إجمالي المبيعات. يساعدك في تحديد المنتجات الرابحة والتركيز عليها.',
      position: 'top'
    },
    {
      id: 'recent-sales-section',
      target: '[data-onboarding="recent-sales"]',
      title: 'قسم المبيعات الأخيرة',
      content: 'يعرض آخر العمليات التجارية مع تفاصيل كل عملية. يمكنك متابعة النشاط اليومي ومراجعة الفواتير الأخيرة بسهولة.',
      position: 'top'
    },
    {
      id: 'navigation-tips',
      target: '[data-onboarding="sidebar"]',
      title: 'نصائح للتنقل السريع',
      content: 'يمكنك الوصول لأي قسم بنقرة واحدة من القائمة الجانبية. استخدم الموردين لإدارة المشتريات، العملاء للمبيعات، المنتجات لإدارة المخزون، والتقارير لتحليل الأداء.',
      position: 'right'
    },
    {
      id: 'completion',
      target: 'body',
      title: 'تهانينا! انتهت الجولة الإرشادية',
      content: 'لقد تعرفت على الميزات الأساسية للنظام. يمكنك الآن البدء في استخدام النظام بثقة. إذا احتجت إلى مساعدة إضافية، يمكنك تشغيل الجولة الإرشادية مرة أخرى في أي وقت.',
      position: 'center'
    }
  ],
  
  suppliers: [
    {
      id: 'suppliers-intro',
      target: '[data-onboarding="suppliers-table"]',
      title: 'نظام إدارة الموردين المتقدم',
      content: 'مرحباً بك في نظام إدارة الموردين الشامل. هذا القسم يتيح لك إدارة جميع علاقاتك التجارية مع الموردين، تتبع المدفوعات، ومراقبة أداء كل مورد.',
      position: 'top'
    },
    {
      id: 'supplier-stats',
      target: '.grid.grid-cols-1.md\\:grid-cols-4.gap-6',
      title: 'إحصائيات الموردين الرئيسية',
      content: 'هذه البطاقات تعرض ملخص شامل: إجمالي عدد الموردين، عدد الموردين النشطين، إجمالي المستحقات، وقيمة آخر المشتريات.',
      position: 'bottom'
    },
    {
      id: 'add-supplier',
      target: '[data-onboarding="add-supplier"]',
      title: 'إضافة مورد جديد',
      content: 'لإضافة مورد جديد، اضغط على هذا الزر. ستحتاج لإدخال: اسم المورد، معلومات الاتصال، الرقم الضريبي، شروط الدفع، وأي ملاحظات خاصة.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'suppliers-table',
      target: '.overflow-hidden.shadow.ring-1',
      title: 'جدول الموردين التفصيلي',
      content: 'يعرض جميع الموردين مع معلوماتهم الأساسية: الاسم، رقم الهاتف، حالة النشاط، الرصيد الافتتاحي، والرصيد الحالي. يمكنك البحث والفرز حسب أي عمود.',
      position: 'top'
    },
    {
      id: 'supplier-balance',
      target: 'th:contains("الرصيد الحالي")',
      title: 'إدارة أرصدة الموردين',
      content: 'عمود الرصيد الحالي يظهر المبالغ المستحقة لكل مورد. الأرقام الموجبة تعني مديونية لك، والسالبة تعني مبالغ مدفوعة مقدماً.',
      position: 'top'
    },
    {
      id: 'supplier-actions',
      target: '[data-onboarding="supplier-actions"]',
      title: 'إجراءات إدارة المورد',
      content: 'من هذه الأزرار يمكنك: عرض تفاصيل المورد، تعديل المعلومات، حذف المورد، أو طباعة كشف حساب المورد.',
      position: 'left'
    },
    {
      id: 'search-filter',
      target: '.relative input[placeholder*="بحث"]',
      title: 'البحث والفلترة المتقدمة',
      content: 'يمكنك البحث عن مورد معين بالاسم أو رقم الهاتف. النظام يدعم البحث الفوري والفلترة حسب حالة النشاط.',
      position: 'bottom'
    },
    {
      id: 'supplier-categories',
      target: '.text-blue-600[href*="supplier-categories"]',
      title: 'تصنيفات الموردين',
      content: 'يمكنك تنظيم الموردين في فئات (مواد غذائية، أجهزة كهربائية، ملابس، إلخ) لسهولة الإدارة والتصفية.',
      position: 'bottom'
    },
    {
      id: 'payment-vouchers',
      target: '.text-blue-600[href*="payment-vouchers"]',
      title: 'سندات دفع الموردين',
      content: 'إدارة مدفوعات الموردين من خلال إصدار سندات دفع موثقة. يمكنك تتبع جميع المدفوعات وطباعة السندات.',
      position: 'bottom'
    },
    {
      id: 'supplier-workflow',
      target: 'body',
      title: 'سير العمل مع الموردين',
      content: 'التسلسل النموذجي: 1) إضافة مورد جديد 2) إنشاء أمر شراء 3) استلام البضائع 4) إصدار فاتورة المورد 5) سداد المستحقات. النظام يربط جميع هذه العمليات تلقائياً.',
      position: 'center'
    }
  ],

  products: [
    {
      id: 'products-intro',
      target: '[data-onboarding="products-table"]',
      title: 'نظام إدارة المنتجات والمخزون',
      content: 'مرحباً بك في نظام إدارة المنتجات المتقدم. هذا القسم يتيح لك إدارة شاملة للمخزون، تتبع المنتجات، مراقبة الكميات، وإدارة الأسعار.',
      position: 'top'
    },
    {
      id: 'product-statistics',
      target: '.grid.grid-cols-1.md\\:grid-cols-4',
      title: 'إحصائيات المخزون الرئيسية',
      content: 'بطاقات الإحصائيات تعرض: إجمالي المنتجات، المنتجات النشطة، قيمة المخزون الإجمالية، والمنتجات منخفضة المخزون. هذه المؤشرات حيوية لإدارة المخزون.',
      position: 'bottom'
    },
    {
      id: 'add-product',
      target: '[data-onboarding="add-product"]',
      title: 'إضافة منتج جديد',
      content: 'لإضافة منتج جديد، أدخل: اسم المنتج، رمز المنتج (SKU)، الفئة، سعر الشراء، سعر البيع، الكمية الأولية، والحد الأدنى للتنبيه.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'product-code',
      target: 'th:contains("رمز المنتج")',
      title: 'نظام ترميز المنتجات',
      content: 'رمز المنتج (SKU) هو معرف فريد لكل منتج. استخدم نظام ترميز واضح مثل: الفئة + الرقم التسلسلي (مثال: ELC001 للإلكترونيات).',
      position: 'top'
    },
    {
      id: 'inventory-quantity',
      target: 'th:contains("الكمية المتوفرة")',
      title: 'مراقبة كميات المخزون',
      content: 'عمود الكمية المتوفرة يُحدث تلقائياً مع كل عملية بيع أو شراء. المنتجات ذات الكمية المنخفضة تظهر بلون مختلف للتنبيه.',
      position: 'top'
    },
    {
      id: 'pricing-system',
      target: 'th:contains("سعر البيع")',
      title: 'نظام التسعير المتقدم',
      content: 'يمكنك تحديد أسعار متعددة: سعر الشراء (التكلفة)، سعر البيع للعامة، سعر الجملة، وأسعار خاصة للعملاء المميزين.',
      position: 'top'
    },
    {
      id: 'product-search',
      target: '[data-onboarding="product-search"]',
      title: 'البحث والفلترة المتقدمة',
      content: 'يمكنك البحث عن منتج معين بالاسم أو رمز المنتج. النظام يدعم البحث الفوري والفلترة حسب الفئة أو حالة المخزون.',
      position: 'bottom',
      action: 'focus'
    },
    {
      id: 'product-categories',
      target: '.text-blue-600[href*="categories"]',
      title: 'تصنيف المنتجات',
      content: 'نظم منتجاتك في فئات منطقية (إلكترونيات، ملابس، أغذية، إلخ). التصنيف يسهل البحث والإدارة وإعداد التقارير.',
      position: 'bottom'
    },
    {
      id: 'barcode-system',
      target: '.text-blue-600[href*="barcode"]',
      title: 'نظام الباركود المتكامل',
      content: 'يمكنك إنشاء وطباعة باركود لكل منتج، أو مسح الباركود الموجود. هذا يسرع عمليات البيع والجرد بشكل كبير.',
      position: 'bottom'
    },
    {
      id: 'low-stock-alert',
      target: '[data-onboarding="low-stock"]',
      title: 'تنبيهات المخزون الذكية',
      content: 'النظام ينبهك تلقائياً عند انخفاض كمية أي منتج تحت الحد المحدد. يمكنك ضبط حد التنبيه لكل منتج حسب طبيعة استهلاكه.',
      position: 'right',
      isOptional: true
    },
    {
      id: 'inventory-reports',
      target: 'body',
      title: 'تقارير المخزون الشاملة',
      content: 'احصل على تقارير مفصلة: قائمة المخزون، حركة المنتجات، تحليل المبيعات لكل منتج، والمنتجات الراكدة. هذا يساعد في اتخاذ قرارات الشراء.',
      position: 'center'
    }
  ],

  sales: [
    {
      id: 'sales-intro',
      target: '[data-onboarding="sales-form"]',
      title: 'نظام إدارة المبيعات المتقدم',
      content: 'مرحباً بك في نظام المبيعات الشامل. يمكنك إنشاء فواتير مبيعات، عروض أسعار، مرتجعات مبيعات، وإدارة العملاء بكفاءة عالية.',
      position: 'center'
    },
    {
      id: 'sales-statistics',
      target: '.grid.grid-cols-1.md\\:grid-cols-4',
      title: 'مؤشرات أداء المبيعات',
      content: 'تعرض بطاقات الإحصائيات: إجمالي المبيعات، عدد الفواتير، متوسط قيمة الفاتورة، ونمو المبيعات مقارنة بالفترة السابقة.',
      position: 'bottom'
    },
    {
      id: 'select-client',
      target: '[data-onboarding="client-select"]',
      title: 'اختيار العميل والفوترة',
      content: 'ابدأ باختيار العميل من القائمة المنسدلة، أو اتركه فارغاً للبيع النقدي. يمكنك أيضاً إضافة عميل جديد مباشرة من هنا.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'product-selector',
      target: '[data-onboarding="product-selector"]',
      title: 'إضافة المنتجات للفاتورة',
      content: 'أضف المنتجات بعدة طرق: البحث بالاسم، إدخال رمز المنتج، أو مسح الباركود. يتم تحديث الأسعار والكميات تلقائياً.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'quantity-pricing',
      target: '[data-onboarding="quantity-input"]',
      title: 'إدارة الكميات والأسعار',
      content: 'يمكنك تعديل الكمية وسعر الوحدة لكل منتج. النظام يحسب الإجمالي تلقائياً ويطبق أي خصومات مُعرَّفة.',
      position: 'left'
    },
    {
      id: 'payment-method',
      target: '[data-onboarding="payment-method"]',
      title: 'طرق الدفع المتعددة',
      content: 'اختر طريقة الدفع: نقدي، بطاقة ائتمان، حوالة بنكية، أو دفع آجل. يمكن تقسيم الدفع على أكثر من طريقة.',
      position: 'bottom'
    },
    {
      id: 'invoice-totals',
      target: '[data-onboarding="invoice-totals"]',
      title: 'ملخص الفاتورة والضرائب',
      content: 'يعرض هذا القسم: المجموع الفرعي، قيمة الضريبة المضافة (15%)، أي خصومات، والإجمالي النهائي. جميع الحسابات تتم تلقائياً.',
      position: 'left'
    },
    {
      id: 'invoice-actions',
      target: '[data-onboarding="save-invoice"]',
      title: 'حفظ وطباعة الفاتورة',
      content: 'بعد اكتمال البيانات، احفظ الفاتورة. يمكنك طباعتها فوراً، إرسالها بالإيميل، أو حفظها كـ PDF. المخزون يُحدث تلقائياً.',
      position: 'bottom'
    },
    {
      id: 'sales-reports',
      target: '[data-onboarding="sales-reports"]',
      title: 'تقارير المبيعات التفصيلية',
      content: 'اطلع على تقارير شاملة: مبيعات يومية، أسبوعية، شهرية، تحليل العملاء، أداء المنتجات، وتوقعات النمو.',
      position: 'bottom'
    },
    {
      id: 'sales-workflow',
      target: 'body',
      title: 'سير العمل الكامل للمبيعات',
      content: 'العملية المتكاملة: 1) اختيار العميل 2) إضافة المنتجات 3) تطبيق خصومات 4) اختيار طريقة الدفع 5) حفظ الفاتورة 6) طباعة أو إرسال. النظام يربط كل شيء تلقائياً.',
      position: 'center'
    }
  ]
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('onboarding-completed', []);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const startOnboarding = (tourName: string) => {
    if (!onboardingTours[tourName]) {
      return;
    }
    
    // Force start regardless of completion status
    setCurrentTour(tourName);
    setCurrentStep(0);
    setIsVisible(true);
  };

  const completeOnboarding = () => {
    if (currentTour && !completedTours.includes(currentTour)) {
      setCompletedTours((prev: string[]) => [...prev, currentTour]);
    }
    setIsVisible(false);
    setCurrentTour(null);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const resetOnboarding = (tourName?: string) => {
    if (tourName) {
      setCompletedTours((prev: string[]) => prev.filter((tour: string) => tour !== tourName));
    } else {
      setCompletedTours([]);
    }
  };

  // Removed automatic onboarding start - user should trigger manually

  const handleNext = () => {
    const tour = currentTour ? onboardingTours[currentTour] : [];
    if (currentStep < tour.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setCurrentTour(null);
    setCurrentStep(0);
  };

  const contextValue: OnboardingContextType = {
    startOnboarding,
    isOnboardingActive: isVisible,
    currentTour,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };

  const currentTourSteps = currentTour ? onboardingTours[currentTour] : [];

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {isVisible && currentTourSteps.length > 0 && (
        <OnboardingTooltip
          steps={currentTourSteps}
          currentStep={currentStep}
          isVisible={isVisible}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={skipOnboarding}
          onComplete={completeOnboarding}
          onClose={handleClose}
        />
      )}
    </OnboardingContext.Provider>
  );
}