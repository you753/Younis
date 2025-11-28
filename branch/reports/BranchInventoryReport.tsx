import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Download, BarChart3, Eye, ShoppingCart, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchInventoryReportProps {
  branchId?: number;
}

export default function BranchInventoryReport({ branchId }: BranchInventoryReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات الأصناف والمخزون
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory'],
  });

  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  // حساب الإحصائيات
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity || '0');
    const price = parseFloat(product.purchasePrice || '0');
    return sum + (quantity * price);
  }, 0);

  const lowStockProducts = products.filter(product => {
    const quantity = parseFloat(product.quantity || '0');
    const minStock = parseFloat(product.minStock || '10');
    return quantity <= minStock;
  });

  const outOfStockProducts = products.filter(product => {
    const quantity = parseFloat(product.quantity || '0');
    return quantity === 0;
  });

  const mostSoldProducts = products.slice(0, 5);
  const totalStockValue = products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity || '0');
    const salePrice = parseFloat(product.salePrice || '0');
    return sum + (quantity * salePrice);
  }, 0);

  // تصفية البيانات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const quantity = parseFloat(product.quantity || '0');
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'inStock' && quantity > 0) ||
                         (statusFilter === 'outOfStock' && quantity === 0) ||
                         (statusFilter === 'lowStock' && quantity <= parseFloat(product.minStock || '10'));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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
          <title>تقرير المخزون والأصناف - ${branchName}</title>
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
            .alert { background-color: #fef2f2; border: 1px solid #fecaca; padding: 10px; margin: 10px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              
              <p>تقرير المخزون والأصناف - ${branchName}</p>
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
              <div class="stat-value">${totalInventoryValue.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">قيمة المخزون</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${lowStockProducts.length}</div>
              <div class="stat-label">أصناف منخفضة المخزون</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${outOfStockProducts.length}</div>
              <div class="stat-label">أصناف نافدة</div>
            </div>
          </div>

          ${lowStockProducts.length > 0 ? `
            <div class="alert">
              <strong>تحذير:</strong> يوجد ${lowStockProducts.length} صنف منخفض المخزون يتطلب إعادة تعبئة
            </div>
          ` : ''}

          ${outOfStockProducts.length > 0 ? `
            <div class="alert">
              <strong>تحذير:</strong> يوجد ${outOfStockProducts.length} صنف نافد من المخزون
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>كود الصنف</th>
                <th>اسم الصنف</th>
                <th>الفئة</th>
                <th>الكمية الحالية</th>
                <th>الحد الأدنى</th>
                <th>سعر الشراء</th>
                <th>سعر البيع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => {
                const quantity = parseFloat(product.quantity || '0');
                const minStock = parseFloat(product.minStock || '10');
                let status = 'متوفر';
                if (quantity === 0) status = 'نافد';
                else if (quantity <= minStock) status = 'منخفض';
                
                return `
                  <tr>
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td>${product.category || 'غير محدد'}</td>
                    <td>${quantity}</td>
                    <td>${minStock}</td>
                    <td>${parseFloat(product.purchasePrice || '0').toLocaleString('en-US')} ريال</td>
                    <td>${parseFloat(product.salePrice || '0').toLocaleString('en-US')} ريال</td>
                    <td>${status}</td>
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
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير المخزون والأصناف</h1>
            <p className="text-gray-600">تقرير شامل للمخزون والأصناف - الفرع رقم: {branchId}</p>
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
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalInventoryValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">بأسعار الشراء</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أصناف منخفضة المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">يحتاج إعادة تعبئة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أصناف نافدة</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">نافد من المخزون</p>
          </CardContent>
        </Card>
      </div>

      {/* التنبيهات */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  أصناف منخفضة المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="outline" className="text-orange-600">
                        {product.quantity} متبقي
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  أصناف نافدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="destructive">نافد</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
                    placeholder="البحث باسم الصنف أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status">
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="inStock">متوفر</SelectItem>
                  <SelectItem value="lowStock">منخفض المخزون</SelectItem>
                  <SelectItem value="outOfStock">نافد</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="electronics">أجهزة إلكترونية</SelectItem>
                  <SelectItem value="furniture">أثاث</SelectItem>
                  <SelectItem value="clothing">ملابس</SelectItem>
                  <SelectItem value="books">كتب</SelectItem>
                  <SelectItem value="food">أطعمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="products">الأصناف</TabsTrigger>
          <TabsTrigger value="movement">حركة المخزون</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حالة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">كود الصنف</th>
                      <th className="text-right py-2 px-4">اسم الصنف</th>
                      <th className="text-right py-2 px-4">الكمية الحالية</th>
                      <th className="text-right py-2 px-4">الحد الأدنى</th>
                      <th className="text-right py-2 px-4">قيمة المخزون</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const quantity = parseFloat(product.quantity || '0');
                      const minStock = parseFloat(product.minStock || '10');
                      const purchasePrice = parseFloat(product.purchasePrice || '0');
                      const inventoryValue = quantity * purchasePrice;
                      
                      let status = 'متوفر';
                      let statusColor = 'default';
                      if (quantity === 0) {
                        status = 'نافد';
                        statusColor = 'destructive';
                      } else if (quantity <= minStock) {
                        status = 'منخفض';
                        statusColor = 'secondary';
                      }
                      
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{product.code}</td>
                          <td className="py-2 px-4">{product.name}</td>
                          <td className="py-2 px-4 text-center font-semibold">{quantity}</td>
                          <td className="py-2 px-4 text-center">{minStock}</td>
                          <td className="py-2 px-4 text-green-600 font-semibold">
                            {inventoryValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </td>
                          <td className="py-2 px-4">
                            <Badge variant={statusColor}>{status}</Badge>
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

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الأصناف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => {
                  const quantity = parseFloat(product.quantity || '0');
                  const purchasePrice = parseFloat(product.purchasePrice || '0');
                  const salePrice = parseFloat(product.salePrice || '0');
                  const profitMargin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0;
                  
                  return (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline">{product.code}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الفئة:</span>
                          <span className="font-medium">{product.category || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الكمية:</span>
                          <span className="font-semibold">{quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">سعر الشراء:</span>
                          <span className="font-semibold text-red-600">
                            {purchasePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">سعر البيع:</span>
                          <span className="font-semibold text-green-600">
                            {salePrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm text-gray-500">هامش الربح:</span>
                          <span className={`font-semibold ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profitMargin.toFixed(1)}%
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

        <TabsContent value="movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حركة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">المبيعات</h3>
                    <div className="text-2xl font-bold text-green-600">{sales.length}</div>
                    <p className="text-sm text-green-600">فاتورة مبيعات</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">المشتريات</h3>
                    <div className="text-2xl font-bold text-blue-600">{purchases.length}</div>
                    <p className="text-sm text-blue-600">فاتورة شراء</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">إجمالي القيمة</h3>
                    <div className="text-2xl font-bold text-purple-600">
                      {totalStockValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </div>
                    <p className="text-sm text-purple-600">قيمة المخزون الحالي</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">توزيع المخزون</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>أصناف متوفرة:</span>
                      <span className="font-semibold text-green-600">
                        {products.filter(p => parseFloat(p.quantity || '0') > parseFloat(p.minStock || '10')).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>أصناف منخفضة المخزون:</span>
                      <span className="font-semibold text-orange-600">{lowStockProducts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>أصناف نافدة:</span>
                      <span className="font-semibold text-red-600">{outOfStockProducts.length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">التحليل المالي</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>قيمة المخزون (شراء):</span>
                      <span className="font-semibold text-red-600">
                        {totalInventoryValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>قيمة المخزون (بيع):</span>
                      <span className="font-semibold text-green-600">
                        {totalStockValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>الربح المحتمل:</span>
                      <span className="font-semibold text-blue-600">
                        {(totalStockValue - totalInventoryValue).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </span>
                    </div>
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