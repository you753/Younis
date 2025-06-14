import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Warehouse, Download, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import type { Product, ProductCategory } from '@shared/schema';

export default function InventoryReports() {
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['/api/product-categories']
  });

  const filteredProducts = products.filter(product => {
    const quantity = product.quantity || 0;
    const stockMatch = stockFilter === 'all' || 
      (stockFilter === 'low' && quantity <= 10 && quantity > 0) ||
      (stockFilter === 'out' && quantity === 0) ||
      (stockFilter === 'available' && quantity > 10);
    
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return stockMatch && categoryMatch && searchMatch;
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.quantity || 0) <= 10 && (p.quantity || 0) > 0).length;
  const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0).length;
  const totalInventoryValue = products.reduce((sum, product) => 
    sum + (parseFloat(product.purchasePrice) * (product.quantity || 0)), 0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Warehouse className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">تقارير المخزون</h1>
          <p className="text-gray-600">تحليل شامل لحالة المخزون والمنتجات</p>
        </div>
      </div>

      {/* فلاتر التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <Input
                id="search"
                placeholder="اسم المنتج أو الرمز"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stock">حالة المخزون</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  <SelectItem value="available">متوفر</SelectItem>
                  <SelectItem value="low">مخزون منخفض</SelectItem>
                  <SelectItem value="out">نفد المخزون</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              منتج في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalInventoryValue.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              منتج بحاجة للتجديد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفد المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              منتج غير متوفر
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل المخزون */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تفاصيل المخزون</CardTitle>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
          <CardDescription>
            قائمة مفصلة بجميع المنتجات وحالة مخزونها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الرمز</TableHead>
                <TableHead className="text-right">اسم المنتج</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">التكلفة</TableHead>
                <TableHead className="text-right">سعر البيع</TableHead>
                <TableHead className="text-right">القيمة الإجمالية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.categoryId);
                const totalValue = parseFloat(product.cost) * product.quantity;
                const stockStatus = product.quantity === 0 ? 'نفد' : 
                  product.quantity <= 10 ? 'منخفض' : 'متوفر';
                const statusColor = product.quantity === 0 ? 'text-red-600' :
                  product.quantity <= 10 ? 'text-yellow-600' : 'text-green-600';
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{category?.name || 'غير محدد'}</TableCell>
                    <TableCell className="font-bold">{product.quantity}</TableCell>
                    <TableCell>{parseFloat(product.cost).toFixed(2)} ر.س</TableCell>
                    <TableCell>{parseFloat(product.price).toFixed(2)} ر.س</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {totalValue.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${statusColor}`}>
                        {stockStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد منتجات تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}