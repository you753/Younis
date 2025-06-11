import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  FileText,
  Star,
  Phone,
  Mail,
  MapPin,
  Package
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SuppliersReports() {
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch suppliers data
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 60000,
  });

  // Fetch supplier payment vouchers
  const { data: supplierPayments = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
    staleTime: 60000,
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
    staleTime: 60000,
  });

  const generateSuppliersReportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('suppliers-report-content');
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
      pdf.text(`تقرير الموردين - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-الموردين-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate supplier metrics
  const totalSuppliers = Array.isArray(suppliers) ? suppliers.length : 0;
  const totalSupplierPayments = Array.isArray(supplierPayments) ? 
    supplierPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0) : 0;
  const totalPurchases = Array.isArray(purchases) ? 
    purchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0) : 0;

  // Group payments by supplier
  const supplierPaymentSummary = Array.isArray(supplierPayments) && Array.isArray(suppliers) ?
    suppliers.map((supplier: any) => {
      const payments = supplierPayments.filter((payment: any) => payment.supplierId === supplier.id);
      const totalPaid = payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0);
      return {
        ...supplier,
        paymentsCount: payments.length,
        totalPaid,
        lastPayment: payments.length > 0 ? payments[payments.length - 1] : null
      };
    }) : [];

  const filteredSuppliers = selectedSupplier === 'all' ? 
    supplierPaymentSummary : 
    supplierPaymentSummary.filter((supplier: any) => supplier.id.toString() === selectedSupplier);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير الموردين</h1>
          <p className="text-gray-600 mt-2">تقارير شاملة عن أداء ومدفوعات الموردين</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateSuppliersReportPDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'جاري الإنشاء...' : 'حفظ PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">المورد</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
                  {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">الفترة</label>
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
                  <SelectItem value="summary">ملخص الموردين</SelectItem>
                  <SelectItem value="payments">المدفوعات</SelectItem>
                  <SelectItem value="performance">تقييم الأداء</SelectItem>
                  <SelectItem value="comparison">مقارنة الموردين</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div id="suppliers-report-content">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الموردين</p>
                  <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-green-600">{totalSupplierPayments.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                  <p className="text-2xl font-bold text-orange-600">{totalPurchases.toFixed(2)} ر.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المدفوعات المعلقة</p>
                  <p className="text-2xl font-bold text-red-600">{(totalPurchases - totalSupplierPayments).toFixed(2)} ر.س</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              تفاصيل الموردين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length > 0 ? (
              <div className="grid gap-4">
                {filteredSuppliers.map((supplier: any) => (
                  <Card key={supplier.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{supplier.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {supplier.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{supplier.phone}</span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{supplier.email}</span>
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{supplier.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">إحصائيات المدفوعات</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">عدد المدفوعات:</span>
                              <Badge variant="outline">{supplier.paymentsCount}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">إجمالي المدفوع:</span>
                              <Badge variant="default">{supplier.totalPaid.toFixed(2)} ر.س</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">آخر دفعة</h4>
                          {supplier.lastPayment ? (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">المبلغ:</span>
                                <span className="font-medium">{parseFloat(supplier.lastPayment.amount).toFixed(2)} ر.س</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">التاريخ:</span>
                                <span className="text-sm">{new Date(supplier.lastPayment.createdAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">الحالة:</span>
                                <Badge variant={supplier.lastPayment.status === 'paid' ? 'default' : 'secondary'}>
                                  {supplier.lastPayment.status === 'paid' ? 'مدفوع' : 'معلق'}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">لا توجد مدفوعات</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات موردين</h3>
                <p className="text-gray-500">لا توجد موردين تطابق الفلاتر المحددة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')} الساعة {new Date().toLocaleTimeString('ar-SA')}</p>
          <p className="mt-1">نظام المحاسب الأعظم - إدارة الموردين</p>
        </div>
      </div>
    </div>
  );
}