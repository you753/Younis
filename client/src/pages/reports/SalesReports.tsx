import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, Calendar, TrendingUp, FileText } from 'lucide-react';
import type { Sale, Client } from '@shared/schema';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function SalesReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales']
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
    const clientMatch = selectedClient === 'all' || sale.clientId?.toString() === selectedClient;
    
    return dateMatch && clientMatch;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // استخدام الخط الافتراضي فقط
      doc.setFont('helvetica');
      
      // رأس التقرير
      doc.setFontSize(20);
      doc.setTextColor(0, 50, 120);
      doc.text('Sales Report', 105, 30, { align: 'center' });
      
      // معلومات الشركة
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('Al-Mohaseb Al-Azam Accounting System', 105, 45, { align: 'center' });
      
      // تاريخ التقرير
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString();
      doc.text(`Report Date: ${currentDate}`, 20, 60);
      
      // فترة التقرير
      if (dateFrom || dateTo) {
        const fromText = dateFrom ? `From: ${dateFrom}` : '';
        const toText = dateTo ? `To: ${dateTo}` : '';
        doc.text(`${fromText} ${toText}`, 20, 70);
      }
      
      // خط فاصل
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 80, 190, 80);
      
      // الإحصائيات
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Sales Summary:', 20, 95);
      
      doc.setFontSize(10);
      doc.text(`Total Sales: ${totalSales.toFixed(2)} SAR`, 30, 105);
      doc.text(`Number of Transactions: ${filteredSales.length}`, 30, 115);
      doc.text(`Average Sale: ${averageSale.toFixed(2)} SAR`, 30, 125);
      
      // جدول المبيعات
      let yPosition = 145;
      doc.setFontSize(12);
      doc.text('Sales Details:', 20, yPosition);
      
      yPosition += 15;
      
      // رؤوس الجدول
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Invoice#', 25, yPosition);
      doc.text('Date', 60, yPosition);
      doc.text('Client', 95, yPosition);
      doc.text('Amount', 140, yPosition);
      doc.text('Status', 170, yPosition);
      
      yPosition += 15;
      
      // بيانات الجدول
      filteredSales.forEach((sale, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
        
        const client = clients.find(c => c.id === sale.clientId);
        
        doc.text(`#${sale.id}`, 25, yPosition);
        doc.text(new Date(sale.date).toLocaleDateString(), 60, yPosition);
        // تحويل النص العربي إلى ترميز آمن أو استخدام نسخة مبسطة
        const clientName = client?.name || 'Cash Client';
        const safeClientName = clientName.replace(/[\u0600-\u06FF]/g, '?').length > 5 ? 
          `Client-${sale.clientId || 'Cash'}` : clientName;
        doc.text(safeClientName, 95, yPosition);
        doc.text(`${parseFloat(sale.total).toFixed(2)} SAR`, 140, yPosition);
        doc.text('Completed', 170, yPosition);
        
        yPosition += 10;
        
        // خط فاصل خفيف
        if (index < filteredSales.length - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.line(20, yPosition - 2, 190, yPosition - 2);
        }
      });
      
      // تذييل التقرير
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by Al-Mohaseb Al-Azam System', 105, pageHeight - 20, { align: 'center' });
      doc.text(`Print Date: ${currentDate}`, 105, pageHeight - 10, { align: 'center' });
      
      // حفظ الملف
      const fileName = `Sales_Report_${currentDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('حدث خطأ في تصدير PDF');
    }
  };

  const exportToExcel = () => {
    try {
      // إعداد البيانات للتصدير
      const exportData = filteredSales.map(sale => {
        const client = clients.find(c => c.id === sale.clientId);
        return {
          'رقم الفاتورة': sale.id,
          'التاريخ': new Date(sale.date).toLocaleDateString('ar-SA'),
          'اسم العميل': client?.name || 'عميل نقدي',
          'رقم الهاتف': client?.phone || '',
          'المبلغ': parseFloat(sale.total).toFixed(2),
          'العملة': 'ر.س',
          'الحالة': 'مكتملة'
        };
      });

      // إضافة ملخص الإحصائيات
      const summaryData = [
        {},
        { 'رقم الفاتورة': 'ملخص التقرير' },
        { 'رقم الفاتورة': 'إجمالي المبيعات', 'المبلغ': totalSales.toFixed(2) },
        { 'رقم الفاتورة': 'عدد العمليات', 'المبلغ': filteredSales.length },
        { 'رقم الفاتورة': 'متوسط البيع', 'المبلغ': averageSale.toFixed(2) },
        { 'رقم الفاتورة': 'تاريخ التقرير', 'المبلغ': new Date().toLocaleDateString('ar-SA') }
      ];

      const finalData = [...exportData, ...summaryData];

      // إنشاء workbook
      const ws = XLSX.utils.json_to_sheet(finalData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "تقرير المبيعات");

      // تحديد عرض الأعمدة
      const colWidths = [
        { wch: 15 }, // رقم الفاتورة
        { wch: 15 }, // التاريخ  
        { wch: 25 }, // اسم العميل
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // المبلغ
        { wch: 10 }, // العملة
        { wch: 15 }  // الحالة
      ];
      ws['!cols'] = colWidths;

      // حفظ الملف
      const fileName = `تقرير_المبيعات_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Excel Export Error:', error);
      alert('حدث خطأ في تصدير Excel');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">تقارير المبيعات</h1>
            <p className="text-gray-600">تحليل مفصل لأداء المبيعات والعملاء</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportToPDF} 
            className="btn-accounting-primary flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            تصدير PDF
          </Button>
          <Button 
            onClick={exportToExcel} 
            className="btn-accounting-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* فلاتر التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalSales.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              من {filteredSales.length} عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط البيع</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageSale.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد العمليات</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredSales.length}
            </div>
            <p className="text-xs text-muted-foreground">
              عملية بيع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل المبيعات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تفاصيل المبيعات</CardTitle>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
          <CardDescription>
            قائمة مفصلة بجميع عمليات البيع المفلترة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => {
                const client = clients.find(c => c.id === sale.clientId);
                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">#{sale.id}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>{client?.name || 'عميل محذوف'}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {parseFloat(sale.total).toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مكتملة
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد مبيعات تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}