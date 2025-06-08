import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    console.log('تطبيق المظهر المحلول:', resolvedTheme);
    
    if (resolvedTheme === 'dark') {
      console.log('تطبيق المظهر الداكن');
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      // Force immediate style application
      document.body.style.backgroundColor = 'hsl(222 84% 4%)';
      document.body.style.color = 'hsl(210 40% 98%)';
    } else {
      console.log('تطبيق المظهر الفاتح');
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      // Reset to light theme
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    
    console.log('كلاسات HTML:', root.classList.toString());
    console.log('كلاسات Body:', body.classList.toString());
    
    // Force re-render by triggering a small layout change
    root.style.setProperty('--theme-transition', 'all 0.3s ease');
  }, [resolvedTheme]);

  const changeTheme = (newTheme: Theme) => {
    console.log('تغيير المظهر إلى:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log('تم حفظ المظهر في localStorage:', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
  };
}