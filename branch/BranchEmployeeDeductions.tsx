import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Minus, 
  Plus, 
  Trash2, 
  DollarSign, 
  CreditCard,
  ArrowRightLeft,
  User,
  Calendar,
  FileText,
  TrendingDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const deductionSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  deductionType: z.enum(['smart_deduction', 'salary_deduction', 'debt_deduction'], {
    required_error: 'يجب اختيار نوع الخصم',
  }),
  amount: z.string().min(1, 'المبلغ مطلوب'),
  targetDebtId: z.number().optional(),
  description: z.string().min(1, 'وصف الخصم مطلوب'),
  deductionDate: z.string(),
  notes: z.string().optional(),
});

type DeductionFormData = z.infer<typeof deductionSchema>;

export default function BranchEmployeeDeductions({ branchId }: { branchId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // جلب الموظفين
  const { data: employees = [], isLoading: employeesLoading } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/employees`],
  });

  // جلب الخصومات
  const { data: deductions = [], isLoading: deductionsLoading, refetch } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/deductions`],
  });

  // جلب الديون النشطة
  const { data: debts = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/employee-debts`],
  });

  const form = useForm<DeductionFormData>({
    resolver: zodResolver(deductionSchema),
    defaultValues: {
      deductionDate: format(new Date(), 'yyyy-MM-dd'),
      employeeId: 0,
      deductionType: 'smart_deduction',
      amount: '',
      description: '',
      notes: '',
    },
  });

  const selectedDeductionType = form.watch('deductionType');
  const selectedEmployeeId = form.watch('employeeId');

  // حساب الديون النشطة للموظف المحدد
  const employeeDebts = debts.filter((debt: any) => 
    debt.debtorId === selectedEmployeeId && 
    debt.status === 'active' &&
    parseFloat(debt.remainingAmount || debt.amount || '0') > 0
  );

  // إضافة خصم
  const createMutation = useMutation({
    mutationFn: async (data: DeductionFormData) => {
      const response = await fetch(`/api/branches/${branchId}/deductions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create deduction');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الخصم بنجاح ✅",
        description: "تم تسجيل الخصم في النظام",
      });
      setIsDialogOpen(false);
      form.reset();
      refetch();
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الخصم",
        description: error.message || "حدث خطأ أثناء إضافة الخصم",
        variant: "destructive",
      });
    },
  });

  // حذف خصم
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/branches/${branchId}/deductions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete deduction');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الخصم بنجاح",
        description: "تم إلغاء الخصم من النظام",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الخصم",
        description: error.message || "حدث خطأ أثناء حذف الخصم",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeductionFormData) => {
    createMutation.mutate(data);
  };

  // تصفية الخصومات حسب البحث
  const filteredDeductions = deductions.filter((deduction: any) => {
    const employee = employees.find((e: any) => e.id === deduction.employeeId);
    const employeeName = employee?.name || '';
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           deduction.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // دالة لعرض نوع الخصم
  const getDeductionTypeLabel = (type: string) => {
    switch (type) {
      case 'smart_deduction':
        return '⚡ خصم ذكي';
      case 'salary_deduction':
        return '💵 خصم من الراتب';
      case 'debt_deduction':
        return '💳 خصم من الدين';
      case 'salary_to_debt':
        return '🔄 تحويل إلى دين';
      default:
        return type;
    }
  };

  // دالة لعرض أيقونة نوع الخصم
  const getDeductionTypeIcon = (type: string) => {
    switch (type) {
      case 'salary_deduction':
        return <DollarSign className="h-4 w-4" />;
      case 'debt_deduction':
        return <CreditCard className="h-4 w-4" />;
      case 'salary_to_debt':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  // دالة لعرض لون نوع الخصم
  const getDeductionTypeColor = (type: string) => {
    switch (type) {
      case 'smart_deduction':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'salary_deduction':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'debt_deduction':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'salary_to_debt':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // حساب الإحصائيات
  const stats = {
    totalDeductions: deductions.length,
    totalAmount: deductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount || '0'), 0),
    salaryDeductions: deductions.filter((d: any) => d.deductionType === 'salary_deduction').length,
    debtDeductions: deductions.filter((d: any) => d.deductionType === 'debt_deduction').length,
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
              <Minus className="h-8 w-8 text-white" />
            </div>
            خصومات الموظفين
          </h1>
          <p className="text-gray-600 mt-2">إدارة خصومات الموظفين من الرواتب والديون</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
              <Plus className="ml-2 h-5 w-5" />
              إضافة خصم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl">إضافة خصم جديد</DialogTitle>
              <DialogDescription>
                اختر نوع الخصم وأدخل التفاصيل المطلوبة
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* اختيار الموظف */}
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموظف *</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الموظف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              لا يوجد موظفون في هذا الفرع
                            </div>
                          ) : (
                            employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} - {employee.position || 'موظف'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* نوع الخصم */}
                <FormField
                  control={form.control}
                  name="deductionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الخصم *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الخصم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="smart_deduction">
                            <div className="flex items-center gap-2">
                              ⚡ خصم ذكي (من الدين أولاً ثم الراتب)
                            </div>
                          </SelectItem>
                          <SelectItem value="salary_deduction">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              خصم من الراتب فقط
                            </div>
                          </SelectItem>
                          <SelectItem value="debt_deduction">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-green-600" />
                              خصم من الدين فقط
                            </div>
                          </SelectItem>
                          <SelectItem value="salary_to_debt">
                            <div className="flex items-center gap-2">
                              <ArrowRightLeft className="h-4 w-4 text-orange-600" />
                              تحويل من الراتب إلى الدين
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* إذا كان النوع debt_deduction، اعرض قائمة الديون */}
                {selectedDeductionType === 'debt_deduction' && (
                  <FormField
                    control={form.control}
                    name="targetDebtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدين المستهدف *</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الدين" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employeeDebts.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                لا توجد ديون نشطة لهذا الموظف
                              </div>
                            ) : (
                              employeeDebts.map((debt: any) => {
                                const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                                return (
                                  <SelectItem key={debt.id} value={debt.id.toString()}>
                                    {debt.description || debt.type || 'دين'} - متبقي: {remaining.toLocaleString('en-US')} ر.س
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* المبلغ */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ (ريال) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* تاريخ الخصم */}
                  <FormField
                    control={form.control}
                    name="deductionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الخصم *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* الوصف */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف الخصم *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: خصم غياب، خصم تأخير، سداد دين..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ملاحظات */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أي ملاحظات أو تفاصيل إضافية..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخصم'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalDeductions}</p>
                <p className="text-xs text-gray-500">خصم نشط</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبالغ</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalAmount.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-500">ريال</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">خصومات الرواتب</p>
                <p className="text-2xl font-bold text-blue-600">{stats.salaryDeductions}</p>
                <p className="text-xs text-gray-500">خصم</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">خصومات الديون</p>
                <p className="text-2xl font-bold text-green-600">{stats.debtDeductions}</p>
                <p className="text-xs text-gray-500">خصم</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Input
              placeholder="ابحث عن خصم بالموظف أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* قائمة الخصومات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5" />
            قائمة الخصومات ({filteredDeductions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {deductionsLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل الخصومات...</p>
            </div>
          ) : filteredDeductions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <TrendingDown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">لا توجد خصومات</p>
              <p className="text-sm mt-2">قم بإضافة خصم جديد من الزر أعلاه</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDeductions.map((deduction: any) => {
                const employee = employees.find((e: any) => e.id === deduction.employeeId);
                const employeeName = employee?.name || 'غير معروف';
                const employeePosition = employee?.position || 'موظف';
                
                const debt = deduction.targetDebtId 
                  ? debts.find((d: any) => d.id === deduction.targetDebtId)
                  : null;

                return (
                  <div
                    key={deduction.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* معلومات الموظف */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-lg">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{employeeName}</p>
                            <p className="text-sm text-gray-600">{employeePosition}</p>
                          </div>
                        </div>

                        {/* تفاصيل الخصم */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getDeductionTypeColor(deduction.deductionType)} border`}>
                              <span className="ml-1">{getDeductionTypeIcon(deduction.deductionType)}</span>
                              {getDeductionTypeLabel(deduction.deductionType)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(deduction.deductionDate), 'dd MMMM yyyy', { locale: ar })}
                          </div>
                        </div>

                        {/* الوصف */}
                        <p className="text-gray-700 mb-2">{deduction.description}</p>

                        {/* معلومات الدين إن وجد */}
                        {debt && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                            <p className="text-sm text-orange-800">
                              <span className="font-semibold">الدين المستهدف:</span> {debt.description}
                            </p>
                          </div>
                        )}

                        {/* ملاحظات */}
                        {deduction.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-semibold">ملاحظات:</span> {deduction.notes}
                          </p>
                        )}
                      </div>

                      {/* المبلغ والإجراءات */}
                      <div className="flex flex-col items-end gap-3 mr-4">
                        <div className="text-left">
                          <p className="text-2xl font-bold text-red-600">
                            -{parseFloat(deduction.amount).toLocaleString('en-US')}
                          </p>
                          <p className="text-xs text-gray-500">ريال سعودي</p>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا الخصم؟')) {
                              deleteMutation.mutate(deduction.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
