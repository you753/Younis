import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Printer,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeftRight
} from 'lucide-react';
import BranchTransfersReport from './BranchTransfersReport';

interface BranchReportsProps {
  branchId?: number;
}

export default function BranchReports({ branchId }: BranchReportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('this_month');
  const [reportType, setReportType] = useState('all');

  // بيانات تجريبية للتقارير
  const reportsData = {
    salesReport: {
      totalSales: 125000,
      totalOrders: 85,
      averageOrder: 1470,
      topProducts: [
        { name: 'لابتوب HP EliteBook', sales: 45000, quantity: 15 },
        { name: 'طابعة Canon', sales: 25000, quantity: 10 },
        { name: 'ماوس لاسلكي', sales: 12000, quantity: 40 }
      ]
    },
    inventoryReport: {
      totalProducts: 150,
      lowStock: 12,
      outOfStock: 3,
      totalValue: 285000,
      categories: [
        { name: 'أجهزة كمبيوتر', count: 45, value: 180000 },
        { name: 'طابعات ومسحات', count: 25, value: 65000 },
        { name: 'اكسسوارات', count: 80, value: 40000 }
      ]
    },
    employeeReport: {
      totalEmployees: 12,
      activeEmployees: 11,
      onLeave: 1,
      totalSalaries: 42000,
      departments: [
        { name: 'المبيعات', count: 5, totalSalary: 18000 },
        { name: 'المخزن', count: 3, totalSalary: 12000 },
        { name: 'الإدارة', count: 4, totalSalary: 12000 }
      ]
    },
    financialReport: {
      revenue: 125000,
      expenses: 85000,
      profit: 40000,
      profitMargin: 32,
      cashFlow: [
        { month: 'يناير', income: 95000, expenses: 65000 },
        { month: 'فبراير', income: 110000, expenses: 75000 },
        { month: 'مارس', income: 125000, expenses: 85000 }
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'نشط', color: 'bg-green-100 text-green-800' },
      'pending': { label: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'مكتمل', color: 'bg-blue-100 text-blue-800' },
      'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handlePrintReport = (reportType: string) => {
    console.log(`طباعة تقرير: ${reportType}`);
  };

  const handleDownloadReport = (reportType: string) => {
    console.log(`تحميل تقرير: ${reportType}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* العنوان والفلاتر */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقارير الفرع</h1>
            <p className="text-gray-600">تقارير شاملة وتحليلات مفصلة لأداء الفرع</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تصدير الكل
            </Button>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-60">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في التقارير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="this_week">هذا الأسبوع</SelectItem>
              <SelectItem value="this_month">هذا الشهر</SelectItem>
              <SelectItem value="last_month">الشهر الماضي</SelectItem>
              <SelectItem value="this_quarter">هذا الربع</SelectItem>
              <SelectItem value="this_year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="نوع التقرير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقارير</SelectItem>
              <SelectItem value="sales">تقارير المبيعات</SelectItem>
              <SelectItem value="inventory">تقارير المخزون</SelectItem>
              <SelectItem value="transfers">تحويلات المخزون</SelectItem>
              <SelectItem value="employees">تقارير الموظفين</SelectItem>
              <SelectItem value="financial">التقارير المالية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* التقارير الرئيسية */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">تقارير المبيعات</TabsTrigger>
          <TabsTrigger value="inventory">تقارير المخزون</TabsTrigger>
          <TabsTrigger value="transfers">تحويلات المخزون</TabsTrigger>
          <TabsTrigger value="employees">تقارير الموظفين</TabsTrigger>
          <TabsTrigger value="financial">التقارير المالية</TabsTrigger>
        </TabsList>

        {/* تقارير المبيعات */}
        <TabsContent value="sales" className="space-y-6">
          {/* إحصائيات المبيعات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportsData.salesReport.totalSales.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">عدد الطلبات</p>
                    <p className="text-2xl font-bold text-blue-600">{reportsData.salesReport.totalOrders}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">متوسط الطلب</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportsData.salesReport.averageOrder.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">أفضل المنتجات</p>
                    <p className="text-2xl font-bold text-orange-600">{reportsData.salesReport.topProducts.length}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول أفضل المنتجات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrintReport('sales')}>
                  <Printer className="h-4 w-4 ml-1" />
                  طباعة
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('sales')}>
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right p-3 font-semibold">المنتج</th>
                      <th className="text-right p-3 font-semibold">المبيعات</th>
                      <th className="text-right p-3 font-semibold">الكمية</th>
                      <th className="text-right p-3 font-semibold">متوسط السعر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.salesReport.topProducts.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          {product.sales.toLocaleString('en-US')} ريال
                        </td>
                        <td className="p-3">{product.quantity}</td>
                        <td className="p-3">
                          {(product.sales / product.quantity).toLocaleString('en-US')} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقارير المخزون */}
        <TabsContent value="inventory" className="space-y-6">
          {/* إحصائيات المخزون */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-blue-600">{reportsData.inventoryReport.totalProducts}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مخزون منخفض</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportsData.inventoryReport.lowStock}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">نفد المخزون</p>
                    <p className="text-2xl font-bold text-red-600">{reportsData.inventoryReport.outOfStock}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">قيمة المخزون</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportsData.inventoryReport.totalValue.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول فئات المخزون */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تقرير المخزون بالفئات</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrintReport('inventory')}>
                  <Printer className="h-4 w-4 ml-1" />
                  طباعة
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('inventory')}>
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right p-3 font-semibold">الفئة</th>
                      <th className="text-right p-3 font-semibold">عدد المنتجات</th>
                      <th className="text-right p-3 font-semibold">القيمة الإجمالية</th>
                      <th className="text-right p-3 font-semibold">متوسط القيمة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.inventoryReport.categories.map((category, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{category.name}</td>
                        <td className="p-3">{category.count}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          {category.value.toLocaleString('en-US')} ريال
                        </td>
                        <td className="p-3">
                          {(category.value / category.count).toLocaleString('en-US')} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير تحويلات المخزون */}
        <TabsContent value="transfers" className="space-y-6">
          <BranchTransfersReport branchId={branchId} />
        </TabsContent>

        {/* تقارير الموظفين */}
        <TabsContent value="employees" className="space-y-6">
          {/* إحصائيات الموظفين */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                    <p className="text-2xl font-bold text-blue-600">{reportsData.employeeReport.totalEmployees}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الموظفين النشطين</p>
                    <p className="text-2xl font-bold text-green-600">{reportsData.employeeReport.activeEmployees}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">في إجازة</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportsData.employeeReport.onLeave}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportsData.employeeReport.totalSalaries.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول الأقسام */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تقرير الموظفين حسب الأقسام</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrintReport('employees')}>
                  <Printer className="h-4 w-4 ml-1" />
                  طباعة
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('employees')}>
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right p-3 font-semibold">القسم</th>
                      <th className="text-right p-3 font-semibold">عدد الموظفين</th>
                      <th className="text-right p-3 font-semibold">إجمالي الرواتب</th>
                      <th className="text-right p-3 font-semibold">متوسط الراتب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.employeeReport.departments.map((dept, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{dept.name}</td>
                        <td className="p-3">{dept.count}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          {dept.totalSalary.toLocaleString('en-US')} ريال
                        </td>
                        <td className="p-3">
                          {(dept.totalSalary / dept.count).toLocaleString('en-US')} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التقارير المالية */}
        <TabsContent value="financial" className="space-y-6">
          {/* إحصائيات مالية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportsData.financialReport.revenue.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">
                      {reportsData.financialReport.expenses.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">صافي الربح</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportsData.financialReport.profit.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">هامش الربح</p>
                    <p className="text-2xl font-bold text-purple-600">{reportsData.financialReport.profitMargin}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <PieChart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول التدفق النقدي */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تقرير التدفق النقدي الشهري</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrintReport('financial')}>
                  <Printer className="h-4 w-4 ml-1" />
                  طباعة
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('financial')}>
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right p-3 font-semibold">الشهر</th>
                      <th className="text-right p-3 font-semibold">الإيرادات</th>
                      <th className="text-right p-3 font-semibold">المصروفات</th>
                      <th className="text-right p-3 font-semibold">صافي الربح</th>
                      <th className="text-right p-3 font-semibold">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.financialReport.cashFlow.map((month, index) => {
                      const profit = month.income - month.expenses;
                      const margin = ((profit / month.income) * 100).toFixed(1);
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{month.month}</td>
                          <td className="p-3 text-green-600 font-semibold">
                            {month.income.toLocaleString('en-US')} ريال
                          </td>
                          <td className="p-3 text-red-600 font-semibold">
                            {month.expenses.toLocaleString('en-US')} ريال
                          </td>
                          <td className="p-3 text-blue-600 font-semibold">
                            {profit.toLocaleString('en-US')} ريال
                          </td>
                          <td className="p-3 font-semibold">{margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}