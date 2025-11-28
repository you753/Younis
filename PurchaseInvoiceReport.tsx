import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PrinterIcon, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PurchaseInvoiceReportProps {
  purchaseData?: any;
}

const PurchaseInvoiceReport: React.FC<PurchaseInvoiceReportProps> = ({ purchaseData }) => {
  // جلب بيانات المستخدم الحالي
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: true
  });
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data = "# ,رقم الفاتورة,التاريخ,المورد,المبلغ,الحالة\n1,PUR-0001,4/6/5202,مورد تجاري,2500.00,مدفوع\n2,PUR-0002,5/6/5202,مورد آخر,1800.00,مؤجل";
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'purchase_report.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl" style={{ fontFamily: 'Tahoma' }}>
      <Card className="max-w-full mx-auto shadow-lg border border-gray-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6">
            <div className="flex justify-between items-start mb-6">
              
              {/* Left Company Info */}
              <div className="text-left flex-1" style={{ textAlign: 'left' }}>
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

              {/* Company Logo and User Avatar */}
              <div className="flex flex-col items-center mx-8">
                {/* Company Logo */}
                <div className="w-20 h-20 border-2 border-gray-800 flex items-center justify-center mb-2 bg-white overflow-hidden">
                  <img 
                    src="/uploads/company/logo.svg" 
                    alt="شعار الشركة" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
                    }}
                  />
                  <div className="text-4xl hidden fallback-logo">🏢</div>
                </div>
                <p className="text-xs text-gray-600 text-center mb-2">شعار الشركة</p>
                
                {/* User Avatar */}
                <div className="w-16 h-16 border-2 border-gray-600 rounded-full flex items-center justify-center bg-white overflow-hidden">
                  {(currentUser as any)?.avatar ? (
                    <img 
                      src={(currentUser as any).avatar} 
                      alt="صورة المستخدم" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-avatar')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`text-2xl ${(currentUser as any)?.avatar ? 'hidden' : 'flex'} fallback-avatar items-center justify-center`}>👤</div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-1">
                  {(currentUser as any)?.fullName || 'المستخدم'}
                </p>
              </div>

              {/* Right Company Info */}
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

            {/* Invoice Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">فاتورة مشتريات</h2>
              <p className="text-sm text-gray-600 mt-2">
                فترة التاريخ: 31/12/2025 - 01/01/2024
              </p>
            </div>

            {/* Print and Export Buttons */}
            <div className="flex gap-2 mb-4 print:hidden">
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <PrinterIcon className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 ml-2" />
                تصدير إكسل
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-300">
                    <th className="p-2 text-right text-sm font-semibold text-gray-800 border-l border-gray-300">#</th>
                    <th className="p-2 text-right text-sm font-semibold text-gray-800 border-l border-gray-300">رقم الفاتورة</th>
                    <th className="p-2 text-right text-sm font-semibold text-gray-800 border-l border-gray-300">التاريخ</th>
                    <th className="p-2 text-right text-sm font-semibold text-gray-800 border-l border-gray-300">المورد</th>
                    <th className="p-2 text-right text-sm font-semibold text-gray-800 border-l border-gray-300">المبلغ</th>
                    <th className="p-2 text-right text-sm font-semibold text-gray-800">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">1</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">PUR-0001</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">4/6/5202</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">مورد تجاري رئيسي</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">2,500.00</td>
                    <td className="p-2 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">مدفوع</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">2</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">PUR-0002</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">5/6/5202</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">مورد ثانوي</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">1,800.00</td>
                    <td className="p-2 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">مؤجل</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">3</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">PUR-0003</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">5/6/5202</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">مورد معدات</td>
                    <td className="p-2 text-sm text-gray-700 border-l border-gray-200">3,200.00</td>
                    <td className="p-2 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">مدفوع</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>إجمالي عدد الفواتير: 3</p>
                  <p>تاريخ الطباعة: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    إجمالي المشتريات: 7,500.00 ريال
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseInvoiceReport;