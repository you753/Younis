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
import { Plus, Calculator, Users, TrendingDown, ArrowRightLeft, FileText, Search, Printer, Phone, MapPin, CreditCard, Eye, DollarSign } from 'lucide-react';

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

  // حذف دين
  const deleteDebtMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete debt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      toast({ title: 'تم حذف الدين بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف الدين', variant: 'destructive' });
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
                        ✕
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          <EmployeeStatementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// مكون كشف حساب الموظفين
const EmployeeStatementSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // جلب بيانات الموظفين
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    refetchInterval: 3000
  });

  // جلب بيانات الديون
  const { data: debts = [] } = useQuery({
    queryKey: ['/api/debts'],
    refetchInterval: 3000
  });

  // جلب بيانات الخصومات
  const { data: deductions = [] } = useQuery({
    queryKey: ['/api/deductions'],
    refetchInterval: 3000
  });

  // تصفية الموظفين حسب البحث
  const filteredEmployees = (employees as any[]).filter((employee: any) =>
    employee.name.includes(searchTerm) ||
    employee.position?.includes(searchTerm) ||
    employee.phone?.includes(searchTerm)
  );

  // حساب إجمالي الديون لموظف معين
  const calculateEmployeeDebt = (employeeId: number) => {
    return (debts as any[])
      .filter((debt: any) => debt.debtorId === employeeId)
      .reduce((total: number, debt: any) => {
        const debtTotal = debt.debtItems?.reduce((sum: number, item: any) => 
          sum + parseFloat(item.amount || 0), 0) || 0;
        return total + debtTotal;
      }, 0);
  };

  // حساب إجمالي الخصومات لموظف معين
  const calculateEmployeeDeductions = (employeeId: number) => {
    return (deductions as any[])
      .filter((deduction: any) => deduction.employeeId === employeeId)
      .reduce((total: number, deduction: any) => total + parseFloat(deduction.amount || 0), 0);
  };



  // طباعة كشف حساب الموظف مع تفاصيل الراتب والدين والتحويلات
  const printEmployeeStatement = (employee: any) => {
    console.log('===== طباعة كشف حساب الموظف الجديد =====');
    console.log('اسم الموظف:', employee.name);
    const employeeDebts = (debts as any[]).filter((debt: any) => debt.debtorId === employee.id);
    const employeeDeductions = (deductions as any[]).filter((deduction: any) => deduction.employeeId === employee.id);
    
    // حساب التفاصيل المالية
    const originalSalary = parseFloat(employee.salary || 0);
    const totalDeductions = calculateEmployeeDeductions(employee.id);
    const totalDebts = calculateEmployeeDebt(employee.id);
    
    // تصنيف الخصومات حسب النوع
    const salaryDeductions = employeeDeductions.filter((d: any) => d.deductionType === 'salary');
    const debtDeductions = employeeDeductions.filter((d: any) => d.deductionType === 'debt');
    const salaryToDebtConversions = employeeDeductions.filter((d: any) => d.deductionType === 'salary_to_debt');
    
    const salaryDeductionsTotal = salaryDeductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    const debtDeductionsTotal = debtDeductions.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    const salaryToDebtTotal = salaryToDebtConversions.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    
    const currentSalary = originalSalary - salaryDeductionsTotal - salaryToDebtTotal;
    const currentDebt = totalDebts - debtDeductionsTotal + salaryToDebtTotal;
    
    const printContent = `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>كشف حساب الموظف - ${employee.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              direction: rtl; 
              background: white;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              padding-bottom: 20px; 
              margin-bottom: 40px; 
              border-bottom: 2px solid #000;
            }
            .company-subtitle {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .statement-title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #4285f4; 
              margin: 15px 0; 
            }
            .company-name {
              font-size: 16px;
              color: #000;
              margin-bottom: 5px;
            }
            .date {
              font-size: 14px;
              color: #666;
              margin-top: 10px;
            }
            .employee-section {
              background: #f5f5f5;
              padding: 20px;
              border: 1px solid #ddd;
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              background: #e8e8e8;
              padding: 10px;
              text-align: center;
              margin: 0 0 15px 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: bold;
              color: #333;
            }
            .financial-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 2px solid #000;
            }
            .financial-table th {
              background: #e8e8e8;
              border: 1px solid #000;
              padding: 12px;
              text-align: center;
              font-weight: bold;
              color: #000;
            }
            .financial-table td {
              border: 1px solid #000;
              padding: 12px;
              text-align: center;
            }
            .amount-cell {
              font-weight: bold;
              color: #000;
            }
            .note-section {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
              text-align: center;
            }
            .divider {
              border-top: 1px solid #ddd;
              margin: 20px 0;
            }
            @media print {
              body { margin: 20px; }
              .header { page-break-inside: avoid; }
              .employee-section { page-break-inside: avoid; }
              .financial-table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-subtitle">كشف حساب الموظف - الفترة الحالية شهر ${new Date().getMonth() + 1}</div>
            <div class="statement-title">كشف حساب الموظف</div>
            
            <div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} هـ</div>
          </div>

          <div class="employee-section">
            <div class="section-title">بيانات الموظف</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">الاسم:</span>
                <span>${employee.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المنصب:</span>
                <span>${employee.position || 'مساعد إداري'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">القسم:</span>
                <span>الإدارة</span>
              </div>
              <div class="info-item">
                <span class="info-label">البريد الإلكتروني:</span>
                <span>${employee.email || 'fatima@company.com'}</span>
              </div>
            </div>
          </div>

          <table class="financial-table">
            <thead>
              <tr>
                <th style="width: 50%;">البيان</th>
                <th style="width: 50%;">المبلغ (ريال)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>الراتب الأساسي</td>
                <td class="amount-cell">${originalSalary.toLocaleString('en-US')}</td>
              </tr>
              <tr>
                <td>إجمالي الخصومات</td>
                <td class="amount-cell">${totalDeductions.toLocaleString('en-US')}</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <td><strong>الراتب الصافي</strong></td>
                <td class="amount-cell"><strong>${currentSalary.toLocaleString('en-US')}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="note-section">
            <p>${totalDeductions > 0 ? 
              `ملاحظة: توجد خصومات بمبلغ ${totalDeductions.toLocaleString('en-US')} ريال` : 
              'ملاحظة: لا توجد خصومات مسجلة'}</p>
            <div class="divider"></div>
            <p>تم الطباعة في تاريخ ${new Date().toLocaleDateString('en-GB')} بناء على البيانات المتوفرة في النظام</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">كشوف حسابات الموظفين</h2>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="البحث بالاسم، المنصب، أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
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
            <CardTitle className="text-sm">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold">
                {(employees as any[]).reduce((sum: number, emp: any) => sum + parseFloat(emp.salary || 0), 0).toLocaleString('en-US')}
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
              <CreditCard className="h-4 w-4 text-orange-500" />
              <span className="text-xl font-bold">
                {(debts as any[]).reduce((sum: number, debt: any) => {
                  const debtTotal = debt.debtItems?.reduce((itemSum: number, item: any) => 
                    itemSum + parseFloat(item.amount || 0), 0) || 0;
                  return sum + debtTotal;
                }, 0).toLocaleString('en-US')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إجمالي الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xl font-bold">
                {(deductions as any[]).reduce((sum: number, deduction: any) => sum + parseFloat(deduction.amount || 0), 0).toLocaleString('en-US')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الموظفين */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee: any) => {
          const employeeDebt = calculateEmployeeDebt(employee.id);
          const employeeDeductions = calculateEmployeeDeductions(employee.id);
          const netSalary = parseFloat(employee.salary || 0) - employeeDeductions;

          return (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position || 'موظف'}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{employee.phone || 'غير محدد'}</span>
                    </div>
                  </div>
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الراتب الأساسي:</span>
                    <span className="font-bold text-blue-600">{parseFloat(employee.salary || 0).toLocaleString('en-US')} ريال</span>
                  </div>
                  
                  {employeeDeductions > 0 && (
                    <div className="flex justify-between">
                      <span>الخصومات:</span>
                      <span className="font-bold text-red-600">-{employeeDeductions.toLocaleString('en-US')} ريال</span>
                    </div>
                  )}
                  
                  {employeeDebt > 0 && (
                    <div className="flex justify-between">
                      <span>الديون:</span>
                      <span className="font-bold text-orange-600">{employeeDebt.toLocaleString('en-US')} ريال</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">صافي المستحقات:</span>
                    <span className="font-bold text-green-600">{netSalary.toLocaleString('en-US')} ريال</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsStatementOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    عرض التفاصيل
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => printEmployeeStatement(employee)}
                    className="flex-1"
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    طباعة الكشف
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* نافذة تفاصيل كشف الحساب */}
      <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>كشف حساب الموظف - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              {/* معلومات الموظف */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات الموظف</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم</Label>
                    <p className="font-semibold">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <Label>المنصب</Label>
                    <p className="font-semibold">{selectedEmployee.position || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label>الهاتف</Label>
                    <p className="font-semibold">{selectedEmployee.phone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label>الراتب الأساسي</Label>
                    <p className="font-semibold text-blue-600">
                      {parseFloat(selectedEmployee.salary || 0).toLocaleString('en-US')} ريال
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* سجل الديون */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">سجل الديون</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(debts as any[])
                      .filter((debt: any) => debt.debtorId === selectedEmployee.id)
                      .map((debt: any) => 
                        debt.debtItems?.map((item: any, index: number) => (
                          <div key={`${debt.id}-${index}`} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-orange-800">{item.reason}</p>
                              <p className="text-sm text-orange-600">
                                استحقاق: {new Date(item.dueDate).toLocaleDateString('en-GB')} | 
                                النوع: {debt.debtType === 'قرض' ? 'قرض' : 'سلفة'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-orange-700">
                                {parseFloat(item.amount).toLocaleString('en-US')} ريال
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteDebtMutation.mutate(debt.id)}
                                disabled={deleteDebtMutation.isPending}
                                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        )) || []
                      )}
                    {(debts as any[]).filter((debt: any) => debt.debtorId === selectedEmployee.id).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        لا توجد ديون مسجلة لهذا الموظف
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* سجل الخصومات */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">سجل الخصومات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(deductions as any[])
                      .filter((deduction: any) => deduction.employeeId === selectedEmployee.id)
                      .map((deduction: any) => (
                        <div key={deduction.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{deduction.description}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                التاريخ: {new Date(deduction.date).toLocaleDateString('en-GB')}
                              </p>
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeductionTypeColor(deduction.deductionType || deduction.type)}`}>
                                  {getDeductionTypeLabel(deduction.deductionType || deduction.type)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-red-600 text-lg">
                                -{parseFloat(deduction.amount).toLocaleString('en-US')} ريال
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {(deductions as any[]).filter((deduction: any) => deduction.employeeId === selectedEmployee.id).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        لا توجد خصومات مسجلة لهذا الموظف
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => printEmployeeStatement(selectedEmployee)}>
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة كشف الحساب
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedDeductions;