import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: string;
  openingBalance?: string;
  status: string;
}

const formatNumber = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toString();
};

export default function SupplierAccountsStatement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      return response.json();
    }
  });



  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.refetchQueries({ queryKey: ['/api/suppliers'] });
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح"
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive"
      });
    }
  });

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  // Calculate statistics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 'active').length;
  const totalBalance = suppliers.reduce((sum: number, supplier: Supplier) => {
    return sum + (parseFloat(supplier.balance || '0') || 0);
  }, 0);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل بيانات الموردين...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">كشف حساب الموردين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وعرض كشوفات حسابات الموردين وأرصدتهم
          </p>
        </div>
        <Button 
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 ml-1 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSuppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">الموردين النشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي الأرصدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(totalBalance)} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في الموردين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">اسم المورد</th>
                  <th className="text-right p-3">رقم الهاتف</th>
                  <th className="text-right p-3">الرصيد الافتتاحي</th>
                  <th className="text-right p-3">الرصيد الحالي</th>
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-center p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier: Supplier) => (
                  <tr key={supplier.id} className="border-b">
                    <td className="p-3 font-medium">{supplier.name}</td>
                    <td className="p-3">{supplier.phone || 'غير محدد'}</td>
                    <td className="p-3 text-green-600 font-medium">
                      {formatNumber(supplier.openingBalance || supplier.balance)} ريال
                    </td>
                    <td className="p-3 text-red-600 font-medium">
                      {formatNumber(supplier.balance)} ريال
                    </td>
                    <td className="p-3">
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      -
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      لا توجد موردين مطابقة لمعايير البحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}