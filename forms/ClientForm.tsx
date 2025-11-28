import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { insertClientSchema, type InsertClient, type Client } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck } from 'lucide-react';
import { useEffect } from 'react';

interface ClientFormProps {
  clientId?: number | null;
}

export default function ClientForm({ clientId }: ClientFormProps) {
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  // Fetch client data if editing
  const { data: clientData, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: ['/api/clients', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      return response.json();
    },
    enabled: !!clientId
  });

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      group: '',
      openingBalance: 0,
      creditLimit: 0,
      accountType: 'cash',
      status: 'active'
    }
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (clientData) {
      form.reset({
        name: clientData.name || '',
        phone: clientData.phone || '',
        email: clientData.email || '',
        address: clientData.address || '',
        group: clientData.group || '',
        openingBalance: clientData.openingBalance || 0,
        creditLimit: clientData.creditLimit || 0,
        accountType: clientData.accountType || 'cash',
        status: clientData.status || 'active'
      });
    }
  }, [clientData, form]);

  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: async (newClient) => {
      // إزالة البيانات القديمة من cache وإعادة التحميل
      queryClient.removeQueries({ queryKey: ['/api/clients'] });
      await queryClient.fetchQuery({ queryKey: ['/api/clients'] });
      success('تم إضافة العميل بنجاح');
      form.reset();
      
      // إعادة تحميل الصفحة بعد ثانية واحدة لضمان ظهور البيانات
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: () => {
      error('حدث خطأ أثناء إضافة العميل');
    }
  });

  const onSubmit = (data: InsertClient) => {
    createClientMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">إضافة عميل جديد</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العميل</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم العميل" {...field} />
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
                  <Input placeholder="05xxxxxxxx" {...field} />
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
                  <Input type="email" placeholder="البريد الإلكتروني" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مجموعة العميل</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مجموعة العميل" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vip">عملاء مميزون</SelectItem>
                    <SelectItem value="regular">عملاء عاديون</SelectItem>
                    <SelectItem value="wholesale">عملاء جملة</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input placeholder="عنوان العميل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرصيد الافتتاحي (ريال)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الحساب</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 lg:col-span-3">
            <Button 
              type="submit" 
              disabled={createClientMutation.isPending}
              className="btn-accounting-primary w-full"
            >
              <UserCheck className="ml-2 h-4 w-4" />
              {createClientMutation.isPending ? 'جاري الإضافة...' : 'إضافة عميل'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
