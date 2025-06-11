import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Eye, 
  Settings,
  Palette,
  Layout,
  Copy,
  Star,
  Upload,
  Save
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import TemplateEditor from '@/components/TemplateEditor';
import CompanySettingsForm from '@/components/CompanySettingsForm';

export default function TemplateManagement() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('invoice');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  useEffect(() => {
    setCurrentPage('إدارة القوالب');
  }, [location, setCurrentPage]);

  // Fetch invoice templates
  const { data: invoiceTemplates = [] } = useQuery({
    queryKey: ['/api/invoice-templates'],
    staleTime: 60000,
  });

  // Fetch report templates
  const { data: reportTemplates = [] } = useQuery({
    queryKey: ['/api/report-templates'],
    staleTime: 60000,
  });

  // Fetch company settings
  const { data: companySettings } = useQuery({
    queryKey: ['/api/company-settings'],
    staleTime: 60000,
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (template: any) => {
      const endpoint = selectedType === 'invoice' ? '/api/invoice-templates' : '/api/report-templates';
      return apiRequest(endpoint, 'POST', template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setShowEditor(false);
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, template }: { id: number; template: any }) => {
      const endpoint = selectedType === 'invoice' ? `/api/invoice-templates/${id}` : `/api/report-templates/${id}`;
      return apiRequest(endpoint, 'PATCH', template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setShowEditor(false);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => {
      const endpoint = selectedType === 'invoice' ? `/api/invoice-templates/${id}` : `/api/report-templates/${id}`;
      return apiRequest(endpoint, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });

  // Set default template mutation
  const setDefaultMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: string }) => {
      const endpoint = selectedType === 'invoice' 
        ? `/api/invoice-templates/${id}/set-default` 
        : `/api/report-templates/${id}/set-default`;
      return apiRequest(endpoint, 'POST', { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });

  const currentTemplates = selectedType === 'invoice' ? invoiceTemplates : reportTemplates;

  const templateTypes = selectedType === 'invoice' 
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

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      await deleteTemplateMutation.mutateAsync(id);
    }
  };

  const handleSetDefault = async (id: number, type: string) => {
    await setDefaultMutation.mutateAsync({ id, type });
  };

  const handleDuplicateTemplate = async (template: any) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} - نسخة`,
      isDefault: false,
    };
    delete duplicatedTemplate.id;
    delete duplicatedTemplate.createdAt;
    delete duplicatedTemplate.updatedAt;
    
    await createTemplateMutation.mutateAsync(duplicatedTemplate);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة القوالب</h1>
          <p className="text-gray-600 mt-2">إنشاء وتخصيص قوالب الفواتير والتقارير</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCompanySettings(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            إعدادات الشركة
          </Button>
          <Button 
            onClick={handleCreateTemplate}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إنشاء قالب جديد
          </Button>
        </div>
      </div>

      {/* Template Type Selector */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            قوالب الفواتير
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            قوالب التقارير
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-6">
          {/* Templates Grid */}
          {currentTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTemplates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              افتراضي
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {templateTypes.find(t => t.value === template.type)?.label || template.type}
                        </p>
                      </div>
                      <Badge 
                        variant={template.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {template.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Template Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 min-h-32 flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">معاينة القالب</p>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">اللون الأساسي:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.settings?.primaryColor || '#3B82F6' }}
                          />
                          <span>{template.settings?.primaryColor || '#3B82F6'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الإنشاء:</span>
                        <span>{new Date(template.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!template.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(template.id, template.type)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد قوالب {selectedType === 'invoice' ? 'فواتير' : 'تقارير'}
                </h3>
                <p className="text-gray-600 mb-4">
                  ابدأ بإنشاء قالب جديد لتخصيص شكل {selectedType === 'invoice' ? 'الفواتير' : 'التقارير'}
                </p>
                <Button 
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء قالب جديد
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'تعديل القالب' : 'إنشاء قالب جديد'}
            </DialogTitle>
          </DialogHeader>
          <TemplateEditor
            template={selectedTemplate}
            templateType={selectedType}
            onSave={(template) => {
              if (selectedTemplate) {
                updateTemplateMutation.mutate({ id: selectedTemplate.id, template });
              } else {
                createTemplateMutation.mutate(template);
              }
            }}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Company Settings Dialog */}
      <Dialog open={showCompanySettings} onOpenChange={setShowCompanySettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إعدادات الشركة</DialogTitle>
          </DialogHeader>
          <CompanySettingsForm
            settings={companySettings}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
              setShowCompanySettings(false);
            }}
            onCancel={() => setShowCompanySettings(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}