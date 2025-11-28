import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Search, Plus, Eye, FileText, Download, BarChart3, ArrowUpDown, MapPin } from 'lucide-react';

interface BranchWarehouseProps {
  branchId?: number;
}

export default function BranchWarehouse({ branchId }: BranchWarehouseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // بيانات تجريبية شاملة للمخازن
  const warehouses = [
    {
      id: 1,
      name: 'المخزن الرئيسي - مخزن A',
      code: 'WH-A-001',
      location: 'الدور الأول - القسم الشرقي',
      manager: 'أحمد محمد الخزين',
      phone: '0556789012',
      capacity: 1000,
      currentStock: 750,
      availableSpace: 250,
      utilizationRate: 75,
      temperature: 22,
      humidity: 45,
      sections: [
        { id: 1, name: 'رف A1', capacity: 200, current: 180, products: 45 },
        { id: 2, name: 'رف A2', capacity: 200, current: 150, products: 38 },
        { id: 3, name: 'رف A3', capacity: 200, current: 170, products: 42 },
        { id: 4, name: 'رف A4', capacity: 200, current: 120, products: 30 },
        { id: 5, name: 'رف A5', capacity: 200, current: 130, products: 35 }
      ],
      products: [
        { id: 1, name: 'لابتوب HP EliteBook', quantity: 15, location: 'رف A1-001', lastUpdate: '2025-07-17' },
        { id: 2, name: 'طابعة Canon PIXMA', quantity: 8, location: 'رف A2-015', lastUpdate: '2025-07-16' },
        { id: 3, name: 'ماوس لاسلكي Logitech', quantity: 25, location: 'رف A3-008', lastUpdate: '2025-07-15' }
      ],
      movements: [
        { type: 'in', quantity: 20, product: 'لابتوب HP', date: '2025-07-17', reference: 'PO-001' },
        { type: 'out', quantity: 5, product: 'طابعة Canon', date: '2025-07-17', reference: 'SO-015' },
        { type: 'in', quantity: 15, product: 'ماوس Logitech', date: '2025-07-16', reference: 'PO-002' }
      ],
      status: 'active',
      lastInventory: '2025-07-10',
      nextInventory: '2025-08-10'
    },
    {
      id: 2,
      name: 'مخزن التبريد - مخزن B',
      code: 'WH-B-002',
      location: 'الدور الأرضي - القسم الغربي',
      manager: 'فاطمة أحمد المبرد',
      phone: '0567890123',
      capacity: 500,
      currentStock: 380,
      availableSpace: 120,
      utilizationRate: 76,
      temperature: 18,
      humidity: 40,
      sections: [
        { id: 6, name: 'رف B1', capacity: 100, current: 80, products: 20 },
        { id: 7, name: 'رف B2', capacity: 100, current: 85, products: 22 },
        { id: 8, name: 'رف B3', capacity: 100, current: 75, products: 18 },
        { id: 9, name: 'رف B4', capacity: 100, current: 70, products: 16 },
        { id: 10, name: 'رف B5', capacity: 100, current: 70, products: 15 }
      ],
      products: [
        { id: 4, name: 'هارد ديسك Western Digital', quantity: 3, location: 'رف B1-005', lastUpdate: '2025-07-15' },
        { id: 5, name: 'شاشة Samsung Curved', quantity: 0, location: 'رف B2-010', lastUpdate: '2025-07-12' }
      ],
      movements: [
        { type: 'out', quantity: 2, product: 'هارد ديسك WD', date: '2025-07-15', reference: 'SO-012' },
        { type: 'out', quantity: 1, product: 'شاشة Samsung', date: '2025-07-12', reference: 'SO-008' }
      ],
      status: 'active',
      lastInventory: '2025-07-08',
      nextInventory: '2025-08-08'
    },
    {
      id: 3,
      name: 'المخزن المؤقت - مخزن C',
      code: 'WH-C-003',
      location: 'الدور الثاني - منطقة الاستقبال',
      manager: 'محمد سالم المؤقت',
      phone: '0578901234',
      capacity: 300,
      currentStock: 150,
      availableSpace: 150,
      utilizationRate: 50,
      temperature: 25,
      humidity: 50,
      sections: [
        { id: 11, name: 'منطقة الاستقبال', capacity: 100, current: 50, products: 12 },
        { id: 12, name: 'منطقة الفحص', capacity: 100, current: 60, products: 15 },
        { id: 13, name: 'منطقة التجهيز', capacity: 100, current: 40, products: 10 }
      ],
      products: [
        { id: 6, name: 'كيبورد لاسلكي', quantity: 30, location: 'استقبال-001', lastUpdate: '2025-07-17' },
        { id: 7, name: 'سماعات بلوتوث', quantity: 20, location: 'فحص-005', lastUpdate: '2025-07-16' }
      ],
      movements: [
        { type: 'in', quantity: 30, product: 'كيبورد لاسلكي', date: '2025-07-17', reference: 'RCV-001' },
        { type: 'transfer', quantity: 10, product: 'سماعات بلوتوث', date: '2025-07-16', reference: 'TR-001' }
      ],
      status: 'active',
      lastInventory: '2025-07-12',
      nextInventory: '2025-08-12'
    }
  ];

  // إحصائيات عامة
  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
  const totalCurrentStock = warehouses.reduce((sum, wh) => sum + wh.currentStock, 0);
  const totalAvailableSpace = warehouses.reduce((sum, wh) => sum + wh.availableSpace, 0);
  const averageUtilization = warehouses.reduce((sum, wh) => sum + wh.utilizationRate, 0) / warehouses.length;

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 90) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertTriangle className="h-3 w-3 ml-1" />
          مكتظ {rate}%
        </Badge>
      );
    } else if (rate >= 75) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <TrendingUp className="h-3 w-3 ml-1" />
          عالي {rate}%
        </Badge>
      );
    } else if (rate >= 50) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <BarChart3 className="h-3 w-3 ml-1" />
          متوسط {rate}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 ml-1" />
          منخفض {rate}%
        </Badge>
      );
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementText = (type: string) => {
    switch (type) {
      case 'in': return 'وارد';
      case 'out': return 'صادر';
      case 'transfer': return 'نقل';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-full">
          <Warehouse className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخازن</h1>
          <p className="text-gray-600">نظام إدارة المخازن والمساحات - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">السعة الإجمالية</p>
                <p className="text-2xl font-bold text-emerald-600">{totalCapacity.toLocaleString('en-US')}</p>
                <p className="text-xs text-emerald-600">متر مكعب</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Warehouse className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المساحة المستخدمة</p>
                <p className="text-2xl font-bold text-blue-600">{totalCurrentStock.toLocaleString('en-US')}</p>
                <p className="text-xs text-blue-600">متر مكعب مشغول</p>
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
                <p className="text-sm text-gray-600">المساحة المتاحة</p>
                <p className="text-2xl font-bold text-green-600">{totalAvailableSpace.toLocaleString('en-US')}</p>
                <p className="text-xs text-green-600">متر مكعب فارغ</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل الاستغلال</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(averageUtilization)}`}>
                  {averageUtilization.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">متوسط عام</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط التبويب */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Warehouse className="h-4 w-4 inline ml-2" />
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline ml-2" />
            الأصناف في المخازن
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowUpDown className="h-4 w-4 inline ml-2" />
            حركة المخزون
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{warehouse.name}</CardTitle>
                    <p className="text-sm text-emerald-600">{warehouse.code}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">نشط</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{warehouse.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{warehouse.capacity}</p>
                      <p className="text-xs text-gray-500">السعة الكلية</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{warehouse.currentStock}</p>
                      <p className="text-xs text-gray-500">المخزون الحالي</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">معدل الاستغلال:</span>
                      <div>{getUtilizationBadge(warehouse.utilizationRate)}</div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          warehouse.utilizationRate >= 90 ? 'bg-red-500' :
                          warehouse.utilizationRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${warehouse.utilizationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">درجة الحرارة:</span>
                      <p className="font-medium">{warehouse.temperature}°م</p>
                    </div>
                    <div>
                      <span className="text-gray-500">الرطوبة:</span>
                      <p className="font-medium">{warehouse.humidity}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">المسؤول:</span>
                      <span className="text-sm font-medium">{warehouse.manager}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">آخر جرد:</span>
                      <span className="text-sm text-blue-600">{warehouse.lastInventory}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 ml-1" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-3 w-3 ml-1" />
                      تقرير
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">الأصناف في المخازن</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الأصناف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right p-4 font-semibold text-gray-700">الصنف</th>
                    <th className="text-right p-4 font-semibold text-gray-700">المخزن</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الموقع</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الكمية</th>
                    <th className="text-right p-4 font-semibold text-gray-700">آخر تحديث</th>
                    <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.flatMap(warehouse => 
                    warehouse.products.map((product, index) => (
                      <tr key={`${warehouse.id}-${product.id}`} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-blue-600">كود: {product.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{warehouse.name}</div>
                          <div className="text-sm text-emerald-600">{warehouse.code}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{product.location}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`text-lg font-bold ${product.quantity === 0 ? 'text-red-600' : product.quantity <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {product.quantity}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">{product.lastUpdate}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="نقل المنتج">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'movements' && (
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-semibold">حركة المخزون</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right p-4 font-semibold text-gray-700">نوع الحركة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الصنف</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الكمية</th>
                    <th className="text-right p-4 font-semibold text-gray-700">التاريخ</th>
                    <th className="text-right p-4 font-semibold text-gray-700">المرجع</th>
                    <th className="text-right p-4 font-semibold text-gray-700">المخزن</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.flatMap(warehouse => 
                    warehouse.movements.map((movement, index) => (
                      <tr key={`${warehouse.id}-${index}`} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            <span className="font-medium">{getMovementText(movement.type)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{movement.product}</div>
                        </td>
                        <td className="p-4">
                          <div className={`font-bold ${movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}`}>
                            {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">{movement.date}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-blue-600">{movement.reference}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">{warehouse.name}</div>
                          <div className="text-xs text-emerald-600">{warehouse.code}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}