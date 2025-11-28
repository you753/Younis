import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';

interface SystemNotification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'loss' | 'profit' | 'new_sale' | 'system' | 'payment_due';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
}

interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
}

interface FinancialAlert {
  type: 'loss' | 'profit';
  amount: number;
  description: string;
  date: string;
}

export function useNotificationSystem() {
  const { settings } = useAppStore();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const lastCheckRef = useRef<Date>(new Date());

  // طلب إذن الإشعارات من المتصفح
  useEffect(() => {
    if (settings.notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setPermissionGranted(permission === 'granted');
          if (permission === 'granted') {
            showBrowserNotification('بوابة سوق البدو', 'تم تفعيل إشعارات النظام بنجاح', 'system');
          }
        });
      } else {
        setPermissionGranted(Notification.permission === 'granted');
      }
    }
  }, [settings.notifications]);

  // مراقبة المخزون
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: settings.notifications,
    refetchInterval: 30000, // كل 30 ثانية
  });

  // مراقبة المبيعات الجديدة
  const { data: sales } = useQuery({
    queryKey: ['/api/sales'],
    enabled: settings.notifications,
    refetchInterval: 15000, // كل 15 ثانية
  });

  // مراقبة البيانات المالية
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: settings.notifications,
    refetchInterval: 60000, // كل دقيقة
  });

  // فحص نفاذ المخزون
  useEffect(() => {
    if (products && Array.isArray(products) && settings.notifications) {
      const lowStockProducts = products.filter((product: any) => {
        const minStock = product.minStock || 10;
        return product.stock <= minStock && product.stock > 0;
      });

      const outOfStockProducts = products.filter((product: any) => {
        return product.stock <= 0;
      });

      // إشعارات المخزون المنخفض
      lowStockProducts.forEach((product: any) => {
        const existingNotification = notifications.find(
          n => n.type === 'low_stock' && n.data?.productId === product.id
        );

        if (!existingNotification) {
          const notification: SystemNotification = {
            id: `low_stock_${product.id}_${Date.now()}`,
            type: 'low_stock',
            title: 'تحذير: مخزون منخفض',
            message: `المنتج "${product.name}" أوشك على النفاد. الكمية المتبقية: ${product.stock}`,
            timestamp: new Date(),
            priority: 'medium',
            read: false,
            data: { productId: product.id, productName: product.name, stock: product.stock }
          };

          addNotification(notification);
          showBrowserNotification(notification.title, notification.message, 'low_stock');
        }
      });

      // إشعارات المخزون المنتهي
      outOfStockProducts.forEach((product: any) => {
        const existingNotification = notifications.find(
          n => n.type === 'out_of_stock' && n.data?.productId === product.id
        );

        if (!existingNotification) {
          const notification: SystemNotification = {
            id: `out_of_stock_${product.id}_${Date.now()}`,
            type: 'out_of_stock',
            title: 'تحذير: نفاذ المخزون',
            message: `المنتج "${product.name}" نفذ من المخزون تماماً!`,
            timestamp: new Date(),
            priority: 'high',
            read: false,
            data: { productId: product.id, productName: product.name }
          };

          addNotification(notification);
          showBrowserNotification(notification.title, notification.message, 'out_of_stock');
        }
      });
    }
  }, [products, settings.notifications]);

  // فحص المبيعات الجديدة
  useEffect(() => {
    if (sales && Array.isArray(sales) && settings.notifications) {
      const recentSales = sales.filter((sale: any) => {
        const saleDate = new Date(sale.date);
        return saleDate > lastCheckRef.current;
      });

      recentSales.forEach((sale: any) => {
        const notification: SystemNotification = {
          id: `new_sale_${sale.id}_${Date.now()}`,
          type: 'new_sale',
          title: 'مبيعة جديدة',
          message: `تم إتمام مبيعة بقيمة ${sale.total} ر.س`,
          timestamp: new Date(),
          priority: 'low',
          read: false,
          data: { saleId: sale.id, amount: sale.total }
        };

        addNotification(notification);
        showBrowserNotification(notification.title, notification.message, 'new_sale');
      });

      lastCheckRef.current = new Date();
    }
  }, [sales, settings.notifications]);

  // مراقبة الخسائر والأرباح
  useEffect(() => {
    if (dashboardStats && settings.notifications) {
      const totalSales = parseFloat((dashboardStats as any)?.totalSales || '0');
      const totalPurchases = parseFloat((dashboardStats as any)?.totalPurchases || '0');
      const profit = totalSales - totalPurchases;

      // إشعار عند تحقيق ربح كبير
      if (profit > 10000) {
        const existingNotification = notifications.find(
          n => n.type === 'profit' && new Date(n.timestamp).toDateString() === new Date().toDateString()
        );

        if (!existingNotification) {
          const notification: SystemNotification = {
            id: `profit_${Date.now()}`,
            type: 'profit',
            title: 'تحقيق أرباح ممتازة',
            message: `تم تحقيق ربح إجمالي قدره ${profit.toFixed(2)} ر.س اليوم`,
            timestamp: new Date(),
            priority: 'medium',
            read: false,
            data: { profit: profit }
          };

          addNotification(notification);
          showBrowserNotification(notification.title, notification.message, 'profit');
        }
      }

      // إشعار عند الخسائر
      if (profit < -1000) {
        const existingNotification = notifications.find(
          n => n.type === 'loss' && new Date(n.timestamp).toDateString() === new Date().toDateString()
        );

        if (!existingNotification) {
          const notification: SystemNotification = {
            id: `loss_${Date.now()}`,
            type: 'loss',
            title: 'تحذير: خسائر مالية',
            message: `تم تسجيل خسارة بقيمة ${Math.abs(profit).toFixed(2)} ر.س اليوم`,
            timestamp: new Date(),
            priority: 'high',
            read: false,
            data: { loss: Math.abs(profit) }
          };

          addNotification(notification);
          showBrowserNotification(notification.title, notification.message, 'loss');
        }
      }
    }
  }, [dashboardStats, settings.notifications]);

  // إضافة إشعار جديد
  const addNotification = (notification: SystemNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // الاحتفاظ بآخر 50 إشعار
    
    // حفظ في localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = [notification, ...savedNotifications].slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // عرض إشعار المتصفح
  const showBrowserNotification = (title: string, body: string, type: string) => {
    if (permissionGranted && settings.notifications) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type,
        requireInteraction: type === 'out_of_stock' || type === 'loss', // يتطلب تفاعل للإشعارات المهمة
        silent: false
      });

      // إغلاق الإشعار تلقائياً بعد 10 ثوان للإشعارات العادية
      if (type !== 'out_of_stock' && type !== 'loss') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      // التفاعل مع الإشعار
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // توجيه المستخدم لصفحة ذات صلة
        if (type === 'low_stock' || type === 'out_of_stock') {
          window.location.href = '/inventory';
        } else if (type === 'new_sale') {
          window.location.href = '/sales';
        } else if (type === 'loss' || type === 'profit') {
          window.location.href = '/reports/financial';
        }
      };
    }
  };

  // تحميل الإشعارات المحفوظة عند البدء
  useEffect(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(savedNotifications);
  }, []);

  // وضع علامة كمقروء
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = savedNotifications.map((n: SystemNotification) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // مسح جميع الإشعارات
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  // مسح الإشعارات المقروءة
  const clearReadNotifications = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    setNotifications(unreadNotifications);
    localStorage.setItem('notifications', JSON.stringify(unreadNotifications));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAllNotifications,
    clearReadNotifications,
    permissionGranted
  };
}