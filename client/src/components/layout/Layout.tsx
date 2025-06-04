import Sidebar from './Sidebar';
import Header from './Header';
import NotificationBar from '../NotificationBar';
import AIChat from '../AIChat';
import Calculator from '../Calculator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <NotificationBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 mr-64">
          <Header />
          <main className="p-4">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* الأدوات العائمة في الزاوية اليسرى */}
      <div className="fixed left-6 bottom-6 z-50 flex flex-col gap-4">
        <Calculator />
        <AIChat />
      </div>
    </div>
  );
}
