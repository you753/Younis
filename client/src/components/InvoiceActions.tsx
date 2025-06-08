import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Printer, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvoicePrint from './InvoicePrint';
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

  // PDF download handler
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      toast({
        title: "جاري إنشاء ملف PDF",
        description: "يرجى الانتظار...",
      });

      // Create canvas from the invoice element
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Center the image
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Save the PDF
      pdf.save(`فاتورة-${sale.id}.pdf`);

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
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            معاينة
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