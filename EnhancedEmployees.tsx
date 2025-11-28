import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, Users, UserCheck, UserX, DollarSign, Eye, User, Phone, Mail, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { insertEmployeeSchema } from '@shared/schema';
import EnhancedEditForm from '@/components/forms/EnhancedEditForm';
import { useNotification } from '@/hooks/useNotification';
import { apiRequest } from '@/lib/queryClient';

export default function EnhancedEmployees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { success, error } = useNotification();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Filter employees based on search
  const filteredEmployees = employees.filter((employee: any) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
  const inactiveEmployees = employees.filter((e: any) => e.status === 'inactive').length;
  const totalSalaries = employees.reduce((sum: number, e: any) => sum + parseFloat(e.salary || 0), 0);

  // Form configuration
  const formFields = [
    { name: 'name', label: 'اسم الموظف', type: 'text' as const, required: true, placeholder: 'أدخل اسم الموظف' },
    { name: 'position', label: 'المنصب', type: 'text' as const, required: true, placeholder: 'منصب الموظف' },
    { name: 'department', label: 'القسم', type: 'text' as const, placeholder: 'القسم' },
    { name: 'phone', label: 'رقم الهاتف', type: 'text' as const, placeholder: '05xxxxxxxx' },
    { name: 'email', label: 'البريد الإلكتروني', type: 'email' as const, placeholder: 'employee@company.com' },
    { name: 'salary', label: 'الراتب الأساسي', type: 'number' as const, placeholder: '5000' },
    { name: 'hireDate', label: 'تاريخ التوظيف', type: 'date' as const },
    { 
      name: 'status', 
      label: 'الحالة', 
      type: 'select' as const, 
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'on_leave', label: 'في إجازة' }
      ]
    },
    { name: 'nationalId', label: 'رقم الهوية', type: 'text' as const, placeholder: '1xxxxxxxxx' },
    { name: 'address', label: 'العنوان', type: 'textarea' as const, placeholder: 'عنوان الموظف' }
  ];

  const defaultValues = {
    name: '',
    position: '',
    department: '',
    phone: '',
    email: '',
    salary: '0',
    hireDate: '',
    status: 'active',
    nationalId: '',
    address: ''
  };

  const handleView = (employee: any) => {
    setViewingEmployee(employee);
    setShowViewDialog(true);
  };

  const handleEdit = (employee: any) => {
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (employeeId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    try {
      await apiRequest('DELETE', `/api/employees/${employeeId}`, {});
      success('تم حذف الموظف بنجاح');
      window.location.reload();
    } catch (err) {
      error('حدث خطأ أثناء حذف الموظف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge variant="destructive">غير نشط</Badge>;
      case 'on_leave':
        return <Badge variant="secondary">في إجازة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">جاري تحميل الموظفين...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الموظفين المُحسنة</h1>
            <p className="text-gray-600 mt-1">إدارة شاملة لبيانات الموظفين ومعلوماتهم</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            إضافة موظف جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموظفين النشطين</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموظفين غير النشطين</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalSalaries.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <EnhancedEditForm
          title="الموظفين"
          apiEndpoint="/api/employees"
          itemId={editingId}
          fields={formFields}
          schema={insertEmployeeSchema}
          defaultValues={defaultValues}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Search and Employees List */}
      {!showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'لا توجد موظفين يطابقون البحث' : 'لا توجد موظفين مُضافين'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الموظف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنصب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الراتب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee: any) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          {employee.email && (
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(employee.salary || 0).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(employee)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                              title="معاينة الموظف"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(employee)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200 hover:border-green-300"
                              title="تعديل الموظف"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300"
                              title="حذف الموظف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Professional View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              تفاصيل الموظف
            </DialogTitle>
            <DialogDescription>
              معاينة شاملة لجميع بيانات الموظف ومعلوماته
            </DialogDescription>
          </DialogHeader>
          
          {viewingEmployee && (
            <div className="grid gap-6 py-4">
              {/* Employee Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {viewingEmployee.name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{viewingEmployee.name}</h3>
                  <p className="text-blue-600 font-medium">{viewingEmployee.position}</p>
                  <p className="text-gray-600 text-sm">{viewingEmployee.department}</p>
                </div>
                <div className="text-left">
                  {getStatusBadge(viewingEmployee.status)}
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الهاتف</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.email || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الهوية</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.nationalId || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">العنوان</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.address || 'غير محدد'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      معلومات العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">المنصب</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.position || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">القسم</p>
                        <p className="text-sm font-medium text-gray-900">{viewingEmployee.department || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">الراتب الأساسي</p>
                        <p className="text-sm font-bold text-green-600">
                          {parseFloat(viewingEmployee.salary || 0).toLocaleString('en-US', { 
                            style: 'currency', 
                            currency: 'SAR' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">تاريخ التوظيف</p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString('en-GB') : 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="px-6"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEdit(viewingEmployee);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل الموظف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}