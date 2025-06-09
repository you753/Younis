import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrinterIcon, Download } from 'lucide-react';

interface InvoiceItem {
  id: number;
  description: string;
  customerCode: string;
  type: string;
  date: string;
  invoiceNumber: string;
  unitPrice: number;
  quantity: number;
  totalBeforeVAT: number;
  vatAmount: number;
  totalAfterVAT: number;
}

interface InvoiceReportProps {
  companyName?: string;
  dateRange?: string;
}

const InvoiceReport = ({ 
  companyName = "مؤسسة فاطمة عبدالله الحازمي التجارية",
  dateRange = "31/12/2025 - 01/01/2024"
}: InvoiceReportProps) => {
  
  // بيانات تجريبية مطابقة للصورة
  const invoiceItems: InvoiceItem[] = [
    {
      id: 1,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك كن",
      type: "خدمة كن",
      date: "2025-06-05",
      invoiceNumber: "0643",
      unitPrice: 7370.00,
      quantity: 1.0,
      totalBeforeVAT: 1105.50,
      vatAmount: 0.00,
      totalAfterVAT: 8475.50
    },
    {
      id: 2,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك",
      type: "خدمة خارجي",
      date: "2025-05-31",
      invoiceNumber: "0642",
      unitPrice: 100.00,
      quantity: 1.0,
      totalBeforeVAT: 15.00,
      vatAmount: 0.00,
      totalAfterVAT: 115.00
    },
    {
      id: 3,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك كن",
      type: "خدمة كن الخرجي التجارية",
      date: "2025-05-29",
      invoiceNumber: "0641",
      unitPrice: 16160.00,
      quantity: 1.0,
      totalBeforeVAT: 2424.00,
      vatAmount: 0.00,
      totalAfterVAT: 18584.00
    },
    {
      id: 4,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك",
      type: "خدمة خارجي",
      date: "2025-05-26",
      invoiceNumber: "0640",
      unitPrice: 140.00,
      quantity: 1.0,
      totalBeforeVAT: 21.00,
      vatAmount: 0.00,
      totalAfterVAT: 161.00
    },
    {
      id: 5,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك",
      type: "خدمة خارجي",
      date: "2025-05-25",
      invoiceNumber: "0639",
      unitPrice: 175.00,
      quantity: 1.0,
      totalBeforeVAT: 26.25,
      vatAmount: 0.00,
      totalAfterVAT: 201.25
    },
    {
      id: 6,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك",
      type: "خدمة خارجي",
      date: "2025-05-24",
      invoiceNumber: "0638",
      unitPrice: 315.00,
      quantity: 1.0,
      totalBeforeVAT: 47.25,
      vatAmount: 0.00,
      totalAfterVAT: 362.25
    },
    {
      id: 7,
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      customerCode: "ترك",
      type: "خدمة خارجي",
      date: "2025-05-23",
      invoiceNumber: "0637",
      unitPrice: 210.00,
      quantity: 1.0,
      totalBeforeVAT: 31.50,
      vatAmount: 0.00,
      totalAfterVAT: 241.50
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // تصدير إكسل
    const csvContent = [
      ['#', 'نوع المنتج', 'أجمالي', 'سعر الوحدة', 'التاريخ', 'جذة البيع', 'البحوثة', 'مبلغ قائمة الضريبة', 'مبلغ ضريبة القيمة المضافة', 'الضريبة المضافة', 'الإجمالي'],
      ...invoiceItems.map(item => [
        item.id,
        item.description,
        item.customerCode,
        item.type,
        item.date,
        item.invoiceNumber,
        item.unitPrice,
        item.quantity,
        item.totalBeforeVAT,
        item.vatAmount,
        item.totalAfterVAT
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المبيعات.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl">
      <Card className="max-w-7xl mx-auto shadow-lg border border-gray-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-white border-b-2 border-gray-300 p-6">
            <div className="flex justify-between items-start">
              {/* معلومات الشركة */}
              <div className="text-right">
                <h1 className="text-lg font-bold text-gray-800 mb-1">
                  Fatima Abdullah Al Hazmi Trading Establishment
                </h1>
                <p className="text-sm text-gray-600 mb-1">
                  Kingdom Of Saudi Arabia,Jeddah,Abraq Al-Raghama District
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>VAT No: 311852766100003</p>
                  <p>Mobile: 0552490756</p>
                </div>
              </div>

              {/* شعار الشركة */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 border-2 border-gray-400 flex items-center justify-center mb-2">
                  <div className="text-2xl">🏢</div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">مؤسسة فاطمة عبدالله الحازمي التجارية</p>
                  <p className="text-gray-600">المملكة العربية السعودية,جدة,أبرق الرغامة</p>
                  <p className="text-gray-600">الرقم الضريبي: 311852766100003</p>
                  <p className="text-gray-600">الجوال: 0552490756</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <h2 className="text-xl font-bold text-gray-800">تقرير المبيعات</h2>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                منتج التاريخ: {dateRange}
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <PrinterIcon className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
                <Button 
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تصدير إكسل
                </Button>
              </div>
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">#</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">نوع المنتج</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">أجمالي</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">سعر الوحدة</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">التاريخ</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">جذة البيع</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">البحوثة</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3 min-w-[120px]">مبلغ قائمة ضريبة القيمة المضافة</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3 min-w-[120px]">مبلغ ضريبة القيمة المضافة</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 border-r border-gray-300 p-3">الضريبة المضافة</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 p-3">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item) => (
                  <TableRow key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="text-center border-r border-gray-200 p-3 font-medium">
                      {item.id}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 text-sm">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 font-medium">
                      {item.customerCode}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3">
                      {item.type}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3">
                      {item.date}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 font-medium">
                      {item.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3">
                      مبتوع
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 font-mono">
                      {item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 font-mono">
                      {item.totalBeforeVAT.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200 p-3 font-mono">
                      {item.vatAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center p-3 font-mono font-bold">
                      {item.totalAfterVAT.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* المجاميع */}
          <div className="bg-gray-50 border-t-2 border-gray-300 p-6">
            <div className="flex justify-end">
              <div className="w-96 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">المجموع الفرعي:</span>
                  <span className="font-mono">
                    {invoiceItems.reduce((sum, item) => sum + item.unitPrice, 0).toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono">
                    {invoiceItems.reduce((sum, item) => sum + item.vatAmount, 0).toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-gray-400 pt-2">
                  <span>الإجمالي النهائي:</span>
                  <span className="font-mono">
                    {invoiceItems.reduce((sum, item) => sum + item.totalAfterVAT, 0).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceReport;