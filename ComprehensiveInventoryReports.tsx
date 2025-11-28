import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Archive,
  FileText,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType: string;
  referenceId?: number;
  referenceNumber?: string;
  notes?: string;
  movementDate: string;
  createdAt: string;
}

interface MovementsSummary {
  summary: {
    totalMovements: number;
    totalInMovements: number;
    totalOutMovements: number;
    totalInQuantity: number;
    totalOutQuantity: number;
    netMovement: number;
  };
  movementsByReference: Record<string, {
    count: number;
    inQuantity: number;
    outQuantity: number;
  }>;
  productMovements: Array<{
    productId: number;
    productName: string;
    productCode: string;
    categoryName: string;
    totalMovements: number;
    inQuantity: number;
    outQuantity: number;
    currentStock: number;
  }>;
  categoryMovements: Array<{
    categoryName: string;
    totalProducts: number;
    totalMovements: number;
    inQuantity: number;
    outQuantity: number;
    currentStock: number;
  }>;
  recentMovements: InventoryMovement[];
}

interface StockStatus {
  stockStatus: Array<{
    productId: number;
    productName: string;
    productCode: string;
    categoryName: string;
    currentStock: number;
    totalInMovements: number;
    totalOutMovements: number;
    netMovement: number;
    lastMovementDate: string | null;
    lastMovementType: string | null;
    stockStatus: 'low' | 'normal';
    minStock: number;
    maxStock: number;
  }>;
  categoryStatus: Array<{
    categoryName: string;
    totalProducts: number;
    totalStock: number;
    lowStockProducts: number;
    totalMovements: number;
  }>;
  summary: {
    totalProducts: number;
    lowStockProducts: number;
    totalCurrentStock: number;
    totalMovements: number;
  };
}

