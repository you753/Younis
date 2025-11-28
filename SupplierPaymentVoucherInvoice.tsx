import { useQuery } from '@tanstack/react-query';

interface SupplierPaymentVoucherInvoiceProps {
  payment: any;
  supplier: any;
}

export default function SupplierPaymentVoucherInvoice({ payment, supplier }: SupplierPaymentVoucherInvoiceProps) {
  // جلب معلومات الشركة
  const { data: settingsData } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: 2000,
  });

  const companyInfo = settingsData?.الشركة?.companyInfo || {
    nameArabic: '',
    address: 'جدة البغدادية الشرقية',
    phone: '0567537599',
    taxNumber: '123456789012345'
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'نقدي',
      'تحويل بنكي': 'تحويل بنكي',
      bank_transfer: 'تحويل بنكي',
      check: 'شيك',
      credit_card: 'بطاقة ائتمان'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" dir="rtl">
      {/* CSS للطباعة */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #000;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 1px solid #333 !important;
          }
          .header-gradient {
            background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%) !important;
            color: white !important;
          }
          .info-section {
            background-color: #f8f9fa !important;
            border: 1px solid #ddd !important;
          }
          .summary-box {
            border: 2px solid #8B5CF6 !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      {/* زر الطباعة */}
      <div className="no-print mb-4 text-center">
        <button
          onClick={handlePrint}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          طباعة السند
        </button>
      </div>

      {/* محتوى الفاتورة */}
      <div className="print-page border border-gray-300 rounded-lg overflow-hidden">
        {/* رأس الصفحة - تدرج بنفسجي */}
        <div className="header-gradient bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">سند صرف</h1>
          <p className="text-purple-100 text-lg">{companyInfo.nameArabic}</p>
        </div>

        {/* معلومات المستند - ثلاثة أعمدة */}
        <div className="bg-gray-50 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">وقت الطباعة</p>
              <p className="font-bold text-lg">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })} م</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الإصدار</p>
              <p className="font-bold text-lg">{new Date(payment.paymentDate).toLocaleDateString('ar-SA-u-ca-islamic', {
                year: 'numeric',
                month: 'numeric', 
                day: 'numeric'
              })} هـ</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم المستند</p>
              <p className="font-bold text-lg">{payment.voucherNumber}</p>
            </div>
          </div>
        </div>

        {/* بيانات المورد */}
        <div className="p-6">
          <div className="info-section bg-gray-50 p-4 rounded mb-6">
            <h3 className="text-lg font-bold mb-3 text-right border-b border-gray-300 pb-2">بيانات {supplier.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <p className="mb-2"><span className="text-gray-600">الرقم التعريفي:</span> <span className="font-bold">{supplier.id}</span></p>
                <p className="mb-2"><span className="text-gray-600">رقم الهاتف:</span> <span className="font-bold">{supplier.phone}</span></p>
              </div>
              <div className="text-right">
                <p className="mb-2"><span className="text-gray-600">البريد الإلكتروني:</span> <span className="font-bold">{supplier.email || 'غير محدد'}</span></p>
                <p className="mb-2"><span className="text-gray-600">نوع الحساب:</span> <span className="font-bold">سند صرف نقدي</span></p>
              </div>
            </div>
          </div>

          {/* ملخص الحساب */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">ملخص الحساب</h3>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
              <div className="summary-box border-l-4 border-l-blue-500 p-4 text-right">
                <p className="text-sm text-gray-600 mb-1">تاريخ البيع</p>
                <p className="font-bold text-blue-600">{new Date(payment.paymentDate).toLocaleDateString('ar-SA-u-ca-islamic', {
                  year: 'numeric',
                  month: 'numeric', 
                  day: 'numeric'
                })} هـ</p>
              </div>
              <div className="summary-box border-r-4 border-r-red-500 p-4 text-right">
                <p className="text-sm text-gray-600 mb-1">مبلغ السند</p>
                <p className="font-bold text-red-600 text-xl">{parseFloat(payment.amount).toLocaleString('en-US')} ر.س</p>
              </div>
            </div>
            <div className="mt-4 summary-box border-l-4 border-l-purple-500 p-4 max-w-xs mx-auto text-right">
              <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
              <p className="font-bold text-purple-600">{getPaymentMethodLabel(payment.paymentMethod)}</p>
            </div>
          </div>
        </div>

        {/* تذييل الصفحة */}
        <div className="bg-gray-800 text-white p-4 text-center text-sm">
          <p className="mb-1">{companyInfo.nameArabic} - جدة البغدادية الشرقية - جدة</p>
          <p>هاتف: {companyInfo.phone} | جوال: {companyInfo.phone} | إيميل: {companyInfo.email || 'byrwl8230@gmail.com'}</p>
          <p className="mt-2">السجل التجاري: {companyInfo.commercialRegister || '4030528128'} | الرقم الضريبي: {companyInfo.taxNumber}</p>
          <p className="mt-1 text-xs">تاريخ وقت الطباعة: {new Date().toLocaleDateString('en-GB')} - {new Date().toLocaleTimeString('en-US')}</p>
        </div>
      </div>
    </div>
  );
}