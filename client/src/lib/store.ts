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
    
    // تطبيق الوضع الليلي/النهاري
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
    
    // تحديث عنوان الصفحة
    document.title = settings.appName;
    
    // تطبيق إعدادات اللغة
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    // إعداد مهلة الجلسة
    if (settings.sessionTimeout > 0) {
      // إعادة تعيين مؤقت انتهاء الجلسة
      clearTimeout((window as any).sessionTimer);
      (window as any).sessionTimer = setTimeout(() => {
        if (settings.notifications) {
          state.showNotification('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى', 'warning');
        }
      }, settings.sessionTimeout * 60 * 1000);
    }
    
    // حفظ الإعدادات في LocalStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // عرض إشعار النجاح إذا كانت الإشعارات مفعلة
    if (settings.notifications) {
      state.showNotification('تم تطبيق الإعدادات بنجاح', 'success');
    }
  }
}));
