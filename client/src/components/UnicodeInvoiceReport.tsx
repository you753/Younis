import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PrinterIcon, Download } from 'lucide-react';

const UnicodeInvoiceReport: React.FC = () => {
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['#', 'رقم الفاتورة/المرجع', 'التاريخ', 'الوصف/البيان', 'المبلغ', 'الحالة'],
      ['1', 'INV-0001', '4/6/5202', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '15.00', 'مدفوع مؤجل'],
      ['2', 'INV-0002', '5/6/5202', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '1250.00', 'مدفوع مؤجل'],
      ['3', 'INV-0003', '5/6/5202', 'مؤسسة فاطمة عبدالله الحازمي التجارية', '15.00', 'مدفوع مؤجل']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المبيعات.csv';
    link.click();
  };

  // Define Arabic text as Unicode strings to ensure proper rendering
  const arabicTexts = {
    companyName: String.fromCharCode(0x0645, 0x0624, 0x0633, 0x0633, 0x0629, 0x0020, 0x0641, 0x0627, 0x0637, 0x0645, 0x0629, 0x0020, 0x0639, 0x0628, 0x062F, 0x0627, 0x0644, 0x0644, 0x0647, 0x0020, 0x0627, 0x0644, 0x062D, 0x0627, 0x0632, 0x0645, 0x064A, 0x0020, 0x0627, 0x0644, 0x062A, 0x062C, 0x0627, 0x0631, 0x064A, 0x0629),
    location: String.fromCharCode(0x0627, 0x0644, 0x0645, 0x0645, 0x0644, 0x0643, 0x0629, 0x0020, 0x0627, 0x0644, 0x0639, 0x0631, 0x0628, 0x064A, 0x0629, 0x0020, 0x0627, 0x0644, 0x0633, 0x0639, 0x0648, 0x062F, 0x064A, 0x0629, 0x060C, 0x0020, 0x062C, 0x062F, 0x0629, 0x060C, 0x0020, 0x0623, 0x0628, 0x0631, 0x0642),
    district: String.fromCharCode(0x0645, 0x0646, 0x0637, 0x0642, 0x0629, 0x0020, 0x0627, 0x0644, 0x0631, 0x063A, 0x0627, 0x0645, 0x0629),
    vatNumber: String.fromCharCode(0x0631, 0x0642, 0x0645, 0x0020, 0x0636, 0x0631, 0x064A, 0x0628, 0x0629, 0x0020, 0x0627, 0x0644, 0x0642, 0x064A, 0x0645, 0x0629, 0x0020, 0x0627, 0x0644, 0x0645, 0x0636, 0x0627, 0x0641, 0x0629, 0x003A, 0x0020, 0x0033, 0x0031, 0x0031, 0x0038, 0x0035, 0x0032, 0x0037, 0x0036, 0x0036, 0x0031, 0x0030, 0x0030, 0x0030, 0x0030, 0x0033),
    mobile: String.fromCharCode(0x0627, 0x0644, 0x062C, 0x0648, 0x0627, 0x0644, 0x003A, 0x0020, 0x0030, 0x0035, 0x0035, 0x0032, 0x0034, 0x0039, 0x0030, 0x0037, 0x0035, 0x0036),
    salesReport: String.fromCharCode(0x062A, 0x0642, 0x0631, 0x064A, 0x0631, 0x0020, 0x0627, 0x0644, 0x0645, 0x0628, 0x064A, 0x0639, 0x0627, 0x062A),
    dateRange: String.fromCharCode(0x0641, 0x062A, 0x0631, 0x0629, 0x0020, 0x0627, 0x0644, 0x062A, 0x0627, 0x0631, 0x064A, 0x062E, 0x003A, 0x0020, 0x0033, 0x0031, 0x002F, 0x0031, 0x0032, 0x002F, 0x0032, 0x0030, 0x0032, 0x0035, 0x0020, 0x002D, 0x0020, 0x0030, 0x0031, 0x002F, 0x0030, 0x0031, 0x002F, 0x0032, 0x0030, 0x0032, 0x0034),
    print: String.fromCharCode(0x0637, 0x0628, 0x0627, 0x0639, 0x0629),
    export: String.fromCharCode(0x062A, 0x0635, 0x062F, 0x064A, 0x0631, 0x0020, 0x0625, 0x0643, 0x0633, 0x0644),
    invoiceNumber: String.fromCharCode(0x0631, 0x0642, 0x0645, 0x0020, 0x0627, 0x0644, 0x0641, 0x0627, 0x062A, 0x0648, 0x0631, 0x0629, 0x002F, 0x0627, 0x0644, 0x0645, 0x0631, 0x062C, 0x0639),
    date: String.fromCharCode(0x0627, 0x0644, 0x062A, 0x0627, 0x0631, 0x064A, 0x062E),
    description: String.fromCharCode(0x0627, 0x0644, 0x0648, 0x0635, 0x0641, 0x002F, 0x0627, 0x0644, 0x0628, 0x064A, 0x0627, 0x0646),
    amount: String.fromCharCode(0x0627, 0x0644, 0x0645, 0x0628, 0x0644, 0x063A),
    status: String.fromCharCode(0x0627, 0x0644, 0x062D, 0x0627, 0x0644, 0x0629),
    paidDeferred: String.fromCharCode(0x0645, 0x062F, 0x0641, 0x0648, 0x0639, 0x0020, 0x0645, 0x0624, 0x062C, 0x0644),
    totalAmount: String.fromCharCode(0x0627, 0x0644, 0x0645, 0x062C, 0x0645, 0x0648, 0x0639, 0x0020, 0x0627, 0x0644, 0x0625, 0x062C, 0x0645, 0x0627, 0x0644, 0x064A, 0x0020, 0x0644, 0x0644, 0x0645, 0x0628, 0x0644, 0x063A, 0x003A, 0x0020, 0x0031, 0x0032, 0x0038, 0x0030, 0x002E, 0x0030, 0x0030, 0x0020, 0x0631, 0x064A, 0x0627, 0x0644)
  };

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl" lang="ar" style={{ fontFamily: 'Tahoma, Arial Unicode MS, sans-serif' }}>
      <Card className="max-w-full mx-auto shadow-lg border border-gray-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6">
            <div className="flex justify-between items-start mb-6">
              {/* معلومات الشركة الجانب الأيسر */}
              <div className="text-left flex-1" style={{ direction: 'ltr', textAlign: 'left' }}>
                <h1 className="text-sm font-normal text-gray-800 mb-1">
                  {arabicTexts.companyName}
                </h1>
                <p className="text-sm text-gray-600 mb-1">
                  {arabicTexts.location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {arabicTexts.district}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{arabicTexts.vatNumber}</p>
                  <p>{arabicTexts.mobile}</p>
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
                  {arabicTexts.companyName}
                </h1>
                <p className="text-sm text-gray-600 mb-1">
                  {arabicTexts.location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {arabicTexts.district}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{arabicTexts.vatNumber}</p>
                  <p>{arabicTexts.mobile}</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{arabicTexts.salesReport}</h2>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {arabicTexts.dateRange}
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <PrinterIcon className="ml-2 h-4 w-4" />
                  {arabicTexts.print}
                </Button>
                <Button 
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="ml-2 h-4 w-4" />
                  {arabicTexts.export}
                </Button>
              </div>
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400" style={{ fontFamily: 'Tahoma, Arial Unicode MS, sans-serif' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">#</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">{arabicTexts.invoiceNumber}</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">{arabicTexts.date}</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">{arabicTexts.description}</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">{arabicTexts.amount}</th>
                  <th className="border border-gray-400 p-2 text-center text-sm font-bold">{arabicTexts.status}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">1</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0001</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">4 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.companyName}</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.paidDeferred}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">2</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0002</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.companyName}</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">1250.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.paidDeferred}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">3</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0003</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.companyName}</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">{arabicTexts.paidDeferred}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* المجموع الإجمالي */}
          <div className="border border-gray-400 p-4 mt-0">
            <div className="text-center">
              <span className="text-sm">
                {arabicTexts.totalAmount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnicodeInvoiceReport;