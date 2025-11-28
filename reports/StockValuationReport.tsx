import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Download, Search } from "lucide-react";

export default function StockValuationReport() {
  const [searchTerm, setSearchTerm] = useState("");

  const stockData = {
    totalValue: 485750,
    totalItems: 156,
    lowStockItems: 12,
    overStockItems: 8,
    categories: [
      {
        name: "إلكترونيات",
        value: 285000,
        items: 45,
        trend: "up",
        percentage: 58.7
      },
      {
        name: "مكتبية",
        value: 120500,
        items: 78,
        trend: "stable",
        percentage: 24.8
      },
      {
        name: "اكسسوارات",
        value: 80250,
        items: 33,
        trend: "down",
        percentage: 16.5
      }
    ],
    topProducts: [
      {
        name: "لابتوب HP EliteBook",
        quantity: 15,
        unitCost: 2500,
        totalValue: 37500,
        status: "normal"
      },
      {
        name: "طابعة كانون",
        quantity: 25,
        unitCost: 850,
        totalValue: 21250,
        status: "high"
      },
      {
        name: "ماوس لوجيتك",
        quantity: 5,
        unitCost: 120,
        totalValue: 600,
        status: "low"
      },
      {
        name: "كيبورد ميكانيكي",
        quantity: 30,
        unitCost: 350,
        totalValue: 10500,
        status: "normal"
      }
    ]
  };

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تقييم المخزون</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .high { color: #10b981; }
          .normal { color: #6b7280; }
          .low { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير تقييم المخزون</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${stockData.totalValue.toLocaleString('en-US')} ريال</div>
            <p>إجمالي قيمة المخزون</p>
          </div>
          <div class="summary-card">
            <div class="value">${stockData.totalItems}</div>
            <p>إجمالي الأصناف</p>
          </div>
          <div class="summary-card">
            <div class="value">${stockData.lowStockItems}</div>
            <p>أصناف منخفضة المخزون</p>
          </div>
        </div>

        <h3>تقييم المنتجات</h3>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>التكلفة الوحدة</th>
              <th>القيمة الإجمالية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${stockData.topProducts.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.unitCost.toLocaleString('en-US')} ريال</td>
                <td>${product.totalValue.toLocaleString('en-US')} ريال</td>
                <td class="${product.status}">
                  ${product.status === 'high' ? 'مرتفع' : product.status === 'low' ? 'منخفض' : 'طبيعي'}
                </td>
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
          <h1 className="text-3xl font-bold text-gray-900">تقرير تقييم المخزون</h1>
          <p className="text-gray-600 mt-2">تقييم شامل لقيمة وحالة المخزون</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* ملخص المخزون */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي قيمة المخزون</p>
                <p className="text-2xl font-bold">{stockData.totalValue.toLocaleString('en-US')} ريال</p>
              </div>
              <Package className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">إجمالي الأصناف</p>
                <p className="text-2xl font-bold">{stockData.totalItems}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">مخزون منخفض</p>
                <p className="text-2xl font-bold">{stockData.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">مخزون زائد</p>
                <p className="text-2xl font-bold">{stockData.overStockItems}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تقييم الفئات */}
      <Card>
        <CardHeader>
          <CardTitle>تقييم المخزون حسب الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stockData.categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {category.trend === "down" && <TrendingDown className="h-5 w-5 text-red-500" />}
                  {category.trend === "stable" && <div className="h-5 w-5 bg-gray-400 rounded-full" />}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>القيمة:</span>
                    <span className="font-bold text-blue-600">{category.value.toLocaleString('en-US')} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الأصناف:</span>
                    <span className="font-bold">{category.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>النسبة:</span>
                    <Badge variant="secondary">{category.percentage}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل المنتجات */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
          <TabsTrigger value="high">مخزون مرتفع</TabsTrigger>
          <TabsTrigger value="low">مخزون منخفض</TabsTrigger>
          <TabsTrigger value="normal">مخزون طبيعي</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.topProducts
                  .filter(product => 
                    searchTerm === "" || 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">الكمية: {product.quantity} | التكلفة: {product.unitCost.toLocaleString('en-US')} ريال</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{product.totalValue.toLocaleString('en-US')} ريال</p>
                      <Badge 
                        variant={product.status === 'high' ? 'default' : product.status === 'low' ? 'destructive' : 'secondary'}
                        className={
                          product.status === 'high' ? 'bg-green-100 text-green-800' :
                          product.status === 'low' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {product.status === 'high' ? 'مرتفع' : product.status === 'low' ? 'منخفض' : 'طبيعي'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>منتجات بمخزون مرتفع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.topProducts
                  .filter(product => product.status === 'high')
                  .map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">الكمية: {product.quantity} | التكلفة: {product.unitCost.toLocaleString('en-US')} ريال</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-green-600">{product.totalValue.toLocaleString('en-US')} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>منتجات بمخزون منخفض</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.topProducts
                  .filter(product => product.status === 'low')
                  .map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">الكمية: {product.quantity} | التكلفة: {product.unitCost.toLocaleString('en-US')} ريال</p>
                      <Badge variant="destructive" className="mt-2">
                        <AlertTriangle className="w-3 h-3 ml-1" />
                        يحتاج إعادة طلب
                      </Badge>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-red-600">{product.totalValue.toLocaleString('en-US')} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="normal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>منتجات بمخزون طبيعي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.topProducts
                  .filter(product => product.status === 'normal')
                  .map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">الكمية: {product.quantity} | التكلفة: {product.unitCost.toLocaleString('en-US')} ريال</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{product.totalValue.toLocaleString('en-US')} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}