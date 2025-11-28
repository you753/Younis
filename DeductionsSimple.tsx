import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  DollarSign, 
  Printer,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  salary: string;
  position?: string;
  department?: string;
}

interface Deduction {
  id: number;
  employeeId: number;
  amount: string;
  type: string;
  description: string;
  date: string;
}

export default function DeductionsSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    description: '',
    type: 'salary_deduction',
    date: new Date().toISOString().split('T')[0]
  });

  // Queries with auto refresh
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
    refetchInterval: 2000
  });

  const { data: deductions = [], isLoading: deductionsLoading } = useQuery({
    queryKey: ['/api/deductions'],
    refetchInterval: 2000
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ['/api/debts'],
    refetchInterval: 2000
  });

  // Create deduction mutation
  const createDeductionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('فشل في إنشاء الخصم');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الخصم بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الخصم",
        variant: "destructive"
      });
    }
  });

  // Delete deduction mutation
  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/deductions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('فشل في حذف الخصم');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم حذف الخصم بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الخصم",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      employeeId: '',
      amount: '',
      description: '',
      type: 'salary_deduction',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateDeduction = () => {
    if (!formData.employeeId || !formData.amount || !formData.description) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    createDeductionMutation.mutate({
      employeeId: parseInt(formData.employeeId),
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      date: formData.date
    });
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp: Employee) => emp.id === employeeId);
    return employee?.name || 'غير معروف';
  };

  const getEmployeeDeductions = (employeeId: number) => {
    return deductions.filter((d: Deduction) => d.employeeId === employeeId);
  };

  const getEmployeeDebts = (employeeId: number) => {
    return debts.filter((debt: any) => 
      debt.debtorId === employeeId && debt.debtorType === 'employee'
    );
  };

  const calculateEmployeeFinancials = (employee: Employee) => {
    const employeeDeductions = getEmployeeDeductions(employee.id);
    const employeeDebts = getEmployeeDebts(employee.id);
    
    const totalDeductions = employeeDeductions.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalDebts = employeeDebts.reduce((sum, debt) => {
      const debtItems = debt.debtItems || [];
      return sum + debtItems.reduce((itemSum: number, item: any) => 
        itemSum + parseFloat(item.amount || 0), 0
      );
    }, 0);
    
    const originalSalary = parseFloat(employee.salary) || 0;
    const netSalary = originalSalary - totalDeductions;

    return {
      originalSalary,
      totalDeductions,
      totalDebts,
      netSalary,
      deductions: employeeDeductions,
      debts: employeeDebts
    };
  };

  const printEmployeeStatement = (employee: Employee) => {
    const financials = calculateEmployeeFinancials(employee);
    
    const printContent = `
      <html dir="rtl">
        <head>
          <title>كشف حساب الموظف - ${employee.name}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              direction: rtl;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              color: #2563eb; 
              margin: 0; 
              font-size: 24px; 
            }
            .header h2 { 
              color: #64748b; 
              margin: 5px 0; 
              font-size: 16px; 
            }
            .employee-info { 
              background: #f8fafc; 
              padding: 15px; 
              margin-bottom: 20px; 
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .summary-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .summary-table th, 
            .summary-table td { 
              border: 1px solid #333; 
              padding: 12px; 
              text-align: center; 
            }
            .summary-table th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .green { color: #059669; font-weight: bold; }
            .red { color: #dc2626; font-weight: bold; }
            .blue { color: #2563eb; font-weight: bold; }
            .deductions-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            .deductions-table th, 
            .deductions-table td { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: right; 
            }
            .deductions-table th { 
              background-color: #f5f5f5; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>كشف حساب الموظف</h1>
            
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          <div class="employee-info">
            <h3>بيانات الموظف</h3>
            <p><strong>الاسم:</strong> ${employee.name}</p>
            <p><strong>المنصب:</strong> ${employee.position || 'غير محدد'}</p>
            <p><strong>القسم:</strong> ${employee.department || 'غير محدد'}</p>
            <p><strong>البريد الإلكتروني:</strong> ${employee.email}</p>
          </div>

          <table class="summary-table">
            <thead>
              <tr>
                <th>البيان</th>
                <th>المبلغ (ريال)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>الراتب الأصلي</strong></td>
                <td class="green">${financials.originalSalary.toLocaleString('en-US')}</td>
              </tr>
              <tr>
                <td><strong>إجمالي الخصومات</strong></td>
                <td class="red">-${financials.totalDeductions.toLocaleString('en-US')}</td>
              </tr>
              <tr style="background-color: #f0f8ff;">
                <td><strong>الراتب الصافي</strong></td>
                <td class="blue">${financials.netSalary.toLocaleString('en-US')}</td>
              </tr>
            </tbody>
          </table>

          ${financials.deductions.length > 0 ? `
          <div>
            <h3>تفاصيل الخصومات</h3>
            <table class="deductions-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (ريال)</th>
                </tr>
              </thead>
              <tbody>
                ${financials.deductions.map(deduction => `
                  <tr>
                    <td>${new Date(deduction.date).toLocaleDateString('en-GB')}</td>
                    <td>${deduction.description}</td>
                    <td class="red">-${parseFloat(deduction.amount).toLocaleString('en-US')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : '<p style="text-align: center; margin: 30px 0; color: #666;">لا توجد خصومات مسجلة</p>'}

          ${financials.debts.length > 0 ? `
          <div style="margin-top: 30px;">
            <h3>الديون</h3>
            <table class="deductions-table">
              <thead>
                <tr>
                  <th>البيان</th>
                  <th>المبلغ (ريال)</th>
                </tr>
              </thead>
              <tbody>
                ${financials.debts.map(debt => {
                  const debtItems = debt.debtItems || [];
                  return debtItems.map(item => `
                    <tr>
                      <td>${item.reason || debt.description || 'دين'}</td>
                      <td>${parseFloat(item.amount || 0).toLocaleString('en-US')}</td>
                    </tr>
                  `).join('');
                }).join('')}
                <tr style="background-color: #fff3cd; font-weight: bold;">
                  <td>إجمالي الديون</td>
                  <td class="red">${financials.totalDebts.toLocaleString('en-US')}</td>
                </tr>
              </tbody>
            </table>
            <p style="text-align: center; margin: 20px 0; color: #666; font-size: 12px;">
              لا توجد خصومات مسجلة
            </p>
          </div>
          ` : ''}

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً من نظام </p>
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

  // Statistics
  const totalDeductions = deductions.length;
  const totalAmount = deductions.reduce((sum: number, d: Deduction) => sum + parseFloat(d.amount), 0);
  const activeEmployees = employees.length;

  if (employeesLoading || deductionsLoading || debtsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الخصومات</h1>
          <p className="text-gray-600 mt-1">نظام بسيط لإدارة خصومات الموظفين</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            خصم جديد
          </Button>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/deductions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصومات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeductions}</div>
            <p className="text-xs text-muted-foreground">
              المبلغ: {totalAmount.toLocaleString('en-US')} ريال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الخصم</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDeductions > 0 ? (totalAmount / totalDeductions).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">ريال لكل خصم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deductions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deductions">قائمة الخصومات</TabsTrigger>
          <TabsTrigger value="statements">كشوف حساب الموظفين</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>قائمة الخصومات</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الخصومات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deductions.map((deduction: Deduction) => (
                  <div key={deduction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{getEmployeeName(deduction.employeeId)}</div>
                      <div className="text-sm text-gray-600">{deduction.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(deduction.date).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          -{parseFloat(deduction.amount).toLocaleString('en-US')} ريال
                        </div>
                        <Badge variant="outline">{deduction.type}</Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDeductionMutation.mutate(deduction.id)}
                        disabled={deleteDeductionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {deductions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد خصومات مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>كشوف حساب الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee: Employee) => {
                  const financials = calculateEmployeeFinancials(employee);
                  return (
                    <Card key={employee.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>الراتب الأصلي:</span>
                            <span className="font-bold text-green-600">
                              {financials.originalSalary.toLocaleString('en-US')} ريال
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>إجمالي الخصومات:</span>
                            <span className="font-bold text-red-600">
                              -{financials.totalDeductions.toLocaleString('en-US')} ريال
                            </span>
                          </div>
                          {financials.totalDebts > 0 && (
                            <div className="flex justify-between">
                              <span>إجمالي الديون:</span>
                              <span className="font-bold text-orange-600">
                                {financials.totalDebts.toLocaleString('en-US')} ريال
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-bold">الراتب الصافي:</span>
                            <span className="font-bold text-blue-600">
                              {financials.netSalary.toLocaleString('en-US')} ريال
                            </span>
                          </div>
                          <div className="text-center text-sm text-gray-500">
                            {financials.deductions.length} خصم، {financials.debts.length} دين
                          </div>
                          <Button
                            onClick={() => printEmployeeStatement(employee)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            طباعة كشف الحساب
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Deduction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة خصم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الموظف</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              >
                <option value="">اختر الموظف...</option>
                {employees.map((employee: Employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المبلغ (ريال)</label>
              <Input
                type="number"
                placeholder="أدخل المبلغ..."
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وصف الخصม</label>
              <Input
                placeholder="أدخل وصف الخصم..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">التاريخ</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateDeduction}
                disabled={createDeductionMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createDeductionMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}