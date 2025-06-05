import { create } from 'zustand';
import { AppState, NotificationState, AppSettings } from './types';

interface AppStore extends AppState {
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showNotification: (message: string, type?: NotificationState['type']) => void;
  hideNotification: () => void;
  setUser: (user: Partial<AppState['user']>) => void;
  updateSetting: (key: keyof AppSettings, value: any) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  applySettingsEffects: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  notifications: {
    isVisible: false,
    message: '',
    type: 'info'
  },
  settings: {
    appName: 'المحاسب الأعظم',
    companyName: 'المحاسب الأعظم',
    companyEmail: 'info@almohaseb.com',
    companyPhone: '+966 11 123 4567',
    taxNumber: '300002471110003',
    address: 'الرياض، المملكة العربية السعودية',
    currency: 'ريال سعودي (ر.س)',
    fiscalYear: '2025',
    notifications: true,
    autoSave: true,
    darkMode: false,
    language: 'ar',
    sessionTimeout: 60,
    debugMode: false,
    userRegistration: false,
    emailVerification: true,
    maxUsers: 10,
    maintenanceMode: false,
    maxFileSize: 10,
    logRetention: 30,
    autoBackup: true,
    backupTime: '02:00',
    backupRetention: 30,
    twoFactor: false,
    forcePasswordChange: false,
    minPasswordLength: 8,
    maxLoginAttempts: 5
  },
  user: {
    name: 'المدير',
    email: 'admin@system.com',
    role: 'admin'
  },

  setCurrentPage: (page: string) => set({ currentPage: page }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setSidebarCollapsed: (collapsed: boolean) => set({ 
    sidebarCollapsed: collapsed 
  }),
  
  showNotification: (message: string, type: NotificationState['type'] = 'info') => {
    set({
      notifications: {
        isVisible: true,
        message,
        type
      }
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      const currentState = get();
      if (currentState.notifications.message === message) {
        set({
          notifications: {
            ...currentState.notifications,
            isVisible: false
          }
        });
      }
    }, 5000);
  },
  
  hideNotification: () => set((state) => ({
    notifications: {
      ...state.notifications,
      isVisible: false
    }
  })),
  
  setUser: (user: Partial<AppState['user']>) => set((state) => ({
    user: { ...state.user, ...user }
  })),

  updateSetting: (key: keyof AppSettings, value: any) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    }));
    
    // تطبيق التأثيرات فوراً
    const newState = get();
    const effects = newState.applySettingsEffects;
    effects();
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
    
    // تطبيق التأثيرات فوراً
    const newState = get();
    const effects = newState.applySettingsEffects;
    effects();
  },

  applySettingsEffects: () => {
    const state = get();
    const { settings } = state;
    
    // تطبيق الوضع الليلي/النهاري مع تأثيرات بصرية محسنة
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f1f5f9';
      // تطبيق الانتقال السلس
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1e293b';
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
    
    // تحديث عنوان الصفحة
    document.title = settings.appName;
    
    // تطبيق إعدادات اللغة والاتجاه
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    // تطبيق الخطوط المناسبة للغة
    if (settings.language === 'ar') {
      document.body.style.fontFamily = "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    }
    
    // تطبيق تحديث classes للغة
    if (settings.language === 'en') {
      document.body.classList.add('english-layout');
      document.body.classList.remove('arabic-layout');
    } else {
      document.body.classList.add('arabic-layout');
      document.body.classList.remove('english-layout');
    }
    
    // إعداد الحفظ التلقائي
    if (settings.autoSave) {
      // إعادة تعيين مؤقت الحفظ التلقائي
      clearInterval((window as any).autoSaveTimer);
      (window as any).autoSaveTimer = setInterval(() => {
        // حفظ تلقائي للبيانات المؤقتة
        const currentData = {
          timestamp: new Date().toISOString(),
          settings: settings,
          lastActivity: Date.now()
        };
        localStorage.setItem('autoSave_data', JSON.stringify(currentData));
        
        if (settings.notifications) {
          state.showNotification('تم الحفظ التلقائي', 'info');
        }
      }, 5 * 60 * 1000); // كل 5 دقائق
    } else {
      clearInterval((window as any).autoSaveTimer);
    }
    
    // إعداد مهلة الجلسة
    if (settings.sessionTimeout > 0) {
      clearTimeout((window as any).sessionTimer);
      (window as any).sessionTimer = setTimeout(() => {
        if (settings.notifications) {
          state.showNotification('انتهت مهلة الجلسة، يرجى تسجيل الدخول مرة أخرى', 'warning');
        }
        // إعادة توجيه لصفحة تسجيل الدخول بعد 10 ثواني
        setTimeout(() => {
          window.location.reload();
        }, 10000);
      }, settings.sessionTimeout * 60 * 1000);
    }
    
    // إعداد نظام الإشعارات المحسن
    if (settings.notifications) {
      // طلب إذن الإشعارات من المتصفح
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('المحاسب الأعظم', {
              body: 'تم تفعيل الإشعارات بنجاح',
              icon: '/favicon.ico'
            });
          }
        });
      }
      
      // تم إزالة الإشعار لتجنب التداخل
    }
    
    // حفظ الإعدادات في LocalStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // إعداد مراقب تغيير النافذة للوضع الليلي
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (!settings.darkMode) {
      // إزالة المستمع السابق إذا وجد
      if ((window as any).darkModeListener) {
        mediaQuery.removeListener((window as any).darkModeListener);
      }
      
      // إضافة مستمع جديد لتفضيلات النظام
      (window as any).darkModeListener = (e: MediaQueryListEvent) => {
        if (e.matches && !state.settings.darkMode) {
          state.showNotification('تم اكتشاف تفضيل الوضع الليلي في النظام', 'info');
        }
      };
      mediaQuery.addListener((window as any).darkModeListener);
    }
  }
}));
