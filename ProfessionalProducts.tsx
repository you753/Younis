import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  TrendingUp,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@shared/schema';
import * as XLSX from 'xlsx';

interface ProductFormData {
  name: string;
  code: string;
  barcode?: string;
  description?: string;
  category?: string;
  salePrice?: number;
  purchasePrice?: number;
  quantity?: number;
  unit?: string;
  minStock?: number;
  maxStock?: number;
}

export default function ProfessionalProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    barcode: '',
    description: '',
    category: '',
    salePrice: 0,
    purchasePrice: 0,
    quantity: 0,
    unit: 'قطعة',
    minStock: 0,
    maxStock: 100
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب بيانات المنتجات
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // فلترة المنتجات بناءً على البحث
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalProducts: products.length,
    lowStockProducts: products.filter(p => (p.quantity || 0) < (p.minStock || 5)).length,
    outOfStockProducts: products.filter(p => (p.quantity || 0) === 0).length,
    totalValue: products.reduce((sum, p) => sum + ((p.salePrice || 0) * (p.quantity || 0)), 0)
  };

  // إضافة منتج جديد
  const addProductMutation = useMutation({
    mutationFn: (productData: ProductFormData) => 
      apiRequest('POST', '/api/products', productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAddDialog(false);
      resetForm();
      toast({
        title: "تم إضافة المنتج بنجاح",
        description: "تم إضافة المنتج الجديد إلى المخزون",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    }
  });

  // تعديل منتج
  const editProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      apiRequest('PUT', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowEditDialog(false);
      resetForm();
      toast({
        title: "تم تحديث المنتج بنجاح",
        description: "تم تحديث بيانات المنتج بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث المنتج",
        description: "حدث خطأ أثناء تحديث المنتج",
        variant: "destructive",
      });
    }
  });

  // حذف منتج
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowDeleteDialog(false);
      toast({
        title: "تم حذف المنتج بنجاح",
        description: "تم حذف المنتج من المخزون",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف المنتج",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      barcode: '',
      description: '',
      category: '',
      salePrice: 0,
      purchasePrice: 0,
      quantity: 0,
      unit: 'قطعة',
      minStock: 0,
      maxStock: 100
    });
    setSelectedProduct(null);
  };

  const handleAdd = () => {
    setShowAddDialog(true);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      code: product.code || '',
      barcode: product.barcode || '',
      description: product.description || '',
      category: product.category || '',
      salePrice: product.salePrice || 0,
      purchasePrice: product.purchasePrice || 0,
      quantity: product.quantity || 0,
      unit: product.unit || 'قطعة',
      minStock: product.minStock || 0,
      maxStock: product.maxStock || 100
    });
    setShowEditDialog(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleSubmit = () => {
    if (selectedProduct) {
      editProductMutation.mutate({ id: selectedProduct.id, data: formData });
    } else {
      addProductMutation.mutate(formData);
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  // استيراد Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const importFromExcel = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      for (const row of jsonData) {
        try {
          const productData = {
            name: (row as any)['اسم المنتج'] || (row as any)['name'] || '',
            code: (row as any)['الكود'] || (row as any)['code'] || '',
            barcode: (row as any)['الباركود'] || (row as any)['barcode'] || '',
            description: (row as any)['الوصف'] || (row as any)['description'] || '',
            category: (row as any)['الفئة'] || (row as any)['category'] || '',
            salePrice: parseFloat((row as any)['سعر البيع'] || (row as any)['salePrice'] || '0'),
            purchasePrice: parseFloat((row as any)['سعر الشراء'] || (row as any)['purchasePrice'] || '0'),
            quantity: parseInt((row as any)['الكمية'] || (row as any)['quantity'] || '0'),
            unit: (row as any)['الوحدة'] || (row as any)['unit'] || 'قطعة',
            minStock: parseInt((row as any)['الحد الأدنى'] || (row as any)['minStock'] || '0'),
            maxStock: parseInt((row as any)['الحد الأقصى'] || (row as any)['maxStock'] || '100')
          };

          await apiRequest('POST', '/api/products', productData);
          successCount++;
        } catch (error) {
          console.error('Error importing product:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowImportDialog(false);
      setSelectedFile(null);
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${successCount} منتج من ملف Excel`,
      });
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد الملف",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'اسم المنتج': 'مثال على منتج',
      'الكود': 'PROD001',
      'الباركود': '1234567890123',
      'الوصف': 'وصف المنتج',
      'الفئة': 'إلكترونيات',
      'سعر البيع': '100.00',
      'سعر الشراء': '80.00',
      'الكمية': '50',
      'الوحدة': 'قطعة',
      'الحد الأدنى': '10',
      'الحد الأقصى': '100'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
    XLSX.writeFile(wb, 'نموذج_استيراد_المنتجات.xlsx');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الأصناف</h1>
              <p className="text-gray-600">إدارة وتنظيم جميع المنتجات في المخزون</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowImportDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="h-4 w-4 ml-2" />
                استيراد من Excel
              </Button>
              <Button 
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">منتجات متوفرة</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalProducts - stats.outOfStockProducts}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">مخزون منخفض</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">نفدت الكمية</p>
                  <p className="text-3xl font-bold text-red-600">{stats.outOfStockProducts}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-xl">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن منتج (الاسم، الكود، الفئة...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات التي تحتاج متابعة</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">ابدأ بإضافة منتجات جديدة إلى المخزون</p>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منتج جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <Badge variant="outline">كود: {product.code}</Badge>
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>الكمية: {product.quantity || 0}</span>
                        <span>السعر: {(product.salePrice || 0).toLocaleString('en-US')} ر.س</span>
                        {(product.quantity || 0) < (product.minStock || 5) && (
                          <Badge variant="destructive" className="text-xs">
                            مخزون منخفض
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(product)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                        title="معاينة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="text-green-600 hover:text-green-700 border-green-200"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-700 border-red-200"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Product Dialog */}
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <Label htmlFor="code">الكود</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="كود المنتج"
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="فئة المنتج"
                />
              </div>
              <div>
                <Label htmlFor="unit">الوحدة</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="الوحدة"
                />
              </div>
              <div>
                <Label htmlFor="salePrice">سعر البيع</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purchasePrice">سعر الشراء</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minStock">الحد الأدنى للمخزون</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="وصف المنتج"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={addProductMutation.isPending || editProductMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {selectedProduct ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Product Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المنتج</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">معلومات أساسية</h4>
                    <p><strong>الاسم:</strong> {selectedProduct.name}</p>
                    <p><strong>الكود:</strong> {selectedProduct.code}</p>
                    <p><strong>الفئة:</strong> {selectedProduct.category || 'غير محدد'}</p>
                    <p><strong>الوحدة:</strong> {selectedProduct.unit || 'قطعة'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">الأسعار والكميات</h4>
                    <p><strong>سعر البيع:</strong> {(selectedProduct.salePrice || 0).toLocaleString('en-US')} ر.س</p>
                    <p><strong>سعر الشراء:</strong> {(selectedProduct.purchasePrice || 0).toLocaleString('en-US')} ر.س</p>
                    <p><strong>الكمية المتوفرة:</strong> {selectedProduct.quantity || 0}</p>
                    <p><strong>الحد الأدنى:</strong> {selectedProduct.minStock || 0}</p>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">الوصف</h4>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من رغبتك في حذف المنتج "{selectedProduct?.name}"؟
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>استيراد منتجات من Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">اختر ملف Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل نموذج Excel
              </Button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={importFromExcel}
                disabled={!selectedFile || isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? 'جاري الاستيراد...' : 'استيراد'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}