import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
  Plus,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit,
  Search,
  Filter,
  X,
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

// Mock data for testing
const mockDebts: EmployeeDebt[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'أحمد محمد',
    type: 'advance',
    amount: '5000.00',
    remainingAmount: '3000.00',
    debtItems: [
      { id: '1', amount: '3000', reason: 'سلفة راتب شهر يناير' },
      { id: '2', amount: '2000', reason: 'سلفة طوارئ' }
    ],
    description: 'سلفة على الراتب',
    dueDate: '2025-07-28',
    status: 'active',
    installments: 5,
    monthlyDeduction: '1000.00',
    notes: 'خصم شهري من الراتب',
    createdAt: '2025-06-28'
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'فاطمة علي',
    type: 'loan',
    amount: '10000.00',
    remainingAmount: '7000.00',
    debtItems: [
      { id: '1', amount: '8000', reason: 'قرض شخصي' },
      { id: '2', amount: '2000', reason: 'مصاريف إضافية' }
    ],
    description: 'قرض شخصي للموظفة',
    dueDate: '2025-12-28',
    status: 'active',
    installments: 10,
    monthlyDeduction: '1000.00',
    notes: 'قرض بدون فوائد',
    createdAt: '2025-06-15'
  }
];

export default function EmployeeDebtsNew() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [editingDebt, setEditingDebt] = useState<EmployeeDebt | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock employees data
  const mockEmployees = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' },
    { id: 4, name: 'سارة أحمد' }
  ];

  // Fetch employees
  const { data: employees = mockEmployees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => Promise.resolve(mockEmployees),
  });

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "debtItems"
  });

  // Calculate total amount from debt items
  const watchedItems = form.watch("debtItems");
  const totalAmount = watchedItems.reduce((sum, item) => {
    const amount = parseFloat(item.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: async (data: EmployeeDebtFormData) => {
      // Calculate total amount from debt items
      const totalAmount = data.debtItems.reduce((sum, item) => {
        return sum + parseFloat(item.amount || '0');
      }, 0);

      const debtData = {
        ...data,
        amount: totalAmount.toString(),
        remainingAmount: totalAmount.toString()
      };

      return apiRequest({
        method: 'POST',
        url: '/api/employee-debts',
        body: debtData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الدين بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الدين",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: EmployeeDebtFormData) => {
    createDebtMutation.mutate(data);
  };

  // Add new debt item
  const addDebtItem = () => {
    append({ id: Date.now().toString(), amount: '', reason: '' });
  };

  // Remove debt item
  const removeDebtItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Filter debts
  const filteredDebts = debts.filter((debt: EmployeeDebt) => {
    const matchesSearch = debt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    const matchesType = typeFilter === 'all' || debt.type === typeFilter;
    const matchesEmployee = selectedEmployee === 'all' || debt.employeeId.toString() === selectedEmployee;
    
    return matchesSearch && matchesStatus && matchesType && matchesEmployee;
  });

  // Statistics
  const activeDebts = debts.filter((d: EmployeeDebt) => d.status === 'active').length;
  const overdueDebts = debts.filter((d: EmployeeDebt) => d.status === 'overdue').length;
  const totalDebtsAmount = debts.reduce((sum: number, debt: EmployeeDebt) => sum + parseFloat(debt.amount || '0'), 0);
  const totalRemaining = debts.reduce((sum: number, debt: EmployeeDebt) => sum + parseFloat(debt.remainingAmount || '0'), 0);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'advance': return 'سلفة';
      case 'loan': return 'قرض';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paid': return 'مدفوع';
      case 'overdue': return 'متأخر';
      default: return status;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ديون الموظفين</h1>
          <p className="text-gray-600 mt-2">إدارة وتتبع ديون الموظفين والسلف والقروض</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة دين جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة دين جديد للموظف</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee Selection */}
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموظف</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((employee: any) => (
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

                  {/* Debt Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الدين</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>

                {/* Debt Items Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-lg font-semibold">المبالغ والأسباب</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDebtItem}
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة مبلغ
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`debtItems.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">المبلغ (ر.س)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-7">
                        <FormField
                          control={form.control}
                          name={`debtItems.${index}.reason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">السبب</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="سبب الدين..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDebtItem(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total Amount Display */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-800">الإجمالي النهائي:</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الدين</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف مختصر للدين أو الغرض منه"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الاستحقاق</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Installments */}
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الأقساط</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Deduction */}
                  <FormField
                    control={form.control}
                    name="monthlyDeduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الخصم الشهري (ر.س)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أي ملاحظات أو تفاصيل إضافية..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createDebtMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createDebtMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debts.length}</div>
            <p className="text-xs text-muted-foreground">
              عدد جميع الديون المسجلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDebts}</div>
            <p className="text-xs text-muted-foreground">
              الديون قيد السداد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueDebts}</div>
            <p className="text-xs text-muted-foreground">
              الديون المتجاوزة للموعد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDebtsAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">
              المبلغ الإجمالي للديون
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الديون..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الدين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
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

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees.map((employee: any) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة ديون الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد ديون مطابقة للبحث</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>المبلغ المتبقي</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تفاصيل المبالغ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.map((debt: EmployeeDebt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(debt.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {parseFloat(debt.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell className="font-semibold text-orange-600">
                      {parseFloat(debt.remainingAmount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell>{new Date(debt.dueDate).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(debt.status)}>
                        {getStatusLabel(debt.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {debt.debtItems && debt.debtItems.length > 0 && (
                        <div className="space-y-1">
                          {debt.debtItems.map((item, index) => (
                            <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-semibold">
                                {parseFloat(item.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                              </div>
                              <div className="text-gray-600">{item.reason}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDebt(debt)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}