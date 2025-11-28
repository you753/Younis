import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Barcode,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Database
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  category?: string;
  categoryId?: number;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  barcode?: string;
  supplier?: string;
  supplierId?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function BranchProductsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنتجات
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    refetchInterval: 5000
  });

  // جلب فئات المنتجات
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/product-categories'],
  });

  // حذف منتج
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف المنتج');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف المنتج بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    },
  });

  // تعديل منتج
  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('فشل في تعديل المنتج');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowEdit(false);
      setSelectedProduct(null);
      toast({
        title: "تم بنجاح",
        description: "تم تعديل المنتج بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تعديل المنتج",
        variant: "destructive",
      });
    },
  });

  // تصفية المنتجات
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId?.toString() === selectedCategory;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         (statusFilter === 'low-stock' && product.quantity <= product.minQuantity);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // حذف منتج
  const handleDeleteProduct = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProductMutation.mutate(id);
    }
  };

  // معاينة منتج
  const handlePreviewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowPreview(true);
  };

  // تعديل منتج
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData(product);
    setShowEdit(true);
  };

  // حفظ التعديل
  const handleSaveEdit = () => {
    if (selectedProduct) {
      updateProductMutation.mutate({
        ...selectedProduct,
        ...editFormData
      });
    }
  };

  // إحصائيات
  const totalProducts = products.length;
  const activeProducts = products.filter((p: Product) => p.isActive).length;
  const lowStockProducts = products.filter((p: Product) => p.quantity <= p.minQuantity).length;
  const totalValue = products.reduce((sum: number, product: Product) => 
    sum + (product.quantity * product.purchasePrice), 0
  );

  // الحصول على حالة المخزون
  const getStockStatus = (product: Product) => {
    if (product.quantity <= product.minQuantity) return 'low';
    if (product.quantity >= product.maxQuantity) return 'high';
    return 'normal';
  };

  // الحصول على لون شارة الحالة
  const getStatusBadgeColor = (product: Product) => {
    if (!product.isActive) return 'bg-gray-500';
    const stockStatus = getStockStatus(product);
    if (stockStatus === 'low') return 'bg-red-500';
    if (stockStatus === 'high') return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* العنوان والإحصائيات */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">قائمة الأصناف</h1>
          <p className="text-gray-600 mt-2">إدارة شاملة لجميع أصناف المنتجات</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">جميع المنتجات في النظام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">منتجات متاحة للبيع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">تحتاج إعادة تموين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalValue.toLocaleString('en-US')} ر.س
            </div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة الشراء</p>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الأصناف... (الاسم، الكود، الباركود)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="low-stock">مخزون منخفض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            قائمة الأصناف ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد منتجات تطابق البحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4 font-medium">الكود</th>
                    <th className="text-right p-4 font-medium">اسم المنتج</th>
                    <th className="text-right p-4 font-medium">الفئة</th>
                    <th className="text-right p-4 font-medium">الكمية</th>
                    <th className="text-right p-4 font-medium">سعر الشراء</th>
                    <th className="text-right p-4 font-medium">سعر البيع</th>
                    <th className="text-right p-4 font-medium">الحالة</th>
                    <th className="text-center p-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: Product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{product.code}</Badge>
                          {product.barcode && <Barcode className="h-4 w-4 text-gray-400" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {categories.find((c: any) => c.id === product.categoryId)?.name || 'غير محدد'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            product.quantity <= product.minQuantity ? 'text-red-600' : 
                            product.quantity >= product.maxQuantity ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {product.quantity}
                          </span>
                          {product.quantity <= product.minQuantity && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {product.purchasePrice.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="p-4 font-medium text-green-600">
                        {product.salePrice.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusBadgeColor(product)} text-white`}>
                          {!product.isActive ? 'غير نشط' :
                           getStockStatus(product) === 'low' ? 'مخزون منخفض' :
                           getStockStatus(product) === 'high' ? 'مخزون عالي' : 'طبيعي'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewProduct(product)}
                            className="text-blue-600 hover:text-blue-800"
                            title="معاينة التفاصيل"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="text-green-600 hover:text-green-800"
                            title="تعديل المنتج"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                            title="حذف المنتج"
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
          )}
        </CardContent>
      </Card>

      {/* مودال معاينة المنتج */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              تفاصيل المنتج
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">اسم المنتج</Label>
                    <p className="text-lg font-medium">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">كود المنتج</Label>
                    <p className="font-medium">{selectedProduct.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الباركود</Label>
                    <p className="font-medium">{selectedProduct.barcode || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الفئة</Label>
                    <p className="font-medium">
                      {categories.find((c: any) => c.id === selectedProduct.categoryId)?.name || 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الكمية الحالية</Label>
                    <p className="text-lg font-medium text-blue-600">{selectedProduct.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الحد الأدنى</Label>
                    <p className="font-medium">{selectedProduct.minQuantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">سعر الشراء</Label>
                    <p className="font-medium">{selectedProduct.purchasePrice.toLocaleString('en-US')} ر.س</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">سعر البيع</Label>
                    <p className="text-lg font-medium text-green-600">
                      {selectedProduct.salePrice.toLocaleString('en-US')} ر.س
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedProduct.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">الوصف</Label>
                  <p className="mt-1 text-gray-700">{selectedProduct.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">الحالة</Label>
                  <Badge className={`mt-1 ${getStatusBadgeColor(selectedProduct)} text-white`}>
                    {!selectedProduct.isActive ? 'غير نشط' :
                     getStockStatus(selectedProduct) === 'low' ? 'مخزون منخفض' :
                     getStockStatus(selectedProduct) === 'high' ? 'مخزون عالي' : 'طبيعي'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">هامش الربح</Label>
                  <p className="text-lg font-medium text-purple-600">
                    {((selectedProduct.salePrice - selectedProduct.purchasePrice) / selectedProduct.purchasePrice * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* مودال تعديل المنتج */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              تعديل المنتج
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم المنتج</Label>
                  <Input
                    id="name"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="code">كود المنتج</Label>
                  <Input
                    id="code"
                    value={editFormData.code || ''}
                    onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="purchasePrice">سعر الشراء</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={editFormData.purchasePrice || ''}
                    onChange={(e) => setEditFormData({...editFormData, purchasePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">سعر البيع</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={editFormData.salePrice || ''}
                    onChange={(e) => setEditFormData({...editFormData, salePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editFormData.quantity || ''}
                    onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="minQuantity">الحد الأدنى</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={editFormData.minQuantity || ''}
                    onChange={(e) => setEditFormData({...editFormData, minQuantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEdit(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={updateProductMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}