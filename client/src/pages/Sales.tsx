import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, TrendingUp, DollarSign, Edit, Trash2, Printer, Download, Eye } from 'lucide-react';
import EnhancedSaleForm from '@/components/forms/EnhancedSaleForm';
import Calculator from '@/components/Calculator';
import InvoiceActions from '@/components/InvoiceActions';

export default function Sales() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  useEffect(() => {
    setCurrentPage('إدارة المبيعات');
  }, [setCurrentPage]);

  // Fetch sales data
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const totalSales = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المبيعات</h2>
            <p className="text-gray-600">إضافة فواتير المبيعات ومتابعة الأداء التجاري</p>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            فاتورة مبيعات جديدة
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales.toFixed(2)} ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">عدد الفواتير</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-purple-100 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">متوسط الفاتورة</p>
              <p className="text-2xl font-bold text-gray-900">
                {sales.length ? (totalSales / sales.length).toFixed(2) : '0.00'} ر.س
              </p>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-card-icon bg-orange-100 text-orange-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">عدد العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sales Form Modal */}
      {showForm && <EnhancedSaleForm onClose={() => setShowForm(false)} />}

      {/* Calculator Component */}
      <Calculator />

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>فواتير المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد فواتير مبيعات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة أول فاتورة مبيعات</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة فاتورة جديدة
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale: any) => {
                  const client = clients.find((c: any) => c.id === sale.clientId);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{client?.name || 'غير محدد'}</TableCell>
                      <TableCell>{parseFloat(sale.total).toFixed(2)} ر.س</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{sale.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowInvoicePreview(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">معاينة الفاتورة #{selectedSale.id}</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInvoicePreview(false)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <InvoiceActions
                sale={selectedSale}
                client={clients.find((c: any) => c.id === selectedSale.clientId)}
                products={products}
                showPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Calculator Component */}
      <Calculator />
    </div>
  );
}
