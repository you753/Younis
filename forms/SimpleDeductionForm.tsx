import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Minus } from 'lucide-react';
import { insertDeductionSchema, type InsertDeduction } from '@shared/schema';

interface SimpleDeductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDeduction?: any;
  onSuccess?: () => void;
}

export default function SimpleDeductionForm({ 
  open, 
  onOpenChange, 
  editingDeduction, 
  onSuccess 
}: SimpleDeductionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm<InsertDeduction>({
    resolver: zodResolver(insertDeductionSchema),
    defaultValues: {
      employeeId: editingDeduction?.employeeId || 0,
      type: editingDeduction?.type || '',
      amount: editingDeduction?.amount || '0',
      description: editingDeduction?.description || '',
      date: editingDeduction?.date ? new Date(editingDeduction.date) : new Date(),
      recurring: editingDeduction?.recurring || false,
    },
  });

  const createDeductionMutation = useMutation({
    mutationFn: (data: InsertDeduction) => apiRequest({
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
        title: "تم إنشاء الخصم بنجاح",
        description: "تم إضافة الخصم الجديد إلى النظام",
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
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertDeduction> }) => 
      apiRequest({
        url: `/api/deductions/${id}`,
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "تم تحديث الخصم بنجاح",
        description: "تم حفظ التغييرات على بيانات الخصم",
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

  const onSubmit = (data: InsertDeduction) => {
    // التأكد من أن التاريخ في الشكل الصحيح
    const submissionData = {
      ...data,
      date: data.date, // إبقاء التاريخ كما هو
    };

    if (editingDeduction) {
      updateDeductionMutation.mutate({ id: editingDeduction.id, data: submissionData });
    } else {
      createDeductionMutation.mutate(submissionData);
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
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
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
                  <FormLabel>وصف الخصم</FormLabel>
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
              name="recurring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>خصم متكرر</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
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