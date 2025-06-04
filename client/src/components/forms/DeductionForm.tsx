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
import { Save, Minus } from 'lucide-react';

// Schema for form validation
const deductionFormSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  type: z.string().min(1, 'نوع الخصم مطلوب'),
  amount: z.string().min(1, 'مبلغ الخصم مطلوب'),
  description: z.string().min(1, 'وصف الخصم مطلوب'),
  date: z.string().min(1, 'تاريخ الخصم مطلوب'),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
});

type DeductionForm = z.infer<typeof deductionFormSchema>;

interface DeductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDeduction?: any;
  onSuccess?: () => void;
}

export default function DeductionFormComponent({ 
  open, 
  onOpenChange, 
  editingDeduction, 
  onSuccess 
}: DeductionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm<DeductionForm>({
    resolver: zodResolver(deductionFormSchema),
    defaultValues: {
      employeeId: editingDeduction?.employeeId || 0,
      type: editingDeduction?.type || '',
      amount: editingDeduction?.amount || '',
      description: editingDeduction?.description || '',
      date: editingDeduction?.date ? new Date(editingDeduction.date).toISOString().split('T')[0] : '',
      isRecurring: editingDeduction?.isRecurring || false,
      notes: editingDeduction?.notes || '',
    },
  });

  const createDeductionMutation = useMutation({
    mutationFn: (data: DeductionForm) => apiRequest({
      url: '/api/deductions',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم إضافة الخصم بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating deduction:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الخصم",
        variant: "destructive",
      });
    },
  });

  const updateDeductionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeductionForm> }) => 
      apiRequest({
        url: `/api/deductions/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "نجح",
        description: "تم تحديث الخصم بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating deduction:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الخصم",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeductionForm) => {
    if (editingDeduction) {
      updateDeductionMutation.mutate({ id: editingDeduction.id, data });
    } else {
      createDeductionMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5" />
            {editingDeduction ? 'تعديل الخصم' : 'إضافة خصم جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Employee and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormLabel>نوع الخصم *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الخصم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="insurance">تأمين</SelectItem>
                        <SelectItem value="tax">ضريبة</SelectItem>
                        <SelectItem value="loan">قرض</SelectItem>
                        <SelectItem value="advance">سلفة</SelectItem>
                        <SelectItem value="penalty">غرامة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ الخصم (ر.س) *</FormLabel>
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
                name="date"
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الخصم *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="وصف مفصل للخصم" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Option */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>خصم متكرر</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="هل هذا خصم متكرر؟" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">لا - خصم لمرة واحدة</SelectItem>
                      <SelectItem value="true">نعم - خصم شهري متكرر</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="ملاحظات حول الخصم" />
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
                disabled={createDeductionMutation.isPending || updateDeductionMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingDeduction ? 'تحديث الخصم' : 'حفظ الخصم'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}