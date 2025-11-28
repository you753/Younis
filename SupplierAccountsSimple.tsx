import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Building2,
  Download
} from 'lucide-react';
import SupplierAccountsPrint from '@/components/suppliers/SupplierAccountsPrint';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export default function SupplierAccountsSimple() {
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  const { data: paymentVouchers = [] } = useQuery<PaymentVoucher[]>({
    queryKey: ['/api/supplier-payment-vouchers']
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    totalBalance: suppliers.reduce((sum, s) => sum + parseFloat(s.balance || s.currentBalance || '0'), 0),
    totalPayments: paymentVouchers.reduce((sum, v) => sum + parseFloat(v.amount || '0'), 0)
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'SAR' });
  };

  const getBalanceColor = (balance: string | number) => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const downloadPDF = async () => {
    try {
      // البحث عن عنصر المعاينة في DOM
      const printElement = document.querySelector('.print-container') as HTMLElement;
      if (!printElement) {
        alert('لم يتم العثور على محتوى المعاينة');
        return;
      }

      // تحويل المعاينة إلى صورة بدقة عالية
      const canvas = await html2canvas(printElement, {
        scale: 2, // دقة عالية
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: printElement.scrollWidth,
        height: printElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // إنشاء PDF وإضافة الصورة
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // حساب أبعاد الصورة لتناسب صفحة A4
      const pdfWidth = 210; // عرض A4 بالمليمتر
      const pdfHeight = 297; // طول A4 بالمليمتر
      const imgWidth = pdfWidth - 20; // هامش 10 من كل جانب
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // إضافة الصورة للـ PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // إضافة صفحات إضافية إذا كان المحتوى طويل
      if (imgHeight > pdfHeight - 20) {
        let currentHeight = pdfHeight - 20;
        while (currentHeight < imgHeight) {
          pdf.addPage();
          const remainingHeight = imgHeight - currentHeight;
          
          // إضافة جزء من الصورة للصفحة الجديدة
          pdf.addImage(imgData, 'PNG', 10, 10 - currentHeight, imgWidth, imgHeight);
          currentHeight += pdfHeight - 20;
        }
      }
      
      // تحميل الملف
      const fileName = `تقرير-حسابات-الموردين-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('خطأ في تحميل PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };



  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين</h1>
        <Button 
          onClick={() => setShowPrintDialog(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          تحميل PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موردين نشطين</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalPayments)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث في حسابات الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو الهاتف أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة حسابات الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المورد</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-right">نوع الحساب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email || '-'}</TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(supplier.openingBalance)}
                  </TableCell>
                  <TableCell className={`text-center font-semibold ${getBalanceColor(supplier.balance || supplier.currentBalance)}`}>
                    {formatCurrency(supplier.balance || supplier.currentBalance)}
                  </TableCell>
                  <TableCell className="text-center">
                    {supplier.accountType === 'credit' ? 'آجل' : 
                     supplier.accountType === 'cash' ? 'نقدي' : 'مختلط'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-none w-[95vw] h-[95vh] p-0" aria-describedby="print-dialog-description">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>معاينة تقرير حسابات الموردين</span>
              <Button 
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                تحميل PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div id="print-dialog-description" className="sr-only">
            معاينة تقرير حسابات الموردين للطباعة
          </div>
          <div className="flex-1 overflow-auto">
            <SupplierAccountsPrint 
              suppliers={suppliers}
              paymentVouchers={paymentVouchers}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}