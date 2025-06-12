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

    // Get saved templates from localStorage
    const getSavedTemplates = () => {
      try {
        return JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
      } catch {
        return [];
      }
    };

    // Get active template
    const getActiveTemplate = () => {
      const templates = getSavedTemplates();
      return templates.find((t: any) => t.isDefault || t.isActive) || templates[0] || null;
    };

    const activeTemplate = getActiveTemplate();

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

    // If custom template exists, use it; otherwise use default
    if (activeTemplate) {
      return (
        <div 
          ref={ref} 
          style={{
            fontFamily: `${activeTemplate.styling?.font || 'Cairo'}, sans-serif`,
            padding: '40px',
            background: activeTemplate.styling?.backgroundColor || '#FFFFFF',
            color: '#1a1a1a',
            direction: 'rtl',
            fontSize: `${activeTemplate.styling?.fontSize || 14}px`,
            lineHeight: activeTemplate.styling?.lineHeight || 1.6,
            maxWidth: '210mm',
            margin: '0 auto'
          }}
        >
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '30px',
            borderBottom: `2px solid ${activeTemplate.styling?.primaryColor || '#3B82F6'}`,
            paddingBottom: '20px'
          }}>
            <div style={{ flex: 1 }}>
              {activeTemplate.content?.header?.showLogo && (
                <div style={{ marginBottom: '15px' }}>
                  <img src="/logo.png" alt="شعار الشركة" style={{ height: '60px', objectFit: 'contain' }} />
                </div>
              )}
              {activeTemplate.content?.header?.showCompanyInfo && (
                <div style={{ textAlign: activeTemplate.layout?.companyInfoAlignment || 'right' }}>
                  <h3 style={{
                    color: activeTemplate.styling?.primaryColor || '#3B82F6',
                    fontSize: '18px',
                    margin: '0 0 8px 0',
                    fontWeight: '600'
                  }}>
                    {defaultCompanyInfo.name}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>{defaultCompanyInfo.address}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>هاتف: {defaultCompanyInfo.phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>البريد: {defaultCompanyInfo.email}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>الرقم الضريبي: {defaultCompanyInfo.taxNumber}</p>
                </div>
              )}
            </div>
            
            <div style={{ textAlign: activeTemplate.layout?.headerAlignment || 'center', flex: 1 }}>
              <h1 style={{
                color: activeTemplate.styling?.primaryColor || '#3B82F6',
                fontSize: '32px',
                margin: '0',
                fontWeight: '700',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}>
                {activeTemplate.content?.header?.title || 'فــــاتــــورة'}
              </h1>
              {activeTemplate.content?.header?.subtitle && (
                <p style={{ fontSize: '16px', color: '#666', margin: '8px 0 0 0' }}>
                  {activeTemplate.content.header.subtitle}
                </p>
              )}
            </div>
            
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{
                background: activeTemplate.styling?.secondaryColor || '#1E40AF',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <p style={{ margin: '4px 0', fontWeight: '600' }}>رقم الفاتورة: {sale.id}</p>
                <p style={{ margin: '4px 0' }}>التاريخ: {formatDate(sale.date)}</p>
                <p style={{ margin: '4px 0' }}>الوقت: {formatTime(sale.date)}</p>
              </div>
              {client && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  borderRight: `4px solid ${activeTemplate.styling?.primaryColor || '#3B82F6'}`
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: activeTemplate.styling?.primaryColor || '#3B82F6',
                    fontSize: '14px'
                  }}>
                    بيانات العميل:
                  </h4>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}>{client.name}</p>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}>هاتف: {client.phone}</p>
                  {client.address && (
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>العنوان: {client.address}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div style={{ margin: '30px 0' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: activeTemplate.layout?.showBorder ? '1px solid #ddd' : 'none',
              borderRadius: `${activeTemplate.styling?.roundedCorners || 0}px`,
              overflow: 'hidden',
              boxShadow: activeTemplate.styling?.shadowEffect ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}>
              <thead>
                <tr style={{
                  background: `linear-gradient(135deg, ${activeTemplate.styling?.primaryColor || '#3B82F6'}, ${activeTemplate.styling?.secondaryColor || '#1E40AF'})`,
                  color: 'white'
                }}>
                  {activeTemplate.content?.body?.showItemCode && (
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '600'
                    }}>#</th>
                  )}
                  {activeTemplate.content?.body?.showItemDescription && (
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '600'
                    }}>الصنف</th>
                  )}
                  {activeTemplate.content?.body?.showQuantity && (
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '600'
                    }}>الكمية</th>
                  )}
                  {activeTemplate.content?.body?.showUnitPrice && (
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '600'
                    }}>السعر</th>
                  )}
                  {activeTemplate.content?.body?.showTotal && (
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '600'
                    }}>الإجمالي</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {saleItems.map((item: any, index: number) => (
                  <tr key={index} style={{
                    borderBottom: activeTemplate.layout?.showGridLines ? '1px solid #e5e7eb' : 'none',
                    background: index % 2 === 0 ? '#f9fafb' : 'white'
                  }}>
                    {activeTemplate.content?.body?.showItemCode && (
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderLeft: activeTemplate.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'
                      }}>{index + 1}</td>
                    )}
                    {activeTemplate.content?.body?.showItemDescription && (
                      <td style={{
                        padding: '10px',
                        textAlign: 'right',
                        borderLeft: activeTemplate.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'
                      }}>{item.productName || item.name || 'منتج'}</td>
                    )}
                    {activeTemplate.content?.body?.showQuantity && (
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderLeft: activeTemplate.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'
                      }}>{item.quantity || 1}</td>
                    )}
                    {activeTemplate.content?.body?.showUnitPrice && (
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderLeft: activeTemplate.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'
                      }}>{item.unitPrice?.toFixed(2) || '0.00'} ر.س</td>
                    )}
                    {activeTemplate.content?.body?.showTotal && (
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: activeTemplate.styling?.primaryColor || '#3B82F6'
                      }}>{item.total?.toFixed(2) || ((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)} ر.س</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '30px 0' }}>
            <div style={{
              background: `linear-gradient(135deg, ${activeTemplate.styling?.primaryColor || '#3B82F6'}, ${activeTemplate.styling?.secondaryColor || '#1E40AF'})`,
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>المجموع الفرعي: </span>
                <span style={{ fontWeight: '600' }}>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>ضريبة القيمة المضافة (15%): </span>
                <span style={{ fontWeight: '600' }}>{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700' }}>الإجمالي النهائي</h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800' }}>{total.toFixed(2)} ر.س</p>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: activeTemplate.content?.footer?.footerBackgroundColor || '#f8f9fa',
            borderRadius: '8px',
            textAlign: activeTemplate.layout?.footerAlignment || 'center'
          }}>
            {activeTemplate.content?.footer?.notes && (
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                {activeTemplate.content.footer.notes}
              </p>
            )}
            {activeTemplate.content?.footer?.terms && (
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>
                {activeTemplate.content.footer.terms}
              </p>
            )}
            {activeTemplate.content?.footer?.showPaymentInfo && activeTemplate.content?.footer?.bankDetails && (
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                {activeTemplate.content.footer.bankDetails}
              </p>
            )}
            {activeTemplate.content?.footer?.vatNumber && (
              <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
                {activeTemplate.content.footer.vatNumber}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Fallback to default design if no template
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