export default function ComprehensiveInventoryReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReference, setFilterReference] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // جلب البيانات
  const { data: movements = [], isLoading: movementsLoading } = useQuery<InventoryMovement[]>({
    queryKey: ['/api/inventory-movements'],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<MovementsSummary>({
    queryKey: ['/api/inventory-movements/reports/summary'],
  });

  const { data: stockStatus, isLoading: stockLoading } = useQuery<StockStatus>({
    queryKey: ['/api/inventory-movements/reports/stock-status'],
  });

  // تصفية الحركات
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReference = filterReference === 'all' || movement.referenceType === filterReference;
    return matchesSearch && matchesReference;
  });

  // تصفية حالة المخزون
  const filteredStockStatus = stockStatus?.stockStatus.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'in': return <Badge variant="secondary" className="bg-green-100 text-green-800">دخول</Badge>;
      case 'out': return <Badge variant="secondary" className="bg-red-100 text-red-800">خروج</Badge>;
      default: return <Badge variant="secondary" className="bg-blue-100 text-blue-800">تعديل</Badge>;
    }
  };

  const getReferenceTypeName = (type: string) => {
    const types: Record<string, string> = {
      'goods_issue_voucher': 'سند إخراج',
      'goods_receipt_voucher': 'سند إدخال',
      'sale': 'فاتورة مبيعات',
      'purchase': 'فاتورة مشتريات',
      'sale_return': 'مرتجع مبيعات',
      'purchase_return': 'مرتجع مشتريات',
      'adjustment': 'تعديل مخزون',
      'manual': 'يدوي'
    };
    return types[type] || type;
  };

  const getStockStatusBadge = (status: 'low' | 'normal') => {
    return status === 'low' 
      ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />نفاد</Badge>
      : <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />عادي</Badge>;
  };

  if (movementsLoading || summaryLoading || stockLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-lg">جاري تحميل التقارير...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير حركة المخزون الشاملة</h1>
          <p className="text-gray-600 mt-1">تقارير احترافية شاملة لحركة المخزون مع ربط سندات الإدخال والإخراج</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير Excel
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الحركات</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.summary.totalMovements.toLocaleString('ar')}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حركات الدخول</p>
                  <p className="text-2xl font-bold text-green-600">{summary.summary.totalInMovements.toLocaleString('ar')}</p>
                  <p className="text-xs text-gray-500">{summary.summary.totalInQuantity.toLocaleString('ar')} قطعة</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حركات الخروج</p>
                  <p className="text-2xl font-bold text-red-600">{summary.summary.totalOutMovements.toLocaleString('ar')}</p>
                  <p className="text-xs text-gray-500">{summary.summary.totalOutQuantity.toLocaleString('ar')} قطعة</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">صافي الحركة</p>
                  <p className={`text-2xl font-bold ${summary.summary.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.summary.netMovement >= 0 ? '+' : ''}{summary.summary.netMovement.toLocaleString('ar')}
                  </p>
                  <p className="text-xs text-gray-500">قطعة</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs للتقارير المختلفة */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="movements" className="gap-2">
            <Activity className="h-4 w-4" />
            حركات المخزون
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            تقرير المنتجات
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="h-4 w-4" />
            تقرير الفئات
          </TabsTrigger>
          <TabsTrigger value="references" className="gap-2">
            <FileText className="h-4 w-4" />
            تقرير المراجع
          </TabsTrigger>
          <TabsTrigger value="stock-status" className="gap-2">
            <Archive className="h-4 w-4" />
            حالة المخزون
          </TabsTrigger>
        </TabsList>

        {/* تبويب حركات المخزون */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                سجل حركات المخزون التفصيلي
              </CardTitle>
              <CardDescription>جميع حركات الدخول والخروج مع ربط سندات الإدخال والإخراج</CardDescription>
              
              {/* أدوات التصفية */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث في المنتجات أو الأكواد أو المراجع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterReference} onValueChange={setFilterReference}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب المرجع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المراجع</SelectItem>
                    <SelectItem value="goods_issue_voucher">سندات الإخراج</SelectItem>
                    <SelectItem value="goods_receipt_voucher">سندات الإدخال</SelectItem>
                    <SelectItem value="sale">فواتير المبيعات</SelectItem>
                    <SelectItem value="purchase">فواتير المشتريات</SelectItem>
                    <SelectItem value="sale_return">مرتجعات المبيعات</SelectItem>
                    <SelectItem value="purchase_return">مرتجعات المشتريات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>نوع الحركة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead>رقم المرجع</TableHead>
                      <TableHead>ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(movement.movementDate), 'yyyy/MM/dd HH:mm', { locale: ar })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.productName}</div>
                            <div className="text-sm text-gray-500">{movement.productCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementTypeIcon(movement.movementType)}
                            {getMovementTypeBadge(movement.movementType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${movement.movementType === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.movementType === 'in' ? '+' : '-'}{movement.quantity.toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getReferenceTypeName(movement.referenceType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {movement.referenceNumber && (
                            <span className="text-blue-600 font-mono text-sm">
                              {movement.referenceNumber}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {movement.notes || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب تقرير المنتجات */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                تقرير حركة المنتجات
              </CardTitle>
              <CardDescription>ملخص حركات كل منتج مع إجمالي الدخول والخروج</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>المخزون الحالي</TableHead>
                      <TableHead>إجمالي الدخول</TableHead>
                      <TableHead>إجمالي الخروج</TableHead>
                      <TableHead>صافي الحركة</TableHead>
                      <TableHead>عدد الحركات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.productMovements.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.productName}</div>
                            <div className="text-sm text-gray-500">{product.productCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{product.currentStock.toLocaleString('ar')}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            +{product.inQuantity.toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">
                            -{product.outQuantity.toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${(product.inQuantity - product.outQuantity) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(product.inQuantity - product.outQuantity) >= 0 ? '+' : ''}{(product.inQuantity - product.outQuantity).toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.totalMovements.toLocaleString('ar')}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب تقرير الفئات */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                تقرير حركة الفئات
              </CardTitle>
              <CardDescription>ملخص حركات كل فئة من المنتجات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary?.categoryMovements.map((category) => (
                  <Card key={category.categoryName}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{category.categoryName}</h3>
                          <Badge variant="outline">{category.totalProducts.toLocaleString('ar')} منتج</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">المخزون الحالي:</span>
                            <span className="font-medium">{category.currentStock.toLocaleString('ar')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">إجمالي الدخول:</span>
                            <span className="text-green-600 font-medium">+{category.inQuantity.toLocaleString('ar')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">إجمالي الخروج:</span>
                            <span className="text-red-600 font-medium">-{category.outQuantity.toLocaleString('ar')}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-gray-600">عدد الحركات:</span>
                            <span className="font-medium">{category.totalMovements.toLocaleString('ar')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب تقرير المراجع */}
        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تقرير أنواع المراجع
              </CardTitle>
              <CardDescription>ملخص حركات المخزون حسب نوع المرجع (سندات، فواتير، إلخ)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary && Object.entries(summary.movementsByReference).map(([type, data]) => (
                  <Card key={type}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{getReferenceTypeName(type)}</h3>
                          <Badge variant="outline">{data.count.toLocaleString('ar')} حركة</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">كمية الدخول:</span>
                            <span className="text-green-600 font-medium">+{data.inQuantity.toLocaleString('ar')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">كمية الخروج:</span>
                            <span className="text-red-600 font-medium">-{data.outQuantity.toLocaleString('ar')}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-gray-600">صافي الحركة:</span>
                            <span className={`font-medium ${(data.inQuantity - data.outQuantity) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(data.inQuantity - data.outQuantity) >= 0 ? '+' : ''}{(data.inQuantity - data.outQuantity).toLocaleString('ar')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب حالة المخزون */}
        <TabsContent value="stock-status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                تقرير حالة المخزون مع ربط الحركات
              </CardTitle>
              <CardDescription>حالة المخزون الحالية مع تفاصيل آخر الحركات</CardDescription>
              
              {/* أدوات التصفية */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث في المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {stockStatus?.categoryStatus.map((category) => (
                      <SelectItem key={category.categoryName} value={category.categoryName}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>المخزون الحالي</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجمالي الدخول</TableHead>
                      <TableHead>إجمالي الخروج</TableHead>
                      <TableHead>آخر حركة</TableHead>
                      <TableHead>تاريخ آخر حركة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockStatus.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">{item.productCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-lg">{item.currentStock.toLocaleString('ar')}</span>
                          <div className="text-xs text-gray-500">
                            الحد الأدنى: {item.minStock.toLocaleString('ar')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStockStatusBadge(item.stockStatus)}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            +{item.totalInMovements.toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">
                            -{item.totalOutMovements.toLocaleString('ar')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.lastMovementType && (
                            <div className="flex items-center gap-2">
                              {getMovementTypeIcon(item.lastMovementType)}
                              {getMovementTypeBadge(item.lastMovementType)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.lastMovementDate && (
                            <span className="text-sm text-gray-600">
                              {format(new Date(item.lastMovementDate), 'yyyy/MM/dd', { locale: ar })}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}