import React from 'react';
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
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  overtime: z.string().optional().default('0'),
  bonuses: z.string().optional().default('0'),
  totalDeductions: z.string().optional().default('0'),
  netSalary: z.string().optional(),
  status: z.string().default('pending'),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});

type SalaryForm = z.infer<typeof salaryFormSchema>;

interface SimpleSalaryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSalary?: any;
  onSuccess?: () => void;
}

export default function SimpleSalaryForm({ 
  open, 
  onOpenChange, 
  editingSalary, 
  onSuccess 
}: SimpleSalaryFormProps) {
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
      month: editingSalary?.month || new Date().getMonth() + 1,
      year: editingSalary?.year || new Date().getFullYear(),
      overtime: editingSalary?.overtime || '0',
      bonuses: editingSalary?.bonuses || '0',
      totalDeductions: editingSalary?.totalDeductions || '0',
      netSalary: editingSalary?.netSalary || '',
      status: editingSalary?.status || 'pending',
      paidDate: editingSalary?.paidDate ? new Date(editingSalary.paidDate).toISOString().split('T')[0] : '',
      notes: editingSalary?.notes || '',
    },
  });

  // Watch values for automatic calculation
  const baseSalary = form.watch('baseSalary');
  const overtime = form.watch('overtime');
  const bonuses = form.watch('bonuses');
  const totalDeductions = form.watch('totalDeductions');

  // Auto-calculate net salary
  const calculateNetSalary = () => {
    const base = parseFloat(baseSalary) || 0;
    const over = parseFloat(overtime || '0');
    const bonus = parseFloat(bonuses || '0');
    const deductions = parseFloat(totalDeductions || '0');
    const net = base + over + bonus - deductions;
    form.setValue('netSalary', net.toString());
  };

  // Calculate whenever values change
  React.useEffect(() => {
    calculateNetSalary();
  }, [baseSalary, overtime, bonuses, totalDeductions]);

  const createSalaryMutation = useMutation({
    mutationFn: (data: SalaryForm) => {
      console.log('Form submission data:', data);
      return apiRequest({
        url: '/api/salaries',
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
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
        description: "فشل في حفظ الراتب",
        variant: "destructive",
      });
    },
  });

  const updateSalaryMutation = useMutation({
    mutationFn: (data: SalaryForm) => 
      apiRequest({
        url: `/api/salaries/${editingSalary.id}`,
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      onOpenChange(false);
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث الراتب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الراتب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalaryForm) => {
    if (editingSalary) {
      updateSalaryMutation.mutate(data);
    } else {
      createSalaryMutation.mutate(data);
    }
  };

  const months = [
    { value: 1, label: 'يناير' }, { value: 2, label: 'فبراير' }, { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' }, { value: 5, label: 'مايو' }, { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' }, { value: 8, label: 'أغسطس' }, { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' }, { value: 11, label: 'نوفمبر' }, { value: 12, label: 'ديسمبر' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {editingSalary ? 'تعديل راتب' : 'إضافة راتب جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر موظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee: any) => (
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

              {/* Period */}
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشهر *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="الشهر" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
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
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السنة *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="2020" 
                          max="2030"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

              <FormField
                control={form.control}
                name="bonuses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>علاوات (ر.س)</FormLabel>
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
                name="totalDeductions"
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

            {/* Net Salary Display */}
            <div className="bg-green-50 p-4 rounded-lg">
              <FormField
                control={form.control}
                name="netSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-green-800">
                      صافي الراتب (ر.س)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        readOnly
                        className="text-xl font-bold text-green-900 bg-green-100"
                        placeholder="2000.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
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
                      <SelectItem value="paid">تم الدفع</SelectItem>
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="ملاحظات حول الراتب..." 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createSalaryMutation.isPending || updateSalaryMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 ml-2" />
                {editingSalary ? 'تحديث الراتب' : 'حفظ الراتب'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}