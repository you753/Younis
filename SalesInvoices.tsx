import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Receipt, Search, Eye, Printer, Download, Settings, Edit, Trash2 } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import UnifiedPrintTemplate from '@/components/shared/UnifiedPrintTemplate';
import { useReactToPrint } from 'react-to-print';

export default function SalesInvoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [editingSale, setEditingSale] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [saleForPrint, setSaleForPrint] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // جلب إعدادات الشركة المحدثة تلقائياً
  const { data: companySettings, refetch: refetchSettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any) => data?.الشركة?.companyInfo || {},
    refetchInterval: 5000 // إعادة تحميل كل 5 ثوان
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `فاتورة مبيعات ${saleForPrint?.id}`,
    onBeforeGetContent: () => {
      // إعادة تحميل إعدادات الشركة قبل الطباعة
      refetchSettings();
      return Promise.resolve();
    },
  });

  const handlePrintSale = (sale: any) => {
    setSaleForPrint(sale);
    setShowPrintDialog(true);
  };

  const filteredSales = Array.isArray(sales) ? sales.filter((sale: any) => {
    const client = Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null;
    const searchString = `${sale.id} ${client?.name || ''} ${sale.total}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }) : [];

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (saleId: number) => {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف الفاتورة');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "تم حذف الفاتورة",
        description: "تم حذف فاتورة المبيعات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف الفاتورة",
        variant: "destructive",
      });
    },
  });

  const handleDeleteSale = async (saleId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      deleteSaleMutation.mutate(saleId);
    }
  };

  const handleEditSale = (sale: any) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/sales/edit/${sale.id}`;
  };

  const printInvoice = (sale: any, template: string) => {
    const client = (clients as any[])?.find((c: any) => c.id === sale.clientId);
    let saleItems = [];
    try {
      saleItems = sale.items ? (typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items) : [];
    } catch (error) {
      console.error('Error parsing sale items:', error);
      saleItems = [];
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let invoiceHTML = '';
    
    if (template === 'standard') {
      invoiceHTML = generateStandardInvoice(sale, client, saleItems, companySettings);
    } else if (template === 'professional') {
      invoiceHTML = generateProfessionalInvoice(sale, client, saleItems, companySettings);
    } else if (template === 'detailed') {
      invoiceHTML = generateDetailedInvoice(sale, client, saleItems, companySettings);
    }

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const generateStandardInvoice = (sale: any, client: any, items: any[], companySettings: any) => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة مبيعات عادية - ${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; margin: 0; padding: 15px; background: white; color: #000; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #000; }
            .header { text-align: center; margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #000; }
            .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .invoice-title { font-size: 16px; margin-bottom: 5px; }
            .invoice-number { font-size: 14px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 0 10px; }
            .info-box { flex: 1; padding: 8px; border: 1px solid #000; margin: 0 5px; }
            .info-title { font-weight: bold; margin-bottom: 5px; font-size: 14px; }
            .info-value { margin: 2px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { padding: 6px; text-align: center; border: 1px solid #000; font-size: 13px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .total-section { text-align: left; margin: 10px; padding: 8px; border: 1px solid #000; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .total-label { font-weight: bold; }
            .total-amount { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-name">${companySettings?.nameArabic || ''}</div>
              <div class="invoice-title">فاتورة مبيعات عادية</div>
              <div class="invoice-number">رقم الفاتورة: ${sale.id}</div>
            </div>
            
            <div class="info-section">
              <div class="info-box">
                <div class="info-title">بيانات العميل</div>
                <div class="info-value">الاسم: ${client?.name || 'عميل نقدي'}</div>
                <div class="info-value">الهاتف: ${client?.phone || '-'}</div>
              </div>
              <div class="info-box">
                <div class="info-title">بيانات الفاتورة</div>
                <div class="info-value">التاريخ: ${new Date(sale.date).toLocaleDateString('en-GB')}</div>
                <div class="info-value">الوقت: ${new Date(sale.date).toLocaleTimeString('en-US')}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${Number(item.unitPrice || item.price)} ر.س</td>
                    <td>${Number(item.quantity) * Number(item.unitPrice || item.price)} ر.س</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">المجموع الكلي:</span>
                <span class="total-amount">${Number(sale.total)} ر.س</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateProfessionalInvoice = (sale: any, client: any, items: any[], companySettings: any) => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة مبيعات احترافية - ${sale.id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; direction: rtl; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .invoice-container { max-width: 900px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 40px 30px; text-align: center; }
            .company-name { font-size: 36px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
            .invoice-title { font-size: 24px; opacity: 0.9; margin-bottom: 15px; }
            .invoice-number { font-size: 18px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; }
            .content { padding: 40px 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .info-card { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #4F46E5; }
            .info-title { font-size: 18px; font-weight: bold; color: #1E293B; margin-bottom: 15px; }
            .info-item { margin: 8px 0; color: #475569; }
            .items-table { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            table { width: 100%; border-collapse: collapse; }
            th { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 18px 15px; font-weight: bold; }
            td { padding: 15px; border-bottom: 1px solid #E2E8F0; }
            tr:last-child td { border-bottom: none; }
            tr:hover { background-color: #F8FAFC; }
            .totals { background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%); padding: 25px; border-radius: 12px; margin-top: 30px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 8px 0; }
            .final-total { border-top: 2px solid #4F46E5; padding-top: 15px; margin-top: 15px; }
            .final-total .total-amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .footer { text-align: center; padding: 20px; background: #F8FAFC; color: #6B7280; border-top: 1px solid #E2E8F0; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-name">${companySettings?.nameArabic || ''}</div>
              <div class="invoice-title">فاتورة مبيعات احترافية</div>
              <div class="invoice-number">رقم الفاتورة: INV-${sale.id}</div>
            </div>
            
            <div class="content">
              <div class="info-grid">
                <div class="info-card">
                  <div class="info-title">بيانات العميل</div>
                  <div class="info-item"><strong>الاسم:</strong> ${client?.name || 'عميل نقدي'}</div>
                  <div class="info-item"><strong>الهاتف:</strong> ${client?.phone || '-'}</div>
                  <div class="info-item"><strong>البريد:</strong> ${client?.email || '-'}</div>
                </div>
                <div class="info-card">
                  <div class="info-title">تفاصيل الفاتورة</div>
                  <div class="info-item"><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleDateString('en-GB')}</div>
                  <div class="info-item"><strong>الوقت:</strong> ${new Date(sale.date).toLocaleTimeString('en-US')}</div>
                  <div class="info-item"><strong>طريقة الدفع:</strong> ${sale.paymentMethod || 'نقدي'}</div>
                </div>
              </div>

              <div class="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>الصنف</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((item, index) => `
                      <tr>
                        <td><strong>${item.productName}</strong></td>
                        <td>${item.quantity}</td>
                        <td>${parseFloat(item.price).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                        <td>${parseFloat(item.total).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="totals">
                <div class="total-row">
                  <span>المجموع الفرعي:</span>
                  <span>${parseFloat(sale.total).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row">
                  <span>الخصم:</span>
                  <span>${parseFloat(sale.discount || 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row final-total">
                  <span class="total-label">المجموع الكلي:</span>
                  <span class="total-amount">${parseFloat(sale.total).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>شكراً لك على التعامل معنا | ${companySettings?.nameArabic || ''}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateDetailedInvoice = (sale: any, client: any, items: any[], companySettings: any) => {
    const subtotal = parseFloat(sale.total);
    const vatRate = 0.15; // 15% VAT
    const vatAmount = subtotal * vatRate;
    const totalWithVat = subtotal + vatAmount;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة ضريبية مفصلة - ${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; margin: 0; padding: 15px; background: white; color: #000; }
            .invoice-container { max-width: 900px; margin: 0 auto; background: white; border: 1px solid #000; }
            .header { text-align: center; padding: 15px; border-bottom: 1px solid #000; }
            .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .invoice-title { font-size: 16px; margin-bottom: 5px; }
            .tax-invoice { font-size: 14px; padding: 3px 8px; border: 1px solid #000; display: inline-block; }
            .content { padding: 15px; }
            .business-info { text-align: center; margin-bottom: 15px; padding: 10px; border: 1px solid #000; }
            .tax-number { font-weight: bold; margin: 3px 0; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
            .detail-box { padding: 8px; border: 1px solid #000; }
            .detail-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; font-size: 14px; }
            .detail-item { margin: 3px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 6px; text-align: center; border: 1px solid #000; font-size: 12px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .totals-section { padding: 10px; border: 1px solid #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0; }
            .vat-row { font-weight: bold; }
            .final-total { border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; font-weight: bold; }
            .tax-note { border: 1px solid #000; padding: 8px; margin-top: 10px; font-size: 12px; }
            .footer { text-align: center; margin-top: 15px; padding: 8px; border-top: 1px solid #000; font-size: 12px; }
            .qr-placeholder { width: 60px; height: 60px; border: 1px solid #000; margin: 5px auto; display: flex; align-items: center; justify-content: center; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-name">${companySettings?.nameArabic || ''}</div>
              <div class="invoice-title">فاتورة ضريبية مفصلة</div>
              <div class="tax-invoice">Tax Invoice | فاتورة ضريبية</div>
            </div>
            
            <div class="content">
              <div class="business-info">
                <div><strong>${companySettings?.nameArabic || ''}</strong></div>
                <div>${companySettings?.address || 'الرياض - المملكة العربية السعودية'}</div>
                <div class="tax-number">الرقم الضريبي: ${companySettings?.taxNumber || '300000000000003'}</div>
                <div>ت.س: ${companySettings?.commercialRegistration || '1010000000'} | ص.ب: ${companySettings?.postalBox || '12345'}</div>
              </div>

              <div class="invoice-details">
                <div class="detail-box">
                  <div class="detail-title">بيانات العميل</div>
                  <div class="detail-item"><strong>الاسم:</strong> ${client?.name || 'عميل نقدي'}</div>
                  <div class="detail-item"><strong>الهاتف:</strong> ${client?.phone || '-'}</div>
                  <div class="detail-item"><strong>البريد:</strong> ${client?.email || '-'}</div>
                  <div class="detail-item"><strong>الرقم الضريبي:</strong> ${client?.taxNumber || 'غير محدد'}</div>
                </div>
                <div class="detail-box">
                  <div class="detail-title">تفاصيل الفاتورة</div>
                  <div class="detail-item"><strong>رقم الفاتورة:</strong> INV-${sale.id}</div>
                  <div class="detail-item"><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleDateString('en-GB')}</div>
                  <div class="detail-item"><strong>الوقت:</strong> ${new Date(sale.date).toLocaleTimeString('en-US')}</div>
                  <div class="detail-item"><strong>طريقة الدفع:</strong> ${sale.paymentMethod || 'نقدي'}</div>
                </div>
                <div class="detail-box">
                  <div class="detail-title">رمز الاستجابة السريعة</div>
                  <div class="qr-placeholder">QR Code</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>م</th>
                    <th>وصف الصنف</th>
                    <th>الكمية</th>
                    <th>السعر قبل الضريبة</th>
                    <th>الإجمالي قبل الضريبة</th>
                    <th>معدل الضريبة</th>
                    <th>مبلغ الضريبة</th>
                    <th>الإجمالي شامل الضريبة</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item, index) => {
                    const priceBeforeVat = parseFloat(item.price) / 1.15;
                    const totalBeforeVat = parseFloat(item.total) / 1.15;
                    const vatAmount = totalBeforeVat * 0.15;
                    const totalWithVat = totalBeforeVat + vatAmount;
                    
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>${priceBeforeVat.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                        <td>${totalBeforeVat.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                        <td>15%</td>
                        <td>${vatAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                        <td>${totalWithVat.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <div class="totals-section">
                <div class="total-row">
                  <span>المجموع قبل الضريبة:</span>
                  <span>${(subtotal / 1.15).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row vat-row">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>${((subtotal / 1.15) * 0.15).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row final-total">
                  <span>المجموع شامل الضريبة:</span>
                  <span>${subtotal.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
              </div>

              <div class="tax-note">
                <strong>ملاحظة ضريبية:</strong> هذه فاتورة ضريبية صادرة وفقاً لأنظمة الهيئة العامة للزكاة والدخل في المملكة العربية السعودية. يجب الاحتفاظ بهذه الفاتورة لأغراض المحاسبة الضريبية.
              </div>
            </div>

            <div class="footer">
              <p>تم إنشاء هذه الفاتورة إلكترونياً | www.example.com | info@example.com</p>
              <p>هذا المستند صالح بدون توقيع أو ختم</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">فواتير المبيعات</h1>
          <p className="text-muted-foreground">إدارة وطباعة فواتير المبيعات بتصميمات مختلفة</p>
        </div>
      </div>

      {/* Search and Template Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">تصميم الفاتورة:</span>
              <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">فاتورة عادية</SelectItem>
                  <SelectItem value="professional">فاتورة احترافية</SelectItem>
                  <SelectItem value="detailed">فاتورة ضريبية مفصلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`cursor-pointer transition-all ${selectedTemplate === 'standard' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedTemplate('standard')}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle>فاتورة عادية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              تصميم بسيط ومناسب للمعاملات اليومية
            </p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedTemplate === 'professional' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setSelectedTemplate('professional')}>
          <CardHeader className="text-center">
            <Receipt className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle>فاتورة احترافية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              تصميم أنيق ومتقدم للعملاء المهمين
            </p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedTemplate === 'detailed' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setSelectedTemplate('detailed')}>
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>فاتورة ضريبية مفصلة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              فاتورة ضريبية معتمدة مع تفاصيل الضريبة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            فواتير المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير مبيعات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>عدد الأصناف</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale: any) => {
                  const client = (clients as any[])?.find((c: any) => c.id === sale.clientId);
                  let itemsCount = 0;
                  try {
                    itemsCount = sale.items ? (typeof sale.items === 'string' ? JSON.parse(sale.items).length : sale.items.length) : 0;
                  } catch (error) {
                    console.error('Error parsing sale items count:', error);
                    itemsCount = 0;
                  }
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{client?.name || 'عميل نقدي'}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {parseFloat(sale.total).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR',
                          minimumFractionDigits: 2 
                        })}
                      </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{itemsCount} صنف</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(sale, selectedTemplate)}
                            className="text-blue-600 hover:text-blue-700"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSale(sale)}
                            className="text-orange-600 hover:text-orange-700"
                            title="تعديل الفاتورة"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSale(sale.id)}
                            disabled={deleteSaleMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                            title="حذف الفاتورة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}