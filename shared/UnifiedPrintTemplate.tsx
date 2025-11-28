import React, { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Branch } from '@shared/schema';

interface UnifiedPrintTemplateProps {
  title: string;
  invoiceNumber: string;
  date: string | Date;
  client?: any;
  items: any[];
  total: string | number;
  notes?: string;
  branchId?: number | null; // معرّف الفرع لجلب معلوماته تلقائياً
  showVAT?: boolean;
  purchaseReturns?: any[]; // مرتجعات المشتريات لحساب الكميات المتبقية
  extraInfo?: {
    subtitle?: string;
    reference?: string;
    type?: string;
  };
}

const UnifiedPrintTemplate = forwardRef<HTMLDivElement, UnifiedPrintTemplateProps>(
  ({ title, invoiceNumber, date, client, items, total, notes, branchId, showVAT = true, purchaseReturns = [], extraInfo }, ref) => {
    
    // جلب معلومات الفرع تلقائياً بناءً على branchId
    const { data: branch } = useQuery<Branch>({
      queryKey: [`/api/branches/${branchId}`],
      enabled: !!branchId,
    });

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    // حساب المرتجعات لكل منتج (فقط لفواتير المشتريات)
    const getReturnedQuantity = (productId: number) => {
      if (!purchaseReturns || !Array.isArray(purchaseReturns) || extraInfo?.type !== 'purchase') {
        return 0;
      }
      
      // البحث عن المرتجعات المرتبطة بهذه الفاتورة
      const relevantReturns = purchaseReturns.filter((ret: any) => 
        ret.purchaseId?.toString() === invoiceNumber || ret.purchaseId === Number(invoiceNumber)
      );
      
      // حساب مجموع الكميات المرتجعة لهذا المنتج
      return relevantReturns.reduce((total, returnItem) => {
        try {
          const returnItems = typeof returnItem.items === 'string' 
            ? JSON.parse(returnItem.items) 
            : (returnItem.items || []);
          
          if (!Array.isArray(returnItems)) {
            return total;
          }
          
          // البحث عن المنتج في عناصر المرتجع (باستخدام productId)
          const productReturn = returnItems.find((item: any) => {
            const itemProductId = item.productId || item.product_id;
            return itemProductId === productId;
          });
          
          return total + (productReturn ? Number(productReturn.quantity || 0) : 0);
        } catch (error) {
          console.error('خطأ في معالجة المرتجعات:', error);
          return total;
        }
      }, 0);
    };

    const subtotal = (items && Array.isArray(items)) ? items.reduce((sum, item) => {
      const quantity = Number(item.quantity || item.receivedQuantity || 0);
      const price = Number(item.unitPrice || item.price || 0);
      const returnedQty = getReturnedQuantity(item.productId);
      const remainingQty = quantity - returnedQty;
      const effectiveQty = extraInfo?.type === 'purchase' ? remainingQty : quantity;
      return sum + (effectiveQty * price);
    }, 0) : 0;

    const taxRate = 0.15;
    const taxAmount = showVAT ? subtotal * taxRate : 0;
    const finalTotal = showVAT ? subtotal + taxAmount : subtotal;

    return (
      <div ref={ref} className="bg-white p-6 max-w-4xl mx-auto print:shadow-none print:max-w-none">
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:max-w-none { max-width: none !important; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          
          {/* اسم الفرع (للسرية - يظهر اسم الفرع فقط) */}
          {branch && branch.name && (
            <h1 className="text-2xl font-bold text-blue-800 mb-2">{branch.name}</h1>
          )}
          
          <h2 className="text-lg font-bold mt-3 text-green-800">{title}</h2>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Company Info */}
          <div className="border border-black p-3">
            <h3 className="font-bold text-center mb-2 border-b border-black pb-1">بيانات العميل</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-bold">اسم العميل:</span>
                <span>{client?.name || 'عميل نقدي'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">الهاتف:</span>
                <span>{client?.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="border border-black p-3">
            <h3 className="font-bold text-center mb-2 border-b border-black pb-1">معلومات الفاتورة</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-bold">رقم الفاتورة:</span>
                <span className="font-bold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">التاريخ:</span>
                <span>{formatDate(date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">الوقت:</span>
                <span>{formatTime(date)}</span>
              </div>
              {extraInfo?.reference && (
                <div className="flex justify-between">
                  <span className="font-bold">المرجع:</span>
                  <span>{extraInfo.reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="font-bold text-center mb-3 border-b border-black pb-1">تفاصيل الأصناف</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-white">
                <th className="border border-black p-2 text-center font-bold">#</th>
                <th className="border border-black p-2 font-bold">اسم الصنف</th>
                <th className="border border-black p-2 font-bold">الكمية</th>
                {extraInfo?.type === 'purchase' && (
                  <>
                    <th className="border border-black p-2 font-bold">المرتجع</th>
                    <th className="border border-black p-2 font-bold">الباقي</th>
                  </>
                )}
                <th className="border border-black p-2 font-bold">سعر الوحدة</th>
                <th className="border border-black p-2 font-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {(items && Array.isArray(items)) ? items.map((item, index) => {
                const quantity = Number(item.quantity || item.receivedQuantity || 0);
                const price = Number(item.unitPrice || item.price || 0);
                const returnedQty = getReturnedQuantity(item.productId);
                const remainingQty = quantity - returnedQty;
                const itemTotal = extraInfo?.type === 'purchase' ? remainingQty * price : quantity * price;
                
                return (
                  <tr key={index} className="bg-white">
                    <td className="border border-black p-2 text-center">{index + 1}</td>
                    <td className="border border-black p-2">{item.productName || item.name}</td>
                    <td className="border border-black p-2 text-center">{quantity}</td>
                    {extraInfo?.type === 'purchase' && (
                      <>
                        <td className="border border-black p-2 text-center text-red-600 font-semibold">
                          {returnedQty > 0 ? returnedQty : '-'}
                        </td>
                        <td className="border border-black p-2 text-center text-green-600 font-semibold">
                          {remainingQty}
                        </td>
                      </>
                    )}
                    <td className="border border-black p-2 text-center">{price.toFixed(2)} ر.س</td>
                    <td className="border border-black p-2 text-center font-bold">{itemTotal.toFixed(2)} ر.س</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={extraInfo?.type === 'purchase' ? 7 : 5} className="border border-black p-2 text-center">لا توجد عناصر</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6">
          <div className="border border-black p-3 max-w-md ml-auto">
            <h3 className="font-bold text-center mb-2 border-b border-black pb-1">ملخص المبلغ</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>المجموع الفرعي:</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              {showVAT && (
                <div className="flex justify-between text-sm">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{taxAmount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-black pt-1">
                <span>المجموع الكلي:</span>
                <span className="font-bold">{finalTotal.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-4 border border-black p-3">
            <h4 className="font-bold mb-2">ملاحظات:</h4>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-4 border border-black p-3">
          <h4 className="font-bold mb-2">شروط وأحكام:</h4>
          <ul className="text-sm space-y-1">
            <li>• جميع المبالغ شاملة ضريبة القيمة المضافة</li>
            <li>• لا يمكن إرجاع البضاعة إلا خلال 7 أيام من تاريخ الشراء</li>
            <li>• البضاعة المرجعة يجب أن تكون في حالتها الأصلية</li>
            <li>• هذه الفاتورة معتمدة إلكترونياً</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-black pt-3 text-center">
          <div className="text-xs space-y-1">
            <p>تم إنشاء هذا المستند تلقائياً في {formatDate(new Date())} الساعة {formatTime(new Date())}</p>
          </div>
        </div>
      </div>
    );
  }
);

UnifiedPrintTemplate.displayName = 'UnifiedPrintTemplate';

export default UnifiedPrintTemplate;