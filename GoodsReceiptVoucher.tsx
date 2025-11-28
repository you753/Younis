import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Package, 
  CheckCircle, 
  Clock, 
  FileText, 
  Edit, 
  Trash2, 
  Search,
  Truck,
  Warehouse,
  ShoppingCart,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SearchBox from '@/components/SearchBox';

interface GoodsReceiptItem {
  productId: number;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
  condition: 'good' | 'damaged' | 'missing';
  notes?: string;
}

interface GoodsReceipt {
  id: number;
  voucherNumber: string;
  purchaseOrderId?: number;
  supplierId: number;
  supplierName: string;
  receivedBy: string;
  receivedDate: Date;
  status: 'pending' | 'completed' | 'partial';
  totalItems: number;
  totalValue: number;
  notes?: string;
  items: GoodsReceiptItem[];
}

export default function GoodsReceiptVoucher() {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<GoodsReceipt | null>(null);
  const [items, setItems] = useState<Array<{id: string, productId: string, productName: string, orderedQuantity: number, receivedQuantity: number, unitPrice: string, condition: string}>>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('سند إدخال بضاعة');
  }, [setCurrentPage]);

  // Fetch suppliers data
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: true
  });

  // Fetch products data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: true
  });



  // Sample data - replace with actual API calls
  const goodsReceipts: GoodsReceipt[] = [
    {
      id: 1,
      voucherNumber: 'GRV-2025-001',
      purchaseOrderId: 1,
      supplierId: 1,
      supplierName: 'مورد الأجهزة الإلكترونية',
      receivedBy: 'أحمد محمد',
      receivedDate: new Date('2025-01-20'),
      status: 'completed',
      totalItems: 5,
      totalValue: 15000,
      notes: 'تم استلام البضاعة بحالة جيدة',
      items: [
        {
          productId: 1,
          productName: 'جهاز كمبيوتر',
          orderedQuantity: 5,
          receivedQuantity: 5,
          unitPrice: 3000,
          total: 15000,
          condition: 'good'
        }
      ]
    },
    {
      id: 2,
      voucherNumber: 'GRV-2025-002',
      supplierId: 2,
      supplierName: 'مورد القرطاسية',
      receivedBy: 'فاطمة أحمد',
      receivedDate: new Date('2025-01-21'),
      status: 'partial',
      totalItems: 120,
      totalValue: 2300,
      notes: 'نقص في بعض الكميات',
      items: [
        {
          productId: 2,
          productName: 'أوراق A4',
          orderedQuantity: 20,
          receivedQuantity: 18,
          unitPrice: 50,
          total: 900,
          condition: 'good'
        },
        {
          productId: 3,
          productName: 'أقلام',
          orderedQuantity: 100,
          receivedQuantity: 100,
          unitPrice: 15,
          total: 1500,
          condition: 'good'
        }
      ]
    }
  ];

  // Fetch real suppliers data
  const { data: realSuppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Item management functions
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      orderedQuantity: 1,
      receivedQuantity: 1,
      unitPrice: '0',
      condition: 'good'
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setItems(newItems);
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
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />في الانتظار</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />مكتمل</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Package className="h-3 w-3 mr-1" />جزئي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'good':
        return <Badge variant="outline" className="text-green-600 border-green-600">جيد</Badge>;
      case 'damaged':
        return <Badge variant="outline" className="text-red-600 border-red-600">معطوب</Badge>;
      case 'missing':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">ناقص</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const filteredVouchers = goodsReceipts.filter(voucher => {
    if (!searchQuery.trim()) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      voucher.voucherNumber.toLowerCase().includes(searchTerm) ||
      voucher.supplierName.toLowerCase().includes(searchTerm) ||
      voucher.receivedBy.toLowerCase().includes(searchTerm)
    );
  });

  // Calculate stats
  const totalVouchers = goodsReceipts.length;
  const completedVouchers = goodsReceipts.filter(v => v.status === 'completed').length;
  const partialVouchers = goodsReceipts.filter(v => v.status === 'partial').length;
  const totalValue = goodsReceipts.reduce((sum, voucher) => sum + voucher.totalValue, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">سند إدخال بضاعة</h1>
          <p className="text-muted-foreground">إدارة استلام البضائع والمخزون</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          سند إدخال جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي السندات</p>
                <p className="text-2xl font-bold text-blue-700">{totalVouchers}</p>
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
                <p className="text-green-600 text-sm font-medium">مكتملة</p>
                <p className="text-2xl font-bold text-green-700">{completedVouchers}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">جزئية</p>
                <p className="text-2xl font-bold text-orange-700">{partialVouchers}</p>
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
                <p className="text-2xl font-bold text-purple-700">{formatAmount(totalValue)}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Warehouse className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="البحث في سندات الإدخال..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات إدخال البضاعة</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                    <TableCell>{voucher.supplierName}</TableCell>
                    <TableCell>{voucher.receivedBy}</TableCell>
                    <TableCell>
                      {format(voucher.receivedDate, 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>{voucher.totalItems}</TableCell>
                    <TableCell>{formatAmount(voucher.totalValue)}</TableCell>
                    <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingVoucher(voucher);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    لا توجد سندات إدخال بضاعة تطابق البحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Voucher Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? 'تعديل سند إدخال بضاعة' : 'سند إدخال بضاعة جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voucher-number">رقم السند</Label>
                <Input
                  id="voucher-number"
                  defaultValue={editingVoucher?.voucherNumber || `GRV-${Date.now()}`}
                  placeholder="رقم السند"
                />
              </div>
              <div>
                <Label htmlFor="supplier">المورد</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(suppliers) && suppliers
                      .filter((supplier: any) => supplier.id && supplier.name)
                      .map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="received-by">المستلم</Label>
                <Input
                  id="received-by"
                  defaultValue={editingVoucher?.receivedBy || ''}
                  placeholder="اسم المستلم"
                />
              </div>
              <div>
                <Label htmlFor="received-date">تاريخ الاستلام</Label>
                <Input
                  id="received-date"
                  type="date"
                  defaultValue={editingVoucher ? format(editingVoucher.receivedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>الأصناف المستلمة</Label>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة صنف
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصنف</TableHead>
                    <TableHead>الكمية المطلوبة</TableHead>
                    <TableHead>الكمية المستلمة</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingVoucher?.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.orderedQuantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={item.receivedQuantity}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{formatAmount(item.unitPrice)}</TableCell>
                      <TableCell>{formatAmount(item.total)}</TableCell>
                      <TableCell>{getConditionBadge(item.condition)}</TableCell>
                      <TableCell>
                        <Input
                          defaultValue={item.notes || ''}
                          placeholder="ملاحظات"
                          className="w-32"
                        />
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                        لا توجد أصناف مضافة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                defaultValue={editingVoucher?.notes || ''}
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                حفظ السند
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}