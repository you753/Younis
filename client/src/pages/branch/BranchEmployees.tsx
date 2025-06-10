import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Edit,
  Eye
} from 'lucide-react';

interface BranchEmployeesProps {
  branchId: number;
}

export default function BranchEmployees({ branchId }: BranchEmployeesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/employees`],
    queryFn: async () => {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('فشل في جلب الموظفين');
      return response.json();
    }
  });

  const filteredEmployees = employees.filter((employee: any) =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين - الفرع {branchId}</h1>
          <p className="text-gray-600">إدارة موظفي هذا الفرع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تقرير الحضور
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف جديد
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الموظفين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الموظفين */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">حاضرين اليوم</p>
                <p className="text-xl font-bold text-green-600">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">في إجازة</p>
                <p className="text-xl font-bold text-orange-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                <p className="text-xl font-bold text-purple-600">
                  {employees.reduce((total: number, emp: any) => total + (emp.salary || 0), 0).toFixed(2)} ر.س
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
            <Users className="h-5 w-5" />
            قائمة الموظفين - فرع {branchId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد موظفين في هذا الفرع</h3>
              <p className="text-gray-500 mb-4">ابدأ بإضافة موظفين لهذا الفرع</p>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة موظف جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee: any) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{employee.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{employee.position || 'غير محدد'}</span>
                          {employee.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{employee.phone}</span>
                            </div>
                          )}
                          {employee.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{employee.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <div className="text-sm font-medium">{employee.salary || 0} ر.س</div>
                        <div className="text-xs text-gray-500">الراتب الشهري</div>
                      </div>
                      <Badge variant="default">نشط</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}