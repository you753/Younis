import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package, Clock, CheckCircle, Search, Plus, Eye, FileText, Download, Truck, AlertCircle, Calendar, Star } from 'lucide-react';

interface BranchClientOrdersProps {
  branchId?: number;
}

export default function BranchClientOrders({ branchId }: BranchClientOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // بيانات تجريبية شاملة لطلبات العملاء
  const clientOrders = [
    {
      id: 1,
      orderNumber: 'SO-2025-001',
      client: {
        id: 1,
        name: 'شركة النور التجارية المحدودة',
        code: 'CLI001'
      },
      totalAmount: 28500,
      items: [
        { name: 'لابتوب HP EliteBook', quantity: 5, unitPrice: 4500 },
        { name: 'ماوس لاسلكي Logitech', quantity: 10, unitPrice: 350 }
      ],
      orderDate: '2025-07-15',
      deliveryDate: '2025-07-25',
      status: 'confirmed',
      priority: 'high',
      notes: 'طلبية عاجلة للموسم الدراسي',
      createdBy: 'أحمد محمد',
      assignedTo: 'فريق المبيعات',
      paymentTerms: '30 يوم',
      shippingAddress: 'حي النهضة، شارع الملك عبد العزيز، الرياض',
      contactPerson: 'محمد النور',
      phone: '0556789012'
    },
    {
      id: 2,
      orderNumber: 'SO-2025-002',
      client: {
        id: 2,
        name: 'مؤسسة البركة للتجارة العامة',
        code: 'CLI002'
      },
      totalAmount: 15600,
      items: [
        { name: 'طابعة Canon MF635Cx', quantity: 3, unitPrice: 3200 },
        { name: 'خراطيش حبر ملونة', quantity: 12, unitPrice: 450 }
      ],
      orderDate: '2025-07-14',
      deliveryDate: '2025-07-20',
      status: 'in_progress',
      priority: 'medium',
      notes: 'طلبية للفرع الجديد',
      createdBy: 'فاطمة أحمد',
      assignedTo: 'مندوب المبيعات',
      paymentTerms: '15 يوم',
      shippingAddress: 'حي الملز، طريق الدائري الشرقي، الرياض',
      contactPerson: 'عبد الله البركة',
      phone: '0567890123'
    },
    {
      id: 3,
      orderNumber: 'SO-2025-003',
      client: {
        id: 3,
        name: 'متجر الإلكترونيات الحديثة',
        code: 'CLI003'
      },
      totalAmount: 42000,
      items: [
        { name: 'أجهزة كمبيوتر مكتبي', quantity: 8, unitPrice: 4500 },
        { name: 'شاشات Samsung 24 بوصة', quantity: 8, unitPrice: 850 }
      ],
      orderDate: '2025-07-12',
      deliveryDate: '2025-07-18',
      status: 'shipped',
      priority: 'high',
      notes: 'تم الشحن - في طريقها للعميل',
      createdBy: 'محمد سالم',
      assignedTo: 'شركة الشحن',
      paymentTerms: 'فوري',
      shippingAddress: 'حي العليا، مجمع الحاسوب، الرياض',
      contactPerson: 'سارة الحديثة',
      phone: '0578901234'
    },
    {
      id: 4,
      orderNumber: 'SO-2025-004',
      client: {
        id: 4,
        name: 'شركة الأعمال المتكاملة',
        code: 'CLI004'
      },
      totalAmount: 65000,
      items: [
        { name: 'خادم Dell PowerEdge', quantity: 2, unitPrice: 28000 },
        { name: 'تبديل شبكة 24 منفذ', quantity: 3, unitPrice: 3000 }
      ],
      orderDate: '2025-07-10',
      deliveryDate: '2025-07-30',
      status: 'delivered',
      priority: 'high',
      notes: 'تم التسليم بنجاح مع التركيب',
      createdBy: 'عبد الله يوسف',
      assignedTo: 'فريق التركيب',
      paymentTerms: '45 يوم',
      shippingAddress: 'حي الوزارات، برج الأعمال، الرياض',
      contactPerson: 'خالد المتكامل',
      phone: '0589012345'
    },
    {
      id: 5,
      orderNumber: 'SO-2025-005',
      client: {
        id: 5,
        name: 'مكتبة العلم والمعرفة',
        code: 'CLI005'
      },
      totalAmount: 8500,
      items: [
        { name: 'أجهزة تابلت تعليمية', quantity: 5, unitPrice: 1500 },
        { name: 'اكسسوارات وحماية', quantity: 5, unitPrice: 200 }
      ],
      orderDate: '2025-07-08',
      deliveryDate: '2025-07-15',
      status: 'cancelled',
      priority: 'low',
      notes: 'ألغيت بناءً على طلب العميل',
      createdBy: 'سارة محمد',
      assignedTo: 'غير مطلوب',
      paymentTerms: '7 أيام',
      shippingAddress: 'حي الجامعة، شارع التعليم، الرياض',
      contactPerson: 'أمينة العلم',
      phone: '0590123456'
    }
  ];

  const filteredOrders = clientOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            مؤكد
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 ml-1" />
            قيد التنفيذ
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Truck className="h-3 w-3 ml-1" />
            تم الشحن
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Package className="h-3 w-3 ml-1" />
            تم التسليم
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 ml-1" />
            ملغاة
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">عاجل</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">متوسط</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">عادي</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">غير محدد</Badge>;
    }
  };

  const totalOrders = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const confirmedOrders = clientOrders.filter(o => o.status === 'confirmed').length;
  const deliveredOrders = clientOrders.filter(o => o.status === 'delivered').length;
  const averageOrderValue = totalOrders / clientOrders.length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <ShoppingBag className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات العملاء</h1>
          <p className="text-gray-600">إدارة طلبات البيع للعملاء - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-blue-600">{totalOrders.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-blue-600">{clientOrders.length} طلبية</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلبات مؤكدة</p>
                <p className="text-2xl font-bold text-green-600">{confirmedOrders}</p>
                <p className="text-xs text-green-600">جاهزة للتنفيذ</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلبات مُسلمة</p>
                <p className="text-2xl font-bold text-orange-600">{deliveredOrders}</p>
                <p className="text-xs text-orange-600">مكتملة التسليم</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الطلبية</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(averageOrderValue).toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-purple-600">المتوسط الحسابي</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
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
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الحالات</option>
            <option value="confirmed">مؤكد</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقرير الطلبات
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            طلبية جديدة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">طلبات العملاء</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredOrders.length} من أصل {clientOrders.length} طلبية
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">رقم الطلب</th>
                  <th className="text-right p-4 font-semibold text-gray-700">العميل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">قيمة الطلب</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الأصناف</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التواريخ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الأولوية</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-blue-600">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">بواسطة: {order.createdBy}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.client.name}</div>
                      <div className="text-sm text-blue-600">{order.client.code}</div>
                      <div className="text-xs text-gray-500">{order.contactPerson}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-green-600">
                        {order.totalAmount.toLocaleString('en-US')} ريال
                      </div>
                      <div className="text-xs text-gray-500">{order.paymentTerms}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} عنصر
                      </div>
                      <div className="text-xs text-gray-500" title={order.items.map(i => i.name).join(', ')}>
                        {order.items[0]?.name}
                        {order.items.length > 1 && ` +${order.items.length - 1}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <Calendar className="h-3 w-3 inline ml-1" />
                        طُلب: {order.orderDate}
                      </div>
                      <div className="text-xs text-gray-500">
                        تسليم: {order.deliveryDate}
                      </div>
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="طباعة الطلبية">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تحميل PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="p-4 text-gray-900">الإجمالي</td>
                  <td className="p-4"></td>
                  <td className="p-4 text-green-900 text-lg">
                    {filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على طلبات تطابق معايير البحث</p>
              <Button onClick={() => {setSearchTerm(''); setFilterStatus('all');}}>
                مسح جميع الفلاتر
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}