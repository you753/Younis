import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Warehouse, Package, TrendingUp, BarChart3, Download, Search, MapPin } from "lucide-react";

export default function StorageReport() {
  const [searchTerm, setSearchTerm] = useState("");

  const storageData = {
    totalCapacity: 1000,
    usedCapacity: 750,
    availableCapacity: 250,
    utilizationRate: 75,
    warehouses: [
      {
        id: 1,
        name: "المستودع الرئيسي",
        location: "الرياض",
        capacity: 500,
        used: 420,
        available: 80,
        items: [
          { name: "إلكترونيات", quantity: 150, value: 285000 },
          { name: "مكتبية", quantity: 200, value: 120500 },
          { name: "اكسسوارات", quantity: 70, value: 80250 }
        ]
      },
      {
        id: 2,
        name: "مستودع الفرع الشمالي",
        location: "الدمام",
        capacity: 300,
        used: 220,
        available: 80,
        items: [
          { name: "إلكترونيات", quantity: 80, value: 145000 },
          { name: "مكتبية", quantity: 100, value: 75000 },
          { name: "اكسسوارات", quantity: 40, value: 35000 }
        ]
      },
      {
        id: 3,
        name: "مستودع الفرع الغربي",
        location: "جدة",
        capacity: 200,
        used: 110,
        available: 90,
        items: [
          { name: "إلكترونيات", quantity: 45, value: 95000 },
          { name: "مكتبية", quantity: 40, value: 48000 },
          { name: "اكسسوارات", quantity: 25, value: 28000 }
        ]
      }
    ],
    movements: [
      {
        id: 1,
        type: "in",
        item: "لابتوب HP EliteBook",
        quantity: 25,
        warehouse: "المستودع الرئيسي",
        date: "2025-06-28",
        reference: "PUR-2025-045"
      },
      {
        id: 2,
        type: "out",
        item: "طابعة كانون",
        quantity: 15,
        warehouse: "المستودع الرئيسي",
        date: "2025-06-27",
        reference: "SAL-2025-032"
      },
      {
        id: 3,
        type: "transfer",
        item: "ماوس لوجيتك",
        quantity: 30,
        from: "المستودع الرئيسي",
        to: "مستودع الفرع الشمالي",
        date: "2025-06-26",
        reference: "TRF-2025-012"
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
        <title>تقرير المخازن</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .in { color: #10b981; }
          .out { color: #ef4444; }
          .transfer { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المخازن</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${storageData.totalCapacity}</div>
            <p>السعة الإجمالية</p>
          </div>
          <div class="summary-card">
            <div class="value">${storageData.usedCapacity}</div>
            <p>السعة المستخدمة</p>
          </div>
          <div class="summary-card">
            <div class="value">${storageData.availableCapacity}</div>
            <p>السعة المتاحة</p>
          </div>
          <div class="summary-card">
            <div class="value">${storageData.utilizationRate}%</div>
            <p>معدل الاستخدام</p>
          </div>
        </div>

        <h3>تفاصيل المخازن</h3>
        <table>
          <thead>
            <tr>
              <th>اسم المخزن</th>
              <th>الموقع</th>
              <th>السعة الكلية</th>
              <th>المستخدم</th>
              <th>المتاح</th>
              <th>معدل الاستخدام</th>
            </tr>
          </thead>
          <tbody>
            ${storageData.warehouses.map(warehouse => `
              <tr>
                <td>${warehouse.name}</td>
                <td>${warehouse.location}</td>
                <td>${warehouse.capacity}</td>
                <td>${warehouse.used}</td>
                <td>${warehouse.available}</td>
                <td>${((warehouse.used / warehouse.capacity) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>حركات المخزن الحديثة</h3>
        <table>
          <thead>
            <tr>
              <th>النوع</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>المخزن</th>
              <th>التاريخ</th>
              <th>المرجع</th>
            </tr>
          </thead>
          <tbody>
            ${storageData.movements.map(movement => `
              <tr>
                <td class="${movement.type}">
                  ${movement.type === 'in' ? 'وارد' : movement.type === 'out' ? 'صادر' : 'تحويل'}
                </td>
                <td>${movement.item}</td>
                <td>${movement.quantity}</td>
                <td>${movement.warehouse || (movement.from + ' → ' + movement.to)}</td>
                <td>${movement.date}</td>
                <td>${movement.reference}</td>
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
          <h1 className="text-3xl font-bold text-gray-900">تقرير المخازن</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة المخازن وحركات التخزين</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المخازن..."
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
                <p className="text-blue-100 text-sm font-medium">السعة الإجمالية</p>
                <p className="text-2xl font-bold">{storageData.totalCapacity}</p>
                <p className="text-blue-100 text-sm">وحدة تخزين</p>
              </div>
              <Warehouse className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">السعة المستخدمة</p>
                <p className="text-2xl font-bold">{storageData.usedCapacity}</p>
                <p className="text-green-100 text-sm">وحدة مستخدمة</p>
              </div>
              <Package className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">السعة المتاحة</p>
                <p className="text-2xl font-bold">{storageData.availableCapacity}</p>
                <p className="text-orange-100 text-sm">وحدة متاحة</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">معدل الاستخدام</p>
                <p className="text-2xl font-bold">{storageData.utilizationRate}%</p>
                <p className="text-purple-100 text-sm">من السعة الكلية</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل المخازن */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="warehouses">المخازن</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزن</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storageData.warehouses.map((warehouse) => (
              <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 ml-1" />
                      {warehouse.location}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">السعة الكلية</p>
                      <p className="font-bold text-lg">{warehouse.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المستخدم</p>
                      <p className="font-bold text-green-600">{warehouse.used}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المتاح</p>
                      <p className="font-bold text-orange-600">{warehouse.available}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">معدل الاستخدام</p>
                      <p className="font-bold text-blue-600">{((warehouse.used / warehouse.capacity) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">المحتويات:</p>
                    {warehouse.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.name}</span>
                        <div className="text-left">
                          <p className="text-sm font-bold">{item.quantity} قطعة</p>
                          <p className="text-xs text-gray-600">{item.value.toLocaleString('en-US')} ريال</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${(warehouse.used / warehouse.capacity) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حركات المخزن الحديثة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageData.movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={movement.type === 'in' ? 'default' : movement.type === 'out' ? 'destructive' : 'secondary'}
                        className={
                          movement.type === 'in' ? 'bg-green-100 text-green-800' :
                          movement.type === 'out' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {movement.type === 'in' ? 'وارد' : movement.type === 'out' ? 'صادر' : 'تحويل'}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{movement.item}</h3>
                        <p className="text-sm text-gray-600">
                          {movement.type === 'transfer' ? 
                            `${movement.from} → ${movement.to}` : 
                            movement.warehouse
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{movement.quantity} قطعة</p>
                      <p className="text-sm text-gray-600">{movement.date}</p>
                      <Badge variant="outline" className="mt-1">{movement.reference}</Badge>
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
                <CardTitle>تحليل الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>معدل الاستخدام الإجمالي:</span>
                  <span className="font-bold text-blue-600">{storageData.utilizationRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>أعلى استخدام:</span>
                  <span className="font-bold text-green-600">
                    {Math.max(...storageData.warehouses.map(w => (w.used / w.capacity) * 100)).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>أقل استخدام:</span>
                  <span className="font-bold text-orange-600">
                    {Math.min(...storageData.warehouses.map(w => (w.used / w.capacity) * 100)).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>عدد المخازن:</span>
                  <span className="font-bold">{storageData.warehouses.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحركة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {storageData.movements.filter(m => m.type === 'in').length}
                  </div>
                  <p className="text-sm text-gray-600">حركات وارد</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {storageData.movements.filter(m => m.type === 'out').length}
                  </div>
                  <p className="text-sm text-gray-600">حركات صادر</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {storageData.movements.filter(m => m.type === 'transfer').length}
                  </div>
                  <p className="text-sm text-gray-600">حركات تحويل</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}