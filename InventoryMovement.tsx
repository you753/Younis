import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, TrendingUp, TrendingDown, Filter, Search, Eye, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType: string;
  referenceId?: number;
  referenceNumber?: string;
  notes?: string;
  branchId?: number;
  createdBy?: number;
  movementDate: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: string;
}

export default function InventoryMovementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory movements
  const { data: movements = [], isLoading } = useQuery<InventoryMovement[]>({
    queryKey: ['/api/inventory-movements'],
  });

  // Fetch products for the dropdown
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Create movement mutation
  const createMovementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/inventory-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create movement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      toast({
        title: "تم إنشاء الحركة بنجاح",
        description: "تم تسجيل حركة المخزون وتحديث الكميات تلقائياً",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء حركة المخزون",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      productId: parseInt(formData.get('productId') as string),
      movementType: formData.get('movementType'),
      quantity: parseInt(formData.get('quantity') as string),
      referenceType: formData.get('referenceType') || 'manual',
      referenceNumber: formData.get('referenceNumber') || '',
      notes: formData.get('notes') || '',
      movementDate: formData.get('movementDate') || new Date().toISOString().split('T')[0],
      branchId: 1, // Default branch
      createdBy: 1, // Default user
    };

    createMovementMutation.mutate(data);
  };

  // Filter movements based on search and filters
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = movement.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || movement.movementType === filterType;
    const matchesProduct = filterProduct === 'all' || movement.productId.toString() === filterProduct;
    
    return matchesSearch && matchesType && matchesProduct;
  });

  // Calculate statistics
  const totalIn = movements.filter((m) => m.movementType === 'in').reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter((m) => m.movementType === 'out').reduce((sum, m) => sum + m.quantity, 0);
  const totalAdjustments = movements.filter((m) => m.movementType === 'adjustment').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">حركات المخزون</h1>
          <p className="text-gray-600 mt-2">إدارة وتتبع جميع حركات المخزون الواردة والصادرة</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة حركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة حركة مخزون جديدة</DialogTitle>
              <DialogDescription>
                قم بتسجيل حركة مخزون جديدة لتحديث كميات المنتجات
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">المنتج</label>
                <Select name="productId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {product.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع الحركة</label>
                <Select name="movementType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">وارد</SelectItem>
                    <SelectItem value="out">صادر</SelectItem>
                    <SelectItem value="adjustment">تسوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الكمية</label>
                <Input 
                  name="quantity" 
                  type="number" 
                  min="1" 
                  required 
                  placeholder="أدخل الكمية" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع المرجع</label>
                <Select name="referenceType" defaultValue="manual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">يدوي</SelectItem>
                    <SelectItem value="sale">بيع</SelectItem>
                    <SelectItem value="purchase">شراء</SelectItem>
                    <SelectItem value="return">مرتجع</SelectItem>
                    <SelectItem value="adjustment">تسوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم المرجع</label>
                <Input 
                  name="referenceNumber" 
                  placeholder="رقم الفاتورة أو المرجع (اختياري)" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">تاريخ الحركة</label>
                <Input 
                  name="movementDate" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <Textarea 
                  name="notes" 
                  placeholder="أضف ملاحظات إضافية (اختياري)" 
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createMovementMutation.isPending}
                >
                  {createMovementMutation.isPending ? 'جاري الحفظ...' : 'حفظ الحركة'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحركات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground">
              جميع حركات المخزون
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكمية الواردة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIn}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي الكميات الواردة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكمية الصادرة</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalOut}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي الكميات الصادرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التسويات</CardTitle>
            <Edit className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAdjustments}</div>
            <p className="text-xs text-muted-foreground">
              عدد التسويات المسجلة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فلترة وبحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث في المنتجات أو المراجع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="in">وارد</SelectItem>
                <SelectItem value="out">صادر</SelectItem>
                <SelectItem value="adjustment">تسوية</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنتجات</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterProduct('all');
              }}
            >
              <Filter className="w-4 h-4 ml-2" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة حركات المخزون</CardTitle>
          <CardDescription>
            عرض تفصيلي لجميع حركات المخزون مع إمكانية الفلترة والبحث
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد حركات مخزون</p>
              <p className="text-sm text-gray-400 mt-1">قم بإضافة حركة مخزون جديدة للبدء</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">المنتج</th>
                    <th className="text-right p-3 font-medium">نوع الحركة</th>
                    <th className="text-right p-3 font-medium">الكمية</th>
                    <th className="text-right p-3 font-medium">المرجع</th>
                    <th className="text-right p-3 font-medium">ملاحظات</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(movement.movementDate), 'yyyy/MM/dd', { locale: ar })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{movement.productName}</div>
                          <div className="text-sm text-gray-500">{movement.productCode}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="outline"
                          className={`
                            ${movement.movementType === 'in' ? 'border-green-500 text-green-700 bg-green-50' : ''}
                            ${movement.movementType === 'out' ? 'border-red-500 text-red-700 bg-red-50' : ''}
                            ${movement.movementType === 'adjustment' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                          `}
                        >
                          {movement.movementType === 'in' && 'وارد'}
                          {movement.movementType === 'out' && 'صادر'}
                          {movement.movementType === 'adjustment' && 'تسوية'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${
                          movement.movementType === 'in' ? 'text-green-600' : 
                          movement.movementType === 'out' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {movement.movementType === 'in' ? '+' : movement.movementType === 'out' ? '-' : '±'}{movement.quantity}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="text-sm text-gray-600">{movement.referenceType}</div>
                          {movement.referenceNumber && (
                            <div className="text-xs text-gray-500">{movement.referenceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {movement.notes || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}