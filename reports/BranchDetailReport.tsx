import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, TrendingUp, TrendingDown, DollarSign, Package, Printer, ShoppingCart, Receipt } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReactToPrint } from 'react-to-print';

interface Branch {
  id: number;
  name: string;
}

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

export default function BranchDetailReport() {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  const { data: branchData } = useQuery<{ branches: BranchSummary[] }>({
    queryKey: ['/api/dashboard/branch-summary'],
  });

  const selectedBranch = branchData?.branches.find(b => b.branchId === selectedBranchId);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير الفرع - ${selectedBranch?.branchName || ''}`,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building className="h-8 w-8 text-amber-600" />
              تقرير تفصيلي للفرع
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              اختر الفرع لعرض التقرير المالي الشامل
            </p>
          </div>
          
          {selectedBranch && (
            <Button 
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-print-report"
            >
              <Printer className="h-4 w-4 ml-2" />
              طباعة التقرير
            </Button>
          )}
        </div>

        {/* Branch Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-600" />
              اختيار الفرع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedBranchId?.toString()} 
              onValueChange={(value) => setSelectedBranchId(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-96" data-testid="select-branch">
                <SelectValue placeholder="اختر الفرع..." />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Report Content */}
        {selectedBranch && (
          <div ref={printRef} className="space-y-6">
            {/* Print Header - Hidden on screen */}
            <div className="hidden print:block text-center mb-6 border-b-2 border-gray-300 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">التقرير المالي الشامل</h1>
              <h2 className="text-xl font-semibold text-gray-700 mt-2">{selectedBranch.branchName}</h2>
              <p className="text-gray-600 mt-1">تاريخ التقرير: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white print:bg-white print:border print:border-gray-300 print:text-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    إجمالي المبيعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedBranch.totalSales.toLocaleString('en-US')} ر.س
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white print:bg-white print:border print:border-gray-300 print:text-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    إجمالي المشتريات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedBranch.totalPurchases.toLocaleString('en-US')} ر.س
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white print:bg-white print:border print:border-gray-300 print:text-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    إجمالي المصروفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedBranch.totalExpenses.toLocaleString('en-US')} ر.س
                  </div>
                </CardContent>
              </Card>

              <Card className={`${
                selectedBranch.profit >= 0 
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                  : 'bg-gradient-to-br from-red-700 to-red-800'
              } text-white print:bg-white print:border print:border-gray-300 print:text-gray-900`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {selectedBranch.profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {selectedBranch.profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedBranch.profit >= 0 ? '+' : ''}{selectedBranch.profit.toLocaleString('en-US')} ر.س
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Details Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  التقرير المالي التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 print:bg-gray-100">
                        <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">
                          البيان
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 p-3 text-right font-semibold">
                          المبلغ (ر.س)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium">
                          إجمالي المبيعات
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-green-600 dark:text-green-400 font-bold">
                          {selectedBranch.totalSales.toLocaleString('en-US')}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium">
                          (-) إجمالي المشتريات
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-blue-600 dark:text-blue-400 font-bold">
                          ({selectedBranch.totalPurchases.toLocaleString('en-US')})
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium">
                          (-) إجمالي المصروفات
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-orange-600 dark:text-orange-400 font-bold">
                          ({selectedBranch.totalExpenses.toLocaleString('en-US')})
                        </td>
                      </tr>
                      <tr className="bg-gray-200 dark:bg-gray-700 print:bg-gray-200">
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-bold text-lg">
                          (=) صافي الربح/الخسارة
                        </td>
                        <td className={`border border-gray-300 dark:border-gray-600 p-3 font-bold text-lg ${
                          selectedBranch.profit >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {selectedBranch.profit >= 0 ? '+' : ''}{selectedBranch.profit.toLocaleString('en-US')}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium">
                          هامش الربح
                        </td>
                        <td className={`border border-gray-300 dark:border-gray-600 p-3 font-bold ${
                          selectedBranch.profitMargin >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {selectedBranch.profitMargin.toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  معلومات إضافية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg print:border print:border-gray-300">
                    <div className="text-sm text-gray-600 dark:text-gray-400">عدد المنتجات</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {selectedBranch.productCount}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg print:border print:border-gray-300">
                    <div className="text-sm text-gray-600 dark:text-gray-400">قيمة المخزون</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {selectedBranch.inventoryValue.toLocaleString('en-US')} ر.س
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg print:border print:border-gray-300">
                    <div className="text-sm text-gray-600 dark:text-gray-400">متوسط قيمة المنتج</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {selectedBranch.productCount > 0 
                        ? (selectedBranch.inventoryValue / selectedBranch.productCount).toLocaleString('en-US', { maximumFractionDigits: 0 })
                        : '0'
                      } ر.س
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Print Footer */}
            <div className="hidden print:block text-center mt-8 pt-4 border-t border-gray-300">
              <p className="text-gray-600 text-sm">
                تم الطباعة في: {new Date().toLocaleString('en-US')}
              </p>
            </div>
          </div>
        )}

        {/* No Branch Selected */}
        {!selectedBranch && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  اختر فرعًا لعرض التقرير التفصيلي
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
