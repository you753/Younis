import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, TrendingDown, DollarSign, FileText, Download, Calculator, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchFinancialReportProps {
  branchId?: number;
}

export default function BranchFinancialReport({ branchId }: BranchFinancialReportProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: sales = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/sales?branchId=${branchId}`] : ['/api/sales'],
  });

  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/purchases?branchId=${branchId}`] : ['/api/purchases'],
  });

  const { data: dailyExpenses = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/daily-expenses/branch/${branchId}`] : ['/api/daily-expenses'],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/clients?branchId=${branchId}`] : ['/api/clients'],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/suppliers?branchId=${branchId}`] : ['/api/suppliers'],
  });

  const filterByDateRange = (items: any[]) => {
    if (!dateFrom && !dateTo) return items;
    
    return items.filter((item: any) => {
      const itemDate = new Date(item.date || item.createdAt);
      
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        return itemDate >= from && itemDate <= to;
      } else if (dateFrom) {
        const from = new Date(dateFrom);
        return itemDate >= from;
      } else if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        return itemDate <= to;
      }
      
      return true;
    });
  };

  const filteredSales = useMemo(() => filterByDateRange(sales), [sales, dateFrom, dateTo]);
  const filteredPurchases = useMemo(() => filterByDateRange(purchases), [purchases, dateFrom, dateTo]);
  const filteredExpenses = useMemo(() => filterByDateRange(dailyExpenses), [dailyExpenses, dateFrom, dateTo]);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
  const totalCosts = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
  
  const grossProfit = totalRevenue - totalCosts;
  const netProfit = totalRevenue - totalCosts - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  const clientBalances = clients.reduce((sum: number, client: any) => sum + parseFloat(client.balance || '0'), 0);
  const supplierBalances = suppliers.reduce((sum: number, supplier: any) => sum + parseFloat(supplier.balance || '0'), 0);
  
  const netCashFlow = totalRevenue - totalCosts - totalExpenses;

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

    const reportContent = `
      <html dir="rtl">
        <head>
          <title>التقرير المالي - الفرع ${branchId}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .date-range { background: #f5f5f5; padding: 10px; margin-bottom: 20px; text-align: center; border: 1px solid #000; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #000; padding: 15px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; }
            .stat-label { font-size: 14px; margin-top: 5px; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .financial-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .financial-item:last-child { border-bottom: none; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
            .highlight { background: #f5f5f5; font-weight: bold; padding: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>التقرير المالي</h1>
              <p>الفرع رقم ${branchId}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalRevenue.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الإيرادات</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalCosts.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي المشتريات</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalExpenses.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">المصروفات اليومية</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${netProfit.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">صافي الربح</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">قائمة الدخل التفصيلية</div>
            <div class="financial-item">
              <span>إجمالي الإيرادات (${filteredSales.length} فاتورة)</span>
              <span>${totalRevenue.toLocaleString('en-US')} ريال</span>
            </div>
            <div class="financial-item">
              <span>إجمالي المشتريات (${filteredPurchases.length} فاتورة)</span>
              <span>(${totalCosts.toLocaleString('en-US')}) ريال</span>
            </div>
            <div class="financial-item">
              <span>الربح الإجمالي (قبل المصروفات)</span>
              <span>${grossProfit.toLocaleString('en-US')} ريال</span>
            </div>
            <div class="financial-item">
              <span>المصروفات اليومية (${filteredExpenses.length} مصروف)</span>
              <span>(${totalExpenses.toLocaleString('en-US')}) ريال</span>
            </div>
            <div class="financial-item">
              <span>نسبة المصروفات من الإيرادات</span>
              <span>${expenseRatio.toFixed(1)}%</span>
            </div>
            <div class="financial-item highlight">
              <span><strong>صافي الربح (بعد المصروفات)</strong></span>
              <span><strong>${netProfit.toLocaleString('en-US')} ريال</strong></span>
            </div>
            <div class="financial-item">
              <span>هامش الربح الصافي</span>
              <span>${profitMargin.toFixed(1)}%</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">الميزانية العمومية</div>
            <div class="financial-item">
              <span>أرصدة العملاء (${clients.length} عميل)</span>
              <span>${clientBalances.toLocaleString('en-US')} ريال</span>
            </div>
            <div class="financial-item">
              <span>أرصدة الموردين (${suppliers.length} مورد)</span>
              <span>${supplierBalances.toLocaleString('en-US')} ريال</span>
            </div>
            <div class="financial-item highlight">
              <span><strong>صافي التدفق النقدي</strong></span>
              <span><strong>${netCashFlow.toLocaleString('en-US')} ريال</strong></span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">ملخص المصروفات اليومية</div>
            ${filteredExpenses.slice(0, 10).map((expense: any) => `
              <div class="financial-item">
                <span>${expense.description || 'مصروف'} - ${new Date(expense.date).toLocaleDateString('en-GB')}</span>
                <span>${parseFloat(expense.amount).toLocaleString('en-US')} ريال</span>
              </div>
            `).join('')}
            ${filteredExpenses.length > 10 ? `<div class="financial-item"><span>... و ${filteredExpenses.length - 10} مصروف آخر</span><span></span></div>` : ''}
          </div>
          
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
            <BarChart className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقرير المالي</h1>
            <p className="text-gray-600">تقرير مالي شامل - الفرع رقم: {branchId}</p>
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
        <Button onClick={printReport} className="bg-green-600 hover:bg-green-700" data-testid="button-print">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSales.length} فاتورة مبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalCosts.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPurchases.length} فاتورة شراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات اليومية</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalExpenses.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600 font-semibold">
                {expenseRatio.toFixed(1)}%
              </span>
              {' '}من الإيرادات ({filteredExpenses.length} مصروف)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={profitMargin >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {profitMargin.toFixed(1)}%
              </span>
              {' '}هامش الربح
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التدفق النقدي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netCashFlow.toLocaleString('en-US')} ريال
            </div>
            <p className="text-xs text-muted-foreground">صافي التدفق النقدي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تحديد الفترة الزمنية</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
          <TabsTrigger value="balance">الميزانية</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الدخل التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3">💰 الإيرادات</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>مبيعات الفرع:</span>
                        <span className="font-semibold text-green-600">
                          {totalRevenue.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>عدد الفواتير:</span>
                        <span className="font-semibold">{filteredSales.length}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">إجمالي الإيرادات:</span>
                        <span className="font-semibold text-green-600">
                          {totalRevenue.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-3">📉 التكاليف والمصروفات</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>تكاليف المشتريات:</span>
                        <span className="font-semibold text-red-600">
                          {totalCosts.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>عدد فواتير الشراء:</span>
                        <span className="font-semibold">{filteredPurchases.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المصروفات اليومية:</span>
                        <span className="font-semibold text-orange-600">
                          {totalExpenses.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>عدد المصروفات:</span>
                        <span className="font-semibold">{filteredExpenses.length}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">إجمالي التكاليف:</span>
                        <span className="font-semibold text-red-600">
                          {(totalCosts + totalExpenses).toLocaleString('en-US')} ريال
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">📊 النتيجة النهائية</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span>الربح الإجمالي (قبل المصروفات):</span>
                      <span className={`font-semibold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {grossProfit.toLocaleString('en-US')} ريال
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>المصروفات اليومية:</span>
                      <span className="font-semibold text-orange-600">
                        ({totalExpenses.toLocaleString('en-US')}) ريال
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>نسبة المصروفات من الإيرادات:</span>
                      <span className="font-semibold text-orange-600">
                        {expenseRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="border-t-2 border-blue-400 pt-3 mt-3">
                      <div className="flex justify-between text-xl">
                        <span className="font-bold text-blue-900">صافي الربح (بعد المصروفات):</span>
                        <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netProfit.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-blue-700">هامش الربح الصافي:</span>
                        <span className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المصروفات اليومية التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    لا توجد مصروفات في الفترة المحددة
                  </div>
                ) : (
                  <>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-orange-800">إجمالي المصروفات:</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {totalExpenses.toLocaleString('en-US')} ريال
                        </span>
                      </div>
                      <div className="text-sm text-orange-600 mt-2">
                        عدد المصروفات: {filteredExpenses.length}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3 text-right">التاريخ</th>
                            <th className="p-3 text-right">الوصف</th>
                            <th className="p-3 text-right">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.map((expense: any, index: number) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="p-3">
                                {new Date(expense.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-3">{expense.description || 'مصروف'}</td>
                              <td className="p-3 font-semibold text-orange-600">
                                {parseFloat(expense.amount).toLocaleString('en-US')} ريال
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الميزانية العمومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3">💵 الأصول</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>أرصدة العملاء:</span>
                      <span className="font-semibold text-blue-600">
                        {clientBalances.toLocaleString('en-US')} ريال
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>عدد العملاء:</span>
                      <span className="font-semibold">{clients.length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3">💳 الخصوم</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>أرصدة الموردين:</span>
                      <span className="font-semibold text-purple-600">
                        {supplierBalances.toLocaleString('en-US')} ريال
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>عدد الموردين:</span>
                      <span className="font-semibold">{suppliers.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-900">💰 صافي التدفق النقدي:</span>
                  <span className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netCashFlow.toLocaleString('en-US')} ريال
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التحليل المالي والمؤشرات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-4">📈 مؤشرات الربحية</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">هامش الربح الإجمالي:</span>
                        <span className="font-semibold text-blue-600">
                          {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${totalRevenue > 0 ? Math.min(((grossProfit / totalRevenue) * 100), 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">هامش الربح الصافي:</span>
                        <span className={`font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={profitMargin >= 0 ? 'bg-green-600 h-2 rounded-full' : 'bg-red-600 h-2 rounded-full'}
                          style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-4">📊 مؤشرات التكاليف</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">نسبة تكلفة المبيعات:</span>
                        <span className="font-semibold text-orange-600">
                          {totalRevenue > 0 ? ((totalCosts / totalRevenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${totalRevenue > 0 ? Math.min(((totalCosts / totalRevenue) * 100), 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">نسبة المصروفات اليومية:</span>
                        <span className="font-semibold text-orange-600">
                          {expenseRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full"
                          style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">💼 ملخص الأداء</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>متوسط قيمة الفاتورة:</span>
                      <span className="font-semibold">
                        {filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toLocaleString('en-US') : 0} ريال
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>متوسط قيمة المصروف:</span>
                      <span className="font-semibold">
                        {filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toLocaleString('en-US') : 0} ريال
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الربح لكل فاتورة مبيعات:</span>
                      <span className="font-semibold">
                        {filteredSales.length > 0 ? (netProfit / filteredSales.length).toLocaleString('en-US') : 0} ريال
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3">🎯 نقاط القوة والضعف</h3>
                  <div className="space-y-2 text-sm">
                    {profitMargin > 20 && (
                      <div className="text-green-700">✅ هامش ربح ممتاز ({profitMargin.toFixed(1)}%)</div>
                    )}
                    {profitMargin > 0 && profitMargin <= 20 && (
                      <div className="text-yellow-700">⚠️ هامش ربح معتدل ({profitMargin.toFixed(1)}%)</div>
                    )}
                    {profitMargin <= 0 && (
                      <div className="text-red-700">❌ خسارة ({profitMargin.toFixed(1)}%)</div>
                    )}
                    {expenseRatio > 30 && (
                      <div className="text-orange-700">⚠️ نسبة مصروفات مرتفعة ({expenseRatio.toFixed(1)}%)</div>
                    )}
                    {expenseRatio <= 30 && expenseRatio > 0 && (
                      <div className="text-green-700">✅ نسبة مصروفات معقولة ({expenseRatio.toFixed(1)}%)</div>
                    )}
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
