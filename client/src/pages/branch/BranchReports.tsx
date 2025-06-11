import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Eye,
  FileText,
  PieChart,
  Warehouse,
  ShoppingCart,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BranchReportsProps {
  branchId: number;
}

export default function BranchReports({ branchId }: BranchReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('reports-content');
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
      pdf.text(`تقرير الفرع ${branchId} - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-الفرع-${branchId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000,
  });

  // جلب بيانات المبيعات والمنتجات للتقارير اليومية
  const { data: sales } = useQuery({
    queryKey: ['/api/sales'],
    staleTime: 60000,
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 60000,
  });

  // جلب مدفوعات العملاء
  const { data: clientPayments } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId} - تقارير شاملة ومفصلة</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'جاري إنشاء PDF...' : 'حفظ PDF'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقارير
          </Button>
        </div>
      </div>

      <div id="reports-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* تقرير المبيعات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.totalSales || '0.00'} ر.س</div>
              <p className="text-xs text-muted-foreground">
                +12% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          {/* تقرير العملاء */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.totalClients || '0'}</div>
              <p className="text-xs text-muted-foreground">
                +5 عملاء جدد هذا الشهر
              </p>
            </CardContent>
          </Card>

          {/* تقرير المنتجات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                منتجات متاحة
              </p>
            </CardContent>
          </Card>

          {/* تقرير المخزون */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.inventoryValue || '0.00'} ر.س</div>
              <p className="text-xs text-muted-foreground">
                إجمالي قيمة المخزون
              </p>
            </CardContent>
          </Card>
        </div>

        {/* التقارير التفصيلية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>المبيعات المسجلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sales && Array.isArray(sales) && sales.length > 0 ? (
                sales.map((sale: any, index: number) => {
                  const saleDate = new Date(sale.date).toLocaleDateString('ar-SA');
                  const value = parseFloat(sale.total || 0);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">فاتورة رقم {sale.id}</div>
                        <div className="text-sm text-gray-600">{saleDate}</div>
                      </div>
                      <div className="font-bold text-green-600">{value.toFixed(2)} ر.س</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد مبيعات مسجلة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المدفوعات من العملاء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientPayments && Array.isArray(clientPayments) && clientPayments.length > 0 ? (
                clientPayments.map((payment: any, index: number) => {
                  const paymentDate = new Date(payment.receiptDate).toLocaleDateString('ar-SA');
                  const amount = parseFloat(payment.amount || 0);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">سند قبض رقم {payment.voucherNumber}</div>
                        <div className="text-sm text-gray-600">{paymentDate}</div>
                      </div>
                      <div className="font-bold text-blue-600">{amount.toFixed(2)} ر.س</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد مدفوعات من العملاء في هذا التاريخ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* تقرير المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات المتاحة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {products && Array.isArray(products) && products.length > 0 ? (
              products.slice(0, 5).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      كود: {product.code} {product.barcode && `| باركود: ${product.barcode}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{product.price} ر.س</div>
                    <div className="text-sm text-gray-600">السعر</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد منتجات مضافة حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* تقرير إضافي */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sales && Array.isArray(sales) ? sales.length : 0}
                </div>
                <div className="text-sm text-gray-600">إجمالي الفواتير</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {products && Array.isArray(products) ? products.length : 0}
                </div>
                <div className="text-sm text-gray-600">المنتجات المتاحة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(stats as any)?.totalClients || 0}
                </div>
                <div className="text-sm text-gray-600">العملاء المسجلين</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}