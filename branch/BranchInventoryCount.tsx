import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Search, TrendingDown, TrendingUp, AlertCircle, Calendar, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: string;
  category?: string;
}

interface BranchInventoryCountProps {
  branchId?: number;
}

export default function BranchInventoryCount({ branchId }: BranchInventoryCountProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/products${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredProducts.length;
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const lowStockItems = filteredProducts.filter(p => (p.quantity || 0) < 10).length;
  const outOfStockItems = filteredProducts.filter(p => (p.quantity || 0) === 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const formattedDateFrom = new Date(dateFrom).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDateTo = new Date(dateTo).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* رأس الصفحة للطباعة */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            background: white !important;
            color: black !important;
          }
          
          body { 
            margin: 0; 
            padding: 0;
            background: white !important;
            font-family: 'Arial', 'Tahoma', sans-serif;
          }
          
          /* إخفاء كل العناصر غير المطلوبة */
          header, nav, .bg-black, .bg-\\[\\#1a1a1a\\], [class*="bg-black"], [class*="bg-gray-9"] {
            display: none !important;
          }
          
          .print\\:hidden { 
            display: none !important; 
          }
          
          .print\\:block { 
            display: block !important; 
          }
          
          table { 
            page-break-inside: auto;
            border-collapse: collapse;
            width: 100%;
            margin-top: 15px;
          }
          
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto;
          }
          
          thead { 
            display: table-header-group;
          }
          
          thead th {
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
            padding: 12px 8px !important;
            font-weight: bold;
            font-size: 13px;
          }
          
          tbody td {
            border: 1px solid black !important;
            padding: 10px 8px !important;
            font-size: 12px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* رأس تقرير الجرد - يظهر في الطباعة */}
      <div className="hidden print:block mb-6">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-4 pb-3 border-b-2 border-black">
          <h1 className="text-2xl font-bold mb-1">تقرير جرد المخزون</h1>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="mb-1"><strong>الفترة من:</strong> {formattedDateFrom}</p>
            <p><strong>إلى:</strong> {formattedDateTo}</p>
          </div>
          <div className="text-left">
            <p className="mb-1"><strong>عدد الأصناف:</strong> {totalItems}</p>
            <p><strong>إجمالي الكمية:</strong> {Number(totalQuantity).toLocaleString('en-US')}</p>
          </div>
        </div>
      </div>

      {/* العنوان وأدوات التحكم */}
      <div className="mb-6 print:hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Package className="w-7 h-7 text-orange-600" />
              جرد المخزون
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  من:
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto"
                  data-testid="input-date-from"
                />
                <span className="text-xs text-gray-600">{formattedDateFrom}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">إلى:</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto"
                  data-testid="input-date-to"
                />
                <span className="text-xs text-gray-600">{formattedDateTo}</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            data-testid="button-print"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search-inventory"
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 print:hidden">
        <Card className="bg-white border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">إجمالي الأصناف</p>
                <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">إجمالي الكمية</p>
                <p className="text-2xl font-bold text-gray-800">{Number(totalQuantity).toLocaleString('en-US')}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">كمية منخفضة</p>
                <p className="text-2xl font-bold text-gray-800">{lowStockItems}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">نفذ من المخزن</p>
                <p className="text-2xl font-bold text-gray-800">{outOfStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المخزون */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b print:hidden">
          <CardTitle className="text-lg font-bold text-gray-800">قائمة المخزون</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الكود</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">اسم الصنف</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">الكمية</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 print:hidden">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      لا توجد منتجات
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const quantity = product.quantity || 0;
                    const status = quantity === 0 ? 'نفذ' : quantity < 10 ? 'منخفض' : 'متوفر';
                    const statusColor = quantity === 0 ? 'bg-red-100 text-red-800' : 
                                      quantity < 10 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800';
                    
                    return (
                      <tr 
                        key={product.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                        data-testid={`row-product-${product.id}`}
                      >
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs">{product.code || '-'}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${
                            quantity === 0 ? 'text-red-600' : 
                            quantity < 10 ? 'text-yellow-600' : 
                            'text-green-600'
                          } print:text-black`}>
                            {Number(quantity).toLocaleString('en-US')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center print:hidden">
                          <Badge className={`${statusColor} text-xs px-2 py-1`}>
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
