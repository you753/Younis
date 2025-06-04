import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Download, Calendar, TrendingDown } from 'lucide-react';
import type { Purchase, Supplier } from '@shared/schema';

export default function PurchasesReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases']
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || purchaseDate >= fromDate) && (!toDate || purchaseDate <= toDate);
    const supplierMatch = selectedSupplier === 'all' || purchase.supplierId?.toString() === selectedSupplier;
    
    return dateMatch && supplierMatch;
  });

  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
  const averagePurchase = filteredPurchases.length > 0 ? totalPurchases / filteredPurchases.length : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">تقارير المشتريات</h1>
          <p className="text-gray-600">تحليل مفصل لمشتريات الشركة والموردين</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="supplier">المورد</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalPurchases.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              من {filteredPurchases.length} عملية شراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الشراء</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averagePurchase.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عملية شراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد العمليات</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredPurchases.length}
            </div>
            <p className="text-xs text-muted-foreground">
              عملية شراء
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل المشتريات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تفاصيل المشتريات</CardTitle>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
          <CardDescription>
            قائمة مفصلة بجميع عمليات الشراء المفلترة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => {
                const supplier = suppliers.find(s => s.id === purchase.supplierId);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">#{purchase.id}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>{supplier?.name || 'مورد محذوف'}</TableCell>
                    <TableCell className="font-bold text-orange-600">
                      {parseFloat(purchase.total).toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        مكتملة
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredPurchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد مشتريات تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}