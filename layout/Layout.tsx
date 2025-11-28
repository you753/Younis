import { useLocation } from 'wouter';
import MainTopNav from './MainTopNav';
import TopBar from './TopBar';
import NotificationBar from '../NotificationBar';
import Calculator from '../Calculator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* الشريط الأسود العلوي (معلومات المستخدم) */}
      <TopBar />
      
      {/* شريط التنقل الرئيسي */}
      <MainTopNav />
      
      {/* المحتوى الرئيسي */}
      <main className="p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* الأدوات العائمة */}
      <div className="fixed right-6 bottom-6 z-50">
        <Calculator />
      </div>
    </div>
  );
}
