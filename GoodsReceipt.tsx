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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Package, Search, Eye, Download, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { formatAmount, cn } from '@/lib/utils';

const goodsReceiptSchema = z.object({
  voucherNumber: z.string().min(1, 'رقم السند مطلوب'),
  purchaseId: z.string().optional(),
  supplierId: z.string().optional(),
  receivedBy: z.string().min(1, 'اسم المستلم مطلوب'),
  receivedDate: z.string().min(1, 'تاريخ الاستلام مطلوب'),
  status: z.string().default('completed'),
  notes: z.string().optional(),
  totalItems: z.string().min(1, 'عدد الأصناف مطلوب'),
  totalValue: z.string().min(1, 'القيمة الإجمالية مطلوبة')
});

type GoodsReceiptFormData = z.infer<typeof goodsReceiptSchema>;

interface GoodsReceiptVoucher {
  id: number;
  voucherNumber: string;
  purchaseId?: number;
  receivedBy: string;
  receivedDate: string;
  status: string;
  notes?: string;
  items: any[];
  totalItems: number;
  totalValue: string;
  createdAt: string;
}

interface GoodsReceiptProps {
  branchId?: number;
}

export default function GoodsReceipt({ branchId }: GoodsReceiptProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<GoodsReceiptVoucher | null>(null);
  const [items, setItems] = useState<Array<{id: string, productId: string, productName: string, quantity: number, price: string}>>([]);
  const [purchaseSearchOpen, setPurchaseSearchOpen] = useState(false);
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: string]: boolean}>({});
  const [supplierInfo, setSupplierInfo] = useState<{name: string, phone: string, address: string} | null>(null);
  const { toast } = useToast();

  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery<GoodsReceiptVoucher[]>({
    queryKey: ['/api/goods-receipt-vouchers', branchId],
    queryFn: async () => {
      const url = branchId 
        ? `/api/goods-receipt-vouchers?branchId=${branchId}`
        : '/api/goods-receipt-vouchers';
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases', branchId],
    queryFn: async () => {
      const url = branchId 
        ? `/api/purchases?branchId=${branchId}`
        : '/api/purchases';
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers', branchId],
    queryFn: async () => {
      const url = branchId 
        ? `/api/suppliers?branchId=${branchId}`
        : '/api/suppliers';
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const url = branchId 
        ? `/api/products?branchId=${branchId}`
        : '/api/products';
      const response = await fetch(url);
      return response.json();
    },
  });

  const companySettings = {};

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      voucherNumber: `GR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      purchaseId: '',
      supplierId: '',
      receivedBy: '',
      receivedDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: '',
      totalItems: '0',
      totalValue: '0'
    }
  });

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
          ? { ...item, productId, productName: product.name, price: product.purchasePrice || '0' }
          : item
      );
      setItems(newItems);
      updateTotals(newItems);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: GoodsReceiptFormData) => {
      const response = await fetch('/api/goods-receipt-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          branchId: branchId || null,
          purchaseId: data.purchaseId ? parseInt(data.purchaseId) : undefined,
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          receivedDate: data.receivedDate,
          totalItems: parseInt(data.totalItems),
          totalValue: data.totalValue,
          items: items,
        }),
      });
      if (!response.ok) throw new Error('Failed to create goods receipt voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ سند إدخال البضاعة بنجاح',
      });
      setIsCreateDialogOpen(false);
      setItems([]);
      setSupplierInfo(null);
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
      const response = await fetch(`/api/goods-receipt-vouchers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete goods receipt voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
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

  const handlePurchaseSelect = (purchaseId: string) => {
    const purchasesArray = Array.isArray(purchases) ? purchases : [];
    const purchase = purchasesArray.find((p: any) => p.id.toString() === purchaseId);
    
    if (purchase) {
      form.setValue('purchaseId', purchaseId);
      
      // جلب معلومات المورد
      const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
      const supplier = suppliersArray.find((s: any) => s.id === purchase.supplierId);
      
      if (supplier) {
        form.setValue('supplierId', supplier.id.toString());
        // تعبئة بيانات المورد تلقائياً
        setSupplierInfo({
          name: supplier.name || 'غير محدد',
          phone: supplier.phone || 'غير محدد',
          address: supplier.address || 'غير محدد'
        });
      }
      
      // تعبئة المنتجات تلقائياً من الفاتورة
      if (purchase.items && Array.isArray(purchase.items) && purchase.items.length > 0) {
        const purchaseItems = purchase.items.map((item: any) => ({
          id: Date.now().toString() + Math.random().toString(36),
          productId: item.productId?.toString() || '',
          productName: item.productName || item.name || '',
          quantity: item.quantity || 0,
          price: item.unitPrice?.toString() || item.price?.toString() || '0'
        }));
        
        setItems(purchaseItems);
        updateTotals(purchaseItems);
        
        toast({
          title: 'تم التعبئة التلقائية',
          description: `تم تعبئة ${purchaseItems.length} صنف من الفاتورة`,
        });
      } else {
        // إذا الفاتورة ما فيها منتجات، نستخدم القيم الافتراضية
        form.setValue('totalItems', '1');
        form.setValue('totalValue', purchase.total || '0');
        
        toast({
          title: 'تنبيه',
          description: 'الفاتورة لا تحتوي على أصناف، الرجاء إضافتها يدوياً',
          variant: 'default',
        });
      }
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.receivedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || voucher.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: GoodsReceiptFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setItems([]);
        form.reset();
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إنشاء سند إدخال البضاعة بنجاح",
        });
      }
    });
  };

  const handlePrint = (voucher: GoodsReceiptVoucher) => {
    const purchasesArray = Array.isArray(purchases) ? purchases : [];
    const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    const purchase = purchasesArray.find((p: any) => p.id === voucher.purchaseId);
    const supplier = suppliersArray.find((s: any) => s.id === purchase?.supplierId);

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
          <h1 style="color: #000; margin: 0; font-size: 24px;">${purchase?.branchName || 'الفرع الرئيسي'}</h1>
          <h2 style="color: #2563eb; margin: 10px 0;">سند إدخال البضاعة</h2>
          <p style="margin: 5px 0; color: #666;">رقم السند: ${voucher.voucherNumber}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">تفاصيل السند</h3>
            <p><strong>رقم فاتورة المشتريات:</strong> ${purchase?.id || 'غير محدد'}</p>
            <p><strong>المستلم:</strong> ${voucher.receivedBy}</p>
            <p><strong>تاريخ الاستلام:</strong> ${new Date(voucher.receivedDate).toLocaleDateString('en-GB')}</p>
            <p><strong>الحالة:</strong> ${voucher.status === 'completed' ? 'مكتمل' : 'معلق'}</p>
          </div>
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">بيانات المورد</h3>
            <p><strong>اسم المورد:</strong> ${supplier?.name || 'غير محدد'}</p>
            <p><strong>رقم الهاتف:</strong> ${supplier?.phone || 'غير محدد'}</p>
            <p><strong>العنوان:</strong> ${supplier?.address || 'غير محدد'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">الأصناف المستلمة</h3>
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
                <strong>توقيع المستلم</strong>
              </div>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 5px;">
                <strong>توقيع المسلم</strong>
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
            <title>سند إدخال البضاعة - ${voucher.voucherNumber}</title>
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
          <h1 className="text-3xl font-bold">سندات إدخال البضاعة</h1>
          <p className="text-muted-foreground mt-2">إدارة سندات إدخال البضاعة من المشتريات مع إمكانية الطباعة والتتبع</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-receipt-button">
              <Plus className="h-4 w-4" />
              سند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء سند إدخال بضاعة جديد</DialogTitle>
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
                          <Input {...field} data-testid="input-voucherNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم فاتورة المشتريات (اختياري)</FormLabel>
                        <Popover open={purchaseSearchOpen} onOpenChange={setPurchaseSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="purchase-search-button"
                              >
                                {field.value
                                  ? (() => {
                                      const purchase = (purchases as any[]).find((p: any) => p.id.toString() === field.value);
                                      return purchase ? `فاتورة #${purchase.id} - ${formatAmount(purchase.total)} ر.س` : "اختر الفاتورة";
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
                                  {Array.isArray(purchases) && purchases.map((purchase: any) => (
                                    <CommandItem
                                      key={purchase.id}
                                      value={`${purchase.id} ${purchase.total}`}
                                      onSelect={() => {
                                        field.onChange(purchase.id.toString());
                                        handlePurchaseSelect(purchase.id.toString());
                                        setPurchaseSearchOpen(false);
                                      }}
                                      data-testid={`purchase-option-${purchase.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          purchase.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      فاتورة #{purchase.id} - {formatAmount(purchase.total)} ر.س
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
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المورد (اختياري)</FormLabel>
                        <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="supplier-search-button"
                              >
                                {field.value
                                  ? (() => {
                                      const supplier = (suppliers as any[]).find((s: any) => s.id.toString() === field.value);
                                      return supplier ? `${supplier.name} - ${supplier.phone || 'بدون هاتف'}` : "اختر المورد";
                                    })()
                                  : "اختر المورد"}
                                <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="ابحث عن مورد..." />
                              <CommandList>
                                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                                <CommandGroup>
                                  {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                                    <CommandItem
                                      key={supplier.id}
                                      value={`${supplier.name} ${supplier.phone || ''}`}
                                      onSelect={() => {
                                        field.onChange(supplier.id.toString());
                                        setSupplierSearchOpen(false);
                                      }}
                                      data-testid={`supplier-option-${supplier.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          supplier.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {supplier.name} - {supplier.phone || 'بدون هاتف'}
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

                {/* عرض بيانات المورد */}
                {supplierInfo && (
                  <div className="p-4 bg-muted rounded-lg border">
                    <h3 className="font-semibold mb-3 text-sm">بيانات المورد</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">اسم المورد:</p>
                        <p className="font-medium">{supplierInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">رقم الهاتف:</p>
                        <p className="font-medium">{supplierInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">العنوان:</p>
                        <p className="font-medium">{supplierInfo.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="receivedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المستلم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اسم المسؤول عن الاستلام" data-testid="input-receivedBy" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="receivedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الاستلام</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-receivedDate" />
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
                          <Input {...field} type="number" readOnly data-testid="input-totalItems" />
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
                          <Input {...field} readOnly data-testid="input-totalValue" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">الأصناف المستلمة</Label>
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      size="sm" 
                      className="gap-2"
                      disabled={!Array.isArray(products) || products.length === 0}
                      data-testid="add-item-button"
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
                                            return product ? `${product.name} - ${product.purchasePrice} ر.س` : "اختر المنتج";
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
                                              {product.name} - {product.purchasePrice} ر.س
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
                                  data-testid={`input-quantity-${item.id}`}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                  placeholder="0.00"
                                  data-testid={`input-price-${item.id}`}
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
                                  data-testid={`remove-item-${item.id}`}
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
                        <Textarea {...field} rows={3} placeholder="ملاحظات إضافية..." data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="cancel-button">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="submit-button">
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
                  placeholder="البحث برقم السند أو اسم المستلم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48" data-testid="status-filter">
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
                <TableHead>المستلم</TableHead>
                <TableHead>تاريخ الاستلام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>القيمة الإجمالية</TableHead>
                <TableHead>العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                  <TableCell>#{voucher.purchaseId || '-'}</TableCell>
                  <TableCell>{voucher.receivedBy}</TableCell>
                  <TableCell>{new Date(voucher.receivedDate).toLocaleDateString('en-GB')}</TableCell>
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
                        data-testid={`view-voucher-${voucher.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(voucher)}
                        data-testid={`print-voucher-${voucher.id}`}
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
                        data-testid={`delete-voucher-${voucher.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد سندات محفوظة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
