import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Search, Eye, Printer, FileText, CreditCard, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  balance: number;
  creditLimit: number;
  openingBalance: number;
}

interface Sale {
  id: number;
  clientId: number;
  invoiceNumber: string;
  totalAmount: number;
  date: string;
  status: string;
}

interface ReceiptVoucher {
  id: number;
  clientId: number;
  voucherNumber: string;
  amount: number;
  date: string;
  description: string;
}

// Helper functions for number formatting
const formatNumber = (num: number) => {
  if (isNaN(num) || num === null || num === undefined) return '0.00 ر.س';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatCurrency = (num: number) => {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function NewProfessionalClientAccounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients data
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useQuery({
    queryKey: ['/api/clients'],
    enabled: true
  });

  // Fetch sales data for statements
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
    enabled: true
  });

  // Fetch receipt vouchers data
  const { data: receiptVouchers = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
    enabled: true
  });

  // Type safe arrays
  const typedClients = clients as Client[];
  const typedSales = sales as Sale[];
  const typedReceiptVouchers = receiptVouchers as ReceiptVoucher[];

  // Calculate statistics
  const totalClients = typedClients.length;
  const activeClients = typedClients.filter((c: Client) => c.status === 'active').length;
  const totalBalances = typedClients.reduce((sum: number, c: Client) => sum + (c.balance || 0), 0);
  const highDebtClients = typedClients.filter((c: Client) => (c.balance || 0) > 10000).length;

  // Filter clients based on search
  const filteredClients = typedClients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get client transactions for statement
  const getClientTransactions = (clientId: number) => {
    const clientSales = typedSales.filter((sale: Sale) => sale.clientId === clientId);
    const clientReceipts = typedReceiptVouchers.filter((voucher: ReceiptVoucher) => voucher.clientId === clientId);
    
    const transactions = [
      ...clientSales.map((sale: Sale) => ({
        id: sale.id,
        date: sale.date,
        description: `فاتورة مبيعات ${sale.invoiceNumber}`,
        debit: sale.totalAmount,
        credit: 0,
        type: 'sale'
      })),
      ...clientReceipts.map((receipt: ReceiptVoucher) => ({
        id: receipt.id,
        date: receipt.date,
        description: `سند قبض ${receipt.voucherNumber}`,
        debit: 0,
        credit: receipt.amount,
        type: 'receipt'
      }))
    ];

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchClients(),
        queryClient.invalidateQueries({ queryKey: ['/api/sales'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers'] })
      ]);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات العملاء والحسابات"
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث البيانات",
        variant: "destructive"
      });
    }
  };

  // Handle view client statement
  const handleViewStatement = (client: Client) => {
    setSelectedClient(client);
    setShowStatement(true);
  };

  // Enhanced print client statement with detailed formatting
  const printClientStatement = () => {
    if (!selectedClient) return;

    const transactions = getClientTransactions(selectedClient.id);
    let runningBalance = selectedClient.openingBalance || 0;
    
    // Calculate advanced statistics
    const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
    const averageTransaction = transactions.length > 0 ? (totalDebits + totalCredits) / transactions.length : 0;
    const salesCount = transactions.filter(t => t.type === 'sale').length;
    const receiptsCount = transactions.filter(t => t.type === 'receipt').length;

    const printContent = `
      <html dir="rtl">
        <head>
          <title>كشف حساب العميل - ${selectedClient.name}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              direction: rtl; 
              color: #000;
              line-height: 1.4;
            }
            
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 15px; 
              margin-bottom: 20px; 
            }
            
            .company-name { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            
            .report-title { 
              font-size: 16px; 
              margin: 5px 0;
            }
            
            .client-info { 
              border: 1px solid #000; 
              padding: 15px; 
              margin: 15px 0; 
            }
            
            .info-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
            }
            
            .summary { 
              border: 1px solid #000; 
              padding: 15px; 
              margin: 15px 0; 
            }
            
            .transactions-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              border: 1px solid #000;
            }
            
            .transactions-table th {
              background: #f0f0f0;
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
            }
            
            .transactions-table td {
              border: 1px solid #000;
              padding: 6px;
              text-align: center;
              font-size: 11px;
            }
            
            .transactions-table tbody tr:nth-child(even) {
              background: #f9f9f9;
            }
            
            .opening-balance-row {
              background: #e8e8e8 !important;
              font-weight: bold;
            }
            
            .debit { color: #d00; font-weight: bold; }
            .credit { color: #080; font-weight: bold; }
            .balance-cell { font-weight: bold; }
            
            .totals { 
              border: 1px solid #000; 
              padding: 15px; 
              margin: 15px 0; 
            }
            
            .totals-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .total-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px dotted #ccc;
            }
            
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            
            <div class="report-title">كشف حساب العميل</div>
          </div>
          
          <div class="client-info">
            <div class="info-title">بيانات العميل</div>
            <div class="info-grid">
              <div class="info-item">
                <span>اسم العميل:</span>
                <strong>${selectedClient.name}</strong>
              </div>
              <div class="info-item">
                <span>رقم العميل:</span>
                <strong>#${selectedClient.id}</strong>
              </div>
              <div class="info-item">
                <span>رقم الهاتف:</span>
                <strong>${selectedClient.phone}</strong>
              </div>
              <div class="info-item">
                <span>البريد الإلكتروني:</span>
                <strong>${selectedClient.email}</strong>
              </div>
            </div>
          </div>

          <div class="summary">
            <div class="info-title">ملخص الحساب</div>
            <div class="info-grid">
              <div class="info-item">
                <span>الرصيد الافتتاحي:</span>
                <strong>${formatCurrency(selectedClient.openingBalance || 0)} ر.س</strong>
              </div>
              <div class="info-item">
                <span>الرصيد الحالي:</span>
                <strong>${formatCurrency(selectedClient.balance || 0)} ر.س</strong>
              </div>
              <div class="info-item">
                <span>الحد الائتماني:</span>
                <strong>${formatCurrency(selectedClient.creditLimit || 0)} ر.س</strong>
              </div>
              <div class="info-item">
                <span>حالة الحساب:</span>
                <strong>${selectedClient.status === 'active' ? 'نشط' : 'غير نشط'}</strong>
              </div>
            </div>
          </div>

          <table class="transactions-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المرجع</th>
                <th>البيان</th>
                <th>النوع</th>
                <th>مدين</th>
                <th>دائن</th>
                <th>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              <tr class="opening-balance-row">
                <td>-</td>
                <td>-</td>
                <td>الرصيد الافتتاحي</td>
                <td>افتتاحي</td>
                <td>-</td>
                <td>-</td>
                <td>${formatCurrency(runningBalance)} ر.س</td>
              </tr>
              ${transactions.map(transaction => {
                runningBalance += transaction.debit - transaction.credit;
                return `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                    <td>#${transaction.id}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.type === 'sale' ? 'مبيعات' : 'قبض'}</td>
                    <td class="debit">${transaction.debit ? formatCurrency(transaction.debit) + ' ر.س' : '-'}</td>
                    <td class="credit">${transaction.credit ? formatCurrency(transaction.credit) + ' ر.س' : '-'}</td>
                    <td class="balance-cell">${formatCurrency(runningBalance)} ر.س</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="info-title">الإجماليات</div>
            <div class="totals-grid">
              <div class="total-item">
                <span>إجمالي المديونية:</span>
                <strong class="debit">${formatCurrency(totalDebits)} ر.س</strong>
              </div>
              <div class="total-item">
                <span>إجمالي المدفوعات:</span>
                <strong class="credit">${formatCurrency(totalCredits)} ر.س</strong>
              </div>
              <div class="total-item">
                <span>عدد المعاملات:</span>
                <strong>${transactions.length}</strong>
              </div>
              <div class="total-item">
                <span>الرصيد النهائي:</span>
                <strong>${formatCurrency(selectedClient.balance || 0)} ر.س</strong>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (clientsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">جاري تحميل بيانات العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">حسابات العملاء</h1>
          <p className="text-gray-600">إدارة حسابات العملاء وكشوف الحسابات</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Simple Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">العملاء النشطون</p>
                <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(totalBalances)}</p>
              </div>
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مديونية عالية</p>
                <p className="text-2xl font-bold text-gray-900">{highDebtClients}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Clients Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">قائمة العملاء المفصلة</CardTitle>
          <p className="text-sm text-gray-600 mt-1">عرض شامل لجميع حسابات العملاء والأرصدة</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-right p-4 font-semibold text-gray-700">اسم العميل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">معلومات التواصل</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الافتتاحي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الرصيد الحالي</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client: Client, index) => (
                  <tr key={client.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">العميل #{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                        {client.address && <p className="text-xs text-gray-400">{client.address}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium">
                          {formatCurrency(client.openingBalance || 0)} ر.س
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                          (client.balance || 0) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatCurrency(client.balance || 0)} ر.س
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                        className={client.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {client.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleViewStatement(client)}
                        size="sm"
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        كشف حساب
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Statement Dialog */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>كشف حساب العميل: {selectedClient?.name}</span>
              <Button onClick={printClientStatement} size="sm" variant="outline">
                <Printer className="h-4 w-4 ml-1" />
                طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle>بيانات العميل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">اسم العميل</p>
                      <p className="font-medium">{selectedClient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-medium">{selectedClient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">العنوان</p>
                      <p className="font-medium">{selectedClient.address || 'غير محدد'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Balance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center">
                      <CreditCard className="h-5 w-5 ml-2" />
                      ملخص الحساب المالي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-600">الرصيد الافتتاحي</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(selectedClient.openingBalance || 0)} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-600">الرصيد الحالي</span>
                        <span className={`text-lg font-bold ${(selectedClient.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(selectedClient.balance || 0)} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-600">الحد الائتماني</span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(selectedClient.creditLimit || 0)} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-600">صافي الحركة</span>
                        <span className={`text-lg font-bold ${Math.abs((selectedClient.balance || 0) - (selectedClient.openingBalance || 0)) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(Math.abs((selectedClient.balance || 0) - (selectedClient.openingBalance || 0)))} ر.س
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center">
                      <TrendingUp className="h-5 w-5 ml-2" />
                      إحصائيات المعاملات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const transactions = getClientTransactions(selectedClient.id);
                        const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
                        const totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
                        const salesCount = transactions.filter(t => t.type === 'sale').length;
                        const receiptsCount = transactions.filter(t => t.type === 'receipt').length;
                        
                        return (
                          <>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="text-sm font-medium text-gray-600">إجمالي المديونية</span>
                              <span className="text-lg font-bold text-red-600">
                                {formatCurrency(totalDebits)} ر.س
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="text-sm font-medium text-gray-600">إجمالي المدفوعات</span>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(totalCredits)} ر.س
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="text-sm font-medium text-gray-600">عدد فواتير المبيعات</span>
                              <span className="text-lg font-bold text-blue-600">{salesCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="text-sm font-medium text-gray-600">عدد سندات القبض</span>
                              <span className="text-lg font-bold text-purple-600">{receiptsCount}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Simple Transactions Table */}
              <Card className="border border-gray-300 mt-6">
                <CardHeader className="bg-gray-100 border-b border-gray-300">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 ml-2" />
                    سجل المعاملات المالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-300">
                        <tr>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">التاريخ</th>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">المرجع</th>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">البيان</th>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">النوع</th>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">مدين</th>
                          <th className="text-right p-3 font-semibold text-gray-700 border-r border-gray-300">دائن</th>
                          <th className="text-right p-3 font-semibold text-gray-700">الرصيد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const transactions = getClientTransactions(selectedClient.id);
                          let runningBalance = selectedClient.openingBalance || 0;
                          
                          return (
                            <>
                              {/* Opening Balance Row */}
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <td className="p-3 text-center border-r border-gray-300">-</td>
                                <td className="p-3 text-center border-r border-gray-300">-</td>
                                <td className="p-3 text-right border-r border-gray-300">
                                  <span className="font-bold">الرصيد الافتتاحي للحساب</span>
                                </td>
                                <td className="p-3 text-center border-r border-gray-300">
                                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">افتتاحي</span>
                                </td>
                                <td className="p-3 text-center border-r border-gray-300">-</td>
                                <td className="p-3 text-center border-r border-gray-300">-</td>
                                <td className="p-3 text-center">
                                  <span className="font-bold">{formatCurrency(runningBalance)} ر.س</span>
                                </td>
                              </tr>
                              
                              {/* Transaction Rows */}
                              {transactions.map((transaction, index) => {
                                runningBalance += transaction.debit - transaction.credit;
                                return (
                                  <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="p-3 text-center border-r border-gray-300">
                                      {new Date(transaction.date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="p-3 text-center border-r border-gray-300">
                                      #{transaction.id}
                                    </td>
                                    <td className="p-3 text-right border-r border-gray-300">
                                      {transaction.description}
                                    </td>
                                    <td className="p-3 text-center border-r border-gray-300">
                                      <span className={`px-2 py-1 rounded text-sm ${
                                        transaction.type === 'sale' 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {transaction.type === 'sale' ? 'مبيعات' : 'قبض'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center border-r border-gray-300">
                                      {transaction.debit ? (
                                        <span className="text-red-600 font-semibold">
                                          {formatCurrency(transaction.debit)} ر.س
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="p-3 text-center border-r border-gray-300">
                                      {transaction.credit ? (
                                        <span className="text-green-600 font-semibold">
                                          {formatCurrency(transaction.credit)} ر.س
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="font-semibold">
                                        {formatCurrency(runningBalance)} ر.س
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                              
                              {/* Summary Row */}
                              <tr className="bg-gray-100 border-t-2 border-gray-400 font-bold">
                                <td colSpan={4} className="p-3 text-right border-r border-gray-300">
                                  الإجمالي:
                                </td>
                                <td className="p-3 text-center border-r border-gray-300">
                                  <span className="text-red-600">
                                    {formatCurrency(transactions.reduce((sum, t) => sum + t.debit, 0))} ر.س
                                  </span>
                                </td>
                                <td className="p-3 text-center border-r border-gray-300">
                                  <span className="text-green-600">
                                    {formatCurrency(transactions.reduce((sum, t) => sum + t.credit, 0))} ر.س
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="font-bold">
                                    {formatCurrency(selectedClient.balance || 0)} ر.س
                                  </span>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}