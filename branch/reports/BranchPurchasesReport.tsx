import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, TrendingDown, Building, FileText, Search, Download, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchPurchasesReportProps {
  branchId?: number;
}

export default function BranchPurchasesReport({ branchId }: BranchPurchasesReportProps) {
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

  // جلب بيانات المشتريات للفرع فقط
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/purchases?branchId=${branchId}` : '/api/purchases';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب بيانات الموردين للفرع فقط
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/suppliers?branchId=${branchId}` : '/api/suppliers';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب الإحصائيات
  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
  const avgPurchaseValue = totalPurchases > 0 ? totalCost / totalPurchases : 0;
  const paidPurchases = purchases.filter(purchase => purchase.paymentStatus === 'paid').length;
  const pendingPurchases = purchases.filter(purchase => purchase.paymentStatus === 'pending').length;

  // تصفية البيانات
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.paymentStatus === statusFilter;
    
    // فلتر التاريخ
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const purchaseDate = purchase.date ? new Date(purchase.date) : null;
      if (purchaseDate) {
        // حذف الوقت من تاريخ الفاتورة للمقارنة الصحيحة
        const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
        
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom + 'T00:00:00');
          const toDate = new Date(dateTo + 'T23:59:59');
          matchesDate = purchaseDateOnly >= fromDate && purchaseDateOnly <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom + 'T00:00:00');
          matchesDate = purchaseDateOnly >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo + 'T23:59:59');
          matchesDate = purchaseDateOnly <= toDate;
        }
      } else {
        matchesDate = false; // إذا ما فيه تاريخ للفاتورة، ما نعرضها
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // تطبيق pagination على المشتريات
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedPurchases,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredPurchases,
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
          <title>تقرير المشتريات - ${branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .date-range { background: #f0f9ff; padding: 10px; margin-bottom: 20px; text-align: center; border: 1px solid #3b82f6; border-radius: 5px; color: #1e40af; font-weight: bold; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; background: #f9f9f9; }
            .stat-value { font-size: 24px; font-weight: bold; color: #dc2626; }
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
              
              <p>تقرير المشتريات - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalPurchases}</div>
              <div class="stat-label">إجمالي المشتريات</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalCost.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي التكلفة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${paidPurchases}</div>
              <div class="stat-label">المشتريات المدفوعة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${pendingPurchases}</div>
              <div class="stat-label">المشتريات المعلقة</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>المورد</th>
                <th>المبلغ</th>
                <th>حالة الدفع</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPurchases.map(purchase => `
                <tr>
                  <td>${purchase.invoiceNumber}</td>
                  <td>${purchase.supplierName || 'غير محدد'}</td>
                  <td>${parseFloat(purchase.total || '0').toLocaleString('en-US')} ريال</td>
                  <td>${purchase.paymentStatus === 'paid' ? 'مدفوع' : purchase.paymentStatus === 'pending' ? 'معلق' : purchase.paymentMethod || 'غير محدد'}</td>
                  <td>${purchase.date ? new Date(purchase.date).toLocaleDateString('en-GB') : 'غير محدد'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour12: false })}</p>
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
          <div className="bg-red-100 p-3 rounded-full">
            <ShoppingBag className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير المشتريات</h1>
            <p className="text-gray-600">تقرير تفصيلي للمشتريات - الفرع رقم: {branchId}</p>
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
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">فاتورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التكلفة</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalCost.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الشراء</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgPurchaseValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">متوسط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموردين النشطين</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">مورد</p>
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
                    placeholder="البحث برقم الفاتورة أو اسم المورد..."
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
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المشتريات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">رقم الفاتورة</th>
                      <th className="text-right py-2 px-4">المورد</th>
                      <th className="text-right py-2 px-4">المبلغ</th>
                      <th className="text-right py-2 px-4">حالة الدفع</th>
                      <th className="text-right py-2 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{purchase.invoiceNumber}</td>
                        <td className="py-2 px-4">{purchase.supplierName || 'غير محدد'}</td>
                        <td className="py-2 px-4 text-red-600 font-semibold">
                          {parseFloat(purchase.total || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={purchase.paymentStatus === 'paid' ? 'default' : purchase.paymentStatus === 'pending' ? 'secondary' : 'destructive'}>
                            {purchase.paymentStatus === 'paid' ? 'مدفوع' : purchase.paymentStatus === 'pending' ? 'معلق' : 'ملغي'}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">{purchase.date ? new Date(purchase.date).toLocaleDateString('en-GB') : 'غير محدد'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPurchases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مشتريات متاحة
                </div>
              )}
              <PaginationControls
                currentPage={currentPage}
                pageCount={pageCount}
                totalItems={filteredPurchases.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                itemName="فاتورة شراء"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.slice(0, 6).map((supplier) => {
                  const supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplier.id);
                  const supplierCost = supplierPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
                  
                  return (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <Badge variant="outline">{supplierPurchases.length} عملية شراء</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{supplier.email}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">إجمالي المشتريات:</span>
                        <span className="font-semibold text-red-600">
                          {supplierCost.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
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
              <CardTitle>المنتجات المشتراة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                سيتم عرض تقرير المنتجات المشتراة هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}