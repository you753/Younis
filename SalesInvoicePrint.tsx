import React, { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sale, Client, Product, Branch } from '@shared/schema';

interface SalesInvoicePrintProps {
  sale: Sale;
  client?: Client;
  products: Product[];
}

const SalesInvoicePrint = forwardRef<HTMLDivElement, SalesInvoicePrintProps>(
  ({ sale, client, products }, ref) => {
    // جلب معلومات الفرع تلقائياً بناءً على branchId
    const { data: branch } = useQuery<Branch>({
      queryKey: [`/api/branches/${sale.branchId}`],
      enabled: !!sale.branchId,
    });

    // استخدام اسم الفرع فقط (للسرية التامة - بدون أي معلومات إضافية)
    const displayName = branch?.name || "";

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

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          {displayName && <h1 className="text-3xl font-bold text-blue-600 mb-2">{displayName}</h1>}
          <h2 className="text-2xl font-bold text-red-600">فاتورة مبيعات</h2>
        </div>

        {/* معلومات الفاتورة والعميل */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-300 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-blue-600">معلومات الفاتورة</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">رقم الفاتورة:</span>
                <span className="text-red-600 font-bold">#{sale.id.toString().padStart(6, '0')}</span>
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
          </div>
          
          <div className="border border-gray-300 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-blue-600">بيانات العميل</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">اسم العميل:</span>
                <span>{client?.name || 'عميل نقدي'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">الهاتف:</span>
                <span>{client?.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">العنوان:</span>
                <span>{client?.address || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">رقم العميل:</span>
                <span>{client?.id || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* جدول الأصناف */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-center bg-blue-50 py-3 border border-blue-200">تفاصيل الأصناف</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-400 px-3 py-3 text-center">م</th>
                <th className="border border-gray-400 px-3 py-3 text-center">اسم الصنف</th>
                <th className="border border-gray-400 px-3 py-3 text-center">الكود</th>
                <th className="border border-gray-400 px-3 py-3 text-center">الكمية</th>
                <th className="border border-gray-400 px-3 py-3 text-center">سعر الوحدة</th>
                <th className="border border-gray-400 px-3 py-3 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-400 px-3 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-medium">{product?.name || `صنف ${item.productId}`}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{product?.code || '-'}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-bold">{item.quantity}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{Number(item.unitPrice || 0).toFixed(2)} ر.س</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-bold">{itemTotal.toFixed(2)} ر.س</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ملخص المبالغ */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            {sale.notes && (
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-bold mb-2">ملاحظات:</h4>
                <p className="text-gray-700">{sale.notes}</p>
              </div>
            )}
          </div>
          
          <div className="border border-gray-300 p-4 rounded-lg bg-blue-50">
            <h4 className="text-lg font-bold mb-3 text-blue-600">ملخص المبالغ</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-bold">{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="border-t-2 border-blue-600 pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">المجموع الكلي:</span>
                  <span className="font-bold text-red-600">{total.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* شروط وأحكام */}
        <div className="mb-6 border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h4 className="font-bold mb-2">شروط وأحكام:</h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• جميع المبالغ شاملة ضريبة القيمة المضافة</li>
            <li>• لا يمكن إرجاع البضاعة إلا خلال 7 أيام من تاريخ الشراء</li>
            <li>• البضاعة المرجعة يجب أن تكون في حالتها الأصلية</li>
            <li>• هذه الفاتورة معتمدة إلكترونياً</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
          <p className="font-bold mb-1">شكراً لتعاملكم معنا</p>
          {displayName && <p>{displayName}</p>}
          <p>فاتورة رقم: {sale.id} - تاريخ الطباعة: {formatDate(new Date())}</p>
        </div>
      </div>
    );
  }
);

SalesInvoicePrint.displayName = 'SalesInvoicePrint';

export default SalesInvoicePrint;