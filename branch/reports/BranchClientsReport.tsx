import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, CreditCard, FileText, Search, Download, Phone, Mail, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BranchClientsReportProps {
  branchId?: number;
}

export default function BranchClientsReport({ branchId }: BranchClientsReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // جلب بيانات الفرع
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب بيانات العملاء للفرع فقط
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/clients?branchId=${branchId}` : '/api/clients';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب بيانات المبيعات للفرع فقط
  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/sales?branchId=${branchId}` : '/api/sales';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    enabled: !!branchId
  });

  // جلب بيانات سندات القبض للفرع فقط
  const { data: receipts = [] } = useQuery<any[]>({
    queryKey: ['/api/client-receipts', branchId],
    queryFn: async () => {
      const url = branchId ? `/api/client-receipts?branchId=${branchId}` : '/api/client-receipts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch receipts');
      return response.json();
    },
    enabled: !!branchId
  });

  // حساب الإحصائيات
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalBalance = clients.reduce((sum, client) => sum + parseFloat(client.balance || '0'), 0);
  const totalOpeningBalance = clients.reduce((sum, client) => sum + parseFloat(client.openingBalance || '0'), 0);
  const clientsWithBalance = clients.filter(client => parseFloat(client.balance || '0') > 0).length;

  // تصفية البيانات
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const clientBalance = parseFloat(client.balance || '0');
    const matchesBalance = balanceFilter === 'all' || 
                          (balanceFilter === 'positive' && clientBalance > 0) ||
                          (balanceFilter === 'zero' && clientBalance === 0) ||
                          (balanceFilter === 'negative' && clientBalance < 0);
    return matchesSearch && matchesStatus && matchesBalance;
  });

  // طباعة التقرير
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const branchName = branch?.name || `الفرع ${branchId}`;

    const reportContent = `
      <html dir="rtl">
        <head>
          <title>تقرير العملاء - ${branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; background: #f9f9f9; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              
              <p>تقرير العملاء - ${branchName}</p>
              <p>بتاريخ: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalClients}</div>
              <div class="stat-label">إجمالي العملاء</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeClients}</div>
              <div class="stat-label">العملاء النشطون</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalBalance.toLocaleString('en-US')} ريال</div>
              <div class="stat-label">إجمالي الأرصدة</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${clientsWithBalance}</div>
              <div class="stat-label">عملاء لديهم أرصدة</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الرصيد الافتتاحي</th>
                <th>الرصيد الحالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredClients.map(client => `
                <tr>
                  <td>${client.name}</td>
                  <td>${client.email || 'غير محدد'}</td>
                  <td>${client.phone || 'غير محدد'}</td>
                  <td>${parseFloat(client.openingBalance || '0').toLocaleString('en-US')} ريال</td>
                  <td>${parseFloat(client.balance || '0').toLocaleString('en-US')} ريال</td>
                  <td>${client.status === 'active' ? 'نشط' : 'غير نشط'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-US')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير العملاء</h1>
            <p className="text-gray-600">تقرير تفصيلي للعملاء - الفرع رقم: {branchId}</p>
          </div>
        </div>
        <Button onClick={printReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
            <p className="text-xs text-muted-foreground">عميل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
            <p className="text-xs text-muted-foreground">عميل نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">رصيد حالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الافتتاحي</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalOpeningBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">رصيد افتتاحي</p>
          </CardContent>
        </Card>
      </div>

      {/* التصفية والبحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* فلتر التاريخ */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Calendar className="h-5 w-5" />
                <span>الفترة الزمنية:</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">من تاريخ:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">إلى تاريخ:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="whitespace-nowrap"
                  >
                    مسح التاريخ
                  </Button>
                )}
              </div>
            </div>
            
            {/* فلاتر أخرى */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث باسم العميل أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="حالة العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="حالة الرصيد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأرصدة</SelectItem>
                  <SelectItem value="positive">رصيد موجب</SelectItem>
                  <SelectItem value="zero">رصيد صفر</SelectItem>
                  <SelectItem value="negative">رصيد سالب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقارير التفصيلية */}
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="balances">الأرصدة</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">اسم العميل</th>
                      <th className="text-right py-2 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-2 px-4">الهاتف</th>
                      <th className="text-right py-2 px-4">الرصيد الافتتاحي</th>
                      <th className="text-right py-2 px-4">الرصيد الحالي</th>
                      <th className="text-right py-2 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{client.name}</td>
                        <td className="py-2 px-4 text-blue-600">{client.email || 'غير محدد'}</td>
                        <td className="py-2 px-4">{client.phone || 'غير محدد'}</td>
                        <td className="py-2 px-4 text-green-600">
                          {parseFloat(client.openingBalance || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4 text-orange-600 font-semibold">
                          {parseFloat(client.balance || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد عملاء متاحين
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأرصدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((client) => {
                  const clientBalance = parseFloat(client.balance || '0');
                  const clientOpeningBalance = parseFloat(client.openingBalance || '0');
                  const difference = clientBalance - clientOpeningBalance;
                  
                  return (
                    <div key={client.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge variant={clientBalance > 0 ? 'default' : clientBalance < 0 ? 'destructive' : 'secondary'}>
                          {clientBalance > 0 ? 'رصيد موجب' : clientBalance < 0 ? 'رصيد سالب' : 'رصيد صفر'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الرصيد الافتتاحي:</span>
                          <span className="font-semibold text-green-600">
                            {clientOpeningBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">الرصيد الحالي:</span>
                          <span className="font-semibold text-orange-600">
                            {clientBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm text-gray-500">الفرق:</span>
                          <span className={`font-semibold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نشاط العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.slice(0, 6).map((client) => {
                  const clientSales = sales.filter(sale => sale.clientId === client.id);
                  const clientReceipts = receipts.filter(receipt => receipt.clientId === client.id);
                  const totalSales = clientSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || '0'), 0);
                  const totalReceipts = clientReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || '0'), 0);
                  
                  return (
                    <div key={client.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <div className="flex gap-2">
                          {client.phone && <Phone className="h-4 w-4 text-gray-500" />}
                          {client.email && <Mail className="h-4 w-4 text-gray-500" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">المبيعات:</span>
                          <span className="font-semibold text-blue-600">{clientSales.length} فاتورة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">قيمة المبيعات:</span>
                          <span className="font-semibold text-green-600">
                            {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">المدفوعات:</span>
                          <span className="font-semibold text-purple-600">
                            {totalReceipts.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}