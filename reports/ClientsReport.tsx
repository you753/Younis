import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, Calendar, Download, Search } from "lucide-react";
import type { Client, Sale } from '@shared/schema';

export default function ClientsReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientCategory, setClientCategory] = useState('all');

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales']
  });

  const { data: clientReceiptVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/client-receipt-vouchers']
  });

  // فلترة العملاء بناءً على البحث والفئة
  const filteredClients = clients.filter(client => {
    const searchMatch = !searchTerm || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    const categoryMatch = clientCategory === 'all' || 
      (clientCategory === 'company' && client.type === 'company') ||
      (clientCategory === 'individual' && client.type === 'individual');
    
    return searchMatch && categoryMatch;
  });

  // حساب بيانات كل عميل
  const clientsWithStats = filteredClients.map(client => {
    // حساب إجمالي المبيعات للعميل
    const clientSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      const dateMatch = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
      return sale.clientId === client.id && dateMatch;
    });

    const totalSales = clientSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
    const totalInvoices = clientSales.length;

    // حساب سندات القبض للعميل
    const clientReceipts = clientReceiptVouchers.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      const dateMatch = (!fromDate || receiptDate >= fromDate) && (!toDate || receiptDate <= toDate);
      return receipt.clientId === client.id && dateMatch;
    });

    const totalReceipts = clientReceipts.reduce((sum: number, receipt: any) => sum + parseFloat(receipt.amount || '0'), 0);
    const receiptCount = clientReceipts.length;

    // حساب الرصيد المتبقي
    const openingBalance = parseFloat(client.openingBalance || '0');
    const currentBalance = parseFloat(client.currentBalance || '0');
    const totalBalance = openingBalance + currentBalance;
    const remainingBalance = totalBalance + totalSales - totalReceipts;

    return {
      ...client,
      totalSales,
      totalInvoices,
      totalReceipts,
      receiptCount,
      remainingBalance,
      totalBalance
    };
  });

  // حساب الإحصائيات العامة
  const totalClients = filteredClients.length;
  const activeClients = clientsWithStats.filter(client => client.remainingBalance > 0).length;
  const totalOutstandingDebt = clientsWithStats.reduce((sum, client) => sum + Math.max(0, client.remainingBalance), 0);
  const totalReceiptAmount = clientsWithStats.reduce((sum, client) => sum + client.totalReceipts, 0);
  const totalSalesAmount = clientsWithStats.reduce((sum, client) => sum + client.totalSales, 0);

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير العملاء الشامل</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .neutral { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير العملاء الشامل</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${totalClients}</div>
            <p>إجمالي العملاء</p>
          </div>
          <div class="summary-card">
            <div class="value">${activeClients}</div>
            <p>عملاء لهم أرصدة</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalSalesAmount.toFixed(2)} ر.س</div>
            <p>إجمالي المبيعات</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalReceiptAmount.toFixed(2)} ر.س</div>
            <p>إجمالي المقبوضات</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalOutstandingDebt.toFixed(2)} ر.س</div>
            <p>الأرصدة المستحقة</p>
          </div>
        </div>

        <h3>تفاصيل العملاء</h3>
        <table>
          <thead>
            <tr>
              <th>اسم العميل</th>
              <th>المبيعات</th>
              <th>سندات القبض</th>
              <th>الرصيد المتبقي</th>
              <th>آخر فاتورة</th>
            </tr>
          </thead>
          <tbody>
            ${clientsWithStats.map(client => {
              const lastSale = sales.filter(s => s.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              return `
                <tr>
                  <td>${client.name}</td>
                  <td>${client.totalSales.toFixed(2)} ر.س (${client.totalInvoices} فاتورة)</td>
                  <td>${client.totalReceipts.toFixed(2)} ر.س (${client.receiptCount} سند)</td>
                  <td class="${client.remainingBalance > 0 ? 'positive' : client.remainingBalance < 0 ? 'negative' : 'neutral'}">
                    ${client.remainingBalance.toFixed(2)} ر.س
                  </td>
                  <td>${lastSale ? new Date(lastSale.date).toLocaleDateString('en-GB') : 'لا توجد'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
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
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">تقرير العملاء الشامل</h1>
          <p className="text-gray-600">تحليل مفصل لجميع العملاء والأرصدة وسندات القبض</p>
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
              <Label htmlFor="category">فئة العميل</Label>
              <Select value={clientCategory} onValueChange={setClientCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="company">شركات</SelectItem>
                  <SelectItem value="individual">أفراد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ابحث عن عميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={exportReport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalClients}
            </div>
            <p className="text-xs text-muted-foreground">
              عميل مسجل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عملاء لهم أرصدة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeClients}
            </div>
            <p className="text-xs text-muted-foreground">
              عميل نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {totalSalesAmount.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              قيمة المبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقبوضات</CardTitle>
            <Download className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {totalReceiptAmount.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              سندات القبض
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأرصدة المستحقة</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {totalOutstandingDebt.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              مبلغ مستحق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل العملاء والأرصدة</CardTitle>
          <CardDescription>
            قائمة شاملة بجميع العملاء مع الأرصدة وسندات القبض
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">المبيعات</TableHead>
                <TableHead className="text-right">سندات القبض</TableHead>
                <TableHead className="text-right">الرصيد المتبقي</TableHead>
                <TableHead className="text-right">آخر فاتورة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsWithStats.map((client) => {
                const lastSale = sales.filter(s => s.clientId === client.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{client.name}</div>
                        {client.email && (
                          <div className="text-sm text-gray-500">{client.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{client.phone || 'غير محدد'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold text-purple-600">
                          {client.totalSales.toFixed(2)} ر.س
                        </div>
                        <div className="text-gray-500">
                          {client.totalInvoices} فاتورة
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold text-orange-600">
                          {client.totalReceipts.toFixed(2)} ر.س
                        </div>
                        <div className="text-gray-500">
                          {client.receiptCount} سند قبض
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold text-lg ${
                        client.remainingBalance > 0 
                          ? 'text-red-600' 
                          : client.remainingBalance < 0 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                      }`}>
                        {client.remainingBalance.toFixed(2)} ر.س
                      </div>
                    </TableCell>
                    <TableCell>
                      {lastSale ? new Date(lastSale.date).toLocaleDateString('en-GB') : 'لا توجد'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.remainingBalance > 0
                          ? 'bg-red-100 text-red-800'
                          : client.remainingBalance < 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.remainingBalance > 0 
                          ? 'له رصيد' 
                          : client.remainingBalance < 0 
                            ? 'عليه رصيد' 
                            : 'متوازن'
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {clientsWithStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد عملاء تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}