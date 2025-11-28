import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { Sale, Client } from '@shared/schema';

export default function SalesReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [reportType, setReportType] = useState('summary');

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

  // فلترة جميع المعاملات حسب التاريخ والعميل
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
    const clientMatch = selectedClient === 'all' || sale.clientId?.toString() === selectedClient;
    
    return dateMatch && clientMatch;
  });

  const filteredQuotes = quotes.filter((quote: any) => {
    const quoteDate = new Date(quote.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || quoteDate >= fromDate) && (!toDate || quoteDate <= toDate);
    const clientMatch = selectedClient === 'all' || quote.clientId?.toString() === selectedClient;
    
    return dateMatch && clientMatch;
  });

  const filteredGoodsIssue = goodsIssue.filter((voucher: any) => {
    const voucherDate = new Date(voucher.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || voucherDate >= fromDate) && (!toDate || voucherDate <= toDate);
    const clientMatch = selectedClient === 'all' || voucher.clientId?.toString() === selectedClient;
    
    return dateMatch && clientMatch;
  });

  const filteredReturns = salesReturns.filter((returnItem: any) => {
    const returnDate = new Date(returnItem.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || returnDate >= fromDate) && (!toDate || returnDate <= toDate);
    const clientMatch = selectedClient === 'all' || returnItem.clientId?.toString() === selectedClient;
    
    return dateMatch && clientMatch;
  });

  // حساب الإحصائيات المحاسبية
  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
  const totalQuotes = filteredQuotes.reduce((sum: number, quote: any) => sum + parseFloat(quote.total || '0'), 0);
  const totalGoodsIssue = filteredGoodsIssue.reduce((sum: number, voucher: any) => sum + parseFloat(voucher.total || '0'), 0);
  const totalReturns = filteredReturns.reduce((sum: number, returnItem: any) => sum + parseFloat(returnItem.total || '0'), 0);

  const netSales = totalSales + totalGoodsIssue - totalReturns;
  const quotesToSalesRatio = totalSales > 0 ? (totalQuotes / totalSales) * 100 : 0;
  const returnsRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;

  // تحليل العملاء الأكثر نشاطاً
  const clientSalesData = clients.map(client => {
    const clientSalesAmount = filteredSales
      .filter(sale => sale.clientId === client.id)
      .reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
    
    const clientReturnsAmount = filteredReturns
      .filter((returnItem: any) => returnItem.clientId === client.id)
      .reduce((sum: number, returnItem: any) => sum + parseFloat(returnItem.total || '0'), 0);

    const clientQuotesAmount = filteredQuotes
      .filter((quote: any) => quote.clientId === client.id)
      .reduce((sum: number, quote: any) => sum + parseFloat(quote.total || '0'), 0);

    const netClientSales = clientSalesAmount - clientReturnsAmount;

    return {
      ...client,
      salesAmount: clientSalesAmount,
      returnsAmount: clientReturnsAmount,
      quotesAmount: clientQuotesAmount,
      netSales: netClientSales,
      salesCount: filteredSales.filter(sale => sale.clientId === client.id).length,
      returnsCount: filteredReturns.filter((returnItem: any) => returnItem.clientId === client.id).length
    };
  }).filter(client => client.salesAmount > 0 || client.quotesAmount > 0)
    .sort((a, b) => b.netSales - a.netSales);

  // تحليل المبيعات الشهرية
  const monthlySalesData = filteredSales.reduce((acc: any, sale) => {
    const month = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { sales: 0, returns: 0, count: 0 };
    }
    acc[month].sales += parseFloat(sale.total || '0');
    acc[month].count += 1;
    return acc;
  }, {});

  // إضافة المرتجعات للبيانات الشهرية
  filteredReturns.forEach((returnItem: any) => {
    const month = new Date(returnItem.date).toISOString().slice(0, 7);
    if (monthlySalesData[month]) {
      monthlySalesData[month].returns += parseFloat(returnItem.total || '0');
    }
  });

  const monthlyData = Object.keys(monthlySalesData)
    .sort()
    .map(month => ({
      month,
      sales: monthlySalesData[month].sales,
      returns: monthlySalesData[month].returns,
      net: monthlySalesData[month].sales - monthlySalesData[month].returns,
      count: monthlySalesData[month].count
    }));

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // ورقة الملخص
    const summaryData = [
      ['تقرير المبيعات المحاسبي الشامل'],
      [''],
      ['الفترة:', `${dateFrom || 'من البداية'} إلى ${dateTo || 'اليوم'}`],
      ['العميل:', selectedClient === 'all' ? 'جميع العملاء' : clients.find(c => c.id.toString() === selectedClient)?.name || ''],
      [''],
      ['الإحصائيات العامة'],
      ['إجمالي المبيعات', totalSales.toFixed(2)],
      ['إجمالي عروض الأسعار', totalQuotes.toFixed(2)],
      ['إجمالي سندات الإخراج', totalGoodsIssue.toFixed(2)],
      ['إجمالي المرتجعات', totalReturns.toFixed(2)],
      ['صافي المبيعات', netSales.toFixed(2)],
      ['نسبة العروض للمبيعات %', quotesToSalesRatio.toFixed(2)],
      ['معدل المرتجعات %', returnsRate.toFixed(2)],
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'الملخص');

    // ورقة تحليل العملاء
    const clientsData = [
      ['تحليل العملاء'],
      ['اسم العميل', 'إجمالي المبيعات', 'إجمالي المرتجعات', 'صافي المبيعات', 'عدد الفواتير', 'عدد المرتجعات', 'عروض الأسعار']
    ];
    
    clientSalesData.forEach(client => {
      clientsData.push([
        client.name,
        client.salesAmount.toFixed(2),
        client.returnsAmount.toFixed(2),
        client.netSales.toFixed(2),
        client.salesCount.toString(),
        client.returnsCount.toString(),
        client.quotesAmount.toFixed(2)
      ]);
    });
    
    const clientsWS = XLSX.utils.aoa_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(workbook, clientsWS, 'تحليل العملاء');

    // ورقة التحليل الشهري
    const monthlyDataSheet = [
      ['التحليل الشهري'],
      ['الشهر', 'إجمالي المبيعات', 'إجمالي المرتجعات', 'صافي المبيعات', 'عدد الفواتير']
    ];
    
    monthlyData.forEach(data => {
      monthlyDataSheet.push([
        data.month,
        data.sales.toFixed(2),
        data.returns.toFixed(2),
        data.net.toFixed(2),
        data.count.toString()
      ]);
    });
    
    const monthlyWS = XLSX.utils.aoa_to_sheet(monthlyDataSheet);
    XLSX.utils.book_append_sheet(workbook, monthlyWS, 'التحليل الشهري');

    XLSX.writeFile(workbook, `تقرير_المبيعات_المحاسبي_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportDetailedReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير المبيعات المحاسبي الشامل</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #ccc; padding: 15px; text-align: center; }
          .value { font-size: 18px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المبيعات المحاسبي الشامل</h1>
          <p>الفترة: ${dateFrom || 'من البداية'} إلى ${dateTo || 'اليوم'}</p>
        </div>

        <div class="section">
          <div class="section-title">الملخص المالي</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="value">${totalSales.toFixed(2)} ر.س</div>
              <p>إجمالي المبيعات (${filteredSales.length} فاتورة)</p>
            </div>
            <div class="summary-card">
              <div class="value">${totalReturns.toFixed(2)} ر.س</div>
              <p>إجمالي المرتجعات (${filteredReturns.length} مرتجع)</p>
            </div>
            <div class="summary-card">
              <div class="value">${netSales.toFixed(2)} ر.س</div>
              <p>صافي المبيعات</p>
            </div>
            <div class="summary-card">
              <div class="value">${totalQuotes.toFixed(2)} ر.س</div>
              <p>عروض الأسعار (${filteredQuotes.length} عرض)</p>
            </div>
            <div class="summary-card">
              <div class="value">${totalGoodsIssue.toFixed(2)} ر.س</div>
              <p>سندات الإخراج (${filteredGoodsIssue.length} سند)</p>
            </div>
            <div class="summary-card">
              <div class="value">${returnsRate.toFixed(1)}%</div>
              <p>معدل المرتجعات</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تحليل أداء العملاء</div>
          <table>
            <thead>
              <tr>
                <th>العميل</th>
                <th>إجمالي المبيعات</th>
                <th>المرتجعات</th>
                <th>صافي المبيعات</th>
                <th>عدد الفواتير</th>
                <th>متوسط الفاتورة</th>
                <th>عروض الأسعار</th>
              </tr>
            </thead>
            <tbody>
              ${clientSalesData.map(client => `
                <tr>
                  <td>${client.name}</td>
                  <td>${client.salesAmount.toFixed(2)} ر.س</td>
                  <td class="negative">${client.returnsAmount.toFixed(2)} ر.س</td>
                  <td class="positive">${client.netSales.toFixed(2)} ر.س</td>
                  <td>${client.salesCount}</td>
                  <td>${client.salesCount > 0 ? (client.salesAmount / client.salesCount).toFixed(2) : '0.00'} ر.س</td>
                  <td>${client.quotesAmount.toFixed(2)} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">التحليل الشهري</div>
          <table>
            <thead>
              <tr>
                <th>الشهر</th>
                <th>إجمالي المبيعات</th>
                <th>المرتجعات</th>
                <th>صافي المبيعات</th>
                <th>عدد الفواتير</th>
                <th>متوسط الفاتورة</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyData.map(data => `
                <tr>
                  <td>${data.month}</td>
                  <td>${data.sales.toFixed(2)} ر.س</td>
                  <td class="negative">${data.returns.toFixed(2)} ر.س</td>
                  <td class="positive">${data.net.toFixed(2)} ر.س</td>
                  <td>${data.count}</td>
                  <td>${data.count > 0 ? (data.sales / data.count).toFixed(2) : '0.00'} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">المؤشرات المحاسبية</div>
          <table>
            <tbody>
              <tr><td>نسبة العروض المحولة لمبيعات</td><td>${quotesToSalesRatio.toFixed(2)}%</td></tr>
              <tr><td>معدل المرتجعات</td><td>${returnsRate.toFixed(2)}%</td></tr>
              <tr><td>متوسط قيمة الفاتورة</td><td>${filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : '0.00'} ر.س</td></tr>
              <tr><td>إجمالي عدد المعاملات</td><td>${filteredSales.length + filteredQuotes.length + filteredGoodsIssue.length + filteredReturns.length}</td></tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">تقرير المبيعات المحاسبي</h1>
          <p className="text-gray-600">تحليل مفصل ومعمق لأداء المبيعات والعملاء</p>
        </div>
      </div>

      {/* فلاتر التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>فلاتر التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="reportType">نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">ملخص مالي</SelectItem>
                  <SelectItem value="detailed">تفصيلي</SelectItem>
                  <SelectItem value="analysis">تحليل متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportDetailedReport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                طباعة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الملخص المالي */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {filteredSales.length} فاتورة مبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرتجعات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalReturns.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredReturns.length} مرتجع ({returnsRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي المبيعات</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {netSales.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              بعد خصم المرتجعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عروض الأسعار</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalQuotes.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredQuotes.length} عرض ({quotesToSalesRatio.toFixed(1)}% تحويل)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات الإخراج</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalGoodsIssue.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredGoodsIssue.length} سند إخراج
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الفاتورة</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : '0.00'} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              لكل فاتورة مبيعات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تحليل أداء العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل أداء العملاء</CardTitle>
          <CardDescription>العملاء مرتبين حسب صافي المبيعات</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">إجمالي المبيعات</TableHead>
                <TableHead className="text-right">المرتجعات</TableHead>
                <TableHead className="text-right">صافي المبيعات</TableHead>
                <TableHead className="text-right">عدد الفواتير</TableHead>
                <TableHead className="text-right">متوسط الفاتورة</TableHead>
                <TableHead className="text-right">عروض الأسعار</TableHead>
                <TableHead className="text-right">معدل التحويل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientSalesData.slice(0, 10).map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {client.salesAmount.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell className="text-red-600">
                    {client.returnsAmount.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell className="text-blue-600 font-bold">
                    {client.netSales.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell>{client.salesCount}</TableCell>
                  <TableCell>
                    {client.salesCount > 0 ? (client.salesAmount / client.salesCount).toFixed(2) : '0.00'} ر.س
                  </TableCell>
                  <TableCell className="text-purple-600">
                    {client.quotesAmount.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell>
                    {client.quotesAmount > 0 ? ((client.salesAmount / client.quotesAmount) * 100).toFixed(1) : '0.0'}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* التحليل الشهري */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>التحليل الشهري للمبيعات</CardTitle>
            <CardDescription>أداء المبيعات على مدار الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الشهر</TableHead>
                  <TableHead className="text-right">إجمالي المبيعات</TableHead>
                  <TableHead className="text-right">المرتجعات</TableHead>
                  <TableHead className="text-right">صافي المبيعات</TableHead>
                  <TableHead className="text-right">عدد الفواتير</TableHead>
                  <TableHead className="text-right">متوسط الفاتورة</TableHead>
                  <TableHead className="text-right">معدل المرتجعات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data) => (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-green-600">
                      {data.sales.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className="text-red-600">
                      {data.returns.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      {data.net.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>{data.count}</TableCell>
                    <TableCell>
                      {data.count > 0 ? (data.sales / data.count).toFixed(2) : '0.00'} ر.س
                    </TableCell>
                    <TableCell>
                      {data.sales > 0 ? ((data.returns / data.sales) * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* المؤشرات المحاسبية */}
      <Card>
        <CardHeader>
          <CardTitle>المؤشرات المحاسبية الرئيسية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">نسبة تحويل العروض</div>
              <div className="text-2xl font-bold text-purple-600">
                {quotesToSalesRatio.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">معدل المرتجعات</div>
              <div className="text-2xl font-bold text-red-600">
                {returnsRate.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">إجمالي المعاملات</div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredSales.length + filteredQuotes.length + filteredGoodsIssue.length + filteredReturns.length}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">العملاء النشطين</div>
              <div className="text-2xl font-bold text-green-600">
                {clientSalesData.filter(c => c.salesAmount > 0).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}