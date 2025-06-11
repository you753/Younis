import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Filter,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ClientsReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch clients data
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60000,
  });

  // Fetch client receipt vouchers
  const { data: clientReceipts = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    staleTime: 60000,
  });

  // Fetch sales
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    staleTime: 60000,
  });

  const generateClientsReportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('clients-report-content');
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

      pdf.setFontSize(20);
      pdf.text(`تقرير العملاء - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-العملاء-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate client metrics
  const totalClients = Array.isArray(clients) ? clients.length : 0;
  const totalClientReceipts = Array.isArray(clientReceipts) ? 
    clientReceipts.reduce((sum: number, receipt: any) => sum + parseFloat(receipt.amount || 0), 0) : 0;
  const totalSales = Array.isArray(sales) ? 
    sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0) : 0;

  // Group receipts by client
  const clientReceiptSummary = Array.isArray(clientReceipts) && Array.isArray(clients) ?
    clients.map((client: any) => {
      const receipts = clientReceipts.filter((receipt: any) => receipt.clientId === client.id);
      const totalReceived = receipts.reduce((sum: number, receipt: any) => sum + parseFloat(receipt.amount || 0), 0);
      return {
        ...client,
        receiptsCount: receipts.length,
        totalReceived,
        lastReceipt: receipts.length > 0 ? receipts[receipts.length - 1] : null
      };
    }) : [];

  const filteredClients = searchTerm ? 
    clientReceiptSummary.filter((client: any) => 
      (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || '').includes(searchTerm) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : clientReceiptSummary;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير العملاء</h1>
          <p className="text-gray-600 mt-2">تقارير شاملة عن أداء ومقبوضات العملاء</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateClientsReportPDF}
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">البحث</label>
              <Input
                placeholder="اسم العميل أو الهاتف"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <SelectItem value="summary">ملخص العملاء</SelectItem>
                  <SelectItem value="receipts">المقبوضات</SelectItem>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="outstanding">الذمم المدينة</SelectItem>
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
      <div id="clients-report-content">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-blue-600">{totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المقبوضات</p>
                  <p className="text-2xl font-bold text-green-600">{totalClientReceipts.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-orange-600">{totalSales.toFixed(2)} ر.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الذمم المدينة</p>
                  <p className="text-2xl font-bold text-red-600">{(totalSales - totalClientReceipts).toFixed(2)} ر.س</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              تفاصيل العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length > 0 ? (
              <div className="grid gap-4">
                {filteredClients.map((client: any) => (
                  <Card key={client.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{client.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {client.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{client.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">إحصائيات المقبوضات</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">عدد المقبوضات:</span>
                              <Badge variant="outline">{client.receiptsCount}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">إجمالي المقبوض:</span>
                              <Badge variant="default">{client.totalReceived.toFixed(2)} ر.س</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">آخر مقبوض</h4>
                          {client.lastReceipt ? (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">المبلغ:</span>
                                <span className="font-medium">{parseFloat(client.lastReceipt.amount).toFixed(2)} ر.س</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">التاريخ:</span>
                                <span className="text-sm">{new Date(client.lastReceipt.createdAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">الحالة:</span>
                                <Badge variant={client.lastReceipt.status === 'received' ? 'default' : 'secondary'}>
                                  {client.lastReceipt.status === 'received' ? 'مقبوض' : 'معلق'}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">لا توجد مقبوضات</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات عملاء</h3>
                <p className="text-gray-500">لا توجد عملاء تطابق الفلاتر المحددة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')} الساعة {new Date().toLocaleTimeString('ar-SA')}</p>
          <p className="mt-1">نظام المحاسب الأعظم - إدارة العملاء</p>
        </div>
      </div>
    </div>
  );
}