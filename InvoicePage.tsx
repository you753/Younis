import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Eye, Edit, Save, FileText, Calculator, Calendar, User, Package, Trash2, Copy, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface InvoiceItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

interface Invoice {
  id?: number;
  invoiceNumber: string;
  clientId: number;
  clientName?: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface Template {
  id: number;
  name: string;
  type: string;
  html_content: string;
  css_styles: string;
  settings: any;
}

export default function InvoicePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: `INV-${Date.now()}`,
    clientId: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    taxRate: 15,
    taxAmount: 0,
    discount: 0,
    total: 0,
    status: 'draft'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(true);

  // Fetch data
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: editMode
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    enabled: editMode
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates/invoice'],
    enabled: true
  });

  // Calculate totals
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal - invoice.discount) * (invoice.taxRate / 100);
    const total = subtotal - invoice.discount + taxAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [invoice.items, invoice.discount, invoice.taxRate]);

  // Add item to invoice
  const addItem = () => {
    const newItem: InvoiceItem = {
      productId: 0,
      productName: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Auto-calculate total
      if (field === 'quantity' || field === 'price') {
        newItems[index].total = newItems[index].quantity * newItems[index].price;
      }

      // Auto-fill product details
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          newItems[index].productName = product.name;
          newItems[index].price = product.price;
          newItems[index].total = newItems[index].quantity * product.price;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: Invoice) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      if (!response.ok) throw new Error('فشل في حفظ الفاتورة');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حفظ الفاتورة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setEditMode(false);
    },
    onError: () => {
      toast({ title: "خطأ في حفظ الفاتورة", variant: "destructive" });
    }
  });

  // Generate invoice HTML with template
  const generateInvoiceHTML = (template: Template) => {
    const client = clients.find(c => c.id === invoice.clientId);
    
    let html = template.html_content;
    
    // Replace placeholders
    html = html.replace(/\{\{companyName\}\}/g, '');
    html = html.replace(/\{\{companyAddress\}\}/g, 'المملكة العربية السعودية');
    html = html.replace(/\{\{companyPhone\}\}/g, '+966 50 123 4567');
    html = html.replace(/\{\{companyEmail\}\}/g, 'info@almohasebalazeem.com');
    html = html.replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber);
    html = html.replace(/\{\{invoiceDate\}\}/g, format(new Date(invoice.date), 'dd/MM/yyyy', { locale: ar }));
    html = html.replace(/\{\{customerName\}\}/g, client?.name || '');
    html = html.replace(/\{\{customerPhone\}\}/g, client?.phone || '');
    html = html.replace(/\{\{grandTotal\}\}/g, invoice.total.toFixed(2));

    // Replace items table
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)} ر.س</td>
        <td>${item.total.toFixed(2)} ر.س</td>
      </tr>
    `).join('');
    
    html = html.replace(/{{#items}}[\s\S]*?{{\/items}}/g, itemsHtml);

    return html;
  };

  // Print invoice using unified template
  const printInvoice = async () => {
    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const client = clients.find(c => c.id === invoice.clientId);
    
    const summaryData = [
      {
        label: 'المجموع الفرعي',
        value: `${invoice.subtotal.toFixed(2)} ر.س`,
        color: '#007acc'
      },
      {
        label: 'الضريبة',
        value: `${invoice.taxAmount.toFixed(2)} ر.س`,
        color: '#6f42c1'
      },
      {
        label: 'الخصم',
        value: `${invoice.discount.toFixed(2)} ر.س`,
        color: '#dc3545'
      },
      {
        label: 'الإجمالي',
        value: `${invoice.total.toFixed(2)} ر.س`,
        color: '#28a745'
      }
    ];

    const itemsTable = `
      <div style="margin: 20px 0;">
        <h3 style="color: #007acc; margin-bottom: 15px;">تفاصيل الأصناف</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #007acc; color: white;">
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">المنتج</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">الكمية</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">السعر</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.price.toFixed(2)} ر.س</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.total.toFixed(2)} ر.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const htmlContent = generateUnifiedInvoice({
      title: 'فاتورة مبيعات',
      invoiceNumber: invoice.invoiceNumber,
      entityName: client?.name || 'عميل غير محدد',
      entityDetails: {
        id: client?.id || 0,
        phone: client?.phone,
        email: client?.email,
        type: 'فاتورة مبيعات',
        status: invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'مسودة'
      },
      summaryData,
      additionalContent: itemsTable
    });

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Export as PDF
  const exportToPDF = async () => {
    if (!selectedTemplate) {
      toast({ title: "يرجى اختيار قالب أولاً", variant: "destructive" });
      return;
    }

    const previewElement = document.getElementById('invoice-preview');
    if (previewElement) {
      const canvas = await html2canvas(previewElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`فاتورة-${invoice.invoiceNumber}.pdf`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">صفحة الفاتورة</h1>
          <p className="text-muted-foreground mt-1">إنشاء وتعديل الفواتير</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            {editMode ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editMode ? 'حفظ' : 'تعديل'}
          </Button>
          
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                معاينة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>معاينة الفاتورة</DialogTitle>
              </DialogHeader>
              
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={printInvoice} size="sm" className="gap-2">
                      <Printer className="h-4 w-4" />
                      طباعة
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      تصدير PDF
                    </Button>
                  </div>
                  
                  <div 
                    id="invoice-preview"
                    className="border rounded-lg p-4 bg-white"
                    dangerouslySetInnerHTML={{ 
                      __html: generateInvoiceHTML(selectedTemplate) 
                    }}
                    style={{ direction: 'rtl' }}
                  />
                  
                  <style dangerouslySetInnerHTML={{ __html: selectedTemplate.css_styles }} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                معلومات الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label htmlFor="client">العميل</Label>
                  <Select
                    value={invoice.clientId.toString()}
                    onValueChange={(value) => setInvoice(prev => ({ ...prev, clientId: parseInt(value) }))}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">تاريخ الفاتورة</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  عناصر الفاتورة
                </CardTitle>
                {editMode && (
                  <Button onClick={addItem} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة عنصر
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>المنتج</Label>
                      {editMode ? (
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(value) => updateItem(index, 'productId', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={item.productName} disabled />
                      )}
                    </div>
                    
                    <div>
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div>
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div>
                      <Label>المجموع</Label>
                      <Input value={item.total.toFixed(2)} disabled />
                    </div>
                    
                    {editMode && (
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {invoice.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد عناصر في الفاتورة</p>
                    {editMode && (
                      <Button onClick={addItem} variant="outline" className="mt-2 gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة عنصر
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="ملاحظات إضافية..."
                value={invoice.notes || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                disabled={!editMode}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                ملخص الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subtotal.toFixed(2)} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>الخصم:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={invoice.discount}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    disabled={!editMode}
                    className="w-20 text-right"
                  />
                  <span className="text-sm">ر.س</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>الضريبة ({invoice.taxRate}%):</span>
                <span>{invoice.taxAmount.toFixed(2)} ر.س</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>المجموع النهائي:</span>
                <span>{invoice.total.toFixed(2)} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>معدل الضريبة:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    disabled={!editMode}
                    className="w-16 text-right"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختيار القالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedTemplate?.id.toString() || ''}
                onValueChange={(value) => {
                  const template = templates.find(t => t.id.toString() === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر قالب الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    قالب {selectedTemplate.type}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة الفاتورة</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={invoice.status}
                onValueChange={(value: any) => setInvoice(prev => ({ ...prev, status: value }))}
                disabled={!editMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="sent">مرسلة</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-3">
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'sent' ? 'secondary' :
                  invoice.status === 'overdue' ? 'destructive' : 'outline'
                }>
                  {invoice.status === 'draft' && 'مسودة'}
                  {invoice.status === 'sent' && 'مرسلة'}
                  {invoice.status === 'paid' && 'مدفوعة'}
                  {invoice.status === 'overdue' && 'متأخرة'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {editMode && (
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => saveInvoiceMutation.mutate(invoice)}
                  disabled={saveInvoiceMutation.isPending || !invoice.clientId || invoice.items.length === 0}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveInvoiceMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الفاتورة'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setInvoice({
                    ...invoice,
                    invoiceNumber: `INV-${Date.now()}`,
                    items: []
                  })}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  نسخ كفاتورة جديدة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}