import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  ArrowRight, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  MapPin,
  Phone,
  User,
  Calendar,
  Share2
} from 'lucide-react';
import type { Branch } from '@shared/schema';

export default function BranchManagement(props: any) {
  const branchId = props.params?.branchId;
  const [location, setLocation] = useLocation();
  const { setCurrentPage } = useAppStore();

  useEffect(() => {
    setCurrentPage('إدارة الفروع');
  }, [setCurrentPage]);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches']
  });

  const selectedBranch = branchId ? branches.find(b => b.id === parseInt(branchId)) : null;

  // إذا تم تحديد فرع معين، اعرض لوحة تحكم الفرع
  if (branchId && selectedBranch) {
    return <BranchDashboard branch={selectedBranch} />;
  }

  // عرض قائمة الفروع
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفروع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الفروع</h2>
          <p className="text-gray-600">اختر فرعاً للدخول إلى نظام إدارته المنفصل</p>
        </div>
      </div>

      {/* الفرع الرئيسي */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-200 p-3 rounded-full">
                <Building className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">الفرع الرئيسي</h3>
                <p className="text-blue-600">إدارة النظام الأساسي والبيانات المركزية</p>
                <Badge variant="default" className="mt-2">رئيسي</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                دخول
              </Button>
              <Button 
                onClick={() => setLocation('/pos-share-link?branchId=0&branchName=الفرع الرئيسي')}
                variant="outline"
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <Share2 className="ml-2 h-4 w-4" />
                مشاركة نقاط البيع
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الفروع */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches
          .filter(branch => branch.isActive)
          .map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <Badge variant="outline">{branch.code}</Badge>
                    </div>
                  </div>
                  <Badge variant={branch.isActive ? "default" : "secondary"}>
                    {branch.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branch.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  
                  {branch.managerName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>المدير: {branch.managerName}</span>
                    </div>
                  )}

                  {branch.openingDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>افتتح في: {new Date(branch.openingDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={() => setLocation(`/branch-app/${branch.id}/`)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                      دخول إلى الفرع
                    </Button>
                    
                    <Button 
                      onClick={() => setLocation(`/pos-share-link?branchId=${branch.id}&branchName=${encodeURIComponent(branch.name)}`)}
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Share2 className="ml-2 h-4 w-4" />
                      مشاركة نقاط البيع - {branch.name}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فروع</h3>
            <p className="text-gray-500 mb-4">لم يتم إنشاء أي فروع بعد</p>
            <Button onClick={() => setLocation('/branches')}>
              إضافة فرع جديد
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// مكون لوحة تحكم الفرع المنفصل
function BranchDashboard({ branch }: { branch: Branch }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      {/* هيدر الفرع */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-200 p-3 rounded-full">
              <Building className="h-8 w-8 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900">{branch.name}</h1>
              <p className="text-green-600">نظام إدارة الفرع المنفصل</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{branch.code}</Badge>
                {branch.address && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <MapPin className="h-3 w-3" />
                    <span>{branch.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/branch-management')}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للفروع
          </Button>
        </div>
      </div>

      {/* إحصائيات الفرع */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">0</p>
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
                <p className="text-green-600 text-sm font-medium">المبيعات</p>
                <p className="text-2xl font-bold text-green-700">0 ر.س</p>
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
                <p className="text-2xl font-bold text-purple-700">0</p>
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
                <p className="text-orange-600 text-sm font-medium">التقارير</p>
                <p className="text-2xl font-bold text-orange-700">متاح</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أقسام إدارة الفرع */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* إدارة المنتجات */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">إدارة المنتجات</h3>
            <p className="text-gray-600 mb-4">مخزون الفرع والمنتجات الخاصة به</p>
            <Button 
              onClick={() => setLocation(`/branch/${branch.id}/products`)}
              className="w-full"
            >
              إدارة المنتجات
            </Button>
          </CardContent>
        </Card>

        {/* إدارة المبيعات */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">إدارة المبيعات</h3>
            <p className="text-gray-600 mb-4">مبيعات الفرع وفواتير البيع</p>
            <Button 
              onClick={() => setLocation(`/branch/${branch.id}/sales`)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              إدارة المبيعات
            </Button>
          </CardContent>
        </Card>

        {/* إدارة العملاء */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">إدارة العملاء</h3>
            <p className="text-gray-600 mb-4">عملاء الفرع وحساباتهم</p>
            <Button 
              onClick={() => setLocation(`/branch/${branch.id}/clients`)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              إدارة العملاء
            </Button>
          </CardContent>
        </Card>

        {/* إعدادات الفرع */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">إعدادات الفرع</h3>
            <p className="text-gray-600 mb-4">تخصيص إعدادات الفرع</p>
            <Button 
              onClick={() => setLocation(`/branch/${branch.id}/settings`)}
              variant="outline" 
              className="w-full"
            >
              الإعدادات
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}