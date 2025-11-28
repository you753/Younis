import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Printer, 
  User, 
  DollarSign,
  TrendingDown,
  Calendar,
  Minus,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface BranchEmployeeStatementProps {
  branchId: number;
}

export default function BranchEmployeeStatement({ branchId }: BranchEmployeeStatementProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { toast } = useToast();

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب قائمة الموظفين المربوطين بالفرع
  const { data: employees = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/employees`],
  });

  // جلب بيانات الموظف المحدد
  const { data: employeeData } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}/employees`, selectedEmployeeId],
    select: (data: any[]) => data?.find((emp: any) => emp.id === selectedEmployeeId),
    enabled: !!selectedEmployeeId,
  });

  // فلترة البيانات حسب التاريخ
  const filterByDate = (items: any[]) => {
    if (!startDate && !endDate) return items;
    
    return items.filter((item: any) => {
      const itemDate = new Date(item.createdAt || item.date || item.dueDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  };

  // جلب جميع الخصومات وفلترتها للموظف المحدد
  const { data: allDeductions = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/deductions`],
    select: (data: any[]) => data?.filter((d: any) => d.employeeId === selectedEmployeeId) || [],
    enabled: !!selectedEmployeeId,
  });
  const deductions = filterByDate(allDeductions);

  // جلب ديون الموظف
  const { data: allEmployeeDebts = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/employee-debts`],
    select: (data: any[]) => data?.filter((d: any) => d.debtorId === selectedEmployeeId) || [],
    enabled: !!selectedEmployeeId,
  });
  const employeeDebts = filterByDate(allEmployeeDebts);

  // جلب رواتب الموظف
  const { data: allEmployeeSalaries = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branchId}/salaries`],
    select: (data: any[]) => data?.filter((s: any) => s.employeeId === selectedEmployeeId) || [],
    enabled: !!selectedEmployeeId,
  });
  const employeeSalaries = filterByDate(allEmployeeSalaries);

  // حساب المجاميع
  const calculateTotals = () => {
    // حساب الخصومات من الراتب والدين
    let totalDeductionsFromSalary = 0;
    let deductionsFromDebt = 0;
    let salaryToDebtAmount = 0;
    
    deductions
      .filter((d: any) => d.status === 'active')
      .forEach((d: any) => {
        const amount = parseFloat(d.amount || '0');
        
        if (d.deductionType === 'salary_deduction') {
          totalDeductionsFromSalary += amount;
        } else if (d.deductionType === 'debt_deduction') {
          deductionsFromDebt += amount;
        } else if (d.deductionType === 'smart_deduction') {
          totalDeductionsFromSalary += amount;
        }
      });
    
    // الرصيد الافتتاحي (الراتب الأساسي المسجل للموظف)
    const baseSalary = parseFloat(employeeData?.baseSalary || '0');
    
    // إجمالي الرواتب المسددة (الرصيد الإضافي)
    // نشمل جميع الرواتب ما عدا الملغاة
    const totalSalaries = employeeSalaries
      .filter((s: any) => s.status !== 'cancelled')
      .reduce((sum: number, s: any) => sum + parseFloat(s.amount || s.netSalary || '0'), 0);
    
    // إجمالي الرصيد = الرصيد الافتتاحي + الرواتب المسددة
    const totalBalance = baseSalary + totalSalaries;
    
    // إجمالي الديون الأصلية (المبلغ المتبقي من الديون)
    const originalDebts = employeeDebts
      .filter((d: any) => d.status === 'active')
      .reduce((sum: number, d: any) => sum + parseFloat(d.remainingAmount || d.amount || '0'), 0);
    
    // إجمالي الديون = الديون الأصلية + تحويل راتب لدين - خصومات من الدين
    const totalDebts = originalDebts + salaryToDebtAmount - deductionsFromDebt;
    
    // الباقي من الرصيد (إجمالي الرصيد - الخصومات من الراتب)
    const remainingSalary = totalBalance - totalDeductionsFromSalary;
    
    // المبلغ النهائي المستحق للموظف = الباقي من الرصيد
    // الدين لا يُخصم تلقائياً، يُخصم فقط عبر الخصومات اليدوية
    const finalAmount = remainingSalary;

    return {
      baseSalary,
      totalSalaries,
      totalBalance,
      totalDeductionsFromSalary,
      deductionsFromDebt,
      salaryToDebtAmount,
      totalDebts,
      remainingSalary,
      finalAmount,
      originalDebts
    };
  };

  const totals = selectedEmployeeId && employeeData ? calculateTotals() : null;

  // طباعة كشف الحساب
  const handlePrint = () => {
    if (!employeeData || !totals) return;
    
    // جلب اسم الفرع الحالي
    const branchName = branch?.name || '';
    
    // تنسيق فترة التاريخ للطباعة
    const getDateRangeText = () => {
      if (startDate && endDate) {
        return `من ${new Date(startDate).toLocaleDateString('en-GB')} إلى ${new Date(endDate).toLocaleDateString('en-GB')}`;
      } else if (startDate) {
        return `من ${new Date(startDate).toLocaleDateString('en-GB')}`;
      } else if (endDate) {
        return `حتى ${new Date(endDate).toLocaleDateString('en-GB')}`;
      }
      return 'جميع الفترات';
    };

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>كشف حساب الموظف - ${employeeData.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: A4; margin: 1cm; }
            body {
              font-family: 'Arial', sans-serif;
              direction: rtl;
              background: white;
              color: #000;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .employee-name {
              font-size: 18px;
              color: #333;
              margin-top: 10px;
            }
            .date-range {
              font-size: 14px;
              color: #666;
              margin-top: 8px;
              padding: 8px;
              background: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 4px;
              display: inline-block;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .card {
              border: 2px solid #000;
              padding: 15px;
              text-align: center;
            }
            .card.highlight {
              background: #f0f0f0;
            }
            .card-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 20px;
              font-weight: bold;
              color: #000;
            }
            .card-value.green {
              color: #059669;
            }
            .card-value.red {
              color: #dc2626;
            }
            .final-card {
              grid-column: 1 / -1;
              background: #000;
              color: white;
              border: none;
            }
            .final-card .card-label {
              color: #ccc;
            }
            .final-card .card-value {
              color: white;
              font-size: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 2px solid #000;
            }
            th {
              background: #000;
              color: white;
              padding: 10px;
              text-align: center;
              font-size: 13px;
              border: 1px solid #000;
            }
            td {
              padding: 10px;
              text-align: center;
              border: 1px solid #000;
              font-size: 12px;
            }
            tbody tr:nth-child(even) {
              background: #f9f9f9;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 25px 0 10px 0;
              padding: 10px;
              background: #f0f0f0;
              border-right: 4px solid #000;
            }
            .no-data {
              text-align: center;
              padding: 30px;
              color: #999;
              font-style: italic;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #000;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
            }
            .badge-active {
              background: #dcfce7;
              color: #166534;
            }
            .badge-paid {
              background: #dbeafe;
              color: #1e40af;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              ${branchName ? `<div class="title" style="color: #2563eb; margin-bottom: 10px;">${branchName}</div>` : ''}
              <div class="title">كشف حساب الموظف</div>
              <div class="employee-name">${employeeData.name}</div>
              <div style="font-size: 12px; color: #666; margin-top: 8px;">
                تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}
              </div>
              <div class="date-range">
                <strong>الفترة:</strong> ${getDateRangeText()}
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="summary-cards">
              <!-- الرصيد الافتتاحي -->
              <div class="card">
                <div class="card-label">الرصيد الافتتاحي</div>
                <div class="card-value">${totals.baseSalary.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الرواتب المسددة -->
              <div class="card">
                <div class="card-label">الرواتب المسددة (رصيد إضافي)</div>
                <div class="card-value green">${totals.totalSalaries.toLocaleString('en-US')} ريال</div>
                <div style="font-size: 10px; color: #666; margin-top: 4px;">عدد الرواتب: ${employeeSalaries.filter((s: any) => s.status !== 'cancelled').length}</div>
              </div>

              <!-- إجمالي الرصيد -->
              <div class="card highlight">
                <div class="card-label">إجمالي الرصيد</div>
                <div class="card-value" style="color: #2563eb;">${totals.totalBalance.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الخصومات من الراتب -->
              <div class="card">
                <div class="card-label">الخصومات من الراتب</div>
                <div class="card-value red">${totals.totalDeductionsFromSalary.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الباقي من الرصيد -->
              <div class="card highlight">
                <div class="card-label">الباقي من الرصيد</div>
                <div class="card-value green">${totals.remainingSalary.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الباقي من الدين -->
              <div class="card">
                <div class="card-label">الباقي من الدين</div>
                <div class="card-value red">${totals.totalDebts.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الخصومات من الدين -->
              <div class="card">
                <div class="card-label">الخصومات من الدين</div>
                <div class="card-value green">${totals.deductionsFromDebt.toLocaleString('en-US')} ريال</div>
              </div>

              <!-- الرصيد الصافي -->
              <div class="card final-card">
                <div class="card-label">الرصيد الصافي</div>
                <div class="card-value">${totals.finalAmount.toLocaleString('en-US')} ريال</div>
                <div style="font-size: 11px; margin-top: 5px; color: #ccc;">(الدين منفصل ويُخصم يدوياً)</div>
              </div>
            </div>

            <!-- تفاصيل الرواتب المسددة -->
            <div class="section-title">تفاصيل الرواتب المسددة (رصيد إضافي)</div>
            ${employeeSalaries.filter((s: any) => s.status !== 'cancelled').length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الشهر</th>
                    <th>السنة</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${employeeSalaries.filter((s: any) => s.status !== 'cancelled').map((salary: any) => {
                    const amount = parseFloat(salary.amount || salary.netSalary || '0');
                    const statusText = salary.status === 'paid' ? 'مدفوع' : 'معلق';
                    return `
                      <tr>
                        <td>${new Date(salary.createdAt).toLocaleDateString('en-GB')}</td>
                        <td style="font-weight: bold;">${salary.month || '-'}</td>
                        <td>${salary.year || '-'}</td>
                        <td style="font-weight: bold; color: #059669;">${amount.toLocaleString('en-US')} ريال</td>
                        <td><span class="badge ${salary.status === 'paid' ? 'badge-paid' : 'badge-active'}">${statusText}</span></td>
                      </tr>
                    `;
                  }).join('')}
                  <tr style="background: #000; color: white; font-weight: bold;">
                    <td colspan="3">إجمالي الرواتب المسددة</td>
                    <td style="font-size: 14px; color: white;">${totals.totalSalaries.toLocaleString('en-US')} ريال</td>
                    <td style="font-size: 11px;">عدد الرواتب: ${employeeSalaries.filter((s: any) => s.status !== 'cancelled').length}</td>
                  </tr>
                </tbody>
              </table>
            ` : '<div class="no-data">لا توجد رواتب مسددة</div>'}

            <!-- تفاصيل الخصومات -->
            <div class="section-title">تفاصيل الخصومات الكاملة</div>
            ${deductions.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>الوصف</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${deductions.map((d: any) => {
                    const deductionTypeLabels: any = {
                      'smart_deduction': '⚡ خصم ذكي',
                      'salary_deduction': '💰 خصم من الراتب',
                      'debt_deduction': '💳 خصم من الدين'
                    };
                    const deductionTypeLabel = deductionTypeLabels[d.deductionType] || d.deductionType || 'خصم';
                    const totalAmount = parseFloat(d.amount || '0');
                    
                    return `
                    <tr>
                      <td>${new Date(d.deductionDate || d.date).toLocaleDateString('en-GB')}</td>
                      <td style="font-weight: bold;">${deductionTypeLabel}</td>
                      <td style="font-weight: bold; color: #dc2626;">${totalAmount.toLocaleString('en-US')} ر.س</td>
                      <td>${d.description || '-'}</td>
                      <td><span class="badge ${d.status === 'active' ? 'badge-active' : 'badge-paid'}">${d.status === 'active' ? 'نشط' : 'مكتمل'}</span></td>
                    </tr>
                  `;
                  }).join('')}
                  <tr style="background: #000; color: white; font-weight: bold;">
                    <td colspan="2">إجمالي الخصومات</td>
                    <td style="font-size: 14px; color: white;">${totals.totalDeductionsFromSalary.toLocaleString('en-US')} ر.س</td>
                    <td colspan="2" style="font-size: 11px;">عدد الخصومات: ${deductions.length}</td>
                  </tr>
                </tbody>
              </table>
            ` : '<div class="no-data">لا توجد خصومات</div>'}

            <!-- تفاصيل الديون -->
            <div class="section-title">تفاصيل الديون (3 أخيرة)</div>
            ${employeeDebts.filter((d: any) => d.status === 'active').length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>عدد الأقساط</th>
                    <th>المبلغ الأصلي</th>
                    <th>المبلغ المسدد</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${employeeDebts.filter((d: any) => d.status === 'active').slice(0, 3).map((debt: any) => {
                    const originalAmount = parseFloat(debt.amount || '0');
                    const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                    const paidAmount = originalAmount - remaining;
                    return `
                      <tr>
                        <td>${new Date(debt.date).toLocaleDateString('en-GB')}</td>
                        <td>${debt.installments || '-'}</td>
                        <td style="font-weight: bold;">${originalAmount.toLocaleString('en-US')} ريال</td>
                        <td style="color: #059669; font-weight: bold;">${paidAmount.toLocaleString('en-US')} ريال</td>
                        <td>
                          <span class="badge ${debt.status === 'active' ? 'badge-active' : 'badge-paid'}">
                            ${debt.status === 'active' ? 'نشط' : 'مسدد'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${employeeDebts.filter((d: any) => d.status === 'active').length > 3 ? `
                    <tr>
                      <td colspan="5" style="text-align: center; color: #666; font-style: italic;">
                        عرض آخر 3 ديون فقط - إجمالي الديون: ${employeeDebts.filter((d: any) => d.status === 'active').length}
                      </td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            ` : '<div class="no-data">لا توجد ديون</div>'}

            <!-- تفاصيل أقساط الديون -->
            <div class="section-title">تفاصيل أقساط الديون</div>
            ${employeeDebts.filter((d: any) => d.status === 'active' && d.installments > 0).length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>النوع</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  ${employeeDebts.filter((d: any) => d.status === 'active' && d.installments > 0).map((debt: any) => {
                    const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                    return `
                      <tr>
                        <td>${debt.description || debt.type || 'دين'}</td>
                        <td>${new Date(debt.date).toLocaleDateString('en-GB')}</td>
                        <td style="font-weight: bold; color: #dc2626;">${remaining.toLocaleString('en-US')} ريال</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<div class="no-data">لا توجد أقساط ديون</div>'}

            <!-- Footer -->
            <div class="footer">
              <p><strong>ملاحظة مهمة:</strong> الخصومات تُخصم من الراتب الأساسي، والديون تُخصم من المبلغ الباقي بعد الخصومات</p>
              <p style="margin-top: 8px;">الحساب النهائي = الراتب الأساسي - الخصومات - الديون</p>
              <p style="margin-top: 8px;">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-t-4 border-t-gray-900 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-900 p-3 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">كشف حساب الموظف</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">عرض تفصيلي للراتب والخصومات والديون</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {selectedEmployeeId && (
                  <Button
                    onClick={handlePrint}
                    className="bg-gray-900 hover:bg-gray-800 w-full"
                    data-testid="button-print"
                  >
                    <Printer className="h-4 w-4 ml-2" />
                    طباعة الكشف
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* اختيار الموظف */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-900" />
              اختيار الموظف
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Select
              value={selectedEmployeeId?.toString() || ''}
              onValueChange={(value) => setSelectedEmployeeId(parseInt(value))}
            >
              <SelectTrigger className="w-full" data-testid="select-employee">
                <SelectValue placeholder="اختر الموظف لعرض كشف الحساب" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    لا يوجد موظفين مربوطين بالفرع
                  </div>
                ) : (
                  employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} - {emp.position || 'موظف'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* فلترة التاريخ */}
            {selectedEmployeeId && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-700">تصفية حسب التاريخ</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">من تاريخ</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-gray-300"
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">إلى تاريخ</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-gray-300"
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="mt-3 w-full border-gray-900 text-gray-900 hover:bg-gray-100"
                  >
                    إعادة تعيين التاريخ
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* عرض كشف الحساب */}
        {selectedEmployeeId && employeeData && totals ? (
          <>
            {/* معلومات الموظف */}
            <Card className="shadow-lg border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-center text-xl">{employeeData.name}</CardTitle>
                <p className="text-center text-sm text-gray-600 mt-1">
                  التاريخ: {new Date().toLocaleDateString('en-GB')}
                </p>
              </CardHeader>
            </Card>

            {/* كروت الملخص - تصميم أبيض وأسود احترافي */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* الرصيد الافتتاحي */}
              <Card className="border-2 border-gray-900">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">الرصيد الافتتاحي</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totals.baseSalary.toLocaleString('en-US')} <span className="text-lg">ريال</span>
                  </p>
                </CardContent>
              </Card>

              {/* الرواتب المسددة */}
              <Card className="border-2 border-gray-900">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">الرواتب المسددة (رصيد إضافي)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totals.totalSalaries.toLocaleString('en-US')} <span className="text-lg">ريال</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">عدد الرواتب: {employeeSalaries.filter((s: any) => s.status !== 'cancelled').length}</p>
                </CardContent>
              </Card>

              {/* إجمالي الرصيد */}
              <Card className="border-2 border-blue-600 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-blue-900 font-semibold mb-2">إجمالي الرصيد</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {totals.totalBalance.toLocaleString('en-US')} <span className="text-xl">ريال</span>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">افتتاحي + مسدد</p>
                </CardContent>
              </Card>

              {/* الخصومات من الراتب */}
              <Card className="border-2 border-gray-900">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">الخصومات من الراتب</p>
                  <p className="text-3xl font-bold text-red-600">
                    {totals.totalDeductionsFromSalary.toLocaleString('en-US')} <span className="text-lg">ريال</span>
                  </p>
                </CardContent>
              </Card>

              {/* الباقي من الرصيد */}
              <Card className="border-2 border-gray-900 bg-gray-50">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 font-semibold mb-2">الباقي من الرصيد</p>
                  <p className="text-4xl font-bold text-green-600">
                    {totals.remainingSalary.toLocaleString('en-US')} <span className="text-xl">ريال</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-2">بعد خصم جميع الخصومات</p>
                </CardContent>
              </Card>

              {/* الباقي من الدين */}
              <Card className="border-2 border-gray-900">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">الباقي من الدين</p>
                  <p className="text-3xl font-bold text-red-600">
                    {totals.totalDebts.toLocaleString('en-US')} <span className="text-lg">ريال</span>
                  </p>
                </CardContent>
              </Card>

              {/* الخصومات من الدين */}
              <Card className="border-2 border-gray-900">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">الخصومات من الدين</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totals.deductionsFromDebt.toLocaleString('en-US')} <span className="text-lg">ريال</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* تفاصيل الخصومات */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 border-b-2 border-gray-900">
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-gray-900" />
                  تفاصيل الخصومات (3 أخيرة)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {deductions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="p-3 text-center border border-gray-300">التاريخ</th>
                          <th className="p-3 text-center border border-gray-300">النوع</th>
                          <th className="p-3 text-center border border-gray-300">المبلغ</th>
                          <th className="p-3 text-center border border-gray-300">الوصف</th>
                          <th className="p-3 text-center border border-gray-300">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deductions.slice(0, 3).map((d: any, index: number) => {
                          const deductionTypeLabels: any = {
                            'smart_deduction': '⚡ خصم ذكي',
                            'salary_deduction': '💰 خصم من الراتب',
                            'debt_deduction': '💳 خصم من الدين'
                          };
                          return (
                            <tr key={d.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-3 text-center border border-gray-300">
                                {new Date(d.deductionDate || d.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-3 text-center border border-gray-300">
                                {deductionTypeLabels[d.deductionType] || d.deductionType || 'خصم'}
                              </td>
                              <td className="p-3 text-center border border-gray-300 font-bold text-gray-900">
                                {parseFloat(d.amount).toLocaleString('en-US')} ريال
                              </td>
                              <td className="p-3 text-center border border-gray-300">{d.description || '-'}</td>
                              <td className="p-3 text-center border border-gray-300">
                                <Badge className="bg-gray-200 text-gray-900 border border-gray-900">
                                  {d.status === 'active' ? 'نشط' : 'مكتمل'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                        {deductions.length > 3 && (
                          <tr>
                            <td colSpan={5} className="p-3 text-center border border-gray-300 text-gray-600 italic">
                              عرض آخر 3 خصومات فقط - إجمالي الخصومات: {deductions.length}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-gray-100 font-bold">
                          <td colSpan={2} className="p-3 text-center border border-gray-300">إجمالي الخصومات</td>
                          <td className="p-3 text-center border border-gray-300 text-gray-900 text-lg">
                            {totals.totalDeductionsFromSalary.toLocaleString('en-US')} ريال
                          </td>
                          <td colSpan={2} className="p-3 text-center border border-gray-300">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد خصومات</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* تفاصيل الديون */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 border-b-2 border-gray-900">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-900" />
                  تفاصيل الديون (3 أخيرة)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {employeeDebts.filter((d: any) => d.status === 'active').length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="p-3 text-center border border-gray-300">التاريخ</th>
                          <th className="p-3 text-center border border-gray-300">عدد الأقساط</th>
                          <th className="p-3 text-center border border-gray-300">المبلغ الأصلي</th>
                          <th className="p-3 text-center border border-gray-300">المبلغ المسدد</th>
                          <th className="p-3 text-center border border-gray-300">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeDebts.filter((d: any) => d.status === 'active').slice(0, 3).map((debt: any, index: number) => {
                          const originalAmount = parseFloat(debt.amount || '0');
                          const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                          const paidAmount = originalAmount - remaining;
                          return (
                            <tr key={debt.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-3 text-center border border-gray-300">
                                {new Date(debt.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-3 text-center border border-gray-300">{debt.installments || '-'}</td>
                              <td className="p-3 text-center border border-gray-300 font-bold">
                                {originalAmount.toLocaleString('en-US')} ريال
                              </td>
                              <td className="p-3 text-center border border-gray-300 font-bold text-gray-900">
                                {paidAmount.toLocaleString('en-US')} ريال
                              </td>
                              <td className="p-3 text-center border border-gray-300">
                                <Badge className="bg-gray-200 text-gray-900 border border-gray-900">
                                  {debt.status === 'active' ? 'نشط' : 'مسدد'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                        {employeeDebts.filter((d: any) => d.status === 'active').length > 3 && (
                          <tr>
                            <td colSpan={5} className="p-3 text-center border border-gray-300 text-gray-600 italic">
                              عرض آخر 3 ديون فقط - إجمالي الديون: {employeeDebts.filter((d: any) => d.status === 'active').length}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد ديون</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* تفاصيل أقساط الديون */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 border-b-2 border-gray-900">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-900" />
                  تفاصيل أقساط الديون
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {employeeDebts.filter((d: any) => d.status === 'active' && d.installments > 0).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="p-3 text-center border border-gray-300">النوع</th>
                          <th className="p-3 text-center border border-gray-300">التاريخ</th>
                          <th className="p-3 text-center border border-gray-300">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeDebts.filter((d: any) => d.status === 'active' && d.installments > 0).map((debt: any, index: number) => {
                          const remaining = parseFloat(debt.remainingAmount || debt.amount || '0');
                          return (
                            <tr key={debt.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-3 text-center border border-gray-300">
                                {debt.description || debt.type || 'دين'}
                              </td>
                              <td className="p-3 text-center border border-gray-300">
                                {new Date(debt.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-3 text-center border border-gray-300 font-bold text-gray-900">
                                {remaining.toLocaleString('en-US')} ريال
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد أقساط ديون</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ملاحظة توضيحية */}
            <Card className="border-r-4 border-r-gray-900 bg-gray-100 shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-gray-900 font-semibold mb-2">
                  <AlertCircle className="inline h-4 w-4 ml-1" />
                  ملاحظة مهمة:
                </p>
                <ul className="text-sm text-gray-900 space-y-1 mr-6">
                  <li>• <strong>الخصومات</strong> تُخصم مباشرة من الراتب الأساسي</li>
                  <li>• <strong>الديون</strong> تُخصم من المبلغ الباقي بعد الخصومات</li>
                  <li>• <strong>الحساب النهائي</strong> = الراتب الأساسي - الخصومات - الديون</li>
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <User className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">اختر موظف لعرض كشف الحساب</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
