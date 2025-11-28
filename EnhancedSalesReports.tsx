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
import * as XLSX from 'xlsx';

export default function EnhancedSalesReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales']
  });

  const { data: quotes = [] } = useQuery<any[]>({
    queryKey: ['/api/quotes']
  });

  const { data: goodsIssue = [] } = useQuery<any[]>({
    queryKey: ['/api/goods-issue-vouchers']
  });

  const { data: salesReturns = [] } = useQuery<any[]>({
    queryKey: ['/api/sales-returns']
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

  const filteredQuotes = quotes.filter((quote: any) => {
    const quoteDate = new Date(quote.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || quoteDate >= fromDate) && (!toDate || quoteDate <= toDate);
    const clientMatch = selectedClient === 'all' || quote.clientId?.toString() === selectedClient;
    const monthMatch = selectedMonth === 'all' || (quoteDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || quoteDate.getFullYear().toString() === selectedYear;
    
    return dateMatch && clientMatch && monthMatch && yearMatch;
  });

  const filteredGoodsIssue = goodsIssue.filter((voucher: any) => {
    const voucherDate = new Date(voucher.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || voucherDate >= fromDate) && (!toDate || voucherDate <= toDate);
    const clientMatch = selectedClient === 'all' || voucher.clientId?.toString() === selectedClient;
    const monthMatch = selectedMonth === 'all' || (voucherDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || voucherDate.getFullYear().toString() === selectedYear;
    
    return dateMatch && clientMatch && monthMatch && yearMatch;
  });

  const filteredReturns = salesReturns.filter((returnItem: any) => {
    const returnDate = new Date(returnItem.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || returnDate >= fromDate) && (!toDate || returnDate <= toDate);
    const clientMatch = selectedClient === 'all' || returnItem.clientId?.toString() === selectedClient;
    const monthMatch = selectedMonth === 'all' || (returnDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || returnDate.getFullYear().toString() === selectedYear;
    
    return dateMatch && clientMatch && monthMatch && yearMatch;
  });

  // حساب الإحصائيات
  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
  const totalQuotes = filteredQuotes.reduce((sum: number, quote: any) => sum + parseFloat(quote.total || '0'), 0);
  const totalGoodsIssue = filteredGoodsIssue.reduce((sum: number, voucher: any) => sum + parseFloat(voucher.total || '0'), 0);
  const totalReturns = filteredReturns.reduce((sum: number, returnItem: any) => sum + parseFloat(returnItem.total || '0'), 0);

  const grandTotal = totalSales + totalQuotes + totalGoodsIssue - totalReturns;
  const totalTransactions = filteredSales.length + filteredQuotes.length + filteredGoodsIssue.length + filteredReturns.length;
  const averageTransaction = totalTransactions > 0 ? grandTotal / totalTransactions : 0;
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
  }).filter(item => item.salesCount > 0).sort((a, b) => b.totalAmount - a.totalAmount);

  // تجميع المبيعات حسب الشهر
  const salesByMonth = filteredSales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(sale.total);
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportToExcel = () => {
    try {
      if (filteredSales.length === 0) {
        alert('لا توجد بيانات للتصدير. يرجى إضافة فواتير مبيعات أولاً.');
        return;
      }

      // إعداد البيانات للتصدير
      const exportData = filteredSales.map(sale => {
        const client = clients.find(c => c.id === sale.clientId);
        return {
          'رقم الفاتورة': sale.id,
          'التاريخ': new Date(sale.date).toLocaleDateString('en-GB'),
          'اسم العميل': client?.name || 'عميل نقدي',
          'رقم الهاتف': client?.phone || 'غير محدد',
          'البريد الإلكتروني': client?.email || 'غير محدد',
          'المبلغ': parseFloat(sale.total).toFixed(2),
          'العملة': 'ريال سعودي',
          'الحالة': 'مكتملة',
          'الملاحظات': sale.notes || 'لا توجد ملاحظات'
        };
      });

      // إضافة ملخص الإحصائيات
      const headerData = [
        { 'رقم الفاتورة': '=== تقرير المبيعات المحسن ===' },
        { 'رقم الفاتورة': 'تاريخ التقرير: ' + new Date().toLocaleDateString('en-GB') },
        {},
        { 'رقم الفاتورة': '=== ملخص الإحصائيات ===' },
        { 'رقم الفاتورة': 'إجمالي المبيعات:', 'المبلغ': formatCurrency(totalSales) },
        { 'رقم الفاتورة': 'عدد الفواتير:', 'المبلغ': filteredSales.length },
        { 'رقم الفاتورة': 'متوسط قيمة الفاتورة:', 'المبلغ': formatCurrency(averageSale) },
        {},
        { 'رقم الفاتورة': '=== تفاصيل المبيعات ===' },
        {}
      ];

      const finalData = [...headerData, ...exportData];

      // إنشاء workbook
      const ws = XLSX.utils.json_to_sheet(finalData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "تقرير المبيعات");

      // تحديد عرض الأعمدة
      const colWidths = [
        { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, 
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];
      ws['!cols'] = colWidths;

      // حفظ الملف
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const fileName = `تقرير_المبيعات_المحسن_${dateStr}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      alert('تم تصدير التقرير بنجاح!');
      
    } catch (error) {
      console.error('خطأ في تصدير Excel:', error);
      alert('حدث خطأ في تصدير ملف Excel. يرجى المحاولة مرة أخرى.');
    }
  };

  const printReport = () => {
    const printContent = `
      <div dir="rtl" style="font-family: 'Arial Unicode MS', Arial, sans-serif; padding: 20px; background: white; color: black;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 20px; margin: 10px 0; color: #2d3748;">تقرير المبيعات المحسن</h2>
          <p style="font-size: 14px; margin: 5px 0;">تاريخ التقرير: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 15px; background: #f7fafc; padding: 10px; border-right: 4px solid #3182ce;">ملخص الإحصائيات</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f7fafc;">إجمالي المبيعات:</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #38a169; font-weight: bold;">${formatCurrency(totalSales)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f7fafc;">عدد الفواتير:</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${filteredSales.length}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f7fafc;">متوسط قيمة الفاتورة:</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #3182ce; font-weight: bold;">${formatCurrency(averageSale)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 15px; background: #f7fafc; padding: 10px; border-right: 4px solid #38a169;">تفاصيل المبيعات</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #edf2f7;">
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">رقم الفاتورة</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">التاريخ</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">العميل</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales.map(sale => {
                const client = clients.find(c => c.id === sale.clientId);
                return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">#${sale.id}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${new Date(sale.date).toLocaleDateString('en-GB')}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${client?.name || 'عميل نقدي'}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #38a169; font-weight: bold;">${formatCurrency(parseFloat(sale.total))}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #718096; border-top: 2px solid #e2e8f0; padding-top: 20px;">
          <p>تم إنشاء التقرير في: ${new Date().toLocaleString('en-US')}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>تقرير المبيعات المحسن</title>
          <style>
            @page { margin: 20mm; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تقارير المبيعات المحسنة</h1>
            <p className="text-gray-600">تحليل شامل ومفصل لأداء المبيعات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={printReport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            تصدير Excel
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
          <CardDescription>
            اختر المعايير لتخصيص التقرير حسب احتياجاتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="date" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="date">التاريخ</TabsTrigger>
              <TabsTrigger value="client">العميل</TabsTrigger>
              <TabsTrigger value="period">الفترة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="date" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </TabsContent>
            
            <TabsContent value="client" className="space-y-4">
              <div>
                <Label>اختر العميل</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع العملاء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="period" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الشهر</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الشهور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الشهور</SelectItem>
                      {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleDateString('en-GB', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>السنة</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع السنوات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع السنوات</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              من {filteredSales.length} عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط البيع</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(averageSale)}
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredSales.length}
            </div>
            <p className="text-xs text-muted-foreground">
              فاتورة مبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل عميل</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">
              {topClient?.name || 'لا يوجد'}
            </div>
            <p className="text-xs text-muted-foreground">
              أعلى قيمة مبيعات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Client */}
      {salesByClient.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              المبيعات حسب العميل
            </CardTitle>
            <CardDescription>
              ترتيب العملاء حسب إجمالي المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">عدد الفواتير</TableHead>
                  <TableHead className="text-right">إجمالي المبيعات</TableHead>
                  <TableHead className="text-right">متوسط الفاتورة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByClient.slice(0, 10).map((item, index) => (
                  <TableRow key={item.client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          {index + 1}
                        </Badge>
                        {item.client.name}
                      </div>
                    </TableCell>
                    <TableCell>{item.salesCount}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                    <TableCell className="text-blue-600">
                      {formatCurrency(item.averageAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            تفاصيل المبيعات
          </CardTitle>
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
                    <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{client?.name || 'عميل نقدي'}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(parseFloat(sale.total))}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        مكتملة
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد مبيعات تطابق المعايير المحددة</p>
              <p className="text-sm">يرجى تغيير الفلاتر أو إضافة فواتير مبيعات جديدة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}