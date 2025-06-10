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

// Schema for client group
const clientGroupSchema = z.object({
  name: z.string().min(2, 'اسم المجموعة يجب أن يكون على الأقل حرفين'),
  description: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

type ClientGroupForm = z.infer<typeof clientGroupSchema>;

export default function Clients() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showCashClientForm, setShowCashClientForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      case '/cash-clients':
        setCurrentPage('العملاء النقديين');
        break;
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
      case '/cash-clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">العملاء النقديين</h2>
                <p className="text-gray-600">إدارة العملاء الذين يدفعون نقداً فقط</p>
              </div>
              <Button onClick={() => setShowCashClientForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة عميل نقدي
              </Button>
            </div>

            {/* شريط البحث */}
            <div className="mt-4">
              <SearchBox
                placeholder="ابحث في العملاء بالاسم، الهاتف، البريد الإلكتروني..."
                value={localSearchQuery}
                onChange={setLocalSearchQuery}
                className="max-w-md"
              />
            </div>

            {/* Cash Clients Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">العملاء النقديين</p>
                      <p className="text-2xl font-bold text-green-700">
                        {clients.filter(c => c.group === 'نقدي').length}
                      </p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">المبيعات النقدية</p>
                      <p className="text-2xl font-bold text-blue-700">15,450 ر.س</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">متوسط الشراء</p>
                      <p className="text-2xl font-bold text-purple-700">245 ر.س</p>
                    </div>
                    <div className="bg-purple-200 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">هذا الشهر</p>
                      <p className="text-2xl font-bold text-orange-700">3,200 ر.س</p>
                    </div>
                    <div className="bg-orange-200 p-3 rounded-full">
                      <Building className="h-6 w-6 text-orange-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Clients Table */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة العملاء النقديين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم العميل</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">إجمالي المشتريات</TableHead>
                      <TableHead className="text-right">آخر عملية شراء</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.filter(client => client.group === 'نقدي').map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell className="font-bold text-green-600">1,250 ر.س</TableCell>
                        <TableCell>{new Date().toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cash Client Form Dialog */}
            <Dialog open={showCashClientForm} onOpenChange={setShowCashClientForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عميل نقدي جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم العميل</label>
                    <Input placeholder="أدخل اسم العميل" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <Input placeholder="أدخل رقم الهاتف" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان</label>
                    <Textarea placeholder="أدخل العنوان (اختياري)" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Save className="h-4 w-4 ml-1" />
                      حفظ العميل
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCashClientForm(false)} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

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
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      <Button variant="outline" size="sm">
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
                              <TableCell>{new Date().toLocaleDateString('ar-SA')}</TableCell>
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة العملاء</h2>
              <p className="text-gray-600">إضافة وإدارة معلومات العملاء ومجموعاتهم</p>
            </div>

            {/* شريط البحث المحلي */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث عن عميل (الاسم، الهاتف، البريد الإلكتروني...)"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pr-10 text-right"
                  />
                </div>
                {localSearchQuery && (
                  <div className="mt-3 text-sm text-gray-600">
                    النتائج: {filteredClients.length} من أصل {clients.length} عميل
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
                            {client.phone && <span>📞 {client.phone}</span>}
                            {client.phone && client.email && <span className="mx-2">•</span>}
                            {client.email && <span>✉️ {client.email}</span>}
                          </div>
                          {client.address && (
                            <div className="text-xs text-gray-400 mt-1">📍 {client.address}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            عرض
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
            {!localSearchQuery && <ClientsTable />}
          </div>
        );
    }
  };

  return getPageContent();
}
