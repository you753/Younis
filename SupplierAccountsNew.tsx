import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Receipt,
  Building2,
  Printer,
  Eye
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: string;
  currentBalance: string;
  creditLimit: string;
  accountType: string;
  status: string;
  createdAt: string;
  balance?: string;
}

interface PaymentVoucher {
  id: number;
  supplierId: number;
  voucherNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function SupplierAccountsNew() {
  const { toast } = useToast();
  const { user } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<SupplierAccount | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof SupplierAccount>('supplierName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showStatement, setShowStatement] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const [newAccount, setNewAccount] = useState<SupplierAccount>({
    id: 0,
    supplierName: '',
    phone: '',
    email: '',
    openingBalance: 0,
    totalPurchases: 0,
    totalPayments: 0,
    currentBalance: 0,
    lastTransaction: '',
    creditLimit: 0,
    accountType: 'cash' as 'credit' | 'cash' | 'mixed',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  });

  // جلب بيانات الموردين من الخادم
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // جلب فواتير المشتريات
  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  // جلب سندات دفع الموردين
  const { data: paymentVouchers = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
  });

  // تحويل بيانات الموردين إلى تنسيق حسابات الموردين
  const [supplierAccounts, setSupplierAccounts] = useState<SupplierAccount[]>([]);

  // تحديث البيانات عند تغيير بيانات الموردين
  React.useEffect(() => {
    if (suppliers && Array.isArray(suppliers) && suppliers.length > 0) {
      const formattedAccounts = suppliers.map((supplier: any) => ({
        id: supplier.id,
        supplierName: supplier.name || 'غير محدد',
        phone: supplier.phone || '',
        email: supplier.email || '',
        openingBalance: parseFloat(supplier.balance || '0'),
        totalPurchases: 0,
        totalPayments: 0,
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
      amount: 150000,
      description: 'فاتورة شراء مواد خام',
      date: '2025-06-20',
      reference: 'PUR-001'
    },
    {
      id: 2,
      supplierId: 1,
      type: 'payment',
      amount: -50000,
      description: 'دفعة نقدية',
      date: '2025-06-21',
      reference: 'PAY-001'
    }
  ]);

  const { data: user2 } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const filteredAccounts = supplierAccounts.filter((account: SupplierAccount) => {
    const matchesSearch = account.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone.includes(searchTerm) ||
                         (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    const matchesAccountType = filterAccountType === 'all' || account.accountType === filterAccountType;
    
    return matchesSearch && matchesStatus && matchesAccountType;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'ar')
        : bValue.localeCompare(aValue, 'ar');
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (column: keyof SupplierAccount) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAddAccount = () => {
    const accountToAdd = {
      ...newAccount,
      id: supplierAccounts.length + 1,
      currentBalance: newAccount.openingBalance
    };
    setSupplierAccounts([...supplierAccounts, accountToAdd]);
    setIsDialogOpen(false);
    setNewAccount({
      id: 0,
      supplierName: '',
      phone: '',
      email: '',
      openingBalance: 0,
      totalPurchases: 0,
      totalPayments: 0,
      currentBalance: 0,
      lastTransaction: '',
      creditLimit: 0,
      accountType: 'cash',
      status: 'active'
    });
    toast({
      title: "تم إضافة حساب المورد بنجاح",
      description: "تم إنشاء حساب جديد للمورد",
    });
  };

  const handleEditAccount = (account: SupplierAccount) => {
    setNewAccount(account);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateAccount = () => {
    setSupplierAccounts(supplierAccounts.map((account: SupplierAccount) => 
      account.id === newAccount.id ? newAccount : account
    ));
    setIsDialogOpen(false);
    setIsEditMode(false);
    setNewAccount({
      id: 0,
      supplierName: '',
      phone: '',
      email: '',
      openingBalance: 0,
      totalPurchases: 0,
      totalPayments: 0,
      currentBalance: 0,
      lastTransaction: '',
      creditLimit: 0,
      accountType: 'cash',
      status: 'active'
    });
    toast({
      title: "تم تحديث حساب المورد بنجاح",
      description: "تم حفظ التغييرات على حساب المورد",
    });
  };

  const handleDeleteAccount = (account: SupplierAccount) => {
    setSupplierAccounts(supplierAccounts.filter((acc: SupplierAccount) => acc.id !== account.id));
    toast({
      title: "تم حذف حساب المورد",
      description: "تم حذف حساب المورد بنجاح",
      variant: "destructive",
    });
  };

  const handleShowTransactions = (supplier: SupplierAccount) => {
    setSelectedAccount(supplier);
    setShowTransactionHistory(true);
  };

  // دالة لعرض كشف حساب المورد
  const handleShowStatement = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowStatement(true);
  };

  // دالة لجلب معاملات المورد
  const getSupplierTransactions = (supplierId: number) => {
    const supplierPurchases = Array.isArray(purchases) ? purchases.filter((p: any) => {
      return p.supplierId === supplierId || p.supplier_id === supplierId;
    }) : [];
    
    const supplierPayments = Array.isArray(paymentVouchers) ? paymentVouchers.filter((v: any) => {
      return v.supplierId === supplierId || v.supplier_id === supplierId;
    }) : [];

    const allTransactions = [
      ...supplierPurchases.map((p: any) => ({
        id: `purchase-${p.id}`,
        date: p.date || p.createdAt,
        type: 'فاتورة شراء',
        reference: p.invoiceNumber || `PUR-${p.id}`,
        description: `فاتورة شراء رقم ${p.invoiceNumber || p.id}`,
        debit: parseFloat(p.total || 0),
        credit: 0
      })),
      ...supplierPayments.map((v: any) => ({
        id: `payment-${v.id}`,
        date: v.paymentDate || v.createdAt,
        type: 'سند دفع',
        reference: v.voucherNumber || `PAY-${v.id}`,
        description: v.description || `سند دفع رقم ${v.voucherNumber || v.id}`,
        debit: 0,
        credit: parseFloat(v.amount || 0)
      }))
    ];

    return allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // دالة حساب الرصيد النهائي
  const calculateFinalBalance = (supplier: any, transactions: any[]) => {
    const openingBalance = parseFloat(supplier.balance || supplier.currentBalance || 0);
    const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
    return openingBalance + totalDebits - totalCredits;
  };

  // دالة طباعة كشف حساب المورد
  const printSupplierStatement = () => {
    if (!selectedSupplier) return;

    const transactions = getSupplierTransactions(selectedSupplier.id);
    const finalBalance = calculateFinalBalance(selectedSupplier, transactions);
    const openingBalance = parseFloat(selectedSupplier.balance || selectedSupplier.currentBalance || 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب المورد - ${selectedSupplier.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; direction: rtl; background: white; padding: 20px; }
          .container { max-width: 900px; margin: 0 auto; padding: 20px; background: white; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header h2 { color: #16a34a; font-size: 24px; margin-bottom: 10px; }
          .info-section { border: 1px solid #000; padding: 15px; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }
          .info-item { margin: 5px 0; }
          .info-label { font-weight: bold; font-size: 13px; color: #333; }
          .info-value { font-size: 13px; color: #666; margin-top: 2px; }
          .value-positive { color: #dc2626; font-weight: bold; }
          .value-negative { color: #16a34a; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #000; }
          th { background: #000; color: white; padding: 10px; text-align: center; font-size: 13px; }
          td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .debit { color: #dc2626; font-weight: bold; }
          .credit { color: #16a34a; font-weight: bold; }
          .balance { color: #2563eb; font-weight: bold; }
          .footer { text-align: center; border-top: 1px solid #000; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>كشف حساب المورد</h2>
            <p style="font-size: 14px; color: #666; margin-top: 5px;">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">اسم المورد:</div>
                <div class="info-value">${selectedSupplier.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">رقم الهاتف:</div>
                <div class="info-value">${selectedSupplier.phone || 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الرصيد الافتتاحي:</div>
                <div class="info-value value-positive">${openingBalance.toFixed(2)} ريال</div>
              </div>
              <div class="info-item">
                <div class="info-label">الرصيد النهائي:</div>
                <div class="info-value ${finalBalance > 0 ? 'value-positive' : 'value-negative'}">${finalBalance.toFixed(2)} ريال</div>
              </div>
            </div>
          </div>

          <h3 style="margin: 20px 0 10px; font-size: 16px;">تاريخ المعاملات</h3>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الوصف</th>
                <th>المرجع</th>
                <th>طريقة الدفع</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">لا توجد معاملات</td></tr>
              ` : transactions.map((t: any) => {
                const amount = t.debit > 0 ? t.debit : -t.credit;
                return `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString('en-GB')}</td>
                    <td>${t.description}</td>
                    <td>${t.reference}</td>
                    <td>${t.debit > 0 ? 'نقدي' : 'تحويل بنكي'}</td>
                    <td class="${t.debit > 0 ? 'debit' : 'credit'}">${amount > 0 ? '+' : ''}${amount.toFixed(2)} ريال</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border: 1px solid #000; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: bold; color: #374151;">الرصيد النهائي:</span>
              <span style="font-size: 24px; font-weight: bold; color: ${finalBalance > 0 ? '#dc2626' : '#16a34a'};">${finalBalance.toFixed(2)} ريال</span>
            </div>
          </div>

          <div class="footer">
            <p>تم إنشاء هذا المستند تلقائياً في ${new Date().toLocaleDateString('en-GB')} الساعة ${new Date().toLocaleTimeString('en-US')}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'credit': return 'ائتماني';
      case 'cash': return 'نقدي';
      case 'mixed': return 'مختلط';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">محظور</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // دالة كشف حساب المورد الاحترافي
  const handleSupplierStatement = (supplier: SupplierAccount) => {
    // سنضع الفاتورات هنا لاحقاً - حاليا بيانات تجريبية
    const supplierVouchers = []; // paymentVouchersList.filter(v => v.supplier.id === supplier.id);
    const totalPayments = 0; // supplierVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
    
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>كشف حساب المورد - ${supplier.supplierName}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f8f9fa;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                text-align: center; 
                border-bottom: 3px solid #4f46e5; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: -30px -30px 30px -30px;
              }
              .company-logo {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 10px;
              }
              .supplier-info { 
                background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
                padding: 20px; 
                margin-bottom: 25px; 
                border-radius: 8px;
                border-left: 4px solid #4f46e5;
              }
              .supplier-info h3 {
                margin: 0 0 15px 0;
                color: #4f46e5;
                font-size: 20px;
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
                border-bottom: 1px solid #e0e0e0;
              }
              .info-label {
                font-weight: bold;
                color: #666;
              }
              .info-value {
                color: #333;
                font-weight: 600;
              }
              .transactions-section {
                margin: 25px 0;
              }
              .transactions-title {
                background: #4f46e5;
                color: white;
                padding: 12px 20px;
                margin: 0 0 20px 0;
                border-radius: 6px;
                font-size: 18px;
                font-weight: bold;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 25px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                overflow: hidden;
              }
              th { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 12px; 
                text-align: right; 
                font-weight: bold;
                font-size: 14px;
              }
              td { 
                padding: 12px; 
                border-bottom: 1px solid #e0e0e0; 
                text-align: right;
              }
              tr:nth-child(even) { 
                background-color: #f8f9fa; 
              }
              tr:hover {
                background-color: #e8f4fd;
              }
              .amount-positive { 
                color: #d32f2f; 
                font-weight: bold; 
              }
              .amount-negative { 
                color: #388e3c; 
                font-weight: bold; 
              }
              .summary {
                background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
                padding: 20px;
                border-radius: 8px;
                margin-top: 25px;
                border: 2px solid #4caf50;
              }
              .summary-title {
                color: #2e7d32;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                text-align: center;
              }
              .summary-item {
                background: white;
                padding: 15px;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .summary-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
              }
              .summary-value {
                font-size: 16px;
                font-weight: bold;
                color: #2e7d32;
              }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                border-top: 2px solid #e0e0e0;
                padding-top: 20px;
              }
              @media print {
                body { background: white; }
                .container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="company-logo">MC</div>
                <h1>كشف حساب المورد</h1>
                
                <p>تاريخ الإصدار: ${new Date().toLocaleDateString('en-GB')}</p>
              </div>
              
              <div class="supplier-info">
                <h3>معلومات المورد</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">اسم المورد:</span>
                    <span class="info-value">${supplier.supplierName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">رقم الهاتف:</span>
                    <span class="info-value">${supplier.phone || 'غير محدد'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">الرصيد الافتتاحي:</span>
                    <span class="info-value">${(supplier.openingBalance || 0).toLocaleString('en-US')} ريال</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">الرصيد الحالي:</span>
                    <span class="info-value ${supplier.currentBalance > 0 ? 'amount-positive' : 'amount-negative'}">${(supplier.currentBalance || 0).toLocaleString('en-US')} ريال</span>
                  </div>
                </div>
              </div>
              
              <div class="transactions-section">
                <h3 class="transactions-title">سجل المعاملات المالية</h3>
                <table>
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>البيان</th>
                      <th>المدين</th>
                      <th>الدائن</th>
                      <th>الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${supplier.lastTransaction || new Date().toLocaleDateString('en-GB')}</td>
                      <td>الرصيد الافتتاحي</td>
                      <td>${(supplier.openingBalance || 0).toLocaleString('en-US')} ريال</td>
                      <td>-</td>
                      <td>${(supplier.openingBalance || 0).toLocaleString('en-US')} ريال</td>
                    </tr>
                    <tr>
                      <td>${new Date().toLocaleDateString('en-GB')}</td>
                      <td>إجمالي المشتريات</td>
                      <td>${(supplier.totalPurchases || 0).toLocaleString('en-US')} ريال</td>
                      <td>-</td>
                      <td>${((supplier.openingBalance || 0) + (supplier.totalPurchases || 0)).toLocaleString('en-US')} ريال</td>
                    </tr>
                    <tr>
                      <td>${new Date().toLocaleDateString('en-GB')}</td>
                      <td>إجمالي المدفوعات</td>
                      <td>-</td>
                      <td class="amount-negative">${(supplier.totalPayments || 0).toLocaleString('en-US')} ريال</td>
                      <td>${(supplier.currentBalance || 0).toLocaleString('en-US')} ريال</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="summary">
                <div class="summary-title">ملخص الحساب</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="summary-label">إجمالي المشتريات</div>
                    <div class="summary-value">${(supplier.totalPurchases || 0).toLocaleString('en-US')} ريال</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">إجمالي المدفوعات</div>
                    <div class="summary-value">${(supplier.totalPayments || 0).toLocaleString('en-US')} ريال</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">الرصيد النهائي</div>
                    <div class="summary-value ${supplier.currentBalance > 0 ? 'amount-positive' : 'amount-negative'}">${(supplier.currentBalance || 0).toLocaleString('en-US')} ريال</div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p>تم إنشاء هذا الكشف بتاريخ: ${new Date().toLocaleString('en-US')}</p>
                <p>هذا الكشف مُحدث إلى تاريخ الطباعة ويتضمن جميع المعاملات المسجلة</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateSupplierInvoice = async (account: SupplierAccount) => {
    // طباعة تقرير الموردين
    const printContent = document.getElementById('supplier-print-report');
    if (printContent) {
      const canvas = await html2canvas(printContent);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`supplier-account-${account.supplierName}.pdf`);
      
      toast({
        title: "تم تصدير التقرير بنجاح",
        description: "تم حفظ تقرير حساب المورد كملف PDF",
      });
    }
  };

  const statistics = {
    totalAccounts: supplierAccounts.length,
    activeAccounts: supplierAccounts.filter((s: SupplierAccount) => s.status === 'active').length,
    totalBalance: supplierAccounts.reduce((sum: number, supplier: SupplierAccount) => sum + supplier.currentBalance, 0),
    totalPurchases: supplierAccounts.reduce((sum: number, supplier: SupplierAccount) => sum + supplier.totalPurchases, 0),
    totalPayments: supplierAccounts.reduce((sum: number, supplier: SupplierAccount) => sum + supplier.totalPayments, 0),
    averageBalance: supplierAccounts.length > 0 ? supplierAccounts.reduce((sum: number, supplier: SupplierAccount) => sum + supplier.currentBalance, 0) / supplierAccounts.length : 0,
    inactiveAccounts: supplierAccounts.filter((s: SupplierAccount) => s.status === 'inactive').length,
    blockedAccounts: supplierAccounts.filter((s: SupplierAccount) => s.status === 'blocked').length
  };

  const chartData = [
    {
      name: 'نشط',
      value: statistics.activeAccounts,
      color: '#10b981'
    },
    {
      name: 'غير نشط',
      value: statistics.inactiveAccounts,
      color: '#6b7280'
    },
    {
      name: 'محظور',
      value: statistics.blockedAccounts,
      color: '#ef4444'
    }
  ];

  const balanceData = [
    {
      name: 'إجمالي المشتريات',
      value: statistics.totalPurchases.toLocaleString('en-US'),
      color: '#3b82f6'
    },
    {
      name: 'إجمالي المدفوعات',
      value: statistics.totalPayments.toLocaleString('en-US'),
      color: '#10b981'
    },
    {
      name: 'الرصيد الحالي',
      value: statistics.totalBalance.toLocaleString('en-US'),
      color: '#f59e0b'
    }
  ];

  if (showTransactionHistory && selectedAccount) {
    const accountTransactions = transactions.filter(t => t.supplierId === selectedAccount.id);
    return (
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تاريخ معاملات المورد</h1>
            <p className="text-gray-600 mt-2">{selectedAccount.supplierName}</p>
          </div>
          <Button 
            onClick={() => setShowTransactionHistory(false)}
            variant="outline"
          >
            العودة إلى قائمة الموردين
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {selectedAccount.currentBalance.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {selectedAccount.totalPurchases.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {selectedAccount.totalPayments.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {accountTransactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تاريخ المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge className={
                        transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'payment' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'refund' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {transaction.type === 'purchase' ? 'شراء' :
                         transaction.type === 'payment' ? 'دفع' :
                         transaction.type === 'refund' ? 'استرداد' : 'تعديل'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                    <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(transaction.amount).toLocaleString('en-US')} ر.س
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* العنوان والإحصائيات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين</h1>
          <p className="text-gray-600 mt-2">إدارة حسابات الموردين والمعاملات المالية</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مورد جديد
        </Button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              نشط: {statistics.activeAccounts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalBalance.toLocaleString('en-US')} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط الرصيد: {statistics.averageBalance.toLocaleString('en-US')} ر.س
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.totalPurchases.toLocaleString('en-US')} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.totalPayments.toLocaleString('en-US')} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو الهاتف أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccountType} onValueChange={setFilterAccountType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="تصفية بنوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="credit">ائتماني</SelectItem>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="mixed">مختلط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول الموردين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة حسابات الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right font-semibold text-gray-700">اسم المورد</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الهاتف</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الحالي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">نوع الحساب</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccounts.map((supplier, index) => (
                <TableRow key={supplier.id || index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <TableCell className="p-4">
                    <div className="font-medium text-gray-900">{supplier.supplierName}</div>
                    <div className="text-sm text-blue-600">{supplier.id ? `SUP${supplier.id.toString().padStart(3, '0')}` : 'SUP001'}</div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="text-sm text-gray-900">{supplier.phone || '0501234567'}</div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="font-medium text-gray-900">
                      {(supplier.openingBalance || 0).toLocaleString('en-US')} ريال
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className={`font-bold text-lg ${supplier.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {(supplier.currentBalance || 0).toLocaleString('en-US')} ريال
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="text-sm text-gray-900">آجل</div>
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      نشط
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowStatement(supplier)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="كشف حساب"
                      >
                        <FileText className="w-4 h-4 ml-1" />
                        كشف حساب
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* مربع حوار إضافة/تعديل مورد */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'تعديل حساب المورد' : 'إضافة مورد جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplierName">اسم المورد</Label>
              <Input
                id="supplierName"
                value={newAccount.supplierName}
                onChange={(e) => setNewAccount({...newAccount, supplierName: e.target.value})}
                placeholder="أدخل اسم المورد"
              />
            </div>
            <div>
              <Label htmlFor="phone">الهاتف</Label>
              <Input
                id="phone"
                value={newAccount.phone}
                onChange={(e) => setNewAccount({...newAccount, phone: e.target.value})}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={newAccount.email}
                onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            <div>
              <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
              <Input
                id="openingBalance"
                type="number"
                value={newAccount.openingBalance}
                onChange={(e) => setNewAccount({...newAccount, openingBalance: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="creditLimit">الحد الائتماني</Label>
              <Input
                id="creditLimit"
                type="number"
                value={newAccount.creditLimit}
                onChange={(e) => setNewAccount({...newAccount, creditLimit: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="accountType">نوع الحساب</Label>
              <Select value={newAccount.accountType} onValueChange={(value: 'credit' | 'cash' | 'mixed') => setNewAccount({...newAccount, accountType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">ائتماني</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="mixed">مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={newAccount.status} onValueChange={(value: 'active' | 'inactive' | 'blocked') => setNewAccount({...newAccount, status: value})}>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={isEditMode ? handleUpdateAccount : handleAddAccount}>
                {isEditMode ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog كشف حساب المورد */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-gray-900">
                كشف حساب المورد: {selectedSupplier?.name}
              </DialogTitle>
              <Button
                onClick={printSupplierStatement}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Printer className="w-4 h-4 ml-1" />
                طباعة الكشف
              </Button>
            </div>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-6">
              {/* معلومات المورد */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">اسم المورد:</span>
                      <p className="text-gray-900">{selectedSupplier.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">رقم الهاتف:</span>
                      <p className="text-gray-900">{selectedSupplier.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">الرصيد الافتتاحي:</span>
                      <p className="text-red-600 font-semibold">{parseFloat(selectedSupplier.balance || selectedSupplier.currentBalance || 0).toFixed(2)} ريال</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">نوع الحساب:</span>
                      <p className="text-gray-900">{selectedSupplier.accountType || 'credit'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* جدول المعاملات */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">تاريخ المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="text-right font-semibold text-gray-700">التاريخ</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">الوصف</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">المرجع</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">طريقة الدفع</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const transactions = getSupplierTransactions(selectedSupplier.id);
                        
                        if (transactions.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                لا توجد معاملات مالية لهذا المورد
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return transactions.map((transaction, index) => {
                          const amount = transaction.debit > 0 ? transaction.debit : -transaction.credit;
                          return (
                            <TableRow key={`${transaction.type}-${transaction.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                              <TableCell className="text-gray-700">
                                {new Date(transaction.date).toLocaleDateString('en-GB')}
                              </TableCell>
                              <TableCell className="text-gray-700">{transaction.description}</TableCell>
                              <TableCell className="text-gray-700">{transaction.reference}</TableCell>
                              <TableCell className="text-gray-700">
                                {transaction.debit > 0 ? 'نقدي' : 'تحويل بنكي'}
                              </TableCell>
                              <TableCell className={`font-semibold ${transaction.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {amount > 0 ? '+' : ''}{amount.toFixed(2)} ريال
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>

                  {/* الرصيد النهائي */}
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">الرصيد النهائي:</span>
                      <span className={`text-2xl font-bold ${calculateFinalBalance(selectedSupplier, getSupplierTransactions(selectedSupplier.id)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {calculateFinalBalance(selectedSupplier, getSupplierTransactions(selectedSupplier.id)).toFixed(2)} ريال
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* مكون التقرير للطباعة (مخفي) */}
      <div style={{ display: 'none' }}>
        <SupplierAccountsPrintReport 
          accounts={supplierAccounts}
          statistics={statistics}
          user={user2 || user}
        />
      </div>
    </div>
  );
}