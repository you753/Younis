import jsPDF from 'jspdf';

interface ReportData {
  title: string;
  companyInfo: any;
  stats: any;
  data: any[];
  columns: string[];
  totals?: any;
}

export const generateProfessionalReportPDF = (reportData: ReportData) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = 595;
  const pageHeight = 842;
  let yPosition = 50;

  // Header Section
  const drawHeader = () => {
    // Company logo placeholder (simple circle)
    doc.setFillColor(0, 0, 0);
    doc.circle(70, 80, 20, 'S');
    doc.setFontSize(12);
    doc.text('MC', 63, 85);

    // Company information - right aligned
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.companyInfo?.nameArabic || '', pageWidth - 50, 60, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('المملكة العربية السعودية', pageWidth - 50, 80, { align: 'right' });
    doc.text('ص.ب: ' + (reportData.companyInfo?.postalCode || '222345'), pageWidth - 50, 95, { align: 'right' });
    doc.text('هاتف: ' + (reportData.companyInfo?.phone || '0567537599'), pageWidth - 50, 110, { align: 'right' });
    doc.text('الرقم الضريبي: ' + (reportData.companyInfo?.vatNumber || '123456789012345'), pageWidth - 50, 125, { align: 'right' });

    // Report title - center
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, pageWidth / 2, 60, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-GB');
    doc.text('التاريخ: ' + currentDate, pageWidth / 2, 80, { align: 'center' });

    yPosition = 160;
  };

  drawHeader();

  // Statistics Section
  if (reportData.stats) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('الملخص الإحصائي', pageWidth - 50, yPosition, { align: 'right' });
    yPosition += 25;

    // Draw stats in a simple box format
    const statsKeys = Object.keys(reportData.stats);
    let xPos = 50;
    let statsYPos = yPosition;

    statsKeys.forEach((key, index) => {
      if (index % 2 === 0 && index > 0) {
        statsYPos += 40;
        xPos = 50;
      }
      
      // Box for each stat
      doc.setDrawColor(0, 0, 0);
      doc.rect(xPos, statsYPos, 120, 30);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(getStatLabel(key), xPos + 60, statsYPos + 12, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      const value = typeof reportData.stats[key] === 'number' ? 
        reportData.stats[key].toLocaleString('en-US') : reportData.stats[key];
      doc.text(value.toString(), xPos + 60, statsYPos + 25, { align: 'center' });
      
      xPos += 140;
    });

    yPosition = statsYPos + 60;
  }

  // Data Table
  if (reportData.data && reportData.data.length > 0) {
    // Table header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('البيانات التفصيلية', pageWidth - 50, yPosition, { align: 'right' });
    yPosition += 25;

    // Calculate column widths
    const tableWidth = pageWidth - 100;
    const colWidth = tableWidth / reportData.columns.length;

    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(50, yPosition, tableWidth, 30, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(50, yPosition, tableWidth, 30);

    // Header text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    reportData.columns.forEach((column, index) => {
      const xPos = 50 + (index * colWidth) + (colWidth / 2);
      doc.text(column, xPos, yPosition + 20, { align: 'center' });
      
      // Vertical lines
      if (index < reportData.columns.length - 1) {
        doc.line(50 + ((index + 1) * colWidth), yPosition, 50 + ((index + 1) * colWidth), yPosition + 30);
      }
    });

    yPosition += 30;

    // Table rows
    doc.setFont('helvetica', 'normal');
    reportData.data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 50;
        drawHeader();
      }

      // Row background (alternating)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(50, yPosition, tableWidth, 25, 'F');
      }

      // Row border
      doc.setDrawColor(0, 0, 0);
      doc.rect(50, yPosition, tableWidth, 25);

      // Row data
      const rowValues = Object.values(row);
      rowValues.forEach((value, colIndex) => {
        if (colIndex < reportData.columns.length) {
          const xPos = 50 + (colIndex * colWidth) + (colWidth / 2);
          const displayValue = typeof value === 'number' ? 
            value.toLocaleString('en-US') : (value || '').toString();
          
          doc.text(displayValue, xPos, yPosition + 15, { align: 'center' });
          
          // Vertical lines
          if (colIndex < reportData.columns.length - 1) {
            doc.line(50 + ((colIndex + 1) * colWidth), yPosition, 50 + ((colIndex + 1) * colWidth), yPosition + 25);
          }
        }
      });

      yPosition += 25;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('تم إنشاء هذا التقرير بواسطة نظام المحاسب الأعظم', pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('تاريخ الطباعة: ' + new Date().toLocaleString('en-US'), pageWidth / 2, pageHeight - 15, { align: 'center' });

  return doc;
};

const getStatLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    totalSales: 'إجمالي المبيعات',
    totalAmount: 'إجمالي المبلغ',
    totalPurchases: 'إجمالي المشتريات',
    totalEmployees: 'إجمالي الموظفين',
    totalSuppliers: 'إجمالي الموردين',
    totalProducts: 'إجمالي المنتجات',
    totalBalance: 'إجمالي الأرصدة',
    totalDebts: 'إجمالي الديون',
    totalReturns: 'إجمالي المرتجعات',
    totalVouchers: 'إجمالي السندات',
    activeEmployees: 'الموظفين النشطين',
    activeSuppliers: 'الموردين النشطين',
    totalCategories: 'إجمالي الفئات',
    totalValue: 'إجمالي القيمة',
    totalQuantity: 'إجمالي الكمية'
  };
  
  return labels[key] || key;
};