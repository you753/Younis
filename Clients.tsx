import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ClientForm from '@/components/forms/ClientForm';
import ClientsTable from '@/components/tables/ClientsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, DollarSign, CreditCard, Edit, Trash2, Save, Building, UserPlus, Group, Search, Upload } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Client } from '@shared/schema';
import { insertClientSchema, InsertClient } from '@shared/schema';

// Schema for client group
const clientGroupSchema = z.object({
  name: z.string().min(2, 'اسم المجموعة يجب أن يكون على الأقل حرفين'),
  description: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

type ClientGroupForm = z.infer<typeof clientGroupSchema>;

// Add Client Form Component
function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      group: '',
      openingBalance: '0',
      creditLimit: '0',
      accountType: 'cash' as const,
      status: 'active' as const
    }
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة العميل بنجاح",
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertClient) => {
    createClientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العميل *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم العميل" {...field} value={field.value || ''} />
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
                  <Input placeholder="05xxxxxxxx" {...field} value={field.value || ''} />
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
                  <Input type="email" placeholder="example@email.com" {...field} value={field.value || ''} />
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
                  <Input placeholder="أدخل العنوان" {...field} value={field.value || ''} />
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
                <FormLabel>الرصيد الافتتاحي</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <Select onValueChange={field.onChange} defaultValue={field.value || 'cash'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value || 'active'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={createClientMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createClientMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ العميل'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Clients() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // وظائف التعديل والحذف
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowEditForm(true);
  };

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

  const handleDeleteClient = (clientId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const groupForm = useForm<ClientGroupForm>({
    resolver: zodResolver(clientGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      discountPercentage: 0,
    }
  });

  // Fetch data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['/api/client-groups'],
    enabled: location === '/client-groups'
  });

  // فلترة العملاء بناءً على البحث المحلي
  const filteredClients = Array.isArray(clients) ? clients.filter((client: Client) => {
    if (!localSearchQuery.trim()) return true;
    
    const searchTerms = localSearchQuery.toLowerCase().trim().split(' ');
    const searchText = `${client.name || ''} ${client.phone || ''} ${client.email || ''} ${client.address || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  // Set page title based on route
  useEffect(() => {
    switch (location) {
      case '/client-groups':
        setCurrentPage('مجموعات العملاء');
        break;
      case '/client-accounts':
        setCurrentPage('حسابات العملاء');
        break;
      default:
        setCurrentPage('إدارة العملاء');
    }
  }, [location, setCurrentPage]);

  const getPageContent = () => {
    switch (location) {
      case '/client-groups':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">مجموعات العملاء</h2>
                <p className="text-gray-600">تصنيف العملاء حسب النوع والخصومات</p>
              </div>
              <Button onClick={() => setShowGroupForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة مجموعة جديدة
              </Button>
            </div>

            {/* Client Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'عملاء الجملة', count: 15, discount: 15, description: 'عملاء شراء بكميات كبيرة' },
                { name: 'عملاء التجزئة', count: 45, discount: 5, description: 'عملاء الشراء العادي' },
                { name: 'عملاء VIP', count: 8, discount: 25, description: 'العملاء المميزين' },
                { name: 'عملاء الشركات', count: 12, discount: 20, description: 'الشركات والمؤسسات' }
              ].map((group, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{group.name}</span>
                      <Badge variant="secondary">{group.count} عميل</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{group.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">خصم المجموعة:</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {group.discount}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-blue-600 hover:text-blue-900"
                        onClick={() => toast({
                          title: "تعديل المجموعة",
                          description: "سيتم إضافة وظيفة تعديل المجموعة قريباً",
                        })}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-green-600 hover:text-green-900"
                        onClick={() => toast({
                          title: "إضافة عميل للمجموعة",
                          description: "سيتم إضافة وظيفة إضافة عميل للمجموعة قريباً",
                        })}
                      >
                        <UserPlus className="h-4 w-4 ml-1" />
                        إضافة عميل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Group Form Dialog */}
            <Dialog open={showGroupForm} onOpenChange={setShowGroupForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة مجموعة عملاء جديدة</DialogTitle>
                </DialogHeader>
                <Form {...groupForm}>
                  <form className="space-y-4">
                    <FormField
                      control={groupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المجموعة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم المجموعة" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="وصف المجموعة" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الخصم (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              max="100" 
                              placeholder="0" 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 ml-1" />
                        حفظ
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowGroupForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case '/client-accounts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">حسابات العملاء</h2>
                <p className="text-gray-600">إدارة أرصدة وحسابات العملاء المدينة والدائنة</p>
              </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">حسابات مدينة</p>
                      <p className="text-2xl font-bold text-red-700">25,340 ر.س</p>
                    </div>
                    <div className="bg-red-200 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">حسابات دائنة</p>
                      <p className="text-2xl font-bold text-green-700">8,750 ر.س</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">إجمالي العملاء</p>
                      <p className="text-2xl font-bold text-blue-700">{clients.length}</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">متأخرات</p>
                      <p className="text-2xl font-bold text-yellow-700">12,800 ر.س</p>
                    </div>
                    <div className="bg-yellow-200 p-3 rounded-full">
                      <Building className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Accounts Table */}
            <Card>
              <CardHeader>
                <CardTitle>كشف حسابات العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">جميع الحسابات</TabsTrigger>
                    <TabsTrigger value="debit">مدينة</TabsTrigger>
                    <TabsTrigger value="credit">دائنة</TabsTrigger>
                    <TabsTrigger value="overdue">متأخرة</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم العميل</TableHead>
                          <TableHead className="text-right">رقم الحساب</TableHead>
                          <TableHead className="text-right">الرصيد</TableHead>
                          <TableHead className="text-right">نوع الحساب</TableHead>
                          <TableHead className="text-right">آخر حركة</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client, index) => {
                          const balance = Math.random() > 0.5 ? (Math.random() * 5000) : -(Math.random() * 2000);
                          const isDebit = balance < 0;
                          return (
                            <TableRow key={client.id}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell>ACC-{String(client.id).padStart(6, '0')}</TableCell>
                              <TableCell className={`font-bold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.abs(balance).toFixed(2)} ر.س
                              </TableCell>
                              <TableCell>
                                <Badge variant={isDebit ? "destructive" : "default"}>
                                  {isDebit ? 'مدين' : 'دائن'}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date().toLocaleDateString('en-GB')}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    كشف الحساب
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="debit">
                    <p className="text-center py-8 text-gray-500">حسابات العملاء المدينة</p>
                  </TabsContent>
                  <TabsContent value="credit">
                    <p className="text-center py-8 text-gray-500">حسابات العملاء الدائنة</p>
                  </TabsContent>
                  <TabsContent value="overdue">
                    <p className="text-center py-8 text-gray-500">الحسابات المتأخرة</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Header Section with Professional Add Client Button */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3 flex items-center">
                    <Users className="ml-4 h-8 w-8" />
                    إدارة العملاء الشاملة
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">
                    نظام متكامل لإدارة العملاء، الحسابات، والمتابعة التجارية
                  </p>
                  <div className="flex items-center gap-6 text-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>نظام مُحدّث تلقائياً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>تقارير شاملة</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* Professional Add Client Button */}
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-bold border-2 border-green-400 hover:border-green-300 transform hover:scale-105"
                    size="lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">إضافة عميل جديد</div>
                        <div className="text-sm text-green-100">سجل عميل جديد الآن</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowImportDialog(true)}
                    variant="outline"
                    className="bg-white bg-opacity-10 border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                    size="lg"
                  >
                    <Upload className="ml-2 h-5 w-5" />
                    استيراد من Excel
                  </Button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-6 mt-6 text-center">
                <div className="bg-white bg-opacity-10 rounded-lg px-6 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{clients.length}</div>
                  <div className="text-blue-200 text-sm">إجمالي العملاء</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg px-6 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'active').length}</div>
                  <div className="text-blue-200 text-sm">عملاء نشطين</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg px-6 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{clients.filter(c => c.accountType === 'credit').length}</div>
                  <div className="text-blue-200 text-sm">حسابات ائتمانية</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg px-6 py-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{clients.filter(c => c.accountType === 'cash').length}</div>
                  <div className="text-blue-200 text-sm">عملاء نقديين</div>
                </div>
              </div>
            
            {/* شريط البحث المحلي */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="البحث عن عميل (الاسم، الهاتف، البريد الإلكتروني...)"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pr-12 text-right text-lg py-3 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                  />
                </div>
                {localSearchQuery && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-700 font-medium">
                      النتائج: <span className="font-bold">{filteredClients.length}</span> من أصل <span className="font-bold">{clients.length}</span> عميل
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نتائج البحث */}
            {localSearchQuery && filteredClients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>نتائج البحث ({filteredClients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <div 
                        key={client.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 text-right">
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">
                            {client.phone && <span>{client.phone}</span>}
                            {client.phone && client.email && <span className="mx-2">•</span>}
                            {client.email && <span>{client.email}</span>}
                          </div>
                          {client.address && (
                            <div className="text-xs text-gray-400 mt-1">{client.address}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-900 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* رسالة عدم وجود نتائج */}
            {localSearchQuery && filteredClients.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-3">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 mb-4">لم نجد أي عملاء يطابقون البحث "{localSearchQuery}"</p>
                  <Button variant="outline" onClick={() => setLocalSearchQuery('')}>
                    مسح البحث
                  </Button>
                </CardContent>
              </Card>
            )}

            <ClientForm />
            <ClientsTable onAddClient={() => setShowAddForm(true)} />
          </div>
        );
    }
  };

  return (
    <div>
      {getPageContent()}
      
      {/* Add Client Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
          </DialogHeader>
          <AddClientForm onSuccess={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        title="استيراد العملاء من Excel"
        instructions="يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية: اسم العميل، الهاتف، البريد الإلكتروني، العنوان، الرقم الضريبي، ملاحظات"
        apiEndpoint="/api/clients/import-excel"
        templateData={[{
          'اسم العميل': 'عميل تجريبي',
          'الهاتف': '0501234567',
          'البريد الإلكتروني': 'client@example.com',
          'العنوان': 'الرياض، المملكة العربية السعودية',
          'الرقم الضريبي': '123456789',
          'ملاحظات': 'عميل مميز'
        }]}
        templateName="نموذج_استيراد_العملاء.xlsx"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/clients'] })}
      />
    </div>
  );
}
