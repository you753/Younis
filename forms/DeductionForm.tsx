import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: string;
  department: string;
  hireDate: string;
  status: string;
}

interface EmployeeDebt {
  id: number;
  debtorId: number;
  reason: string;
  amount: string;
  remainingAmount: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

interface Deduction {
  id?: number;
  employeeId: number;
  debtId?: number;
  type: string;
  amount: string;
  description: string;
  date: string;
  status: string;
}

interface DeductionFormProps {
  deduction?: Deduction;
  onSuccess: () => void;
}

interface FormData {
  employeeId: string;
  debtId: string;
  deductionType: string;
  amount: string;
  description: string;
  notes: string;
  date: string;
}

export default function DeductionForm({ deduction, onSuccess }: DeductionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    debtId: '',
    deductionType: '',
    amount: '',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب البيانات
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: employeeDebts = [], isLoading: debtsLoading } = useQuery<EmployeeDebt[]>({
    queryKey: ['/api/debts'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // تحديث النموذج عند تمرير بيانات للتعديل
  useEffect(() => {
    if (deduction) {
      setFormData({
        employeeId: deduction.employeeId.toString(),
        debtId: deduction.debtId?.toString() || '',
        deductionType: deduction.type,
        amount: deduction.amount,
        description: deduction.description,
        notes: '',
        date: deduction.date.split('T')[0]
      });
    }
  }, [deduction]);

  // إنشاء أو تحديث الخصم
  const createDeductionMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = deduction ? `/api/deductions/${deduction.id}` : '/api/deductions';
      const method = deduction ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: deduction ? "تم تحديث الخصم بنجاح" : "تم إنشاء الخصم بنجاح",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error saving deduction:', error);
      toast({
        title: "خطأ",
        description: deduction ? "فشل في تعديل الخصم" : "فشل في إنشاء الخصم",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.deductionType || !formData.amount) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      employeeId: parseInt(formData.employeeId),
      debtId: formData.debtId ? parseInt(formData.debtId) : undefined,
      type: formData.deductionType,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date
    };

    createDeductionMutation.mutate(submitData);
  };

  // الحصول على بيانات الموظف المحدد
  const selectedEmployee = employees.find((emp: Employee) => emp.id === parseInt(formData.employeeId));
  
  // الحصول على ديون الموظف المحدد
  const selectedEmployeeDebts = employeeDebts.filter((debt: EmployeeDebt) => 
    debt.debtorId === parseInt(formData.employeeId) && debt.status === 'active'
  );

  // الحصول على بيانات الدين المحدد
  const selectedDebt = employeeDebts.find((debt: EmployeeDebt) => debt.id === parseInt(formData.debtId));

  const getDeductionTypeLabel = (type: string) => {
    switch (type) {
      case 'salary_deduction':
        return 'خصم من الراتب';
      case 'debt_deduction':
        return 'خصم من الدين';
      default:
        return type;
    }
  };

  if (employeesLoading || debtsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* اختيار الموظف */}
        <div className="space-y-2">
          <Label htmlFor="employee" className="text-sm font-medium">الموظف *</Label>
          <Select value={formData.employeeId} onValueChange={(value) => handleInputChange('employeeId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر موظف..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee: Employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name} - {employee.position} - راتب: {parseFloat(employee.salary).toLocaleString()} ريال
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* نوع الخصم */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">نوع الخصم *</Label>
          <RadioGroup 
            value={formData.deductionType} 
            onValueChange={(value) => handleInputChange('deductionType', value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="salary_deduction" id="salary_deduction" />
              <Label htmlFor="salary_deduction" className="text-sm">خصم من الراتب</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="debt_deduction" id="debt_deduction" />
              <Label htmlFor="debt_deduction" className="text-sm">خصم من الدين</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* اختيار الدين (إذا كان نوع الخصم متعلق بالدين) */}
      {formData.deductionType === 'debt_deduction' && (
        <div className="space-y-2">
          <Label htmlFor="debt" className="text-sm font-medium">الدين المرتبط *</Label>
          <Select value={formData.debtId} onValueChange={(value) => handleInputChange('debtId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر دين..." />
            </SelectTrigger>
            <SelectContent>
              {selectedEmployeeDebts.map((debt: EmployeeDebt) => (
                <SelectItem key={debt.id} value={debt.id.toString()}>
                  {debt.reason} - {parseFloat(debt.remainingAmount).toLocaleString()} ريال متبقي
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEmployeeDebts.length === 0 && formData.employeeId && (
            <p className="text-sm text-amber-600">لا توجد ديون نشطة لهذا الموظف</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المبلغ */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">مبلغ الخصم (ريال) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="أدخل مبلغ الخصم"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* التاريخ */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">تاريخ الخصم *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* الوصف */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">وصف الخصم *</Label>
        <Input
          id="description"
          placeholder="أدخل وصف الخصم"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* ملاحظات */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">ملاحظات إضافية</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="أدخل ملاحظات إضافية (اختياري)"
          className="mt-1"
        />
      </div>

      {/* ملخص العملية */}
      {formData.deductionType && formData.amount && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">ملخص العملية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">نوع العملية:</span>
                <Badge variant="outline" className="mr-2">
                  {getDeductionTypeLabel(formData.deductionType)}
                </Badge>
              </div>
              <div>
                <span className="font-medium">المبلغ:</span>
                <Badge variant="outline" className="mr-2">
                  {parseFloat(formData.amount || '0').toLocaleString()} ريال
                </Badge>
              </div>
              {formData.deductionType === 'salary_deduction' && selectedEmployee && (
                <div>
                  <span className="font-medium">الراتب بعد الخصم:</span>
                  <Badge variant="outline" className="mr-2">
                    {(parseFloat(selectedEmployee.salary) - parseFloat(formData.amount || '0')).toLocaleString()} ريال
                  </Badge>
                </div>
              )}
              {formData.deductionType === 'debt_deduction' && selectedDebt && (
                <div>
                  <span className="font-medium">الدين بعد الخصم:</span>
                  <Badge variant="outline" className="mr-2">
                    {Math.max(0, parseFloat(selectedDebt.remainingAmount) - parseFloat(formData.amount || '0')).toLocaleString()} ريال
                  </Badge>
                </div>
              )}
              {formData.deductionType === 'salary_to_debt' && selectedEmployee && selectedDebt && (
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">الراتب بعد الخصم:</span>
                    <Badge variant="outline" className="mr-2">
                      {(parseFloat(selectedEmployee.salary) - parseFloat(formData.amount || '0')).toLocaleString()} ريال
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">الدين بعد السداد:</span>
                    <Badge variant="outline" className="mr-2">
                      {Math.max(0, parseFloat(selectedDebt.remainingAmount) - parseFloat(formData.amount || '0')).toLocaleString()} ريال
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="submit"
          disabled={createDeductionMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createDeductionMutation.isPending ? 
            'جاري الحفظ...' : 
            (deduction ? 'تحديث الخصم' : 'إنشاء الخصم')
          }
        </Button>
      </div>
    </form>
  );
}