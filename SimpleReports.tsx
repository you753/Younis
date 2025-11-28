import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function SimpleReports() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير</h1>
        <p className="text-gray-600">اختر التقرير المطلوب من القائمة أدناه</p>
      </div>

      {/* التقارير المتاحة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">التقارير المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/stock-valuation'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50"
            >
              <Package className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">مؤشر الصحة التفاعلي</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/purchases'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50"
            >
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">تقارير المشتريات</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/clients'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50"
            >
              <Users className="h-6 w-6 text-indigo-600" />
              <span className="text-sm font-medium">تقارير العملاء</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/inventory'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-teal-50"
            >
              <Package className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">تقارير المخزون</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/storage'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-cyan-50"
            >
              <Package className="h-6 w-6 text-cyan-600" />
              <span className="text-sm font-medium">تقارير المخازن</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/financial'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-emerald-50"
            >
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-medium">التقارير المالية</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/employees'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-pink-50"
            >
              <Users className="h-6 w-6 text-pink-600" />
              <span className="text-sm font-medium">تقارير الموظفين</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/sales'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50"
            >
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">تقارير المبيعات</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/reports/sales-enhanced'}
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50"
            >
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              <span className="text-sm font-medium">تقارير المبيعات المحسنة</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">التقارير المتاحة</p>
                <p className="text-2xl font-bold">9</p>
                <p className="text-blue-100 text-sm">تقرير مختلف</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">التقارير المالية</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-green-100 text-sm">تقرير مالي</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">تقارير المخزون</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-purple-100 text-sm">تقرير مخزون</p>
              </div>
              <Package className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">تقارير الموظفين</p>
                <p className="text-2xl font-bold">1</p>
                <p className="text-orange-100 text-sm">تقرير موظفين</p>
              </div>
              <Users className="h-8 w-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}