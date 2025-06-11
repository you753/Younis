import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Download, 
  Eye, 
  Settings,
  Palette,
  Layout,
  Copy,
  Star,
  Building,
  Phone,
  Mail
} from 'lucide-react';

export default function TemplateSystem() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: 'شركة المحاسب الأعظم',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966 50 123 4567',
    email: 'info@almohaseb.com',
    logo: '/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  // Sample templates for demonstration
  const invoiceTemplates = [
    {
      id: 1,
      name: 'فاتورة كلاسيكية',
      type: 'invoice',
      isDefault: true,
      isActive: true,
      preview: 'template-preview-1.png'
    },
    {
      id: 2,
      name: 'فاتورة حديثة',
      type: 'invoice',
      isDefault: false,
      isActive: true,
      preview: 'template-preview-2.png'
    }
  ];

  const reportTemplates = [
    {
      id: 3,
      name: 'تقرير مبيعات شامل',
      type: 'sales',
      isDefault: true,
      isActive: true,
      preview: 'report-preview-1.png'
    },
    {
      id: 4,
      name: 'تقرير مخزون مفصل',
      type: 'inventory',
      isDefault: false,
      isActive: true,
      preview: 'report-preview-2.png'
    }
  ];

  const generatePDF = (template: any) => {
    // Sample implementation for PDF generation
    const doc = document.createElement('div');
    doc.innerHTML = generateTemplateHTML(template);
    
    // Here you would use html2canvas and jsPDF
    alert(`سيتم إنشاء PDF للقالب: ${template.name}`);
  };

  const generateTemplateHTML = (template: any) => {
    return `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px;">
        <header style="border-bottom: 2px solid ${companySettings.primaryColor}; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: ${companySettings.primaryColor}; margin: 0;">${companySettings.name}</h1>
              <p style="margin: 5px 0;">${companySettings.address}</p>
              <p style="margin: 5px 0;">هاتف: ${companySettings.phone} | إيميل: ${companySettings.email}</p>
            </div>
          </div>
        </header>
        
        <div style="margin: 30px 0;">
          <h2 style="color: ${companySettings.secondaryColor};">فاتورة رقم: #INV-2025-001</h2>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: ${companySettings.primaryColor}; color: white;">
              <th style="padding: 12px; text-align: right;">الصنف</th>
              <th style="padding: 12px; text-align: right;">الكمية</th>
              <th style="padding: 12px; text-align: right;">السعر</th>
              <th style="padding: 12px; text-align: right;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;">منتج تجريبي</td>
              <td style="padding: 10px;">2</td>
              <td style="padding: 10px;">500 ر.س</td>
              <td style="padding: 10px;">1,000 ر.س</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: left; margin-top: 30px;">
          <div style="border-top: 2px solid ${companySettings.primaryColor}; padding-top: 10px;">
            <strong style="font-size: 1.2em;">المجموع النهائي: 1,150 ر.س</strong>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">نظام القوالب المتقدم</h1>
          <p className="text-gray-600 mt-2">إنشاء وتخصيص قوالب الفواتير والتقارير مع معاينة فورية</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الشركة
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إنشاء قالب جديد
          </Button>
        </div>
      </div>

      {/* Template Types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            قوالب الفواتير
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            قوالب التقارير
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            إعدادات الشركة
          </TabsTrigger>
        </TabsList>

        {/* Invoice Templates */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoiceTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          افتراضي
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 min-h-32">
                    <div 
                      className="w-full h-24 bg-white rounded border text-xs p-2 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: generateTemplateHTML(template) }}
                      style={{ transform: 'scale(0.3)', transformOrigin: 'top right', height: '300px' }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit3 className="h-4 w-4 mr-1" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePDF(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Report Templates */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          افتراضي
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 min-h-32 flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <Layout className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">معاينة تقرير {template.type}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit3 className="h-4 w-4 mr-1" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePDF(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                إعدادات الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">اسم الشركة</Label>
                    <Input
                      id="companyName"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Textarea
                      id="address"
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">الهاتف</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={companySettings.primaryColor}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={companySettings.primaryColor}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                        value={companySettings.secondaryColor}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={companySettings.secondaryColor}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="mt-6">
                    <Label>معاينة مباشرة:</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-white">
                      <div 
                        className="text-center p-4 rounded"
                        style={{ 
                          backgroundColor: companySettings.primaryColor,
                          color: 'white'
                        }}
                      >
                        <h3 className="font-bold">{companySettings.name}</h3>
                        <p className="text-sm mt-1">{companySettings.address}</p>
                      </div>
                      <div 
                        className="mt-2 p-2 rounded text-center"
                        style={{ 
                          backgroundColor: companySettings.secondaryColor,
                          color: 'white'
                        }}
                      >
                        <p className="text-sm">{companySettings.phone} | {companySettings.email}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4">
                    حفظ الإعدادات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              إنشاء فاتورة
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              إنشاء تقرير
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              تصدير القوالب
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              إعدادات متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}