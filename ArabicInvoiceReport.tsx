import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PrinterIcon, Download } from 'lucide-react';

interface ArabicInvoiceReportProps {
  companyName?: string;
  dateRange?: string;
}

const ArabicInvoiceReport: React.FC<ArabicInvoiceReportProps> = ({
  companyName = "مؤسسة فاطمة عبدالله الحازمي التجارية",
  dateRange = "31/12/2025 - 01/01/2024"
}: ArabicInvoiceReportProps) => {
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['#', 'رقم الفاتورة/المرجع', 'التاريخ', 'الوصف/البيان', 'المبلغ', 'الحالة'],
      ['1', 'فات-0001', '4/6/2025', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '15.00', 'مدفوع مؤجل'],
      ['2', 'فات-0002', '5/6/2025', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '1250.00', 'مدفوع مؤجل'],
      ['3', 'فات-0003', '5/6/2025', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '15.00', 'مدفوع مؤجل']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المبيعات.csv';
    link.click();
  };

  const containerStyle = {
    fontFamily: "'Cairo', 'Tahoma', 'Arial Unicode MS', sans-serif",
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    unicodeBidi: 'embed' as const
  };

  return (
    <div className="min-h-screen bg-white p-8 arabic-content" dir="rtl" lang="ar">
      <Card className="max-w-full mx-auto shadow-lg border border-gray-300">
        <CardContent className="p-0 arabic-content">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6">
            <div className="flex justify-between items-start mb-6">
              {/* معلومات الشركة الجانب الأيسر */}
              <div className="text-left flex-1" style={{ direction: 'ltr', textAlign: 'left' }}>
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

              {/* معلومات الشركة الجانب الأيمن */}
              <div className="text-right flex-1">
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
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">تقرير المبيعات</h2>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                فترة التاريخ: 31/12/2025 - 01/01/2024
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
            <table 
              className="w-full border-collapse border border-gray-400 arabic-content"
            >
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
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">1</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0001</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">4/6/5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">2</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0002</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5/6/5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">1250.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">3</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0003</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5/6/5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* المجموع الإجمالي */}
          <div className="border border-gray-400 p-4 mt-0">
            <div className="text-center">
              <span className="text-sm">
                المجموع الإجمالي للمبلغ: 1280.00 ريال
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArabicInvoiceReport;