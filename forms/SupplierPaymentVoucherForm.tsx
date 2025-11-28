import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarDays, CreditCard, Banknote, Check, FileText } from 'lucide-react';
import type { SupplierPaymentVoucher, Supplier } from '@shared/schema';

const paymentVoucherSchema = z.object({
  supplierId: z.number().min(1, 'يجب اختيار مورد'),
  voucherNumber: z.string().min(1, 'يجب إدخال رقم السند'),
  amount: z.string().min(1, 'يجب إدخال المبلغ'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'credit_card']),
  paymentDate: z.string().min(1, 'يجب تحديد تاريخ الدفع'),
  description: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

type PaymentVoucherForm = z.infer<typeof paymentVoucherSchema>;

interface SupplierPaymentVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: number;
  editingVoucher?: SupplierPaymentVoucher | null;
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'cash': return 'نقدي';
    case 'bank_transfer': return 'تحويل بنكي';
    case 'check': return 'شيك';
    case 'credit_card': return 'بطاقة ائتمان';
    default: return method;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash': return <Banknote className="h-4 w-4" />;
    case 'bank_transfer': return <CreditCard className="h-4 w-4" />;
    case 'check': return <Check className="h-4 w-4" />;
    case 'credit_card': return <CreditCard className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'في الانتظار';
    case 'approved': return 'معتمد';
    case 'paid': return 'مدفوع';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
};

export default function SupplierPaymentVoucherForm({
  isOpen,
  onClose,
  supplierId,
  editingVoucher
}: SupplierPaymentVoucherFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // استعلام للحصول على قائمة الموردين
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  // توليد رقم سند فريد
  const generateVoucherNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SPV-${timestamp}-${random}`;
  };

  const form = useForm<PaymentVoucherForm>({
    resolver: zodResolver(paymentVoucherSchema),
    defaultValues: {
      supplierId: supplierId || editingVoucher?.supplierId || 0,
      voucherNumber: editingVoucher?.voucherNumber || generateVoucherNumber(),
      amount: editingVoucher?.amount || '',
      paymentMethod: editingVoucher?.paymentMethod as any || 'cash',
      paymentDate: editingVoucher?.paymentDate || new Date().toISOString().split('T')[0],
      description: editingVoucher?.description || '',
      reference: editingVoucher?.reference || '',
      status: editingVoucher?.status as any || 'pending',
      notes: editingVoucher?.notes || '',
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PaymentVoucherForm) => {
      const response = await fetch('/api/supplier-payment-vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create payment voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers', 'supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] }); // تحديث قائمة الموردين لتحديث الرصيد
      toast({
        title: "تم إنشاء سند الصرف بنجاح",
        description: "تم خصم المبلغ من رصيد المورد تلقائياً",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating payment voucher:', error);
      toast({
        title: "خطأ في إنشاء سند الصرف",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentVoucherForm) => {
      const response = await fetch(`/api/supplier-payment-vouchers/${editingVoucher!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update payment voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers', 'supplier', supplierId] });
      toast({
        title: "تم تحديث سند الصرف بنجاح",
        description: "تم حفظ التعديلات على سند الصرف",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Error updating payment voucher:', error);
      toast({
        title: "خطأ في تحديث سند الصرف",
        description: "حدث خطأ أثناء حفظ التعديلات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentVoucherForm) => {
    if (editingVoucher) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingVoucher ? 'تعديل سند صرف' : 'إضافة سند صرف جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر المورد</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
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
                name="voucherNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم السند</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="أدخل رقم السند" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(generateVoucherNumber())}
                      >
                        توليد رقم جديد
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
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

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            نقدي
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            تحويل بنكي
                          </div>
                        </SelectItem>
                        <SelectItem value="check">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            شيك
                          </div>
                        </SelectItem>
                        <SelectItem value="credit_card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            بطاقة ائتمان
                          </div>
                        </SelectItem>
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

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المرجع</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الشيك أو المرجع البنكي" {...field} />
                    </FormControl>
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
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="approved">معتمد</SelectItem>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="وصف سند الصرف"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
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
                    <Textarea 
                      placeholder="ملاحظات إضافية"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-accounting-primary"
              >
                {editingVoucher ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}