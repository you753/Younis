import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  
  const { data: user } = useQuery<{
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    role: string;
    avatar?: string;
    phone?: string;
    address?: string;
    bio?: string;
    profession?: string;
  }>({
    queryKey: ['/api/auth/me'],
  });

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const displayName = user?.fullName || user?.username || 'المستخدم';
  const displayEmail = user?.email || 'admin@company.com';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="p-6 space-y-4">
          {/* User Avatar and Info */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-16 w-16" data-testid="avatar-user">
              <AvatarImage 
                src={user?.avatar} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-amber-500 text-white text-lg font-semibold">
                {user?.fullName ? getInitials(user.fullName) : 
                 user?.username ? getInitials(user.username) : 'UN'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white" data-testid="text-username">
                {displayName}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400" data-testid="text-email">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setLocation('/settings')}
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
