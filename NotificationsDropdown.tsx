import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  X,
  Check,
  Trash2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'low_stock':
      return <Package className="h-4 w-4 text-orange-500" />;
    case 'out_of_stock':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'loss':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case 'profit':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'new_sale':
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/30';
    case 'medium':
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/30';
    case 'low':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30';
    default:
      return 'border-l-slate-500 bg-slate-50 dark:bg-slate-950/30';
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
};

export default function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    clearReadNotifications,
    permissionGranted
  } = useNotificationSystem();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/50 relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 max-h-[500px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">الإشعارات</span>
          <div className="flex items-center gap-2">
            {!permissionGranted && (
              <Badge variant="outline" className="text-xs">
                غير مفعل
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              لا توجد إشعارات جديدة
            </p>
            <p className="text-xs text-slate-400 mt-1">
              سيتم عرض التنبيهات المهمة هنا
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-80">
              <div className="space-y-1 p-1">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                      getPriorityColor(notification.priority),
                      !notification.read && "ring-1 ring-blue-200 dark:ring-blue-800"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {notification.data && (
                          <div className="mt-2 text-xs text-slate-500">
                            {notification.type === 'low_stock' && (
                              <span>الكمية المتبقية: {notification.data.stock}</span>
                            )}
                            {notification.type === 'new_sale' && (
                              <span>المبلغ: {notification.data.amount} ر.س</span>
                            )}
                            {(notification.type === 'profit' || notification.type === 'loss') && (
                              <span>القيمة: {notification.data.profit || notification.data.loss} ر.س</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DropdownMenuSeparator />
            
            <div className="p-2 space-y-1">
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  clearReadNotifications();
                  setIsOpen(false);
                }}
              >
                <Eye className="h-4 w-4" />
                مسح المقروءة ({notifications.filter(n => n.read).length})
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
                onClick={() => {
                  clearAllNotifications();
                  setIsOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                مسح الكل ({notifications.length})
              </DropdownMenuItem>
            </div>
          </>
        )}

        {!permissionGranted && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg m-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  تفعيل الإشعارات
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                للحصول على إشعارات المتصفح، قم بالسماح للموقع بإرسال الإشعارات
              </p>
              <Button 
                size="sm" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                  setIsOpen(false);
                }}
              >
                تفعيل الإشعارات
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}