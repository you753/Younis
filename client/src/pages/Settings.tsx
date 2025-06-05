import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Save, Database, Building, Users, Lock, HardDrive } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { setCurrentPage } = useAppStore();
  const [location] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    appName: 'المحاسب الأعظم',
    companyName: 'المحاسب الأعظم',
    companyEmail: 'info@almohaseb.com',
    companyPhone: '+966 11 123 4567',
    taxNumber: '300002471110003',
    address: 'الرياض، المملكة العربية السعودية',
    currency: 'ريال سعودي (ر.س)',
    fiscalYear: '2025',
    notifications: true,
    autoSave: true,
    userRegistration: false,
    emailVerification: true,
    sessionTimeout: 60,
    maxUsers: 10,
    debugMode: false,
    maintenanceMode: false,
    maxFileSize: 10,
    logRetention: 30,
    autoBackup: true,
    backupTime: '02:00',
    backupRetention: 30,
    twoFactor: false,
    forcePasswordChange: false,
    minPasswordLength: 8,
    maxLoginAttempts: 5
  });

  useEffect(() => {
    setCurrentPage('إعدادات النظام');
  }, [setCurrentPage]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // محاكاة حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ جميع الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء حفظ الإعدادات. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // معالجة المحتوى بناء على المسار
  const getCurrentSection = () => {
    if (location.includes('/settings/company')) return 'company';
    if (location.includes('/settings/users')) return 'users';
    if (location.includes('/settings/system')) return 'system';
    if (location.includes('/settings/backup')) return 'backup';
    if (location.includes('/settings/security')) return 'security';
    return 'general';
  };

  const currentSection = getCurrentSection();

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>إعدادات أساسية لتشغيل النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appName">اسم التطبيق</Label>
              <Input 
                id="appName" 
                value={settings.appName}
                onChange={(e) => handleSettingChange('appName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="version">إصدار النظام</Label>
              <Input id="version" defaultValue="1.0.0" readOnly />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">تفعيل الإشعارات</Label>
              <p className="text-sm text-gray-500">استقبال إشعارات النظام</p>
            </div>
            <Switch 
              id="notifications" 
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSave">الحفظ التلقائي</Label>
              <p className="text-sm text-gray-500">حفظ البيانات تلقائياً كل 5 دقائق</p>
            </div>
            <Switch 
              id="autoSave" 
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            معلومات الشركة
          </CardTitle>
          <CardDescription>بيانات الشركة الأساسية والتجارية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input id="companyName" defaultValue="المحاسب الأعظم" />
            </div>
            <div>
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input id="companyEmail" type="email" defaultValue="info@almohaseb.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyPhone">رقم الهاتف</Label>
              <Input id="companyPhone" defaultValue="+966 11 123 4567" />
            </div>
            <div>
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input id="taxNumber" defaultValue="300002471110003" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input id="address" defaultValue="الرياض، المملكة العربية السعودية" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">العملة الافتراضية</Label>
              <Input id="currency" defaultValue="ريال سعودي (ر.س)" />
            </div>
            <div>
              <Label htmlFor="fiscalYear">السنة المالية</Label>
              <Input id="fiscalYear" defaultValue="2025" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إعدادات المستخدمين
          </CardTitle>
          <CardDescription>إدارة صلاحيات وإعدادات المستخدمين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="userRegistration">تسجيل مستخدمين جدد</Label>
              <p className="text-sm text-gray-500">السماح بإنشاء حسابات جديدة</p>
            </div>
            <Switch id="userRegistration" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailVerification">تأكيد البريد الإلكتروني</Label>
              <p className="text-sm text-gray-500">إجبار المستخدمين على تأكيد البريد</p>
            </div>
            <Switch id="emailVerification" defaultChecked />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">انتهاء الجلسة (بالدقائق)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" />
            </div>
            <div>
              <Label htmlFor="maxUsers">الحد الأقصى للمستخدمين</Label>
              <Input id="maxUsers" type="number" defaultValue="10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            إعدادات النظام
          </CardTitle>
          <CardDescription>إعدادات تقنية ومتقدمة للنظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="debugMode">وضع التطوير</Label>
              <p className="text-sm text-gray-500">تفعيل سجلات التطوير المفصلة</p>
            </div>
            <Switch id="debugMode" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
              <p className="text-sm text-gray-500">تعطيل النظام مؤقتاً للصيانة</p>
            </div>
            <Switch id="maintenanceMode" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxFileSize">الحد الأقصى لحجم الملف (MB)</Label>
              <Input id="maxFileSize" type="number" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="logRetention">الاحتفاظ بالسجلات (أيام)</Label>
              <Input id="logRetention" type="number" defaultValue="30" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            النسخ الاحتياطي
          </CardTitle>
          <CardDescription>إعدادات النسخ الاحتياطي والاستعادة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
              <p className="text-sm text-gray-500">إنشاء نسخة احتياطية يومياً</p>
            </div>
            <Switch id="autoBackup" defaultChecked />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupTime">وقت النسخ الاحتياطي</Label>
              <Input id="backupTime" type="time" defaultValue="02:00" />
            </div>
            <div>
              <Label htmlFor="backupRetention">الاحتفاظ بالنسخ (أيام)</Label>
              <Input id="backupRetention" type="number" defaultValue="30" />
            </div>
          </div>
          <div className="flex gap-4">
            <Button className="btn-accounting-primary">
              <Database className="ml-2 h-4 w-4" />
              إنشاء نسخة احتياطية الآن
            </Button>
            <Button variant="outline">
              <Database className="ml-2 h-4 w-4" />
              استعادة من نسخة احتياطية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            الأمان والصلاحيات
          </CardTitle>
          <CardDescription>إعدادات الأمان وحماية النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactor">المصادقة الثنائية</Label>
              <p className="text-sm text-gray-500">تفعيل المصادقة بخطوتين</p>
            </div>
            <Switch id="twoFactor" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="forcePasswordChange">تغيير كلمة المرور دورياً</Label>
              <p className="text-sm text-gray-500">إجبار المستخدمين على تغيير كلمة المرور كل 90 يوم</p>
            </div>
            <Switch id="forcePasswordChange" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPasswordLength">الحد الأدنى لطول كلمة المرور</Label>
              <Input id="minPasswordLength" type="number" defaultValue="8" />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">محاولات تسجيل الدخول</Label>
              <Input id="maxLoginAttempts" type="number" defaultValue="5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إعدادات النظام</h2>
        <p className="text-gray-600">تخصيص وإدارة إعدادات نظام المحاسبة</p>
      </div>

      {/* Settings Content based on current section */}
      {currentSection === 'general' && renderGeneralSettings()}
      {currentSection === 'company' && renderCompanySettings()}
      {currentSection === 'users' && renderUsersSettings()}
      {currentSection === 'system' && renderSystemSettings()}
      {currentSection === 'backup' && renderBackupSettings()}
      {currentSection === 'security' && renderSecuritySettings()}

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" disabled={isLoading}>إلغاء</Button>
        <Button 
          className="btn-accounting-primary" 
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          <Save className="ml-2 h-4 w-4" />
          {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}