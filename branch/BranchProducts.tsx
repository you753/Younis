import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Search, Plus, Eye, Edit, Trash2, DollarSign, AlertTriangle, CheckCircle, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import ProtectedSection from '@/components/ProtectedSection';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';
import type { Product, ProductCategory } from '@shared/schema';

interface BranchProductsProps {
  branchId?: number;
}

export default function BranchProducts({ branchId }: BranchProductsProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="products">
      <BranchProductsContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchProductsContent({ branchId }: { branchId: number }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [priceEditForm, setPriceEditForm] = useState({
    salePrice: 0,
    purchasePrice: 0
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // حالة نموذج إضافة المنتج
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    barcode: '',
    category: '',
    purchasePrice: 0,
    salePrice: 0,
    quantity: 0,
    minStock: 5,
    unit: 'قطعة',
    supplier: ''
  });

  // جلب البيانات الحقيقية من API
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/products${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000 // تحديث كل ثانيتين
  });

  // جلب فئات الأصناف
  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: branchId ? [`/api/product-categories?branchId=${branchId}`] : ['/api/product-categories'],
    refetchInterval: 2000,
    enabled: !!branchId
  });

  console.log('الفئات المحملة:', categories);
  console.log('المنتجات المحملة:', products);

  // وظيفة إضافة المنتج الجديد
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.salePrice) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          code: newProduct.code || `PRD-${Date.now()}`,
          barcode: newProduct.barcode || `${Date.now()}`,
          category: newProduct.category || 'عام',
          isActive: true,
          branchId: branchId // إضافة رقم الفرع
        })
      });

      if (response.ok) {
        toast({
          title: 'تم الحفظ بنجاح',
          description: `تم إضافة المنتج "${newProduct.name}" إلى قائمة الأصناف`,
          variant: 'default'
        });
        
        // إعادة تعيين النموذج
        setNewProduct({
          name: '',
          code: '',
          barcode: '',
          category: '',
          purchasePrice: 0,
          salePrice: 0,
          quantity: 0,
          minStock: 5,
          unit: 'قطعة',
          supplier: ''
        });
        
        setShowAddDialog(false);
        queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      } else {
        throw new Error('فشل في إضافة المنتج');
      }
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء إضافة المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    }
  };

  // وظيفة معاينة المنتج
  const handleViewProduct = (product: any) => {
    setViewingProduct(product);
    setShowViewDialog(true);
  };

  // وظيفة تعديل المنتج
  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setShowEditDialog(true);
  };

  // وظيفة حفظ التعديلات
  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingProduct,
          branchId: branchId // ✅ التأكد من الحفاظ على branchId عند التعديل
        })
      });

      if (response.ok) {
        toast({
          title: 'تم التحديث بنجاح',
          description: `تم تحديث المنتج "${editingProduct.name}"`,
          variant: 'default'
        });
        
        setShowEditDialog(false);
        setEditingProduct(null);
        queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
      } else {
        throw new Error('فشل في تحديث المنتج');
      }
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    }
  };

  // وظيفة تأكيد حذف المنتج
  const confirmDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  // وظيفة حذف المنتج
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: '✓ تم الحذف بنجاح',
          description: `تم حذف المنتج "${productToDelete.name}" من قائمة الأصناف`,
          variant: 'default'
        });
        // تحديث البيانات في الكاش
        queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });
        setShowDeleteDialog(false);
        setProductToDelete(null);
      } else {
        throw new Error('فشل في حذف المنتج');
      }
    } catch (error) {
      toast({
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء حذف المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // دوال استيراد Excel
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف Excel أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setImportProgress(30);

      const productsToImport = jsonData.map((row: any, index: number) => {
        setImportProgress(30 + (index / jsonData.length) * 50);
        
        return {
          name: row['اسم المنتج'] || row['Name'] || '',
          code: row['الكود'] || row['Code'] || `AUTO-${Date.now()}-${index}`,
          barcode: row['الباركود'] || row['Barcode'] || '',
          description: row['الوصف'] || row['Description'] || '',
          salePrice: row['السعر'] || row['Price'] || '0',
          purchasePrice: row['التكلفة'] || row['Cost'] || '0',
          category: row['الفئة'] || row['Category'] || 'أخرى',
          quantity: parseInt(row['الكمية'] || row['Quantity'] || '0'),
          minStock: parseInt(row['الحد الأدنى للمخزون'] || row['Min Quantity'] || '5'),
          unit: row['الوحدة'] || row['Unit'] || 'قطعة',
          isActive: true
        };
      });

      setImportProgress(80);

      let successCount = 0;
      let errorCount = 0;

      for (const product of productsToImport) {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...product,
              branchId: branchId // ✅ إضافة branchId لكل منتج مستورد
            }),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      setImportProgress(100);
      setImportResults({
        total: productsToImport.length,
        success: successCount,
        errors: errorCount,
        products: productsToImport.slice(0, 5)
      });

      queryClient.invalidateQueries({ queryKey: ['/api/products', branchId] });

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${successCount} صنف من أصل ${productsToImport.length}`,
      });

    } catch (error) {
      console.error('Error importing Excel:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء استيراد الملف',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportDialog = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
    setImportProgress(0);
    setImportResults(null);
    setIsImporting(false);
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        'اسم المنتج': 'مثال على منتج',
        'الكود': 'PROD001',
        'الباركود': '1234567890123',
        'الوصف': 'وصف المنتج',
        'السعر': '100.00',
        'التكلفة': '80.00',
        'الوحدة': 'قطعة',
        'الفئة': 'إلكترونيات',
        'الكمية': '10',
        'الحد الأدنى للمخزون': '5'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأصناف');
    
    const colWidths = [
      { width: 20 }, // اسم المنتج
      { width: 15 }, // الكود
      { width: 20 }, // الباركود
      { width: 30 }, // الوصف
      { width: 10 }, // السعر
      { width: 10 }, // التكلفة
      { width: 10 }, // الوحدة
      { width: 15 }, // الفئة
      { width: 10 }, // الكمية
      { width: 20 }  // الحد الأدنى
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'نموذج_استيراد_الأصناف.xlsx');
  };

  // تحويل البيانات لتطابق التصميم
  const enrichedProducts = products.map(product => ({
    ...product,
    profitMargin: product.salePrice && product.purchasePrice ? 
      ((product.salePrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1) : 0,
    status: product.quantity > (product.minStock || 5) ? 'في المخزون' : 
           product.quantity === 0 ? 'نفدت الكمية' : 'مخزون منخفض',
    supplier: product.supplier || 'غير محدد',
    lastPurchase: new Date().toLocaleDateString('en-GB'),
    lastSale: new Date().toLocaleDateString('en-GB'),
    unit: product.unit || 'قطعة',
    category: product.category || 'عام'
  }));

  // فلترة المنتجات بناءً على البحث والفلاتر
  const filteredProducts = enrichedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    
    // فلترة مرنة للفئة تعامل مع الاختلافات في كتابة "الكترونيات" vs "إلكترونيات"
    const matchesCategory = filterCategory === 'all' || 
                           product.category === filterCategory ||
                           product.category.replace('إ', 'ا') === filterCategory ||
                           filterCategory.replace('إ', 'ا') === product.category;
    
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const { currentPage, setCurrentPage, pageCount, paginatedData: paginatedProducts, startIndex, endIndex } = usePagination({
    data: filteredProducts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, filterCategory, filterStatus]
  });

  // الحصول على بادج الحالة
  const getStatusBadge = (status: string, quantity: number, minStock: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive" className="text-xs">نفدت الكمية</Badge>;
    } else if (quantity <= minStock) {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">مخزون منخفض</Badge>;
    } else {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800">في المخزون</Badge>;
    }
  };

  // الحصول على لون هامش الربح
  const getProfitMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-lg">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center text-red-600">
        <div className="text-lg">خطأ في تحميل البيانات</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الرأس */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قائمة الأصناف</h1>
            <p className="text-gray-600">إدارة أصناف المنتجات - الفرع {branchId}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* زر إضافة صنف احترافي */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg w-full sm:w-auto" data-testid="button-add-product">
                <Plus className="h-5 w-5 ml-2" />
                إضافة صنف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">إضافة صنف جديد</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="أدخل اسم المنتج"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">كود المنتج</Label>
                  <Input
                    id="code"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                    placeholder="كود المنتج (اختياري)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">الفئة</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عام">عام</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">الباركود</Label>
                  <Input
                    id="barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    placeholder="الباركود (اختياري)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchasePrice" className="text-sm font-medium text-gray-700">سعر الشراء</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={newProduct.purchasePrice}
                    onChange={(e) => setNewProduct({...newProduct, purchasePrice: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700">سعر البيع *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({...newProduct, salePrice: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minStock" className="text-sm font-medium text-gray-700">الحد الأدنى</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: parseInt(e.target.value) || 5})}
                    placeholder="5"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">الوحدة</Label>
                  <Input
                    id="unit"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    placeholder="قطعة"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier" className="text-sm font-medium text-gray-700">المورد</Label>
                  <Input
                    id="supplier"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    placeholder="اسم المورد"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  onClick={handleAddProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex-1"
                >
                  حفظ المنتج
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="px-6 py-2 rounded-lg flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
          
          {/* زر استيراد من Excel */}
          <Button 
            onClick={() => setShowImportDialog(true)} 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg w-full sm:w-auto"
            data-testid="button-import-excel"
          >
            <Upload className="h-5 w-5 ml-2" />
            استيراد من Excel
          </Button>
        </div>
      </div>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-xl font-bold text-gray-900">
                  {enrichedProducts.reduce((sum, p) => sum + (p.salePrice * p.quantity), 0).toLocaleString('en-US')} ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مخزون منخفض</p>
                <p className="text-xl font-bold text-gray-900">
                  {enrichedProducts.filter(p => p.quantity <= (p.minStock || 5) && p.quantity > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">متوفر</p>
                <p className="text-xl font-bold text-gray-900">
                  {enrichedProducts.filter(p => p.quantity > (p.minStock || 5)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="البحث في الأصناف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">جميع الفئات</option>
              {/* فئات من قاعدة البيانات */}
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
              {/* فئات إضافية من المنتجات الموجودة */}
              {Array.from(new Set(enrichedProducts.map(p => p.category)))
                .filter(cat => !categories.some(c => 
                  c.name === cat || 
                  c.name === cat.replace('إ', 'ا') ||
                  cat === c.name.replace('ا', 'إ')
                ))
                .map((category) => (
                  <option key={`extra-${category}`} value={category}>
                    {category}
                  </option>
                ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">جميع الحالات</option>
              <option value="في المخزون">في المخزون</option>
              <option value="مخزون منخفض">مخزون منخفض</option>
              <option value="نفدت الكمية">نفدت الكمية</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأصناف ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-4 text-right font-bold text-gray-900">اسم المنتج</th>
                  <th className="p-4 text-center font-bold text-gray-900">الكود</th>
                  <th className="p-4 text-center font-bold text-gray-900">الفئة</th>
                  <th className="p-4 text-center font-bold text-gray-900">السعر</th>
                  <th className="p-4 text-center font-bold text-gray-900">الكمية</th>
                  <th className="p-4 text-center font-bold text-gray-900">المورد</th>
                  <th className="p-4 text-center font-bold text-gray-900">الحالة</th>
                  <th className="p-4 text-center font-bold text-gray-900">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, index) => (
                  <tr key={product.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.barcode}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {product.code}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="text-lg font-bold text-green-600">
                            {product.salePrice?.toLocaleString('en-US')} ريال
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0 text-blue-600 border-blue-200 hover:bg-blue-50" 
                            title="تعديل السعر"
                            onClick={() => handleEditPrice(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          شراء: {product.purchasePrice?.toLocaleString('en-US')} ريال
                        </div>
                        <div className={`text-xs font-medium ${getProfitMarginColor(product.profitMargin)}`}>
                          ربح: {product.profitMargin}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-gray-900 text-center">{product.quantity}</div>
                      <div className="text-xs text-gray-500 text-center">
                        حد أدنى: {product.minStock || 5}
                      </div>
                      <div className="text-xs text-blue-600 text-center">{product.unit}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 text-center">{product.supplier}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {getStatusBadge(product.status, product.quantity, product.minStock || 5)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200" 
                          title="عرض التفاصيل"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200" 
                          title="تعديل"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8 bg-red-600 hover:bg-red-700" 
                          title="حذف"
                          onClick={() => confirmDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على أصناف تطابق معايير البحث</p>
              <Button onClick={() => {setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all');}}>
                مسح جميع الفلاتر
              </Button>
            </div>
          )}

          {filteredProducts.length > 10 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredProducts.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemName="منتج"
            />
          )}
        </CardContent>
      </Card>

      {/* نموذج التعديل الاحترافي */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">تعديل المنتج</DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">اسم المنتج</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-code" className="text-sm font-medium text-gray-700">كود المنتج</Label>
                  <Input
                    id="edit-code"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700">الفئة</Label>
                  <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عام">عام</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-barcode" className="text-sm font-medium text-gray-700">الباركود</Label>
                  <Input
                    id="edit-barcode"
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-purchasePrice" className="text-sm font-medium text-gray-700">سعر الشراء</Label>
                  <Input
                    id="edit-purchasePrice"
                    type="number"
                    value={editingProduct.purchasePrice || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, purchasePrice: parseFloat(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-salePrice" className="text-sm font-medium text-gray-700">سعر البيع</Label>
                  <Input
                    id="edit-salePrice"
                    type="number"
                    value={editingProduct.salePrice}
                    onChange={(e) => setEditingProduct({...editingProduct, salePrice: parseFloat(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-quantity" className="text-sm font-medium text-gray-700">الكمية</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-minStock" className="text-sm font-medium text-gray-700">الحد الأدنى</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    value={editingProduct.minStock || 5}
                    onChange={(e) => setEditingProduct({...editingProduct, minStock: parseInt(e.target.value) || 5})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit" className="text-sm font-medium text-gray-700">الوحدة</Label>
                  <Input
                    id="edit-unit"
                    value={editingProduct.unit || 'قطعة'}
                    onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-supplier" className="text-sm font-medium text-gray-700">المورد</Label>
                  <Input
                    id="edit-supplier"
                    value={editingProduct.supplier || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, supplier: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex-1"
                >
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-2 rounded-lg flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نموذج المعاينة الاحترافي */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">تفاصيل المنتج</DialogTitle>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-6 mt-4">
              {/* معلومات أساسية */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-900 mb-3">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">اسم المنتج:</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{viewingProduct.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">كود المنتج:</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{viewingProduct.code}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">الفئة:</span>
                    <Badge variant="secondary" className="mt-1">{viewingProduct.category || 'عام'}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">الباركود:</span>
                    <p className="text-lg font-mono text-gray-900 mt-1">{viewingProduct.barcode || 'غير محدد'}</p>
                  </div>
                </div>
              </div>

              {/* معلومات الأسعار والربح */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-green-900 mb-3">الأسعار والربحية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">سعر الشراء</span>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {(viewingProduct.purchasePrice || 0).toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">سعر البيع</span>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {(viewingProduct.salePrice || 0).toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">هامش الربح</span>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {viewingProduct.salePrice && viewingProduct.purchasePrice ? 
                        ((viewingProduct.salePrice - viewingProduct.purchasePrice) / viewingProduct.purchasePrice * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* معلومات المخزون */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-900 mb-3">معلومات المخزون</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">الكمية الحالية</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{viewingProduct.quantity}</p>
                    <p className="text-xs text-gray-500">{viewingProduct.unit || 'قطعة'}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">الحد الأدنى</span>
                    <p className="text-xl font-bold text-orange-600 mt-1">{viewingProduct.minStock || 5}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">القيمة الإجمالية</span>
                    <p className="text-xl font-bold text-green-700 mt-1">
                      {((viewingProduct.salePrice || 0) * (viewingProduct.quantity || 0)).toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">الحالة</span>
                    <div className="mt-1">
                      {viewingProduct.quantity === 0 ? (
                        <Badge variant="destructive">نفدت الكمية</Badge>
                      ) : viewingProduct.quantity <= (viewingProduct.minStock || 5) ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">مخزون منخفض</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">في المخزون</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">معلومات إضافية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">المورد:</span>
                    <p className="text-lg text-gray-900 mt-1">{viewingProduct.supplier || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">الوحدة:</span>
                    <p className="text-lg text-gray-900 mt-1">{viewingProduct.unit || 'قطعة'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">تاريخ الإنشاء:</span>
                    <p className="text-lg text-gray-900 mt-1">{new Date(viewingProduct.createdAt).toLocaleDateString('en-GB') || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">آخر تحديث:</span>
                    <p className="text-lg text-gray-900 mt-1">{new Date(viewingProduct.updatedAt).toLocaleDateString('en-GB') || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    setViewingProduct(null);
                  }}
                  className="px-8 py-2 rounded-lg"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog استيراد من Excel */}
      <Dialog open={showImportDialog} onOpenChange={resetImportDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>استيراد الأصناف من Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!importResults ? (
              <>
                {/* زر تحميل نموذج */}
                <Alert>
                  <AlertDescription>
                    قم بتحميل نموذج Excel أولاً وقم بتعبئة بيانات المنتجات، ثم قم برفع الملف هنا
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={downloadExcelTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تحميل نموذج Excel
                </Button>

                {/* رفع الملف */}
                <div>
                  <Label>اختر ملف Excel</Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      الملف المختار: {selectedFile.name}
                    </p>
                  )}
                </div>

                {/* شريط التقدم */}
                {isImporting && (
                  <div className="space-y-2">
                    <Label>جاري الاستيراد...</Label>
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-gray-600">{importProgress}%</p>
                  </div>
                )}

                {/* الأزرار */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleImportExcel}
                    disabled={!selectedFile || isImporting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isImporting ? 'جاري الاستيراد...' : 'استيراد الأصناف'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetImportDialog}
                    disabled={isImporting}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* نتائج الاستيراد */}
                <Alert className={importResults.errors > 0 ? "border-yellow-500" : "border-green-500"}>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">
                        تم استيراد {importResults.success} صنف بنجاح من أصل {importResults.total}
                      </p>
                      {importResults.errors > 0 && (
                        <p className="text-yellow-700">
                          فشل استيراد {importResults.errors} صنف
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* معاينة المنتجات المستوردة */}
                {importResults.products && importResults.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">معاينة المنتجات المستوردة:</h4>
                    <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                      {importResults.products.map((product: any, index: number) => (
                        <div key={index} className="text-sm py-1 border-b last:border-0">
                          {product.name} - {product.salePrice} ريال
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* زر الإغلاق */}
                <Button
                  onClick={resetImportDialog}
                  className="w-full"
                >
                  إغلاق
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">تأكيد حذف المنتج</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 pr-2">
              {productToDelete && (
                <div className="space-y-3">
                  <p>هل أنت متأكد من حذف المنتج التالي؟</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      {productToDelete.name}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <strong>الكود:</strong> {productToDelete.code}
                      </p>
                      <p className="text-gray-600">
                        <strong>الباركود:</strong> {productToDelete.barcode}
                      </p>
                      <p className="text-green-600 font-semibold">
                        <strong>السعر:</strong> {productToDelete.salePrice?.toLocaleString('en-US')} ريال
                      </p>
                      <p className="text-blue-600 font-semibold">
                        <strong>الكمية:</strong> {productToDelete.quantity}
                      </p>
                      {productToDelete.quantity > 0 && (
                        <p className="text-orange-600 mt-2 font-medium">
                          تحذير: المنتج يحتوي على {productToDelete.quantity} قطعة في المخزون
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-red-600 font-medium">
                    ⚠️ سيتم حذف المنتج نهائياً من قائمة الأصناف!
                  </p>
                  <p className="text-red-600 font-medium">
                    هذا الإجراء لا يمكن التراجع عنه!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel 
              className="flex-1"
              disabled={isDeleting}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="ml-2">جاري الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف نهائي
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}