import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, FileText, Printer, User, DollarSign, CreditCard, TrendingDown } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: string;
  position: string;
  status: string;
}

interface Debt {
  id: number;
  debtorId: number;
  debtorType: string;
  description: string;
  debtItems: Array<{
    reason: string;
    amount: string;
    dueDate: string;
  }>;
}

interface Deduction {
  id: number;
  employeeId: number;
  amount: string;
  type: string;
  description: string;
  date: string;
}

export default function EmployeeAccountStatement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // جلب بيانات الموظفين
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: 3000
  });

  // جلب بيانات الديون
  const { data: debts = [] } = useQuery<Debt[]>({
    queryKey: ['/api/debts'],
    refetchInterval: 3000
  });

  // جلب بيانات الخصومات
  const { data: deductions = [] } = useQuery<Deduction[]>({
    queryKey: ['/api/deductions'],
    refetchInterval: 3000
  });

  // تصفية الموظفين حسب البحث
  const filteredEmployees = employees.filter(employee =>
    employee.name.includes(searchTerm) ||
    employee.position.includes(searchTerm) ||
    employee.phone.includes(searchTerm)
  );

  // حساب إجمالي الديون لموظف معين
  const calculateEmployeeDebt = (employeeId: number) => {
    return debts
      .filter(debt => debt.debtorId === employeeId && debt.debtorType === 'employee')
      .reduce((total, debt) => {
        if (debt.debtItems && Array.isArray(debt.debtItems)) {
          return total + debt.debtItems.reduce((itemSum, item) => itemSum + parseFloat(item.amount || '0'), 0);
        }
        return total;
      }, 0);
  };

  // حساب إجمالي الخصومات لموظف معين
  const calculateEmployeeDeductions = (employeeId: number) => {
    return deductions
      .filter(deduction => deduction.employeeId === employeeId)
      .reduce((total, deduction) => total + parseFloat(deduction.amount || '0'), 0);
  };

  // جلب ديون موظف محدد
  const getEmployeeDebts = (employeeId: number) => {
    return debts.filter(debt => debt.debtorId === employeeId && debt.debtorType === 'employee');
  };

  // جلب خصومات موظف محدد
  const getEmployeeDeductions = (employeeId: number) => {
    return deductions.filter(deduction => deduction.employeeId === employeeId);
  };

  // طباعة كشف الحساب
  const printStatement = (employee: Employee) => {
    const employeeDebts = getEmployeeDebts(employee.id);
    const employeeDeductions = getEmployeeDeductions(employee.id);
    const totalDebt = calculateEmployeeDebt(employee.id);
    const totalDeductions = calculateEmployeeDeductions(employee.id);

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب الموظف - ${employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .statement-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .date { color: #666; font-size: 14px; }
          .employee-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .section { margin-bottom: 25px; }
          .section-title { background: #2563eb; color: white; padding: 10px; font-weight: bold; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background: #f1f5f9; font-weight: bold; }
          .amount { font-weight: bold; color: #dc2626; }
          .positive { color: #16a34a; }
          .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
          .total { font-size: 18px; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          
          <div class="statement-title">كشف حساب الموظف</div>
          <div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <div class="employee-info">
          <div class="info-row">
            <span><strong>اسم الموظف:</strong> ${employee.name}</span>
            <span><strong>المنصب:</strong> ${employee.position}</span>
          </div>
          <div class="info-row">
            <span><strong>الهاتف:</strong> ${employee.phone}</span>
            <span><strong>البريد الإلكتروني:</strong> ${employee.email}</span>
          </div>
          <div class="info-row">
            <span><strong>الراتب الحالي:</strong> <span class="positive">${parseFloat(employee.salary).toLocaleString('en-US')} ريال</span></span>
            <span><strong>الحالة:</strong> ${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">الديون المستحقة</div>
          <table>
            <thead>
              <tr>
                <th>السبب</th>
                <th>المبلغ</th>
                <th>تاريخ الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              ${employeeDebts.length === 0 ? 
                '<tr><td colspan="3">لا توجد ديون مسجلة</td></tr>' :
                employeeDebts.map(debt => 
                  debt.debtItems?.map(item => `
                    <tr>
                      <td>${item.reason}</td>
                      <td class="amount">${parseFloat(item.amount).toLocaleString('en-US')} ريال</td>
                      <td>${new Date(item.dueDate).toLocaleDateString('en-GB')}</td>
                    </tr>
                  `).join('') || ''
                ).join('')
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">سجل الخصومات</div>
          <table>
            <thead>
              <tr>
                <th>النوع</th>
                <th>الوصف</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${employeeDeductions.length === 0 ? 
                '<tr><td colspan="4">لا توجد خصومات مسجلة</td></tr>' :
                employeeDeductions.map(deduction => `
                  <tr>
                    <td>${deduction.type === 'salary' ? 'خصم من الراتب' : 
                          deduction.type === 'debt' ? 'خصم من الدين' : 
                          deduction.type === 'salary_to_debt' ? 'تحويل راتب لدين' : deduction.type}</td>
                    <td>${deduction.description}</td>
                    <td class="amount">${parseFloat(deduction.amount).toLocaleString('en-US')} ريال</td>
                    <td>${new Date(deduction.date).toLocaleDateString('en-GB')}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="summary-row">
            <span>الراتب الشهري:</span>
            <span class="positive">${parseFloat(employee.salary).toLocaleString('en-US')} ريال</span>
          </div>
          <div class="summary-row">
            <span>إجمالي الديون:</span>
            <span class="amount">${totalDebt.toLocaleString('en-US')} ريال</span>
          </div>
          <div class="summary-row">
            <span>إجمالي الخصومات:</span>
            <span class="amount">${totalDeductions.toLocaleString('en-US')} ريال</span>
          </div>
          <div class="summary-row total">
            <span>صافي المستحقات:</span>
            <span>${(parseFloat(employee.salary) - totalDeductions).toLocaleString('en-US')} ريال</span>
          </div>
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
      {/* العنوان والبحث */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">كشف حساب الموظفين</h1>
          <p className="text-gray-600 mt-1">عرض تفصيلي للراتب والديون والخصومات لكل موظف</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن موظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.reduce((sum, emp) => sum + parseFloat(emp.salary || '0'), 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {debts.reduce((sum, debt) => {
                    if (debt.debtItems && Array.isArray(debt.debtItems)) {
                      return sum + debt.debtItems.reduce((itemSum, item) => itemSum + parseFloat(item.amount || '0'), 0);
                    }
                    return sum;
                  }, 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount || '0'), 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الموظفين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قائمة الموظفين وأرصدتهم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => {
              const totalDebt = calculateEmployeeDebt(employee.id);
              const totalDeductions = calculateEmployeeDeductions(employee.id);
              const netSalary = parseFloat(employee.salary) - totalDeductions;

              return (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{employee.position}</p>
                      <p className="text-sm text-gray-500">{employee.phone} • {employee.email}</p>
                    </div>

                    <div className="text-left space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">الراتب الشهري:</span>
                          <span className="font-semibold text-green-600 mr-2">
                            {parseFloat(employee.salary).toLocaleString('en-US')} ريال
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">إجمالي الديون:</span>
                          <span className="font-semibold text-red-600 mr-2">
                            {totalDebt.toLocaleString('en-US')} ريال
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">إجمالي الخصومات:</span>
                          <span className="font-semibold text-orange-600 mr-2">
                            {totalDeductions.toLocaleString('en-US')} ريال
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">صافي المستحقات:</span>
                          <span className={`font-semibold mr-2 ${netSalary >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {netSalary.toLocaleString('en-US')} ريال
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              <FileText className="h-4 w-4 ml-1" />
                              عرض الكشف
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>كشف حساب الموظف - {selectedEmployee?.name}</DialogTitle>
                            </DialogHeader>
                            {selectedEmployee && (
                              <EmployeeStatementDetails 
                                employee={selectedEmployee}
                                debts={getEmployeeDebts(selectedEmployee.id)}
                                deductions={getEmployeeDeductions(selectedEmployee.id)}
                                onPrint={() => printStatement(selectedEmployee)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          onClick={() => printStatement(employee)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Printer className="h-4 w-4 ml-1" />
                          طباعة
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات موظفين مطابقة للبحث
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// مكون تفاصيل كشف الحساب
function EmployeeStatementDetails({ 
  employee, 
  debts, 
  deductions, 
  onPrint 
}: { 
  employee: Employee;
  debts: Debt[];
  deductions: Deduction[];
  onPrint: () => void;
}) {
  const totalDebt = debts.reduce((sum, debt) => {
    if (debt.debtItems && Array.isArray(debt.debtItems)) {
      return sum + debt.debtItems.reduce((itemSum, item) => itemSum + parseFloat(item.amount || '0'), 0);
    }
    return sum;
  }, 0);

  const totalDeductions = deductions.reduce((sum, deduction) => 
    sum + parseFloat(deduction.amount || '0'), 0
  );

  return (
    <div className="space-y-6">
      {/* معلومات الموظف */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">معلومات الموظف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>الاسم:</strong> {employee.name}</div>
            <div><strong>المنصب:</strong> {employee.position}</div>
            <div><strong>الهاتف:</strong> {employee.phone}</div>
            <div><strong>البريد الإلكتروني:</strong> {employee.email}</div>
            <div><strong>الراتب الشهري:</strong> <span className="text-green-600 font-semibold">{parseFloat(employee.salary).toLocaleString('en-US')} ريال</span></div>
            <div><strong>الحالة:</strong> 
              <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="mr-2">
                {employee.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الديون */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">الديون المستحقة</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد ديون مسجلة</p>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="border rounded-lg p-3">
                  <p className="font-medium mb-2">{debt.description}</p>
                  {debt.debtItems && debt.debtItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <span>{item.reason}</span>
                      <div className="text-left">
                        <span className="font-semibold text-red-600">{parseFloat(item.amount).toLocaleString('en-US')} ريال</span>
                        <span className="text-gray-500 mr-3">استحقاق: {new Date(item.dueDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* الخصومات */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">سجل الخصومات</CardTitle>
        </CardHeader>
        <CardContent>
          {deductions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد خصومات مسجلة</p>
          ) : (
            <div className="space-y-2">
              {deductions.map((deduction) => (
                <div key={deduction.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{deduction.description}</div>
                    <div className="text-sm text-gray-500">
                      {deduction.type === 'salary' ? 'خصم من الراتب' : 
                       deduction.type === 'debt' ? 'خصم من الدين' : 
                       deduction.type === 'salary_to_debt' ? 'تحويل راتب لدين' : deduction.type}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-orange-600">{parseFloat(deduction.amount).toLocaleString('en-US')} ريال</div>
                    <div className="text-sm text-gray-500">{new Date(deduction.date).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* الملخص المالي */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">الملخص المالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>الراتب الشهري:</span>
              <span className="font-semibold text-green-600">{parseFloat(employee.salary).toLocaleString('en-US')} ريال</span>
            </div>
            <div className="flex justify-between items-center">
              <span>إجمالي الديون:</span>
              <span className="font-semibold text-red-600">{totalDebt.toLocaleString('en-US')} ريال</span>
            </div>
            <div className="flex justify-between items-center">
              <span>إجمالي الخصومات:</span>
              <span className="font-semibold text-orange-600">{totalDeductions.toLocaleString('en-US')} ريال</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">صافي المستحقات:</span>
              <span className={`font-bold ${parseFloat(employee.salary) - totalDeductions >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {(parseFloat(employee.salary) - totalDeductions).toLocaleString('en-US')} ريال
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أزرار الإجراءات */}
      <div className="flex justify-end gap-2">
        <Button onClick={onPrint} className="bg-green-600 hover:bg-green-700">
          <Printer className="h-4 w-4 ml-1" />
          طباعة الكشف
        </Button>
      </div>
    </div>
  );
}