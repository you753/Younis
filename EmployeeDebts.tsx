import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Schema for debt item
const debtItemSchema = z.object({
  id: z.string(),
  amount: z.string().min(1, 'يجب إدخال المبلغ'),
  reason: z.string().min(1, 'يجب إدخال السبب'),
});

// Schema for employee debt
const employeeDebtSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  type: z.enum(['advance', 'loan', 'other'], {
    required_error: 'يجب اختيار نوع الدين'
  }),
  debtItems: z.array(debtItemSchema).min(1, 'يجب إضافة مبلغ واحد على الأقل'),
  description: z.string().min(1, 'يجب إدخال وصف الدين'),
  dueDate: z.string().min(1, 'يجب إدخال تاريخ الاستحقاق'),
  notes: z.string().optional(),
  installments: z.number().min(1, 'يجب أن يكون عدد الأقساط 1 على الأقل').optional(),
  monthlyDeduction: z.string().optional()
});

type EmployeeDebtFormData = z.infer<typeof employeeDebtSchema>;

interface DebtItem {
  id: string;
  amount: string;
  reason: string;
}

interface EmployeeDebt {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'advance' | 'loan' | 'other';
  amount: string;
  remainingAmount: string;
  debtItems?: DebtItem[];
  description: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  installments?: number;
  monthlyDeduction?: string;
  notes?: string;
  createdAt: string;
}

