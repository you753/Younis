interface UnifiedInvoiceData {
  title: string;
  invoiceNumber: string;
  entityName: string;
  entityDetails: {
    id: number;
    phone: string;
    email?: string;
    type?: string;
    status?: string;
    lastTransaction?: string;
  };
  summaryData: Array<{
    label: string;
    value: string;
    color: string;
  }>;
  user?: any;
  companyInfo?: any;
}

export const generateUnifiedInvoice = (data: UnifiedInvoiceData): string => {
  const { title, invoiceNumber, entityName, entityDetails, summaryData, user, companyInfo } = data;
  
  // استخدام معلومات الشركة المرسلة أو القيم الافتراضية
  const finalCompanyInfo = {
    nameArabic: companyInfo?.nameArabic || "",
    nameEnglish: companyInfo?.nameEnglish || "Bedouin Market Gateway",
    address: companyInfo?.address || "جدة البغدادية الشرقية",
    district: companyInfo?.district || "البغدادية الشرقية",
    city: companyInfo?.city || "جدة",
    region: companyInfo?.region || "منطقة مكة المكرمة",
    phone: companyInfo?.phone || "0567537599",
    mobile: companyInfo?.mobile || "0567537599",
    fax: companyInfo?.fax || "0126789012",
    email: companyInfo?.email || "byrwl8230@gmail.com",
    website: companyInfo?.website || "www.bedouinmarket.com",
    taxNumber: companyInfo?.taxNumber || "123456789012345",
    vatNumber: companyInfo?.vatNumber || "123456789012345",
    commercialRegister: companyInfo?.commercialRegister || "4030528128",
    license: companyInfo?.license || "40305281",
    bankName: companyInfo?.bankName || "البنك الأهلي السعودي",
    bankAccount: companyInfo?.bankAccount || "SA0380000000608010167519",
    iban: companyInfo?.iban || "SA0380000000608010167519",
    postalCode: companyInfo?.postalCode || "222345",
    country: companyInfo?.country || "المملكة العربية السعودية"
  };
  
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        
        .header .company-info {
          margin-top: 10px;
          font-size: 16px;
          opacity: 0.9;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          padding: 20px 30px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .invoice-info div {
          text-align: center;
        }
        
        .invoice-info .label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .invoice-info .value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .entity-section {
          padding: 20px 30px;
          border-bottom: 1px solid #eee;
        }
        
        .entity-section h2 {
          margin: 0 0 15px 0;
          color: #444;
          font-size: 20px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 5px;
          display: inline-block;
        }
        
        .entity-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
        }
        
        .detail-label {
          font-weight: bold;
          color: #555;
          margin-left: 8px;
        }
        
        .detail-value {
          color: #333;
        }
        
        .summary-section {
          padding: 20px 30px;
        }
        
        .summary-section h2 {
          margin: 0 0 20px 0;
          color: #444;
          font-size: 20px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 5px;
          display: inline-block;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-right: 4px solid;
          text-align: center;
        }
        
        .summary-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: bold;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .invoice-container {
            border: none;
            border-radius: 0;
          }
          
          .header {
            background: #667eea !important;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <h1>${title}</h1>
          <div class="company-info">
            ${finalCompanyInfo.nameArabic}
          </div>
        </div>
        
        <!-- Invoice Info -->
        <div class="invoice-info">
          <div>
            <div class="label">رقم المستند</div>
            <div class="value">${invoiceNumber}</div>
          </div>
          <div>
            <div class="label">تاريخ الإصدار</div>
            <div class="value">${new Date().toLocaleDateString('en-GB')}</div>
          </div>
          <div>
            <div class="label">وقت الطباعة</div>
            <div class="value">${new Date().toLocaleTimeString('en-US')}</div>
          </div>
        </div>
        
        <!-- Entity Section -->
        <div class="entity-section">
          <h2>بيانات ${entityName}</h2>
          <div class="entity-details">
            <div class="detail-item">
              <span class="detail-label">الرقم التعريفي:</span>
              <span class="detail-value">${entityDetails.id}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">رقم الهاتف:</span>
              <span class="detail-value">${entityDetails.phone}</span>
            </div>
            ${entityDetails.email ? `
            <div class="detail-item">
              <span class="detail-label">البريد الإلكتروني:</span>
              <span class="detail-value">${entityDetails.email}</span>
            </div>
            ` : ''}
            ${entityDetails.type ? `
            <div class="detail-item">
              <span class="detail-label">نوع الحساب:</span>
              <span class="detail-value">${entityDetails.type}</span>
            </div>
            ` : ''}
            ${entityDetails.status ? `
            <div class="detail-item">
              <span class="detail-label">الحالة:</span>
              <span class="detail-value">${entityDetails.status}</span>
            </div>
            ` : ''}
            ${entityDetails.lastTransaction ? `
            <div class="detail-item">
              <span class="detail-label">آخر معاملة:</span>
              <span class="detail-value">${new Date(entityDetails.lastTransaction).toLocaleDateString('en-GB')}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Summary Section -->
        <div class="summary-section">
          <h2>ملخص الحساب</h2>
          <div class="summary-grid">
            ${summaryData.map(item => `
              <div class="summary-item" style="border-right-color: ${item.color};">
                <div class="summary-label">${item.label}</div>
                <div class="summary-value" style="color: ${item.color};">${item.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>${finalCompanyInfo.nameArabic}</strong> - ${finalCompanyInfo.address} - ${finalCompanyInfo.city}</p>
          <p>هاتف: ${finalCompanyInfo.phone} | جوال: ${finalCompanyInfo.mobile} | إيميل: ${finalCompanyInfo.email}</p>
          <p>السجل التجاري: ${finalCompanyInfo.commercialRegister} | الرقم الضريبي: ${finalCompanyInfo.taxNumber}</p>
          <p>تم إنشاء هذا المستند تلقائياً في ${new Date().toLocaleString('en-US')}</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
};