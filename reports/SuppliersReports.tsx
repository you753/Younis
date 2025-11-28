import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Printer, Search, Users, DollarSign, TrendingUp, Building2, Eye, Calculator, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SupplierReport {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  totalPurchases: number;
  totalPayments: number;
  currentBalance: number;
  openingBalance: number;
  lastTransactionDate?: string;
  totalTransactions: number;
  averageTransactionValue: number;
  status: 'active' | 'inactive';
}

export default function SuppliersReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [suppliersReportData, setSuppliersReportData] = useState<SupplierReport[]>([]);
  
  const { user } = useAuth();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const { data: paymentVouchers = [] } = useQuery({
    queryKey: ['/api/supplier-payment-vouchers'],
  });

  // جلب إعدادات الشركة المحدثة تلقائياً
  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any) => data?.الشركة?.companyInfo || {}
  });

  useEffect(() => {
    if (suppliers.length > 0) {
      generateReportData();
    }
  }, [suppliers, paymentVouchers, selectedSupplier]);

  const generateReportData = () => {
    let filteredSuppliers = suppliers;

    if (selectedSupplier !== 'all') {
      filteredSuppliers = suppliers.filter((s: any) => s.id.toString() === selectedSupplier);
    }

    const reportData = filteredSuppliers.map((supplier: any) => {
      const supplierPayments = paymentVouchers.filter((v: any) => v.supplierId === supplier.id);
      
      const totalPayments = supplierPayments.reduce((sum: number, v: any) => sum + parseFloat(v.amount || '0'), 0);
      const openingBalance = parseFloat(supplier.balance || '0');
      const currentBalance = openingBalance - totalPayments;

      return {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        totalPurchases: openingBalance,
        totalPayments,
        currentBalance,
        openingBalance,
        lastTransactionDate: supplierPayments.length > 0 ? supplierPayments[supplierPayments.length - 1].paymentDate : undefined,
        totalTransactions: supplierPayments.length,
        averageTransactionValue: supplierPayments.length > 0 ? totalPayments / supplierPayments.length : 0,
        status: 'active' as const
      };
    });

    setSuppliersReportData(reportData);
  };

  const filteredReportData = suppliersReportData.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalStats = () => {
    const totalSuppliers = filteredReportData.length;
    const totalCurrentBalance = filteredReportData.reduce((sum, s) => sum + s.currentBalance, 0);
    const totalPayments = filteredReportData.reduce((sum, s) => sum + s.totalPayments, 0);
    const totalOpeningBalance = filteredReportData.reduce((sum, s) => sum + s.openingBalance, 0);
    const activeSuppliers = filteredReportData.filter(s => s.totalTransactions > 0).length;

    return { totalSuppliers, totalCurrentBalance, totalPayments, totalOpeningBalance, activeSuppliers };
  };

  const handlePrintReport = async () => {
    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stats = getTotalStats();

    const summaryData = [
      {
        label: 'إجمالي الموردين',
        value: stats.totalSuppliers.toString()
      },
      {
        label: 'الموردين النشطين',
        value: stats.activeSuppliers.toString()
      },
      {
        label: 'إجمالي الأرصدة',
        value: `${stats.totalCurrentBalance.toLocaleString('en-US')} ر.س`
      },
      {
        label: 'إجمالي المدفوعات',
        value: `${stats.totalPayments.toLocaleString('en-US')} ر.س`
      }
    ];

    const suppliersTable = `
      <table class="summary-table" style="margin-top: 20px;">
        <thead>
          <tr>
            <th>م</th>
            <th>اسم المورد</th>
            <th>الهاتف</th>
            <th>الرصيد الافتتاحي</th>
            <th>إجمالي المدفوعات</th>
            <th>الرصيد الحالي</th>
            <th>عدد المعاملات</th>
          </tr>
        </thead>
        <tbody>
          ${filteredReportData.map((supplier, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${supplier.name}</td>
              <td>${supplier.phone || 'غير محدد'}</td>
              <td>${supplier.openingBalance.toLocaleString('en-US')} ر.س</td>
              <td>${supplier.totalPayments.toLocaleString('en-US')} ر.س</td>
              <td>${supplier.currentBalance.toLocaleString('en-US')} ر.س</td>
              <td>${supplier.totalTransactions}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const htmlContent = generateUnifiedInvoice({
      title: 'تقرير الموردين الشامل',
      invoiceNumber: `SUP-RPT-${Date.now()}`,
      entityName: 'جميع الموردين',
      entityDetails: {
        id: stats.totalSuppliers,
        type: 'تقرير شامل',
        status: `${stats.activeSuppliers} نشط من ${stats.totalSuppliers}`
      },
      summaryData,
      user,
      additionalContent: suppliersTable
    });

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleViewDetails = async (supplier: SupplierReport) => {
    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
    
    const detailsWindow = window.open('', '_blank');
    if (!detailsWindow) return;

    const summaryData = [
      {
        label: 'رقم الهاتف',
        value: supplier.phone || 'غير محدد'
      },
      {
        label: 'البريد الإلكتروني',
        value: supplier.email || 'غير محدد'
      },
      {
        label: 'الرصيد الافتتاحي',
        value: `${supplier.openingBalance.toLocaleString('en-US')} ر.س`
      },
      {
        label: 'إجمالي المدفوعات',
        value: `${supplier.totalPayments.toLocaleString('en-US')} ر.س`
      },
      {
        label: 'الرصيد الحالي',
        value: `${supplier.currentBalance.toLocaleString('en-US')} ر.س`
      },
      {
        label: 'عدد المعاملات',
        value: supplier.totalTransactions.toString()
      },
      {
        label: 'متوسط قيمة المعاملة',
        value: `${supplier.averageTransactionValue.toLocaleString('en-US')} ر.س`
      },
      {
        label: 'آخر معاملة',
        value: supplier.lastTransactionDate ? new Date(supplier.lastTransactionDate).toLocaleDateString('en-GB') : 'لا توجد معاملات'
      }
    ];

    const htmlContent = generateUnifiedInvoice({
      title: 'تفاصيل المورد',
      invoiceNumber: `SUP-DTL-${supplier.id}`,
      entityName: supplier.name,
      entityDetails: {
        id: supplier.id,
        phone: supplier.phone,
        email: supplier.email,
        type: 'مورد',
        status: supplier.status === 'active' ? 'نشط' : 'غير نشط'
      },
      summaryData,
      user
    });

    detailsWindow.document.write(htmlContent);
    detailsWindow.document.close();
  };
  const stats = getTotalStats();

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header بسيط */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">تقرير الموردين الشامل</h1>
          <p className="text-gray-600 mt-2">تاريخ التقرير: {new Date().toLocaleDateString('en-GB')} | الوقت: {new Date().toLocaleTimeString('en-US')}</p>
        </div>
      </div>

      {/* الإحصائيات في شبكة بسيطة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-gray-800">{stats.totalSuppliers}</div>
          <div className="text-gray-600 mt-2">إجمالي الموردين</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-gray-800">{stats.activeSuppliers}</div>
          <div className="text-gray-600 mt-2">الموردين النشطين</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className={`text-2xl font-bold ${stats.totalCurrentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.totalCurrentBalance.toLocaleString('en-US')} ر.س
          </div>
          <div className="text-gray-600 mt-2">إجمالي الأرصدة</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">
            {stats.totalPayments.toLocaleString('en-US')} ر.س
          </div>
          <div className="text-gray-600 mt-2">إجمالي المدفوعات</div>
        </div>
      </div>

      {/* البحث البسيط */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-4">
          <Input
            placeholder="البحث في أسماء الموردين..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handlePrintReport} className="px-6">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* تفاصيل الموردين في شبكة بطاقات */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b">تفاصيل الموردين</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReportData.map((supplier) => (
            <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-gray-800 mb-3">{supplier.name}</div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف</span>
                  <span className="font-medium">{supplier.phone || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد المعاملات</span>
                  <span className="font-medium">{supplier.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الافتتاحي</span>
                  <span className={`font-medium ${supplier.openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {supplier.openingBalance.toLocaleString('en-US')} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي المدفوعات</span>
                  <span className="font-medium text-purple-600">
                    {supplier.totalPayments.toLocaleString('en-US')} ر.س
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">الرصيد الحالي</span>
                  <span className={`font-bold ${supplier.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {supplier.currentBalance.toLocaleString('en-US')} ر.س
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReportData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد بيانات متاحة للعرض
          </div>
        )}
      </div>
    </div>
  );
}