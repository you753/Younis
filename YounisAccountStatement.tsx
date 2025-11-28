import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, TrendingUp, User, FileText, Calculator } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: string;
  employeeId: string;
}

interface Debt {
  id: number;
  debtorId: number;
  debtorName: string;
  type: string;
  amount: string;
  remainingAmount: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface DebtPayment {
  id: number;
  employeeId: number;
  debtId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export default function YounisAccountStatement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب بيانات الموظف يونس عبد الرحمن (ID: 117)
  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ['/api/employees/117'],
  });

  // جلب ديون الموظف
  const { data: debts = [], isLoading: debtsLoading } = useQuery<Debt[]>({
    queryKey: ['/api/employee-debts'],
    select: (data) => data.filter((debt: Debt) => debt.debtorId === 117)
  });

  // جلب سدادات الديون
  const { data: debtPayments = [], isLoading: paymentsLoading } = useQuery<DebtPayment[]>({
    queryKey: ['/api/debt-payments'],
    select: (data) => data.filter((payment: DebtPayment) => payment.employeeId === 117)
  });

  // حساب الإحصائيات
  const calculateStats = () => {
    const totalDebts = debts.reduce((sum, debt) => sum + parseFloat(debt.amount || '0'), 0);
    const totalRemaining = debts.reduce((sum, debt) => sum + parseFloat(debt.remainingAmount || '0'), 0);
    const totalPaid = debtPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const currentSalary = parseFloat(employee?.salary || '0');

    return {
      totalDebts,
      totalRemaining,
      totalPaid,
      currentSalary,
      paidPercentage: totalDebts > 0 ? ((totalPaid / totalDebts) * 100) : 0
    };
  };

  const stats = calculateStats();

  if (employeeLoading || debtsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري تحميل كشف الحساب...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center p-8">
            <h2 className="text-xl text-red-600">الموظف غير موجود</h2>
            <p className="text-gray-600 mt-2">لم يتم العثور على بيانات الموظف المطلوب</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-bold">كشف حساب الموظف</h1>
        <p className="text-lg text-gray-600 mt-2">{employee.name} - {employee.position}</p>
      </div>

      {/* معلومات الموظف */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات الموظف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">اسم الموظف</p>
              <p className="font-semibold">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">رقم الموظف</p>
              <p className="font-semibold">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المنصب</p>
              <p className="font-semibold">{employee.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الراتب الحالي</p>
              <p className="font-semibold text-green-600">{stats.currentSalary.toLocaleString()} ريال</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalDebts.toLocaleString()} ريال</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المبلغ المسدد</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} ريال</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalRemaining.toLocaleString()} ريال</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نسبة السداد</p>
                <p className="text-2xl font-bold text-blue-600">{stats.paidPercentage.toFixed(1)}%</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الديون */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الديون</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد ديون مسجلة لهذا الموظف
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">رقم الدين</th>
                    <th className="text-right p-2">النوع</th>
                    <th className="text-right p-2">المبلغ الأصلي</th>
                    <th className="text-right p-2">المبلغ المتبقي</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">التاريخ</th>
                    <th className="text-right p-2">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{debt.id}</td>
                      <td className="p-2">
                        <Badge variant={debt.type === 'loan' ? 'destructive' : 'secondary'}>
                          {debt.type === 'loan' ? 'قرض' : 'سلفة'}
                        </Badge>
                      </td>
                      <td className="p-2 font-semibold">{parseFloat(debt.amount).toLocaleString()} ريال</td>
                      <td className="p-2 font-semibold text-orange-600">
                        {parseFloat(debt.remainingAmount).toLocaleString()} ريال
                      </td>
                      <td className="p-2">
                        <Badge variant={debt.status === 'paid' ? 'default' : 'destructive'}>
                          {debt.status === 'paid' ? 'مسدد' : 'نشط'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(debt.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-2 text-sm">{debt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* جدول السدادات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل السدادات</CardTitle>
        </CardHeader>
        <CardContent>
          {debtPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد سدادات مسجلة لهذا الموظف
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">رقم السداد</th>
                    <th className="text-right p-2">رقم الدين</th>
                    <th className="text-right p-2">المبلغ المسدد</th>
                    <th className="text-right p-2">تاريخ السداد</th>
                    <th className="text-right p-2">طريقة السداد</th>
                    <th className="text-right p-2">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {debtPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{payment.id}</td>
                      <td className="p-2 font-mono">{payment.debtId}</td>
                      <td className="p-2 font-semibold text-green-600">
                        {payment.amount.toLocaleString()} ريال
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-2">{payment.paymentMethod}</td>
                      <td className="p-2 text-sm">{payment.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ملخص الحساب */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">البيانات المالية</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>الراتب الشهري:</span>
                  <span className="font-semibold">{stats.currentSalary.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي الديون:</span>
                  <span className="font-semibold text-red-600">{stats.totalDebts.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي السدادات:</span>
                  <span className="font-semibold text-green-600">{stats.totalPaid.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">المبلغ المتبقي:</span>
                  <span className="font-bold text-orange-600">{stats.totalRemaining.toLocaleString()} ريال</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">الإحصائيات</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>عدد الديون:</span>
                  <span className="font-semibold">{debts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد السدادات:</span>
                  <span className="font-semibold">{debtPayments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة السداد:</span>
                  <span className="font-semibold text-blue-600">{stats.paidPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">الحالة العامة:</span>
                  <Badge variant={stats.totalRemaining === 0 ? 'default' : 'destructive'}>
                    {stats.totalRemaining === 0 ? 'مسدد بالكامل' : 'يوجد مبالغ متبقية'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}