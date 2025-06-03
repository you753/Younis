import { create } from 'zustand';
import { AppState, NotificationState } from './types';

interface AppStore extends AppState {
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showNotification: (message: string, type?: NotificationState['type']) => void;
  hideNotification: () => void;
  setUser: (user: Partial<AppState['user']>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  notifications: {
    isVisible: false,
    message: '',
    type: 'info'
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
  }))
}));
