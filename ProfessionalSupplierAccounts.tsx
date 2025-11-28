import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Receipt,
  Building2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import ProfessionalSupplierPaymentVoucher from '@/components/ProfessionalSupplierPaymentVoucher';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  balance: number;
  creditLimit: number;
  accountType: string;
  status: string;
  createdAt: string;
}

interface SupplierTransaction {
  id: number;
  supplierId: number;
  type: 'purchase' | 'payment' | 'return' | 'adjustment';
  amount: number;
  description: string;
  date: string;
  reference: string;
  balanceAfter: number;
}

interface PaymentVoucher {
  id: number;
  supplierId: number;
  voucherNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ProfessionalSupplierAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<PaymentVoucher | null>(null);

  // جلب بيانات الموردين
  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    refetchInterval: 2000,
  });

  // جلب بيانات سندات الصرف
  const { data: paymentVouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
    refetchInterval: 2000,
  });

  // جلب معاملات مورد محدد
  const { data: supplierTransactions = [] } = useQuery({
    queryKey: ['/api/supplier-transactions', selectedSupplier?.id],
    enabled: !!selectedSupplier,
  });

  // إحصائيات شاملة
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 'active').length;
  const totalOutstanding = suppliers.reduce((sum: number, s: Supplier) => sum + (s.balance || 0), 0);
  const averageBalance = totalSuppliers > 0 ? totalOutstanding / totalSuppliers : 0;
  const overdueSuppliers = suppliers.filter((s: Supplier) => (s.balance || 0) > (s.creditLimit || 0)).length;
  const totalPaymentsThisMonth = paymentVouchers
    .filter((v: PaymentVoucher) => new Date(v.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum: number, v: PaymentVoucher) => sum + parseFloat(v.amount), 0);

  // تصفية وترتيب البيانات
  const filteredSuppliers = suppliers
    .filter((supplier: Supplier) => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.phone.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
      const matchesAccountType = filterAccountType === 'all' || supplier.accountType === filterAccountType;
      
      return matchesSearch && matchesStatus && matchesAccountType;
    })
    .sort((a: Supplier, b: Supplier) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        case 'openingBalance':
          aValue = a.openingBalance || 0;
          bValue = b.openingBalance || 0;
          break;
        case 'creditLimit':
          aValue = a.creditLimit || 0;
          bValue = b.creditLimit || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  // إنشاء سند صرف جديد
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/supplier-payment-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error('فشل في إنشاء سند الصرف');
      return response.json();
    },
    onSuccess: (newPayment) => {
      toast({
        title: "نجح",
        description: "تم إنشاء سند الصرف بنجاح",
      });
      setShowPaymentDialog(false);
      setPaymentAmount('');
      setPaymentNotes('');
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      
      // طباعة الفاتورة تلقائياً
      setSelectedPaymentForPrint(newPayment);
      setTimeout(() => {
        setShowPrintDialog(true);
      }, 500);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند الصرف",
        variant: "destructive",
      });
    },
  });

  const handleCreatePayment = () => {
    if (!selectedSupplier || !paymentAmount) return;

    const paymentData = {
      supplierId: selectedSupplier.id,
      amount: parseFloat(paymentAmount),
      paymentMethod,
      description: paymentNotes,
      paymentDate: new Date().toISOString().split('T')[0],
      voucherNumber: `PAY-${Date.now()}`,
      status: 'completed'
    };

    createPaymentMutation.mutate(paymentData);
  };

  const refreshData = async () => {
    await Promise.all([
      refetchSuppliers(),
    ]);
    toast({
      title: "تم التحديث",
      description: "تم تحديث البيانات بنجاح",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'نشط', variant: 'default' as const },
      'inactive': { label: 'غير نشط', variant: 'secondary' as const },
      'blocked': { label: 'محظور', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getAccountTypeBadge = (type: string) => {
    const typeMap = {
      'credit': { label: 'آجل', variant: 'default' as const },
      'cash': { label: 'نقدي', variant: 'secondary' as const },
      'mixed': { label: 'مختلط', variant: 'outline' as const }
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  if (suppliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* العنوان والإجراءات الرئيسية */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين</h1>
          <p className="text-gray-600 mt-1">إدارة شاملة لحسابات الموردين والمعاملات المالية</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث البيانات
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير Excel
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-2" />
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الموردين</p>
                <p className="text-3xl font-bold">{totalSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">الموردين النشطين</p>
                <p className="text-3xl font-bold">{activeSuppliers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي المستحقات</p>
                <p className="text-2xl font-bold">{totalOutstanding.toLocaleString('en-US')} ر.س</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">مدفوعات هذا الشهر</p>
                <p className="text-2xl font-bold">{totalPaymentsThisMonth.toLocaleString('en-US')} ر.س</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              متوسط الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {averageBalance.toLocaleString('en-US')} ر.س
            </div>
            <p className="text-sm text-gray-600 mt-1">متوسط رصيد الموردين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              موردين متجاوزين الحد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueSuppliers}</div>
            <p className="text-sm text-gray-600 mt-1">موردين تجاوزوا الحد الائتماني</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              معدل النشاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {((activeSuppliers / totalSuppliers) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-1">نسبة الموردين النشطين</p>
            <Progress value={(activeSuppliers / totalSuppliers) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* التصفية والبحث */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAccountType} onValueChange={setFilterAccountType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="credit">آجل</SelectItem>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="mixed">مختلط</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">الاسم</SelectItem>
                <SelectItem value="balance">الرصيد الحالي</SelectItem>
                <SelectItem value="openingBalance">الرصيد الافتتاحي</SelectItem>
                <SelectItem value="creditLimit">الحد الائتماني</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant={sortOrder === 'asc' ? 'default' : 'outline'}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 ml-2" />
              {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول الموردين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            قائمة الموردين ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المورد</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">الحد الائتماني</TableHead>
                  <TableHead className="text-right">نوع الحساب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier: Supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {(supplier.openingBalance || 0).toLocaleString('en-US')} ر.س
                    </TableCell>
                    <TableCell className={`font-medium ${(supplier.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(supplier.balance || 0).toLocaleString('en-US')} ر.س
                    </TableCell>
                    <TableCell className="text-purple-600">
                      {(supplier.creditLimit || 0).toLocaleString('en-US')} ر.س
                    </TableCell>
                    <TableCell>{getAccountTypeBadge(supplier.accountType)}</TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowPaymentDialog(true);
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* مربع حوار تفاصيل المورد */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              تفاصيل حساب المورد - {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="transactions">المعاملات</TabsTrigger>
                <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">معلومات الاتصال</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">الهاتف:</span> {selectedSupplier.phone}</p>
                        <p><span className="font-medium">البريد:</span> {selectedSupplier.email || 'غير محدد'}</p>
                        <p><span className="font-medium">العنوان:</span> {selectedSupplier.address || 'غير محدد'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">معلومات الحساب</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">نوع الحساب:</span> {getAccountTypeBadge(selectedSupplier.accountType)}</p>
                        <p><span className="font-medium">الحالة:</span> {getStatusBadge(selectedSupplier.status)}</p>
                        <p><span className="font-medium">تاريخ الإنشاء:</span> {new Date(selectedSupplier.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">الرصيد الافتتاحي</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(selectedSupplier.openingBalance || 0).toLocaleString('en-US')} ر.س
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">الرصيد الحالي</p>
                      <p className={`text-2xl font-bold ${(selectedSupplier.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(selectedSupplier.balance || 0).toLocaleString('en-US')} ر.س
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">الحد الائتماني</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {(selectedSupplier.creditLimit || 0).toLocaleString('en-US')} ر.س
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>سجل المعاملات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">سيتم إضافة تفاصيل المعاملات هنا</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>سجل المدفوعات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentVouchers
                        .filter((v: PaymentVoucher) => v.supplierId === selectedSupplier.id)
                        .map((voucher: PaymentVoucher) => (
                          <div key={voucher.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">{voucher.voucherNumber}</p>
                              <p className="text-sm text-gray-600">{voucher.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-left">
                                <p className="font-bold text-green-600">{parseFloat(voucher.amount).toLocaleString('en-US')} ر.س</p>
                                <p className="text-sm text-gray-600">{new Date(voucher.paymentDate).toLocaleDateString('en-GB')}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPaymentForPrint(voucher);
                                  setShowPrintDialog(true);
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* مربع حوار إنشاء سند صرف */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              إنشاء سند صرف - {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                placeholder="أدخل المبلغ"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                placeholder="أدخل ملاحظات إضافية"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleCreatePayment}
                disabled={!paymentAmount || createPaymentMutation.isPending}
                className="flex-1"
              >
                {createPaymentMutation.isPending ? 'جاري الحفظ...' : 'إنشاء سند الصرف'}
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار الطباعة الاحترافي */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              طباعة سند الصرف
            </DialogTitle>
          </DialogHeader>
          
          {selectedPaymentForPrint && selectedSupplier && (
            <ProfessionalSupplierPaymentVoucher 
              payment={selectedPaymentForPrint}
              supplier={selectedSupplier}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}