import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EmployeeForm from '@/components/forms/EmployeeForm';
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
  Plus, Users, Clock, Calendar, TrendingUp, UserCheck, UserX, 
  Edit, Trash2, Save, Award, Target, CheckCircle, XCircle, 
  CalendarCheck, CalendarX, Star, Search
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Employee } from '@shared/schema';

// Schema for attendance record
const attendanceSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  date: z.string().min(1, 'يجب تحديد التاريخ'),
  timeIn: z.string().min(1, 'يجب تحديد وقت الحضور'),
  timeOut: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'early_leave']),
  notes: z.string().optional(),
});

// Schema for holiday request
const holidaySchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  startDate: z.string().min(1, 'يجب تحديد تاريخ البداية'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ النهاية'),
  type: z.enum(['annual', 'sick', 'emergency', 'personal']),
  reason: z.string().min(5, 'يجب كتابة سبب الإجازة'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

// Schema for performance evaluation
const performanceSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  period: z.string().min(1, 'يجب تحديد فترة التقييم'),
  qualityRating: z.number().min(1).max(5),
  punctualityRating: z.number().min(1).max(5),
  teamworkRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  goals: z.string().optional(),
  comments: z.string().optional(),
});

type AttendanceForm = z.infer<typeof attendanceSchema>;
type HolidayForm = z.infer<typeof holidaySchema>;
type PerformanceForm = z.infer<typeof performanceSchema>;

