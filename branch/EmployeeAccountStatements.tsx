import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position?: string;
  salary?: number;
  status: string;
}

export default function EmployeeAccountStatements() {
  // جلب بيانات الموظفين
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // جلب إعدادات الشركة
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });


  // طباعة كشف حساب الموظف
  const printEmployeeStatement = (employee: Employee) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>كشف حساب ${employee.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                direction: rtl; 
                margin: 20px;
                font-size: 14px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .statement-title { 
                font-size: 18px; 
                color: #666;
              }
              .employee-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .info-row {
                margin-bottom: 10px;
              }
              .footer { 
                text-align: center; 
                margin-top: 40px; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              
              <div class="statement-title">كشف حساب موظف</div>
              <div style="font-size: 14px; color: #666; margin-top: 10px;">
                تاريخ الكشف: ${new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            <div class="employee-info">
              <div class="info-row">
                <strong>اسم الموظف:</strong> ${employee.name}
              </div>
              <div class="info-row">
                <strong>المنصب:</strong> ${employee.position || 'غير محدد'}
              </div>
              <div class="info-row">
                <strong>الراتب:</strong> ${employee.salary || 0} ريال
              </div>
              <div class="info-row">
                <strong>الحالة:</strong> ${employee.status === 'active' ? 'نشط' : 'غير نشط'}
              </div>
            </div>

            <div class="footer">
              <div>تم إنشاء هذا الكشف بواسطة نظام المحاسبة</div>
              <div style="margin-top: 10px;">
                
              </div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          كشوف حساب الموظفين
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">{employee.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{employee.position || 'غير محدد'}</p>
              
              <Button 
                onClick={() => printEmployeeStatement(employee)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                طباعة كشف الحساب
              </Button>
            </div>
          ))}
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">لا توجد بيانات موظفين</p>
          </div>
        )}
      </div>
    </div>
  );
}