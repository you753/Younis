import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Calculator, Users, TrendingDown, ArrowRightLeft, FileText, Search, Printer, Phone, MapPin, CreditCard, Eye } from 'lucide-react';

interface DeductionFormData {
  employeeId: number;
  amount: string;
  description: string;
  deductionType: 'salary' | 'debt' | 'salary_to_debt';
  date: string;
}

const AdvancedDeductions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DeductionFormData>({
    employeeId: 0,
    amount: '',
    description: '',
    deductionType: 'salary',
    date: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // البيانات
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    refetchInterval: 3000
  });

  const { data: deductions = [] } = useQuery({
    queryKey: ['/api/deductions'], 
    refetchInterval: 3000
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['/api/debts'],
    refetchInterval: 3000
  });

  // حساب الإحصائيات
  const totalDeductionsAmount = deductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
  const totalDebtsAmount = debts.reduce((sum: number, debt: any) => {
    if (!debt.debtItems || !Array.isArray(debt.debtItems)) return sum;
    return sum + debt.debtItems.reduce((itemSum: number, item: any) => itemSum + parseFloat(item.amount || 0), 0);
  }, 0);

  // إنشاء خصم جديد
  const createDeductionMutation = useMutation({
    mutationFn: async (data: DeductionFormData) => {
      const response = await fetch('/api/advanced-deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: data.employeeId,
          amount: data.amount,
          description: data.description,
          type: data.deductionType,
          date: data.date
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deduction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      toast({ title: 'تم إضافة الخصم بنجاح' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطأ في إضافة الخصم', 
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive' 
      });
    }
  });

  // حذف خصم
  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/deductions/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete deduction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      toast({ title: 'تم حذف الخصم بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف الخصم', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      employeeId: 0,
      amount: '',
      description: '',
      deductionType: 'salary',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.amount || !formData.description) {
      toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    createDeductionMutation.mutate(formData);
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    return employee?.name || 'غير معروف';
  };

  const getDeductionTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return 'خصم من الراتب';
      case 'debt': return 'خصم من الدين';
      case 'salary_to_debt': return 'تحويل من الراتب للدين';
      default: return type;
    }
  };

  const getDeductionTypeColor = (type: string) => {
    switch (type) {
      case 'salary': return 'text-red-600 bg-red-50';
      case 'debt': return 'text-green-600 bg-green-50';
      case 'salary_to_debt': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الخصومات وكشوف الحساب</h1>
      </div>

      <Tabs defaultValue="deductions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deductions">الخصومات المتقدمة</TabsTrigger>
          <TabsTrigger value="statements">كشوف حسابات الموظفين</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deductions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">نظام الخصومات المتقدم</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خصم جديد
                </Button>
              </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة خصم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الموظف *</Label>
                <Select 
                  onValueChange={(value) => setFormData({...formData, employeeId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.position || 'موظف'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>نوع الخصم *</Label>
                <RadioGroup 
                  value={formData.deductionType} 
                  onValueChange={(value: 'salary' | 'debt' | 'salary_to_debt') => 
                    setFormData({...formData, deductionType: value})
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="salary" id="salary" />
                    <Label htmlFor="salary" className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      خصم من الراتب
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="debt" id="debt" />
                    <Label htmlFor="debt" className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-green-500" />
                      خصم من الدين
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="salary_to_debt" id="salary_to_debt" />
                    <Label htmlFor="salary_to_debt" className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                      تحويل من الراتب للدين
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>المبلغ (ريال) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div>
                <Label>الوصف *</Label>
                <Textarea
                  placeholder="اكتب وصف الخصم..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <Label>التاريخ *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={createDeductionMutation.isPending}
                className="w-full"
              >
                {createDeductionMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخصم'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xl font-bold">{employees.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">عدد الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-500" />
              <span className="text-xl font-bold">{deductions.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إجمالي مبلغ الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xl font-bold text-red-600">
                {totalDeductionsAmount.toLocaleString('en-US')} ريال
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إجمالي الديون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-orange-500" />
              <span className="text-xl font-bold text-orange-600">
                {totalDebtsAmount.toLocaleString('en-US')} ريال
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الخصومات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الخصومات</CardTitle>
        </CardHeader>
        <CardContent>
          {deductions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد خصومات مسجلة
            </div>
          ) : (
            <div className="space-y-4">
              {deductions.map((deduction: any) => (
                <Card key={deduction.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold">{getEmployeeName(deduction.employeeId)}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeductionTypeColor(deduction.type)}`}>
                            {getDeductionTypeLabel(deduction.type)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600">{deduction.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>التاريخ: {new Date(deduction.date).toLocaleDateString('en-GB')}</span>
                          <span className="font-bold text-lg text-red-600">
                            {parseFloat(deduction.amount).toLocaleString('en-US')} ريال
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDeductionMutation.mutate(deduction.id)}
                        disabled={deleteDeductionMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات الموظفين */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee: any) => {
              const employeeDeductions = deductions.filter((d: any) => d.employeeId === employee.id);
              const employeeDebts = debts.filter((debt: any) => 
                debt.debtorId === employee.id && debt.debtorType === 'employee'
              );
              
              const totalDeductions = employeeDeductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
              const totalDebts = employeeDebts.reduce((sum: number, debt: any) => {
                if (!debt.debtItems || !Array.isArray(debt.debtItems)) return sum;
                return sum + debt.debtItems.reduce((itemSum: number, item: any) => itemSum + parseFloat(item.amount || 0), 0);
              }, 0);

              const salary = parseFloat(employee.salary) || 0;
              const netSalary = salary - totalDeductions;

              return (
                <Card key={employee.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-bold">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.position || 'موظف'}</p>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>الراتب الأساسي:</span>
                          <span className="font-bold text-green-600">{salary.toLocaleString('en-US')} ريال</span>
                        </div>
                        
                        {totalDeductions > 0 && (
                          <div className="flex justify-between">
                            <span>الخصومات:</span>
                            <span className="font-bold text-red-600">-{totalDeductions.toLocaleString('en-US')} ريال</span>
                          </div>
                        )}
                        
                        {totalDebts > 0 && (
                          <div className="flex justify-between">
                            <span>الديون:</span>
                            <span className="font-bold text-orange-600">{totalDebts.toLocaleString('en-US')} ريال</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-bold">الراتب الصافي:</span>
                          <span className="font-bold text-blue-600">{netSalary.toLocaleString('en-US')} ريال</span>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          {employeeDeductions.length} خصم مسجل
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedDeductions;