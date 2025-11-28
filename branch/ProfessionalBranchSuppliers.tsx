import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, DollarSign, TrendingUp, Search, Plus, Eye, Receipt, Trash2, RefreshCw, Edit } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  openingBalance: number;
  balance: number;
  currentBalance: number;
  status: string;
  createdAt: string;
}

interface BranchSuppliersProps {
  branchId?: number;
}

export default function ProfessionalBranchSuppliers({ branchId }: BranchSuppliersProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'نقدي',
    description: 'دفعة للمورد',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  // جلب بيانات الموردين مع تحديث تلقائي
  const { data: suppliers = [] as Supplier[], refetch: refetchSuppliers, isLoading } = useQuery({
    queryKey: branchId ? [`/api/suppliers?branchId=${branchId}`] : ['/api/suppliers'],
    refetchInterval: 1000, // تحديث كل ثانية
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
  });

  // إضافة مورد جديد
  const addSupplierMutation = useMutation({
    mutationFn: async (supplier: typeof newSupplier) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...supplier, branchId })
      });
      if (!response.ok) throw new Error('فشل في إضافة المورد');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      refetchSuppliers(); // تحديث فوري
      setShowAddDialog(false);
      setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
      toast({ title: 'تم بنجاح', description: 'تم إضافة المورد الجديد وسيظهر خلال ثوان', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في إضافة المورد', variant: 'destructive' });
    }
  });

  // إنشاء سند صرف
  const createPaymentVoucherMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      const response = await fetch('/api/supplier-payment-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });
      if (!response.ok) throw new Error('فشل في إنشاء سند الصرف');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      setShowPaymentDialog(false);
      setSelectedSupplier(null);
      setPaymentData({ amount: 0, paymentMethod: 'نقدي', description: 'دفعة للمورد', paymentDate: new Date().toISOString().split('T')[0] });
      toast({ title: 'تم بنجاح', description: 'تم إنشاء سند الصرف وخصم المبلغ من رصيد المورد', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في إنشاء سند الصرف', variant: 'destructive' });
    }
  });

  // حذف مورد
  const deleteSupplierMutation = useMutation({
    mutationFn: async (supplierId: number) => {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('فشل في حذف المورد');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({ title: 'تم بنجاح', description: 'تم حذف المورد', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في حذف المورد', variant: 'destructive' });
    }
  });

  // فلترة الموردين - تحويل البيانات لضمان التوافق  
  const supplierData = suppliers as any[];
  console.log('البيانات الخام للموردين:', supplierData);
  
  const processedSuppliers = supplierData.map((supplier: any): Supplier => ({
    id: supplier.id,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    openingBalance: parseFloat(supplier.openingBalance?.toString()) || 0,
    balance: parseFloat(supplier.balance?.toString()) || 0,
    currentBalance: parseFloat(supplier.currentBalance?.toString()) || parseFloat(supplier.balance?.toString()) || 0,
    status: supplier.status || 'active',
    createdAt: supplier.createdAt
  }));
  
  console.log('الموردين المعالجين:', processedSuppliers);

  const filteredSuppliers = processedSuppliers.filter((supplier: Supplier) => {
    return supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplier.phone.includes(searchTerm);
  });

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedSuppliers,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredSuppliers,
    itemsPerPage: 10,
    resetTriggers: [searchTerm]
  });

  // حساب الإحصائيات
  const totalSuppliers = processedSuppliers.length;
  const totalOpeningBalance = processedSuppliers.reduce((sum: number, s: Supplier) => sum + s.openingBalance, 0);
  const totalCurrentBalance = processedSuppliers.reduce((sum: number, s: Supplier) => sum + s.currentBalance, 0);

  const handleAddSupplier = () => {
    if (editingSupplier) {
      // تحديث المورد
      updateSupplierMutation.mutate({
        id: editingSupplier.id,
        ...newSupplier
      });
    } else {
      // إضافة مورد جديد
      addSupplierMutation.mutate(newSupplier);
    }
  };

  // تحديث مورد
  const updateSupplierMutation = useMutation({
    mutationFn: async (supplierData: { id: number } & typeof newSupplier) => {
      const response = await fetch(`/api/suppliers/${supplierData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supplierData.name,
          phone: supplierData.phone,
          email: supplierData.email,
          address: supplierData.address,
          openingBalance: supplierData.openingBalance
        })
      });
      if (!response.ok) throw new Error('فشل في تحديث المورد');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      refetchSuppliers();
      setShowAddDialog(false);
      setEditingSupplier(null);
      setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
      toast({ title: 'تم بنجاح', description: 'تم تحديث المورد بنجاح', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث المورد', variant: 'destructive' });
    }
  });

  const handlePaymentVoucher = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowPaymentDialog(true);
  };

  const handleCreatePayment = () => {
    if (selectedSupplier && paymentData.amount > 0) {
      createPaymentVoucherMutation.mutate({
        supplierId: selectedSupplier.id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        description: paymentData.description,
        status: 'confirmed'
      });
    }
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    if (confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟`)) {
      deleteSupplierMutation.mutate(supplier.id);
    }
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      openingBalance: supplier.openingBalance
    });
    setShowAddDialog(true);
  };

  // دالة فتح نافذة تأكيد الحذف
  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteDialog(true);
  };

  // دالة تأكيد الحذف
  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    
    try {
      const response = await fetch(`/api/suppliers/${supplierToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
        refetchSuppliers();
        setShowDeleteDialog(false);
        setSupplierToDelete(null);
        toast({ 
          title: 'تم الحذف بنجاح', 
          description: `تم حذف المورد ${supplierToDelete.name} بنجاح`,
          variant: 'default' 
        });
      } else {
        const error = await response.json();
        toast({ 
          title: 'فشل الحذف', 
          description: error.error || 'حدث خطأ أثناء حذف المورد',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({ 
        title: 'خطأ', 
        description: 'حدث خطأ غير متوقع أثناء حذف المورد',
        variant: 'destructive' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل بيانات الموردين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
            <p className="text-gray-600">إدارة الموردين في نظام الفروع - الفرع {branchId}</p>
          </div>
        </div>
        <Button onClick={() => refetchSuppliers()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الرصيد الافتتاحي</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalOpeningBalance.toLocaleString('en-US')} ريال
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalCurrentBalance.toLocaleString('en-US')} ريال
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* البحث والإضافة */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث عن مورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              refetchSuppliers();
              toast({ title: 'تم التحديث', description: 'تم تحديث قائمة الموردين', variant: 'default' });
            }} 
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={() => {
            setEditingSupplier(null);
            setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
            setShowAddDialog(true);
          }} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 ml-2" />
            جديد
          </Button>
        </div>
      </div>

      {/* جدول الموردين */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg font-semibold">
            قائمة الموردين ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-right p-4 font-semibold text-gray-700">المورد</th>
                  <th className="text-right p-4 font-semibold text-gray-700">جهة الاتصال</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الافتتاحي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier: Supplier, index: number) => (
                  <tr key={supplier.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-blue-600">SUP{supplier.id.toString().padStart(3, '0')}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{supplier.phone}</div>
                      <div className="text-sm text-gray-500">{supplier.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-green-600">
                        {supplier.openingBalance.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-blue-600">
                        {supplier.currentBalance.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleViewSupplier(supplier)}
                          title="عرض تفاصيل المورد"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleEditSupplier(supplier)}
                          title="تعديل بيانات المورد"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد موردين</h3>
              <p className="text-gray-500">لم يتم العثور على موردين</p>
            </div>
          )}

          {filteredSuppliers.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredSuppliers.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemName="مورد"
            />
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة مورد */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'تحديث المورد' : 'إضافة مورد جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المورد *</Label>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="أدخل اسم المورد"
              />
            </div>
            <div>
              <Label>رقم الهاتف *</Label>
              <Input
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                placeholder="أدخل العنوان"
              />
            </div>
            <div>
              <Label>الرصيد الافتتاحي</Label>
              <Input
                type="number"
                value={newSupplier.openingBalance}
                onChange={(e) => setNewSupplier({...newSupplier, openingBalance: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAddSupplier}
              disabled={!newSupplier.name || !newSupplier.phone || addSupplierMutation.isPending || updateSupplierMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {(addSupplierMutation.isPending || updateSupplierMutation.isPending) ? 
                (editingSupplier ? 'جارٍ التحديث...' : 'جارٍ الإضافة...') : 
                (editingSupplier ? 'تحديث' : 'إضافة')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة سند الصرف */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء سند صرف</DialogTitle>
            {selectedSupplier && (
              <p className="text-sm text-gray-600">
                المورد: {selectedSupplier.name} | الرصيد الحالي: {selectedSupplier.currentBalance.toLocaleString('en-US')} ريال
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="بنكي">بنكي</SelectItem>
                  <SelectItem value="شيك">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Input
                value={paymentData.description}
                onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                placeholder="وصف السند"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleCreatePayment}
              disabled={paymentData.amount <= 0 || createPaymentVoucherMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createPaymentVoucherMutation.isPending ? 'جارٍ الإنشاء...' : 'إنشاء سند الصرف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة المورد */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>معاينة المورد</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedSupplier.name}</h3>
                <p className="text-sm text-gray-600 mb-1">SUP{selectedSupplier.id.toString().padStart(3, '0')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium">{selectedSupplier.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">البريد الإلكتروني:</span>
                  <span className="font-medium">{selectedSupplier.email || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium">{selectedSupplier.address || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الافتتاحي:</span>
                  <span className="font-medium text-green-600">
                    {selectedSupplier.openingBalance.toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الحالي:</span>
                  <span className="font-medium text-blue-600">
                    {selectedSupplier.currentBalance.toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <Badge className="bg-green-100 text-green-800">نشط</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}