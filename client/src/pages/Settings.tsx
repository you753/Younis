import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function Settings() {
  const { settings, updateSetting } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t('manageSettings')}</p>
      </div>

      <div className="grid gap-6">
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

            {/* تسجيل النشاط */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activityLogging" className="text-sm font-medium">{t('activityLogging')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('activityLoggingDesc')}</div>
              </div>
              <Switch
                id="activityLogging"
                checked={settings.activityLogging}
                onCheckedChange={(checked) => updateSetting('activityLogging', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات النظام */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">{t('systemSettings')}</CardTitle>
            <CardDescription>{t('systemSettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* الإعدادات المتقدمة */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advancedMode" className="text-sm font-medium">{t('advancedMode')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('advancedModeDesc')}</div>
              </div>
              <Switch
                id="advancedMode"
                checked={settings.advancedMode}
                onCheckedChange={(checked) => updateSetting('advancedMode', checked)}
              />
            </div>

            {/* وضع المطور */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="developerMode" className="text-sm font-medium">{t('developerMode')}</Label>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('developerModeDesc')}</div>
              </div>
              <Switch
                id="developerMode"
                checked={settings.developerMode}
                onCheckedChange={(checked) => updateSetting('developerMode', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}