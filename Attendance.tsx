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
  Plus, Clock, UserCheck, UserX, Calendar, BarChart3,
  Edit, Trash2, Save, CheckCircle, XCircle, Search, Filter
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for attendance record
const attendanceSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  date: z.string().min(1, 'يجب تحديد التاريخ'),
  timeIn: z.string().min(1, 'يجب تحديد وقت الحضور'),
  timeOut: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'early_leave']),
  notes: z.string().optional(),
});

type AttendanceForm = z.infer<typeof attendanceSchema>;

const getStatusBadge = (status: string) => {
  const statusConfig = {
    present: { label: 'حاضر', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
    absent: { label: 'غائب', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    late: { label: 'متأخر', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
    early_leave: { label: 'انصراف مبكر', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

export default function Attendance() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('الحضور والانصراف');
  }, [setCurrentPage]);

  const form = useForm<AttendanceForm>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: 0,
      date: new Date().toISOString().split('T')[0],
      timeIn: '',
      timeOut: '',
      status: 'present',
      notes: '',
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/employees');
      return response.json();
    }
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['/api/attendance'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/attendance');
      return response.json();
    }
  });

  // Create/Update attendance mutation
  const attendanceMutation = useMutation({
    mutationFn: async (data: AttendanceForm) => {
      if (editingAttendance) {
        const response = await apiRequest('PUT', `/api/attendance/${editingAttendance.id}`, data);
        return response.json();
      }
      const response = await apiRequest('POST', '/api/attendance', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      setShowForm(false);
      setEditingAttendance(null);
      form.reset();
      toast({
        title: "تم الحفظ بنجاح",
        description: editingAttendance ? "تم تحديث سجل الحضور" : "تم إضافة سجل حضور جديد",
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

  // Delete attendance mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/attendance/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف سجل الحضور بنجاح",
      });
    }
  });

  const onSubmit = (data: AttendanceForm) => {
    attendanceMutation.mutate(data);
  };

  const handleEdit = (attendance: any) => {
    setEditingAttendance(attendance);
    form.reset({
      employeeId: attendance.employeeId,
      date: attendance.date.split('T')[0],
      timeIn: attendance.timeIn,
      timeOut: attendance.timeOut || '',
      status: attendance.status,
      notes: attendance.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewAttendance = () => {
    setEditingAttendance(null);
    form.reset({
      employeeId: 0,
      date: new Date().toISOString().split('T')[0],
      timeIn: '',
      timeOut: '',
      status: 'present',
      notes: '',
    });
    setShowForm(true);
  };

  // Filter attendance records
  const filteredRecords = attendanceRecords?.filter((record: any) => {
    const employee = employees?.find((emp: any) => emp.id === record.employeeId);
    const employeeNameMatch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeFilterMatch = selectedEmployee ? record.employeeId.toString() === selectedEmployee : true;
    const statusFilterMatch = selectedStatus ? record.status === selectedStatus : true;
    
    return employeeNameMatch && employeeFilterMatch && statusFilterMatch;
  }) || [];

  // Calculate statistics
  const stats = {
    totalRecords: attendanceRecords?.length || 0,
    presentToday: attendanceRecords?.filter((r: any) => {
      const today = new Date().toISOString().split('T')[0];
      return r.date.split('T')[0] === today && r.status === 'present';
    }).length || 0,
    absentToday: attendanceRecords?.filter((r: any) => {
      const today = new Date().toISOString().split('T')[0];
      return r.date.split('T')[0] === today && r.status === 'absent';
    }).length || 0,
    lateToday: attendanceRecords?.filter((r: any) => {
      const today = new Date().toISOString().split('T')[0];
      return r.date.split('T')[0] === today && r.status === 'late';
    }).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الحضور والانصراف</h1>
            <p className="text-gray-600">إدارة سجلات حضور وانصراف الموظفين</p>
          </div>
          <Button onClick={handleNewAttendance} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            تسجيل حضور جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي السجلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecords}</div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <BarChart3 className="h-4 w-4 ml-1" />
                جميع سجلات الحضور
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">حاضرين اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.presentToday}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 ml-1" />
                موظف حاضر
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">غائبين اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.absentToday}</div>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <XCircle className="h-4 w-4 ml-1" />
                موظف غائب
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">متأخرين اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.lateToday}</div>
              <div className="flex items-center text-sm text-yellow-600 mt-1">
                <Clock className="h-4 w-4 ml-1" />
                موظف متأخر
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <SearchBox
                  placeholder="البحث في السجلات..."
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
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="early_leave">انصراف مبكر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">سجلات الحضور والانصراف</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات حضور</h3>
                <p className="text-gray-500">ابدأ بإضافة سجل حضور جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">وقت الحضور</TableHead>
                      <TableHead className="text-right">وقت الانصراف</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record: any) => {
                      const employee = employees?.find((emp: any) => emp.id === record.employeeId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{employee?.name || 'غير محدد'}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>{record.timeIn || '-'}</TableCell>
                          <TableCell>{record.timeOut || '-'}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
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

        {/* Add/Edit Attendance Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAttendance ? 'تعديل سجل الحضور' : 'إضافة سجل حضور جديد'}
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التاريخ *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت الحضور *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت الانصراف</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="present">حاضر</SelectItem>
                          <SelectItem value="absent">غائب</SelectItem>
                          <SelectItem value="late">متأخر</SelectItem>
                          <SelectItem value="early_leave">انصراف مبكر</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="أدخل أي ملاحظات إضافية..." rows={3} />
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
                    disabled={attendanceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {attendanceMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
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