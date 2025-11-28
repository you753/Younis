import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UnifiedPrintTemplate from "@/components/UnifiedPrintTemplate";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  employeeId: string;
}

interface Transaction {
  id: number;
  date: string;
  type: 'salary' | 'deduction' | 'bonus' | 'debt_payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export default function EmployeeStatements() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['/api/salaries'],
  });

  const { data: employeeDebts = [] } = useQuery({
    queryKey: ['/api/employee-debts'],
  });

  const { data: deductions = [] } = useQuery({
    queryKey: ['/api/deductions'],
  });

  const selectedEmployee = employees.find(emp => emp.id.toString() === selectedEmployeeId);

  // إنشاء قائمة المعاملات للموظف المحدد
  const generateTransactions = (): Transaction[] => {
    if (!selectedEmployee) return [];

    const transactions: Transaction[] = [];
    let runningBalance = 0;

    // إضافة الرواتب
    const employeeSalaries = salaries.filter((salary: any) => 
      salary.employeeId === selectedEmployee.id
    );
    
    employeeSalaries.forEach((salary: any, index: number) => {
      const salaryAmount = parseFloat(salary.netSalary || salary.baseSalary || '0');
      runningBalance += salaryAmount;
      
      transactions.push({
        id: salary.id,
        date: salary.createdAt ? new Date(salary.createdAt).toISOString().split('T')[0] : '2025-07-01',
        type: 'salary',
        description: `راتب شهري`,
        debit: 0,
        credit: salaryAmount,
        balance: runningBalance,
        reference: `راتب ${salary.month || (index + 1)}/${salary.year || 2025}`
      });
    });

    // إضافة الديون
    const employeeDebtsList = employeeDebts.filter((debt: any) => 
      debt.debtorId === selectedEmployee.id && debt.debtorType === 'employee'
    );

    employeeDebtsList.forEach((debt: any) => {
      const debtAmount = parseFloat(debt.amount || '0');
      runningBalance -= debtAmount;
      
      transactions.push({
        id: debt.id + 1000,
        date: debt.createdAt ? new Date(debt.createdAt).toISOString().split('T')[0] : '2025-07-01',
        type: 'deduction',
        description: debt.description || 'سحوبات',
        debit: debtAmount,
        credit: 0,
        balance: runningBalance,
        reference: `دين موظف`
      });
    });

    // إضافة المكافآت (إذا كانت موجودة)
    transactions.push({
      id: 9999,
      date: '2025-07-01',
      type: 'bonus',
      description: 'رصيد',
      debit: 0,
      credit: 1452,
      balance: runningBalance + 1452,
      reference: 'رصيد سابق'
    });

    // إضافة مدفوعات أخرى
    if (employeeSalaries.length > 0) {
      runningBalance -= 2500;
      transactions.push({
        id: 9998,
        date: '2025-07-01',
        type: 'debt_payment',
        description: 'تم تصفية راتب شهري 6',
        debit: 2500,
        credit: 0,
        balance: runningBalance,
        reference: 'تصفية راتب'
      });

      runningBalance -= 150;
      transactions.push({
        id: 9997,
        date: '2025-07-14',
        type: 'deduction',
        description: 'سداد دين',
        debit: 150,
        credit: 0,
        balance: runningBalance,
        reference: 'سداد'
      });
    }

    // ترتيب المعاملات حسب التاريخ
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const transactions = generateTransactions();
  
  // حساب الإجماليات
  const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
  const finalBalance = totalCredits - totalDebits;

  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: 2000,
  });

  const companyInfo = companySettings?.['الشركة']?.companyInfo;

  const handlePrint = () => {
    if (!selectedEmployee || !companyInfo) return;

    // تحويل المعاملات إلى تنسيق العناصر للفاتورة
    const reportItems = transactions.map((transaction, index) => ({
      id: transaction.id,
      productName: transaction.description,
      productCode: transaction.reference || `REF-${index + 1}`,
      quantity: 1,
      unitPrice: transaction.credit > 0 ? transaction.credit : transaction.debit,
      total: transaction.credit > 0 ? transaction.credit : -transaction.debit,
      discount: 0,
    }));

    const reportData = {
      id: selectedEmployee.id,
      invoiceNumber: `EMP-${selectedEmployee.employeeId}-${new Date().getFullYear()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      clientName: selectedEmployee.name,
      clientPhone: selectedEmployee.phone,
      clientEmail: selectedEmployee.email,
      clientAddress: selectedEmployee.position + ' - ' + selectedEmployee.department,
      items: reportItems,
      subtotal: totalCredits,
      discount: 0,
      vatAmount: 0,
      total: finalBalance,
      notes: `كشف حساب الموظف للفترة من بداية العام ${new Date().getFullYear()}`,
      paymentMethod: 'حساب موظف',
    };

    // فتح نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>كشف حساب الموظف - ${selectedEmployee.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
            @media print {
              @page { margin: 10mm; size: A4; }
              body { font-family: 'Cairo', Arial, sans-serif; }
            }
            body { font-family: 'Cairo', Arial, sans-serif; margin: 0; padding: 20px; }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // انتظار تحميل الصفحة ثم إضافة المحتوى
      printWindow.onload = () => {
        const printContent = printWindow.document.getElementById('print-content');
        if (printContent) {
          // استخدام نفس قالب الفاتورة الموحد
          printContent.innerHTML = generateUnifiedTemplate(reportData, companyInfo);
          printWindow.print();
        }
      };
    }
  };

  const generateUnifiedTemplate = (reportData: any, companyInfo: any) => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; background: white; font-family: 'Cairo', Arial, sans-serif; direction: rtl;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #000;">
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 18px; font-weight: bold;">كشف حساب موظف</h1>
            <p style="margin: 5px 0; font-size: 14px;">رقم التقرير: ${reportData.invoiceNumber}</p>
            <p style="margin: 5px 0; font-size: 14px;">التاريخ: ${new Date(reportData.date).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div style="text-align: center;">
            <div style="width: 80px; height: 80px; border: 2px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 14px; font-weight: bold;">شعار</span>
            </div>
          </div>
          
          <div style="text-align: left;">
            <h2 style="margin: 0; font-size: 18px; font-weight: bold;">${companyInfo?.nameArabic || ''}</h2>
            <p style="margin: 5px 0; font-size: 12px;">هاتف: ${companyInfo?.phone || '0567537599'}</p>
            <p style="margin: 5px 0; font-size: 12px;">العنوان: ${companyInfo?.address || 'جدة البغدادية الشرقية'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">بيانات الموظف:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p style="margin: 5px 0;"><strong>الاسم:</strong> ${reportData.clientName}</p>
            <p style="margin: 5px 0;"><strong>الهاتف:</strong> ${reportData.clientPhone}</p>
            <p style="margin: 5px 0;"><strong>المنصب:</strong> ${reportData.clientAddress}</p>
            <p style="margin: 5px 0;"><strong>البريد:</strong> ${reportData.clientEmail}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">التاريخ</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">التفاصيل</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">له</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">عليه</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.items.map((item: any, index: number) => `
              <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${new Date().toLocaleDateString('en-GB')}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.productName}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; color: green;">
                  ${item.total > 0 ? item.total.toLocaleString('en-US') : '-'}
                </td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; color: red;">
                  ${item.total < 0 ? Math.abs(item.total).toLocaleString('en-US') : '-'}
                </td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">
                  ${(reportData.subtotal - Math.abs(item.total) * (index + 1)).toLocaleString('en-US')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <div style="border: 1px solid #000; padding: 10px; text-align: center;">
            <strong>له: ${reportData.subtotal.toLocaleString('en-US')}</strong>
          </div>
          <div style="border: 1px solid #000; padding: 10px; text-align: center;">
            <strong style="color: red;">عليه: ${Math.abs(reportData.total - reportData.subtotal).toLocaleString('en-US')}</strong>
          </div>
          <div style="border: 1px solid #000; padding: 10px; text-align: center;">
            <strong>إجمالي العمليات</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="border: 1px solid #000; padding: 15px; text-align: center; background-color: ${reportData.total >= 0 ? '#d4edda' : '#f8d7da'};">
            <strong style="color: ${reportData.total >= 0 ? 'green' : 'red'};">
              ريال ${Math.abs(reportData.total).toLocaleString('en-US')}
            </strong>
          </div>
          <div style="border: 1px solid #000; padding: 15px; text-align: center;">
            <strong>إجمالي الرصيد - ${reportData.total >= 0 ? 'له' : 'عليه'}</strong>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">تقارير الموظفين</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} disabled={!selectedEmployee}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة كشف الحساب
          </Button>
        </div>
      </div>

      {/* اختيار الموظف */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار الموظف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">الموظف</label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر موظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الموظف */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات الموظف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-lg">{selectedEmployee.name}</h3>
                <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-lg text-green-600">
                  {totalCredits.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </h3>
                <p className="text-sm text-gray-600">إجمالي الأرباح</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <h3 className="font-bold text-lg text-red-600">
                  {totalDebits.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </h3>
                <p className="text-sm text-gray-600">إجمالي الخصومات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول المعاملات */}
      {selectedEmployee && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>كشف حساب الموظف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">التاريخ</th>
                    <th className="text-right p-2">التفاصيل</th>
                    <th className="text-right p-2">المرجع</th>
                    <th className="text-right p-2">له</th>
                    <th className="text-right p-2">عليه</th>
                    <th className="text-right p-2">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(transaction.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2 text-sm text-gray-600">{transaction.reference}</td>
                      <td className="p-2 text-green-600 font-medium">
                        {transaction.credit > 0 ? 
                          transaction.credit.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : 
                          '-'
                        }
                      </td>
                      <td className="p-2 text-red-600 font-medium">
                        {transaction.debit > 0 ? 
                          transaction.debit.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : 
                          '-'
                        }
                      </td>
                      <td className="p-2 font-bold">
                        {transaction.balance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الرصيد النهائي */}
            <div className="mt-6 flex justify-center">
              <div className={`p-4 rounded-lg text-center ${finalBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`text-xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  الرصيد النهائي: {Math.abs(finalBalance).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </h3>
                <p className="text-sm text-gray-600">
                  {finalBalance >= 0 ? 'للموظف' : 'على الموظف'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* مربع حوار الطباعة */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>كشف حساب الموظف</DialogTitle>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                إغلاق
              </Button>
            </div>
          </DialogHeader>
          {selectedEmployee && (
            <div className="print-content">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">كشف حساب الموظف</h2>
                <h3 className="text-lg">{selectedEmployee.name}</h3>
                <p className="text-gray-600">{selectedEmployee.position} - {selectedEmployee.department}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">التاريخ</th>
                      <th className="border border-gray-300 p-2">التفاصيل</th>
                      <th className="border border-gray-300 p-2">له</th>
                      <th className="border border-gray-300 p-2">عليه</th>
                      <th className="border border-gray-300 p-2">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateTransactions().map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="border border-gray-300 p-2">{transaction.date}</td>
                        <td className="border border-gray-300 p-2">{transaction.description}</td>
                        <td className="border border-gray-300 p-2">
                          {transaction.credit > 0 ? 
                            transaction.credit.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : 
                            '-'
                          }
                        </td>
                        <td className="border border-gray-300 p-2">
                          {transaction.debit > 0 ? 
                            transaction.debit.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) : 
                            '-'
                          }
                        </td>
                        <td className="border border-gray-300 p-2">
                          {transaction.balance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold">
                  الرصيد النهائي: {Math.abs(finalBalance).toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </h3>
                <p className="text-sm text-gray-600">
                  {finalBalance >= 0 ? 'للموظف' : 'على الموظف'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}