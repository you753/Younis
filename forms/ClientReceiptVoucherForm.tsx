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
import type { ClientReceiptVoucher, Client } from '@shared/schema';

const receiptVoucherSchema = z.object({
  clientId: z.number().min(1, 'يجب اختيار عميل'),
  voucherNumber: z.string().min(1, 'يجب إدخال رقم السند'),
  amount: z.string().min(1, 'يجب إدخال المبلغ'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'credit_card']),
  receiptDate: z.string().min(1, 'يجب تحديد تاريخ الاستلام'),
  description: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(['pending', 'approved', 'received', 'cancelled']),
  notes: z.string().optional(),
});

type ReceiptVoucherForm = z.infer<typeof receiptVoucherSchema>;

interface ClientReceiptVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  editingVoucher?: ClientReceiptVoucher | null;
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
    case 'received': return 'تم الاستلام';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
};

export function ClientReceiptVoucherForm({ isOpen, onClose, clientId, editingVoucher }: ClientReceiptVoucherFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  // توليد رقم سند فريد
  const generateVoucherNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CRV-${timestamp}-${random}`;
  };

  const form = useForm<ReceiptVoucherForm>({
    resolver: zodResolver(receiptVoucherSchema),
    defaultValues: {
      clientId: clientId || editingVoucher?.clientId || 0,
      voucherNumber: editingVoucher?.voucherNumber || generateVoucherNumber(),
      amount: editingVoucher?.amount || '',
      paymentMethod: editingVoucher?.paymentMethod as any || 'cash',
      receiptDate: editingVoucher?.receiptDate || new Date().toISOString().split('T')[0],
      description: editingVoucher?.description || '',
      reference: editingVoucher?.reference || '',
      status: editingVoucher?.status as any || 'pending',
      notes: editingVoucher?.notes || '',
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReceiptVoucherForm) => {
      const response = await fetch('/api/client-receipt-vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create receipt voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers', 'client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] }); // تحديث قائمة العملاء لتحديث الرصيد
      toast({
        title: "تم إنشاء سند القبض بنجاح",
        description: "تم خصم المبلغ من دين العميل تلقائياً",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating receipt voucher:', error);
      toast({
        title: "خطأ في إنشاء سند القبض",
        description: "حدث خطأ أثناء إنشاء سند القبض",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ReceiptVoucherForm) => {
      if (!editingVoucher) throw new Error('No voucher to update');
      const response = await fetch(`/api/client-receipt-vouchers/${editingVoucher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update receipt voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers', 'client', clientId] });
      toast({
        title: "تم تحديث سند القبض بنجاح",
        description: "تم حفظ التغييرات على سند القبض",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Error updating receipt voucher:', error);
      toast({
        title: "خطأ في تحديث سند القبض",
        description: "حدث خطأ أثناء تحديث سند القبض",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReceiptVoucherForm) => {
    if (editingVoucher) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedClient = clients.find(c => c.id === form.watch('clientId'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {editingVoucher ? 'تعديل سند القبض' : 'إضافة سند قبض جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العميل</FormLabel>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} - الرصيد: {parseFloat(client.balance || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
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
                        placeholder="أدخل المبلغ" 
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاستلام</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="approved">معتمد</SelectItem>
                        <SelectItem value="received">تم الاستلام</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="رقم الشيك أو التحويل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Input placeholder="وصف قصير للسند" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل أي ملاحظات إضافية..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedClient && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">معلومات العميل</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                    <span className="font-medium mr-2">{selectedClient.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">الرصيد الحالي:</span>
                    <span className="font-medium mr-2">
                      {parseFloat(selectedClient.balance || '0').toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'SAR' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-accounting-primary"
              >
                {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : editingVoucher ? 'تحديث السند' : 'إنشاء السند'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}