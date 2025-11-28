import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users, DollarSign } from 'lucide-react';

// Types - API returns numbers as strings sometimes
interface Supplier {
  id: number;
  name: string;
  supplierName?: string;
  phone: string;
  openingBalance: number | string;
  currentBalance: number | string;
  balance?: number | string;
  status: 'active' | 'inactive';
}

// Simple number formatting - handles both strings and numbers
const formatAmount = (amount: number | string): string => {
  if (!amount || amount === 0 || amount === '0') return '0';
  // Convert to number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toString();
};

export default function CleanSupplierAccounts() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch suppliers data
  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    select: (data) => data || []
  });

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    (supplier.name || supplier.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.phone || '').includes(searchTerm)
  );

  // Calculate statistics - handle string numbers from API
  const totalSuppliers = filteredSuppliers.length;
  const activeSuppliers = filteredSuppliers.filter(s => s.status === 'active').length;
  const totalOpeningBalance = filteredSuppliers.reduce((sum, s) => {
    const balance = typeof s.openingBalance === 'string' ? parseFloat(s.openingBalance) : (s.openingBalance || 0);
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);
  const totalCurrentBalance = filteredSuppliers.reduce((sum, s) => {
    const balance = typeof s.currentBalance === 'string' ? parseFloat(s.currentBalance) : 
                   typeof s.balance === 'string' ? parseFloat(s.balance) : 
                   (s.currentBalance || s.balance || 0);
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">حسابات الموردين</h1>
        <p className="text-gray-600 mt-2">إدارة حسابات الموردين والمعاملات المالية</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الموردين النشطين</p>
                <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الأرصدة الافتتاحية</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(totalOpeningBalance)} ريال</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الأرصدة الحالية</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(totalCurrentBalance)} ريال</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">قائمة الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-right font-semibold text-gray-700">اسم المورد</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الهاتف</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الحالي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد موردين
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {supplier.name || supplier.supplierName}
                    </TableCell>
                    <TableCell className="text-gray-700">{supplier.phone}</TableCell>
                    <TableCell className="text-gray-700">
                      {formatAmount(supplier.openingBalance || 0)} ريال
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatAmount(supplier.currentBalance || supplier.balance || 0)} ريال
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}