import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Edit,
  Trash2,
  Eye,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Receipt,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import SupplierAccountsPrintReport from '@/components/suppliers/SupplierAccountsPrintReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SupplierAccount {
  id: number;
  supplierName: string;
  phone: string;
  email?: string;
  openingBalance: number;
  totalPurchases: number;
  totalPayments: number;
  currentBalance: number;
  lastTransaction: string;
  status: 'active' | 'inactive' | 'blocked';
  creditLimit: number;
  accountType: 'credit' | 'cash' | 'mixed';
}

interface Transaction {
  id: number;
  supplierId: number;
  type: 'purchase' | 'payment' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  date: string;
  reference: string;
}

export default function SupplierAccountsNew() {
  const { setCurrentPage } = useAppStore();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SupplierAccount | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierAccount | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const [formData, setFormData] = useState({
    supplierName: '',
    phone: '',
    email: '',
    openingBalance: 0,
    creditLimit: 0,
    accountType: 'cash' as 'credit' | 'cash' | 'mixed',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  });

  // جلب بيانات الموردين من الخادم
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // تحويل بيانات الموردين إلى تنسيق حسابات الموردين
  const [supplierAccounts, setSupplierAccounts] = useState<SupplierAccount[]>([]);

  // تحديث البيانات عند تغيير بيانات الموردين
  React.useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      const formattedAccounts = suppliers.map((supplier: any) => ({
        id: supplier.id,
        supplierName: supplier.name || 'غير محدد',
        phone: supplier.phone || '',
        email: supplier.email || '',
        openingBalance: parseFloat(supplier.balance || '0'),
        totalPurchases: 0, // سيتم حسابها لاحقاً من فواتير الشراء
        totalPayments: 0,  // سيتم حسابها لاحقاً من سندات الدفع
        currentBalance: parseFloat(supplier.balance || '0'),
        lastTransaction: supplier.createdAt ? new Date(supplier.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'active',
        creditLimit: parseFloat(supplier.creditLimit || '0'),
        accountType: 'credit'
      }));
      setSupplierAccounts(formattedAccounts);
    }
  }, [suppliers]);

  // بيانات تجريبية للمعاملات
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      supplierId: 1,
      type: 'purchase',
      amount: 25000,
      description: 'شراء بضائع متنوعة',
      date: '2025-06-20',
      reference: 'PUR-001'
    },
    {
      id: 2,
      supplierId: 1,
      type: 'payment',
      amount: 20000,
      description: 'دفعة نقدية',
      date: '2025-06-19',
      reference: 'PAY-001'
    },
    {
      id: 3,
      supplierId: 2,
      type: 'purchase',
      amount: 35000,
      description: 'مواد أولية',
      date: '2025-06-18',
      reference: 'PUR-002'
    }
  ]);

  useEffect(() => {
    setCurrentPage('حسابات الموردين');
  }, [setCurrentPage]);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // تصفية الحسابات
  const filteredAccounts = supplierAccounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // وظائف إدارة الحسابات
  const handleAddAccount = () => {
    if (!formData.supplierName || !formData.phone) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم المورد ورقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    const newAccount: SupplierAccount = {
      id: supplierAccounts.length + 1,
      supplierName: formData.supplierName,
      phone: formData.phone,
      email: formData.email,
      openingBalance: formData.openingBalance,
      totalPurchases: 0,
      totalPayments: 0,
      currentBalance: formData.openingBalance,
      lastTransaction: new Date().toISOString().split('T')[0],
      status: formData.status,
      creditLimit: formData.creditLimit,
      accountType: formData.accountType
    };

    setSupplierAccounts([...supplierAccounts, newAccount]);
    setFormData({ supplierName: '', phone: '', email: '', openingBalance: 0, creditLimit: 0, accountType: 'cash', status: 'active' });
    setShowAddForm(false);
    
    toast({
      title: "تم الحفظ",
      description: "تم إضافة حساب المورد بنجاح",
    });
  };

  const handleEditAccount = (account: SupplierAccount) => {
    setEditingAccount(account);
    setFormData({
      supplierName: account.supplierName,
      phone: account.phone,
      email: account.email || '',
      openingBalance: account.openingBalance,
      creditLimit: account.creditLimit,
      accountType: account.accountType,
      status: account.status
    });
    setShowEditForm(true);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount) return;

    setSupplierAccounts(supplierAccounts.map(account => 
      account.id === editingAccount.id 
        ? { 
            ...account, 
            supplierName: formData.supplierName,
            phone: formData.phone,
            email: formData.email,
            creditLimit: formData.creditLimit,
            accountType: formData.accountType,
            status: formData.status
          }
        : account
    ));
    
    setShowEditForm(false);
    setEditingAccount(null);
    setFormData({ supplierName: '', phone: '', email: '', openingBalance: 0, creditLimit: 0, accountType: 'cash', status: 'active' });
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث حساب المورد بنجاح",
    });
  };

  const handleDeleteAccount = (accountId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      setSupplierAccounts(supplierAccounts.filter(account => account.id !== accountId));
      toast({
        title: "تم الحذف",
        description: "تم حذف حساب المورد بنجاح",
      });
    }
  };

  const handleShowTransactions = (supplier: SupplierAccount) => {
    setSelectedSupplier(supplier);
    setShowTransactionHistory(true);
  };

  const getSupplierTransactions = (supplierId: number) => {
    return transactions.filter(t => t.supplierId === supplierId);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 bg-green-50';
    if (balance < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-600">غير نشط</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">محظور</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge className="bg-blue-100 text-blue-800">آجل</Badge>;
      case 'cash':
        return <Badge className="bg-green-100 text-green-800">نقدي</Badge>;
      case 'mixed':
        return <Badge className="bg-purple-100 text-purple-800">مختلط</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // فاتورة فردية للمورد باستخدام التصميم الموحد
  const generateSupplierInvoice = async (account: SupplierAccount) => {
    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
    
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const summaryData = [
      {
        label: 'الرصيد الافتتاحي',
        value: `${account.openingBalance.toLocaleString('en-US')} ر.س`,
        color: account.openingBalance >= 0 ? '#28a745' : '#dc3545'
      },
      {
        label: 'الرصيد الحالي',
        value: `${account.currentBalance.toLocaleString('en-US')} ر.س`,
        color: account.currentBalance >= 0 ? '#28a745' : '#dc3545'
      },
      {
        label: 'إجمالي المشتريات',
        value: `${account.totalPurchases.toLocaleString('en-US')} ر.س`,
        color: '#007acc'
      },
      {
        label: 'إجمالي المدفوعات',
        value: `${account.totalPayments.toLocaleString('en-US')} ر.س`,
        color: '#6f42c1'
      },
      {
        label: 'حد الائتمان',
        value: `${account.creditLimit.toLocaleString('en-US')} ر.س`,
        color: '#fd7e14'
      }
    ];

    const htmlContent = generateUnifiedInvoice({
      title: 'كشف حساب مورد',
      invoiceNumber: `SUP-${account.id.toString().padStart(4, '0')}`,
      entityName: account.supplierName,
      entityDetails: {
        id: account.id,
        phone: account.phone,
        email: account.email,
        type: account.accountType === 'credit' ? 'آجل' : account.accountType === 'cash' ? 'نقدي' : 'مختلط',
        status: account.status === 'active' ? 'نشط' : 'غير نشط',
        lastTransaction: account.lastTransaction
      },
      summaryData,
      user
    });

    invoiceWindow.document.write(htmlContent);
    invoiceWindow.document.close();
    
    setTimeout(() => {
      invoiceWindow.print();
    }, 500);
  };

  // تحويل البيانات للتقرير
  const convertToReportFormat = () => {
    return filteredAccounts.map(account => ({
      id: account.id,
      name: account.supplierName,
      phone: account.phone,
      email: account.email || '',
      address: '',
      openingBalance: account.openingBalance.toString(),
      currentBalance: account.currentBalance,
      totalPurchases: account.totalPurchases,
      creditLimit: account.creditLimit,
      accountType: account.accountType,
      status: account.status,
      createdAt: account.lastTransaction
    }));
  };

  const calculateAnalytics = () => {
    const reportSuppliers = convertToReportFormat();
    return {
      totalSuppliers: reportSuppliers.length,
      activeSuppliers: reportSuppliers.filter(s => s.status === 'active').length,
      inactiveSuppliers: reportSuppliers.filter(s => s.status !== 'active').length,
      totalCurrentBalance: reportSuppliers.reduce((sum, supplier) => sum + parseFloat(supplier.currentBalance), 0),
      totalPurchases: reportSuppliers.reduce((sum, supplier) => sum + parseFloat(supplier.creditLimit), 0),
      totalCreditLimits: reportSuppliers.reduce((sum, supplier) => sum + parseFloat(supplier.creditLimit), 0),
      totalOpeningBalances: reportSuppliers.reduce((sum, supplier) => sum + parseFloat(supplier.openingBalance), 0),
      suppliersWithDebt: reportSuppliers.filter(s => parseFloat(s.currentBalance) < 0).length,
      suppliersWithCredit: reportSuppliers.filter(s => parseFloat(s.currentBalance) > 0).length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-gray-900">{supplierAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {supplierAccounts.reduce((sum, s) => sum + s.currentBalance, 0).toLocaleString('en-US')} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {supplierAccounts.reduce((sum, s) => sum + s.totalPurchases, 0).toLocaleString('en-US')} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">موردين نشطين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {supplierAccounts.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>إدارة حسابات الموردين</span>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مورد جديد
              </Button>
              <Button 
                onClick={() => setShowPrintReport(true)} 
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <FileText className="w-4 h-4 ml-2" />
                تقرير شامل
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الموردين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="حالة المورد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accounts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المورد</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">إجمالي المشتريات</TableHead>
                  <TableHead className="text-right">حد الائتمان</TableHead>
                  <TableHead className="text-right">نوع الحساب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.supplierName}</div>
                        <div className="text-sm text-gray-500">{account.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{account.phone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getBalanceColor(account.currentBalance)}`}>
                        {account.currentBalance.toLocaleString('en-US')} ر.س
                      </span>
                    </TableCell>
                    <TableCell>{account.totalPurchases.toLocaleString('en-US')} ر.س</TableCell>
                    <TableCell>{account.creditLimit.toLocaleString('en-US')} ر.س</TableCell>
                    <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateSupplierInvoice(account)}
                          title="فاتورة فردية"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowTransactions(account)}
                          title="تاريخ المعاملات"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-700"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Supplier Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">اسم المورد *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  placeholder="اسم المورد"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@domain.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({...formData, openingBalance: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">حد الائتمان</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({...formData, creditLimit: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">نوع الحساب</Label>
                <Select value={formData.accountType} onValueChange={(value: 'credit' | 'cash' | 'mixed') => setFormData({...formData, accountType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'blocked') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="blocked">محظور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700">
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المورد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierName">اسم المورد *</Label>
                <Input
                  id="editSupplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  placeholder="اسم المورد"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">رقم الهاتف *</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">البريد الإلكتروني</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCreditLimit">حد الائتمان</Label>
              <Input
                id="editCreditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({...formData, creditLimit: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editAccountType">نوع الحساب</Label>
                <Select value={formData.accountType} onValueChange={(value: 'credit' | 'cash' | 'mixed') => setFormData({...formData, accountType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'blocked') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="blocked">محظور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateAccount} className="bg-blue-600 hover:bg-blue-700">
              تحديث
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle>
              تاريخ معاملات المورد: {selectedSupplier?.supplierName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSupplier && getSupplierTransactions(selectedSupplier.id).length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">نوع المعاملة</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المرجع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSupplierTransactions(selectedSupplier.id).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'purchase' ? 'default' : 'secondary'}>
                            {transaction.type === 'purchase' ? 'شراء' : 
                             transaction.type === 'payment' ? 'دفعة' : 
                             transaction.type === 'refund' ? 'استرداد' : 'تسوية'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount.toLocaleString('en-US')} ر.س
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-sm text-gray-500">{transaction.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد معاملات لهذا المورد
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Report */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تقرير حسابات الموردين</h3>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
                    
                    const analytics = calculateAnalytics();
                    const reportData = convertToReportFormat();
                    
                    const summaryData = [
                      {
                        label: 'إجمالي الموردين',
                        value: analytics.totalSuppliers.toString()
                      },
                      {
                        label: 'الموردين النشطين',
                        value: analytics.activeSuppliers.toString()
                      },
                      {
                        label: 'إجمالي الأرصدة',
                        value: `${(analytics.totalCurrentBalance || 0).toLocaleString('en-US')} ر.س`
                      },
                      {
                        label: 'إجمالي المشتريات',
                        value: `${(analytics.totalPurchases || 0).toLocaleString('en-US')} ر.س`
                      }
                    ];

                    const suppliersTable = `
                      <table class="summary-table" style="margin-top: 20px;">
                        <thead>
                          <tr>
                            <th>م</th>
                            <th>اسم المورد</th>
                            <th>الهاتف</th>
                            <th>الرصيد الحالي</th>
                            <th>إجمالي المشتريات</th>
                            <th>حد الائتمان</th>
                            <th>نوع الحساب</th>
                            <th>الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${reportData.map((supplier, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td>${supplier.name}</td>
                              <td>${supplier.phone}</td>
                              <td>${supplier.currentBalance.toLocaleString('en-US')} ر.س</td>
                              <td>${supplier.totalPurchases.toLocaleString('en-US')} ر.س</td>
                              <td>${supplier.creditLimit.toLocaleString('en-US')} ر.س</td>
                              <td>${supplier.accountType === 'credit' ? 'آجل' : supplier.accountType === 'cash' ? 'نقدي' : 'مختلط'}</td>
                              <td>${supplier.status === 'active' ? 'نشط' : supplier.status === 'inactive' ? 'غير نشط' : 'محظور'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    `;

                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const htmlContent = generateUnifiedInvoice({
                        title: 'تقرير حسابات الموردين',
                        invoiceNumber: `SUP-ACC-${Date.now()}`,
                        entityName: 'جميع الموردين',
                        entityDetails: {
                          id: analytics.totalSuppliers,
                          type: 'تقرير حسابات',
                          status: `${analytics.activeSuppliers} نشط من ${analytics.totalSuppliers}`
                        },
                        summaryData,
                        additionalContent: suppliersTable
                      });

                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      setTimeout(() => {
                        printWindow.print();
                      }, 500);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPrintReport(false)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
            
            <div ref={printRef}>
              <SupplierAccountsPrintReport 
                suppliers={convertToReportFormat()} 
                analytics={calculateAnalytics()} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}