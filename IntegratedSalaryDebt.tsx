import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, DollarSign, Users, CreditCard, Receipt, CheckCircle, AlertCircle, MinusCircle, Calculator, Banknote, PiggyBank, Printer, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  salary: string;
  status: string;
}

interface EmployeeDebt {
  id: number;
  debtorId: number;
  debtorName: string;
  amount: string;
  remainingAmount: string;
  status: string;
  description: string;
  dueDate: string;
  debtType: string;
  debtItems: Array<{
    id: string;
    amount: string;
    reason: string;
  }>;
  employeeName: string;
}

interface DeductionRequest {
  employeeId: number;
  amount: string;
  type: string;
  source: string;
  description: string;
  date: string;
}

interface DeductionResponse {
  success: boolean;
  deduction: any;
  salaryUpdate: {
    employeeName: string;
    previousSalary: number;
    deductedAmount: number;
    newSalary: number;
  };
  debtUpdates: Array<{
    debtId: number;
    debtDescription: string;
    originalAmount: number;
    paidAmount: number;
    newBalance: number;
    status: string;
  }>;
  summary: {
    totalDeducted: number;
    totalDebtsPaid: number;
    debtsUpdated: number;
    message: string;
  };
}

export default function IntegratedSalaryDebt() {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionDescription, setDeductionDescription] = useState("");
  const [deductionType, setDeductionType] = useState("salary_deduction");
  const [deductionSource, setDeductionSource] = useState("salary"); // "salary" or "debt"
  const [lastOperationResult, setLastOperationResult] = useState<DeductionResponse | null>(null);
  
  // حالات نظام إدارة الديون
  const [selectedDebtForEdit, setSelectedDebtForEdit] = useState<EmployeeDebt | null>(null);
  const [selectedDebtForPreview, setSelectedDebtForPreview] = useState<EmployeeDebt | null>(null);
  const [selectedDebtForDelete, setSelectedDebtForDelete] = useState<EmployeeDebt | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // جلب بيانات الموظفين
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // جلب بيانات ديون الموظفين
  const { data: employeeDebts = [], isLoading: loadingDebts, refetch: refetchDebts } = useQuery<EmployeeDebt[]>({
    queryKey: ["/api/employee-debts"],
  });

  // إنشاء خصم متكامل
  const createDeductionMutation = useMutation({
    mutationFn: async (deductionData: DeductionRequest) => {
      const response = await fetch('/api/deductions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deductionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إنشاء الخصم');
      }
      
      return response.json();
    },
    onSuccess: (result: DeductionResponse) => {
      setLastOperationResult(result);
      toast({
        title: "نجح العملية! 🎉",
        description: result.summary.message,
        variant: "default",
      });
      
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      refetchDebts();
      
      // إعادة تعيين النموذج
      setDeductionAmount("");
      setDeductionDescription("");
      setSelectedEmployee(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في العملية",
        description: error?.message || "فشل في إنشاء الخصم",
        variant: "destructive",
      });
    },
  });

  // دوال إدارة الديون
  const editDebtMutation = useMutation({
    mutationFn: async (debtData: { id: number; amount: string; description: string; dueDate: string; status: string }) => {
      const response = await fetch(`/api/employee-debts/${debtData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debtData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحديث الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الدين بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-debts"] });
      setIsEditDialogOpen(false);
      setSelectedDebtForEdit(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: number) => {
      const response = await fetch(`/api/employee-debts/${debtId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدين بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-debts"] });
      setIsDeleteDialogOpen(false);
      setSelectedDebtForDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظائف التحكم في النوافذ المنبثقة
  const handleEditDebt = (debt: EmployeeDebt) => {
    setSelectedDebtForEdit(debt);
    setIsEditDialogOpen(true);
  };

  const handlePreviewDebt = (debt: EmployeeDebt) => {
    setSelectedDebtForPreview(debt);
    setIsPreviewDialogOpen(true);
  };

  const handleDeleteDebt = (debt: EmployeeDebt) => {
    setSelectedDebtForDelete(debt);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDebt = () => {
    if (selectedDebtForDelete) {
      deleteDebtMutation.mutate(selectedDebtForDelete.id);
    }
  };

  // حساب الإحصائيات
  const selectedEmployeeData = employees.find((emp: Employee) => emp.id === selectedEmployee);
  const selectedEmployeeDebts = employeeDebts.filter((debt: EmployeeDebt) => debt.debtorId === selectedEmployee);
  const totalEmployeeDebt = selectedEmployeeDebts.reduce((sum: number, debt: EmployeeDebt) => 
    sum + parseFloat(debt.remainingAmount), 0
  );

  const totalActiveDebts = employeeDebts.filter((debt: EmployeeDebt) => debt.status === 'active').length;
  const totalPaidDebts = employeeDebts.filter((debt: EmployeeDebt) => debt.status === 'paid').length;
  const totalDebtAmount = employeeDebts.reduce((sum: number, debt: EmployeeDebt) => 
    sum + parseFloat(debt.remainingAmount), 0
  );

  const handleSubmitDeduction = () => {
    if (!selectedEmployee || !deductionAmount || parseFloat(deductionAmount) <= 0) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى اختيار موظف وإدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    const currentSalary = parseFloat(selectedEmployeeData?.salary || "0");
    const deductionAmountNum = parseFloat(deductionAmount);

    if (deductionAmountNum > currentSalary) {
      toast({
        title: "مبلغ خصم مرتفع",
        description: `لا يمكن خصم ${deductionAmountNum} ريال - راتب الموظف ${currentSalary} ريال فقط`,
        variant: "destructive",
      });
      return;
    }

    createDeductionMutation.mutate({
      employeeId: selectedEmployee,
      amount: deductionAmount,
      type: deductionType,
      source: deductionSource, // إضافة مصدر الخصم
      description: deductionDescription || (deductionSource === "salary" ? "خصم من الراتب" : "خصم من الديون"),
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const getDebtProgressPercent = (debt: EmployeeDebt) => {
    const totalAmount = parseFloat(debt.amount);
    const remainingAmount = parseFloat(debt.remainingAmount);
    return Math.round(((totalAmount - remainingAmount) / totalAmount) * 100);
  };

  if (loadingEmployees || loadingDebts) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">النظام المتكامل للراتب والديون</h1>
          <p className="text-gray-600">خصم تلقائي من الراتب مع سداد الديون</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Calculator className="h-8 w-8 text-blue-600" />
          <PiggyBank className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الديون النشطة</p>
                <p className="text-2xl font-bold text-orange-600">{totalActiveDebts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الديون المسددة</p>
                <p className="text-2xl font-bold text-green-600">{totalPaidDebts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebtAmount)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deduction" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deduction">إنشاء خصم</TabsTrigger>
          <TabsTrigger value="result">نتائج العملية</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="history">سجل العمليات</TabsTrigger>
        </TabsList>

        {/* تبويب إنشاء الخصم */}
        <TabsContent value="deduction" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نموذج الخصم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <MinusCircle className="h-5 w-5 text-red-500" />
                  <span>إنشاء خصم جديد</span>
                </CardTitle>
                <CardDescription>
                  خصم تلقائي من الراتب مع سداد الديون المستحقة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">اختيار الموظف</Label>
                  <Select value={selectedEmployee?.toString() || ""} onValueChange={(value) => setSelectedEmployee(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر موظف..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee: Employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} - {employee.position} - راتب: {formatCurrency(employee.salary)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">مبلغ الخصم (ريال)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="أدخل مبلغ الخصم"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                  />
                  {selectedEmployeeData && deductionAmount && (
                    <p className="text-sm text-gray-600">
                      الراتب بعد الخصم: {formatCurrency(parseFloat(selectedEmployeeData.salary) - parseFloat(deductionAmount || "0"))}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">مصدر الخصم</Label>
                  <Select value={deductionSource} onValueChange={setDeductionSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">خصم من الراتب</SelectItem>
                      <SelectItem value="debt">خصم من الديون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع الخصم</Label>
                  <Select value={deductionType} onValueChange={setDeductionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary_deduction">خصم من الراتب</SelectItem>
                      <SelectItem value="debt_payment">سداد ديون</SelectItem>
                      <SelectItem value="loan_installment">قسط قرض</SelectItem>
                      <SelectItem value="advance_deduction">خصم سلفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الخصم</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف الخصم..."
                    value={deductionDescription}
                    onChange={(e) => setDeductionDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={!selectedEmployee || !deductionAmount || createDeductionMutation.isPending}
                    >
                      {createDeductionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <Receipt className="h-4 w-4 mr-2" />
                          تنفيذ الخصم
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد عملية الخصم</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من خصم {formatCurrency(deductionAmount || "0")} من راتب {selectedEmployeeData?.name}؟
                        <br />
                        سيتم سداد الديون المستحقة تلقائياً.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitDeduction}>
                        تأكيد الخصم
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* معلومات الموظف المختار */}
            {selectedEmployeeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>معلومات الموظف</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-semibold">{selectedEmployeeData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المنصب:</span>
                      <span>{selectedEmployeeData.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القسم:</span>
                      <span>{selectedEmployeeData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الراتب الحالي:</span>
                      <span className="font-bold text-green-600">{formatCurrency(selectedEmployeeData.salary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الديون:</span>
                      <span className="font-bold text-red-600">{formatCurrency(totalEmployeeDebt)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* ديون الموظف */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">ديون الموظف:</h4>
                    {selectedEmployeeDebts.length > 0 ? (
                      selectedEmployeeDebts.map((debt: EmployeeDebt) => (
                        <Card key={debt.id} className="border-l-4 border-l-orange-400">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{debt.description}</p>
                                <p className="text-sm text-gray-600">
                                  المتبقي: {formatCurrency(debt.remainingAmount)} من {formatCurrency(debt.amount)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                                  {debt.status === 'paid' ? 'مسدد' : 'نشط'}
                                </Badge>
                                
                                {/* أزرار العمليات */}
                                <div className="flex space-x-1 space-x-reverse">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreviewDebt(debt)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditDebt(debt)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteDebt(debt)}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Progress value={getDebtProgressPercent(debt)} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              تم سداد {getDebtProgressPercent(debt)}%
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          لا توجد ديون مستحقة على هذا الموظف
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* تبويب نتائج العملية */}
        <TabsContent value="result">
          {lastOperationResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>نتائج العملية الأخيرة</span>
                </CardTitle>
                <CardDescription>
                  تفاصيل عملية الخصم وسداد الديون
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ملخص العملية */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {lastOperationResult.summary.message}
                  </AlertDescription>
                </Alert>

                {/* تحديث الراتب */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                      <Banknote className="h-5 w-5 text-blue-600" />
                      <span>تحديث الراتب</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">الراتب السابق</p>
                        <p className="text-xl font-bold text-gray-800">
                          {formatCurrency(lastOperationResult.salaryUpdate.previousSalary)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">مبلغ الخصم</p>
                        <p className="text-xl font-bold text-red-600">
                          -{formatCurrency(lastOperationResult.salaryUpdate.deductedAmount)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">الراتب الجديد</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(lastOperationResult.salaryUpdate.newSalary)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* تحديثات الديون */}
                {lastOperationResult.debtUpdates.length > 0 && (
                  <Card className="border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        <span>تحديثات الديون</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lastOperationResult.debtUpdates.map((debtUpdate, index) => (
                          <Card key={index} className="border-l-4 border-l-orange-400">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{debtUpdate.debtDescription}</p>
                                  <p className="text-sm text-gray-600">دين رقم #{debtUpdate.debtId}</p>
                                </div>
                                <Badge variant={debtUpdate.newBalance === 0 ? 'default' : 'secondary'}>
                                  {debtUpdate.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-600">المبلغ الأصلي:</p>
                                  <p className="font-semibold">{formatCurrency(debtUpdate.originalAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">المبلغ المسدد:</p>
                                  <p className="font-semibold text-green-600">{formatCurrency(debtUpdate.paidAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">المتبقي:</p>
                                  <p className="font-semibold text-red-600">{formatCurrency(debtUpdate.newBalance)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد عمليات سابقة لعرضها</p>
                <p className="text-sm text-gray-500">قم بإنشاء خصم جديد لعرض النتائج</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* تبويب النظرة العامة */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* قائمة جميع الموظفين */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة الموظفين والرواتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.map((employee: Employee) => {
                    const empDebts = employeeDebts.filter((debt: EmployeeDebt) => debt.debtorId === employee.id);
                    const totalDebt = empDebts.reduce((sum: number, debt: EmployeeDebt) => 
                      sum + parseFloat(debt.remainingAmount), 0
                    );
                    
                    return (
                      <Card key={employee.id} className="border-l-4 border-l-blue-400">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.position} - {employee.department}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{formatCurrency(employee.salary)}</p>
                              {totalDebt > 0 && (
                                <p className="text-sm text-red-600">ديون: {formatCurrency(totalDebt)}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* جدول الديون مع أزرار الإجراءات */}
            <Card>
              <CardHeader>
                <CardTitle>جدول ديون الموظفين</CardTitle>
                <CardDescription>جميع ديون الموظفين المحدثة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-right">الموظف</th>
                        <th className="border border-gray-300 p-3 text-right">الوصف</th>
                        <th className="border border-gray-300 p-3 text-right">النوع</th>
                        <th className="border border-gray-300 p-3 text-right">المبلغ الأصلي</th>
                        <th className="border border-gray-300 p-3 text-right">المبلغ المتبقي</th>
                        <th className="border border-gray-300 p-3 text-right">تاريخ الاستحقاق</th>
                        <th className="border border-gray-300 p-3 text-right">الحالة</th>
                        <th className="border border-gray-300 p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeDebts.length > 0 ? employeeDebts.map((debt: EmployeeDebt) => (
                        <tr key={debt.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{debt.employeeName}</td>
                          <td className="border border-gray-300 p-3">{debt.description}</td>
                          <td className="border border-gray-300 p-3">
                            <Badge variant={debt.debtType === 'salary_advance' ? 'default' : 'secondary'}>
                              {debt.debtType === 'salary_advance' ? 'سلفة' : 'قرض'}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 p-3 font-semibold text-red-600">
                            {formatCurrency(debt.amount)}
                          </td>
                          <td className="border border-gray-300 p-3 font-semibold text-orange-600">
                            {formatCurrency(debt.remainingAmount)}
                          </td>
                          <td className="border border-gray-300 p-3">{debt.dueDate}</td>
                          <td className="border border-gray-300 p-3">
                            <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                              {debt.status === 'paid' ? 'مسدد' : 'نشط'}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDebtForPreview(debt);
                                  setIsPreviewDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="معاينة"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDebtForEdit(debt);
                                  setIsEditDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="تعديل"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDebtForDelete(debt);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="border border-gray-300 p-8 text-center text-gray-500">
                            لا توجد ديون محفوظة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب سجل العمليات */}
        <TabsContent value="history" className="space-y-6">
          <OperationHistoryTab />
        </TabsContent>
      </Tabs>

      {/* نوافذ إدارة الديون */}
      {/* نافذة معاينة الدين */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              معاينة الدين
            </DialogTitle>
          </DialogHeader>
          {selectedDebtForPreview && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">الوصف:</span>
                  <span className="font-semibold">{selectedDebtForPreview.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ الكلي:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(selectedDebtForPreview.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المتبقي:</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(selectedDebtForPreview.remainingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الاستحقاق:</span>
                  <span>{selectedDebtForPreview.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <Badge variant={selectedDebtForPreview.status === 'paid' ? 'default' : 'secondary'}>
                    {selectedDebtForPreview.status === 'paid' ? 'مسدد' : 'نشط'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">التقدم في السداد:</h4>
                <Progress value={getDebtProgressPercent(selectedDebtForPreview)} className="h-3" />
                <p className="text-sm text-gray-600 text-center">
                  تم سداد {getDebtProgressPercent(selectedDebtForPreview)}%
                </p>
              </div>

              {selectedDebtForPreview.debtItems && selectedDebtForPreview.debtItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">تفاصيل الدين:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedDebtForPreview.debtItems.map((item: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm">
                        <div className="flex justify-between">
                          <span>{item.description}</span>
                          <span className="font-semibold">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل الدين */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-green-500" />
              تعديل الدين
            </DialogTitle>
          </DialogHeader>
          {selectedDebtForEdit && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              editDebtMutation.mutate({
                id: selectedDebtForEdit.id,
                amount: formData.get('amount') as string,
                description: formData.get('description') as string,
                dueDate: formData.get('dueDate') as string,
                status: formData.get('status') as string,
              });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">وصف الدين</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={selectedDebtForEdit.description}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ الكلي</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={selectedDebtForEdit.amount}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={selectedDebtForEdit.dueDate}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select name="status" defaultValue={selectedDebtForEdit.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="paid">مسدد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={editDebtMutation.isPending}>
                  {editDebtMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              تأكيد حذف الدين
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدين؟ هذا الإجراء لا يمكن التراجع عنه.
              {selectedDebtForDelete && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-900">{selectedDebtForDelete.description}</p>
                  <p className="text-red-700">المبلغ: {formatCurrency(selectedDebtForDelete.amount)}</p>
                  <p className="text-red-700">المتبقي: {formatCurrency(selectedDebtForDelete.remainingAmount)}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDebt}
              disabled={deleteDebtMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDebtMutation.isPending ? 'جاري الحذف...' : 'حذف الدين'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// مكون سجل العمليات
const OperationHistoryTab: React.FC = () => {
  const { data: operationResults = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/operation-results'],
    retry: false
  });

  console.log('Operation results:', operationResults);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
        <p>جاري تحميل سجل العمليات...</p>
      </div>
    );
  }

  if (!operationResults || (operationResults as any[]).length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد عمليات محفوظة بعد</p>
          <p className="text-sm text-gray-500 mt-2">ستظهر هنا جميع عمليات الخصم المنجزة</p>
        </CardContent>
      </Card>
    );
  }

  // وظيفة طباعة فاتورة الموظف
  const printEmployeeInvoice = (operationResult: any) => {
    const invoiceContent = generateInvoiceHTML(operationResult);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // إنشاء محتوى HTML للفاتورة
  const generateInvoiceHTML = (result: any) => {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة خصم الموظف - ${result.employeeName}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 15px; 
          background: white; 
          color: #000;
          direction: rtl;
        }
        .invoice-container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          border: 1px solid #000; 
        }
        .header { 
          text-align: center; 
          padding: 15px; 
          border-bottom: 1px solid #000; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 18px; 
          font-weight: bold;
        }
        .header p { 
          margin: 5px 0 0 0; 
          font-size: 14px;
        }
        .content { 
          padding: 15px; 
        }
        .employee-info { 
          padding: 10px; 
          border: 1px solid #000; 
          margin-bottom: 10px; 
        }
        .operation-details { 
          padding: 10px; 
          border: 1px solid #000; 
          margin-bottom: 10px; 
        }
        .salary-section { 
          padding: 10px; 
          border: 1px solid #000; 
          margin-bottom: 10px; 
        }
        .debts-section { 
          padding: 10px; 
          border: 1px solid #000; 
          margin-bottom: 10px; 
        }
        .summary-section { 
          padding: 10px; 
          border: 1px solid #000; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 8px; 
          margin: 8px 0; 
        }
        .info-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 5px 8px; 
          border: 1px solid #000;
          font-size: 13px;
        }
        .info-label { 
          font-weight: bold; 
        }
        .info-value { 
          font-weight: bold; 
        }
        .debt-item { 
          padding: 8px; 
          border: 1px solid #000; 
          margin-bottom: 8px;
          font-size: 13px;
        }
        .debt-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 5px;
        }
        .debt-title { 
          font-weight: bold; 
        }
        .debt-status { 
          border: 1px solid #000;
          padding: 2px 6px; 
          font-size: 11px;
        }
        .debt-amounts { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr; 
          gap: 5px; 
          text-align: center;
        }
        .amount-box { 
          padding: 5px; 
          border: 1px solid #000;
          font-size: 12px;
        }
        .amount-paid { 
          font-weight: bold; 
        }
        .amount-original { 
          font-weight: bold; 
        }
        .amount-remaining { 
          font-weight: bold; 
        }
        .footer { 
          text-align: center; 
          padding: 10px; 
          border-top: 1px solid #000; 
          font-size: 12px;
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 8px; 
          border-bottom: 1px solid #000;
          padding-bottom: 3px;
        }
        @media print {
          body { margin: 0; padding: 15px; font-size: 12px; }
          .invoice-container { border: 1px solid #000; }
          .header { page-break-inside: avoid; }
          .info-item { font-size: 11px; padding: 3px 6px; }
          .debt-item { font-size: 11px; padding: 6px; }
          .amount-box { font-size: 10px; }
          .section-title { font-size: 14px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>فاتورة خصم الموظف</h1>
          <p>نظام إدارة الرواتب والديون</p>
        </div>
        
        <div class="content">
          <!-- معلومات الموظف -->
          <div class="employee-info">
            <div class="section-title">معلومات الموظف</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">اسم الموظف:</span>
                <span class="info-value">${result.employeeName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">رقم العملية:</span>
                <span class="info-value">#${result.operationId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">نوع العملية:</span>
                <span class="info-value">${result.operationType === 'debt_payment' ? 'خصم من الديون' : 'خصم من الراتب'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاريخ العملية:</span>
                <span class="info-value">${new Date(result.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          <!-- تفاصيل العملية -->
          <div class="operation-details">
            <div class="section-title">تفاصيل العملية</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">إجمالي المبلغ المخصوم:</span>
                <span class="info-value">${formatCurrency(result.totalAmount)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">إجمالي الديون المسددة:</span>
                <span class="info-value">${formatCurrency(result.summary.totalDebtsPaid)}</span>
              </div>
            </div>
          </div>

          ${result.summary.salaryUpdate ? `
          <!-- معلومات الراتب -->
          <div class="salary-section">
            <div class="section-title">تحديث الراتب</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">الراتب السابق:</span>
                <span class="info-value">${formatCurrency(result.summary.salaryUpdate.previousSalary)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المبلغ المخصوم:</span>
                <span class="info-value">${formatCurrency(result.summary.salaryUpdate.deductedAmount)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الراتب الحالي:</span>
                <span class="info-value">${formatCurrency(result.summary.salaryUpdate.newSalary)}</span>
              </div>
            </div>
          </div>
          ` : ''}

          ${result.summary.debtUpdates && result.summary.debtUpdates.length > 0 ? `
          <!-- الديون المسددة -->
          <div class="debts-section">
            <div class="section-title">الديون المسددة (${result.summary.debtUpdates.length})</div>
            ${result.summary.debtUpdates.map((debt: any) => `
              <div class="debt-item">
                <div class="debt-header">
                  <span class="debt-title">${debt.debtDescription}</span>
                  <span class="debt-status">${debt.status}</span>
                </div>
                <div class="debt-amounts">
                  <div class="amount-box amount-paid">
                    <div>المبلغ المسدد</div>
                    <div><strong>${formatCurrency(debt.paidAmount)}</strong></div>
                  </div>
                  <div class="amount-box amount-original">
                    <div>المبلغ الأصلي</div>
                    <div><strong>${formatCurrency(debt.originalAmount)}</strong></div>
                  </div>
                  <div class="amount-box amount-remaining">
                    <div>المبلغ المتبقي</div>
                    <div><strong>${formatCurrency(debt.newBalance)}</strong></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- ملخص العملية -->
          <div class="summary-section">
            <div class="section-title">ملخص العملية</div>
            <div class="info-item">
              <span class="info-label">وصف العملية:</span>
              <span class="info-value">${result.summary.message}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذه الفاتورة في ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
          <p> © 2025 - نظام إدارة الأعمال المتكامل</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  // طباعة تقرير الديون
  const printDebtsReport = async () => {
    try {
      // جلب البيانات مباشرة من API
      const response = await fetch('/api/employee-debts');
      const employeeDebts = response.ok ? await response.json() : [];
      const debtsData = Array.isArray(employeeDebts) ? employeeDebts : [];
    const totalDebts = debtsData.reduce((sum: number, debt: any) => sum + parseFloat(debt.amount || 0), 0);
    const totalRemaining = debtsData.reduce((sum: number, debt: any) => sum + parseFloat(debt.remainingAmount || 0), 0);
    const totalPaid = totalDebts - totalRemaining;

    const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير ديون الموظفين</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; }
          .header { border: 2px solid #000; padding: 15px; text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .report-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .report-date { font-size: 12px; }
          
          .summary { border: 1px solid #000; margin-bottom: 20px; }
          .summary-header { background: #f0f0f0; padding: 8px; border-bottom: 1px solid #000; text-align: center; font-weight: bold; }
          .summary-content { padding: 10px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          
          .debts-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .debts-table th, .debts-table td { border: 1px solid #000; padding: 8px; text-align: right; }
          .debts-table th { background: #f0f0f0; font-weight: bold; }
          .amount { font-weight: bold; }
          
          .footer { text-align: center; font-size: 10px; margin-top: 30px; }
        }
        @page { margin: 15mm; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">مؤسسة  التجارية</div>
        <div class="report-title">تقرير ديون الموظفين</div>
        <div class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('en-GB')}</div>
      </div>

      <div class="summary">
        <div class="summary-header">ملخص الديون</div>
        <div class="summary-content">
          <div class="summary-row">
            <span>إجمالي الديون:</span>
            <span class="amount">${formatCurrency(totalDebts)}</span>
          </div>
          <div class="summary-row">
            <span>المبلغ المسدد:</span>
            <span class="amount">${formatCurrency(totalPaid)}</span>
          </div>
          <div class="summary-row">
            <span>المبلغ المتبقي:</span>
            <span class="amount">${formatCurrency(totalRemaining)}</span>
          </div>
        </div>
      </div>

      <table class="debts-table">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>الوصف</th>
            <th>المبلغ الأصلي</th>
            <th>المبلغ المتبقي</th>
            <th>تاريخ الاستحقاق</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${debtsData.map((debt: any) => `
            <tr>
              <td>${debt.debtorName || debt.employeeName || 'غير محدد'}</td>
              <td>${debt.description || 'غير محدد'}</td>
              <td class="amount">${formatCurrency(parseFloat(debt.amount || 0))}</td>
              <td class="amount">${formatCurrency(parseFloat(debt.remainingAmount || 0))}</td>
              <td>${new Date(debt.dueDate).toLocaleDateString('en-GB') || 'غير محدد'}</td>
              <td>${debt.status === 'paid' ? 'مسدد' : 'نشط'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        تم إنشاء هذا التقرير بواسطة نظام  | ${new Date().toLocaleString('en-US')}
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
    } catch (error) {
      console.error('Error generating debts report:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">سجل العمليات المحفوظة ({(operationResults as any[]).length})</h3>
        <div className="flex gap-2">
          <Button 
            onClick={printDebtsReport} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            طباعة تقرير الديون
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            تحديث السجل
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {(operationResults as any[]).map((result: any) => (
          <Card key={result.id} className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {result.operationType === 'debt_payment' ? (
                      <CreditCard className="h-4 w-4 text-orange-500" />
                    ) : (
                      <Banknote className="h-4 w-4 text-green-500" />
                    )}
                    {result.employeeName}
                  </CardTitle>
                  <CardDescription>
                    {result.operationType === 'debt_payment' ? 'خصم من الديون' : 'خصم من الراتب'} • 
                    العملية #{result.operationId}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      onClick={() => printEmployeeInvoice(result)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Badge variant={result.operationType === 'debt_payment' ? 'secondary' : 'default'}>
                      {formatCurrency(result.totalAmount)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(result.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* ملخص الراتب */}
                {result.summary.salaryUpdate && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-green-600" />
                      تحديث الراتب
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">الراتب السابق:</p>
                        <p className="font-semibold">{formatCurrency(result.summary.salaryUpdate.previousSalary)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">المبلغ المخصوم:</p>
                        <p className="font-semibold text-red-600">{formatCurrency(result.summary.salaryUpdate.deductedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">الراتب الحالي:</p>
                        <p className="font-semibold text-green-600">{formatCurrency(result.summary.salaryUpdate.newSalary)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* تحديثات الديون */}
                {result.summary.debtUpdates && result.summary.debtUpdates.length > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-orange-600" />
                      الديون المسددة ({result.summary.debtUpdates.length})
                    </h4>
                    <div className="space-y-2">
                      {result.summary.debtUpdates.map((debtUpdate: any, index: number) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{debtUpdate.debtDescription}</p>
                            <Badge variant={debtUpdate.newBalance === 0 ? 'default' : 'secondary'} className="text-xs">
                              {debtUpdate.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-gray-600">مسدد:</p>
                              <p className="font-semibold text-green-600">{formatCurrency(debtUpdate.paidAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">الأصلي:</p>
                              <p className="font-semibold">{formatCurrency(debtUpdate.originalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">المتبقي:</p>
                              <p className="font-semibold text-red-600">{formatCurrency(debtUpdate.newBalance)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ملخص العملية */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    ملخص العملية
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">إجمالي المخصوم:</p>
                      <p className="font-semibold text-red-600">{formatCurrency(result.summary.totalDeducted)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">إجمالي الديون المسددة:</p>
                      <p className="font-semibold text-green-600">{formatCurrency(result.summary.totalDebtsPaid)}</p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-sm font-medium text-blue-700">{result.summary.message}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};