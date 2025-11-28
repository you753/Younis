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

export default function Products() {
  const [location, setLocation] = useLocation();
  
  // Check if we're in branch system
  const isInBranchSystem = location.includes('/branch-app/');
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
    if (location === '/products/add') {
      setCurrentView('add');
      setCurrentPage('إضافة صنف جديد');
    } else if (location.startsWith('/products/edit/')) {
      const productId = parseInt(location.split('/').pop() || '');
      setEditProductId(productId);
      setCurrentView('edit');
      setCurrentPage('تعديل الصنف');
    } else {
      setCurrentView('list');
      setCurrentPage('إدارة الأصناف');
    }
  }, [location, setCurrentPage]);

  const switchToAdd = () => {
    setLocation('/products/add');
  };

  const switchToList = () => {
    setLocation('/products');
  };

  // دالة تعديل المنتج في نظام الفروع
  const handleBranchEditProduct = (productId: number) => {
    // التأكد من أننا في نظام الفروع
    if (!window.location.pathname.includes('/standalone-branch/')) {
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
    if (location === '/products/add') {
      setCurrentView('add');
      setEditProductId(null);
    } else if (location.startsWith('/products/edit/')) {
      const productId = parseInt(location.split('/').pop() || '0');
      setCurrentView('edit');
      setEditProductId(productId);
    } else {
      setCurrentView('list');
    }
  }, [location]);

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

  const downloadExcelTemplate = () => {
    // إنشاء ملف Excel نموذجي
    const templateData = [
      {
        'اسم المنتج': 'مثال على منتج',
        'الكود': 'PROD001',
        'الباركود': '1234567890123',
        'الوصف': 'وصف المنتج',
        'السعر': '100.00',
        'التكلفة': '80.00',
        'الوحدة': 'قطعة',
        'الحد الأدنى للمخزون': '10',
        'الحد الأقصى للمخزون': '100'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأصناف');
    
    // تحديد عرض الأعمدة
    const colWidths = [
      { width: 20 }, // اسم المنتج
      { width: 15 }, // الكود
      { width: 20 }, // الباركود
      { width: 30 }, // الوصف
      { width: 10 }, // السعر
      { width: 10 }, // التكلفة
      { width: 10 }, // الوحدة
      { width: 15 }, // الحد الأدنى
      { width: 15 }  // الحد الأقصى
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'نموذج_استيراد_الأصناف.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentView === 'add' ? 'إضافة صنف جديد' : 
               currentView === 'edit' ? 'تعديل الصنف' : 'إدارة الأصناف'}
            </h2>
            <p className="text-gray-600">
              {currentView === 'add' 
                ? 'إضافة صنف جديد إلى المخزون مع تحديد الأسعار والكميات'
                : currentView === 'edit'
                ? 'تعديل بيانات الصنف الحالي وتحديث معلوماته'
                : 'عرض وإدارة جميع الأصناف المتاحة في المخزون'
              }
            </p>
          </div>
          
          <div className="flex gap-3">
            {currentView === 'list' && <OnboardingTrigger tourName="products" />}
            {currentView === 'list' ? (
              <>
                <Button 
                  onClick={() => setShowImportDialog(true)} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
                >
                  <Upload className="ml-2 h-4 w-4" />
                  استيراد من Excel
                </Button>

              </>
            ) : (
              <Button onClick={() => setLocation('/products')} variant="outline">
                <List className="ml-2 h-4 w-4" />
                عرض القائمة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Based on Current View */}
      {currentView === 'add' ? (
        <ProductForm />
      ) : currentView === 'edit' ? (
        <ProductForm productId={editProductId} />
      ) : (
        <>
          {/* شريط البحث المحلي */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <SearchBox
                placeholder="البحث عن منتج (الاسم، الكود، الباركود، الفئة...)"
                value={localSearchQuery}
                onChange={setLocalSearchQuery}
                className="max-w-md"
              />
              {localSearchQuery && (
                <div className="mt-3 text-sm text-gray-600">
                  النتائج: {filteredProducts.length} من أصل {products.length} منتج
                </div>
              )}
            </CardContent>
          </Card>

          {/* نتائج البحث */}
          {localSearchQuery && filteredProducts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>نتائج البحث ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 text-right">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 space-x-2 rtl:space-x-reverse">
                          {product.code && <Badge variant="outline">كود: {product.code}</Badge>}
                          {product.category && <Badge variant="secondary">{product.category}</Badge>}
                          {product.barcode && <span className="text-xs">🏷️ {product.barcode}</span>}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {product.salePrice && <span className="text-green-600 font-medium">سعر البيع: {product.salePrice} ر.س</span>}
                          {product.salePrice && product.quantity && <span className="mx-2">•</span>}
                          {product.quantity !== null && <span>الكمية: {product.quantity}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* زر التعديل العادي للنظام الرئيسي */}
                        {!window.location.pathname.includes('/standalone-branch/') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditProductId(product.id);
                              setCurrentView('edit');
                            }}
                            title="تعديل المنتج"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* زر التعديل الاحترافي الذهبي لنظام الفروع */}
                        {window.location.pathname.includes('/standalone-branch/') && (
                          <BranchProductEditButton
                            productId={product.id}
                            productName={product.name}
                            onEdit={handleBranchEditProduct}
                          />
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // عرض تفاصيل المنتج في مودال أو صفحة منفصلة
                            toast({
                              title: "عرض المنتج",
                              description: `عرض تفاصيل: ${product.name}`,
                            });
                          }}
                          title="عرض تفاصيل المنتج"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* رسالة عدم وجود نتائج */}
          {localSearchQuery && filteredProducts.length === 0 && (
            <Card className="mb-6">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-4">لم نجد أي منتجات تطابق البحث "{localSearchQuery}"</p>
                <Button variant="outline" onClick={() => setLocalSearchQuery('')}>
                  مسح البحث
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="stats-card">
              <div className="flex items-center">
                <div className="stats-card-icon bg-blue-100 text-blue-600">
                  <List className="h-6 w-6" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الأصناف</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center">
                <div className="stats-card-icon bg-yellow-100 text-yellow-600">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">أصناف منخفضة المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center">
                <div className="stats-card-icon bg-green-100 text-green-600">
                  <span className="text-lg">💰</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">- ر.س</p>
                </div>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">استيراد الأصناف</h3>
                  <p className="text-sm text-green-600">قم بتحميل ملف Excel لإضافة الأصناف دفعة واحدة</p>
                </div>
                <Button 
                  onClick={() => setShowImportDialog(true)} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow-md"
                >
                  <Upload className="ml-2 h-5 w-5" />
                  استيراد من Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          {!localSearchQuery && (
            <div data-onboarding="products-table">
              <ProductsTable />
            </div>
          )}
        </>
      )}

      {/* Excel Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={resetImportDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              استيراد الأصناف من Excel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!importResults && !isImporting && (
              <>
                {/* تعليمات الاستيراد */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية:
                    <br />
                    <strong>اسم المنتج، الكود، الباركود، الوصف، السعر، التكلفة، الوحدة، الحد الأدنى للمخزون، الحد الأقصى للمخزون</strong>
                  </AlertDescription>
                </Alert>

                {/* تحميل النموذج */}
                <div className="flex justify-center">
                  <Button 
                    onClick={downloadExcelTemplate}
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تحميل نموذج Excel
                  </Button>
                </div>

                {/* اختيار الملف */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label
                        htmlFor="excel-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        اختر ملف Excel
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="text-sm text-gray-600">
                        الملف المحدد: <span className="font-medium">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* شريط التقدم */}
            {isImporting && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900 mb-2">جاري استيراد الأصناف...</div>
                  <Progress value={importProgress} className="w-full" />
                  <div className="text-sm text-gray-500 mt-2">{importProgress}%</div>
                </div>
              </div>
            )}

            {/* نتائج الاستيراد */}
            {importResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">تم الاستيراد بنجاح</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{importResults.results.total}</div>
                      <div className="text-sm text-gray-600">إجمالي الصفوف</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{importResults.results.success}</div>
                      <div className="text-sm text-gray-600">تم بنجاح</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{importResults.results.failed}</div>
                      <div className="text-sm text-gray-600">فشل</div>
                    </div>
                  </div>
                </div>

                {importResults.results.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">الأخطاء:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResults.results.errors.map((error: string, index: number) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetImportDialog} disabled={isImporting}>
                {importResults ? 'إغلاق' : 'إلغاء'}
              </Button>
              {!importResults && !isImporting && (
                <Button 
                  onClick={handleImportExcel}
                  disabled={!selectedFile || isImporting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Upload className="ml-2 h-4 w-4" />
                  بدء الاستيراد
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
