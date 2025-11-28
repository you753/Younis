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
import { 
  Plus, Calendar, CalendarCheck, CalendarX, Clock, 
  Edit, Trash2, CheckCircle, XCircle, AlertCircle, Search
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for holiday request
const holidaySchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  startDate: z.string().min(1, 'يجب تحديد تاريخ البداية'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ النهاية'),
  type: z.enum(['annual', 'sick', 'emergency', 'personal']),
  reason: z.string().min(5, 'يجب كتابة سبب الإجازة'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

type HolidayForm = z.infer<typeof holidaySchema>;

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    approved: { label: 'موافق عليها', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'مرفوضة', color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;
  
  return (
    <Badge className={config.color}>
      <IconComponent className="h-3 w-3 ml-1" />
      {config.label}
    </Badge>
  );
};

const getTypeBadge = (type: string) => {
  const typeConfig = {
    annual: { label: 'إجازة سنوية', color: 'bg-blue-100 text-blue-800' },
    sick: { label: 'إجازة مرضية', color: 'bg-orange-100 text-orange-800' },
    emergency: { label: 'إجازة طارئة', color: 'bg-red-100 text-red-800' },
    personal: { label: 'إجازة شخصية', color: 'bg-purple-100 text-purple-800' }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.annual;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

export default function Holidays() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('إدارة الإجازات');
  }, [setCurrentPage]);

  const form = useForm<HolidayForm>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      employeeId: 0,
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: '',
      status: 'pending',
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
        return apiRequest(`/api/holidays/${editingHoliday.id}`, { 
          method: 'PUT', 
          body: data 
        });
      }
      return apiRequest('/api/holidays', { 
        method: 'POST', 
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
    mutationFn: (id: number) => apiRequest(`/api/holidays/${id}`, { method: 'DELETE' }),
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
      apiRequest(`/api/holidays/${id}/status`, { 
        method: 'PATCH', 
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
      employeeId: 0,
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: '',
      status: 'pending',
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

  // Filter holidays
  const filteredHolidays = holidays?.filter((holiday: any) => {
    const employee = employees?.find((emp: any) => emp.id === holiday.employeeId);
    const employeeNameMatch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeFilterMatch = selectedEmployee ? holiday.employeeId.toString() === selectedEmployee : true;
    const statusFilterMatch = selectedStatus ? holiday.status === selectedStatus : true;
    const typeFilterMatch = selectedType ? holiday.type === selectedType : true;
    
    return employeeNameMatch && employeeFilterMatch && statusFilterMatch && typeFilterMatch;
  }) || [];

  // Calculate statistics
  const stats = {
    totalHolidays: holidays?.length || 0,
    pendingHolidays: holidays?.filter((h: any) => h.status === 'pending').length || 0,
    approvedHolidays: holidays?.filter((h: any) => h.status === 'approved').length || 0,
    rejectedHolidays: holidays?.filter((h: any) => h.status === 'rejected').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الإجازات</h1>
            <p className="text-gray-600">إدارة طلبات إجازات الموظفين والموافقة عليها</p>
          </div>
          <Button onClick={handleNewHoliday} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            طلب إجازة جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalHolidays}</div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 ml-1" />
                جميع طلبات الإجازات
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">قيد المراجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.pendingHolidays}</div>
              <div className="flex items-center text-sm text-yellow-600 mt-1">
                <AlertCircle className="h-4 w-4 ml-1" />
                طلب قيد المراجعة
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">موافق عليها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.approvedHolidays}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 ml-1" />
                إجازة موافق عليها
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">مرفوضة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.rejectedHolidays}</div>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <XCircle className="h-4 w-4 ml-1" />
                إجازة مرفوضة
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectItem value="">جميع الموظفين</SelectItem>
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
                  <SelectItem value="">جميع الحالات</SelectItem>
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
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  <SelectItem value="annual">إجازة سنوية</SelectItem>
                  <SelectItem value="sick">إجازة مرضية</SelectItem>
                  <SelectItem value="emergency">إجازة طارئة</SelectItem>
                  <SelectItem value="personal">إجازة شخصية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Holidays Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">طلبات الإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredHolidays.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات إجازات</h3>
                <p className="text-gray-500">ابدأ بإضافة طلب إجازة جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">نوع الإجازة</TableHead>
                      <TableHead className="text-right">تاريخ البداية</TableHead>
                      <TableHead className="text-right">تاريخ النهاية</TableHead>
                      <TableHead className="text-right">عدد الأيام</TableHead>
                      <TableHead className="text-right">السبب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHolidays.map((holiday: any) => {
                      const employee = employees?.find((emp: any) => emp.id === holiday.employeeId);
                      const days = calculateDays(holiday.startDate, holiday.endDate);
                      
                      return (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{employee?.name || 'غير محدد'}</TableCell>
                          <TableCell>{getTypeBadge(holiday.type)}</TableCell>
                          <TableCell>{new Date(holiday.startDate).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>{new Date(holiday.endDate).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {days} يوم
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{holiday.reason}</TableCell>
                          <TableCell>
                            <Select
                              value={holiday.status}
                              onValueChange={(value) => handleStatusChange(holiday.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد المراجعة</SelectItem>
                                <SelectItem value="approved">موافق عليها</SelectItem>
                                <SelectItem value="rejected">مرفوضة</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(holiday)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(holiday.id)}
                                className="text-red-600 hover:text-red-700"
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

        {/* Add/Edit Holiday Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHoliday ? 'تعديل طلب الإجازة' : 'إضافة طلب إجازة جديد'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموظف *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>نوع الإجازة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الإجازة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">إجازة سنوية</SelectItem>
                          <SelectItem value="sick">إجازة مرضية</SelectItem>
                          <SelectItem value="emergency">إجازة طارئة</SelectItem>
                          <SelectItem value="personal">إجازة شخصية</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ البداية *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>تاريخ النهاية *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                      <FormLabel>سبب الإجازة *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="اكتب سبب طلب الإجازة..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={holidayMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {holidayMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
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