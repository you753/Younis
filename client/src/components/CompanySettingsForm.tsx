import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  CreditCard, 
  Palette,
  Save,
  Upload
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CompanySettingsFormProps {
  settings?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function CompanySettingsForm({ settings, onSave, onCancel }: CompanySettingsFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: settings?.companyName || '',
    companyNameEn: settings?.companyNameEn || '',
    logoUrl: settings?.logoUrl || '',
    address: settings?.address || '',
    addressEn: settings?.addressEn || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    website: settings?.website || '',
    taxNumber: settings?.taxNumber || '',
    commercialRecord: settings?.commercialRecord || '',
    bankName: settings?.bankName || '',
    bankAccount: settings?.bankAccount || '',
    iban: settings?.iban || '',
    swiftCode: settings?.swiftCode || '',
    primaryColor: settings?.primaryColor || '#3B82F6',
    secondaryColor: settings?.secondaryColor || '#1E40AF',
    currency: settings?.currency || 'SAR',
    currencySymbol: settings?.currencySymbol || 'ر.س',
    timezone: settings?.timezone || 'Asia/Riyadh',
    dateFormat: settings?.dateFormat || 'dd/MM/yyyy',
    language: settings?.language || 'ar'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => {
      if (settings?.id) {
        return apiRequest(`/api/company-settings/${settings.id}`, 'PATCH', data);
      } else {
        return apiRequest('/api/company-settings', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
      onSave();
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await saveSettingsMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving company settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            معلومات أساسية
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            بيانات الاتصال
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            معلومات مالية
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            المظهر
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                معلومات الشركة الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">اسم الشركة (عربي) *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="شركة المحاسب الأعظم"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyNameEn">اسم الشركة (إنجليزي)</Label>
                  <Input
                    id="companyNameEn"
                    value={formData.companyNameEn}
                    onChange={(e) => handleInputChange('companyNameEn', e.target.value)}
                    placeholder="Al-Mohaseb Al-Azam Company"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logoUrl">شعار الشركة</Label>
                <div className="flex gap-2">
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" className="px-3">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.logoUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.logoUrl} 
                      alt="شعار الشركة" 
                      className="max-w-32 max-h-20 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="commercialRecord">السجل التجاري</Label>
                  <Input
                    id="commercialRecord"
                    value={formData.commercialRecord}
                    onChange={(e) => handleInputChange('commercialRecord', e.target.value)}
                    placeholder="1010123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                بيانات الاتصال والعنوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">العنوان (عربي)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="الرياض، المملكة العربية السعودية"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="addressEn">العنوان (إنجليزي)</Label>
                <Textarea
                  id="addressEn"
                  value={formData.addressEn}
                  onChange={(e) => handleInputChange('addressEn', e.target.value)}
                  placeholder="Riyadh, Saudi Arabia"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+966 50 123 4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                المعلومات المصرفية والمالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">اسم البنك</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="البنك الأهلي السعودي"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bankAccount">رقم الحساب البنكي</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    placeholder="12345678901"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                    placeholder="SA1234567890123456789012"
                  />
                </div>
                
                <div>
                  <Label htmlFor="swiftCode">رمز السويفت (SWIFT)</Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode}
                    onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                    placeholder="NCBKSARI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currencySymbol">رمز العملة</Label>
                  <Input
                    id="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    placeholder="ر.س"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                إعدادات المظهر والتخصيص
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">اللون الأساسي</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                      <SelectItem value="UTC">التوقيت العالمي (UTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">يوم/شهر/سنة</SelectItem>
                      <SelectItem value="MM/dd/yyyy">شهر/يوم/سنة</SelectItem>
                      <SelectItem value="yyyy-MM-dd">سنة-شهر-يوم</SelectItem>
                      <SelectItem value="dd-MM-yyyy">يوم-شهر-سنة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-3">معاينة الألوان:</h4>
                <div className="flex gap-4 items-center">
                  <div 
                    className="w-16 h-12 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    أساسي
                  </div>
                  <div 
                    className="w-16 h-12 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    ثانوي
                  </div>
                  <div className="text-sm text-gray-600">
                    سيتم تطبيق هذه الألوان على جميع القوالب والتقارير
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </form>
  );
}