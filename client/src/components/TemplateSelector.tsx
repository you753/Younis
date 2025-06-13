import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout, Eye, Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  styling: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    font: string;
    fontSize: number;
  };
  layout: {
    headerAlignment: string;
    footerAlignment: string;
    showBorder: boolean;
    showGridLines: boolean;
  };
  content: {
    header: {
      title: string;
      showLogo: boolean;
      showCompanyInfo: boolean;
    };
    footer: {
      notes: string;
      terms: string;
    };
  };
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template | null) => void;
  selectedTemplate?: Template | null;
  triggerButton?: React.ReactNode;
}

export default function TemplateSelector({ 
  onSelectTemplate, 
  selectedTemplate, 
  triggerButton 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('invoiceTemplates');
      const parsedTemplates = saved ? JSON.parse(saved) : [];
      
      // Add default template if no templates exist
      if (parsedTemplates.length === 0) {
        const defaultTemplate: Template = {
          id: 'default',
          name: 'القالب الافتراضي',
          type: 'invoice',
          description: 'القالب الأساسي للفواتير',
          isDefault: true,
          styling: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            backgroundColor: '#FFFFFF',
            font: 'Cairo',
            fontSize: 14,
          },
          layout: {
            headerAlignment: 'center',
            footerAlignment: 'center',
            showBorder: true,
            showGridLines: true,
          },
          content: {
            header: {
              title: 'فــــاتــــورة',
              showLogo: true,
              showCompanyInfo: true,
            },
            footer: {
              notes: 'شكراً لكم على تعاملكم معنا',
              terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة',
            },
          },
        };
        parsedTemplates.push(defaultTemplate);
      }
      
      setTemplates(parsedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Layout className="h-4 w-4" />
      اختيار القالب
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">اختيار قالب الفاتورة</DialogTitle>
          <DialogDescription className="text-right">
            اختر القالب المناسب لطباعة هذه الفاتورة
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* خيار عدم استخدام قالب */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              !selectedTemplate ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleSelectTemplate(null as any)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">بدون قالب مخصص</CardTitle>
                {!selectedTemplate && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <CardDescription className="text-xs">
                استخدام التصميم الافتراضي للنظام
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-20 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500">تصميم افتراضي</span>
              </div>
            </CardContent>
          </Card>

          {/* القوالب المحفوظة */}
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  {selectedTemplate?.id === template.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  {template.description || 'قالب مخصص للفواتير'}
                </CardDescription>
                <div className="flex gap-1">
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">افتراضي</Badge>
                  )}
                  {template.isActive && (
                    <Badge variant="default" className="text-xs">نشط</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* معاينة مصغرة للقالب */}
                <div 
                  className="h-20 rounded border-2 flex flex-col justify-between p-2"
                  style={{
                    backgroundColor: template.styling.backgroundColor,
                    borderColor: template.styling.primaryColor,
                    fontFamily: template.styling.font,
                  }}
                >
                  <div 
                    className="text-center text-xs font-semibold"
                    style={{ color: template.styling.primaryColor }}
                  >
                    {template.content.header.title}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div 
                      className="w-full h-1 rounded"
                      style={{ backgroundColor: template.styling.secondaryColor }}
                    ></div>
                  </div>
                  <div 
                    className="text-center text-xs"
                    style={{ color: template.styling.primaryColor }}
                  >
                    {template.styling.font} - {template.styling.fontSize}px
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={() => setOpen(false)}>
            تطبيق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}