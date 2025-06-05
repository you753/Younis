import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit3, Save, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { User as UserType } from '@shared/schema';

const profileSchema = z.object({
  username: z.string().min(2, 'اسم المستخدم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { setCurrentPage } = useAppStore();
  const { success, error } = useNotification();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentPage('الملف الشخصي');
  }, [setCurrentPage]);

  // جلب بيانات المستخدم الحالي
  const { data: currentUser, isLoading } = useQuery<UserType & { fullName?: string; phone?: string; address?: string; bio?: string }>({
    queryKey: ['/api/auth/me']
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      phone: '',
      address: '',
      bio: '',
    }
  });

  // تحديث النموذج عند تحميل بيانات المستخدم
  useEffect(() => {
    if (currentUser) {
      form.reset({
        username: currentUser.username || '',
        email: currentUser.email || '',
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      success('تم تحديث الملف الشخصي بنجاح');
      setIsEditing(false);
    },
    onError: () => {
      error('حدث خطأ أثناء تحديث الملف الشخصي');
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentUser) {
      form.reset({
        username: currentUser.username || '',
        email: currentUser.email || '',
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || '',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">مدير النظام</Badge>;
      case 'manager':
        return <Badge variant="secondary">مدير</Badge>;
      case 'accountant':
        return <Badge variant="outline">محاسب</Badge>;
      default:
        return <Badge variant="outline">مستخدم</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الملف الشخصي</h2>
          <p className="text-gray-600">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={handleEdit} className="btn-accounting-primary">
            <Edit3 className="ml-2 h-4 w-4" />
            تعديل الملف الشخصي
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              className="btn-accounting-primary"
              disabled={updateProfileMutation.isPending}
            >
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={updateProfileMutation.isPending}
            >
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الجانب الأيسر - معلومات أساسية */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="#" alt={currentUser?.username} />
                  <AvatarFallback className="text-lg font-semibold bg-accounting-primary text-white">
                    {currentUser?.fullName ? getInitials(currentUser.fullName) : 
                     currentUser?.username ? getInitials(currentUser.username) : 'UN'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{currentUser?.fullName || currentUser?.username}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                {currentUser?.role && getRoleBadge(currentUser.role)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{currentUser?.email}</span>
              </div>
              
              {currentUser?.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
              
              {currentUser?.address && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{currentUser.address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>انضم في {new Date(currentUser?.createdAt || '').toLocaleDateString('ar-SA')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الجانب الأيمن - نموذج التعديل */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>
                قم بتحديث معلوماتك الشخصية والتفاصيل الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              placeholder="أدخل اسم المستخدم"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              placeholder="أدخل الاسم الكامل"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            disabled={!isEditing}
                            placeholder="أدخل البريد الإلكتروني"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              placeholder="أدخل رقم الهاتف"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              placeholder="أدخل العنوان"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نبذة شخصية</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            disabled={!isEditing}
                            placeholder="أضف نبذة عن نفسك..."
                            className="resize-none"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* إحصائيات المستخدم */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>إحصائيات النشاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-600">العمليات المنجزة</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-sm text-gray-600">المعاملات</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">--</div>
                  <div className="text-sm text-gray-600">التقارير</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor((new Date().getTime() - new Date(currentUser?.createdAt || '').getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">يوماً في النظام</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}