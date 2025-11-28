import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, DollarSign, Calendar, CreditCard, Search, Plus, Eye, FileText, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface BranchClientPaymentsProps {
  branchId?: number;
}

export default function BranchClientPayments({ branchId }: BranchClientPaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب سندات القبض - فقط سندات هذا الفرع
  const { data: receiptVouchers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/client-receipt-vouchers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/client-receipt-vouchers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // بيانات تجريبية شاملة لسندات القبض (للعرض فقط)
  const mockReceiptVouchers = [
    {
      id: 1,
      voucherNumber: 'REC-2025-001',
      client: {
        id: 1,
        name: 'شركة النور التجارية المحدودة',
        code: 'CLI001'
      },
      amount: 15000,
      paymentMethod: 'تحويل بنكي',
      bankAccount: 'الراجحي - 608010167346',
      referenceNumber: 'TRF-789456123',
      date: '2025-07-17',
      dueDate: '2025-07-20',
      status: 'confirmed',
      description: 'تحصيل مقابل فاتورة رقم INV-2025-003',
      createdBy: 'أحمد محمد',
      approvedBy: 'مدير الحسابات',
      notes: 'تم التحويل بنجاح',
      category: 'مبيعات',
      invoiceNumber: 'INV-2025-003'
    },
    {
      id: 2,
      voucherNumber: 'REC-2025-002',
      client: {
        id: 2,
        name: 'مؤسسة البركة للتجارة العامة',
        code: 'CLI002'
      },
      amount: 8500,
      paymentMethod: 'نقدي',
      bankAccount: null,
      referenceNumber: 'CASH-001',
      date: '2025-07-16',
      dueDate: '2025-07-16',
      status: 'confirmed',
      description: 'تحصيل نقدي من مبيعات الشهر',
      createdBy: 'فاطمة أحمد',
      approvedBy: 'مدير الفرع',
      notes: 'تحصيل فوري نقداً',
      category: 'مبيعات',
      invoiceNumber: 'INV-2025-004'
    },
    {
      id: 3,
      voucherNumber: 'REC-2025-003',
      client: {
        id: 3,
        name: 'متجر الإلكترونيات الحديثة',
        code: 'CLI003'
      },
      amount: 3200,
      paymentMethod: 'شيك',
      bankAccount: 'البنك الأهلي - 401234567890',
      referenceNumber: 'CHQ-456789',
      date: '2025-07-15',
      dueDate: '2025-07-18',
      status: 'pending',
      description: 'شيك مؤجل للفواتير المستحقة',
      createdBy: 'محمد سالم',
      approvedBy: 'في الانتظار',
      notes: 'شيك مؤجل - يستحق خلال 3 أيام',
      category: 'مبيعات',
      invoiceNumber: 'INV-2025-005'
    },
    {
      id: 4,
      voucherNumber: 'REC-2025-004',
      client: {
        id: 4,
        name: 'شركة الأعمال المتكاملة',
        code: 'CLI004'
      },
      amount: 12500,
      paymentMethod: 'تحويل بنكي',
      bankAccount: 'سامبا - 502030405060',
      referenceNumber: 'TRF-147258369',
      date: '2025-07-14',
      dueDate: '2025-07-14',
      status: 'confirmed',
      description: 'دفعة أولى من مستحقات الشهر',
      createdBy: 'عبد الله يوسف',
      approvedBy: 'مدير المالية',
      notes: 'دفعة 50% من إجمالي المستحقات',
      category: 'مبيعات',
      invoiceNumber: 'INV-2025-006'
    },
    {
      id: 5,
      voucherNumber: 'REC-2025-005',
      client: {
        id: 5,
        name: 'مكتبة العلم والمعرفة',
        code: 'CLI005'
      },
      amount: 7800,
      paymentMethod: 'بطاقة ائتمان',
      bankAccount: 'فيزا **** 1234',
      referenceNumber: 'CARD-987654',
      date: '2025-07-13',
      dueDate: '2025-07-13',
      status: 'failed',
      description: 'دفع بالبطاقة الائتمانية - فشل',
      createdBy: 'سارة محمد',
      approvedBy: 'غير مطلوب',
      notes: 'فشل في المعاملة - رصيد غير كافي',
      category: 'مبيعات',
      invoiceNumber: 'INV-2025-007'
    }
  ];

  const filteredVouchers = receiptVouchers.filter(voucher => {
    const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.client.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || voucher.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            مؤكد
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 ml-1" />
            فشل
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const handlePrint = (voucher: any) => {
    const branchName = branch?.name || '';
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>سند قبض - ${voucher.voucherNumber}</title>
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
              color: #059669;
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
              <h1>سند قبض</h1>
              <div class="voucher-number">رقم السند: ${voucher.voucherNumber}</div>
            </div>

            <table>
              <tr>
                <th>التاريخ</th>
                <td>${voucher.date}</td>
              </tr>
              <tr>
                <th>اسم العميل</th>
                <td>${voucher.client.name}</td>
              </tr>
              <tr class="amount-row">
                <th>المبلغ المستلم</th>
                <td>${voucher.amount.toLocaleString('en-US')} ريال</td>
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'تحويل بنكي':
        return '🏦';
      case 'نقدي':
        return '💵';
      case 'شيك':
        return '📝';
      case 'بطاقة ائتمان':
        return '💳';
      default:
        return '💰';
    }
  };

  const totalReceipts = receiptVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
  const todayReceipts = receiptVouchers.filter(v => v.date === '2025-07-17').reduce((sum, v) => sum + v.amount, 0);
  const confirmedReceipts = receiptVouchers.filter(v => v.status === 'confirmed').length;
  const averageReceipt = totalReceipts / receiptVouchers.length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Receipt className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سندات القبض</h1>
          <p className="text-gray-600">إدارة مقبوضات العملاء - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المقبوضات</p>
                <p className="text-2xl font-bold text-green-600">{totalReceipts.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-green-600">للفرع رقم {branchId}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مقبوضات اليوم</p>
                <p className="text-2xl font-bold text-blue-600">{todayReceipts.toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-blue-600">17 يوليو 2025</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">السندات المؤكدة</p>
                <p className="text-2xl font-bold text-purple-600">{confirmedReceipts}</p>
                <p className="text-xs text-purple-600">من أصل {receiptVouchers.length} سند</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط السند</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(averageReceipt).toLocaleString('en-US')} ريال</p>
                <p className="text-xs text-orange-600">المتوسط الحسابي</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في السندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">كل الحالات</option>
            <option value="confirmed">مؤكد</option>
            <option value="pending">قيد المراجعة</option>
            <option value="failed">فشل</option>
          </select>
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="نقدي">نقدي</option>
            <option value="شيك">شيك</option>
            <option value="بطاقة ائتمان">بطاقة ائتمان</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقرير المقبوضات
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            سند قبض جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">سندات القبض</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {filteredVouchers.length} من أصل {receiptVouchers.length} سند
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">رقم السند</th>
                  <th className="text-right p-4 font-semibold text-gray-700">العميل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">طريقة الدفع</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الوصف</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((voucher, index) => (
                  <tr key={voucher.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-blue-600">{voucher.voucherNumber}</div>
                      <div className="text-xs text-gray-500">{voucher.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{voucher.client.name}</div>
                      <div className="text-sm text-blue-600">{voucher.client.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-green-600">
                        {voucher.amount.toLocaleString('en-US')} ريال
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPaymentMethodIcon(voucher.paymentMethod)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{voucher.paymentMethod}</div>
                          {voucher.bankAccount && (
                            <div className="text-xs text-gray-500">{voucher.bankAccount}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{voucher.date}</div>
                      <div className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline ml-1" />
                        استحقاق: {voucher.dueDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={voucher.description}>
                        {voucher.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        أنشأ بواسطة: {voucher.createdBy}
                      </div>
                      {voucher.invoiceNumber && (
                        <div className="text-xs text-blue-600">
                          فاتورة: {voucher.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {getStatusBadge(voucher.status)}
                        {voucher.referenceNumber && (
                          <div className="text-xs text-gray-500">
                            مرجع: {voucher.referenceNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="طباعة السند"
                          onClick={() => handlePrint(voucher)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="تحميل PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="p-4 text-gray-900">الإجمالي</td>
                  <td className="p-4"></td>
                  <td className="p-4 text-green-900 text-lg">
                    {filteredVouchers.reduce((sum, voucher) => sum + voucher.amount, 0).toLocaleString('en-US')} ريال
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredVouchers.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سندات قبض</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على سندات تطابق معايير البحث</p>
              <Button onClick={() => {setSearchTerm(''); setFilterStatus('all'); setFilterPaymentMethod('all');}}>
                مسح جميع الفلاتر
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}