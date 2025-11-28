import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Eye, EyeOff, UserPlus, Shield, Building, ArrowRight } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import logoAlmuhasebAlaathim from '@assets/ChatGPT Image 7 يوليو 2025، 02_26_11 م-Photoroom_1751895605009.png';

const registerSchema = z.object({
  username: z.string().min(2, 'اسم المستخدم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون أكثر من 6 أحرف'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { success, error } = useNotification();
  const { login } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  });

  // إضافة timestamp لجعل البيانات فريدة
  const generateUniqueData = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return {
      username: `user_${timestamp}_${randomNum}`,
      email: `user_${timestamp}_${randomNum}@mohaseb.com`,
      fullName: `مستخدم جديد ${timestamp}`,
    };
  };

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...registerData } = data;
      
      // استخدام البريد الإلكتروني كما هو
      
      const uniqueData = {
        ...registerData,
        role: 'user' // تعيين دور المستخدم تلقائياً
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(uniqueData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إنشاء الحساب');
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      success('تم إنشاء الحساب والدخول بنجاح');
      login(userData);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    },
    onError: (errorMsg: Error) => {
      error(`خطأ في إنشاء الحساب: ${errorMsg.message}`);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* شعار النظام */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-4 p-2">
            <img 
              src={logoAlmuhasebAlaathim} 
              alt="المحاسب الأعظم" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المحاسب الأعظم</h1>
          <p className="text-gray-600">نظام محاسبي متكامل للشركات</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <UserPlus className="h-5 w-5 text-amber-600" />
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription>
              أدخل بياناتك لإنشاء حساب جديد في النظام
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل الاسم الكامل" 
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل اسم المستخدم" 
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="أدخل البريد الإلكتروني" 
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? 'text' : 'password'}
                              placeholder="أدخل كلمة المرور" 
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={registerMutation.isPending}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تأكيد كلمة المرور</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="أعد إدخال كلمة المرور" 
                              {...field}
                              disabled={registerMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={registerMutation.isPending}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin border border-white border-t-transparent rounded-full" />
                      جاري إنشاء الحساب...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      إنشاء حساب
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* رابط للعودة لتسجيل الدخول */}
            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-amber-600 hover:text-amber-700"
                onClick={() => setLocation('/')}
                disabled={registerMutation.isPending}
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                لديك حساب بالفعل؟ سجل دخولك هنا
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 . جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}