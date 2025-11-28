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
        // إذا لم يكن هناك مستخدم مسجل، لا تقم بتسجيل دخول تلقائي
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // في حالة خطأ في الشبكة، لا تقم بتسجيل دخول تلقائي
      console.log('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
    
    // توقف عن التحميل في جميع الحالات
    setIsLoading(false);
  };

  const autoLoginDemoUser = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'YOUNIS1234',
          password: 'Aa123456'
        }),
      });

      if (loginResponse.ok) {
        const userData = await loginResponse.json();
        setUser(userData);
        setIsAuthenticated(true);
        setStoreUser({
          name: userData.fullName || userData.username,
          email: userData.email || 'demo@example.com'
        });
      } else {
        // إذا فشل تسجيل الدخول التلقائي، قم بإنشاء مستخدم تجريبي في الذاكرة
        const demoUser = {
          id: 1,
          username: 'YOUNIS1234',
          email: 'demo@example.com',
          fullName: 'يونس عبد الرحمن',
          role: 'admin'
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        setStoreUser({
          name: demoUser.fullName,
          email: demoUser.email
        });
      }
    } catch (error) {
      console.log('Auto-login failed, creating demo session:', error);
      // إنشاء جلسة تجريبية مؤقتة
      const demoUser = {
        id: 1,
        username: 'YOUNIS1234',
        email: 'demo@example.com',
        fullName: 'يونس عبد الرحمن',
        role: 'admin'
      };
      setUser(demoUser);
      setIsAuthenticated(true);
      setStoreUser({
        name: demoUser.fullName,
        email: demoUser.email
      });
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setStoreUser({
      name: userData.fullName || userData.username,
      email: userData.email
    });
    
    // إعادة تحميل الصفحة للتأكد من انتقال للنظام
    setTimeout(() => {
      window.location.reload();
    }, 500);
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
    
    // تنظيف متغيرات الدخول المباشر للفروع
    localStorage.removeItem('directBranchAccess');
    localStorage.removeItem('directBranchId');
    
    setUser(null);
    setIsAuthenticated(false);
    setStoreUser({
      name: '',
      email: ''
    });
    
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
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