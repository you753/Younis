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

  const { data: goodsReceipt = [] } = useQuery<any[]>({
    queryKey: ['/api/goods-receipt-vouchers']
  });

  const { data: purchaseReturns = [] } = useQuery<any[]>({
    queryKey: ['/api/purchase-returns']
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  // فلترة المشتريات
  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || purchaseDate >= fromDate) && (!toDate || purchaseDate <= toDate);
    const supplierMatch = selectedSupplier === 'all' || purchase.supplierId?.toString() === selectedSupplier;
    
    return dateMatch && supplierMatch;
  });

  // فلترة سندات الإدخال
  const filteredGoodsReceipt = goodsReceipt.filter((voucher: any) => {
    const voucherDate = new Date(voucher.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || voucherDate >= fromDate) && (!toDate || voucherDate <= toDate);
    const supplierMatch = selectedSupplier === 'all' || voucher.supplierId?.toString() === selectedSupplier;
    
    return dateMatch && supplierMatch;
  });

  // فلترة مرتجعات المشتريات
  const filteredReturns = purchaseReturns.filter((returnItem: any) => {
    const returnDate = new Date(returnItem.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || returnDate >= fromDate) && (!toDate || returnDate <= toDate);
    const supplierMatch = selectedSupplier === 'all' || returnItem.supplierId?.toString() === selectedSupplier;
    
    return dateMatch && supplierMatch;
  });

  // حساب الإجماليات
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
  const totalGoodsReceipt = filteredGoodsReceipt.reduce((sum: number, voucher: any) => sum + parseFloat(voucher.total || '0'), 0);
  const totalReturns = filteredReturns.reduce((sum: number, returnItem: any) => sum + parseFloat(returnItem.total || '0'), 0);

  const grandTotal = totalPurchases + totalGoodsReceipt - totalReturns;
  const totalTransactions = filteredPurchases.length + filteredGoodsReceipt.length + filteredReturns.length;
  const averageTransaction = totalTransactions > 0 ? grandTotal / totalTransactions : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فواتير المشتريات</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {totalPurchases.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPurchases.length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات إدخال</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {totalGoodsReceipt.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredGoodsReceipt.length} سند
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المرتجعات</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              -{totalReturns.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredReturns.length} مرتجع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجمالي النهائي</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {grandTotal.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions} معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط المعاملة</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {averageTransaction.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              لكل معاملة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل جميع معاملات المشتريات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تفاصيل جميع معاملات المشتريات</CardTitle>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
          <CardDescription>
            قائمة شاملة بجميع أنواع المعاملات: فواتير المشتريات، سندات الإدخال، والمرتجعات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم المعاملة</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* فواتير المشتريات */}
              {filteredPurchases.map((purchase) => {
                const supplier = suppliers.find(s => s.id === purchase.supplierId);
                return (
                  <TableRow key={`purchase-${purchase.id}`}>
                    <TableCell className="font-medium">#{purchase.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        فاتورة مشتريات
                      </span>
                    </TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{supplier?.name || 'مورد نقدي'}</TableCell>
                    <TableCell className="font-bold text-orange-600">
                      {parseFloat(purchase.total || '0').toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مكتملة
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* سندات إدخال البضاعة */}
              {filteredGoodsReceipt.map((voucher: any) => {
                const supplier = suppliers.find(s => s.id === voucher.supplierId);
                return (
                  <TableRow key={`receipt-${voucher.id}`}>
                    <TableCell className="font-medium">{voucher.voucherNumber || `#${voucher.id}`}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        سند إدخال
                      </span>
                    </TableCell>
                    <TableCell>{new Date(voucher.date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{supplier?.name || 'مورد نقدي'}</TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {parseFloat(voucher.total || '0').toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مكتملة
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* مرتجعات المشتريات */}
              {filteredReturns.map((returnItem: any) => {
                const supplier = suppliers.find(s => s.id === returnItem.supplierId);
                return (
                  <TableRow key={`return-${returnItem.id}`}>
                    <TableCell className="font-medium">#{returnItem.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        مرتجع مشتريات
                      </span>
                    </TableCell>
                    <TableCell>{new Date(returnItem.date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{supplier?.name || 'مورد نقدي'}</TableCell>
                    <TableCell className="font-bold text-red-600">
                      -{parseFloat(returnItem.total || '0').toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        مرتجع
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {totalTransactions === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد معاملات تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}