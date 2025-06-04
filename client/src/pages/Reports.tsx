import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, TrendingUp, Download, Calendar, Filter, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import Calculator from '@/components/Calculator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const { setCurrentPage } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');

  useEffect(() => {
    setCurrentPage('التقارير والإحصائيات');
  }, [setCurrentPage]);

  // Fetch data for reports
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate analytics data
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
  const totalCosts = purchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Monthly sales data
  const monthlySalesData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleDateString('ar-SA', { month: 'short' });
    const monthSales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.date || sale.createdAt);
      return saleDate.getMonth() === i;
    });
    const monthPurchases = purchases.filter((purchase: any) => {
      const purchaseDate = new Date(purchase.date || purchase.createdAt);
      return purchaseDate.getMonth() === i;
    });
    
    return {
      month,
      sales: monthSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0),
      purchases: monthPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0),
    };
  });

  // Top products by sales
  const productSalesMap = new Map();
  sales.forEach((sale: any) => {
    if (sale.items) {
      sale.items.forEach((item: any) => {
        const current = productSalesMap.get(item.productId) || 0;
        productSalesMap.set(item.productId, current + (item.quantity * item.unitPrice));
      });
    }
  });

  const topProducts = Array.from(productSalesMap.entries())
    .map(([productId, revenue]) => {
      const product = products.find((p: any) => p.id === productId);
      return {
        name: product?.name || `منتج ${productId}`,
        revenue: revenue as number,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Inventory distribution
  const inventoryData = products.map((product: any) => ({
    name: product.name,
    value: (product.quantity || 0) * parseFloat(product.salePrice || 0),
    quantity: product.quantity || 0
  })).filter((item: any) => item.value > 0).slice(0, 6);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h2>
            <p className="text-gray-600">تحليلات شاملة ومتقدمة لأداء العمل</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
                <SelectItem value="month">الشهر</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => exportToCSV(sales, 'sales_report')}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} ر.س</div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
              +{sales.length} فاتورة
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCosts.toFixed(2)} ر.س</div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-1">
              +{purchases.length} فاتورة
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netProfit.toFixed(2)} ر.س</div>
            <Badge 
              variant="secondary" 
              className={netProfit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {profitMargin.toFixed(1)}% هامش ربح
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-1">
              إجمالي العملاء
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases Chart */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه المبيعات والمشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)} ر.س`, '']}
                  labelFormatter={(label) => `الشهر: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  name="المبيعات"
                />
                <Line 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  name="المشتريات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)} ر.س`, 'المبيعات']}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع قيمة المخزون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ر.س`, 'القيمة']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              <h4 className="font-semibold">تفاصيل المخزون</h4>
              {inventoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{item.value.toFixed(2)} ر.س</div>
                    <div className="text-sm text-gray-600">الكمية: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>آخر المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...sales.slice(-5), ...purchases.slice(-5)]
                .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                .slice(0, 10)
                .map((transaction: any, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant={transaction.clientId ? "default" : "secondary"}>
                      {transaction.clientId ? "مبيعات" : "مشتريات"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {parseFloat(transaction.total || 0).toFixed(2)} ر.س
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt || transaction.date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calculator Component */}
      <Calculator />
    </div>
  );
}
