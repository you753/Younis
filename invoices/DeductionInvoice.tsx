import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DeductionInvoiceProps {
  deduction: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeductionInvoice({ deduction, isOpen, onClose }: DeductionInvoiceProps) {
  if (!deduction) return null;

  // جلب بيانات الموظفين والرواتب والديون الحقيقية
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['/api/salaries'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['/api/debts'],
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // العثور على بيانات الموظف المحددة
  const employee = employees.find((emp: any) => emp.id === deduction.employeeId);
  const employeeSalary = salaries.find((sal: any) => sal.employeeId === deduction.employeeId);
  
  // العثور على ديون الموظف
  const employeeDebts = debts.filter((debt: any) => 
    debt.employeeId === deduction.employeeId || 
    debt.debtorId === deduction.employeeId ||
    (debt.debtorType === 'employee' && debt.debtorId === deduction.employeeId)
  );

  // حساب إجمالي الديون
  const totalDebt = employeeDebts.reduce((sum: number, debt: any) => {
    return sum + parseFloat(debt.amount || 0);
  }, 0);

  // الحصول على الراتب الحالي
  const currentSalary = employeeSalary ? parseFloat(employeeSalary.amount || 0) : 0;
  
  // مبلغ الخصم
  const deductionAmount = parseFloat(deduction.amount || 0);

  // حساب التأثير حسب نوع الخصم
  const calculateImpact = () => {
    if (deduction.deductionType === 'salary_deduction') {
      return {
        type: 'خصم من الراتب',
        salaryBefore: currentSalary,
        salaryAfter: currentSalary - deductionAmount,
        deductionAmount
      };
    } else if (deduction.deductionType === 'debt_deduction') {
      return {
        type: 'خصم من الدين',
        debtBefore: totalDebt,
        debtAfter: totalDebt - deductionAmount,
        deductionAmount
      };
    } else if (deduction.deductionType === 'salary_to_debt') {
      return {
        type: 'تحويل راتب إلى دين',
        salaryBefore: currentSalary,
        salaryAfter: currentSalary - deductionAmount,
        debtBefore: totalDebt,
        debtAfter: totalDebt - deductionAmount,
        deductionAmount
      };
    }
    return null;
  };

  const impact = calculateImpact();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>فاتورة خصم</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button onClick={handlePrint} className="mb-4">
            <Printer className="w-4 h-4 mr-2" />
            طباعة الفاتورة
          </Button>
          
          <div className="bg-white p-8 border" dir="rtl">
            {/* Header */}
            <div className="text-center border-b-2 pb-4 mb-6">
              <h1 className="text-2xl font-bold mb-2">فاتورة خصم</h1>
              
            </div>
            
            {/* Invoice Info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p><strong>تاريخ الطباعة:</strong></p>
                <p>{new Date().toLocaleDateString('en-GB')}</p>
              </div>
              <div>
                <p><strong>تاريخ الخصم:</strong></p>
                <p>{new Date(deduction.deductionDate).toLocaleDateString('en-GB')}</p>
              </div>
              <div>
                <p><strong>رقم الفاتورة:</strong></p>
                <p>DED-{deduction.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
            
            {/* Employee Info */}
            <div className="border p-4 mb-6">
              <h3 className="text-lg font-bold mb-2">معلومات الموظف</h3>
              <p><strong>اسم الموظف:</strong> {deduction.employeeName || 'غير محدد'}</p>
              <p><strong>رقم الموظف:</strong> {deduction.employeeId}</p>
            </div>
            
            {/* Deduction Details */}
            <div className="border p-4 mb-6">
              <h3 className="text-lg font-bold mb-2">تفاصيل الخصم</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>نوع الخصم:</strong></p>
                  <p>
                    {deduction.deductionType === 'salary_deduction' && 'خصم من الراتب'}
                    {deduction.deductionType === 'debt_deduction' && 'خصم من الدين'}
                    {deduction.deductionType === 'salary_to_debt' && 'تحويل راتب إلى دين'}
                  </p>
                </div>
                <div>
                  <p><strong>مبلغ الخصم:</strong></p>
                  <p className="text-red-600 font-bold">{deduction.amount} ريال</p>
                </div>
              </div>
              {deduction.description && (
                <div className="mt-4">
                  <p><strong>الوصف:</strong></p>
                  <p>{deduction.description}</p>
                </div>
              )}
            </div>
            
            {/* Impact Summary */}
            <div className="border p-4 mb-6">
              <h3 className="text-lg font-bold mb-4">ملخص التأثير</h3>
              
              {impact && impact.type === 'خصم من الراتب' && (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>تأثير على الراتب:</strong></p>
                      <p className="text-green-600">الراتب قبل الخصم: {impact.salaryBefore} ريال</p>
                      <p className="text-red-600">مبلغ الخصم: {impact.deductionAmount} ريال</p>
                      <p className="text-blue-600 font-bold">الراتب بعد الخصم: {impact.salaryAfter} ريال</p>
                    </div>
                  </div>
                </div>
              )}
              
              {impact && impact.type === 'خصم من الدين' && (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>تأثير على الدين:</strong></p>
                      <p className="text-red-600">الدين قبل السداد: {impact.debtBefore} ريال</p>
                      <p className="text-green-600">مبلغ السداد: {impact.deductionAmount} ريال</p>
                      <p className="text-blue-600 font-bold">الدين بعد السداد: {impact.debtAfter} ريال</p>
                    </div>
                  </div>
                </div>
              )}
              
              {impact && impact.type === 'تحويل راتب إلى دين' && (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>تأثير على الراتب:</strong></p>
                      <p className="text-green-600">الراتب قبل التحويل: {impact.salaryBefore} ريال</p>
                      <p className="text-red-600">مبلغ التحويل: {impact.deductionAmount} ريال</p>
                      <p className="text-blue-600 font-bold">الراتب بعد التحويل: {impact.salaryAfter} ريال</p>
                    </div>
                    <div>
                      <p><strong>تأثير على الدين:</strong></p>
                      <p className="text-red-600">الدين قبل السداد: {impact.debtBefore} ريال</p>
                      <p className="text-green-600">مبلغ السداد: {impact.deductionAmount} ريال</p>
                      <p className="text-blue-600 font-bold">الدين بعد السداد: {impact.debtAfter} ريال</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                هذه الفاتورة صادرة من نظام المحاسب الأعظم - تاريخ الإنتاج: {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}