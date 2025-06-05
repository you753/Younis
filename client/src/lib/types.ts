export interface DashboardStats {
  totalClients: number;
  totalSales: string;
  totalPurchases: string;
  inventoryValue: string;
}

export interface SalesChartData {
  month: string;
  sales: number;
  purchases: number;
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'sale' | 'purchase' | 'product' | 'client' | 'supplier';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AppSettings {
  appName: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  taxNumber: string;
  address: string;
  currency: string;
  fiscalYear: string;
  notifications: boolean;
  autoSave: boolean;
  darkMode: boolean;
  language: string;
  sessionTimeout: number;
  debugMode: boolean;
  userRegistration: boolean;
  emailVerification: boolean;
  maxUsers: number;
  maintenanceMode: boolean;
  maxFileSize: number;
  logRetention: number;
  autoBackup: boolean;
  backupTime: string;
  backupRetention: number;
  twoFactor: boolean;
  forcePasswordChange: boolean;
  minPasswordLength: number;
  maxLoginAttempts: number;
}

export interface AppState {
  currentPage: string;
  sidebarCollapsed: boolean;
  notifications: NotificationState;
  settings: AppSettings;
  user: {
    name: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}
