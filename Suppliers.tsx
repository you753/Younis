import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Search, Star, FileText, Tags, DollarSign, Calendar, User, Download, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  creditLimit?: string;
  balance?: string;
  openingBalance?: string;
  notes?: string;
}

interface SupplierForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  creditLimit: string;
  balance: string;
  openingBalance: string;
  notes: string;
}

export default function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('قائمة الموردين');
  
  // Category management
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryData, setCategoryData] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [categories, setCategories] = useState([
    { id: 1, name: 'موردي المواد الغذائية', description: 'موردي المنتجات الغذائية والمشروبات', suppliersCount: 5 },
    { id: 2, name: 'موردي الإلكترونيات', description: 'موردي الأجهزة الإلكترونية والتقنية', suppliersCount: 3 },
    { id: 3, name: 'موردي المنظفات', description: 'موردي مواد التنظيف والصحة', suppliersCount: 2 }
  ]);

  // Evaluation management  
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    supplierId: '',
    qualityRating: '5',
    deliveryRating: '5', 
    serviceRating: '5',
    priceRating: '5',
    notes: ''
  });
  const [evaluations, setEvaluations] = useState([
    { id: 1, supplierName: 'خير الله', qualityRating: 4, deliveryRating: 5, serviceRating: 4, priceRating: 3, overallRating: 4, date: '2025-06-20', notes: 'مورد موثوق' },
    { id: 2, supplierName: 'فاطمه252', qualityRating: 5, deliveryRating: 4, serviceRating: 5, priceRating: 4, overallRating: 4.5, date: '2025-06-19', notes: 'خدمة ممتازة' }
  ]);

  // Payment voucher management
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherData, setVoucherData] = useState({
    supplierId: '',
    amount: '',
    paymentMethod: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [vouchers, setVouchers] = useState([]);

  const [formData, setFormData] = useState<SupplierForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    creditLimit: '0',
    balance: '0',
    openingBalance: '0',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: suppliers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // تحميل السندات الحقيقية من الخادم
  useEffect(() => {
    const loadRealVouchers = async () => {
      try {
        const response = await fetch('/api/supplier-payment-vouchers');
        if (response.ok) {
          const realVouchers = await response.json();
          console.log('السندات الحقيقية من الخادم:', realVouchers);
          
          const enrichedVouchers = realVouchers.map((voucher: any) => {
            const supplier = suppliers.find((s: any) => s.id === voucher.supplierId);
            return {
              ...voucher,
              supplierName: supplier?.name || 'غير محدد',
              date: new Date(voucher.paymentDate).toLocaleDateString('en-GB'),
              status: voucher.status === 'paid' ? 'مدفوع' : 'معلق'
            };
          });
          
          console.log('السندات بعد التنسيق:', enrichedVouchers);
          setVouchers(enrichedVouchers);
        }
      } catch (error) {
        console.error('خطأ في تحميل السندات:', error);
      }
    };

    if (suppliers.length > 0) {
      loadRealVouchers();
    }
  }, [suppliers]);

  // Determine current page based on route
  useEffect(() => {
    switch (location) {
      case '/suppliers/add':
        setCurrentPage('إضافة مورد جديد');
        break;

      case '/supplier-evaluation':
        setCurrentPage('تقييم الموردين');
        break;
      case '/supplier-payment-vouchers':
        setCurrentPage('سندات صرف الموردين');
        break;
      default:
        setCurrentPage('قائمة الموردين');
    }
  }, [location]);

  const addMutation = useMutation({
    mutationFn: (data: SupplierForm) =>
      fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setShowForm(false);
      resetForm();
      toast({
        title: "تم إضافة المورد بنجاح",
        description: "تم إضافة المورد الجديد بنجاح",
      });
    },
  });

  // دالة جديدة لحفظ التحديثات
  const saveSupplierUpdate = async () => {
    try {
      if (!editingSupplier) {
        toast({
          title: "خطأ",
          description: "لم يتم تحديد المورد للتعديل",
          variant: "destructive"
        });
        return;
      }

      if (!formData.name?.trim()) {
        toast({
          title: "خطأ",
          description: "اسم المورد مطلوب",
          variant: "destructive"
        });
        return;
      }

      const supplierToUpdate = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        taxNumber: formData.taxNumber?.trim() || null,
        creditLimit: formData.creditLimit || '0',
        balance: formData.balance || '0',
        openingBalance: formData.openingBalance || '0',
        notes: formData.notes?.trim() || null
      };

      const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierToUpdate)
      });

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
        setShowForm(false);
        setEditingSupplier(null);
        resetForm();
        toast({
          title: "تم بنجاح",
          description: "تم تحديث المورد بنجاح"
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل الحفظ');
      }
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || "لم يتم الحفظ",
        variant: "destructive"
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete supplier');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "تم حذف المورد بنجاح",
        description: "تم حذف المورد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المورد",
        description: error.message || "حدث خطأ أثناء حذف المورد",
        variant: "destructive"
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      creditLimit: '0',
      balance: '0',
      openingBalance: '0',
      notes: ''
    });
  };

  const openAddForm = () => {
    resetForm();
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || '',
      creditLimit: supplier.creditLimit || '0',
      balance: supplier.balance || '0',
      openingBalance: supplier.openingBalance || '0',
      notes: supplier.notes || ''
    });
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
      saveSupplierUpdate();
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      deleteMutation.mutate(id);
    }
  };

  // وظائف معالجة الفئات
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowEditCategoryForm(true);
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      const nameInput = document.getElementById('editCategoryName') as HTMLInputElement;
      const descInput = document.getElementById('editCategoryDescription') as HTMLTextAreaElement;
      
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: nameInput.value, description: descInput.value }
          : cat
      ));
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث الفئة بنجاح",
      });
      setShowEditCategoryForm(false);
    }
  };

  // وظائف معالجة التقييمات
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [showEditEvaluationForm, setShowEditEvaluationForm] = useState(false);

  const handleEditEvaluation = (evaluation: any) => {
    setEditingEvaluation(evaluation);
    setShowEditEvaluationForm(true);
  };

  const handleDeleteEvaluation = (evaluationId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      setEvaluations(evaluations.filter(evaluation => evaluation.id !== evaluationId));
      toast({
        title: "تم الحذف",
        description: "تم حذف التقييم بنجاح",
      });
    }
  };

  const handleUpdateEvaluation = () => {
    if (editingEvaluation) {
      const qualityInput = document.getElementById('editQualityRating') as HTMLSelectElement;
      const deliveryInput = document.getElementById('editDeliveryRating') as HTMLSelectElement;
      const serviceInput = document.getElementById('editServiceRating') as HTMLSelectElement;
      const priceInput = document.getElementById('editPriceRating') as HTMLSelectElement;
      const notesInput = document.getElementById('editEvaluationNotes') as HTMLTextAreaElement;
      
      const newQuality = parseInt(qualityInput.value);
      const newDelivery = parseInt(deliveryInput.value);
      const newService = parseInt(serviceInput.value);
      const newPrice = parseInt(priceInput.value);
      const newOverall = (newQuality + newDelivery + newService + newPrice) / 4;
      
      setEvaluations(evaluations.map(evaluation => 
        evaluation.id === editingEvaluation.id 
          ? { 
              ...evaluation, 
              qualityRating: newQuality,
              deliveryRating: newDelivery,
              serviceRating: newService,
              priceRating: newPrice,
              overallRating: newOverall,
              notes: notesInput.value
            }
          : evaluation
      ));
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث التقييم بنجاح",
      });
      setShowEditEvaluationForm(false);
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast({
        title: "تم الحذف",
        description: "تم حذف الفئة بنجاح",
      });
    }
  };

  // حذف سند الصرف
  const handleDeleteVoucher = async (voucher: any) => {
    const supplierName = voucher.supplierName || 'مورد غير محدد';
    const amount = parseFloat(voucher.amount).toLocaleString('en-US') || '0';
    
    if (!confirm(`هل أنت متأكد من حذف السند؟\n\nالسند: ${voucher.voucherNumber}\nالمورد: ${supplierName}\nالمبلغ: ${amount} ريال\n\nسيتم إرجاع المبلغ لرصيد المورد`)) {
      return;
    }

    try {
      const response = await fetch(`/api/supplier-payment-vouchers/${voucher.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف السند');
      }

      // إعادة تحميل السندات
      const vouchersResponse = await fetch('/api/supplier-payment-vouchers');
      if (vouchersResponse.ok) {
        const allVouchers = await vouchersResponse.json();
        const enrichedVouchers = allVouchers.map((v: any) => {
          const supplier = suppliers.find((s: any) => s.id === v.supplierId);
          return {
            ...v,
            supplierName: supplier?.name || 'غير محدد',
            date: new Date(v.paymentDate).toLocaleDateString('en-GB'),
            status: v.status === 'paid' ? 'مدفوع' : 'معلق'
          };
        });
        setVouchers(enrichedVouchers);
      }
      
      // تحديث الموردين
      refetch();
      
      toast({ 
        title: "تم الحذف بنجاح", 
        description: "تم حذف سند الصرف وإرجاع المبلغ لرصيد المورد"
      });
    } catch (error: any) {
      toast({ 
        title: "خطأ في الحذف", 
        description: error.message || "حدث خطأ أثناء حذف السند",
        variant: "destructive"
      });
    }
  };

  // وظيفة طباعة سند الصرف باستخدام التصميم الموحد
  const printPaymentVoucher = async (voucher: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const supplier = suppliers.find(s => s.id === voucher.supplierId);
    
    const getPaymentMethodLabel = (method: string) => {
      const methods = {
        cash: 'نقدي',
        'تحويل بنكي': 'تحويل بنكي',
        bank_transfer: 'تحويل بنكي',
        check: 'شيك',
        credit_card: 'بطاقة ائتمان'
      };
      return methods[method as keyof typeof methods] || method;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>كشف حساب - ${supplier?.name || 'مورد'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
            direction: rtl;
            color: #000;
          }
          
          .statement-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 0;
            background: white;
          }
          
          .header-info {
            padding: 20px;
            border-bottom: 1px solid #000;
            text-align: center;
          }
          
          .supplier-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .supplier-details {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .table-header {
            background: white;
            border-bottom: 1px solid #000;
            text-align: center;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }
          
          .transactions-table th {
            background: white;
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          .transactions-table td {
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-size: 14px;
          }
          
          .final-balance {
            text-align: center;
            padding: 15px;
            border-top: 1px solid #000;
            font-weight: bold;
            font-size: 16px;
          }
          
          @media print {
            body { margin: 0; }
            .statement-container { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="statement-container">
          <!-- معلومات المورد -->
          <div class="header-info">
            <div class="supplier-name">كشف حساب ${supplier?.name || 'المورد'}</div>
            <div class="supplier-details">الاسم: ${supplier?.name || 'غير محدد'}</div>
            <div class="supplier-details">العنوان: ${supplier?.address || 'غير محدد'}</div>
            <div class="supplier-details">رقم الهاتف: ${supplier?.phone || 'غير محدد'}</div>
          </div>
          
          <!-- جدول المعاملات -->
          <table class="transactions-table">
            <thead>
              <tr>
                <th>تاريخ</th>
                <th>الرصيد</th>
                <th>عليه</th>
                <th>له</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(voucher.paymentDate).toLocaleDateString('en-GB')}</td>
                <td>${(parseFloat(supplier?.balance || '0') + parseFloat(voucher.amount)).toLocaleString('en-US')}</td>
                <td>${parseFloat(voucher.amount).toLocaleString('en-US')}</td>
                <td>-</td>
                <td>سند صرف رقم ${voucher.voucherNumber}</td>
              </tr>
              <tr>
                <td>${new Date().toLocaleDateString('en-GB')}</td>
                <td>${parseFloat(supplier?.balance || '0').toLocaleString('en-US')}</td>
                <td>-</td>
                <td>${parseFloat(voucher.amount).toLocaleString('en-US')}</td>
                <td>دفعة نقدية - ${getPaymentMethodLabel(voucher.paymentMethod)}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- الرصيد النهائي -->
          <div class="final-balance">
            الرصيد النهائي: ${parseFloat(supplier?.balance || '0').toLocaleString('en-US')} ريال
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.phone && supplier.phone.includes(searchQuery)) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const getPageContent = () => {
    switch (location) {
      case '/suppliers/add':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">إضافة مورد جديد</h2>
              <p className="text-gray-600">إضافة معلومات مورد جديد إلى النظام</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>بيانات المورد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">اسم المورد *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">الهاتف</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditLimit">الحد الائتماني</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        step="0.01"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="balance">الرصيد</Label>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={addMutation.isPending}>
                      إضافة المورد
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );



      case '/supplier-evaluation':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تقييم الموردين</h2>
                <p className="text-gray-600">تقييم أداء الموردين وجودة الخدمة</p>
              </div>
              <Button onClick={() => setShowEvaluationForm(true)} className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                إضافة تقييم جديد
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>تقييمات الموردين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المورد</TableHead>
                      <TableHead>تقييم الجودة</TableHead>
                      <TableHead>تقييم التسليم</TableHead>
                      <TableHead>تقييم الخدمة</TableHead>
                      <TableHead>تقييم السعر</TableHead>
                      <TableHead>التقييم العام</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">{evaluation.supplierName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {evaluation.qualityRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {evaluation.deliveryRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {evaluation.serviceRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {evaluation.priceRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={evaluation.overallRating >= 4 ? "default" : "secondary"}>
                            {evaluation.overallRating} نجوم
                          </Badge>
                        </TableCell>
                        <TableCell>{evaluation.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditEvaluation(evaluation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
                            >
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

            {/* Add Evaluation Dialog */}
            <Dialog open={showEvaluationForm} onOpenChange={setShowEvaluationForm}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة تقييم جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplierSelect">اختر المورد</Label>
                    <Select value={evaluationData.supplierId} onValueChange={(value) => 
                      setEvaluationData({...evaluationData, supplierId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>تقييم الجودة</Label>
                      <Select value={evaluationData.qualityRating} onValueChange={(value) => 
                        setEvaluationData({...evaluationData, qualityRating: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} نجوم
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تقييم التسليم</Label>
                      <Select value={evaluationData.deliveryRating} onValueChange={(value) => 
                        setEvaluationData({...evaluationData, deliveryRating: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} نجوم
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تقييم الخدمة</Label>
                      <Select value={evaluationData.serviceRating} onValueChange={(value) => 
                        setEvaluationData({...evaluationData, serviceRating: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} نجوم
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تقييم السعر</Label>
                      <Select value={evaluationData.priceRating} onValueChange={(value) => 
                        setEvaluationData({...evaluationData, priceRating: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} نجوم
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={evaluationData.notes}
                      onChange={(e) => setEvaluationData({...evaluationData, notes: e.target.value})}
                      placeholder="ملاحظات حول التقييم"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEvaluationForm(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={() => {
                      const selectedSupplier = suppliers.find((s: any) => s.id.toString() === evaluationData.supplierId);
                      const overallRating = (
                        parseInt(evaluationData.qualityRating) + 
                        parseInt(evaluationData.deliveryRating) + 
                        parseInt(evaluationData.serviceRating) + 
                        parseInt(evaluationData.priceRating)
                      ) / 4;
                      
                      setEvaluations([...evaluations, {
                        id: evaluations.length + 1,
                        supplierName: selectedSupplier?.name || '',
                        qualityRating: parseInt(evaluationData.qualityRating),
                        deliveryRating: parseInt(evaluationData.deliveryRating),
                        serviceRating: parseInt(evaluationData.serviceRating),
                        priceRating: parseInt(evaluationData.priceRating),
                        overallRating,
                        date: new Date().toISOString().split('T')[0],
                        notes: evaluationData.notes
                      }]);
                      
                      setEvaluationData({
                        supplierId: '',
                        qualityRating: '5',
                        deliveryRating: '5',
                        serviceRating: '5',
                        priceRating: '5',
                        notes: ''
                      });
                      setShowEvaluationForm(false);
                      toast({ title: "تم إضافة التقييم بنجاح" });
                    }}>
                      إضافة التقييم
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Evaluation Dialog */}
            <Dialog open={showEditEvaluationForm} onOpenChange={setShowEditEvaluationForm}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>تعديل التقييم</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editQualityRating">تقييم الجودة</Label>
                    <Select defaultValue={editingEvaluation?.qualityRating?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} نجوم
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editDeliveryRating">تقييم التسليم</Label>
                    <Select defaultValue={editingEvaluation?.deliveryRating?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} نجوم
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editServiceRating">تقييم الخدمة</Label>
                    <Select defaultValue={editingEvaluation?.serviceRating?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} نجوم
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editPriceRating">تقييم السعر</Label>
                    <Select defaultValue={editingEvaluation?.priceRating?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} نجوم
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editEvaluationNotes">الملاحظات</Label>
                    <Textarea
                      id="editEvaluationNotes"
                      defaultValue={editingEvaluation?.notes || ''}
                      placeholder="أدخل ملاحظاتك..."
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={handleUpdateEvaluation}
                    >
                      حفظ التغييرات
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEditEvaluationForm(false)} 
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      case '/supplier-payment-vouchers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">سندات صرف الموردين</h2>
                <p className="text-gray-600">إدارة سندات الدفع للموردين</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      // إعادة تحميل قائمة السندات من الخادم
                      const vouchersResponse = await fetch('/api/supplier-payment-vouchers');
                      if (vouchersResponse.ok) {
                        const allVouchers = await vouchersResponse.json();
                        const enrichedVouchers = await Promise.all(
                          allVouchers.map(async (v: any) => {
                            const supplier = suppliers.find((s: any) => s.id === v.supplierId);
                            return {
                              ...v,
                              supplierName: supplier?.name || 'غير محدد',
                              date: new Date(v.paymentDate).toLocaleDateString('en-GB'),
                              status: v.status === 'paid' ? 'مدفوع' : 'معلق'
                            };
                          })
                        );
                        setVouchers(enrichedVouchers);
                      }
                      
                      // إعادة تحميل قائمة الموردين
                      refetch();
                      
                      toast({
                        title: "تم إعادة التحميل",
                        description: "تم تحديث البيانات بنجاح"
                      });
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إعادة تحميل البيانات",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة تحميل
                </Button>
                <Button onClick={() => setShowVoucherForm(true)} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  إضافة سند صرف
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>سندات الصرف</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم السند</TableHead>
                      <TableHead>اسم المورد</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {voucher.supplierName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            {voucher.amount.toLocaleString('en-US')} ريال
                          </div>
                        </TableCell>
                        <TableCell>{voucher.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {voucher.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={voucher.status === 'مدفوع' ? "default" : "secondary"}>
                            {voucher.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              title="تعديل السند"
                              onClick={() => {
                                setEditingVoucher(voucher);
                                setVoucherData({
                                  supplierId: voucher.supplierId.toString(),
                                  amount: voucher.amount.toString(),
                                  paymentMethod: voucher.paymentMethod || 'نقدي',
                                  description: voucher.description || '',
                                  paymentDate: voucher.paymentDate || new Date().toISOString().split('T')[0]
                                });
                                setShowVoucherForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              title="طباعة السند"
                              onClick={() => printPaymentVoucher(voucher)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              title="حذف السند"
                              onClick={() => handleDeleteVoucher(voucher)}
                            >
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

            {/* Add Voucher Dialog */}
            <Dialog open={showVoucherForm} onOpenChange={setShowVoucherForm}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة سند صرف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>اختر المورد</Label>
                    <Select value={voucherData.supplierId} onValueChange={(value) => 
                      setVoucherData({...voucherData, supplierId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المبلغ</Label>
                      <Input
                        type="number"
                        value={voucherData.amount}
                        onChange={(e) => setVoucherData({...voucherData, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>طريقة الدفع</Label>
                      <Select value={voucherData.paymentMethod} onValueChange={(value) => 
                        setVoucherData({...voucherData, paymentMethod: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
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
                    />
                  </div>
                  
                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={voucherData.description}
                      onChange={(e) => setVoucherData({...voucherData, description: e.target.value})}
                      placeholder="وصف سند الصرف"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setShowVoucherForm(false);
                      setEditingVoucher(null);
                      setVoucherData({
                        supplierId: '',
                        amount: '',
                        paymentMethod: 'نقدي',
                        description: '',
                        paymentDate: new Date().toISOString().split('T')[0]
                      });
                    }}>
                      إلغاء
                    </Button>
                    <Button onClick={async () => {
                      const selectedSupplier = suppliers.find((s: any) => s.id.toString() === voucherData.supplierId);
                      const voucherNumber = `PV-${String(Date.now()).slice(-6)}`;
                      const amount = parseFloat(voucherData.amount);
                      
                      // إضافة السند للقائمة
                      setVouchers([...vouchers, {
                        id: vouchers.length + 1,
                        voucherNumber,
                        supplierName: selectedSupplier?.name || '',
                        amount,
                        paymentMethod: voucherData.paymentMethod,
                        date: voucherData.date,
                        status: 'مدفوع'
                      }]);
                      
                      // إضافة سند صرف إلى قاعدة البيانات
                      if (selectedSupplier) {
                        try {
                          // إضافة سند صرف
                          await fetch('/api/supplier-payment-vouchers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              supplierId: selectedSupplier.id,
                              voucherNumber: voucherNumber,
                              amount: amount.toString(),
                              paymentMethod: voucherData.paymentMethod,
                              paymentDate: voucherData.date,
                              description: voucherData.description,
                              status: 'paid'
                            }),
                          });
                          
                          // تحديث قائمة الموردين في الواجهة
                          queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
                          
                          toast({ 
                            title: "تم إضافة سند الصرف بنجاح", 
                            description: `تم خصم ${amount.toLocaleString('en-US')} ريال من الرصيد الحالي للمورد`
                          });
                        } catch (error) {
                          toast({ 
                            title: "خطأ في إضافة سند الصرف", 
                            description: "فشل في إضافة سند الصرف",
                            variant: "destructive"
                          });
                        }
                      }
                      
                      setVoucherData({
                        supplierId: '',
                        amount: '',
                        paymentMethod: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0]
                      });
                      setShowVoucherForm(false);
                    }}>
                      إضافة السند
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      default:
        return renderSuppliersTable();
    }
  };

  const renderSuppliersTable = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الموردين</h1>
            <p className="text-gray-600">إدارة قائمة الموردين</p>
          </div>
        </div>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مورد جديد
        </Button>
      </div>

      {/* جدول الموردين */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة الموردين ({suppliers.length} مورد)</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن مورد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الرصيد الافتتاحي</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier: Supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {supplier.phone || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {supplier.email || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {parseFloat(supplier.openingBalance || '0').toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR' 
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={parseFloat(supplier.balance || '0') >= 0 ? "default" : "destructive"}>
                        {parseFloat(supplier.balance || '0').toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR' 
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">نشط</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supplier.id)}
                          title="حذف المورد"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد موردين حتى الآن
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {getPageContent()}
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المورد *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="creditLimit">الحد الائتماني</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="balance">الرصيد الحالي</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={addMutation.isPending}
              >
                {editingSupplier ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}