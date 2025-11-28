import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface BranchSummary {
  branchId: number;
  branchName: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  inventoryValue: number;
  profit: number;
  profitMargin: number;
  productCount: number;
}

export default function BranchesReport() {
  const { data: branchData } = useQuery<{ branches: BranchSummary[] }>({
    queryKey: ['/api/dashboard/branch-summary'],
  });

  const branches = branchData?.branches || [];
  
  const totalSales = branches.reduce((sum, b) => sum + b.totalSales, 0);
  const totalPurchases = branches.reduce((sum, b) => sum + b.totalPurchases, 0);
  const totalProfit = branches.reduce((sum, b) => sum + b.profit, 0);
  const totalExpenses = branches.reduce((sum, b) => sum + b.totalExpenses, 0);

  const bestBranch = branches.length > 0 
    ? branches.reduce((max, b) => b.totalSales > max.totalSales ? b : max, branches[0])
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building className="h-8 w-8 text-amber-600" />
              تقارير الفروع
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              تحليل شامل لأداء جميع الفروع
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                إجمالي المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSales.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                إجمالي المشتريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPurchases.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                صافي الربح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProfit.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                إجمالي المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalExpenses.toLocaleString('en-US')} ر.س
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Branch */}
        {bestBranch && (
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                أفضل فرع أداءً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm opacity-90">اسم الفرع</div>
                  <div className="text-xl font-bold mt-1">{bestBranch.branchName}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">المبيعات</div>
                  <div className="text-xl font-bold mt-1">
                    {bestBranch.totalSales.toLocaleString('en-US')} ر.س
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90">الربح</div>
                  <div className="text-xl font-bold mt-1">
                    {bestBranch.profit.toLocaleString('en-US')} ر.س
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90">هامش الربح</div>
                  <div className="text-xl font-bold mt-1">
                    {bestBranch.profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branches Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-600" />
              تفاصيل جميع الفروع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      اسم الفرع
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      المبيعات
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      المشتريات
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      المصروفات
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      الربح/الخسارة
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      هامش الربح
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      المنتجات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr 
                      key={branch.branchId} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {branch.branchName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {branch.totalSales.toLocaleString('en-US')} ر.س
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {branch.totalPurchases.toLocaleString('en-US')} ر.س
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {branch.totalExpenses.toLocaleString('en-US')} ر.س
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${
                          branch.profit >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {branch.profit >= 0 ? '+' : ''}{branch.profit.toLocaleString('en-US')} ر.س
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {branch.profitMargin >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`font-semibold ${
                            branch.profitMargin >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {branch.profitMargin.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Package className="h-4 w-4 text-amber-600" />
                          <span>{branch.productCount}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {branches.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  لا توجد فروع مسجلة
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
