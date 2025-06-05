import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { Building2, Phone, Mail, MapPin, CreditCard, Globe, FileText, Save } from 'lucide-react';

export default function Settings() {
  const { settings, updateSetting } = useAppStore();
  const { t } = useTranslation();

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

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveCompanyInfo = () => {
    // حفظ معلومات الشركة في localStorage
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    alert('تم حفظ معلومات الشركة بنجاح');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t('manageSettings')}</p>
      </div>

      <div className="grid gap-6">
        {/* معلومات الشركة */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  معلومات الشركة
                </CardTitle>
                <CardDescription>إدارة وتحديث معلومات الشركة والبيانات الأساسية</CardDescription>
              </div>
              <Button onClick={saveCompanyInfo} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                حفظ التغييرات
              </Button>
            </div>
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

            {/* العنوان */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-semibold">العنوان</Label>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان الكامل</Label>
                  <Textarea
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={companyInfo.city}
                      onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">الرمز البريدي</Label>
                    <Input
                      id="postalCode"
                      value={companyInfo.postalCode}
                      onChange={(e) => handleCompanyInfoChange('postalCode', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">البلد</Label>
                    <Input
                      id="country"
                      value={companyInfo.country}
                      onChange={(e) => handleCompanyInfoChange('country', e.target.value)}
                    />
                  </div>
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
                  <Label htmlFor="swiftCode">رمز SWIFT</Label>
                  <Input
                    id="swiftCode"
                    value={companyInfo.swiftCode}
                    onChange={(e) => handleCompanyInfoChange('swiftCode', e.target.value)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">رقم الحساب البنكي</Label>
                  <Input
                    id="bankAccount"
                    value={companyInfo.bankAccount}
                    onChange={(e) => handleCompanyInfoChange('bankAccount', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* معلومات إضافية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-semibold">معلومات إضافية</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capital">رأس المال</Label>
                  <Input
                    id="capital"
                    value={companyInfo.capital}
                    onChange={(e) => handleCompanyInfoChange('capital', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Input
                    id="currency"
                    value={companyInfo.currency}
                    onChange={(e) => handleCompanyInfoChange('currency', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employees">عدد الموظفين</Label>
                  <Input
                    id="employees"
                    value={companyInfo.employees}
                    onChange={(e) => handleCompanyInfoChange('employees', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branches">عدد الفروع</Label>
                  <Input
                    id="branches"
                    value={companyInfo.branches}
                    onChange={(e) => handleCompanyInfoChange('branches', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <Label className="text-sm font-medium mb-3 block">إحصائيات الشركة</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">التأسيس</Badge>
                  <p className="text-sm font-medium">{companyInfo.established}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">الموظفين</Badge>
                  <p className="text-sm font-medium">{companyInfo.employees}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">الفروع</Badge>
                  <p className="text-sm font-medium">{companyInfo.branches}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">رأس المال</Badge>
                  <p className="text-sm font-medium">{companyInfo.capital}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الإعدادات العامة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">{t('generalSettings')}</CardTitle>
            <CardDescription>{t('generalSettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* اسم التطبيق */}
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-sm font-medium">{t('applicationName')}</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-md text-slate-700 dark:text-slate-300">
                {settings.appName}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('appNameFixed')}</p>
            </div>

            {/* لغة النظام */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">{t('systemLanguage')}</Label>
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

            {/* الوضع الليلي */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode" className="text-sm font-medium">{t('darkMode')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('darkModeDesc')}</div>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>

            {/* الإشعارات */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-sm font-medium">{t('notifications')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('notificationsDesc')}</div>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            {/* الحفظ التلقائي */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave" className="text-sm font-medium">{t('autoSave')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('autoSaveDesc')}</div>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الأمان */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">{t('securitySettings')}</CardTitle>
            <CardDescription>{t('securitySettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* مهلة الجلسة */}
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-sm font-medium">{t('sessionTimeout')}</Label>
              <Select 
                value={settings.sessionTimeout.toString()} 
                onValueChange={(value) => updateSetting('sessionTimeout', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 {t('minutes')}</SelectItem>
                  <SelectItem value="30">30 {t('minutes')}</SelectItem>
                  <SelectItem value="60">60 {t('minutes')}</SelectItem>
                  <SelectItem value="120">120 {t('minutes')}</SelectItem>
                  <SelectItem value="0">{t('noTimeout')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* إعدادات إضافية */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">معلومات النظام</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">إصدار النظام:</span>
                  <span className="font-medium ml-2">v2.1.0</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">آخر تحديث:</span>
                  <span className="font-medium ml-2">ديسمبر 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}