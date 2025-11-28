import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ProtectedSection from '@/components/ProtectedSection';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  UserCheck,
  Filter
} from 'lucide-react';

interface BranchEmployeesProps {
  branchId: number;
}

export default function BranchEmployees({ branchId }: BranchEmployeesProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="employees">
      <BranchEmployeesContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchEmployeesContent({ branchId }: { branchId: number }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    address: '',
    notes: '',
    status: 'نشط'
  });

  // بيانات وهمية للموظفين
  const employees = [
    {
      id: 1,
      name: 'أحمد محمد علي',
      email: 'ahmed.mohamed@company.com',
      phone: '0501234567',
      position: 'مدير المبيعات',
      department: 'المبيعات',
      salary: 8000,
      hireDate: '2023-01-15',
      address: 'الرياض، حي النخيل',
      status: 'نشط',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 2,
      name: 'فاطمة أحمد السالم',
      email: 'fatima.salem@company.com',
      phone: '0509876543',
      position: 'محاسبة',
      department: 'المحاسبة',
      salary: 6500,
      hireDate: '2023-03-10',
      address: 'جدة، حي الفيصلية',
      status: 'نشط',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 3,
      name: 'خالد عبدالله النمر',
      email: 'khalid.alnemr@company.com',
      phone: '0555555555',
      position: 'مساعد مخازن',
      department: 'المخازن',
      salary: 4500,
      hireDate: '2023-06-20',
      address: 'الدمام، حي الخليج',
      status: 'إجازة',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 4,
      name: 'نورا سعد الغامدي',
      email: 'nora.alghamdi@company.com',
      phone: '0512345678',
      position: 'موظفة استقبال',
      department: 'الإدارة',
      salary: 3500,
      hireDate: '2023-08-01',
      address: 'الرياض، حي الملز',
      status: 'نشط',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 5,
      name: 'عبدالرحمن محمد القحطاني',
      email: 'abdulrahman.q@company.com',
      phone: '0567890123',
      position: 'سائق',
      department: 'النقل',
      salary: 3000,
      hireDate: '2023-05-15',
      address: 'الخرج، حي الياسمين',
      status: 'متوقف',
      avatar: '/api/placeholder/40/40'
    }
  ];

  const departments = ['الكل', 'المبيعات', 'المحاسبة', 'المخازن', 'الإدارة', 'النقل'];
  const statuses = ['الكل', 'نشط', 'إجازة', 'متوقف'];

  // حساب الإحصائيات
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'نشط').length,
    onLeave: employees.filter(emp => emp.status === 'إجازة').length,
    suspended: employees.filter(emp => emp.status === 'متوقف').length,
    totalSalaries: employees.reduce((sum, emp) => sum + emp.salary, 0),
    averageSalary: employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
  };

  // تصفية الموظفين
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.phone.includes(searchTerm);
    const matchesDepartment = selectedDepartment === 'الكل' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'الكل' || employee.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'نشط': { className: 'bg-green-100 text-green-800 border-green-200', text: 'نشط' },
      'إجازة': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'إجازة' },
      'متوقف': { className: 'bg-red-100 text-red-800 border-red-200', text: 'متوقف' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['نشط'];
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // معالجة إضافة الموظف
    console.log('إضافة موظف جديد:', formData);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      hireDate: '',
      address: '',
      notes: '',
      status: 'نشط'
    });
  };

  const handleEdit = (employee: any) => {
    console.log('تعديل الموظف:', employee);
  };

  const handleDelete = (employeeId: number) => {
    console.log('حذف الموظف:', employeeId);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">القسم</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.slice(1).map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">تاريخ التوظيف</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.slice(1).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  حفظ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">موظفين نشطين</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">في إجازة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">متوسط الراتب</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageSalary.toLocaleString('en-US')} ر.س</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="البحث بالاسم أو البريد أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full gap-2">
                <Filter className="h-4 w-4" />
                فلاتر متقدمة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الموظفين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{employee.name}</h3>
                    {getStatusBadge(employee.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{employee.position} - {employee.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{employee.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>تاريخ التوظيف: {employee.hireDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span className="font-medium">{employee.salary.toLocaleString('en-US')} ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}