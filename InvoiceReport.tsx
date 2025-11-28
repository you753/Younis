import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrinterIcon, Download } from 'lucide-react';

interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: string;
  status: string;
}

interface InvoiceReportProps {
  companyName?: string;
  dateRange?: string;
}

const InvoiceReport = ({ 
  companyName = "مؤسسة فاطمة عبدالله الحازمي التجارية",
  dateRange = "31/12/2025 - 01/01/2024"
}: InvoiceReportProps) => {
  
  // بيانات مطابقة للصورة تماماً
  const invoiceItems = [
    {
      id: 1,
      invoiceNumber: "فات-0001",
      date: "٤/٦/٢٠٢٥",
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      amount: "١٥.٠٠",
      status: "مدفوع مؤجل"
    },
    {
      id: 2,
      invoiceNumber: "فات-0002",
      date: "٥/٦/٢٠٢٥",
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      amount: "١٢٥٠.٠٠",
      status: "مدفوع مؤجل"
    },
    {
      id: 3,
      invoiceNumber: "فات-0003",
      date: "٥/٦/٢٠٢٥",
      description: "مؤسسة فاطمة عبدالله الحازمي التجارية",
      amount: "١٥.٠٠",
      status: "مدفوع مؤجل"
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // تصدير إكسل
    const csvContent = [
      ['#', 'رقم الفاتورة/المرجع', 'التاريخ', 'الوصف/البيان', 'المبلغ', 'الحالة'],
      ...invoiceItems.map(item => [
        item.id,
        item.invoiceNumber,
        item.date,
        item.description,
        item.amount,
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المبيعات.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-white p-8 arabic-text" dir="rtl" lang="ar">
      <Card className="max-w-full mx-auto shadow-lg border border-gray-300">
        <CardContent className="p-0 arabic-text">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6">
            <div className="flex justify-between items-start mb-6">
              {/* معلومات الشركة بالإنجليزية */}
              <div className="text-left flex-1" dir="ltr">
                <h1 className="text-sm font-normal text-gray-800 mb-1">
                  مؤسسة فاطمة عبدالله الحازمي التجارية
                </h1>
                <p className="text-sm text-gray-600 mb-1">
                  المملكة العربية السعودية، جدة، أبرق
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  منطقة الرغامة
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>رقم ضريبة القيمة المضافة: 311852766100003</p>
                  <p>الجوال: 0552490756</p>
                </div>
              </div>

              {/* شعار الشركة */}
              <div className="flex flex-col items-center mx-8">
                <div className="w-20 h-20 border-2 border-gray-800 flex items-center justify-center mb-2 bg-white">
                  <svg width="60" height="60" viewBox="0 0 100 100" className="text-gray-800">
                    <rect x="20" y="30" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <rect x="30" y="20" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <rect x="35" y="10" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* معلومات الشركة بالعربية */}
              <div className="text-right flex-1">
                <h1 className="text-sm font-normal text-gray-800 mb-1">
                  مؤسسة فاطمة عبدالله الحازمي التجارية
                </h1>
                <p className="text-sm text-gray-600 mb-1">
                  المملكة العربية السعودية,جدة,أبرق
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  منطقة الرغامة
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>رقم ضريبة القيمة المضافة: 311852766100003</p>
                  <p>الجوال: 0552490756</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">تقرير المبيعات</h2>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                فترة التاريخ: ٣١/١٢/٢٠٢٥ - ٠١/٠١/٢٠٢٤
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

          {/* الجدول مطابق للصورة */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400" style={{ fontFamily: 'Cairo, Tahoma, Arial, sans-serif', unicodeBidi: 'bidi-override', direction: 'rtl' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">#</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">رقم الفاتورة/المرجع</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">التاريخ</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">الوصف/البيان</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">المبلغ</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center text-sm">{index + 1}</td>
                    <td className="border border-gray-400 p-2 text-center text-sm">{item.invoiceNumber}</td>
                    <td className="border border-gray-400 p-2 text-center text-sm">{item.date}</td>
                    <td className="border border-gray-400 p-2 text-center text-sm">{item.description}</td>
                    <td className="border border-gray-400 p-2 text-center text-sm">{item.amount}</td>
                    <td className="border border-gray-400 p-2 text-center text-sm">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* المجموع الإجمالي */}
          <div className="border border-gray-400 p-4 mt-0">
            <div className="text-center">
              <span className="text-sm">
                المجموع الإجمالي للمبلغ: ١٢٨٠.٠٠ ريال
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceReport;