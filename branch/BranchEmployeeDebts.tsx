import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, CreditCard, Plus, X, Trash2, Printer } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

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
  totalAmount?: string;
  amount: string;
  remainingAmount: string;
  paidAmount?: string;
  status: string;
  description: string;
  dueDate: string | null;
  employeeName: string;
}

interface BranchEmployeeDebtsProps {
  branchId: number;
}

export default function BranchEmployeeDebts({ branchId }: BranchEmployeeDebtsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [debtType, setDebtType] = useState<string>("قرض");
  const [debtItems, setDebtItems] = useState<Array<{
    id: number;
    amount: string;
    description: string;
  }>>([{ id: 1, amount: "", description: "" }]);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const queryClient = useQueryClient();

  // جلب بيانات الفرع
  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
  });

  // جلب بيانات الموظفين
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: [`/api/branches/${branchId}/employees`],
  });

  // جلب بيانات ديون الموظفين
  const { data: employeeDebts = [] } = useQuery<EmployeeDebt[]>({
    queryKey: [`/api/branches/${branchId}/employee-debts`],
  });

  // دالة طباعة فاتورة الدين
  const handlePrintDebt = (debt: EmployeeDebt) => {
    const originalAmount = parseFloat(debt.amount || '0');
    const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
    let formattedDate = 'غير محدد';
    if (debt.dueDate) {
      try {
        const date = new Date(debt.dueDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
      } catch (e) {
        formattedDate = 'غير محدد';
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة دين - ${debt.employeeName || debt.debtorName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            direction: rtl;
            padding: 20mm;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header h2 {
            font-size: 18px;
            margin-bottom: 10px;
          }
          .info-section {
            margin: 20px 0;
            border: 2px solid #000;
            padding: 15px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px;
            border-bottom: 1px solid #ccc;
          }
          .info-label {
            font-weight: bold;
            width: 40%;
          }
          .info-value {
            width: 60%;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 12px;
            text-align: center;
          }
          th {
            background: #000;
            color: white;
            font-weight: bold;
          }
          .total-row {
            background: #f0f0f0;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body { padding: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${branch?.name || 'الفرع'}</h1>
          <h2>فاتورة دين موظف</h2>
          <p>التاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div class="info-section">
          <h3 style="margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 10px;">معلومات الموظف</h3>
          <div class="info-row">
            <span class="info-label">اسم الموظف:</span>
            <span class="info-value">${debt.employeeName || debt.debtorName || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ الاستحقاق:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الحالة:</span>
            <span class="info-value">${debt.status === 'active' ? 'نشط' : debt.status === 'completed' ? 'مكتمل' : debt.status}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>البيان</th>
              <th>المبلغ (ريال)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>المبلغ الأصلي</td>
              <td>${originalAmount.toLocaleString('en-US')}</td>
            </tr>
            <tr>
              <td>المبلغ المتبقي</td>
              <td style="color: #000; font-weight: bold;">${remaining.toLocaleString('en-US')}</td>
            </tr>
            <tr class="total-row">
              <td>إجمالي الدين المستحق</td>
              <td>${remaining.toLocaleString('en-US')} ر.س</td>
            </tr>
          </tbody>
        </table>

        ${debt.description ? `
        <div class="info-section">
          <h3 style="margin-bottom: 10px; font-size: 16px;">الوصف</h3>
          <p style="line-height: 1.6;">${debt.description}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>تم الطباعة بتاريخ: ${new Date().toLocaleString('en-US')}</p>
          <p style="margin-top: 10px;">هذه الفاتورة صادرة من نظام إدارة الفروع - ${branch?.name || ''}</p>
        </div>

        <button onclick="window.print()" class="no-print" style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          padding: 15px 30px;
          background: #000;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        ">طباعة</button>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // إنشاء دين جديد
  const createDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const response = await fetch(`/api/branches/${branchId}/employee-debts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debtData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('فشل في إنشاء الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employee-debts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      
      toast({
        title: "تم إنشاء الدين بنجاح",
        description: "تم إضافة الدين الجديد",
      });
    },
    onError: (error: any) => {
      console.error('Error creating debt:', error);
      toast({
        title: "خطأ في إنشاء الدين",
        description: error.message || "فشل في إضافة الدين",
        variant: "destructive",
      });
    },
  });

  // Mutation لحذف الدين
  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: number) => {
      const response = await fetch(`/api/branches/${branchId}/employee-debts/${debtId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف الدين');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/employee-debts`] });
      toast({
        title: "تم حذف الدين بنجاح",
        description: "تم حذف الدين من النظام",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف الدين",
        description: "فشل في حذف الدين",
        variant: "destructive",
      });
    },
  });

  // دالة حذف الدين مع تأكيد
  const handleDeleteDebt = (debt: EmployeeDebt) => {
    if (window.confirm(`هل أنت متأكد من حذف دين ${debt.employeeName} بمبلغ ${debt.remainingAmount} ريال؟`)) {
      deleteDebtMutation.mutate(debt.id);
    }
  };

  // إضافة عنصر دين جديد
  const addDebtItem = () => {
    const newId = Math.max(...debtItems.map(item => item.id), 0) + 1;
    setDebtItems([...debtItems, { id: newId, amount: "", description: "" }]);
  };

  // حذف عنصر دين
  const removeDebtItem = (id: number) => {
    if (debtItems.length > 1) {
      setDebtItems(debtItems.filter(item => item.id !== id));
    }
  };

  // تحديث عنصر دين
  const updateDebtItem = (id: number, field: 'amount' | 'description', value: string) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // حساب إجمالي المبلغ
  const totalAmount = debtItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // معالجة إضافة الديون
  const handleAddDebts = async () => {
    if (!selectedEmployee) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار الموظف",
        variant: "destructive",
      });
      return;
    }

    const validItems = debtItems.filter(item => item.amount && item.description);
    if (validItems.length === 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إضافة دين واحد على الأقل بمبلغ ووصف",
        variant: "destructive",
      });
      return;
    }

    try {
      // إنشاء دين واحد بعدة عناصر
      const debtData = {
        debtorId: parseInt(selectedEmployee),
        debtorType: 'employee',
        debtType: debtType,
        debtItems: validItems.map(item => ({
          reason: item.description,
          amount: parseFloat(item.amount),
          dueDate: dueDate || new Date().toISOString()
        })),
        notes: notes,
        amount: totalAmount,
        remainingAmount: totalAmount
      };

      console.log('Sending debt data:', debtData);
      await createDebtMutation.mutateAsync(debtData);
      
      // إعادة تعيين النموذج
      setSelectedEmployee("");
      setDebtItems([{ id: 1, amount: "", description: "" }]);
      setDueDate("");
      setNotes("");
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error creating debt:', error);
    }
  };



  // حساب الإحصائيات
  const totalDebts = employeeDebts.reduce((sum, debt) => {
    const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
    return sum + remaining;
  }, 0);
  const activeDebts = employeeDebts.filter(debt => debt.status === 'active').length;
  const completedDebts = employeeDebts.filter(debt => debt.status === 'completed').length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة ديون الموظفين - الفرع {branchId}</h1>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة دين جديد للموظفين
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[600px] h-[600px] flex flex-col" dir="rtl">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-xl font-bold text-blue-700">
                  إضافة دين جديد للموظفين
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-1">
                {/* اختيار الموظف */}
                <div className="space-y-2">
                  <Label htmlFor="employee-select" className="text-right text-sm font-medium">
                    اختيار الموظف *
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* نوع الدين */}
                <div className="space-y-2">
                  <Label className="text-right text-sm font-medium">نوع الدين *</Label>
                  <div className="flex gap-2" dir="rtl">
                    <Button
                      type="button"
                      variant={debtType === "قرض" ? "default" : "outline"}
                      onClick={() => setDebtType("قرض")}
                      className={`flex-1 ${debtType === "قرض" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600"}`}
                    >
                      قرض
                    </Button>
                    <Button
                      type="button"
                      variant={debtType === "سلفة" ? "default" : "outline"}
                      onClick={() => setDebtType("سلفة")}
                      className={`flex-1 ${debtType === "سلفة" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600"}`}
                    >
                      سلفة
                    </Button>
                  </div>
                </div>

                {/* عناصر الديون */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700">عناصر الديون</h3>
                    <Button
                      type="button"
                      onClick={addDebtItem}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      إضافة عنصر
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {debtItems.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            العنصر رقم {index + 1}
                          </span>
                          {debtItems.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDebtItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-right text-sm font-medium">
                              المبلغ *
                            </Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.amount}
                              onChange={(e) => updateDebtItem(item.id, 'amount', e.target.value)}
                              className="text-right"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-right text-sm font-medium">
                              وصف المبلغ *
                            </Label>
                            <Input
                              placeholder="وصف الدين"
                              value={item.description}
                              onChange={(e) => updateDebtItem(item.id, 'description', e.target.value)}
                              className="text-right"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* إجمالي المبلغ الكلي */}
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-blue-700">إجمالي المبلغ الكلي:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {totalAmount.toLocaleString('en-US')} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                {/* تاريخ الاستحقاق */}
                <div className="space-y-2">
                  <Label htmlFor="due-date" className="text-right text-sm font-medium">
                    تاريخ الاستحقاق
                  </Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-right"
                  />
                </div>

                {/* الملاحظات */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-right text-sm font-medium">
                    ملاحظات (اختياري)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="أضف ملاحظات إضافية..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-right min-h-[80px]"
                  />
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex-shrink-0 flex gap-3 pt-4 mt-4 border-t bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddDebts}
                  disabled={createDebtMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createDebtMutation.isPending ? "جاري الحفظ..." : "حفظ جميع الديون"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalDebts.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون النشطة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeDebts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون المكتملة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedDebts}</div>
          </CardContent>
        </Card>
      </div>



      {/* جدول الديون */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الديون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-4">الموظف</th>
                  <th className="text-right py-2 px-4">المبلغ الأصلي</th>
                  <th className="text-right py-2 px-4">المبلغ المتبقي</th>
                  <th className="text-right py-2 px-4">الحالة</th>
                  <th className="text-right py-2 px-4">تاريخ الاستحقاق</th>
                  <th className="text-right py-2 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employeeDebts.map((debt) => {
                  // حساب المبالغ بشكل صحيح من الحقول الصحيحة
                  const originalAmount = parseFloat(debt.amount || '0');
                  const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                  
                  // معالجة التاريخ - ميلادي بالأرقام فقط
                  let formattedDate = 'غير محدد';
                  if (debt.dueDate) {
                    try {
                      const date = new Date(debt.dueDate);
                      if (!isNaN(date.getTime())) {
                        formattedDate = date.toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        });
                      }
                    } catch (e) {
                      formattedDate = 'غير محدد';
                    }
                  }

                  return (
                    <tr key={debt.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{debt.employeeName || debt.debtorName || 'غير محدد'}</td>
                      <td className="py-2 px-4 text-blue-600 font-semibold">
                        {originalAmount.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="py-2 px-4 text-red-600 font-bold">
                        {remaining.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={debt.status === 'active' ? 'default' : debt.status === 'completed' ? 'secondary' : 'outline'}>
                          {debt.status === 'active' ? 'نشط' : debt.status === 'completed' ? 'مكتمل' : debt.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-gray-700">{formattedDate}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintDebt(debt)}
                            className="bg-black hover:bg-gray-800 text-white border-black"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDebt(debt)}
                            disabled={deleteDebtMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            title="حذف الدين"
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
          {employeeDebts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد ديون مسجلة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}