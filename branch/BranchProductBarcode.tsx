import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Barcode, Search, Printer, Package, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BranchProductBarcodeProps {
  branchId: number;
}

export default function BranchProductBarcode({ branchId }: BranchProductBarcodeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProduct, setDeleteProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنتجات من الـ API (خاصة بهذا الفرع فقط)
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/products?branchId=${branchId}`],
  });

  // فلترة المنتجات بناءً على البحث
  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );


  // حذف المنتج
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products?branchId=${branchId}`] });
      toast({
        title: "تم الحذف ✓",
        description: `تم حذف المنتج "${deleteProduct?.name}" بنجاح`,
      });
      setDeleteProduct(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    },
  });

  // طباعة الباركود
  const handlePrintBarcode = (product: any) => {
    // إنشاء باركود قابل للقراءة بالماسح الضوئي
    const barcodeValue = product.barcode || product.code || '0000000000000';
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طباعة الباركود - ${product.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: 30mm 50mm;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              padding: 0;
              margin: 0;
              background: white;
              width: 30mm;
              height: 50mm;
            }
            .barcode-container {
              width: 30mm;
              height: 50mm;
              border: 1px solid #000;
              padding: 2mm 1.5mm;
              text-align: center;
              background: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 1mm;
            }
            .product-name {
              font-size: 8pt;
              font-weight: bold;
              color: #000;
              line-height: 1.1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .barcode-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
            .price-info {
              font-size: 8pt;
              color: #000;
              font-weight: bold;
            }
            .price-label {
              font-weight: bold;
              color: #000;
              margin-left: 2px;
            }
            @media print {
              body { 
                padding: 0;
                margin: 0;
              }
              .barcode-container {
                border: 1px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="product-name">${product.name}</div>
            <div class="barcode-wrapper">
              <svg id="barcode"></svg>
            </div>
            <div class="price-info">
              <span class="price-label">السعر:</span>
              <span>${(product.salePrice || product.price || 0).toLocaleString('en-US')} ريال</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              try {
                JsBarcode("#barcode", "${barcodeValue}", {
                  format: "CODE128",
                  width: 1.1,
                  height: 60,
                  displayValue: true,
                  fontSize: 10,
                  fontOptions: "bold",
                  textMargin: 2,
                  margin: 3,
                  background: "#ffffff",
                  lineColor: "#000000"
                });
              } catch (e) {
                console.error("خطأ في إنشاء الباركود:", e);
              }
              
              setTimeout(function() {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }

    toast({
      title: "طباعة الباركود",
      description: `تم فتح نافذة الطباعة لـ ${product.name}`,
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Barcode className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الباركود</h1>
            <p className="text-gray-500 text-sm">نظام الفروع - الفئة {branchId}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                <p className="text-3xl font-bold text-blue-600">{products.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أكواد الباركود</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter((p: any) => p.barcode).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Barcode className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نتيجة البحث</p>
                <p className="text-3xl font-bold text-purple-600">{filteredProducts.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-blue-600" />
            بحث بالباركود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث برقم الباركود أو اسم المنتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            data-testid="input-barcode-search"
          />
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="text-right p-4 font-semibold text-gray-700">المنتج</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الكود</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الباركود</th>
                  <th className="text-right p-4 font-semibold text-gray-700">السعر</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الكمية</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12">
                      <div className="text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Barcode className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
                        <p className="text-gray-500">لم يتم العثور على منتجات تطابق البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: any, index: number) => (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50 transition-colors"
                      data-testid={`row-product-${product.id}`}
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono">
                          {product.code}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-700">
                            {product.barcode || '━━━'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-green-600">
                          {(product.salePrice || product.price || 0).toLocaleString('en-US')} ريال
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={product.quantity > 10 ? 'default' : 'destructive'}
                          className={product.quantity > 10 ? 'bg-blue-100 text-blue-700' : ''}
                        >
                          {product.quantity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePrintBarcode(product)}
                            className="bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0"
                            data-testid={`button-print-${product.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteProduct(product)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 h-9 w-9 p-0"
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">تأكيد الحذف</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-base">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="font-semibold text-gray-900 mb-2">المنتج المراد حذفه:</div>
                  <div className="text-gray-700">• {deleteProduct?.name}</div>
                  <div className="text-gray-600 text-sm mt-1">الكود: {deleteProduct?.code}</div>
                  <div className="text-gray-600 text-sm">الباركود: {deleteProduct?.barcode || 'لا يوجد'}</div>
                  {deleteProduct?.quantity > 0 && (
                    <div className="text-red-600 mt-2">
                      ⚠️ يوجد {deleteProduct.quantity} وحدة في المخزون
                    </div>
                  )}
                </div>
                <div className="text-gray-600">
                  هل أنت متأكد من حذف هذا المنتج؟ هذا الإجراء لا يمكن التراجع عنه.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
