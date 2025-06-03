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

export interface AppState {
  currentPage: string;
  sidebarCollapsed: boolean;
  notifications: NotificationState;
  user: {
    name: string;
    email: string;
    role: string;
  };
}
