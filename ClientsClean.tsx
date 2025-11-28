import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, DollarSign, CreditCard, Edit, Trash2, Search, Building, UserPlus, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Client Types
interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  creditLimit?: string;
  balance?: string;
  group?: string;
  openingBalance?: string;
  currentBalance?: string;
  accountType?: string;
  createdAt: Date;
}

// Form Schema
const clientSchema = z.object({
  name: z.string().min(1, 'اسم العميل مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  address: z.string().optional(),
  group: z.string().optional(),
  openingBalance: z.number().default(0),
  creditLimit: z.number().default(0),
  accountType: z.string().default('cash'),
  status: z.string().default('active')
});

type ClientForm = z.infer<typeof clientSchema>;

// Removed cash client group functionality

function ClientsClean() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showClientForm, setShowClientForm] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('clients');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      group: '',
      openingBalance: 0,
      creditLimit: 0,
      accountType: 'cash',
      status: 'active'
    }
  });

  // Removed cash group form

  // استرجاع بيانات العملاء
  const { data: clients = [], isLoading, refetch } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // إنشاء عميل جديد
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientForm) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة العميل بنجاح",
      });
      setShowClientForm(false);
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive"
      });
    }
  });

  // تعديل عميل
  const updateClientMutation = useMutation({
    mutationFn: async (data: { id: number } & ClientForm) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/clients/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "تم التحديث",
        description: "تم تعديل بيانات العميل بنجاح",
      });
      setEditingClient(null);
      setShowClientForm(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل العميل",
        variant: "destructive"
      });
    }
  });

  // حذف عميل
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await apiRequest('DELETE', `/api/clients/${clientId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive"
      });
    }
  });

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      group: client.group || '',
      openingBalance: parseFloat(client.openingBalance || '0'),
      creditLimit: parseFloat(client.creditLimit || '0'),
      accountType: client.accountType || 'cash',
      status: client.status || 'active'
    });
    setShowClientForm(true);
  };

  const handleDeleteClient = (clientId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const onSubmit = (data: ClientForm) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...data });
    } else {
      createClientMutation.mutate(data);
    }
  };

  // Removed cash group submission

  // فلترة العملاء بناءً على البحث
  const filteredClients = Array.isArray(clients) ? clients.filter((client: Client) => {
    if (!localSearchQuery.trim()) return true;
    
    const searchTerms = localSearchQuery.toLowerCase().trim().split(' ');
    const searchText = `${client.name || ''} ${client.phone || ''} ${client.email || ''} ${client.address || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  // إحصائيات العملاء
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalBalance: clients.reduce((sum, c) => sum + parseFloat(c.currentBalance || c.balance || '0'), 0),
    avgBalance: clients.length > 0 ? clients.reduce((sum, c) => sum + parseFloat(c.currentBalance || c.balance || '0'), 0) / clients.length : 0
  };

  // تعيين عنوان الصفحة
  useEffect(() => {
    setCurrentPage('إدارة العملاء');
  }, [setCurrentPage]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-600 mt-1">إدارة قاعدة بيانات العملاء ومجموعات العملاء النقديين</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="cash-groups">مجموعات العملاء النقديين</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">قائمة العملاء</h2>
              <p className="text-gray-600 mt-1">عرض وإدارة معلومات العملاء</p>
            </div>
            <Button onClick={() => {
              setEditingClient(null);
              form.reset();
              setShowClientForm(true);
            }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </div>

          {/* إحصائيات العملاء */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalClients}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">عملاء نشطين</p>
                <p className="text-2xl font-bold text-green-700">{stats.activeClients}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-orange-700">{stats.totalBalance.toFixed(0)} ر.س</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">متوسط الرصيد</p>
                <p className="text-2xl font-bold text-purple-700">{stats.avgBalance.toFixed(0)} ر.س</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم، الهاتف، البريد الإلكتروني، أو العنوان..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">نوع الحساب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {localSearchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد عملاء'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {parseFloat(client.currentBalance || client.balance || '0').toFixed(2)} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.accountType === 'cash' ? 'default' : 'secondary'}>
                          {client.accountType === 'cash' ? 'نقدي' : 
                           client.accountType === 'credit' ? 'آجل' : 'مختلط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                          {client.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نموذج إضافة/تعديل عميل */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'تعديل العميل' : 'إضافة عميل جديد'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Textarea placeholder="عنوان العميل" {...field} />
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
                        <SelectItem value="VIP">عملاء مميزون</SelectItem>
                        <SelectItem value="Gold">عملاء ذهبيون</SelectItem>
                        <SelectItem value="Regular">عملاء عاديون</SelectItem>
                        <SelectItem value="Wholesale">عملاء جملة</SelectItem>
                      </SelectContent>
                    </Select>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرصيد الافتتاحي</FormLabel>
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
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حد الائتمان</FormLabel>
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
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending || updateClientMutation.isPending}
                  className="flex-1"
                >
                  {(createClientMutation.isPending || updateClientMutation.isPending) ? 
                    'جاري الحفظ...' : 
                    editingClient ? 'تحديث العميل' : 'إضافة عميل'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowClientForm(false);
                    setEditingClient(null);
                    form.reset();
                  }} 
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="cash-groups" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">مجموعات العملاء النقديين</h2>
              <p className="text-gray-600 mt-1">إنشاء وإدارة مجموعات من العملاء النقديين</p>
            </div>
            <Button onClick={() => setShowCashGroupForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مجموعة جديدة
            </Button>
          </div>

          {/* Cash Group Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-800">عملاء VIP</h3>
                  <Badge variant="secondary">3 عملاء</Badge>
                </div>
                <p className="text-purple-600 text-sm mb-4">مجموعة العملاء المميزين</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">عرض</Button>
                  <Button size="sm" variant="outline">تعديل</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">عملاء الجملة</h3>
                  <Badge variant="secondary">5 عملاء</Badge>
                </div>
                <p className="text-green-600 text-sm mb-4">تجار الجملة والموزعين</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">عرض</Button>
                  <Button size="sm" variant="outline">تعديل</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cash Group Form Dialog */}
      <Dialog open={showCashGroupForm} onOpenChange={setShowCashGroupForm}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مجموعة عملاء نقديين</DialogTitle>
          </DialogHeader>
          <Form {...cashGroupForm}>
            <form onSubmit={cashGroupForm.handleSubmit(onSubmitCashGroup)} className="space-y-6">
              <FormField
                control={cashGroupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المجموعة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المجموعة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cashGroupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea placeholder="وصف المجموعة وخصائصها" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={cashGroupForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نسبة الخصم (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cashGroupForm.control}
                  name="minimumJoinAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأدنى للانضمام</FormLabel>
                      <FormControl>
                        <Input placeholder="0" type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={cashGroupForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        مجموعة مميزة (VIP)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={cashGroupForm.control}
                name="clientIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختيار العملاء</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Quick Add from Dropdown */}
                        <div>
                          <FormLabel className="text-sm font-medium mb-2 block">إضافة سريعة من قائمة العملاء</FormLabel>
                          <Select onValueChange={(value) => {
                            const clientId = parseInt(value);
                            const currentValue = field.value || [];
                            if (!currentValue.includes(clientId)) {
                              field.onChange([...currentValue, clientId]);
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر عميل لإضافته للمجموعة" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients && clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.name} - {client.phone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Selected Clients List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
                          <FormLabel className="text-sm font-medium">العملاء المختارون:</FormLabel>
                          {clients && clients.map((client) => (
                            <div key={client.id} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={`client-${client.id}`}
                                checked={field.value?.includes(client.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, client.id]);
                                  } else {
                                    field.onChange(currentValue.filter(id => id !== client.id));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`client-${client.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {client.name} - {client.phone}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  إضافة المجموعة
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCashGroupForm(false);
                    cashGroupForm.reset();
                  }} 
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientsClean;