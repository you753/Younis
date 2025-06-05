import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Shield, 
  Database, 
  Palette,
  Save,
  RefreshCw,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useNotification } from '@/hooks/useNotification';

const settingsSchema = z.object({
  companyName: z.string().min(2, 'اسم الشركة يجب أن يكون أكثر من حرفين'),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  currency: z.string().min(1, 'العملة مطلوبة'),
  language: z.string().min(1, 'اللغة مطلوبة'),
  theme: z.string().min(1, 'المظهر مطلوب'),
  notifications: z.boolean(),
  emailNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  autoBackup: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { setCurrentPage } = useAppStore();
  const { success, error } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentPage('الإعدادات');
  }, [setCurrentPage]);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: 'شركة المحاسب الأعظم',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      taxNumber: '',
      currency: 'SAR',
      language: 'ar',
      theme: 'light',
      notifications: true,
      emailNotifications: false,
      lowStockAlerts: true,
      autoBackup: true,
    }
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      // محاكاة حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
          <p className="text-gray-600">إدارة إعدادات النظام والشركة</p>
        </div>
        
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSaving}
          className="btn-accounting-primary"
        >
          {isSaving ? (
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="ml-2 h-4 w-4" />
          )}
          حفظ الإعدادات
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            بيانات الشركة
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Monitor className="h-4 w-4" />
            النظام
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* بيانات الشركة */}
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    معلومات الشركة
                  </CardTitle>
                  <CardDescription>
                    البيانات الأساسية للشركة التي ستظهر في الفواتير والتقارير
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الشركة *</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم الشركة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرقم الضريبي</FormLabel>
                          <FormControl>
                            <Input placeholder="الرقم الضريبي" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input placeholder="رقم هاتف الشركة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input placeholder="البريد الإلكتروني للشركة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الشركة</FormLabel>
                        <FormControl>
                          <Input placeholder="العنوان الكامل للشركة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* إعدادات النظام */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    إعدادات النظام
                  </CardTitle>
                  <CardDescription>
                    تخصيص مظهر وسلوك النظام
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اللغة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر اللغة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العملة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر العملة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              <SelectItem value="EUR">يورو (EUR)</SelectItem>
                              <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المظهر</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المظهر" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">فاتح</SelectItem>
                              <SelectItem value="dark">داكن</SelectItem>
                              <SelectItem value="auto">تلقائي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* إعدادات الإشعارات */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    إعدادات الإشعارات
                  </CardTitle>
                  <CardDescription>
                    إدارة الإشعارات والتنبيهات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">الإشعارات</FormLabel>
                            <FormControl>
                              <p className="text-sm text-muted-foreground">
                                تفعيل الإشعارات العامة للنظام
                              </p>
                            </FormControl>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">إشعارات البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <p className="text-sm text-muted-foreground">
                                إرسال الإشعارات عبر البريد الإلكتروني
                              </p>
                            </FormControl>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lowStockAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">تنبيهات نفاد المخزون</FormLabel>
                            <FormControl>
                              <p className="text-sm text-muted-foreground">
                                تنبيه عند انخفاض كمية المنتجات
                              </p>
                            </FormControl>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* إعدادات الأمان */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    إعدادات الأمان والنسخ الاحتياطي
                  </CardTitle>
                  <CardDescription>
                    إدارة أمان النظام والنسخ الاحتياطي
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="autoBackup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">النسخ الاحتياطي التلقائي</FormLabel>
                          <FormControl>
                            <p className="text-sm text-muted-foreground">
                              إنشاء نسخة احتياطية يومية من البيانات
                            </p>
                          </FormControl>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">إدارة البيانات</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="gap-2">
                        <Database className="h-4 w-4" />
                        إنشاء نسخة احتياطية
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        استعادة البيانات
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </form>
        </Form>
      </Tabs>
    </div>
  );
}