import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Edit,
  Trash2,
  Eye,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Receipt,
  ArrowUpDown
} from 'lucide-react';
import ClientAccountsPrintReport from '@/components/clients/ClientAccountsPrintReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ClientAccount {
  id: number;
  clientName: string;
  phone: string;
  email?: string;
  openingBalance: number;
  totalSales: number;
  totalPayments: number;
  currentBalance: number;
  lastTransaction: string;
  status: 'active' | 'inactive' | 'blocked';
  creditLimit: number;
  accountType: 'credit' | 'cash' | 'mixed';
}

interface Transaction {
  id: number;
  clientId: number;
  type: 'sale' | 'payment' | 'adjustment';
  amount: number;
  date: string;
  description: string;
  reference?: string;
}

export default function ClientAccountsNew() {
  const { toast } = useToast();
  const { user } = useAppStore();
  const printElementRef = useRef<HTMLDivElement>(null);

  // Function to generate individual client invoice using unified template
  const generateClientInvoice = async (account: ClientAccount) => {
    const { generateUnifiedInvoice } = await import('@/components/shared/UnifiedInvoiceTemplate');
    
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const summaryData = [
      {
        label: 'الرصيد الافتتاحي',
        value: `${account.openingBalance.toLocaleString('en-US')} ر.س`,
        color: account.openingBalance >= 0 ? '#28a745' : '#dc3545'
      },
      {
        label: 'الرصيد الحالي',
        value: `${account.currentBalance.toLocaleString('en-US')} ر.س`,
        color: account.currentBalance >= 0 ? '#28a745' : '#dc3545'
      },
      {
        label: 'إجمالي المبيعات',
        value: `${account.totalSales.toLocaleString('en-US')} ر.س`,
        color: '#007acc'
      },
      {
        label: 'إجمالي المدفوعات',
        value: `${account.totalPayments.toLocaleString('en-US')} ر.س`,
        color: '#6f42c1'
      },
      {
        label: 'حد الائتمان',
        value: `${account.creditLimit.toLocaleString('en-US')} ر.س`,
        color: '#fd7e14'
      }
    ];

    const htmlContent = generateUnifiedInvoice({
      title: 'كشف حساب عميل',
      invoiceNumber: `CLI-${account.id}-${Date.now().toString().slice(-6)}`,
      entityName: account.clientName,
      entityDetails: {
        id: account.id,
        phone: account.phone,
        email: account.email,
        type: account.accountType
      },
      summaryData,
      additionalContent: `<div>بيانات إضافية للعميل</div>`,
      user
    });

    invoiceWindow.document.write(htmlContent);
    invoiceWindow.document.close();
    
    setTimeout(() => {
      invoiceWindow.print();
    }, 500);
  };

  // Mock data for demonstration
  const [clientAccounts] = useState<ClientAccount[]>([
    {
      id: 1,
      clientName: 'شركة الأحمد للتجارة',
      phone: '0501234567',
      email: 'ahmad@company.com',
      openingBalance: 15000,
      totalSales: 45000,
      totalPayments: 35000,
      currentBalance: 25000,
      lastTransaction: '2024-01-15',
      status: 'active',
      creditLimit: 50000,
      accountType: 'credit'
    },
    {
      id: 2,
      clientName: 'مؤسسة النور للمقاولات',
      phone: '0507654321',
      email: 'noor@establishment.com',
      openingBalance: -5000,
      totalSales: 25000,
      totalPayments: 20000,
      currentBalance: 0,
      lastTransaction: '2024-01-10',
      status: 'active',
      creditLimit: 30000,
      accountType: 'mixed'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  const filteredAccounts = clientAccounts.filter(account => {
    const matchesSearch = account.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateTotals = () => {
    return filteredAccounts.reduce((totals, account) => ({
      totalSales: totals.totalSales + account.totalSales,
      totalPayments: totals.totalPayments + account.totalPayments,
      currentBalance: totals.currentBalance + account.currentBalance,
      openingBalance: totals.openingBalance + account.openingBalance
    }), { totalSales: 0, totalPayments: 0, currentBalance: 0, openingBalance: 0 });
  };

  const totals = calculateTotals();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">محظور</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge className="bg-blue-100 text-blue-800">آجل</Badge>;
      case 'cash':
        return <Badge className="bg-green-100 text-green-800">نقدي</Badge>;
      case 'mixed':
        return <Badge className="bg-purple-100 text-purple-800">مختلط</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handlePrintReport = () => {
    const analytics = {
      totalClients: filteredAccounts.length,
      activeClients: filteredAccounts.filter(a => a.status === 'active').length,
      inactiveClients: filteredAccounts.filter(a => a.status === 'inactive').length,
      totalSales: totals.totalSales,
      totalPayments: totals.totalPayments,
      totalCurrentBalance: totals.currentBalance,
      totalOpeningBalance: totals.openingBalance,
      clientsWithDebt: filteredAccounts.filter(a => a.currentBalance < 0).length,
      clientsWithCredit: filteredAccounts.filter(a => a.currentBalance > 0).length
    };

    // Generate print report
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير حسابات العملاء</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .analytics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .analytics-item { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .positive { color: #28a745; }
            .negative { color: #dc3545; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير حسابات العملاء</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('en-GB')}</p>
            <p>عدد العملاء: ${filteredAccounts.length}</p>
          </div>
          
          <div class="analytics">
            <div class="analytics-item">
              <h3>إجمالي العملاء</h3>
              <p style="font-size: 24px; margin: 0; color: #007acc;">${analytics.totalClients}</p>
            </div>
            <div class="analytics-item">
              <h3>العملاء النشطين</h3>
              <p style="font-size: 24px; margin: 0; color: #28a745;">${analytics.activeClients}</p>
            </div>
            <div class="analytics-item">
              <h3>إجمالي المبيعات</h3>
              <p style="font-size: 18px; margin: 0; color: #007acc;">${analytics.totalSales.toLocaleString('en-US')} ر.س</p>
            </div>
            <div class="analytics-item">
              <h3>إجمالي الأرصدة</h3>
              <p style="font-size: 18px; margin: 0; color: ${analytics.totalCurrentBalance >= 0 ? '#28a745' : '#dc3545'};">${analytics.totalCurrentBalance.toLocaleString('en-US')} ر.س</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>الرصيد الافتتاحي</th>
                <th>إجمالي المبيعات</th>
                <th>إجمالي المدفوعات</th>
                <th>الرصيد الحالي</th>
                <th>نوع الحساب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAccounts.map(account => `
                <tr>
                  <td>${account.clientName}</td>
                  <td>${account.phone}</td>
                  <td class="${account.openingBalance >= 0 ? 'positive' : 'negative'}">${account.openingBalance.toLocaleString('en-US')} ر.س</td>
                  <td>${account.totalSales.toLocaleString('en-US')} ر.س</td>
                  <td>${account.totalPayments.toLocaleString('en-US')} ر.س</td>
                  <td class="${account.currentBalance >= 0 ? 'positive' : 'negative'}">${account.currentBalance.toLocaleString('en-US')} ر.س</td>
                  <td>${account.accountType === 'credit' ? 'آجل' : account.accountType === 'cash' ? 'نقدي' : 'مختلط'}</td>
                  <td>${account.status === 'active' ? 'نشط' : account.status === 'inactive' ? 'غير نشط' : 'محظور'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابات العملاء</h1>
            <p className="text-gray-600">إدارة ومتابعة حسابات العملاء والأرصدة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintReport} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            طباعة التقرير
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة عميل جديد
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg ml-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredAccounts.length}</p>
                <p className="text-gray-600">إجمالي العملاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg ml-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totals.totalSales.toLocaleString('en-US')}
                </p>
                <p className="text-gray-600">إجمالي المبيعات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg ml-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totals.totalPayments.toLocaleString('en-US')}
                </p>
                <p className="text-gray-600">إجمالي المدفوعات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ml-4 ${totals.currentBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <CreditCard className={`h-6 w-6 ${totals.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totals.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.currentBalance.toLocaleString('en-US')}
                </p>
                <p className="text-gray-600">صافي الأرصدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="حالة الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="credit">آجل</SelectItem>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="mixed">مختلط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الرصيد الافتتاحي</TableHead>
                <TableHead>إجمالي المبيعات</TableHead>
                <TableHead>إجمالي المدفوعات</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>نوع الحساب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.clientName}</div>
                      {account.email && (
                        <div className="text-sm text-gray-500">{account.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{account.phone}</TableCell>
                  <TableCell>
                    <span className={account.openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {account.openingBalance.toLocaleString('en-US')} ر.س
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600">
                      {account.totalSales.toLocaleString('en-US')} ر.س
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-purple-600">
                      {account.totalPayments.toLocaleString('en-US')} ر.س
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {account.currentBalance.toLocaleString('en-US')} ر.س
                    </span>
                  </TableCell>
                  <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => generateClientInvoice(account)}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}