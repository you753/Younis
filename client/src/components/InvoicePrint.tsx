import React, { forwardRef } from 'react';
import { Sale, Client, Product } from '@shared/schema';

interface InvoicePrintProps {
  sale: Sale;
  client?: Client;
  products: Product[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
  };
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ sale, client, products, companyInfo }, ref) => {
    const defaultCompanyInfo = {
      name: "شركة التجارة المتقدمة",
      address: "الرياض، المملكة العربية السعودية",
      phone: "+966 11 123 4567",
      email: "info@company.com",
      taxNumber: "123456789012345",
      ...companyInfo
    };

    const saleItems = sale.items || [];
    const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.15; // 15% VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">{defaultCompanyInfo.name}</h1>
              <div className="text-gray-600 space-y-1">
                <p>{defaultCompanyInfo.address}</p>
                <p>هاتف: {defaultCompanyInfo.phone}</p>
                <p>البريد الإلكتروني: {defaultCompanyInfo.email}</p>
                <p>الرقم الضريبي: {defaultCompanyInfo.taxNumber}</p>
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">فاتورة مبيعات</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold">رقم الفاتورة: <span className="text-blue-600">#{sale.id}</span></p>
                <p className="font-semibold">التاريخ: <span className="text-gray-700">{formatDate(sale.createdAt || sale.date)}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">بيانات العميل</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {client ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-semibold">الاسم:</span> {client.name}</p>
                  <p><span className="font-semibold">الهاتف:</span> {client.phone || '-'}</p>
                </div>
                <div>
                  <p><span className="font-semibold">البريد الإلكتروني:</span> {client.email || '-'}</p>
                  <p><span className="font-semibold">العنوان:</span> {client.address || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">عميل نقدي</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">تفاصيل الفاتورة</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-right">م</th>
                <th className="border border-gray-300 p-3 text-right">اسم الصنف</th>
                <th className="border border-gray-300 p-3 text-center">الكمية</th>
                <th className="border border-gray-300 p-3 text-center">السعر</th>
                <th className="border border-gray-300 p-3 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                const itemTotal = item.quantity * item.unitPrice;
                
                return (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-3">{product?.name || item.productName}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.unitPrice.toFixed(2)} ر.س</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{itemTotal.toFixed(2)} ر.س</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-80 bg-blue-50 p-6 rounded-lg border">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">ضريبة القيمة المضافة ({(taxRate * 100)}%):</span>
                  <span>{taxAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>المجموع الكلي:</span>
                    <span>{total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">ملاحظات</h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-blue-600 pt-6 mt-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">شكراً لتعاملكم معنا</p>
            <p className="text-sm">هذه فاتورة إلكترونية معتمدة وفقاً للوائح هيئة الزكاة والضريبة والجمارك</p>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .page-break {
              page-break-before: always;
            }
          }
        `}</style>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;