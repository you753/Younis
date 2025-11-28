import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';

interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance: string;
  currentBalance: string;
  creditLimit: string;
  accountType: string;
  status: string;
  createdAt: string;
}

interface ClientAccountsPrintReportProps {
  clients: Client[];
  analytics: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    totalBalances: number;
    totalCreditLimits: number;
    totalOpeningBalances: number;
    clientsWithDebt: number;
    clientsWithCredit: number;
  };
}

export default function ClientAccountsPrintReport({ clients, analytics }: ClientAccountsPrintReportProps) {
  const { format: formatAmount } = useCurrency();
  const { settings } = useAppStore();
  
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  return (
    <div className="print:block hidden">
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { font-family: 'Arial', sans-serif; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            @page { 
              margin: 15mm; 
              size: A4;
            }
          }
        `}
      </style>
      
      <div className="bg-white p-8 text-black">
        {/* Header with Logo in Center */}
        <div className="border-b-2 border-gray-300 pb-6 mb-8">
          {/* Company Logo in Center */}
          <div className="flex justify-center mb-6">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="شعار الشركة" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-300">
                {user?.fullName?.charAt(0) || 'ش'}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              
              <p className="text-gray-600">نظام إدارة العملاء</p>
              <p className="text-gray-500 text-sm mt-2">
                المملكة العربية السعودية | الهاتف: +966 XX XXX XXXX
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">تقرير حسابات العملاء</h2>
              <div className="text-sm text-gray-600">
                <p>رقم التقرير: CLT-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}</p>
                <p>تاريخ الإنشاء: {new Date().toLocaleDateString('en-GB')}</p>
                <p>وقت الطباعة: {new Date().toLocaleTimeString('en-US')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">ملخص التقرير</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{analytics.totalClients}</div>
              <div className="text-gray-600 text-sm">إجمالي العملاء</div>
            </div>
            <div className="bg-green-50 p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{analytics.activeClients}</div>
              <div className="text-gray-600 text-sm">عملاء نشطين</div>
            </div>
            <div className="bg-blue-50 p-4 border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{formatAmount(analytics.totalBalances)}</div>
              <div className="text-gray-600 text-sm">إجمالي الأرصدة</div>
            </div>
            <div className="bg-purple-50 p-4 border border-purple-200">
              <div className="text-xl font-bold text-purple-600">{formatAmount(analytics.totalCreditLimits)}</div>
              <div className="text-gray-600 text-sm">حدود الائتمان</div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل العملاء</h3>
          <div className="border border-gray-300">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-center p-3 font-bold border-l border-gray-300">#</th>
                  <th className="text-right p-3 font-bold border-l border-gray-300">اسم العميل</th>
                  <th className="text-center p-3 font-bold border-l border-gray-300">الهاتف</th>
                  <th className="text-center p-3 font-bold border-l border-gray-300">الرصيد الافتتاحي</th>
                  <th className="text-center p-3 font-bold border-l border-gray-300">الرصيد الحالي</th>
                  <th className="text-center p-3 font-bold border-l border-gray-300">حد الائتمان</th>
                  <th className="text-center p-3 font-bold border-l border-gray-300">نوع الحساب</th>
                  <th className="text-center p-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => {
                  const currentBalance = parseFloat(client.currentBalance);
                  const openingBalance = parseFloat(client.openingBalance);
                  const creditLimit = parseFloat(client.creditLimit);
                  
                  return (
                    <tr key={client.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                      <td className="p-3 text-center font-bold border-l border-gray-200">{index + 1}</td>
                      <td className="p-3 border-l border-gray-200">
                        <div>
                          <div className="font-bold">{client.name}</div>
                          {client.email && (
                            <div className="text-xs text-gray-500">{client.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center border-l border-gray-200">
                        {client.phone || 'غير محدد'}
                      </td>
                      <td className="p-3 text-center font-semibold border-l border-gray-200">
                        <span className={openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatAmount(openingBalance)}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold border-l border-gray-200">
                        <span className={currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatAmount(currentBalance)}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-blue-600 border-l border-gray-200">
                        {formatAmount(creditLimit)}
                      </td>
                      <td className="p-3 text-center border-l border-gray-200">
                        {client.accountType || 'غير محدد'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold ${
                          client.status === 'active' 
                            ? 'text-green-800' 
                            : 'text-gray-600'
                        }`}>
                          {client.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-300 p-4">
            <h4 className="font-bold text-gray-800 mb-3">توزيع الأرصدة</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>عملاء برصيد موجب:</span>
                <span className="font-bold text-green-600">{analytics.clientsWithCredit}</span>
              </div>
              <div className="flex justify-between">
                <span>عملاء برصيد سالب:</span>
                <span className="font-bold text-red-600">{analytics.clientsWithDebt}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">إجمالي الأرصدة الافتتاحية:</span>
                <span className="font-bold">{formatAmount(analytics.totalOpeningBalances)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 p-4">
            <h4 className="font-bold text-gray-800 mb-3">إحصائيات عامة</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>إجمالي العملاء:</span>
                <span className="font-bold">{analytics.totalClients}</span>
              </div>
              <div className="flex justify-between">
                <span>العملاء النشطين:</span>
                <span className="font-bold text-green-600">{analytics.activeClients}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">إجمالي حدود الائتمان:</span>
                <span className="font-bold">{formatAmount(analytics.totalCreditLimits)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <p>تم إنشاء التقرير</p>
              <p>تاريخ الطباعة: {new Date().toLocaleString('en-US')}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{settings.companyName || 'اسم الشركة'}</p>
              <p>تقرير حسابات العملاء</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}