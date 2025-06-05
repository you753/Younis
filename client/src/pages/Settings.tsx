import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { 
  Building2, Phone, Mail, MapPin, CreditCard, Globe, FileText, Save, 
  Settings as SettingsIcon, Users, Shield, Database, Printer, 
  Calculator, Clock, Monitor, HardDrive, Download, Upload
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSetting, canAccessSettings, user } = useAppStore();
  const { t } = useTranslation();
  const [location] = useLocation();

  // معلومات الشركة
  const [companyInfo, setCompanyInfo] = useState({
    name: 'المحاسب الأعظم للأنظمة المالية',
    commercialRecord: '1010123456',
    taxNumber: '310123456700003',
    phone: '+966 11 234 5678',
    mobile: '+966 50 123 4567',
    email: 'info@almohasebalaazam.com',
    website: 'www.almohasebalaazam.com',
    address: 'طريق الملك فهد، الرياض 12345، المملكة العربية السعودية',
    city: 'الرياض',
    postalCode: '12345',
    country: 'المملكة العربية السعودية',
    bankName: 'البنك الأهلي السعودي',
    bankAccount: 'SA03 1000 0012 3456 7890 1234',
    iban: 'SA03 1000 0012 3456 7890 1234',
    swiftCode: 'NCBKSARI',
    capital: '10,000,000',
    currency: 'ريال سعودي',
    established: '2020',
    employees: '150+',
    branches: '5',
    description: 'شركة رائدة في مجال الأنظمة المحاسبية والمالية، نقدم حلولاً متكاملة للشركات والمؤسسات لإدارة أعمالها المالية بكفاءة عالية.'
  });

  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useState({
    enableMaintenance: false,
    debugMode: false,
    performanceMode: true,
    cacheEnabled: true,
    logLevel: 'info',
    maxUsers: 100,
    sessionTimeout: 60,
    autoUpdate: true,
    backupFrequency: 'daily',
    dataRetention: 365
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordPolicy: true,
    loginAttempts: 3,
    sessionSecurity: true,
    encryptionEnabled: true,
    auditLog: true,
    ipWhitelist: false,
    sslRequired: true
  });

  // إعدادات الطباعة
  const [printSettings, setPrintSettings] = useState({
    defaultPrinter: 'system',
    paperSize: 'A4',
    orientation: 'portrait',
    margins: '2cm',
    logoPosition: 'top-right',
    footerText: 'تم الإنشاء بواسطة المحاسب الأعظم',
    printColors: true,
    watermark: false
  });

  // تحديد التبويب النشط بناءً على URL
  const getActiveTab = () => {
    if (location.includes('/company')) return 'company';
    if (location.includes('/users')) return 'users';
    if (location.includes('/system')) return 'system';
    if (location.includes('/security')) return 'security';
    if (location.includes('/backup')) return 'backup';
    if (location.includes('/printing')) return 'printing';
    if (location.includes('/taxes')) return 'taxes';
    return 'general';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      updateSetting('companyName', value);
    }
  };

  const handleSystemSettingsChange = (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingsChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePrintSettingsChange = (field: string, value: any) => {
    setPrintSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('printSettings', JSON.stringify(printSettings));
    alert('تم حفظ جميع الإعدادات بنجاح');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">الإعدادات</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">إدارة وتخصيص إعدادات النظام</p>
        </div>
        <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          حفظ جميع الإعدادات
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${canAccessSettings('system') ? 'grid-cols-4 lg:grid-cols-8' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {canAccessSettings('general') && (
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              عام
            </TabsTrigger>
          )}
          {canAccessSettings('company') && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              الشركة
            </TabsTrigger>
          )}
          {canAccessSettings('users') && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
          )}
          {canAccessSettings('system') && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              النظام
            </TabsTrigger>
          )}

          {canAccessSettings('backup') && (
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              النسخ الاحتياطي
            </TabsTrigger>
          )}
          {canAccessSettings('printing') && (
            <TabsTrigger value="printing" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              الطباعة
            </TabsTrigger>
          )}
          {canAccessSettings('taxes') && (
            <TabsTrigger value="taxes" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              الضرائب
            </TabsTrigger>
          )}
        </TabsList>

        {/* الإعدادات العامة */}
        {canAccessSettings('general') && (
          <TabsContent value="general" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">الإعدادات العامة</CardTitle>
              <CardDescription>الإعدادات الأساسية للنظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName" className="text-sm font-medium">اسم التطبيق</Label>
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-md text-slate-700 dark:text-slate-300">
                  {settings.appName}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">اسم التطبيق ثابت ولا يمكن تغييره</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">لغة النظام</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode" className="text-sm font-medium">الوضع الليلي</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">تفعيل المظهر الداكن للنظام</div>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium">الإشعارات</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">تفعيل إشعارات النظام</div>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave" className="text-sm font-medium">الحفظ التلقائي</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">حفظ البيانات تلقائياً كل 5 دقائق</div>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* معلومات الشركة */}
        {canAccessSettings('company') && (
          <TabsContent value="company" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معلومات الشركة
              </CardTitle>
              <CardDescription>إدارة وتحديث معلومات الشركة والبيانات الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* المعلومات الأساسية */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">المعلومات الأساسية</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">اسم الشركة</Label>
                    <Input
                      id="companyName"
                      value={companyInfo.name}
                      onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commercialRecord">السجل التجاري</Label>
                    <Input
                      id="commercialRecord"
                      value={companyInfo.commercialRecord}
                      onChange={(e) => handleCompanyInfoChange('commercialRecord', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                    <Input
                      id="taxNumber"
                      value={companyInfo.taxNumber}
                      onChange={(e) => handleCompanyInfoChange('taxNumber', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="established">سنة التأسيس</Label>
                    <Input
                      id="established"
                      value={companyInfo.established}
                      onChange={(e) => handleCompanyInfoChange('established', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف الشركة</Label>
                  <Textarea
                    id="description"
                    value={companyInfo.description}
                    onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* معلومات الاتصال */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">معلومات الاتصال</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">الهاتف الثابت</Label>
                    <Input
                      id="phone"
                      value={companyInfo.phone}
                      onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">الهاتف المحمول</Label>
                    <Input
                      id="mobile"
                      value={companyInfo.mobile}
                      onChange={(e) => handleCompanyInfoChange('mobile', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={companyInfo.website}
                      onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* المعلومات المصرفية */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">المعلومات المصرفية</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">اسم البنك</Label>
                    <Input
                      id="bankName"
                      value={companyInfo.bankName}
                      onChange={(e) => handleCompanyInfoChange('bankName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iban">رقم IBAN</Label>
                    <Input
                      id="iban"
                      value={companyInfo.iban}
                      onChange={(e) => handleCompanyInfoChange('iban', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* إعدادات المستخدمين */}
        {canAccessSettings('users') && (
          <TabsContent value="users" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Users className="h-5 w-5" />
                إعدادات المستخدمين
              </CardTitle>
              <CardDescription>إدارة صلاحيات وإعدادات المستخدمين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">إحصائيات المستخدمين</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">إجمالي المستخدمين:</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300 mr-2">5</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">المستخدمين النشطين:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400 mr-2">3</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">الإعدادات الأساسية</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">تسجيل نشاط المستخدمين</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">تتبع عمليات تسجيل الدخول والخروج</p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">إشعارات النظام</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">إرسال تنبيهات للمستخدمين</p>
                    </div>
                    <Switch checked={settings.notifications} onCheckedChange={(checked) => updateSetting('notifications', checked)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* إعدادات النظام */}
        {canAccessSettings('system') && (
          <TabsContent value="system" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>إعدادات الأداء والصيانة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode" className="text-sm font-medium">وضع الصيانة</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">تعطيل النظام مؤقتاً للصيانة</div>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debugMode" className="text-sm font-medium">وضع التشخيص</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">تفعيل سجلات التشخيص التفصيلية</div>
                </div>
                <Switch
                  id="debugMode"
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="performanceMode" className="text-sm font-medium">الوضع عالي الأداء</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">تحسين الأداء للأنظمة القوية</div>
                </div>
                <Switch
                  id="performanceMode"
                  checked={systemSettings.performanceMode}
                  onCheckedChange={(checked) => handleSystemSettingsChange('performanceMode', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">الحد الأقصى لحجم الملف (MB)</Label>
                <Select 
                  value={settings.maxFileSize.toString()} 
                  onValueChange={(value) => updateSetting('maxFileSize', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="25">25 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}



        {/* النسخ الاحتياطي */}
        {canAccessSettings('backup') && (
          <TabsContent value="backup" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Database className="h-5 w-5" />
                النسخ الاحتياطي
              </CardTitle>
              <CardDescription>إدارة النسخ الاحتياطية واستعادة البيانات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup" className="text-sm font-medium">النسخ الاحتياطي التلقائي</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">إنشاء نسخ احتياطية تلقائية</div>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupTime">وقت النسخ الاحتياطي</Label>
                <Input
                  id="backupTime"
                  type="time"
                  value={settings.backupTime}
                  onChange={(e) => updateSetting('backupTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">مدة الاحتفاظ بالنسخ (يوم)</Label>
                <Select 
                  value={settings.backupRetention.toString()} 
                  onValueChange={(value) => updateSetting('backupRetention', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">أسبوع واحد</SelectItem>
                    <SelectItem value="30">شهر واحد</SelectItem>
                    <SelectItem value="90">3 أشهر</SelectItem>
                    <SelectItem value="365">سنة واحدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  إنشاء نسخة احتياطية الآن
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  استعادة من نسخة احتياطية
                </Button>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* إعدادات الطباعة */}
        {canAccessSettings('printing') && (
          <TabsContent value="printing" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Printer className="h-5 w-5" />
                إعدادات الطباعة
              </CardTitle>
              <CardDescription>تخصيص إعدادات الطباعة والتقارير</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="paperSize">حجم الورق</Label>
                <Select value={printSettings.paperSize} onValueChange={(value) => handlePrintSettingsChange('paperSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">اتجاه الطباعة</Label>
                <Select value={printSettings.orientation} onValueChange={(value) => handlePrintSettingsChange('orientation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">عمودي</SelectItem>
                    <SelectItem value="landscape">أفقي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">نص تذييل الصفحة</Label>
                <Input
                  id="footerText"
                  value={printSettings.footerText}
                  onChange={(e) => handlePrintSettingsChange('footerText', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="printColors" className="text-sm font-medium">الطباعة الملونة</Label>
                  <div className="text-xs text-slate-500 dark:text-slate-400">استخدام الألوان في الطباعة</div>
                </div>
                <Switch
                  id="printColors"
                  checked={printSettings.printColors}
                  onCheckedChange={(checked) => handlePrintSettingsChange('printColors', checked)}
                />
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* إعدادات الضرائب */}
        {canAccessSettings('taxes') && (
          <TabsContent value="taxes" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                إعدادات الضرائب
              </CardTitle>
              <CardDescription>تكوين نظام الضرائب والرسوم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vatRate">معدل ضريبة القيمة المضافة (%)</Label>
                <Input
                  id="vatRate"
                  type="number"
                  defaultValue="15"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">الرقم الضريبي للشركة</Label>
                <Input
                  id="taxNumber"
                  value={settings.taxNumber}
                  onChange={(e) => updateSetting('taxNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear">السنة المالية</Label>
                <Select value={settings.fiscalYear} onValueChange={(value) => updateSetting('fiscalYear', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">العملة الأساسية</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ريال سعودي (ر.س)">ريال سعودي (ر.س)</SelectItem>
                    <SelectItem value="درهم إماراتي (د.إ)">درهم إماراتي (د.إ)</SelectItem>
                    <SelectItem value="دولار أمريكي ($)">دولار أمريكي ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}