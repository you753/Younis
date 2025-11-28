import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Download, BarChart3, Warehouse } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchWarehouseReportProps {
  branchId?: number;
}

export default function BranchWarehouseReport({ branchId }: BranchWarehouseReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات المخزون
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

  // حساب إحصائيات المخزون
  const totalStorageValue = products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity || '0');
    const price = parseFloat(product.purchasePrice || '0');
    return sum + (quantity * price);
  }, 0);

  const totalStockQuantity = products.reduce((sum, product) => {
    return sum + parseFloat(product.quantity || '0');
  }, 0);

  const lowStockItems = products.filter(product => {
    const quantity = parseFloat(product.quantity || '0');
    const minStock = parseFloat(product.minStock || '10');
    return quantity <= minStock && quantity > 0;
  });

  const outOfStockItems = products.filter(product => {
    const quantity = parseFloat(product.quantity || '0');
    return quantity === 0;
  });

  const warehouseCapacity = 100000; // سعة المخزن الافتراضية
  const occupiedSpace = totalStockQuantity;
  const occupancyRate = (occupiedSpace / warehouseCapacity) * 100;

  // حركة المخزون
  const totalIncoming = purchases.reduce((sum, purchase) => {
    return sum + parseFloat(purchase.totalAmount || '0');
  }, 0);

  const totalOutgoing = sales.reduce((sum, sale) => {
    return sum + parseFloat(sale.totalAmount || '0');
  }, 0);

  const netMovement = totalIncoming - totalOutgoing;

  // تصفية البيانات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const quantity = parseFloat(product.quantity || '0');
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'inStock' && quantity > 0) ||
                         (statusFilter === 'outOfStock' && quantity === 0) ||
                         (statusFilter === 'lowStock' && quantity <= parseFloat(product.minStock || '10'));
    return matchesSearch && matchesStatus;
  });

  // طباعة التقرير
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const branchName = branch?.name || `الفرع ${branchId}`;

    const reportContent = `
      <html dir="rtl">
        <head>
          <title>تقرير المخزون - ${branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
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
              
              <p>تقرير المخزون - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalStorageValue.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي قيمة المخزون</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalStockQuantity.toLocaleString('en-US')}</div>
              <div class="stat-label">إجمالي الكمية المخزونة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${occupancyRate.toFixed(1)}%</div>
              <div class="stat-label">نسبة الإشغال</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${netMovement.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">صافي حركة المخزون</div>
            </div>
          </div>

          ${lowStockItems.length > 0 ? `
            <div class="alert">
              <strong>تحذير:</strong> يوجد ${lowStockItems.length} عنصر منخفض المخزون
            </div>
          ` : ''}

          ${outOfStockItems.length > 0 ? `
            <div class="alert">
              <strong>تحذير:</strong> يوجد ${outOfStockItems.length} عنصر نافد من المخزون
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>كود المنتج</th>
                <th>اسم المنتج</th>
                <th>الكمية المخزونة</th>
                <th>الحد الأدنى</th>
                <th>قيمة المخزون</th>
                <th>حالة المخزون</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => {
                const quantity = parseFloat(product.quantity || '0');
                const minStock = parseFloat(product.minStock || '10');
                const value = quantity * parseFloat(product.purchasePrice || '0');
                let status = 'متوفر';
                if (quantity === 0) status = 'نافد';
                else if (quantity <= minStock) status = 'منخفض';
                
                return `
                  <tr>
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td>${quantity}</td>
                    <td>${minStock}</td>
                    <td>${value.toLocaleString('en-US')} ريال</td>
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
          <div className="bg-indigo-100 p-3 rounded-full">
            <Warehouse className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير المخزون</h1>
            <p className="text-gray-600">تقرير شامل لحالة المخزون - الفرع رقم: {branchId}</p>
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
            <CardTitle className="text-sm font-medium">إجمالي قيمة المخزون</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStorageValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">قيمة إجمالية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكمية المخزونة</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalStockQuantity.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">وحدة مخزونة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الإشغال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${occupancyRate > 80 ? 'text-red-600' : occupancyRate > 60 ? 'text-orange-600' : 'text-green-600'}`}>
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">من السعة الكاملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي حركة المخزون</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netMovement.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">صافي الحركة</p>
          </CardContent>
        </Card>
      </div>

      {/* التنبيهات */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  مخزون منخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((product) => (
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

          {outOfStockItems.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  مخزون نافد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 5).map((product) => (
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في المخزون..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة المخزون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="inStock">متوفر</SelectItem>
                <SelectItem value="lowStock">منخفض</SelectItem>
                <SelectItem value="outOfStock">نافد</SelectItem>
              </SelectContent>
            </Select>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="المخزن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المخازن</SelectItem>
                <SelectItem value="main">المخزن الرئيسي</SelectItem>
                <SelectItem value="secondary">المخزن الثانوي</SelectItem>
                <SelectItem value="returns">مخزن المرتجعات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stock">حالة المخزون</TabsTrigger>
          <TabsTrigger value="movement">حركة المخزون</TabsTrigger>
          <TabsTrigger value="capacity">السعة والإشغال</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حالة المخزون التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">كود المنتج</th>
                      <th className="text-right py-2 px-4">اسم المنتج</th>
                      <th className="text-right py-2 px-4">الكمية</th>
                      <th className="text-right py-2 px-4">الحد الأدنى</th>
                      <th className="text-right py-2 px-4">قيمة المخزون</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const quantity = parseFloat(product.quantity || '0');
                      const minStock = parseFloat(product.minStock || '10');
                      const value = quantity * parseFloat(product.purchasePrice || '0');
                      
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
                            {value.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حركة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">المخزون الوارد</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {totalIncoming.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                  <p className="text-sm text-green-600">من المشتريات</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">المخزون الصادر</h3>
                  <div className="text-2xl font-bold text-red-600">
                    {totalOutgoing.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                  <p className="text-sm text-red-600">من المبيعات</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">صافي الحركة</h3>
                  <div className={`text-2xl font-bold ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netMovement.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                  <p className="text-sm text-blue-600">صافي التغيير</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>السعة والإشغال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-4">إحصائيات السعة</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {warehouseCapacity.toLocaleString('en-US')}
                      </div>
                      <p className="text-sm text-gray-600">السعة الكاملة</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {occupiedSpace.toLocaleString('en-US')}
                      </div>
                      <p className="text-sm text-gray-600">المساحة المشغولة</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span>نسبة الإشغال</span>
                      <span className="font-bold">{occupancyRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          occupancyRate > 80 ? 'bg-red-500' : 
                          occupancyRate > 60 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تنبيهات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-3">منتجات منخفضة المخزون ({lowStockItems.length})</h3>
                    <div className="space-y-2">
                      {lowStockItems.map((product) => (
                        <div key={product.id} className="flex justify-between items-center">
                          <span>{product.name}</span>
                          <Badge variant="outline" className="text-orange-600">
                            {product.quantity} متبقي
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {outOfStockItems.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">منتجات نافدة ({outOfStockItems.length})</h3>
                    <div className="space-y-2">
                      {outOfStockItems.map((product) => (
                        <div key={product.id} className="flex justify-between items-center">
                          <span>{product.name}</span>
                          <Badge variant="destructive">نافد</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد تنبيهات حالياً - المخزون في حالة جيدة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}