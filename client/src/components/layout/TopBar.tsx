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

import { useTranslation } from '@/lib/translations';
import { useAppStore } from '@/lib/store';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t, language } = useTranslation();
  const { settings } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-l from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900 border-b border-blue-500/30 dark:border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* الترحيب والوقت */}
        <div className="flex items-center gap-6">
          <div className="text-white">
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
              {language === 'ar' ? 'مرحباً بك في المحاسب الأعظم' : 'Welcome to Al-Mohaseb Al-Azam'}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-blue-100 dark:text-slate-300 text-sm">{formatDate(currentTime)}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 dark:bg-cyan-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 dark:text-slate-300 text-sm font-mono">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400 dark:text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-4 pr-10 bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-600/50 text-white dark:text-slate-200 placeholder:text-blue-200 dark:placeholder:text-slate-400 focus:bg-white/20 dark:focus:bg-slate-700/50 focus:border-white/40 dark:focus:border-slate-500"
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
              className="text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/50 relative"
            >
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
              >
                0
              </Badge>
            </Button>
          </div>

          {/* حالة النظام */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-green-400 dark:bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-100 dark:text-emerald-300 text-xs font-medium">{t('systemRunning')}</span>
          </div>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/50 gap-2"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{t('adminUser')}</p>
                  <p className="text-xs text-blue-200 dark:text-slate-400">admin@company.com</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* شريط سفلي بمعلومات إضافية */}
      <div className="bg-black/10 dark:bg-slate-900/50 px-6 py-2 border-t border-white/10 dark:border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-emerald-100 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>{t('systemVersion')}</span>
            <span>•</span>
            <span>{t('lastUpdate')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{t('timezone')}</span>
            <span>•</span>
            <span>{t('currency')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}