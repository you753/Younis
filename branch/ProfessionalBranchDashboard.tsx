import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  UserCircle,
  Star,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';

interface ProfessionalBranchDashboardProps {
  branchId?: number;
}

export default function ProfessionalBranchDashboard({ branchId }: ProfessionalBranchDashboardProps) {
  // جلب البيانات بشكل مستمر
  const { data: employees = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/employees`] : ['/api/employees'],
    refetchInterval: 3000,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
    refetchInterval: 3000,
  });

  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales'],
    refetchInterval: 3000,
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
    refetchInterval: 3000,
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
    refetchInterval: 3000,
  });

  // حساب الإحصائيات
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // مبيعات اليوم
  const todaySales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date || sale.createdAt).toISOString().split('T')[0];
    return saleDate === today;
  });
  
  const todayRevenue = todaySales.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.totalAmount || sale.grandTotal || 0), 0
  );

  // مبيعات الأمس للمقارنة
  const yesterdaySales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.date || sale.createdAt).toISOString().split('T')[0];
    return saleDate === yesterday;
  });
  
  const yesterdayRevenue = yesterdaySales.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.totalAmount || sale.grandTotal || 0), 0
  );

  // نسبة التغيير
  const revenueChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : '0';

  // إجمالي المبيعات
  const totalRevenue = sales.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.totalAmount || sale.grandTotal || 0), 0
  );

  // متوسط قيمة الفاتورة
  const avgInvoice = sales.length > 0 ? totalRevenue / sales.length : 0;

  // المنتجات
  const availableProducts = products.filter((p: any) => (p.quantity || 0) > 0);
  const lowStockProducts = products.filter((p: any) => {
    const qty = p.quantity || 0;
    const min = p.minQuantity || 5;
    return qty > 0 && qty <= min;
  });
  const outOfStock = products.filter((p: any) => (p.quantity || 0) === 0);

  // أفضل المنتجات مبيعاً
  const productSales = new Map();
  sales.forEach((sale: any) => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item: any) => {
        const current = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
        current.quantity += item.quantity || 0;
        current.revenue += (item.quantity || 0) * (item.unitPrice || 0);
        productSales.set(item.productId, current);
      });
    }
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // أفضل العملاء
  const clientPurchases = new Map();
  sales.forEach((sale: any) => {
    const amount = parseFloat(sale.totalAmount || sale.grandTotal || 0);
    const current = clientPurchases.get(sale.clientId) || { count: 0, total: 0 };
    current.count += 1;
    current.total += amount;
    clientPurchases.set(sale.clientId, current);
  });

  const topClients = Array.from(clientPurchases.entries())
    .map(([id, data]: [any, any]) => {
      const client = clients.find((c: any) => c.id === id);
      return { id, name: client?.name || 'عميل', ...data };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-yellow-400 via-yellow-500 to-yellow-600">
            لوحة التحكم التنفيذية
          </h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-lg px-4 py-2">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-500 text-sm font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-sm">الفرع رقم {branchId || '---'} • آخر تحديث: {new Date().toLocaleTimeString('en-US')}</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* إيرادات اليوم */}
        <Card className="bg-gradient-to-br from-yellow-950/40 via-yellow-900/20 to-gray-900 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all shadow-xl shadow-yellow-500/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-yellow-500/20 p-3 rounded-xl ring-2 ring-yellow-500/30">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                parseFloat(revenueChange) >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {parseFloat(revenueChange) >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-bold">{Math.abs(parseFloat(revenueChange))}%</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">إيرادات اليوم</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-400" dir="ltr">
                {todayRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">ر.س • {todaySales.length} طلب</p>
            </div>
          </CardContent>
        </Card>

        {/* إجمالي المبيعات */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">إجمالي المبيعات</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-500" dir="ltr">
                {totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">ر.س • {sales.length} فاتورة</p>
            </div>
          </CardContent>
        </Card>

        {/* المخزون */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <Package className="h-6 w-6 text-yellow-500" />
              </div>
              {outOfStock.length > 0 && (
                <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">
                  <span className="text-xs font-bold">{outOfStock.length} نافذ</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">إجمالي الأصناف</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-500">{products.length}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-400">{availableProducts.length} متوفر</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-orange-400">{lowStockProducts.length} منخفض</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* العملاء */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">قاعدة العملاء</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-500">{clients.length}</p>
              <p className="text-xs text-gray-500 mt-1">{employees.length} موظف • {suppliers.length} مورد</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات إضافية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* متوسط الفاتورة */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-yellow-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">متوسط قيمة الفاتورة</p>
              <p className="text-xl font-bold text-yellow-400" dir="ltr">
                {avgInvoice.toLocaleString('en-US', { maximumFractionDigits: 0 })} ر.س
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500/30" />
          </div>
        </div>

        {/* معدل التحويل */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-yellow-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">معدل الطلبات اليومية</p>
              <p className="text-xl font-bold text-yellow-400">{todaySales.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-yellow-500/30" />
          </div>
        </div>

        {/* تقييم المخزون */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-yellow-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">صحة المخزون</p>
              <p className="text-xl font-bold text-green-400">
                {products.length > 0 ? ((availableProducts.length / products.length * 100).toFixed(0)) : 0}%
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500/30" />
          </div>
        </div>

        {/* نشاط الفرع */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-yellow-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">نشاط الفرع</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xl font-bold text-green-400">نشط</p>
              </div>
            </div>
            <Clock className="h-8 w-8 text-yellow-500/30" />
          </div>
        </div>
      </div>

      {/* التفاصيل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-500/20">
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <CardTitle className="text-lg font-bold text-yellow-500 flex items-center gap-2">
              <Star className="h-5 w-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد مبيعات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product: any, index: number) => (
                  <div
                    key={`product-${index}-${product.name}`}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/10 w-8 h-8 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-500 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-gray-200 font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} وحدة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-yellow-400 font-bold" dir="ltr">
                        {product.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500">ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* أفضل العملاء */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-500/20">
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <CardTitle className="text-lg font-bold text-yellow-500 flex items-center gap-2">
              <Users className="h-5 w-5" />
              أفضل العملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topClients.length === 0 ? (
              <div className="text-center py-12">
                <UserCircle className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد بيانات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topClients.map((client: any, index: number) => (
                  <div
                    key={`client-${client.id}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/10 w-8 h-8 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-500 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-gray-200 font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.count} طلب</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-yellow-400 font-bold" dir="ltr">
                        {client.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500">ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* تنبيهات المخزون */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-500/20">
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <CardTitle className="text-lg font-bold text-yellow-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
              {/* النافذ */}
              {outOfStock.slice(0, 3).map((product: any) => (
                <div
                  key={`out-${product.id}`}
                  className="flex items-center justify-between p-3 bg-red-950/20 rounded-lg border border-red-900/30"
                >
                  <div>
                    <p className="text-gray-200 font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-red-400">نفد من المخزون</p>
                  </div>
                  <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-3 py-1 rounded-lg text-sm font-bold">
                    0
                  </div>
                </div>
              ))}

              {/* المنخفض */}
              {lowStockProducts.slice(0, 2).map((product: any) => (
                <div
                  key={`low-${product.id}`}
                  className="flex items-center justify-between p-3 bg-orange-950/20 rounded-lg border border-orange-900/30"
                >
                  <div>
                    <p className="text-gray-200 font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-orange-400">مخزون منخفض</p>
                  </div>
                  <div className="bg-orange-600/20 border border-orange-600/50 text-orange-400 px-3 py-1 rounded-lg text-sm font-bold">
                    {product.quantity}
                  </div>
                </div>
              ))}

              {outOfStock.length === 0 && lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-green-500 font-medium text-sm">✓ المخزون ممتاز</p>
                  <p className="text-xs text-gray-500 mt-1">جميع المنتجات متوفرة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* آخر الطلبات */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-500/20">
          <CardHeader className="border-b border-gray-800/50 pb-4">
            <CardTitle className="text-lg font-bold text-yellow-500 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              آخر الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                {sales.slice(0, 5).map((sale: any) => {
                  const client = clients.find((c: any) => c.id === sale.clientId);
                  const amount = parseFloat(sale.totalAmount || sale.grandTotal || 0);
                  
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/10 p-2 rounded-lg">
                          <UserCircle className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium text-sm">{sale.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">{client?.name || 'عميل'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-yellow-400 font-bold text-sm" dir="ltr">
                          {amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-500">ر.س</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
}
