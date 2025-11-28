import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, Edit, Trash2, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Salary, Employee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SalaryFormComponent from "@/components/forms/SalaryForm";

export default function Salaries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: salaries = [], isLoading } = useQuery<Salary[]>({
    queryKey: ["/api/salaries"],
    refetchInterval: 5000, // تحديث كل 5 ثوان
    refetchOnWindowFocus: true, // تحديث عند العودة للصفحة
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    refetchInterval: 5000, // تحديث كل 5 ثوان
    refetchOnWindowFocus: true, // تحديث عند العودة للصفحة
  });

  const deleteSalaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/salaries/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      toast({
        title: "نجح",
        description: "تم حذف الراتب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الراتب",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (salary: any) => {
    setEditingSalary(salary);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الراتب؟')) {
      deleteSalaryMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setEditingSalary(null);
    setShowForm(false);
  };

  const filteredSalaries = salaries.filter((salary: Salary) => {
    const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
    const matchesSearch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || salary.status === selectedStatus;
    const matchesMonth = selectedMonth === "all" || salary.month.toString() === selectedMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1] || '';
  };

  const totalNetSalaries = filteredSalaries.reduce((sum, salary) => 
    sum + parseFloat(salary.netSalary), 0
  );

  const paidSalaries = filteredSalaries.filter(s => s.status === 'paid');
  const pendingSalaries = filteredSalaries.filter(s => s.status === 'pending');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">الرواتب</h1>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة راتب جديد
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الرواتب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="حالة الراتب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الشهور</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {getMonthName(i + 1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-gray-900">{salaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المبلغ الصافي</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalNetSalaries.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">رواتب مدفوعة</p>
                <p className="text-2xl font-bold text-gray-900">{paidSalaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSalaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الرواتب ({filteredSalaries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSalaries.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد رواتب</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة راتب جديد لإدارة رواتب الموظفين</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة راتب جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4 font-semibold">اسم الموظف</th>
                    <th className="text-right p-4 font-semibold">الشهر/السنة</th>
                    <th className="text-right p-4 font-semibold">الراتب الأساسي</th>
                    <th className="text-right p-4 font-semibold">العمل الإضافي</th>
                    <th className="text-right p-4 font-semibold">البونص</th>
                    <th className="text-right p-4 font-semibold">الخصومات</th>
                    <th className="text-right p-4 font-semibold">الراتب الصافي</th>
                    <th className="text-right p-4 font-semibold">الحالة</th>
                    <th className="text-right p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary: Salary) => {
                    const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
                    return (
                      <tr key={salary.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {employee?.name || 'موظف غير معروف'}
                          </div>
                          {employee?.position && (
                            <div className="text-sm text-gray-500">{employee.position}</div>
                          )}
                        </td>
                        <td className="p-4 text-gray-900">
                          {getMonthName(salary.month)} {salary.year}
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-900">
                            {(() => {
                              const employee = employees.find(emp => emp.id === salary.employeeId);
                              const currentSalary = employee?.salary || salary.baseSalary;
                              return parseFloat(currentSalary).toLocaleString() + " ر.س";
                            })()}
                          </span>
                          {(() => {
                            const employee = employees.find(emp => emp.id === salary.employeeId);
                            const currentSalary = parseFloat(employee?.salary || salary.baseSalary);
                            const originalSalary = parseFloat(salary.baseSalary);
                            if (currentSalary !== originalSalary) {
                              return (
                                <div className="text-xs text-gray-500 mt-1">
                                  كان: {originalSalary.toLocaleString()} ر.س
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td className="p-4">
                          <span className="text-blue-600">
                            +{parseFloat(salary.overtime || "0").toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-green-600">
                            +{parseFloat(salary.bonuses || "0").toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-red-600">
                            -{parseFloat(salary.totalDeductions || "0").toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-green-700">
                            {parseFloat(salary.netSalary).toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(salary.status)}>
                            {getStatusText(salary.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(salary)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(salary.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salary Form */}
      <SalaryFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingSalary={editingSalary}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}