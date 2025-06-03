import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Save, Database, Bell, Shield, Palette } from 'lucide-react';
import { useEffect } from 'react';

export default function Settings() {
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إعدادات النظام');
  }, [setCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إعدادات النظام</h2>
        <p className="text-gray-600">تخصيص وإدارة إعدادات نظام المحاسبة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">أقسام الإعدادات</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-700">
                <SettingsIcon className="ml-2 h-4 w-4" />
                إعدادات عامة
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Database className="ml-2 h-4 w-4" />
                قاعدة البيانات
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="ml-2 h-4 w-4" />
                الإشعارات
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="ml-2 h-4 w-4" />
                الأمان
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="ml-2 h-4 w-4" />
                المظهر
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الشركة</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input id="companyName" defaultValue="بوابة سوق البدو" />
                </div>
                <div>
                  <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
                  <Input id="companyEmail" type="email" defaultValue="info@souqalbado.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">رقم الهاتف</Label>
                  <Input id="companyPhone" defaultValue="+966 50 123 4567" />
                </div>
                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input id="taxNumber" defaultValue="123456789" />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">العنوان</Label>
                <Input id="companyAddress" defaultValue="الرياض، المملكة العربية السعودية" />
              </div>
            </div>
          </div>

          <Separator />

          {/* System Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفضيلات النظام</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                  <p className="text-sm text-gray-500">إرسال إشعارات للعمليات المهمة</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
                  <p className="text-sm text-gray-500">إنشاء نسخة احتياطية يومياً</p>
                </div>
                <Switch id="autoBackup" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowStockAlert">تنبيهات المخزون المنخفض</Label>
                  <p className="text-sm text-gray-500">تنبيه عند انخفاض المخزون</p>
                </div>
                <Switch id="lowStockAlert" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">الوضع الليلي</Label>
                  <p className="text-sm text-gray-500">تغيير مظهر النظام للوضع الداكن</p>
                </div>
                <Switch id="darkMode" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Currency and Regional Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات العملة والمنطقة</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Input id="currency" defaultValue="ريال سعودي (ر.س)" readOnly />
                </div>
                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Input id="language" defaultValue="العربية" readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Input id="dateFormat" defaultValue="DD/MM/YYYY" />
                </div>
                <div>
                  <Label htmlFor="timeZone">المنطقة الزمنية</Label>
                  <Input id="timeZone" defaultValue="Asia/Riyadh" readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="btn-accounting-primary">
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
