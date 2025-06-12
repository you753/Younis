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

    // Use basic template if no custom template found
    const basicTemplate = {
      styling: {
        font: 'Cairo',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        lineHeight: 1.6
      },
      layout: {
        headerAlignment: 'center',
        companyInfoAlignment: 'right',
        footerAlignment: 'center',
        showBorder: true,
        showGridLines: true
      },
      content: {
        header: {
          title: 'فــــاتــــورة',
          showLogo: true,
          showCompanyInfo: true
        },
        body: {
          showItemCode: true,
          showItemDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true
        },
        footer: {
          notes: 'شكراً لكم على تعاملكم معنا',
          terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة'
        }
      }
    };

    const templateToUse = activeTemplate || basicTemplate;

    return (
      <div 
        ref={ref} 
        style={{
          fontFamily: `${templateToUse.styling?.font || 'Cairo'}, sans-serif`,
          padding: '40px',
          background: templateToUse.styling?.backgroundColor || '#FFFFFF',
          color: '#1a1a1a',
          direction: 'rtl',
          fontSize: `${templateToUse.styling?.fontSize || 14}px`,
          lineHeight: templateToUse.styling?.lineHeight || 1.6,
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
          borderBottom: `2px solid ${templateToUse.styling?.primaryColor || '#3B82F6'}`,
          paddingBottom: '20px'
        }}>
          <div style={{ flex: 1 }}>
            {templateToUse.content?.header?.showLogo && (
              <div style={{ marginBottom: '15px' }}>
                <img src="/logo.png" alt="شعار الشركة" style={{ height: '60px', objectFit: 'contain' }} />
              </div>
            )}
            {templateToUse.content?.header?.showCompanyInfo && (
              <div style={{ textAlign: templateToUse.layout?.companyInfoAlignment || 'right' }}>
                <h3 style={{
                  color: templateToUse.styling?.primaryColor || '#3B82F6',
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
          
          <div style={{ textAlign: templateToUse.layout?.headerAlignment || 'center', flex: 1 }}>
            <h1 style={{
              color: templateToUse.styling?.primaryColor || '#3B82F6',
              fontSize: '32px',
              margin: '0',
              fontWeight: '700',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>
              {templateToUse.content?.header?.title || 'فــــاتــــورة'}
            </h1>
          </div>
          
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              background: templateToUse.styling?.secondaryColor || '#1E40AF',
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
                borderRight: `4px solid ${templateToUse.styling?.primaryColor || '#3B82F6'}`
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: templateToUse.styling?.primaryColor || '#3B82F6',
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
            border: templateToUse.layout?.showBorder ? '1px solid #ddd' : 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{
                background: `linear-gradient(135deg, ${templateToUse.styling?.primaryColor || '#3B82F6'}, ${templateToUse.styling?.secondaryColor || '#1E40AF'})`,
                color: 'white'
              }}>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>الصنف</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>الكمية</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>السعر</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item: any, index: number) => (
                <tr key={index} style={{
                  borderBottom: templateToUse.layout?.showGridLines ? '1px solid #e5e7eb' : 'none',
                  background: index % 2 === 0 ? '#f9fafb' : 'white'
                }}>
                  <td style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>{index + 1}</td>
                  <td style={{ padding: '10px', textAlign: 'right', borderLeft: '1px solid #e5e7eb' }}>{item.productName || item.name || 'منتج'}</td>
                  <td style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>{item.unitPrice?.toFixed(2) || '0.00'} ر.س</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: templateToUse.styling?.primaryColor || '#3B82F6' }}>
                    {item.total?.toFixed(2) || ((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '30px 0' }}>
          <div style={{
            background: `linear-gradient(135deg, ${templateToUse.styling?.primaryColor || '#3B82F6'}, ${templateToUse.styling?.secondaryColor || '#1E40AF'})`,
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
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: templateToUse.layout?.footerAlignment || 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            {templateToUse.content?.footer?.notes || 'شكراً لكم على تعاملكم معنا'}
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>
            {templateToUse.content?.footer?.terms || 'جميع الأسعار شاملة ضريبة القيمة المضافة'}
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
            الرقم الضريبي: {defaultCompanyInfo.taxNumber}
          </p>
        </div>
      </div>
    );
  }
);

export default InvoicePrint;