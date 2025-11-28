import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClientReceiptInvoiceProps {
  voucher: {
    id: number;
    voucherNumber: string;
    amount: string;
    paymentMethod: string;
    receiptDate: string;
    description?: string;
    reference?: string;
    status: string;
  };
  client: {
    id: number;
    name: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
}

export const ClientReceiptInvoice: React.FC<ClientReceiptInvoiceProps> = ({ voucher, client, onClose }) => {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US') + ' ريال سعودي';
  };

  // Convert number to Arabic words (same as supplier payment)
  const numberToArabicWords = (num: number): string => {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
    const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف'];

    if (num === 0) return 'صفر';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 !== 0 ? ' ' + numberToArabicWords(num % 100) : '');
    if (num < 10000) return thousands[Math.floor(num / 1000)] + (num % 1000 !== 0 ? ' ' + numberToArabicWords(num % 1000) : '');
    
    return num.toString();
  };

  const amountInWords = numberToArabicWords(Math.floor(parseFloat(voucher.amount)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header with Print and Close buttons */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-bold text-gray-800">فاتورة سند القبض</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>🖨️</span>
              طباعة
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Invoice Content - Matching Exact Design from Image */}
        <div className="invoice-print-content p-8 bg-gray-50" style={{ direction: 'rtl' }}>
          {/* Header with Company Name */}
          <div className="text-center mb-8">
            
            <p className="text-sm text-gray-600">جده البغداديه الشرقيه | 0567537599 | byrwl8230@gmail.com</p>
            <div className="border-b-2 border-gray-300 mt-4"></div>
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Left: Voucher Type */}
            <div className="text-right">
              <h2 className="text-lg font-bold mb-2">سند قبض للعميل</h2>
              <p className="text-sm">رقم السند: <span className="font-bold">{voucher.voucherNumber}</span></p>
              <p className="text-sm">التاريخ: <span>{formatDate(voucher.receiptDate)}</span></p>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="شعار الشركة" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-white font-bold text-lg">ش</span>
                </div>
              )}
            </div>

            {/* Right: Date and Contact */}
            <div className="text-left">
              <p className="text-sm">التاريخ: {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</p>
              <p className="text-sm">المحاسب: {user?.fullName || 'غير محدد'}</p>
              <p className="text-sm">الهاتف: 0501234567</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="mb-8">
            <h3 className="text-base font-bold mb-2">بيانات العميل</h3>
            <p>اسم العميل: <span className="font-semibold">{client.name}</span></p>
            {client.phone && <p>رقم الهاتف: <span className="font-semibold">{client.phone}</span></p>}
          </div>

          {/* Payment Details - Simple Table */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-blue-700 text-center">تفاصيل الدفع</h3>
            
            <table className="w-full bg-white rounded-lg border border-gray-300 overflow-hidden">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium text-gray-600 w-1/3">طريقة الدفع:</td>
                  <td className="px-4 py-3 font-semibold">{voucher.paymentMethod}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium text-gray-600">حالة السند:</td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    {voucher.status === 'paid' ? 'مدفوع' : voucher.status}
                  </td>
                </tr>
                {voucher.description && (
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-gray-600">البيان:</td>
                    <td className="px-4 py-3">{voucher.description}</td>
                  </tr>
                )}
                <tr className="bg-green-50">
                  <td className="px-4 py-4 font-bold text-gray-800">المبلغ المدفوع:</td>
                  <td className="px-4 py-4">
                    <span className="text-2xl font-bold text-green-600">
                      {parseFloat(voucher.amount).toFixed(2)} ريال
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-600">المبلغ كتابة:</td>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {amountInWords} ريال سعودي فقط لا غير
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-16 mb-8">
            <div className="text-center">
              <div className="border-b-2 border-dashed border-gray-400 h-12 mb-2"></div>
              <p className="text-sm font-semibold">المحاسب:</p>
              <p className="text-xs text-gray-500">التوقيع والختم</p>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-dashed border-gray-400 h-12 mb-2"></div>
              <p className="text-sm font-semibold">العميل:</p>
              <p className="text-xs text-gray-500">التوقيع والختم</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>هذا السند معتمد الكترونياً ولا يحتاج إلى توقيع</p>
            <p>تاريخ الطباعة: {new Date().toLocaleDateString('en-GB')} - {new Date().toLocaleTimeString('en-US')}</p>
          </div>

          {/* Action Buttons - Only in Modal */}
          <div className="print:hidden flex justify-center gap-4 mt-8">
            <button 
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              إغلاق
            </button>
            <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>🖨️</span>
              طباعة
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          /* Hide all non-print elements */
          body * {
            visibility: hidden;
          }
          
          /* Show only the invoice content */
          .invoice-print-content, .invoice-print-content * {
            visibility: visible;
          }
          
          /* Position the invoice at top of page */
          .invoice-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          
          /* Hide modal overlay and buttons */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Page settings */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Typography */
          body {
            font-family: 'Arial', sans-serif !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Colors and backgrounds */
          .bg-gray-50 {
            background: white !important;
          }
          
          .bg-blue-50 {
            background: #f0f9ff !important;
            border: 1px solid #bfdbfe !important;
          }
          
          .bg-white {
            background: white !important;
          }
          
          .bg-green-50 {
            background: #f0fdf4 !important;
          }
          
          /* Table styles */
          table {
            border-collapse: collapse !important;
          }
          
          .border-b {
            border-bottom: 1px solid #e5e7eb !important;
          }
          
          .text-blue-600 {
            color: #1e40af !important;
          }
          
          .text-blue-700 {
            color: #1d4ed8 !important;
          }
          
          .text-green-600 {
            color: #059669 !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .text-gray-500 {
            color: #6b7280 !important;
          }
          
          /* Borders */
          .border {
            border: 1px solid #d1d5db !important;
          }
          
          .border-blue-200 {
            border-color: #bfdbfe !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          .border-dashed {
            border-style: dashed !important;
          }
          
          /* Layout */
          .rounded-lg {
            border-radius: 8px !important;
          }
          
          .grid {
            display: grid !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          
          .gap-8 {
            gap: 2rem !important;
          }
          
          .gap-16 {
            gap: 4rem !important;
          }
          

          
          /* Remove shadows */
          .shadow-xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};