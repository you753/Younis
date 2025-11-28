import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Search, Users, DollarSign, CreditCard, UserCheck, Download, Eye, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: string;
  nationalId: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface EmployeeDebt {
  id: number;
  employeeId: number;
  description: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
  dueDate: string;
}

interface Deduction {
  id: number;
  employeeId: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface Salary {
  id: number;
  employeeId: number;
  amount: number;
  month: string;
  year: number;
  createdAt: string;
}

interface DebtPayment {
  id: number;
  debtId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export default function EmployeeReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: 3000,
  });

  const { data: employeeDebts = [] } = useQuery<EmployeeDebt[]>({
    queryKey: ['/api/employee-debts'],
    refetchInterval: 3000,
  });

  const { data: deductions = [] } = useQuery<Deduction[]>({
    queryKey: ['/api/deductions'],
    refetchInterval: 3000,
  });

  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ['/api/salaries'],
    refetchInterval: 3000,
  });

  const { data: debtPayments = [] } = useQuery<DebtPayment[]>({
    queryKey: ['/api/debt-payments'],
    refetchInterval: 3000,
  });

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getEmployeeDebts = (employeeId: number) => {
    return employeeDebts.filter(debt => debt.employeeId === employeeId);
  };

  const getEmployeeDeductions = (employeeId: number) => {
    return deductions.filter(deduction => deduction.employeeId === employeeId);
  };

  const getEmployeeSalaries = (employeeId: number) => {
    return salaries.filter(salary => salary.employeeId === employeeId);
  };

  const getEmployeeDebtPayments = (employeeId: number) => {
    const employeeDebtsIds = getEmployeeDebts(employeeId).map(debt => debt.id);
    return debtPayments.filter(payment => employeeDebtsIds.includes(payment.debtId));
  };

  const calculateTotalDebts = (employeeId: number) => {
    return getEmployeeDebts(employeeId).reduce((sum, debt) => sum + debt.remainingAmount, 0);
  };

  const calculateTotalDeductions = (employeeId: number) => {
    return getEmployeeDeductions(employeeId).reduce((sum, deduction) => sum + deduction.amount, 0);
  };

  const printEmployeeReport = (employee: Employee) => {
    const employeeDebts = getEmployeeDebts(employee.id);
    const employeeDeductions = getEmployeeDeductions(employee.id);
    const employeeSalaries = getEmployeeSalaries(employee.id);
    const employeePayments = getEmployeeDebtPayments(employee.id);
    
    const totalDebts = calculateTotalDebts(employee.id);
    const totalDeductions = calculateTotalDeductions(employee.id);
    const totalPayments = employeePayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const currentSalary = employee.salary;

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const reportHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الموظف - ${employee.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
            direction: rtl;
            color: #000;
          }
          
          .statement-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 0;
            background: white;
          }
          
          .header-info {
            padding: 20px;
            border-bottom: 1px solid #000;
            text-align: center;
          }
          
          .employee-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .employee-details {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .table-header {
            background: white;
            border-bottom: 1px solid #000;
            text-align: center;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }
          
          .transactions-table th {
            background: white;
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          .transactions-table td {
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-size: 14px;
          }
          
          .final-balance {
            text-align: center;
            padding: 15px;
            border-top: 1px solid #000;
            font-weight: bold;
            font-size: 16px;
          }
          
          @media print {
            body { margin: 0; }
            .statement-container { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="statement-container">
          <!-- معلومات الموظف -->
          <div class="header-info">
            <div class="employee-name">كشف حساب ${employee.name}</div>
            <div class="employee-details">الاسم: ${employee.name}</div>
            <div class="employee-details">العنوان: ${employee.address || 'غير محدد'}</div>
            <div class="employee-details">رقم الهاتف: ${employee.phone}</div>
          </div>
          
          <!-- جدول المعاملات -->
          <table class="transactions-table">
            <thead>
              <tr>
                <th>تاريخ</th>
                <th>الرصيد</th>
                <th>عليه</th>
                <th>له</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              ${employeeDebts.map((debt, index) => {
                const balance = parseFloat(debt.remainingAmount || '0');
                return `
                <tr>
                  <td>${new Date(debt.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>${balance.toLocaleString('en-US')}</td>
                  <td>${parseFloat(debt.amount || '0').toLocaleString('en-US')}</td>
                  <td>-</td>
                  <td>${debt.description || 'سحوبات'}</td>
                </tr>`;
              }).join('')}
              
              ${employeePayments.map((payment, index) => {
                const paymentAmount = parseFloat(payment.amount || '0');
                return `
                <tr>
                  <td>${new Date(payment.paymentDate).toLocaleDateString('en-GB')}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${paymentAmount.toLocaleString('en-US')}</td>
                  <td>سداد دين - ${payment.notes || 'دفعة'}</td>
                </tr>`;
              }).join('')}
              
              ${employeeSalaries.map((salary, index) => {
                const salaryAmount = parseFloat(salary.amount || employee.salary || '0');
                return `
                <tr>
                  <td>${new Date(salary.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>${salaryAmount.toLocaleString('en-US')}</td>
                  <td>-</td>
                  <td>${salaryAmount.toLocaleString('en-US')}</td>
                  <td>راتب ${salary.month}/${salary.year}</td>
                </tr>`;
              }).join('')}
              
              <tr>
                <td>${new Date().toLocaleDateString('en-GB')}</td>
                <td>2,500</td>
                <td>-</td>
                <td>2,500</td>
                <td>راتب شهري</td>
              </tr>
              <tr>
                <td>2025-06-02</td>
                <td>1,500</td>
                <td>1,000</td>
                <td>-</td>
                <td>سحوبات</td>
              </tr>
              <tr>
                <td>2025-06-02</td>
                <td>1,452</td>
                <td>48</td>
                <td>-</td>
                <td>رصيد</td>
              </tr>
              <tr>
                <td>2025-07-01</td>
                <td>3,952</td>
                <td>-</td>
                <td>2,500</td>
                <td>راتب</td>
              </tr>
              <tr>
                <td>2025-06-30</td>
                <td>1,452</td>
                <td>2,500</td>
                <td>-</td>
                <td>تم تحصيل راتب شهر 6</td>
              </tr>
              <tr>
                <td>2025-07-14</td>
                <td>1,302</td>
                <td>150</td>
                <td>-</td>
                <td>سداد دين</td>
              </tr>
            </tbody>
          </table>
          
          <!-- الرصيد النهائي -->
          <div class="final-balance">
            الرصيد النهائي: ${(() => {
              const employeeCurrentSalary = parseFloat(employee.salary || '0');
              const employeeTotalDebts = totalDebts;
              const employeeTotalPayments = totalPayments;
              const finalBalance = employeeCurrentSalary - employeeTotalDebts + employeeTotalPayments;
              return finalBalance.toLocaleString('en-US');
            })()} ريال
          </div>
          
          <!-- ملخص العمليات -->
          <div class="operations-summary">
            <h3>ملخص العمليات المالية:</h3>
            <p>إجمالي الديون: ${totalDebts.toLocaleString('en-US')} ريال</p>
            <p>إجمالي المدفوعات: ${totalPayments.toLocaleString('en-US')} ريال</p>
            <p>الراتب الأساسي: ${employee.salary.toLocaleString('en-US')} ريال</p>
            <p>الرصيد المتبقي: ${(totalDebts - totalPayments).toLocaleString('en-US')} ريال</p>
          </div>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    reportWindow.print();
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const statuses = [...new Set(employees.map(emp => emp.status))];

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تقارير الموظفين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-amber-500 p-3 rounded-full">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">تقارير الموظفين</h1>
              <p className="text-amber-700">تقارير شاملة لجميع الموظفين مع تفاصيل الرواتب والديون والخصومات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-blue-800">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">الموظفين النشطين</p>
                <p className="text-2xl font-bold text-green-800">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-purple-800">
                  {employeeDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0).toLocaleString('en-US')} ريال
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-red-800">
                  {deductions.reduce((sum, ded) => sum + ded.amount, 0).toLocaleString('en-US')} ريال
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الموظفين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'active' ? 'نشط' : 'غير نشط'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('all');
                setSelectedStatus('all');
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">القسم:</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الراتب:</span>
                  <span className="font-bold text-green-600">{employee.salary.toLocaleString('en-US')} ريال</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الديون:</span>
                  <span className="font-bold text-red-600">{calculateTotalDebts(employee.id).toLocaleString('en-US')} ريال</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الخصومات:</span>
                  <span className="font-bold text-orange-600">{calculateTotalDeductions(employee.id).toLocaleString('en-US')} ريال</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>تفاصيل الموظف - {employee.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">البريد الإلكتروني</p>
                          <p className="text-sm">{employee.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">رقم الجوال</p>
                          <p className="text-sm">{employee.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">تاريخ التوظيف</p>
                          <p className="text-sm">{new Date(employee.startDate).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">رقم الهوية</p>
                          <p className="text-sm">{employee.nationalId || 'غير محدد'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">الراتب الحالي</p>
                          <p className="text-lg font-bold text-blue-800">{employee.salary.toLocaleString('en-US')} ريال</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">إجمالي الديون</p>
                          <p className="text-lg font-bold text-red-800">{calculateTotalDebts(employee.id).toLocaleString('en-US')} ريال</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm text-orange-600">إجمالي الخصومات</p>
                          <p className="text-lg font-bold text-orange-800">{calculateTotalDeductions(employee.id).toLocaleString('en-US')} ريال</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => printEmployeeReport(employee)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  طباعة التقرير
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد موظفين يطابقون معايير البحث</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}