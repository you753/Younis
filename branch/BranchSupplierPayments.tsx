import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Receipt, DollarSign, Calendar, Search, Plus, Eye, Trash2, Printer, Edit, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface Supplier {
  id: number;
  name: string;
  code: string;
}

interface PaymentVoucher {
  id: number;
  voucherNumber: string;
  supplierId: number;
  supplier: Supplier;
  amount: number;
  paymentMethod: string;
  date: string;
  description: string;
  status: string;
  referenceNumber?: string;
  notes?: string;
}

interface BranchSupplierPaymentsProps {
  branchId?: number;
}

export default function BranchSupplierPayments({ branchId }: BranchSupplierPaymentsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [showNewVoucherDialog, setShowNewVoucherDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<PaymentVoucher | null>(null);
  const [branch, setBranch] = useState<any>(null);
  const [supplierComboOpen, setSupplierComboOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  
  const [voucherData, setVoucherData] = useState({
    supplierId: '',
    amount: '',
    paymentMethod: 'نقدي',
    date: new Date().toISOString().split('T')[0],
    description: '',
    referenceNumber: '',
    notes: ''
  });
  
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadData();
    loadBranchData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const loadBranchData = async () => {
    if (!branchId) return;
    try {
      const response = await fetch(`/api/branches/${branchId}`);
      if (response.ok) {
        const branchData = await response.json();
        setBranch(branchData);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات الفرع:', error);
    }
  };

  const loadData = async () => {
    if (!branchId) return;
    try {
      const [vouchersRes, suppliersRes] = await Promise.all([
        fetch(`/api/supplier-payment-vouchers${branchId ? `?branchId=${branchId}` : ''}`),
        fetch(`/api/suppliers${branchId ? `?branchId=${branchId}` : ''}`)
      ]);
      
      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        const formattedSuppliers = suppliersData.map((s: any) => ({
          id: s.id,
          name: s.name,
          code: `SUP${String(s.id).padStart(3, '0')}`
        }));
        setSuppliers(formattedSuppliers);
        
        if (vouchersRes.ok) {
          const vouchersData = await vouchersRes.json();
          console.log('سندات الصرف المستلمة:', vouchersData);
          console.log('عدد السندات:', vouchersData.length);
          const formattedVouchers = vouchersData.map((v: any) => ({
            ...v,
            supplierId: v.supplier_id,
            supplier: {
              id: v.supplier_id,
              name: suppliersData.find((s: any) => s.id === v.supplier_id)?.name || v.supplier_name || 'مورد غير محدد',
              code: `SUP${String(v.supplier_id).padStart(3, '0')}`
            }
          }));
          setPaymentVouchers(formattedVouchers);
          console.log('السندات المعالجة:', formattedVouchers);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  const filteredVouchers = paymentVouchers.filter(voucher => {
    const matchesSearch = voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || voucher.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedVouchers,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredVouchers,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, filterStatus, filterPaymentMethod]
  });

  const handleCreateVoucher = async () => {
    if (!voucherData.supplierId || !voucherData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء المورد والمبلغ",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const payload = {
        supplierId: parseInt(voucherData.supplierId),
        amount: parseFloat(voucherData.amount),
        paymentMethod: voucherData.paymentMethod,
        paymentDate: voucherData.date,
        description: voucherData.description || 'دفعة للمورد',
        reference: voucherData.referenceNumber || null,
        notes: voucherData.notes || null,
        status: 'confirmed',
        branchId: branchId  // ✅ إضافة branchId
      };

      const response = await fetch('/api/supplier-payment-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('فشل في حفظ سند الصرف');

      toast({
        title: "تم بنجاح",
        description: "تم حفظ سند الصرف",
      });
      
      setShowNewVoucherDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ السند",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (voucher: PaymentVoucher) => {
    setEditingVoucher(voucher);
    
    // تحويل التاريخ للصيغة الصحيحة YYYY-MM-DD
    let formattedDate = '';
    if (voucher.date) {
      const dateObj = new Date(voucher.date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }
    
    setVoucherData({
      supplierId: voucher.supplierId.toString(),
      amount: voucher.amount.toString(),
      paymentMethod: voucher.paymentMethod,
      date: formattedDate || new Date().toISOString().split('T')[0],
      description: voucher.description,
      referenceNumber: voucher.referenceNumber || '',
      notes: voucher.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateVoucher = async () => {
    if (!editingVoucher || !voucherData.supplierId || !voucherData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء المورد والمبلغ",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const payload = {
        supplierId: parseInt(voucherData.supplierId),
        amount: parseFloat(voucherData.amount),
        paymentMethod: voucherData.paymentMethod,
        paymentDate: voucherData.date,
        description: voucherData.description || 'دفعة للمورد',
        reference: voucherData.referenceNumber || null,
        notes: voucherData.notes || null,
        status: 'confirmed',
        branchId: branchId  // ✅ الحفاظ على branchId عند التعديل
      };

      const response = await fetch(`/api/supplier-payment-vouchers/${editingVoucher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('فشل في تحديث سند الصرف');

      toast({
        title: "تم بنجاح",
        description: "تم تحديث سند الصرف",
      });
      
      setShowEditDialog(false);
      setEditingVoucher(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث السند",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (voucher: PaymentVoucher) => {
    if (!confirm(`هل تريد حذف سند الصرف ${voucher.voucherNumber}؟`)) return;
    
    try {
      const response = await fetch(`/api/supplier-payment-vouchers/${voucher.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('فشل في حذف السند');

      toast({
        title: "تم بنجاح",
        description: "تم حذف السند",
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف السند",
        variant: "destructive"
      });
    }
  };

  const handlePrint = (voucher: PaymentVoucher) => {
    const branchName = branch?.name || '';
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>سند صرف - ${voucher.voucherNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              padding: 30px; 
              line-height: 1.6;
              color: #333;
            }
            .voucher-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #333;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 3px double #333;
            }
            .branch-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #2563eb;
            }
            .header h1 {
              font-size: 28px;
              margin-bottom: 10px;
              color: #000;
            }
            .voucher-number {
              font-size: 16px;
              font-weight: bold;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 12px;
              text-align: right;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              width: 30%;
            }
            td {
              background-color: #fff;
            }
            .amount-row td {
              font-size: 18px;
              font-weight: bold;
              color: #000;
            }
            .notes-section {
              margin-top: 20px;
              padding: 15px;
              border: 1px solid #333;
              background-color: #f9f9f9;
              min-height: 80px;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 8px;
              color: #000;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 60px;
              padding-top: 8px;
            }
            @media print { 
              body { padding: 15px; }
              .voucher-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="voucher-container">
            <div class="header">
              ${branchName ? `<div class="branch-name">${branchName}</div>` : ''}
              <h1>سند صرف</h1>
              <div class="voucher-number">رقم السند: ${voucher.voucherNumber}</div>
            </div>

            <table>
              <tr>
                <th>التاريخ</th>
                <td>${voucher.date}</td>
              </tr>
              <tr>
                <th>اسم المورد</th>
                <td>${voucher.supplier.name}</td>
              </tr>
              <tr>
                <th>كود المورد</th>
                <td>${voucher.supplier.code}</td>
              </tr>
              <tr class="amount-row">
                <th>المبلغ المدفوع</th>
                <td>${voucher.amount.toLocaleString('en-US')} ريال سعودي</td>
              </tr>
              <tr>
                <th>طريقة الدفع</th>
                <td>${voucher.paymentMethod}</td>
              </tr>
              ${voucher.referenceNumber ? `
              <tr>
                <th>رقم المرجع</th>
                <td>${voucher.referenceNumber}</td>
              </tr>
              ` : ''}
              <tr>
                <th>الوصف</th>
                <td>${voucher.description}</td>
              </tr>
            </table>

            ${voucher.notes ? `
            <div class="notes-section">
              <div class="notes-title">ملاحظات:</div>
              <div>${voucher.notes}</div>
            </div>
            ` : ''}

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">المستلم</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">المحاسب</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setVoucherData({
      supplierId: '',
      amount: '',
      paymentMethod: 'نقدي',
      date: new Date().toISOString().split('T')[0],
      description: '',
      referenceNumber: '',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      confirmed: { label: 'مؤكد', className: 'bg-green-100 text-green-800' },
      pending: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'فشل', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.confirmed;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const totalAmount = filteredVouchers.reduce((sum, v) => sum + Number(v.amount), 0);
  const confirmedCount = paymentVouchers.filter(v => v.status === 'confirmed').length;
  const pendingCount = paymentVouchers.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">سندات الصرف</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowNewVoucherDialog(true)}
          data-testid="button-new-voucher"
        >
          <Plus className="h-4 w-4 ml-2" />
          سند صرف جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-purple-600">{totalAmount.toLocaleString('en-US')} ريال</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">سندات مؤكدة</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث برقم السند أو اسم المورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          data-testid="select-status"
        >
          <option value="all">كل الحالات</option>
          <option value="confirmed">مؤكد</option>
          <option value="pending">قيد المراجعة</option>
          <option value="failed">فشل</option>
        </select>
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          data-testid="select-payment-method"
        >
          <option value="all">كل طرق الدفع</option>
          <option value="نقدي">نقدي</option>
          <option value="تحويل بنكي">تحويل بنكي</option>
          <option value="شيك">شيك</option>
          <option value="بطاقة ائتمان">بطاقة ائتمان</option>
        </select>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              قائمة سندات الصرف ({filteredVouchers.length})
            </CardTitle>
            <Badge variant="outline" className="bg-white">
              إجمالي: {totalAmount.toLocaleString('en-US')} ريال
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-right p-4 font-semibold text-gray-700">رقم السند</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المورد</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">طريقة الدفع</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVouchers.map((voucher, index) => (
                  <tr 
                    key={voucher.id} 
                    className={`border-b hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    data-testid={`row-voucher-${voucher.id}`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-purple-600">{voucher.voucherNumber}</div>
                      <div className="text-xs text-gray-500">{voucher.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{voucher.supplier.name}</div>
                      <div className="text-sm text-gray-500">{voucher.supplier.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-purple-600">
                        {voucher.amount.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {voucher.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{voucher.date}</div>
                    </td>
                    <td className="p-4">{getStatusBadge(voucher.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handlePrint(voucher)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          title="طباعة"
                          data-testid={`button-print-${voucher.id}`}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(voucher)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          title="تعديل"
                          data-testid={`button-edit-${voucher.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(voucher)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          title="حذف"
                          data-testid={`button-delete-${voucher.id}`}
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
          
          {filteredVouchers.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد سندات صرف</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على سندات صرف مطابقة للبحث</p>
              <Button 
                onClick={() => setShowNewVoucherDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إنشاء سند جديد
              </Button>
            </div>
          )}

          {filteredVouchers.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredVouchers.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemName="سند دفع"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewVoucherDialog} onOpenChange={setShowNewVoucherDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء سند صرف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المورد *</Label>
              <Popover open={supplierComboOpen} onOpenChange={setSupplierComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={supplierComboOpen}
                    className="w-full justify-between h-11"
                    data-testid="select-supplier"
                  >
                    {voucherData.supplierId
                      ? suppliers.find((supplier) => supplier.id.toString() === voucherData.supplierId)?.name
                      : "ابحث عن المورد..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="ابحث عن المورد..." 
                      value={supplierSearchTerm}
                      onValueChange={setSupplierSearchTerm}
                      className="h-11"
                    />
                    <CommandEmpty>لا توجد نتائج</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {suppliers
                        .filter((supplier) => 
                          supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                          supplier.code?.toLowerCase().includes(supplierSearchTerm.toLowerCase())
                        )
                        .map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                              setVoucherData({...voucherData, supplierId: supplier.id.toString()});
                              setSupplierComboOpen(false);
                              setSupplierSearchTerm('');
                            }}
                            className="flex items-center justify-between py-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Check
                                className={`h-4 w-4 ${
                                  voucherData.supplierId === supplier.id.toString() ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div>
                                <div className="font-medium">{supplier.name}</div>
                                <div className="text-sm text-gray-500">{supplier.code}</div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المبلغ (ريال) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={voucherData.amount}
                  onChange={(e) => setVoucherData({...voucherData, amount: e.target.value})}
                  data-testid="input-amount"
                />
              </div>
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={voucherData.paymentMethod} onValueChange={(value) => setVoucherData({...voucherData, paymentMethod: value})}>
                  <SelectTrigger data-testid="select-payment-method-dialog">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={voucherData.date}
                onChange={(e) => setVoucherData({...voucherData, date: e.target.value})}
                data-testid="input-date"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                placeholder="وصف الدفعة"
                value={voucherData.description}
                onChange={(e) => setVoucherData({...voucherData, description: e.target.value})}
                data-testid="input-description"
              />
            </div>

            <div>
              <Label>رقم المرجع</Label>
              <Input
                placeholder="رقم المرجع (اختياري)"
                value={voucherData.referenceNumber}
                onChange={(e) => setVoucherData({...voucherData, referenceNumber: e.target.value})}
                data-testid="input-reference"
              />
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات إضافية"
                value={voucherData.notes}
                onChange={(e) => setVoucherData({...voucherData, notes: e.target.value})}
                data-testid="input-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVoucherDialog(false)} data-testid="button-cancel">
              إلغاء
            </Button>
            <Button onClick={handleCreateVoucher} data-testid="button-save">
              حفظ السند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل سند الصرف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المورد *</Label>
              <Select value={voucherData.supplierId} onValueChange={(value) => setVoucherData({...voucherData, supplierId: value})}>
                <SelectTrigger data-testid="select-supplier-edit">
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name} - {supplier.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المبلغ (ريال) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={voucherData.amount}
                  onChange={(e) => setVoucherData({...voucherData, amount: e.target.value})}
                  data-testid="input-amount-edit"
                />
              </div>
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={voucherData.paymentMethod} onValueChange={(value) => setVoucherData({...voucherData, paymentMethod: value})}>
                  <SelectTrigger data-testid="select-payment-method-edit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                    <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={voucherData.date}
                onChange={(e) => setVoucherData({...voucherData, date: e.target.value})}
                data-testid="input-date-edit"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                placeholder="وصف الدفعة"
                value={voucherData.description}
                onChange={(e) => setVoucherData({...voucherData, description: e.target.value})}
                data-testid="input-description-edit"
              />
            </div>

            <div>
              <Label>رقم المرجع</Label>
              <Input
                placeholder="رقم المرجع (اختياري)"
                value={voucherData.referenceNumber}
                onChange={(e) => setVoucherData({...voucherData, referenceNumber: e.target.value})}
                data-testid="input-reference-edit"
              />
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات إضافية"
                value={voucherData.notes}
                onChange={(e) => setVoucherData({...voucherData, notes: e.target.value})}
                data-testid="input-notes-edit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDialog(false);
                setEditingVoucher(null);
                resetForm();
              }} 
              data-testid="button-cancel-edit"
            >
              إلغاء
            </Button>
            <Button onClick={handleUpdateVoucher} data-testid="button-update">
              تحديث السند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل سند الصرف</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">رقم السند</p>
                  <p className="font-medium">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">التاريخ</p>
                  <p className="font-medium">{selectedVoucher.date}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">المورد</p>
                <p className="font-medium">{selectedVoucher.supplier.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">المبلغ</p>
                  <p className="font-bold text-purple-600">{selectedVoucher.amount.toLocaleString('en-US')} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">طريقة الدفع</p>
                  <p className="font-medium">{selectedVoucher.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">الوصف</p>
                <p className="font-medium">{selectedVoucher.description}</p>
              </div>
              
              {selectedVoucher.notes && (
                <div>
                  <p className="text-sm text-gray-600">ملاحظات</p>
                  <p className="font-medium">{selectedVoucher.notes}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                {getStatusBadge(selectedVoucher.status)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)} data-testid="button-close-preview">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
