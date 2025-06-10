import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Warehouse, 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react';

interface BranchInventoryProps {
  branchId: number;
}

export default function BranchInventory({ branchId }: BranchInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/inventory`],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('فشل في جلب بيانات المخزون');
      return response.json();
    }
  });

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((p: any) => (p.quantity || 0) <= (p.minQuantity || 5));
  const outOfStockProducts = products.filter((p: any) => (p.quantity || 0) === 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون - الفرع {branchId}</h1>
          <p className="text-gray-600">متابعة حالة المخزون في هذا الفرع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="ml-2 h-4 w-4" />
            تقرير المخزون
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="ml-2 h-4 w-4" />
            جرد المخزون
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            تحديث المخزون
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المخزون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات المخزون */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصناف</p>
                <p className="text-xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قيمة المخزون</p>
                <p className="text-xl font-bold text-green-600">
                  {products.reduce((total: number, p: any) => total + ((p.quantity || 0) * (p.costPrice || 0)), 0).toFixed(2)} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قريب النفاد</p>
                <p className="text-xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Warehouse className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">نفد المخزون</p>
                <p className="text-xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات المخزون */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockProducts.length > 0 && (
                <div className="text-red-600">
                  <strong>{outOfStockProducts.length}</strong> صنف نفد من المخزون
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="text-orange-600">
                  <strong>{lowStockProducts.length}</strong> صنف قريب من النفاد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة المخزون */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            حالة المخزون - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف في مخزون هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة أصناف لمخزون الفرع</p>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة صنف للمخزون
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الصنف</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الكود</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الكمية المتوفرة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحد الأدنى</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">سعر التكلفة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">قيمة المخزون</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const quantity = product.quantity || 0;
                    const minQuantity = product.minQuantity || 5;
                    const costPrice = product.costPrice || 0;
                    const stockValue = quantity * costPrice;
                    
                    let stockStatus = 'متوفر';
                    let statusColor = 'default';
                    
                    if (quantity === 0) {
                      stockStatus = 'نفد';
                      statusColor = 'destructive';
                    } else if (quantity <= minQuantity) {
                      stockStatus = 'قريب النفاد';
                      statusColor = 'secondary';
                    }

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.category && (
                              <div className="text-sm text-gray-500">{product.category}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{product.code}</td>
                        <td className="py-3 px-4 font-medium">{quantity}</td>
                        <td className="py-3 px-4">{minQuantity}</td>
                        <td className="py-3 px-4">{costPrice.toFixed(2)} ر.س</td>
                        <td className="py-3 px-4">{stockValue.toFixed(2)} ر.س</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColor as any}>{stockStatus}</Badge>
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
  );
}