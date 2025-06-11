import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FinancialSnapshot from '@/components/FinancialSnapshot';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Filter,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch financial data
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    staleTime: 60000,
  });

  const { data: clientPayments = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    staleTime: 60000,
  });

  const { data: supplierPayments = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
    staleTime: 60000,
  });

  // Calculate financial metrics
  const totalSales = Array.isArray(sales) ? sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0) : 0;
  const totalClientPayments = Array.isArray(clientPayments) ? clientPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0) : 0;
  const totalSupplierPayments = Array.isArray(supplierPayments) ? supplierPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0) : 0;

  const generateDetailedReport = async () => {
    setIsGeneratingReport(true);
    try {
      const element = document.getElementById('detailed-financial-report');
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

      // Add report title
      pdf.setFontSize(20);
      pdf.text(`التقرير المالي المفصل - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`التقرير-المالي-المفصل-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-600 mt-2">تقارير مالية شاملة ولقطات سريعة</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateDetailedReport}
            disabled={isGeneratingReport}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGeneratingReport ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingReport ? 'جاري الإنشاء...' : 'تقرير مفصل PDF'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            خيارات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">الفترة الزمنية</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="quarter">هذا الربع</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">ملخص مالي</SelectItem>
                  <SelectItem value="detailed">تقرير مفصل</SelectItem>
                  <SelectItem value="cashflow">التدفق النقدي</SelectItem>
                  <SelectItem value="comparison">مقارنة الفترات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Snapshot */}
      <FinancialSnapshot companyWide={true} />

      {/* Detailed Financial Report */}
      <div id="detailed-financial-report">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              التقرير المالي المفصل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المدفوعات الواردة</p>
                    <p className="text-2xl font-bold text-green-600">{totalClientPayments.toFixed(2)} ر.س</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المدفوعات الصادرة</p>
                    <p className="text-2xl font-bold text-orange-600">{totalSupplierPayments.toFixed(2)} ر.س</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">صافي التدفق</p>
                    <p className={`text-2xl font-bold ${(totalClientPayments - totalSupplierPayments) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(totalClientPayments - totalSupplierPayments).toFixed(2)} ر.س
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">آخر المبيعات</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(sales) && sales.length > 0 ? (
                    <div className="space-y-3">
                      {sales.slice(0, 5).map((sale: any) => (
                        <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">فاتورة #{sale.id}</div>
                            <div className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString('ar-SA')}</div>
                          </div>
                          <Badge variant="default">{parseFloat(sale.total).toFixed(2)} ر.س</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد مبيعات حديثة</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">آخر المدفوعات</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(clientPayments) && clientPayments.length > 0 ? (
                    <div className="space-y-3">
                      {clientPayments.slice(0, 5).map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">سند #{payment.voucherNumber?.slice(-4)}</div>
                            <div className="text-sm text-gray-600">{new Date(payment.receiptDate).toLocaleDateString('ar-SA')}</div>
                          </div>
                          <Badge variant={payment.status === 'received' ? 'default' : 'secondary'}>
                            {parseFloat(payment.amount).toFixed(2)} ر.س
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد مدفوعات حديثة</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Report Footer */}
            <div className="border-t pt-4 text-center text-sm text-gray-500">
              <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')} الساعة {new Date().toLocaleTimeString('ar-SA')}</p>
              <p className="mt-1">نظام المحاسب الأعظم - إدارة مالية متقدمة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}