export default function Employees() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const attendanceForm = useForm<AttendanceForm>({
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

  const holidayForm = useForm<HolidayForm>({
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

  const performanceForm = useForm<PerformanceForm>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      employeeId: 0,
      period: '',
      qualityRating: 5,
      punctualityRating: 5,
      teamworkRating: 5,
      communicationRating: 5,
      overallRating: 5,
      goals: '',
      comments: '',
    }
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Filter employees based on search query
  const filteredEmployees = Array.isArray(employees) ? employees.filter((employee: Employee) => {
    if (!searchQuery.trim()) return true;
    
    const searchTerms = searchQuery.toLowerCase().trim().split(' ');
    const searchText = `${employee.name || ''} ${employee.email || ''} ${employee.phone || ''} ${employee.position || ''} ${employee.department || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete employee');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "نجح",
        description: "تم حذف الموظف بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الموظف",
        variant: "destructive",
      });
    },
  });

  // Set page title based on route
  useEffect(() => {
    switch (location) {
      case '/attendance':
        setCurrentPage('الحضور والانصراف');
        break;
      case '/holidays':
        setCurrentPage('الإجازات');
        break;
      case '/performance':
        setCurrentPage('تقييم الأداء');
        break;
      default:
        setCurrentPage('إدارة الموظفين');
    }
  }, [location, setCurrentPage]);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const getPageContent = () => {
    switch (location) {
      case '/attendance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الحضور والانصراف</h2>
                <p className="text-gray-600">تسجيل ومتابعة حضور وانصراف الموظفين</p>
              </div>
              <Button onClick={() => setShowAttendanceForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                تسجيل حضور
              </Button>
            </div>

            {/* Attendance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">حاضرون اليوم</p>
                      <p className="text-2xl font-bold text-green-700">{Math.max(0, employees.length - 1)}</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <UserCheck className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">غائبون اليوم</p>
                      <p className="text-2xl font-bold text-red-700">1</p>
                    </div>
                    <div className="bg-red-200 p-3 rounded-full">
                      <UserX className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">متأخرون</p>
                      <p className="text-2xl font-bold text-yellow-700">0</p>
                    </div>
                    <div className="bg-yellow-200 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">ساعات العمل</p>
                      <p className="text-2xl font-bold text-blue-700">8 ساعات</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle>سجل الحضور اليومي</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الموظف</TableHead>
                      <TableHead className="text-right">وقت الحضور</TableHead>
                      <TableHead className="text-right">وقت الانصراف</TableHead>
                      <TableHead className="text-right">عدد الساعات</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          لم يتم تسجيل أي حضور اليوم
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>08:30</TableCell>
                          <TableCell>17:00</TableCell>
                          <TableCell>8.5</TableCell>
                          <TableCell>
                            <Badge variant="default">حاضر</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Attendance Form Dialog */}
            <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تسجيل حضور موظف</DialogTitle>
                </DialogHeader>
                <Form {...attendanceForm}>
                  <form className="space-y-4">
                    <FormField
                      control={attendanceForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموظف</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الموظف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
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
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 ml-1" />
                        حفظ التسجيل
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAttendanceForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case '/holidays':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الإجازات</h2>
                <p className="text-gray-600">إدارة طلبات الإجازات والموافقات</p>
              </div>
              <Button onClick={() => setShowHolidayForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                طلب إجازة جديد
              </Button>
            </div>

            {/* Holiday Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">إجازات مؤكدة</p>
                      <p className="text-2xl font-bold text-green-700">5</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <CalendarCheck className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">في الانتظار</p>
                      <p className="text-2xl font-bold text-yellow-700">2</p>
                    </div>
                    <div className="bg-yellow-200 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">مرفوضة</p>
                      <p className="text-2xl font-bold text-red-700">1</p>
                    </div>
                    <div className="bg-red-200 p-3 rounded-full">
                      <CalendarX className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">إجمالي الأيام</p>
                      <p className="text-2xl font-bold text-blue-700">45 يوم</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Holidays Table */}
            <Card>
              <CardHeader>
                <CardTitle>طلبات الإجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الموظف</TableHead>
                      <TableHead className="text-right">نوع الإجازة</TableHead>
                      <TableHead className="text-right">من تاريخ</TableHead>
                      <TableHead className="text-right">إلى تاريخ</TableHead>
                      <TableHead className="text-right">عدد الأيام</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        لا توجد طلبات إجازات
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Holiday Form Dialog */}
            <Dialog open={showHolidayForm} onOpenChange={setShowHolidayForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>طلب إجازة جديد</DialogTitle>
                </DialogHeader>
                <Form {...holidayForm}>
                  <form className="space-y-4">
                    <FormField
                      control={holidayForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموظف</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الموظف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
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
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 ml-1" />
                        تقديم الطلب
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowHolidayForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case '/performance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تقييم الأداء</h2>
                <p className="text-gray-600">تقييم ومتابعة أداء الموظفين</p>
              </div>
              <Button onClick={() => setShowPerformanceForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                تقييم جديد
              </Button>
            </div>

            {/* Performance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">أداء ممتاز</p>
                      <p className="text-2xl font-bold text-green-700">3</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <Award className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">أداء جيد</p>
                      <p className="text-2xl font-bold text-blue-700">2</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">يحتاج تحسين</p>
                      <p className="text-2xl font-bold text-yellow-700">1</p>
                    </div>
                    <div className="bg-yellow-200 p-3 rounded-full">
                      <Target className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">متوسط التقييم</p>
                      <p className="text-2xl font-bold text-purple-700">4.2</p>
                    </div>
                    <div className="bg-purple-200 p-3 rounded-full">
                      <Star className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>تقييمات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الموظف</TableHead>
                      <TableHead className="text-right">فترة التقييم</TableHead>
                      <TableHead className="text-right">الجودة</TableHead>
                      <TableHead className="text-right">الالتزام</TableHead>
                      <TableHead className="text-right">العمل الجماعي</TableHead>
                      <TableHead className="text-right">التقييم الإجمالي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        لا توجد تقييمات أداء
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Performance Form Dialog */}
            <Dialog open={showPerformanceForm} onOpenChange={setShowPerformanceForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تقييم أداء موظف</DialogTitle>
                </DialogHeader>
                <Form {...performanceForm}>
                  <form className="space-y-4">
                    <FormField
                      control={performanceForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموظف</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الموظف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
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
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 ml-1" />
                        حفظ التقييم
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowPerformanceForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الموظفين</h2>
                <p className="text-gray-600">إضافة وإدارة معلومات الموظفين ومتابعة أدائهم</p>
              </div>
              <Button 
                onClick={() => setShowForm(true)} 
                className="btn-accounting-primary"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة موظف
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>قائمة الموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الموظف</TableHead>
                      <TableHead className="text-right">المنصب</TableHead>
                      <TableHead className="text-right">القسم</TableHead>
                      <TableHead className="text-right">الراتب</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          لا توجد موظفين مسجلين
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.salary} ر.س</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(employee.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Employee Form Dialog */}
            <EmployeeForm 
              open={showForm}
              onOpenChange={setShowForm}
              editingEmployee={editingEmployee}
              onSuccess={() => {
                setShowForm(false);
                setEditingEmployee(null);
              }}
            />
          </div>
        );
    }
  };

  return getPageContent();
}