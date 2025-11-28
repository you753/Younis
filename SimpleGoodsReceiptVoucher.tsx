import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Printer, Package, AlertCircle } from "lucide-react";
import { z } from "zod";

// Schemas
const goodsReceiptSchema = z.object({
  supplierId: z.string().min(1, "اختر المورد"),
  receivedBy: z.string().min(1, "ادخل اسم المستلم"),
  receivedDate: z.string().min(1, "ادخل تاريخ الاستلام"),
  notes: z.string().optional(),
});

const itemSchema = z.object({
  productId: z.string().min(1, "اختر المنتج"),
  quantity: z.number().min(1, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().min(0.01, "السعر يجب أن يكون أكبر من صفر"),
});

type GoodsReceiptForm = z.infer<typeof goodsReceiptSchema>;
type ItemForm = z.infer<typeof itemSchema>;

interface GoodsReceiptItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface GoodsReceiptVoucher {
  id: number;
  voucherNumber: string;
  supplierId: number;
  supplierName: string;
  receivedBy: string;
  receivedDate: string;
  totalItems: number;
  totalValue: number;
  status: string;
  notes?: string;
  items: GoodsReceiptItem[];
  createdAt: string;
}

interface SimpleGoodsReceiptVoucherProps {
  branchId?: number;
}

export default function SimpleGoodsReceiptVoucher({ branchId }: SimpleGoodsReceiptVoucherProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // معلومات الشركة الثابتة
  const companySettings = {};
  
  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [items, setItems] = useState<GoodsReceiptItem[]>([]);
  const [editingItem, setEditingItem] = useState<GoodsReceiptItem | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<GoodsReceiptVoucher | null>(null);
  
  // Forms
  const voucherForm = useForm<GoodsReceiptForm>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      supplierId: "",
      receivedBy: "يونس",
      receivedDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const itemForm = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
    },
  });

  // Queries - إضافة branchId للطلبات
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['/api/goods-receipt-vouchers', branchId],
    queryFn: async () => {
      const url = branchId 
        ? `/api/goods-receipt-vouchers?branchId=${branchId}`
        : '/api/goods-receipt-vouchers';
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

  // Mutations
  const updateVoucherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GoodsReceiptForm & { items: GoodsReceiptItem[] } }) => {
      const response = await fetch(`/api/goods-receipt-vouchers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          supplierId: parseInt(data.supplierId),
          totalItems: data.items.length,
          totalValue: data.items.reduce((sum, item) => sum + item.total, 0),
          items: data.items.map(item => ({
            ...item,
            productId: parseInt(item.productId),
          })),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطأ في تحديث السند');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      setIsCreateDialogOpen(false);
      resetForm();
      setEditingVoucher(null);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث سند إدخال البضاعة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createVoucherMutation = useMutation({
    mutationFn: async (data: GoodsReceiptForm & { items: GoodsReceiptItem[] }) => {
      const response = await fetch('/api/goods-receipt-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          supplierId: parseInt(data.supplierId),
          branchId: branchId || null,
          totalItems: data.items.length,
          totalValue: data.items.reduce((sum, item) => sum + item.total, 0),
          items: data.items.map(item => ({
            ...item,
            productId: parseInt(item.productId),
          })),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطأ في حفظ السند');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', branchId] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إنشاء سند إدخال البضاعة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    voucherForm.reset();
    itemForm.reset();
    setItems([]);
    setEditingItem(null);
    setEditingVoucher(null);
  };

  const addItem = (data: ItemForm) => {
    console.log("بيانات الصنف المرسلة:", data);
    console.log("أخطاء النموذج:", itemForm.formState.errors);
    
    // التحقق من وجود جميع الحقول المطلوبة
    if (!data.productId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المنتج",
        variant: "destructive",
      });
      return;
    }

    if (!data.quantity || data.quantity <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كمية صحيحة",
        variant: "destructive",
      });
      return;
    }

    if (!data.unitPrice || data.unitPrice <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سعر صحيح",
        variant: "destructive",
      });
      return;
    }
    
    const product = products.find(p => p.id.toString() === data.productId);
    if (!product) {
      toast({
        title: "خطأ",
        description: "المنتج غير موجود",
        variant: "destructive",
      });
      return;
    }

    const newItem: GoodsReceiptItem = {
      id: Date.now().toString(),
      productId: data.productId,
      productName: product.name,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      total: data.quantity * data.unitPrice,
    };

    setItems([...items, newItem]);
    itemForm.reset();
    toast({
      title: "تم الإضافة",
      description: "تم إضافة الصنف بنجاح",
    });
  };

  const updateItem = (data: ItemForm) => {
    if (!editingItem) return;

    const product = products.find(p => p.id.toString() === data.productId);
    if (!product) return;

    const updatedItem: GoodsReceiptItem = {
      ...editingItem,
      productId: data.productId,
      productName: product.name,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      total: data.quantity * data.unitPrice,
    };

    setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
    setEditingItem(null);
    itemForm.reset();
    toast({
      title: "تم التحديث",
      description: "تم تحديث الصنف بنجاح",
    });
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    toast({
      title: "تم الحذف",
      description: "تم حذف الصنف",
    });
  };

  const startEditItem = (item: GoodsReceiptItem) => {
    setEditingItem(item);
    itemForm.setValue('productId', item.productId);
    itemForm.setValue('quantity', item.quantity);
    itemForm.setValue('unitPrice', item.unitPrice);
  };

  const cancelEditItem = () => {
    setEditingItem(null);
    itemForm.reset();
  };

  const onSubmit = (data: GoodsReceiptForm) => {
    const finalItems = items.length > 0 ? items : [];
    
    if (editingVoucher) {
      // تحديث سند موجود
      updateVoucherMutation.mutate({ 
        id: editingVoucher.id, 
        data: { ...data, items: finalItems } 
      });
    } else {
      // إنشاء سند جديد
      createVoucherMutation.mutate({ ...data, items: finalItems });
    }
  };

  const handleEdit = (voucher: GoodsReceiptVoucher) => {
    setEditingVoucher(voucher);
    voucherForm.setValue('supplierId', voucher.supplierId.toString());
    voucherForm.setValue('receivedBy', voucher.receivedBy);
    voucherForm.setValue('receivedDate', voucher.receivedDate);
    voucherForm.setValue('notes', voucher.notes || '');
    setItems(voucher.items || []);
    setIsCreateDialogOpen(true);
  };

  const handlePrint = (voucher: GoodsReceiptVoucher) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند إدخال البضاعة - ${voucher.voucherNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            direction: rtl; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 1px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 18px; 
            font-weight: bold; 
          }
          .header h2 { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            font-weight: bold; 
          }
          .header p { 
            margin: 5px 0; 
            font-size: 12px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
          }
          .info-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0; 
            font-size: 14px; 
          }
          .info-item strong { 
            font-weight: bold; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            font-size: 12px; 
          }
          .table th, .table td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: center; 
          }
          .table th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .notes { 
            margin-top: 15px; 
            font-size: 12px; 
          }
          .footer { 
            margin-top: 20px; 
            text-align: center; 
            font-size: 10px; 
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${finalCompanyInfo.nameArabic}</h1>
          <p>${finalCompanyInfo.phone} | ${finalCompanyInfo.email}</p>
          <h2>سند إدخال البضاعة</h2>
        </div>
        
        <div class="info-grid">
          <div>
            <div class="info-item">
              <strong>رقم السند:</strong>
              <span>${voucher.voucherNumber}</span>
            </div>
            <div class="info-item">
              <strong>المورد:</strong>
              <span>${voucher.supplierName || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <strong>المستلم:</strong>
              <span>${voucher.receivedBy}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <strong>تاريخ الاستلام:</strong>
              <span>${voucher.receivedDate}</span>
            </div>
            <div class="info-item">
              <strong>عدد الأصناف:</strong>
              <span>${voucher.totalItems}</span>
            </div>
            <div class="info-item">
              <strong>القيمة الإجمالية:</strong>
              <span>${voucher.totalValue} ر.س</span>
            </div>
          </div>
        </div>

        ${voucher.items && voucher.items.length > 0 ? `
        <table class="table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${voucher.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice} ر.س</td>
                <td>${item.total} ر.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${voucher.notes ? `<div class="notes"><strong>ملاحظات:</strong> ${voucher.notes}</div>` : ''}

        <div class="footer">
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      try {
        const response = await fetch(`/api/goods-receipt-vouchers/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers', branchId] });
          toast({
            title: "تم الحذف",
            description: "تم حذف سند إدخال البضاعة بنجاح",
          });
        } else {
          throw new Error('فشل في حذف السند');
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في حذف سند إدخال البضاعة",
          variant: "destructive",
        });
      }
    }
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">سندات إدخال البضاعة</h1>
          <p className="text-muted-foreground">إدارة سندات إدخال البضاعة للمخزون</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          سند جديد
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السندات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">قيمة اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers
                .filter(v => new Date(v.createdAt).toDateString() === new Date().toDateString())
                .reduce((sum, v) => sum + v.totalValue, 0)
                .toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.reduce((sum, v) => sum + v.totalValue, 0)
                .toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة السند</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.length > 0 
                ? (vouchers.reduce((sum, v) => sum + v.totalValue, 0) / vouchers.length)
                  .toLocaleString('en-US', { style: 'currency', currency: 'SAR' })
                : '0.00 ر.س'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>سندات إدخال البضاعة</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سندات إدخال بضاعة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم السند</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>المستلم</TableHead>
                  <TableHead>تاريخ الاستلام</TableHead>
                  <TableHead>عدد الأصناف</TableHead>
                  <TableHead>القيمة الإجمالية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher: GoodsReceiptVoucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                    <TableCell>{voucher.supplierName || 'غير محدد'}</TableCell>
                    <TableCell>{voucher.receivedBy}</TableCell>
                    <TableCell>{voucher.receivedDate}</TableCell>
                    <TableCell>{voucher.totalItems}</TableCell>
                    <TableCell>
                      {voucher.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {voucher.status === 'completed' ? 'مكتمل' : voucher.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(voucher)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(voucher)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(voucher.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? 'تعديل سند إدخال البضاعة' : 'إنشاء سند إدخال بضاعة جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={voucherForm.handleSubmit(onSubmit)} className="space-y-6">
            {/* Voucher Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supplierId">المورد</Label>
                <Select onValueChange={(value) => voucherForm.setValue('supplierId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {voucherForm.formState.errors.supplierId && (
                  <p className="text-sm text-red-500 mt-1">
                    {voucherForm.formState.errors.supplierId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="receivedBy">المستلم</Label>
                <Input
                  {...voucherForm.register('receivedBy')}
                  placeholder="اسم المستلم"
                />
                {voucherForm.formState.errors.receivedBy && (
                  <p className="text-sm text-red-500 mt-1">
                    {voucherForm.formState.errors.receivedBy.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="receivedDate">تاريخ الاستلام</Label>
                <Input
                  type="date"
                  {...voucherForm.register('receivedDate')}
                />
                {voucherForm.formState.errors.receivedDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {voucherForm.formState.errors.receivedDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Add Item Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {editingItem ? 'تعديل الصنف' : 'إضافة أصناف للسند'}
                </h3>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-blue-700 font-medium">
                    {items.length} صنف مضاف
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">المنتج *</Label>
                  <Select onValueChange={(value) => {
                    itemForm.setValue('productId', value);
                    // Auto-populate unit price from product data
                    const product = products.find((p: any) => p.id.toString() === value);
                    if (product && product.purchasePrice) {
                      itemForm.setValue('unitPrice', parseFloat(product.purchasePrice));
                    }
                  }}>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="🔍 اختر المنتج من القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          لا توجد منتجات متاحة
                        </div>
                      ) : (
                        products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-gray-500 mr-2">#{product.code}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {itemForm.formState.errors.productId && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {itemForm.formState.errors.productId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">الكمية *</Label>
                  <Input
                    type="number"
                    min="1"
                    {...itemForm.register('quantity', { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center font-medium"
                  />
                  {itemForm.formState.errors.quantity && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {itemForm.formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">سعر الوحدة *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...itemForm.register('unitPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center font-medium pr-8"
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      ر.س
                    </span>
                  </div>
                  {itemForm.formState.errors.unitPrice && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {itemForm.formState.errors.unitPrice.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  {editingItem ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        onClick={itemForm.handleSubmit(updateItem)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        حفظ التعديل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditItem}
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={itemForm.handleSubmit(addItem)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      إضافة للسند
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {items.length > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">إجمالي الأصناف:</span> {items.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">إجمالي القيمة:</span> {items.reduce((sum, item) => sum + item.total, 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الأصناف المضافة</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </TableCell>
                          <TableCell>
                            {item.total.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => startEditItem(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex justify-end">
                    <div className="text-lg font-bold">
                      الإجمالي: {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                {...voucherForm.register('notes')}
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={createVoucherMutation.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createVoucherMutation.isPending}
                className="min-w-[120px]"
              >
                {createVoucherMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </div>
                ) : (
                  'حفظ'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}