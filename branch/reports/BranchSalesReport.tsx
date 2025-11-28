import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, TrendingUp, Users, FileText, Calendar, Search, Filter, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchSalesReportProps {
  branchId?: number;
}

export default function BranchSalesReport({ branchId }: BranchSalesReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات المبيعات للفرع فقط
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/sales?branchId=${branchId}` : '/api/sales';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب بيانات العملاء للفرع فقط
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/clients?branchId=${branchId}` : '/api/clients';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب الإحصائيات
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const paidSales = sales.filter(sale => sale.paymentStatus === 'paid').length;
  const pendingSales = sales.filter(sale => sale.paymentStatus === 'pending').length;

  // تصفية البيانات
  const filteredSales = sales.filter(sale => {
    const client = clients.find(c => c.id === sale.clientId);
    const clientName = client?.name || '';
    const matchesSearch = sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
    
    // فلتر التاريخ
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const saleDate = sale.date ? new Date(sale.date) : null;
      if (saleDate) {
        // حذف الوقت من تاريخ الفاتورة للمقارنة الصحيحة
        const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
        
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom + 'T00:00:00');
          const toDate = new Date(dateTo + 'T23:59:59');
          matchesDate = saleDateOnly >= fromDate && saleDateOnly <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom + 'T00:00:00');
          matchesDate = saleDateOnly >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo + 'T23:59:59');
          matchesDate = saleDateOnly <= toDate;
        }
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // تطبيق pagination على المبيعات
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedSales,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredSales,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, statusFilter, dateFrom, dateTo]
  });

  // طباعة التقرير
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRangeText = dateFrom && dateTo 
      ? `الفترة من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}`
      : dateFrom 
      ? `من تاريخ ${new Date(dateFrom).toLocaleDateString('en-GB')}`
      : dateTo 
      ? `حتى تاريخ ${new Date(dateTo).toLocaleDateString('en-GB')}`
      : 'جميع الفترات';

    const branchName = branch?.name || `الفرع ${branchId}`;

    const reportContent = `
      <html dir="rtl">
        <head>
          <title>تقرير المبيعات - ${branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .date-range { background: #f0f9ff; padding: 10px; margin-bottom: 20px; text-align: center; border: 1px solid #3b82f6; border-radius: 5px; color: #1e40af; font-weight: bold; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; background: #f9f9f9; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              
              <p>تقرير المبيعات - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalSales}</div>
              <div class="stat-label">إجمالي المبيعات</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalRevenue.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الإيرادات</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${paidSales}</div>
              <div class="stat-label">المبيعات المدفوعة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${pendingSales}</div>
              <div class="stat-label">المبيعات المعلقة</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>حالة الدفع</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales.map(sale => {
                const client = clients.find(c => c.id === sale.clientId);
                return `
                <tr>
                  <td>${sale.invoiceNumber}</td>
                  <td>${client?.name || 'غير محدد'}</td>
                  <td>${parseFloat(sale.total || '0').toLocaleString('en-US')} ريال</td>
                  <td>${sale.paymentStatus === 'paid' ? 'مدفوع' : sale.paymentStatus === 'pending' ? 'معلق' : sale.paymentStatus}</td>
                  <td>${new Date(sale.date).toLocaleDateString('en-GB')}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير المبيعات</h1>
            <p className="text-gray-600">تقرير تفصيلي للمبيعات - الفرع رقم: {branchId}</p>
            {(dateFrom || dateTo) && (
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {dateFrom && dateTo 
                    ? `من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}`
                    : dateFrom 
                    ? `من ${new Date(dateFrom).toLocaleDateString('en-GB')}`
                    : `حتى ${new Date(dateTo).toLocaleDateString('en-GB')}`}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={printReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
            <p className="text-xs text-muted-foreground">فاتورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة البيع</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgSaleValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">متوسط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{clients.length}</div>
            <p className="text-xs text-muted-foreground">عميل</p>
          </CardContent>
        </Card>
      </div>

      {/* التصفية والبحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* فلتر التاريخ */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Calendar className="h-5 w-5" />
                <span>الفترة الزمنية:</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">من تاريخ:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1"
                    data-testid="input-date-from"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">إلى تاريخ:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1"
                    data-testid="input-date-to"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="whitespace-nowrap"
                    data-testid="button-clear-dates"
                  >
                    مسح التاريخ
                  </Button>
                )}
              </div>
            </div>
            
            {/* فلاتر أخرى */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث برقم الفاتورة أو اسم العميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-date-range">
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="thisWeek">هذا الأسبوع</SelectItem>
                  <SelectItem value="thisMonth">هذا الشهر</SelectItem>
                  <SelectItem value="lastMonth">الشهر الماضي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">رقم الفاتورة</th>
                      <th className="text-right py-2 px-4">العميل</th>
                      <th className="text-right py-2 px-4">المبلغ</th>
                      <th className="text-right py-2 px-4">حالة الدفع</th>
                      <th className="text-right py-2 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSales.map((sale) => {
                      const client = clients.find(c => c.id === sale.clientId);
                      return (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{sale.invoiceNumber}</td>
                          <td className="py-2 px-4">{client?.name || 'غير محدد'}</td>
                          <td className="py-2 px-4 text-green-600 font-semibold">
                            {parseFloat(sale.total || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </td>
                          <td className="py-2 px-4">
                            <Badge variant={sale.paymentStatus === 'paid' ? 'default' : sale.paymentStatus === 'pending' ? 'secondary' : 'destructive'}>
                              {sale.paymentStatus === 'paid' ? 'مدفوع' : sale.paymentStatus === 'pending' ? 'معلق' : 'ملغي'}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">{new Date(sale.date).toLocaleDateString('en-GB')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredSales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مبيعات متاحة
                </div>
              )}
              <PaginationControls
                currentPage={currentPage}
                pageCount={pageCount}
                totalItems={filteredSales.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                itemName="فاتورة بيع"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.slice(0, 6).map((client) => {
                  const clientSales = sales.filter(sale => sale.clientId === client.id);
                  const clientRevenue = clientSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
                  
                  return (
                    <div key={client.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge variant="outline">{clientSales.length} مبيعة</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{client.email}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">إجمالي المبيعات:</span>
                        <span className="font-semibold text-green-600">
                          {clientRevenue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                سيتم عرض تقرير أداء المنتجات هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}