import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Package, MapPin, Truck, Clock, CheckCircle, AlertCircle, Search, Plus, Eye, FileText, User, Calendar } from 'lucide-react';

interface BranchStockTransferProps {
  branchId?: number;
}

export default function BranchStockTransfer({ branchId }: BranchStockTransferProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // بيانات تجريبية شاملة لعمليات نقل المخزون
  const stockTransfers = [
    {
      id: 1,
      transferNumber: 'ST-2025-001',
      fromLocation: 'مخزن A - رف A1',
      toLocation: 'مخزن B - رف B2',
      items: [
        { 
          id: 1,
          name: 'لابتوب HP EliteBook 840 G7',
          code: 'HP-ELB-840',
          quantity: 5,
          unitCost: 4200,
          totalValue: 21000
        },
        {
          id: 2,
          name: 'طابعة Canon PIXMA MG3620',
          code: 'CAN-PIX-3620',
          quantity: 3,
          unitCost: 1050,
          totalValue: 3150
        }
      ],
      totalItems: 2,
      totalQuantity: 8,
      totalValue: 24150,
      requestedBy: 'أحمد محمد المخزين',
      requestedDate: '2025-07-17',
      approvedBy: 'فاطمة أحمد المديرة',
      approvedDate: '2025-07-17',
      transferredBy: 'محمد سالم العامل',
      transferDate: '2025-07-17',
      receivedBy: 'سارة خالد المستقبلة',
      receivedDate: '2025-07-17',
      status: 'completed',
      priority: 'normal',
      reason: 'إعادة تنظيم المخزون وتوزيع الأحمال',
      notes: 'تم النقل بنجاح وفقاً للخطة المحددة',
      vehicleUsed: 'عربة النقل الداخلي - رقم 001',
      estimatedTime: '2 ساعة',
      actualTime: '1.5 ساعة'
    },
    {
      id: 2,
      transferNumber: 'ST-2025-002',
      fromLocation: 'مخزن B - رف B3',
      toLocation: 'مخزن A - رف A5',
      items: [
        {
          id: 3,
          name: 'ماوس لاسلكي Logitech MX Master 3',
          code: 'LOG-MX-MST3',
          quantity: 15,
          unitCost: 320,
          totalValue: 4800
        }
      ],
      totalItems: 1,
      totalQuantity: 15,
      totalValue: 4800,
      requestedBy: 'خالد يوسف المسؤول',
      requestedDate: '2025-07-16',
      approvedBy: 'فاطمة أحمد المديرة',
      approvedDate: '2025-07-16',
      transferredBy: 'عبد الله علي العامل',
      transferDate: '2025-07-16',
      receivedBy: 'أمينة محمد المستقبلة',
      receivedDate: '2025-07-16',
      status: 'completed',
      priority: 'high',
      reason: 'طلب عاجل من قسم المبيعات',
      notes: 'نقل سريع لتلبية طلبات العملاء',
      vehicleUsed: 'عربة النقل السريع - رقم 002',
      estimatedTime: '1 ساعة',
      actualTime: '45 دقيقة'
    },
    {
      id: 3,
      transferNumber: 'ST-2025-003',
      fromLocation: 'مخزن A - رف A2',
      toLocation: 'مخزن C - منطقة الفحص',
      items: [
        {
          id: 4,
          name: 'هارد ديسك خارجي Western Digital 2TB',
          code: 'WD-EXT-2TB',
          quantity: 8,
          unitCost: 420,
          totalValue: 3360
        },
        {
          id: 5,
          name: 'شاشة Samsung Curved 27 بوصة',
          code: 'SAM-CRV-27',
          quantity: 2,
          unitCost: 1580,
          totalValue: 3160
        }
      ],
      totalItems: 2,
      totalQuantity: 10,
      totalValue: 6520,
      requestedBy: 'سارة أحمد الفنية',
      requestedDate: '2025-07-15',
      approvedBy: 'فاطمة أحمد المديرة',
      approvedDate: '2025-07-15',
      transferredBy: 'محمد علي العامل',
      transferDate: '2025-07-16',
      receivedBy: null,
      receivedDate: null,
      status: 'in_transit',
      priority: 'normal',
      reason: 'فحص جودة ومراقبة التشغيل',
      notes: 'في طريقها إلى منطقة الفحص',
      vehicleUsed: 'عربة النقل العادي - رقم 003',
      estimatedTime: '3 ساعات',
      actualTime: null
    },
    {
      id: 4,
      transferNumber: 'ST-2025-004',
      fromLocation: 'مخزن C - منطقة الاستقبال',
      toLocation: 'مخزن A - رف A4',
      items: [
        {
          id: 6,
          name: 'كيبورد لاسلكي Microsoft Wireless',
          code: 'MS-KB-WLS',
          quantity: 20,
          unitCost: 180,
          totalValue: 3600
        }
      ],
      totalItems: 1,
      totalQuantity: 20,
      totalValue: 3600,
      requestedBy: 'عبد الله محمد المشرف',
      requestedDate: '2025-07-14',
      approvedBy: 'فاطمة أحمد المديرة',
      approvedDate: '2025-07-15',
      transferredBy: null,
      transferDate: null,
      receivedBy: null,
      receivedDate: null,
      status: 'approved',
      priority: 'low',
      reason: 'تخزين منتظم ضمن المخزون الرئيسي',
      notes: 'في انتظار تنفيذ عملية النقل',
      vehicleUsed: 'عربة النقل العادي - رقم 001',
      estimatedTime: '2 ساعة',
      actualTime: null
    },
    {
      id: 5,
      transferNumber: 'ST-2025-005',
      fromLocation: 'مخزن B - رف B1',
      toLocation: 'مخزن A - رف A3',
      items: [
        {
          id: 7,
          name: 'سماعات بلوتوث Sony WH-1000XM4',
          code: 'SONY-WH-1000',
          quantity: 12,
          unitCost: 950,
          totalValue: 11400
        }
      ],
      totalItems: 1,
      totalQuantity: 12,
      totalValue: 11400,
      requestedBy: 'نورا سالم المساعدة',
      requestedDate: '2025-07-13',
      approvedBy: null,
      approvedDate: null,
      transferredBy: null,
      transferDate: null,
      receivedBy: null,
      receivedDate: null,
      status: 'pending',
      priority: 'normal',
      reason: 'تحسين توزيع المنتجات الصوتية',
      notes: 'في انتظار الموافقة من الإدارة',
      vehicleUsed: null,
      estimatedTime: '1.5 ساعة',
      actualTime: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 ml-1" />
            في الانتظار
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            موافق عليه
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Truck className="h-3 w-3 ml-1" />
            قيد النقل
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            مكتمل
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 ml-1" />
            ملغي
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
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">عادي</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">منخفض</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">غير محدد</Badge>;
    }
  };

  const filteredTransfers = stockTransfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalTransfers = stockTransfers.length;
  const totalValue = stockTransfers.reduce((sum, transfer) => sum + transfer.totalValue, 0);
  const pendingTransfers = stockTransfers.filter(t => t.status === 'pending').length;
  const completedTransfers = stockTransfers.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <ArrowUpDown className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نقل المخزون</h1>
          <p className="text-gray-600">إدارة عمليات نقل المخزون بين المواقع - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي عمليات النقل</p>
                <p className="text-2xl font-bold text-indigo-600">{totalTransfers}</p>
                <p className="text-xs text-indigo-600">عملية نقل</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <ArrowUpDown className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString('en-US')}</p>
                <p className="text-xs text-green-600">ريال سعودي</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTransfers}</p>
                <p className="text-xs text-yellow-600">عملية معلقة</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مكتملة</p>
                <p className="text-2xl font-bold text-blue-600">{completedTransfers}</p>
                <p className="text-xs text-blue-600">عملية منجزة</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
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
              placeholder="البحث في عمليات النقل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="in_transit">قيد النقل</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقرير النقل
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            طلب نقل جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">عمليات نقل المخزون</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredTransfers.length} من أصل {stockTransfers.length} عملية
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">رقم النقل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المواقع</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الأصناف</th>
                  <th className="text-right p-4 font-semibold text-gray-700">القيمة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المسؤولون</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التواريخ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الأولوية</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((transfer, index) => (
                  <tr key={transfer.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-indigo-600">{transfer.transferNumber}</div>
                      <div className="text-xs text-gray-500">
                        {transfer.vehicleUsed ? (
                          <>
                            <Truck className="h-3 w-3 inline ml-1" />
                            {transfer.vehicleUsed}
                          </>
                        ) : (
                          'لم يتم تحديد المركبة'
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 text-red-500 ml-1" />
                          <span className="text-gray-900">من: {transfer.fromLocation}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 text-green-500 ml-1" />
                          <span className="text-gray-900">إلى: {transfer.toLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <Package className="h-3 w-3 inline ml-1" />
                        {transfer.totalItems} صنف
                      </div>
                      <div className="text-xs text-blue-600">
                        إجمالي الكمية: {transfer.totalQuantity}
                      </div>
                      <div className="text-xs text-gray-500" title={transfer.items.map(i => i.name).join(', ')}>
                        {transfer.items[0]?.name}
                        {transfer.items.length > 1 && ` +${transfer.items.length - 1}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-green-600">
                        {transfer.totalValue.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <User className="h-3 w-3 text-gray-400 ml-1" />
                          <span>طالب: {transfer.requestedBy}</span>
                        </div>
                        {transfer.approvedBy && (
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 ml-1" />
                            <span>موافق: {transfer.approvedBy}</span>
                          </div>
                        )}
                        {transfer.transferredBy && (
                          <div className="flex items-center">
                            <Truck className="h-3 w-3 text-blue-500 ml-1" />
                            <span>ناقل: {transfer.transferredBy}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 ml-1" />
                          <span>طلب: {transfer.requestedDate}</span>
                        </div>
                        {transfer.approvedDate && (
                          <div className="text-green-600">
                            موافقة: {transfer.approvedDate}
                          </div>
                        )}
                        {transfer.transferDate && (
                          <div className="text-blue-600">
                            نقل: {transfer.transferDate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(transfer.priority)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تقرير النقل">
                          <FileText className="h-4 w-4" />
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

      {filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات نقل</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على عمليات تطابق معايير البحث</p>
          <Button onClick={() => {setSearchTerm(''); setFilterStatus('all');}}>
            مسح جميع الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}