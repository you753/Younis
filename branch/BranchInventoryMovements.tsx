import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Calendar,
  FileText,
  TrendingUp,
  Package,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface BranchInventoryMovementsProps {
  branchId: number;
}

const BranchInventoryMovements = ({ branchId }: BranchInventoryMovementsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('الكل');
  const [selectedPeriod, setSelectedPeriod] = useState('هذا الشهر');

  // بيانات تجريبية لحركات المخزون
  const movements = [
    {
      id: 1,
      date: '2025-07-18',
      time: '14:30',
      productName: 'ثوب صيفي قطني',
      productCode: 'TH001',
      type: 'وارد',
      quantity: 20,
      unitPrice: 65.00,
      totalValue: 1300.00,
      reference: 'فاتورة شراء #001',
      referenceType: 'مشتريات',
      location: 'رف A1',
      previousStock: 25,
      newStock: 45,
      enteredBy: 'أحمد محمد',
      notes: 'شحنة جديدة من المورد'
    },
    {
      id: 2,
      date: '2025-07-18',
      time: '13:15',
      productName: 'عباءة مطرزة',
      productCode: 'AB002',
      type: 'صادر',
      quantity: 5,
      unitPrice: 150.00,
      totalValue: 750.00,
      reference: 'فاتورة بيع #005',
      referenceType: 'مبيعات',
      location: 'رف B2',
      previousStock: 10,
      newStock: 5,
      enteredBy: 'فاطمة أحمد',
      notes: 'بيع للعميل الكريم'
    },
    {
      id: 3,
      date: '2025-07-18',
      time: '11:45',
      productName: 'قميص قطني',
      productCode: 'QM004',
      type: 'تسوية',
      quantity: 3,
      unitPrice: 45.00,
      totalValue: 135.00,
      reference: 'سند تسوية #003',
      referenceType: 'تسوية جرد',
      location: 'رف D1',
      previousStock: 22,
      newStock: 25,
      enteredBy: 'محمد علي',
      notes: 'تسوية جرد دوري'
    },
    {
      id: 4,
      date: '2025-07-17',
      time: '16:20',
      productName: 'حذاء جلدي',
      productCode: 'SH003',
      type: 'صادر',
      quantity: 2,
      unitPrice: 120.00,
      totalValue: 240.00,
      reference: 'فاتورة بيع #004',
      referenceType: 'مبيعات',
      location: 'رف C3',
      previousStock: 7,
      newStock: 5,
      enteredBy: 'سارة محمود',
      notes: 'بيع نقدي'
    },
    {
      id: 5,
      date: '2025-07-17',
      time: '10:30',
      productName: 'ثوب صيفي قطني',
      productCode: 'TH001',
      type: 'مرتجع',
      quantity: 2,
      unitPrice: 65.00,
      totalValue: 130.00,
      reference: 'مرتجع مبيعات #002',
      referenceType: 'مرتجعات',
      location: 'رف A1',
      previousStock: 23,
      newStock: 25,
      enteredBy: 'أحمد محمد',
      notes: 'مرتجع من العميل'
    }
  ];

  // إحصائيات الحركات
  const stats = {
    totalMovements: movements.length,
    incomingMovements: movements.filter(m => m.type === 'وارد' || m.type === 'مرتجع').length,
    outgoingMovements: movements.filter(m => m.type === 'صادر').length,
    adjustments: movements.filter(m => m.type === 'تسوية').length,
    totalInValue: movements.filter(m => m.type === 'وارد' || m.type === 'مرتجع').reduce((sum, m) => sum + m.totalValue, 0),
    totalOutValue: movements.filter(m => m.type === 'صادر').reduce((sum, m) => sum + m.totalValue, 0)
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'وارد':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'صادر':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'مرتجع':
        return <ArrowUp className="h-4 w-4 text-blue-600" />;
      case 'تسوية':
        return <Package className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'وارد': { className: 'bg-green-100 text-green-800 border-green-200', text: 'وارد' },
      'صادر': { className: 'bg-red-100 text-red-800 border-red-200', text: 'صادر' },
      'مرتجع': { className: 'bg-blue-100 text-blue-800 border-blue-200', text: 'مرتجع' },
      'تسوية': { className: 'bg-orange-100 text-orange-800 border-orange-200', text: 'تسوية' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['وارد'];
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const getReferenceTypeBadge = (refType: string) => {
    const refConfig = {
      'مشتريات': { className: 'bg-blue-100 text-blue-800', text: 'مشتريات' },
      'مبيعات': { className: 'bg-green-100 text-green-800', text: 'مبيعات' },
      'مرتجعات': { className: 'bg-purple-100 text-purple-800', text: 'مرتجعات' },
      'تسوية جرد': { className: 'bg-yellow-100 text-yellow-800', text: 'تسوية جرد' }
    };
    
    const config = refConfig[refType as keyof typeof refConfig] || refConfig['مشتريات'];
    return <Badge variant="secondary" className={config.className}>{config.text}</Badge>;
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'الكل' || movement.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">حركة المخزون</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>

        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الحركات</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalMovements}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">حركات واردة</p>
                <p className="text-2xl font-bold text-green-600">{stats.incomingMovements}</p>
                <p className="text-xs text-gray-500">{stats.totalInValue.toLocaleString('en-US')} ر.س</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">حركات صادرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.outgoingMovements}</p>
                <p className="text-xs text-gray-500">{stats.totalOutValue.toLocaleString('en-US')} ر.س</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">تسويات</p>
                <p className="text-2xl font-bold text-orange-600">{stats.adjustments}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="movements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movements">سجل الحركات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-6">
          {/* فلاتر البحث والتصفية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                البحث والفلترة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="البحث في الحركات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع الحركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الكل">كل الأنواع</SelectItem>
                      <SelectItem value="وارد">وارد</SelectItem>
                      <SelectItem value="صادر">صادر</SelectItem>
                      <SelectItem value="مرتجع">مرتجع</SelectItem>
                      <SelectItem value="تسوية">تسوية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="الفترة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="اليوم">اليوم</SelectItem>
                      <SelectItem value="هذا الأسبوع">هذا الأسبوع</SelectItem>
                      <SelectItem value="هذا الشهر">هذا الشهر</SelectItem>
                      <SelectItem value="آخر 3 أشهر">آخر 3 أشهر</SelectItem>
                      <SelectItem value="السنة الحالية">السنة الحالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button variant="outline" className="w-full gap-2">
                    <Filter className="h-4 w-4" />
                    فلاتر متقدمة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* جدول حركات المخزون */}
          <Card>
            <CardHeader>
              <CardTitle>سجل حركات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium text-gray-700">التاريخ والوقت</th>
                      <th className="text-right p-3 font-medium text-gray-700">المنتج</th>
                      <th className="text-right p-3 font-medium text-gray-700">نوع الحركة</th>
                      <th className="text-right p-3 font-medium text-gray-700">الكمية</th>
                      <th className="text-right p-3 font-medium text-gray-700">الرصيد السابق</th>
                      <th className="text-right p-3 font-medium text-gray-700">الرصيد الجديد</th>
                      <th className="text-right p-3 font-medium text-gray-700">القيمة</th>
                      <th className="text-right p-3 font-medium text-gray-700">المرجع</th>
                      <th className="text-right p-3 font-medium text-gray-700">المستخدم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{movement.date}</p>
                            <p className="text-sm text-gray-500">{movement.time}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{movement.productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{movement.productCode}</Badge>
                              <span className="text-xs text-gray-500">{movement.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(movement.type)}
                            {getTypeBadge(movement.type)}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold ${
                            movement.type === 'وارد' || movement.type === 'مرتجع' ? 'text-green-600' : 
                            movement.type === 'صادر' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {movement.type === 'وارد' || movement.type === 'مرتجع' ? '+' : movement.type === 'صادر' ? '-' : '±'}{movement.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{movement.previousStock}</td>
                        <td className="p-3 font-bold text-blue-600">{movement.newStock}</td>
                        <td className="p-3 font-medium">{movement.totalValue.toLocaleString('en-US')} ر.س</td>
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium">{movement.reference}</p>
                            {getReferenceTypeBadge(movement.referenceType)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium">{movement.enteredBy}</p>
                            {movement.notes && (
                              <p className="text-xs text-gray-500 mt-1">{movement.notes}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                تحليل حركات المخزون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* أكثر المنتجات حركة */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">أكثر المنتجات حركة</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'ثوب صيفي قطني', movements: 3, value: 1430 },
                      { name: 'عباءة مطرزة', movements: 1, value: 750 },
                      { name: 'حذاء جلدي', movements: 1, value: 240 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.movements} حركة</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{item.value.toLocaleString('en-US')} ر.س</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* توزيع الحركات بالنوع */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">توزيع الحركات حسب النوع</h3>
                  <div className="space-y-4">
                    {[
                      { type: 'وارد', count: stats.incomingMovements, color: 'bg-green-600' },
                      { type: 'صادر', count: stats.outgoingMovements, color: 'bg-red-600' },
                      { type: 'تسوية', count: stats.adjustments, color: 'bg-orange-600' }
                    ].map((item) => {
                      const percentage = (item.count / stats.totalMovements * 100).toFixed(1);
                      return (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.type}</span>
                            <div className="text-right">
                              <span className="font-bold">{item.count}</span>
                              <span className="text-sm text-gray-500 mr-2">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`${item.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default BranchInventoryMovements;