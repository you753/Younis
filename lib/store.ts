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
  hasPermission: (permission: string) => boolean;
  canAccessSettings: (section: string) => boolean;
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
    appName: 'بوابة سوق البدو',
    companyName: 'بوابة سوق البدو',
    companyEmail: 'info@almohaseb.com',
    companyPhone: '+966 11 123 4567',
    taxNumber: '300002471110003',
    address: 'الرياض، المملكة العربية السعودية',
    currency: 'SAR',
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
    role: 'admin',
    permissions: [
      'view_dashboard',
      'manage_sales',
      'manage_purchases',
      'manage_products',
      'manage_clients',
      'manage_suppliers',
      'manage_employees',
      'view_reports',
      'manage_settings',
      'system_admin',
      'user_management',
      'backup_restore',
      'security_settings'
    ]
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
    
    // تطبيق اللغة والوضع الليلي فقط
    setTimeout(() => {
      const newState = get();
      const { settings } = newState;
      
      // تطبيق اللغة
      document.documentElement.lang = settings.language;
      document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      
      // تطبيق الوضع الليلي
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // حفظ في LocalStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }, 0);
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  applySettingsEffects: () => {
    // تم تبسيط الوظيفة لمنع المشاكل
  },

  hasPermission: (permission: string) => {
    const state = get();
    return state.user.permissions?.includes(permission) || state.user.role === 'admin';
  },

  canAccessSettings: (section: string) => {
    const state = get();
    const permissionMap: Record<string, string[]> = {
      'general': ['manage_settings'],
      'company': ['manage_settings'],
      'users': ['user_management', 'system_admin'],
      'system': ['system_admin'],
      'security': ['security_settings', 'system_admin'],
      'backup': ['backup_restore', 'system_admin'],
      'printing': ['manage_settings'],
      'taxes': ['manage_settings']
    };

    const requiredPermissions = permissionMap[section] || ['system_admin'];
    return requiredPermissions.some(permission => state.user.permissions?.includes(permission)) 
           || state.user.role === 'admin';
  }
}));
