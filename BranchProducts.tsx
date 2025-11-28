import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import ProductForm from '@/components/forms/ProductForm';
import ProductsTable from '@/components/tables/ProductsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, List, Search, Edit, Eye, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import BranchProductEditButton from '@/components/branch/BranchProductEditButton';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import type { Product } from '@shared/schema';

interface BranchProductsProps {
  branchId?: string;
}

export default function BranchProducts({ branchId }: BranchProductsProps) {
  const [location, setLocation] = useLocation();
  
  // Check if we're in branch system
  const isInBranchSystem = location.includes('/branch/');
  const { setCurrentPage } = useAppStore();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جلب بيانات المنتجات
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // فلترة المنتجات بناءً على البحث المحلي
  const filteredProducts = Array.isArray(products) ? products.filter((product: Product) => {
    if (!localSearchQuery.trim()) return true;
    
    const searchTerms = localSearchQuery.toLowerCase().trim().split(' ');
    const searchText = `${product.name || ''} ${product.code || ''} ${product.barcode || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  useEffect(() => {
    if (location === `/branch/${branchId}/products/add`) {
      setCurrentView('add');
      setCurrentPage('إضافة صنف جديد');
    } else if (location.startsWith(`/branch/${branchId}/products/edit/`)) {
      const productId = parseInt(location.split('/').pop() || '');
      setEditProductId(productId);
      setCurrentView('edit');
      setCurrentPage('تعديل الصنف');
    } else {
      setCurrentView('list');
      setCurrentPage('إدارة الأصناف');
    }
  }, [location, setCurrentPage, branchId]);

  const switchToAdd = () => {
    setLocation(`/branch/${branchId}/products/add`);
  };

  const switchToList = () => {
    setLocation(`/branch/${branchId}/products`);
  };

  // دالة تعديل المنتج في نظام الفروع
  const handleBranchEditProduct = (productId: number) => {
    // التأكد من أننا في نظام الفروع
    if (!window.location.pathname.includes('/branch/')) {
      console.warn('هذه الدالة مخصصة لنظام الفروع فقط');
      return;
    }

    // الانتظار قليلاً للتأكد من تحميل النظام ثم التنقل
    setTimeout(() => {
      const branchSystem = window as any;
      if (branchSystem.setBranchActiveSection) {
        branchSystem.setBranchActiveSection(`branch-edit-product/${productId}`);
        toast({
          title: "تم الانتقال لصفحة التعديل",
          description: `جاري تحميل بيانات المنتج...`,
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ في التنقل إلى صفحة التعديل",
          variant: "destructive",
        });
      }
    }, 100);
  };

  // التحقق من المسار وتحديد العرض المناسب
  useEffect(() => {
    if (location === `/branch/${branchId}/products/add`) {
      setCurrentView('add');
      setEditProductId(null);
    } else if (location.startsWith(`/branch/${branchId}/products/edit/`)) {
      const productId = parseInt(location.split('/').pop() || '0');
      setCurrentView('edit');
      setEditProductId(productId);
    } else {
      setCurrentView('list');
    }
  }, [location, branchId]);

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
      // قراءة ملف Excel باستخدام مكتبة xlsx
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setImportProgress(30);

      // تحويل البيانات إلى صيغة الأصناف
      const products = jsonData.map((row: any, index: number) => {
        setImportProgress(30 + (index / jsonData.length) * 50);
        
        return {
          name: row['اسم المنتج'] || row['Name'] || '',
          code: row['الكود'] || row['Code'] || `AUTO-${Date.now()}-${index}`,
          barcode: row['الباركود'] || row['Barcode'] || '',
          description: row['الوصف'] || row['Description'] || '',
          salePrice: row['السعر'] || row['Price'] || '0',
          purchasePrice: row['التكلفة'] || row['Cost'] || '0',
          category: row['الفئة'] || row['Category'] || 'other',
          quantity: parseInt(row['الكمية'] || row['Quantity'] || '0'),
          minQuantity: parseInt(row['الحد الأدنى للمخزون'] || row['Min Quantity'] || '5'),
        };
      });

      setImportProgress(80);

      // إرسال البيانات للخادم
      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
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
        total: products.length,
        success: successCount,
        errors: errorCount,
        products: products.slice(0, 5) // عرض أول 5 منتجات
      });

      // تحديث قائمة المنتجات
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${successCount} صنف من أصل ${products.length}`,
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

  const downloadTemplate = () => {
    const template = [
      {
        'اسم المنتج': 'مثال على اسم المنتج',
        'الكود': 'P001',
        'الباركود': '1234567890123',
        'الوصف': 'وصف المنتج',
        'السعر': '100',
        'التكلفة': '80',
        'الفئة': 'electronics',
        'الكمية': '50',
        'الحد الأدنى للمخزون': '10'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
    XLSX.writeFile(wb, 'قالب_المنتجات.xlsx');
  };

  // عرض نموذج إضافة المنتج
  if (currentView === 'add') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={switchToList}
              className="mb-4"
            >
              ← العودة للقائمة
            </Button>
            <h1 className="text-3xl font-bold">إضافة صنف جديد</h1>
            <p className="text-gray-600 mt-2">أضف صنف جديد إلى قائمة المنتجات</p>
          </div>

          <ProductForm 
            onSuccess={() => {
              switchToList();
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              toast({
                title: "تم الحفظ بنجاح",
                description: "تم إضافة الصنف الجديد بنجاح",
              });
            }}
            isInBranchSystem={isInBranchSystem}
          />
        </div>
      </div>
    );
  }

  // عرض نموذج تعديل المنتج
  if (currentView === 'edit' && editProductId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={switchToList}
              className="mb-4"
            >
              ← العودة للقائمة
            </Button>
            <h1 className="text-3xl font-bold">تعديل الصنف</h1>
            <p className="text-gray-600 mt-2">تعديل بيانات الصنف المحدد</p>
          </div>

          <ProductForm 
            productId={editProductId}
            onSuccess={() => {
              switchToList();
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              toast({
                title: "تم التحديث بنجاح",
                description: "تم تحديث بيانات الصنف بنجاح",
              });
            }}
            isInBranchSystem={isInBranchSystem}
          />
        </div>
      </div>
    );
  }

  // عرض قائمة المنتجات (الافتراضي)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">إدارة الأصناف - الفرع</h1>
          <p className="text-gray-600 mt-2">إدارة جميع أصناف المنتجات في الفرع</p>
        </div>

        {/* شريط الأدوات */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button 
              onClick={switchToAdd}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              data-testid="button-add-product"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة صنف جديد
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="w-full sm:w-auto"
              data-testid="button-import-excel"
            >
              <Upload className="ml-2 h-4 w-4" />
              استيراد من Excel
            </Button>
          </div>

          <div className="flex-1">
            <SearchBox
              value={localSearchQuery}
              onChange={setLocalSearchQuery}
              placeholder="البحث في الأصناف (الاسم، الكود، الباركود، الفئة...)"
              className="w-full"
            />
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
                </div>
                <List className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">أصناف نشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredProducts.filter(p => p.quantity && p.quantity > 0).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تحت الحد الأدنى</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredProducts.filter(p => p.quantity && p.minQuantity && p.quantity <= p.minQuantity).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي القيمة</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredProducts.reduce((sum, p) => {
                      const price = parseFloat(p.salePrice || '0');
                      const qty = p.quantity || 0;
                      return sum + (price * qty);
                    }, 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsTable 
              products={filteredProducts}
              isInBranchSystem={isInBranchSystem}
              onEdit={(productId) => setLocation(`/branch/${branchId}/products/edit/${productId}`)}
            />
          </CardContent>
        </Card>

        {/* مربع حوار استيراد Excel */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>استيراد الأصناف من ملف Excel</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {!importResults && (
                <>
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={downloadTemplate}
                      className="w-full mb-4"
                    >
                      <Download className="ml-2 h-4 w-4" />
                      تحميل قالب Excel
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      اختر ملف Excel
                    </label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {selectedFile && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        تم اختيار الملف: {selectedFile.name}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isImporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>جاري الاستيراد...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleImportExcel}
                      disabled={!selectedFile || isImporting}
                      className="flex-1"
                    >
                      {isImporting ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetImportDialog}
                      disabled={isImporting}
                    >
                      إلغاء
                    </Button>
                  </div>
                </>
              )}

              {importResults && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      تم استيراد {importResults.success} صنف من أصل {importResults.total} بنجاح
                      {importResults.errors > 0 && ` (فشل في ${importResults.errors} صنف)`}
                    </AlertDescription>
                  </Alert>

                  <div className="max-h-60 overflow-y-auto">
                    <h4 className="font-medium mb-2">معاينة البيانات المستوردة:</h4>
                    {importResults.products.map((product: any, index: number) => (
                      <div key={index} className="border rounded p-2 mb-2 text-sm">
                        <strong>{product.name}</strong> - {product.code}
                      </div>
                    ))}
                  </div>

                  <Button onClick={resetImportDialog} className="w-full">
                    إغلاق
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}