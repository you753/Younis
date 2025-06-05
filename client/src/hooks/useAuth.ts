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

  const checkAuthStatus = () => {
    // التحقق من وجود بيانات المستخدم في localStorage
    const storedUser = localStorage.getItem('user');
    const authToken = localStorage.getItem('authToken');
    
    if (storedUser && authToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setStoreUser({
          name: userData.fullName || userData.username,
          email: userData.email
        });
      } catch (error) {
        // إذا كانت البيانات تالفة، امسحها
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
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
    
    // حفظ بيانات المستخدم في localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', 'authenticated'); // يمكن تطويره لاحقاً
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setStoreUser({
      name: '',
      email: ''
    });
    
    // مسح البيانات من localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
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