import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { Eye, RefreshCw, Search, Users, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

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

export default function ProfessionalEmployeeDeductions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  // Fetch data
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
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



  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/employees'] }),
        queryClient.refetchQueries({ queryKey: ['/api/deductions'] }),
        queryClient.refetchQueries({ queryKey: ['/api/debts'] })
      ]);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح"
      });
    }
  });

  // Filter employees
  const filteredEmployees = employees.filter((employee: Employee) =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Calculate overall statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: Employee) => e.status === 'active').length;
  const totalDeductionsAmount = deductions.reduce((sum: number, d: Deduction) => 
    sum + (parseFloat(d.amount) || 0), 0
  );
  const totalDebtsAmount = debts.reduce((sum: number, debt: Debt) => 
    sum + (parseFloat(debt.remainingAmount) || 0), 0
  );



  if (isLoadingEmployees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل بيانات الموظفين...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">كشف حساب الخصومات</h1>
          <p className="text-muted-foreground mt-1">
            عرض كشف حساب الخصومات والديون لكل موظف
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 ml-1 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">عدد الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
            <p className="text-sm text-muted-foreground">موظف نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDeductionsAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي الديون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalDebtsAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث بالاسم أو المنصب أو القسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">اسم الموظف</th>
                  <th className="text-right p-3">الراتب</th>
                  <th className="text-right p-3">الخصومات</th>
                  <th className="text-right p-3">الديون</th>
                  <th className="text-center p-3">كشف الحساب</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee: Employee) => {
                  const stats = getEmployeeStats(employee.id);
                  return (
                    <tr key={employee.id} className="border-b">
                      <td className="p-3 font-medium">{employee.name}</td>
                      <td className="p-3 text-green-600 font-medium">
                        {formatCurrency(employee.salary)}
                      </td>
                      <td className="p-3 text-red-600 font-medium">
                        {formatCurrency(stats.totalDeductions)}
                      </td>
                      <td className="p-3 text-orange-600 font-medium">
                        {formatCurrency(stats.totalDebts)}
                      </td>
                      <td className="p-3 text-center">
                        <Link href={`/employee-statement?id=${employee.id}`}>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            كشف الحساب
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      لا توجد موظفين مطابقة لمعايير البحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}