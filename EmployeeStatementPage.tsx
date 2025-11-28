import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Printer, Search } from 'lucide-react';
import { Link } from 'wouter';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  phone?: string;
  salary: string;
  status: string;
}

interface Deduction {
  id: number;
  employeeId: number;
  amount: string;
  description: string;
  type: 'salary' | 'debt' | 'salary_to_debt';
  date: string;
  status: string;
}

interface Debt {
  id: number;
  employeeId: number;
  totalAmount: string;
  remainingAmount: string;
  debtItems: Array<{
    id: number;
    amount: string;
    description: string;
    date: string;
    type: string;
  }>;
  status: string;
}

const formatNumber = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

const formatCurrency = (value: any): string => {
  return `${formatNumber(value)} ريال`;
};

export default function EmployeeStatementPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Get employee ID from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setSelectedEmployeeId(id);
    }
  }, []);

  // Fetch data
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees');
      return response.json();
    }
  });

  const { data: deductions = [] } = useQuery({
    queryKey: ['/api/deductions'],
    queryFn: async () => {
      const response = await fetch('/api/deductions');
      return response.json();
    }
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['/api/debts'],
    queryFn: async () => {
      const response = await fetch('/api/debts');
      return response.json();
    }
  });

  // Update selected employee when ID changes
  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0) {
      const employee = employees.find((emp: Employee) => emp.id.toString() === selectedEmployeeId);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);

  // Calculate employee statistics
  const getEmployeeStats = (employeeId: number) => {
    const employeeDeductions = deductions.filter((d: Deduction) => d.employeeId === employeeId);
    const employeeDebts = debts.filter((debt: Debt) => debt.employeeId === employeeId);
    
    const totalDeductions = employeeDeductions.reduce((sum: number, d: Deduction) => 
      sum + (parseFloat(d.amount) || 0), 0
    );
    
    const totalDebts = employeeDebts.reduce((sum: number, debt: Debt) => 
      sum + (parseFloat(debt.remainingAmount) || 0), 0
    );

    return {
      totalDeductions,
      totalDebts,
      deductionsCount: employeeDeductions.length,
      debtsCount: employeeDebts.length
    };
  };

  // Handle print statement
  const handlePrintStatement = () => {
    if (!selectedEmployee) return;

    const employeeDeductions = deductions.filter((d: Deduction) => d.employeeId === selectedEmployee.id);
    // البحث عن الديون بناءً على employeeId أو debtorId
    const employeeDebts = debts.filter((debt: Debt) => 
      debt.employeeId === selectedEmployee.id || debt.debtorId === selectedEmployee.id
    );
    
    // حسابات مفصلة
    const baseSalary = parseFloat(selectedEmployee.salary) || 0;
    
    // حساب جميع الخصومات (كل الأنواع تؤثر على الراتب)
    const totalAllDeductions = employeeDeductions.reduce((sum: number, d: Deduction) => 
      sum + (parseFloat(d.amount) || 0), 0
    );
    
    // الخصومات التي تؤثر على الراتب
    const salaryDeductions = totalAllDeductions;
    
    const netSalary = baseSalary - salaryDeductions;
    
    // حساب إجمالي الديون الأصلية (فقط النشطة والمتبقية)
    const totalOriginalDebts = employeeDebts
      .filter((debt: Debt) => parseFloat(debt.remainingAmount) > 0)
      .reduce((sum: number, debt: Debt) => sum + (parseFloat(debt.amount) || 0), 0);
    const totalRemainingDebts = employeeDebts.reduce((sum: number, debt: Debt) => 
      sum + (parseFloat(debt.remainingAmount) || 0), 0
    );
    const totalPaidDebts = totalOriginalDebts - totalRemainingDebts;
    
    const totalDeductions = employeeDeductions.reduce((sum: number, d: Deduction) => 
      sum + (parseFloat(d.amount) || 0), 0
    );
    
    const totalDue = totalRemainingDebts;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب الموظف - ${selectedEmployee.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            direction: rtl; 
            line-height: 1.4;
            font-size: 14px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .company-name { 
            font-size: 22px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .statement-title { 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 5px; 
          }
          .print-date { 
            font-size: 12px; 
            color: #888; 
          }
          
          .employee-info { 
            background-color: #f8f9fa; 
            border: 1px solid #ddd; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 5px; 
          }
          .employee-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
          }
          .employee-row:last-child { 
            margin-bottom: 0; 
          }
          
          .summary-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            border: 2px solid #333; 
          }
          .summary-table th { 
            background-color: #f5f5f5; 
            border: 1px solid #333; 
            padding: 12px 8px; 
            text-align: center; 
            font-weight: bold; 
            font-size: 14px; 
          }
          .summary-table td { 
            border: 1px solid #333; 
            padding: 10px 8px; 
            text-align: center; 
          }
          .summary-table .label-col { 
            text-align: right; 
            font-weight: bold; 
            background-color: #fafafa; 
          }
          .amount-positive { 
            color: #28a745; 
            font-weight: bold; 
          }
          .amount-negative { 
            color: #dc3545; 
            font-weight: bold; 
          }
          .amount-normal { 
            font-weight: bold; 
          }
          
          .total-row { 
            background-color: #e9ecef !important; 
            font-weight: bold; 
            font-size: 16px; 
          }
          
          .final-amount { 
            background-color: #fff3cd; 
            border: 2px solid #ffc107; 
            padding: 15px; 
            text-align: center; 
            margin: 20px 0; 
            border-radius: 5px; 
          }
          
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 11px; 
            color: #666; 
            border-top: 1px solid #ddd; 
            padding-top: 15px; 
          }
          
          @media print { 
            body { 
              padding: 10px; 
              font-size: 13px; 
            } 
            .no-print { display: none; } 
          }
        </style>
      </head>
      <body>
        <div class="header">
          
          <div class="statement-title">كشف حساب الموظف</div>
          <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <div class="employee-info">
          <div class="employee-row">
            <strong>اسم الموظف:</strong>
            <span>${selectedEmployee.name}</span>
          </div>
          <div class="employee-row">
            <strong>رقم الموظف:</strong>
            <span>${selectedEmployee.employeeId || selectedEmployee.id}</span>
          </div>
          <div class="employee-row">
            <strong>القسم:</strong>
            <span>${selectedEmployee.department || 'غير محدد'}</span>
          </div>
        </div>

        <table class="summary-table">
          <thead>
            <tr>
              <th style="width: 50%;">البيان</th>
              <th style="width: 25%;">المبلغ</th>
              <th style="width: 25%;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="label-col">الراتب الأساسي</td>
              <td class="amount-normal">${formatCurrency(baseSalary)}</td>
              <td>أساسي</td>
            </tr>
            <tr>
              <td class="label-col">إجمالي الخصومات</td>
              <td class="amount-negative">-${formatCurrency(salaryDeductions)}</td>
              <td>مخصوم</td>
            </tr>
            <tr class="total-row">
              <td class="label-col">الراتب الصافي المتبقي</td>
              <td class="amount-positive">${formatCurrency(netSalary)}</td>
              <td>متبقي</td>
            </tr>
            ${totalRemainingDebts > 0 ? `
            <tr>
              <td class="label-col">إجمالي الديون</td>
              <td class="amount-normal">${formatCurrency(totalOriginalDebts)}</td>
              <td>أصلي</td>
            </tr>
            <tr>
              <td class="label-col">المسدد من الديون</td>
              <td class="amount-positive">-${formatCurrency(totalPaidDebts)}</td>
              <td>مسدد</td>
            </tr>
            <tr class="total-row">
              <td class="label-col">المتبقي من الديون</td>
              <td class="amount-negative">${formatCurrency(totalRemainingDebts)}</td>
              <td>مستحق</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="final-amount">
          <h3 style="margin-bottom: 10px;">إجمالي المستحق على الموظف</h3>
          <div style="font-size: 24px; font-weight: bold; color: #dc3545;">
            ${formatCurrency(totalDue)} ريال سعودي
          </div>
        </div>

        <div class="footer">
          <p>كشف حساب معتمد من نظام المحاسبة</p>
          <p>تم الإنشاء: ${new Date().toLocaleString('en-US')}</p>
        </div>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">كشف حساب الموظف</h1>
          <p className="text-muted-foreground mt-1">
            عرض تفاصيل الخصومات والديون للموظف المحدد
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/deductions">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 ml-1" />
              العودة للخصومات
            </Button>
          </Link>
        </div>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            اختيار الموظف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label>اختر الموظف لعرض كشف الحساب</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر موظف..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name} - {formatCurrency(employee.salary)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Professional Employee Statement */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">كشف حساب الموظف</CardTitle>
              <Button onClick={handlePrintStatement} variant="outline">
                <Printer className="h-4 w-4 ml-1" />
                طباعة الكشف
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const employeeDeductions = deductions.filter((d: Deduction) => d.employeeId === selectedEmployee.id);
              // البحث عن الديون بناءً على employeeId أو debtorId
              const employeeDebts = debts.filter((debt: Debt) => 
                debt.employeeId === selectedEmployee.id || debt.debtorId === selectedEmployee.id
              );
              
              // حساب الراتب الأساسي
              const baseSalary = parseFloat(selectedEmployee.salary) || 0;
              
              // حساب جميع الخصومات (كل الأنواع تؤثر على الراتب)
              const totalAllDeductions = employeeDeductions.reduce((sum: number, d: Deduction) => 
                sum + (parseFloat(d.amount) || 0), 0
              );
              
              // الخصومات التي تؤثر على الراتب
              const salaryDeductions = totalAllDeductions;
              
              // حساب الراتب الصافي
              const netSalary = baseSalary - salaryDeductions;
              
              // حساب إجمالي الديون الأصلية (فقط النشطة والمتبقية)
              const totalOriginalDebts = employeeDebts
                .filter((debt: Debt) => parseFloat(debt.remainingAmount) > 0)
                .reduce((sum: number, debt: Debt) => sum + (parseFloat(debt.amount) || 0), 0);
              const totalRemainingDebts = employeeDebts.reduce((sum: number, debt: Debt) => 
                sum + (parseFloat(debt.remainingAmount) || 0), 0
              );
              const totalPaidDebts = totalOriginalDebts - totalRemainingDebts;
              
              // حساب إجمالي الخصومات (كل الأنواع)
              const totalDeductions = employeeDeductions.reduce((sum: number, d: Deduction) => 
                sum + (parseFloat(d.amount) || 0), 0
              );
              
              // حساب إجمالي المستحقات على الموظف
              const totalDue = totalRemainingDebts; // فقط الديون المتبقية

              return (
                <div className="space-y-6">
                  {/* Employee Basic Info */}
                  <div className="grid grid-cols-2 gap-6 p-6 border rounded-lg bg-gray-50">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">اسم الموظف</Label>
                      <p className="text-xl font-bold mt-1">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">الراتب الأساسي</Label>
                      <p className="text-xl font-bold mt-1">{formatCurrency(baseSalary)}</p>
                    </div>
                  </div>

                  {/* Simple Professional Statement */}
                  <div className="p-8 border rounded-lg bg-white">
                    <h3 className="text-2xl font-bold mb-6 text-center border-b pb-4">كشف حساب الموظف</h3>
                    
                    {/* Clean Summary */}
                    <div className="max-w-2xl mx-auto space-y-6">
                      {/* Main Financial Info */}
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">الراتب الأساسي</p>
                          <p className="text-2xl font-bold text-blue-700">{formatCurrency(baseSalary)}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">إجمالي الخصومات</p>
                          <p className="text-2xl font-bold text-red-600">-{formatCurrency(salaryDeductions)}</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-green-50">
                          <p className="text-sm text-gray-600 mb-2">الراتب المتبقي</p>
                          <p className="text-2xl font-bold text-green-700">{formatCurrency(netSalary)}</p>
                        </div>
                      </div>

                      {/* Debt Info (if any) */}
                      {totalRemainingDebts > 0 && (
                        <div className="border-t pt-6">
                          <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="p-4 border rounded-lg">
                              <p className="text-sm text-gray-600 mb-2">إجمالي الديون</p>
                              <p className="text-xl font-bold text-orange-700">{formatCurrency(totalOriginalDebts)}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-red-50">
                              <p className="text-sm text-gray-600 mb-2">المتبقي من الديون</p>
                              <p className="text-xl font-bold text-red-700">{formatCurrency(totalRemainingDebts)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Final Balance */}
                      <div className="border-t pt-6">
                        <div className="text-center p-6 bg-gray-50 rounded-lg border-2">
                          <p className="text-lg text-gray-700 mb-2">إجمالي المستحق على الموظف</p>
                          <p className="text-3xl font-bold text-red-700">{formatCurrency(totalDue)}</p>
                          <p className="text-sm text-gray-500 mt-2">ريال سعودي</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Deductions */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="text-lg font-bold">تفاصيل الخصومات ({employeeDeductions.length} خصم)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-right p-3 font-bold">التاريخ</th>
                            <th className="text-right p-3 font-bold">النوع</th>
                            <th className="text-right p-3 font-bold">المبلغ</th>
                            <th className="text-right p-3 font-bold">الوصف</th>
                            <th className="text-right p-3 font-bold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeDeductions.map((deduction: Deduction) => (
                            <tr key={deduction.id} className="border-b">
                              <td className="p-3">{deduction.date}</td>
                              <td className="p-3">
                                {deduction.type === 'salary' ? 'خصم من الراتب' : 
                                 deduction.type === 'debt' ? 'دين' : 'تحويل راتب لدين'}
                              </td>
                              <td className="p-3 font-bold">
                                {formatCurrency(deduction.amount)}
                              </td>
                              <td className="p-3">{deduction.description}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  deduction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {deduction.status === 'active' ? 'نشط' : 'مكتمل'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {employeeDeductions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center p-8 text-gray-500">
                                لا توجد خصومات لهذا الموظف
                              </td>
                            </tr>
                          )}
                          {employeeDeductions.length > 0 && (
                            <tr className="bg-gray-50 font-bold">
                              <td colSpan={2} className="p-3">إجمالي الخصومات:</td>
                              <td className="p-3">{formatCurrency(totalDeductions)}</td>
                              <td colSpan={2}></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Debts */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="text-lg font-bold">تفاصيل الديون ({employeeDebts.length} دين)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-right p-3 font-bold">المبلغ الأصلي</th>
                            <th className="text-right p-3 font-bold">المبلغ المسدد</th>
                            <th className="text-right p-3 font-bold">المبلغ المتبقي</th>
                            <th className="text-right p-3 font-bold">عدد الأقساط</th>
                            <th className="text-right p-3 font-bold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeDebts.map((debt: Debt) => {
                            const originalAmount = parseFloat(debt.totalAmount) || 0;
                            const remainingAmount = parseFloat(debt.remainingAmount) || 0;
                            const paidAmount = originalAmount - remainingAmount;
                            
                            return (
                              <tr key={debt.id} className="border-b">
                                <td className="p-3 font-bold">
                                  {formatCurrency(originalAmount)}
                                </td>
                                <td className="p-3 font-bold">
                                  {formatCurrency(paidAmount)}
                                </td>
                                <td className="p-3 font-bold">
                                  {formatCurrency(remainingAmount)}
                                </td>
                                <td className="p-3">{debt.debtItems?.length || 0}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded text-sm ${
                                    debt.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {debt.status === 'active' ? 'نشط' : 'مكتمل'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {employeeDebts.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center p-8 text-gray-500">
                                لا توجد ديون لهذا الموظف
                              </td>
                            </tr>
                          )}
                          {employeeDebts.length > 0 && (
                            <tr className="bg-gray-50 font-bold">
                              <td className="p-3">{formatCurrency(totalOriginalDebts)}</td>
                              <td className="p-3">{formatCurrency(totalPaidDebts)}</td>
                              <td className="p-3">{formatCurrency(totalRemainingDebts)}</td>
                              <td colSpan={2}>الإجمالي</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Debt Items Detail */}
                  {employeeDebts.some((debt: Debt) => debt.debtItems && debt.debtItems.length > 0) && (
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-bold">تفاصيل أقساط الديون</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-100">
                              <th className="text-right p-3 font-bold">التاريخ</th>
                              <th className="text-right p-3 font-bold">المبلغ</th>
                              <th className="text-right p-3 font-bold">الوصف</th>
                              <th className="text-right p-3 font-bold">النوع</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeDebts.flatMap((debt: Debt) => 
                              (debt.debtItems || []).map(item => (
                                <tr key={`${debt.id}-${item.id}`} className="border-b">
                                  <td className="p-3">{item.date}</td>
                                  <td className="p-3 font-bold">{formatCurrency(item.amount)}</td>
                                  <td className="p-3">{item.description}</td>
                                  <td className="p-3">{item.type}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {!selectedEmployee && selectedEmployeeId === '' && (
        <Card>
          <CardContent className="text-center p-12">
            <p className="text-gray-500 text-lg">اختر موظفاً من القائمة أعلاه لعرض كشف الحساب</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}