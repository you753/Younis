import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, Package, FileText, Download } from "lucide-react";

export default function SimpleDailyReports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // بيانات تجريبية للعرض
  const dailyStats = {
    totalSales: 15750.00,
    totalPurchases: 8500.00,
    netProfit: 7250.00,
    salesCount: 12,
    purchasesCount: 5,
    newClients: 3,
    topProducts: [
      { name: "لابتوب HP EliteBook", quantity: 3, revenue: 4500.00 },
      { name: "طابعة كانون", quantity: 5, revenue: 2750.00 },
      { name: "ماوس لوجيتك", quantity: 15, revenue: 1200.00 }
    ],
    recentTransactions: [
      { id: 1, type: "sale", client: "شركة النور التجارية", amount: 2500.00, time: "09:30" },
      { id: 2, type: "purchase", supplier: "مورد الحاسوب", amount: 1800.00, time: "11:15" },
      { id: 3, type: "sale", client: "متجر الإلكترونيات", amount: 1200.00, time: "14:20" },
      { id: 4, type: "sale", client: "شركة التقنية المتقدمة", amount: 3200.00, time: "16:45" }
    ]
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>التقرير اليومي - ${selectedDate}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .sale { color: #10b981; }
          .purchase { color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>التقرير اليومي</h1>
          <h2>تاريخ: ${selectedDate}</h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${dailyStats.totalSales.toLocaleString('en-US')} ريال</div>
            <div class="stat-label">إجمالي المبيعات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dailyStats.totalPurchases.toLocaleString('en-US')} ريال</div>
            <div class="stat-label">إجمالي المشتريات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dailyStats.netProfit.toLocaleString('en-US')} ريال</div>
            <div class="stat-label">صافي الربح</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">أهم المنتجات</div>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية المباعة</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              ${dailyStats.topProducts.map(product => 
                `<tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${product.revenue.toLocaleString('en-US')} ريال</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">المعاملات الحديثة</div>
          <table>
            <thead>
              <tr>
                <th>النوع</th>
                <th>العميل/المورد</th>
                <th>المبلغ</th>
                <th>الوقت</th>
              </tr>
            </thead>
            <tbody>
              ${dailyStats.recentTransactions.map(transaction => 
                `<tr>
                  <td class="${transaction.type}">
                    ${transaction.type === 'sale' ? 'مبيعات' : 'مشتريات'}
                  </td>
                  <td>${transaction.client || transaction.supplier || ''}</td>
                  <td>${transaction.amount.toLocaleString('en-US')} ريال</td>
                  <td>${transaction.time}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير اليومية</h1>
          <p className="text-gray-600 mt-2">تقرير شامل للأنشطة التجارية اليومية</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{dailyStats.totalSales.toLocaleString('en-US')} ريال</p>
                <p className="text-green-100 text-sm">{dailyStats.salesCount} عملية بيع</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">إجمالي المشتريات</p>
                <p className="text-2xl font-bold">{dailyStats.totalPurchases.toLocaleString('en-US')} ريال</p>
                <p className="text-orange-100 text-sm">{dailyStats.purchasesCount} عملية شراء</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">صافي الربح</p>
                <p className="text-2xl font-bold">{dailyStats.netProfit.toLocaleString('en-US')} ريال</p>
                <p className="text-blue-100 text-sm">ربح اليوم</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">عملاء جدد</p>
                <p className="text-2xl font-bold">{dailyStats.newClients}</p>
                <p className="text-purple-100 text-sm">عميل جديد</p>
              </div>
              <Users className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">أهم المنتجات</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="summary">ملخص المبيعات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                أهم المنتجات مبيعاً اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-600">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">الكمية: {product.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">{product.revenue.toLocaleString('en-US')} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المعاملات الحديثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={transaction.type === 'sale' ? 'default' : 'secondary'}
                        className={transaction.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {transaction.type === 'sale' ? 'مبيعات' : 'مشتريات'}
                      </Badge>
                      <div>
                        <p className="font-medium">{transaction.client || transaction.supplier}</p>
                        <p className="text-sm text-gray-600">الوقت: {transaction.time}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{transaction.amount.toLocaleString('en-US')} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص المبيعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>عدد الفواتير:</span>
                  <span className="font-bold">{dailyStats.salesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-bold text-green-600">{dailyStats.totalSales.toLocaleString('en-US')} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>متوسط الفاتورة:</span>
                  <span className="font-bold">{(dailyStats.totalSales / dailyStats.salesCount).toLocaleString('en-US')} ريال</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص المشتريات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>عدد الفواتير:</span>
                  <span className="font-bold">{dailyStats.purchasesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي المشتريات:</span>
                  <span className="font-bold text-orange-600">{dailyStats.totalPurchases.toLocaleString('en-US')} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>متوسط الفاتورة:</span>
                  <span className="font-bold">{(dailyStats.totalPurchases / dailyStats.purchasesCount).toLocaleString('en-US')} ريال</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء اليومي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {((dailyStats.netProfit / dailyStats.totalSales) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">هامش الربح</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {(dailyStats.totalSales / dailyStats.salesCount).toLocaleString('en-US')}
                  </div>
                  <p className="text-sm text-gray-600">متوسط قيمة المبيعة</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {dailyStats.salesCount + dailyStats.purchasesCount}
                  </div>
                  <p className="text-sm text-gray-600">إجمالي المعاملات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}