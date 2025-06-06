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
      content: 'سنقوم بجولة سريعة لتعريفك على أهم ميزات النظام وكيفية استخدامها بفعالية.',
      position: 'center'
    },
    {
      id: 'sidebar',
      target: '[data-onboarding="sidebar"]',
      title: 'القائمة الجانبية',
      content: 'من هنا يمكنك الوصول إلى جميع أقسام النظام: الموردين، العملاء، المنتجات، المبيعات والمشتريات.',
      position: 'left'
    },
    {
      id: 'stats-cards',
      target: '[data-onboarding="stats-cards"]',
      title: 'بطاقات الإحصائيات',
      content: 'هذه البطاقات تعرض ملخص سريع لأهم الأرقام في نشاطك التجاري.',
      position: 'bottom'
    },
    {
      id: 'recent-sales',
      target: '[data-onboarding="recent-sales"]',
      title: 'المبيعات الأخيرة',
      content: 'يمكنك مراجعة آخر المبيعات وحالة الطلبات من هذا القسم.',
      position: 'top'
    },
    {
      id: 'add-sale-button',
      target: '[data-onboarding="add-sale"]',
      title: 'إضافة مبيعة جديدة',
      content: 'اضغط هنا لبدء عملية بيع جديدة وإصدار فاتورة للعميل.',
      position: 'bottom',
      action: 'click'
    }
  ],
  
  suppliers: [
    {
      id: 'suppliers-intro',
      target: '[data-onboarding="suppliers-table"]',
      title: 'إدارة الموردين',
      content: 'هنا يمكنك إدارة جميع الموردين، إضافة موردين جدد، وتتبع المعاملات معهم.',
      position: 'top'
    },
    {
      id: 'add-supplier',
      target: '[data-onboarding="add-supplier"]',
      title: 'إضافة مورد جديد',
      content: 'اضغط هنا لإضافة مورد جديد مع تفاصيله وبيانات الاتصال.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'supplier-actions',
      target: '[data-onboarding="supplier-actions"]',
      title: 'إجراءات المورد',
      content: 'يمكنك تعديل أو حذف أو عرض تفاصيل أي مورد من هذه الأزرار.',
      position: 'left'
    }
  ],

  products: [
    {
      id: 'products-intro',
      target: '[data-onboarding="products-table"]',
      title: 'إدارة المنتجات',
      content: 'من هنا يمكنك إدارة مخزونك، إضافة منتجات جديدة، ومتابعة الكميات المتاحة.',
      position: 'top'
    },
    {
      id: 'add-product',
      target: '[data-onboarding="add-product"]',
      title: 'إضافة منتج جديد',
      content: 'أضف منتجات جديدة مع الأسعار، الباركود، والتفاصيل الأخرى.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'product-search',
      target: '[data-onboarding="product-search"]',
      title: 'البحث في المنتجات',
      content: 'استخدم هذا الحقل للبحث السريع في المنتجات بالاسم أو الكود.',
      position: 'bottom',
      action: 'focus'
    },
    {
      id: 'low-stock-alert',
      target: '[data-onboarding="low-stock"]',
      title: 'تنبيهات المخزون المنخفض',
      content: 'المنتجات المحددة باللون الأحمر تحتاج إعادة تموين - كميتها أقل من الحد الأدنى.',
      position: 'right',
      isOptional: true
    }
  ],

  sales: [
    {
      id: 'sales-intro',
      target: '[data-onboarding="sales-form"]',
      title: 'إنشاء فاتورة مبيعات',
      content: 'هذا النموذج يسمح لك بإنشاء فاتورة مبيعات جديدة بسهولة.',
      position: 'center'
    },
    {
      id: 'select-client',
      target: '[data-onboarding="client-select"]',
      title: 'اختيار العميل',
      content: 'ابدأ باختيار العميل أو اتركه فارغاً للبيع النقدي.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'add-products',
      target: '[data-onboarding="product-selector"]',
      title: 'إضافة المنتجات',
      content: 'أضف المنتجات للفاتورة عن طريق البحث أو مسح الباركود.',
      position: 'bottom',
      action: 'click'
    },
    {
      id: 'invoice-totals',
      target: '[data-onboarding="invoice-totals"]',
      title: 'إجمالي الفاتورة',
      content: 'سيتم حساب المجموع والضريبة تلقائياً بناءً على المنتجات المضافة.',
      position: 'left'
    }
  ]
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('onboarding-completed', []);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const startOnboarding = (tourName: string) => {
    if (!onboardingTours[tourName] || completedTours.includes(tourName)) {
      return;
    }
    
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