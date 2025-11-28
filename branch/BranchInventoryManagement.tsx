import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Search, Plus, Eye, RefreshCw, Download, Calendar, CheckCircle2, Clock, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchInventoryManagementProps {
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

export default function BranchInventoryManagement({ branchId }: BranchInventoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // جلب المنتجات من API مع تصفية حسب الفرع
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/products?branchId=${branchId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('فشل في تحميل المنتجات');
      return response.json();
    },
    enabled: !!branchId
  });

  // تحويل المنتجات إلى تنسيق inventoryItems
  const inventoryItems = products.map(product => {
    const currentStock = product.quantity;
    const minStock = product.minQuantity;
    let status = 'in_stock';
    if (currentStock === 0) status = 'out_of_stock';
    else if (currentStock <= minStock) status = 'low_stock';
    
    return {
      id: product.id,
      name: product.name,
      code: product.code,
      category: product.category,
      currentStock: currentStock,
      minStock: minStock,
      maxStock: currentStock * 2, // قيمة افتراضية
      reorderLevel: minStock + 3,
      location: 'مخزن A',
      unitCost: parseFloat(product.purchasePrice.toString()),
      totalValue: currentStock * parseFloat(product.purchasePrice.toString()),
      supplier: 'المورد',
      lastRestocked: new Date().toISOString().split('T')[0],
      nextReorder: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      averageConsumption: 5,
      stockDays: Math.floor(currentStock / 5),
      status: status,
      movements: []
    };
  });

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جارٍ تحميل المنتجات...</p>
          </div>
        </div>
      </div>
    );
  }

  // بيانات تجريبية (محذوفة - تم استبدالها بـ API)
  const _oldInventoryItems_UNUSED = [
    {
      id: 1,
      name: 'لابتوب HP EliteBook 840 G7',
      code: 'HP-ELB-840',
      category: 'أجهزة كمبيوتر',
      currentStock: 15,
      minStock: 5,
      maxStock: 50,
      reorderLevel: 8,
      location: 'مخزن A - رف A1-001',
      unitCost: 4200,
      totalValue: 63000,
      supplier: 'شركة الأجهزة المتقدمة',
      lastRestocked: '2025-07-15',
      nextReorder: '2025-08-01',
      averageConsumption: 3,
      stockDays: 5,
      status: 'in_stock',
      movements: [
        { date: '2025-07-17', type: 'out', quantity: 2, reference: 'SO-001' },
        { date: '2025-07-15', type: 'in', quantity: 10, reference: 'PO-015' },
        { date: '2025-07-12', type: 'out', quantity: 1, reference: 'SO-008' }
      ]
    },
    {
      id: 2,
      name: 'طابعة Canon PIXMA MG3620',
      code: 'CAN-PIX-3620',
      category: 'طابعات',
      currentStock: 8,
      minStock: 3,
      maxStock: 25,
      reorderLevel: 5,
      location: 'مخزن A - رف A2-015',
      unitCost: 1050,
      totalValue: 8400,
      supplier: 'شركة مستلزمات المكاتب',
      lastRestocked: '2025-07-10',
      nextReorder: '2025-07-25',
      averageConsumption: 2,
      stockDays: 4,
      status: 'in_stock',
      movements: [
        { date: '2025-07-16', type: 'out', quantity: 2, reference: 'SO-012' },
        { date: '2025-07-10', type: 'in', quantity: 5, reference: 'PO-010' }
      ]
    },
    {
      id: 3,
      name: 'ماوس لاسلكي Logitech MX Master 3',
      code: 'LOG-MX-MST3',
      category: 'اكسسوارات',
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      reorderLevel: 15,
      location: 'مخزن A - رف A3-008',
      unitCost: 320,
      totalValue: 8000,
      supplier: 'موزع اكسسوارات الكمبيوتر',
      lastRestocked: '2025-07-12',
      nextReorder: '2025-08-15',
      averageConsumption: 5,
      stockDays: 5,
      status: 'in_stock',
      movements: [
        { date: '2025-07-17', type: 'in', quantity: 15, reference: 'PO-020' },
        { date: '2025-07-14', type: 'out', quantity: 10, reference: 'SO-018' },
        { date: '2025-07-12', type: 'out', quantity: 5, reference: 'SO-015' }
      ]
    },
    {
      id: 4,
      name: 'هارد ديسك خارجي Western Digital 2TB',
      code: 'WD-EXT-2TB',
      category: 'التخزين',
      currentStock: 3,
      minStock: 5,
      maxStock: 30,
      reorderLevel: 8,
      location: 'مخزن B - رف B1-005',
      unitCost: 420,
      totalValue: 1260,
      supplier: 'شركة الأجهزة المتقدمة',
      lastRestocked: '2025-07-05',
      nextReorder: '2025-07-20',
      averageConsumption: 4,
      stockDays: 1,
      status: 'low_stock',
      movements: [
        { date: '2025-07-15', type: 'out', quantity: 2, reference: 'SO-020' },
        { date: '2025-07-12', type: 'out', quantity: 3, reference: 'SO-016' },
        { date: '2025-07-05', type: 'in', quantity: 8, reference: 'PO-008' }
      ]
    },
    {
      id: 5,
      name: 'شاشة Samsung Curved 27 بوصة',
      code: 'SAM-CRV-27',
      category: 'شاشات',
      currentStock: 0,
      minStock: 2,
      maxStock: 20,
      reorderLevel: 5,
      location: 'مخزن B - رف B2-010',
      unitCost: 1580,
      totalValue: 0,
      supplier: 'مستورد الشاشات المتقدم',
      lastRestocked: '2025-06-28',
      nextReorder: '2025-07-18',
      averageConsumption: 3,
      stockDays: 0,
      status: 'out_of_stock',
      movements: [
        { date: '2025-07-10', type: 'out', quantity: 1, reference: 'SO-022' },
        { date: '2025-07-08', type: 'out', quantity: 1, reference: 'SO-019' },
        { date: '2025-06-28', type: 'in', quantity: 5, reference: 'PO-005' }
      ]
    },
    {
      id: 6,
      name: 'كيبورد لاسلكي Microsoft Wireless',
      code: 'MS-KB-WLS',
      category: 'اكسسوارات',
      currentStock: 2,
      minStock: 8,
      maxStock: 50,
      reorderLevel: 12,
      location: 'مخزن C - استقبال-001',
      unitCost: 180,
      totalValue: 360,
      supplier: 'موزع اكسسوارات الكمبيوتر',
      lastRestocked: '2025-07-08',
      nextReorder: '2025-07-19',
      averageConsumption: 6,
      stockDays: 0,
      status: 'critical',
      movements: [
        { date: '2025-07-16', type: 'out', quantity: 8, reference: 'SO-025' },
        { date: '2025-07-14', type: 'out', quantity: 5, reference: 'SO-023' },
        { date: '2025-07-08', type: 'in', quantity: 15, reference: 'PO-012' }
      ]
    }
  ];

  const getStatusBadge = (status: string, currentStock: number, minStock: number) => {
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 ml-1" />
            نفد المخزون
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertTriangle className="h-3 w-3 ml-1" />
            حرج جداً
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <TrendingDown className="h-3 w-3 ml-1" />
            مخزون منخفض
          </Badge>
        );
      case 'in_stock':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 ml-1" />
            متوفر
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStockColor = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return 'text-red-600';
    if (currentStock <= minStock / 2) return 'text-orange-600';
    if (currentStock <= minStock) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length;
  const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock' || item.status === 'critical').length;

  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-600">تتبع المخزون والتحكم في مستويات المخزون - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                <p className="text-xs text-blue-600">صنف في المخزون</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيمة المخزون</p>
                <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString('en-US')}</p>
                <p className="text-xs text-green-600">ريال سعودي</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نفد المخزون</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
                <p className="text-xs text-red-600">صنف غير متوفر</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مخزون منخفض</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
                <p className="text-xs text-yellow-600">يحتاج إعادة طلب</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المخزون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'كل الفئات' : category}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الحالات</option>
            <option value="in_stock">متوفر</option>
            <option value="low_stock">مخزون منخفض</option>
            <option value="critical">حرج</option>
            <option value="out_of_stock">نفد المخزون</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            طلب إعادة تموين
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">تفاصيل المخزون</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredItems.length} من أصل {inventoryItems.length} صنف
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">الصنف</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المخزون الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحد الأدنى</th>
                  <th className="text-right p-4 font-semibold text-gray-700">القيمة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الموقع</th>
                  <th className="text-right p-4 font-semibold text-gray-700">أيام التغطية</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-blue-600">{item.code}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </td>
                    <td className="p-4">
                      <div className={`text-lg font-bold ${getStockColor(item.currentStock, item.minStock)}`}>
                        {item.currentStock}
                      </div>
                      <div className="text-xs text-gray-500">
                        من أصل {item.maxStock}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{item.minStock}</div>
                      <div className="text-xs text-orange-600">
                        إعادة طلب: {item.reorderLevel}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-green-600">
                        {item.totalValue.toLocaleString('en-US')} ريال
                      </div>
                      <div className="text-xs text-gray-500">
                        سعر الوحدة: {item.unitCost.toLocaleString('en-US')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{item.location}</div>
                    </td>
                    <td className="p-4">
                      <div className={`text-sm font-medium ${item.stockDays <= 1 ? 'text-red-600' : item.stockDays <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.stockDays} أيام
                      </div>
                      <div className="text-xs text-gray-500">
                        متوسط: {item.averageConsumption}/يوم
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.status, item.currentStock, item.minStock)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="طلب إعادة تموين">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تقرير الحركة">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أصناف تطابق معايير البحث</p>
          <Button onClick={() => {setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all');}}>
            مسح جميع الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}