import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Search, Calendar, DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/hooks/useAuth';

interface ClientReport {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  totalPurchases: number;
  totalPayments: number;
  currentBalance: number;
  openingBalance: number;
  lastPurchaseDate?: string;
  purchaseCount: number;
  averageTransactionValue: number;
  status: 'active' | 'inactive';
}

export default function ClientsReports() {
  const [reportType, setReportType] = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientsReportData, setClientsReportData] = useState<ClientReport[]>([]);
  
  const { user } = useAuth();

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: clientReceiptVouchers = [] } = useQuery({
    queryKey: ['/api/client-receipt-vouchers'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  useEffect(() => {
    if (clients.length > 0) {
      const reportData = clients.map((client: any) => {
        const clientVouchers = clientReceiptVouchers.filter((v: any) => v.clientId === client.id);
        const clientSales = sales.filter((s: any) => s.clientId === client.id);
        
        const totalPayments = clientVouchers.reduce((sum: number, voucher: any) => 
          sum + parseFloat(voucher.amount || '0'), 0);
        
        const totalPurchases = clientSales.reduce((sum: number, sale: any) => 
          sum + parseFloat(sale.total || '0'), 0);
        
        const openingBalance = parseFloat(client.openingBalance || '0');
        const currentBalance = openingBalance + totalPurchases - totalPayments;

        return {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          totalPurchases,
          totalPayments,
          currentBalance,
          openingBalance,
          lastPurchaseDate: clientSales.length > 0 ? clientSales[0].date : undefined,
          purchaseCount: clientSales.length,
          averageTransactionValue: clientSales.length > 0 ? totalPurchases / clientSales.length : 0,
          status: 'active' as const
        };
      });

      console.log('العملاء بعد المعالجة:', reportData.map(c => 
        `العميل ${c.name}: رصيد افتتاحي ${c.openingBalance}, مشتريات ${c.totalPurchases}, مدفوعات ${c.totalPayments}, رصيد حالي ${c.currentBalance}`
      ));

      setClientsReportData(reportData);
    }
  }, [clients, clientReceiptVouchers, sales]);

  const filteredReportData = clientsReportData.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery));
    
    const matchesClient = selectedClient === 'all' || client.id.toString() === selectedClient;
    
    return matchesSearch && matchesClient;
  });

  const getReportTypeName = () => {
    switch (reportType) {
      case 'summary': return 'تقرير شامل للعملاء';
      case 'balances': return 'تقرير أرصدة العملاء';
      case 'transactions': return 'تقرير معاملات العملاء';
      default: return 'تقرير العملاء';
    }
  };

  const generateInvoiceReport = async () => {
    const element = document.createElement('div');
    element.style.cssText = `
      width: 210mm;
      background: white;
      padding: 15mm;
      font-family: 'Arial', sans-serif;
      direction: rtl;
      color: #333;
      position: absolute;
      left: -9999px;
      top: 0;
    `;

    const totalStats = getTotalStats();
    
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="text-align: right;">
            <h1 style="margin: 0; color: #2563eb; font-size: 18px; font-weight: bold;">أحمد قروب</h1>
            <p style="margin: 2px 0; font-size: 10px;"><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</p>
            <p style="margin: 2px 0; font-size: 10px;"><strong>الهاتف:</strong> 0501234567</p>
            <p style="margin: 2px 0; font-size: 10px;"><strong>نوع التقرير:</strong> ${getReportTypeName()}</p>
          </div>
          
          <div style="display: flex; justify-content: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 2px solid #e5e7eb;">
              <img src="${user?.avatar || '/uploads/avatars/default-avatar.png'}" 
                   alt="شعار الشركة" 
                   style="width: 100%; height: 100%; object-fit: cover;"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 50%; display: none; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 12px;">المحاسب</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: left;">
            <p style="margin: 2px 0; font-size: 10px;"><strong>التاريخ:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
            <p style="margin: 2px 0; font-size: 10px;"><strong>الوقت:</strong> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin: 2px 0; font-size: 10px;"><strong>المستخدم:</strong> ${user?.fullName || 'غير محدد'}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 16px; font-weight: bold;">${totalStats.totalClients}</div>
            <div style="font-size: 9px; opacity: 0.9;">إجمالي العملاء</div>
          </div>
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 16px; font-weight: bold;">${totalStats.totalCurrentBalance.toFixed(2)} ر.س</div>
            <div style="font-size: 9px; opacity: 0.9;">إجمالي الأرصدة</div>
          </div>
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 16px; font-weight: bold;">${totalStats.totalPurchases.toFixed(2)} ر.س</div>
            <div style="font-size: 9px; opacity: 0.9;">إجمالي المشتريات</div>
          </div>
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 16px; font-weight: bold;">${totalStats.totalPayments.toFixed(2)} ر.س</div>
            <div style="font-size: 9px; opacity: 0.9;">إجمالي المدفوعات</div>
          </div>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 15px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold;">اسم العميل</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">الهاتف</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">الرصيد الافتتاحي</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">المشتريات</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">المدفوعات</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">الرصيد الحالي</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredReportData.map(client => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 500;">${client.name}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">${client.phone || '-'}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; color: #6b7280;">${client.openingBalance.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; color: #059669; font-weight: 500;">${client.totalPurchases.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; color: #dc2626; font-weight: 500;">${client.totalPayments.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold; color: ${client.currentBalance >= 0 ? '#059669' : '#dc2626'};">${client.currentBalance.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">
                  <span style="background: ${client.status === 'active' ? '#dcfce7' : '#fee2e2'}; color: ${client.status === 'active' ? '#166534' : '#991b1b'}; padding: 2px 6px; border-radius: 4px; font-size: 7px;">
                    ${client.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 15px; text-align: center; font-size: 8px; color: #6b7280; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        <p style="margin: 0;">تم إنشاء هذا التقرير بواسطة نظام إدارة العملاء - ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-US')}</p>
      </div>
    `;

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`تقرير_العملاء_${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      document.body.removeChild(element);
    }
  };

  const exportToPDF = generateInvoiceReport;

  const getTotalStats = () => {
    const totalClients = filteredReportData.length;
    const totalCurrentBalance = filteredReportData.reduce((sum, c) => sum + c.currentBalance, 0);
    const totalPurchases = filteredReportData.reduce((sum, c) => sum + c.totalPurchases, 0);
    const totalPayments = filteredReportData.reduce((sum, c) => sum + c.totalPayments, 0);
    const activeClients = filteredReportData.filter(c => c.status === 'active').length;

    return {
      totalClients,
      totalCurrentBalance,
      totalPurchases,
      totalPayments,
      activeClients
    };
  };

  const totalStats = getTotalStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقارير العملاء</h1>
          <p className="text-gray-600 mt-1">عرض تفصيلي لبيانات وأداء العملاء</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            فاتورة تقرير شاملة
          </Button>
        </div>
      </div>

      {/* ملخص الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-700">{totalStats.totalClients}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-green-700">{totalStats.totalCurrentBalance.toFixed(0)} ر.س</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-orange-700">{totalStats.totalPurchases.toFixed(0)} ر.س</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-purple-700">{totalStats.totalPayments.toFixed(0)} ر.س</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">العملاء النشطين</p>
                <p className="text-2xl font-bold text-indigo-700">{totalStats.activeClients}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-full">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* خيارات التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="reportType">نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">تقرير شامل</SelectItem>
                  <SelectItem value="balances">أرصدة العملاء</SelectItem>
                  <SelectItem value="transactions">معاملات العملاء</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client">العميل</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع العملاء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="search">البحث في العملاء</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث في العملاء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول تفاصيل العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل تقرير العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                  <TableHead className="text-right">إجمالي المشتريات</TableHead>
                  <TableHead className="text-right">إجمالي المدفوعات</TableHead>
                  <TableHead className="text-right">الرصيد الحالي</TableHead>
                  <TableHead className="text-right">عدد المعاملات</TableHead>
                  <TableHead className="text-right">متوسط المعاملة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      لا توجد معاملات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReportData.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell className="text-gray-600">{client.openingBalance.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-green-600 font-medium">{client.totalPurchases.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-red-600 font-medium">{client.totalPayments.toFixed(2)} ر.س</TableCell>
                      <TableCell className={`font-bold ${client.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.currentBalance.toFixed(2)} ر.س
                      </TableCell>
                      <TableCell>{client.purchaseCount}</TableCell>
                      <TableCell>{client.averageTransactionValue.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}