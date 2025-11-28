import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Package, Save } from 'lucide-react';

interface SimpleBranchAddProductProps {
  branchId?: number;
  onBack?: () => void;
}

export default function SimpleBranchAddProduct({ branchId, onBack }: SimpleBranchAddProductProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    code: '',
    barcode: '',
    category: '',
    purchasePrice: '',
    salePrice: '',
    quantity: '',
    minStock: '',
    unit: 'قطعة',
    supplier: '',
    description: ''
  });

  // توليد كود المنتج تلقائياً
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `PROD-${timestamp}-${randomNum}`;
  };

  // توليد الباركود تلقائياً
  const generateBarcode = () => {
    return Math.floor(Math.random() * 900000000000) + 100000000000;
  };

  // حساب هامش الربح
  const calculateProfitMargin = () => {
    const purchase = parseFloat(product.purchasePrice);
    const sale = parseFloat(product.salePrice);
    if (purchase > 0 && sale > 0) {
      return (((sale - purchase) / purchase) * 100).toFixed(1);
    }
    return '0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name || !product.purchasePrice || !product.salePrice) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء الحقول الأساسية: الاسم وسعر الشراء وسعر البيع',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...product,
          purchasePrice: parseFloat(product.purchasePrice),
          salePrice: parseFloat(product.salePrice),
          quantity: parseInt(product.quantity) || 0,
          minStock: parseInt(product.minStock) || 0,
          branchId: branchId
        })
      });

      if (response.ok) {
        toast({
          title: 'تم الحفظ بنجاح',
          description: 'تم إضافة المنتج إلى قائمة الأصناف بنجاح',
          variant: 'default'
        });
        
        // إعادة تعيين النموذج
        setProduct({
          name: '',
          code: '',
          barcode: '',
          category: '',
          purchasePrice: '',
          salePrice: '',
          quantity: '',
          minStock: '',
          unit: 'قطعة',
          supplier: '',
          description: ''
        });

        if (onBack) {
          setTimeout(() => {
            onBack();
          }, 1500);
        }
      } else {
        throw new Error('فشل في حفظ المنتج');
      }
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <div className="bg-green-100 p-3 rounded-full">
          <Package className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة صنف جديد</h1>
          <p className="text-gray-600">إضافة منتج جديد إلى مخزون الفرع {branchId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => setProduct({...product, name: e.target.value})}
                  placeholder="مثال: لابتوب HP"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">كود المنتج</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={product.code}
                      onChange={(e) => setProduct({...product, code: e.target.value})}
                      placeholder="كود تلقائي"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProduct({...product, code: generateProductCode()})}
                    >
                      توليد
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="barcode">الباركود</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={product.barcode}
                      onChange={(e) => setProduct({...product, barcode: e.target.value})}
                      placeholder="باركود تلقائي"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProduct({...product, barcode: generateBarcode().toString()})}
                    >
                      توليد
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <select
                    id="category"
                    value={product.category}
                    onChange={(e) => setProduct({...product, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الفئة</option>
                    <option value="أجهزة كمبيوتر">أجهزة كمبيوتر</option>
                    <option value="طابعات">طابعات</option>
                    <option value="اكسسوارات">اكسسوارات</option>
                    <option value="التخزين">التخزين</option>
                    <option value="شاشات">شاشات</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="unit">الوحدة</Label>
                  <select
                    id="unit"
                    value={product.unit}
                    onChange={(e) => setProduct({...product, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="قطعة">قطعة</option>
                    <option value="جهاز">جهاز</option>
                    <option value="كيلو">كيلو</option>
                    <option value="متر">متر</option>
                    <option value="لتر">لتر</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">المورد</Label>
                <Input
                  id="supplier"
                  value={product.supplier}
                  onChange={(e) => setProduct({...product, supplier: e.target.value})}
                  placeholder="اسم المورد"
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => setProduct({...product, description: e.target.value})}
                  placeholder="وصف المنتج..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* معلومات التسعير والمخزون */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التسعير والمخزون</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">سعر الشراء * (ريال)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={product.purchasePrice}
                    onChange={(e) => setProduct({...product, purchasePrice: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="salePrice">سعر البيع * (ريال)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={product.salePrice}
                    onChange={(e) => setProduct({...product, salePrice: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* عرض هامش الربح */}
              {product.purchasePrice && product.salePrice && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">هامش الربح:</span>
                    <span className="font-bold text-green-800">{calculateProfitMargin()}%</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-green-700">ربح الوحدة:</span>
                    <span className="font-bold text-green-800">
                      {(parseFloat(product.salePrice) - parseFloat(product.purchasePrice)).toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">الكمية الحالية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={product.quantity}
                    onChange={(e) => setProduct({...product, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="minStock">الحد الأدنى للمخزون</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={product.minStock}
                    onChange={(e) => setProduct({...product, minStock: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* معاينة المنتج */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">معاينة المنتج:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>الاسم: {product.name || 'غير محدد'}</div>
                  <div>الكود: {product.code || 'غير محدد'}</div>
                  <div>الفئة: {product.category || 'غير محدد'}</div>
                  <div>السعر: {product.salePrice ? `${product.salePrice} ريال` : 'غير محدد'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ المنتج
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}