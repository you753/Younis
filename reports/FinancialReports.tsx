import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Download, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import type { Sale, Purchase, Employee, Salary } from '@shared/schema';

export default function FinancialReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales']
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases']
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees']
  });

  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ['/api/salaries']
  });

  // جلب المصروفات اليومية
  const { data: dailyExpenses = [] } = useQuery({
    queryKey: ['/api/daily-expenses']
  });

  const filterByDate = (items: any[]) => {
    if (!dateFrom && !dateTo) return items;
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      return (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredPurchases = filterByDate(purchases);
  const filteredSalaries = filterByDate(salaries);
  const filteredExpenses = filterByDate(dailyExpenses);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
  const totalSalaryExpenses = filteredSalaries.reduce((sum, salary) => sum + parseFloat(salary.netSalary), 0);
  const totalDailyExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
  const totalCosts = totalPurchases + totalSalaryExpenses + totalDailyExpenses;
  const grossProfit = totalRevenue - totalPurchases;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalDailyExpenses / totalRevenue) * 100 : 0;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthSales = filteredSales.filter(sale => 
      new Date(sale.date).getMonth() + 1 === month
    ).reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    
    const monthPurchases = filteredPurchases.filter(purchase => 
      new Date(purchase.date).getMonth() + 1 === month
    ).reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
    
    return {
      month: `${month}`,
      monthName: new Date(2024, i, 1).toLocaleDateString('en-GB', { month: 'long' }),
      sales: monthSales,
      purchases: monthPurchases,
      profit: monthSales - monthPurchases
    };
  }).filter(data => data.sales > 0 || data.purchases > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">التقارير المالية</h1>
          <p className="text-gray-600">تحليل شامل للوضع المالي والربحية</p>
        </div>
      </div>

      {/* فلاتر التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            فترة التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* المؤشرات المالية الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              من {filteredSales.length} عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalCosts.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              مشتريات + رواتب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {netProfit >= 0 ? 'ربح' : 'خسارة'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات اليومية</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalDailyExpenses.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} مصروف ({expenseRatio.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
            <PieChart className={`h-4 w-4 ${profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              نسبة الربح للإيرادات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفصيل المصروفات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تفصيل المصروفات</CardTitle>
            <CardDescription>توزيع المصروفات حسب النوع</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">مصروفات المشتريات</span>
                <span className="font-bold text-orange-600">{totalPurchases.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">مصروفات الرواتب</span>
                <span className="font-bold text-blue-600">{totalSalaryExpenses.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">المصروفات اليومية</span>
                <span className="font-bold text-purple-600">{totalDailyExpenses.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-t-2">
                <span className="font-bold">إجمالي المصروفات</span>
                <span className="font-bold text-red-600">{totalCosts.toFixed(2)} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نسب التكاليف</CardTitle>
            <CardDescription>نسبة كل نوع من المصروفات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalCosts > 0 && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المشتريات</span>
                      <span>{((totalPurchases / totalCosts) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${(totalPurchases / totalCosts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الرواتب</span>
                      <span>{((totalSalaryExpenses / totalCosts) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(totalSalaryExpenses / totalCosts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المصروفات اليومية</span>
                      <span>{((totalDailyExpenses / totalCosts) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(totalDailyExpenses / totalCosts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التقرير الشهري */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>التقرير الشهري</CardTitle>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
          <CardDescription>
            مقارنة الأداء المالي على مدار الأشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الشهر</TableHead>
                <TableHead className="text-right">الإيرادات</TableHead>
                <TableHead className="text-right">المصروفات</TableHead>
                <TableHead className="text-right">الربح/الخسارة</TableHead>
                <TableHead className="text-right">هامش الربح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((data) => {
                const margin = data.sales > 0 ? (data.profit / data.sales) * 100 : 0;
                return (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.monthName}</TableCell>
                    <TableCell className="text-green-600 font-bold">
                      {data.sales.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className="text-red-600 font-bold">
                      {data.purchases.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.profit.toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className={`font-bold ${margin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {margin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {monthlyData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات مالية للفترة المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}