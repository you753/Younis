import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Search,
  Calendar,
  Filter
} from 'lucide-react';

// Mock data for inventory movements
const mockMovements = [
  {
    id: 1,
    productId: 1,
    productName: 'لابتوب ديل',
    type: 'in',
    quantity: 10,
    date: '2024-06-04',
    reference: 'PO-001',
    notes: 'شراء جديد من المورد'
  },
  {
    id: 2,
    productId: 1,
    productName: 'لابتوب ديل',
    type: 'out',
    quantity: 2,
    date: '2024-06-03',
    reference: 'SO-001',
    notes: 'بيع للعميل أحمد'
  },
  {
    id: 3,
    productId: 2,
    productName: 'ماوس لاسلكي',
    type: 'in',
    quantity: 50,
    date: '2024-06-02',
    reference: 'PO-002',
    notes: 'تجديد المخزون'
  },
  {
    id: 4,
    productId: 2,
    productName: 'ماوس لاسلكي',
    type: 'out',
    quantity: 15,
    date: '2024-06-01',
    reference: 'SO-002',
    notes: 'بيع بالجملة'
  }
];

export default function InventoryMovement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const filteredMovements = mockMovements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || movement.type === filterType;
    const matchesDate = (!dateFrom || movement.date >= dateFrom) && 
                       (!dateTo || movement.date <= dateTo);
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">حركة المخزون</h1>
          <p className="text-gray-600 mt-2">تتبع جميع حركات الدخول والخروج للمنتجات</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="اسم المنتج أو رقم المرجع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نوع الحركة</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحركات</SelectItem>
                  <SelectItem value="in">دخول</SelectItem>
                  <SelectItem value="out">خروج</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الداخل</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الخارج</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(mockMovements.map(m => m.productId)).size}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحركات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المنتج</TableHead>
                <TableHead>نوع الحركة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>المرجع</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(movement.date).toLocaleDateString('ar-SA')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{movement.productName}</TableCell>
                  <TableCell>
                    <Badge variant={movement.type === 'in' ? 'default' : 'destructive'}>
                      {movement.type === 'in' ? (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          دخول
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          خروج
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className={movement.type === 'in' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                  <TableCell className="text-gray-600">{movement.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد حركات مخزون مطابقة للفلاتر المحددة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}