import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Settings,
  Upload,
  RefreshCw
} from 'lucide-react';

interface TemplateEditorProps {
  template?: any;
  templateType: 'invoice' | 'report';
  onSave: (template: any) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template, templateType, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || (templateType === 'invoice' ? 'invoice' : 'sales'),
    htmlContent: template?.htmlContent || getDefaultTemplate(templateType),
    cssStyles: template?.cssStyles || getDefaultStyles(),
    isActive: template?.isActive ?? true,
    settings: {
      logoUrl: template?.settings?.logoUrl || '',
      primaryColor: template?.settings?.primaryColor || '#3B82F6',
      secondaryColor: template?.settings?.secondaryColor || '#1E40AF',
      fontFamily: template?.settings?.fontFamily || 'Cairo',
      fontSize: template?.settings?.fontSize || '14px',
      showCompanyInfo: template?.settings?.showCompanyInfo ?? true,
      showTaxInfo: template?.settings?.showTaxInfo ?? true,
      showBankInfo: template?.settings?.showBankInfo ?? true,
      paperSize: template?.settings?.paperSize || 'A4',
      orientation: template?.settings?.orientation || 'portrait',
      ...template?.settings
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const previewRef = useRef<HTMLIFrameElement>(null);

  const templateTypes = templateType === 'invoice' 
    ? [
        { value: 'invoice', label: 'فاتورة مبيعات' },
        { value: 'receipt', label: 'سند قبض' },
        { value: 'quotation', label: 'عرض سعر' },
        { value: 'purchase_order', label: 'أمر شراء' }
      ]
    : [
        { value: 'sales', label: 'تقرير المبيعات' },
        { value: 'inventory', label: 'تقرير المخزون' },
        { value: 'financial', label: 'التقرير المالي' },
        { value: 'clients', label: 'تقرير العملاء' },
        { value: 'suppliers', label: 'تقرير الموردين' },
        { value: 'employees', label: 'تقرير الموظفين' }
      ];

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingField = field.replace('settings.', '');
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const generatePreview = () => {
    const processedHtml = processTemplate(formData.htmlContent, getSampleData());
    const fullHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>معاينة القالب</title>
        <style>
          ${formData.cssStyles}
          :root {
            --primary-color: ${formData.settings.primaryColor};
            --secondary-color: ${formData.settings.secondaryColor};
            --font-family: ${formData.settings.fontFamily};
            --font-size: ${formData.settings.fontSize};
          }
          body {
            font-family: var(--font-family), 'Cairo', sans-serif;
            font-size: var(--font-size);
            margin: 0;
            padding: 20px;
            background: white;
          }
        </style>
      </head>
      <body>
        ${processedHtml}
      </body>
      </html>
    `;
    
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(fullHtml);
        doc.close();
      }
    }
  };

  useEffect(() => {
    if (previewMode) {
      generatePreview();
    }
  }, [previewMode, formData]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">
            {template ? 'تعديل القالب' : 'إنشاء قالب جديد'}
          </h3>
          <p className="text-sm text-gray-600">
            {templateTypes.find(t => t.value === formData.type)?.label}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'التصميم' : 'معاينة'}
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            حفظ
          </Button>
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode ? (
          <div className="h-full p-4">
            <iframe
              ref={previewRef}
              className="w-full h-full border rounded-lg"
              title="معاينة القالب"
            />
          </div>
        ) : (
          <div className="h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="design" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  التصميم
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  المحتوى
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  التنسيق
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 p-4 overflow-y-auto">
                <TabsContent value="design" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات القالب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">اسم القالب</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="أدخل اسم القالب"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="type">نوع القالب</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templateTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="isActive">قالب نشط</Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>عناصر القالب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showCompanyInfo"
                            checked={formData.settings.showCompanyInfo}
                            onChange={(e) => handleInputChange('settings.showCompanyInfo', e.target.checked)}
                          />
                          <Label htmlFor="showCompanyInfo">معلومات الشركة</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showTaxInfo"
                            checked={formData.settings.showTaxInfo}
                            onChange={(e) => handleInputChange('settings.showTaxInfo', e.target.checked)}
                          />
                          <Label htmlFor="showTaxInfo">معلومات الضريبة</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showBankInfo"
                            checked={formData.settings.showBankInfo}
                            onChange={(e) => handleInputChange('settings.showBankInfo', e.target.checked)}
                          />
                          <Label htmlFor="showBankInfo">معلومات البنك</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>محتوى HTML</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={formData.htmlContent}
                        onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                        rows={20}
                        className="font-mono text-sm"
                        placeholder="أدخل كود HTML للقالب..."
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>استخدم المتغيرات التالية:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getAvailableVariables(templateType).map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="style" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>الألوان والخطوط</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">اللون الأساسي</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              id="primaryColor"
                              value={formData.settings.primaryColor}
                              onChange={(e) => handleInputChange('settings.primaryColor', e.target.value)}
                              className="w-12 h-10 rounded border"
                            />
                            <Input
                              value={formData.settings.primaryColor}
                              onChange={(e) => handleInputChange('settings.primaryColor', e.target.value)}
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={formData.settings.secondaryColor}
                              onChange={(e) => handleInputChange('settings.secondaryColor', e.target.value)}
                              className="w-12 h-10 rounded border"
                            />
                            <Input
                              value={formData.settings.secondaryColor}
                              onChange={(e) => handleInputChange('settings.secondaryColor', e.target.value)}
                              placeholder="#1E40AF"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fontFamily">نوع الخط</Label>
                          <Select value={formData.settings.fontFamily} onValueChange={(value) => handleInputChange('settings.fontFamily', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                              <SelectItem value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="fontSize">حجم الخط</Label>
                          <Select value={formData.settings.fontSize} onValueChange={(value) => handleInputChange('settings.fontSize', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12px">12px - صغير</SelectItem>
                              <SelectItem value="14px">14px - متوسط</SelectItem>
                              <SelectItem value="16px">16px - كبير</SelectItem>
                              <SelectItem value="18px">18px - كبير جداً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>أنماط CSS المخصصة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={formData.cssStyles}
                        onChange={(e) => handleInputChange('cssStyles', e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                        placeholder="أدخل أنماط CSS المخصصة..."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات الطباعة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paperSize">حجم الورق</Label>
                          <Select value={formData.settings.paperSize} onValueChange={(value) => handleInputChange('settings.paperSize', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A5">A5</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                              <SelectItem value="Legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="orientation">اتجاه الصفحة</Label>
                          <Select value={formData.settings.orientation} onValueChange={(value) => handleInputChange('settings.orientation', value)}>
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>شعار الشركة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="logoUrl">رابط الشعار</Label>
                        <Input
                          id="logoUrl"
                          value={formData.settings.logoUrl}
                          onChange={(e) => handleInputChange('settings.logoUrl', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        رفع شعار جديد
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getDefaultTemplate(type: 'invoice' | 'report'): string {
  if (type === 'invoice') {
    return `
<div class="invoice-container">
  <header class="invoice-header">
    {{#if company.logoUrl}}
      <img src="{{company.logoUrl}}" alt="شعار الشركة" class="company-logo" />
    {{/if}}
    <div class="company-info">
      <h1>{{company.name}}</h1>
      <p>{{company.address}}</p>
      <p>هاتف: {{company.phone}} | إيميل: {{company.email}}</p>
      {{#if settings.showTaxInfo}}
        <p>الرقم الضريبي: {{company.taxNumber}}</p>
      {{/if}}
    </div>
  </header>

  <div class="invoice-details">
    <div class="invoice-meta">
      <h2>فاتورة رقم: {{invoice.number}}</h2>
      <p>التاريخ: {{invoice.date}}</p>
    </div>
    
    <div class="client-info">
      <h3>بيانات العميل:</h3>
      <p><strong>{{client.name}}</strong></p>
      <p>{{client.address}}</p>
      <p>هاتف: {{client.phone}}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>الصنف</th>
        <th>الكمية</th>
        <th>السعر</th>
        <th>الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{this.name}}</td>
        <td>{{this.quantity}}</td>
        <td>{{this.price}} ر.س</td>
        <td>{{this.total}} ر.س</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="invoice-totals">
    <div class="total-row">
      <span>المجموع الفرعي:</span>
      <span>{{invoice.subtotal}} ر.س</span>
    </div>
    <div class="total-row">
      <span>الضريبة (15%):</span>
      <span>{{invoice.tax}} ر.س</span>
    </div>
    <div class="total-row final-total">
      <span>المجموع النهائي:</span>
      <span>{{invoice.total}} ر.س</span>
    </div>
  </div>

  {{#if settings.showBankInfo}}
  <footer class="invoice-footer">
    <h4>معلومات البنك:</h4>
    <p>البنك: {{company.bankName}}</p>
    <p>رقم الحساب: {{company.bankAccount}}</p>
    <p>IBAN: {{company.iban}}</p>
  </footer>
  {{/if}}
</div>`;
  } else {
    return `
<div class="report-container">
  <header class="report-header">
    {{#if company.logoUrl}}
      <img src="{{company.logoUrl}}" alt="شعار الشركة" class="company-logo" />
    {{/if}}
    <div class="company-info">
      <h1>{{company.name}}</h1>
      <h2>{{report.title}}</h2>
      <p>الفترة: من {{report.dateFrom}} إلى {{report.dateTo}}</p>
    </div>
  </header>

  {{#if settings.showSummary}}
  <section class="report-summary">
    <h3>ملخص التقرير</h3>
    <div class="summary-cards">
      {{#each summary}}
      <div class="summary-card">
        <h4>{{this.label}}</h4>
        <p class="summary-value">{{this.value}}</p>
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}

  <section class="report-data">
    <h3>تفاصيل البيانات</h3>
    <table class="data-table">
      <thead>
        <tr>
          {{#each headers}}
            <th>{{this}}</th>
          {{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each rows}}
        <tr>
          {{#each this}}
            <td>{{this}}</td>
          {{/each}}
        </tr>
        {{/each}}
      </tbody>
    </table>
  </section>

  <footer class="report-footer">
    <p>تم إنشاء هذا التقرير في {{report.generatedAt}}</p>
    <p>{{company.name}} - نظام المحاسب الأعظم</p>
  </footer>
</div>`;
  }
}

function getDefaultStyles(): string {
  return `
.invoice-container, .report-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: var(--font-family), 'Cairo', sans-serif;
  font-size: var(--font-size);
  line-height: 1.6;
  color: #333;
}

.invoice-header, .report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--primary-color);
}

.company-logo {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
}

.company-info {
  text-align: right;
  flex: 1;
}

.company-info h1 {
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 1.5em;
  font-weight: bold;
}

.invoice-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.invoice-meta h2 {
  color: var(--secondary-color);
  margin: 0 0 10px 0;
}

.client-info h3 {
  color: var(--secondary-color);
  margin: 0 0 10px 0;
}

.items-table, .data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.items-table th, .data-table th {
  background-color: var(--primary-color);
  color: white;
  padding: 12px;
  text-align: right;
  font-weight: bold;
}

.items-table td, .data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
  text-align: right;
}

.items-table tr:nth-child(even), .data-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.invoice-totals {
  margin-bottom: 30px;
  text-align: right;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.final-total {
  font-weight: bold;
  font-size: 1.2em;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.report-summary {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.summary-card {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.summary-card h4 {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  opacity: 0.9;
}

.summary-value {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
}

.invoice-footer, .report-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

@media print {
  .invoice-container, .report-container {
    max-width: none;
    margin: 0;
    padding: 0;
  }
  
  .invoice-header, .report-header {
    break-inside: avoid;
  }
  
  .items-table, .data-table {
    break-inside: avoid;
  }
}`;
}

function getAvailableVariables(type: 'invoice' | 'report'): string[] {
  if (type === 'invoice') {
    return [
      '{{company.name}}', '{{company.address}}', '{{company.phone}}', '{{company.email}}',
      '{{company.taxNumber}}', '{{company.logoUrl}}', '{{invoice.number}}', '{{invoice.date}}',
      '{{invoice.total}}', '{{invoice.subtotal}}', '{{invoice.tax}}', '{{client.name}}',
      '{{client.address}}', '{{client.phone}}', '{{items}}', '{{settings.showTaxInfo}}',
      '{{settings.showBankInfo}}', '{{company.bankName}}', '{{company.bankAccount}}', '{{company.iban}}'
    ];
  } else {
    return [
      '{{company.name}}', '{{company.logoUrl}}', '{{report.title}}', '{{report.dateFrom}}',
      '{{report.dateTo}}', '{{report.generatedAt}}', '{{summary}}', '{{headers}}', '{{rows}}',
      '{{settings.showSummary}}', '{{settings.showCharts}}'
    ];
  }
}

function processTemplate(template: string, data: any): string {
  // Simple template processing - replace {{variable}} with data values
  let processed = template;
  
  // Process simple variables
  processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return match; // Return original if path not found
      }
    }
    
    return String(value || '');
  });
  
  // Process conditionals {{#if condition}}...{{/if}}
  processed = processed.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    const keys = condition.trim().split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = false;
        break;
      }
    }
    
    return value ? content : '';
  });
  
  // Process loops {{#each array}}...{{/each}}
  processed = processed.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, itemTemplate) => {
    const keys = arrayPath.trim().split('.');
    let array = data;
    
    for (const key of keys) {
      if (array && typeof array === 'object' && key in array) {
        array = array[key];
      } else {
        return '';
      }
    }
    
    if (!Array.isArray(array)) return '';
    
    return array.map(item => {
      return itemTemplate.replace(/\{\{this\.([^}]+)\}\}/g, (match, prop) => {
        return String(item[prop] || '');
      }).replace(/\{\{this\}\}/g, String(item));
    }).join('');
  });
  
  return processed;
}

function getSampleData() {
  return {
    company: {
      name: 'شركة المحاسب الأعظم',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966 50 123 4567',
      email: 'info@almohaseb.com',
      taxNumber: '123456789',
      logoUrl: '/logo.png',
      bankName: 'البنك الأهلي السعودي',
      bankAccount: '12345678901',
      iban: 'SA1234567890123456789012'
    },
    invoice: {
      number: 'INV-2025-001',
      date: '2025-06-11',
      subtotal: '1000.00',
      tax: '150.00',
      total: '1150.00'
    },
    client: {
      name: 'عميل تجريبي',
      address: 'جدة، المملكة العربية السعودية',
      phone: '+966 55 987 6543'
    },
    items: [
      { name: 'منتج تجريبي 1', quantity: 2, price: '250.00', total: '500.00' },
      { name: 'منتج تجريبي 2', quantity: 1, price: '500.00', total: '500.00' }
    ],
    report: {
      title: 'تقرير المبيعات الشهري',
      dateFrom: '2025-06-01',
      dateTo: '2025-06-30',
      generatedAt: '2025-06-11 19:17:00'
    },
    summary: [
      { label: 'إجمالي المبيعات', value: '50,000 ر.س' },
      { label: 'عدد الفواتير', value: '25' },
      { label: 'متوسط الفاتورة', value: '2,000 ر.س' }
    ],
    headers: ['التاريخ', 'رقم الفاتورة', 'العميل', 'المبلغ'],
    rows: [
      ['2025-06-01', 'INV-001', 'عميل 1', '1,500 ر.س'],
      ['2025-06-02', 'INV-002', 'عميل 2', '2,300 ر.س'],
      ['2025-06-03', 'INV-003', 'عميل 3', '1,800 ر.س']
    ],
    settings: {
      showTaxInfo: true,
      showBankInfo: true,
      showSummary: true,
      showCharts: false
    }
  };
}