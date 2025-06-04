import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Minus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deduction, Employee } from "@shared/schema";

export default function Deductions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const { data: deductions = [], isLoading } = useQuery<Deduction[]>({
    queryKey: ["/api/deductions"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const filteredDeductions = deductions.filter((deduction: Deduction) => {
    const employee = employees.find((emp: Employee) => emp.id === deduction.employeeId);
    const matchesSearch = employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deduction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || deduction.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'bg-blue-100 text-blue-800';
      case 'tax':
        return 'bg-red-100 text-red-800';
      case 'loan':
        return 'bg-orange-100 text-orange-800';
      case 'advance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'تأمين';
      case 'tax':
        return 'ضريبة';
      case 'loan':
        return 'قرض';
      case 'advance':
        return 'سلفة';
      case 'other':
        return 'أخرى';
      default:
        return type;
    }
  };

  const totalDeductions = filteredDeductions.reduce((sum, deduction) => 
    sum + parseFloat(deduction.amount), 0
  );

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
          <Minus className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">الخصومات</h1>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة خصم جديد
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الخصومات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع الخصم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="insurance">تأمين</SelectItem>
                <SelectItem value="tax">ضريبة</SelectItem>
                <SelectItem value="loan">قرض</SelectItem>
                <SelectItem value="advance">سلفة</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Minus className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-gray-900">{deductions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Minus className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">المبلغ الإجمالي</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalDeductions.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">التأمينات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deductions.filter(d => d.type === 'insurance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Minus className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">السلف</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deductions.filter(d => d.type === 'advance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deductions Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الخصومات ({filteredDeductions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeductions.length === 0 ? (
            <div className="text-center py-12">
              <Minus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خصومات</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة خصم جديد لتتبع خصومات الموظفين</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة خصم جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4 font-semibold">اسم الموظف</th>
                    <th className="text-right p-4 font-semibold">نوع الخصم</th>
                    <th className="text-right p-4 font-semibold">المبلغ</th>
                    <th className="text-right p-4 font-semibold">الوصف</th>
                    <th className="text-right p-4 font-semibold">التاريخ</th>
                    <th className="text-right p-4 font-semibold">متكرر</th>
                    <th className="text-right p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeductions.map((deduction: Deduction) => {
                    const employee = employees.find((emp: Employee) => emp.id === deduction.employeeId);
                    return (
                      <tr key={deduction.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {employee?.name || 'موظف غير معروف'}
                          </div>
                          {employee?.position && (
                            <div className="text-sm text-gray-500">{employee.position}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor(deduction.type)}>
                            {getTypeText(deduction.type)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-red-600">
                            -{parseFloat(deduction.amount).toLocaleString()} ر.س
                          </span>
                        </td>
                        <td className="p-4 text-gray-900">
                          {deduction.description || '-'}
                        </td>
                        <td className="p-4 text-gray-900">
                          {new Date(deduction.date).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="p-4">
                          {deduction.recurring ? (
                            <Badge className="bg-green-100 text-green-800">نعم</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">لا</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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
    </div>
  );
}