import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Receipt, 
  TrendingUp, 
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Printer,
  Filter,
  BarChart3,
  DollarSign,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Enhanced formatting functions for proper Arabic number display
const formatArabicNumber = (number: number): string => {
  if (isNaN(number) || number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(number);
};

const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ر.س';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

interface Supplier {
  id: number;
  name: string;
  supplierName?: string;
  email?: string;
  phone: string;
  address?: string;
  openingBalance: number;
  balance: number;
  currentBalance?: number;
  status: 'active' | 'inactive';
  category?: string;
  taxNumber?: string;
  registrationDate?: string;
  lastTransaction?: string;
}

interface PaymentVoucher {
  id: number;
  supplierId: number;
  amount: number;
  description: string;
  date: string;
  voucherNumber: string;
  paymentMethod?: string;
  notes?: string;
}

interface SupplierStatement {
  supplier: Supplier;
  transactions: Array<{
    id: number;
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    type: 'invoice' | 'payment' | 'return' | 'opening';
    reference?: string;
  }>;
  summary: {
    openingBalance: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
  };
}

export default function AdvancedSimpleSupplierAccounts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced supplier form with more fields
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    openingBalance: 0,
    status: 'active' as 'active' | 'inactive',
    category: '',
    taxNumber: '',
    notes: ''
  });

  // Enhanced payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch suppliers with error handling
  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    select: (data: any[]) => data.map(supplier => ({
      ...supplier,
      currentBalance: supplier.currentBalance || supplier.balance || 0,
      openingBalance: supplier.openingBalance || 0,
      registrationDate: supplier.registrationDate || new Date().toISOString().split('T')[0],
      lastTransaction: supplier.lastTransaction || '-'
    }))
  });

  // Fetch payment vouchers
  const { data: paymentVouchers = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
    select: (data: unknown) => Array.isArray(data) ? data : []
  });

  // Calculate enhanced statistics
  const statistics = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    inactiveSuppliers: suppliers.filter(s => s.status === 'inactive').length,
    totalOpeningBalance: suppliers.reduce((sum, s) => sum + (s.openingBalance || 0), 0),
    totalCurrentBalance: suppliers.reduce((sum, s) => sum + (s.currentBalance || s.balance || 0), 0),
    totalPayments: (paymentVouchers as any[]).reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    avgBalance: suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + (s.currentBalance || s.balance || 0), 0) / suppliers.length : 0,
    highestBalance: Math.max(...suppliers.map(s => s.currentBalance || s.balance || 0), 0),
    suppliersWithDebt: suppliers.filter(s => (s.currentBalance || s.balance || 0) > 0).length
  };

  // Enhanced filtering
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(suppliers.map(s => s.category).filter(Boolean)));

  // Add supplier mutation
  const addSupplierMutation = useMutation({
    mutationFn: (newSupplier: typeof supplierForm) => 
      apiRequest('POST', '/api/suppliers', {
        ...newSupplier,
        balance: newSupplier.openingBalance,
        currentBalance: newSupplier.openingBalance
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsAddDialogOpen(false);
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        openingBalance: 0,
        status: 'active',
        category: '',
        taxNumber: '',
        notes: ''
      });
      toast({
        title: "تم إضافة المورد بنجاح",
        description: "تم حفظ بيانات المورد الجديد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة المورد",
        description: error.message || "حدث خطأ أثناء إضافة المورد",
        variant: "destructive",
      });
    }
  });

  // Add payment voucher mutation
  const addPaymentMutation = useMutation({
    mutationFn: (payment: any) => {
      const voucherNumber = `PAY-${Date.now()}`;
      return apiRequest('POST', '/api/supplier-payment-vouchers', {
        ...payment,
        supplierId: selectedSupplier?.id,
        voucherNumber,
        date: paymentForm.date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsPaymentDialogOpen(false);
      setPaymentForm({
        amount: 0,
        description: '',
        paymentMethod: 'cash',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "تم إضافة سند الدفع بنجاح",
        description: `تم خصم ${formatCurrency(paymentForm.amount)} من رصيد المورد`,
      });
    }
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "تم حذف المورد بنجاح",
        description: "تم حذف بيانات المورد من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المورد",
        description: error?.message || "حدث خطأ أثناء حذف المورد",
        variant: "destructive",
      });
    }
  });

  // Print supplier statement function
  const printSupplierStatement = (supplier: Supplier) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const supplierBalance = supplier.currentBalance || supplier.balance || 0;
    const supplierOpeningBalance = supplier.openingBalance || 0;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب المورد - ${supplier.name || supplier.supplierName}</title>
        <style>
          @media print {
            body { margin: 0; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
          }
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            margin: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 20px;
            color: #2d3748;
            margin: 10px 0;
          }
          .supplier-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-label {
            font-weight: bold;
            color: #4a5568;
          }
          .info-value {
            color: #2d3748;
          }
          .balance-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .balance-card {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .balance-label {
            font-size: 14px;
            color: #718096;
            margin-bottom: 5px;
          }
          .balance-amount {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="document-title">كشف حساب المورد</div>
          <div style="font-size: 14px; color: #718096;">
            تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        <div class="supplier-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">اسم المورد:</span>
              <span class="info-value">${supplier.name || supplier.supplierName || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">رقم الهاتف:</span>
              <span class="info-value">${supplier.phone || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">البريد الإلكتروني:</span>
              <span class="info-value">${supplier.email || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الحالة:</span>
              <span class="info-value">${supplier.status === 'active' ? 'نشط' : 'غير نشط'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">العنوان:</span>
              <span class="info-value">${supplier.address || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الفئة:</span>
              <span class="info-value">${supplier.category || '-'}</span>
            </div>
          </div>
        </div>

        <div class="balance-section">
          <div class="balance-card">
            <div class="balance-label">الرصيد الافتتاحي</div>
            <div class="balance-amount">${formatCurrency(supplierOpeningBalance)}</div>
          </div>
          <div class="balance-card">
            <div class="balance-label">الرصيد الحالي</div>
            <div class="balance-amount" style="color: ${supplierBalance > 0 ? '#e53e3e' : '#38a169'}">
              ${formatCurrency(supplierBalance)}
            </div>
          </div>
          <div class="balance-card">
            <div class="balance-label">الفرق</div>
            <div class="balance-amount" style="color: #2b6cb0">
              ${formatCurrency(supplierBalance - supplierOpeningBalance)}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين المتقدمة</h1>
            <p className="text-gray-600 mt-1">إدارة شاملة ومتقدمة لحسابات الموردين والمعاملات المالية</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => refetchSuppliers()}
              variant="outline"
              size="sm"
              disabled={suppliersLoading}
            >
              <RefreshCw className={`ml-2 h-4 w-4 ${suppliersLoading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة مورد جديد
            </Button>
          </div>
        </div>

        {/* Advanced Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الموردين (الاسم، الهاتف...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatArabicNumber(statistics.totalSuppliers)}</div>
            <div className="text-xs text-blue-600 mt-1">
              نشط: {formatArabicNumber(statistics.activeSuppliers)} | غير نشط: {formatArabicNumber(statistics.inactiveSuppliers)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">إجمالي الأرصدة الافتتاحية</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(statistics.totalOpeningBalance)}</div>
            <div className="text-xs text-green-600 mt-1">متوسط الرصيد: {formatCurrency(statistics.avgBalance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">إجمالي الأرصدة الحالية</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(statistics.totalCurrentBalance)}</div>
            <div className="text-xs text-orange-600 mt-1">أعلى رصيد: {formatCurrency(statistics.highestBalance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">إجمالي المدفوعات</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(statistics.totalPayments)}</div>
            <div className="text-xs text-purple-600 mt-1">موردين مدينين: {formatArabicNumber(statistics.suppliersWithDebt)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            قائمة الموردين
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            المعاملات الأخيرة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الموردين النشطين</p>
                  <p className="text-3xl font-bold text-green-600">{formatArabicNumber(statistics.activeSuppliers)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط الرصيد</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(statistics.avgBalance)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تحتاج متابعة</p>
                  <p className="text-3xl font-bold text-orange-600">{formatArabicNumber(statistics.inactiveSuppliers)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          {/* Enhanced Suppliers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                قائمة الموردين ({formatArabicNumber(filteredSuppliers.length)})
              </CardTitle>
              <CardDescription>
                إدارة شاملة لجميع الموردين وأرصدتهم المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري تحميل البيانات...</p>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">لا توجد موردين مطابقين للبحث</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم المورد</TableHead>
                        <TableHead className="text-right">رقم الهاتف</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                        <TableHead className="text-right">الرصيد الحالي</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">آخر معاملة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => {
                        const currentBalance = supplier.currentBalance || supplier.balance || 0;
                        const openingBalance = supplier.openingBalance || 0;
                        
                        return (
                          <TableRow key={supplier.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold">{supplier.name || supplier.supplierName}</p>
                                <p className="text-sm text-gray-500">{supplier.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{supplier.phone}</TableCell>
                            <TableCell>
                              {supplier.category ? (
                                <Badge variant="outline">{supplier.category}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatCurrency(openingBalance)}
                            </TableCell>
                            <TableCell className="font-mono">
                              <span className={currentBalance > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                                {formatCurrency(currentBalance)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                                {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {supplier.lastTransaction || 'لا توجد معاملات'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setIsStatementDialogOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => printSupplierStatement(supplier)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setIsPaymentDialogOpen(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
                                      deleteSupplierMutation.mutate(supplier.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                المعاملات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(paymentVouchers as any[]).slice(0, 10).map((voucher: any) => {
                  const supplier = suppliers.find(s => s.id === voucher.supplierId);
                  return (
                    <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Receipt className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{supplier?.name || 'مورد غير معروف'}</p>
                          <p className="text-sm text-gray-500">{voucher.description}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-green-600">{formatCurrency(voucher.amount)}</p>
                        <p className="text-sm text-gray-500">{new Date(voucher.date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة مورد جديد
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>اسم المورد *</Label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                placeholder="أدخل اسم المورد"
              />
            </div>
            <div>
              <Label>رقم الهاتف *</Label>
              <Input
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            <div>
              <Label>الرقم الضريبي</Label>
              <Input
                value={supplierForm.taxNumber}
                onChange={(e) => setSupplierForm({...supplierForm, taxNumber: e.target.value})}
                placeholder="أدخل الرقم الضريبي"
              />
            </div>
            <div>
              <Label>الفئة</Label>
              <Input
                value={supplierForm.category}
                onChange={(e) => setSupplierForm({...supplierForm, category: e.target.value})}
                placeholder="أدخل فئة المورد"
              />
            </div>
            <div>
              <Label>الرصيد الافتتاحي</Label>
              <Input
                type="number"
                value={supplierForm.openingBalance}
                onChange={(e) => setSupplierForm({...supplierForm, openingBalance: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <Label>العنوان</Label>
              <Input
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                placeholder="أدخل عنوان المورد"
              />
            </div>
            <div className="md:col-span-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={supplierForm.notes}
                onChange={(e) => setSupplierForm({...supplierForm, notes: e.target.value})}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select 
                value={supplierForm.status} 
                onValueChange={(value) => setSupplierForm({...supplierForm, status: value as 'active' | 'inactive'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => addSupplierMutation.mutate(supplierForm)}
                disabled={!supplierForm.name || !supplierForm.phone || addSupplierMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addSupplierMutation.isPending ? 'جاري الحفظ...' : 'حفظ المورد'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Payment Voucher Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              إضافة سند دفع - {selectedSupplier?.name || selectedSupplier?.supplierName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="bank">حوالة بنكية</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاريخ الدفع</Label>
              <Input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
              />
            </div>
            <div>
              <Label>الوصف *</Label>
              <Input
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                placeholder="أدخل وصف المدفوعة"
              />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => addPaymentMutation.mutate(paymentForm)}
                disabled={!paymentForm.amount || !paymentForm.description || addPaymentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addPaymentMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Supplier Statement Dialog */}
      <Dialog open={isStatementDialogOpen} onOpenChange={setIsStatementDialogOpen}>
        <DialogContent className="max-w-4xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              كشف حساب المورد - {selectedSupplier?.name || selectedSupplier?.supplierName}
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6 py-4">
              {/* Supplier Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المورد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-semibold">{selectedSupplier.name || selectedSupplier.supplierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الهاتف:</span>
                        <span>{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">البريد:</span>
                        <span>{selectedSupplier.email || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الرصيد الافتتاحي:</span>
                        <span className="font-mono">{formatCurrency(selectedSupplier.openingBalance || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الرصيد الحالي:</span>
                        <span className={`font-mono font-semibold ${(selectedSupplier.currentBalance || selectedSupplier.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(selectedSupplier.currentBalance || selectedSupplier.balance || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحالة:</span>
                        <Badge variant={selectedSupplier.status === 'active' ? 'default' : 'secondary'}>
                          {selectedSupplier.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => printSupplierStatement(selectedSupplier)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة كشف الحساب
                </Button>
                <Button
                  onClick={() => {
                    setIsStatementDialogOpen(false);
                    setIsPaymentDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Receipt className="ml-2 h-4 w-4" />
                  إضافة سند دفع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}