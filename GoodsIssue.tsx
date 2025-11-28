import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Package, Search, Calendar, FileText, Eye, Download, Trash2, Edit, Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatAmount, cn } from '@/lib/utils';

const goodsIssueSchema = z.object({
  voucherNumber: z.string().min(1, 'رقم السند مطلوب'),
  saleId: z.string().optional(),
  clientId: z.string().optional(),
  issuedBy: z.string().min(1, 'اسم المسؤول مطلوب'),
  issueDate: z.string().min(1, 'تاريخ الإخراج مطلوب'),
  status: z.string().default('completed'),
  notes: z.string().optional(),
  totalItems: z.string().min(1, 'عدد الأصناف مطلوب'),
  totalValue: z.string().min(1, 'القيمة الإجمالية مطلوبة')
});

type GoodsIssueFormData = z.infer<typeof goodsIssueSchema>;

interface GoodsIssueVoucher {
  id: number;
  voucherNumber: string;
  saleId: number;
  issuedBy: string;
  issueDate: string;
  status: string;
  notes?: string;
  items: any[];
  totalItems: number;
  totalValue: string;
  createdAt: string;
}

export default function GoodsIssue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<GoodsIssueVoucher | null>(null);
  const [items, setItems] = useState<Array<{id: string, productId: string, productName: string, quantity: number, price: string}>>([]);
  const [saleSearchOpen, setSaleSearchOpen] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Fetch goods issue vouchers from API
  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery<GoodsIssueVoucher[]>({
    queryKey: ['/api/goods-issue-vouchers'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // معلومات الشركة الثابتة
  const companySettings = {};

  const form = useForm<GoodsIssueFormData>({
    resolver: zodResolver(goodsIssueSchema),
    defaultValues: {
      voucherNumber: `GI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      saleId: '',
      clientId: '',
      issuedBy: '',
      issueDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: '',
      totalItems: '0',
      totalValue: '0'
    }
  });

  // Add item functions
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      price: '0'
    };
    setItems([...items, newItem]);
    updateTotals([...items, newItem]);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateTotals(newItems);
  };

  const updateItem = (id: string, field: string, value: any) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    updateTotals(newItems);
  };

  const updateTotals = (currentItems: typeof items) => {
    const totalItems = currentItems.length;
    const totalValue = currentItems.reduce((sum, item) => 
      sum + (item.quantity * parseFloat(item.price || '0')), 0
    );
    
    form.setValue('totalItems', totalItems.toString());
    form.setValue('totalValue', totalValue.toString());
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = (products as any[]).find((p: any) => p.id.toString() === productId);
    if (product) {
      const newItems = items.map(item => 
        item.id === itemId 
          ? { ...item, productId, productName: product.name, price: product.salePrice || '0' }
          : item
      );
      setItems(newItems);
      updateTotals(newItems);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: GoodsIssueFormData) => {
      const response = await fetch('/api/goods-issue-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          saleId: data.saleId ? parseInt(data.saleId) : undefined,
          clientId: data.clientId ? parseInt(data.clientId) : undefined,
          issueDate: data.issueDate,
          totalItems: parseInt(data.totalItems),
          totalValue: data.totalValue,
          items: items,
        }),
      });
      if (!response.ok) throw new Error('Failed to create goods issue voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-issue-vouchers'] });
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ سند إخراج البضاعة بنجاح',
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء الحفظ',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/goods-issue-vouchers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete goods issue voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-issue-vouchers'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف السند بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      });
    },
  });

  const handleSaleSelect = (saleId: string) => {
    const salesArray = Array.isArray(sales) ? sales : [];
    const sale = salesArray.find((s: any) => s.id.toString() === saleId);
    if (sale) {
      form.setValue('saleId', saleId);
      form.setValue('totalItems', (sale.items?.length || 1).toString());
      form.setValue('totalValue', sale.total);
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.issuedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || voucher.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: GoodsIssueFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setItems([]); // Clear items after successful save
        form.reset(); // Reset form
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إنشاء سند إخراج البضاعة بنجاح",
        });
      }
    });
  };

  const handlePrint = (voucher: GoodsIssueVoucher) => {
    const salesArray = Array.isArray(sales) ? sales : [];
    const clientsArray = Array.isArray(clients) ? clients : [];
    const sale = salesArray.find((s: any) => s.id === voucher.saleId);
    const client = clientsArray.find((c: any) => c.id === sale?.clientId);

    // استخدام معلومات الشركة المحدثة تلقائياً
    const finalCompanyInfo = {
      nameArabic: companySettings?.nameArabic || "",
      address: companySettings?.address || "جدة البغدادية الشرقية",
      city: companySettings?.city || "جدة",
      phone: companySettings?.phone || "0567537599",
      email: companySettings?.email || "byrwl8230@gmail.com",
      commercialRegister: companySettings?.commercialRegister || "4030528128",
      taxNumber: companySettings?.taxNumber || "123456789012345"
    };

    const printContent = `
      <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #000; margin: 0;">${finalCompanyInfo.nameArabic}</h1>
          <p style="margin: 5px 0; color: #666;">${finalCompanyInfo.address} - ${finalCompanyInfo.city} | ${finalCompanyInfo.phone} | ${finalCompanyInfo.email}</p>
          <h2 style="color: #2563eb; margin: 10px 0;">سند إخراج البضاعة</h2>
          <p style="margin: 5px 0; color: #666;">رقم السند: ${voucher.voucherNumber}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">تفاصيل السند</h3>
            <p><strong>رقم الفاتورة:</strong> ${sale?.id || 'غير محدد'}</p>
            <p><strong>المخرج:</strong> ${voucher.issuedBy}</p>
            <p><strong>تاريخ الإخراج:</strong> ${new Date(voucher.issueDate).toLocaleDateString('en-GB')}</p>
            <p><strong>الحالة:</strong> ${voucher.status === 'completed' ? 'مكتمل' : 'معلق'}</p>
          </div>
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">بيانات العميل</h3>
            <p><strong>اسم العميل:</strong> ${client?.name || 'غير محدد'}</p>
            <p><strong>رقم الهاتف:</strong> ${client?.phone || 'غير محدد'}</p>
            <p><strong>العنوان:</strong> ${client?.address || 'غير محدد'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">الأصناف المخرجة</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">المنتج</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الكمية</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">السعر</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${(voucher.items || []).map((item: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.productName || 'منتج'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 1}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatAmount(item.price || '0')} ر.س</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatAmount(((parseFloat(item.price || '0') * (item.quantity || 1))).toString())} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <p style="margin: 5px 0;"><strong>إجمالي الأصناف:</strong> ${voucher.totalItems}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>القيمة الإجمالية:</strong> ${formatAmount(voucher.totalValue)} ر.س</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          ${voucher.notes ? `<div style="margin-top: 20px; text-align: right;"><strong>ملاحظات:</strong> ${voucher.notes}</div>` : ''}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px;">
            <div style="text-align: center;">
              <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 5px;">
                <strong>توقيع المخرج</strong>
              </div>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 5px;">
                <strong>توقيع المستلم</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>سند إخراج البضاعة - ${voucher.voucherNumber}</title>
            <meta charset="utf-8">
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">سندات إخراج البضاعة</h1>
          <p className="text-muted-foreground mt-2">إدارة سندات إخراج البضاعة مع إمكانية الطباعة والتتبع</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              سند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء سند إخراج بضاعة جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="voucherNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم السند</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الفاتورة (اختياري)</FormLabel>
                        <Popover open={saleSearchOpen} onOpenChange={setSaleSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="sale-search-button"
                              >
                                {field.value
                                  ? (() => {
                                      const sale = (sales as any[]).find((s: any) => s.id.toString() === field.value);
                                      return sale ? `فاتورة #${sale.id} - ${formatAmount(sale.total)} ر.س` : "اختر الفاتورة";
                                    })()
                                  : "اختر الفاتورة"}
                                <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="ابحث عن فاتورة..." />
                              <CommandList>
                                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                                <CommandGroup>
                                  {Array.isArray(sales) && sales.map((sale: any) => (
                                    <CommandItem
                                      key={sale.id}
                                      value={`${sale.id} ${sale.total}`}
                                      onSelect={() => {
                                        field.onChange(sale.id.toString());
                                        handleSaleSelect(sale.id.toString());
                                        setSaleSearchOpen(false);
                                      }}
                                      data-testid={`sale-option-${sale.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          sale.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      فاتورة #{sale.id} - {formatAmount(sale.total)} ر.س
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل (اختياري)</FormLabel>
                        <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="client-search-button"
                              >
                                {field.value
                                  ? (() => {
                                      const client = (clients as any[]).find((c: any) => c.id.toString() === field.value);
                                      return client ? `${client.name} - ${client.phone || 'بدون هاتف'}` : "اختر العميل";
                                    })()
                                  : "اختر العميل"}
                                <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="ابحث عن عميل..." />
                              <CommandList>
                                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                                <CommandGroup>
                                  {Array.isArray(clients) && clients.map((client: any) => (
                                    <CommandItem
                                      key={client.id}
                                      value={`${client.name} ${client.phone || ''}`}
                                      onSelect={() => {
                                        field.onChange(client.id.toString());
                                        setClientSearchOpen(false);
                                      }}
                                      data-testid={`client-option-${client.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          client.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {client.name} - {client.phone || 'بدون هاتف'}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div></div> {/* مساحة فارغة للتوازن */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issuedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المخرج</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اسم المسؤول عن الإخراج" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الإخراج</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalItems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الأصناف</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القيمة الإجمالية</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* قسم الأصناف */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">الأصناف المطلوبة</Label>
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      size="sm" 
                      className="gap-2"
                      disabled={!Array.isArray(products) || products.length === 0}
                    >
                      <Plus className="h-4 w-4" />
                      إضافة صنف
                    </Button>
                  </div>
                  
                  {(!Array.isArray(products) || products.length === 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      لا توجد منتجات متاحة. يرجى إضافة منتجات أولاً من قسم المنتجات.
                    </div>
                  )}
                  
                  {items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>اسم الصنف</TableHead>
                            <TableHead>الكمية</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>الإجمالي</TableHead>
                            <TableHead>العمليات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Popover 
                                  open={productSearchOpen[item.id]} 
                                  onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, [item.id]: open})}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !item.productId && "text-muted-foreground"
                                      )}
                                      data-testid={`product-search-button-${item.id}`}
                                    >
                                      {item.productId
                                        ? (() => {
                                            const product = (products as any[]).find((p: any) => p.id.toString() === item.productId);
                                            return product ? `${product.name} - ${product.salePrice} ر.س` : "اختر المنتج";
                                          })()
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
                                          {Array.isArray(products) && products.map((product: any) => (
                                            <CommandItem
                                              key={product.id}
                                              value={`${product.name} ${product.code || ''}`}
                                              onSelect={() => {
                                                handleProductSelect(item.id, product.id.toString());
                                                setProductSearchOpen({...productSearchOpen, [item.id]: false});
                                              }}
                                              data-testid={`product-option-${product.id}`}
                                            >
                                              <Check
                                                className={cn(
                                                  "ml-2 h-4 w-4",
                                                  product.id.toString() === item.productId ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {product.name} - {product.salePrice} ر.س
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {item.productName && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.productName}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                  min="1"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                  placeholder="0.00"
                                />
                              </TableCell>
                              <TableCell>
                                {formatAmount((item.quantity * parseFloat(item.price || '0')).toString())} ر.س
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                      لا توجد أصناف مضافة
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="ملاحظات إضافية..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث برقم السند أو اسم المخرج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>السندات المحفوظة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم السند</TableHead>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المخرج</TableHead>
                <TableHead>تاريخ الإخراج</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>القيمة الإجمالية</TableHead>
                <TableHead>العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                  <TableCell>#{voucher.saleId}</TableCell>
                  <TableCell>{voucher.issuedBy}</TableCell>
                  <TableCell>{new Date(voucher.issueDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>
                    <Badge variant={voucher.status === 'completed' ? 'default' : 'secondary'}>
                      {voucher.status === 'completed' ? 'مكتمل' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatAmount(voucher.totalValue)} ر.س</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(voucher)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
                            deleteMutation.mutate(voucher.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل سند الإخراج</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم السند</Label>
                  <p className="text-sm text-muted-foreground">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label>رقم الفاتورة</Label>
                  <p className="text-sm text-muted-foreground">#{selectedVoucher.saleId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المخرج</Label>
                  <p className="text-sm text-muted-foreground">{selectedVoucher.issuedBy}</p>
                </div>
                <div>
                  <Label>تاريخ الإخراج</Label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedVoucher.issueDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>عدد الأصناف</Label>
                  <p className="text-sm text-muted-foreground">{selectedVoucher.totalItems}</p>
                </div>
                <div>
                  <Label>القيمة الإجمالية</Label>
                  <p className="text-sm text-muted-foreground">{formatAmount(selectedVoucher.totalValue)} ر.س</p>
                </div>
              </div>
              {selectedVoucher.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <p className="text-sm text-muted-foreground">{selectedVoucher.notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => handlePrint(selectedVoucher)}>
                  <Download className="h-4 w-4 mr-2" />
                  طباعة السند
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}