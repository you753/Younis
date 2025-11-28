import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Receipt, Edit, Trash2, Save, Calendar, Printer, ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import QuoteFormComponent from '@/components/forms/QuoteForm';

// Schema for form validation
const quoteFormSchema = z.object({
  clientId: z.number().optional(),
  quoteNumber: z.string().min(1, 'رقم العرض مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  tax: z.string().optional(),
  discount: z.string().optional(),
  status: z.string().default('pending'),
  validUntil: z.string().min(1, 'تاريخ انتهاء الصلاحية مطلوب'),
  notes: z.string().optional(),
});

type QuoteForm = z.infer<typeof quoteFormSchema>;

export default function Quotes() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [currentPage, setCurrentPageState] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setCurrentPage('عروض الأسعار');
  }, [setCurrentPage]);

  // Fetch quotes data
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['/api/quotes'],
  });

  // Fetch clients data for quote display
  const { data: clientsData = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // جلب معلومات الإعدادات والفرع
  const { data: settingsData } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: 2000,
  });

  // جلب معلومات الفرع من الـ URL أو التخزين المحلي
  const branchId = localStorage.getItem('currentBranchId');
  const { data: branchInfo } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
    refetchInterval: 2000,
  });

  // Calculate statistics from actual quotes data
  const quoteStats = {
    newQuotes: Array.isArray(quotes) ? quotes.filter((q: any) => q.status === 'pending').length : 0,
    acceptedQuotes: Array.isArray(quotes) ? quotes.filter((q: any) => q.status === 'accepted').length : 0,
    pendingQuotes: Array.isArray(quotes) ? quotes.filter((q: any) => q.status === 'pending').length : 0,
    totalValue: Array.isArray(quotes) ? quotes.reduce((sum: number, q: any) => sum + parseFloat(q.total || 0), 0) : 0
  };



  const form = useForm<QuoteForm>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      quoteNumber: '',
      total: '',
      tax: '0',
      discount: '0',
      status: 'pending',
      validUntil: '',
      notes: '',
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: (data: QuoteForm) => apiRequest('POST', '/api/quotes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم إضافة عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة عرض السعر",
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuoteForm> }) => 
      apiRequest({
        url: `/api/quotes/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setEditingQuote(null);
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم تحديث عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث عرض السعر",
        variant: "destructive",
      });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/quotes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "نجح",
        description: "تم حذف عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف عرض السعر",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteForm) => {
    if (editingQuote) {
      updateQuoteMutation.mutate({ id: editingQuote.id, data });
    } else {
      createQuoteMutation.mutate(data);
    }
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    form.reset({
      clientId: quote.clientId,
      quoteNumber: quote.quoteNumber,
      total: quote.total,
      tax: quote.tax || '0',
      discount: quote.discount || '0',
      status: quote.status,
      validUntil: quote.validUntil ? format(new Date(quote.validUntil), 'yyyy-MM-dd') : '',
      notes: quote.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف عرض السعر؟')) {
      deleteQuoteMutation.mutate(id);
    }
  };

  const handlePrintQuote = (quote: any) => {
    const client = Array.isArray(clientsData) ? clientsData.find((c: any) => c.id === quote.clientId) : null;
    const items = quote.items ? (typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items) : [];
    const user = useAppStore.getState().user;
    
    const quoteHTML = generateSimpleQuoteHTML(quote, client, items, user);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "تحذير",
        description: "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(quoteHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handleCreateInvoice = async (quote: any) => {
    try {
      // تحويل عرض السعر إلى فاتورة مبيعات
      const invoiceData = {
        clientId: quote.clientId,
        items: quote.items,
        total: quote.total,
        date: new Date().toISOString(),
        notes: `فاتورة محولة من عرض السعر رقم: ${quote.quoteNumber}`
      };

      const response = await apiRequest({
        url: '/api/sales',
        method: 'POST',
        body: invoiceData
      });

      if (response) {
        // حذف عرض السعر بعد التحويل
        await apiRequest({
          url: `/api/quotes/${quote.id}`,
          method: 'DELETE'
        });

        queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
        
        toast({
          title: "نجح ✅",
          description: `تم تحويل عرض السعر ${quote.quoteNumber} إلى فاتورة مبيعات وإزالته من القائمة`,
        });

        // الانتقال إلى صفحة فواتير المبيعات
        setTimeout(() => {
          setLocation('/sales-invoices');
        }, 500);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الفاتورة",
        variant: "destructive",
      });
    }
  };

  const printProfessionalInvoice = async (sale: any, originalQuote: any) => {
    const client = Array.isArray(clientsData) ? clientsData.find((c: any) => c.id === sale.clientId) : null;
    const items = sale.items ? (typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items) : [];
    const user = useAppStore.getState().user;
    
    const invoiceHTML = generateProfessionalInvoiceHTML(sale, client, items, user, originalQuote);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "تحذير",
        description: "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // انتظار تحميل المحتوى ثم الطباعة
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const generateProfessionalInvoiceHTML = (sale: any, client: any, items: any[], user: any, originalQuote: any, companySettings?: any) => {
    const subtotal = parseFloat(sale.total);
    const logoUrl = user?.avatar || '';
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة مبيعات - ${sale.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: Arial, sans-serif; 
              direction: rtl; 
              background: white;
              padding: 20px;
              line-height: 1.6;
            }
            
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white; 
              border: 2px solid #333;
            }
            
            .header { 
              background: #f8f9fa; 
              padding: 20px; 
              border-bottom: 2px solid #333;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;
            }
            
            .company-info {
              text-align: right;
              flex: 1;
            }
            
            .company-info h1 { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px;
              color: #333;
            }
            
            .company-info p {
              font-size: 14px;
              color: #666;
            }
            
            .invoice-title { 
              font-size: 18px; 
              font-weight: bold;
              color: #333;
              background: white;
              padding: 10px 20px;
              border: 2px solid #333;
              position: absolute;
              left: 20px;
              top: 50%;
              transform: translateY(-50%);
            }
            
            .logo-section {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
            
            .company-logo {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #28a745;
              border: 3px solid #28a745;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .content { 
              padding: 20px; 
            }
            
            .quote-reference {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              margin-bottom: 20px;
              text-align: center;
              border-radius: 5px;
            }
            
            .quote-reference strong {
              color: #856404;
            }

            .invoice-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .meta-box { 
              background: #f8f9fa;
              padding: 15px; 
              border: 1px solid #ddd;
            }
            
            .meta-title { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 10px; 
              font-size: 16px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            
            .meta-value { 
              color: #666; 
              margin-bottom: 5px;
              font-size: 14px;
            }
            
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              border: 2px solid #333;
            }
            
            .items-table th { 
              background: #333;
              color: white; 
              padding: 12px 8px; 
              text-align: center; 
              font-weight: bold;
              font-size: 14px;
            }
            
            .items-table td { 
              padding: 10px 8px; 
              text-align: center; 
              border-bottom: 1px solid #ddd;
              font-size: 14px;
            }
            
            .items-table tbody tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .totals-section { 
              background: #f8f9fa;
              padding: 20px; 
              border: 2px solid #333;
              margin-bottom: 20px;
            }
            
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              margin: 8px 0; 
              font-size: 14px;
            }
            
            .total-row.subtotal {
              padding-bottom: 8px;
              border-bottom: 1px solid #ddd;
            }
            
            .total-row.final-total { 
              font-size: 18px;
              font-weight: bold; 
              color: #333;
              background: white;
              padding: 10px;
              border: 2px solid #333;
              margin-top: 10px;
            }
            
            .footer { 
              background: #f8f9fa;
              padding: 15px; 
              text-align: center;
              border-top: 2px solid #333;
            }
            
            .footer p { 
              margin: 5px 0; 
              color: #666;
              font-size: 12px;
            }
            
            @media print {
              body { 
                padding: 0;
              }
              .invoice-container {
                border: 1px solid #333;
              }
            }
            
            .company-logo-image {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid #ddd;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .company-logo {
              width: 80px !important;
              height: 80px !important;
              border-radius: 50% !important;
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
              border: 3px solid #28a745 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 32px !important;
              font-weight: bold !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
              position: relative !important;
            }
            
            .company-logo::before {
              content: '✓' !important;
              font-size: 32px !important;
              color: white !important;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="invoice-title">فاتورة مبيعات</div>
              <div class="logo-section">
              </div>
              <div class="company-info">
                <h1>${companySettings?.nameArabic || ''}</h1>
                <p>${companySettings?.address || 'نظام المحاسبة الحديثة'}</p>
              </div>
            </div>
            
            <div class="content">
              <div class="quote-reference">
                <strong>مرجع عرض السعر: ${originalQuote.quoteNumber}</strong>
              </div>

              <div class="invoice-meta">
                <div class="meta-box">
                  <div class="meta-title">بيانات العميل</div>
                  <div class="meta-value"><strong>الاسم:</strong> ${client?.name || 'عميل نقدي'}</div>
                  <div class="meta-value"><strong>الهاتف:</strong> ${client?.phone || 'غير محدد'}</div>
                  <div class="meta-value"><strong>العنوان:</strong> ${client?.address || 'غير محدد'}</div>
                </div>
                <div class="meta-box">
                  <div class="meta-title">بيانات الفاتورة</div>
                  <div class="meta-value"><strong>رقم الفاتورة:</strong> #${sale.id}</div>
                  <div class="meta-value"><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleDateString('en-GB')}</div>
                  <div class="meta-value"><strong>الوقت:</strong> ${new Date(sale.date).toLocaleTimeString('en-US')}</div>
                </div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>م</th>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.productName}</td>
                      <td>${item.quantity}</td>
                      <td>${parseFloat(item.price).toLocaleString('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}</td>
                      <td>${parseFloat(item.total).toLocaleString('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals-section">
                <div class="total-row subtotal">
                  <span>المجموع قبل الضريبة:</span>
                  <span>${(subtotal / 1.15).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>${((subtotal / 1.15) * 0.15).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
                <div class="total-row final-total">
                  <span>المجموع النهائي:</span>
                  <span>${subtotal.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              
              <p>شكراً لتعاملكم معنا</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateSimpleQuoteHTML = (quote: any, client: any, items: any[], user: any) => {
    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    const formatTime = (date: string | Date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const subtotal = (items && Array.isArray(items)) ? items.reduce((sum: number, item: any) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.unitPrice || 0);
      return sum + (quantity * price);
    }, 0) : 0;

    const taxRate = 0.15;
    const taxAmount = subtotal * taxRate;
    const finalTotal = subtotal + taxAmount;
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>عرض سعر - ${quote.quoteNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; direction: rtl; background: white; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
            .header { text-center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .header h2 { color: #16a34a; font-size: 20px; margin-top: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .info-box { border: 1px solid #000; padding: 10px; }
            .info-box h3 { font-size: 14px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
            .info-row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #000; color: white; padding: 8px; text-align: center; font-size: 13px; }
            td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
            .totals { max-width: 350px; margin-left: auto; border: 1px solid #000; padding: 10px; margin-top: 20px; }
            .totals h3 { font-size: 14px; text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px; }
            .total-final { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            .terms { border: 1px solid #000; padding: 10px; margin: 20px 0; }
            .terms h4 { font-size: 13px; margin-bottom: 5px; }
            .terms ul { list-style: none; font-size: 11px; }
            .terms li { margin: 3px 0; }
            .footer { text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 20px; font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>عرض سعر</h2>
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <h3>بيانات العميل</h3>
                <div class="info-row"><span>اسم العميل:</span><span>${client?.name || 'عميل نقدي'}</span></div>
                <div class="info-row"><span>الهاتف:</span><span>${client?.phone || '-'}</span></div>
              </div>
              
              <div class="info-box">
                <h3>معلومات عرض السعر</h3>
                <div class="info-row"><span>رقم العرض:</span><span>${quote.quoteNumber}</span></div>
                <div class="info-row"><span>التاريخ:</span><span>${formatDate(quote.validUntil || new Date())}</span></div>
                <div class="info-row"><span>الوقت:</span><span>${formatTime(new Date())}</span></div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم الصنف</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any, index: number) => {
                  const quantity = Number(item.quantity || 0);
                  const price = Number(item.price || item.unitPrice || 0);
                  const itemTotal = quantity * price;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.productName || item.name}</td>
                      <td>${quantity}</td>
                      <td>${price.toFixed(2)} ر.س</td>
                      <td>${itemTotal.toFixed(2)} ر.س</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="totals">
              <h3>ملخص المبلغ</h3>
              <div class="total-row"><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)} ر.س</span></div>
              <div class="total-row"><span>ضريبة القيمة المضافة (15%):</span><span>${taxAmount.toFixed(2)} ر.س</span></div>
              <div class="total-row total-final"><span>المجموع الكلي:</span><span>${finalTotal.toFixed(2)} ر.س</span></div>
            </div>

            <div class="terms">
              <h4>شروط وأحكام:</h4>
              <ul>
                <li>• جميع المبالغ شاملة ضريبة القيمة المضافة</li>
                <li>• عرض السعر صالح لمدة 30 يوماً من تاريخ الإصدار</li>
                <li>• الأسعار قابلة للتغيير بدون إشعار مسبق</li>
              </ul>
            </div>

            <div class="footer">
              <p>تم إنشاء هذا المستند تلقائياً في ${formatDate(new Date())} الساعة ${formatTime(new Date())}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      accepted: { label: 'مقبول', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
      expired: { label: 'منتهي الصلاحية', variant: 'outline' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  // حساب الـ pagination
  const quotesArray = Array.isArray(quotes) ? quotes : [];
  const totalPages = Math.ceil(quotesArray.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = quotesArray.slice(startIndex, endIndex);

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">عروض الأسعار</h2>
              <p className="text-gray-600">إنشاء وإدارة عروض الأسعار للعملاء</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة عرض سعر
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">عروض جديدة</p>
                <p className="text-2xl font-bold text-blue-700">{quoteStats.newQuotes}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">عروض مقبولة</p>
                <p className="text-2xl font-bold text-green-700">{quoteStats.acceptedQuotes}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">عروض معلقة</p>
                <p className="text-2xl font-bold text-yellow-700">{quoteStats.pendingQuotes}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">قيمة العروض</p>
                <p className="text-2xl font-bold text-purple-700">
                  {quoteStats.totalValue.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'SAR',
                    minimumFractionDigits: 2 
                  })}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة عروض الأسعار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">رقم العرض</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">صالح حتى</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد عروض أسعار حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  currentQuotes.map((quote: any) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">Q#{quote.id}</TableCell>
                      <TableCell>{new Date(quote.createdAt).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        {quote.clientId ? 
                          (Array.isArray(clientsData) ? 
                            clientsData.find((c: any) => c.id === quote.clientId)?.name || 'عميل غير محدد'
                            : 'عميل غير محدد'
                          ) : 'بدون عميل'
                        }
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {parseFloat(quote.total).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR',
                          minimumFractionDigits: 2 
                        })}
                      </TableCell>
                      <TableCell>{new Date(quote.validUntil).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          quote.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : quote.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {quote.status === 'accepted' ? 'مقبول' : 
                           quote.status === 'pending' ? 'معلق' : 'مرفوض'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(quote)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="تعديل عرض السعر"
                            data-testid="button-edit-quote"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateInvoice(quote)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="ترحيل إلى فاتورة مبيعات"
                            data-testid="button-convert-to-invoice"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePrintQuote(quote)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="طباعة عرض السعر"
                            data-testid="button-print-quote"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(quote.id)}
                            disabled={deleteQuoteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="حذف العرض"
                            data-testid="button-delete-quote"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {quotesArray.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1} إلى {Math.min(endIndex, quotesArray.length)} من {quotesArray.length} إدخالات
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageState(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-sm"
                  data-testid="button-previous-page"
                >
                  السابق
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPageState(page)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageState(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="text-sm"
                  data-testid="button-next-page"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Form */}
      <QuoteFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingQuote={editingQuote}
        onSuccess={() => {
          setEditingQuote(null);
          setShowForm(false);
        }}
      />
    </div>
  );
}