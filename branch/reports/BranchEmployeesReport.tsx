import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, DollarSign, FileText, Search, Download, Phone, Mail, UserCheck, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchEmployeesReportProps {
  branchId?: number;
}

export default function BranchEmployeesReport({ branchId }: BranchEmployeesReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات الموظفين
  const { data: employees = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/employees`] : ['/api/employees'],
  });

  // جلب بيانات الديون
  const { data: debts = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/employee-debts`] : ['/api/employee-debts'],
  });

  // جلب بيانات الرواتب
  const { data: salaries = [] } = useQuery<any[]>({
    queryKey: branchId ? [`/api/branches/${branchId}/salaries`] : ['/api/salaries'],
  });

  // حساب الإحصائيات
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(employee => employee.status === 'active').length;
  const totalSalaries = employees.reduce((sum, employee) => sum + parseFloat(employee.baseSalary || '0'), 0);
  const totalDebts = debts.reduce((sum, debt) => sum + parseFloat(debt.amount || '0'), 0);
  const employeesWithDebts = debts.filter(debt => debt.debtorType === 'employee').length;

  // تصفية البيانات
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // طباعة التقرير
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRangeText = dateFrom && dateTo 
      ? `الفترة من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}`
      : dateFrom 
      ? `من تاريخ ${new Date(dateFrom).toLocaleDateString('en-GB')}`
      : dateTo 
      ? `حتى تاريخ ${new Date(dateTo).toLocaleDateString('en-GB')}`
      : 'جميع الفترات';

    const branchName = branch?.name || `الفرع ${branchId}`;

    const reportContent = `
      <html dir="rtl">
        <head>
          <title>تقرير الموظفين - ${branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .date-range { background: #f0f9ff; padding: 10px; margin-bottom: 20px; text-align: center; border: 1px solid #3b82f6; border-radius: 5px; color: #1e40af; font-weight: bold; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; background: #f9f9f9; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              
              <p>تقرير الموظفين - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="date-range">
            📅 ${dateRangeText}
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalEmployees}</div>
              <div class="stat-label">إجمالي الموظفين</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeEmployees}</div>
              <div class="stat-label">الموظفين النشطين</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalSalaries.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الرواتب</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalDebts.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الديون</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>اسم الموظف</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>القسم</th>
                <th>الراتب الأساسي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map(employee => `
                <tr>
                  <td>${employee.name}</td>
                  <td>${employee.email || 'غير محدد'}</td>
                  <td>${employee.phone || 'غير محدد'}</td>
                  <td>${employee.department || 'غير محدد'}</td>
                  <td>${parseFloat(employee.baseSalary || '0').toLocaleString('en-US')} ريال</td>
                  <td>${employee.status === 'active' ? 'نشط' : 'غير نشط'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير الموظفين</h1>
            <p className="text-gray-600">تقرير تفصيلي للموظفين - الفرع رقم: {branchId}</p>
            {(dateFrom || dateTo) && (
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {dateFrom && dateTo 
                    ? `من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}`
                    : dateFrom 
                    ? `من ${new Date(dateFrom).toLocaleDateString('en-GB')}`
                    : `حتى ${new Date(dateTo).toLocaleDateString('en-GB')}`}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={printReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفين النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSalaries.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">رواتب أساسية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalDebts.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">ديون على الموظفين</p>
          </CardContent>
        </Card>
      </div>

      {/* التصفية والبحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* فلتر التاريخ */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Calendar className="h-5 w-5" />
                <span>الفترة الزمنية:</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">من تاريخ:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1"
                    data-testid="input-date-from"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">إلى تاريخ:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1"
                    data-testid="input-date-to"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="whitespace-nowrap"
                    data-testid="button-clear-dates"
                  >
                    مسح التاريخ
                  </Button>
                )}
              </div>
            </div>
            
            {/* فلاتر أخرى */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث باسم الموظف أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status">
                  <SelectValue placeholder="حالة الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-department">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="accounting">المحاسبة</SelectItem>
                  <SelectItem value="warehouse">المخازن</SelectItem>
                  <SelectItem value="hr">الموارد البشرية</SelectItem>
                  <SelectItem value="it">تقنية المعلومات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="salaries">الرواتب</TabsTrigger>
          <TabsTrigger value="debts">الديون</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">اسم الموظف</th>
                      <th className="text-right py-2 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-2 px-4">الهاتف</th>
                      <th className="text-right py-2 px-4">القسم</th>
                      <th className="text-right py-2 px-4">الراتب الأساسي</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{employee.name}</td>
                        <td className="py-2 px-4 text-blue-600">{employee.email || 'غير محدد'}</td>
                        <td className="py-2 px-4">{employee.phone || 'غير محدد'}</td>
                        <td className="py-2 px-4">{employee.department || 'غير محدد'}</td>
                        <td className="py-2 px-4 text-green-600 font-semibold">
                          {parseFloat(employee.baseSalary || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد موظفين متاحين
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الرواتب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEmployees.map((employee) => {
                  const employeeSalary = parseFloat(employee.baseSalary || '0');
                  const currentSalary = parseFloat(employee.salary || employee.baseSalary || '0');
                  const salaryChange = currentSalary - employeeSalary;
                  
                  return (
                    <div key={employee.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <Badge variant="outline">{employee.department || 'غير محدد'}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الراتب الأساسي:</span>
                          <span className="font-semibold text-blue-600">
                            {employeeSalary.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الراتب الحالي:</span>
                          <span className="font-semibold text-green-600">
                            {currentSalary.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        {salaryChange !== 0 && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm text-gray-500">التغيير:</span>
                            <span className={`font-semibold ${salaryChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {salaryChange > 0 ? '+' : ''}{salaryChange.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ديون الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEmployees.map((employee) => {
                  const employeeDebts = debts.filter(debt => debt.debtorId === employee.id && debt.debtorType === 'employee');
                  const totalEmployeeDebt = employeeDebts.reduce((sum, debt) => sum + parseFloat(debt.amount || '0'), 0);
                  
                  return (
                    <div key={employee.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <div className="flex gap-2">
                          {employee.phone && <Phone className="h-4 w-4 text-gray-500" />}
                          {employee.email && <Mail className="h-4 w-4 text-gray-500" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">عدد الديون:</span>
                          <span className="font-semibold text-blue-600">{employeeDebts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">إجمالي الديون:</span>
                          <span className="font-semibold text-red-600">
                            {totalEmployeeDebt.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        {totalEmployeeDebt > 0 && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm text-gray-500">الحالة:</span>
                            <Badge variant="destructive">يوجد ديون</Badge>
                          </div>
                        )}
                        {totalEmployeeDebt === 0 && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm text-gray-500">الحالة:</span>
                            <Badge variant="default">لا يوجد ديون</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}