import React from 'react';
import jsPDF from 'jspdf';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: string;
  currentBalance: string;
  creditLimit: string;
  accountType: string;
  status: string;
  createdAt: string;
  balance?: string;
}

interface PaymentVoucher {
  id: number;
  supplierId: number;
  voucherNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  status: string;
  createdAt: string;
}

interface SupplierAccountsPDFProps {
  suppliers: Supplier[];
  paymentVouchers: PaymentVoucher[];
}

export default function SupplierAccountsPDF({ suppliers, paymentVouchers }: SupplierAccountsPDFProps) {
  
  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Setup font for Arabic
    doc.setFont('helvetica');
    
    // Current date
    const currentDate = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate statistics
    const stats = {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter(s => s.status === 'active').length,
      totalBalance: suppliers.reduce((sum, s) => sum + parseFloat(s.balance || s.currentBalance || '0'), 0),
      totalPayments: paymentVouchers.reduce((sum, v) => sum + parseFloat(v.amount || '0'), 0)
    };
    
    const formatCurrency = (amount: number) => {
      return `${amount.toLocaleString('ar')} ر.س`;
    };
    
    // Add header with blue background
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(0, 0, 210, 30, 'F');
    
    // Company logo (MC circle)
    doc.setFillColor(147, 197, 253); // Light blue
    doc.circle(20, 15, 8, 'F');
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('MC', 16, 18);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('تقرير حسابات الموردين', 105, 15, { align: 'center' });
    
    // Company name
    doc.setFontSize(12);
    doc.text('', 105, 22, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text('تاريخ الطباعة: ' + currentDate, 180, 15);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 45;
    
    // Statistics section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ملخص الإحصائيات', 20, yPosition);
    yPosition += 10;
    
    // Statistics boxes
    const statsData = [
      { label: 'إجمالي الموردين', value: stats.totalSuppliers.toString(), color: [59, 130, 246] },
      { label: 'موردين نشطين', value: stats.activeSuppliers.toString(), color: [34, 197, 94] },
      { label: 'إجمالي الأرصدة', value: formatCurrency(stats.totalBalance), color: [168, 85, 247] },
      { label: 'إجمالي المدفوعات', value: formatCurrency(stats.totalPayments), color: [249, 115, 22] }
    ];
    
    let xPos = 20;
    statsData.forEach(stat => {
      // Box background
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1);
      doc.rect(xPos, yPosition, 40, 15, 'F');
      
      // Box border
      doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.rect(xPos, yPosition, 40, 15);
      
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.text(stat.label, xPos + 20, yPosition + 5, { align: 'center' });
      
      // Value
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value, xPos + 20, yPosition + 11, { align: 'center' });
      
      xPos += 45;
    });
    
    yPosition += 25;
    
    // Suppliers table header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('تفاصيل حسابات الموردين', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFillColor(243, 244, 246); // Gray background
    doc.rect(20, yPosition, 170, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const headers = ['م', 'اسم المورد', 'الهاتف', 'البريد الإلكتروني', 'الرصيد الحالي', 'حد الائتمان', 'الحالة'];
    const colWidths = [15, 40, 25, 35, 25, 20, 10];
    let xPosition = 20;
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition + colWidths[index]/2, yPosition + 5, { align: 'center' });
      xPosition += colWidths[index];
    });
    
    yPosition += 8;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    suppliers.slice(0, 15).forEach((supplier, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, yPosition, 170, 8, 'F');
      }
      
      xPosition = 20;
      const rowData = [
        (index + 1).toString(),
        supplier.name.substring(0, 20),
        supplier.phone,
        (supplier.email || '-').substring(0, 20),
        formatCurrency(parseFloat(supplier.balance || supplier.currentBalance || '0')),
        formatCurrency(parseFloat(supplier.creditLimit || '0')),
        supplier.status === 'active' ? 'نشط' : 'غير نشط'
      ];
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, xPosition + colWidths[colIndex]/2, yPosition + 5, { align: 'center' });
        xPosition += colWidths[colIndex];
      });
      
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Payment vouchers section
    if (paymentVouchers.length > 0 && yPosition < 220) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ملخص سندات الدفع الأخيرة', 20, yPosition);
      yPosition += 10;
      
      // Payment vouchers table header
      doc.setFillColor(243, 244, 246);
      doc.rect(20, yPosition, 170, 8, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const paymentHeaders = ['رقم السند', 'المورد', 'المبلغ', 'طريقة الدفع', 'التاريخ'];
      const paymentColWidths = [30, 50, 30, 30, 30];
      xPosition = 20;
      
      paymentHeaders.forEach((header, index) => {
        doc.text(header, xPosition + paymentColWidths[index]/2, yPosition + 5, { align: 'center' });
        xPosition += paymentColWidths[index];
      });
      
      yPosition += 8;
      
      // Payment vouchers data
      doc.setFont('helvetica', 'normal');
      paymentVouchers.slice(0, 8).forEach((voucher, index) => {
        if (yPosition > 250) return;
        
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(20, yPosition, 170, 8, 'F');
        }
        
        const supplier = suppliers.find(s => s.id === voucher.supplierId);
        xPosition = 20;
        const voucherData = [
          voucher.voucherNumber,
          (supplier?.name || 'غير محدد').substring(0, 25),
          formatCurrency(parseFloat(voucher.amount || '0')),
          voucher.paymentMethod === 'cash' ? 'نقدي' : 
          voucher.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'شيك',
          new Date(voucher.paymentDate).toLocaleDateString('en-GB')
        ];
        
        voucherData.forEach((data, colIndex) => {
          doc.text(data, xPosition + paymentColWidths[colIndex]/2, yPosition + 5, { align: 'center' });
          xPosition += paymentColWidths[colIndex];
        });
        
        yPosition += 8;
      });
    }
    
    // Footer
    const footerY = 280;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, 190, footerY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('تم إنشاء هذا التقرير', 20, footerY + 5);
    doc.text('جميع الحقوق محفوظة © 2025', 20, footerY + 10);
    
    doc.text('وقت الطباعة: ' + new Date().toLocaleString('en-US'), 190, footerY + 5, { align: 'right' });
    doc.text('رقم الصفحة: 1', 190, footerY + 10, { align: 'right' });
    
    // Save the PDF
    const fileName = `تقرير_حسابات_الموردين_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      تحميل PDF
    </button>
  );
}