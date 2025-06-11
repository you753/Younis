import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Filter,
  FileText,
  UserCheck,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EmployeesReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportType, setReportType] = useState('summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch employees data
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    staleTime: 60000,
  });

  // Fetch salaries data
  const { data: salaries = [] } = useQuery({
    queryKey: ['/api/salaries'],
    staleTime: 60000,
  });

  // Fetch deductions data
  const { data: deductions = [] } = useQuery({
    queryKey: ['/api/deductions'],
    staleTime: 60000,
  });

  const generateEmployeesReportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('employees-report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.setFontSize(20);
      pdf.text(`تقرير الموظفين - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-الموظفين-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate employee metrics
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  const totalSalaries = Array.isArray(salaries) ? 
    salaries.reduce((sum: number, salary: any) => sum + parseFloat(salary.basicSalary || 0), 0) : 0;
  const totalDeductions = Array.isArray(deductions) ? 
    deductions.reduce((sum: number, deduction: any) => sum + parseFloat(deduction.amount || 0), 0) : 0;

  // Process employee data with salaries and deductions
  const employeeDetails = Array.isArray(employees) ?
    employees.map((employee: any) => {
      const employeeSalaries = Array.isArray(salaries) ? 
        salaries.filter((salary: any) => salary.employeeId === employee.id) : [];
      const employeeDeductions = Array.isArray(deductions) ? 
        deductions.filter((deduction: any) => deduction.employeeId === employee.id) : [];
      
      const totalSalary = employeeSalaries.reduce((sum: number, salary: any) => 
        sum + parseFloat(salary.basicSalary || 0), 0);
      const totalDeduction = employeeDeductions.reduce((sum: number, deduction: any) => 
        sum + parseFloat(deduction.amount || 0), 0);
      
      return {
        ...employee,
        totalSalary,
        totalDeduction,
        netSalary: totalSalary - totalDeduction,
        salariesCount: employeeSalaries.length,
        deductionsCount: employeeDeductions.length
      };
    }) : [];

  const filteredEmployees = searchTerm ? 
    employeeDetails.filter((employee: any) => 
      (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.phone || '').includes(searchTerm) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : employeeDetails;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير الموظفين</h1>
          <p className="text-gray-600 mt-2">تقارير شاملة عن الموظفين والرواتب والخصومات</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateEmployeesReportPDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'جاري الإنشاء...' : 'حفظ PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">البحث</label>
              <Input
                placeholder="اسم الموظف أو القسم"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">القسم</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="accounting">المحاسبة</SelectItem>
                  <SelectItem value="hr">الموارد البشرية</SelectItem>
                  <SelectItem value="it">تقنية المعلومات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">ملخص الموظفين</SelectItem>
                  <SelectItem value="salaries">الرواتب</SelectItem>
                  <SelectItem value="deductions">الخصومات</SelectItem>
                  <SelectItem value="attendance">الحضور</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div id="employees-report-content">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                  <p className="text-2xl font-bold text-green-600">{totalSalaries.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                  <p className="text-2xl font-bold text-orange-600">{totalDeductions.toFixed(2)} ر.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">صافي الرواتب</p>
                  <p className="text-2xl font-bold text-purple-600">{(totalSalaries - totalDeductions).toFixed(2)} ر.س</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              تفاصيل الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length > 0 ? (
              <div className="grid gap-4">
                {filteredEmployees.map((employee: any) => (
                  <Card key={employee.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{employee.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              <span>{employee.position || 'غير محدد'}</span>
                            </div>
                            {employee.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{employee.phone}</span>
                              </div>
                            )}
                            {employee.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{employee.email}</span>
                              </div>
                            )}
                            {employee.department && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{employee.department}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">الرواتب والخصومات</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">إجمالي الراتب:</span>
                              <Badge variant="default">{employee.totalSalary.toFixed(2)} ر.س</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">إجمالي الخصومات:</span>
                              <Badge variant="destructive">{employee.totalDeduction.toFixed(2)} ر.س</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">صافي الراتب:</span>
                              <Badge variant="outline">{employee.netSalary.toFixed(2)} ر.س</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">الإحصائيات</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">عدد الرواتب:</span>
                              <Badge variant="outline">{employee.salariesCount}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">عدد الخصومات:</span>
                              <Badge variant="outline">{employee.deductionsCount}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">تاريخ التوظيف:</span>
                              <span className="text-sm">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ar-SA') : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات موظفين</h3>
                <p className="text-gray-500">لا توجد موظفين تطابق الفلاتر المحددة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')} الساعة {new Date().toLocaleTimeString('ar-SA')}</p>
          <p className="mt-1">نظام المحاسب الأعظم - إدارة الموظفين</p>
        </div>
      </div>
    </div>
  );
}