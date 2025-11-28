import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Calendar, CalendarCheck, CalendarX, Clock, Users, TrendingUp,
  Edit, Trash2, CheckCircle, XCircle, AlertCircle, Search, Filter,
  FileText, Download, Eye, MoreHorizontal, User, CalendarDays
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Enhanced schema for holiday request
const holidaySchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  startDate: z.string().min(1, 'يجب تحديد تاريخ البداية'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ النهاية'),
  type: z.enum(['annual', 'sick', 'emergency', 'personal', 'maternity', 'paternity']),
  reason: z.string().min(5, 'يجب كتابة سبب الإجازة (5 أحرف على الأقل)'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  notes: z.string().optional(),
  requestDate: z.string().optional(),
});

type HolidayForm = z.infer<typeof holidaySchema>;

// Enhanced status badge component
const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { 
      label: 'قيد المراجعة', 
      color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200', 
      icon: AlertCircle 
    },
    approved: { 
      label: 'موافق عليها', 
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200', 
      icon: CheckCircle 
    },
    rejected: { 
      label: 'مرفوضة', 
      color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200', 
      icon: XCircle 
    }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} px-3 py-1 text-xs font-medium`}>
      <IconComponent className="h-3 w-3 ml-1" />
      {config.label}
    </Badge>
  );
};

// Enhanced type badge component
const getTypeBadge = (type: string) => {
  const typeConfig = {
    annual: { label: 'إجازة سنوية', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Calendar },
    sick: { label: 'إجازة مرضية', color: 'bg-orange-50 text-orange-700 border border-orange-200', icon: AlertCircle },
    emergency: { label: 'إجازة طارئة', color: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle },
    personal: { label: 'إجازة شخصية', color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: User },
    maternity: { label: 'إجازة أمومة', color: 'bg-pink-50 text-pink-700 border border-pink-200', icon: Users },
    paternity: { label: 'إجازة أبوة', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200', icon: Users }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.annual;
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} px-3 py-1 text-xs font-medium`}>
      <IconComponent className="h-3 w-3 ml-1" />
      {config.label}
    </Badge>
  );
};

