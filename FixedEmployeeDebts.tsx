import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Plus,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';

// Schema for form validation
const employeeDebtSchema = z.object({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  type: z.string().min(1, 'يجب اختيار نوع الدين'),
  amount: z.string().min(1, 'يجب إدخال المبلغ'),
  description: z.string().min(1, 'يجب إدخال وصف'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type EmployeeDebtFormData = z.infer<typeof employeeDebtSchema>;

interface EmployeeDebt {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  remainingAmount: string;
}

export default function FixedEmployeeDebts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple employees list
  const employees = [
    { id: 1, name: 'أحمد محمد علي' },
    { id: 2, name: 'فاطمة خالد السالم' },
    { id: 3, name: 'محمد حسن العتيبي' },
    { id: 4, name: 'سارة أحمد الشمري' },
    { id: 5, name: 'خالد عبد الله القحطاني' }
  ];

  // Fetch employee debts
  const { data: debts = [], isLoading } = useQuery<EmployeeDebt[]>({
    queryKey: ['/api/employee-debts'],
  });

  // Form setup
  const form = useForm<EmployeeDebtFormData>({
    resolver: zodResolver(employeeDebtSchema),
    defaultValues: {
      employeeId: 0,
      type: 'advance',
      amount: '',
      description: '',
      dueDate: '',
      notes: '',
    },
  });

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: async (data: EmployeeDebtFormData) => {
      const response = await fetch('/api/employee-debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في حفظ الدين');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-debts'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة الدين بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeDebtFormData) => {
    createDebtMutation.mutate(data);
  };

  // Filter debts
  const filteredDebts = debts.filter((debt) => {
    const matchesSearch = (debt.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (debt.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistics
  const activeDebts = debts.filter((d) => d.status === 'active').length;
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة دين جديد للموظف</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المبلغ (ر.س)</FormLabel>
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
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="وصف الدين..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="ملاحظات إضافية..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalDebtsAmount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الديون النشطة</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDebts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ المتبقي</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRemaining.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد الموظفين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الديون..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debts Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الديون</CardTitle>
            <CardDescription>
              عرض جميع ديون الموظفين ({filteredDebts.length} دين)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredDebts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد ديون مسجلة</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(debt.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        {parseFloat(debt.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </TableCell>
                      <TableCell>
                        {parseFloat(debt.remainingAmount || debt.amount).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </TableCell>
                      <TableCell>{debt.description}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(debt.status)}>
                          {debt.status === 'active' ? 'نشط' : 
                           debt.status === 'paid' ? 'مسدد' : 
                           debt.status === 'overdue' ? 'متأخر' : debt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(debt.createdAt).toLocaleDateString('en-GB')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}