import { useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { X } from 'lucide-react';

export default function NotificationBar() {
  const { state, hide } = useNotification();

  useEffect(() => {
    if (state.isVisible) {
      document.body.style.paddingTop = '60px';
    } else {
      document.body.style.paddingTop = '0';
    }

    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [state.isVisible]);

  if (!state.isVisible) return null;

  const getBackgroundColor = () => {
    switch (state.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${getBackgroundColor()} text-white py-3 px-4 shadow-lg transition-transform duration-300 ease-in-out`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-sm font-medium">{state.message}</span>
        <button
          onClick={hide}
          className="text-white hover:text-gray-200 transition-colors p-1"
          aria-label="إغلاق الإشعار"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
