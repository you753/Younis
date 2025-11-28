import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNotification } from '@/hooks/useNotification';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, AlertTriangle } from 'lucide-react';
import type { Product } from '@shared/schema';


export default function ProductsTable() {
  const { success, error } = useNotification();
  const { format: formatAmount } = useCurrency();
  const queryClient = useQueryClient();


  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('تم حذف الصنف بنجاح');
    },
    onError: () => {
      error('حدث خطأ أثناء حذف الصنف');
    }
  });

  const handleDelete = async (id: number, productName: string) => {
    const confirmed = confirm(`هل أنت متأكد من حذف الصنف "${productName}"؟\n\nسيتم حذف الصنف نهائياً من النظام.`);
    if (confirmed) {
      deleteProductMutation.mutate(id);
    }
  };





  const getCategoryBadge = (category: string | null) => {
    if (!category) return <Badge variant="outline">غير محدد</Badge>;
    
    const categoryMap = {
      electronics: { label: 'إلكترونيات', variant: 'default' as const },
      clothing: { label: 'ملابس', variant: 'secondary' as const },
      food: { label: 'مواد غذائية', variant: 'outline' as const },
      books: { label: 'كتب', variant: 'outline' as const },
      household: { label: 'منزلية', variant: 'outline' as const },
      other: { label: 'أخرى', variant: 'outline' as const }
    };
    
    const categoryInfo = categoryMap[category as keyof typeof categoryMap] || { label: category, variant: 'outline' as const };
    return <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>;
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const isLowStock = (quantity: number | null, minQuantity: number | null) => {
    if (!quantity || !minQuantity) return false;
    return quantity <= minQuantity;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h3>
          <p className="text-gray-500">قم بإضافة الأصناف من النموذج أعلاه</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">قائمة الأصناف</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الصنف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية المتاحة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر الشراء
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر البيع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التصنيف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    {product.name}
                    {isLowStock(product.quantity, product.minQuantity) && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" title="مخزون منخفض" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.code || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 arabic-numbers">
                  <span className={isLowStock(product.quantity, product.minQuantity) ? 'text-yellow-600 font-semibold' : ''}>
                    {product.quantity || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 arabic-numbers">
                  {formatAmount(parseFloat(product.purchasePrice || '0'))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 arabic-numbers">
                  {formatAmount(parseFloat(product.salePrice || '0'))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(product.id, product.name || 'غير محدد')}
                    disabled={deleteProductMutation.isPending}
                    className="text-red-600 hover:text-red-900 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
