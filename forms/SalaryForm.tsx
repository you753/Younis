import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, DollarSign } from 'lucide-react';

// Schema for form validation
const salaryFormSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  baseSalary: z.string().min(1, 'مبلغ الراتب مطلوب'),
  month: z.string().min(1, 'الشهر مطلوب'),
  year: z.string().min(1, 'السنة مطلوبة'),
  overtime: z.string().optional(),
  bonuses: z.string().optional(),
  totalDeductions: z.string().optional(),
  netSalary: z.string().optional(),
  status: z.string().default('pending'),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});

type SalaryForm = z.infer<typeof salaryFormSchema>;

interface SalaryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSalary?: any;
  onSuccess?: () => void;
}

export default function SalaryFormComponent({ 
  open, 
  onOpenChange, 
  editingSalary, 
  onSuccess 
}: SalaryFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm<SalaryForm>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      employeeId: editingSalary?.employeeId || 0,
      baseSalary: editingSalary?.baseSalary || '',
      month: editingSalary?.month?.toString() || (new Date().getMonth() + 1).toString(),
      year: editingSalary?.year || new Date().getFullYear().toString(),
      overtime: editingSalary?.overtime || '0',
      bonuses: editingSalary?.bonuses || '0',
      totalDeductions: editingSalary?.totalDeductions || '0',
      netSalary: editingSalary?.netSalary || '',
      status: editingSalary?.status || 'pending',
      paidDate: editingSalary?.paidDate ? new Date(editingSalary.paidDate).toISOString().split('T')[0] : '',
      notes: editingSalary?.notes || '',
    },
  });

  const createSalaryMutation = useMutation({
    mutationFn: (data: SalaryForm) => {
      // Calculate net salary
      const baseSalary = parseFloat(data.baseSalary) || 0;
      const overtime = parseFloat(data.overtime || '0');
      const bonuses = parseFloat(data.bonuses || '0');
      const totalDeductions = parseFloat(data.totalDeductions || '0');
      const netSalary = baseSalary + overtime + bonuses - totalDeductions;
      
      const salaryData = {
        employeeId: parseInt(data.employeeId.toString()),
        baseSalary: parseFloat(data.baseSalary),
        month: parseInt(data.month),
        year: parseInt(data.year),
        overtime: overtime,
        bonuses: bonuses,
        totalDeductions: totalDeductions,
        netSalary: netSalary,
        status: data.status,
        paidDate: data.paidDate || null,
        notes: data.notes || '',
      };
      
      console.log('إرسال بيانات الراتب:', salaryData);
      
      return apiRequest({
        url: '/api/salaries',
        method: 'POST',
        body: salaryData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.refetchQueries({ queryKey: ['/api/salaries'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة الراتب بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating salary:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الراتب",
        variant: "destructive",
      });
    },
  });

  const updateSalaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SalaryForm> }) => {
      // Calculate net amount
      const amount = parseFloat(data.amount || '0');
      const overtime = parseFloat(data.overtime || '0');
      const bonus = parseFloat(data.bonus || '0');
      const deductions = parseFloat(data.deductions || '0');
      const netAmount = amount + overtime + bonus - deductions;
      
      return apiRequest({
        url: `/api/salaries/${id}`,
        method: 'PUT',
        body: { ...data, netAmount: netAmount.toString() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث الراتب بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating salary:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الراتب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalaryForm) => {
    if (editingSalary) {
      updateSalaryMutation.mutate({ id: editingSalary.id, data });
    } else {
      createSalaryMutation.mutate(data);
    }
  };

  // Calculate net amount on form changes
  const watchedValues = form.watch(['amount', 'overtime', 'bonus', 'deductions']);
  const calculateNetAmount = () => {
    const [amount, overtime, bonus, deductions] = watchedValues;
    const total = (parseFloat(amount) || 0) + (parseFloat(overtime) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);
    return total.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {editingSalary ? 'تعديل الراتب' : 'إضافة راتب جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Employee Selection */}
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
                      {Array.isArray(employees) && employees.map((employee: any) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الشهر *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السنة *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2024" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Salary Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الأساسي (ر.س) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ساعات إضافية (ر.س)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مكافآت (ر.س)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>إجمالي الخصومات (ر.س)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Net Amount Display */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">صافي الراتب:</span>
                <span className="text-xl font-bold text-green-600">
                  {calculateNetAmount()} ر.س
                </span>
              </div>
            </div>

            {/* Status and Payment Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الدفع</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Textarea {...field} placeholder="ملاحظات حول الراتب" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createSalaryMutation.isPending || updateSalaryMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingSalary ? 'تحديث الراتب' : 'حفظ الراتب'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}