import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, PieChart, Download, Calendar, FileText } from "lucide-react";
import type { Sale, Purchase, Employee, Salary } from '@shared/schema';

export default function FinancialReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // جلب البيانات الحقيقية
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

  // حساب البيانات المالية
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
  const totalSalaryExpenses = salaries.reduce((sum, salary) => sum + parseFloat(salary.netSalary), 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
  const totalOperatingExpenses = totalSalaryExpenses + totalDailyExpenses;
  const totalCosts = totalPurchases + totalOperatingExpenses;
  const grossProfit = totalRevenue - totalPurchases;
  const netIncome = totalRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const operatingMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalDailyExpenses / totalRevenue) * 100 : 0;

  const financialData = {
    revenue: totalRevenue,
    expenses: totalCosts,
    netIncome: netIncome,
    grossMargin: grossMargin,
    operatingMargin: operatingMargin,
    accounts: [
      { name: "المبيعات", amount: totalRevenue, type: "income", change: 12.5 },
      { name: "تكلفة البضاعة المباعة", amount: -totalPurchases, type: "expense", change: 8.3 },
      { name: "الرواتب والأجور", amount: -totalSalaryExpenses, type: "expense", change: 5.2 },
      { name: "المصروفات اليومية", amount: -totalDailyExpenses, type: "expense", change: 0 },
      { name: "إجمالي المصروفات التشغيلية", amount: -totalOperatingExpenses, type: "expense", change: -2.1 }
    ],
    profitLoss: {
      revenue: totalRevenue,
      costOfGoodsSold: totalPurchases,
      grossProfit: grossProfit,
      operatingExpenses: totalOperatingExpenses,
      operatingIncome: grossProfit - totalOperatingExpenses,
      otherIncome: 0,
      netIncome: netIncome
    }
  };

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>التقرير المالي</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>التقرير المالي</h1>
        </div>

        <h3>قائمة الدخل</h3>
        <table>
          <tr>
            <td>المبيعات</td>
            <td class="income">${financialData.profitLoss.revenue.toLocaleString('en-US')} ريال</td>
          </tr>
          <tr>
            <td>تكلفة البضاعة المباعة</td>
            <td class="expense">(${financialData.profitLoss.costOfGoodsSold.toLocaleString('en-US')}) ريال</td>
          </tr>
          <tr style="border-top: 2px solid #000;">
            <td><strong>مجمل الربح</strong></td>
            <td class="income"><strong>${financialData.profitLoss.grossProfit.toLocaleString('en-US')} ريال</strong></td>
          </tr>
          <tr>
            <td>المصروفات التشغيلية</td>
            <td class="expense">(${financialData.profitLoss.operatingExpenses.toLocaleString('en-US')}) ريال</td>
          </tr>
          <tr style="border-top: 2px solid #000;">
            <td><strong>الدخل التشغيلي</strong></td>
            <td class="income"><strong>${financialData.profitLoss.operatingIncome.toLocaleString('en-US')} ريال</strong></td>
          </tr>
          <tr>
            <td>إيرادات أخرى</td>
            <td class="income">${financialData.profitLoss.otherIncome.toLocaleString('en-US')} ريال</td>
          </tr>
          <tr style="border-top: 2px solid #000;">
            <td><strong>صافي الدخل</strong></td>
            <td class="income"><strong>${financialData.profitLoss.netIncome.toLocaleString('en-US')} ريال</strong></td>
          </tr>
        </table>

        <h3>تفاصيل الحسابات</h3>
        <table>
          <thead>
            <tr>
              <th>اسم الحساب</th>
              <th>المبلغ</th>
              <th>النوع</th>
              <th>التغيير %</th>
            </tr>
          </thead>
          <tbody>
            ${financialData.accounts.map(account => `
              <tr>
                <td>${account.name}</td>
                <td class="${account.type}">${Math.abs(account.amount).toLocaleString('en-US')} ريال</td>
                <td>${account.type === 'income' ? 'إيرادات' : 'مصروفات'}</td>
                <td>${account.change > 0 ? '+' : ''}${account.change}%</td>
              </tr>
            `).join('')}
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقرير المالي</h1>
          <p className="text-gray-600 mt-2">قائمة الدخل والمصروفات التفصيلية</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            className="w-40"
          />
          <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* الملخص المالي */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{financialData.revenue.toLocaleString('en-US')} ريال</p>
                <p className="text-green-100 text-sm">+12.5% من الشهر الماضي</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">إجمالي المصروفات</p>
                <p className="text-2xl font-bold">{financialData.expenses.toLocaleString('en-US')} ريال</p>
                <p className="text-red-100 text-sm">+8.3% من الشهر الماضي</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">صافي الدخل</p>
                <p className="text-2xl font-bold">{financialData.netIncome.toLocaleString('en-US')} ريال</p>
                <p className="text-blue-100 text-sm">هامش {financialData.operatingMargin}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">هامش مجمل الربح</p>
                <p className="text-2xl font-bold">{financialData.grossMargin}%</p>
                <p className="text-purple-100 text-sm">من إجمالي المبيعات</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="accounts">تفاصيل الحسابات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل المالي</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الدخل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-semibold">المبيعات</span>
                  <span className="font-bold text-green-600 text-lg">
                    {financialData.profitLoss.revenue.toLocaleString('en-US')} ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-b">
                  <span>تكلفة البضاعة المباعة</span>
                  <span className="font-bold text-red-600">
                    ({financialData.profitLoss.costOfGoodsSold.toLocaleString('en-US')}) ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-b-2 border-gray-400 bg-gray-50">
                  <span className="font-bold text-lg">مجمل الربح</span>
                  <span className="font-bold text-green-600 text-xl">
                    {financialData.profitLoss.grossProfit.toLocaleString('en-US')} ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-b">
                  <span>المصروفات التشغيلية</span>
                  <span className="font-bold text-red-600">
                    ({financialData.profitLoss.operatingExpenses.toLocaleString('en-US')}) ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-b-2 border-gray-400 bg-gray-50">
                  <span className="font-bold text-lg">الدخل التشغيلي</span>
                  <span className="font-bold text-blue-600 text-xl">
                    {financialData.profitLoss.operatingIncome.toLocaleString('en-US')} ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-b">
                  <span>إيرادات أخرى</span>
                  <span className="font-bold text-green-600">
                    {financialData.profitLoss.otherIncome.toLocaleString('en-US')} ريال
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 border-2 border-blue-400 bg-blue-50">
                  <span className="font-bold text-xl">صافي الدخل</span>
                  <span className="font-bold text-blue-600 text-2xl">
                    {financialData.profitLoss.netIncome.toLocaleString('en-US')} ريال
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الحسابات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.accounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={account.type === 'income' ? 'default' : 'destructive'}
                        className={account.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {account.type === 'income' ? 'إيرادات' : 'مصروفات'}
                      </Badge>
                      <span className="font-medium">{account.name}</span>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-lg ${account.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(account.amount).toLocaleString('en-US')} ريال
                      </p>
                      <Badge 
                        variant={account.change >= 0 ? 'default' : 'secondary'}
                        className={account.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {account.change >= 0 ? '+' : ''}{account.change}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>نسب الربحية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>هامش مجمل الربح:</span>
                  <span className="font-bold text-green-600">{financialData.grossMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span>هامش التشغيل:</span>
                  <span className="font-bold text-blue-600">{financialData.operatingMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span>هامش صافي الربح:</span>
                  <span className="font-bold text-purple-600">
                    {((financialData.netIncome / financialData.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة المصروفات:</span>
                  <span className="font-bold text-orange-600">
                    {((financialData.expenses / financialData.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {((financialData.profitLoss.grossProfit / financialData.profitLoss.revenue) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">كفاءة التكلفة</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {(financialData.revenue / 1000).toFixed(0)}K
                  </div>
                  <p className="text-sm text-gray-600">حجم المبيعات (بالآلاف)</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">12.5%</div>
                  <p className="text-sm text-gray-600">نمو الإيرادات</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}