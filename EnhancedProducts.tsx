import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, Package, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { insertProductSchema } from '@shared/schema';
import EnhancedEditForm from '@/components/forms/EnhancedEditForm';
import { useNotification } from '@/hooks/useNotification';
import { apiRequest } from '@/lib/queryClient';

export default function EnhancedProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { success, error } = useNotification();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Filter products based on search
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: any) => p.quantity <= p.minQuantity).length;
  const totalValue = products.reduce((sum: number, p: any) => sum + (p.quantity * parseFloat(p.salePrice)), 0);

  // Form configuration
  const formFields = [
    { name: 'name', label: 'اسم المنتج', type: 'text' as const, required: true, placeholder: 'أدخل اسم المنتج' },
    { name: 'code', label: 'رمز المنتج', type: 'text' as const, required: true, placeholder: 'أدخل رمز المنتج' },
    { name: 'barcode', label: 'الباركود', type: 'text' as const, placeholder: 'رقم الباركود' },
    { name: 'category', label: 'الفئة', type: 'text' as const, placeholder: 'فئة المنتج' },
    { name: 'description', label: 'الوصف', type: 'textarea' as const, placeholder: 'وصف المنتج' },
    { name: 'purchasePrice', label: 'سعر الشراء', type: 'number' as const, placeholder: '0.00' },
    { name: 'salePrice', label: 'سعر البيع', type: 'number' as const, placeholder: '0.00' },
    { name: 'quantity', label: 'الكمية', type: 'number' as const, placeholder: '0' },
    { name: 'minQuantity', label: 'الحد الأدنى', type: 'number' as const, placeholder: '0' }
  ];

  const defaultValues = {
    name: '',
    code: '',
    barcode: '',
    description: '',
    category: '',
    purchasePrice: '0',
    salePrice: '0',
    quantity: 0,
    minQuantity: 0
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await apiRequest('DELETE', `/api/products/${productId}`, {});
      success('تم حذف المنتج بنجاح');
      window.location.reload(); // Refresh to update data
    } catch (err) {
      error('حدث خطأ أثناء حذف المنتج');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">جاري تحميل المنتجات...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات المُحسنة</h1>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة منتج جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط سعر البيع</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalProducts > 0 ? 
                  (products.reduce((sum: number, p: any) => sum + parseFloat(p.salePrice), 0) / totalProducts)
                    .toLocaleString('en-US', { style: 'currency', currency: 'SAR' })
                  : '0 ر.س'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <EnhancedEditForm
          title="المنتجات"
          apiEndpoint="/api/products"
          itemId={editingId}
          fields={formFields}
          schema={insertProductSchema}
          defaultValues={defaultValues}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Search and Products List */}
      {!showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات مُضافة'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرمز</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الشراء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر البيع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500">{product.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(product.purchasePrice).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(product.salePrice).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.quantity <= product.minQuantity ? (
                            <Badge variant="destructive">مخزون منخفض</Badge>
                          ) : product.quantity <= product.minQuantity * 2 ? (
                            <Badge variant="secondary">تحذير</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">متوفر</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
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
      )}
    </div>
  );
}