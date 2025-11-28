import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingDown, Calendar, Download, Search } from "lucide-react";
import type { Supplier, Purchase } from '@shared/schema';

export default function SuppliersReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierCategory, setSupplierCategory] = useState('all');

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases']
  });

  const { data: supplierPaymentVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/supplier-payment-vouchers']
  });

  // فلترة الموردين بناءً على البحث والفئة
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchMatch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm);
    
    const categoryMatch = supplierCategory === 'all' || 
      supplier.category === supplierCategory;
    
    return searchMatch && categoryMatch;
  });

  // حساب بيانات كل مورد
  const suppliersWithStats = filteredSuppliers.map(supplier => {
    // حساب إجمالي المشتريات من المورد
    const supplierPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      const dateMatch = (!fromDate || purchaseDate >= fromDate) && (!toDate || purchaseDate <= toDate);
      return purchase.supplierId === supplier.id && dateMatch;
    });

    const totalPurchases = supplierPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
    const totalInvoices = supplierPurchases.length;

    // حساب سندات الدفع للمورد
    const supplierPayments = supplierPaymentVouchers.filter(payment => {
      const paymentDate = new Date(payment.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      const dateMatch = (!fromDate || paymentDate >= fromDate) && (!toDate || paymentDate <= toDate);
      return payment.supplierId === supplier.id && dateMatch;
    });

    const totalPayments = supplierPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || '0'), 0);
    const paymentCount = supplierPayments.length;

    // حساب الرصيد المتبقي للمورد
    const openingBalance = parseFloat(supplier.openingBalance || '0');
    const currentBalance = parseFloat(supplier.currentBalance || '0');
    const totalBalance = openingBalance + currentBalance;
    const remainingBalance = totalBalance + totalPurchases - totalPayments;

    return {
      ...supplier,
      totalPurchases,
      totalInvoices,
      totalPayments,
      paymentCount,
      remainingBalance,
      totalBalance
    };
  });

  // حساب الإحصائيات العامة
  const totalSuppliers = filteredSuppliers.length;
  const activeSuppliers = suppliersWithStats.filter(supplier => supplier.remainingBalance > 0).length;
  const totalOutstandingDebt = suppliersWithStats.reduce((sum, supplier) => sum + Math.max(0, supplier.remainingBalance), 0);
  const totalPaymentAmount = suppliersWithStats.reduce((sum, supplier) => sum + supplier.totalPayments, 0);
  const totalPurchaseAmount = suppliersWithStats.reduce((sum, supplier) => sum + supplier.totalPurchases, 0);

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الموردين الشامل</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .neutral { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الموردين الشامل</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${totalSuppliers}</div>
            <p>إجمالي الموردين</p>
          </div>
          <div class="summary-card">
            <div class="value">${activeSuppliers}</div>
            <p>موردين لهم أرصدة</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalPurchaseAmount.toFixed(2)} ر.س</div>
            <p>إجمالي المشتريات</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalPaymentAmount.toFixed(2)} ر.س</div>
            <p>إجمالي المدفوعات</p>
          </div>
          <div class="summary-card">
            <div class="value">${totalOutstandingDebt.toFixed(2)} ر.س</div>
            <p>الأرصدة المستحقة</p>
          </div>
        </div>

        <h3>تفاصيل الموردين</h3>
        <table>
          <thead>
            <tr>
              <th>اسم المورد</th>
              <th>المشتريات</th>
              <th>سندات الدفع</th>
              <th>الرصيد المتبقي</th>
              <th>آخر فاتورة</th>
            </tr>
          </thead>
          <tbody>
            ${suppliersWithStats.map(supplier => {
              const lastPurchase = purchases.filter(p => p.supplierId === supplier.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              return `
                <tr>
                  <td>${supplier.name}</td>
                  <td>${supplier.totalPurchases.toFixed(2)} ر.س (${supplier.totalInvoices} فاتورة)</td>
                  <td>${supplier.totalPayments.toFixed(2)} ر.س (${supplier.paymentCount} سند)</td>
                  <td class="${supplier.remainingBalance > 0 ? 'positive' : supplier.remainingBalance < 0 ? 'negative' : 'neutral'}">
                    ${supplier.remainingBalance.toFixed(2)} ر.س
                  </td>
                  <td>${lastPurchase ? new Date(lastPurchase.date).toLocaleDateString('en-GB') : 'لا توجد'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">تقرير الموردين الشامل</h1>
          <p className="text-gray-600">تحليل مفصل لجميع الموردين والأرصدة وسندات الدفع</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="category">فئة المورد</Label>
              <Select value={supplierCategory} onValueChange={setSupplierCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
                  <SelectItem value="electronics">إلكترونيات</SelectItem>
                  <SelectItem value="office">مكتبية</SelectItem>
                  <SelectItem value="accessories">اكسسوارات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ابحث عن مورد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={exportReport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              مورد مسجل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موردين لهم أرصدة</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              مورد نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {totalPurchaseAmount.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              قيمة المشتريات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {totalPaymentAmount.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              سندات الدفع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأرصدة المستحقة</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {totalOutstandingDebt.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              مبلغ مستحق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الموردين */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الموردين والأرصدة</CardTitle>
          <CardDescription>
            قائمة شاملة بجميع الموردين مع الأرصدة وسندات الدفع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المورد</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">المشتريات</TableHead>
                <TableHead className="text-right">سندات الدفع</TableHead>
                <TableHead className="text-right">الرصيد المتبقي</TableHead>
                <TableHead className="text-right">آخر فاتورة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliersWithStats.map((supplier) => {
                const lastPurchase = purchases.filter(p => p.supplierId === supplier.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                return (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{supplier.name}</div>
                        {supplier.email && (
                          <div className="text-sm text-gray-500">{supplier.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.phone || 'غير محدد'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold text-purple-600">
                          {supplier.totalPurchases.toFixed(2)} ر.س
                        </div>
                        <div className="text-gray-500">
                          {supplier.totalInvoices} فاتورة
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold text-blue-600">
                          {supplier.totalPayments.toFixed(2)} ر.س
                        </div>
                        <div className="text-gray-500">
                          {supplier.paymentCount} سند دفع
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold text-lg ${
                        supplier.remainingBalance > 0 
                          ? 'text-red-600' 
                          : supplier.remainingBalance < 0 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                      }`}>
                        {supplier.remainingBalance.toFixed(2)} ر.س
                      </div>
                    </TableCell>
                    <TableCell>
                      {lastPurchase ? new Date(lastPurchase.date).toLocaleDateString('en-GB') : 'لا توجد'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.remainingBalance > 0
                          ? 'bg-red-100 text-red-800'
                          : supplier.remainingBalance < 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {supplier.remainingBalance > 0 
                          ? 'لنا رصيد' 
                          : supplier.remainingBalance < 0 
                            ? 'علينا رصيد' 
                            : 'متوازن'
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {suppliersWithStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد موردين تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}