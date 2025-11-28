import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, LogIn, Building2, Store, Star } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface BranchLoginProps {
  branchId: number;
}

export default function BranchLogin({ branchId }: BranchLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { success, error } = useNotification();
  const { login, isAuthenticated } = useAuth();

  const { data: branchInfo } = useQuery({
    queryKey: ['/api/branches', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/branches/${branchId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!branchId
  });

  useEffect(() => {
    if (isAuthenticated) {
      // حفظ أن المستخدم دخل من الرابط المباشر
      localStorage.setItem('directBranchAccess', 'true');
      localStorage.setItem('directBranchId', branchId.toString());
      setLocation(`/standalone-branch/${branchId}`);
    }
  }, [isAuthenticated, branchId, setLocation]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تسجيل الدخول');
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      success('تم تسجيل الدخول بنجاح');
      // حفظ أن المستخدم دخل من الرابط المباشر
      localStorage.setItem('directBranchAccess', 'true');
      localStorage.setItem('directBranchId', branchId.toString());
      login(userData);
      setTimeout(() => {
        setLocation(`/standalone-branch/${branchId}`);
        window.location.href = `/standalone-branch/${branchId}`;
      }, 500);
    },
    onError: (errorMsg: Error) => {
      error(`خطأ في تسجيل الدخول: ${errorMsg.message}`);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">جاري التوجيه إلى نظام الفرع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/30 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية ذهبية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* شعار النظام */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {/* إطار ذهبي زخرفي */}
            <div className="absolute -inset-6 border-4 border-amber-500/50 rounded-full animate-spin-slow"></div>
            <div className="absolute -inset-4 border-2 border-amber-400/30 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full p-5 w-24 h-24 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Store className="w-12 h-12 text-gray-900" />
            </div>
            {/* نجوم زخرفية */}
            <Star className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <Star className="absolute -bottom-1 -left-3 w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse delay-500" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
            نظام الفروع
          </h1>
          
          {branchInfo?.name ? (
            <div className="flex items-center justify-center gap-2 text-amber-300 bg-amber-900/40 backdrop-blur-sm rounded-xl px-5 py-3 mx-auto w-fit border border-amber-500/30">
              <Building2 className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-lg">{branchInfo.name}</span>
            </div>
          ) : (
            <p className="text-amber-400/80">فرع رقم {branchId}</p>
          )}
        </div>

        {/* بطاقة تسجيل الدخول */}
        <Card className="shadow-2xl border-2 border-amber-500/30 bg-gray-900/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-amber-400">
              <LogIn className="h-5 w-5" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-amber-300/70">
              أدخل بيانات حسابك للدخول إلى نظام الفرع
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-300">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل اسم المستخدم" 
                          {...field}
                          disabled={loginMutation.isPending}
                          className="bg-gray-800/80 border-amber-500/40 text-amber-100 placeholder:text-amber-600/50 focus:border-amber-400 focus:ring-amber-400/30 h-12"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-300">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="أدخل كلمة المرور" 
                            {...field}
                            disabled={loginMutation.isPending}
                            className="bg-gray-800/80 border-amber-500/40 text-amber-100 placeholder:text-amber-600/50 focus:border-amber-400 focus:ring-amber-400/30 h-12 pl-12"
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-400 transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-bold h-14 text-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-amber-500/50"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <LogIn className="h-5 w-5" />
                      دخول إلى الفرع
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* تذييل الصفحة */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-amber-500/60">
            <Star className="w-3 h-3 fill-amber-500/60" />
            <p className="text-sm">المحاسب الأعظم - نظام إدارة الفروع</p>
            <Star className="w-3 h-3 fill-amber-500/60" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
