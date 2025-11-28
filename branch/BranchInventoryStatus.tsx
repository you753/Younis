import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, TrendingUp, AlertTriangle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface Product {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: string;
  category?: string;
}

interface Sale {
  id: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: string;
  }>;
}

interface BranchInventoryStatusProps {
  branchId?: number;
}

export default function BranchInventoryStatus({ branchId }: BranchInventoryStatusProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/products${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/sales${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب المبيعات لكل منتج
  const productSalesData = useMemo(() => {
    const salesMap = new Map<number, number>();

    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          const currentSales = salesMap.get(item.productId) || 0;
          salesMap.set(item.productId, currentSales + (item.quantity || 0));
        });
      }
    });

    return products.map(product => {
      const soldQuantity = salesMap.get(product.id) || 0;
      const currentStock = product.quantity || 0;
      const status = currentStock === 0 ? 'نفذ' : currentStock < 10 ? 'منخفض' : 'متوفر';
      
      return {
        ...product,
        soldQuantity,
        currentStock,
        status
      };
    }).sort((a, b) => b.soldQuantity - a.soldQuantity); // ترتيب حسب الأعلى مبيعاً
  }, [products, sales]);

  const filteredProducts = productSalesData.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تطبيق pagination على المنتجات
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedProducts,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredProducts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm]
  });

  const topSeller = filteredProducts.length > 0 ? filteredProducts[0] : null;
  const totalSold = filteredProducts.reduce((sum, p) => sum + p.soldQuantity, 0);
  const lowStockCount = filteredProducts.filter(p => p.currentStock > 0 && p.currentStock < 10).length;
  const outOfStockCount = filteredProducts.filter(p => p.currentStock === 0).length;

  if (productsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* العنوان والبحث */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-orange-600" />
          حالة المخزون والمبيعات
        </h1>
        
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search-status"
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-800 mb-1 font-medium">الأعلى مبيعاً</p>
                <p className="text-lg font-bold text-yellow-900 truncate" title={topSeller?.name}>
                  {topSeller ? topSeller.name.substring(0, 15) + '...' : '-'}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {topSeller ? `${Number(topSeller.soldQuantity).toLocaleString('en-US')} وحدة` : ''}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-800 mb-1 font-medium">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-blue-900">{Number(totalSold).toLocaleString('en-US')}</p>
                <p className="text-xs text-blue-700 mt-1">وحدة</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-800 mb-1 font-medium">كمية منخفضة</p>
                <p className="text-2xl font-bold text-orange-900">{lowStockCount}</p>
                <p className="text-xs text-orange-700 mt-1">صنف</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-800 mb-1 font-medium">نفذ من المخزن</p>
                <p className="text-2xl font-bold text-red-900">{outOfStockCount}</p>
                <p className="text-xs text-red-700 mt-1">صنف</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول حالة المخزون */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
          <CardTitle className="text-lg font-bold text-gray-800">
            تفاصيل المخزون والمبيعات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الكود</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">اسم الصنف</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">المبيعات</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">المتبقي</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, index) => {
                    const statusColor = product.currentStock === 0 ? 'bg-red-100 text-red-800 border-red-300' : 
                                      product.currentStock < 10 ? 'bg-orange-100 text-orange-800 border-orange-300' : 
                                      'bg-green-100 text-green-800 border-green-300';
                    
                    const stockColor = product.currentStock === 0 ? 'text-red-600' :
                                      product.currentStock < 10 ? 'text-orange-600' :
                                      'text-green-600';

                    const actualIndex = (currentPage - 1) * 10 + index;
                    const isTopSeller = actualIndex === 0 && product.soldQuantity > 0;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b hover:bg-gray-50 transition-colors ${isTopSeller ? 'bg-yellow-50' : ''}`}
                        data-testid={`row-product-${product.id}`}
                      >
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            {actualIndex + 1}
                            {isTopSeller && <Trophy className="w-4 h-4 text-yellow-600" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs">{product.code || '-'}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-blue-700">
                            {Number(product.soldQuantity).toLocaleString('en-US')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${stockColor}`}>
                              {Number(product.currentStock).toLocaleString('en-US')}
                            </span>
                            {product.currentStock < 10 && product.currentStock > 0 && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                            {product.currentStock === 0 && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {product.currentStock >= 10 && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${statusColor} text-xs px-2 py-1 border`}>
                            {product.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={currentPage}
            pageCount={pageCount}
            totalItems={filteredProducts.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            itemName="منتج"
          />
        </CardContent>
      </Card>

      {/* تحذيرات الكميات القليلة */}
      {lowStockCount > 0 && (
        <Card className="mt-4 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-orange-900 mb-2">تحذير: كميات منخفضة</h3>
                <p className="text-sm text-orange-800">
                  يوجد <span className="font-bold">{lowStockCount}</span> صنف بكمية منخفضة (أقل من 10 وحدات). يُنصح بإعادة الطلب قريباً.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
