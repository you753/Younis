import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Link2, Unlink, Users, Building, CheckCircle2 } from 'lucide-react';

interface BranchEmployeesLinkProps {
  branchId: number;
}

export default function BranchEmployeesLink({ branchId }: BranchEmployeesLinkProps) {
  const { toast } = useToast();

  // جلب جميع موظفي النظام الرئيسي (بدون branchId)
  const { data: mainEmployees = [], refetch: refetchMain } = useQuery<any[]>({
    queryKey: ['/api/employees'],
  });

  // جلب موظفي الفرع
  const { data: branchEmployees = [], refetch: refetchBranch } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/employees`],
  });

  // ربط موظف بالفرع
  const linkMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const response = await fetch(`/api/branches/${branchId}/link-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (!response.ok) throw new Error('فشل ربط الموظف');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم الربط بنجاح",
        description: data.message,
      });
      refetchMain();
      refetchBranch();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل ربط الموظف بالفرع",
        variant: "destructive",
      });
    },
  });

  // فك ربط موظف من الفرع
  const unlinkMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const response = await fetch(`/api/branches/${branchId}/unlink-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (!response.ok) throw new Error('فشل فك الربط');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم فك الربط بنجاح",
        description: data.message,
      });
      refetchMain();
      refetchBranch();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employees`] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل فك ربط الموظف من الفرع",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-t-4 border-t-yellow-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Link2 className="h-7 w-7 text-yellow-600" />
              ربط الموظفين بالفرع
            </CardTitle>
            <p className="text-gray-600 mt-2">
              قم بربط موظفي النظام الرئيسي بهذا الفرع لإضافتهم للكشوفات والتقارير
            </p>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* موظفو الفرع */}
          <Card className="shadow-lg border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-green-600" />
                موظفو الفرع ({branchEmployees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {branchEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا يوجد موظفين مربوطين بالفرع</p>
                  <p className="text-sm text-gray-400 mt-2">قم بربط موظفين من القائمة المجاورة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {branchEmployees.map((employee: any) => (
                    <Card key={employee.id} className="border-green-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                                مربوط
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{employee.position || 'لا يوجد'}</p>
                            <p className="text-xs text-gray-500">{employee.department || 'لا يوجد'}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unlinkMutation.mutate(employee.id)}
                            disabled={unlinkMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            data-testid={`button-unlink-${employee.id}`}
                          >
                            <Unlink className="h-4 w-4 ml-1" />
                            فك الربط
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* موظفو النظام الرئيسي */}
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                موظفو النظام الرئيسي ({mainEmployees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {mainEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">جميع الموظفين مربوطين بالفروع</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mainEmployees.map((employee: any) => (
                    <Card key={employee.id} className="border-blue-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.position || 'لا يوجد'}</p>
                            <p className="text-xs text-gray-500">{employee.department || 'لا يوجد'}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => linkMutation.mutate(employee.id)}
                            disabled={linkMutation.isPending}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                            data-testid={`button-link-${employee.id}`}
                          >
                            <Link2 className="h-4 w-4 ml-1" />
                            ربط
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ملاحظة */}
        <Card className="border-r-4 border-r-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> عند ربط موظف بالفرع، سيظهر في كشوفات الحساب والخصومات والديون الخاصة بهذا الفرع فقط.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
