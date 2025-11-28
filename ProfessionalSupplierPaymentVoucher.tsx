import { useQuery } from '@tanstack/react-query';

interface ProfessionalSupplierPaymentVoucherProps {
  payment: any;
  supplier: any;
}

export default function ProfessionalSupplierPaymentVoucher({ payment, supplier }: ProfessionalSupplierPaymentVoucherProps) {
  // لا نعرض معلومات الشركة (سرية تامة)

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'نقدي',
      bank: 'تحويل بنكي', 
      check: 'شيك',
      card: 'بطاقة ائتمان'
    };
    return methods[method as keyof typeof methods] || method || 'سند صرف نقدي';
  };

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      {/* CSS للطباعة */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .header-gradient {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%) !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .info-box {
            border: 2px solid #d1d5db !important;
            background: #f9fafb !important;
          }
          .summary-box {
            border: 2px solid #6366f1 !important;
            background: #f0f9ff !important;
          }
        }
      `}</style>

      {/* زر الطباعة */}
      <div className="no-print p-4 text-center bg-gray-50">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          طباعة السند
        </button>
      </div>

      {/* محتوى الفاتورة */}
      <div className="print-page max-w-4xl mx-auto bg-white">
        {/* رأس الصفحة - بدون معلومات شركة (سرية تامة) */}
        <div className="header-gradient text-white p-8 text-center">
          <h1 className="text-4xl font-bold">سند صرف</h1>
        </div>

        {/* معلومات السند الأساسية */}
        <div className="bg-gray-50 p-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">وقت الطباعة</p>
              <p className="text-lg font-bold">{formatTime()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الإصدار</p>
              <p className="text-lg font-bold">{formatDate(payment.paymentDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم المستند</p>
              <p className="text-lg font-bold text-blue-600">{payment.voucherNumber}</p>
            </div>
          </div>
        </div>

        {/* بيانات المورد */}
        <div className="p-6">
          <div className="info-box p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              بيانات {supplier?.name || 'مؤسسة التقنية الحديثة'}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني:</p>
                <p className="font-medium">{supplier?.email || 'sales@modern-tech.com'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف:</p>
                <p className="font-medium">{supplier?.phone || '0507654321'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الرقم التعريفي:</p>
                <p className="font-medium">{supplier?.id || '2'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">نوع المحاسب:</p>
                <p className="font-medium">{getPaymentMethodLabel(payment.paymentMethod)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ملخص الحساب */}
        <div className="px-6 pb-6">
          <div className="summary-box p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center border-b border-blue-300 pb-2">
              ملخص الحساب
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">تاريخ الدفع</p>
                <p className="text-2xl font-bold text-blue-600">{formatDate(payment.paymentDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">مبلغ السند</p>
                <p className="text-2xl font-bold text-red-600">{parseFloat(payment.amount || 0).toLocaleString('en-US')} ر.س</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
              <p className="text-lg font-bold text-purple-600">{getPaymentMethodLabel(payment.paymentMethod)}</p>
            </div>
          </div>
        </div>

        {/* تذييل بسيط - بدون معلومات شركة (سرية تامة) */}
        <div className="bg-gray-800 text-white p-6 text-center">
          <div className="text-sm opacity-75">
            <p>تاريخ الطباعة: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}