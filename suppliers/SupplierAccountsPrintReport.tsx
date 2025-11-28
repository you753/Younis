import React from 'react';

interface SupplierAccount {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: string;
  currentBalance: number;
  totalPurchases: number;
  creditLimit: number;
  accountType: string;
  status: string;
  createdAt: string;
}

interface SupplierAccountsPrintReportProps {
  suppliers: SupplierAccount[];
  analytics: {
    totalSuppliers: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    totalCurrentBalance: number;
    totalPurchases: number;
    totalCreditLimits: number;
    totalOpeningBalances: number;
    suppliersWithDebt: number;
    suppliersWithCredit: number;
  };
  user?: any;
}

export default function SupplierAccountsPrintReport({ suppliers, analytics, user }: SupplierAccountsPrintReportProps) {
  return (
    <div className="print-report p-8 bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">تقرير حسابات الموردين</h1>
        <div className="text-lg text-gray-600">
          
          <p>تاريخ التقرير: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص الإحصائيات</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-4 rounded">
            <div className="font-semibold text-blue-800">إجمالي الموردين</div>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalSuppliers}</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="font-semibold text-green-800">موردين نشطين</div>
            <div className="text-2xl font-bold text-green-600">{analytics.activeSuppliers}</div>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <div className="font-semibold text-red-800">موردين غير نشطين</div>
            <div className="text-2xl font-bold text-red-600">{analytics.inactiveSuppliers}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="font-semibold text-purple-800">إجمالي الأرصدة الحالية</div>
            <div className="text-lg font-bold text-purple-600">
              {analytics.totalCurrentBalance.toLocaleString('en-US')} ر.س
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <div className="font-semibold text-orange-800">إجمالي حدود الائتمان</div>
            <div className="text-lg font-bold text-orange-600">
              {analytics.totalCreditLimits.toLocaleString('en-US')} ر.س
            </div>
          </div>
          <div className="bg-teal-50 p-4 rounded">
            <div className="font-semibold text-teal-800">إجمالي الأرصدة الافتتاحية</div>
            <div className="text-lg font-bold text-teal-600">
              {analytics.totalOpeningBalances.toLocaleString('en-US')} ر.س
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">تفاصيل حسابات الموردين</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-right">م</th>
              <th className="border border-gray-300 p-2 text-right">اسم المورد</th>
              <th className="border border-gray-300 p-2 text-right">الهاتف</th>
              <th className="border border-gray-300 p-2 text-right">البريد الإلكتروني</th>
              <th className="border border-gray-300 p-2 text-right">الرصيد الافتتاحي</th>
              <th className="border border-gray-300 p-2 text-right">الرصيد الحالي</th>
              <th className="border border-gray-300 p-2 text-right">إجمالي المشتريات</th>
              <th className="border border-gray-300 p-2 text-right">حد الائتمان</th>
              <th className="border border-gray-300 p-2 text-right">نوع الحساب</th>
              <th className="border border-gray-300 p-2 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={supplier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2 font-semibold">{supplier.name}</td>
                <td className="border border-gray-300 p-2">{supplier.phone}</td>
                <td className="border border-gray-300 p-2">{supplier.email || '-'}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {parseFloat(supplier.openingBalance).toLocaleString('en-US')} ر.س
                </td>
                <td className={`border border-gray-300 p-2 text-center font-semibold ${
                  supplier.currentBalance > 0 ? 'text-green-600' : 
                  supplier.currentBalance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {supplier.currentBalance.toLocaleString('en-US')} ر.س
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {supplier.totalPurchases.toLocaleString('en-US')} ر.س
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {supplier.creditLimit.toLocaleString('en-US')} ر.س
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {supplier.accountType === 'credit' ? 'آجل' : 
                   supplier.accountType === 'cash' ? 'نقدي' : 'مختلط'}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                    supplier.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status === 'active' ? 'نشط' :
                     supplier.status === 'inactive' ? 'غير نشط' : 'محظور'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
        <p>تم إنشاء هذا التقرير</p>
        <p>وقت الطباعة: {new Date().toLocaleString('en-US')}</p>
      </div>

      <style jsx>{`
        @media print {
          .print-report {
            padding: 20px;
            font-size: 12px;
          }
          .print-report h1 {
            font-size: 24px;
          }
          .print-report h2 {
            font-size: 18px;
          }
          .print-report table {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}