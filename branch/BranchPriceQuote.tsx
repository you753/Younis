import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Calculator, DollarSign, TrendingUp, Search, Plus, Eye, Download, Printer, Calendar, User, Package, Edit, Trash2, Receipt, X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchPriceQuoteProps {
  branchId?: number;
}

export default function BranchPriceQuote({ branchId }: BranchPriceQuoteProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});
  
  // New quote form state
  const [newQuote, setNewQuote] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '', quantity: 1, price: 0 }],
    validityDays: 30,
    notes: '',
    priority: 'medium'
  });

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch quotes data
  const { data: quotes = [] } = useQuery<any[]>({
    queryKey: ['/api/quotes'],
    refetchInterval: 3000
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
    refetchInterval: 2000
  });

  // Fetch products
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
    refetchInterval: 2000
  });

  // Simple number formatting
  const formatNumber = (num: number | string) => {
    if (!num) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return Math.round(number).toString();
  };

  // Add quote mutation
  const addQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      if (!response.ok) throw new Error('Failed to create quote');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'تم إنشاء عرض السعر بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setShowAddDialog(false);
      setNewQuote({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ productId: '', quantity: 1, price: 0 }],
        validityDays: 30,
        notes: '',
        priority: 'medium'
      });
    },
    onError: () => {
      toast({ title: 'خطأ في إنشاء عرض السعر', variant: 'destructive' });
    }
  });

  // Convert quote to invoice mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const invoiceData = {
        clientId: quoteData.clientId,
        items: quoteData.items,
        total: quoteData.total,
        vat: Math.round(quoteData.total * 0.15),
        grandTotal: quoteData.total + Math.round(quoteData.total * 0.15),
        notes: `تم التحويل من عرض السعر ${quoteData.quoteNumber}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString(),
        status: 'unpaid',
        paymentMethod: 'credit'
      };
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (!response.ok) throw new Error('Failed to convert to invoice');
      
      // Delete the quote after converting to invoice
      await fetch(`/api/quotes/${quoteData.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'تم تحويل عرض السعر إلى فاتورة مبيعات بنجاح', 
        description: `تم حذف عرض السعر وإنشاء فاتورة مبيعات رقم ${data.invoiceNumber}` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
    },
    onError: () => {
      toast({ title: 'خطأ في تحويل عرض السعر', variant: 'destructive' });
    }
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete quote');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'تم حذف عرض السعر بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف عرض السعر', variant: 'destructive' });
    }
  });

  // Helper functions
  const getClientName = (clientId: string | number) => {
    const client = clients.find((c: any) => c.id.toString() === clientId.toString());
    return client?.name || `عميل رقم ${clientId}`;
  };

  const addItemToQuote = () => {
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItemFromQuote = (index: number) => {
    if (newQuote.items.length > 1) {
      setNewQuote({
        ...newQuote,
        items: newQuote.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateQuoteItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill price when product is selected
    if (field === 'productId' && value) {
      const product = products.find((p: any) => p.id.toString() === value.toString());
      if (product) {
        updatedItems[index].price = parseFloat(product.salePrice || product.price) || 0;
      }
    }
    
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const calculateQuoteTotal = () => {
    return newQuote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    if (!Array.isArray(quotes)) return [];
    
    let filtered = quotes;
    
    if (searchTerm) {
      filtered = filtered.filter((quote: any) => 
        quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(quote.clientId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter((quote: any) => quote.status === filterStatus);
    }
    
    return filtered;
  }, [quotes, searchTerm, filterStatus, clients]);

  // Calculate statistics
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter((q: any) => q.status === 'pending').length;
  const approvedQuotes = quotes.filter((q: any) => q.status === 'approved').length;
  const convertedQuotes = quotes.filter((q: any) => q.status === 'converted').length;
  const totalValue = quotes.reduce((sum: number, q: any) => sum + (q.total || 0), 0);

  // Use actual quotes or fallback to mock data if no quotes exist
  const displayQuotes = filteredQuotes.length > 0 ? filteredQuotes : (quotes.length === 0 ? [
    {
      id: 1,
      quoteNumber: 'QT-2025-001',
      clientId: 1,
      total: 53475,
      vat: 8021,
      grandTotal: 61496,
      status: 'pending',
      validityDays: 30,
      createdAt: '2025-07-21',
      expiryDate: '2025-08-20',
      notes: 'عرض خاص للعميل الجديد',
      priority: 'high',
      items: [
        { productId: 1, quantity: 10, price: 4500 },
        { productId: 2, quantity: 5, price: 1200 }
      ]
    }
  ] : []);

  // Status badges
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'موافق عليه', color: 'bg-green-100 text-green-800' },
      'converted': { label: 'تم التحويل', color: 'bg-blue-100 text-blue-800' },
      'rejected': { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
      'expired': { label: 'منتهي الصلاحية', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap['pending'];
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  // Priority badges
  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'high': { label: 'عالية', color: 'bg-red-100 text-red-800' },
      'medium': { label: 'متوسطة', color: 'bg-orange-100 text-orange-800' },
      'low': { label: 'منخفضة', color: 'bg-green-100 text-green-800' }
    };
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap['medium'];
    return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>;
  };

  // Handle quote submission
  const handleSubmitQuote = async () => {
    if (!newQuote.clientId || newQuote.items.length === 0 || newQuote.items.some(item => !item.productId)) {
      toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    const total = calculateQuoteTotal();
    const vat = Math.round(total * 0.15);
    const grandTotal = total + vat;

    const quoteData = {
      clientId: parseInt(newQuote.clientId),
      items: newQuote.items.map(item => ({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        price: item.price
      })),
      total,
      vat,
      grandTotal,
      date: newQuote.date,
      validityDays: newQuote.validityDays,
      notes: newQuote.notes,
      priority: newQuote.priority,
      status: 'pending',
      quoteNumber: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + newQuote.validityDays * 24 * 60 * 60 * 1000).toISOString()
    };

    addQuoteMutation.mutate(quoteData);
  };

  // Print quote function
  const printQuote = (quote: any) => {
    // جلب اسم الفرع الحالي من البيانات المحملة
    const currentBranchName = branch?.name || '';
    
    const clientName = getClientName(quote.clientId);
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عرض سعر - ${quote.quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table th, .info-table td { border: 1px solid #000; padding: 8px; text-align: right; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: center; }
          .total-section { text-align: left; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${currentBranchName ? `<h2 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">${currentBranchName}</h2>` : ''}
          <h3 style="margin: 0; font-size: 22px;">عرض سعر</h3>
          
          <p>رقم العرض: ${quote.quoteNumber}</p>
        </div>
        
        <table class="info-table">
          <tr>
            <th>العميل</th>
            <td>${clientName}</td>
            <th>تاريخ العرض</th>
            <td>${quote.date ? new Date(quote.date).toLocaleDateString('en-GB') : new Date(quote.createdAt).toLocaleDateString('en-GB')}</td>
          </tr>
          <tr>
            <th>صالح حتى</th>
            <td>${new Date(quote.expiryDate).toLocaleDateString('en-GB')}</td>
            <th>مدة السريان</th>
            <td>${quote.validityDays} يوم</td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items?.map((item: any) => {
              const product = products.find((p: any) => p.id === item.productId);
              return `
                <tr>
                  <td>${product?.name || 'منتج غير محدد'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatNumber(item.price)} ريال</td>
                  <td>${formatNumber(item.quantity * item.price)} ريال</td>
                </tr>
              `;
            }).join('') || ''}
          </tbody>
        </table>

        <div class="total-section">
          <p>المجموع الفرعي: ${formatNumber(quote.total)} ريال</p>
          <p>ضريبة القيمة المضافة (15%): ${formatNumber(quote.vat)} ريال</p>
          <p><strong>الإجمالي النهائي: ${formatNumber(quote.grandTotal)} ريال</strong></p>
        </div>

        ${quote.notes ? `<div style="margin-top: 20px;"><strong>ملاحظات:</strong> ${quote.notes}</div>` : ''}
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العروض</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuotes}</p>
                <p className="text-xs text-green-600">عرض نشط</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingQuotes}</p>
                <p className="text-xs text-yellow-600">عرض معلق</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">موافق عليها</p>
                <p className="text-2xl font-bold text-blue-600">{approvedQuotes}</p>
                <p className="text-xs text-blue-600">عرض مقبول</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(totalValue)}</p>
                <p className="text-xs text-green-600">ريال سعودي</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في عروض الأسعار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="تصفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">موافق عليه</SelectItem>
              <SelectItem value="converted">تم التحويل</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="expired">منتهي الصلاحية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            عرض سعر جديد
          </Button>
        </div>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">عروض الأسعار</CardTitle>
            <div className="text-sm text-gray-600">
              عرض {displayQuotes.length} عرض
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right p-4 font-semibold text-gray-700">رقم العرض</th>
                  <th className="text-right p-4 font-semibold text-gray-700">العميل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">قيمة العرض</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الأصناف</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التواريخ</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {displayQuotes.map((quote: any, index: number) => (
                  <tr key={quote.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div className="font-medium text-purple-600">{quote.quoteNumber}</div>
                      <div className="text-xs text-gray-500">
                        {quote.date ? new Date(quote.date).toLocaleDateString('en-GB') : new Date(quote.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{getClientName(quote.clientId)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg text-green-600">
                        {formatNumber(quote.grandTotal || quote.total)} ريال
                      </div>
                      <div className="text-xs text-gray-500">
                        قبل الضريبة: {formatNumber(quote.total)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <Package className="h-3 w-3 inline ml-1" />
                        {quote.items?.length || 0} عنصر
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div>
                          <Calendar className="h-3 w-3 inline ml-1" />
                          تاريخ: {quote.date ? new Date(quote.date).toLocaleDateString('en-GB') : new Date(quote.createdAt).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-xs text-gray-500">
                          انتهاء: {new Date(quote.expiryDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="عرض التفاصيل"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors" 
                          title="تعديل عرض السعر"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-green-600" 
                          title="طباعة العرض"
                          onClick={() => printQuote(quote)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-blue-600" 
                          title="تحويل إلى فاتورة"
                          onClick={() => convertToInvoiceMutation.mutate(quote)}
                          disabled={quote.status === 'converted'}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-red-600" 
                          title="حذف العرض"
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
                              deleteQuoteMutation.mutate(quote.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayQuotes.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض أسعار</h3>
              <p className="text-gray-500 mb-4">ابدأ بإنشاء عرض سعر جديد</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء عرض سعر جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Quote Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إنشاء عرض سعر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">العميل</Label>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !newQuote.clientId && "text-muted-foreground"
                      )}
                      data-testid="client-search-button"
                    >
                      {newQuote.clientId
                        ? clients.find((c: any) => c.id.toString() === newQuote.clientId.toString())?.name || "اختر العميل"
                        : "اختر العميل"}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث عن عميل..." />
                      <CommandList>
                        <CommandEmpty>لا توجد نتائج</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client: any) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => {
                                setNewQuote({...newQuote, clientId: client.id.toString()});
                                setClientSearchOpen(false);
                              }}
                              data-testid={`client-option-${client.id}`}
                            >
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  client.id.toString() === newQuote.clientId.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="quote-date">التاريخ</Label>
                <Input 
                  type="date" 
                  id="quote-date"
                  value={newQuote.date}
                  onChange={(e) => setNewQuote({...newQuote, date: e.target.value})}
                  data-testid="quote-date-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="validityDays">مدة السريان (أيام)</Label>
                <Input 
                  type="number" 
                  value={newQuote.validityDays}
                  onChange={(e) => setNewQuote({...newQuote, validityDays: parseInt(e.target.value) || 30})}
                />
              </div>
            </div>

            <div>
              <Label>الأصناف</Label>
              <div className="space-y-2">
                {newQuote.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <Label>الصنف</Label>
                      <Popover 
                        open={productSearchOpen[index]} 
                        onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, [index]: open})}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !item.productId && "text-muted-foreground"
                            )}
                            data-testid={`product-search-button-${index}`}
                          >
                            {item.productId
                              ? products.find((p: any) => p.id.toString() === item.productId.toString())?.name || "اختر صنف"
                              : "اختر صنف"}
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="ابحث عن منتج..." />
                            <CommandList>
                              <CommandEmpty>لا توجد نتائج</CommandEmpty>
                              <CommandGroup>
                                {products.map((product: any) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => {
                                      updateQuoteItem(index, 'productId', product.id.toString());
                                      setProductSearchOpen({...productSearchOpen, [index]: false});
                                    }}
                                    data-testid={`product-option-${product.id}`}
                                  >
                                    <Check
                                      className={cn(
                                        "ml-2 h-4 w-4",
                                        product.id.toString() === item.productId.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {product.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>الكمية</Label>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>السعر</Label>
                      <Input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => updateQuoteItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>الإجمالي</Label>
                      <Input value={formatNumber(item.quantity * item.price)} disabled />
                    </div>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItemFromQuote(index)}
                        disabled={newQuote.items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addItemToQuote}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة صنف
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={newQuote.priority} onValueChange={(value) => setNewQuote({...newQuote, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الإجمالي</Label>
                <Input value={`${formatNumber(calculateQuoteTotal())} ريال`} disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Input 
                value={newQuote.notes}
                onChange={(e) => setNewQuote({...newQuote, notes: e.target.value})}
                placeholder="ملاحظات إضافية..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSubmitQuote} disabled={addQuoteMutation.isPending}>
                {addQuoteMutation.isPending ? 'جاري الحفظ...' : 'حفظ العرض'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Quote Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تفاصيل عرض السعر - {selectedQuote?.quoteNumber}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>العميل</Label>
                  <div className="font-medium">{getClientName(selectedQuote.clientId)}</div>
                </div>
                <div>
                  <Label>تاريخ الإنشاء</Label>
                  <div>{new Date(selectedQuote.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div>
                  <Label>تاريخ الانتهاء</Label>
                  <div>{new Date(selectedQuote.expiryDate).toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              <div>
                <Label>الأصناف</Label>
                <div className="border rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2">الصنف</th>
                        <th className="text-center p-2">الكمية</th>
                        <th className="text-center p-2">السعر</th>
                        <th className="text-center p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items?.map((item: any, index: number) => {
                        const product = products.find((p: any) => p.id === item.productId);
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">{product?.name || 'منتج غير محدد'}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-center p-2">{formatNumber(item.price)} ريال</td>
                            <td className="text-center p-2">{formatNumber(item.quantity * item.price)} ريال</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-4 text-left">
                    <div>المجموع الفرعي: {formatNumber(selectedQuote.total)} ريال</div>
                    <div>ضريبة القيمة المضافة (15%): {formatNumber(selectedQuote.vat)} ريال</div>
                    <div className="font-bold text-lg">الإجمالي النهائي: {formatNumber(selectedQuote.grandTotal)} ريال</div>
                  </div>
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <div className="bg-gray-50 p-3 rounded">{selectedQuote.notes}</div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => printQuote(selectedQuote)}>
                  طباعة العرض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Quote Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تعديل عرض السعر - {selectedQuote?.quoteNumber}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العميل</Label>
                  <Select 
                    value={selectedQuote.clientId?.toString()} 
                    onValueChange={(value) => setSelectedQuote({...selectedQuote, clientId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>مدة الصلاحية (بالأيام)</Label>
                  <Input 
                    type="number" 
                    value={selectedQuote.validityDays || 30}
                    onChange={(e) => setSelectedQuote({...selectedQuote, validityDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>الأصناف</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedQuote.items?.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-5 gap-2 p-3 border rounded">
                      <Select 
                        value={item.productId?.toString()} 
                        onValueChange={(value) => {
                          const newItems = [...selectedQuote.items];
                          newItems[index].productId = parseInt(value);
                          const product = products.find((p: any) => p.id.toString() === value);
                          if (product) {
                            newItems[index].price = parseFloat(product.salePrice || product.price) || 0;
                          }
                          setSelectedQuote({...selectedQuote, items: newItems});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        type="number" 
                        placeholder="الكمية" 
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...selectedQuote.items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setSelectedQuote({...selectedQuote, items: newItems});
                        }}
                      />
                      <Input 
                        type="number" 
                        placeholder="السعر" 
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...selectedQuote.items];
                          newItems[index].price = parseFloat(e.target.value) || 0;
                          setSelectedQuote({...selectedQuote, items: newItems});
                        }}
                      />
                      <Input 
                        value={formatNumber(item.quantity * item.price)} 
                        disabled 
                        placeholder="الإجمالي"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (selectedQuote.items.length > 1) {
                            const newItems = selectedQuote.items.filter((_: any, i: number) => i !== index);
                            setSelectedQuote({...selectedQuote, items: newItems});
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newItems = [...(selectedQuote.items || []), { productId: '', quantity: 1, price: 0 }];
                    setSelectedQuote({...selectedQuote, items: newItems});
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة صنف
                </Button>
              </div>

              <div>
                <Label>الإجمالي</Label>
                <Input 
                  value={`${formatNumber(selectedQuote.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0)} ريال`} 
                  disabled 
                />
              </div>

              <div>
                <Label>الملاحظات</Label>
                <Input 
                  value={selectedQuote.notes || ''}
                  onChange={(e) => setSelectedQuote({...selectedQuote, notes: e.target.value})}
                  placeholder="أدخل الملاحظات"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const total = selectedQuote.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
                      const vat = Math.round(total * 0.15);
                      const grandTotal = total + vat;

                      const updatedQuote = {
                        ...selectedQuote,
                        total,
                        vat,
                        grandTotal,
                        expiryDate: new Date(Date.now() + selectedQuote.validityDays * 24 * 60 * 60 * 1000).toISOString()
                      };

                      const response = await fetch(`/api/quotes/${selectedQuote.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedQuote)
                      });
                      
                      if (response.ok) {
                        toast({ title: 'تم تحديث عرض السعر بنجاح' });
                        queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
                        setShowEditDialog(false);
                      } else {
                        throw new Error('Failed to update quote');
                      }
                    } catch (error) {
                      toast({ title: 'خطأ في تحديث عرض السعر', variant: 'destructive' });
                    }
                  }}
                >
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
