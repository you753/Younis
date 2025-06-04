import Sidebar from './Sidebar';
import Header from './Header';
import NotificationBar from '../NotificationBar';
import AIChat from '../AIChat';
import Calculator from '../Calculator';
import FinancialVoiceAssistant from '../FinancialVoiceAssistant';

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
      
      {/* الأدوات العائمة */}
      <div className="fixed right-6 bottom-6 z-50">
        <Calculator />
      </div>
      <div className="fixed left-6 bottom-6 z-50">
        <AIChat />
      </div>
      <div className="fixed left-6 bottom-20 z-50">
        <FinancialVoiceAssistant />
      </div>
    </div>
  );
}
