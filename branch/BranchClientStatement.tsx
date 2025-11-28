import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Printer, 
  Building2,
  Download,
  Share2,
  Calendar,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BranchClientStatementProps {
  branchId?: number;
  branchName?: string;
}

export default function BranchClientStatement({ branchId, branchName }: BranchClientStatementProps) {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState('all');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // بيانات الشركة للاستعلام
  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: 2000,
  });

  // جلب جميع العملاء من API
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  // جلب جميع الفواتير من API
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  // جلب سندات القبض من API
  const { data: clientReceiptVouchers = [] } = useQuery<any[]>({
    queryKey: ['/api/client-receipt-vouchers'],
  });

  const [selectedClient, setSelectedClient] = useState<any>(null);

  // تحديد أول عميل عند تحميل البيانات
  React.useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients]);

  // حساب بيانات كشف الحساب مع فلترة التاريخ
  const statementData = React.useMemo(() => {
    if (!selectedClient) return [];

    const statements: any[] = [];
    let runningBalance = parseFloat(selectedClient.openingBalance || '0');

    // إضافة الرصيد الافتتاحي
    statements.push({
      date: 'رصيد افتتاحي',
      description: 'الرصيد الافتتاحي',
      debit: 0,
      credit: 0,
      balance: runningBalance
    });

    // جمع الفواتير المرسلة لهذا العميل
    const clientSales = sales.filter((sale: any) => 
      sale.clientId === selectedClient.id && sale.sentToClientAccount
    );

    // جمع سندات القبض لهذا العميل
    const clientReceipts = clientReceiptVouchers.filter((voucher: any) =>
      voucher.clientId === selectedClient.id
    );

    // دمج الفواتير والسندات وترتيبها حسب التاريخ
    let allTransactions = [
      ...clientSales.map((sale: any) => ({
        date: new Date(sale.date),
        description: `فاتورة مبيعات رقم #${sale.id}`,
        debit: parseFloat(sale.total),
        credit: 0,
        type: 'sale'
      })),
      ...clientReceipts.map((receipt: any) => ({
        date: new Date(receipt.receiptDate || receipt.createdAt),
        description: `سند قبض رقم ${receipt.voucherNumber}`,
        debit: 0,
        credit: parseFloat(receipt.amount),
        type: 'receipt'
      }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // فلترة حسب التاريخ إذا كان محدداً
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // نهاية اليوم
      
      allTransactions = allTransactions.filter((transaction) => 
        transaction.date >= from && transaction.date <= to
      );
    }

    // إضافة المعاملات مع حساب الرصيد الجاري
    allTransactions.forEach((transaction) => {
      runningBalance += transaction.debit - transaction.credit;
      statements.push({
        date: transaction.date.toLocaleDateString('en-GB'),
        description: transaction.description,
        debit: transaction.debit,
        credit: transaction.credit,
        balance: runningBalance
      });
    });

    return statements;
  }, [selectedClient, sales, clientReceiptVouchers, fromDate, toDate]);

  // وظيفة الطباعة المحسنة
  const printStatement = () => {
    toast({
      title: "جاري تحضير الطباعة",
      description: "يتم الآن تحضير كشف الحساب للطباعة...",
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "خطأ في الطباعة",
        description: "تعذر فتح نافذة الطباعة. تأكد من إلغاء حجب النوافذ المنبثقة.",
        variant: "destructive"
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب العميل - ${selectedClient.name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
            @page { 
              size: A4; 
              margin: 1cm; 
            }
            .header { 
              page-break-inside: avoid; 
              margin-bottom: 20px; 
            }
            .statement-table { 
              page-break-inside: auto; 
            }
            .statement-table tr { 
              page-break-inside: avoid; 
              page-break-after: auto; 
            }
            .footer { 
              page-break-before: auto; 
              margin-top: 30px; 
            }
          }
          @media screen {
            body { 
              transform: scale(0.8); 
              transform-origin: top right; 
            }
          }
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
            line-height: 1.8;
            font-size: 14px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 15px;
            margin-bottom: 25px;
            padding: 20px;
          }
          .statement-title {
            font-size: 22px;
            color: black;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .print-date {
            color: black; 
            font-size: 13px;
            margin-top: 8px;
          }
          .client-info {
            background: white;
            border: 2px solid black;
            padding: 20px;
            margin-bottom: 25px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid black;
          }
          .info-label {
            font-weight: bold;
            color: black;
            font-size: 15px;
          }
          .info-value {
            color: black;
            font-size: 15px;
            font-weight: 500;
          }
          .opening-balance {
            color: black !important;
            font-weight: bold;
            font-size: 16px;
          }
          .current-balance {
            color: black !important;
            font-weight: bold;
            font-size: 16px;
          }
          .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 2px solid black;
          }
          .statement-table th, .statement-table td {
            border: 1px solid black;
            padding: 12px 10px;
            text-align: center;
            font-size: 13px;
          }
          .statement-table th {
            background: white;
            font-weight: bold;
            color: black;
            font-size: 14px;
          }
          .statement-table tbody tr {
            background: white;
          }
          .statement-table tbody tr:nth-child(even) {
            background: white;
          }
          .statement-table tbody tr:hover {
            background: white;
          }
          .debit { 
            color: black !important; 
            font-weight: bold;
            font-size: 14px;
          }
          .credit { 
            color: black !important; 
            font-weight: bold;
            font-size: 14px;
          }
          .balance { 
            color: black !important; 
            font-weight: bold;
            font-size: 14px;
          }
          .date-col, .desc-col {
            color: black !important;
            font-weight: 600;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: black;
            border-top: 2px solid black;
            padding-top: 15px;
            padding: 15px;
          }
          .footer p {
            margin: 5px 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="font-size: 26px; font-weight: bold; margin: 0 0 10px 0; color: black;">${branchName || 'الفرع الرئيسي'}</h1>
          <div class="statement-title">كشف حساب العميل</div>
          <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>
        
        <div class="client-info">
          <div class="info-row">
            <span class="info-label">اسم العميل:</span>
            <span class="info-value">${selectedClient.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رمز العميل:</span>
            <span class="info-value">${selectedClient.code}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الهاتف:</span>
            <span class="info-value">${selectedClient.phone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">العنوان:</span>
            <span class="info-value">${selectedClient.address}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الافتتاحي:</span>
            <span class="opening-balance">${selectedClient.openingBalance.toLocaleString()} ر.س</span>
          </div>
          <div class="info-row">
            <span class="info-label">الرصيد الحالي:</span>
            <span class="current-balance">${Math.abs(selectedClient.currentBalance).toLocaleString()} ر.س ${selectedClient.currentBalance >= 0 ? '(دائن)' : '(مدين)'}</span>
          </div>
          ${fromDate && toDate ? `
          <div class="info-row" style="background: #f0f0f0; padding: 15px; margin-top: 10px;">
            <span class="info-label">📅 الفترة المحددة:</span>
            <span class="info-value" style="font-weight: bold;">من ${new Date(fromDate).toLocaleDateString('en-GB')} إلى ${new Date(toDate).toLocaleDateString('en-GB')}</span>
          </div>
          ` : ''}
        </div>

        <table class="statement-table">
          <thead>
            <tr>
              <th style="width: 15%">التاريخ</th>
              <th style="width: 40%">البيان</th>
              <th style="width: 15%">مدين</th>
              <th style="width: 15%">دائن</th>
              <th style="width: 15%">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.map(item => `
              <tr>
                <td class="date-col">${item.date}</td>
                <td class="desc-col" style="text-align: right; padding-right: 15px;">${item.description}</td>
                <td class="debit">${item.debit > 0 ? item.debit.toLocaleString() + ' ر.س' : '-'}</td>
                <td class="credit">${item.credit > 0 ? item.credit.toLocaleString() + ' ر.س' : '-'}</td>
                <td class="balance">${item.balance.toLocaleString()} ر.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          
          <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // إضافة معالج الأحداث لتتبع نجاح الطباعة
    printWindow.onbeforeunload = () => {
      toast({
        title: "تمت الطباعة بنجاح",
        description: "تم طباعة كشف الحساب بنجاح",
      });
    };
    
    setTimeout(() => {
      printWindow.print();
      toast({
        title: "تم تحضير الطباعة بنجاح",
        description: "يمكنك الآن الطباعة أو الحفظ كملف PDF",
      });
    }, 500);
  };

  // وظيفة تصدير كـ PDF
  const exportToPDF = () => {
    toast({
      title: "جاري التصدير",
      description: "يتم الآن تصدير كشف الحساب كملف PDF...",
    });
    
    // استخدام نافذة الطباعة مع خيار الحفظ كـ PDF
    printStatement();
  };

  // وظيفة المشاركة
  const shareStatement = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `كشف حساب العميل - ${selectedClient.name}`,
          text: `كشف حساب العميل ${selectedClient.name} - الرصيد الحالي: ${Math.abs(selectedClient.currentBalance).toLocaleString()} ر.س`,
          url: window.location.href
        });
        toast({
          title: "تم المشاركة بنجاح",
          description: "تم مشاركة كشف الحساب بنجاح",
        });
      } catch (error) {
        toast({
          title: "تعذرت المشاركة",
          description: "لا يمكن مشاركة الملف في هذا الوقت",
          variant: "destructive"
        });
      }
    } else {
      // نسخ الرابط إلى الحافظة كبديل
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط كشف الحساب إلى الحافظة",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <style>{`
        @media print {
          * {
            background: white !important;
            color: black !important;
            border-color: black !important;
          }
          .bg-gradient-to-r, .bg-gradient-to-br, 
          .from-yellow-400, .to-yellow-500,
          .from-yellow-50, .to-yellow-100,
          [class*="bg-purple"], [class*="bg-blue"], 
          [class*="bg-red"], [class*="bg-green"],
          [class*="bg-yellow"], [class*="border-yellow"],
          [class*="border-red"], [class*="border-blue"],
          [class*="border-purple"], [class*="border-green"] {
            background: white !important;
            border-color: black !important;
          }
          .no-print, button {
            display: none !important;
          }
        }
      `}</style>
      
      {/* العنوان وأزرار الإجراءات المحسنة */}
      <div className="flex justify-between items-center mb-8 bg-white border-2 border-black p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-black" />
          <h1 className="text-3xl font-bold text-black">كشف حساب العملاء</h1>
        </div>
        
        {/* شريط الأزرار الاحترافي */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={printStatement}
            className="bg-black hover:bg-gray-800 text-white shadow-lg px-6 py-3 rounded-lg font-bold border-2 border-black"
          >
            <Printer className="ml-2 h-5 w-5" />
            طباعة
          </Button>
          
          <Button 
            onClick={exportToPDF}
            className="bg-white hover:bg-gray-100 text-black shadow-lg px-6 py-3 rounded-lg font-bold border-2 border-black"
          >
            <Download className="ml-2 h-5 w-5" />
            تصدير PDF
          </Button>
          
          <Button 
            onClick={shareStatement}
            className="bg-white hover:bg-gray-100 text-black shadow-lg px-6 py-3 rounded-lg font-bold border-2 border-black"
          >
            <Share2 className="ml-2 h-5 w-5" />
            مشاركة
          </Button>
          
          <Button 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="bg-white hover:bg-gray-100 text-black shadow-lg px-6 py-3 rounded-lg font-bold border-2 border-black"
          >
            <Filter className="ml-2 h-5 w-5" />
            خيارات متقدمة
          </Button>
        </div>
      </div>

      {/* شريط الخيارات المتقدمة */}
      {showAdvancedOptions && (
        <Card className="mb-6 border-2 border-black shadow-xl">
          <CardHeader className="bg-white border-b-2 border-black">
            <CardTitle className="text-black font-bold text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              خيارات الطباعة المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            {/* فلترة حسب التاريخ */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-black">
              <label className="block text-sm font-bold text-black mb-3">فلترة حسب الفترة الزمنية</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">من تاريخ</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg focus:border-gray-600 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg focus:border-gray-600 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                      toast({
                        title: "تم إعادة التعيين",
                        description: "تم إلغاء فلترة التاريخ",
                      });
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-black"
                  >
                    إعادة تعيين التاريخ
                  </Button>
                </div>
              </div>
              
              {fromDate && toDate && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-600">
                  <p className="text-sm font-bold text-green-800">
                    📅 الفترة المحددة: من {new Date(fromDate).toLocaleDateString('en-GB')} إلى {new Date(toDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">نوع الطباعة</label>
                <select className="w-full p-3 border-2 border-black rounded-lg focus:border-gray-600 focus:outline-none font-medium">
                  <option value="detailed">تفصيلي</option>
                  <option value="summary">موجز</option>
                  <option value="balance_only">الأرصدة فقط</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">تنسيق الطباعة</label>
                <select className="w-full p-3 border-2 border-black rounded-lg focus:border-gray-600 focus:outline-none font-medium">
                  <option value="a4">A4 عادي</option>
                  <option value="a4_landscape">A4 أفقي</option>
                  <option value="thermal">طباعة حرارية</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* اختيار العميل */}
      <Card className="mb-8 border-3 border-yellow-400 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b-2 border-yellow-600">
          <CardTitle className="text-black font-bold text-xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            اختيار العميل
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-6 border-3 rounded-xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                  selectedClient.id === client.id
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 transform scale-105 shadow-2xl'
                    : 'border-gray-300 bg-white hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <h3 className="font-bold text-black mb-3 text-lg">{client.name}</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-black font-semibold">الرمز: </span>
                    <span className="font-bold text-gray-700">{client.code}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-black font-semibold">الرصيد الافتتاحي: </span>
                    <span className="font-bold text-gray-900 text-lg">
                      {client.openingBalance.toLocaleString()} ر.س
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-black font-semibold">الرصيد الحالي: </span>
                    <span className="font-bold text-gray-900 text-lg">
                      {Math.abs(client.currentBalance).toLocaleString()} ر.س
                      <span className="text-xs block text-gray-600">
                        {client.currentBalance >= 0 ? '(دائن)' : '(مدين)'}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* معلومات العميل المحدد */}
      <Card className="mb-8 border-2 border-gray-900">
        <CardHeader className="bg-gray-100 border-b-2 border-gray-900">
          <CardTitle className="text-gray-900 font-bold text-xl">تفاصيل العميل المحدد</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border-2 border-gray-900">
              <p className="text-sm text-gray-600 mb-2 font-semibold">اسم العميل</p>
              <p className="text-xl font-bold text-gray-900">{selectedClient.name}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2 border-gray-900">
              <p className="text-sm text-gray-600 mb-2 font-semibold">رمز العميل</p>
              <p className="text-xl font-bold text-gray-900">{selectedClient.code}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2 border-gray-900">
              <p className="text-sm text-gray-600 mb-2 font-semibold">الرصيد الافتتاحي</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedClient.openingBalance.toLocaleString()} ر.س
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2 border-gray-900">
              <p className="text-sm text-gray-600 mb-2 font-semibold">الرصيد الحالي</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.abs(selectedClient.currentBalance).toLocaleString()} ر.س
                <span className="text-sm block text-gray-600 font-normal">
                  {selectedClient.currentBalance >= 0 ? 'دائن' : 'مدين'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* فلترة حسب التاريخ - تظهر دائماً */}
      <Card className="mb-6 border-2 border-gray-900">
        <CardContent className="p-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">تصفية حسب التاريخ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">من تاريخ</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-gray-600 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">إلى تاريخ</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-gray-600 focus:outline-none"
                />
              </div>
            </div>
            {(fromDate || toDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  toast({
                    title: "تم إعادة التعيين",
                    description: "تم إلغاء فلترة التاريخ",
                  });
                }}
                className="mt-3 border-red-600 text-red-600 hover:bg-red-50"
              >
                إعادة تعيين التاريخ
              </Button>
            )}
            {fromDate && toDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-600">
                <p className="text-sm font-bold text-blue-800">
                  📅 عرض الفترة من {new Date(fromDate).toLocaleDateString('en-GB')} إلى {new Date(toDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* كشف الحساب الاحترافي */}
      <div className="bg-white rounded-lg border-2 border-gray-900 overflow-hidden">
        {/* هيدر معلومات العميل */}
        <div className="bg-gray-100 border-b-2 border-gray-900 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">كشف حساب - شركة النور التجارية</h2>
              <div className="grid grid-cols-3 gap-8 text-sm">
                <div className="text-center">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold border border-gray-900">
                    الرصيد الافتتاحي: 0 ر.س
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold border border-gray-900">
                    الرصيد الحالي: {Math.abs(selectedClient.currentBalance).toLocaleString()} ر.س
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold border border-gray-900">
                    رمز العميل: CLI1
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={printStatement}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة
              </Button>
              <Button 
                onClick={exportToPDF}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              >
                <Download className="ml-2 h-5 w-5" />
                تصدير PDF
              </Button>
            </div>
          </div>
        </div>

        {/* الجدول الاحترافي */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="px-6 py-4 text-center font-bold text-lg border-r border-gray-900">التاريخ</th>
                <th className="px-6 py-4 text-center font-bold text-lg border-r border-gray-900">البيان</th>
                <th className="px-6 py-4 text-center font-bold text-lg border-r border-gray-900">مدين</th>
                <th className="px-6 py-4 text-center font-bold text-lg border-r border-gray-900">دائن</th>
                <th className="px-6 py-4 text-center font-bold text-lg">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {statementData.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300`}>
                  <td className="px-6 py-4 text-center text-gray-900 font-semibold border-r border-gray-300">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 font-semibold border-r border-gray-300">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-center font-bold border-r border-gray-300">
                    {item.debit > 0 ? (
                      <span className="text-gray-900 text-lg">{item.debit.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-bold border-r border-gray-300">
                    {item.credit > 0 ? (
                      <span className="text-gray-900 text-lg">{item.credit.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    <span className="text-gray-900 text-lg bg-white px-3 py-1 rounded-lg border border-gray-900">
                      {item.balance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* فوتر الطباعة */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              تم إنشاء التقرير بتاريخ: {new Date().toLocaleDateString('en-GB')}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={printStatement}
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}