export default function ProfessionalHolidays() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('إدارة الإجازات');
  }, [setCurrentPage]);

  const form = useForm<HolidayForm>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      employeeId: 1,
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: '',
      status: 'pending',
      notes: '',
      requestDate: new Date().toISOString().split('T')[0],
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => apiRequest('/api/employees')
  });

  // Fetch holidays
  const { data: holidays, isLoading } = useQuery({
    queryKey: ['/api/holidays'],
    queryFn: () => apiRequest('/api/holidays')
  });

  // Create/Update holiday mutation
  const holidayMutation = useMutation({
    mutationFn: (data: HolidayForm) => {
      if (editingHoliday) {
        return apiRequest({ 
          method: 'PUT', 
          url: `/api/holidays/${editingHoliday.id}`,
          body: data 
        });
      }
      return apiRequest({ 
        method: 'POST', 
        url: '/api/holidays',
        body: data 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/holidays'] });
      setShowForm(false);
      setEditingHoliday(null);
      form.reset();
      toast({
        title: "تم الحفظ بنجاح",
        description: editingHoliday ? "تم تحديث طلب الإجازة" : "تم إضافة طلب إجازة جديد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  });

  // Delete holiday mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest({ 
      method: 'DELETE', 
      url: `/api/holidays/${id}` 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/holidays'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف طلب الإجازة بنجاح",
      });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest({ 
        method: 'PATCH', 
        url: `/api/holidays/${id}/status`,
        body: { status }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/holidays'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الإجازة بنجاح",
      });
    }
  });

  const onSubmit = (data: HolidayForm) => {
    // Validate dates
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast({
        title: "خطأ في التواريخ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive"
      });
      return;
    }
    
    // Check if start date is in the past
    if (new Date(data.startDate) < new Date()) {
      toast({
        title: "خطأ في التاريخ",
        description: "لا يمكن إضافة إجازة في الماضي",
        variant: "destructive"
      });
      return;
    }
    
    holidayMutation.mutate(data);
  };

  const handleEdit = (holiday: any) => {
    setEditingHoliday(holiday);
    form.reset({
      employeeId: holiday.employeeId,
      startDate: holiday.startDate.split('T')[0],
      endDate: holiday.endDate.split('T')[0],
      type: holiday.type,
      reason: holiday.reason,
      status: holiday.status,
      notes: holiday.notes || '',
      requestDate: holiday.requestDate ? holiday.requestDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleNewHoliday = () => {
    setEditingHoliday(null);
    form.reset({
      employeeId: employees?.[0]?.id || 1,
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: '',
      status: 'pending',
      notes: '',
      requestDate: new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // Filter holidays based on date range
  const filterByDateRange = (holiday: any) => {
    if (!selectedDateRange || selectedDateRange === 'all') return true;
    
    const today = new Date();
    const holidayStart = new Date(holiday.startDate);
    
    switch (selectedDateRange) {
      case 'this_month':
        return holidayStart.getMonth() === today.getMonth() && 
               holidayStart.getFullYear() === today.getFullYear();
      case 'next_month':
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
        return holidayStart.getMonth() === nextMonth.getMonth() && 
               holidayStart.getFullYear() === nextMonth.getFullYear();
      case 'this_year':
        return holidayStart.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  // Filter holidays
  const filteredHolidays = holidays?.filter((holiday: any) => {
    const employee = employees?.find((emp: any) => emp.id === holiday.employeeId);
    const employeeNameMatch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeFilterMatch = selectedEmployee && selectedEmployee !== 'all' ? holiday.employeeId.toString() === selectedEmployee : true;
    const statusFilterMatch = selectedStatus && selectedStatus !== 'all' ? holiday.status === selectedStatus : true;
    const typeFilterMatch = selectedType && selectedType !== 'all' ? holiday.type === selectedType : true;
    const dateRangeMatch = filterByDateRange(holiday);
    
    return employeeNameMatch && employeeFilterMatch && statusFilterMatch && typeFilterMatch && dateRangeMatch;
  }) || [];

  // Calculate enhanced statistics
  const stats = {
    totalHolidays: holidays?.length || 0,
    pendingHolidays: holidays?.filter((h: any) => h.status === 'pending').length || 0,
    approvedHolidays: holidays?.filter((h: any) => h.status === 'approved').length || 0,
    rejectedHolidays: holidays?.filter((h: any) => h.status === 'rejected').length || 0,
    thisMonthHolidays: holidays?.filter((h: any) => {
      const holidayDate = new Date(h.startDate);
      const today = new Date();
      return holidayDate.getMonth() === today.getMonth() && 
             holidayDate.getFullYear() === today.getFullYear();
    }).length || 0,
    totalDaysRequested: holidays?.reduce((total: number, h: any) => {
      return total + calculateDays(h.startDate, h.endDate);
    }, 0) || 0,
    activeEmployees: new Set(holidays?.map((h: any) => h.employeeId)).size || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                إدارة الإجازات
              </h1>
              <p className="text-gray-600 text-lg">نظام شامل لإدارة طلبات إجازات الموظفين والموافقة عليها</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{stats.activeEmployees} موظف نشط</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{stats.totalDaysRequested} يوم إجازة مطلوب</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stats.thisMonthHolidays} طلب هذا الشهر</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleNewHoliday} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <Plus className="h-5 w-5 ml-2" />
              طلب إجازة جديد
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800 mb-2">{stats.totalHolidays}</div>
              <div className="text-xs text-blue-600">جميع طلبات الإجازات</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                قيد المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800 mb-2">{stats.pendingHolidays}</div>
              <div className="text-xs text-yellow-600">طلب يحتاج موافقة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                موافق عليها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800 mb-2">{stats.approvedHolidays}</div>
              <div className="text-xs text-green-600">إجازة مقبولة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                مرفوضة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-800 mb-2">{stats.rejectedHolidays}</div>
              <div className="text-xs text-red-600">إجازة مرفوضة</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 ml-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 ml-2" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Filters */}
            <Card className="bg-white shadow-lg border-0 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  البحث والتصفية المتقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <SearchBox
                      placeholder="البحث في الطلبات..."
                      value={searchTerm}
                      onChange={setSearchTerm}
                      className="flex-1"
                    />
                  </div>
                  
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الموظفين</SelectItem>
                      {employees?.map((employee: any) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                      <SelectItem value="approved">موافق عليها</SelectItem>
                      <SelectItem value="rejected">مرفوضة</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="annual">إجازة سنوية</SelectItem>
                      <SelectItem value="sick">إجازة مرضية</SelectItem>
                      <SelectItem value="emergency">إجازة طارئة</SelectItem>
                      <SelectItem value="personal">إجازة شخصية</SelectItem>
                      <SelectItem value="maternity">إجازة أمومة</SelectItem>
                      <SelectItem value="paternity">إجازة أبوة</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب التاريخ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="this_month">هذا الشهر</SelectItem>
                      <SelectItem value="next_month">الشهر القادم</SelectItem>
                      <SelectItem value="this_year">هذا العام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Holidays Table */}
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    طلبات الإجازات ({filteredHolidays.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Download className="h-4 w-4 ml-2" />
                    تصدير Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredHolidays.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-3">لا توجد طلبات إجازات</h3>
                    <p className="text-gray-500 mb-6">ابدأ بإضافة طلب إجازة جديد</p>
                    <Button onClick={handleNewHoliday} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة طلب جديد
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="text-right font-semibold">الموظف</TableHead>
                          <TableHead className="text-right font-semibold">نوع الإجازة</TableHead>
                          <TableHead className="text-right font-semibold">تاريخ البداية</TableHead>
                          <TableHead className="text-right font-semibold">تاريخ النهاية</TableHead>
                          <TableHead className="text-right font-semibold">عدد الأيام</TableHead>
                          <TableHead className="text-right font-semibold">السبب</TableHead>
                          <TableHead className="text-right font-semibold">الحالة</TableHead>
                          <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHolidays.map((holiday: any) => {
                          const employee = employees?.find((emp: any) => emp.id === holiday.employeeId);
                          const days = calculateDays(holiday.startDate, holiday.endDate);
                          
                          return (
                            <TableRow key={holiday.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  {employee?.name || 'غير محدد'}
                                </div>
                              </TableCell>
                              <TableCell>{getTypeBadge(holiday.type)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(holiday.startDate).toLocaleDateString('en-GB')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(holiday.endDate).toLocaleDateString('en-GB')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {days} يوم
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate" title={holiday.reason}>
                                  {holiday.reason}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={holiday.status} 
                                  onValueChange={(status) => handleStatusChange(holiday.id, status)}
                                >
                                  <SelectTrigger className="w-auto border-0 bg-transparent p-0">
                                    <SelectValue>
                                      {getStatusBadge(holiday.status)}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                                    <SelectItem value="approved">موافق عليها</SelectItem>
                                    <SelectItem value="rejected">مرفوضة</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(holiday)}
                                    className="hover:bg-blue-100 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(holiday.id)}
                                    className="hover:bg-red-100 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  إدارة طلبات الإجازات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">هنا يمكن إدارة جميع طلبات الإجازات بشكل تفصيلي</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  تقارير الإجازات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">هنا يمكن عرض التقارير والإحصائيات التفصيلية</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Holiday Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingHoliday ? 'تعديل طلب الإجازة' : 'طلب إجازة جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">الموظف *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">نوع الإجازة *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="اختر نوع الإجازة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="annual">إجازة سنوية</SelectItem>
                            <SelectItem value="sick">إجازة مرضية</SelectItem>
                            <SelectItem value="emergency">إجازة طارئة</SelectItem>
                            <SelectItem value="personal">إجازة شخصية</SelectItem>
                            <SelectItem value="maternity">إجازة أمومة</SelectItem>
                            <SelectItem value="paternity">إجازة أبوة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">تاريخ البداية *</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">تاريخ النهاية *</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">سبب الإجازة *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب سبب طلب الإجازة..."
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أي ملاحظات إضافية..."
                          className="min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={holidayMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11"
                  >
                    {holidayMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 ml-2" />
                        {editingHoliday ? 'تحديث الطلب' : 'حفظ الطلب'}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-11"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}