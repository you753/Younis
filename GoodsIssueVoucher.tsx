import React, { forwardRef } from 'react';
import { Sale, Client, Product } from '@shared/schema';

interface GoodsIssueVoucherProps {
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

const GoodsIssueVoucher = forwardRef<HTMLDivElement, GoodsIssueVoucherProps>(
  ({ sale, client, products, companyInfo }, ref) => {
    const defaultCompanyInfo = {
      name: companyInfo?.name || "",
      address: companyInfo?.address || "الرياض، المملكة العربية السعودية",
      phone: companyInfo?.phone || "+966 11 123 4567",
      email: companyInfo?.email || "info@company.com",
      taxNumber: companyInfo?.taxNumber || "300002471110003",
    };

    const saleItems = sale.items || [];

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{defaultCompanyInfo.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{defaultCompanyInfo.address}</p>
          <h2 className="text-2xl font-bold text-red-600 mb-6">سند إخراج بضاعة</h2>
        </div>

        {/* معلومات السند */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-bold">رقم السند:</span>
              <span>#{sale.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">التاريخ:</span>
              <span>{formatDate(sale.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">الوقت:</span>
              <span>{formatTime(sale.date)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-bold">العميل:</span>
              <span>{client?.name || 'غير محدد'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">الهاتف:</span>
              <span>{client?.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">المخرج:</span>
              <span>قسم المبيعات</span>
            </div>
          </div>
        </div>

        {/* جدول الأصناف */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-center bg-gray-100 py-2">تفاصيل البضاعة المخرجة</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-400 px-3 py-2 text-center">م</th>
                <th className="border border-gray-400 px-3 py-2 text-center">اسم الصنف</th>
                <th className="border border-gray-400 px-3 py-2 text-center">الكود</th>
                <th className="border border-gray-400 px-3 py-2 text-center">الكمية المخرجة</th>
                <th className="border border-gray-400 px-3 py-2 text-center">الوحدة</th>
                <th className="border border-gray-400 px-3 py-2 text-center">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <tr key={index}>
                    <td className="border border-gray-400 px-3 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{product?.name || `صنف ${item.productId}`}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{product?.code || '-'}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-bold">{item.quantity}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">قطعة</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* إجمالي الكميات */}
          <div className="mt-4 text-center">
            <div className="inline-block bg-blue-50 p-4 rounded-lg border">
              <p className="text-lg font-bold">
                إجمالي الكميات المخرجة: {saleItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} قطعة
              </p>
            </div>
          </div>
        </div>

        {/* التوقيعات */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-8">
              <p className="font-bold">أمين المخزن</p>
              <p className="text-sm text-gray-600">التوقيع والتاريخ</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-8">
              <p className="font-bold">المستلم</p>
              <p className="text-sm text-gray-600">التوقيع والتاريخ</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-8">
              <p className="font-bold">المدير العام</p>
              <p className="text-sm text-gray-600">التوقيع والاعتماد</p>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="text-center text-xs text-gray-600 space-y-1">
            <p>سند إخراج البضاعة رقم: {sale.id} - تاريخ الإصدار: {formatDate(sale.date)}</p>
            <p>هذا السند معتمد إلكترونياً ولا يحتاج إلى توقيع</p>
            <p className="font-bold">{defaultCompanyInfo.name} - هاتف: {defaultCompanyInfo.phone}</p>
          </div>
        </div>
      </div>
    );
  }
);

GoodsIssueVoucher.displayName = 'GoodsIssueVoucher';

export default GoodsIssueVoucher;