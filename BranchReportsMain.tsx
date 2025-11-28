import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building, BarChart3, TrendingUp, Calendar, Download, Filter, Users, Package, DollarSign, ShoppingCart, FileText, Eye, RefreshCw, Truck, Settings, CreditCard, Tags, FolderOpen, Target, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';



// Mock data for charts
const salesData = [
  { name: '2025-06-15', المبيعات: 5000 },
  { name: '2025-06-16', المبيعات: 7500 },
  { name: '2025-06-17', المبيعات: 3000 }
];

const productServiceData = [
  { name: 'منتجات', value: 75, color: '#4F46E5' },
  { name: 'خدمات', value: 25, color: '#06B6D4' }
];

const branchPerformanceData = [
  { name: 'الفرع الرئيسي', المبيعات: 45000, المشتريات: 28000 },
  { name: 'بازربان', المبيعات: 32000, المشتريات: 19000 },
  { name: 'لباس الهدى', المبيعات: 28000, المشتريات: 15000 },
  { name: 'فرع الشمال', المبيعات: 22000, المشتريات: 12000 },
  { name: 'فرع الجنوب', المبيعات: 18000, المشتريات: 9000 }
];

export default function BranchReportsMain() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير الفروع</h1>
          <p className="text-gray-600">عرض تحليلي شامل لأداء الفروع والإحصائيات</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="المبيعات" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2 text-center">
              أكبر المبيعات خلال الفترة
            </p>
          </CardContent>
        </Card>

        {/* Products vs Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              المنتجات والخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productServiceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {productServiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2 text-center">
              التصنيف حسب النشاط
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            أداء الفروع حسب المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={branchPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="المبيعات" fill="#4F46E5" name="المبيعات" />
              <Bar dataKey="المشتريات" fill="#06B6D4" name="المشتريات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">145,000</p>
                <p className="text-gray-600">إجمالي المبيعات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-gray-600">إجمالي المنتجات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-gray-600">إجمالي العملاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-gray-600">عدد الفروع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}