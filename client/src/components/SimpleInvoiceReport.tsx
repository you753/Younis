import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PrinterIcon, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const SimpleInvoiceReport: React.FC = () => {
  // جلب بيانات المستخدم الحالي
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: true
  });
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Simple CSV export without encoding issues
    const data = "# ,رقم الفاتورة,التاريخ,الوصف,المبلغ,الحالة\n1,INV-0001,4/6/5202,مؤسسة فاطمة عبدالله الحازمي التجارية,15.00,مدفوع مؤجل\n2,INV-0002,5/6/5202,مؤسسة فاطمة عبدالله الحازمي التجارية,1250.00,مدفوع مؤجل\n3,INV-0003,5/6/5202,مؤسسة فاطمة عبدالله الحازمي التجارية,15.00,مدفوع مؤجل";
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales_report.csv';
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400">
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
                  <td className="border border-gray-400 p-2 text-center text-sm">4 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">2</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0002</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">1250.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center text-sm">3</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">INV-0003</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">5 / 6 / 5202</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مؤسسة فاطمة عبدالله الحازمي التجارية</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">15.00</td>
                  <td className="border border-gray-400 p-2 text-center text-sm">مدفوع مؤجل</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
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

export default SimpleInvoiceReport;