import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, DollarSign, CreditCard, FileText, Eye, Printer } from 'lucide-react';

// Types - API returns numbers as strings sometimes
interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  status: 'active' | 'inactive';
  balance: number | string;
  creditLimit?: number | string;
  openingBalance: number | string;
}

// Simple number formatting - handles both strings and numbers
const formatAmount = (amount: number | string): string => {
  if (!amount || amount === 0 || amount === '0') return '0';
  // Convert to number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toString();
};

export default function CleanClientAccounts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showStatement, setShowStatement] = useState(false);

  // Fetch clients data
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    select: (data) => data || []
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

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone || '').includes(searchTerm) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics - handle string numbers from API
  const totalClients = filteredClients.length;
  const activeClients = filteredClients.filter(c => c.status === 'active').length;
  const totalOpeningBalance = filteredClients.reduce((sum, c) => {
    const balance = typeof c.openingBalance === 'string' ? parseFloat(c.openingBalance) : (c.openingBalance || 0);
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);
  const totalCurrentBalance = filteredClients.reduce((sum, c) => {
    const balance = typeof c.balance === 'string' ? parseFloat(c.balance) : (c.balance || 0);
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  // Handle showing client statement
  const handleShowStatement = (client: Client) => {
    setSelectedClient(client);
    setShowStatement(true);
  };

  // Calculate final balance after all transactions
  const calculateFinalBalance = (client: Client, transactions: any[]) => {
    const openingBalance = parseFloat(formatAmount(client.openingBalance || client.creditLimit || 0));
    const voucherTotal = transactions
      .filter(t => t.type === 'سند قبض')
      .reduce((sum, t) => sum + t.credit, 0);
    return openingBalance - voucherTotal + parseFloat(formatAmount(client.balance || 0));
  };

  // Print client statement directly (professional black & white)
  const printClientStatementDirect = (client: Client) => {
    const transactions = getClientTransactions(client.id);
    let runningBalance = parseFloat(formatAmount(client.openingBalance || client.creditLimit || 0));
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب عميل - ${client.name}</title>
        <style>
          @media print { body { margin: 0; padding: 15px; } }
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            margin: 20px;
            background: white;
            color: black;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid black; 
            padding-bottom: 20px; 
          }
          .document-title { 
            font-size: 28px; 
            font-weight: bold;
            color: black; 
            margin-bottom: 10px; 
          }
          .client-info { 
            margin: 20px 0; 
            padding: 20px; 
            border: 2px solid black; 
            background: white;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 20px; 
          }
          .info-item { margin-bottom: 15px; }
          .info-label { 
            font-weight: bold; 
            color: black; 
            font-size: 14px;
            margin-bottom: 5px;
          }
          .info-value { 
            color: black; 
            margin-top: 5px; 
            font-size: 16px;
            font-weight: 600;
          }
          .transactions-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            border: 2px solid black;
          }
          .transactions-table th, .transactions-table td { 
            border: 1px solid black; 
            padding: 12px 8px; 
            text-align: center; 
          }
          .transactions-table th { 
            background: white; 
            font-weight: bold; 
            color: black;
            font-size: 15px;
          }
          .transactions-table td {
            color: black;
            font-size: 14px;
          }
          .debit, .credit, .balance { 
            font-weight: bold; 
            color: black;
          }
          .no-transactions { 
            text-align: center; 
            padding: 40px; 
            color: black; 
            font-size: 16px;
            border: 2px solid black;
            margin-top: 20px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 13px; 
            color: black; 
            border-top: 2px solid black; 
            padding-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="document-title">كشف حساب عميل</div>
          <div style="font-size: 14px; color: black; margin-top: 10px;">التاريخ: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <div class="client-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">اسم العميل:</div>
              <div class="info-value">${client.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الكود:</div>
              <div class="info-value">CLI${client.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الهاتف:</div>
              <div class="info-value">${client.phone || 'غير محدد'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرصيد الافتتاحي:</div>
              <div class="info-value">${formatAmount(client.openingBalance || client.creditLimit || 0)} ريال</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرصيد الحالي:</div>
              <div class="info-value">${formatAmount(client.balance || 0)} ريال</div>
            </div>
            <div class="info-item">
              <div class="info-label">الحالة:</div>
              <div class="info-value">${client.status === 'active' ? 'نشط' : 'غير نشط'}</div>
            </div>
          </div>
        </div>

        ${transactions.length === 0 ? 
          '<div class="no-transactions">لا توجد معاملات مالية لهذا العميل</div>' :
          `<table class="transactions-table">
            <thead>
              <tr>
                <th style="width: 12%">التاريخ</th>
                <th style="width: 15%">نوع المعاملة</th>
                <th style="width: 12%">المرجع</th>
                <th style="width: 25%">الوصف</th>
                <th style="width: 12%">مدين</th>
                <th style="width: 12%">دائن</th>
                <th style="width: 12%">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => {
                runningBalance += transaction.debit - transaction.credit;
                return `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.reference}</td>
                    <td style="text-align: right; padding-right: 10px;">${transaction.description}</td>
                    <td class="debit">${transaction.debit > 0 ? formatAmount(transaction.debit) + ' ر.س' : '-'}</td>
                    <td class="credit">${transaction.credit > 0 ? formatAmount(transaction.credit) + ' ر.س' : '-'}</td>
                    <td class="balance">${formatAmount(runningBalance)} ر.س</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>`
        }

        <div class="footer">
          <div style="font-weight: bold;">تاريخ الطباعة: ${new Date().toLocaleString('en-US')}</div>
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

  // Print client statement
  const printClientStatement = () => {
    if (!selectedClient) return;
    
    const transactions = getClientTransactions(selectedClient.id);
    let runningBalance = parseFloat(formatAmount(selectedClient.openingBalance || selectedClient.creditLimit || 0));
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب عميل - ${selectedClient.name}</title>
        <style>
          @media print { body { margin: 0; } }
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .document-title { font-size: 20px; color: #666; margin-bottom: 10px; }
          .client-info { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; }
          .info-item { margin-bottom: 10px; }
          .info-label { font-weight: bold; color: #333; }
          .info-value { color: #666; margin-top: 3px; }
          .transactions-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .transactions-table th, .transactions-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          .transactions-table th { background-color: #f5f5f5; font-weight: bold; }
          .debit { color: #dc2626; font-weight: bold; }
          .credit { color: #16a34a; font-weight: bold; }
          .balance { font-weight: bold; color: #333; }
          .no-transactions { text-align: center; padding: 40px; color: #666; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          
          <div class="document-title">كشف حساب عميل</div>
          <div style="font-size: 14px; color: #666;">التاريخ: ${new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <div class="client-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">اسم العميل:</div>
              <div class="info-value">${selectedClient.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الهاتف:</div>
              <div class="info-value">${selectedClient.phone || 'غير محدد'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرصيد الافتتاحي:</div>
              <div class="info-value">${formatAmount(selectedClient.openingBalance || selectedClient.creditLimit || 0)} ريال</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرصيد الحالي:</div>
              <div class="info-value">${formatAmount(selectedClient.balance || 0)} ريال</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرصيد النهائي:</div>
              <div class="info-value" style="font-weight: bold; color: #16a34a;">${formatAmount(calculateFinalBalance(selectedClient, transactions))} ريال</div>
            </div>
          </div>
        </div>

        ${transactions.length === 0 ? 
          '<div class="no-transactions">لا توجد معاملات مالية لهذا العميل</div>' :
          `<table class="transactions-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع المعاملة</th>
                <th>المرجع</th>
                <th>الوصف</th>
                <th>مدين</th>
                <th>دائن</th>
                <th>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => {
                runningBalance += transaction.debit - transaction.credit;
                return `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.reference}</td>
                    <td>${transaction.description}</td>
                    <td class="debit">${transaction.debit > 0 ? formatAmount(transaction.debit) + ' ريال' : '-'}</td>
                    <td class="credit">${transaction.credit > 0 ? formatAmount(transaction.credit) + ' ريال' : '-'}</td>
                    <td class="balance">${formatAmount(runningBalance)} ريال</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>`
        }

        <div class="footer">
          
          <div>تاريخ الطباعة: ${new Date().toLocaleString('en-US')}</div>
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

  // Get client transactions for statement
  const getClientTransactions = (clientId: number) => {
    // فقط المبيعات المرحلة (sentToClientAccount === true)
    const clientSales = (sales as any[]).filter((sale: any) => 
      sale.clientId === clientId && sale.sentToClientAccount === true
    );
    const clientVouchers = (receiptVouchers as any[]).filter((voucher: any) => voucher.clientId === clientId);
    
    const transactions = [
      ...clientSales.map((sale: any) => ({
        id: sale.id,
        date: sale.date || sale.createdAt,
        type: 'فاتورة مبيعات',
        reference: sale.invoiceNumber,
        debit: parseFloat(sale.total) || 0,
        credit: 0,
        description: `فاتورة مبيعات رقم ${sale.invoiceNumber}`
      })),
      ...clientVouchers.map((voucher: any) => ({
        id: voucher.id,
        date: voucher.receiptDate || voucher.createdAt,
        type: 'سند قبض',
        reference: voucher.voucherNumber,
        debit: 0,
        credit: parseFloat(voucher.amount) || 0,
        description: voucher.description || 'سند قبض'
      }))
    ];

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">حسابات العملاء</h1>
        <p className="text-gray-600 mt-2">إدارة حسابات العملاء والمعاملات المالية</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">العملاء النشطين</p>
                <p className="text-2xl font-bold text-green-600">{activeClients}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الأرصدة الافتتاحية</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(totalOpeningBalance)} ريال</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الأرصدة الحالية</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(totalCurrentBalance)} ريال</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو الهاتف أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-right font-semibold text-gray-700">اسم العميل</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الهاتف</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">البريد الإلكتروني</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الافتتاحي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الرصيد الحالي</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد عملاء
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <TableRow key={client.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-gray-700">{client.phone}</TableCell>
                    <TableCell className="text-gray-700">{client.email || 'غير محدد'}</TableCell>
                    <TableCell className="text-gray-700">
                      {formatAmount(client.openingBalance || 0)} ريال
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatAmount(client.balance || 0)} ريال
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowStatement(client)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printClientStatementDirect(client)}
                          className="text-gray-900 hover:text-black hover:bg-gray-100 border-gray-900"
                        >
                          <Printer className="w-4 h-4 ml-1" />
                          طباعة
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Statement Dialog */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-gray-900">
                كشف حساب العميل: {selectedClient?.name}
              </DialogTitle>
              <Button
                onClick={printClientStatement}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Printer className="w-4 h-4 ml-1" />
                طباعة الكشف
              </Button>
            </div>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Information */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">اسم العميل:</span>
                      <p className="text-gray-900">{selectedClient.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">الهاتف:</span>
                      <p className="text-gray-900">{selectedClient.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">الرصيد الافتتاحي:</span>
                      <p className="text-blue-600 font-semibold">{formatAmount(selectedClient.openingBalance || selectedClient.creditLimit || 0)} ريال</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">الرصيد الحالي:</span>
                      <p className="text-green-600 font-semibold">{formatAmount(selectedClient.balance || 0)} ريال</p>
                    </div>
                    <div className="border-t pt-2">
                      <span className="font-semibold text-gray-700">الرصيد النهائي:</span>
                      <p className="text-blue-700 font-bold text-lg">{formatAmount(calculateFinalBalance(selectedClient, getClientTransactions(selectedClient.id)))} ريال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">سجل المعاملات المالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="text-right font-semibold text-gray-700">التاريخ</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">نوع المعاملة</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">المرجع</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">الوصف</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">مدين</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">دائن</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">الرصيد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const transactions = getClientTransactions(selectedClient.id);
                        let runningBalance = parseFloat(formatAmount(selectedClient.openingBalance || selectedClient.creditLimit || 0));
                        
                        if (transactions.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                لا توجد معاملات مالية لهذا العميل
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return transactions.map((transaction, index) => {
                          runningBalance += transaction.debit - transaction.credit;
                          return (
                            <TableRow key={`${transaction.type}-${transaction.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                              <TableCell className="text-gray-700">
                                {new Date(transaction.date).toLocaleDateString('en-GB')}
                              </TableCell>
                              <TableCell className="text-gray-700">{transaction.type}</TableCell>
                              <TableCell className="text-gray-700">{transaction.reference}</TableCell>
                              <TableCell className="text-gray-700">{transaction.description}</TableCell>
                              <TableCell className="text-red-600 font-semibold">
                                {transaction.debit > 0 ? `${formatAmount(transaction.debit)} ريال` : '-'}
                              </TableCell>
                              <TableCell className="text-green-600 font-semibold">
                                {transaction.credit > 0 ? `${formatAmount(transaction.credit)} ريال` : '-'}
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900">
                                {formatAmount(runningBalance)} ريال
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}