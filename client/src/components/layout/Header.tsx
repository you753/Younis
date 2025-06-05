import { Menu, Bell, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { toggleSidebar, user } = useAppStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-1 sm:p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            المحاسب الأعظم
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="relative p-1 sm:p-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center text-[10px] sm:text-xs">
              3
            </span>
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-600">مرحباً،</p>
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(var(--accounting-primary))] rounded-full flex items-center justify-center text-white font-semibold">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
