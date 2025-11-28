import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Activity,
  ShoppingCart,
  PackageX,
  RefreshCw,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import ProfessionalProductForm from './ProfessionalProductForm';

interface BranchProfessionalInventoryProps {
  branchId?: number;
}

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  description?: string;
  status: string;
  lastUpdated?: string;
}

interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reference: string;
  referenceType: string;
  date: string;
  notes?: string;
}

export default function BranchProfessionalInventory({ branchId }: BranchProfessionalInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMovements, setShowMovements] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);


  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: productsLoading, refetch } = useQuery({
    queryKey: ['/api/products'],
    refetchInterval: 3000 // Auto refresh every 3 seconds
  });

  // Fetch inventory movements
  const { data: movements = [] } = useQuery({
    queryKey: ['/api/inventory-movements'],
    refetchInterval: 5000
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'تم تحديث المنتج بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setSelectedProduct(null);
    },
    onError: () => {
      toast({ title: 'خطأ في تحديث المنتج', variant: 'destructive' });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'تم حذف المنتج بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف المنتج', variant: 'destructive' });
    }
  });

  // Filter products
  const filteredProducts = (products as Product[]).filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalProducts = (products as Product[]).length;
  const totalValue = (products as Product[]).reduce((sum: number, product: Product) => 
    sum + (product.quantity * product.purchasePrice), 0);
  const lowStockCount = (products as Product[]).filter((product: Product) => 
    product.quantity <= product.minStock && product.quantity > 0).length;
  const outOfStockCount = (products as Product[]).filter((product: Product) => 
    product.quantity === 0).length;

  // Get product status
  const getProductStatus = (product: Product) => {
    if (product.quantity === 0) return { status: 'نفد المخزون', color: 'bg-red-100 text-red-800' };
    if (product.quantity <= product.minStock) return { status: 'مخزون منخفض', color: 'bg-orange-100 text-orange-800' };
    return { status: 'متوفر', color: 'bg-green-100 text-green-800' };
  };

  // Get unique categories
  const categories = Array.from(new Set((products as Product[]).map((p: Product) => p.category)));

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون الاحترافية</h1>
            <p className="text-gray-600">نظام متكامل لمراقبة وإدارة مخزون الفرع</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowMovements(true)}
            variant="outline"
            className="gap-2"
          >
            <History className="h-4 w-4" />
            تاريخ الحركات
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">قيمة المخزون</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalValue.toLocaleString('en-US')} ريال
                </p>
              </div>
              <BarChart3 className="h-10 w-10 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">مخزون منخفض</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">نفد المخزون</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <PackageX className="h-10 w-10 text-red-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md min-w-40"
            >
              <option value="">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/products'] })}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            قائمة المنتجات ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right p-3 font-semibold">الكود</th>
                  <th className="text-right p-3 font-semibold">اسم المنتج</th>
                  <th className="text-right p-3 font-semibold">الفئة</th>
                  <th className="text-right p-3 font-semibold">الكمية المتاحة</th>
                  <th className="text-right p-3 font-semibold">سعر الشراء</th>
                  <th className="text-right p-3 font-semibold">سعر البيع</th>
                  <th className="text-right p-3 font-semibold">الحد الأدنى</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-center p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product: Product, index: number) => {
                  const status = getProductStatus(product);
                  return (
                    <tr key={product.id} className={`border-b hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}>
                      <td className="p-3 font-medium text-blue-600">{product.code}</td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-gray-600">{product.category}</td>
                      <td className="p-3">
                        <span className={`font-bold text-lg ${
                          product.quantity === 0 ? 'text-red-600' :
                          product.quantity <= product.minStock ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">
                        {product.purchasePrice.toLocaleString('en-US')} ريال
                      </td>
                      <td className="p-3 text-green-600 font-medium">
                        {product.salePrice?.toLocaleString('en-US') || 0} ريال
                      </td>
                      <td className="p-3 text-gray-500">{product.minStock}</td>
                      <td className="p-3">
                        <Badge className={status.color}>
                          {status.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-blue-600"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                deleteProductMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <PackageX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">ابدأ بإضافة منتجات للمخزون</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج جديد
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <ProfessionalProductForm 
            branchId={branchId}
            onClose={() => setShowAddDialog(false)}
            onSuccess={() => {
              refetch(); // تحديث قائمة المنتجات
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المنتج - {selectedProduct?.code}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <Input
                placeholder="اسم المنتج"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
              />
              <Input
                placeholder="كود المنتج"
                value={selectedProduct.code}
                onChange={(e) => setSelectedProduct({...selectedProduct, code: e.target.value})}
              />
              <Input
                placeholder="فئة المنتج"
                value={selectedProduct.category}
                onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
              />
              <Input
                type="number"
                placeholder="الكمية الحالية"
                value={selectedProduct.quantity}
                onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value) || 0})}
              />
              <Input
                type="number"
                placeholder="سعر الشراء"
                value={selectedProduct.purchasePrice}
                onChange={(e) => setSelectedProduct({...selectedProduct, purchasePrice: parseFloat(e.target.value) || 0})}
              />
              <Input
                type="number"
                placeholder="سعر البيع"
                value={selectedProduct.salePrice}
                onChange={(e) => setSelectedProduct({...selectedProduct, salePrice: parseFloat(e.target.value) || 0})}
              />
              <Input
                type="number"
                placeholder="الحد الأدنى للمخزون"
                value={selectedProduct.minStock}
                onChange={(e) => setSelectedProduct({...selectedProduct, minStock: parseInt(e.target.value) || 5})}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={() => updateProductMutation.mutate(selectedProduct)}
                  disabled={!selectedProduct.name || !selectedProduct.code}
                >
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory Movements Dialog */}
      <Dialog open={showMovements} onOpenChange={setShowMovements}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تاريخ حركات المخزون</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right p-3">المنتج</th>
                  <th className="text-right p-3">نوع الحركة</th>
                  <th className="text-right p-3">الكمية</th>
                  <th className="text-right p-3">المرجع</th>
                  <th className="text-right p-3">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {(movements as InventoryMovement[]).slice(0, 50).map((movement: InventoryMovement) => (
                  <tr key={movement.id} className="border-b">
                    <td className="p-3">{movement.productName}</td>
                    <td className="p-3">
                      <Badge className={movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {movement.type === 'in' ? 'دخول' : 'خروج'}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{movement.quantity}</td>
                    <td className="p-3">{movement.reference}</td>
                    <td className="p-3">{new Date(movement.date).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}