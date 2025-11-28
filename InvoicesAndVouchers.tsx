import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileText, Receipt, Search, Eye, Printer } from 'lucide-react';
import PrintActionsDropdown from '@/components/PrintActionsDropdown';
import { formatAmount } from '@/lib/utils';

export default function InvoicesAndVouchers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'invoices' | 'vouchers'>('invoices');

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const filteredSales = (sales as any[])?.filter((sale: any) => {
    const client = (clients as any[])?.find((c: any) => c.id === sale.clientId);
    const searchString = `${sale.id} ${client?.name || ''} ${sale.total}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الفواتير وسندات الإخراج</h1>
          <p className="text-muted-foreground">إدارة فواتير المبيعات وسندات إخراج البضاعة</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 rtl:space-x-reverse">
        <Button
          variant={selectedTab === 'invoices' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('invoices')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          فواتير المبيعات
        </Button>
        <Button
          variant={selectedTab === 'vouchers' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('vouchers')}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          سندات إخراج البضاعة
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الفواتير والسندات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on selected tab */}
      {selectedTab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              فواتير المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد فواتير مبيعات
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>خيارات الطباعة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: any) => {
                    const client = (clients as any[])?.find((c: any) => c.id === sale.clientId);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">#{sale.id}</TableCell>
                        <TableCell>{client?.name || 'غير محدد'}</TableCell>
                        <TableCell>{formatAmount(parseFloat(sale.total))}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PrintActionsDropdown
                              sale={sale}
                              client={client}
                              products={products}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'vouchers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              سندات إخراج البضاعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد سندات إخراج
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم السند</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>عدد الأصناف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>طباعة السند</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: any) => {
                    const client = (clients as any[])?.find((c: any) => c.id === sale.clientId);
                    const itemsCount = sale.items ? JSON.parse(sale.items).length : 0;
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">GV-{sale.id}</TableCell>
                        <TableCell>{client?.name || 'غير محدد'}</TableCell>
                        <TableCell>{itemsCount} صنف</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              // Print goods issue voucher only
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>سند إخراج بضاعة - ${sale.id}</title>
                                      <style>
                                        body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; }
                                        .header { text-align: center; margin-bottom: 30px; }
                                        .info { margin-bottom: 20px; }
                                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                                        th { background-color: #f2f2f2; }
                                        .signature { margin-top: 50px; display: flex; justify-content: space-between; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        <h2>سند إخراج بضاعة</h2>
                                        <p>رقم السند: GV-${sale.id}</p>
                                      </div>
                                      <div class="info">
                                        <p><strong>العميل:</strong> ${client?.name || 'غير محدد'}</p>
                                        <p><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleDateString('en-GB')}</p>
                                      </div>
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>الصنف</th>
                                            <th>الكمية</th>
                                            <th>الوحدة</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          ${sale.items ? JSON.parse(sale.items).map((item: any) => `
                                            <tr>
                                              <td>${item.productName}</td>
                                              <td>${item.quantity}</td>
                                              <td>قطعة</td>
                                            </tr>
                                          `).join('') : ''}
                                        </tbody>
                                      </table>
                                      <div class="signature">
                                        <div>
                                          <p>توقيع المستلم: ________________</p>
                                          <p>التاريخ: ________________</p>
                                        </div>
                                        <div>
                                          <p>توقيع المسؤول: ________________</p>
                                          <p>التاريخ: ________________</p>
                                        </div>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                printWindow.print();
                              }
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}