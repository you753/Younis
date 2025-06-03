import Sidebar from './Sidebar';
import Header from './Header';
import NotificationBar from '../NotificationBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <NotificationBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:mr-80">
          <Header />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
