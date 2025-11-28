import React, { forwardRef } from 'react';
import { Sale, Client, Product } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface InvoicePrintProps {
  sale: Sale;
  client?: Client;
  products: Product[];
  type?: 'standard' | 'professional' | 'detailed';
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ sale, client, products, type = 'professional' }, ref) => {
    
    // جلب إعدادات الشركة المحدثة
    const { data: settingsData } = useQuery({
      queryKey: ['/api/settings'],
      refetchInterval: 2000,
    });

    const companyInfo = settingsData?.الشركة?.companyInfo || {
      nameArabic: "",
      address: "جدة البغدادية الشرقية",
      phone: "0567537599",
      taxNumber: "123456789012345",
      email: "info@company.com"
    };

    const saleItems = sale.items || [];
    const subtotal = saleItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
    const taxRate = 0.15; // 15% VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const formatCurrency = (amount: number) => {
      return amount.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'SAR',
        minimumFractionDigits: 2 
      });
    };

    return (
      <div ref={ref} className="bg-white max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        
        {/* CSS للطباعة */}
        <style>{`
          @media print {
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: white !important; }
            .invoice-container { background: white !important; box-shadow: none !important; border: 1px solid #000 !important; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="invoice-container border border-black bg-white">
          
          {/* رأس الفاتورة الاحترافي */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <div className="text-right">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">MC</span>
                </div>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold mb-2">{companyInfo.nameArabic}</h1>
                <p className="text-sm opacity-90">{companyInfo.address}</p>
                <p className="text-sm opacity-90">هاتف: {companyInfo.phone}</p>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">فاتورة احترافية</h2>
                <p className="text-sm">#{sale.id.toString().padStart(6, '0')}</p>
              </div>
            </div>
          </div>

          {/* معلومات الفاتورة والعميل */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-blue-600 mb-3 border-b border-blue-200 pb-2">معلومات الفاتورة</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">رقم الفاتورة:</span>
                    <span className="text-blue-600 font-bold">#{sale.id.toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">التاريخ:</span>
                    <span>{formatDate(sale.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">طريقة الدفع:</span>
                    <span>{sale.paymentMethod || 'نقدي'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">الرقم الضريبي:</span>
                    <span>{companyInfo.taxNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-green-600 mb-3 border-b border-green-200 pb-2">بيانات العميل</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">اسم العميل:</span>
                    <span className="font-bold">{client?.name || 'عميل نقدي'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">الهاتف:</span>
                    <span>{client?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">البريد الإلكتروني:</span>
                    <span>{client?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">العنوان:</span>
                    <span>{client?.address || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* جدول الأصناف الاحترافي */}
            <div className="mb-6">
              <h3 className="font-bold text-center bg-gradient-to-r from-blue-100 to-purple-100 py-3 border border-blue-200 rounded-t-lg">تفاصيل الأصناف</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <th className="border border-gray-400 px-3 py-3 text-center font-bold">#</th>
                    <th className="border border-gray-400 px-3 py-3 text-center font-bold">اسم الصنف</th>
                    <th className="border border-gray-400 px-3 py-3 text-center font-bold">الكمية</th>
                    <th className="border border-gray-400 px-3 py-3 text-center font-bold">سعر الوحدة</th>
                    <th className="border border-gray-400 px-3 py-3 text-center font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-400 px-3 py-3 text-center">{index + 1}</td>
                        <td className="border border-gray-400 px-3 py-3 text-right font-medium">{product?.name || item.productName || 'منتج غير محدد'}</td>
                        <td className="border border-gray-400 px-3 py-3 text-center">{item.quantity}</td>
                        <td className="border border-gray-400 px-3 py-3 text-center">{formatCurrency(Number(item.unitPrice || 0))}</td>
                        <td className="border border-gray-400 px-3 py-3 text-center font-bold text-green-600">{formatCurrency(itemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* الإجماليات الاحترافية */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-gray-300 p-4 rounded-lg bg-blue-50">
                <h4 className="font-bold text-blue-600 mb-3">ملاحظات</h4>
                <p className="text-sm text-gray-700">
                  {sale.notes || 'شكراً لثقتكم بنا ونتطلع لخدمتكم مرة أخرى'}
                </p>
              </div>
              
              <div className="border border-gray-300 p-4 rounded-lg bg-green-50">
                <h4 className="font-bold text-green-600 mb-3">الإجماليات</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-bold">{formatCurrency(taxAmount)}</span>
                  </div>
                  <hr className="border-green-300" />
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>المجموع الكلي:</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* تذييل احترافي */}
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div>
                  <p className="font-bold">العنوان:</p>
                  <p>{companyInfo.address}</p>
                </div>
                <div>
                  <p className="font-bold">للتواصل:</p>
                  <p>{companyInfo.phone}</p>
                  <p>{companyInfo.email}</p>
                </div>
                <div>
                  <p className="font-bold">الرقم الضريبي:</p>
                  <p>{companyInfo.taxNumber}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                تم إنشاء هذه الفاتورة بواسطة نظام المحاسب الأعظم - {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;