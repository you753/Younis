import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Receipt,
  Users,
  Truck,
  Calendar,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatNumber = (num: number) => {
  if (!num) return '0';
  return Math.round(num).toLocaleString('en-US');
};

export default function BranchReports() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch branches
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  // Fetch sales
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  // Fetch daily expenses
  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ['/api/daily-expenses'],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return [];
      const response = await fetch(`/api/clients?branchId=${selectedBranchId}`);
      return response.json();
    },
    enabled: !!selectedBranchId
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers', selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return [];
      const response = await fetch(`/api/suppliers?branchId=${selectedBranchId}`);
      return response.json();
    },
    enabled: !!selectedBranchId
  });

  // Get selected branch
  const selectedBranch = useMemo(() => {
    return branches.find((b: any) => b.id.toString() === selectedBranchId);
  }, [branches, selectedBranchId]);

  // Filter data by date range
  const filterByDate = (items: any[], dateField: string = 'createdAt') => {
    if (!startDate && !endDate) return items;
    
    return items.filter((item: any) => {
      const itemDate = new Date(item[dateField] || item.date || item.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  // Calculate branch statistics
  const branchStats = useMemo(() => {
    if (!selectedBranchId) return null;

    // Filter data for selected branch and date range
    const branchSales = filterByDate(
      sales.filter((s: any) => s.branchId?.toString() === selectedBranchId)
    );
    const branchPurchases = filterByDate(
      purchases.filter((p: any) => p.branchId?.toString() === selectedBranchId)
    );
    const branchExpenses = filterByDate(
      expenses.filter((e: any) => e.branchId?.toString() === selectedBranchId)
    );

    // Calculate totals
    const totalSales = branchSales.reduce(
      (sum: number, s: any) => sum + (parseFloat(s.total || s.grandTotal) || 0),
      0
    );
    const totalPurchases = branchPurchases.reduce(
      (sum: number, p: any) => sum + (parseFloat(p.total || p.grandTotal) || 0),
      0
    );
    const totalExpenses = branchExpenses.reduce(
      (sum: number, e: any) => sum + (parseFloat(e.amount) || 0),
      0
    );

    // Calculate profit/loss
    const profitLoss = totalSales - totalPurchases - totalExpenses;

    // Count clients and suppliers (for this branch if they have branch filter)
    const clientCount = clients.filter((c: any) => 
      !c.branchId || c.branchId?.toString() === selectedBranchId
    ).length;
    const supplierCount = suppliers.filter((s: any) => 
      !s.branchId || s.branchId?.toString() === selectedBranchId
    ).length;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      profitLoss,
      salesCount: branchSales.length,
      purchasesCount: branchPurchases.length,
      expensesCount: branchExpenses.length,
      clientCount,
      supplierCount,
    };
  }, [selectedBranchId, sales, purchases, expenses, clients, suppliers, startDate, endDate]);

  // Print report
  const printReport = () => {
    if (!selectedBranch || !branchStats) return;

    const dateRangeText = startDate && endDate 
      ? `من ${new Date(startDate).toLocaleDateString('en-GB')} إلى ${new Date(endDate).toLocaleDateString('en-GB')}`
      : startDate 
      ? `من ${new Date(startDate).toLocaleDateString('en-GB')}`
      : endDate 
      ? `حتى ${new Date(endDate).toLocaleDateString('en-GB')}`
      : 'جميع الفترات';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>تقرير فرع ${selectedBranch.name}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              body { 
                font-family: 'Arial', 'Tahoma', sans-serif; 
                margin: 0;
                color: #000;
                font-size: 13px;
                background: #fff;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding: 12px 0; 
                margin-bottom: 12px;
              }
              .header h1 {
                color: #000;
                margin: 0 0 4px 0;
                font-size: 20px;
                font-weight: bold;
              }
              .header h2 {
                color: #333;
                margin: 0;
                font-size: 14px;
                font-weight: normal;
              }
              .report-date {
                text-align: left;
                font-size: 9px;
                color: #666;
                margin-bottom: 10px;
                padding: 3px 0;
                border-bottom: 1px solid #ddd;
              }
              .date-range {
                text-align: center;
                font-size: 11px;
                color: #000;
                margin: 10px 0;
                padding: 6px;
                background: #f5f5f5;
                border: 1px solid #000;
                font-weight: bold;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin: 12px 0;
              }
              .stat-card {
                border: 1.5px solid #000;
                padding: 8px;
                background: #fff;
              }
              .stat-label {
                font-size: 11px;
                color: #000;
                margin-bottom: 4px;
                font-weight: bold;
              }
              .stat-value {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
                color: #000;
              }
              .stat-count {
                font-size: 9px;
                color: #666;
              }
              .summary-section {
                margin-top: 12px;
                padding: 10px;
                background: #fff;
                border: 1.5px solid #000;
              }
              .summary-section h3 {
                color: #000;
                margin-bottom: 8px;
                font-size: 13px;
                border-bottom: 1.5px solid #000;
                padding-bottom: 5px;
                font-weight: bold;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #ddd;
                font-size: 10px;
              }
              .summary-row:last-child {
                border-bottom: none;
              }
              .summary-label {
                color: #000;
              }
              .summary-value {
                font-weight: bold;
                color: #000;
              }
              .footer {
                margin-top: 15px;
                text-align: center;
                color: #666;
                font-size: 8px;
                padding-top: 8px;
                border-top: 1px solid #000;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="report-date">
              تاريخ إصدار التقرير: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div class="header">
              <h1>${selectedBranch.name}</h1>
              <h2>التقرير المالي الشامل</h2>
            </div>

            <div class="date-range">
              فترة التقرير: ${dateRangeText}
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">إجمالي المبيعات</div>
                <div class="stat-value">${formatNumber(branchStats.totalSales)} ريال</div>
                <div class="stat-count">عدد الفواتير: ${branchStats.salesCount}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">إجمالي المشتريات</div>
                <div class="stat-value">${formatNumber(branchStats.totalPurchases)} ريال</div>
                <div class="stat-count">عدد الفواتير: ${branchStats.purchasesCount}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">إجمالي المصروفات</div>
                <div class="stat-value">${formatNumber(branchStats.totalExpenses)} ريال</div>
                <div class="stat-count">عدد المصروفات: ${branchStats.expensesCount}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">${branchStats.profitLoss >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</div>
                <div class="stat-value">
                  ${formatNumber(Math.abs(branchStats.profitLoss))} ريال
                </div>
                <div class="stat-count">الحالة: ${branchStats.profitLoss >= 0 ? 'ربح' : 'خسارة'}</div>
              </div>
            </div>

            <div class="summary-section">
              <h3>معلومات الفرع</h3>
              <div class="summary-row">
                <span class="summary-label">عدد العملاء</span>
                <span class="summary-value">${branchStats.clientCount}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">عدد الموردين</span>
                <span class="summary-value">${branchStats.supplierCount}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">عنوان الفرع</span>
                <span class="summary-value">${selectedBranch.address || 'غير محدد'}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">هاتف الفرع</span>
                <span class="summary-value">${selectedBranch.phone || 'غير محدد'}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">مدير الفرع</span>
                <span class="summary-value">${selectedBranch.manager || 'غير محدد'}</span>
              </div>
            </div>

            <div class="summary-section">
              <h3>التحليل المالي</h3>
              <div class="summary-row">
                <span class="summary-label">الإيرادات (المبيعات)</span>
                <span class="summary-value">${formatNumber(branchStats.totalSales)} ريال</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">التكاليف (المشتريات + المصروفات)</span>
                <span class="summary-value">${formatNumber(branchStats.totalPurchases + branchStats.totalExpenses)} ريال</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">هامش الربح</span>
                <span class="summary-value">
                  ${branchStats.totalSales > 0 ? ((branchStats.profitLoss / branchStats.totalSales) * 100).toFixed(2) : '0'}%
                </span>
              </div>
            </div>

            <div class="footer">
              <p>نظام المحاسبة التجارية - تقرير مالي شامل</p>
              <p>نظام المحاسبة العظيم - إدارة الفروع</p>
            </div>

            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تقارير الفروع</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            تقارير مالية شاملة لكل فرع مع إمكانية الطباعة
          </p>
        </div>
        <Building className="h-12 w-12 text-blue-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            اختيار الفرع والفترة الزمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Branch Selection */}
            <div>
              <Label>اختر الفرع</Label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="mt-1" data-testid="select-branch">
                  <SelectValue placeholder="اختر الفرع..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
                data-testid="input-start-date"
              />
            </div>

            {/* End Date */}
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
                data-testid="input-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {selectedBranch && branchStats && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sales Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                      {formatNumber(branchStats.totalSales)} ريال
                    </p>
                    <p className="text-xs text-blue-500 mt-1">{branchStats.salesCount} فاتورة</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            {/* Purchases Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">إجمالي المشتريات</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                      {formatNumber(branchStats.totalPurchases)} ريال
                    </p>
                    <p className="text-xs text-orange-500 mt-1">{branchStats.purchasesCount} فاتورة</p>
                  </div>
                  <ShoppingCart className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                      {formatNumber(branchStats.totalExpenses)} ريال
                    </p>
                    <p className="text-xs text-purple-500 mt-1">{branchStats.expensesCount} مصروف</p>
                  </div>
                  <Receipt className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* Profit/Loss Card */}
            <Card className={cn(
              "bg-gradient-to-br border-2",
              branchStats.profitLoss >= 0
                ? "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-300"
                : "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      branchStats.profitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {branchStats.profitLoss >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                    </p>
                    <p className={cn(
                      "text-2xl font-bold mt-2",
                      branchStats.profitLoss >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    )}>
                      {formatNumber(Math.abs(branchStats.profitLoss))} ريال
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      branchStats.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {branchStats.totalSales > 0 
                        ? `${((branchStats.profitLoss / branchStats.totalSales) * 100).toFixed(1)}% هامش`
                        : '0%'}
                    </p>
                  </div>
                  {branchStats.profitLoss >= 0 ? (
                    <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-10 w-10 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  العملاء والموردين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">عدد العملاء</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{branchStats.clientCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">عدد الموردين</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{branchStats.supplierCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5" />
                  معلومات الفرع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedBranch.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">العنوان:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedBranch.address || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الهاتف:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedBranch.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">المدير:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedBranch.manager || 'غير محدد'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Print Button */}
          <div className="flex justify-center">
            <Button
              onClick={printReport}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              data-testid="button-print-report"
            >
              <Printer className="h-5 w-5 ml-2" />
              طباعة التقرير
            </Button>
          </div>
        </>
      )}

      {/* No Branch Selected */}
      {!selectedBranchId && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                الرجاء اختيار فرع لعرض التقرير
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
