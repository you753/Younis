import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Users, Calendar, DollarSign, FileText, Trash2, Edit, Eye, AlertTriangle } from "lucide-react";
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
  type: string;
  notes: string;
  createdAt: string;
}

export default function NewEmployeeDebts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: 'advance',
    items: [{ amount: '', description: '' }],
    dueDate: '',
    notes: ''
  });

  // States للنوافذ المنبثقة
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewDebt, setPreviewDebt] = useState<EmployeeDebt | null>(null);
  const [editingDebt, setEditingDebt] = useState<EmployeeDebt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<EmployeeDebt | null>(null);
  
  // بيانات التعديل
  const [editFormData, setEditFormData] = useState({
    type: '',
    amount: '',
    remainingAmount: '',
    status: '',
    description: '',
    dueDate: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // جلب الموظفين
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  // جلب ديون الموظفين
  const { data: employeeDebts = [], isLoading: loadingDebts } = useQuery({
    queryKey: ["/api/employee-debts"],
  });

  // دوال التعامل مع النوافذ المنبثقة
  const handlePreview = (debt: EmployeeDebt) => {
    setPreviewDebt(debt);
    setIsPreviewDialogOpen(true);
  };

  const handleEdit = (debt: EmployeeDebt) => {
    setEditingDebt(debt);
    setEditFormData({
      type: debt.type,
      amount: debt.amount,
      remainingAmount: debt.remainingAmount,
      status: debt.status,
      description: debt.description,
      dueDate: debt.dueDate,
      notes: debt.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (debt: EmployeeDebt) => {
    setDebtToDelete(debt);
    setIsDeleteDialogOpen(true);
  };

  // إضافة دين جديد
  const createDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const response = await fetch('/api/employee-debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debtData),
      });
      
      if (!response.ok) {
        throw new Error('فشل في إضافة الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة دين الموظف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-debts"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "فشل في إضافة الدين",
        variant: "destructive",
      });
    },
  });

  // حذف دين
  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: number) => {
      const response = await fetch(`/api/employee-debts/${debtId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف دين الموظف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-debts"] });
      setIsDeleteDialogOpen(false);
      setDebtToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "فشل في حذف الدين",
        variant: "destructive",
      });
    },
  });

  // تعديل دين
  const updateDebtMutation = useMutation({
    mutationFn: async (data: { id: number; updateData: any }) => {
      const response = await fetch(`/api/employee-debts/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.updateData),
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحديث الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث دين الموظف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-debts"] });
      setIsEditDialogOpen(false);
      setEditingDebt(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "فشل في تحديث الدين",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedEmployeeId(null);
    setFormData({
      type: 'advance',
      items: [{ amount: '', description: '' }],
      dueDate: '',
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!selectedEmployeeId || formData.items.length === 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار موظف وإضافة عنصر واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    // التحقق من صحة العناصر
    const invalidItems = formData.items.filter(item => !item.amount || !item.description);
    if (invalidItems.length > 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء المبلغ والوصف لجميع العناصر",
        variant: "destructive",
      });
      return;
    }

    const selectedEmployee = employees.find((emp: Employee) => emp.id === selectedEmployeeId);
    
    // حساب المجموع الكلي
    const totalAmount = formData.items.reduce((total, item) => total + parseFloat(item.amount), 0);
    
    // إنشاء وصف مجمع للعناصر
    const combinedDescription = formData.items.map((item, index) => 
      `${index + 1}. ${item.description}: ${parseFloat(item.amount).toLocaleString('en-US')} ر.س`
    ).join('\n');
    
    const debtData = {
      employeeId: selectedEmployeeId,
      type: formData.type,
      amount: totalAmount.toString(),
      description: combinedDescription,
      dueDate: formData.dueDate,
      notes: formData.notes
    };

    createDebtMutation.mutate(debtData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // إحصائيات
  const totalDebts = employeeDebts.length;
  const activeDebts = employeeDebts.filter((debt: EmployeeDebt) => debt.status === 'active').length;
  const totalAmount = employeeDebts.reduce((sum: number, debt: EmployeeDebt) => 
    sum + parseFloat(debt.remainingAmount || '0'), 0
  );

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
      {/* العنوان والإحصائيات */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ديون الموظفين</h1>
          <p className="text-gray-600 mt-1">إدارة ديون الموظفين والسلف</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة دين جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة دين جديد للموظف</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الدين أو السلفة للموظف
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* اختيار الموظف */}
              <div className="space-y-2">
                <Label>الموظف</Label>
                <Select value={selectedEmployeeId?.toString() || ""} onValueChange={(value) => setSelectedEmployeeId(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: Employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {employee.name?.charAt(0) || 'م'}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.position} - {formatCurrency(employee.salary)}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* نوع الدين */}
              <div className="space-y-2">
                <Label>نوع الدين</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={formData.type === 'advance' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'advance'})}
                    className="justify-start"
                  >
                    سلفة
                  </Button>
                  <Button
                    variant={formData.type === 'loan' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'loan'})}
                    className="justify-start"
                  >
                    قرض
                  </Button>
                </div>
              </div>

              {/* عناصر الدين */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>تفاصيل الدين</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      items: [...formData.items, { amount: '', description: '' }]
                    })}
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة مبلغ
                  </Button>
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          العنصر رقم {index + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = formData.items.filter((_, i) => i !== index);
                              setFormData({...formData, items: newItems});
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-600">المبلغ (ريال)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="أدخل المبلغ"
                            value={item.amount}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].amount = e.target.value;
                              setFormData({...formData, items: newItems});
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">الوصف</Label>
                          <Input
                            placeholder="وصف هذا المبلغ"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].description = e.target.value;
                              setFormData({...formData, items: newItems});
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* عرض المجموع */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">إجمالي المبلغ:</span>
                    <span className="font-bold text-blue-900 text-lg">
                      {formData.items.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0).toLocaleString('en-US')} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* تاريخ الاستحقاق */}
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              {/* ملاحظات */}
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  placeholder="ملاحظات إضافية..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createDebtMutation.isPending}
              >
                {createDebtMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-blue-600">{totalDebts}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الديون النشطة</p>
                <p className="text-2xl font-bold text-orange-600">{activeDebts}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الديون */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة ديون الموظفين</CardTitle>
          <CardDescription>
            جميع ديون وسلف الموظفين المسجلة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المبلغ الأصلي</TableHead>
                  <TableHead>المبلغ المتبقي</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeDebts.length > 0 ? (
                  employeeDebts.map((debt: EmployeeDebt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.debtorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {debt.type === 'advance' ? 'سلفة' : 'قرض'}
                        </Badge>
                      </TableCell>
                      <TableCell>{debt.description}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(debt.amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(debt.remainingAmount)}
                      </TableCell>
                      <TableCell>{formatDate(debt.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={debt.status === 'active' ? 'destructive' : 'default'}>
                          {debt.status === 'active' ? 'نشط' : 'مسدد'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(debt.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(debt)}
                            className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(debt)}
                            className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(debt)}
                            className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      لا توجد ديون مسجلة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نافذة المعاينة */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>معاينة دين الموظف</DialogTitle>
          </DialogHeader>
          {previewDebt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">اسم الموظف</label>
                  <p className="font-semibold">{previewDebt.debtorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">نوع الدين</label>
                  <Badge variant="outline">
                    {previewDebt.type === 'advance' ? 'سلفة' : 'قرض'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">المبلغ الإجمالي</label>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(previewDebt.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">المبلغ المتبقي</label>
                  <p className="font-semibold text-red-600">
                    {formatCurrency(previewDebt.remainingAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">تاريخ الاستحقاق</label>
                  <p className="font-semibold">{formatDate(previewDebt.dueDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">الحالة</label>
                  <Badge variant={previewDebt.status === 'active' ? 'destructive' : 'default'}>
                    {previewDebt.status === 'active' ? 'نشط' : 'مسدد'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">الوصف</label>
                <p className="font-semibold bg-gray-50 p-2 rounded">{previewDebt.description}</p>
              </div>
              {previewDebt.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">ملاحظات</label>
                  <p className="font-semibold bg-gray-50 p-2 rounded">{previewDebt.notes}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsPreviewDialogOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل دين الموظف</DialogTitle>
            <DialogDescription>
              تعديل معلومات دين الموظف
            </DialogDescription>
          </DialogHeader>
          {editingDebt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">اسم الموظف</label>
                  <Input 
                    value={editingDebt.debtorName} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">نوع الدين</label>
                  <Select 
                    value={editFormData.type}
                    onValueChange={(value) => setEditFormData({...editFormData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advance">سلفة</SelectItem>
                      <SelectItem value="loan">قرض</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">المبلغ الإجمالي</label>
                  <Input 
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">المبلغ المتبقي</label>
                  <Input 
                    value={editFormData.remainingAmount}
                    onChange={(e) => setEditFormData({...editFormData, remainingAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ الاستحقاق</label>
                  <Input 
                    type="date" 
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <Select 
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="paid">مسدد</SelectItem>
                      <SelectItem value="overdue">متأخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Textarea 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ملاحظات</label>
                <Textarea 
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                  إلغاء
                </Button>
                <Button 
                  onClick={() => {
                    updateDebtMutation.mutate({
                      id: editingDebt.id,
                      updateData: editFormData
                    });
                  }}
                  disabled={updateDebtMutation.isPending}
                >
                  {updateDebtMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الدين؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          {debtToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">سيتم حذف الدين التالي:</p>
                    <p className="text-red-700">
                      <span className="font-medium">{debtToDelete.debtorName}</span> - 
                      <span className="font-medium">{formatCurrency(debtToDelete.amount)}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
                  إلغاء
                </Button>
                <Button 
                  onClick={() => {
                    deleteDebtMutation.mutate(debtToDelete.id);
                  }}
                  variant="destructive"
                  disabled={deleteDebtMutation.isPending}
                >
                  {deleteDebtMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}