import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save, 
  Building, 
  Users, 
  Shield,
  Database,
  Printer,
  Palette
} from 'lucide-react';

interface BranchSettingsProps {
  branchId: number;
}

export default function BranchSettings({ branchId }: BranchSettingsProps) {
  const [settings, setSettings] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    autoBackup: true,
    printReceipts: true,
    taxEnabled: true,
    multiCurrency: false
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الفرع {branchId}</h1>
          <p className="text-gray-600">إدارة إعدادات وتكوين هذا الفرع</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="ml-2 h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات الفرع */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                معلومات الفرع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branchName">اسم الفرع</Label>
                  <Input 
                    id="branchName"
                    value={settings.branchName}
                    onChange={(e) => setSettings({...settings, branchName: e.target.value})}
                    placeholder="أدخل اسم الفرع"
                  />
                </div>
                <div>
                  <Label htmlFor="branchCode">كود الفرع</Label>
                  <Input 
                    id="branchCode"
                    value={settings.branchCode}
                    onChange={(e) => setSettings({...settings, branchCode: e.target.value})}
                    placeholder="أدخل كود الفرع"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input 
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  placeholder="أدخل عنوان الفرع"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input 
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="manager">مدير الفرع</Label>
                <Input 
                  id="manager"
                  value={settings.manager}
                  onChange={(e) => setSettings({...settings, manager: e.target.value})}
                  placeholder="أدخل اسم مدير الفرع"
                />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات النظام */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>النسخ الاحتياطي التلقائي</Label>
                  <p className="text-sm text-gray-500">تفعيل النسخ الاحتياطي اليومي للبيانات</p>
                </div>
                <Switch 
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>طباعة الفواتير التلقائية</Label>
                  <p className="text-sm text-gray-500">طباعة الفواتير تلقائياً بعد الحفظ</p>
                </div>
                <Switch 
                  checked={settings.printReceipts}
                  onCheckedChange={(checked) => setSettings({...settings, printReceipts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>نظام الضرائب</Label>
                  <p className="text-sm text-gray-500">تفعيل حساب الضرائب في الفواتير</p>
                </div>
                <Switch 
                  checked={settings.taxEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, taxEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>العملات المتعددة</Label>
                  <p className="text-sm text-gray-500">دعم أكثر من عملة في النظام</p>
                </div>
                <Switch 
                  checked={settings.multiCurrency}
                  onCheckedChange={(checked) => setSettings({...settings, multiCurrency: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إعدادات سريعة */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="ml-2 h-4 w-4" />
                  إدارة الصلاحيات
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="ml-2 h-4 w-4" />
                  إعدادات الأمان
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                إدارة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="ml-2 h-4 w-4" />
                  نسخ احتياطي يدوي
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="ml-2 h-4 w-4" />
                  استعادة البيانات
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                إعدادات الطباعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="ml-2 h-4 w-4" />
                  إعداد الطابعة
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Palette className="ml-2 h-4 w-4" />
                  تخصيص الفواتير
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}