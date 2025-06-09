import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertSupplierSchema, type InsertSupplier } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Truck } from 'lucide-react';

export default function SupplierForm() {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: '',
      phone: null,
      email: null,
      address: null,
      taxNumber: null,
      creditLimit: null,
      balance: '0'
    }
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const response = await apiRequest('POST', '/api/suppliers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      success('تم إضافة المورد بنجاح');
      form.reset();
    },
    onError: () => {
      error('حدث خطأ أثناء إضافة المورد');
    }
  });

  const onSubmit = (data: InsertSupplier) => {
    createSupplierMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">إضافة مورد جديد</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المورد</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم المورد" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="05xxxxxxxx" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="البريد الإلكتروني" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input placeholder="عنوان المورد" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرقم الضريبي</FormLabel>
                <FormControl>
                  <Input placeholder="الرقم الضريبي" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حد الائتمان</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرصيد الافتتاحي</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={field.value || '0'}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="lg:col-span-3">
            <Button 
              type="submit" 
              disabled={createSupplierMutation.isPending}
              className="btn-accounting-primary"
            >
              <Truck className="ml-2 h-4 w-4" />
              {createSupplierMutation.isPending ? 'جاري الإضافة...' : 'إضافة مورد'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
