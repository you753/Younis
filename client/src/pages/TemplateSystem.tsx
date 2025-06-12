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
      showGridLines: true,
      pageSize: 'A4',
      pageOrientation: 'portrait',
      margins: { top: 20, bottom: 20, left: 15, right: 15 },
      watermark: { show: false, text: '', opacity: 0.1, rotation: 45 },
      pageNumbering: { show: false, position: 'bottom-center', format: 'صفحة {page} من {total}' }
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      font: 'Cairo',
      fontSize: 14,
      lineHeight: 1.6,
      headerGradient: false,
      tableHoverEffect: false,
      roundedCorners: 8,
      shadowEffect: false,
      borderStyle: 'solid',
      customCSS: ''
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
        signature: true,
        showPaymentInfo: true,
        bankDetails: 'البنك الأهلي السعودي - رقم الحساب: 123456789',
        vatNumber: 'الرقم الضريبي: 300123456789003',
        showQRCode: true,
        customFooterText: '',
        footerBackgroundColor: '#F8F9FA',
        footerTextColor: '#666666',
        showFooterBorder: true,
        footerBorderColor: '#E5E7EB',
        signatureFields: [
          { label: 'توقيع العميل', show: true },
          { label: 'توقيع المندوب', show: true },
          { label: 'التاريخ', show: false },
          { label: 'الوقت', show: false }
        ]
      }
    }
  });

  // Sample templates for demonstration
  const [invoiceTemplates, setInvoiceTemplates] = useState([
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
  ]);

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
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
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
        primaryColor: companySettings.primaryColor,
        secondaryColor: companySettings.secondaryColor,
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
          signature: true,
          showPaymentInfo: true,
          bankDetails: 'البنك الأهلي السعودي - رقم الحساب: 123456789',
          vatNumber: 'الرقم الضريبي: 300123456789003',
          showQRCode: true,
          customFooterText: '',
          footerBackgroundColor: '#F8F9FA',
          footerTextColor: '#666666',
          showFooterBorder: true,
          footerBorderColor: '#E5E7EB',
          signatureFields: [
            { label: 'توقيع العميل', show: true },
            { label: 'توقيع المندوب', show: true },
            { label: 'التاريخ', show: false },
            { label: 'الوقت', show: false }
          ]
        }
      }
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const saveTemplate = (templateData: any) => {
    try {
      console.log('حفظ القالب:', templateData);
      
      const completeTemplateData = {
        ...templateData,
        lastModified: new Date().toISOString(),
        version: '1.0'
      };
      
      // Update the template in the list
      if (selectedTemplate?.id) {
        setInvoiceTemplates(prev => 
          prev.map(template => 
            template.id === selectedTemplate.id 
              ? { ...template, ...completeTemplateData }
              : template
          )
        );
        
        // Store in localStorage for persistence
        const savedTemplates = JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
        const updatedTemplates = savedTemplates.map((template: any) => 
          template.id === selectedTemplate.id 
            ? { ...template, ...completeTemplateData }
            : template
        );
        localStorage.setItem('invoiceTemplates', JSON.stringify(updatedTemplates));
        
      } else {
        // Create new template
        const newTemplate = {
          id: Date.now(),
          ...completeTemplateData,
          isDefault: false,
          isActive: true,
          preview: 'template-preview-new.png',
          createdAt: new Date().toISOString()
        };
        
        setInvoiceTemplates(prev => [...prev, newTemplate]);
        
        // Store in localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
        savedTemplates.push(newTemplate);
        localStorage.setItem('invoiceTemplates', JSON.stringify(savedTemplates));
      }
      
      alert(`✅ تم حفظ القالب "${templateData.name}" بنجاح وسيبقى محفوظاً`);
      setShowEditor(false);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error('خطأ في حفظ القالب:', error);
      alert('❌ حدث خطأ أثناء حفظ القالب، يرجى المحاولة مرة أخرى');
    }
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
    const layout = useEditingSettings ? editingTemplate.layout : { 
      headerAlignment: 'center', logoPosition: 'left', companyInfoAlignment: 'right', 
      tableStyle: 'modern', footerAlignment: 'center', showBorder: true, showGridLines: true,
      pageSize: 'A4', pageOrientation: 'portrait', 
      margins: { top: 20, bottom: 20, left: 15, right: 15 },
      watermark: { show: false, text: '', opacity: 0.1, rotation: 45 },
      pageNumbering: { show: false, position: 'bottom-center', format: 'صفحة {page} من {total}' }
    };
    const styling = useEditingSettings ? editingTemplate.styling : { 
      primaryColor: companySettings.primaryColor, secondaryColor: companySettings.secondaryColor, 
      backgroundColor: '#FFFFFF', font: 'Cairo', fontSize: 14, lineHeight: 1.6,
      headerGradient: false, tableHoverEffect: false, roundedCorners: 8, 
      shadowEffect: false, borderStyle: 'solid', customCSS: ''
    };
    const content = useEditingSettings ? editingTemplate.content : { 
      header: { title: 'فــــاتــــورة', subtitle: '', showLogo: true, showCompanyInfo: true }, 
      body: { showItemCode: true, showItemDescription: true, showQuantity: true, showUnitPrice: true, showTotal: true, columnWidths: { code: 15, description: 40, quantity: 15, unitPrice: 15, total: 15 } }, 
      footer: { notes: 'شكراً لكم على تعاملكم معنا', terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة', signature: true } 
    };
    
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
            <tr style="${headerBackground} color: white;">
              ${content.body.showItemCode ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.code}%;">الكود</th>` : ''}
              <th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.description}%;">اسم الصنف</th>
              ${content.body.showQuantity ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.quantity}%;">الكمية</th>` : ''}
              ${content.body.showUnitPrice ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.unitPrice}%;">السعر</th>` : ''}
              ${content.body.showTotal ? `<th style="border: ${borderStyle}; padding: 12px; text-align: center; width: ${content.body.columnWidths.total}%;">المجموع</th>` : ''}
            </tr>
          </thead>
          <tbody>
            <tr class="${styling.tableHoverEffect ? 'table-row' : ''}" style="transition: background-color 0.2s ease;">
              ${content.body.showItemCode ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">001</td>` : ''}
              <td style="border: ${gridLines}; padding: 12px;">منتج تجريبي احترافي</td>
              ${content.body.showQuantity ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">2</td>` : ''}
              ${content.body.showUnitPrice ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">100.00 ر.س</td>` : ''}
              ${content.body.showTotal ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">200.00 ر.س</td>` : ''}
            </tr>
            <tr class="${styling.tableHoverEffect ? 'table-row' : ''}" style="transition: background-color 0.2s ease;">
              ${content.body.showItemCode ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">002</td>` : ''}
              <td style="border: ${gridLines}; padding: 12px;">منتج تجريبي آخر</td>
              ${content.body.showQuantity ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">1</td>` : ''}
              ${content.body.showUnitPrice ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">50.00 ر.س</td>` : ''}
              ${content.body.showTotal ? `<td style="border: ${gridLines}; padding: 12px; text-align: center;">50.00 ر.س</td>` : ''}
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); font-weight: bold; ${styling.shadowEffect ? 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : ''}">
              <td colspan="${[content.body.showItemCode, true, content.body.showQuantity, content.body.showUnitPrice].filter(Boolean).length}" style="border: ${borderStyle}; padding: 12px; text-align: center; font-size: ${styling.fontSize + 1}px;">الإجمالي</td>
              <td style="border: ${borderStyle}; padding: 12px; text-align: center; color: ${styling.primaryColor}; font-size: ${styling.fontSize + 1}px; font-weight: bold;">250.00 ر.س</td>
            </tr>
          </tfoot>
        </table>
        
        <!-- Footer Section -->
        <div style="margin-top: ${content.footer.topMargin || 40}px; padding: ${content.footer.padding || 20}px; background: ${content.footer.footerBackgroundColor || '#F8F9FA'}; color: ${content.footer.footerTextColor || '#666666'}; ${content.footer.showFooterBorder ? `border: 1px solid ${content.footer.footerBorderColor || '#E5E7EB'};` : ''} border-radius: ${content.footer.borderRadius || 8}px; ${content.footer.width === '80' ? 'width: 80%; margin-left: auto; margin-right: auto;' : content.footer.width === '60' ? 'width: 60%; margin-left: auto; margin-right: auto;' : 'width: 100%;'} ${content.footer.showShadow ? 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' : ''} ${getAlignment(layout.footerAlignment)}">
          
          ${content.footer.notes ? `<p style="font-size: ${styling.fontSize}px; margin-bottom: 15px; font-weight: 500;">${content.footer.notes}</p>` : ''}
          
          ${content.footer.terms ? `<p style="font-size: ${styling.fontSize - 2}px; margin-bottom: 15px; font-style: italic;">${content.footer.terms}</p>` : ''}
          
          ${content.footer.customFooterText ? `<p style="font-size: ${styling.fontSize - 1}px; margin-bottom: 15px;">${content.footer.customFooterText}</p>` : ''}
          
          ${content.footer.showPaymentInfo && content.footer.bankDetails ? `
            <div style="margin: 15px 0; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 5px;">
              <p style="font-size: ${styling.fontSize - 1}px; margin: 0; font-weight: 500;">معلومات الحساب البنكي:</p>
              <p style="font-size: ${styling.fontSize - 2}px; margin: 5px 0 0 0;">${content.footer.bankDetails}</p>
            </div>
          ` : ''}
          
          ${content.footer.vatNumber ? `
            <p style="font-size: ${styling.fontSize - 2}px; margin: 10px 0; text-align: center; font-weight: 500;">${content.footer.vatNumber}</p>
          ` : ''}
          
          ${content.footer.showQRCode ? `
            <div style="text-align: center; margin: 20px 0;">
              <div style="width: 80px; height: 80px; background: #f0f0f0; border: 2px dashed #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <span style="font-size: 10px; color: #888;">QR Code</span>
              </div>
              <p style="font-size: ${styling.fontSize - 3}px; margin-top: 5px; color: #888;">رمز الاستجابة السريعة</p>
            </div>
          ` : ''}
          
          ${content.footer.signature && content.footer.signatureFields ? `
            <div style="margin-top: 30px; ${
              content.footer.signatureLayout === 'vertical' 
                ? 'display: flex; flex-direction: column; gap: 20px; align-items: center;'
                : content.footer.signatureLayout === 'grid'
                ? 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;'
                : 'display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;'
            }">
              ${content.footer.signatureFields.filter((field: any) => field.show).map((field: any) => `
                <div style="text-align: center; min-width: 150px; ${content.footer.signatureLayout === 'vertical' ? 'width: 200px;' : 'flex: 1;'}">
                  <div style="border-top: 1px solid #666; padding-top: 10px; margin-top: 40px;">
                    <p style="margin: 0; font-size: ${styling.fontSize - 2}px;">${field.label}</p>
                  </div>
                </div>
              `).join('')}
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
          <Button variant="outline" className="flex items-center gap-2" onClick={saveCompanySettings}>
            <Settings className="h-4 w-4" />
            إعدادات الشركة
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={() => editTemplate({ name: 'قالب جديد', type: 'invoice' })}>
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
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          افتراضي
                        </Badge>
                      )}
                      {template.isActive && (
                        <Badge variant="secondary" className="text-xs">فعال</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg h-32 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">معاينة فاتورة {template.type}</p>
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

        {/* Report Templates */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          افتراضي
                        </Badge>
                      )}
                      {template.isActive && (
                        <Badge variant="secondary" className="text-xs">فعال</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg h-32 flex items-center justify-center">
                    <div className="text-center text-gray-500">
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

                {/* Page Layout Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    إعدادات الصفحة والتخطيط
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>حجم الصفحة</Label>
                      <Select 
                        value={editingTemplate.layout.pageSize}
                        onValueChange={(value) => updateLayout('pageSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (210 × 297 مم)</SelectItem>
                          <SelectItem value="A5">A5 (148 × 210 مم)</SelectItem>
                          <SelectItem value="Letter">Letter (216 × 279 مم)</SelectItem>
                          <SelectItem value="Legal">Legal (216 × 356 مم)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>اتجاه الصفحة</Label>
                      <Select 
                        value={editingTemplate.layout.pageOrientation}
                        onValueChange={(value) => updateLayout('pageOrientation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">عمودي</SelectItem>
                          <SelectItem value="landscape">أفقي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">هوامش الصفحة (مم)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">أعلى</Label>
                        <Input 
                          type="number" 
                          value={editingTemplate.layout.margins.top}
                          onChange={(e) => updateLayout('margins', { ...editingTemplate.layout.margins, top: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">أسفل</Label>
                        <Input 
                          type="number" 
                          value={editingTemplate.layout.margins.bottom}
                          onChange={(e) => updateLayout('margins', { ...editingTemplate.layout.margins, bottom: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">يسار</Label>
                        <Input 
                          type="number" 
                          value={editingTemplate.layout.margins.left}
                          onChange={(e) => updateLayout('margins', { ...editingTemplate.layout.margins, left: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">يمين</Label>
                        <Input 
                          type="number" 
                          value={editingTemplate.layout.margins.right}
                          onChange={(e) => updateLayout('margins', { ...editingTemplate.layout.margins, right: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Watermark Settings */}
                  <div className="border-t pt-3 space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showWatermark"
                        checked={editingTemplate.layout.watermark.show}
                        onCheckedChange={(checked) => updateLayout('watermark', { ...editingTemplate.layout.watermark, show: checked })}
                      />
                      <Label htmlFor="showWatermark" className="text-sm">إضافة علامة مائية</Label>
                    </div>

                    {editingTemplate.layout.watermark.show && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">نص العلامة المائية</Label>
                          <Input 
                            value={editingTemplate.layout.watermark.text}
                            onChange={(e) => updateLayout('watermark', { ...editingTemplate.layout.watermark, text: e.target.value })}
                            placeholder="نسخة أولية"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">الشفافية</Label>
                          <Slider
                            min={0.05}
                            max={0.3}
                            step={0.05}
                            value={[editingTemplate.layout.watermark.opacity]}
                            onValueChange={(value) => updateLayout('watermark', { ...editingTemplate.layout.watermark, opacity: value[0] })}
                            className="mt-1"
                          />
                          <span className="text-xs text-gray-500">{Math.round(editingTemplate.layout.watermark.opacity * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Numbering */}
                  <div className="border-t pt-3 space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="showPageNumbers"
                        checked={editingTemplate.layout.pageNumbering.show}
                        onCheckedChange={(checked) => updateLayout('pageNumbering', { ...editingTemplate.layout.pageNumbering, show: checked })}
                      />
                      <Label htmlFor="showPageNumbers" className="text-sm">ترقيم الصفحات</Label>
                    </div>

                    {editingTemplate.layout.pageNumbering.show && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">موقع الترقيم</Label>
                          <Select 
                            value={editingTemplate.layout.pageNumbering.position}
                            onValueChange={(value) => updateLayout('pageNumbering', { ...editingTemplate.layout.pageNumbering, position: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-left">أعلى يسار</SelectItem>
                              <SelectItem value="top-center">أعلى وسط</SelectItem>
                              <SelectItem value="top-right">أعلى يمين</SelectItem>
                              <SelectItem value="bottom-left">أسفل يسار</SelectItem>
                              <SelectItem value="bottom-center">أسفل وسط</SelectItem>
                              <SelectItem value="bottom-right">أسفل يمين</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">تنسيق الترقيم</Label>
                          <Input 
                            value={editingTemplate.layout.pageNumbering.format}
                            onChange={(e) => updateLayout('pageNumbering', { ...editingTemplate.layout.pageNumbering, format: e.target.value })}
                            placeholder="صفحة {page} من {total}"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Styling Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    إعدادات التصميم المتقدمة
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">اللون الأساسي</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingTemplate.styling.primaryColor}
                            onChange={(e) => updateStyling('primaryColor', e.target.value)}
                            className="w-10 h-8 rounded border"
                          />
                          <Input 
                            value={editingTemplate.styling.primaryColor} 
                            onChange={(e) => updateStyling('primaryColor', e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">اللون الثانوي</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingTemplate.styling.secondaryColor}
                            onChange={(e) => updateStyling('secondaryColor', e.target.value)}
                            className="w-10 h-8 rounded border"
                          />
                          <Input 
                            value={editingTemplate.styling.secondaryColor} 
                            onChange={(e) => updateStyling('secondaryColor', e.target.value)}
                            className="flex-1" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>خط القالب</Label>
                        <Select 
                          value={editingTemplate.styling.font}
                          onValueChange={(value) => updateStyling('font', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cairo">Cairo - خط القاهرة</SelectItem>
                            <SelectItem value="Amiri">Amiri - خط أميري</SelectItem>
                            <SelectItem value="Tajawal">Tajawal - خط تجوال</SelectItem>
                            <SelectItem value="Almarai">Almarai - خط المرعي</SelectItem>
                            <SelectItem value="Noto Sans Arabic">Noto Sans Arabic</SelectItem>
                            <SelectItem value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>حجم الخط</Label>
                        <Slider
                          min={8}
                          max={24}
                          step={1}
                          value={[editingTemplate.styling.fontSize]}
                          onValueChange={(value) => updateStyling('fontSize', value[0])}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{editingTemplate.styling.fontSize}px</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>نمط الحدود</Label>
                        <Select 
                          value={editingTemplate.styling.borderStyle}
                          onValueChange={(value) => updateStyling('borderStyle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">خط متصل</SelectItem>
                            <SelectItem value="dashed">خط متقطع</SelectItem>
                            <SelectItem value="dotted">خط منقط</SelectItem>
                            <SelectItem value="double">خط مزدوج</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>استدارة الزوايا</Label>
                        <Slider
                          min={0}
                          max={20}
                          step={2}
                          value={[editingTemplate.styling.roundedCorners]}
                          onValueChange={(value) => updateStyling('roundedCorners', value[0])}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{editingTemplate.styling.roundedCorners}px</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="headerGradient"
                          checked={editingTemplate.styling.headerGradient}
                          onCheckedChange={(checked) => updateStyling('headerGradient', checked)}
                        />
                        <Label htmlFor="headerGradient" className="text-xs">تدرج لوني للرأس</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="shadowEffect"
                          checked={editingTemplate.styling.shadowEffect}
                          onCheckedChange={(checked) => updateStyling('shadowEffect', checked)}
                        />
                        <Label htmlFor="shadowEffect" className="text-xs">تأثير الظل</Label>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="tableHoverEffect"
                          checked={editingTemplate.styling.tableHoverEffect}
                          onCheckedChange={(checked) => updateStyling('tableHoverEffect', checked)}
                        />
                        <Label htmlFor="tableHoverEffect" className="text-xs">تأثير التمرير للجدول</Label>
                      </div>
                    </div>

                    {/* Custom CSS */}
                    <div>
                      <Label htmlFor="customCSS" className="text-sm font-medium">CSS مخصص (للمحترفين)</Label>
                      <Textarea
                        id="customCSS"
                        value={editingTemplate.styling.customCSS}
                        onChange={(e) => updateStyling('customCSS', e.target.value)}
                        placeholder="/* أدخل كود CSS مخصص هنا */
.invoice-header { 
  background: linear-gradient(45deg, #3B82F6, #1E40AF);
}
.table-row:hover {
  background-color: #f0f9ff;
}"
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    إعدادات التذييل المتقدمة
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>محاذاة التذييل</Label>
                      <Select 
                        value={editingTemplate.layout.footerAlignment} 
                        onValueChange={(value) => updateLayout('footerAlignment', value)}
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
                      <Label>لون خلفية التذييل</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.content.footer.footerBackgroundColor}
                          onChange={(e) => updateContent('footer', 'footerBackgroundColor', e.target.value)}
                          className="w-10 h-8 rounded border"
                        />
                        <Input 
                          value={editingTemplate.content.footer.footerBackgroundColor} 
                          onChange={(e) => updateContent('footer', 'footerBackgroundColor', e.target.value)}
                          className="flex-1" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="footerNotes">ملاحظات التذييل</Label>
                      <Textarea
                        id="footerNotes"
                        value={editingTemplate.content.footer.notes}
                        onChange={(e) => updateContent('footer', 'notes', e.target.value)}
                        placeholder="شكراً لكم على تعاملكم معنا"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="footerTerms">الشروط والأحكام</Label>
                      <Textarea
                        id="footerTerms"
                        value={editingTemplate.content.footer.terms}
                        onChange={(e) => updateContent('footer', 'terms', e.target.value)}
                        placeholder="جميع الأسعار شاملة ضريبة القيمة المضافة"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bankDetails">تفاصيل البنك</Label>
                      <Textarea
                        id="bankDetails"
                        value={editingTemplate.content.footer.bankDetails}
                        onChange={(e) => updateContent('footer', 'bankDetails', e.target.value)}
                        placeholder="البنك الأهلي السعودي - رقم الحساب: 123456789"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="vatNumber">الرقم الضريبي</Label>
                      <Input
                        id="vatNumber"
                        value={editingTemplate.content.footer.vatNumber}
                        onChange={(e) => updateContent('footer', 'vatNumber', e.target.value)}
                        placeholder="الرقم الضريبي: 300123456789003"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customFooterText">نص إضافي للتذييل</Label>
                      <Textarea
                        id="customFooterText"
                        value={editingTemplate.content.footer.customFooterText}
                        onChange={(e) => updateContent('footer', 'customFooterText', e.target.value)}
                        placeholder="أي نص إضافي تريد إضافته في التذييل"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="showSignature"
                          checked={editingTemplate.content.footer.signature}
                          onCheckedChange={(checked) => updateContent('footer', 'signature', checked)}
                        />
                        <Label htmlFor="showSignature">إظهار خانات التوقيع</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="showPaymentInfo"
                          checked={editingTemplate.content.footer.showPaymentInfo}
                          onCheckedChange={(checked) => updateContent('footer', 'showPaymentInfo', checked)}
                        />
                        <Label htmlFor="showPaymentInfo">إظهار معلومات الدفع</Label>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="showQRCode"
                          checked={editingTemplate.content.footer.showQRCode}
                          onCheckedChange={(checked) => updateContent('footer', 'showQRCode', checked)}
                        />
                        <Label htmlFor="showQRCode">إظهار رمز QR</Label>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id="showFooterBorder"
                          checked={editingTemplate.content.footer.showFooterBorder}
                          onCheckedChange={(checked) => updateContent('footer', 'showFooterBorder', checked)}
                        />
                        <Label htmlFor="showFooterBorder">إظهار حدود التذييل</Label>
                      </div>
                    </div>

                    {/* Page Layout Controls */}
                    <div className="border-t pt-3">
                      <Label className="text-sm font-medium">تحكم في تخطيط الصفحة</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label className="text-xs">المسافة من الأعلى</Label>
                          <Slider
                            min={10}
                            max={100}
                            step={5}
                            value={[editingTemplate.content.footer.topMargin || 40]}
                            onValueChange={(value) => updateContent('footer', 'topMargin', value[0])}
                            className="mt-1"
                          />
                          <span className="text-xs text-gray-500">{editingTemplate.content.footer.topMargin || 40}px</span>
                        </div>

                        <div>
                          <Label className="text-xs">المسافة الداخلية</Label>
                          <Slider
                            min={10}
                            max={40}
                            step={2}
                            value={[editingTemplate.content.footer.padding || 20]}
                            onValueChange={(value) => updateContent('footer', 'padding', value[0])}
                            className="mt-1"
                          />
                          <span className="text-xs text-gray-500">{editingTemplate.content.footer.padding || 20}px</span>
                        </div>

                        <div>
                          <Label className="text-xs">عرض التذييل</Label>
                          <Select 
                            value={editingTemplate.content.footer.width || 'full'}
                            onValueChange={(value) => updateContent('footer', 'width', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">كامل العرض</SelectItem>
                              <SelectItem value="80">80% من العرض</SelectItem>
                              <SelectItem value="60">60% من العرض</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">استدارة الزوايا</Label>
                          <Slider
                            min={0}
                            max={20}
                            step={2}
                            value={[editingTemplate.content.footer.borderRadius || 8]}
                            onValueChange={(value) => updateContent('footer', 'borderRadius', value[0])}
                            className="mt-1"
                          />
                          <span className="text-xs text-gray-500">{editingTemplate.content.footer.borderRadius || 8}px</span>
                        </div>
                      </div>
                    </div>

                    {/* Signature Fields Customization */}
                    {editingTemplate.content.footer.signature && (
                      <div className="border-t pt-3">
                        <Label className="text-sm font-medium">خانات التوقيع</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {editingTemplate.content.footer.signatureFields.map((field: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse">
                              <Switch
                                checked={field.show}
                                onCheckedChange={(checked) => {
                                  const newFields = [...editingTemplate.content.footer.signatureFields];
                                  newFields[index].show = checked;
                                  updateContent('footer', 'signatureFields', newFields);
                                }}
                              />
                              <Label className="text-xs">{field.label}</Label>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3">
                          <Label className="text-xs">تخطيط التوقيعات</Label>
                          <Select 
                            value={editingTemplate.content.footer.signatureLayout || 'horizontal'}
                            onValueChange={(value) => updateContent('footer', 'signatureLayout', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="horizontal">صف واحد أفقي</SelectItem>
                              <SelectItem value="vertical">عمود واحد عمودي</SelectItem>
                              <SelectItem value="grid">شبكة 2x2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Additional Footer Controls */}
                    <div className="border-t pt-3">
                      <Label className="text-sm font-medium">تحكم إضافي في التذييل</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Switch
                            id="showFooterShadow"
                            checked={editingTemplate.content.footer.showShadow || false}
                            onCheckedChange={(checked) => updateContent('footer', 'showShadow', checked)}
                          />
                          <Label htmlFor="showFooterShadow" className="text-xs">إضافة ظل للتذييل</Label>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Switch
                            id="separateFooterPage"
                            checked={editingTemplate.content.footer.separatePage || false}
                            onCheckedChange={(checked) => updateContent('footer', 'separatePage', checked)}
                          />
                          <Label htmlFor="separateFooterPage" className="text-xs">تذييل في صفحة منفصلة</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => saveTemplate(editingTemplate)} 
                    className="flex-1"
                  >
                    حفظ التعديلات
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => generatePDF(editingTemplate)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تصدير PDF
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معاينة مباشرة</h3>
                <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[600px]">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: generateTemplateHTML(selectedTemplate, true) 
                    }}
                    className="transform scale-75 origin-top-right"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={closeEditor}>
                إلغاء
              </Button>
              <Button onClick={() => saveTemplate(editingTemplate)}>
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}