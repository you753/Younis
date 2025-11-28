import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Package, Plus, Eye, Printer, Edit, Trash2, Search, FileText, TrendingUp, Calendar, X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchGoodsIssueProps {
  branchId?: number;
}

export default function BranchGoodsIssue({ branchId }: BranchGoodsIssueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  
  // Search states for comboboxes
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});
  const [invoiceSearchOpen, setInvoiceSearchOpen] = useState(false);
  
  // Selected invoice state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  
  // New voucher form state
  const [newVoucher, setNewVoucher] = useState({
    clientId: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    requestedBy: '',
    approvedBy: ''
  });

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch goods issue vouchers from API (خاص بهذا الفرع فقط)
  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery<any[]>({
    queryKey: branchId ? [`/api/goods-issue-vouchers?branchId=${branchId}`] : ['/api/goods-issue-vouchers'],
    refetchInterval: 2000
  });

  // Fetch clients (خاص بهذا الفرع فقط)
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/clients?branchId=${branchId}`] : ['/api/clients'],
    refetchInterval: 2000
  });

  // Fetch products (خاص بهذا الفرع فقط)
  const { data: products = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/products?branchId=${branchId}`] : ['/api/products'],
    refetchInterval: 2000
  });

  // Fetch sales invoices (خاص بهذا الفرع فقط)
  const { data: salesInvoices = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/sales?branchId=${branchId}`] : ['/api/sales'],
    refetchInterval: 2000
  });

  // Simple number formatting
  const formatNumber = (num: number | string) => {
    if (!num) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return Math.round(number).toString();
  };

  // Add goods issue voucher mutation
  const addVoucherMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      const response = await fetch('/api/goods-issue-vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
      });
      
      if (!response.ok) {
        throw new Error('فشل في إنشاء السند');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/goods-issue-vouchers?branchId=${branchId}`] : ['/api/goods-issue-vouchers'] });
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/products?branchId=${branchId}`] : ['/api/products'] });
      toast({ title: 'تم إنشاء سند إخراج البضاعة بنجاح' });
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'خطأ في إنشاء سند إخراج البضاعة', variant: 'destructive' });
    }
  });

  // Delete voucher mutation
  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: number) => {
      const response = await fetch(`/api/goods-issue-vouchers/${voucherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف السند');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/goods-issue-vouchers?branchId=${branchId}`] : ['/api/goods-issue-vouchers'] });
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/products?branchId=${branchId}`] : ['/api/products'] });
      toast({ title: 'تم حذف سند إخراج البضاعة بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف سند إخراج البضاعة', variant: 'destructive' });
    }
  });

  // Edit voucher mutation
  const editVoucherMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      const response = await fetch(`/api/goods-issue-vouchers/${voucherData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });
      
      if (!response.ok) {
        throw new Error('فشل في تعديل السند');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/goods-issue-vouchers?branchId=${branchId}`] : ['/api/goods-issue-vouchers'] });
      queryClient.invalidateQueries({ queryKey: branchId ? [`/api/products?branchId=${branchId}`] : ['/api/products'] });
      toast({ title: 'تم تعديل سند إخراج البضاعة بنجاح' });
      setShowEditDialog(false);
      setEditingVoucher(null);
    },
    onError: () => {
      toast({ title: 'خطأ في تعديل سند إخراج البضاعة', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setNewVoucher({
      clientId: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      notes: '',
      requestedBy: '',
      approvedBy: ''
    });
    setSelectedInvoiceId('');
  };

  // Function to auto-populate from selected invoice
  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    
    const selectedInvoice = salesInvoices.find((inv: any) => inv.id.toString() === invoiceId);
    if (selectedInvoice) {
      // Set client
      setNewVoucher(prev => ({
        ...prev,
        clientId: selectedInvoice.clientId?.toString() || '',
        items: selectedInvoice.items?.map((item: any) => ({
          productId: item.productId?.toString() || '',
          quantity: item.quantity || 1,
          unitPrice: parseFloat(item.unitPrice || item.price || '0')
        })) || [{ productId: '', quantity: 1, unitPrice: 0 }]
      }));
      
      toast({ 
        title: '✅ تم تحميل بيانات الفاتورة', 
        description: `تم تحميل ${selectedInvoice.items?.length || 0} منتج من الفاتورة` 
      });
    }
  };

  const addItem = () => {
    setNewVoucher(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setNewVoucher(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setNewVoucher(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = () => {
    if (!newVoucher.clientId) {
      toast({ title: 'يرجى اختيار العميل', variant: 'destructive' });
      return;
    }

    const total = newVoucher.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );

    const voucherData = {
      clientId: parseInt(newVoucher.clientId),
      voucherNumber: `GI-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      issuedBy: newVoucher.requestedBy || 'موظف الفرع',
      totalQuantity: newVoucher.items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: total.toString(),
      status: 'completed',
      notes: newVoucher.notes,
      branchId: branchId, // إضافة رقم الفرع
      items: newVoucher.items.map(item => ({
        productId: parseInt(item.productId),
        productName: products.find(p => p.id === parseInt(item.productId))?.name || 'غير محدد',
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString()
      }))
    };

    addVoucherMutation.mutate(voucherData);
  };

  const handleDelete = (voucherId: number) => {
    if (confirm('هل أنت متأكد من حذف سند إخراج البضاعة؟')) {
      deleteVoucherMutation.mutate(voucherId);
    }
  };

  const printVoucher = (voucher: any) => {
    const printWindow = window.open('', '_blank');
    const branchName = branch?.name || (branchId ? `الفرع ${branchId}` : '');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>سند إخراج بضاعة - ${voucher.voucherNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              direction: rtl; 
              margin: 20px;
              font-size: 14px;
            }
            .header { 
              text-align: center; 
              border: 2px solid #333; 
              padding: 20px; 
              margin-bottom: 20px;
            }
            .branch-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .voucher-info { 
              display: flex; 
              justify-content: space-between; 
              margin: 20px 0;
              border: 1px solid #333;
              padding: 15px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            .items-table td, .items-table th { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: center;
            }
            .items-table th { 
              background-color: #f5f5f5;
            }
            .total { 
              text-align: left; 
              font-weight: bold; 
              font-size: 18px; 
              margin-top: 20px;
            }
            .signatures { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 50px;
            }
            .signature-box { 
              border: 1px solid #333; 
              padding: 40px 20px; 
              width: 200px; 
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${branchName ? `<div class="branch-name">${branchName}</div>` : ''}
            <div>سند إخراج بضاعة</div>
          </div>
          
          <div class="voucher-info">
            <div>
              <strong>رقم السند:</strong> ${voucher.voucherNumber}<br>
              <strong>التاريخ:</strong> ${new Date(voucher.createdAt).toLocaleDateString('en-GB')}<br>
              <strong>العميل:</strong> ${voucher.clientName || clients.find(c => c.id === voucher.clientId)?.name || 'غير محدد'}
            </div>
            <div>
              <strong>طالب الإخراج:</strong> ${voucher.issuedBy}<br>
              <strong>معتمد من:</strong> مدير المخزن
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${voucher.items?.map((item: any) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatNumber(item.unitPrice)} ريال</td>
                  <td>${formatNumber(item.quantity * parseFloat(item.unitPrice))} ريال</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total">
            الإجمالي الكلي: ${formatNumber(voucher.totalAmount)} ريال
          </div>
          
          ${voucher.notes ? `<div style="margin-top: 20px;"><strong>ملاحظات:</strong> ${voucher.notes}</div>` : ''}
          
          <div class="signatures">
            <div class="signature-box">
              توقيع المستلم<br><br>
              الاسم: _______________<br>
              التوقيع: _______________
            </div>
            <div class="signature-box">
              توقيع المسؤول<br><br>
              الاسم: _______________<br>
              التوقيع: _______________
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredVouchers = vouchers.filter((voucher: any) =>
    voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVouchers = filteredVouchers.length;
  const totalValue = filteredVouchers.reduce((sum: number, voucher: any) => 
    sum + (parseFloat(voucher.totalAmount || '0') || 0), 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سندات إخراج البضاعة</h1>
          <p className="text-gray-600">إدارة سندات إخراج البضاعة للعملاء</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي السندات</p>
                <p className="text-2xl font-bold text-gray-900">{totalVouchers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalValue)} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">سندات اليوم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vouchers.filter(v => new Date(v.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>قائمة سندات إخراج البضاعة</CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة سند جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في السندات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-3 font-medium">رقم السند</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">التاريخ</th>
                  <th className="text-right p-3 font-medium">الإجمالي</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingVouchers ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      لا توجد سندات إخراج بضاعة
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher: any) => (
                    <tr key={voucher.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{voucher.voucherNumber}</td>
                      <td className="p-3">{voucher.clientName || clients.find(c => c.id === voucher.clientId)?.name || 'غير محدد'}</td>
                      <td className="p-3">{new Date(voucher.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="p-3">{formatNumber(voucher.totalAmount)} ريال</td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {voucher.status === 'completed' ? 'مكتمل' : voucher.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setShowViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVoucher({
                                ...voucher,
                                clientId: voucher.clientId?.toString() || '',
                                items: voucher.items?.map((item: any) => ({
                                  productId: item.productId?.toString() || '',
                                  quantity: item.quantity || 1,
                                  unitPrice: item.unitPrice || 0
                                })) || [{ productId: '', quantity: 1, unitPrice: 0 }]
                              });
                              setShowEditDialog(true);
                            }}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printVoucher(voucher)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(voucher.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Voucher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة سند إخراج بضاعة جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Invoice Selection - NEW */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <Label className="text-lg font-semibold text-blue-900">اختيار من فاتورة مبيعات (اختياري)</Label>
              <p className="text-sm text-blue-700 mb-2">يمكنك اختيار فاتورة مبيعات لملء البيانات تلقائياً</p>
              <Popover open={invoiceSearchOpen} onOpenChange={setInvoiceSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={invoiceSearchOpen}
                    className="w-full justify-between bg-white"
                    data-testid="select-invoice"
                  >
                    {selectedInvoiceId
                      ? `فاتورة رقم: ${salesInvoices.find((inv: any) => inv.id.toString() === selectedInvoiceId)?.invoiceNumber || selectedInvoiceId}`
                      : "اختر فاتورة مبيعات"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن فاتورة..." />
                    <CommandList>
                      <CommandEmpty>لا توجد فواتير</CommandEmpty>
                      <CommandGroup>
                        {salesInvoices.map((invoice: any) => {
                          const client = clients.find((c: any) => c.id === invoice.clientId);
                          return (
                            <CommandItem
                              key={invoice.id}
                              value={`${invoice.invoiceNumber} ${client?.name || ''}`}
                              onSelect={() => {
                                handleInvoiceSelect(invoice.id.toString());
                                setInvoiceSearchOpen(false);
                              }}
                              data-testid={`invoice-option-${invoice.id}`}
                            >
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  selectedInvoiceId === invoice.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{invoice.invoiceNumber}</span>
                                <span className="text-sm text-gray-500">
                                  {client?.name || 'عميل غير معروف'} - {invoice.items?.length || 0} منتج - {formatNumber(invoice.totalAmount || 0)} ريال
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Client Selection */}
            <div>
              <Label>العميل</Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-client"
                  >
                    {newVoucher.clientId
                      ? clients.find((client: any) => client.id.toString() === newVoucher.clientId)?.name
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
                            value={`${client.name} ${client.phone || ''}`}
                            onSelect={() => {
                              setNewVoucher(prev => ({ ...prev, clientId: client.id.toString() }));
                              setClientSearchOpen(false);
                            }}
                            data-testid={`client-option-${client.id}`}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                newVoucher.clientId === client.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{client.name}</span>
                              {client.phone && (
                                <span className="text-sm text-gray-500">{client.phone}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Items */}
            <div>
              <Label>الأصناف</Label>
              {newVoucher.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end mt-2">
                  <div className="flex-1">
                    <Label>المنتج</Label>
                    <Popover 
                      open={productSearchOpen[index] || false} 
                      onOpenChange={(open) => setProductSearchOpen(prev => ({ ...prev, [index]: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productSearchOpen[index] || false}
                          className="w-full justify-between"
                          data-testid={`select-product-${index}`}
                        >
                          {item.productId
                            ? products.find((product: any) => product.id.toString() === item.productId)?.name
                            : "اختر المنتج"}
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
                                  value={`${product.name} ${product.salePrice || ''}`}
                                  onSelect={() => {
                                    updateItem(index, 'productId', product.id.toString());
                                    updateItem(index, 'unitPrice', parseFloat(product.salePrice || product.purchasePrice || '0'));
                                    setProductSearchOpen(prev => ({ ...prev, [index]: false }));
                                  }}
                                  data-testid={`product-option-${product.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      item.productId === product.id.toString() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    {product.salePrice && (
                                      <span className="text-sm text-gray-500">{product.salePrice} ريال</span>
                                    )}
                                  </div>
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
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <div>
                    <Label>السعر</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة صنف
              </Button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>طالب الإخراج</Label>
                <Input
                  value={newVoucher.requestedBy}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, requestedBy: e.target.value }))}
                  placeholder="اسم طالب الإخراج"
                />
              </div>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={newVoucher.notes}
                onChange={(e) => setNewVoucher(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-lg font-semibold">
                الإجمالي: {formatNumber(newVoucher.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))} ريال
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={addVoucherMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Voucher Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل سند إخراج البضاعة</DialogTitle>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم السند</Label>
                  <p className="text-lg font-semibold">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <p>{new Date(selectedVoucher.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <Label>العميل</Label>
                  <p>{selectedVoucher.clientName || clients.find(c => c.id === selectedVoucher.clientId)?.name || 'غير محدد'}</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedVoucher.status === 'completed' ? 'مكتمل' : selectedVoucher.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>الأصناف</Label>
                <div className="mt-2 space-y-2">
                  {selectedVoucher.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>{item.productName}</span>
                      <span>الكمية: {item.quantity}</span>
                      <span>السعر: {formatNumber(item.unitPrice)} ريال</span>
                      <span className="font-semibold">
                        الإجمالي: {formatNumber(item.quantity * parseFloat(item.unitPrice))} ريال
                      </span>
                    </div>
                  )) || []}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-lg font-bold">
                  الإجمالي الكلي: {formatNumber(selectedVoucher.totalAmount)} ريال
                </p>
              </div>
              
              {selectedVoucher.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedVoucher.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Voucher Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل سند إخراج البضاعة</DialogTitle>
          </DialogHeader>
          
          {editingVoucher && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العميل</Label>
                  <Select 
                    value={editingVoucher.clientId} 
                    onValueChange={(value) => setEditingVoucher({...editingVoucher, clientId: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر عميل" />
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
                  <Label>المُصدر بواسطة</Label>
                  <Input
                    value={editingVoucher.issuedBy || ''}
                    onChange={(e) => setEditingVoucher({...editingVoucher, issuedBy: e.target.value})}
                    placeholder="اسم مصدر السند"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">الأصناف</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingVoucher({
                        ...editingVoucher,
                        items: [...editingVoucher.items, { productId: '', quantity: 1, unitPrice: 0 }]
                      });
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة صنف
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingVoucher.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-xs">المنتج</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => {
                            const product = products.find((p: any) => p.id.toString() === value);
                            const updatedItems = [...editingVoucher.items];
                            updatedItems[index] = { 
                              ...updatedItems[index], 
                              productId: value,
                              unitPrice: product?.salePrice || product?.purchasePrice || 0
                            };
                            setEditingVoucher({ ...editingVoucher, items: updatedItems });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24">
                        <Label className="text-xs">الكمية</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...editingVoucher.items];
                            updatedItems[index] = { ...updatedItems[index], quantity: parseInt(e.target.value) || 0 };
                            setEditingVoucher({ ...editingVoucher, items: updatedItems });
                          }}
                          min="1"
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label className="text-xs">السعر</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updatedItems = [...editingVoucher.items];
                            updatedItems[index] = { ...updatedItems[index], unitPrice: parseFloat(e.target.value) || 0 };
                            setEditingVoucher({ ...editingVoucher, items: updatedItems });
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label className="text-xs">الإجمالي</Label>
                        <Input
                          value={formatNumber(item.quantity * item.unitPrice)}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      
                      {editingVoucher.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedItems = editingVoucher.items.filter((_: any, i: number) => i !== index);
                            setEditingVoucher({ ...editingVoucher, items: updatedItems });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={editingVoucher.notes || ''}
                  onChange={(e) => setEditingVoucher({...editingVoucher, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xl font-bold text-blue-700">
                  إجمالي قيمة السند: {formatNumber(
                    editingVoucher.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
                  )} ريال
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    const total = editingVoucher.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
                    
                    const updatedVoucher = {
                      ...editingVoucher,
                      totalAmount: total.toString(),
                      totalQuantity: editingVoucher.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
                      items: editingVoucher.items.map((item: any) => ({
                        ...item,
                        productName: products.find((p: any) => p.id.toString() === item.productId.toString())?.name || 'منتج غير محدد'
                      }))
                    };
                    
                    editVoucherMutation.mutate(updatedVoucher);
                  }}
                  disabled={editVoucherMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {editVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديل'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingVoucher(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}