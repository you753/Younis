import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, DollarSign, TrendingUp, Search, Plus, Eye, FileText, Download, Phone, Mail, MapPin, Edit, Trash2, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProtectedSection from '@/components/ProtectedSection';

interface BranchClientsProps {
  branchId?: number;
}

interface Client {
  id: number;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  openingBalance: number;
  isActive: boolean;
  creditLimit: number;
  paymentTerms: string;
  contactPerson: string;
  taxNumber: string;
  currentBalance?: number;
  totalSales?: number;
  totalReceipts?: number;
}

export default function EnhancedBranchClients({ branchId }: BranchClientsProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="clients">
      <EnhancedBranchClientsContent branchId={branchId} />
    </ProtectedSection>
  );
}

function EnhancedBranchClientsContent({ branchId }: { branchId: number }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0,
    creditLimit: 0,
    paymentTerms: '30',
    contactPerson: '',
    taxNumber: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب العملاء
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const response = await fetch(`/api/clients?branchId=${branchId}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // جلب سندات القبض
  const { data: receiptVouchers = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers']
  });

  // جلب فواتير المبيعات
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales']
  });

  // إنشاء عميل جديد
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiRequest('POST', '/api/clients', clientData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowAddDialog(false);
      setNewClient({
        name: '',
        phone: '',
        email: '',
        address: '',
        openingBalance: 0,
        creditLimit: 0,
        paymentTerms: '30',
        contactPerson: '',
        taxNumber: ''
      });
      toast({
        title: "تم إضافة العميل بنجاح",
        description: "تم إضافة العميل إلى قائمة العملاء",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة العميل",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive",
      });
    }
  });

  // تعديل عميل
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowEditDialog(false);
      setEditingClient(null);
      toast({
        title: "تم تحديث العميل بنجاح",
        description: "تم تحديث بيانات العميل",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث العميل",
        variant: "destructive",
      });
    }
  });

  // حذف عميل
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      await apiRequest('DELETE', `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "تم حذف العميل",
        description: "تم حذف العميل من النظام بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!newClient.name || !newClient.phone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم العميل ورقم الهاتف على الأقل",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      ...newClient,
      code: `CLI${String(Date.now()).slice(-3)}`,
      balance: newClient.openingBalance,
      isActive: true,
      branchId: branchId // إضافة رقم الفرع
    };

    createClientMutation.mutate(clientData);
  };

  // حساب الرصيد الحالي لكل عميل
  const clientsArray = Array.isArray(clients) ? clients : [];
  const clientsWithBalance = clientsArray.map((client: Client) => {
    const clientSales = Array.isArray(sales) ? sales.filter((s: any) => 
      (s.clientId === client.id || s.client_id === client.id)
    ) : [];
    const clientReceipts = Array.isArray(receiptVouchers) ? receiptVouchers.filter((v: any) => 
      (v.clientId === client.id || v.client_id === client.id)
    ) : [];

    const totalSales = clientSales.reduce((sum: number, s: any) => 
      sum + Number(s.total || 0), 0
    );
    const totalReceipts = clientReceipts.reduce((sum: number, v: any) => 
      sum + Number(v.amount || 0), 0
    );

    const openingBalance = Number(client.openingBalance || 0);
    const currentBalance = openingBalance + totalSales - totalReceipts;

    return {
      ...client,
      currentBalance,
      totalSales,
      totalReceipts
    };
  });

  const filteredClients = clientsWithBalance.filter((client: any) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         (client.code && client.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && client.isActive) ||
                         (filterStatus === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات العملاء
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c: Client) => c.isActive).length,
    totalBalance: clientsWithBalance.reduce((sum: number, c: any) => sum + (c.currentBalance || 0), 0),
    avgBalance: clients.length > 0 ? clientsWithBalance.reduce((sum: number, c: any) => sum + (c.currentBalance || 0), 0) / clients.length : 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-yellow-600">جاري تحميل بيانات العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان والإجراءات */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العملاء</h1>
            <p className="text-gray-600">إدارة شاملة لبيانات العملاء والحسابات</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <UserPlus className="h-5 w-5 mr-2" />
                إضافة عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white border-gray-200 text-gray-900 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b border-gray-200 pb-4">
                <DialogTitle className="text-gray-900 text-2xl font-bold flex items-center">
                  <UserPlus className="h-6 w-6 mr-3 text-blue-600" />
                  إضافة عميل جديد
                </DialogTitle>
                <p className="text-gray-600 mt-2">أدخل بيانات العميل الجديد بدقة</p>
              </DialogHeader>
              
              <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* المعلومات الأساسية */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">المعلومات الأساسية</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">اسم العميل *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-200"
                        placeholder="أدخل اسم العميل الكامل"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-200"
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className="bg-green-50 border-green-200 text-gray-900 focus:border-green-400 focus:ring-green-200"
                        placeholder="client@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-gray-700 font-medium">الشخص المسؤول</Label>
                      <Input
                        id="contactPerson"
                        value={newClient.contactPerson}
                        onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
                        className="bg-green-50 border-green-200 text-gray-900 focus:border-green-400 focus:ring-green-200"
                        placeholder="اسم الشخص المسؤول للتواصل"
                      />
                    </div>
                  </div>
                  
                  {/* المعلومات المالية */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">المعلومات المالية</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="openingBalance" className="text-gray-700 font-medium">الرصيد الافتتاحي (ريال)</Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        value={newClient.openingBalance}
                        onChange={(e) => setNewClient({...newClient, openingBalance: Number(e.target.value)})}
                        className="bg-yellow-50 border-yellow-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-200"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit" className="text-gray-700 font-medium">حد الائتمان (ريال)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        value={newClient.creditLimit}
                        onChange={(e) => setNewClient({...newClient, creditLimit: Number(e.target.value)})}
                        className="bg-yellow-50 border-yellow-200 text-gray-900 focus:border-yellow-400 focus:ring-yellow-200"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms" className="text-gray-700 font-medium">شروط الدفع</Label>
                      <Select value={newClient.paymentTerms} onValueChange={(value) => setNewClient({...newClient, paymentTerms: value})}>
                        <SelectTrigger className="bg-purple-50 border-purple-200 text-gray-900 focus:border-purple-400 focus:ring-purple-200">
                          <SelectValue placeholder="اختر شروط الدفع" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="cash">فوري (نقدي)</SelectItem>
                          <SelectItem value="15">15 يوم</SelectItem>
                          <SelectItem value="30">30 يوم</SelectItem>
                          <SelectItem value="60">60 يوم</SelectItem>
                          <SelectItem value="90">90 يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taxNumber" className="text-gray-700 font-medium">الرقم الضريبي</Label>
                      <Input
                        id="taxNumber"
                        value={newClient.taxNumber}
                        onChange={(e) => setNewClient({...newClient, taxNumber: e.target.value})}
                        className="bg-purple-50 border-purple-200 text-gray-900 focus:border-purple-400 focus:ring-purple-200"
                        placeholder="الرقم الضريبي (اختياري)"
                      />
                    </div>
                  </div>
                  
                  {/* العنوان */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-gray-700 font-medium">العنوان التفصيلي</Label>
                    <Textarea
                      id="address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      className="bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 focus:ring-gray-200"
                      placeholder="أدخل العنوان التفصيلي للعميل"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    setNewClient({
                      name: '',
                      phone: '',
                      email: '',
                      address: '',
                      openingBalance: 0,
                      creditLimit: 0,
                      paymentTerms: '30',
                      contactPerson: '',
                      taxNumber: ''
                    });
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 font-medium"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createClientMutation.isPending || !newClient.name || !newClient.phone}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {createClientMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      حفظ العميل
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>


        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">العملاء النشطين</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeClients}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الأرصدة</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalBalance.toLocaleString('en-US')} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">متوسط الرصيد</p>
                  <p className="text-2xl font-bold text-orange-600">{Math.round(stats.avgBalance).toLocaleString('en-US')} ر.س</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والتصفية */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث بالاسم، الكود، أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-white border-gray-300"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-white border-gray-300">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* قائمة العملاء */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">قائمة العملاء ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client: Client) => (
                <div key={client.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{client.name}</h3>
                        <Badge variant={client.isActive ? "default" : "secondary"} className="bg-green-500 text-white">
                          {client.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                        {client.code && <Badge variant="outline" className="border-blue-500 text-blue-600">{client.code}</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600">الرصيد الافتتاحي: </span>
                            <span className="text-green-600 font-bold">{Number(client.openingBalance || 0).toLocaleString('en-US')} ر.س</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">الرصيد الحالي: </span>
                            <span className="text-blue-600 font-bold">{Number(client.currentBalance || 0).toLocaleString('en-US')} ر.س</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {client.creditLimit && (
                            <div className="text-sm">
                              <span className="text-yellow-200">حد الائتمان: </span>
                              <span className="text-purple-400">{client.creditLimit.toLocaleString('en-US')} ر.س</span>
                            </div>
                          )}
                          {client.contactPerson && (
                            <div className="text-sm">
                              <span className="text-yellow-200">الشخص المسؤول: </span>
                              <span className="text-yellow-300">{client.contactPerson}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {client.address && (
                        <div className="mt-2">
                          <div className="flex items-start gap-2 text-sm text-yellow-200">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span>{client.address}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingClient(client);
                          setShowEditDialog(true);
                        }}
                        className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteClientMutation.mutate(client.id)}
                        disabled={deleteClientMutation.isPending}
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">لا توجد عملاء</h3>
                  <p className="text-yellow-200">لم يتم العثور على عملاء مطابقين للبحث</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* حوار التعديل */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl bg-white border-gray-200 text-gray-900 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-gray-900 text-2xl font-bold flex items-center">
                <Edit className="h-6 w-6 mr-3 text-blue-600" />
                تعديل بيانات العميل
              </DialogTitle>
              <p className="text-gray-600 mt-2">قم بتحديث بيانات العميل</p>
            </DialogHeader>
            
            {editingClient && (
              <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">المعلومات الأساسية</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-gray-700 font-medium">اسم العميل *</Label>
                      <Input
                        id="edit-name"
                        value={editingClient.name}
                        onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone" className="text-gray-700 font-medium">رقم الهاتف *</Label>
                      <Input
                        id="edit-phone"
                        value={editingClient.phone}
                        onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                        className="bg-blue-50 border-blue-200 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-email" className="text-gray-700 font-medium">البريد الإلكتروني</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingClient.email || ''}
                        onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                        className="bg-green-50 border-green-200 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-contactPerson" className="text-gray-700 font-medium">الشخص المسؤول</Label>
                      <Input
                        id="edit-contactPerson"
                        value={editingClient.contactPerson || ''}
                        onChange={(e) => setEditingClient({...editingClient, contactPerson: e.target.value})}
                        className="bg-green-50 border-green-200 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">المعلومات المالية</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-openingBalance" className="text-gray-700 font-medium">الرصيد الافتتاحي (ريال)</Label>
                      <Input
                        id="edit-openingBalance"
                        type="number"
                        value={editingClient.openingBalance}
                        onChange={(e) => setEditingClient({...editingClient, openingBalance: Number(e.target.value)})}
                        className="bg-yellow-50 border-yellow-200 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-creditLimit" className="text-gray-700 font-medium">حد الائتمان (ريال)</Label>
                      <Input
                        id="edit-creditLimit"
                        type="number"
                        value={editingClient.creditLimit}
                        onChange={(e) => setEditingClient({...editingClient, creditLimit: Number(e.target.value)})}
                        className="bg-yellow-50 border-yellow-200 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-paymentTerms" className="text-gray-700 font-medium">شروط الدفع</Label>
                      <Select 
                        value={editingClient.paymentTerms} 
                        onValueChange={(value) => setEditingClient({...editingClient, paymentTerms: value})}
                      >
                        <SelectTrigger className="bg-purple-50 border-purple-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="cash">فوري (نقدي)</SelectItem>
                          <SelectItem value="15">15 يوم</SelectItem>
                          <SelectItem value="30">30 يوم</SelectItem>
                          <SelectItem value="60">60 يوم</SelectItem>
                          <SelectItem value="90">90 يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-taxNumber" className="text-gray-700 font-medium">الرقم الضريبي</Label>
                      <Input
                        id="edit-taxNumber"
                        value={editingClient.taxNumber || ''}
                        onChange={(e) => setEditingClient({...editingClient, taxNumber: e.target.value})}
                        className="bg-purple-50 border-purple-200 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="edit-address" className="text-gray-700 font-medium">العنوان التفصيلي</Label>
                    <Textarea
                      id="edit-address"
                      value={editingClient.address || ''}
                      onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingClient(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 font-medium"
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  if (editingClient) {
                    updateClientMutation.mutate({
                      id: editingClient.id,
                      data: editingClient
                    });
                  }
                }}
                disabled={updateClientMutation.isPending || !editingClient?.name || !editingClient?.phone}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 font-bold shadow-lg"
              >
                {updateClientMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}