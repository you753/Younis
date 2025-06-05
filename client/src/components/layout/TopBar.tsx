import { useState, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-l from-blue-600 to-blue-800 border-b border-blue-500/30 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* الترحيب والوقت */}
        <div className="flex items-center gap-6">
          <div className="text-white">
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent">
              مرحباً بك في المحاسب الأعظم ✨
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-blue-100 text-sm">{formatDate(currentTime)}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 text-sm font-mono">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="البحث في النظام..."
              className="pl-4 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20 focus:border-white/40"
            />
          </div>
        </div>

        {/* الإشعارات وإعدادات المستخدم */}
        <div className="flex items-center gap-4">
          {/* الإشعارات */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 relative"
            >
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
              >
                3
              </Badge>
            </Button>
          </div>

          {/* حالة النظام */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-100 text-xs font-medium">النظام يعمل بشكل طبيعي</span>
          </div>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-2"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">المدير العام</p>
                  <p className="text-xs text-blue-200">admin@company.com</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* شريط سفلي بمعلومات إضافية */}
      <div className="bg-black/10 px-6 py-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-emerald-100">
          <div className="flex items-center gap-4">
            <span>نسخة النظام: 2.1.0</span>
            <span>•</span>
            <span>آخر تحديث: اليوم</span>
          </div>
          <div className="flex items-center gap-4">
            <span>المنطقة الزمنية: GMT+3</span>
            <span>•</span>
            <span>العملة: ريال سعودي</span>
          </div>
        </div>
      </div>
    </div>
  );
}