import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Shield } from 'lucide-react';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

export default function SimpleLogin() {
  const [username, setUsername] = useState('YOUNIS1234');
  const [password, setPassword] = useState('Aa123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('محاولة تسجيل الدخول:', { username, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('استجابة الخادم:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('بيانات المستخدم:', userData);
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'فشل في تسجيل الدخول');
      }
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* شعار النظام */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 border-4 border-amber-500 rounded-3xl transform rotate-45 opacity-80 shadow-lg"></div>
            <div className="relative bg-black rounded-2xl p-3 w-20 h-20 flex items-center justify-center shadow-2xl">
              <img 
                src={logoAlmuhasebAlaathim} 
                alt="المحاسب الأعظم" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المحاسب الأعظم</h1>
          <p className="text-gray-600">نظام محاسبي متكامل للشركات</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-amber-600" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription>
              أدخل بيانات حسابك للدخول إلى النظام
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin border border-white border-t-transparent rounded-full" />
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-amber-600 hover:text-amber-700"
                onClick={() => setLocation('/register')}
                disabled={isLoading}
              >
                <Shield className="h-4 w-4 ml-1" />
                ليس لديك حساب؟ أنشئ حساباً جديداً
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 المحاسب الأعظم. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}