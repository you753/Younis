import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Eye, Edit, Trash2, Users, DollarSign, TrendingUp, Package, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  balance: string;
  taxNumber: string | null;
  creditLimit: string;
}

interface BranchSuppliersManagementProps {
  branchId: number;
}

export default function BranchSuppliersManagement({ branchId }: BranchSuppliersManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0,
  });

  // جلب بيانات الموردين الخاصة بالفرع فقط
  const { data: suppliersData, isLoading, refetch } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers?branchId=${branchId}`);
      if (!response.ok) throw new Error('فشل في جلب الموردين');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // التأكد من أن البيانات array
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  // فلترة الموردين حسب البحث
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  // حساب عدد الصفحات
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // إعادة تعيين الصفحة عند البحث
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // حساب الإحصائيات
  const totalSuppliers = suppliers.length;
  const totalBalance = suppliers.reduce((sum, s) => sum + parseFloat(s.balance || '0'), 0);
  const activeSuppliers = suppliers.filter(s => parseFloat(s.balance || '0') > 0).length;

  // إضافة مورد جديد
  const addSupplierMutation = useMutation({
    mutationFn: async (supplier: typeof newSupplier) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...supplier, branchId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في إضافة المورد');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      refetch();
      setShowAddDialog(false);
      setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
      setEditingSupplier(null);
      toast({ 
        title: 'تم بنجاح', 
        description: 'تم إضافة المورد الجديد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'خطأ', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

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
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في تحديث المورد');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      refetch();
      setShowAddDialog(false);
      setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
      setEditingSupplier(null);
      toast({ 
        title: 'تم بنجاح', 
        description: 'تم تحديث بيانات المورد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'خطأ', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // حذف مورد
  const deleteSupplierMutation = useMutation({
    mutationFn: async (supplierId: number) => {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في حذف المورد');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      refetch();
      setShowDeleteDialog(false);
      setSupplierToDelete(null);
      toast({ 
        title: 'تم بنجاح', 
        description: 'تم حذف المورد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'خطأ', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // معالجة إضافة أو تحديث المورد
  const handleSubmit = () => {
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال اسم المورد ورقم الهاتف',
        variant: 'destructive'
      });
      return;
    }

    if (editingSupplier) {
      updateSupplierMutation.mutate({
        id: editingSupplier.id,
        ...newSupplier
      });
    } else {
      addSupplierMutation.mutate(newSupplier);
    }
  };

  // فتح نافذة التعديل
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      openingBalance: parseFloat(supplier.balance || '0'),
    });
    setShowAddDialog(true);
  };

  // فتح نافذة العرض
  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewDialog(true);
  };

  // فتح نافذة الحذف
  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplierMutation.mutate(supplierToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="text-center">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات الموردين والحسابات</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSupplier(null);
            setNewSupplier({ name: '', phone: '', email: '', address: '' });
            setShowAddDialog(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          data-testid="button-add-supplier"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة مورد جديد
        </Button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <Users className="h-4 w-4 ml-2" />
              إجمالي الموردين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalSuppliers}</div>
            <p className="text-xs text-blue-600 mt-1">مورد نشط</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-4 w-4 ml-2" />
              إجمالي الأرصدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {totalBalance.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-green-600 mt-1">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <TrendingUp className="h-4 w-4 ml-2" />
              الموردين النشطين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{activeSuppliers}</div>
            <p className="text-xs text-orange-600 mt-1">لديهم أرصدة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <Package className="h-4 w-4 ml-2" />
              معدل الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {totalSuppliers > 0 ? Math.round(totalBalance / totalSuppliers).toLocaleString('en-US') : '0'}
            </div>
            <p className="text-xs text-purple-600 mt-1">ريال لكل مورد</p>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن مورد بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 h-12 text-lg"
              data-testid="input-search-supplier"
            />
          </div>
        </CardContent>
      </Card>

      {/* جدول الموردين */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">الكود</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">اسم المورد</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">رقم الهاتف</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">الرصيد الحالي</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد موردين حالياً'}
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-600">
                          SUP{supplier.id.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">{supplier.name}</span>
                      </td>
                      <td className="p-4 text-gray-700">{supplier.phone}</td>
                      <td className="p-4 text-gray-700">{supplier.email || '-'}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${parseFloat(supplier.balance) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {parseFloat(supplier.balance).toLocaleString('en-US')} ريال
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleView(supplier)}
                            title="عرض تفاصيل المورد"
                            data-testid={`button-view-supplier-${supplier.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleEdit(supplier)}
                            title="تعديل بيانات المورد"
                            data-testid={`button-edit-supplier-${supplier.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(supplier)}
                            title="حذف المورد"
                            data-testid={`button-delete-supplier-${supplier.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* شريط التنقل بين الصفحات */}
          {filteredSuppliers.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>عرض {startIndex + 1} - {Math.min(endIndex, filteredSuppliers.length)} من {filteredSuppliers.length} مورد</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                  data-testid="button-prev-page"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                  data-testid="button-next-page"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة/تعديل مورد */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المورد *</Label>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="أدخل اسم المورد"
                data-testid="input-supplier-name"
              />
            </div>
            <div>
              <Label>رقم الهاتف *</Label>
              <Input
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                data-testid="input-supplier-phone"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                placeholder="supplier@example.com"
                data-testid="input-supplier-email"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="عنوان المورد"
                data-testid="input-supplier-address"
              />
            </div>
            <div>
              <Label>الرصيد الافتتاحي</Label>
              <Input
                type="number"
                value={newSupplier.openingBalance}
                onChange={(e) => setNewSupplier({ ...newSupplier, openingBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                data-testid="input-supplier-opening-balance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setEditingSupplier(null);
                setNewSupplier({ name: '', phone: '', email: '', address: '', openingBalance: 0 });
              }}
              data-testid="button-cancel-supplier"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={addSupplierMutation.isPending || updateSupplierMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-submit-supplier"
            >
              {addSupplierMutation.isPending || updateSupplierMutation.isPending
                ? 'جارٍ الحفظ...'
                : editingSupplier
                ? 'حفظ التعديلات'
                : 'إضافة المورد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة عرض تفاصيل المورد */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المورد</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-xl text-blue-900 mb-1">{selectedSupplier.name}</h3>
                <p className="text-sm text-blue-700">
                  الكود: SUP{selectedSupplier.id.toString().padStart(3, '0')}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium text-gray-900">{selectedSupplier.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">البريد الإلكتروني:</span>
                  <span className="font-medium text-gray-900">{selectedSupplier.email || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium text-gray-900">{selectedSupplier.address || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">الرصيد الحالي:</span>
                  <span className="font-bold text-green-600">
                    {parseFloat(selectedSupplier.balance).toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>
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

      {/* نافذة تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          {supplierToDelete && (
            <div className="space-y-4">
              <p className="text-gray-700">
                هل أنت متأكد من حذف المورد <span className="font-bold text-gray-900">{supplierToDelete.name}</span>؟
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  ⚠️ تحذير: سيتم حذف جميع البيانات المرتبطة بهذا المورد ولا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setSupplierToDelete(null);
              }}
              data-testid="button-cancel-delete-supplier"
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteSupplierMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-supplier"
            >
              {deleteSupplierMutation.isPending ? 'جارٍ الحذف...' : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
