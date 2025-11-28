import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RefreshCw, Package, AlertTriangle, Shield, Database, Zap } from 'lucide-react';

interface BranchInventorySettingsProps {
  branchId?: number;
}

export default function BranchInventorySettings({ branchId }: BranchInventorySettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  
  // بيانات تجريبية شاملة للإعدادات
  const [settings, setSettings] = useState({
    general: {
      autoUpdateStock: true,
      enableLowStockAlerts: true,
      enableOverstockAlerts: false,
      defaultSupplier: 'شركة الأجهزة المتقدمة',
      defaultLocation: 'مخزن A - رف A1',
      stockUpdateMethod: 'automatic',
      inventoryValuation: 'weighted_average'
    },
    alerts: {
      lowStockThreshold: 5,
      criticalStockThreshold: 2,
      overstockThreshold: 100,
      emailNotifications: true,
      smsNotifications: false,
      alertFrequency: 'daily',
      notificationRecipients: ['admin@company.com', 'warehouse@company.com']
    },
    automation: {
      autoReorderEnabled: false,
      autoReorderThreshold: 8,
      defaultReorderQuantity: 20,
      preferredSuppliers: ['شركة الأجهزة المتقدمة', 'موزع اكسسوارات الكمبيوتر'],
      autoApproveOrders: false,
      maxAutoOrderValue: 10000
    },
    security: {
      requireApprovalForDelete: true,
      requireApprovalForTransfer: true,
      auditTrailEnabled: true,
      dataRetentionDays: 365,
      backupFrequency: 'daily',
      encryptSensitiveData: true
    },
    integration: {
      syncWithAccounting: true,
      syncWithSales: true,
      syncWithPurchasing: true,
      externalApiEnabled: false,
      apiKey: '****-****-****-8b2f',
      webhookUrl: 'https://api.company.com/inventory-webhook'
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">التحديث التلقائي للمخزون</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.general.autoUpdateStock}
                  onChange={(e) => handleSettingChange('general', 'autoUpdateStock', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">تحديث المخزون تلقائياً عند البيع والشراء</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تنبيهات المخزون المنخفض</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.general.enableLowStockAlerts}
                  onChange={(e) => handleSettingChange('general', 'enableLowStockAlerts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">إرسال تنبيهات عند انخفاض المخزون</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المورد الافتراضي</label>
              <select 
                value={settings.general.defaultSupplier}
                onChange={(e) => handleSettingChange('general', 'defaultSupplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="شركة الأجهزة المتقدمة">شركة الأجهزة المتقدمة</option>
                <option value="موزع اكسسوارات الكمبيوتر">موزع اكسسوارات الكمبيوتر</option>
                <option value="شركة مستلزمات المكاتب">شركة مستلزمات المكاتب</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الموقع الافتراضي</label>
              <select 
                value={settings.general.defaultLocation}
                onChange={(e) => handleSettingChange('general', 'defaultLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="مخزن A - رف A1">مخزن A - رف A1</option>
                <option value="مخزن A - رف A2">مخزن A - رف A2</option>
                <option value="مخزن B - رف B1">مخزن B - رف B1</option>
                <option value="مخزن C - منطقة الاستقبال">مخزن C - منطقة الاستقبال</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">طريقة تحديث المخزون</label>
              <select 
                value={settings.general.stockUpdateMethod}
                onChange={(e) => handleSettingChange('general', 'stockUpdateMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="automatic">تلقائي</option>
                <option value="manual">يدوي</option>
                <option value="approval_required">يتطلب موافقة</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">طريقة تقييم المخزون</label>
              <select 
                value={settings.general.inventoryValuation}
                onChange={(e) => handleSettingChange('general', 'inventoryValuation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weighted_average">المتوسط المرجح</option>
                <option value="fifo">الوارد أولاً صادر أولاً</option>
                <option value="lifo">الوارد أخيراً صادر أولاً</option>
                <option value="standard_cost">التكلفة المعيارية</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">إعدادات التنبيهات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">حد المخزون المنخفض</label>
              <Input
                type="number"
                value={settings.alerts.lowStockThreshold}
                onChange={(e) => handleSettingChange('alerts', 'lowStockThreshold', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">إرسال تنبيه عندما يصل المخزون لهذا الحد</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حد المخزون الحرج</label>
              <Input
                type="number"
                value={settings.alerts.criticalStockThreshold}
                onChange={(e) => handleSettingChange('alerts', 'criticalStockThreshold', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">إرسال تنبيه عاجل عندما يصل المخزون لهذا الحد</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حد المخزون الزائد</label>
              <Input
                type="number"
                value={settings.alerts.overstockThreshold}
                onChange={(e) => handleSettingChange('alerts', 'overstockThreshold', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">إرسال تنبيه عند تجاوز هذا الحد</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تكرار التنبيهات</label>
              <select 
                value={settings.alerts.alertFrequency}
                onChange={(e) => handleSettingChange('alerts', 'alertFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">فوري</option>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تنبيهات البريد الإلكتروني</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.alerts.emailNotifications}
                  onChange={(e) => handleSettingChange('alerts', 'emailNotifications', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">إرسال تنبيهات عبر البريد الإلكتروني</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تنبيهات الرسائل النصية</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.alerts.smsNotifications}
                  onChange={(e) => handleSettingChange('alerts', 'smsNotifications', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">إرسال تنبيهات عبر الرسائل النصية</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAutomationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">الأتمتة والطلب التلقائي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الطلب التلقائي</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.automation.autoReorderEnabled}
                  onChange={(e) => handleSettingChange('automation', 'autoReorderEnabled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">تفعيل الطلب التلقائي عند انخفاض المخزون</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حد الطلب التلقائي</label>
              <Input
                type="number"
                value={settings.automation.autoReorderThreshold}
                onChange={(e) => handleSettingChange('automation', 'autoReorderThreshold', parseInt(e.target.value))}
                disabled={!settings.automation.autoReorderEnabled}
                className="w-full"
              />
              <p className="text-xs text-gray-600">إنشاء طلب شراء تلقائياً عند الوصول لهذا الحد</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الكمية الافتراضية للطلب</label>
              <Input
                type="number"
                value={settings.automation.defaultReorderQuantity}
                onChange={(e) => handleSettingChange('automation', 'defaultReorderQuantity', parseInt(e.target.value))}
                disabled={!settings.automation.autoReorderEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الحد الأقصى لقيمة الطلب التلقائي</label>
              <Input
                type="number"
                value={settings.automation.maxAutoOrderValue}
                onChange={(e) => handleSettingChange('automation', 'maxAutoOrderValue', parseInt(e.target.value))}
                disabled={!settings.automation.autoReorderEnabled}
                className="w-full"
              />
              <p className="text-xs text-gray-600">ريال سعودي</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الموافقة التلقائية على الطلبات</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.automation.autoApproveOrders}
                  onChange={(e) => handleSettingChange('automation', 'autoApproveOrders', e.target.checked)}
                  disabled={!settings.automation.autoReorderEnabled}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">الموافقة تلقائياً على طلبات الشراء المنشأة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">الأمان وسجل التدقيق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الموافقة على الحذف</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.security.requireApprovalForDelete}
                  onChange={(e) => handleSettingChange('security', 'requireApprovalForDelete', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">طلب موافقة قبل حذف أي عنصر</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الموافقة على النقل</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.security.requireApprovalForTransfer}
                  onChange={(e) => handleSettingChange('security', 'requireApprovalForTransfer', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">طلب موافقة قبل نقل المخزون</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">سجل التدقيق</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.security.auditTrailEnabled}
                  onChange={(e) => handleSettingChange('security', 'auditTrailEnabled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">تسجيل جميع العمليات لأغراض التدقيق</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">فترة الاحتفاظ بالبيانات</label>
              <Input
                type="number"
                value={settings.security.dataRetentionDays}
                onChange={(e) => handleSettingChange('security', 'dataRetentionDays', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">عدد الأيام للاحتفاظ بسجل العمليات</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تكرار النسخ الاحتياطي</label>
              <select 
                value={settings.security.backupFrequency}
                onChange={(e) => handleSettingChange('security', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">كل ساعة</option>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تشفير البيانات الحساسة</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.security.encryptSensitiveData}
                  onChange={(e) => handleSettingChange('security', 'encryptSensitiveData', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">تشفير البيانات المالية والحساسة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات المخزون</h1>
          <p className="text-gray-600">تكوين وإدارة إعدادات نظام المخزون - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* شريط الحفظ العلوي */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Database className="h-3 w-3 ml-1" />
            متصل
          </Badge>
          <span className="text-sm text-gray-600">آخر حفظ: منذ 2 دقيقة</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة تحميل
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      {/* شريط التبويب */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline ml-2" />
            عام
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline ml-2" />
            التنبيهات
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'automation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="h-4 w-4 inline ml-2" />
            الأتمتة
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline ml-2" />
            الأمان
          </button>
        </nav>
      </div>

      {/* محتوى التبويبات */}
      <div className="mt-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'alerts' && renderAlertSettings()}
        {activeTab === 'automation' && renderAutomationSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
      </div>
    </div>
  );
}