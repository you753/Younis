import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays,
  Briefcase,
  FileText
} from 'lucide-react';

interface BranchHolidaysProps {
  branchId: number;
}

const BranchHolidays = ({ branchId }: BranchHolidaysProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [selectedType, setSelectedType] = useState('الكل');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    notes: ''
  });

  // بيانات وهمية للموظفين
  const employees = [
    { id: 1, name: 'أحمد محمد علي', position: 'مدير المبيعات' },
    { id: 2, name: 'فاطمة أحمد السالم', position: 'محاسبة' },
    { id: 3, name: 'خالد عبدالله النمر', position: 'مساعد مخازن' },
    { id: 4, name: 'نورا سعد الغامدي', position: 'موظفة استقبال' },
    { id: 5, name: 'عبدالرحمن محمد القحطاني', position: 'سائق' }
  ];

  // بيانات وهمية للإجازات
  const holidays = [
    {
      id: 1,
      employeeId: 1,
      employeeName: 'أحمد محمد علي',
      type: 'إجازة سنوية',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      duration: 10,
      reason: 'إجازة صيفية',
      status: 'معتمدة',
      requestDate: '2024-01-01',
      approvalDate: '2024-01-03',
      notes: 'إجازة للراحة والسفر'
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: 'فاطمة أحمد السالم',
      type: 'إجازة مرضية',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      duration: 3,
      reason: 'مرض',
      status: 'معلقة',
      requestDate: '2024-02-08',
      approvalDate: null,
      notes: 'تحتاج تقرير طبي'
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: 'خالد عبدالله النمر',
      type: 'إجازة اضطرارية',
      startDate: '2024-03-01',
      endDate: '2024-03-03',
      duration: 3,
      reason: 'ظروف عائلية',
      status: 'مرفوضة',
      requestDate: '2024-02-25',
      approvalDate: '2024-02-28',
      notes: 'تم الرفض بسبب ضغط العمل'
    },
    {
      id: 4,
      employeeId: 4,
      employeeName: 'نورا سعد الغامدي',
      type: 'إجازة أمومة',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      duration: 90,
      reason: 'إجازة أمومة',
      status: 'معتمدة',
      requestDate: '2024-03-15',
      approvalDate: '2024-03-18',
      notes: 'إجازة أمومة كاملة'
    },
    {
      id: 5,
      employeeId: 5,
      employeeName: 'عبدالرحمن محمد القحطاني',
      type: 'إجازة سنوية',
      startDate: '2024-05-15',
      endDate: '2024-05-22',
      duration: 7,
      reason: 'إجازة العيد',
      status: 'معتمدة',
      requestDate: '2024-05-01',
      approvalDate: '2024-05-03',
      notes: 'إجازة عيد الفطر'
    }
  ];

  const holidayTypes = ['الكل', 'إجازة سنوية', 'إجازة مرضية', 'إجازة اضطرارية', 'إجازة أمومة', 'إجازة أبوة'];
  const statuses = ['الكل', 'معلقة', 'معتمدة', 'مرفوضة'];

  // حساب الإحصائيات
  const stats = {
    totalRequests: holidays.length,
    pending: holidays.filter(h => h.status === 'معلقة').length,
    approved: holidays.filter(h => h.status === 'معتمدة').length,
    rejected: holidays.filter(h => h.status === 'مرفوضة').length,
    totalDays: holidays.filter(h => h.status === 'معتمدة').reduce((sum, h) => sum + h.duration, 0),
    avgDuration: holidays.filter(h => h.status === 'معتمدة').reduce((sum, h) => sum + h.duration, 0) / holidays.filter(h => h.status === 'معتمدة').length
  };

  // تصفية الإجازات
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         holiday.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'الكل' || holiday.status === selectedStatus;
    const matchesType = selectedType === 'الكل' || holiday.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'معلقة': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'معلقة', icon: Clock },
      'معتمدة': { className: 'bg-green-100 text-green-800 border-green-200', text: 'معتمدة', icon: CheckCircle },
      'مرفوضة': { className: 'bg-red-100 text-red-800 border-red-200', text: 'مرفوضة', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['معلقة'];
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(formData.startDate, formData.endDate);
    console.log('إضافة طلب إجازة جديد:', { ...formData, duration });
    setIsDialogOpen(false);
    setFormData({
      employeeId: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      notes: ''
    });
  };

  const handleStatusChange = (holidayId: number, newStatus: string) => {
    console.log('تغيير حالة الإجازة:', holidayId, newStatus);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإجازات</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">الموظف</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">نوع الإجازة</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الإجازة" />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayTypes.slice(1).map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">تاريخ النهاية</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">سبب الإجازة</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="أدخل سبب الإجازة"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                />
              </div>
              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    مدة الإجازة: {calculateDuration(formData.startDate, formData.endDate)} يوم
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  تقديم الطلب
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="requests">طلبات الإجازات</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">طلبات معلقة</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">طلبات معتمدة</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الأيام</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalDays}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* إحصائيات تفصيلية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أنواع الإجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holidayTypes.slice(1).map((type) => {
                    const count = holidays.filter(h => h.type === type).length;
                    const percentage = (count / holidays.length * 100).toFixed(1);
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count} طلب</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حالة الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statuses.slice(1).map((status) => {
                    const count = holidays.filter(h => h.status === status).length;
                    const percentage = (count / holidays.length * 100).toFixed(1);
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count} طلب</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* فلاتر البحث */}
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
                    placeholder="البحث بالموظف أو السبب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="حالة الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع الإجازة" />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
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

          {/* قائمة طلبات الإجازات */}
          <Card>
            <CardHeader>
              <CardTitle>طلبات الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{holiday.employeeName}</h3>
                        {getStatusBadge(holiday.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{holiday.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{holiday.startDate} إلى {holiday.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{holiday.duration} يوم</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">السبب:</span> {holiday.reason}
                      </div>
                      {holiday.notes && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">ملاحظات:</span> {holiday.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {holiday.status === 'معلقة' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(holiday.id, 'معتمدة')}
                          >
                            اعتماد
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleStatusChange(holiday.id, 'مرفوضة')}
                          >
                            رفض
                          </Button>
                        </>
                      )}
                      {holiday.status !== 'معلقة' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(holiday.id, 'معلقة')}
                        >
                          تعديل
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقويم الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">عرض التقويم سيتم إضافته قريباً</p>
                <p className="text-sm text-gray-500 mt-2">سيتم عرض جميع الإجازات في تقويم تفاعلي</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BranchHolidays;