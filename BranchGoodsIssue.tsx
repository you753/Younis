import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Search, FileText, Download, TrendingUp, Eye, Printer, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface GoodsIssueVoucher {
  id: number;
  voucherNumber: string;
  clientId: number;
  clientName: string;
  totalAmount: number;
  totalQuantity: number;
  status: 'pending' | 'approved' | 'completed';
  notes: string;
  createdAt: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface BranchGoodsIssueProps {
  branchId: string;
}

export default function BranchGoodsIssue({ branchId }: BranchGoodsIssueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<GoodsIssueVoucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // جلب البيانات
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: vouchers = [], isLoading } = useQuery<GoodsIssueVoucher[]>({
    queryKey: ['/api/goods-issue-vouchers'],
    refetchInterval: 5000
  });

  // مطابعة الحذف
  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/goods-issue-vouchers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف السند');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goods-issue-vouchers'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف سند إخراج البضاعة بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف سند إخراج البضاعة",
        variant: "destructive",
      });
    },
  });

  // إضافة سند جديد
  const createVoucherMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['/api/goods-issue-vouchers'] });
      setShowDialog(false);
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء سند إخراج البضاعة بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند إخراج البضاعة",
        variant: "destructive",
      });
    },
  });

  // حذف سند
  const handleDeleteVoucher = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      deleteVoucherMutation.mutate(id);
    }
  };

  // تصفية السندات
  const filteredVouchers = vouchers.filter((voucher: any) => {
    const matchesSearch = voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || voucher.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // إحصائيات
  const totalVouchers = vouchers.length;
  const totalAmount = vouchers.reduce((sum: number, voucher: any) => sum + (parseFloat(voucher.totalAmount) || 0), 0);
  const pendingVouchers = vouchers.filter((v: any) => v.status === 'pending').length;
  const completedVouchers = vouchers.filter((v: any) => v.status === 'completed').length;

  // معاينة السند
  const handlePreviewVoucher = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowPreview(true);
  };

  // طباعة السند
  const handlePrintVoucher = (voucher: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>سند إخراج بضاعة - ${voucher.voucherNumber}</title>
          <style>
            @media print { @page { margin: 20mm; } }
            body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { width: 48%; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #d1d5db; padding: 12px; text-align: center; }
            .items-table th { background-color: #f3f4f6; font-weight: bold; }
            .total-section { margin-top: 20px; text-align: left; }
            .total-row { font-size: 18px; font-weight: bold; color: #1f2937; margin: 5px 0; }
            .notes { margin-top: 20px; padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            
            <div class="voucher-title">سند إخراج بضاعة</div>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <div class="info-item">
                <span class="label">رقم السند:</span>
                <span class="value">${voucher.voucherNumber}</span>
              </div>
              <div class="info-item">
                <span class="label">تاريخ الإنشاء:</span>
                <span class="value">${new Date(voucher.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
            <div class="info-box">
              <div class="info-item">
                <span class="label">العميل:</span>
                <span class="value">${voucher.clientName}</span>
              </div>
              <div class="info-item">
                <span class="label">الحالة:</span>
                <span class="value">${voucher.status === 'completed' ? 'مكتمل' : voucher.status === 'approved' ? 'موافق عليه' : 'معلق'}</span>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>م</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${voucher.items?.map((item: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice} ر.س</td>
                  <td>${item.total} ر.س</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">إجمالي الكمية: ${voucher.totalQuantity}</div>
            <div class="total-row">إجمالي المبلغ: ${parseFloat(voucher.totalAmount || 0).toLocaleString('en-US')} ر.س</div>
          </div>
          
          ${voucher.notes ? `
            <div class="notes">
              <strong>ملاحظات:</strong><br>
              ${voucher.notes}
            </div>
          ` : ''}
          
          <div class="footer">
            تم إنشاء هذا السند بواسطة نظام المحاسب الأعظم - ${new Date().toLocaleDateString('en-GB')}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* العنوان والإحصائيات */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">سندات إخراج البضاعة</h1>
          <p className="text-gray-600 mt-2">إدارة سندات إخراج البضاعة للعملاء</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السندات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString('en-US')} ر.س</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات معلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingVouchers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سندات مكتملة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedVouchers}</div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في السندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="حالة السند" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة سند إخراج
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة سند إخراج بضاعة جديد</DialogTitle>
                </DialogHeader>
                <GoodsIssueVoucherForm 
                  onSubmit={(data) => createVoucherMutation.mutate(data)}
                  clients={clients}
                  products={products}
                  isSubmitting={createVoucherMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* جدول السندات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات الإخراج</CardTitle>
          <CardDescription>
            عرض وإدارة جميع سندات إخراج البضاعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد سندات إخراج متاحة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم السند</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>إجمالي الكمية</TableHead>
                  <TableHead>إجمالي المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher: any) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                    <TableCell>{voucher.clientName}</TableCell>
                    <TableCell>{voucher.totalQuantity}</TableCell>
                    <TableCell>{parseFloat(voucher.totalAmount || 0).toLocaleString('en-US')} ر.س</TableCell>
                    <TableCell>
                      <Badge variant={
                        voucher.status === 'completed' ? 'default' :
                        voucher.status === 'approved' ? 'secondary' : 'outline'
                      }>
                        {voucher.status === 'completed' ? 'مكتمل' :
                         voucher.status === 'approved' ? 'موافق عليه' : 'معلق'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(voucher.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewVoucher(voucher)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintVoucher(voucher)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          className="text-red-600 hover:text-red-700"
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

      {/* نافذة معاينة السند */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة سند إخراج البضاعة</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <VoucherPreview voucher={selectedVoucher} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// نموذج إضافة سند إخراج
function GoodsIssueVoucherForm({ 
  onSubmit, 
  clients, 
  products, 
  isSubmitting 
}: { 
  onSubmit: (data: any) => void;
  clients: any[];
  products: any[];
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    voucherNumber: `GIV-${Date.now()}`,
    clientId: '',
    clientName: '',
    notes: '',
    items: [] as any[]
  });

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    total: 0
  });

  const addItem = () => {
    if (currentItem.productId && currentItem.quantity && currentItem.unitPrice) {
      const item = {
        ...currentItem,
        quantity: parseInt(currentItem.quantity),
        unitPrice: parseFloat(currentItem.unitPrice),
        total: parseInt(currentItem.quantity) * parseFloat(currentItem.unitPrice)
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, item]
      }));
      setCurrentItem({
        productId: '',
        productName: '',
        quantity: '',
        unitPrice: '',
        total: 0
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setCurrentItem(prev => ({
        ...prev,
        productId,
        productName: product.name,
        unitPrice: product.salePrice || product.purchasePrice || '0'
      }));
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.clientId || formData.items.length === 0) {
      return;
    }

    const totalQuantity = formData.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);

    onSubmit({
      ...formData,
      totalQuantity,
      totalAmount: totalAmount.toString(),
      status: 'completed'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="voucherNumber">رقم السند</Label>
          <Input
            id="voucherNumber"
            value={formData.voucherNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, voucherNumber: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="client">العميل</Label>
          <Select value={formData.clientId} onValueChange={handleClientChange}>
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
      </div>

      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="أدخل ملاحظات السند..."
        />
      </div>

      {/* إضافة صنف */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">إضافة صنف</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>المنتج</Label>
            <Select value={currentItem.productId} onValueChange={handleProductChange}>
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
          </div>
          <div>
            <Label>الكمية</Label>
            <Input
              type="number"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: e.target.value }))}
            />
          </div>
          <div>
            <Label>سعر الوحدة</Label>
            <Input
              type="number"
              value={currentItem.unitPrice}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              إضافة
            </Button>
          </div>
        </div>
      </div>

      {/* قائمة الأصناف */}
      {formData.items.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">الأصناف المضافة</h3>
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
              {formData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice} ر.س</TableCell>
                  <TableCell>{item.total} ر.س</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600"
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

      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.clientId || formData.items.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ السند'}
        </Button>
      </div>
    </div>
  );
}

// مكون معاينة السند
function VoucherPreview({ voucher }: { voucher: GoodsIssueVoucher }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رقم السند</Label>
          <div className="text-lg font-medium">{voucher.voucherNumber}</div>
        </div>
        <div>
          <Label>العميل</Label>
          <div className="text-lg font-medium">{voucher.clientName}</div>
        </div>
        <div>
          <Label>إجمالي الكمية</Label>
          <div className="text-lg font-medium">{voucher.totalQuantity}</div>
        </div>
        <div>
          <Label>إجمالي المبلغ</Label>
          <div className="text-lg font-medium">{parseFloat(voucher.totalAmount.toString()).toLocaleString('en-US')} ر.س</div>
        </div>
      </div>

      {voucher.notes && (
        <div>
          <Label>ملاحظات</Label>
          <div className="text-gray-700">{voucher.notes}</div>
        </div>
      )}

      <div>
        <Label>الأصناف</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>سعر الوحدة</TableHead>
              <TableHead>الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voucher.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unitPrice} ر.س</TableCell>
                <TableCell>{item.total} ر.س</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}