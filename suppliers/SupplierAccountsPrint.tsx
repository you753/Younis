import React from 'react';
import jsPDF from 'jspdf';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: string;
  currentBalance: string;
  creditLimit: string;
  accountType: string;
  status: string;
  createdAt: string;
  balance?: string;
}

interface PaymentVoucher {
  id: number;
  supplierId: number;
  voucherNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  status: string;
  createdAt: string;
}

interface SupplierAccountsPrintProps {
  suppliers: Supplier[];
  paymentVouchers: PaymentVoucher[];
}

export default function SupplierAccountsPrint({ suppliers, paymentVouchers }: SupplierAccountsPrintProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('en-US')} ر.س`;
  };

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    totalBalance: suppliers.reduce((sum, s) => sum + parseFloat(s.balance || s.currentBalance || '0'), 0),
    totalPayments: paymentVouchers.reduce((sum, v) => sum + parseFloat(v.amount || '0'), 0)
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="print-container bg-white p-8 min-h-screen" dir="rtl">
      {/* Company Header */}
      <div className="company-header">
        <div className="company-name">
          
        </div>
        <div className="company-info">
          <p>هاتف: +966 11 234 5678 | فاكس: +966 11 234 5679</p>
          <p>البريد الإلكتروني: info@almcountant.com | الموقع: www.almcountant.com</p>
          <p>العنوان: الرياض، المملكة العربية السعودية | الرقم الضريبي: 123456789012345</p>
        </div>
      </div>

      {/* Report Title */}
      <h1>تقرير حسابات الموردين</h1>
      <div className="text-center mb-8 text-sm text-gray-600">
        تاريخ التقرير: {currentDate} | الوقت: {new Date().toLocaleTimeString('en-US')}
      </div>

      {/* Statistics Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          ملخص الإحصائيات
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">إجمالي الموردين</div>
            <div className="stat-value">{stats.totalSuppliers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">موردين نشطين</div>
            <div className="stat-value">{stats.activeSuppliers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">إجمالي الأرصدة</div>
            <div className="stat-value">{formatCurrency(stats.totalBalance)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">إجمالي المدفوعات</div>
            <div className="stat-value">{formatCurrency(stats.totalPayments)}</div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          تفاصيل حسابات الموردين
        </h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-right font-semibold">م</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">اسم المورد</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">الهاتف</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">البريد الإلكتروني</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">الرصيد الافتتاحي</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">الرصيد الحالي</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">حد الائتمان</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">نوع الحساب</th>
              <th className="border border-gray-400 p-2 text-right font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={supplier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-400 p-2 font-medium">{supplier.name}</td>
                <td className="border border-gray-400 p-2">{supplier.phone}</td>
                <td className="border border-gray-400 p-2">{supplier.email || '-'}</td>
                <td className="border border-gray-400 p-2 text-center">
                  {formatCurrency(supplier.openingBalance)}
                </td>
                <td className={`border border-gray-400 p-2 text-center font-semibold ${
                  parseFloat(supplier.balance || supplier.currentBalance || '0') > 0 ? 'text-green-700' : 
                  parseFloat(supplier.balance || supplier.currentBalance || '0') < 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {formatCurrency(supplier.balance || supplier.currentBalance)}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {formatCurrency(supplier.creditLimit)}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {supplier.accountType === 'credit' ? 'آجل' : 
                   supplier.accountType === 'cash' ? 'نقدي' : 'مختلط'}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Vouchers Table */}
      {paymentVouchers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            ملخص سندات الدفع الأخيرة
          </h2>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-right font-semibold">رقم السند</th>
                <th className="border border-gray-400 p-2 text-right font-semibold">المورد</th>
                <th className="border border-gray-400 p-2 text-right font-semibold">المبلغ</th>
                <th className="border border-gray-400 p-2 text-right font-semibold">طريقة الدفع</th>
                <th className="border border-gray-400 p-2 text-right font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {paymentVouchers.slice(0, 10).map((voucher, index) => {
                const supplier = suppliers.find(s => s.id === voucher.supplierId);
                return (
                  <tr key={voucher.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 p-2 text-center font-medium">
                      {voucher.voucherNumber}
                    </td>
                    <td className="border border-gray-400 p-2">{supplier?.name || 'غير محدد'}</td>
                    <td className="border border-gray-400 p-2 text-center font-semibold text-green-700">
                      {formatCurrency(voucher.amount)}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {voucher.paymentMethod === 'cash' ? 'نقدي' : 
                       voucher.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 
                       voucher.paymentMethod === 'check' ? 'شيك' : voucher.paymentMethod}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {new Date(voucher.paymentDate).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
        <p className="font-semibold mb-2"></p>
        <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('en-GB')} الساعة {new Date().toLocaleTimeString('en-US')}</p>
        <p>جميع الحقوق محفوظة © 2025</p>
      </div>

      <style>{`
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
          }
          .print-container { 
            padding: 20px; 
            font-size: 12px;
          }
          .company-header {
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid #000;
            padding: 15px;
          }
          .company-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 11px;
            color: #666;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            margin: 20px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 20px 0;
          }
          .stat-card {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
          }
          .stat-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 14px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: right;
          }
          th {
            background: #f0f0f0;
            font-weight: bold;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}