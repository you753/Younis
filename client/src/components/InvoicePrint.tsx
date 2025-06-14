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
      name: "المحاسب الأعظم",
      address: "الرياض، المملكة العربية السعودية",
      phone: "+966 11 123 4567",
      email: "info@company.com",
      taxNumber: "300002471110003",
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
        month: '2-digit',
        day: '2-digit'
      });
    };

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        {/* Header - بنفس تصميم الوثيقة المرفقة */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-6">مدفوعات سداد</h1>
          
          {/* معلومات الشركة والتاريخ */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-right space-y-1">
              <p className="text-sm">{formatDate(sale.date)} {formatTime(sale.date)}</p>
              <p className="text-sm font-bold">التاريخ</p>
            </div>
            <div className="text-left space-y-1">
              <p className="text-lg font-bold">{defaultCompanyInfo.name}</p>
              <p className="text-sm">إسم العميل</p>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-sm">{defaultCompanyInfo.name}</p>
            <p className="text-sm">اسم المستخدم: {defaultCompanyInfo.name}</p>
          </div>
        </div>

        {/* جدول تفاصيل الفاتورة */}
        <div className="mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">تاريخ الإنشاء</th>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">رقم الحساب</th>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">المبلغ</th>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">رقم الإشتراك</th>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">المفوتر</th>
                <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">مرجع العملية</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 text-center">{formatDate(sale.date)} {formatTime(sale.date)}</td>
                <td className="border border-gray-400 px-3 py-2 text-center">{sale.id.toString().padStart(14, '0')}</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-bold">SAR {parseFloat(sale.total).toFixed(2)}</td>
                <td className="border border-gray-400 px-3 py-2 text-center">{(sale.id * 123456).toString().padStart(11, '0')}</td>
                <td className="border border-gray-400 px-3 py-2 text-center">:002 {defaultCompanyInfo.name}</td>
                <td className="border border-gray-400 px-3 py-2 text-center">{(sale.id * 987654321).toString().padStart(11, '0')}</td>
              </tr>
            </tbody>
          </table>
          
          {/* المرجع والحالة */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-sm font-bold">المرجع</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">الحالة</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-right">
                <p className="text-sm">رقم المرجع لدفع الفاتورة هو {(sale.id * 107931715).toString().slice(0, 9)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-green-600">تم التنفيذ</p>
              </div>
            </div>
          </div>
        </div>

        {/* تفاصيل الأصناف إن وجدت */}
        {saleItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-center">تفاصيل الأصناف</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">الصنف</th>
                  <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">الكمية</th>
                  <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">سعر الوحدة</th>
                  <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {saleItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-400 px-3 py-2 text-center">{product?.name || `صنف ${item.productId}`}</td>
                      <td className="border border-gray-400 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-400 px-3 py-2 text-center">{item.unitPrice.toFixed(2)} ر.س</td>
                      <td className="border border-gray-400 px-3 py-2 text-center">{(item.quantity * item.unitPrice).toFixed(2)} ر.س</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* ملخص المبالغ */}
            <div className="mt-6 text-center">
              <div className="space-y-2 inline-block text-left">
                <p className="text-sm">المجموع الفرعي: {subtotal.toFixed(2)} ر.س</p>
                <p className="text-sm">ضريبة القيمة المضافة (15%): {taxAmount.toFixed(2)} ر.س</p>
                <p className="text-lg font-bold">المجموع الكلي: {total.toFixed(2)} ر.س</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer - معلومات البنك والشركة */}
        <div className="mt-12 pt-6">
          <div className="text-center text-xs text-gray-600 space-y-2">
            <p className="font-bold">{defaultCompanyInfo.name} | شركة مساهمة سعودية | رأس المال 60,000,000,000 ريال سعودي مدفوع بالكامل | الرقم الضريبي {defaultCompanyInfo.taxNumber} | س.ت.4030001588</p>
            <p>خاضع لإشراف ورقابة البنك المركزي السعودي | مرخص له بموجب الأمر السامي رقم 3737 الصادر بتاريخ 1373/4/20هـ (الموافق 1953/12/26م)</p>
            <p>برج البنك الأهلي السعودي، طريق الملك فهد حي العقيق 3208 - وحدة رقم 778، الرياض 6676 – 13519، المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;