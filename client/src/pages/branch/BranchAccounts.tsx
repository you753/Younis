import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calculator
} from 'lucide-react';

interface BranchAccountsProps {
  branchId: number;
}

export default function BranchAccounts({ branchId }: BranchAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/accounts`],
    queryFn: async () => {
      return [
        { id: 1, name: 'حساب النقدية', type: 'أصول', balance: 15000, currency: 'ر.س' },
        { id: 2, name: 'حساب البنك', type: 'أصول', balance: 45000, currency: 'ر.س' },
        { id: 3, name: 'حسابات دائنة', type: 'التزامات', balance: -5000, currency: 'ر.س' },
        { id: 4, name: 'رأس المال', type: 'حقوق الملكية', balance: 50000, currency: 'ر.س' },
        { id: 5, name: 'الإيرادات', type: 'إيرادات', balance: 25000, currency: 'ر.س' },
        { id: 6, name: 'المصروفات', type: 'مصروفات', balance: -8000, currency: 'ر.س' }
      ];
    }
  });

  const filteredAccounts = accounts.filter((account: any) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = accounts.filter((a: any) => a.type === 'أصول').reduce((sum: number, a: any) => sum + a.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter((a: any) => a.type === 'التزامات').reduce((sum: number, a: any) => sum + a.balance, 0));
  const totalEquity = accounts.filter((a: any) => a.type === 'حقوق الملكية').reduce((sum: number, a: any) => sum + a.balance, 0);
  const totalRevenue = accounts.filter((a: any) => a.type === 'إيرادات').reduce((sum: number, a: any) => sum + a.balance, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحسابات - الفرع {branchId}</h1>
          <p className="text-gray-600">إدارة الحسابات المالية للفرع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="ml-2 h-4 w-4" />
            ميزان المراجعة
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="ml-2 h-4 w-4" />
            قيد يومية
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            إضافة حساب
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الحسابات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* ملخص الحسابات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصول</p>
                <p className="text-xl font-bold text-green-600">{totalAssets.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الالتزامات</p>
                <p className="text-xl font-bold text-red-600">{totalLiabilities.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">حقوق الملكية</p>
                <p className="text-xl font-bold text-blue-600">{totalEquity.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-xl font-bold text-purple-600">{totalRevenue.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* دليل الحسابات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            دليل الحسابات - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة الحسابات المالية للفرع</p>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة حساب جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">اسم الحساب</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">نوع الحساب</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الرصيد</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account: any) => (
                    <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{account.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{account.type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(account.balance).toLocaleString()} {account.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={account.balance >= 0 ? 'default' : 'destructive'}>
                          {account.balance >= 0 ? 'مدين' : 'دائن'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            تفاصيل
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
    </div>
  );
}