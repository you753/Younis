import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  Plus,
  Minus,
  Search,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Activity,
  PackageX,
  RefreshCw,
  History,
  BarChart3,
  PieChart,
  LineChart,
  Archive,
  Eye,
  Download,
  Upload,
  Settings,
  Zap,
  Target,
  Calendar,
  Clock,
  Users,
  ShoppingCart,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UltimateInventorySystemProps {
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

function UltimateInventorySystem({ branchId }: UltimateInventorySystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products with real-time updates
  const { data: products = [], isLoading: productsLoading, refetch } = useQuery({
    queryKey: ['/api/products'],
    refetchInterval: 2000 // تحديث كل ثانيتين
  });

  // Fetch inventory movements
  const { data: movements = [] } = useQuery({
    queryKey: ['/api/inventory-movements'],
    refetchInterval: 3000
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
      toast({ 
        title: '✅ تم الحذف بنجاح', 
        description: 'تم حذف المنتج نهائياً من النظام'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ 
        title: '❌ خطأ في الحذف', 
        description: 'فشل في حذف المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive' 
      });
    }
  });

  // Type cast products for safety
  const productsList = products as Product[];
  const movementsList = movements as InventoryMovement[];

  // Handle adjustment actions
  const handleAdjustment = (product: Product, type: 'add' | 'subtract' | 'set') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setShowAdjustmentDialog(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      toast({ 
        title: '✅ تم الحذف بنجاح', 
        description: `تم حذف المنتج "${product.name}"` 
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      toast({ 
        title: '❌ خطأ في الحذف', 
        description: 'فشل في حذف المنتج. يرجى المحاولة مرة أخرى',
        variant: 'destructive' 
      });
    }
  };

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/products/${data.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update inventory');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: '✅ تم التحديث بنجاح', 
        description: 'تم تحديث كمية المنتج'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAdjustmentDialog(false);
    },
    onError: () => {
      toast({ 
        title: '❌ خطأ في التحديث', 
        description: 'فشل في تحديث الكمية',
        variant: 'destructive' 
      });
    }
  });

  // Handle inventory adjustment submission
  const handleAdjustmentSubmit = () => {
    if (!selectedProduct || !adjustmentQuantity) return;

    let newQuantity = selectedProduct.quantity;
    const adjustAmount = parseInt(adjustmentQuantity);

    switch (adjustmentType) {
      case 'add':
        newQuantity += adjustAmount;
        break;
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - adjustAmount);
        break;
      case 'set':
        newQuantity = adjustAmount;
        break;
    }

    updateInventoryMutation.mutate({
      productId: selectedProduct.id,
      quantity: newQuantity,
      adjustmentType,
      adjustmentAmount: adjustAmount,
      reason: adjustmentReason
    });
  };

  // Filter products with advanced filtering
  const filteredProducts = productsList.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === 'available') {
      matchesStatus = product.quantity > product.minStock;
    } else if (selectedStatus === 'low') {
      matchesStatus = product.quantity <= product.minStock && product.quantity > 0;
    } else if (selectedStatus === 'out') {
      matchesStatus = product.quantity === 0;
    } else if (selectedStatus === 'all') {
      matchesStatus = true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate comprehensive statistics
  const stats = {
    totalProducts: productsList.length,
    totalValue: productsList.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0),
    lowStockCount: productsList.filter(p => p.quantity <= p.minStock && p.quantity > 0).length,
    outOfStockCount: productsList.filter(p => p.quantity === 0).length,
    averageValue: productsList.length > 0 ? productsList.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0) / productsList.length : 0,
    highValueProducts: productsList.filter(p => p.salePrice > 1000).length,
    recentMovements: movementsList.filter(m => 
      new Date(m.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length
  };

  // Get unique categories
  const categories = Array.from(new Set(productsList.map(p => p.category))).filter(Boolean);

  // Get product status with enhanced logic
  const getProductStatus = (product: Product) => {
    if (product.quantity === 0) 
      return { status: 'نفد المخزون', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
    if (product.quantity <= product.minStock) 
      return { status: 'مخزون منخفض', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle };
    return { status: 'متوفر', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
  };

  // Professional product card component
  const ProductCard = ({ product }: { product: Product }) => {
    const statusInfo = getProductStatus(product);

    return (
      <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">الكود: {product.code}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">الكمية:</span>
                  <span className="font-bold text-blue-600">{product.quantity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">الفئة:</span>
                  <span className="text-sm text-gray-800">{product.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${statusInfo.color} font-medium px-3 py-1`}>
                {statusInfo.status}
              </Badge>
              <div className="mt-2 text-right">
                <p className="text-xs text-gray-500">سعر البيع</p>
                <p className="font-semibold text-green-600">{product.salePrice} ر.س</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar for stock level */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">مستوى المخزون</span>
              <span className="text-xs text-gray-500">
                الحد الأدنى: {product.minStock}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  product.quantity > product.minStock ? 'bg-green-500' : 
                  product.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((product.quantity / Math.max(product.minStock * 3, 10)) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">حالة المخزون</h1>
                <p className="text-gray-600">إدارة ومراقبة المنتجات والكميات المتوفرة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-blue-600">{productsList.length}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">متوفر</p>
                  <p className="text-2xl font-bold text-green-800">
                    {productsList.filter(p => p.quantity > p.minStock).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {productsList.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">نفد المخزون</p>
                  <p className="text-2xl font-bold text-red-800">
                    {productsList.filter(p => p.quantity === 0).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">إجمالي القيمة</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {productsList.reduce((sum, p) => sum + (p.quantity * p.salePrice), 0).toLocaleString()} ر.س
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المنتجات بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-64 border-gray-300">
                <SelectValue placeholder="فلترة حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="md:w-64 border-gray-300">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متوفر</SelectItem>
                <SelectItem value="low">مخزون منخفض</SelectItem>
                <SelectItem value="out">نفد المخزون</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {productsLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border border-gray-200 animate-pulse">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border border-gray-200">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                      ? 'لا توجد منتجات مطابقة للفلاتر المحددة' 
                      : 'لم يتم إضافة أي منتجات بعد'}
                  </p>
                  <p className="text-sm text-gray-400">
                    يمكنك إضافة المنتجات من صفحة إدارة المنتجات
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Adjustment Dialog */}
        {showAdjustmentDialog && selectedProduct && (
          <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-right">
                  تعديل الكمية
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600">كود: {selectedProduct.code}</p>
                  <p className="text-sm text-gray-600">الكمية الحالية: <span className="font-bold">{selectedProduct.quantity}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكمية الجديدة
                  </label>
                  <Input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="أدخل الكمية"
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سبب التعديل (اختياري)
                  </label>
                  <Input
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="أدخل سبب التعديل"
                    className="text-right"
                  />
                </div>

                {adjustmentQuantity && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      الكمية بعد التعديل: <span className="font-bold">
                        {parseInt(adjustmentQuantity)}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={handleAdjustmentSubmit}
                    disabled={!adjustmentQuantity || updateInventoryMutation.isPending}
                  >
                    {updateInventoryMutation.isPending ? 'جارٍ التحديث...' : 'تأكيد التعديل'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAdjustmentDialog(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default UltimateInventorySystem;