import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, TrendingDown, CreditCard, FileText, Search, Download, Phone, Mail, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchSuppliersReportProps {
  branchId?: number;
}

export default function BranchSuppliersReport({ branchId }: BranchSuppliersReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
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

  // جلب بيانات سندات الصرف للفرع فقط
  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/supplier-payments', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/supplier-payments?branchId=${branchId}` : '/api/supplier-payments';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب الإحصائيات
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(supplier => supplier.status === 'active').length;
  const totalBalance = suppliers.reduce((sum, supplier) => sum + parseFloat(supplier.balance || '0'), 0);
  const totalOpeningBalance = suppliers.reduce((sum, supplier) => sum + parseFloat(supplier.openingBalance || '0'), 0);
  const suppliersWithBalance = suppliers.filter(supplier => parseFloat(supplier.balance || '0') > 0).length;

  // تصفية البيانات
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const supplierBalance = parseFloat(supplier.balance || '0');
    const matchesBalance = balanceFilter === 'all' || 
                          (balanceFilter === 'positive' && supplierBalance > 0) ||
                          (balanceFilter === 'zero' && supplierBalance === 0) ||
                          (balanceFilter === 'negative' && supplierBalance < 0);
    return matchesSearch && matchesStatus && matchesBalance;
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
          <title>تقرير الموردين - ${branchName}</title>
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
              
              <p>تقرير الموردين - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalSuppliers}</div>
              <div class="stat-label">إجمالي الموردين</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeSuppliers}</div>
              <div class="stat-label">الموردين النشطين</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalBalance.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الأرصدة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${suppliersWithBalance}</div>
              <div class="stat-label">موردين لديهم أرصدة</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>اسم المورد</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الرصيد الافتتاحي</th>
                <th>الرصيد الحالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSuppliers.map(supplier => `
                <tr>
                  <td>${supplier.name}</td>
                  <td>${supplier.email || 'غير محدد'}</td>
                  <td>${supplier.phone || 'غير محدد'}</td>
                  <td>${parseFloat(supplier.openingBalance || '0').toLocaleString('en-US')} ريال</td>
                  <td>${parseFloat(supplier.balance || '0').toLocaleString('en-US')} ريال</td>
                  <td>${supplier.status === 'active' ? 'نشط' : 'غير نشط'}</td>
                </tr>
              `).join('')}
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
          <div className="bg-orange-100 p-3 rounded-full">
            <Building className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير الموردين</h1>
            <p className="text-gray-600">تقرير تفصيلي للموردين - الفرع رقم: {branchId}</p>
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
        <Button onClick={printReport} className="bg-green-600 hover:bg-green-700" data-testid="button-print-report">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">مورد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموردين النشطين</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">مورد نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">رصيد حالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الافتتاحي</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalOpeningBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">رصيد افتتاحي</p>
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
                    placeholder="البحث باسم المورد أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status">
                  <SelectValue placeholder="حالة المورد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-balance">
                  <SelectValue placeholder="حالة الرصيد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأرصدة</SelectItem>
                  <SelectItem value="positive">رصيد موجب</SelectItem>
                  <SelectItem value="zero">رصيد صفر</SelectItem>
                  <SelectItem value="negative">رصيد سالب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="balances">الأرصدة</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">اسم المورد</th>
                      <th className="text-right py-2 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-2 px-4">الهاتف</th>
                      <th className="text-right py-2 px-4">الرصيد الافتتاحي</th>
                      <th className="text-right py-2 px-4">الرصيد الحالي</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{supplier.name}</td>
                        <td className="py-2 px-4 text-blue-600">{supplier.email || 'غير محدد'}</td>
                        <td className="py-2 px-4">{supplier.phone || 'غير محدد'}</td>
                        <td className="py-2 px-4 text-green-600">
                          {parseFloat(supplier.openingBalance || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4 text-red-600 font-semibold">
                          {parseFloat(supplier.balance || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                            {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredSuppliers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد موردين متاحين
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأرصدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map((supplier) => {
                  const supplierBalance = parseFloat(supplier.balance || '0');
                  const supplierOpeningBalance = parseFloat(supplier.openingBalance || '0');
                  const difference = supplierBalance - supplierOpeningBalance;
                  
                  return (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <Badge variant={supplierBalance > 0 ? 'destructive' : supplierBalance < 0 ? 'default' : 'secondary'}>
                          {supplierBalance > 0 ? 'دين للمورد' : supplierBalance < 0 ? 'دين على المورد' : 'رصيد صفر'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الرصيد الافتتاحي:</span>
                          <span className="font-semibold text-green-600">
                            {supplierOpeningBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الرصيد الحالي:</span>
                          <span className="font-semibold text-red-600">
                            {supplierBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm text-gray-500">الفرق:</span>
                          <span className={`font-semibold ${difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نشاط الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.slice(0, 6).map((supplier) => {
                  // تصفية المشتريات والمدفوعات حسب التاريخ
                  let supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplier.id);
                  let supplierPayments = payments.filter(payment => payment.supplierId === supplier.id);
                  
                  // تطبيق فلتر التاريخ
                  if (dateFrom) {
                    const fromDate = new Date(dateFrom);
                    supplierPurchases = supplierPurchases.filter(p => new Date(p.date || p.createdAt) >= fromDate);
                    supplierPayments = supplierPayments.filter(p => new Date(p.paymentDate || p.date || p.createdAt) >= fromDate);
                  }
                  if (dateTo) {
                    const toDate = new Date(dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    supplierPurchases = supplierPurchases.filter(p => new Date(p.date || p.createdAt) <= toDate);
                    supplierPayments = supplierPayments.filter(p => new Date(p.paymentDate || p.date || p.createdAt) <= toDate);
                  }
                  
                  const totalPurchases = supplierPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount || '0'), 0);
                  const totalPayments = supplierPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);
                  
                  return (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <div className="flex gap-2">
                          {supplier.phone && <Phone className="h-4 w-4 text-gray-500" />}
                          {supplier.email && <Mail className="h-4 w-4 text-gray-500" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">المشتريات:</span>
                          <span className="font-semibold text-blue-600">{supplierPurchases.length} فاتورة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">قيمة المشتريات:</span>
                          <span className="font-semibold text-red-600">
                            {totalPurchases.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">المدفوعات:</span>
                          <span className="font-semibold text-green-600">
                            {totalPayments.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}