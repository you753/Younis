import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setUser: setStoreUser } = useAppStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // مهم لإرسال الكوكيز
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        setStoreUser({
          name: userData.fullName || userData.username,
          email: userData.email
        });
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setStoreUser({
      name: userData.fullName || userData.username,
      email: userData.email
    });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    setStoreUser({
      name: '',
      email: ''
    });
    
    // إعادة توجيه المستخدم لصفحة تسجيل الدخول باستخدام replace
    window.location.replace('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
}