import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import SupplierForm from '@/components/forms/SupplierForm';
import SuppliersTable from '@/components/tables/SuppliersTable';
import SupplierPaymentVoucherForm from '@/components/forms/SupplierPaymentVoucherForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, Star, Edit, Trash2, Save, Building, Search, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import SearchBox from '@/components/SearchBox';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for supplier category
const supplierCategorySchema = z.object({
  name: z.string().min(2, 'اسم الفئة يجب أن يكون على الأقل حرفين'),
  description: z.string().optional(),
});

// Schema for supplier evaluation
const supplierEvaluationSchema = z.object({
  supplierId: z.number().min(1, 'يجب اختيار مورد'),
  rating: z.number().min(1).max(5, 'التقييم يجب أن يكون من 1 إلى 5'),
  qualityRating: z.number().min(1).max(5),
  deliveryRating: z.number().min(1).max(5),
  priceRating: z.number().min(1).max(5),
  serviceRating: z.number().min(1).max(5),
  notes: z.string().optional(),
});

type SupplierCategoryForm = z.infer<typeof supplierCategorySchema>;
type SupplierEvaluationForm = z.infer<typeof supplierEvaluationSchema>;

export default function Suppliers() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showPaymentVoucherForm, setShowPaymentVoucherForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingPaymentVoucher, setEditingPaymentVoucher] = useState<any>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categoryForm = useForm<SupplierCategoryForm>({
    resolver: zodResolver(supplierCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const evaluationForm = useForm<SupplierEvaluationForm>({
    resolver: zodResolver(supplierEvaluationSchema),
    defaultValues: {
      supplierId: 0,
      rating: 5,
      qualityRating: 5,
      deliveryRating: 5,
      priceRating: 5,
      serviceRating: 5,
      notes: '',
    }
  });

  // Fetch data
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
  });

  const { data: paymentVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/supplier-payment-vouchers'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/supplier-categories'],
    enabled: location === '/supplier-categories'
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['/api/supplier-evaluations'],
    enabled: location === '/supplier-evaluation'
  });

  // فلترة الموردين بناءً على البحث المحلي
  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((supplier: any) => {
    if (!localSearchQuery.trim()) return true;
    
    const searchTerms = localSearchQuery.toLowerCase().trim().split(' ');
    const searchText = `${supplier.name || ''} ${supplier.phone || ''} ${supplier.email || ''} ${supplier.address || ''} ${supplier.category || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  // Set page title based on route
  useEffect(() => {
    switch (location) {
      case '/suppliers/add':
        setCurrentPage('إضافة مورد جديد');
        break;
      case '/supplier-categories':
        setCurrentPage('فئات الموردين');
        break;
      case '/supplier-evaluation':
        setCurrentPage('تقييم الموردين');
        break;
      case '/supplier-payment-vouchers':
        setCurrentPage('سندات صرف الموردين');
        break;
      default:
        setCurrentPage('إدارة الموردين');
    }
  }, [location, setCurrentPage]);

  // Payment voucher handlers
  const handleAddPaymentVoucher = (supplierId?: number) => {
    setSelectedSupplierId(supplierId);
    setEditingPaymentVoucher(null);
    setShowPaymentVoucherForm(true);
  };

  const handleEditPaymentVoucher = (voucher: any) => {
    setEditingPaymentVoucher(voucher);
    setSelectedSupplierId(voucher.supplierId);
    setShowPaymentVoucherForm(true);
  };

  const handleDeletePaymentVoucher = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف سند الصرف؟')) {
      try {
        const response = await fetch(`/api/supplier-payment-vouchers/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete payment voucher');
        
        queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
        toast({
          title: "تم حذف سند الصرف بنجاح",
          description: "تم حذف سند الصرف من النظام",
        });
      } catch (error) {
        console.error('Error deleting payment voucher:', error);
        toast({
          title: "خطأ في حذف سند الصرف",
          description: "حدث خطأ أثناء حذف سند الصرف",
          variant: "destructive",
        });
      }
    }
  };

  // Excel Import Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف Excel أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    const formData = new FormData();
    formData.append('excel', selectedFile);

    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/suppliers/import-excel', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في استيراد الملف');
      }

      setImportResults(result);
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });

      toast({
        title: "تم الاستيراد بنجاح",
        description: result.message,
      });

    } catch (error) {
      console.error('Error importing Excel:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء استيراد الملف',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportDialog = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
    setImportProgress(0);
    setImportResults(null);
    setIsImporting(false);
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        'اسم المورد': 'مورد تجريبي',
        'الهاتف': '0501234567',
        'البريد الإلكتروني': 'supplier@example.com',
        'العنوان': 'الرياض، المملكة العربية السعودية',
        'الرقم الضريبي': '123456789',
        'الشخص المسؤول': 'أحمد محمد',
        'ملاحظات': 'مورد موثوق'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الموردين');
    
    const colWidths = [
      { width: 20 }, { width: 15 }, { width: 25 }, 
      { width: 30 }, { width: 15 }, { width: 20 }, { width: 30 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'نموذج_استيراد_الموردين.xlsx');
  };

  const getPageContent = () => {
    switch (location) {
      case '/suppliers/add':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">إضافة مورد جديد</h2>
              <p className="text-gray-600">إضافة معلومات مورد جديد إلى النظام</p>
            </div>
            <SupplierForm />
          </div>
        );

      case '/supplier-categories':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">فئات الموردين</h2>
                <p className="text-gray-600">تصنيف الموردين حسب النوع والتخصص</p>
              </div>
              <Button onClick={() => setShowCategoryForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة فئة جديدة
              </Button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'موردو الإلكترونيات', count: 5, description: 'أجهزة كمبيوتر ولوازم إلكترونية' },
                { name: 'موردو الأثاث', count: 3, description: 'أثاث مكتبي ومنزلي' },
                { name: 'موردو المواد الخام', count: 8, description: 'مواد خام للإنتاج' },
                { name: 'موردو الخدمات', count: 2, description: 'خدمات الصيانة والاستشارات' }
              ].map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Category Form Dialog */}
            <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فئة موردين جديدة</DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الفئة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم الفئة" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="وصف الفئة" />
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
                      <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        );

      case '/supplier-evaluation':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تقييم الموردين</h2>
                <p className="text-gray-600">تقييم أداء الموردين في مختلف المجالات</p>
              </div>
              <Button onClick={() => setShowEvaluationForm(true)} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة تقييم جديد
              </Button>
            </div>

            {/* Supplier Ratings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier: any) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{supplier.name}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-bold">4.2</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">الجودة</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">التسليم</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= 5 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">السعر</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= 3 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">الخدمة</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <Edit className="h-4 w-4 ml-1" />
                      تحديث التقييم
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Evaluation Form Dialog */}
            <Dialog open={showEvaluationForm} onOpenChange={setShowEvaluationForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>تقييم مورد</DialogTitle>
                </DialogHeader>
                <Form {...evaluationForm}>
                  <form className="space-y-4">
                    <FormField
                      control={evaluationForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المورد</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المورد" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier: any) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={evaluationForm.control}
                        name="qualityRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تقييم الجودة</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر التقييم" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1,2,3,4,5].map(rating => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    {rating} نجوم
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={evaluationForm.control}
                        name="deliveryRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تقييم التسليم</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر التقييم" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1,2,3,4,5].map(rating => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    {rating} نجوم
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={evaluationForm.control}
                        name="priceRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تقييم السعر</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر التقييم" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1,2,3,4,5].map(rating => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    {rating} نجوم
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={evaluationForm.control}
                        name="serviceRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تقييم الخدمة</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر التقييم" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1,2,3,4,5].map(rating => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    {rating} نجوم
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={evaluationForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ملاحظات</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="ملاحظات إضافية حول التقييم" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 ml-1" />
                        حفظ التقييم
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowEvaluationForm(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </Form>
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
                <p className="text-gray-600">إدارة سندات الصرف للموردين ومتابعة المدفوعات</p>
              </div>
              <Button onClick={() => handleAddPaymentVoucher()} className="btn-accounting-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة سند صرف
              </Button>
            </div>

            {/* Payment Vouchers Table */}
            <Card>
              <CardHeader>
                <CardTitle>سندات الصرف</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم السند</TableHead>
                      <TableHead>المورد</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>تاريخ الدفع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(paymentVouchers) && paymentVouchers.length > 0 ? (
                      paymentVouchers.map((voucher: any) => {
                        const supplier = suppliers.find((s: any) => s.id === voucher.supplierId);
                        const getStatusBadge = (status: string) => {
                          switch (status) {
                            case 'pending': return <Badge variant="secondary">في الانتظار</Badge>;
                            case 'approved': return <Badge variant="default">معتمد</Badge>;
                            case 'paid': return <Badge variant="default" className="bg-green-100 text-green-800">مدفوع</Badge>;
                            case 'cancelled': return <Badge variant="destructive">ملغي</Badge>;
                            default: return <Badge variant="secondary">{status}</Badge>;
                          }
                        };

                        const getPaymentMethodLabel = (method: string) => {
                          switch (method) {
                            case 'cash': return 'نقدي';
                            case 'bank_transfer': return 'تحويل بنكي';
                            case 'check': return 'شيك';
                            case 'credit_card': return 'بطاقة ائتمان';
                            default: return method;
                          }
                        };

                        return (
                          <TableRow key={voucher.id}>
                            <TableCell className="font-medium">#{voucher.voucherNumber}</TableCell>
                            <TableCell>{supplier?.name || 'غير محدد'}</TableCell>
                            <TableCell>{parseFloat(voucher.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</TableCell>
                            <TableCell>{getPaymentMethodLabel(voucher.paymentMethod)}</TableCell>
                            <TableCell>{voucher.paymentDate ? new Date(voucher.paymentDate).toLocaleDateString('en-GB') : '-'}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPaymentVoucher(voucher)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePaymentVoucher(voucher.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          لا توجد سندات صرف حتى الآن
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الموردين</h2>
                <p className="text-gray-600">إضافة وإدارة معلومات الموردين وحساباتهم</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowImportDialog(true)} 
                  variant="outline" 
                  className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                >
                  <Upload className="ml-2 h-4 w-4" />
                  استيراد من Excel
                </Button>
                <OnboardingTrigger tourName="suppliers" />
              </div>
            </div>

            {/* شريط البحث المحلي */}
            <Card>
              <CardContent className="p-4">
                <SearchBox
                  placeholder="البحث عن مورد (الاسم، الهاتف، البريد الإلكتروني...)"
                  value={localSearchQuery}
                  onChange={setLocalSearchQuery}
                  className="max-w-md"
                />
                {localSearchQuery && (
                  <div className="mt-3 text-sm text-gray-600">
                    النتائج: {filteredSuppliers.length} من أصل {suppliers.length} مورد
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نتائج البحث */}
            {localSearchQuery && filteredSuppliers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>نتائج البحث ({filteredSuppliers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredSuppliers.map((supplier) => (
                      <div 
                        key={supplier.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 text-right">
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">
                            {supplier.phone && <span>📞 {supplier.phone}</span>}
                            {supplier.phone && supplier.email && <span className="mx-2">•</span>}
                            {supplier.email && <span>✉️ {supplier.email}</span>}
                          </div>
                          {supplier.address && (
                            <div className="text-xs text-gray-400 mt-1">📍 {supplier.address}</div>
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
            {localSearchQuery && filteredSuppliers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-3">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 mb-4">لم نجد أي موردين يطابقون البحث "{localSearchQuery}"</p>
                  <Button variant="outline" onClick={() => setLocalSearchQuery('')}>
                    مسح البحث
                  </Button>
                </CardContent>
              </Card>
            )}

            <div data-onboarding="add-supplier">
              <SupplierForm />
            </div>
            {!localSearchQuery && (
              <div data-onboarding="suppliers-table">
                <SuppliersTable />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      {getPageContent()}
      
      {/* Payment Voucher Form */}
      <SupplierPaymentVoucherForm
        isOpen={showPaymentVoucherForm}
        onClose={() => {
          setShowPaymentVoucherForm(false);
          setEditingPaymentVoucher(null);
          setSelectedSupplierId(undefined);
        }}
        supplierId={selectedSupplierId}
        editingVoucher={editingPaymentVoucher}
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        title="استيراد الموردين من Excel"
        instructions="يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية: اسم المورد، الهاتف، البريد الإلكتروني، العنوان، الرقم الضريبي، الشخص المسؤول، ملاحظات"
        apiEndpoint="/api/suppliers/import-excel"
        templateData={[{
          'اسم المورد': 'مورد تجريبي',
          'الهاتف': '0501234567',
          'البريد الإلكتروني': 'supplier@example.com',
          'العنوان': 'الرياض، المملكة العربية السعودية',
          'الرقم الضريبي': '123456789',
          'الشخص المسؤول': 'أحمد محمد',
          'ملاحظات': 'مورد موثوق'
        }]}
        templateName="نموذج_استيراد_الموردين.xlsx"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] })}
      />
    </div>
  );
}
