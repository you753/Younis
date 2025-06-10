import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BranchLayout from '@/components/layout/BranchLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Upload
} from 'lucide-react';
// استخدام نوع البيانات الصحيح من المخطط
interface BranchProduct {
  id: number;
  name: string | null;
  code: string | null;
  barcode: string | null;
  description: string | null;
  category: string | null;
  purchasePrice: string | null;
  salePrice: string | null;
  quantity: number | null;
  minQuantity: number | null;
  branchId: number | null;
  createdAt: Date;
}

interface BranchProductsProps {
  params: { branchId: string };
}

export default function BranchProducts({ params }: BranchProductsProps) {
  const branchId = parseInt(params.branchId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // استرجاع منتجات الفرع
  const { data: products = [], isLoading } = useQuery<BranchProduct[]>({
    queryKey: [`/api/branches/${branchId}/products`],
    queryFn: async () => {
      // في الوقت الحالي سنجلب جميع المنتجات، لاحقاً يمكن تصفيتها حسب الفرع
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('فشل في جلب المنتجات');
      return response.json();
    }
  });

  // تصفية المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || (product.category || '').toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <BranchLayout branchId={branchId} title="إدارة المنتجات">
      <div className="space-y-6">
        {/* شريط الأدوات */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المنتجات..."
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
                <SelectItem value="">جميع الفئات</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        </div>

        {/* إحصائيات المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-xl font-bold">{filteredProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">متوفر</p>
                  <p className="text-xl font-bold text-green-600">
                    {filteredProducts.filter(p => (p.quantity || 0) > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">نفد المخزون</p>
                  <p className="text-xl font-bold text-red-600">
                    {filteredProducts.filter(p => (p.quantity || 0) === 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">قريب النفاد</p>
                  <p className="text-xl font-bold text-orange-600">
                    {filteredProducts.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < (p.minQuantity || 5)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              قائمة المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">لم يتم العثور على منتجات مطابقة للبحث</p>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة منتج جديد
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-700">المنتج</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الكود</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الفئة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">السعر</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">المخزون</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const stockStatus = (product.quantity || 0) === 0 ? 'نفد' : 
                                        (product.quantity || 0) < (product.minQuantity || 5) ? 'قريب النفاد' : 'متوفر';
                      const stockColor = stockStatus === 'نفد' ? 'destructive' : 
                                       stockStatus === 'قريب النفاد' ? 'secondary' : 'default';
                      
                      return (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500">{product.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>{product.code || 'غير محدد'}</div>
                              {product.barcode && (
                                <div className="text-gray-500">{product.barcode}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {product.category || 'غير مصنف'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{product.salePrice || '0'} ر.س</div>
                              {product.purchasePrice && (
                                <div className="text-gray-500">التكلفة: {product.purchasePrice} ر.س</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{product.quantity || 0}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={stockColor as any}>
                              {stockStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BranchLayout>
  );
}