import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BranchLayout from '@/components/layout/BranchLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building
} from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchDashboardProps {
  params: { branchId: string };
}

export default function BranchDashboard({ params }: BranchDashboardProps) {
  const branchId = parseInt(params.branchId);

  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`]
  });

  // إحصائيات الفرع (ستحتاج إلى API منفصل للفروع)
  const { data: stats } = useQuery({
    queryKey: [`/api/branches/${branchId}/stats`],
    queryFn: () => ({
      totalProducts: 0,
      totalSales: '0.00',
      totalClients: 0,
      inventoryValue: '0.00',
      todaySales: '0.00',
      monthlyGrowth: 0
    })
  });

  return (
    <BranchLayout branchId={branchId} title="لوحة التحكم">
      <div className="space-y-6">
        {/* بطاقة ترحيب */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-200 p-3 rounded-full">
              <Building className="h-8 w-8 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">مرحباً بك في {branch?.name}</h2>
              <p className="text-green-600">نظام إدارة منفصل للفرع</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{branch?.code}</Badge>
                {branch?.address && (
                  <span className="text-sm text-green-600">{branch.address}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">المنتجات</p>
                  <p className="text-2xl font-bold text-blue-700">{stats?.totalProducts || 0}</p>
                  <p className="text-xs text-blue-500 mt-1">منتج في المخزون</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.totalSales || '0.00'} ر.س</p>
                  <p className="text-xs text-green-500 mt-1">جميع المبيعات</p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">العملاء</p>
                  <p className="text-2xl font-bold text-purple-700">{stats?.totalClients || 0}</p>
                  <p className="text-xs text-purple-500 mt-1">عميل نشط</p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-orange-700">{stats?.inventoryValue || '0.00'} ر.س</p>
                  <p className="text-xs text-orange-500 mt-1">القيمة الإجمالية</p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات إضافية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                أداء اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">مبيعات اليوم</span>
                  <span className="font-bold text-green-600">{stats?.todaySales || '0.00'} ر.س</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">نمو شهري</span>
                  <div className="flex items-center gap-1">
                    {(stats?.monthlyGrowth || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`font-bold ${(stats?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stats?.monthlyGrowth || 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                معلومات الفرع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">اسم الفرع</span>
                  <span className="font-medium">{branch?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">كود الفرع</span>
                  <Badge variant="outline">{branch?.code}</Badge>
                </div>
                {branch?.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">العنوان</span>
                    <span className="font-medium text-sm">{branch.address}</span>
                  </div>
                )}
                {branch?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف</span>
                    <span className="font-medium">{branch.phone}</span>
                  </div>
                )}
                {branch?.managerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدير</span>
                    <span className="font-medium">{branch.managerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة</span>
                  <Badge variant={branch?.isActive ? "default" : "secondary"}>
                    {branch?.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* روابط سريعة */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
                <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium">إضافة منتج</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
                <ShoppingCart className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium">فاتورة مبيعات</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium">إضافة عميل</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
                <Calendar className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="text-sm font-medium">التقارير</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BranchLayout>
  );
}