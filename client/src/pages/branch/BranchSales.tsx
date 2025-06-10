import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BranchLayout from '@/components/layout/BranchLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface BranchSale {
  id: number;
  clientId: number;
  total: string;
  date: string;
  branchId?: number;
}

interface BranchSalesProps {
  params: { branchId: string };
}

export default function BranchSales({ params }: BranchSalesProps) {
  const branchId = parseInt(params.branchId);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // استرجاع مبيعات الفرع
  const { data: sales = [], isLoading } = useQuery<BranchSale[]>({
    queryKey: [`/api/branches/${branchId}/sales`],
    queryFn: async () => {
      // في الوقت الحالي سنجلب جميع المبيعات، لاحقاً يمكن تصفيتها حسب الفرع
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('فشل في جلب المبيعات');
      return response.json();
    }
  });

  // تصفية المبيعات
  const filteredSales = sales.filter(sale => {
    return sale.id.toString().includes(searchTerm) ||
           sale.total.includes(searchTerm);
  });

  // حساب الإحصائيات
  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
  const todaySales = filteredSales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

  return (
    <BranchLayout branchId={branchId} title="إدارة المبيعات">
      <div className="space-y-6">
        {/* شريط الأدوات */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المبيعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Button>
          </div>
        </div>

        {/* إحصائيات المبيعات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                  <p className="text-xl font-bold">{filteredSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">قيمة المبيعات</p>
                  <p className="text-xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">مبيعات اليوم</p>
                  <p className="text-xl font-bold text-orange-600">{todaySales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">مبيعات اليوم (قيمة)</p>
                  <p className="text-xl font-bold text-purple-600">{todayTotal.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول المبيعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              قائمة المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مبيعات</h3>
                <p className="text-gray-500 mb-4">لم يتم العثور على مبيعات مطابقة للبحث</p>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة فاتورة جديدة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-700">رقم الفاتورة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">العميل</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">التاريخ</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">المبلغ الإجمالي</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">#{sale.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">عميل #{sale.clientId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(sale.date).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-green-600">{sale.total} ر.س</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">مكتملة</Badge>
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
                    ))}
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