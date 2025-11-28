import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Bell, CheckCircle2, Clock, XCircle, Search, Filter, Eye, RefreshCw, Mail, MessageSquare } from 'lucide-react';

interface BranchInventoryAlertsProps {
  branchId?: number;
}

export default function BranchInventoryAlerts({ branchId }: BranchInventoryAlertsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // بيانات تجريبية شاملة للتنبيهات
  const alerts = [
    {
      id: 1,
      type: 'out_of_stock',
      priority: 'critical',
      status: 'active',
      product: {
        name: 'شاشة Samsung Curved 27 بوصة',
        code: 'SAM-CRV-27',
        category: 'شاشات'
      },
      message: 'نفد المخزون تماماً',
      details: 'لم يتبق أي وحدة في المخزون',
      currentStock: 0,
      minimumStock: 2,
      daysOutOfStock: 20,
      lastRestockDate: '2025-06-28',
      estimatedLoss: 15800,
      suggestedAction: 'طلب إعادة تموين فوري',
      createdAt: '2025-07-18T10:30:00',
      acknowledgedBy: null,
      resolvedAt: null
    },
    {
      id: 2,
      type: 'low_stock',
      priority: 'high',
      status: 'active',
      product: {
        name: 'هارد ديسك خارجي Western Digital 2TB',
        code: 'WD-EXT-2TB',
        category: 'التخزين'
      },
      message: 'مخزون منخفض جداً',
      details: 'المخزون أقل من الحد الأدنى المطلوب',
      currentStock: 3,
      minimumStock: 8,
      shortage: 5,
      averageConsumption: 4,
      estimatedRunoutDays: 1,
      suggestedAction: 'طلب إعادة تموين خلال 24 ساعة',
      createdAt: '2025-07-17T15:45:00',
      acknowledgedBy: 'أحمد محمد المخزين',
      resolvedAt: null
    },
    {
      id: 3,
      type: 'critical_stock',
      priority: 'high',
      status: 'active',
      product: {
        name: 'كيبورد لاسلكي Microsoft Wireless',
        code: 'MS-KB-WLS',
        category: 'اكسسوارات'
      },
      message: 'مخزون في حالة حرجة',
      details: 'المخزون الحالي لا يكفي للطلب المتوقع',
      currentStock: 2,
      minimumStock: 8,
      shortage: 6,
      averageConsumption: 6,
      estimatedRunoutDays: 0,
      suggestedAction: 'إيقاف البيع حتى وصول شحنة جديدة',
      createdAt: '2025-07-17T12:20:00',
      acknowledgedBy: 'فاطمة أحمد المديرة',
      resolvedAt: null
    },
    {
      id: 4,
      type: 'reorder_point',
      priority: 'medium',
      status: 'acknowledged',
      product: {
        name: 'طابعة Canon PIXMA MG3620',
        code: 'CAN-PIX-3620',
        category: 'طابعات'
      },
      message: 'وصل إلى نقطة إعادة الطلب',
      details: 'حان وقت إعادة طلب هذا المنتج',
      currentStock: 8,
      minimumStock: 3,
      reorderLevel: 10,
      suggestedOrderQuantity: 15,
      suggestedAction: 'إنشاء طلب شراء جديد',
      createdAt: '2025-07-16T09:15:00',
      acknowledgedBy: 'سارة خالد المشتريات',
      resolvedAt: null
    },
    {
      id: 5,
      type: 'overstock',
      priority: 'low',
      status: 'active',
      product: {
        name: 'ماوس لاسلكي Logitech MX Master 3',
        code: 'LOG-MX-MST3',
        category: 'اكسسوارات'
      },
      message: 'مخزون زائد عن الحاجة',
      details: 'المخزون أعلى من الحد الأقصى المطلوب',
      currentStock: 45,
      maximumStock: 30,
      excess: 15,
      suggestedAction: 'تخفيض كمية الطلب القادم أو تشغيل عرض ترويجي',
      createdAt: '2025-07-15T14:30:00',
      acknowledgedBy: null,
      resolvedAt: null
    },
    {
      id: 6,
      type: 'expired_alert',
      priority: 'medium',
      status: 'resolved',
      product: {
        name: 'لابتوب HP EliteBook 840 G7',
        code: 'HP-ELB-840',
        category: 'أجهزة كمبيوتر'
      },
      message: 'تنبيه منتهي الصلاحية',
      details: 'تم حل مشكلة المخزون المنخفض',
      currentStock: 15,
      minimumStock: 5,
      suggestedAction: 'تم إعادة التموين بنجاح',
      createdAt: '2025-07-14T11:00:00',
      acknowledgedBy: 'عبد الله علي المسؤول',
      resolvedAt: '2025-07-15T16:30:00'
    },
    {
      id: 7,
      type: 'slow_moving',
      priority: 'low',
      status: 'active',
      product: {
        name: 'سماعات بلوتوث Sony WH-1000XM4',
        code: 'SONY-WH-1000',
        category: 'صوتيات'
      },
      message: 'منتج بطيء الحركة',
      details: 'لم يتم بيع هذا المنتج لفترة طويلة',
      currentStock: 12,
      daysSinceLastSale: 45,
      averageMonthlyMovement: 2,
      suggestedAction: 'إجراء تقييم للطلب أو تشغيل حملة تسويقية',
      createdAt: '2025-07-13T08:45:00',
      acknowledgedBy: null,
      resolvedAt: null
    },
    {
      id: 8,
      type: 'supplier_delay',
      priority: 'high',
      status: 'active',
      product: {
        name: 'كاميرا ويب Logitech C920',
        code: 'LOG-C920',
        category: 'اكسسوارات'
      },
      message: 'تأخير في توريد المنتج',
      details: 'المورد أبلغ عن تأخير في التسليم',
      expectedDelivery: '2025-07-25',
      delayDays: 10,
      affectedOrders: 3,
      suggestedAction: 'البحث عن مورد بديل أو إبلاغ العملاء',
      createdAt: '2025-07-12T13:20:00',
      acknowledgedBy: 'نورا سالم المشتريات',
      resolvedAt: null
    }
  ];

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'low_stock':
      case 'critical_stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'reorder_point':
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      case 'overstock':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'slow_moving':
        return <Clock className="h-5 w-5 text-gray-600" />;
      case 'supplier_delay':
        return <Bell className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            حرج
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            عالي
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            متوسط
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            منخفض
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Bell className="h-3 w-3 ml-1" />
            نشط
          </Badge>
        );
      case 'acknowledged':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Eye className="h-3 w-3 ml-1" />
            مُطلع عليه
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 ml-1" />
            محلول
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'out_of_stock': return 'نفد المخزون';
      case 'low_stock': return 'مخزون منخفض';
      case 'critical_stock': return 'مخزون حرج';
      case 'reorder_point': return 'نقطة إعادة طلب';
      case 'overstock': return 'مخزون زائد';
      case 'slow_moving': return 'بطيء الحركة';
      case 'supplier_delay': return 'تأخير مورد';
      case 'expired_alert': return 'تنبيه منتهي';
      default: return 'غير محدد';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-3 rounded-full">
          <Bell className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تنبيهات المخزون</h1>
          <p className="text-gray-600">مراقبة ومتابعة تنبيهات حالة المخزون - رقم الفرع: {branchId}</p>
        </div>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التنبيهات</p>
                <p className="text-2xl font-bold text-gray-600">{alertStats.total}</p>
                <p className="text-xs text-gray-600">تنبيه</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تنبيهات نشطة</p>
                <p className="text-2xl font-bold text-red-600">{alertStats.active}</p>
                <p className="text-xs text-red-600">يحتاج إجراء</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">حرجة</p>
                <p className="text-2xl font-bold text-orange-600">{alertStats.critical}</p>
                <p className="text-xs text-orange-600">أولوية قصوى</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مُطلع عليها</p>
                <p className="text-2xl font-bold text-blue-600">{alertStats.acknowledged}</p>
                <p className="text-xs text-blue-600">قيد المتابعة</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">محلولة</p>
                <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
                <p className="text-xs text-green-600">تم إنجازها</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
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
              placeholder="البحث في التنبيهات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">كل الأولويات</option>
            <option value="critical">حرج</option>
            <option value="high">عالي</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="acknowledged">مُطلع عليه</option>
            <option value="resolved">محلول</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            إرسال تقرير
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث التنبيهات
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">تنبيهات المخزون</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredAlerts.length} من أصل {alerts.length} تنبيه
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`hover:shadow-md transition-shadow ${alert.status === 'active' && alert.priority === 'critical' ? 'border-red-200 bg-red-50/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{alert.product.name}</h3>
                          <span className="text-sm text-blue-600">{alert.product.code}</span>
                          <Badge variant="outline" className="text-xs">{alert.product.category}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">{getAlertTypeText(alert.type)}</span>
                          {getPriorityBadge(alert.priority)}
                          {getStatusBadge(alert.status)}
                        </div>

                        <p className="text-gray-800 font-medium">{alert.message}</p>
                        <p className="text-sm text-gray-600">{alert.details}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {alert.currentStock !== undefined && (
                            <div>
                              <span className="text-gray-500">المخزون الحالي:</span>
                              <p className={`font-bold ${alert.currentStock === 0 ? 'text-red-600' : alert.currentStock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {alert.currentStock}
                              </p>
                            </div>
                          )}
                          {alert.minimumStock !== undefined && (
                            <div>
                              <span className="text-gray-500">الحد الأدنى:</span>
                              <p className="font-bold text-gray-800">{alert.minimumStock}</p>
                            </div>
                          )}
                          {alert.estimatedRunoutDays !== undefined && (
                            <div>
                              <span className="text-gray-500">أيام النفاد:</span>
                              <p className={`font-bold ${alert.estimatedRunoutDays <= 1 ? 'text-red-600' : 'text-yellow-600'}`}>
                                {alert.estimatedRunoutDays} يوم
                              </p>
                            </div>
                          )}
                          {alert.daysOutOfStock && (
                            <div>
                              <span className="text-gray-500">أيام النفاد:</span>
                              <p className="font-bold text-red-600">{alert.daysOutOfStock} يوم</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">الإجراء المقترح:</p>
                          <p className="text-sm text-blue-700">{alert.suggestedAction}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>إنشاء: {new Date(alert.createdAt).toLocaleDateString('en-GB')}</span>
                          {alert.acknowledgedBy && (
                            <span>أُطلع عليه بواسطة: {alert.acknowledgedBy}</span>
                          )}
                          {alert.resolvedAt && (
                            <span>حُل في: {new Date(alert.resolvedAt).toLocaleDateString('en-GB')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {alert.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            اطلع عليه
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            حل
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          حل
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        تعليق
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على تنبيهات تطابق معايير البحث</p>
          <Button onClick={() => {setSearchTerm(''); setFilterPriority('all'); setFilterStatus('all');}}>
            مسح جميع الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}