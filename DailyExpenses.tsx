import { useState, useRef } from 'react';
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
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Printer,
  Calculator,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiRequest } from '@/lib/queryClient';

interface DailyExpense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'نقداً' | 'بنك' | 'شيك' | 'فيزا';
  receipt: string;
  approvedBy: string;
  status: 'معتمد' | 'معلق' | 'مرفوض';
  createdAt: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
}

export default function DailyExpenses() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<DailyExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'نقداً' as 'نقداً' | 'بنك' | 'شيك' | 'فيزا',
    receipt: '',
    approvedBy: 'مدير النظام'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query للحصول على المصروفات اليومية
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['/api/daily-expenses'],
    queryFn: () => fetch('/api/daily-expenses').then(res => res.json())
  });

  // Mutation لإضافة مصروف جديد
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/daily-expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-expenses'] });
      setIsAddDialogOpen(false);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
        paymentMethod: 'نقداً',
        receipt: '',
        approvedBy: 'مدير النظام'
      });
      toast({ title: 'تم حفظ المصروف بنجاح', description: 'تم إضافة المصروف اليومي الجديد بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في حفظ المصروف', variant: 'destructive' });
    }
  });

  // Mutation لتحديث مصروف
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PATCH', `/api/daily-expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-expenses'] });
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث المصروف بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث المصروف', variant: 'destructive' });
    }
  });

  // Mutation لحذف مصروف
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/daily-expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-expenses'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف المصروف بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في حذف المصروف', variant: 'destructive' });
    }
  });

  // حساب الإحصائيات
  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || 0), 0);
  const todayExpenses = expenses
    .filter((expense: any) => expense.date === new Date().toISOString().split('T')[0])
    .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || 0), 0);
  const pendingExpenses = expenses.filter((expense: any) => expense.status === 'معلق').length;
  const approvedExpenses = expenses.filter((expense: any) => expense.status === 'معتمد').length;

  // تصفية المصروفات
  const filteredExpenses = expenses.filter((expense: any) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || expense.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesDate = !dateFilter || expense.date === dateFilter;
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // وظائف الأزرار
  const handleViewExpense = (expense: DailyExpense) => {
    setSelectedExpense(expense);
    setIsViewDialogOpen(true);
  };

  const handleEditExpense = (expense: DailyExpense) => {
    setSelectedExpense(expense);
    setNewExpense({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      receipt: expense.receipt,
      approvedBy: expense.approvedBy
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteExpense = (expense: DailyExpense) => {
    if (window.confirm(`هل أنت متأكد من حذف هذا المصروف؟\n${expense.description}`)) {
      deleteExpenseMutation.mutate(expense.id);
    }
  };

  // معالج إضافة المصروف
  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate({
      ...newExpense,
      status: 'معتمد',
      createdAt: new Date().toISOString()
    });
  };

  // طباعة فاتورة المصروف
  const printExpenseInvoice = (expense: DailyExpense) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-GB');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مصروف - ${expense.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            direction: rtl; 
            text-align: right;
            background: white;
            padding: 20px;
          }
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            border: 2px solid #333;
            padding: 30px;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 3px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .company-info { text-align: right; }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 5px; 
          }
          .company-details { 
            font-size: 12px; 
            color: #666; 
            line-height: 1.4; 
          }
          .invoice-info { text-align: left; }
          .invoice-title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 10px; 
          }
          .invoice-number { 
            font-size: 14px; 
            color: #666; 
          }
          .expense-details { 
            margin: 30px 0; 
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
          }
          .detail-header { 
            background: #f8f9fa; 
            padding: 15px; 
            font-weight: bold; 
            border-bottom: 1px solid #ddd;
            font-size: 16px;
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 15px; 
            border-bottom: 1px solid #eee; 
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { 
            font-weight: 500; 
            color: #555; 
          }
          .detail-value { 
            font-weight: bold; 
            color: #333; 
          }
          .amount-section { 
            background: #f8f9fa; 
            border: 2px solid #333; 
            padding: 20px; 
            margin: 30px 0; 
            text-align: center;
          }
          .total-amount { 
            font-size: 24px; 
            font-weight: bold; 
            color: #d32f2f; 
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            font-size: 12px; 
            color: #666; 
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-approved { background: #e8f5e8; color: #2e7d32; }
          .status-pending { background: #fff3e0; color: #f57c00; }
          .status-rejected { background: #ffebee; color: #c62828; }
          @media print {
            body { margin: 0; padding: 10px; }
            .invoice-container { border: 1px solid #333; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              
              <div class="company-details">
                الهاتف: 0567537599<br>
                البريد: byrwl8230@gmail.com<br>
                العنوان: جدة البغدادية الشرقية
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-title">فاتورة مصروف</div>
              <div class="invoice-number">رقم المصروف: #${expense.id}</div>
              <div class="invoice-number">التاريخ: ${currentDate}</div>
            </div>
          </div>

          <div class="expense-details">
            <div class="detail-header">تفاصيل المصروف</div>
            <div class="detail-row">
              <span class="detail-label">تاريخ المصروف:</span>
              <span class="detail-value">${expense.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">فئة المصروف:</span>
              <span class="detail-value">${expense.category}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">الوصف:</span>
              <span class="detail-value">${expense.description}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">طريقة الدفع:</span>
              <span class="detail-value">${expense.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">رقم الإيصال:</span>
              <span class="detail-value">${expense.receipt}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">معتمد بواسطة:</span>
              <span class="detail-value">${expense.approvedBy}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">حالة المصروف:</span>
              <span class="detail-value">
                <span class="status-badge ${expense.status === 'معتمد' ? 'status-approved' : expense.status === 'معلق' ? 'status-pending' : 'status-rejected'}">
                  ${expense.status}
                </span>
              </span>
            </div>
          </div>

          <div class="amount-section">
            <div style="font-size: 18px; margin-bottom: 10px;">إجمالي المبلغ</div>
            <div class="total-amount">${expense.amount.toLocaleString('en-US')} ريال سعودي</div>
          </div>

          <div class="footer">
            <p><strong>ملاحظة:</strong> هذه فاتورة مصروف معتمدة ومطبوعة من نظام إدارة المصروفات</p>
            <p>تاريخ الطباعة: ${currentDate}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // تصدير Excel
  const exportToExcel = () => {
    const exportData = filteredExpenses.map((expense: DailyExpense) => ({
      'التاريخ': expense.date,
      'الفئة': expense.category,
      'الوصف': expense.description,
      'المبلغ': expense.amount,
      'طريقة الدفع': expense.paymentMethod,
      'رقم الإيصال': expense.receipt,
      'اعتماد': expense.approvedBy,
      'الحالة': expense.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المصروفات اليومية');
    XLSX.writeFile(workbook, `مصروفات-النظام-الرئيسي-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "تم تصدير البيانات بنجاح 📊",
      description: "تم حفظ ملف Excel",
    });
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'معتمد': return 'bg-green-100 text-green-800 border-green-200';
      case 'معلق': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'مرفوض': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // تنسيق المبالغ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">إدارة المصروفات اليومية</h2>
            <p className="text-gray-600 mt-2">تتبع وإدارة جميع المصروفات اليومية للشركة</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              تصدير Excel
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مصروف جديد
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="expenses">قائمة المصروفات</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">إجمالي المصروفات</CardTitle>
                <DollarSign className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-blue-600 mt-1">جميع المصروفات</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">مصروفات اليوم</CardTitle>
                <Calendar className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(todayExpenses)}</div>
                <p className="text-xs text-green-600 mt-1">اليوم فقط</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">المصروفات المعتمدة</CardTitle>
                <Receipt className="h-6 w-6 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{approvedExpenses}</div>
                <p className="text-xs text-orange-600 mt-1">مصروف معتمد</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">المصروفات المعلقة</CardTitle>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{pendingExpenses}</div>
                <p className="text-xs text-purple-600 mt-1">مصروف معلق</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>البحث والفلترة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الوصف أو الفئة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Input
                  placeholder="البحث بالفئة..."
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="فلترة بالتاريخ"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المصروفات ({filteredExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">جاري تحميل المصروفات...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مصروفات</h3>
                  <p className="text-gray-500">لم يتم العثور على أي مصروفات تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-semibold">التاريخ</TableHead>
                        <TableHead className="text-right font-semibold">الفئة</TableHead>
                        <TableHead className="text-right font-semibold">الوصف</TableHead>
                        <TableHead className="text-right font-semibold">المبلغ</TableHead>
                        <TableHead className="text-right font-semibold">طريقة الدفع</TableHead>
                        <TableHead className="text-right font-semibold">الحالة</TableHead>
                        <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense: any) => (
                        <TableRow key={expense.id} className="hover:bg-gray-50">
                          <TableCell className="text-right">
                            {new Date(expense.date).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{expense.description}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-red-600">
                              {formatCurrency(expense.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{expense.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewExpense(expense)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditExpense(expense)}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense)}
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                فواتير المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map((expense: any) => (
                  <Card key={expense.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                        <span className="text-sm text-gray-500">#{expense.id}</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">التاريخ:</span>
                          <span className="text-sm font-medium">{expense.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">الفئة:</span>
                          <span className="text-sm font-medium">{expense.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">المبلغ:</span>
                          <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">طريقة الدفع:</span>
                          <span className="text-sm font-medium">{expense.paymentMethod}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 mb-3">{expense.description}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          onClick={() => printExpenseInvoice(expense)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          طباعة الفاتورة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredExpenses.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير مصروفات</h3>
                  <p className="text-gray-500">لم يتم العثور على فواتير مصروفات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مصروف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Input
                id="category"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                placeholder="اكتب فئة المصروف..."
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="وصف المصروف"
              />
            </div>
            <div>
              <Label htmlFor="amount">المبلغ (ر.س)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select value={newExpense.paymentMethod} onValueChange={(value: any) => setNewExpense({ ...newExpense, paymentMethod: value })}>
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
            <Button onClick={handleAddExpense} className="w-full" disabled={createExpenseMutation.isPending}>
              {createExpenseMutation.isPending ? 'جاري الحفظ...' : 'حفظ المصروف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Expense Dialog */}
      {selectedExpense && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل المصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>التاريخ</Label>
                  <p className="font-medium">{selectedExpense.date}</p>
                </div>
                <div>
                  <Label>الفئة</Label>
                  <p className="font-medium">{selectedExpense.category}</p>
                </div>
                <div>
                  <Label>المبلغ</Label>
                  <p className="font-medium text-red-600">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <Label>طريقة الدفع</Label>
                  <p className="font-medium">{selectedExpense.paymentMethod}</p>
                </div>
              </div>
              <div>
                <Label>الوصف</Label>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>
              <div>
                <Label>الحالة</Label>
                <Badge className={getStatusColor(selectedExpense.status)}>
                  {selectedExpense.status}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Expense Dialog */}
      {selectedExpense && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل المصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-date">التاريخ</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">الفئة</Label>
                <Input
                  id="edit-category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  placeholder="اكتب فئة المصروف..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="وصف المصروف"
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">المبلغ (ر.س)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-paymentMethod">طريقة الدفع</Label>
                <Select value={newExpense.paymentMethod} onValueChange={(value: any) => setNewExpense({ ...newExpense, paymentMethod: value })}>
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
              <Button 
                onClick={() => {
                  if (selectedExpense) {
                    updateExpenseMutation.mutate({
                      id: selectedExpense.id,
                      data: { ...newExpense, status: 'معتمد', createdAt: new Date().toISOString() }
                    });
                  }
                }} 
                className="w-full" 
                disabled={updateExpenseMutation.isPending}
              >
                {updateExpenseMutation.isPending ? 'جاري التحديث...' : 'تحديث المصروف'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}