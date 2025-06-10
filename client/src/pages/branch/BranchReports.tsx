import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Download,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

interface BranchReportsProps {
  branchId: number;
}

export default function BranchReports({ branchId }: BranchReportsProps) {
  const reportTypes = [
    {
      title: 'تقرير المبيعات',
      description: 'تقرير شامل عن مبيعات الفرع',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'تقرير المخزون',
      description: 'حالة المخزون والأصناف',
      icon: Package,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'تقرير العملاء',
      description: 'بيانات وإحصائيات العملاء',
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'التقرير المالي',
      description: 'الأرباح والخسائر',
      icon: DollarSign,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير - الفرع {branchId}</h1>
          <p className="text-gray-600">إنشاء وعرض تقارير مفصلة للفرع</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="ml-2 h-4 w-4" />
          تصدير جميع التقارير
        </Button>
      </div>

      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-xl font-bold">15.00 ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">أصناف المخزون</p>
                <p className="text-xl font-bold">9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">العملاء النشطين</p>
                <p className="text-xl font-bold">10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">نمو المبيعات</p>
                <p className="text-xl font-bold">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أنواع التقارير */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const IconComponent = report.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${report.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="ml-2 h-4 w-4" />
                    عرض التقرير
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* تقارير سريعة */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقارير سريعة - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">تقرير يومي</div>
                <div className="text-sm text-gray-500">مبيعات ومشتريات اليوم</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">تقرير أسبوعي</div>
                <div className="text-sm text-gray-500">ملخص الأسبوع الحالي</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">تقرير شهري</div>
                <div className="text-sm text-gray-500">أداء الشهر الحالي</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}