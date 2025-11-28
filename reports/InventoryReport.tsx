import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertTriangle, TrendingUp, BarChart3, Download, Search } from "lucide-react";

export default function InventoryReport() {
  const [searchTerm, setSearchTerm] = useState("");

  const inventoryData = {
    totalItems: 245,
    totalValue: 485750,
    lowStockItems: 18,
    outOfStockItems: 5,
    items: [
      {
        id: 1,
        name: "لابتوب HP EliteBook",
        code: "HPE-2025-001",
        category: "إلكترونيات",
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        unitCost: 2500,
        totalValue: 37500,
        status: "normal",
        lastMovement: "2025-06-28"
      },
      {
        id: 2,
        name: "طابعة كانون",
        code: "CAN-2025-002",
        category: "إلكترونيات",
        currentStock: 3,
        minStock: 10,
        maxStock: 30,
        unitCost: 850,
        totalValue: 2550,
        status: "low",
        lastMovement: "2025-06-27"
      },
      {
        id: 3,
        name: "ماوس لوجيتك",
        code: "LOG-2025-003",
        category: "اكسسوارات",
        currentStock: 0,
        minStock: 20,
        maxStock: 100,
        unitCost: 120,
        totalValue: 0,
        status: "out_of_stock",
        lastMovement: "2025-06-25"
      },
      {
        id: 4,
        name: "كيبورد ميكانيكي",
        code: "MEC-2025-004",
        category: "اكسسوارات",
        currentStock: 45,
        minStock: 15,
        maxStock: 60,
        unitCost: 350,
        totalValue: 15750,
        status: "high",
        lastMovement: "2025-06-26"
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
        <title>تقرير المخزون</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .normal { color: #10b981; }
          .low { color: #f59e0b; }
          .out_of_stock { color: #ef4444; }
          .high { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المخزون</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${inventoryData.totalItems}</div>
            <p>إجمالي الأصناف</p>
          </div>
          <div class="summary-card">
            <div class="value">${inventoryData.totalValue.toLocaleString('en-US')} ريال</div>
            <p>قيمة المخزون</p>
          </div>
          <div class="summary-card">
            <div class="value">${inventoryData.lowStockItems}</div>
            <p>مخزون منخفض</p>
          </div>
          <div class="summary-card">
            <div class="value">${inventoryData.outOfStockItems}</div>
            <p>نفد المخزون</p>
          </div>
        </div>

        <h3>تفاصيل المخزون</h3>
        <table>
          <thead>
            <tr>
              <th>كود المنتج</th>
              <th>اسم المنتج</th>
              <th>الفئة</th>
              <th>الكمية الحالية</th>
              <th>الحد الأدنى</th>
              <th>التكلفة الوحدة</th>
              <th>القيمة الإجمالية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryData.items.map(item => `
              <tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.currentStock}</td>
                <td>${item.minStock}</td>
                <td>${item.unitCost.toLocaleString('en-US')} ريال</td>
                <td>${item.totalValue.toLocaleString('en-US')} ريال</td>
                <td class="${item.status}">
                  ${item.status === 'normal' ? 'طبيعي' : 
                    item.status === 'low' ? 'منخفض' : 
                    item.status === 'out_of_stock' ? 'نفد' : 'مرتفع'}
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

  const filteredItems = inventoryData.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقرير المخزون</h1>
          <p className="text-gray-600 mt-2">تقرير شامل لحالة وقيمة المخزون</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المخزون..."
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

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي الأصناف</p>
                <p className="text-2xl font-bold">{inventoryData.totalItems}</p>
                <p className="text-blue-100 text-sm">صنف في المخزن</p>
              </div>
              <Package className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">قيمة المخزون</p>
                <p className="text-2xl font-bold">{inventoryData.totalValue.toLocaleString('en-US')} ريال</p>
                <p className="text-green-100 text-sm">إجمالي القيمة</p>
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
                <p className="text-2xl font-bold">{inventoryData.lowStockItems}</p>
                <p className="text-orange-100 text-sm">يحتاج إعادة طلب</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">نفد المخزون</p>
                <p className="text-2xl font-bold">{inventoryData.outOfStockItems}</p>
                <p className="text-red-100 text-sm">غير متوفر</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل المخزون */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
          <TabsTrigger value="low">مخزون منخفض</TabsTrigger>
          <TabsTrigger value="out">نفد المخزون</TabsTrigger>
          <TabsTrigger value="normal">مخزون طبيعي</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="outline">{item.code}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الكمية الحالية</p>
                          <p className="font-bold text-lg">{item.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الحد الأدنى</p>
                          <p className="font-bold">{item.minStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">التكلفة</p>
                          <p className="font-bold">{item.unitCost.toLocaleString('en-US')} ريال</p>
                        </div>
                        <div>
                          <p className="text-gray-600">القيمة الإجمالية</p>
                          <p className="font-bold text-blue-600">{item.totalValue.toLocaleString('en-US')} ريال</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left ml-6">
                      <Badge 
                        variant={
                          item.status === 'normal' ? 'default' :
                          item.status === 'low' ? 'secondary' :
                          item.status === 'out_of_stock' ? 'destructive' : 'default'
                        }
                        className={
                          item.status === 'normal' ? 'bg-green-100 text-green-800' :
                          item.status === 'low' ? 'bg-orange-100 text-orange-800' :
                          item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {item.status === 'normal' ? 'طبيعي' :
                         item.status === 'low' ? 'منخفض' :
                         item.status === 'out_of_stock' ? 'نفد المخزون' : 'مرتفع'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">آخر حركة: {item.lastMovement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          <div className="space-y-4">
            {inventoryData.items
              .filter(item => item.status === 'low')
              .map((item) => (
              <Card key={item.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="outline">{item.code}</Badge>
                        <Badge className="bg-orange-100 text-orange-800">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          يحتاج إعادة طلب
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الكمية الحالية</p>
                          <p className="font-bold text-lg text-orange-600">{item.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الحد الأدنى</p>
                          <p className="font-bold">{item.minStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الكمية المطلوبة</p>
                          <p className="font-bold text-blue-600">{item.maxStock - item.currentStock}</p>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      إعادة طلب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="out" className="space-y-4">
          <div className="space-y-4">
            {inventoryData.items
              .filter(item => item.status === 'out_of_stock')
              .map((item) => (
              <Card key={item.id} className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="outline">{item.code}</Badge>
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          نفد المخزون
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الكمية الحالية</p>
                          <p className="font-bold text-lg text-red-600">{item.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الكمية المطلوبة</p>
                          <p className="font-bold text-blue-600">{item.maxStock}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="destructive">
                      طلب عاجل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="normal" className="space-y-4">
          <div className="space-y-4">
            {inventoryData.items
              .filter(item => item.status === 'normal' || item.status === 'high')
              .map((item) => (
              <Card key={item.id} className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="outline">{item.code}</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {item.status === 'high' ? 'مخزون كافي' : 'طبيعي'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الكمية الحالية</p>
                          <p className="font-bold text-lg text-green-600">{item.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الحد الأدنى</p>
                          <p className="font-bold">{item.minStock}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">القيمة</p>
                          <p className="font-bold text-blue-600">{item.totalValue.toLocaleString('en-US')} ريال</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}