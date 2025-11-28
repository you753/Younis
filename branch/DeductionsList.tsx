import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  Edit, 
  Search, 
  DollarSign, 
  TrendingDown, 
  Users,
  Calendar,
  FileText,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { queryClient } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeductionsListProps {
  branchId?: number;
}

export default function DeductionsList({ branchId }: DeductionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<any>(null);
  const [addDeductionOpen, setAddDeductionOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [newDeduction, setNewDeduction] = useState({
    deductionType: 'smart_deduction',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    targetDebtId: ''
  });
  const { toast } = useToast();

  // جلب الخصومات
  const { data: deductions = [], isLoading } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/deductions`] : ['/api/deductions'],
  });

  // جلب الموظفين
  const { data: employees = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/employees`] : ['/api/employees'],
  });

  // جلب ديون الموظفين
  const { data: employeeDebts = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/employee-debts`] : ['/api/employee-debts'],
    enabled: !!selectedEmployeeId,
  });

  // Get active debts for selected employee
  const selectedEmployeeDebts = selectedEmployeeId 
    ? employeeDebts.filter((d: any) => d.debtorId === parseInt(selectedEmployeeId) && d.status === 'active')
    : [];

  // إضافة خصم جديد
  const addDeductionMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = branchId ? `/api/branches/${branchId}/deductions` : '/api/deductions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create deduction');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الخصم بنجاح ✅",
        description: "تم إضافة الخصم للموظف",
      });
      queryClient.invalidateQueries({ 
        queryKey: branchId ? [`/api/branches/${branchId}/deductions`] : ['/api/deductions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: branchId ? [`/api/branches/${branchId}/employees`] : ['/api/employees'] 
      });
      setAddDeductionOpen(false);
      setSelectedEmployeeId('');
      setNewDeduction({
        deductionType: 'smart_deduction',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        targetDebtId: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الخصم",
        description: error.message || "فشل إضافة الخصم",
        variant: "destructive",
      });
    },
  });

  // حذف خصم
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = branchId 
        ? `/api/branches/${branchId}/deductions/${id}` 
        : `/api/deductions/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete deduction');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح ✅",
        description: "تم حذف الخصم من النظام",
      });
      setDeleteDialogOpen(false);
      setSelectedDeduction(null);
      queryClient.invalidateQueries({ 
        queryKey: branchId ? [`/api/branches/${branchId}/deductions`] : ['/api/deductions'] 
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الخصم",
        variant: "destructive",
      });
    },
  });

  // الحصول على اسم الموظف
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    return employee?.name || 'غير معروف';
  };

  // دالة لعرض نوع الخصم
  const getDeductionTypeLabel = (type: string) => {
    switch (type) {
      case 'smart_deduction':
        return 'خصم ذكي';
      case 'salary_deduction':
        return 'خصم من الراتب';
      case 'debt_deduction':
        return 'خصم من الدين';
      default:
        return type;
    }
  };

  // دالة لعرض لون نوع الخصم
  const getDeductionTypeColor = (type: string) => {
    switch (type) {
      case 'smart_deduction':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'salary_deduction':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'debt_deduction':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // تصفية البيانات
  const filteredDeductions = deductions.filter((deduction: any) => {
    const employeeName = getEmployeeName(deduction.employeeId).toLowerCase();
    const matchesSearch = 
      employeeName.includes(searchTerm.toLowerCase()) ||
      deduction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || deduction.type === typeFilter || deduction.deductionType === typeFilter;
    return matchesSearch && matchesType;
  });

  // حساب الإحصائيات
  const totalDeductions = deductions.length;
  const totalAmount = deductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount || '0'), 0);
  const salaryDeductions = deductions.filter((d: any) => d.type === 'salary_deduction' || d.deductionType === 'salary_deduction').length;
  const debtDeductions = deductions.filter((d: any) => d.type === 'debt_deduction' || d.deductionType === 'debt_deduction').length;

  const handleDelete = (deduction: any) => {
    setSelectedDeduction(deduction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDeduction) {
      deleteMutation.mutate(selectedDeduction.id);
    }
  };

  const handleAddDeduction = () => {
    if (!selectedEmployeeId || !newDeduction.deductionType || !newDeduction.amount) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // العثور على الدين المستهدف
    let targetDebtId = newDeduction.targetDebtId ? parseInt(newDeduction.targetDebtId) : undefined;
    
    if ((newDeduction.deductionType === 'debt_deduction' || newDeduction.deductionType === 'smart_deduction') && !targetDebtId) {
      const activeDebt = selectedEmployeeDebts[0];
      if (activeDebt) {
        targetDebtId = activeDebt.id;
      }
    }

    addDeductionMutation.mutate({
      employeeId: parseInt(selectedEmployeeId),
      branchId: branchId,
      deductionType: newDeduction.deductionType,
      amount: newDeduction.amount,
      description: newDeduction.description,
      deductionDate: newDeduction.date,
      targetDebtId: targetDebtId,
      notes: '',
      status: 'active'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* العنوان الرئيسي */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl shadow-lg">
                <TrendingDown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">قائمة الخصومات</h1>
                <p className="text-gray-500 mt-1">عرض وإدارة جميع الخصومات</p>
              </div>
            </div>
            
            {/* زر إضافة خصم جديد */}
            <Dialog open={addDeductionOpen} onOpenChange={setAddDeductionOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                  data-testid="button-add-new-deduction"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة خصم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة خصم جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* اختيار الموظف */}
                  <div className="space-y-2">
                    <Label>الموظف *</Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                    >
                      <SelectTrigger data-testid="select-employee">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name} - {emp.position || 'موظف'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* نوع الخصم */}
                  <div className="space-y-2">
                    <Label>نوع الخصم *</Label>
                    <Select
                      value={newDeduction.deductionType}
                      onValueChange={(value) => setNewDeduction({...newDeduction, deductionType: value})}
                    >
                      <SelectTrigger data-testid="select-deduction-type">
                        <SelectValue placeholder="اختر نوع الخصم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smart_deduction">
                          ⚡ خصم ذكي (من الدين أولاً ثم الراتب)
                        </SelectItem>
                        <SelectItem value="salary_deduction">
                          💵 خصم من الراتب فقط
                        </SelectItem>
                        <SelectItem value="debt_deduction">
                          💳 خصم من الدين فقط
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* المبلغ */}
                  <div className="space-y-2">
                    <Label>المبلغ (ريال) *</Label>
                    <Input
                      type="number"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction({...newDeduction, amount: e.target.value})}
                      placeholder="0.00"
                      data-testid="input-deduction-amount"
                    />
                  </div>

                  {/* التاريخ */}
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input
                      type="date"
                      value={newDeduction.date}
                      onChange={(e) => setNewDeduction({...newDeduction, date: e.target.value})}
                      data-testid="input-deduction-date"
                    />
                  </div>

                  {/* اختيار الدين */}
                  {(newDeduction.deductionType === 'debt_deduction' || newDeduction.deductionType === 'smart_deduction') && selectedEmployeeDebts.length > 0 && (
                    <div className="space-y-2">
                      <Label>الدين المستهدف (اختياري)</Label>
                      <Select
                        value={newDeduction.targetDebtId}
                        onValueChange={(value) => setNewDeduction({...newDeduction, targetDebtId: value})}
                      >
                        <SelectTrigger data-testid="select-target-debt">
                          <SelectValue placeholder="اختر دين (تلقائي: أول دين نشط)" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedEmployeeDebts.map((debt: any) => (
                            <SelectItem key={debt.id} value={debt.id.toString()}>
                              {debt.description || 'دين'} - الباقي: {parseFloat(debt.remainingAmount || debt.amount || '0').toLocaleString('en-US')} ريال
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">إذا لم تحدد، سيُخصم من أول دين نشط</p>
                    </div>
                  )}

                  {/* الوصف */}
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      value={newDeduction.description}
                      onChange={(e) => setNewDeduction({...newDeduction, description: e.target.value})}
                      placeholder="وصف اختياري..."
                      data-testid="input-deduction-description"
                    />
                  </div>

                  {/* الأزرار */}
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setAddDeductionOpen(false)}
                      data-testid="button-cancel-deduction"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleAddDeduction}
                      disabled={addDeductionMutation.isPending}
                      className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                      data-testid="button-submit-deduction"
                    >
                      {addDeductionMutation.isPending ? 'جاري الإضافة...' : 'إضافة الخصم'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">إجمالي الخصومات</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalDeductions}</div>
              <p className="text-xs text-blue-700 mt-1">خصم</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-900">إجمالي المبالغ</CardTitle>
              <DollarSign className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-red-700 mt-1">ريال</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">خصومات الراتب</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{salaryDeductions}</div>
              <p className="text-xs text-purple-700 mt-1">خصم</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">خصومات الدين</CardTitle>
              <Users className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">{debtDeductions}</div>
              <p className="text-xs text-amber-700 mt-1">خصم</p>
            </CardContent>
          </Card>
        </div>

        {/* البحث والتصفية */}
        <Card className="border-blue-100 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن خصم (اسم الموظف، الوصف...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-deductions"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="select-type-filter">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="نوع الخصم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="smart_deduction">خصم ذكي</SelectItem>
                    <SelectItem value="salary_deduction">خصم من الراتب</SelectItem>
                    <SelectItem value="debt_deduction">خصم من الدين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول الخصومات */}
        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              الخصومات ({filteredDeductions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeductions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد خصومات</p>
                <p className="text-gray-400 text-sm mt-2">لم يتم العثور على أي خصومات تطابق البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right font-bold">#</TableHead>
                      <TableHead className="text-right font-bold">الموظف</TableHead>
                      <TableHead className="text-right font-bold">نوع الخصم</TableHead>
                      <TableHead className="text-right font-bold">المبلغ</TableHead>
                      <TableHead className="text-right font-bold">الوصف</TableHead>
                      <TableHead className="text-right font-bold">التاريخ</TableHead>
                      <TableHead className="text-right font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeductions.map((deduction: any, index: number) => (
                      <TableRow 
                        key={deduction.id}
                        className="hover:bg-blue-50 transition-colors"
                        data-testid={`row-deduction-${deduction.id}`}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{getEmployeeName(deduction.employeeId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDeductionTypeColor(deduction.type || deduction.deductionType)}>
                            {getDeductionTypeLabel(deduction.type || deduction.deductionType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-red-600">
                            {parseFloat(deduction.amount).toLocaleString()} ريال
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {deduction.description || 'لا يوجد وصف'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {deduction.date 
                              ? format(new Date(deduction.date || deduction.deductionDate), 'dd/MM/yyyy', { locale: ar })
                              : 'غير محدد'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(deduction)}
                              className="h-8"
                              data-testid={`button-delete-${deduction.id}`}
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

        {/* مربع حوار تأكيد الحذف */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف هذا الخصم؟
                <br />
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold text-gray-900">تفاصيل الخصم:</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>الموظف:</strong> {selectedDeduction && getEmployeeName(selectedDeduction.employeeId)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>المبلغ:</strong> {selectedDeduction && parseFloat(selectedDeduction.amount).toLocaleString()} ريال
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>الوصف:</strong> {selectedDeduction?.description || 'لا يوجد'}
                  </p>
                </div>
                <p className="mt-3 text-red-600 font-medium">
                  ⚠️ لا يمكن التراجع عن هذا الإجراء
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
