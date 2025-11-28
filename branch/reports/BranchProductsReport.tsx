import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Search, Download, ShoppingCart, Tag, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchProductsReportProps {
  branchId?: number;
}

export default function BranchProductsReport({ branchId }: BranchProductsReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات الأصناف للفرع فقط
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/products?branchId=${branchId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: !!branchId
  });

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

  // حساب إحصائيات الأصناف
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;

  // حساب إجمالي قيمة الأصناف
  const totalProductValue = products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity || '0');
    const salePrice = parseFloat(product.salePrice || '0');
    return sum + (quantity * salePrice);
  }, 0);

  // حساب إجمالي هوامش الربح
  const totalProfitMargin = products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity || '0');
    const purchasePrice = parseFloat(product.purchasePrice || '0');
    const salePrice = parseFloat(product.salePrice || '0');
    const profit = (salePrice - purchasePrice) * quantity;
    return sum + profit;
  }, 0);

  // حساب متوسط سعر البيع
  const averageSalePrice = products.length > 0 ? 
    products.reduce((sum, product) => sum + parseFloat(product.salePrice || '0'), 0) / products.length : 0;

  // تصنيف الأصناف حسب الفئة
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const categoryStats = categories.map(category => ({
    name: category,
    count: products.filter(p => p.category === category).length,
    value: products.filter(p => p.category === category).reduce((sum, product) => {
      const quantity = parseFloat(product.quantity || '0');
      const salePrice = parseFloat(product.salePrice || '0');
      return sum + (quantity * salePrice);
    }, 0)
  }));

  // الأصناف الأكثر مبيعاً (محاكاة)
  const topSellingProducts = products.slice(0, 10);

  // تصفية البيانات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
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
          <title>تقرير الأصناف - ${branchName}</title>
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
              
              <p>تقرير الأصناف - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalProducts}</div>
              <div class="stat-label">إجمالي الأصناف</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeProducts}</div>
              <div class="stat-label">الأصناف النشطة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalProductValue.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي قيمة الأصناف</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${averageSalePrice.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">متوسط سعر البيع</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>كود الصنف</th>
                <th>اسم الصنف</th>
                <th>الفئة</th>
                <th>سعر الشراء</th>
                <th>سعر البيع</th>
                <th>هامش الربح</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => {
                const purchasePrice = parseFloat(product.purchasePrice || '0');
                const salePrice = parseFloat(product.salePrice || '0');
                const profitMargin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0;
                
                return `
                  <tr>
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td>${product.category || 'غير محدد'}</td>
                    <td>${purchasePrice.toLocaleString('en-US')} ريال</td>
                    <td>${salePrice.toLocaleString('en-US')} ريال</td>
                    <td>${profitMargin.toFixed(1)}%</td>
                    <td>${product.status === 'active' ? 'نشط' : 'غير نشط'}</td>
                  </tr>
                `;
              }).join('')}
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
          <div className="bg-purple-100 p-3 rounded-full">
            <ShoppingCart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير الأصناف</h1>
            <p className="text-gray-600">تقرير شامل للأصناف والمنتجات - الفرع رقم: {branchId}</p>
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

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">صنف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأصناف النشطة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">من أصل {totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي قيمة الأصناف</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalProductValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">بأسعار البيع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط سعر البيع</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {averageSalePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">متوسط للصنف</p>
          </CardContent>
        </Card>
      </div>

      {/* البحث والتصفية */}
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
                    placeholder="البحث بالاسم أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">الأصناف</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="pricing">التسعير</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الأصناف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">الكود</th>
                      <th className="text-right py-2 px-4">اسم الصنف</th>
                      <th className="text-right py-2 px-4">الفئة</th>
                      <th className="text-right py-2 px-4">سعر الشراء</th>
                      <th className="text-right py-2 px-4">سعر البيع</th>
                      <th className="text-right py-2 px-4">هامش الربح</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const purchasePrice = parseFloat(product.purchasePrice || '0');
                      const salePrice = parseFloat(product.salePrice || '0');
                      const profitMargin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0;
                      
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{product.code}</td>
                          <td className="py-2 px-4">{product.name}</td>
                          <td className="py-2 px-4">{product.category || 'غير محدد'}</td>
                          <td className="py-2 px-4 text-red-600 font-semibold">
                            {purchasePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </td>
                          <td className="py-2 px-4 text-green-600 font-semibold">
                            {salePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </td>
                          <td className="py-2 px-4 font-semibold">
                            <span className={profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد أصناف متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryStats.map((category) => (
                  <div key={category.name} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">عدد الأصناف:</span>
                        <span className="font-semibold">{category.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">إجمالي القيمة:</span>
                        <span className="font-semibold text-green-600">
                          {category.value.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">متوسط القيمة:</span>
                        <span className="font-semibold text-blue-600">
                          {category.count > 0 ? (category.value / category.count).toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : '0 ريال'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل التسعير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">متوسط سعر الشراء</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {products.length > 0 ? (products.reduce((sum, product) => sum + parseFloat(product.purchasePrice || '0'), 0) / products.length).toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : '0 ريال'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">متوسط سعر البيع</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {averageSalePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">إجمالي هامش الربح</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    {totalProfitMargin.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء الأصناف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">إحصائيات الأصناف</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>الأصناف النشطة:</span>
                        <span className="font-semibold text-green-600">{activeProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الأصناف غير النشطة:</span>
                        <span className="font-semibold text-red-600">{inactiveProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الأصناف:</span>
                        <span className="font-semibold">{totalProducts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">التحليل المالي</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>إجمالي القيمة:</span>
                        <span className="font-semibold text-green-600">
                          {totalProductValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي هامش الربح:</span>
                        <span className="font-semibold text-purple-600">
                          {totalProfitMargin.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط سعر البيع:</span>
                        <span className="font-semibold text-blue-600">
                          {averageSalePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-3">الأصناف الأكثر قيمة</h3>
                  <div className="space-y-2">
                    {products
                      .sort((a, b) => {
                        const valueA = parseFloat(a.quantity || '0') * parseFloat(a.salePrice || '0');
                        const valueB = parseFloat(b.quantity || '0') * parseFloat(b.salePrice || '0');
                        return valueB - valueA;
                      })
                      .slice(0, 5)
                      .map((product) => {
                        const value = parseFloat(product.quantity || '0') * parseFloat(product.salePrice || '0');
                        return (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded">
                            <span className="font-medium">{product.name}</span>
                            <span className="font-semibold text-green-600">
                              {value.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}