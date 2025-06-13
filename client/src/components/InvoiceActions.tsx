import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Printer, Download, Eye, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvoicePrint from './InvoicePrint';
import TemplateSelector from './TemplateSelector';
import { Sale, Client, Product } from '@shared/schema';

interface InvoiceActionsProps {
  sale: Sale;
  client?: Client;
  products: Product[];
  showPreview?: boolean;
}

export default function InvoiceActions({ sale, client, products, showPreview = false }: InvoiceActionsProps) {
  const { toast } = useToast();
  const { format: formatAmount } = useCurrency();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Get saved templates from localStorage
  const getSavedTemplates = () => {
    try {
      return JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
    } catch {
      return [];
    }
  };

  // Get default or active template
  const getActiveTemplate = () => {
    const templates = getSavedTemplates();
    return templates.find((t: any) => t.isDefault || t.isActive) || templates[0] || null;
  };

  // Generate custom invoice HTML using saved template
  const generateCustomInvoiceHTML = () => {
    const template = getActiveTemplate();
    if (!template) return null;

    const companySettings = {
      name: 'شركة المحاسب الأعظم',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966 50 123 4567',
      email: 'info@almohaseb.com',
      vatNumber: '300123456789003'
    };

    const saleItems = Array.isArray(sale.items) ? sale.items : 
                      (typeof sale.items === 'string' ? JSON.parse(sale.items || '[]') : []);
    
    return `
      <div style="font-family: ${template.styling?.font || 'Cairo'}, sans-serif; padding: 40px; background: ${template.styling?.backgroundColor || '#FFFFFF'}; color: #1a1a1a; direction: rtl; font-size: ${template.styling?.fontSize || 14}px; line-height: ${template.styling?.lineHeight || 1.6};">
        
        <!-- Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid ${template.styling?.primaryColor || '#3B82F6'}; padding-bottom: 20px;">
          <div style="flex: 1;">
            ${template.content?.header?.showLogo ? `<div style="margin-bottom: 15px;"><img src="/logo.png" alt="شعار الشركة" style="height: 60px; object-fit: contain;" /></div>` : ''}
            ${template.content?.header?.showCompanyInfo ? `
              <div style="text-align: ${template.layout?.companyInfoAlignment || 'right'};">
                <h3 style="color: ${template.styling?.primaryColor || '#3B82F6'}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">${companySettings.name}</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">${companySettings.address}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">هاتف: ${companySettings.phone}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">البريد: ${companySettings.email}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">الرقم الضريبي: ${companySettings.vatNumber}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: ${template.layout?.headerAlignment || 'center'}; flex: 1;">
            <h1 style="color: ${template.styling?.primaryColor || '#3B82F6'}; font-size: 32px; margin: 0; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
              ${template.content?.header?.title || 'فــــاتــــورة'}
            </h1>
            ${template.content?.header?.subtitle ? `<p style="font-size: 16px; color: #666; margin: 8px 0 0 0;">${template.content.header.subtitle}</p>` : ''}
          </div>
          
          <div style="text-align: left; flex: 1;">
            <div style="background: ${template.styling?.secondaryColor || '#1E40AF'}; color: white; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 4px 0; font-weight: 600;">رقم الفاتورة: ${sale.id}</p>
              <p style="margin: 4px 0;">التاريخ: ${new Date(sale.date).toLocaleDateString('ar-SA')}</p>
            </div>
            ${client ? `
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-right: 4px solid ${template.styling?.primaryColor || '#3B82F6'};">
                <h4 style="margin: 0 0 8px 0; color: ${template.styling?.primaryColor || '#3B82F6'}; font-size: 14px;">بيانات العميل:</h4>
                <p style="margin: 2px 0; font-size: 13px;">${client.name}</p>
                <p style="margin: 2px 0; font-size: 13px;">هاتف: ${client.phone}</p>
                ${client.address ? `<p style="margin: 2px 0; font-size: 13px;">العنوان: ${client.address}</p>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse; border: ${template.layout?.showBorder ? '1px solid #ddd' : 'none'}; border-radius: ${template.styling?.roundedCorners || 0}px; overflow: hidden; ${template.styling?.shadowEffect ? 'box-shadow: 0 4px 12px rgba(0,0,0,0.1);' : ''}">
            <thead>
              <tr style="background: linear-gradient(135deg, ${template.styling?.primaryColor || '#3B82F6'}, ${template.styling?.secondaryColor || '#1E40AF'}); color: white;">
                ${template.content?.body?.showItemCode ? '<th style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">#</th>' : ''}
                ${template.content?.body?.showItemDescription ? '<th style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">الصنف</th>' : ''}
                ${template.content?.body?.showQuantity ? '<th style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">الكمية</th>' : ''}
                ${template.content?.body?.showUnitPrice ? '<th style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">السعر</th>' : ''}
                ${template.content?.body?.showTotal ? '<th style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">الإجمالي</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${saleItems.map((item: any, index: number) => `
                <tr style="border-bottom: ${template.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'}; ${index % 2 === 0 ? 'background: #f9fafb;' : 'background: white;'}">
                  ${template.content?.body?.showItemCode ? `<td style="padding: 10px; text-align: center; border-left: ${template.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'};">${index + 1}</td>` : ''}
                  ${template.content?.body?.showItemDescription ? `<td style="padding: 10px; text-align: right; border-left: ${template.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'};">${item.name || 'منتج'}</td>` : ''}
                  ${template.content?.body?.showQuantity ? `<td style="padding: 10px; text-align: center; border-left: ${template.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'};">${item.quantity || 1}</td>` : ''}
                  ${template.content?.body?.showUnitPrice ? `<td style="padding: 10px; text-align: center; border-left: ${template.layout?.showGridLines ? '1px solid #e5e7eb' : 'none'};">${formatAmount(item.price || 0)}</td>` : ''}
                  ${template.content?.body?.showTotal ? `<td style="padding: 10px; text-align: center; font-weight: 600; color: ${template.styling?.primaryColor || '#3B82F6'};">${formatAmount((item.price || 0) * (item.quantity || 1))}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Total Section -->
        <div style="display: flex; justify-content: flex-end; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, ${template.styling?.primaryColor || '#3B82F6'}, ${template.styling?.secondaryColor || '#1E40AF'}); color: white; padding: 20px; border-radius: 12px; text-align: center; min-width: 200px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">الإجمالي النهائي</h3>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800;">${formatAmount(parseFloat(sale.total))}</p>
          </div>
        </div>

        <!-- Footer Section -->
        <div style="margin-top: 40px; padding: 20px; background: ${template.content?.footer?.footerBackgroundColor || '#f8f9fa'}; border-radius: 8px; text-align: ${template.layout?.footerAlignment || 'center'};">
          ${template.content?.footer?.notes ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">${template.content.footer.notes}</p>` : ''}
          ${template.content?.footer?.terms ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #888;">${template.content.footer.terms}</p>` : ''}
          ${template.content?.footer?.showPaymentInfo && template.content?.footer?.bankDetails ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">${template.content.footer.bankDetails}</p>` : ''}
          ${template.content?.footer?.vatNumber ? `<p style="margin: 0; font-size: 12px; color: #888;">${template.content.footer.vatNumber}</p>` : ''}
        </div>
      </div>
    `;
  };

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `فاتورة-${sale.id}`,
    onAfterPrint: () => {
      toast({
        title: "تم إرسال الفاتورة للطباعة",
        description: "تم إرسال الفاتورة للطابعة بنجاح",
      });
    },
    onPrintError: () => {
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء طباعة الفاتورة",
        variant: "destructive",
      });
    }
  });

  // PDF download handler with custom template
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "جاري إنشاء ملف PDF",
        description: "يرجى الانتظار...",
      });

      const customHTML = generateCustomInvoiceHTML();
      
      if (customHTML) {
        // Use custom template
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = customHTML;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`فاتورة-مخصصة-${sale.id}.pdf`);
        
        document.body.removeChild(tempDiv);
      } else {
        // Fallback to original method
        if (!invoiceRef.current) return;
        
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: invoiceRef.current.scrollWidth,
          height: invoiceRef.current.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
        pdf.save(`فاتورة-${sale.id}.pdf`);
      }

      toast({
        title: "تم تحميل ملف PDF بنجاح",
        description: `تم حفظ فاتورة رقم ${sale.id} بصيغة PDF`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في إنشاء ملف PDF",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="flex gap-2 justify-center items-center">
        <TemplateSelector 
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
        {selectedTemplate && (
          <span className="text-sm text-gray-600">
            القالب المختار: {selectedTemplate.name}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          طباعة الفاتورة
        </Button>
        
        <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          تحميل PDF
        </Button>
        
        {!showPreview && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const customHTML = generateCustomInvoiceHTML();
              if (customHTML) {
                const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
                if (previewWindow) {
                  previewWindow.document.write(`
                    <!DOCTYPE html>
                    <html dir="rtl" lang="ar">
                      <head>
                        <meta charset="UTF-8">
                        <title>معاينة فاتورة ${sale.id}</title>
                        <style>
                          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap');
                          body { margin: 0; padding: 20px; background: #f8f9fa; direction: rtl; }
                          .preview-container { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; margin: 0 auto; max-width: 210mm; }
                          @media print { body { background: white; margin: 0; padding: 0; } }
                        </style>
                      </head>
                      <body>
                        <div class="preview-container">
                          ${customHTML}
                        </div>
                      </body>
                    </html>
                  `);
                  previewWindow.document.close();
                }
              }
            }}
          >
            <Eye className="h-4 w-4" />
            معاينة بالقالب المخصص
          </Button>
        )}
      </div>

      {/* Invoice Preview */}
      {showPreview && (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <InvoicePrint
            ref={invoiceRef}
            sale={sale}
            client={client}
            products={products}
            selectedTemplate={selectedTemplate}
          />
        </div>
      )}

      {/* Hidden Invoice for Print/PDF */}
      {!showPreview && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <InvoicePrint
            ref={invoiceRef}
            sale={sale}
            client={client}
            products={products}
          />
        </div>
      )}
    </div>
  );
}