import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Templates = () => {
  const [activeTab, setActiveTab] = useState('invoice');

  // Mock data for invoice templates
  const invoiceTemplates = [
    {
      id: 1,
      name: 'فاتورة عادية',
      description: 'تصميم بسيط للفواتير اليومية',
      type: 'standard',
      createdAt: '2025-01-15',
      status: 'active',
      preview: '/api/templates/preview/1'
    },
    {
      id: 2,
      name: 'فاتورة احترافية',
      description: 'تصميم احترافي للعملاء المهمين',
      type: 'professional',
      createdAt: '2025-01-10',
      status: 'active',
      preview: '/api/templates/preview/2'
    },
    {
      id: 3,
      name: 'فاتورة ضريبية مفصلة',
      description: 'فاتورة متوافقة مع متطلبات الضريبة',
      type: 'tax',
      createdAt: '2025-01-05',
      status: 'active',
      preview: '/api/templates/preview/3'
    }
  ];

  // Mock data for report templates
  const reportTemplates = [
    {
      id: 1,
      name: 'تقرير المبيعات الشهري',
      description: 'تقرير شامل للمبيعات الشهرية',
      type: 'sales',
      createdAt: '2025-01-12',
      status: 'active'
    },
    {
      id: 2,
      name: 'تقرير المخزون',
      description: 'تقرير حالة المخزون والحركة',
      type: 'inventory',
      createdAt: '2025-01-08',
      status: 'active'
    },
    {
      id: 3,
      name: 'تقرير الأرباح والخسائر',
      description: 'تقرير مالي شامل للأرباح',
      type: 'financial',
      createdAt: '2025-01-03',
      status: 'draft'
    }
  ];

  // Mock data for branch templates
  const branchTemplates = [
    {
      id: 1,
      name: 'قالب الفرع الرئيسي',
      description: 'إعدادات افتراضية للفرع الرئيسي',
      type: 'main',
      createdAt: '2025-01-20',
      status: 'active'
    },
    {
      id: 2,
      name: 'قالب الفرع الفرعي',
      description: 'إعدادات للفروع الفرعية',
      type: 'sub',
      createdAt: '2025-01-18',
      status: 'active'
    }
  ];

  const TemplateCard = ({ template, type }: { template: any, type: string }) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'invoice': return <FileText className="h-5 w-5" />;
        case 'report': return <BarChart3 className="h-5 w-5" />;
        case 'branch': return <Users className="h-5 w-5" />;
        default: return <FileText className="h-5 w-5" />;
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon()}
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
            </div>
            <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
              {template.status === 'active' ? 'نشط' : 'مسودة'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>تاريخ الإنشاء: {template.createdAt}</span>
            <span>النوع: {template.type}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 ml-2" />
              معاينة
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة القوالب</h1>
          <p className="text-muted-foreground">إدارة قوالب الفواتير والتقارير والفروع</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          قالب جديد
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoice">قوالب الفواتير</TabsTrigger>
          <TabsTrigger value="report">قوالب التقارير</TabsTrigger>
          <TabsTrigger value="branch">قوالب الفروع</TabsTrigger>
        </TabsList>

        {/* Invoice Templates */}
        <TabsContent value="invoice" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">قوالب الفواتير ({invoiceTemplates.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 ml-2" />
                استيراد قالب
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                قالب جديد
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoiceTemplates.map(template => (
              <TemplateCard key={template.id} template={template} type="invoice" />
            ))}
          </div>
        </TabsContent>

        {/* Report Templates */}
        <TabsContent value="report" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">قوالب التقارير ({reportTemplates.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 ml-2" />
                استيراد قالب
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                قالب جديد
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map(template => (
              <TemplateCard key={template.id} template={template} type="report" />
            ))}
          </div>
        </TabsContent>

        {/* Branch Templates */}
        <TabsContent value="branch" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">قوالب الفروع ({branchTemplates.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 ml-2" />
                استيراد قالب
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                قالب جديد
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branchTemplates.map(template => (
              <TemplateCard key={template.id} template={template} type="branch" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;