import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, AlertTriangle, TrendingUp, BarChart3, Plus, Minus, Edit, RotateCcw, Camera, QrCode, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Calculator from '@/components/Calculator';
import BarcodeGenerator from '@/components/BarcodeGenerator';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function Inventory() {
  const { setCurrentPage } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add' as 'add' | 'subtract' | 'set',
    quantity: 0,
    reason: ''
  });
  
  // Barcode states
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage('إدارة المخزون');
  }, [setCurrentPage]);

  // Fetch products data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Calculate inventory stats
  const totalProducts = products.length;
  const inventoryValue = products.reduce((sum: number, product: any) => 
    sum + (parseFloat(product.salePrice || 0) * (product.quantity || 0)), 0
  );
  const lowStockProducts = products.filter((product: any) => 
    (product.quantity || 0) <= (product.minQuantity || 5)
  ).length;
  const outOfStockProducts = products.filter((product: any) => 
    (product.quantity || 0) <= 0
  ).length;

  // Handle inventory adjustment
  const handleAdjustment = (product: any, type: 'add' | 'subtract' | 'set') => {
    setSelectedProduct(product);
    setAdjustmentData({ ...adjustmentData, type });
    setShowAdjustmentForm(true);
  };

  const updateInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/products/${data.productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: data.newQuantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "تم تحديث المخزون بنجاح",
        description: "تم تعديل كمية الصنف",
      });
      setShowAdjustmentForm(false);
      setSelectedProduct(null);
      setAdjustmentData({ type: 'add', quantity: 0, reason: '' });
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث المخزون",
        description: "حدث خطأ أثناء تعديل الكمية",
        variant: "destructive",
      });
    }
  });

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustmentData.quantity < 0) {
      toast({
        title: "بيانات غير صحيحة",
        description: "يرجى إدخال كمية صحيحة",
        variant: "destructive",
      });
      return;
    }

    let newQuantity = selectedProduct.quantity || 0;
    
    if (adjustmentData.type === 'add') {
      newQuantity += adjustmentData.quantity;
    } else if (adjustmentData.type === 'subtract') {
      newQuantity = Math.max(0, newQuantity - adjustmentData.quantity);
    } else if (adjustmentData.type === 'set') {
      newQuantity = adjustmentData.quantity;
    }

    updateInventoryMutation.mutate({
      productId: selectedProduct.id,
      newQuantity: newQuantity
    });
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    const foundProduct = products.find((product: any) => 
      product.barcode === barcode || product.code === barcode
    );
    
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      setShowBarcodeScanner(false);
      toast({
        title: "تم العثور على المنتج",
        description: `المنتج: ${foundProduct.name}`,
      });
    } else {
      toast({
        title: "المنتج غير موجود",
        description: `لم يتم العثور على منتج بالباركود: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  // Generate barcode for product
  const generateBarcodeForProduct = (product: any) => {
    setSelectedProductForBarcode(product);
    setShowBarcodeGenerator(true);
  };

  // Filter products based on search
  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusBadge = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">نفد المخزون</Badge>;
    } else if (quantity <= minQuantity) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">مخزون منخفض</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">متوفر</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المخزون</h2>
            <p className="text-gray-600">متابعة المخزون والكميات المتاحة وإجراء الجرد</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBarcodeScanner(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Camera className="w-4 h-4" />
              قراءة باركود
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <Input
              placeholder="البحث بالاسم، الكود، أو الباركود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-blue-100 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الأصناف</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryValue.toFixed(2)} ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-orange-100 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">أصناف منخفضة</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-red-100 text-red-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">أصناف نافدة</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Form Modal */}
      {showAdjustmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedProduct ? `تعديل مخزون: ${selectedProduct.name}` : 'تعديل المخزون'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                {selectedProduct && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">الكمية الحالية: <span className="font-bold">{selectedProduct.quantity || 0}</span></p>
                  </div>
                )}

                <div>
                  <Label>نوع التعديل</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={adjustmentData.type === 'add' ? 'default' : 'outline'}
                      onClick={() => setAdjustmentData({...adjustmentData, type: 'add'})}
                      className="flex-1"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة
                    </Button>
                    <Button
                      type="button"
                      variant={adjustmentData.type === 'subtract' ? 'default' : 'outline'}
                      onClick={() => setAdjustmentData({...adjustmentData, type: 'subtract'})}
                      className="flex-1"
                    >
                      <Minus className="ml-2 h-4 w-4" />
                      خصم
                    </Button>
                    <Button
                      type="button"
                      variant={adjustmentData.type === 'set' ? 'default' : 'outline'}
                      onClick={() => setAdjustmentData({...adjustmentData, type: 'set'})}
                      className="flex-1"
                    >
                      <Edit className="ml-2 h-4 w-4" />
                      تحديد
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: parseInt(e.target.value) || 0})}
                    placeholder="أدخل الكمية"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">سبب التعديل</Label>
                  <Input 
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    placeholder="مثال: جرد، تلف، إرجاع..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowAdjustmentForm(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={updateInventoryMutation.isPending}>
                    {updateInventoryMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديل'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculator Component */}
      <Calculator />

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول المخزون</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أصناف</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة الأصناف لإدارة المخزون</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصنف</TableHead>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الباركود</TableHead>
                  <TableHead className="text-right">الكمية المتاحة</TableHead>
                  <TableHead className="text-right">الحد الأدنى</TableHead>
                  <TableHead className="text-right">سعر البيع</TableHead>
                  <TableHead className="text-right">قيمة المخزون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => {
                  const quantity = product.quantity || 0;
                  const minQuantity = product.minQuantity || 5;
                  const salePrice = parseFloat(product.salePrice || 0);
                  const totalValue = quantity * salePrice;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {product.barcode || 'لا يوجد'}
                          </span>
                          {product.barcode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateBarcodeForProduct(product)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {quantity}
                      </TableCell>
                      <TableCell className="text-center">{minQuantity}</TableCell>
                      <TableCell>{salePrice.toFixed(2)} ر.س</TableCell>
                      <TableCell className="font-semibold">{totalValue.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        {getStockStatusBadge(quantity, minQuantity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustment(product, 'add')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustment(product, 'subtract')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustment(product, 'set')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onScan={handleBarcodeScan}
        onClose={() => setShowBarcodeScanner(false)}
      />

      {/* Barcode Generator Dialog */}
      <Dialog open={showBarcodeGenerator} onOpenChange={setShowBarcodeGenerator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              باركود المنتج: {selectedProductForBarcode?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProductForBarcode?.barcode ? (
              <div className="text-center">
                <BarcodeGenerator
                  value={selectedProductForBarcode.barcode}
                  displayValue={true}
                  className="mx-auto"
                />
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">اسم المنتج:</span>
                      <p>{selectedProductForBarcode.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">كود المنتج:</span>
                      <p>{selectedProductForBarcode.code}</p>
                    </div>
                    <div>
                      <span className="font-medium">الباركود:</span>
                      <p className="font-mono">{selectedProductForBarcode.barcode}</p>
                    </div>
                    <div>
                      <span className="font-medium">الكمية المتاحة:</span>
                      <p>{selectedProductForBarcode.quantity || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا يوجد باركود لهذا المنتج
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
