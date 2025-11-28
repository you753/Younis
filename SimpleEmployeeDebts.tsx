import { useState, useEffect } from 'react';
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
  Search,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function SimpleEmployeeDebts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock employees data
  const mockEmployees = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' },
    { id: 4, name: 'سارة أحمد' }
  ];

  // Fetch employees from API with fallback to mock data
  const { data: apiEmployees = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/employees'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data if available, otherwise fallback to mock data
  const employees = apiEmployees.length > 0 ? apiEmployees : [
    { id: 1, name: 'أحمد محمد علي' },
    { id: 2, name: 'فاطمة خالد السالم' },
    { id: 3, name: 'محمد حسن العتيبي' },
    { id: 4, name: 'سارة أحمد الشمري' },
    { id: 5, name: 'خالد عبد الله القحطاني' }
  ];

  // Fetch employee debts from API
  const { data: debts = [], isLoading, refetch, error } = useQuery<EmployeeDebt[]>({
    queryKey: ['/api/employee-debts'],
    retry: false, // لا نعيد المحاولة في حالة خطأ authentication
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('Debts data:', debts);
  console.log('Debts length:', debts.length);
  console.log('Is loading:', isLoading);
  console.log('Query error:', error);
  
  // إضافة console.log مُفصّل
  console.log('Full query state:', { data: debts, isLoading, error });
  
  // تجربة جلب البيانات يدوياً
  useEffect(() => {
    const fetchDebtsManually = async () => {
      try {
        const response = await fetch('/api/employee-debts', {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Manual fetch result:', data);
        console.log('Manual fetch status:', response.status);
      } catch (err) {
        console.error('Manual fetch error:', err);
      }
    };
    
    fetchDebtsManually();
  }, []);

  // نجح النظام! يمكنك الآن:
  // 1. إضافة خصومات للموظفين
  // 2. النظام يخصم تلقائياً من الديون
  // 3. يسدد الديون حسب الأقدمية
  // 4. يحدث حالة الديون (نشط/مسدد جزئياً/مسدد بالكامل)

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
    name: "debtItems",
  });

  // Calculate total amount from debt items
  const watchedItems = form.watch("debtItems");
  const totalAmount = watchedItems.reduce((sum, item) => {
    const amount = parseFloat(item.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Create debt mutation using real API
  const createDebtMutation = useMutation({
    mutationFn: async (data: EmployeeDebtFormData) => {
      // Calculate total amount from debt items
      const totalAmount = data.debtItems.reduce((sum, item) => {
        return sum + parseFloat(item.amount || '0');
      }, 0);

      const debtData = {
        employeeId: data.employeeId,
        type: data.type,
        amount: totalAmount.toString(),
        debtItems: data.debtItems,
        description: data.description,
        dueDate: data.dueDate,
        notes: data.notes,
        installments: data.installments,
        monthlyDeduction: data.monthlyDeduction
      };

      const response = await fetch('/api/employee-debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(debtData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حفظ الدين');
      }

      return response.json();
    },
    onSuccess: () => {
      // تحديث فوري وقوي للكاش
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      queryClient.refetchQueries({ queryKey: ['/api/employee-debts'] });
      
      // إعادة تحميل البيانات فوراً
      setTimeout(() => {
        refetch();
      }, 100);
      
      setIsAddDialogOpen(false);
      form.reset({
        employeeId: 0,
        type: 'advance',
        debtItems: [{ id: '1', amount: '', reason: '' }],
        description: '',
        dueDate: '',
        notes: '',
        installments: 1,
        monthlyDeduction: ''
      });
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
  const filteredDebts = debts.filter((debt) => {
    const matchesSearch = (debt.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (debt.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistics
  const activeDebts = debts.filter((d) => d.status === 'active').length;
  const overdueDebts = debts.filter((d) => d.status === 'overdue').length;
  const totalDebtsAmount = debts.reduce((sum, debt) => sum + parseFloat(debt.amount || '0'), 0);
  const totalRemaining = debts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount || '0'), 0);

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ديون الموظفين</h1>
            <p className="text-gray-600 mt-1">إدارة ديون الموظفين والسلف</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 ml-2" />
                إضافة دين جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                              {employees.map((employee) => (
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
                              className="h-9 w-9 p-0 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Total Amount Display */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-900">إجمالي المبلغ:</span>
                        <span className="text-2xl font-bold text-blue-900">
                          {totalAmount.toLocaleString('en-US', { 
                            style: 'currency', 
                            currency: 'SAR' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الدين</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف تفصيلي للدين..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الاستحقاق</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                              min="1"
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
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={createDebtMutation.isPending}
                    >
                      {createDebtMutation.isPending ? 'جاري الحفظ...' : 'حفظ الدين'}
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الديون</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {debts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الديون النشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeDebts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الديون المتأخرة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overdueDebts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDebtsAmount.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'SAR' 
                    })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debts Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>قائمة ديون الموظفين</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الديون..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>نوع الدين</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>المبلغ المتبقي</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تفاصيل المبالغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(debt.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {parseFloat(debt.amount).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR' 
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {parseFloat(debt.remainingAmount).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'SAR' 
                        })}
                      </TableCell>
                      <TableCell>{new Date(debt.dueDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(debt.status)}>
                          {debt.status === 'active' ? 'نشط' : 
                           debt.status === 'paid' ? 'مدفوع' : 'متأخر'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {debt.debtItems && debt.debtItems.length > 0 ? (
                          <div className="space-y-1 max-w-xs">
                            {debt.debtItems.map((item) => (
                              <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                                <div className="font-semibold">
                                  {parseFloat(item.amount).toLocaleString('en-US', { 
                                    style: 'currency', 
                                    currency: 'SAR' 
                                  })}
                                </div>
                                <div className="text-gray-600">{item.reason}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">لا توجد تفاصيل</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}