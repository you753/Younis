import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Printer, Trash2, BarChart3, Users, TrendingUp, Calendar, Plus } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import UnifiedPrintTemplate from '@/components/shared/UnifiedPrintTemplate';
import { useReactToPrint } from 'react-to-print';

export default function SalesInvoicesUnified() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [saleForPrint, setSaleForPrint] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // جلب معلومات الإعدادات والفرع
  const { data: settingsData } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: 2000,
  });

  // جلب معلومات الفرع من الـ URL أو التخزين المحلي
  const branchId = localStorage.getItem('currentBranchId');
  const { data: branchInfo } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
    refetchInterval: 2000,
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `فاتورة مبيعات ${saleForPrint?.id}`,
  });

  const handlePrintSale = (sale: any) => {
    setSaleForPrint(sale);
    setShowPrintDialog(true);
  };

  // Delete function
  const deleteSale = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف الفاتورة');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الفاتورة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفاتورة",
        variant: "destructive",
      });
    },
  });

  // Get filtered sales
  const filteredSales = (sales || []).filter((sale: any) => 
    sale.id.toString().includes(searchTerm) ||
    (clients || []).find((c: any) => c.id === sale.clientId)?.name?.includes(searchTerm)
  );

  // Get statistics
  const totalSales = (sales || []).length;
  const totalAmount = (sales || []).reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
  const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;
  const todaySales = (sales || []).filter((sale: any) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  }).length;

  const getClientName = (clientId: number) => {
    const client = (clients || []).find((c: any) => c.id === clientId);
    return client?.name || 'عميل نقدي';
  };

  const getSaleItems = (sale: any) => {
    if (!sale.items || !Array.isArray(sale.items)) return [];
    return sale.items.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice || item.price || 0,
      quantity: item.quantity || 0,
      total: (item.quantity || 0) * (item.unitPrice || item.price || 0)
    }));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">فواتير المبيعات</h1>
          <p className="text-muted-foreground">إدارة وطباعة فواتير المبيعات بقالب موحد</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = '/sales'}
        >
          <Plus className="h-5 w-5 ml-2" />
          مبيعة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{formatAmount(totalAmount)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الفاتورة</p>
                <p className="text-2xl font-bold">{formatAmount(averageSale)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مبيعات اليوم</p>
                <p className="text-2xl font-bold">{todaySales}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الفواتير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قائمة فواتير المبيعات ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale: any, index: number) => (
                <TableRow key={`sale-${sale.id}-${index}`}>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{getClientName(sale.clientId)}</TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatAmount(parseFloat(sale.total))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      مؤكدة
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintSale(sale)}
                        className="h-8 w-8 p-0"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSale.mutate(sale.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد فواتير مبيعات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>طباعة فاتورة مبيعات #{saleForPrint?.id}</span>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>

          {saleForPrint && (
            <UnifiedPrintTemplate
              ref={printRef}
              title="فاتورة مبيعات"
              invoiceNumber={`SALE${saleForPrint.id.toString().padStart(6, '0')}`}
              date={saleForPrint.date}
              client={clients?.find((c: any) => c.id === saleForPrint.clientId)}
              items={getSaleItems(saleForPrint)}
              total={saleForPrint.total}
              notes={saleForPrint.notes}
              branchId={saleForPrint.branchId}
              showVAT={true}
              extraInfo={{
                subtitle: "نسخة أصلية للعميل",
                type: "مبيعات"
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}