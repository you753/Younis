import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Check, X, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Types
interface WithdrawalVoucherItem {
  id: string;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface WithdrawalVoucher {
  id: number;
  voucherNumber: string;
  clientId?: number;
  branchId?: number;
  date: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: string;
  createdBy: number;
  items: WithdrawalVoucherItem[];
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  salePrice: string;
  quantity: number;
}

// Form schema
const voucherSchema = z.object({
  clientId: z.number().optional(),
  branchId: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    productCode: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    total: z.number()
  })).min(1, "يجب إضافة منتج واحد على الأقل")
});

type VoucherFormData = z.infer<typeof voucherSchema>;

export default function WithdrawalVouchers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<WithdrawalVoucher | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentItems, setCurrentItems] = useState<WithdrawalVoucherItem[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      items: []
    }
  });

  // Fetch vouchers
  const { data: vouchers = [], isLoading } = useQuery<WithdrawalVoucher[]>({
    queryKey: ['/api/withdrawal-vouchers'],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Create voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: async (data: VoucherFormData) => {
      const response = await fetch('/api/withdrawal-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-vouchers'] });
      setIsAddDialogOpen(false);
      form.reset();
      setCurrentItems([]);
      toast({
        title: "تم إنشاء السند",
        description: "تم إنشاء سند الإخراج بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند الإخراج",
        variant: "destructive",
      });
    }
  });

  // Approve voucher mutation
  const approveVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/withdrawal-vouchers/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-vouchers'] });
      toast({
        title: "تم الموافقة",
        description: "تم الموافقة على سند الإخراج بنجاح",
      });
    }
  });

  // Delete voucher mutation
  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/withdrawal-vouchers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete voucher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-vouchers'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف سند الإخراج بنجاح",
      });
    }
  });

  const addItem = () => {
    const newItem: WithdrawalVoucherItem = {
      id: Date.now().toString(),
      productId: 0,
      productName: '',
      productCode: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setCurrentItems([...currentItems, newItem]);
  };

  const updateItem = (id: string, field: keyof WithdrawalVoucherItem, value: any) => {
    setCurrentItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.name;
            updatedItem.productCode = product.code;
            updatedItem.unitPrice = parseFloat(product.salePrice);
          }
        }
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCurrentItems(items => items.filter(item => item.id !== id));
  };

  const onSubmit = (data: VoucherFormData) => {
    const formData = {
      ...data,
      items: currentItems.filter(item => item.productId > 0)
    };
    createVoucherMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default", 
      rejected: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      approved: "معتمد",
      rejected: "مرفوض"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const viewVoucher = (voucher: WithdrawalVoucher) => {
    setSelectedVoucher(voucher);
    setIsViewDialogOpen(true);
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">سندات إخراج البضاعة</h1>
          <p className="text-gray-600">إدارة سندات إخراج البضاعة والموافقة عليها</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              سند إخراج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء سند إخراج جديد</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل سند الإخراج والمنتجات المطلوب إخراجها
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العميل (اختياري)</Label>
                  <Select onValueChange={(value) => form.setValue('clientId', parseInt(value))}>
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
                  <Label>ملاحظات</Label>
                  <Textarea 
                    {...form.register('notes')}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">المنتجات</Label>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة منتج
                  </Button>
                </div>

                <div className="space-y-3">
                  {currentItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-6 gap-3 items-center">
                          <div>
                            <Label className="text-xs">المنتج</Label>
                            <Select 
                              value={item.productId.toString()}
                              onValueChange={(value) => updateItem(item.id, 'productId', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر منتج" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name} ({product.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-xs">الكمية</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">السعر</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              step="0.01"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">المجموع</Label>
                            <Input
                              value={item.total.toFixed(2)}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">المخزون</Label>
                            <div className="text-sm text-gray-600">
                              {products.find(p => p.id === item.productId)?.quantity || 0}
                            </div>
                          </div>
                          
                          <div>
                            <Button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              variant="outline"
                              size="sm"
                              className="mt-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {currentItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لم يتم إضافة أي منتجات بعد
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVoucherMutation.isPending || currentItems.length === 0}
                >
                  {createVoucherMutation.isPending ? "جاري الحفظ..." : "حفظ السند"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات الإخراج</CardTitle>
          <CardDescription>
            عرض وإدارة جميع سندات إخراج البضاعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم السند</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>عدد المنتجات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                  <TableCell>
                    {clients.find(c => c.id === voucher.clientId)?.name || "غير محدد"}
                  </TableCell>
                  <TableCell>
                    {new Date(voucher.date).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(voucher.status)}
                  </TableCell>
                  <TableCell>{voucher.items?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewVoucher(voucher)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      
                      {voucher.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveVoucherMutation.mutate(voucher.id)}
                            disabled={approveVoucherMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVoucherMutation.mutate(voucher.id)}
                            disabled={deleteVoucherMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {vouchers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد سندات إخراج بعد
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Voucher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل سند الإخراج</DialogTitle>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">رقم السند</Label>
                  <p className="text-sm">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">التاريخ</Label>
                  <p className="text-sm">{new Date(selectedVoucher.date).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">العميل</Label>
                  <p className="text-sm">
                    {clients.find(c => c.id === selectedVoucher.clientId)?.name || "غير محدد"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الحالة</Label>
                  <div>{getStatusBadge(selectedVoucher.status)}</div>
                </div>
              </div>

              {selectedVoucher.notes && (
                <div>
                  <Label className="text-sm font-medium">الملاحظات</Label>
                  <p className="text-sm">{selectedVoucher.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-3 block">المنتجات</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedVoucher.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.productCode}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitPrice.toFixed(2)} ر.س</TableCell>
                        <TableCell>{item.total.toFixed(2)} ر.س</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}