import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';

export interface SystemNotification {
  id: string;
  type: 'inventory' | 'financial' | 'sales' | 'system' | 'warning' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function useNotificationSystem() {
  const { settings, showNotification } = useAppStore();

  // استعلام البيانات للتحقق من الحالات التي تستدعي إشعارات
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: settings.notifications,
    refetchInterval: 30000, // كل 30 ثانية
  });

  const { data: sales } = useQuery({
    queryKey: ['/api/sales'],
    enabled: settings.notifications,
    refetchInterval: 60000, // كل دقيقة
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: settings.notifications,
    refetchInterval: 120000, // كل دقيقتين
  });

  // فحص المخزون المنخفض
  useEffect(() => {
    if (!settings.notifications || !products) return;

    const lowStockProducts = Array.isArray(products) ? products.filter((product: any) => 
      product.quantity <= (product.minQuantity || 5)
    ) : [];

    lowStockProducts.forEach((product: any) => {
      const notification: SystemNotification = {
        id: `low-stock-${product.id}`,
        type: 'inventory',
        title: 'تحذير: مخزون منخفض',
        message: `المنتج "${product.name}" وصل لحد الحد الأدنى (${product.quantity} متبقي)`,
        priority: product.quantity === 0 ? 'critical' : 'high',
        timestamp: new Date(),
        read: false,
        actionUrl: '/inventory'
      };

      sendNotification(notification);
    });
  }, [products, settings.notifications]);

  // فحص الخسائر والمؤشرات المالية
  useEffect(() => {
    if (!settings.notifications || !sales || !dashboardStats) return;

    // فحص إجمالي المبيعات اليومية
    const today = new Date().toISOString().split('T')[0];
    const todaySales = Array.isArray(sales) ? sales.filter((sale: any) => 
      sale.date.startsWith(today)
    ) : [];

    const todayTotal = todaySales.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.total), 0
    );

    // إشعار إذا كانت مبيعات اليوم أقل من المتوقع
    const expectedDailyTarget = 1000; // يمكن جعله قابل للتخصيص
    if (todayTotal < expectedDailyTarget * 0.5) {
      const notification: SystemNotification = {
        id: `low-sales-${today}`,
        type: 'financial',
        title: 'تنبيه: مبيعات منخفضة',
        message: `مبيعات اليوم (${todayTotal.toFixed(2)} ر.س) أقل من المتوقع`,
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        actionUrl: '/sales'
      };

      sendNotification(notification);
    }

    // فحص إجمالي الخسائر
    const totalSales = (dashboardStats as any)?.totalSales ? parseFloat((dashboardStats as any).totalSales.replace(/[^\d.-]/g, '')) : 0;
    const totalPurchases = (dashboardStats as any)?.totalPurchases ? parseFloat((dashboardStats as any).totalPurchases.replace(/[^\d.-]/g, '')) : 0;
    const profit = totalSales - totalPurchases;

    if (profit < 0) {
      const notification: SystemNotification = {
        id: `negative-profit`,
        type: 'financial',
        title: 'تحذير: خسائر مالية',
        message: `إجمالي الخسائر: ${Math.abs(profit).toFixed(2)} ر.س`,
        priority: 'critical',
        timestamp: new Date(),
        read: false,
        actionUrl: '/reports'
      };

      sendNotification(notification);
    }
  }, [sales, dashboardStats, settings.notifications]);

  // إشعارات المهام اليومية
  useEffect(() => {
    if (!settings.notifications) return;

    const now = new Date();
    const hour = now.getHours();

    // إشعار بداية اليوم
    if (hour === 9 && now.getMinutes() === 0) {
      const notification: SystemNotification = {
        id: `daily-start-${now.toDateString()}`,
        type: 'system',
        title: 'بداية يوم عمل جديد',
        message: 'تحقق من المهام اليومية والتقارير',
        priority: 'low',
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard'
      };

      sendNotification(notification);
    }

    // إشعار نهاية اليوم
    if (hour === 18 && now.getMinutes() === 0) {
      const notification: SystemNotification = {
        id: `daily-end-${now.toDateString()}`,
        type: 'system',
        title: 'نهاية يوم العمل',
        message: 'راجع تقرير المبيعات اليومي وأغلق الصندوق',
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        actionUrl: '/reports'
      };

      sendNotification(notification);
    }
  }, [settings.notifications]);

  const sendNotification = (notification: SystemNotification) => {
    // إظهار الإشعار في واجهة النظام
    const notificationType = notification.priority === 'critical' ? 'error' : 
                           notification.priority === 'high' ? 'warning' : 
                           notification.type === 'financial' ? 'warning' : 'info';
    showNotification(notification.message, notificationType);

    // إرسال إشعار المتصفح إذا كان مدعوماً ومسموحاً
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        silent: notification.priority === 'low'
      });

      // إغلاق الإشعار تلقائياً بعد 5 ثواني (إلا إذا كان حرجاً)
      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotification.close(), 5000);
      }

      // التنقل للصفحة المناسبة عند النقر
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.hash = notification.actionUrl;
        }
        browserNotification.close();
      };
    }

    // حفظ الإشعار في localStorage للمراجعة لاحقاً
    const existingNotifications = JSON.parse(
      localStorage.getItem('systemNotifications') || '[]'
    );
    
    const updatedNotifications = [
      notification,
      ...existingNotifications.slice(0, 49) // الاحتفاظ بآخر 50 إشعار
    ];
    
    localStorage.setItem('systemNotifications', JSON.stringify(updatedNotifications));
  };

  const getStoredNotifications = (): SystemNotification[] => {
    return JSON.parse(localStorage.getItem('systemNotifications') || '[]');
  };

  const markNotificationAsRead = (notificationId: string) => {
    const notifications = getStoredNotifications();
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('systemNotifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    localStorage.removeItem('systemNotifications');
  };

  return {
    sendNotification,
    getStoredNotifications,
    markNotificationAsRead,
    clearAllNotifications
  };
}