import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Package, Edit, Trash2, Download, Printer, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form validation schema
const formSchema = z.object({
  voucherNumber: z.string().optional(),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  receivedBy: z.string().min(1, 'المستلم مطلوب'),
  receivedDate: z.string().min(1, 'تاريخ الاستلام مطلوب'),
  totalItems: z.string(),
  totalValue: z.string(),
  notes: z.string().optional(),
});

type GoodsReceiptFormData = z.infer<typeof formSchema>;

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
  items: any[];
  createdAt: string;
}

export default function SimpleGoodsReceipt() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<GoodsReceiptVoucher | null>(null);
  const [items, setItems] = useState<Array<{id: string, productId: string, productName: string, orderedQuantity: number, receivedQuantity: number, unitPrice: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goods receipt vouchers from API
  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery<GoodsReceiptVoucher[]>({
    queryKey: ['/api/goods-receipt-vouchers'],
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voucherNumber: '',
      supplierId: '',
      receivedBy: '',
      receivedDate: new Date().toISOString().split('T')[0],
      totalItems: '0',
      totalValue: '0',
      notes: ''
    }
  });

  // Add item functions
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      orderedQuantity: 1,
      receivedQuantity: 1,
      unitPrice: '0'
    };
    setItems([...items, newItem]);
    updateTotals([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
    updateTotals(newItems);
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    updateTotals(newItems);
  };

  const updateTotals = (currentItems: typeof items) => {
    const totalItems = currentItems.length;
    const totalValue = currentItems.reduce((sum, item) => 
      sum + (item.receivedQuantity * parseFloat(item.unitPrice || '0')), 0
    );
    
    form.setValue('totalItems', totalItems.toString());
    form.setValue('totalValue', totalValue.toString());
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = Array.isArray(products) ? products.find((p: any) => p.id.toString() === productId) : null;
    if (product) {
      const newItems = items.map(item => 
        item.id === itemId 
          ? { ...item, productId, productName: product.name, unitPrice: product.purchasePrice || product.salePrice || '0' }
          : item
      );
      setItems(newItems);
      updateTotals(newItems);
    }
  };

  // Create goods receipt voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: async (data: GoodsReceiptFormData) => {
      // توليد رقم سند جديد في كل مرة
      const voucherNumber = `GRV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      const response = await fetch('/api/goods-receipt-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          voucherNumber: voucherNumber, // استخدام الرقم الجديد
          supplierId: parseInt(data.supplierId),
          receivedDate: data.receivedDate,
          totalItems: parseInt(data.totalItems),
          totalValue: data.totalValue,
          items: items,
        }),
      });
      if (!response.ok) throw new Error('Failed to create voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers'] });
      setIsCreateDialogOpen(false);
      form.reset();
      setItems([]);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إنشاء سند إدخال البضاعة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ سند إدخال البضاعة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset({
      voucherNumber: '',
      supplierId: '',
      receivedBy: '',
      receivedDate: new Date().toISOString().split('T')[0],
      totalItems: '0',
      totalValue: '0',
      notes: ''
    });
    setItems([]);
  };

  const onSubmit = (data: GoodsReceiptFormData) => {
    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب إضافة صنف واحد على الأقل",
        variant: "destructive",
      });
      return;
    }
    createVoucherMutation.mutate(data);
  };

  const handleEdit = (voucher: GoodsReceiptVoucher) => {
    form.setValue('voucherNumber', voucher.voucherNumber);
    form.setValue('supplierId', voucher.supplierId.toString());
    form.setValue('receivedBy', voucher.receivedBy);
    form.setValue('receivedDate', voucher.receivedDate);
    form.setValue('totalItems', voucher.totalItems.toString());
    form.setValue('totalValue', voucher.totalValue.toString());
    form.setValue('notes', voucher.notes || '');
    setItems(voucher.items || []);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      try {
        const response = await fetch(`/api/goods-receipt-vouchers/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/goods-receipt-vouchers'] });
          toast({
            title: "تم الحذف",
            description: "تم حذف سند إدخال البضاعة بنجاح",
          });
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">سند إدخال بضاعة</h1>
          <p className="text-muted-foreground">إدارة استلام البضائع والمخزون</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          سند إدخال جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي السندات</p>
                <p className="text-2xl font-bold text-blue-700">{vouchers.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">مكتملة</p>
                <p className="text-2xl font-bold text-green-700">
                  {vouchers.filter(v => v.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-orange-700">
                  {vouchers.filter(v => v.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-purple-700">
                  {vouchers.reduce((sum, v) => sum + v.totalValue, 0).toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'SAR' 
                  })}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات إدخال البضاعة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingVouchers ? (
            <div className="text-center py-8">جاري التحميل...</div>
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
                {vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                      <TableCell>{voucher.supplierName}</TableCell>
                      <TableCell>{voucher.receivedBy}</TableCell>
                      <TableCell>{new Date(voucher.receivedDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{voucher.totalItems}</TableCell>
                      <TableCell>
                        {voucher.totalValue.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'SAR'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.status === 'completed' ? 'default' : 'secondary'}>
                          {voucher.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                            onClick={() => handleEdit(voucher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(voucher.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      لا توجد سندات إدخال بضاعة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Voucher Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سند إدخال بضاعة جديد</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="voucherNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم السند</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="يتم التوليد تلقائياً" readOnly className="bg-gray-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المورد</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receivedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المستلم</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم المستلم" />
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
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">الأصناف المستلمة</Label>
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
                          <TableHead>الكمية المطلوبة</TableHead>
                          <TableHead>الكمية المستلمة</TableHead>
                          <TableHead>سعر الوحدة</TableHead>
                          <TableHead>الإجمالي</TableHead>
                          <TableHead>العمليات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select 
                                value={item.productId} 
                                onValueChange={(value) => handleProductSelect(item.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المنتج" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(products) && products.map((product: any) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} - {product.code || 'بدون كود'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {item.productName && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.productName}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.orderedQuantity}
                                onChange={(e) => updateItem(item.id, 'orderedQuantity', parseInt(e.target.value) || 0)}
                                min="1"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.receivedQuantity}
                                onChange={(e) => updateItem(item.id, 'receivedQuantity', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              {(item.receivedQuantity * parseFloat(item.unitPrice || '0')).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'SAR'
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>إجمالي الأصناف</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
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
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ملاحظات إضافية..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  إعادة تعيين
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVoucherMutation.isPending}
                >
                  {createVoucherMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Voucher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>عرض سند إدخال البضاعة</DialogTitle>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم السند</Label>
                  <p className="font-medium">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label>المورد</Label>
                  <p className="font-medium">{selectedVoucher.supplierName}</p>
                </div>
                <div>
                  <Label>المستلم</Label>
                  <p className="font-medium">{selectedVoucher.receivedBy}</p>
                </div>
                <div>
                  <Label>تاريخ الاستلام</Label>
                  <p className="font-medium">
                    {new Date(selectedVoucher.receivedDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              
              {selectedVoucher.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <p className="font-medium">{selectedVoucher.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}