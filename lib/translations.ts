export interface Translation {
  [key: string]: string | Translation;
}

export const translations = {
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    users: 'إدارة المستخدمين',
    suppliers: 'الموردين',
    clients: 'العملاء',
    products: 'الأصناف',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    inventory: 'المخزون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    employees: 'الموظفين',
    
    // Suppliers submenu
    suppliersList: 'قائمة الموردين',
    addSupplier: 'إضافة مورد',

    supplierEvaluation: 'تقييم الموردين',
    
    // Clients submenu
    clientsList: 'قائمة العملاء',
    cashClients: 'عملاء نقدي',
    clientGroups: 'مجموعات العملاء',
    clientAccounts: 'حسابات العملاء',
    
    // Products submenu
    addProduct: 'إضافة صنف',
    productCategories: 'فئات الأصناف',
    barcode: 'الباركود',
    
    // Sales submenu
    salesList: 'قائمة المبيعات',
    addSale: 'إضافة مبيعة',
    salesReturns: 'مرتجع المبيعات',
    quotes: 'عروض الأسعار',
    
    // Purchases submenu
    purchasesList: 'قائمة المشتريات',
    addPurchase: 'إضافة مشترى',
    purchaseReturns: 'مرتجع المشتريات',
    
    // Inventory submenu
    inventoryManagement: 'إدارة المخزون',
    inventoryCount: 'جرد المخزون',
    inventoryMovement: 'حركة المخزون',
    inventoryTransfer: 'نقل مخزون',
    
    // Reports submenu
    salesReports: 'تقارير المبيعات',
    purchasesReports: 'تقارير المشتريات',
    inventoryReports: 'تقارير المخزون',
    financialReports: 'التقارير المالية',
    
    // Employees submenu
    employeesList: 'قائمة الموظفين',
    deductions: 'الخصومات',
    salaries: 'الرواتب',
    taxCalculator: 'حاسبة الضرائب',
    holidays: 'الإجازات',
    
    // Settings submenu
    generalSettings: 'إعدادات عامة',
    companyInfo: 'بيانات الشركة',
    systemSettings: 'إعدادات النظام',
    backup: 'النسخ الاحتياطي',
    security: 'الأمان',
    
    // TopBar
    welcomeMessage: 'مرحباً بك في بوابة سوق البدو ✨',
    searchPlaceholder: 'البحث في النظام...',
    systemRunning: 'النظام يعمل بشكل طبيعي',
    adminUser: 'المدير العام',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    systemVersion: 'نسخة النظام: 2.1.0',
    lastUpdate: 'آخر تحديث: اليوم',
    timezone: 'المنطقة الزمنية: GMT+3',
    currency: 'العملة: ريال سعودي',
    
    // Settings page
    settingsTitle: 'إعدادات النظام',
    settingsDescription: 'إعدادات أساسية لتشغيل النظام',
    appName: 'اسم التطبيق',
    systemVersionLabel: 'إصدار النظام',
    notifications: 'تفعيل الإشعارات',
    notificationsDesc: 'استقبال إشعارات النظام',
    autoSave: 'الحفظ التلقائي',
    autoSaveDesc: 'حفظ البيانات تلقائياً كل 5 دقائق',
    darkMode: 'الوضع الليلي',
    darkModeDesc: 'تغيير مظهر النظام للوضع الداكن مع انتقال سلس',
    sessionTimeout: 'مهلة الجلسة (بالدقائق)',
    sessionTimeoutDesc: 'مدة عدم النشاط قبل انتهاء الجلسة',
    systemLanguage: 'لغة النظام',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    settingsSaved: 'تم حفظ الإعدادات',
    settingsSavedDesc: 'تم حفظ جميع الإعدادات وتطبيقها على النظام',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    print: 'طباعة',
    
    // Dashboard
    totalClients: 'إجمالي العملاء',
    totalSales: 'إجمالي المبيعات',
    totalPurchases: 'إجمالي المشتريات',
    inventoryValue: 'قيمة المخزون',
    
    // Notifications
    lowStock: 'تحذير: مخزون منخفض',
    lowStockMessage: 'المنتج "{product}" وصل لحد الحد الأدنى ({quantity} متبقي)',
    lowSales: 'تنبيه: مبيعات منخفضة',
    lowSalesMessage: 'مبيعات اليوم ({amount} ر.س) أقل من المتوقع',
    financialLoss: 'تحذير: خسائر مالية',
    financialLossMessage: 'إجمالي الخسائر: {amount} ر.س',
    dailyStart: 'بداية يوم عمل جديد',
    dailyStartMessage: 'تحقق من المهام اليومية والتقارير',
    dailyEnd: 'نهاية يوم العمل',
    dailyEndMessage: 'راجع تقرير المبيعات اليومي وأغلق الصندوق',
    autoSaveSuccess: 'تم الحفظ التلقائي',
    sessionExpired: 'انتهت مهلة الجلسة، يرجى تسجيل الدخول مرة أخرى',
    settingsApplied: 'تم تطبيق الإعدادات بنجاح',
    notificationsEnabled: 'تم تفعيل الإشعارات بنجاح',
    
    // Time
    today: 'اليوم',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام',
  },
  
  en: {
    // Navigation
    dashboard: 'Dashboard',
    users: 'User Management',
    suppliers: 'Suppliers',
    clients: 'Clients',
    products: 'Products',
    sales: 'Sales',
    purchases: 'Purchases',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    employees: 'Employees',
    
    // Suppliers submenu
    suppliersList: 'Suppliers List',
    addSupplier: 'Add Supplier',
    supplierCategories: 'Supplier Categories',
    supplierEvaluation: 'Supplier Evaluation',
    
    // Clients submenu
    clientsList: 'Clients List',
    cashClients: 'Cash Clients',
    clientGroups: 'Client Groups',
    clientAccounts: 'Client Accounts',
    
    // Products submenu
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    productCategories: 'Product Categories',
    barcode: 'Barcode',
    
    // Sales submenu
    salesList: 'Sales List',
    addSale: 'Add Sale',
    salesReturns: 'Sales Returns',
    quotes: 'Quotes',
    
    // Purchases submenu
    purchasesList: 'Purchases List',
    addPurchase: 'Add Purchase',
    purchaseReturns: 'Purchase Returns',
    
    // Inventory submenu
    inventoryManagement: 'Inventory Management',
    inventoryCount: 'Inventory Count',
    inventoryMovement: 'Inventory Movement',
    inventoryTransfer: 'Inventory Transfer',
    
    // Reports submenu
    salesReports: 'Sales Reports',
    purchasesReports: 'Purchases Reports',
    inventoryReports: 'Inventory Reports',
    financialReports: 'Financial Reports',
    
    // Employees submenu
    employeesList: 'Employees List',
    deductions: 'Deductions',
    salaries: 'Salaries',
    taxCalculator: 'Tax Calculator',
    holidays: 'Holidays',
    
    // Settings submenu
    generalSettings: 'General Settings',
    companyInfo: 'Company Info',
    systemSettings: 'System Settings',
    backup: 'Backup',
    security: 'Security',
    
    // TopBar
    welcomeMessage: 'Welcome to Al-Mohaseb Al-Azam ✨',
    searchPlaceholder: 'Search in system...',
    systemRunning: 'System Running Normally',
    adminUser: 'Administrator',
    profile: 'Profile',
    logout: 'Logout',
    systemVersion: 'System Version: 2.1.0',
    lastUpdate: 'Last Update: Today',
    timezone: 'Timezone: GMT+3',
    currency: 'Currency: Saudi Riyal',
    
    // Settings page
    settingsTitle: 'System Settings',
    settingsDescription: 'Basic settings for system operation',
    appName: 'Application Name',
    systemVersionLabel: 'System Version',
    notifications: 'Enable Notifications',
    notificationsDesc: 'Receive system notifications',
    autoSave: 'Auto Save',
    autoSaveDesc: 'Save data automatically every 5 minutes',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Change system appearance to dark mode with smooth transition',
    sessionTimeout: 'Session Timeout (minutes)',
    sessionTimeoutDesc: 'Inactivity duration before session expires',
    systemLanguage: 'System Language',
    save: 'Save',
    saving: 'Saving...',
    settingsSaved: 'Settings Saved',
    settingsSavedDesc: 'All settings have been saved and applied to the system',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    
    // Dashboard
    totalClients: 'Total Clients',
    totalSales: 'Total Sales',
    totalPurchases: 'Total Purchases',
    inventoryValue: 'Inventory Value',
    
    // Notifications
    lowStock: 'Warning: Low Stock',
    lowStockMessage: 'Product "{product}" reached minimum level ({quantity} remaining)',
    lowSales: 'Alert: Low Sales',
    lowSalesMessage: 'Today\'s sales ({amount} SAR) are below expected',
    financialLoss: 'Warning: Financial Loss',
    financialLossMessage: 'Total losses: {amount} SAR',
    dailyStart: 'New Work Day Started',
    dailyStartMessage: 'Check daily tasks and reports',
    dailyEnd: 'Work Day Ended',
    dailyEndMessage: 'Review daily sales report and close cash register',
    autoSaveSuccess: 'Auto Save Successful',
    sessionExpired: 'Session expired, please login again',
    settingsApplied: 'Settings applied successfully',
    notificationsEnabled: 'Notifications enabled successfully',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
  }
};

export function getTranslation(key: string, language: 'ar' | 'en' = 'ar', params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Arabic if English translation not found
      value = translations.ar;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters in translation
  if (params) {
    Object.entries(params).forEach(([param, replacement]) => {
      value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement);
    });
  }
  
  return value;
}

export function useTranslation() {
  const { settings } = useAppStore();
  const language = settings.language as 'ar' | 'en';
  
  const t = (key: string, params?: Record<string, string>) => {
    return getTranslation(key, language, params);
  };
  
  return { t, language };
}

// Import useAppStore
import { useAppStore } from '@/lib/store';