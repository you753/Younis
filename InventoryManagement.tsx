import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Calculator,
  Warehouse,
  ShoppingCart,
  DollarSign
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  code: string;
  barcode?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  purchasePrice: string;
  salePrice: string;
  description?: string;
  branchId?: number;
  createdAt: Date;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: number;
}

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنتجات
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // حساب الإحصائيات
  const calculateStats = (): InventoryStats => {
    const productList = Array.isArray(products) ? products : [];
    
    const totalProducts = productList.length;
    const totalValue = productList.reduce((sum: number, product: any) => 
      sum + (parseFloat(product.salePrice || '0') * (product.quantity || 0)), 0
    );
    const lowStockItems = productList.filter((product: any) => 
      (product.quantity || 0) <= (product.minQuantity || 0) && (product.quantity || 0) > 0
    ).length;
    const outOfStockItems = productList.filter((product: any) => 
      (product.quantity || 0) === 0
    ).length;
    const categories = new Set(productList.map((product: any) => product.category)).size;

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categories
    };
  };

  const stats = calculateStats();

  // تصفية المنتجات
  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === "low-stock") {
      matchesStatus = (product.quantity || 0) <= (product.minQuantity || 0) && (product.quantity || 0) > 0;
    } else if (selectedStatus === "out-of-stock") {
      matchesStatus = (product.quantity || 0) === 0;
    } else if (selectedStatus === "in-stock") {
      matchesStatus = (product.quantity || 0) > (product.minQuantity || 0);
    }

    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  // الحصول على الفئات المتاحة
  const categories = Array.isArray(products) ? 
    [...new Set(products.map((product: any) => product.category).filter(Boolean))] : [];

  // وظيفة تحديد لون الحالة
  const getStatusColor = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return "destructive";
    if (quantity <= minQuantity) return "warning";
    return "default";
  };

  // وظيفة تحديد نص الحالة
  const getStatusText = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return "نفذ المخزون";
    if (quantity <= minQuantity) return "مخزون منخفض";
    return "متوفر";
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-600 mt-1">إدارة شاملة لمخزون المنتجات والمواد</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="ml-2 h-4 w-4" />
            استيراد
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">سيتم إضافة نموذج إضافة المنتجات قريباً</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">مخزون منخفض</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">نفذ المخزون</p>
                <p className="text-2xl font-bold text-red-900">{stats.outOfStockItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">الفئات</p>
                <p className="text-2xl font-bold text-purple-900">{stats.categories}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            حركات المخزون
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* تبويب المنتجات */}
        <TabsContent value="products" className="space-y-4">
          {/* أدوات البحث والتصفية */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="البحث بالاسم، الكود، أو الباركود..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفئات</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="in-stock">متوفر</SelectItem>
                      <SelectItem value="low-stock">مخزون منخفض</SelectItem>
                      <SelectItem value="out-of-stock">نفذ المخزون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* جدول المنتجات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>قائمة المنتجات</span>
                <span className="text-sm font-normal text-gray-500">
                  {filteredProducts.length} من أصل {Array.isArray(products) ? products.length : 0} منتج
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-600">جاري تحميل المنتجات...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "لا توجد منتجات تطابق معايير البحث المحددة"
                      : "ابدأ بإضافة منتجات جديدة إلى المخزون"}
                  </p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة منتج جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {product.name || "بدون اسم"}
                            </h3>
                            <Badge 
                              variant={getStatusColor(product.quantity || 0, product.minQuantity || 0)}
                              className="text-xs"
                            >
                              {getStatusText(product.quantity || 0, product.minQuantity || 0)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>الكود: {product.code || "غير محدد"}</span>
                            <span>الفئة: {product.category || "غير محدد"}</span>
                            <span>الكمية: {product.quantity || 0}</span>
                            <span>
                              السعر: {parseFloat(product.salePrice || '0').toLocaleString('en-US', { 
                                style: 'currency', 
                                currency: 'SAR' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب حركات المخزون */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حركات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">حركات المخزون</h3>
                <p className="text-gray-600">سيتم عرض تقرير مفصل بحركات المخزون هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب التقارير */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقارير المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">التقارير والتحليلات</h3>
                <p className="text-gray-600">سيتم عرض تقارير المخزون والتحليلات هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الإعدادات */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">إعدادات النظام</h3>
                <p className="text-gray-600">سيتم عرض إعدادات إدارة المخزون هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}