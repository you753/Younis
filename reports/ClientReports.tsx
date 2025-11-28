import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Search,
  Filter,
  FileText,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { useAppStore } from '@/lib/store';
import ClientAccountsPrintReport from '@/components/clients/ClientAccountsPrintReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

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

interface Sale {
  id: number;
  clientId: number;
  total: string;
  date: string;
  paymentMethod: string;
  status: string;
}

interface ClientReceiptVoucher {
  id: number;
  clientId: number;
  amount: string;
  receiptDate: string;
  paymentMethod: string;
  status: string;
}

export default function ClientReports() {
  const { setCurrentPage } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setCurrentPage('تقارير العملاء');
  }, [setCurrentPage]);

  // Fetch data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales'],
  });

  const { data: receipts = [] } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers'],
  });

  // جلب إعدادات الشركة المحدثة تلقائياً
  const { data: companySettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any) => data?.الشركة?.companyInfo || {}
  });

  // Calculate client analytics
  const calculateClientAnalytics = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(client => client.status === 'active').length;
    const inactiveClients = clients.filter(client => client.status === 'inactive').length;
    
    const totalBalances = clients.reduce((sum, client) => sum + parseFloat(client.currentBalance || '0'), 0);
    const totalCreditLimits = clients.reduce((sum, client) => sum + parseFloat(client.creditLimit || '0'), 0);
    const totalOpeningBalances = clients.reduce((sum, client) => sum + parseFloat(client.openingBalance || '0'), 0);
    
    const clientsWithDebt = clients.filter(client => parseFloat(client.currentBalance || '0') < 0).length;
    const clientsWithCredit = clients.filter(client => parseFloat(client.currentBalance || '0') > 0).length;

    return {
      totalClients,
      activeClients,
      inactiveClients,
      totalBalances,
      totalCreditLimits,
      totalOpeningBalances,
      clientsWithDebt,
      clientsWithCredit
    };
  };

  // Calculate client sales data
  const calculateClientSales = () => {
    const clientSalesMap = new Map();
    
    sales.forEach(sale => {
      const current = clientSalesMap.get(sale.clientId) || { total: 0, count: 0 };
      clientSalesMap.set(sale.clientId, {
        total: current.total + parseFloat(sale.total || '0'),
        count: current.count + 1
      });
    });

    return Array.from(clientSalesMap.entries()).map(([clientId, salesData]) => {
      const client = clients.find(c => c.id === clientId);
      return {
        clientId,
        clientName: client?.name || `عميل ${clientId}`,
        totalSales: salesData.total,
        salesCount: salesData.count,
        currentBalance: parseFloat(client?.currentBalance || '0'),
        creditLimit: parseFloat(client?.creditLimit || '0'),
        status: client?.status || 'unknown'
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  };

  // Calculate payment analysis
  const calculatePaymentAnalysis = () => {
    const receiptsByClient = new Map();
    
    receipts.forEach(receipt => {
      const current = receiptsByClient.get(receipt.clientId) || { total: 0, count: 0 };
      receiptsByClient.set(receipt.clientId, {
        total: current.total + parseFloat(receipt.amount || '0'),
        count: current.count + 1
      });
    });

    return Array.from(receiptsByClient.entries()).map(([clientId, receiptData]) => {
      const client = clients.find(c => c.id === clientId);
      return {
        clientId,
        clientName: client?.name || `عميل ${clientId}`,
        totalReceipts: receiptData.total,
        receiptsCount: receiptData.count,
        currentBalance: parseFloat(client?.currentBalance || '0'),
      };
    }).sort((a, b) => b.totalReceipts - a.totalReceipts);
  };

  // Get client status distribution
  const getClientStatusDistribution = () => {
    const statusCounts = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'active' ? 'نشط' : status === 'inactive' ? 'غير نشط' : status,
      value: count
    }));
  };

  // Get account type distribution
  const getAccountTypeDistribution = () => {
    const typeCounts = clients.reduce((acc, client) => {
      acc[client.accountType] = (acc[client.accountType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type || 'غير محدد',
      value: count
    }));
  };

  // Filter clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const analytics = calculateClientAnalytics();
  const clientSalesData = calculateClientSales();
  const paymentAnalysis = calculatePaymentAnalysis();
  const statusDistribution = getClientStatusDistribution();
  const accountTypeDistribution = getAccountTypeDistribution();

  const exportToExcel = () => {
    if (filteredClients.length === 0) return;
    
    // تحضير البيانات للتصدير
    const exportData = filteredClients.map((client, index) => ({
      'الرقم المسلسل': index + 1,
      'اسم العميل': client.name,
      'رقم الهاتف': client.phone || 'غير محدد',
      'البريد الإلكتروني': client.email || 'غير محدد',
      'العنوان': client.address || 'غير محدد',
      'الرصيد الافتتاحي': parseFloat(client.openingBalance).toFixed(2),
      'الرصيد الحالي': parseFloat(client.currentBalance).toFixed(2),
      'حد الائتمان': parseFloat(client.creditLimit).toFixed(2),
      'المتاح': (parseFloat(client.creditLimit) - Math.abs(parseFloat(client.currentBalance))).toFixed(2),
      'نسبة الاستخدام %': parseFloat(client.creditLimit) > 0 ? 
        ((Math.abs(parseFloat(client.currentBalance)) / parseFloat(client.creditLimit)) * 100).toFixed(1) : '0.0',
      'نوع الحساب': client.accountType || 'غير محدد',
      'الحالة': client.status === 'active' ? 'نشط' : 'غير نشط',
      'تاريخ التسجيل': new Date(client.createdAt).toLocaleDateString('en-GB')
    }));

    // إضافة صفوف الإحصائيات
    const statisticsData = [
      {},
      { 'اسم العميل': '=== الإحصائيات العامة ===' },
      { 'اسم العميل': 'إجمالي العملاء', 'الرقم المسلسل': analytics.totalClients },
      { 'اسم العميل': 'العملاء النشطين', 'الرقم المسلسل': analytics.activeClients },
      { 'اسم العميل': 'العملاء غير النشطين', 'الرقم المسلسل': analytics.inactiveClients },
      { 'اسم العميل': 'إجمالي الأرصدة الحالية', 'الرصيد الحالي': analytics.totalBalances.toFixed(2) },
      { 'اسم العميل': 'إجمالي الأرصدة الافتتاحية', 'الرصيد الافتتاحي': analytics.totalOpeningBalances.toFixed(2) },
      { 'اسم العميل': 'إجمالي حدود الائتمان', 'حد الائتمان': analytics.totalCreditLimits.toFixed(2) },
      { 'اسم العميل': 'عملاء برصيد موجب', 'الرقم المسلسل': analytics.clientsWithCredit },
      { 'اسم العميل': 'عملاء برصيد سالب', 'الرقم المسلسل': analytics.clientsWithDebt },
      {},
      { 'اسم العميل': `تم إنشاء التقرير في: ${new Date().toLocaleString('en-US')}` }
    ];

    const allData = [...exportData, ...statisticsData];
    
    // تحويل إلى CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      // UTF-8 BOM للتأكد من عرض النص العربي صحيحاً
      '\uFEFF',
      // العنوان الرئيسي
      `"تقرير حسابات العملاء - ${new Date().toLocaleDateString('en-GB')}"`,
      '',
      // الرؤوس
      headers.join(','),
      // البيانات
      ...allData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_حسابات_العملاء_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = async () => {
    try {
      // إظهار تقرير الطباعة مؤقتاً
      const printElement = document.querySelector('.print\\:block') as HTMLElement;
      if (!printElement) return;

      // إخفاء العناصر غير المرغوب فيها وإظهار تقرير الطباعة
      printElement.style.display = 'block';
      printElement.style.position = 'fixed';
      printElement.style.top = '0';
      printElement.style.left = '0';
      printElement.style.width = '210mm';
      printElement.style.backgroundColor = 'white';
      printElement.style.zIndex = '9999';
      
      // انتظار قصير للتأكد من التحميل
      await new Promise(resolve => setTimeout(resolve, 500));

      // التقاط لقطة شاشة للعنصر
      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: 'white',
        width: 794, // عرض A4 بـ 96 DPI
        height: 1123 // ارتفاع A4 بـ 96 DPI
      });

      // إنشاء PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // حساب الأبعاد للـ PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // إضافة الصفحة الأولى
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // إضافة صفحات إضافية إذا لزم الأمر
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // حفظ الملف
      pdf.save(`تقرير_حسابات_العملاء_${new Date().toISOString().split('T')[0]}.pdf`);

      // إخفاء تقرير الطباعة مرة أخرى
      printElement.style.display = 'none';
      printElement.style.position = '';
      printElement.style.top = '';
      printElement.style.left = '';
      printElement.style.width = '';
      printElement.style.backgroundColor = '';
      printElement.style.zIndex = '';
      
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      alert('حدث خطأ أثناء تصدير PDF');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <ClientAccountsPrintReport 
        clients={filteredClients}
        analytics={analytics}
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">تقارير العملاء</h1>
              <p className="text-blue-100 mt-1">تحليل شامل لبيانات العملاء ومعاملاتهم</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary"
              onClick={exportToExcel}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
            <Button 
              variant="secondary"
              onClick={exportToPDF}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <FileText className="ml-2 h-4 w-4" />
              تصدير PDF
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.print()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <FileText className="ml-2 h-4 w-4" />
              طباعة التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">تصدير وطباعة التقارير</h3>
              <p className="text-sm text-gray-600">اختر طريقة التصدير أو الطباعة المناسبة</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={exportToExcel}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير Excel
              </Button>
              <Button 
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <FileText className="ml-2 h-4 w-4" />
                تصدير PDF
              </Button>
              <Button 
                onClick={() => window.print()}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <FileText className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">إجمالي العملاء</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{analytics.totalClients}</div>
            <div className="flex items-center text-blue-600 text-sm mt-1">
              <UserCheck className="h-4 w-4 ml-1" />
              {analytics.activeClients} نشط
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">إجمالي الأرصدة</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              {analytics.totalBalances.toFixed(2)} ر.س
            </div>
            <div className="flex items-center text-green-600 text-sm mt-1">
              <TrendingUp className="h-4 w-4 ml-1" />
              الأرصدة الحالية
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">حدود الائتمان</CardTitle>
            <CreditCard className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              {analytics.totalCreditLimits.toFixed(2)} ر.س
            </div>
            <div className="flex items-center text-orange-600 text-sm mt-1">
              <AlertCircle className="h-4 w-4 ml-1" />
              إجمالي الحدود
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">عملاء بديون</CardTitle>
            <TrendingDown className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{analytics.clientsWithDebt}</div>
            <div className="flex items-center text-purple-600 text-sm mt-1">
              <AlertCircle className="h-4 w-4 ml-1" />
              يحتاج متابعة
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث بالاسم أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="حالة العميل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="من تاريخ"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="إلى تاريخ"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">مبيعات العملاء</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="balances">الأرصدة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالة العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Account Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع أنواع الحسابات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={accountTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {accountTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الرصيد الحالي</TableHead>
                      <TableHead>حد الائتمان</TableHead>
                      <TableHead>نوع الحساب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone || 'غير محدد'}</TableCell>
                        <TableCell className={`font-semibold ${
                          parseFloat(client.currentBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {parseFloat(client.currentBalance).toFixed(2)} ر.س
                        </TableCell>
                        <TableCell>{parseFloat(client.creditLimit).toFixed(2)} ر.س</TableCell>
                        <TableCell>{client.accountType || 'غير محدد'}</TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(client.createdAt).toLocaleDateString('en-GB')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أكثر العملاء شراءً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clientSalesData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clientName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ر.س`, 'إجمالي المبيعات']} />
                  <Bar dataKey="totalSales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل مبيعات العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>إجمالي المبيعات</TableHead>
                      <TableHead>عدد الفواتير</TableHead>
                      <TableHead>متوسط الفاتورة</TableHead>
                      <TableHead>الرصيد الحالي</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientSalesData.map((client) => (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {client.totalSales.toFixed(2)} ر.س
                        </TableCell>
                        <TableCell>{client.salesCount}</TableCell>
                        <TableCell>
                          {(client.totalSales / client.salesCount).toFixed(2)} ر.س
                        </TableCell>
                        <TableCell className={`font-semibold ${
                          client.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {client.currentBalance.toFixed(2)} ر.س
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أكثر العملاء دفعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paymentAnalysis.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clientName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(2)} ر.س`, 'إجمالي المدفوعات']} />
                  <Bar dataKey="totalReceipts" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل مدفوعات العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>إجمالي المدفوعات</TableHead>
                      <TableHead>عدد السندات</TableHead>
                      <TableHead>متوسط السند</TableHead>
                      <TableHead>الرصيد الحالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentAnalysis.map((client) => (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {client.totalReceipts.toFixed(2)} ر.س
                        </TableCell>
                        <TableCell>{client.receiptsCount}</TableCell>
                        <TableCell>
                          {(client.totalReceipts / client.receiptsCount).toFixed(2)} ر.س
                        </TableCell>
                        <TableCell className={`font-semibold ${
                          client.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {client.currentBalance.toFixed(2)} ر.س
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير أرصدة العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>الرصيد الافتتاحي</TableHead>
                      <TableHead>الرصيد الحالي</TableHead>
                      <TableHead>حد الائتمان</TableHead>
                      <TableHead>المتاح</TableHead>
                      <TableHead>نسبة الاستخدام</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => {
                      const currentBalance = parseFloat(client.currentBalance);
                      const creditLimit = parseFloat(client.creditLimit);
                      const available = creditLimit - Math.abs(currentBalance);
                      const usagePercent = creditLimit > 0 ? (Math.abs(currentBalance) / creditLimit) * 100 : 0;
                      
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{parseFloat(client.openingBalance).toFixed(2)} ر.س</TableCell>
                          <TableCell className={`font-semibold ${
                            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {currentBalance.toFixed(2)} ر.س
                          </TableCell>
                          <TableCell>{creditLimit.toFixed(2)} ر.س</TableCell>
                          <TableCell className={`font-semibold ${
                            available >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {available.toFixed(2)} ر.س
                          </TableCell>
                          <TableCell>
                            <Badge variant={usagePercent > 80 ? 'destructive' : usagePercent > 60 ? 'default' : 'secondary'}>
                              {usagePercent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الأرصدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>عملاء برصيد موجب</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.clientsWithCredit} عميل
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span>عملاء برصيد سالب</span>
                    <Badge className="bg-red-100 text-red-800">
                      {analytics.clientsWithDebt} عميل
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>إجمالي الأرصدة الافتتاحية</span>
                    <span className="font-semibold text-blue-700">
                      {analytics.totalOpeningBalances.toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>إجمالي حدود الائتمان</span>
                    <span className="font-semibold text-purple-700">
                      {analytics.totalCreditLimits.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص الحسابات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.totalClients}
                    </div>
                    <p className="text-gray-600">إجمالي العملاء</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {analytics.activeClients}
                      </div>
                      <p className="text-sm text-green-700">نشط</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-600">
                        {analytics.inactiveClients}
                      </div>
                      <p className="text-sm text-gray-700">غير نشط</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}