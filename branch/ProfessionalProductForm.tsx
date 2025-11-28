import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Barcode,
  DollarSign,
  Hash,
  FileText
} from 'lucide-react';

interface ProfessionalProductFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  branchId?: number;
}

interface ProductCategory {
  id: number;
  name: string;
}

export default function ProfessionalProductForm({ onClose, onSuccess, branchId }: ProfessionalProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    barcode: '',
    description: '',
    category: '',
    purchasePrice: '',
    salePrice: '',
    quantity: '',
    minStock: '',
    unit: 'قطعة',
    supplier: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب فئات المنتجات
  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['/api/product-categories']
  });

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المنتج مطلوب';
    } else if (formData.name.length < 2) {
      newErrors.name = 'اسم المنتج يجب أن يكون أكثر من حرفين';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'كود المنتج مطلوب';
    } else if (formData.code.length < 2) {
      newErrors.code = 'كود المنتج يجب أن يكون أكثر من حرفين';
    }

    if (!formData.category) {
      newErrors.category = 'الفئة مطلوبة';
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    if (!formData.purchasePrice || isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchasePrice = 'سعر الشراء يجب أن يكون رقم صحيح أكبر من صفر';
    }

    const salePrice = parseFloat(formData.salePrice);
    if (!formData.salePrice || isNaN(salePrice) || salePrice <= 0) {
      newErrors.salePrice = 'سعر البيع يجب أن يكون رقم صحيح أكبر من صفر';
    }

    if (purchasePrice > 0 && salePrice > 0 && salePrice <= purchasePrice) {
      newErrors.salePrice = 'سعر البيع يجب أن يكون أكبر من سعر الشراء';
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'الكمية يجب أن تكون رقم صحيح';
    }

    const minStock = parseInt(formData.minStock);
    if (!formData.minStock || isNaN(minStock) || minStock < 0) {
      newErrors.minStock = 'الحد الأدنى يجب أن يكون رقم صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إضافة المنتج
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          purchasePrice: parseFloat(productData.purchasePrice),
          salePrice: parseFloat(productData.salePrice),
          quantity: parseInt(productData.quantity),
          minStock: parseInt(productData.minStock),
          branchId: branchId,
          isActive: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'خطأ في إضافة المنتج');
      }
      
      return response.json();
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (data) => {
      toast({
        title: "تم الحفظ بنجاح! ✅",
        description: `تم إضافة المنتج "${data.name}" بنجاح`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error('Product creation error:', error);
      toast({
        title: "خطأ في الحفظ ❌",
        description: error.message || "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      addProductMutation.mutate(formData);
    } else {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء المعروضة",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة الخطأ عند الكتابة
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // تولد كود المنتج تلقائياً
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const code = `PRD${timestamp}${randomNum}`;
    handleChange('code', code);
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">إضافة منتج جديد</CardTitle>
                <p className="text-blue-100 text-sm">أدخل بيانات المنتج بدقة</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الصف الأول: اسم المنتج والكود */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  اسم المنتج *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="أدخل اسم المنتج..."
                  className={`${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                  maxLength={100}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4" />
                  كود المنتج *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="كود المنتج..."
                    className={`${errors.code ? 'border-red-500' : 'border-gray-300'} flex-1`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateProductCode}
                    className="px-3"
                  >
                    توليد
                  </Button>
                </div>
                {errors.code && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.code}
                  </div>
                )}
              </div>
            </div>

            {/* الصف الثاني: الباركود والفئة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="barcode" className="flex items-center gap-2 text-sm font-medium">
                  <Barcode className="h-4 w-4" />
                  الباركود
                </Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="أدخل الباركود..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  الفئة *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger className={`${errors.category ? 'border-red-500' : 'border-gray-300'}`}>
                    <SelectValue placeholder="اختر الفئة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </div>
                )}
              </div>
            </div>

            {/* الصف الثالث: الأسعار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  سعر الشراء (ريال) *
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                  className={`${errors.purchasePrice ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.purchasePrice && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.purchasePrice}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  سعر البيع (ريال) *
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                  placeholder="0.00"
                  className={`${errors.salePrice ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.salePrice && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.salePrice}
                  </div>
                )}
              </div>
            </div>

            {/* الصف الرابع: الكميات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  الكمية الحالية *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="0"
                  className={`${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.quantity && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.quantity}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock" className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  الحد الأدنى *
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                  placeholder="5"
                  className={`${errors.minStock ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.minStock && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.minStock}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">الوحدة</Label>
                <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قطعة">قطعة</SelectItem>
                    <SelectItem value="كيلو">كيلو</SelectItem>
                    <SelectItem value="متر">متر</SelectItem>
                    <SelectItem value="لتر">لتر</SelectItem>
                    <SelectItem value="علبة">علبة</SelectItem>
                    <SelectItem value="حبة">حبة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="وصف مفصل للمنتج..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-left">
                {formData.description.length}/500
              </div>
            </div>

            {/* المورد */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">المورد</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="اسم المورد..."
              />
            </div>

            {/* أزرار الحفظ */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {Object.keys(errors).length === 0 && formData.name && formData.code && formData.category && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">البيانات صحيحة</span>
                  </>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      حفظ المنتج
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}