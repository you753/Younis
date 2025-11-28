import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, Trash2, Users, UserCheck, UserX, DollarSign, Plus, Eye, User, Phone, Mail, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchEmployeesProfessionalProps {
  branchId: number;
}

// Form validation schema
const employeeSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  position: z.string().min(2, 'المنصب مطلوب'),
  department: z.string().min(2, 'القسم مطلوب'),
  baseSalary: z.string().min(1, 'الراتب مطلوب'),
  hireDate: z.string().optional(),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave'])
});

export default function BranchEmployeesProfessionalSimple({ branchId }: BranchEmployeesProfessionalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      baseSalary: '',
      hireDate: '',
      address: '',
      nationalId: '',
      status: 'active'
    }
  });

  // Fetch employees data
  const { data: employees = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/employees`],
  });

  // Safe array handling
  const employeeList = Array.isArray(employees) ? employees : [];
  
  // Filter employees based on search
  const filteredEmployees = employeeList.filter((employee: any) =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedEmployees,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredEmployees,
    itemsPerPage: 10,
    resetTriggers: [searchTerm]
  });

  // Calculate statistics
  const totalEmployees = employeeList.length;
  const activeEmployees = employeeList.filter((e: any) => e.status === 'active').length;
  const inactiveEmployees = employeeList.filter((e: any) => e.status === 'inactive').length;
  const totalSalaries = employeeList.reduce((sum: number, e: any) => sum + parseFloat(e.baseSalary || e.salary || 0), 0);

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof employeeSchema>) => {
      return apiRequest('POST', `/api/branches/${branchId}/employees`, {
        ...data,
        baseSalary: parseFloat(data.baseSalary),
        salary: parseFloat(data.baseSalary)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
      success('تم إضافة الموظف بنجاح');
      form.reset();
      setShowForm(false);
      setEditingId(null);
    },
    onError: () => {
      error('فشل في إضافة الموظف');
    },
  });

  // Update employee - نسخة محسنة جديدة
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof employeeSchema> }) => {
      console.log('بدء تحديث الموظف:', id, data);
      
      const response = await fetch(`/api/branches/${branchId}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          baseSalary: parseFloat(data.baseSalary),
          salary: parseFloat(data.baseSalary)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في التحديث');
      }
      
      const result = await response.json();
      console.log('نتيجة التحديث:', result);
      return result;
    },
    onSuccess: async () => {
      console.log('تم التحديث بنجاح، تحديث البيانات...');
      
      // إعادة تحميل البيانات فوراً
      await queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
      await queryClient.refetchQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
      
      success('تم تحديث بيانات الموظف بنجاح ✅');
      form.reset();
      setShowForm(false);
      setEditingId(null);
    },
    onError: (err: any) => {
      console.error('خطأ في التحديث:', err);
      error('فشل في تحديث الموظف ❌');
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/branches/${branchId}/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
      success('تم حذف الموظف بنجاح');
    },
    onError: () => {
      error('فشل في حذف الموظف');
    },
  });

  // Handlers
  const handleView = (employee: any) => {
    setViewingEmployee(employee);
    setShowViewDialog(true);
  };

  const handleEdit = (employee: any) => {
    console.log('Editing employee:', employee);
    setEditingId(employee.id);
    
    // Format hire date for input
    let formattedHireDate = '';
    if (employee.hireDate) {
      const date = new Date(employee.hireDate);
      formattedHireDate = date.toISOString().split('T')[0];
    }
    
    // Populate form with employee data
    const formData = {
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      baseSalary: String(employee.baseSalary || employee.salary || ''),
      hireDate: formattedHireDate,
      address: employee.address || '',
      nationalId: employee.nationalId || '',
      status: employee.status || 'active'
    };
    
    console.log('Form data:', formData);
    form.reset(formData);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      baseSalary: '',
      hireDate: '',
      address: '',
      nationalId: '',
      status: 'active'
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  // Form submission
  const onSubmit = (data: z.infer<typeof employeeSchema>) => {
    console.log('📝 إرسال النموذج:', { editingId, data });
    
    if (editingId) {
      console.log('🔄 وضع التحديث - تحديث الموظف رقم:', editingId);
      updateEmployeeMutation.mutate({ id: editingId, data });
    } else {
      console.log('➕ وضع الإضافة - إضافة موظف جديد');
      addEmployeeMutation.mutate(data);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'نشط', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'غير نشط', className: 'bg-red-100 text-red-800' },
      on_leave: { label: 'في إجازة', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return (
      <Badge variant="secondary" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الموظفين - الفرع 117</h1>
          <p className="text-gray-600 mt-2">إدارة شاملة لبيانات الموظفين والرواتب</p>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          إضافة موظف جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون النشطون</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون غير النشطين</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف غير نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalaries)}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الموظفين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">المنصب</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الراتب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  paginatedEmployees.map((employee: any) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(employee.baseSalary || employee.salary || 0))}</TableCell>
                      <TableCell>
                        {getStatusBadge(employee.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(employee)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                            title="معاينة الموظف"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200 hover:border-green-300"
                            title="تعديل الموظف"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد موظفين مسجلين'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredEmployees.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemName="موظف"
            />
          )}
        </CardContent>
      </Card>

      {/* Professional View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              تفاصيل الموظف
            </DialogTitle>
            <DialogDescription>
              معاينة شاملة لجميع بيانات الموظف ومعلوماته - الفرع 117
            </DialogDescription>
          </DialogHeader>
          
          {viewingEmployee && (
            <div className="grid gap-6 py-4">
              {/* Employee Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {viewingEmployee.name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{viewingEmployee.name}</h3>
                  <p className="text-blue-600 font-medium">{viewingEmployee.position}</p>
                  <p className="text-gray-600 text-sm">{viewingEmployee.department}</p>
                </div>
                <div className="text-left">
                  {getStatusBadge(viewingEmployee.status)}
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الهاتف</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.email || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الهوية</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.nationalId || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">العنوان</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.address || 'غير محدد'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      معلومات العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">المنصب</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.position || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">القسم</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.department || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">الرصيد الافتتاحي</p>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(parseFloat(viewingEmployee.baseSalary || viewingEmployee.salary || 0))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">تاريخ التوظيف</p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString('en-GB') : 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="px-6"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEdit(viewingEmployee);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل الموظف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {editingId ? 'تعديل الموظف' : 'إضافة موظف جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? `تحديث بيانات الموظف رقم ${editingId}` : 'إضافة موظف جديد إلى النظام'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل *</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم الموظف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input placeholder="employee@company.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف *</FormLabel>
                      <FormControl>
                        <Input placeholder="0501234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنصب *</FormLabel>
                      <FormControl>
                        <Input placeholder="مدير المبيعات" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القسم *</FormLabel>
                      <FormControl>
                        <Input placeholder="المبيعات" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Base Salary */}
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرصيد الافتتاحي *</FormLabel>
                      <FormControl>
                        <Input placeholder="5000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hire Date */}
                <FormField
                  control={form.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ التوظيف</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="on_leave">في إجازة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* National ID */}
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهوية</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input placeholder="الرياض، حي النخيل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="px-6"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={addEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {addEmployeeMutation.isPending || updateEmployeeMutation.isPending ? (
                    'جاري الحفظ...'
                  ) : editingId ? (
                    'تحديث الموظف'
                  ) : (
                    'إضافة الموظف'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}