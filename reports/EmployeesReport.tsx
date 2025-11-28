import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, UserX, DollarSign, Download, Search, Calendar } from "lucide-react";

export default function EmployeesReport() {
  const [searchTerm, setSearchTerm] = useState("");

  const employeesData = {
    totalEmployees: 25,
    activeEmployees: 23,
    inactiveEmployees: 2,
    totalSalaries: 185000,
    totalDeductions: 15000,
    employees: [
      {
        id: 1,
        name: "أحمد محمد السعيد",
        position: "مدير المبيعات",
        department: "المبيعات",
        salary: 12000,
        deductions: 500,
        netSalary: 11500,
        hireDate: "2023-01-15",
        status: "active",
        workingDays: 22,
        leaves: 2
      },
      {
        id: 2,
        name: "فاطمة أحمد الزهراني",
        position: "محاسبة رئيسية",
        department: "المحاسبة",
        salary: 10000,
        deductions: 300,
        netSalary: 9700,
        hireDate: "2023-03-20",
        status: "active",
        workingDays: 24,
        leaves: 0
      },
      {
        id: 3,
        name: "محمد عبدالله القحطاني",
        position: "مخزني",
        department: "المخازن",
        salary: 6000,
        deductions: 200,
        netSalary: 5800,
        hireDate: "2023-06-10",
        status: "active",
        workingDays: 20,
        leaves: 4
      },
      {
        id: 4,
        name: "سارة عبدالرحمن النجار",
        position: "مساعدة إدارية",
        department: "الإدارة",
        salary: 5500,
        deductions: 150,
        netSalary: 5350,
        hireDate: "2023-08-05",
        status: "active",
        workingDays: 23,
        leaves: 1
      },
      {
        id: 5,
        name: "خالد سعد الدوسري",
        position: "فني صيانة",
        department: "الصيانة",
        salary: 4800,
        deductions: 100,
        netSalary: 4700,
        hireDate: "2023-09-12",
        status: "inactive",
        workingDays: 0,
        leaves: 24
      }
    ],
    departments: [
      { name: "المبيعات", employees: 8, totalSalaries: 85000 },
      { name: "المحاسبة", employees: 5, totalSalaries: 45000 },
      { name: "المخازن", employees: 6, totalSalaries: 32000 },
      { name: "الإدارة", employees: 4, totalSalaries: 18000 },
      { name: "الصيانة", employees: 2, totalSalaries: 5000 }
    ]
  };

  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الموظفين</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background-color: #f9fafb; font-weight: bold; }
          .active { color: #10b981; }
          .inactive { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الموظفين</h1>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${employeesData.totalEmployees}</div>
            <p>إجمالي الموظفين</p>
          </div>
          <div class="summary-card">
            <div class="value">${employeesData.activeEmployees}</div>
            <p>الموظفين النشطين</p>
          </div>
          <div class="summary-card">
            <div class="value">${employeesData.totalSalaries.toLocaleString('en-US')} ريال</div>
            <p>إجمالي الرواتب</p>
          </div>
          <div class="summary-card">
            <div class="value">${employeesData.totalDeductions.toLocaleString('en-US')} ريال</div>
            <p>إجمالي الخصومات</p>
          </div>
        </div>

        <h3>تفاصيل الموظفين</h3>
        <table>
          <thead>
            <tr>
              <th>اسم الموظف</th>
              <th>المنصب</th>
              <th>القسم</th>
              <th>الراتب</th>
              <th>الخصومات</th>
              <th>صافي الراتب</th>
              <th>أيام العمل</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${employeesData.employees.map(employee => `
              <tr>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td>${employee.department}</td>
                <td>${employee.salary.toLocaleString('en-US')} ريال</td>
                <td>${employee.deductions.toLocaleString('en-US')} ريال</td>
                <td>${employee.netSalary.toLocaleString('en-US')} ريال</td>
                <td>${employee.workingDays}</td>
                <td class="${employee.status}">
                  ${employee.status === 'active' ? 'نشط' : 'غير نشط'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>توزيع الأقسام</h3>
        <table>
          <thead>
            <tr>
              <th>القسم</th>
              <th>عدد الموظفين</th>
              <th>إجمالي الرواتب</th>
            </tr>
          </thead>
          <tbody>
            ${employeesData.departments.map(department => `
              <tr>
                <td>${department.name}</td>
                <td>${department.employees}</td>
                <td>${department.totalSalaries.toLocaleString('en-US')} ريال</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredEmployees = employeesData.employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقرير الموظفين</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة الموظفين والرواتب</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الموظفين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{employeesData.totalEmployees}</p>
                <p className="text-blue-100 text-sm">موظف مسجل</p>
              </div>
              <Users className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">الموظفين النشطين</p>
                <p className="text-2xl font-bold">{employeesData.activeEmployees}</p>
                <p className="text-green-100 text-sm">موظف نشط</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">إجمالي الرواتب</p>
                <p className="text-2xl font-bold">{employeesData.totalSalaries.toLocaleString('en-US')} ريال</p>
                <p className="text-purple-100 text-sm">شهرياً</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">إجمالي الخصومات</p>
                <p className="text-2xl font-bold">{employeesData.totalDeductions.toLocaleString('en-US')} ريال</p>
                <p className="text-red-100 text-sm">شهرياً</p>
              </div>
              <UserX className="h-8 w-8 text-red-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الموظفين */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="departments">الأقسام</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <Badge variant="outline">{employee.position}</Badge>
                        <Badge variant="secondary">{employee.department}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الراتب الأساسي</p>
                          <p className="font-bold text-lg">{employee.salary.toLocaleString('en-US')} ريال</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الخصومات</p>
                          <p className="font-bold text-red-600">{employee.deductions.toLocaleString('en-US')} ريال</p>
                        </div>
                        <div>
                          <p className="text-gray-600">صافي الراتب</p>
                          <p className="font-bold text-green-600">{employee.netSalary.toLocaleString('en-US')} ريال</p>
                        </div>
                        <div>
                          <p className="text-gray-600">أيام العمل</p>
                          <p className="font-bold">{employee.workingDays} يوم</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span>تاريخ التوظيف: {employee.hireDate}</span>
                        <span>الإجازات: {employee.leaves} يوم</span>
                      </div>
                    </div>
                    <div className="text-left ml-6">
                      <Badge 
                        variant={employee.status === 'active' ? 'default' : 'destructive'}
                        className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeesData.departments.map((department, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">عدد الموظفين</p>
                      <p className="font-bold text-lg text-blue-600">{department.employees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">متوسط الراتب</p>
                      <p className="font-bold text-green-600">
                        {(department.totalSalaries / department.employees).toLocaleString('en-US')} ريال
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                    <p className="font-bold text-xl text-purple-600">
                      {department.totalSalaries.toLocaleString('en-US')} ريال
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(department.totalSalaries / employeesData.totalSalaries) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {((department.totalSalaries / employeesData.totalSalaries) * 100).toFixed(1)}% من إجمالي الرواتب
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الرواتب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>إجمالي الرواتب:</span>
                  <span className="font-bold text-purple-600">
                    {employeesData.totalSalaries.toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>متوسط الراتب:</span>
                  <span className="font-bold text-blue-600">
                    {(employeesData.totalSalaries / employeesData.totalEmployees).toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي الخصومات:</span>
                  <span className="font-bold text-red-600">
                    {employeesData.totalDeductions.toLocaleString('en-US')} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>صافي الرواتب:</span>
                  <span className="font-bold text-green-600">
                    {(employeesData.totalSalaries - employeesData.totalDeductions).toLocaleString('en-US')} ريال
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الموظفين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {((employeesData.activeEmployees / employeesData.totalEmployees) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">معدل الموظفين النشطين</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {employeesData.departments.length}
                  </div>
                  <p className="text-sm text-gray-600">عدد الأقسام</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {(employeesData.totalEmployees / employeesData.departments.length).toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">متوسط الموظفين لكل قسم</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}