import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationBar from '../NotificationBar';
import AIChat from '../AIChat';
import Calculator from '../Calculator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // إخفاء الشريط الجانبي الرئيسي عند الدخول لتطبيق الفروع
  const isBranchApp = location.startsWith('/branch-app/');
  
  if (isBranchApp) {
    // عرض تطبيق الفرع بدون الشريط الجانبي الرئيسي
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <TopBar />
          <main className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* الأدوات العائمة */}
      <div className="fixed right-6 bottom-6 z-50">
        <Calculator />
      </div>
      <div className="fixed left-6 bottom-6 z-50">
        <AIChat />
      </div>
    </div>
  );
}
