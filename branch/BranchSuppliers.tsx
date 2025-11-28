import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, Users, DollarSign, TrendingUp, Search, Plus, Eye, Trash2, Filter, X, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProtectedSection from '@/components/ProtectedSection';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchSuppliersProps {
  branchId?: number;
}

export default function BranchSuppliers({ branchId }: BranchSuppliersProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="suppliers">
      <BranchSuppliersContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchSuppliersContent({ branchId }: { branchId: number }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  // جلب بيانات الموردين من الخادم بدلاً من البيانات الثابتة
  const { data: suppliersList = [], refetch: refetchSuppliers, isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
    refetchInterval: 2000, // تحديث كل ثانيتين للحصول على أحدث الأرصدة
    refetchOnWindowFocus: true,
    staleTime: 0 // البيانات دائماً قديمة للحصول على أحدث الأرصدة
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    openingBalance: 0,
    address: '',
    contactPerson: ''
  });
  const [paymentAmount, setPaymentAmount] = useState(0);

  // تحويل بيانات الموردين لتتطابق مع الواجهة - إضافة جميع الموردين الجدد
  const suppliers = suppliersList.map((supplier: any) => ({
    id: supplier.id,
    code: `SUP${supplier.id.toString().padStart(3, '0')}`,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    balance: parseFloat(supplier.balance) || parseFloat(supplier.currentBalance) || 0,
    openingBalance: parseFloat(supplier.openingBalance) || 0,
    currentBalance: parseFloat(supplier.currentBalance) || parseFloat(supplier.balance) || 0,
    status: supplier.status || 'active', // تعيين الحالة كـ نشط إذا لم تكن محددة
    category: 'عام',
    address: supplier.address || '',
    contactPerson: supplier.name
  }));

  // إضافة تسجيل للتحقق من البيانات
  console.log('جميع الموردين من قاعدة البيانات:', suppliersList);
  console.log('الموردين بعد التحويل:', suppliers);
  console.log('حالة البحث:', searchTerm, 'حالة الفلتر:', filterStatus);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || supplier.status === filterStatus;
    
    // تسجيل خاص للمورد يونس
    if (supplier.name === 'يونس') {
      console.log('المورد يونس:', supplier);
      console.log('يطابق البحث:', matchesSearch);
      console.log('يطابق الفلتر:', matchesFilter);
      console.log('النتيجة النهائية:', matchesSearch && matchesFilter);
    }
    
    return matchesSearch && matchesFilter;
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
    resetTriggers: [searchTerm, filterStatus]
  });

  console.log('الموردين بعد الفلترة:', filteredSuppliers);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نشط</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">معلق</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">غير نشط</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalBalance = suppliers.reduce((sum, s) => sum + s.balance, 0);
  const growthRate = 12; // نسبة النمو الشهري

  // دالة عرض تفاصيل المورد
  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowViewDialog(true);
  };

  // دالة حذف المورد
  const handleDeleteSupplier = (supplierId: number) => {
    const supplier = suppliersList.find(s => s.id === supplierId);
    if (supplier && window.confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟`)) {
      // حذف المورد من الخادم
      fetch(`/api/suppliers/${supplierId}`, { method: 'DELETE' })
        .then(() => {
          refetchSuppliers(); // إعادة جلب البيانات
          alert(`تم حذف المورد "${supplier.name}" بنجاح`);
        })
        .catch(() => alert('حدث خطأ في حذف المورد'));
    }
  };

  // دالة إضافة مورد جديد
  const handleAddSupplier = () => {
    setShowAddDialog(true);
  };

  // دالة حفظ المورد - احترافية
  const handleSaveSupplier = () => {
    // التحقق من البيانات المطلوبة
    if (!newSupplier.name.trim()) {
      alert('يرجى إدخال اسم المورد');
      return;
    }
    
    if (!newSupplier.phone.trim()) {
      alert('يرجى إدخال رقم الهاتف');
      return;
    }

    // التحقق من تكرار الاسم أو الهاتف
    const existingSupplier = suppliersList.find(s => 
      s.name.toLowerCase() === newSupplier.name.toLowerCase() || 
      s.phone === newSupplier.phone
    );
    
    if (existingSupplier) {
      alert('مورد بنفس الاسم أو رقم الهاتف موجود مسبقاً');
      return;
    }

    // إنشاء المورد الجديد
    const supplierToAdd = {
      name: newSupplier.name.trim(),
      phone: newSupplier.phone.trim(),
      email: newSupplier.email.trim() || '',
      address: newSupplier.address.trim() || '',
      openingBalance: Number(newSupplier.openingBalance) || 0,
      balance: Number(newSupplier.openingBalance) || 0,
      status: 'active'
    };

    // إرسال البيانات للخادم
    fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplierToAdd)
    })
    .then(response => response.json())
    .then(() => {
      refetchSuppliers(); // إعادة جلب البيانات
      setNewSupplier({
        name: '',
        phone: '',
        email: '',
        category: '',
        openingBalance: 0,
        address: '',
        contactPerson: ''
      });
      setShowAddDialog(false);
      alert(`تم إضافة المورد "${supplierToAdd.name}" بنجاح`);
    })
    .catch(() => alert('حدث خطأ في إضافة المورد'));
  };

  // دالة سند الصرف
  const handlePaymentVoucher = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowPaymentDialog(true);
  };

  // دالة تنفيذ سند الصرف
  const handleProcessPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    // إنشاء سند صرف جديد
    const voucherData = {
      supplierId: selectedSupplier.id,
      amount: paymentAmount,
      paymentMethod: 'نقدي',
      paymentDate: new Date().toISOString().split('T')[0],
      description: `سند صرف للمورد ${selectedSupplier.name}`,
      status: 'confirmed'
    };

    fetch('/api/supplier-payment-vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherData)
    })
    .then(response => response.json())
    .then(() => {
      refetchSuppliers(); // إعادة جلب البيانات محدثة
      setPaymentAmount(0);
      setShowPaymentDialog(false);
      alert(`تم خصم ${paymentAmount} ريال من رصيد المورد ${selectedSupplier.name}`);
    })
    .catch(() => alert('حدث خطأ في إنشاء سند الصرف'));
  };

  // دالة التصدير
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "رقم المورد,اسم المورد,رقم الهاتف,البريد الإلكتروني,الفئة,الرصيد الافتتاحي,الرصيد الحالي,الحالة\n" +
      suppliers.map(s => `${s.code},${s.name},${s.phone},${s.email},${s.category},${s.openingBalance},${s.balance},${s.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('تم تصدير البيانات بنجاح');
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
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-600">إدارة موردي الفرع - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
                <p className="text-xs text-gray-500">موزعين على {branchId} فرع</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الموردين النشطين</p>
                <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
                <p className="text-xs text-green-600">من أصل {totalSuppliers} موردين</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستحقات</p>
                <p className="text-2xl font-bold text-red-600">{totalBalance.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-red-500">مستحق للموردين</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">النمو الشهري</p>
                <p className="text-2xl font-bold text-orange-600">+{growthRate}%</p>
                <p className="text-xs text-orange-600">مقارنة بالشهر الماضي</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
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
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              <Filter className="h-4 w-4 ml-2" />
              الكل
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              نشط
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              معلق
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>
            <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddSupplier}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مورد جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">قائمة الموردين</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredSuppliers.length} من أصل {totalSuppliers} مورد
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">رقم المورد</th>
                  <th className="text-right p-4 font-semibold text-gray-700">اسم المورد</th>
                  <th className="text-right p-4 font-semibold text-gray-700">جهة الاتصال</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الفئة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الافتتاحي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-blue-600">{supplier.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                      <div className="text-sm text-gray-500">{supplier.phone}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {supplier.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-green-600">
                        {supplier.openingBalance.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-bold ${supplier.currentBalance > 0 ? 'text-red-600' : supplier.currentBalance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {(supplier.currentBalance || supplier.balance || 0).toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(supplier.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewSupplier(supplier)}
                          title="عرض تفاصيل المورد"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                          onClick={() => handlePaymentVoucher(supplier)}
                          title="سند صرف"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          title="حذف المورد"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <p className="text-gray-500 mb-4">لم يتم العثور على موردين يطابقون معايير البحث</p>
              <Button onClick={() => setSearchTerm('')}>
                مسح البحث
              </Button>
            </div>
          )}

          {pageCount > 1 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              totalItems={filteredSuppliers.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة مورد جديد */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة مورد جديد
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              أدخل معلومات المورد الجديد. الحقول المطلوبة مميزة بعلامة النجمة (*)
            </p>
          </DialogHeader>
          
          <div className="py-4">
            {/* معلومات أساسية */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800">اسم المورد *</label>
                  <Input 
                    placeholder="اسم المورد..." 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800">رقم الهاتف *</label>
                  <Input 
                    placeholder="05xxxxxxxx" 
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800">البريد الإلكتروني</label>
                  <Input 
                    placeholder="supplier@example.com" 
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800">الفئة</label>
                  <Input 
                    placeholder="تقنية، إلكترونيات، عام..." 
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                    className="border-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* المعلومات المالية */}
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-green-900 mb-3">المعلومات المالية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-800">الرصيد الافتتاحي</label>
                  <Input 
                    placeholder="0.00" 
                    type="number" 
                    value={newSupplier.openingBalance}
                    onChange={(e) => setNewSupplier({...newSupplier, openingBalance: Number(e.target.value)})}
                    className="border-green-200"
                  />
                  <p className="text-xs text-green-600">المبلغ المستحق للمورد عند بداية التعامل</p>
                </div>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">معلومات إضافية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">العنوان</label>
                  <Input 
                    placeholder="العنوان الكامل..." 
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">جهة الاتصال</label>
                  <Input 
                    placeholder="اسم المسؤول..." 
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveSupplier}>
              إضافة المورد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة عرض تفاصيل المورد */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              تفاصيل المورد
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">رقم المورد</label>
                  <p className="text-blue-600 font-medium">{selectedSupplier.code}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">اسم المورد</label>
                  <p className="font-medium">{selectedSupplier.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">جهة الاتصال</label>
                  <p>{selectedSupplier.contactPerson}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">رقم الهاتف</label>
                  <p>{selectedSupplier.phone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                  <p className="text-blue-600">{selectedSupplier.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">الفئة</label>
                  <Badge variant="outline">{selectedSupplier.category}</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">الرصيد الافتتاحي</label>
                  <p className="text-green-600 font-medium">{selectedSupplier.openingBalance.toLocaleString('en-US')} ريال</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">الرصيد الحالي</label>
                  <p className={`font-bold ${selectedSupplier.balance > 0 ? 'text-red-600' : selectedSupplier.balance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedSupplier.balance.toLocaleString('en-US')} ريال
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">العنوان</label>
                  <p>{selectedSupplier.address}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">الحالة</label>
                  <div>{getStatusBadge(selectedSupplier.status)}</div>
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

      {/* نافذة سند الصرف */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              سند صرف للمورد
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">المورد: {selectedSupplier.name}</h4>
                <p className="text-sm text-gray-600">الرصيد الافتتاحي الحالي: {selectedSupplier.openingBalance.toLocaleString('en-US')} ريال</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">مبلغ الصرف</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="text-right"
                />
                <p className="text-xs text-gray-500">سيتم خصم المبلغ من الرصيد الافتتاحي للمورد</p>
              </div>
              
              {paymentAmount > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700">
                    الرصيد بعد الخصم: <span className="font-medium">{(selectedSupplier.openingBalance - paymentAmount).toLocaleString('en-US')} ريال</span>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPaymentDialog(false);
              setPaymentAmount(0);
            }}>
              إلغاء
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleProcessPayment}>
              تنفيذ السند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}