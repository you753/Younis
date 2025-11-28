import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Printer, RefreshCw, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface Supplier {
  id?: number;
  name: string;
  supplierName?: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  balance?: number;
  status: 'active' | 'inactive';
  accountType: 'credit' | 'cash' | 'mixed';
  totalPurchases?: number;
  totalPayments?: number;
}

interface SupplierPaymentVoucher {
  id?: number;
  supplierId: number;
  voucherNumber: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  reference?: string;
}

// Format numbers properly for Arabic display
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)} ريال`;
};

export default function SimpleSupplierAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Form states
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0,
    status: 'active' as const,
    accountType: 'credit' as const
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    reference: ''
  });

  // Queries
  const { data: suppliers = [], isLoading, refetch } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    select: (data) => data || []
  });

  const { data: paymentVouchers = [] } = useQuery<SupplierPaymentVoucher[]>({
    queryKey: ['/api/supplier-payment-vouchers']
  });

  // Mutations
  const addSupplierMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          supplierName: data.name,
          currentBalance: data.openingBalance || 0
        })
      });
      if (!response.ok) throw new Error('فشل في إضافة المورد');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsAddDialogOpen(false);
      resetSupplierForm();
      toast({ title: "تم إضافة المورد بنجاح" });
    }
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/supplier-payment-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          supplierId: selectedSupplier?.id,
          voucherNumber: `PAY-${Date.now()}`,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (!response.ok) throw new Error('فشل في إضافة سند الدفع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsPaymentDialogOpen(false);
      resetPaymentForm();
      toast({ title: "تم إضافة سند الدفع بنجاح" });
    }
  });

  // Helper functions
  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      openingBalance: 0,
      status: 'active',
      accountType: 'credit'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      description: '',
      paymentMethod: 'cash',
      reference: ''
    });
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier =>
    (supplier.name || supplier.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.phone || '').includes(searchTerm)
  );

  // Calculate statistics
  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    totalOpeningBalance: suppliers.reduce((sum, s) => sum + (s.openingBalance || 0), 0),
    totalCurrentBalance: suppliers.reduce((sum, s) => sum + (s.currentBalance || s.balance || 0), 0)
  };

  // Print statement function
  const printSupplierStatement = (supplier: Supplier) => {
    const supplierVouchers = paymentVouchers.filter(v => v.supplierId === supplier.id);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>كشف حساب المورد - ${supplier.name || supplier.supplierName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
              color: black;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .report-title { 
              font-size: 20px; 
              margin-bottom: 20px; 
            }
            .supplier-info { 
              margin-bottom: 30px; 
              border: 1px solid #000; 
              padding: 15px; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            .table th, .table td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: center; 
            }
            .table th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .summary { 
              border: 2px solid #000; 
              padding: 15px; 
              margin-top: 20px; 
            }
            .summary-title { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: center; 
              margin-bottom: 15px; 
            }
            .summary-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px; 
              border-top: 1px solid #000; 
              padding-top: 15px; 
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">كشف حساب المورد</div>
            <div>تاريخ الإصدار: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
          
          <div class="supplier-info">
            <div class="info-row">
              <span><strong>اسم المورد:</strong> ${supplier.name || supplier.supplierName}</span>
              <span><strong>رقم الهاتف:</strong> ${supplier.phone}</span>
            </div>
            <div class="info-row">
              <span><strong>البريد الإلكتروني:</strong> ${supplier.email || 'غير محدد'}</span>
              <span><strong>العنوان:</strong> ${supplier.address || 'غير محدد'}</span>
            </div>
          </div>
          
          <table class="table">
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
                <td>${new Date().toLocaleDateString('en-GB')}</td>
                <td>الرصيد الافتتاحي</td>
                <td>${formatCurrency(supplier.openingBalance || 0)}</td>
                <td>-</td>
                <td>${formatCurrency(supplier.openingBalance || 0)}</td>
              </tr>
              ${supplierVouchers.map(voucher => `
                <tr>
                  <td>${new Date(voucher.date).toLocaleDateString('en-GB')}</td>
                  <td>${voucher.description}</td>
                  <td>-</td>
                  <td>${formatCurrency(voucher.amount)}</td>
                  <td>${formatCurrency((supplier.currentBalance || supplier.balance || 0))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-title">ملخص الحساب</div>
            <div class="summary-row">
              <span>الرصيد الافتتاحي:</span>
              <span>${formatCurrency(supplier.openingBalance || 0)}</span>
            </div>
            <div class="summary-row">
              <span>إجمالي المدفوعات:</span>
              <span>${formatCurrency(supplierVouchers.reduce((sum, v) => sum + v.amount, 0))}</span>
            </div>
            <div class="summary-row">
              <span><strong>الرصيد النهائي:</strong></span>
              <span><strong>${formatCurrency(supplier.currentBalance || supplier.balance || 0)}</strong></span>
            </div>
          </div>
          
          <div class="footer">
            <p>تم إنشاء هذا الكشف بتاريخ: ${new Date().toLocaleString('en-US')}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين</h1>
          <p className="text-gray-600 mt-1">إدارة حسابات الموردين والمعاملات المالية</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalSuppliers)}</div>
            <p className="text-xs text-gray-500">نشط: {formatNumber(stats.activeSuppliers)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">الأرصدة الافتتاحية</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOpeningBalance)}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">الأرصدة الحالية</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCurrentBalance)}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">سندات الدفع</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(paymentVouchers.length)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">قائمة الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-right font-semibold text-gray-700">اسم المورد</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الهاتف</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الحالي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد موردين
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {supplier.name || supplier.supplierName}
                    </TableCell>
                    <TableCell className="text-gray-700">{supplier.phone}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(supplier.openingBalance || 0)}</TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(supplier.currentBalance || supplier.balance || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>الرصيد الافتتاحي</Label>
              <Input
                type="number"
                value={supplierForm.openingBalance}
                onChange={(e) => setSupplierForm({...supplierForm, openingBalance: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select 
                value={supplierForm.status} 
                onValueChange={(value: 'active' | 'inactive') => setSupplierForm({...supplierForm, status: value})}
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
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => addSupplierMutation.mutate(supplierForm)}
                disabled={!supplierForm.name || !supplierForm.phone || addSupplierMutation.isPending}
              >
                {addSupplierMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Voucher Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة سند دفع - {selectedSupplier?.name || selectedSupplier?.supplierName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>البيان *</Label>
              <Input
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                placeholder="أدخل بيان الدفع"
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
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المرجع</Label>
              <Input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="رقم المرجع أو الإيصال"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => addPaymentMutation.mutate(paymentForm)}
                disabled={!paymentForm.amount || !paymentForm.description || addPaymentMutation.isPending}
              >
                {addPaymentMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>كشف حساب المورد - {selectedSupplier?.name || selectedSupplier?.supplierName}</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              {/* Supplier Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">معلومات المورد</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الاسم: </span>
                    <span className="font-medium">{selectedSupplier.name || selectedSupplier.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-medium">{selectedSupplier.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الرصيد الافتتاحي: </span>
                    <span className="font-medium">{formatCurrency(selectedSupplier.openingBalance || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الرصيد الحالي: </span>
                    <span className="font-medium">{formatCurrency(selectedSupplier.currentBalance || selectedSupplier.balance || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Vouchers */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">سندات الدفع</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">رقم السند</TableHead>
                        <TableHead className="text-right">البيان</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">طريقة الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentVouchers
                        .filter(voucher => voucher.supplierId === selectedSupplier.id)
                        .map((voucher, index) => (
                          <TableRow key={voucher.id || index}>
                            <TableCell>{new Date(voucher.date).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell>{voucher.voucherNumber}</TableCell>
                            <TableCell>{voucher.description}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(voucher.amount)}</TableCell>
                            <TableCell>
                              {voucher.paymentMethod === 'cash' ? 'نقداً' : 
                               voucher.paymentMethod === 'bank' ? 'تحويل بنكي' : 'شيك'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowStatement(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => printSupplierStatement(selectedSupplier)}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}