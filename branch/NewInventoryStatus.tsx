import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter, Download, RefreshCw, Trash2, BarChart3, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface NewInventoryStatusProps {
  branchId?: number;
}

interface Product {
  id: number;
  name: string;
  code: string;
  barcode: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  branchId: number | null;
}

export default function NewInventoryStatus({ branchId }: NewInventoryStatusProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/products?branchId=${branchId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('فشل في تحميل المنتجات');
      return response.json();
    },
    enabled: !!branchId
  });

  const getProductStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minQuantity) return 'low_stock';
    return 'in_stock';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const status = getProductStatus(product.quantity, product.minQuantity);
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.purchasePrice.toString())), 0);
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(c => c)))];

  const getStatusBadge = (quantity: number, minQuantity: number) => {
    const status = getProductStatus(quantity, minQuantity);
    
    if (status === 'out_of_stock') {
      return (
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          <AlertTriangle className="h-3 w-3 ml-1" />
          نفد المخزون
        </Badge>
      );
    }
    
    if (status === 'low_stock') {
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-600">
          <TrendingDown className="h-3 w-3 ml-1" />
          مخزون منخفض
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
        <TrendingUp className="h-3 w-3 ml-1" />
        متوفر
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <Package className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
              <p className="text-sm text-gray-500">الرجاء الانتظار</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* العنوان الرئيسي */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  حالة المخزون
                </h1>
                <p className="text-gray-600 mt-1">متابعة شاملة لجميع المنتجات والكميات - الفرع #{branchId}</p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-blue-100 font-medium">إجمالي المنتجات</p>
                  <p className="text-4xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-blue-100">صنف في المخزون</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <Package className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-emerald-100 font-medium">قيمة المخزون</p>
                  <p className="text-4xl font-bold">{totalValue.toLocaleString('en-US')}</p>
                  <p className="text-sm text-emerald-100">ريال سعودي</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-red-100 font-medium">نفد المخزون</p>
                  <p className="text-4xl font-bold">{outOfStock}</p>
                  <p className="text-sm text-red-100">صنف غير متوفر</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <AlertTriangle className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-amber-100 font-medium">مخزون منخفض</p>
                  <p className="text-4xl font-bold">{lowStock}</p>
                  <p className="text-sm text-amber-100">يحتاج إعادة طلب</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <TrendingDown className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والفلترة */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="ابحث عن منتج (الاسم، الكود، الباركود)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-11 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-search"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                data-testid="select-category"
              >
                <option value="all">كل الفئات</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category || 'بدون فئة'}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                data-testid="select-status"
              >
                <option value="all">كل الحالات</option>
                <option value="in_stock">متوفر</option>
                <option value="low_stock">مخزون منخفض</option>
                <option value="out_of_stock">نفد المخزون</option>
              </select>

              <Button
                variant="outline"
                className="h-11 px-6 border-gray-300 hover:bg-gray-50"
                data-testid="button-export"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول المنتجات */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">قائمة المنتجات</CardTitle>
              <Badge variant="outline" className="text-sm px-3 py-1">
                عرض {filteredProducts.length} من أصل {totalProducts} منتج
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-6">لم يتم العثور على منتجات تطابق معايير البحث</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-clear-filters"
                >
                  مسح جميع الفلاتر
                </Button>
              </div>
            ) : (
              <>
                {/* عرض الكروت للجوال */}
                <div className="block md:hidden p-4 space-y-4">
                  {filteredProducts.map((product) => {
                    const totalProductValue = product.quantity * parseFloat(product.purchasePrice.toString());
                    const isLowStock = product.quantity > 0 && product.quantity <= product.minQuantity;
                    const isOutOfStock = product.quantity === 0;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          {/* اسم المنتج والحالة */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">الكود: {product.code}</p>
                            </div>
                            <div>
                              {getStatusBadge(product.quantity, product.minQuantity)}
                            </div>
                          </div>

                          {/* الكمية */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">الكمية المتاحة</p>
                            <p className={`text-4xl font-bold ${
                              isOutOfStock ? 'text-red-600' : 
                              isLowStock ? 'text-amber-600' : 
                              'text-emerald-600'
                            }`}>
                              {product.quantity}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">الحد الأدنى: {product.minQuantity}</p>
                          </div>

                          {/* تفاصيل الأسعار */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">سعر الشراء</p>
                              <p className="text-sm font-bold text-gray-900">
                                {parseFloat(product.purchasePrice.toString()).toLocaleString('en-US')} ر.س
                              </p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">سعر البيع</p>
                              <p className="text-sm font-bold text-emerald-600">
                                {parseFloat(product.salePrice.toString()).toLocaleString('en-US')} ر.س
                              </p>
                            </div>
                          </div>

                          {/* القيمة الإجمالية */}
                          <div className="bg-blue-600 text-white rounded-lg p-3 text-center">
                            <p className="text-xs opacity-90 mb-1">القيمة الإجمالية</p>
                            <p className="text-xl font-bold">
                              {totalProductValue.toLocaleString('en-US')} ر.س
                            </p>
                          </div>

                          {/* الفئة والباركود */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <Badge variant="outline" className="text-xs">
                              {product.category || 'غير مصنف'}
                            </Badge>
                            <p className="text-xs text-gray-500">{product.barcode}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* عرض الجدول للكمبيوتر */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-200">
                        <th className="text-right p-4 font-bold text-gray-700">المنتج</th>
                        <th className="text-right p-4 font-bold text-gray-700">الكود</th>
                        <th className="text-right p-4 font-bold text-gray-700">الفئة</th>
                        <th className="text-right p-4 font-bold text-gray-700">الكمية</th>
                        <th className="text-right p-4 font-bold text-gray-700">الحد الأدنى</th>
                        <th className="text-right p-4 font-bold text-gray-700">سعر الشراء</th>
                        <th className="text-right p-4 font-bold text-gray-700">سعر البيع</th>
                        <th className="text-right p-4 font-bold text-gray-700">القيمة الإجمالية</th>
                        <th className="text-right p-4 font-bold text-gray-700">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => {
                        const totalProductValue = product.quantity * parseFloat(product.purchasePrice.toString());
                        const isLowStock = product.quantity > 0 && product.quantity <= product.minQuantity;
                        const isOutOfStock = product.quantity === 0;
                        
                        return (
                          <tr
                            key={product.id}
                            className={`border-b hover:bg-blue-50/50 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                            data-testid={`row-product-${product.id}`}
                          >
                            <td className="p-4">
                              <div className="font-bold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.barcode}</div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="font-mono text-blue-600 border-blue-300">
                                {product.code}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-700">{product.category || '-'}</span>
                            </td>
                            <td className="p-4">
                              <div className={`text-2xl font-bold ${
                                isOutOfStock ? 'text-red-600' : 
                                isLowStock ? 'text-amber-600' : 
                                'text-emerald-600'
                              }`}>
                                {product.quantity}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-gray-700">{product.minQuantity}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-gray-900">
                                {parseFloat(product.purchasePrice.toString()).toLocaleString('en-US')} ريال
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-emerald-600">
                                {parseFloat(product.salePrice.toString()).toLocaleString('en-US')} ريال
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-bold text-blue-600">
                                {totalProductValue.toLocaleString('en-US')} ريال
                              </div>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(product.quantity, product.minQuantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
