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
  Plus, DollarSign, TrendingUp, Users, Award, 
  Edit, Trash2, Search, CheckCircle, XCircle
} from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for allowance
const allowanceSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  type: z.enum(['transport', 'housing', 'food', 'bonus', 'overtime', 'other']),
  amount: z.string().min(1, 'يجب إدخال المبلغ'),
  description: z.string().min(3, 'يجب إدخال وصف البدل'),
  date: z.string().min(1, 'يجب تحديد التاريخ'),
  isRecurring: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
});

type AllowanceForm = z.infer<typeof allowanceSchema>;

const getTypeBadge = (type: string) => {
  const typeConfig = {
    transport: { label: 'بدل نقل', color: 'bg-blue-100 text-blue-800' },
    housing: { label: 'بدل سكن', color: 'bg-green-100 text-green-800' },
    food: { label: 'بدل طعام', color: 'bg-orange-100 text-orange-800' },
    bonus: { label: 'مكافأة', color: 'bg-purple-100 text-purple-800' },
    overtime: { label: 'بدل إضافي', color: 'bg-yellow-100 text-yellow-800' },
    other: { label: 'أخرى', color: 'bg-gray-100 text-gray-800' }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { label: 'نشط', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { label: 'غير نشط', color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const IconComponent = config.icon;
  
  return (
    <Badge className={config.color}>
      <IconComponent className="h-3 w-3 ml-1" />
      {config.label}
    </Badge>
  );
};

export default function Allowances() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('البدلات');
  }, [setCurrentPage]);

  const form = useForm<AllowanceForm>({
    resolver: zodResolver(allowanceSchema),
    defaultValues: {
      employeeId: 0,
      type: 'transport',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      status: 'active',
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => apiRequest('/api/employees')
  });

  // Fetch allowances
  const { data: allowances, isLoading } = useQuery({
    queryKey: ['/api/allowances'],
    queryFn: () => apiRequest('/api/allowances')
  });

  // Create/Update allowance mutation
  const allowanceMutation = useMutation({
    mutationFn: (data: AllowanceForm) => {
      if (editingAllowance) {
        return apiRequest(`/api/allowances/${editingAllowance.id}`, { 
          method: 'PUT', 
          body: data 
        });
      }
      return apiRequest('/api/allowances', { 
        method: 'POST', 
        body: data 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allowances'] });
      setShowForm(false);
      setEditingAllowance(null);
      form.reset();
      toast({
        title: "تم الحفظ بنجاح",
        description: editingAllowance ? "تم تحديث البدل" : "تم إضافة بدل جديد",
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

  // Delete allowance mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/allowances/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/allowances'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البدل بنجاح",
      });
    }
  });

  const onSubmit = (data: AllowanceForm) => {
    allowanceMutation.mutate(data);
  };

  const handleEdit = (allowance: any) => {
    setEditingAllowance(allowance);
    form.reset({
      employeeId: allowance.employeeId,
      type: allowance.type,
      amount: allowance.amount.toString(),
      description: allowance.description,
      date: allowance.date.split('T')[0],
      isRecurring: allowance.isRecurring,
      status: allowance.status,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البدل؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewAllowance = () => {
    setEditingAllowance(null);
    form.reset({
      employeeId: 0,
      type: 'transport',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      status: 'active',
    });
    setShowForm(true);
  };

  // Filter allowances
  const filteredAllowances = allowances?.filter((allowance: any) => {
    const employee = employees?.find((emp: any) => emp.id === allowance.employeeId);
    const employeeNameMatch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = allowance.description.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeFilterMatch = selectedEmployee ? allowance.employeeId.toString() === selectedEmployee : true;
    const typeFilterMatch = selectedType ? allowance.type === selectedType : true;
    const statusFilterMatch = selectedStatus ? allowance.status === selectedStatus : true;
    
    return (employeeNameMatch || typeMatch) && employeeFilterMatch && typeFilterMatch && statusFilterMatch;
  }) || [];

  // Calculate statistics
  const stats = {
    totalAllowances: allowances?.length || 0,
    activeAllowances: allowances?.filter((a: any) => a.status === 'active').length || 0,
    totalAmount: allowances?.reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0) || 0,
    recurringAllowances: allowances?.filter((a: any) => a.isRecurring).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة البدلات</h1>
            <p className="text-gray-600">إدارة بدلات ومكافآت الموظفين</p>
          </div>
          <Button onClick={handleNewAllowance} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            إضافة بدل جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي البدلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAllowances}</div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Award className="h-4 w-4 ml-1" />
                بدل مسجل
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">البدلات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.activeAllowances}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 ml-1" />
                بدل نشط
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">إجمالي المبلغ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
              <div className="flex items-center text-sm text-blue-600 mt-1">
                <DollarSign className="h-4 w-4 ml-1" />
                مجموع البدلات
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">البدلات المتكررة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.recurringAllowances}</div>
              <div className="flex items-center text-sm text-purple-600 mt-1">
                <TrendingUp className="h-4 w-4 ml-1" />
                بدل شهري
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
                  placeholder="البحث في البدلات..."
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

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  <SelectItem value="transport">بدل نقل</SelectItem>
                  <SelectItem value="housing">بدل سكن</SelectItem>
                  <SelectItem value="food">بدل طعام</SelectItem>
                  <SelectItem value="bonus">مكافأة</SelectItem>
                  <SelectItem value="overtime">بدل إضافي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Allowances Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">قائمة البدلات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAllowances.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بدلات</h3>
                <p className="text-gray-500">ابدأ بإضافة بدل جديد للموظفين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">نوع البدل</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">متكرر</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllowances.map((allowance: any) => {
                      const employee = employees?.find((emp: any) => emp.id === allowance.employeeId);
                      
                      return (
                        <TableRow key={allowance.id}>
                          <TableCell className="font-medium">{employee?.name || 'غير محدد'}</TableCell>
                          <TableCell>{getTypeBadge(allowance.type)}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {parseFloat(allowance.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{allowance.description}</TableCell>
                          <TableCell>{new Date(allowance.date).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            {allowance.isRecurring ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                شهري
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                مرة واحدة
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(allowance.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(allowance)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(allowance.id)}
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

        {/* Add/Edit Allowance Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAllowance ? 'تعديل البدل' : 'إضافة بدل جديد'}
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
                      <FormLabel>نوع البدل *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع البدل" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transport">بدل نقل</SelectItem>
                          <SelectItem value="housing">بدل سكن</SelectItem>
                          <SelectItem value="food">بدل طعام</SelectItem>
                          <SelectItem value="bonus">مكافأة</SelectItem>
                          <SelectItem value="overtime">بدل إضافي</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} placeholder="0.00" />
                        </FormControl>
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف البدل *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="اكتب وصف البدل..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بدل متكرر</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">مرة واحدة</SelectItem>
                            <SelectItem value="true">شهري</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="inactive">غير نشط</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    disabled={allowanceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {allowanceMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
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