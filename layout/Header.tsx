import { Menu, Bell, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

export default function Header() {
  const { toggleSidebar, user } = useAppStore();
  const [, setLocation] = useLocation();

  // جلب إعدادات الشركة
  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any) => data?.الشركة?.companyInfo || {}
  });

  return (
    <div className="bg-black text-amber-400 shadow-lg border-b border-amber-500/30 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* الجانب الأيسر */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-amber-400 hover:bg-amber-400/10 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src={logoAlmuhasebAlaathim} 
              alt="المحاسب الأعظم" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-lg font-semibold text-amber-400">
              {companySettings?.nameArabic || 'المحاسب الأعظم'}
            </h1>
          </div>
        </div>

        {/* الجانب الأيمن */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative text-amber-400 hover:bg-amber-400/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
              3
            </span>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-amber-300">مرحباً،</p>
              <p className="font-semibold text-amber-400 text-sm">{user?.name || 'المستخدم'}</p>
            </div>
            <button 
              onClick={() => setLocation('/profile')}
              className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center text-black font-bold transition-colors"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}