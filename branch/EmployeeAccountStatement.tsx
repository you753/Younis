import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  FileText, 
  Printer,
  Download,
  Eye
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position?: string;
  baseSalary?: number;
  salary?: number;
  status: string;
}

interface Debt {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: string;
  remainingAmount: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

interface Salary {
  id: number;
  employeeId: number;
  amount: number;
  month: string;
  year: string;
  status: string;
  createdAt: string;
}

interface Deduction {
  id: number;
  employeeId: number;
  amount: number;
  type: string;
  description: string;
  date: string;
}

export default function EmployeeAccountStatement() {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatement, setShowStatement] = useState(false);
  const [statementEmployee, setStatementEmployee] = useState<Employee | null>(null);

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: 5000,
  });

  // Fetch debts
  const { data: debts = [] } = useQuery<Debt[]>({
    queryKey: ['/api/employee-debts'],
    refetchInterval: 5000,
  });

  // Fetch salaries
  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ['/api/salaries'],
    refetchInterval: 5000,
  });

  // Fetch deductions
  const { data: deductions = [] } = useQuery<Deduction[]>({
    queryKey: ['/api/deductions'],
    refetchInterval: 5000,
  });

  // Calculate statistics
  const totalDebts = debts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount || '0'), 0);
  const activeDebts = debts.filter(debt => debt.status === 'active').length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalEmployees = employees.length;

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get employee account details
  const getEmployeeAccountDetails = (employeeId: number) => {
    const employeeDebts = debts.filter(debt => debt.employeeId === employeeId);
    const employeeSalaries = salaries.filter(salary => salary.employeeId === employeeId);
    const employeeDeductions = deductions.filter(deduction => deduction.employeeId === employeeId);

    const totalDebt = employeeDebts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount || '0'), 0);
    const totalSalaries = employeeSalaries.reduce((sum, salary) => sum + salary.amount, 0);
    const totalDeductions = employeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    return {
      totalDebt,
      totalSalaries,
      totalDeductions,
      debts: employeeDebts,
      salaries: employeeSalaries,
      deductions: employeeDeductions
    };
  };

  // Handle view statement
  const handleViewStatement = (employee: Employee) => {
    setStatementEmployee(employee);
    setShowStatement(true);
  };

  // Print statement
  const printStatement = () => {
    if (!statementEmployee) return;
    
    const details = getEmployeeAccountDetails(statementEmployee.id);
    const printContent = `
      <html dir="rtl">
        <head>
          <title>كشف حساب الموظف - ${statementEmployee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .employee-info { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .section { margin: 20px 0; }
            .section h3 { background: #333; color: white; padding: 10px; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background: #f0f0f0; }
            .summary { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>كشف حساب الموظف</h1>
            <p>نظام الخصومات المتكامل</p>
          </div>
          
          <div class="employee-info">
            <h2>بيانات الموظف</h2>
            <p><strong>الاسم:</strong> ${statementEmployee.name}</p>
            <p><strong>المنصب:</strong> ${statementEmployee.position || 'غير محدد'}</p>
            <p><strong>الراتب الأساسي:</strong> {(statementEmployee.baseSalary || statementEmployee.salary || 0).toLocaleString('en-US')} ريال</p>
            <p><strong>تاريخ الكشف:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <div class="section">
            <h3>ملخص الحساب</h3>
            <div class="summary">
              <p><strong>إجمالي الديون:</strong> ${details.totalDebt.toLocaleString('en-US')} ريال</p>
              <p><strong>إجمالي الرواتب:</strong> ${details.totalSalaries.toLocaleString('en-US')} ريال</p>
              <p><strong>إجمالي الخصومات:</strong> ${details.totalDeductions.toLocaleString('en-US')} ريال</p>
            </div>
          </div>

          <div class="section">
            <h3>تفاصيل الديون</h3>
            <table>
              <tr><th>النوع</th><th>المبلغ</th><th>المتبقي</th><th>الحالة</th><th>التاريخ</th></tr>
              ${details.debts.map(debt => `
                <tr>
                  <td>${debt.type === 'loan' ? 'قرض' : 'سلفة'}</td>
                  <td>${parseFloat(debt.amount).toLocaleString('en-US')} ريال</td>
                  <td>${parseFloat(debt.remainingAmount).toLocaleString('en-US')} ريال</td>
                  <td>${debt.status === 'active' ? 'نشط' : 'مسدد'}</td>
                  <td>${new Date(debt.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h3>تفاصيل الرواتب</h3>
            <table>
              <tr><th>الشهر</th><th>السنة</th><th>المبلغ</th><th>الحالة</th></tr>
              ${details.salaries.map(salary => `
                <tr>
                  <td>${salary.month}</td>
                  <td>${salary.year}</td>
                  <td>${salary.amount.toLocaleString('en-US')} ريال</td>
                  <td>${salary.status === 'paid' ? 'مدفوع' : 'معلق'}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h3>تفاصيل الخصومات</h3>
            <table>
              <tr><th>النوع</th><th>المبلغ</th><th>الوصف</th><th>التاريخ</th></tr>
              ${details.deductions.map(deduction => `
                <tr>
                  <td>${deduction.type}</td>
                  <td>${deduction.amount.toLocaleString('en-US')} ريال</td>
                  <td>${deduction.description}</td>
                  <td>${new Date(deduction.date).toLocaleDateString('en-GB')}</td>
                </tr>
              `).join('')}
            </table>
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
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">نظام الخصومات المتكامل</h1>
        <p className="text-gray-600">إدارة خصومات الموظفين ومتابعة الرواتب والديون</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalDebts.toLocaleString('en-US')} ر.س
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الديون النشطة</p>
                <p className="text-2xl font-bold text-orange-600">{activeDebts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الموظفين النشطين</p>
                <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Employee List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تقارير العمليات
                <span className="text-sm font-normal text-gray-500">
                  إنشاء وطباعة تقارير الخصومات والديون
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث عن موظف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Employee Cards */}
              <div className="space-y-3">
                {filteredEmployees.map((employee) => {
                  const details = getEmployeeAccountDetails(employee.id);
                  return (
                    <div
                      key={employee.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{employee.name}</h3>
                          <p className="text-gray-600">{employee.position || 'غير محدد'}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-blue-600">
                              الراتب: {(employee.baseSalary || employee.salary || 0).toLocaleString('en-US')} ر.س
                            </span>
                            <span className="text-red-600">
                              الديون: {details.totalDebt.toLocaleString('en-US')} ر.س
                            </span>
                            <span className="text-green-600">
                              الخصومات: {details.totalDeductions.toLocaleString('en-US')} ر.س
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={employee.status === 'active' ? 'default' : 'secondary'}
                          >
                            {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStatement(employee)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            كشف الحساب
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد موظفين مطابقين للبحث
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تحميل تقرير شامل
              </Button>
              <Button className="w-full" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                طباعة تقرير مجمع
              </Button>
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">الإحصائيات السريعة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>متوسط الراتب:</span>
                    <span className="font-semibold">
                      {employees.length > 0 
                        ? (employees.reduce((sum, emp) => sum + (emp.baseSalary || emp.salary || 0), 0) / employees.length).toLocaleString('en-US')
                        : '0'} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>أعلى دين:</span>
                    <span className="font-semibold text-red-600">
                      {debts.length > 0 
                        ? Math.max(...debts.map(d => parseFloat(d.remainingAmount || '0'))).toLocaleString('en-US')
                        : '0'} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Statement Dialog */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>كشف حساب الموظف - {statementEmployee?.name}</span>
              <Button
                onClick={printStatement}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>

          {statementEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">اسم الموظف</label>
                      <p className="text-lg">{statementEmployee.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">المنصب</label>
                      <p className="text-lg">{statementEmployee.position || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">الراتب الأساسي</label>
                      <p className="text-lg font-bold text-green-600">
                        {(statementEmployee.baseSalary || statementEmployee.salary || 0).toLocaleString('en-US')} ر.س
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">الحالة</label>
                      <Badge
                        variant={statementEmployee.status === 'active' ? 'default' : 'secondary'}
                      >
                        {statementEmployee.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Summary */}
              {(() => {
                const details = getEmployeeAccountDetails(statementEmployee.id);
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">إجمالي الديون</p>
                        <p className="text-xl font-bold text-red-600">
                          {details.totalDebt.toLocaleString('en-US')} ر.س
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                        <p className="text-xl font-bold text-green-600">
                          {details.totalSalaries.toLocaleString('en-US')} ر.س
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                        <p className="text-xl font-bold text-orange-600">
                          {details.totalDeductions.toLocaleString('en-US')} ر.س
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>العمليات الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(() => {
                      const details = getEmployeeAccountDetails(statementEmployee.id);
                      const recentTransactions = [
                        ...details.debts.map(debt => ({
                          type: 'debt',
                          description: `${debt.type === 'loan' ? 'قرض' : 'سلفة'} - ${debt.description}`,
                          amount: parseFloat(debt.remainingAmount),
                          date: debt.createdAt,
                          status: debt.status
                        })),
                        ...details.salaries.slice(0, 3).map(salary => ({
                          type: 'salary',
                          description: `راتب ${salary.month}/${salary.year}`,
                          amount: salary.amount,
                          date: salary.createdAt,
                          status: salary.status
                        })),
                        ...details.deductions.slice(0, 3).map(deduction => ({
                          type: 'deduction',
                          description: deduction.description,
                          amount: deduction.amount,
                          date: deduction.date,
                          status: 'processed'
                        }))
                      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

                      return recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className={`font-bold ${
                              transaction.type === 'debt' ? 'text-red-600' :
                              transaction.type === 'salary' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {transaction.amount.toLocaleString('en-US')} ر.س
                            </p>
                            <Badge
                              variant={transaction.status === 'active' || transaction.status === 'paid' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {transaction.status === 'active' ? 'نشط' : 
                               transaction.status === 'paid' ? 'مدفوع' : 
                               transaction.status === 'processed' ? 'معالج' : 'معلق'}
                            </Badge>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}