export default function EmployeeDebts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [editingDebt, setEditingDebt] = useState<EmployeeDebt | null>(null);
  const [previewDebt, setPreviewDebt] = useState<EmployeeDebt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<EmployeeDebt | null>(null);
  const [debtItems, setDebtItems] = useState<DebtItem[]>([{ id: '1', amount: '', reason: '' }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock employees data (temporary until API is ready)
  const mockEmployees = [
    { id: 1, name: "أحمد محمد علي", position: "محاسب" },
    { id: 2, name: "فاطمة خالد السالم", position: "مساعد إداري" }
  ];

  // Fetch employees for dropdown
  const { data: employees = mockEmployees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => Promise.resolve(mockEmployees),
  });

  // Mock data for employee debts (temporary until API is ready)
  const mockDebts: EmployeeDebt[] = [
    {
      id: 1,
      employeeId: 1,
      employeeName: "أحمد محمد علي",
      type: "advance",
      amount: "5000",
      remainingAmount: "3000",
      description: "سلفة طارئة لظروف عائلية",
      dueDate: "2025-08-15",
      status: "active",
      installments: 5,
      monthlyDeduction: "1000",
      notes: "يتم الخصم شهرياً من الراتب",
      createdAt: "2025-06-28"
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "فاطمة خالد السالم",
      type: "loan",
      amount: "10000",
      remainingAmount: "7500",
      description: "قرض شخصي",
      dueDate: "2025-12-31",
      status: "active",
      installments: 10,
      monthlyDeduction: "1000",
      notes: "قرض بدون فوائد",
      createdAt: "2025-05-15"
    }
  ];

  // Fetch employee debts
  const { data: debts = mockDebts, isLoading } = useQuery({
    queryKey: ['/api/employee-debts'],
    queryFn: () => Promise.resolve(mockDebts),
  });

  // Form setup
  const form = useForm<EmployeeDebtFormData>({
    resolver: zodResolver(employeeDebtSchema),
    defaultValues: {
      employeeId: 0,
      type: 'advance',
      debtItems: [{ id: '1', amount: '', reason: '' }],
      description: '',
      dueDate: '',
      notes: '',
      installments: 1,
      monthlyDeduction: ''
    },
  });

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: async (data: EmployeeDebtFormData) => {
      const response = await fetch('/api/employee-debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create debt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة دين الموظف بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة الدين',
        variant: 'destructive',
      });
    },
  });

  // Update debt mutation
  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmployeeDebtFormData> }) => {
      const response = await fetch(`/api/employee-debts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update debt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      setEditingDebt(null);
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث دين الموظف بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث الدين',
        variant: 'destructive',
      });
    },
  });

  // Delete debt mutation
  const deleteDebtMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/employee-debts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete debt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      setIsDeleteDialogOpen(false);
      setDebtToDelete(null);
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف دين الموظف بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حذف الدين',
        variant: 'destructive',
      });
    },
  });

  // Handler functions
  const handlePreview = (debt: EmployeeDebt) => {
    setPreviewDebt(debt);
    setIsPreviewDialogOpen(true);
  };

  const handleEdit = (debt: EmployeeDebt) => {
    setEditingDebt(debt);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (debt: EmployeeDebt) => {
    setDebtToDelete(debt);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: EmployeeDebtFormData) => {
    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt.id, data });
    } else {
      createDebtMutation.mutate(data);
    }
  };

  // Filter debts based on search and filters
  const filteredDebts = (debts as EmployeeDebt[]).filter((debt: EmployeeDebt) => {
    const matchesSearch = debt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    const matchesType = typeFilter === 'all' || debt.type === typeFilter;
    const matchesEmployee = selectedEmployee === 'all' || debt.employeeId.toString() === selectedEmployee;
    
    return matchesSearch && matchesStatus && matchesType && matchesEmployee;
  });

  // Calculate statistics
  const totalDebts = debts.length;
  const activeDebts = debts.filter((d: EmployeeDebt) => d.status === 'active').length;
  const overdueDebts = debts.filter((d: EmployeeDebt) => d.status === 'overdue').length;
  const totalAmount = debts.reduce((sum: number, debt: EmployeeDebt) => sum + parseFloat(debt.amount || '0'), 0);
  const totalRemaining = debts.reduce((sum: number, debt: EmployeeDebt) => sum + parseFloat(debt.remainingAmount || '0'), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">نشط</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">مسدد</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">متأخر</Badge>;
      default:
        return <Badge>غير محدد</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'advance':
        return <Badge variant="outline">سلفة</Badge>;
      case 'loan':
        return <Badge variant="outline">قرض</Badge>;
      case 'other':
        return <Badge variant="outline">أخرى</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const openEditDialog = (debt: EmployeeDebt) => {
    setEditingDebt(debt);
    form.reset({
      employeeId: debt.employeeId,
      type: debt.type,
      amount: debt.amount,
      description: debt.description,
      dueDate: debt.dueDate.split('T')[0], // Format date for input
      notes: debt.notes || '',
      installments: debt.installments || 1,
      monthlyDeduction: debt.monthlyDeduction || ''
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ديون الموظفين</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة ديون وسلف الموظفين</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة دين جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDebt ? 'تعديل دين الموظف' : 'إضافة دين جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingDebt ? 'تحديث بيانات دين الموظف' : 'إدخال بيانات دين جديد للموظف'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموظف</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(employees as any[]).map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الدين</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الدين" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="advance">سلفة</SelectItem>
                            <SelectItem value="loan">قرض</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ (ر.س)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الاستحقاق</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الأقساط</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="number"
                            min="1"
                            value={field.value || 1}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            placeholder="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyDeduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الخصم الشهري (ر.س)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف الدين</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="وصف مختصر للدين أو الغرض منه" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="أي ملاحظات أو تفاصيل إضافية" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingDebt(null);
                      form.reset();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDebtMutation.isPending || updateDebtMutation.isPending}
                  >
                    {editingDebt ? 'تحديث' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDebts}</div>
            <p className="text-xs text-muted-foreground">دين نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ديون نشطة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDebts}</div>
            <p className="text-xs text-muted-foreground">قيد السداد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ديون متأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueDebts}</div>
            <p className="text-xs text-muted-foreground">تحتاج متابعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الديون</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المتبقي</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalRemaining.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">مستحق السداد</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث بالموظف أو الوصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {(employees as any[]).map((employee: any) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paid">مسدد</SelectItem>
                <SelectItem value="overdue">متأخر</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الدين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="advance">سلفة</SelectItem>
                <SelectItem value="loan">قرض</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setSelectedEmployee('all');
              }}
            >
              <Filter className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة ديون الموظفين</CardTitle>
          <CardDescription>
            عرض تفصيلي لجميع الديون والسلف مع حالة السداد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد ديون</h3>
              <p className="mt-1 text-sm text-gray-500">لم يتم العثور على ديون بالمعايير المحددة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ الأصلي</TableHead>
                    <TableHead className="text-right">المبلغ المتبقي</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt: EmployeeDebt) => (
                    <TableRow key={debt.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{debt.employeeName}</div>
                          <div className="text-sm text-gray-500">ID: {debt.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(debt.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{debt.description}</div>
                          {debt.notes && (
                            <div className="text-sm text-gray-500 truncate">{debt.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {parseFloat(debt.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          {parseFloat(debt.remainingAmount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(debt.dueDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(debt.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(debt)}
                            className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(debt)}
                            className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
                            title="تعديل"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(debt)}
                            className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                            title="حذف"
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>معاينة دين الموظف</DialogTitle>
          </DialogHeader>
          {previewDebt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">اسم الموظف</label>
                  <p className="font-semibold">{previewDebt.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">نوع الدين</label>
                  <p className="font-semibold">{getTypeBadge(previewDebt.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">المبلغ الإجمالي</label>
                  <p className="font-semibold text-blue-600">
                    {parseFloat(previewDebt.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">المبلغ المتبقي</label>
                  <p className="font-semibold text-red-600">
                    {parseFloat(previewDebt.remainingAmount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">تاريخ الاستحقاق</label>
                  <p className="font-semibold">{new Date(previewDebt.dueDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">الحالة</label>
                  <p className="font-semibold">{getStatusBadge(previewDebt.status)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">الوصف</label>
                <p className="font-semibold bg-gray-50 p-2 rounded">{previewDebt.description}</p>
              </div>
              {previewDebt.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">ملاحظات</label>
                  <p className="font-semibold bg-gray-50 p-2 rounded">{previewDebt.notes}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsPreviewDialogOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل دين الموظف</DialogTitle>
            <DialogDescription>
              تعديل معلومات دين الموظف
            </DialogDescription>
          </DialogHeader>
          {editingDebt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">اسم الموظف</label>
                  <Input 
                    value={editingDebt.employeeName} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">نوع الدين</label>
                  <Select defaultValue={editingDebt.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advance">سلفة</SelectItem>
                      <SelectItem value="loan">قرض</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">المبلغ الإجمالي</label>
                  <Input defaultValue={editingDebt.amount} />
                </div>
                <div>
                  <label className="text-sm font-medium">المبلغ المتبقي</label>
                  <Input defaultValue={editingDebt.remainingAmount} />
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ الاستحقاق</label>
                  <Input type="date" defaultValue={editingDebt.dueDate} />
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <Select defaultValue={editingDebt.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="paid">مسدد</SelectItem>
                      <SelectItem value="overdue">متأخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Textarea defaultValue={editingDebt.description} />
              </div>
              <div>
                <label className="text-sm font-medium">ملاحظات</label>
                <Textarea defaultValue={editingDebt.notes} />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                  إلغاء
                </Button>
                <Button onClick={() => {
                  toast({
                    title: 'تم بنجاح',
                    description: 'تم تحديث دين الموظف بنجاح',
                  });
                  setIsEditDialogOpen(false);
                }}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الدين؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          {debtToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">سيتم حذف الدين التالي:</p>
                    <p className="text-red-700">
                      <span className="font-medium">{debtToDelete.employeeName}</span> - 
                      <span className="font-medium">{parseFloat(debtToDelete.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
                  إلغاء
                </Button>
                <Button 
                  onClick={() => {
                    deleteDebtMutation.mutate(debtToDelete.id);
                  }}
                  variant="destructive"
                  disabled={deleteDebtMutation.isPending}
                >
                  {deleteDebtMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}