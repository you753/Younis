import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, Receipt, CreditCard, FileText, Download } from 'lucide-react';
import type { Client, Supplier, ClientReceiptVoucher, SupplierPaymentVoucher } from '@shared/schema';

export default function DailyReports() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setCurrentPage('التقارير اليومية');
  }, [location, setCurrentPage]);

  // Fetch data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers']
  });

  const { data: clientVouchers = [] } = useQuery<ClientReceiptVoucher[]>({
    queryKey: ['/api/client-receipt-vouchers']
  });

  const { data: supplierVouchers = [] } = useQuery<SupplierPaymentVoucher[]>({
    queryKey: ['/api/supplier-payment-vouchers']
  });

  // Filter data by selected date
  const selectedDateStr = new Date(selectedDate).toDateString();
  
  const todayClientVouchers = clientVouchers.filter(voucher => 
    new Date(voucher.receiptDate).toDateString() === selectedDateStr
  );

  const todaySupplierVouchers = supplierVouchers.filter(voucher => 
    new Date(voucher.paymentDate).toDateString() === selectedDateStr
  );

  // Calculate totals
  const totalReceived = todayClientVouchers.reduce((sum, voucher) => sum + parseFloat(voucher.amount || '0'), 0);
  const totalPaid = todaySupplierVouchers.reduce((sum, voucher) => sum + parseFloat(voucher.amount || '0'), 0);
  const netCashFlow = totalReceived - totalPaid;

  // Get unique clients and suppliers who had transactions today
  const clientsWithPayments = todayClientVouchers.reduce((acc, voucher) => {
    const clientId = voucher.clientId;
    if (!acc[clientId]) {
      const client = clients.find(c => c.id === clientId);
      acc[clientId] = {
        client,
        vouchers: [],
        totalAmount: 0
      };
    }
    acc[clientId].vouchers.push(voucher);
    acc[clientId].totalAmount += parseFloat(voucher.amount || '0');
    return acc;
  }, {} as Record<number, { client?: Client; vouchers: ClientReceiptVoucher[]; totalAmount: number }>);

  const suppliersWithPayments = todaySupplierVouchers.reduce((acc, voucher) => {
    const supplierId = voucher.supplierId;
    if (!acc[supplierId]) {
      const supplier = suppliers.find(s => s.id === supplierId);
      acc[supplierId] = {
        supplier,
        vouchers: [],
        totalAmount: 0
      };
    }
    acc[supplierId].vouchers.push(voucher);
    acc[supplierId].totalAmount += parseFloat(voucher.amount || '0');
    return acc;
  }, {} as Record<number, { supplier?: Supplier; vouchers: SupplierPaymentVoucher[]; totalAmount: number }>);

  // Helper functions
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'check': return 'شيك';
      case 'credit_card': return 'بطاقة ائتمان';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => 
    amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' });

  const getUniquePaymentMethods = (vouchers: any[]) => {
    const methods = vouchers.map(v => v.paymentMethod);
    return methods.filter((method, index) => methods.indexOf(method) === index);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">التقارير اليومية</h2>
          <p className="text-gray-600">تقارير المدفوعات والمقبوضات اليومية للعملاء والموردين</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">إجمالي المقبوضات</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReceived)}</p>
                <p className="text-xs text-green-600 mt-1">{todayClientVouchers.length} سند قبض</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-red-600 mt-1">{todaySupplierVouchers.length} سند صرف</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${netCashFlow >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>صافي التدفق النقدي</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatCurrency(Math.abs(netCashFlow))}
                </p>
                <p className={`text-xs ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                  {netCashFlow >= 0 ? 'فائض' : 'عجز'}
                </p>
              </div>
              <div className={`${netCashFlow >= 0 ? 'bg-blue-200' : 'bg-orange-200'} p-3 rounded-full`}>
                <DollarSign className={`h-6 w-6 ${netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-purple-700">
                  {todayClientVouchers.length + todaySupplierVouchers.length}
                </p>
                <p className="text-xs text-purple-600 mt-1">معاملة</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">تقرير العملاء</TabsTrigger>
          <TabsTrigger value="suppliers">تقرير الموردين</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                المقبوضات من العملاء - {new Date(selectedDate).toLocaleDateString('ar-SA')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(clientsWithPayments).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>لا توجد مقبوضات من العملاء في هذا التاريخ</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العميل</TableHead>
                        <TableHead>الرصيد الحالي</TableHead>
                        <TableHead>المبلغ المستلم</TableHead>
                        <TableHead>عدد السندات</TableHead>
                        <TableHead>طرق الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(clientsWithPayments).map(({ client, vouchers, totalAmount }) => (
                        <TableRow key={client?.id}>
                          <TableCell className="font-medium">{client?.name || 'غير محدد'}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${parseFloat(client?.balance || '0') > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(parseFloat(client?.balance || '0'))}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                          <TableCell>{vouchers.length}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getUniquePaymentMethods(vouchers).map(method => (
                                <Badge key={method} variant="outline" className="text-xs">
                                  {getPaymentMethodLabel(method)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">العملاء مع الديون المتبقية</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>العميل</TableHead>
                          <TableHead>الدين المتبقي</TableHead>
                          <TableHead>آخر دفعة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients
                          .filter(client => parseFloat(client.balance || '0') > 0)
                          .sort((a, b) => parseFloat(b.balance || '0') - parseFloat(a.balance || '0'))
                          .slice(0, 10)
                          .map(client => {
                            const lastVoucher = clientVouchers
                              .filter(v => v.clientId === client.id)
                              .sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime())[0];
                            
                            return (
                              <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="font-bold text-red-600">
                                  {formatCurrency(parseFloat(client.balance || '0'))}
                                </TableCell>
                                <TableCell>
                                  {lastVoucher 
                                    ? new Date(lastVoucher.receiptDate).toLocaleDateString('ar-SA')
                                    : 'لا توجد دفعات'
                                  }
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                المدفوعات للموردين - {new Date(selectedDate).toLocaleDateString('ar-SA')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(suppliersWithPayments).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>لا توجد مدفوعات للموردين في هذا التاريخ</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المورد</TableHead>
                        <TableHead>الرصيد الحالي</TableHead>
                        <TableHead>المبلغ المدفوع</TableHead>
                        <TableHead>عدد السندات</TableHead>
                        <TableHead>طرق الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(suppliersWithPayments).map(({ supplier, vouchers, totalAmount }) => (
                        <TableRow key={supplier?.id}>
                          <TableCell className="font-medium">{supplier?.name || 'غير محدد'}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${parseFloat(supplier?.balance || '0') > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(parseFloat(supplier?.balance || '0'))}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-red-600">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                          <TableCell>{vouchers.length}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getUniquePaymentMethods(vouchers).map(method => (
                                <Badge key={method} variant="outline" className="text-xs">
                                  {getPaymentMethodLabel(method)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">الموردين مع الأرصدة المستحقة</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المورد</TableHead>
                          <TableHead>الرصيد المستحق</TableHead>
                          <TableHead>آخر دفعة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliers
                          .filter(supplier => parseFloat(supplier.balance || '0') > 0)
                          .sort((a, b) => parseFloat(b.balance || '0') - parseFloat(a.balance || '0'))
                          .slice(0, 10)
                          .map(supplier => {
                            const lastVoucher = supplierVouchers
                              .filter(v => v.supplierId === supplier.id)
                              .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                            
                            return (
                              <TableRow key={supplier.id}>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell className="font-bold text-red-600">
                                  {formatCurrency(parseFloat(supplier.balance || '0'))}
                                </TableCell>
                                <TableCell>
                                  {lastVoucher 
                                    ? new Date(lastVoucher.paymentDate).toLocaleDateString('ar-SA')
                                    : 'لا توجد دفعات'
                                  }
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}