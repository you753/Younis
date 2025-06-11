import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign,
  Package,
  Eye,
  Edit,
  Printer,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BranchPurchasesProps {
  branchId: number;
}

export default function BranchPurchases({ branchId }: BranchPurchasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePurchasesPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('purchases-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // إضافة عنوان التقرير
      pdf.setFontSize(20);
      pdf.text(`تقرير المشتريات - الفرع ${branchId} - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-المشتريات-الفرع-${branchId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/purchases`],
    queryFn: async () => {
      const response = await fetch('/api/purchases');
      if (!response.ok) throw new Error('فشل في جلب المشتريات');
      return response.json();
    }
  });

  return (
    <div className="p-6" id="purchases-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشتريات - الفرع {branchId}</h1>
          <p className="text-gray-600">إدارة مشتريات هذا الفرع</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={generatePurchasesPDF}
            disabled={isGeneratingPDF}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            ) : (
              <Download className="ml-2 h-4 w-4" />
            )}
            {isGeneratingPDF ? 'جاري إنشاء PDF...' : 'حفظ PDF'}
          </Button>
          <Button variant="outline" size="sm">
            تصدير Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مشترية جديدة
          </Button>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المشتريات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Input type="date" placeholder="من تاريخ" />
            <Input type="date" placeholder="إلى تاريخ" />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات المشتريات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                <p className="text-xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي القيمة</p>
                <p className="text-xl font-bold text-green-600">0.00 ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">هذا الشهر</p>
                <p className="text-xl font-bold text-orange-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">أصناف مشتراة</p>
                <p className="text-xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة المشتريات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            قائمة المشتريات - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مشتريات في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة مشتريات خاصة بهذا الفرع</p>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مشترية جديدة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">رقم الفاتورة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">المورد</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجمالي</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase: any) => (
                    <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{purchase.id}</td>
                      <td className="py-3 px-4">{purchase.supplierName || 'غير محدد'}</td>
                      <td className="py-3 px-4">{new Date(purchase.date).toLocaleDateString('ar-SA')}</td>
                      <td className="py-3 px-4">{purchase.total} ر.س</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">مكتملة</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}