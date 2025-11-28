import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Building, Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();

  // جلب الإعدادات المحفوظة من الخادم
  const { data: savedSettings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const [companyInfo, setCompanyInfo] = useState({
    nameArabic: '',
    nameEnglish: 'Bedouin Market Gateway',
    taxNumber: '123456789012345',
    commercialRegister: '4030528128',
    phone: '0567537599',
    fax: '0126789012',
    mobile: '0567537599',
    email: 'byrwl8230@gmail.com',
    website: 'www.bedouinmarket.com',
    address: 'جدة البغدادية الشرقية',
    district: 'البغدادية الشرقية',
    postalCode: '222345',
    city: 'جدة',
    region: 'منطقة مكة المكرمة',
    country: 'المملكة العربية السعودية',
    vatNumber: '123456789012345',
    license: '40305281',
    bankAccount: 'SA0380000000608010167519',
    bankName: 'البنك الأهلي السعودي',
    iban: 'SA0380000000608010167519'
  });

  // تحديث البيانات عند تحميل الإعدادات المحفوظة
  useEffect(() => {
    try {
      const settings = savedSettings as Record<string, any>;
      if (settings && settings.company) {
        const company = settings.company;
        setCompanyInfo(prev => ({
          ...prev,
          nameArabic: company.arabicName || prev.nameArabic,
          nameEnglish: company.name || prev.nameEnglish,
          taxNumber: company.taxNumber || prev.taxNumber,
          commercialRegister: company.commercialRegister || prev.commercialRegister,
          phone: company.phone || prev.phone,
          email: company.email || prev.email,
          website: company.website || prev.website,
          address: company.address || prev.address,
          city: company.city || prev.city,
          country: company.country || prev.country,
          bankAccount: company.bankAccount || prev.bankAccount,
          bankName: company.bankName || prev.bankName,
          iban: company.iban || prev.iban,
        }));
      }
    } catch (error) {
      console.log('خطأ في تحميل الإعدادات:', error);
    }
  }, [savedSettings]);


  // استخدام mutation لحفظ الإعدادات
  const saveSettingsMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      return await apiRequest('POST', '/api/settings', { section, data });
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ الإعدادات بنجاح",
      });
      // إعادة جلب الإعدادات لتحديث الواجهة
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
  });

  const handleSave = async () => {
    // تحويل البيانات للتنسيق الذي يتوقعه الـ backend
    const data = {
      name: companyInfo.nameEnglish,
      arabicName: companyInfo.nameArabic,
      taxNumber: companyInfo.taxNumber,
      commercialRegister: companyInfo.commercialRegister,
      address: companyInfo.address,
      city: companyInfo.city,
      country: companyInfo.country,
      phone: companyInfo.phone,
      email: companyInfo.email,
      website: companyInfo.website,
      bankAccount: companyInfo.bankAccount,
      bankName: companyInfo.bankName,
      iban: companyInfo.iban,
      swiftCode: ''
    };
    saveSettingsMutation.mutate({ section: 'company', data });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">إعدادات الشركة</h1>
      </div>

      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                معلومات الشركة
              </CardTitle>
              <CardDescription>
                إدارة المعلومات الأساسية للشركة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameArabic">اسم الشركة (عربي)</Label>
                  <Input
                    id="nameArabic"
                    name="nameArabic"
                    type="text"
                    placeholder="أدخل اسم الشركة بالعربي"
                    value={companyInfo.nameArabic || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, nameArabic: e.target.value }))}
                    className="w-full"
                    data-testid="input-company-name-arabic"
                  />
                </div>
                <div>
                  <Label htmlFor="nameEnglish">اسم الشركة (إنجليزي)</Label>
                  <Input
                    id="nameEnglish"
                    name="nameEnglish"
                    type="text"
                    placeholder="Enter company name in English"
                    value={companyInfo.nameEnglish || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, nameEnglish: e.target.value }))}
                    className="w-full"
                    data-testid="input-company-name-english"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={companyInfo.taxNumber}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, taxNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="commercialRegister">السجل التجاري</Label>
                  <Input
                    id="commercialRegister"
                    value={companyInfo.commercialRegister}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, commercialRegister: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف الأساسي</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">رقم الجوال</Label>
                  <Input
                    id="mobile"
                    value={companyInfo.mobile || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fax">رقم الفاكس</Label>
                  <Input
                    id="fax"
                    value={companyInfo.fax || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, fax: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="district">الحي</Label>
                  <Input
                    id="district"
                    value={companyInfo.district || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="region">المنطقة</Label>
                  <Input
                    id="region"
                    value={companyInfo.region || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, region: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">الرمز البريدي</Label>
                  <Input
                    id="postalCode"
                    value={companyInfo.postalCode}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">البلد</Label>
                  <Input
                    id="country"
                    value={companyInfo.country}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vatNumber">رقم ضريبة القيمة المضافة</Label>
                  <Input
                    id="vatNumber"
                    value={companyInfo.vatNumber || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="license">رقم الرخصة</Label>
                  <Input
                    id="license"
                    value={companyInfo.license || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, license: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">اسم البنك</Label>
                  <Input
                    id="bankName"
                    value={companyInfo.bankName || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">رقم الحساب البنكي</Label>
                  <Input
                    id="bankAccount"
                    value={companyInfo.bankAccount || ''}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, bankAccount: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                <Input
                  id="iban"
                  value={companyInfo.iban || ''}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, iban: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave()}
                  disabled={saveSettingsMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveSettingsMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
