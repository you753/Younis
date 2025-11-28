import { useAppStore } from '@/lib/store';

export const useNotification = () => {
  const { showNotification, hideNotification, notifications } = useAppStore();

  const success = (message: string) => showNotification(message, 'success');
  const error = (message: string) => showNotification(message, 'error');
  const warning = (message: string) => showNotification(message, 'warning');
  const info = (message: string) => showNotification(message, 'info');

  return {
    success,
    error,
    warning,
    info,
    hide: hideNotification,
    state: notifications
  };
};
