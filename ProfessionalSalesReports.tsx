import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Eye,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Printer,
  Filter
} from 'lucide-react';
import type { Sale, Client } from '@shared/schema';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ProfessionalSalesReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales']
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  // فلترة البيانات
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
    const clientMatch = selectedClient === 'all' || sale.clientId?.toString() === selectedClient;
    const monthMatch = selectedMonth === 'all' || (saleDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || saleDate.getFullYear().toString() === selectedYear;
    
    return dateMatch && clientMatch && monthMatch && yearMatch;
  });

  // حساب الإحصائيات
  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
  const topClient = clients.find(client => {
    const clientSales = filteredSales.filter(sale => sale.clientId === client.id);
    const clientTotal = clientSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    return clientTotal > 0;
  });

  // تجميع المبيعات حسب العميل
  const salesByClient = clients.map(client => {
    const clientSales = filteredSales.filter(sale => sale.clientId === client.id);
    const clientTotal = clientSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    return {
      client,
      salesCount: clientSales.length,
      totalAmount: clientTotal,
      averageAmount: clientSales.length > 0 ? clientTotal / clientSales.length : 0
    };
  }).filter(item => item.salesCount > 0);

  // تجميع المبيعات حسب الشهر
  const salesByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthSales = filteredSales.filter(sale => new Date(sale.date).getMonth() + 1 === month);
    const monthTotal = monthSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    return {
      month,
      monthName: getMonthName(month),
      salesCount: monthSales.length,
      totalAmount: monthTotal
    };
  }).filter(item => item.salesCount > 0);

  function getMonthName(month: number): string {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1];
  }

  // طباعة الفاتورة الاحترافية
  const generateProfessionalInvoice = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // خلفية بيضاء
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // إعداد الخط العربي (محاكاة)
    doc.setFont('helvetica', 'bold');

    // رأس الصفحة مع إطار
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 30);
    
    // عنوان التقرير
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('تقرير المبيعات الاحترافي', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Professional Sales Report', 105, 30, { align: 'center' });

    // معلومات التقرير
    let yPos = 55;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // صندوق معلومات التقرير
    doc.rect(10, 45, 190, 25);
    doc.text('Report Details / تفاصيل التقرير:', 15, 55);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 15, 62);
    doc.text(`Total Sales: ${filteredSales.length}`, 15, 67);
    doc.text(`Total Amount: ${totalSales.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}`, 110, 62);
    doc.text(`Average Sale: ${averageSale.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}`, 110, 67);

    yPos = 85;

    // جدول الإحصائيات الرئيسية
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Key Statistics / الإحصائيات الرئيسية', 15, yPos);
    yPos += 10;

    // رأس الجدول
    doc.rect(10, yPos, 190, 8);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos, 190, 8, 'F');
    
    doc.setFontSize(9);
    doc.text('Metric', 15, yPos + 5);
    doc.text('Value', 80, yPos + 5);
    doc.text('المؤشر', 120, yPos + 5);
    doc.text('القيمة', 170, yPos + 5);
    yPos += 8;

    // بيانات الإحصائيات
    const stats = [
      { metric: 'Total Sales', value: filteredSales.length.toString(), arabic: 'إجمالي المبيعات' },
      { metric: 'Total Revenue', value: totalSales.toLocaleString('en-US'), arabic: 'إجمالي الإيرادات' },
      { metric: 'Average Sale', value: averageSale.toLocaleString('en-US'), arabic: 'متوسط البيع' },
      { metric: 'Active Clients', value: salesByClient.length.toString(), arabic: 'العملاء النشطين' }
    ];

    doc.setFont('helvetica', 'normal');
    stats.forEach(stat => {
      doc.rect(10, yPos, 190, 6);
      doc.text(stat.metric, 15, yPos + 4);
      doc.text(stat.value, 80, yPos + 4);
      doc.text(stat.arabic, 120, yPos + 4);
      doc.text(stat.value, 170, yPos + 4);
      yPos += 6;
    });

    yPos += 10;

    // جدول أفضل العملاء
    if (salesByClient.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Top Clients / أفضل العملاء', 15, yPos);
      yPos += 10;

      // رأس جدول العملاء
      doc.rect(10, yPos, 190, 8);
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos, 190, 8, 'F');
      
      doc.setFontSize(9);
      doc.text('Client Name', 15, yPos + 5);
      doc.text('Sales Count', 70, yPos + 5);
      doc.text('Total Amount', 120, yPos + 5);
      doc.text('Average', 170, yPos + 5);
      yPos += 8;

      // أفضل 10 عملاء
      const topClients = salesByClient
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      doc.setFont('helvetica', 'normal');
      topClients.forEach(item => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.rect(10, yPos, 190, 6);
        doc.text(item.client.name || 'Unknown', 15, yPos + 4);
        doc.text(item.salesCount.toString(), 70, yPos + 4);
        doc.text(item.totalAmount.toLocaleString('en-US'), 120, yPos + 4);
        doc.text(item.averageAmount.toLocaleString('en-US'), 170, yPos + 4);
        yPos += 6;
      });
    }

    // تذييل الصفحة
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Advanced Accounting System', 105, 290, { align: 'center' });
    doc.text('تم إنشاؤه بواسطة نظام المحاسبة المتقدم', 105, 295, { align: 'center' });

    // حفظ الملف
    doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // ورقة عمل المبيعات
    const salesData = filteredSales.map(sale => ({
      'رقم الفاتورة': sale.id,
      'التاريخ': new Date(sale.date).toLocaleDateString('en-GB'),
      'العميل': clients.find(c => c.id === sale.clientId)?.name || 'غير محدد',
      'المبلغ الإجمالي': parseFloat(sale.total),
      'الملاحظات': sale.notes || ''
    }));
    
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'المبيعات');
    
    // ورقة عمل الإحصائيات
    const statsData = [
      { 'المؤشر': 'إجمالي المبيعات', 'القيمة': filteredSales.length },
      { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': totalSales },
      { 'المؤشر': 'متوسط البيع', 'القيمة': averageSale },
      { 'المؤشر': 'عدد العملاء النشطين', 'القيمة': salesByClient.length }
    ];
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'الإحصائيات');
    
    XLSX.writeFile(workbook, `تقرير-المبيعات-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير المبيعات الاحترافية</h1>
          <p className="text-gray-600 mt-2">تحليل شامل لأداء المبيعات والعملاء</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateProfessionalInvoice} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 ml-2" />
            طباعة فاتورة احترافية
          </Button>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* فلاتر التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dateFrom">من تاريخ</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">إلى تاريخ</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client">العميل</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="month">الشهر</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشهور</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">السنة</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع السنوات</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">إجمالي المبيعات</p>
                <p className="text-3xl font-bold">{filteredSales.length}</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">
                  {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">متوسط البيع</p>
                <p className="text-2xl font-bold">
                  {averageSale.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">العملاء النشطين</p>
                <p className="text-3xl font-bold">{salesByClient.length}</p>
              </div>
              <Users className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التفاصيل */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">جميع المبيعات</TabsTrigger>
          <TabsTrigger value="clients">تحليل العملاء</TabsTrigger>
          <TabsTrigger value="monthly">التحليل الشهري</TabsTrigger>
          <TabsTrigger value="summary">الملخص التنفيذي</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>جميع المبيعات</CardTitle>
              <CardDescription>قائمة تفصيلية بجميع المبيعات المفلترة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const client = clients.find(c => c.id === sale.clientId);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">#{sale.id}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{client?.name || 'عميل غير محدد'}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {parseFloat(sale.total).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            مكتملة
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>تحليل أداء العملاء</CardTitle>
              <CardDescription>إحصائيات مفصلة لكل عميل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">عدد المبيعات</TableHead>
                    <TableHead className="text-right">إجمالي المبيعات</TableHead>
                    <TableHead className="text-right">متوسط البيع</TableHead>
                    <TableHead className="text-right">النسبة من الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByClient
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .map((item) => {
                      const percentage = totalSales > 0 ? (item.totalAmount / totalSales * 100) : 0;
                      return (
                        <TableRow key={item.client.id}>
                          <TableCell className="font-medium">{item.client.name}</TableCell>
                          <TableCell>{item.salesCount}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {item.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </TableCell>
                          <TableCell>
                            {item.averageAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>التحليل الشهري</CardTitle>
              <CardDescription>أداء المبيعات حسب الشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الشهر</TableHead>
                    <TableHead className="text-right">عدد المبيعات</TableHead>
                    <TableHead className="text-right">إجمالي المبيعات</TableHead>
                    <TableHead className="text-right">متوسط المبيعات</TableHead>
                    <TableHead className="text-right">النمو</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByMonth.map((item, index) => {
                    const prevMonth = salesByMonth[index - 1];
                    const growth = prevMonth ? ((item.totalAmount - prevMonth.totalAmount) / prevMonth.totalAmount * 100) : 0;
                    return (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.monthName}</TableCell>
                        <TableCell>{item.salesCount}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {item.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </TableCell>
                        <TableCell>
                          {(item.totalAmount / item.salesCount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={growth >= 0 ? "default" : "destructive"}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الملخص التنفيذي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">إجمالي عدد المبيعات:</span>
                  <span className="font-bold text-blue-600">{filteredSales.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">إجمالي الإيرادات:</span>
                  <span className="font-bold text-green-600">
                    {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">متوسط قيمة البيع:</span>
                  <span className="font-bold text-purple-600">
                    {averageSale.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">عدد العملاء النشطين:</span>
                  <span className="font-bold text-orange-600">{salesByClient.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesByClient
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{item.client.name}</span>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-green-600">
                            {item.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.salesCount} مبيعات
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}