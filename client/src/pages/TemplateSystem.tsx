import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Mail,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Type,
  Table,
  Grid,
  MousePointer
} from 'lucide-react';

export default function TemplateSystem() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [companySettings, setCompanySettings] = useState({
    name: 'شركة المحاسب الأعظم',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966 50 123 4567',
    email: 'info@almohaseb.com',
    logo: '/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });
  
  // Advanced template editing states
  const [editingTemplate, setEditingTemplate] = useState<any>({
    name: '',
    type: '',
    layout: {
      headerAlignment: 'center',
      logoPosition: 'left',
      companyInfoAlignment: 'right',
      tableStyle: 'modern',
      footerAlignment: 'center',
      showBorder: true,
      showGridLines: true
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      font: 'Cairo',
      fontSize: 14,
      lineHeight: 1.6
    },
    content: {
      header: {
        title: 'فــــاتــــورة',
        subtitle: '',
        showLogo: true,
        showCompanyInfo: true
      },
      body: {
        showItemCode: true,
        showItemDescription: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        columnWidths: {
          code: 15,
          description: 40,
          quantity: 15,
          unitPrice: 15,
          total: 15
        }
      },
      footer: {
        notes: 'شكراً لكم على تعاملكم معنا',
        terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة',
        signature: true
      }
    }
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

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanySettings(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update template layout
  const updateLayout = (field: string, value: any) => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value
      }
    }));
  };

  // Update template styling
  const updateStyling = (field: string, value: any) => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      styling: {
        ...prev.styling,
        [field]: value
      }
    }));
  };

  // Update template content
  const updateContent = (section: string, field: string, value: any) => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: {
          ...prev.content[section],
          [field]: value
        }
      }
    }));
  };

  const generatePDF = async (template: any) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Create temporary div with template content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateTemplateHTML(template, true);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);
      
      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`${template.name}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ في إنشاء ملف PDF');
    }
  };

  const editTemplate = (template: any) => {
    setSelectedTemplate(template);
    setEditingTemplate({
      name: template.name,
      type: template.type,
      primaryColor: companySettings.primaryColor,
      secondaryColor: companySettings.secondaryColor,
      font: 'Cairo',
      fontSize: '14'
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const saveTemplate = (templateData: any) => {
    console.log('حفظ القالب:', templateData);
    alert(`تم حفظ التعديلات على القالب: ${templateData.name}`);
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const previewTemplate = (template: any) => {
    // Create preview window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>معاينة ${template.name}</title>
            <style>
              body { font-family: 'Cairo', sans-serif; margin: 0; padding: 20px; }
            </style>
          </head>
          <body>
            ${generateTemplateHTML(template)}
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const duplicateTemplate = (template: any) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
      name: `نسخة من ${template.name}`,
      isDefault: false
    };
    alert(`تم إنشاء نسخة من القالب: ${newTemplate.name}`);
  };

  const setAsDefault = (template: any) => {
    alert(`تم تعيين القالب "${template.name}" كقالب افتراضي`);
  };

  const saveCompanySettings = () => {
    alert('تم حفظ إعدادات الشركة بنجاح');
  };

  const createNewInvoice = () => {
    window.open('/sales/add', '_blank');
  };

  const createNewReport = () => {
    window.open('/reports/sales', '_blank');
  };

  const exportTemplates = () => {
    const templates = { invoiceTemplates, reportTemplates, companySettings };
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'templates-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const openAdvancedSettings = () => {
    alert('ستتم إضافة الإعدادات المتقدمة قريباً');
  };

  const generateTemplateHTML = (template: any, useEditingSettings = false) => {
    const layout = useEditingSettings ? editingTemplate.layout : { headerAlignment: 'center', logoPosition: 'left', companyInfoAlignment: 'right', tableStyle: 'modern', footerAlignment: 'center', showBorder: true, showGridLines: true };
    const styling = useEditingSettings ? editingTemplate.styling : { primaryColor: companySettings.primaryColor, secondaryColor: companySettings.secondaryColor, backgroundColor: '#FFFFFF', font: 'Cairo', fontSize: 14, lineHeight: 1.6 };
    const content = useEditingSettings ? editingTemplate.content : { header: { title: 'فــــاتــــورة', subtitle: '', showLogo: true, showCompanyInfo: true }, body: { showItemCode: true, showItemDescription: true, showQuantity: true, showUnitPrice: true, showTotal: true, columnWidths: { code: 15, description: 40, quantity: 15, unitPrice: 15, total: 15 } }, footer: { notes: 'شكراً لكم على تعاملكم معنا', terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة', signature: true } };
    
    const getAlignment = (align: string) => {
      switch(align) {
        case 'left': return 'text-align: left;';
        case 'center': return 'text-align: center;';
        case 'right': return 'text-align: right;';
        default: return 'text-align: center;';
      }
    };

    const tableStyle = layout.tableStyle === 'modern' 
      ? 'border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);'
      : '';
    
    const borderStyle = layout.showBorder ? '1px solid #ddd' : 'none';
    const gridLines = layout.showGridLines ? '1px solid #e5e7eb' : 'none';

    return `
      <div style="font-family: ${styling.font}, sans-serif; padding: 40px; background: ${styling.backgroundColor}; color: #1a1a1a; direction: rtl; font-size: ${styling.fontSize}px; line-height: ${styling.lineHeight};">
        <!-- Header Section -->
        <div style="${getAlignment(layout.headerAlignment)} margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${styling.primaryColor};">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            ${layout.logoPosition === 'left' && content.header.showLogo ? `
              <div style="flex: 1;">
                <img src="${companySettings.logo}" alt="شعار الشركة" style="max-height: 80px; max-width: 200px;">
              </div>
            ` : ''}
            
            <div style="flex: 2; ${getAlignment(layout.headerAlignment)}">
              <h1 style="color: ${styling.primaryColor}; font-size: ${styling.fontSize + 14}px; margin: 0; font-weight: bold;">
                ${content.header.title}
              </h1>
              ${content.header.subtitle ? `<p style="color: #666; margin: 10px 0; font-size: ${styling.fontSize + 2}px;">${content.header.subtitle}</p>` : ''}
            </div>
            
            ${layout.logoPosition === 'right' && content.header.showLogo ? `
              <div style="flex: 1; text-align: right;">
                <img src="${companySettings.logo}" alt="شعار الشركة" style="max-height: 80px; max-width: 200px;">
              </div>
            ` : ''}
          </div>
          
          ${content.header.showCompanyInfo ? `
            <div style="${getAlignment(layout.companyInfoAlignment)}">
              <h2 style="color: ${styling.primaryColor}; font-size: ${styling.fontSize + 6}px; margin: 0 0 10px 0;">
                ${companySettings.name}
              </h2>
              <p style="color: #666; margin: 5px 0; font-size: ${styling.fontSize}px;">
                ${companySettings.address}
              </p>
              <div style="margin-top: 10px; color: #666; font-size: ${styling.fontSize - 2}px;">
                <span style="margin-left: 20px;">📞 ${companySettings.phone}</span>
                <span>📧 ${companySettings.email}</span>
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Invoice Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: ${styling.fontSize}px;">
          <div>
            <p><strong>رقم الفاتورة:</strong> INV-2024-001</p>
            <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <div>
            <p><strong>العميل:</strong> عميل تجريبي</p>
            <p><strong>الهاتف:</strong> +966 50 123 4567</p>
          </div>
        </div>
        
        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; ${tableStyle} font-size: ${styling.fontSize}px;">
          <thead>
            <tr style="background: ${styling.secondaryColor}; color: white;">
              ${content.body.showItemCode ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.code}%;">الكود</th>` : ''}
              <th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.description}%;">اسم الصنف</th>
              ${content.body.showQuantity ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.quantity}%;">الكمية</th>` : ''}
              ${content.body.showUnitPrice ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.unitPrice}%;">السعر</th>` : ''}
              ${content.body.showTotal ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.total}%;">المجموع</th>` : ''}
            </tr>
          </thead>
          <tbody>
            <tr>
              ${content.body.showItemCode ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">001</td>` : ''}
              <td style="border: ${gridLines}; padding: 12px;">منتج تجريبي</td>
              ${content.body.showQuantity ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">2</td>` : ''}
              ${content.body.showUnitPrice ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">100.00 ر.س</td>` : ''}
              ${content.body.showTotal ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">200.00 ر.س</td>` : ''}
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="${[content.body.showItemCode, true, content.body.showQuantity, content.body.showUnitPrice].filter(Boolean).length}" style="border: ${borderStyle}; padding: 12px; text-align: center;">الإجمالي</td>
              <td style="border: ${borderStyle}; padding: 12px; text-align: center; color: ${styling.primaryColor};">200.00 ر.س</td>
            </tr>
          </tfoot>
        </table>
        
        <!-- Footer Section -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid ${styling.primaryColor}; ${getAlignment(layout.footerAlignment)}">
          ${content.footer.notes ? `<p style="color: #666; font-size: ${styling.fontSize}px; margin-bottom: 10px;">${content.footer.notes}</p>` : ''}
          ${content.footer.terms ? `<p style="color: #666; font-size: ${styling.fontSize - 2}px; margin-bottom: 20px;">${content.footer.terms}</p>` : ''}
          ${content.footer.signature ? `
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
              <div style="text-align: center; width: 200px;">
                <div style="border-top: 1px solid #666; padding-top: 10px; margin-top: 50px;">
                  <p style="margin: 0; font-size: ${styling.fontSize - 2}px;">توقيع العميل</p>
                </div>
              </div>
              <div style="text-align: center; width: 200px;">
                <div style="border-top: 1px solid #666; padding-top: 10px; margin-top: 50px;">
                  <p style="margin: 0; font-size: ${styling.fontSize - 2}px;">توقيع المندوب</p>
                </div>
              </div>
            </div>
          ` : ''}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => editTemplate(template)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePDF(template)}
                      title="تحميل PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => previewTemplate(template)}
                      title="معاينة"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                      title="نسخ القالب"
                    >
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => editTemplate(template)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePDF(template)}
                      title="تحميل PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => previewTemplate(template)}
                      title="معاينة"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                      title="نسخ القالب"
                    >
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

                  <Button 
                    className="w-full mt-4"
                    onClick={saveCompanySettings}
                  >
                    حفظ الإعدادات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Editor Modal */}
      {showEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">تعديل القالب: {selectedTemplate.name}</h2>
                <Button variant="ghost" onClick={closeEditor}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Editor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إعدادات القالب</h3>
                
                <div>
                  <Label htmlFor="templateName">اسم القالب</Label>
                  <Input
                    id="templateName"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {/* Header Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    إعدادات الرأس
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>عنوان الفاتورة</Label>
                      <Input
                        value={editingTemplate.content.header.title}
                        onChange={(e) => updateContent('header', 'title', e.target.value)}
                        placeholder="فاتورة"
                      />
                    </div>
                    <div>
                      <Label>عنوان فرعي</Label>
                      <Input
                        value={editingTemplate.content.header.subtitle}
                        onChange={(e) => updateContent('header', 'subtitle', e.target.value)}
                        placeholder="عنوان فرعي اختياري"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>محاذاة الرأس</Label>
                      <Select 
                        value={editingTemplate.layout.headerAlignment} 
                        onValueChange={(value) => updateLayout('headerAlignment', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">يمين</SelectItem>
                          <SelectItem value="center">وسط</SelectItem>
                          <SelectItem value="left">يسار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>موقع الشعار</Label>
                      <Select 
                        value={editingTemplate.layout.logoPosition} 
                        onValueChange={(value) => updateLayout('logoPosition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">يسار</SelectItem>
                          <SelectItem value="right">يمين</SelectItem>
                          <SelectItem value="center">وسط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>محاذاة معلومات الشركة</Label>
                      <Select 
                        value={editingTemplate.layout.companyInfoAlignment} 
                        onValueChange={(value) => updateLayout('companyInfoAlignment', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">يمين</SelectItem>
                          <SelectItem value="center">وسط</SelectItem>
                          <SelectItem value="left">يسار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showLogo"
                        checked={editingTemplate.content.header.showLogo}
                        onCheckedChange={(checked) => updateContent('header', 'showLogo', checked)}
                      />
                      <Label htmlFor="showLogo">إظهار الشعار</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showCompanyInfo"
                        checked={editingTemplate.content.header.showCompanyInfo}
                        onCheckedChange={(checked) => updateContent('header', 'showCompanyInfo', checked)}
                      />
                      <Label htmlFor="showCompanyInfo">إظهار معلومات الشركة</Label>
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    شعار الشركة
                  </h4>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      رفع شعار جديد
                    </Button>
                    
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    
                    {companySettings.logo && (
                      <div className="text-center">
                        <img 
                          src={companySettings.logo} 
                          alt="شعار الشركة" 
                          className="max-h-20 mx-auto border rounded"
                        />
                        <p className="text-sm text-gray-500 mt-1">الشعار الحالي</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    إعدادات الجدول
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>نمط الجدول</Label>
                      <Select 
                        value={editingTemplate.layout.tableStyle} 
                        onValueChange={(value) => updateLayout('tableStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">حديث</SelectItem>
                          <SelectItem value="classic">كلاسيكي</SelectItem>
                          <SelectItem value="minimal">بسيط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showBorder"
                        checked={editingTemplate.layout.showBorder}
                        onCheckedChange={(checked) => updateLayout('showBorder', checked)}
                      />
                      <Label htmlFor="showBorder">إظهار الحدود</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showGridLines"
                        checked={editingTemplate.layout.showGridLines}
                        onCheckedChange={(checked) => updateLayout('showGridLines', checked)}
                      />
                      <Label htmlFor="showGridLines">إظهار خطوط الشبكة</Label>
                    </div>
                  </div>

                  {/* Column Settings */}
                  <div className="space-y-3">
                    <Label>عرض الأعمدة (%)</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label htmlFor="codeWidth">عرض عمود الكود</Label>
                        <Slider
                          id="codeWidth"
                          min={10}
                          max={30}
                          step={1}
                          value={[editingTemplate.content.body.columnWidths.code]}
                          onValueChange={(value) => {
                            const newWidths = { ...editingTemplate.content.body.columnWidths };
                            newWidths.code = value[0];
                            updateContent('body', 'columnWidths', newWidths);
                          }}
                          className="mt-1"
                        />
                        <span className="text-xs text-gray-500">{editingTemplate.content.body.columnWidths.code}%</span>
                      </div>
                      
                      <div>
                        <Label htmlFor="descWidth">عرض عمود الوصف</Label>
                        <Slider
                          id="descWidth"
                          min={25}
                          max={60}
                          step={1}
                          value={[editingTemplate.content.body.columnWidths.description]}
                          onValueChange={(value) => {
                            const newWidths = { ...editingTemplate.content.body.columnWidths };
                            newWidths.description = value[0];
                            updateContent('body', 'columnWidths', newWidths);
                          }}
                          className="mt-1"
                        />
                        <span className="text-xs text-gray-500">{editingTemplate.content.body.columnWidths.description}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showItemCode"
                        checked={editingTemplate.content.body.showItemCode}
                        onCheckedChange={(checked) => updateContent('body', 'showItemCode', checked)}
                      />
                      <Label htmlFor="showItemCode">إظهار كود الصنف</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showQuantity"
                        checked={editingTemplate.content.body.showQuantity}
                        onCheckedChange={(checked) => updateContent('body', 'showQuantity', checked)}
                      />
                      <Label htmlFor="showQuantity">إظهار الكمية</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showUnitPrice"
                        checked={editingTemplate.content.body.showUnitPrice}
                        onCheckedChange={(checked) => updateContent('body', 'showUnitPrice', checked)}
                      />
                      <Label htmlFor="showUnitPrice">إظهار سعر الوحدة</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showTotal"
                        checked={editingTemplate.content.body.showTotal}
                        onCheckedChange={(checked) => updateContent('body', 'showTotal', checked)}
                      />
                      <Label htmlFor="showTotal">إظهار المجموع</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="templateType">نوع القالب</Label>
                  <Select 
                    value={editingTemplate.type}
                    onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">فاتورة</SelectItem>
                      <SelectItem value="receipt">إيصال</SelectItem>
                      <SelectItem value="quotation">عرض سعر</SelectItem>
                      <SelectItem value="sales">تقرير مبيعات</SelectItem>
                      <SelectItem value="inventory">تقرير مخزون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>ألوان القالب</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">اللون الأساسي</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.primaryColor}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-10 h-8 rounded border"
                        />
                        <Input 
                          value={editingTemplate.primaryColor} 
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">اللون الثانوي</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.secondaryColor}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-10 h-8 rounded border"
                        />
                        <Input 
                          value={editingTemplate.secondaryColor} 
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>خط القالب</Label>
                  <Select 
                    value={editingTemplate.font}
                    onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, font: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cairo">Cairo</SelectItem>
                      <SelectItem value="Amiri">Amiri</SelectItem>
                      <SelectItem value="Tajawal">Tajawal</SelectItem>
                      <SelectItem value="Almarai">Almarai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>حجم الخط</Label>
                  <Select 
                    value={editingTemplate.fontSize}
                    onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, fontSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">صغير (12px)</SelectItem>
                      <SelectItem value="14">متوسط (14px)</SelectItem>
                      <SelectItem value="16">كبير (16px)</SelectItem>
                      <SelectItem value="18">كبير جداً (18px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>عناصر القالب</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>رأس الشركة</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>معلومات العميل</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>جدول الأصناف</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>المجموع الإجمالي</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>الذيل والتوقيع</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => saveTemplate({
                      ...selectedTemplate,
                      name: 'القالب المحدث'
                    })}
                  >
                    حفظ التعديلات
                  </Button>
                  <Button variant="outline" onClick={closeEditor}>
                    إلغاء
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معاينة مباشرة</h3>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-96">
                  <div 
                    className="bg-white p-4 rounded shadow-sm text-xs"
                    dangerouslySetInnerHTML={{ __html: generateTemplateHTML(selectedTemplate, true) }}
                    style={{ transform: 'scale(0.8)', transformOrigin: 'top right' }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => previewTemplate(selectedTemplate)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    معاينة كاملة
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generatePDF(selectedTemplate)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    تحميل PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={createNewInvoice}
            >
              <FileText className="h-4 w-4" />
              إنشاء فاتورة
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={createNewReport}
            >
              <Layout className="h-4 w-4" />
              إنشاء تقرير
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportTemplates}
            >
              <Download className="h-4 w-4" />
              تصدير القوالب
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={openAdvancedSettings}
            >
              <Settings className="h-4 w-4" />
              إعدادات متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}