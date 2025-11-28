import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, Edit, Trash2, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Salary, Employee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema للراتب الجديد
const salarySchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  baseSalary: z.string().min(1, 'مبلغ الراتب مطلوب'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  overtime: z.string().default('0'),
  bonuses: z.string().default('0'),
  totalDeductions: z.string().default('0'),
  netSalary: z.string().optional(),
  status: z.string().default('pending'),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});

interface BranchSalariesProps {
  branchId: number;
}

export default function BranchSalaries({ branchId }: BranchSalariesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: salaries = [], isLoading } = useQuery<Salary[]>({
    queryKey: [`/api/branches/${branchId}/salaries`],
    refetchInterval: 5000, // تحديث كل 5 ثوان
    refetchOnWindowFocus: true, // تحديث عند العودة للصفحة
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: [`/api/branches/${branchId}/employees`],
    refetchInterval: 5000, // تحديث كل 5 ثوان
    refetchOnWindowFocus: true, // تحديث عند العودة للصفحة
  });

  const deleteSalaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/branches/${branchId}/salaries/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/salaries`] });
      toast({
        title: "نجح",
        description: "تم حذف الراتب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الراتب",
        variant: "destructive",
      });
    },
  });

  // Professional Edit Handler - معالج تعديل احترافي
  const handleProfessionalEdit = (salary: any) => {
    console.log('🔧 فتح تعديل راتب احترافي:', salary);
    
    // تعبئة النموذج بالبيانات الحالية
    form.reset({
      employeeId: salary.employeeId,
      baseSalary: salary.baseSalary || salary.netSalary,
      month: salary.month,
      year: salary.year,
      overtime: salary.overtime?.toString() || '0',
      bonuses: salary.bonuses?.toString() || '0',
      totalDeductions: salary.totalDeductions?.toString() || '0',
      status: salary.status || 'pending',
      paidDate: salary.paidDate ? new Date(salary.paidDate).toISOString().split('T')[0] : '',
      notes: salary.notes || ''
    });
    
    setEditingSalary(salary);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الراتب؟')) {
      deleteSalaryMutation.mutate(id);
    }
  };

  // Form setup للراتب الجديد
  const form = useForm<z.infer<typeof salarySchema>>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employeeId: 0,
      baseSalary: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      overtime: '0',
      bonuses: '0',
      totalDeductions: '0',
      status: 'pending',
      paidDate: '',
      notes: ''
    }
  });

  // Add salary mutation - نسخة محسنة جديدة
  const addSalaryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof salarySchema>) => {
      console.log('💰 إضافة راتب جديد:', data);
      
      const baseSalary = parseFloat(data.baseSalary);
      const overtime = parseFloat(data.overtime || '0');
      const bonuses = parseFloat(data.bonuses || '0');
      const totalDeductions = parseFloat(data.totalDeductions || '0');
      const netSalary = baseSalary + overtime + bonuses - totalDeductions;
      
      const response = await fetch(`/api/branches/${branchId}/salaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: data.employeeId,
          baseSalary: baseSalary.toString(),
          month: data.month,
          year: data.year,
          overtime: overtime.toString(),
          bonuses: bonuses.toString(),
          totalDeductions: totalDeductions.toString(),
          netSalary: netSalary.toString(),
          status: data.status,
          paidDate: data.paidDate || null,
          notes: data.notes || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إضافة الراتب');
      }
      
      return await response.json();
    },
    onSuccess: async () => {
      console.log('✅ تم إضافة الراتب بنجاح');
      
      await queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/salaries`] });
      await queryClient.refetchQueries({ queryKey: [`/api/branches/${branchId}/salaries`] });
      
      toast({
        title: "تم بنجاح ✅",
        description: "تم إضافة الراتب بنجاح",
      });
      
      form.reset();
      setShowForm(false);
    },
    onError: (err: any) => {
      console.error('❌ خطأ في إضافة الراتب:', err);
      toast({
        title: "خطأ ❌",
        description: err.message || 'فشل في إضافة الراتب',
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setEditingSalary(null);
    setShowForm(false);
  };

  const handleAddSalary = () => {
    setEditingSalary(null);
    form.reset({
      employeeId: 0,
      baseSalary: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      overtime: '0',
      bonuses: '0', 
      totalDeductions: '0',
      status: 'pending',
      paidDate: '',
      notes: ''
    });
    setShowForm(true);
  };

  // Update salary mutation - نسخة جديدة
  const updateSalaryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof salarySchema> }) => {
      console.log('🔄 تحديث راتب:', { id, data });
      
      const baseSalary = parseFloat(data.baseSalary);
      const overtime = parseFloat(data.overtime || '0');
      const bonuses = parseFloat(data.bonuses || '0');
      const totalDeductions = parseFloat(data.totalDeductions || '0');
      const netSalary = baseSalary + overtime + bonuses - totalDeductions;
      
      const response = await fetch(`/api/branches/${branchId}/salaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: data.employeeId,
          baseSalary: baseSalary.toString(),
          month: data.month,
          year: data.year,
          overtime: overtime.toString(),
          bonuses: bonuses.toString(),
          totalDeductions: totalDeductions.toString(),
          netSalary: netSalary.toString(),
          status: data.status,
          paidDate: data.paidDate || null,
          notes: data.notes || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحديث الراتب');
      }
      
      return await response.json();
    },
    onSuccess: async () => {
      console.log('✅ تم تحديث الراتب بنجاح');
      
      await queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/salaries`] });
      await queryClient.refetchQueries({ queryKey: [`/api/branches/${branchId}/salaries`] });
      
      toast({
        title: "تم التحديث ✅",
        description: "تم تحديث الراتب بنجاح",
      });
      
      form.reset();
      setEditingSalary(null);
      setShowForm(false);
    },
    onError: (err: any) => {
      console.error('❌ خطأ في تحديث الراتب:', err);
      toast({
        title: "خطأ ❌",
        description: err.message || 'فشل في تحديث الراتب',
        variant: "destructive",
      });
    },
  });

  // Form submission محسن
  const onSubmit = (data: z.infer<typeof salarySchema>) => {
    console.log('📋 إرسال نموذج الراتب:', data);
    if (editingSalary) {
      console.log('🚀 تحديث الراتب:', editingSalary.id);
      updateSalaryMutation.mutate({ id: editingSalary.id, data });
    } else {
      console.log('➕ إضافة راتب جديد');
      addSalaryMutation.mutate(data);
    }
  };

  const filteredSalaries = salaries.filter((salary: Salary) => {
    const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
    const matchesSearch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || salary.status === selectedStatus;
    const matchesMonth = selectedMonth === "all" || salary.month.toString() === selectedMonth;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalSalaries = filteredSalaries.reduce((sum, salary) => sum + parseFloat(salary.netSalary || salary.baseSalary), 0);
  const paidSalaries = filteredSalaries.filter(s => s.status === 'paid').length;
  const pendingSalaries = filteredSalaries.filter(s => s.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return monthNames[month - 1] || month.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الرواتب - الفرع {branchId}</h1>
        <Button 
          onClick={handleAddSalary}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={addSalaryMutation.isPending}
        >
          <Plus className="h-4 w-4 ml-2" />
          {addSalaryMutation.isPending ? 'جاري الإضافة...' : 'إضافة راتب جديد'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSalaries.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الرواتب المدفوعة</p>
                <p className="text-2xl font-bold text-green-600">{paidSalaries}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الرواتب المعلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingSalaries}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-gray-600">{filteredSalaries.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">البحث</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن موظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الحالة</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الشهر</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشهور</SelectItem>
                  <SelectItem value="01">يناير</SelectItem>
                  <SelectItem value="02">فبراير</SelectItem>
                  <SelectItem value="03">مارس</SelectItem>
                  <SelectItem value="04">أبريل</SelectItem>
                  <SelectItem value="05">مايو</SelectItem>
                  <SelectItem value="06">يونيو</SelectItem>
                  <SelectItem value="07">يوليو</SelectItem>
                  <SelectItem value="08">أغسطس</SelectItem>
                  <SelectItem value="09">سبتمبر</SelectItem>
                  <SelectItem value="10">أكتوبر</SelectItem>
                  <SelectItem value="11">نوفمبر</SelectItem>
                  <SelectItem value="12">ديسمبر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الرواتب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-4">الموظف</th>
                  <th className="text-right py-2 px-4">المبلغ</th>
                  <th className="text-right py-2 px-4">الشهر</th>
                  <th className="text-right py-2 px-4">الحالة</th>
                  <th className="text-right py-2 px-4">تاريخ الدفع</th>
                  <th className="text-right py-2 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map((salary) => {
                  const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
                  return (
                    <tr key={salary.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{employee?.name || 'موظف غير محدد'}</td>
                      <td className="py-2 px-4 font-semibold text-blue-600">
                        {parseFloat(salary.netSalary || salary.baseSalary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-2 px-4">{getMonthName(salary.month)}</td>
                      <td className="py-2 px-4">{getStatusBadge(salary.status)}</td>
                      <td className="py-2 px-4" dir="ltr">
                        {salary.paidDate 
                          ? new Date(salary.paidDate).toLocaleDateString('en-GB')
                          : new Date(salary.createdAt).toLocaleDateString('en-GB')
                        }
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProfessionalEdit(salary)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 transition-all duration-200"
                            title="تعديل الراتب"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(salary.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-all duration-200"
                            title="حذف الراتب"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredSalaries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد رواتب مطابقة للفلترة المحددة
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Professional Salary Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="h-5 w-5 text-green-600" />
              {editingSalary ? 'تعديل الراتب' : 'إضافة راتب جديد'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Selection */}
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموظف *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الموظف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Basic Salary */}
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الراتب الأساسي *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Month */}
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشهر *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الشهر" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">يناير</SelectItem>
                          <SelectItem value="2">فبراير</SelectItem>
                          <SelectItem value="3">مارس</SelectItem>
                          <SelectItem value="4">أبريل</SelectItem>
                          <SelectItem value="5">مايو</SelectItem>
                          <SelectItem value="6">يونيو</SelectItem>
                          <SelectItem value="7">يوليو</SelectItem>
                          <SelectItem value="8">أغسطس</SelectItem>
                          <SelectItem value="9">سبتمبر</SelectItem>
                          <SelectItem value="10">أكتوبر</SelectItem>
                          <SelectItem value="11">نوفمبر</SelectItem>
                          <SelectItem value="12">ديسمبر</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السنة *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2025" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Overtime */}
                <FormField
                  control={form.control}
                  name="overtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العمل الإضافي</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bonuses */}
                <FormField
                  control={form.control}
                  name="bonuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البونص والحوافز</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deductions */}
                <FormField
                  control={form.control}
                  name="totalDeductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الخصومات</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
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
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Date */}
                <FormField
                  control={form.control}
                  name="paidDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الدفع</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ملاحظات حول الراتب..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={addSalaryMutation.isPending || updateSalaryMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {(addSalaryMutation.isPending || updateSalaryMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingSalary ? 'جاري التحديث...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {editingSalary ? 'تحديث الراتب' : 'إضافة الراتب'}
                    </>
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