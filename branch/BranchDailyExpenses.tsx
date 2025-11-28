import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProtectedSection from '@/components/ProtectedSection';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Download,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DailyExpense {
  id: number;
  branchId: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface BranchDailyExpensesProps {
  branchId: number;
}

export default function BranchDailyExpenses({ branchId }: BranchDailyExpensesProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="expenses">
      <BranchDailyExpensesContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchDailyExpensesContent({ branchId }: { branchId: number }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<DailyExpense | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'نقداً'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المصروفات
  const { data: expenses = [], isLoading } = useQuery<DailyExpense[]>({
    queryKey: ['/api/daily-expenses'],
  });

  // فلترة المصروفات حسب الفرع
  const branchExpenses = useMemo(() => {
    return expenses.filter(exp => exp.branchId === branchId);
  }, [expenses, branchId]);

  // حساب المصروفات حسب الفترة
  const periodExpenses = useMemo(() => {
    // إذا كان هناك فلتر تاريخ مخصص
    if (dateFrom || dateTo) {
      return branchExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        const from = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
        const to = dateTo ? new Date(dateTo) : new Date('2100-12-31');
        return expDate >= from && expDate <= to;
      });
    }

    // وإلا استخدم الفترة المحددة
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'weekly':
        startDate = startOfWeek(now, { locale: ar });
        endDate = endOfWeek(now, { locale: ar });
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'yearly':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    return branchExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });
  }, [branchExpenses, selectedPeriod, dateFrom, dateTo]);

  // إحصائيات المصروفات
  const stats = useMemo(() => {
    const now = new Date();
    
    const dailyExpenses = branchExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfDay(now) && expDate <= endOfDay(now);
    });

    const weeklyExpenses = branchExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfWeek(now, { locale: ar }) && expDate <= endOfWeek(now, { locale: ar });
    });

    const monthlyExpenses = branchExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth(now) && expDate <= endOfMonth(now);
    });

    const yearlyExpenses = branchExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfYear(now) && expDate <= endOfYear(now);
    });

    return {
      daily: dailyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      weekly: weeklyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      monthly: monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      yearly: yearlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      dailyCount: dailyExpenses.length,
      weeklyCount: weeklyExpenses.length,
      monthlyCount: monthlyExpenses.length,
      yearlyCount: yearlyExpenses.length
    };
  }, [branchExpenses]);

  // إضافة مصروف جديد
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense) => {
      const response = await apiRequest('POST', '/api/daily-expenses', {
        ...expense,
        branchId,
        status: 'معتمد'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-expenses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/daily-expenses/branch/${branchId}`] });
      setIsAddDialogOpen(false);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
        paymentMethod: 'نقداً'
      });
      toast({
        title: "✅ تم الإضافة",
        description: "تم إضافة المصروف بنجاح",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: () => {
      toast({
        title: "⚠️ خطأ",
        description: "حدث خطأ أثناء إضافة المصروف",
        variant: "destructive"
      });
    }
  });

  // حذف مصروف
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await apiRequest('DELETE', `/api/daily-expenses/${expenseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-expenses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/daily-expenses/branch/${branchId}`] });
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف المصروف بنجاح",
        className: "bg-green-50 border-green-200",
      });
    }
  });

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.description || newExpense.amount <= 0) {
      toast({
        title: "⚠️ تحذير",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    addExpenseMutation.mutate(newExpense);
  };

  const handleDeleteExpense = (expenseId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  const getPeriodLabel = () => {
    if (dateFrom || dateTo) {
      if (dateFrom && dateTo) return `من ${format(new Date(dateFrom), 'dd/MM/yyyy')} إلى ${format(new Date(dateTo), 'dd/MM/yyyy')}`;
      if (dateFrom) return `من ${format(new Date(dateFrom), 'dd/MM/yyyy')}`;
      if (dateTo) return `حتى ${format(new Date(dateTo), 'dd/MM/yyyy')}`;
    }
    switch (selectedPeriod) {
      case 'daily': return 'اليوم';
      case 'weekly': return 'هذا الأسبوع';
      case 'monthly': return 'هذا الشهر';
      case 'yearly': return 'هذه السنة';
    }
  };

  // طباعة التقرير
  const printReport = () => {
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const periodLabel = getPeriodLabel();

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير المصروفات اليومية</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header .period {
            background: #dbeafe;
            color: #1e40af;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
          .summary {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .summary .total {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            margin: 10px 0;
          }
          .summary .count {
            color: #6b7280;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          thead {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
          }
          th {
            padding: 15px;
            text-align: right;
            font-weight: bold;
            font-size: 14px;
            border: 1px solid #3b82f6;
          }
          td {
            padding: 12px 15px;
            text-align: right;
            border: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          tbody tr:hover {
            background: #f3f4f6;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          .badge-category {
            background: #dbeafe;
            color: #1e40af;
          }
          .badge-payment {
            background: #d1fae5;
            color: #065f46;
          }
          .amount {
            font-weight: bold;
            color: #dc2626;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 تقرير المصروفات اليومية</h1>
          <div class="period">📅 ${periodLabel}</div>
        </div>

        <div class="summary">
          <div style="color: #6b7280; font-size: 16px; margin-bottom: 5px;">إجمالي المصروفات</div>
          <div class="total">${totalExpenses.toFixed(2)} ر.س</div>
          <div class="count">${periodExpenses.length} مصروف</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>التاريخ</th>
              <th>الفئة</th>
              <th>الوصف</th>
              <th>المبلغ</th>
              <th>طريقة الدفع</th>
            </tr>
          </thead>
          <tbody>
            ${periodExpenses.map((expense, index) => `
              <tr>
                <td style="text-align: center; font-weight: bold; color: #6b7280;">${index + 1}</td>
                <td>${format(new Date(expense.date), 'dd/MM/yyyy', { locale: ar })}</td>
                <td><span class="badge badge-category">${expense.category}</span></td>
                <td>${expense.description}</td>
                <td class="amount">${Number(expense.amount).toFixed(2)} ر.س</td>
                <td><span class="badge badge-payment">${expense.paymentMethod}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تاريخ الطباعة: ${format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: ar })}</p>
          <p style="margin-top: 5px;">نظام إدارة المصروفات - بوابة سوق البدو</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* العنوان */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-600" />
              المصروفات اليومية
            </h1>
            <p className="text-gray-600 mt-1">إدارة ومتابعة المصروفات اليومية للفرع</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مصروف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">إضافة مصروف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الفئة</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مصروفات التشغيل">مصروفات التشغيل</SelectItem>
                      <SelectItem value="فواتير كهرباء">فواتير كهرباء</SelectItem>
                      <SelectItem value="الإيجار">الإيجار</SelectItem>
                      <SelectItem value="صيانة">صيانة</SelectItem>
                      <SelectItem value="رواتب">رواتب</SelectItem>
                      <SelectItem value="نقل">نقل</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="وصف المصروف..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>المبلغ (ريال)</Label>
                  <Input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>طريقة الدفع</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نقداً">نقداً</SelectItem>
                      <SelectItem value="بنك">بنك</SelectItem>
                      <SelectItem value="شيك">شيك</SelectItem>
                      <SelectItem value="فيزا">فيزا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddExpense}
                    disabled={addExpenseMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {addExpenseMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-r-4 border-r-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المصروفات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.daily.toFixed(2)} ر.س</div>
            <p className="text-xs text-gray-500 mt-1">{stats.dailyCount} عملية</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المصروفات الأسبوعية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.weekly.toFixed(2)} ر.س</div>
            <p className="text-xs text-gray-500 mt-1">{stats.weeklyCount} عملية</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المصروفات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.monthly.toFixed(2)} ر.س</div>
            <p className="text-xs text-gray-500 mt-1">{stats.monthlyCount} عملية</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المصروفات السنوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.yearly.toFixed(2)} ر.س</div>
            <p className="text-xs text-gray-500 mt-1">{stats.yearlyCount} عملية</p>
          </CardContent>
        </Card>
      </div>

      {/* فلتر التاريخ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            فلتر حسب الفترة الزمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="whitespace-nowrap"
              >
                مسح الفلتر
              </Button>
            )}
            <Button
              onClick={printReport}
              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
            >
              <Download className="w-4 h-4 ml-2" />
              طباعة التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول المصروفات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">سجل المصروفات - {getPeriodLabel()}</CardTitle>
            <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)} className="w-auto">
              <TabsList>
                <TabsTrigger value="daily">اليوم</TabsTrigger>
                <TabsTrigger value="weekly">الأسبوع</TabsTrigger>
                <TabsTrigger value="monthly">الشهر</TabsTrigger>
                <TabsTrigger value="yearly">السنة</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {periodExpenses.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">لا توجد مصروفات في {getPeriodLabel()}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodExpenses.map((expense, index) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className="font-bold text-red-600">{Number(expense.amount).toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <Badge className={
                          expense.paymentMethod === 'نقداً' ? 'bg-green-100 text-green-800' :
                          expense.paymentMethod === 'بنك' ? 'bg-blue-100 text-blue-800' :
                          expense.paymentMethod === 'شيك' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }>
                          {expense.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsViewDialogOpen(true);
                            }}
                            data-testid={`button-view-expense-${expense.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteExpense(expense.id)}
                            data-testid={`button-delete-expense-${expense.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة عرض التفاصيل */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تفاصيل المصروف</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">{format(new Date(selectedExpense.date), 'dd/MM/yyyy', { locale: ar })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الفئة:</span>
                  <Badge variant="outline">{selectedExpense.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-bold text-red-600 text-lg">{Number(selectedExpense.amount).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <Badge>{selectedExpense.paymentMethod}</Badge>
                </div>
                <div className="border-t pt-3">
                  <span className="text-gray-600 block mb-2">الوصف:</span>
                  <p className="text-gray-800">{selectedExpense.description}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full"
              >
                إغلاق
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
