import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, TrendingUp, DollarSign, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SaleFormData {
  clientId: number;
  total: string;
  notes?: string;
}

export default function Sales() {
  const { setCurrentPage } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>({
    clientId: 0,
    total: '',
    notes: ''
  });

  useEffect(() => {
    setCurrentPage('إدارة المبيعات');
  }, [setCurrentPage]);

  // Fetch sales data
  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const response = await apiRequest('/api/sales', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "تم إنشاء فاتورة المبيعات بنجاح",
        description: "تم حفظ الفاتورة الجديدة",
      });
      setShowForm(false);
      setFormData({ clientId: 0, total: '', notes: '' });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: "حدث خطأ أثناء حفظ الفاتورة",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientId && formData.total) {
      createSaleMutation.mutate(formData);
    } else {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
    }
  };

  const totalSales = sales?.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0) || 0;

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
              <p className="text-2xl font-bold text-gray-900">{sales?.length || 0}</p>
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
                {sales?.length ? (totalSales / sales.length).toFixed(2) : '0.00'} ر.س
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
              <p className="text-2xl font-bold text-gray-900">{clients?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>فاتورة مبيعات جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientId">العميل</Label>
                  <Select onValueChange={(value) => setFormData({...formData, clientId: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="total">إجمالي المبلغ (ر.س)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={formData.total}
                    onChange={(e) => setFormData({...formData, total: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="ملاحظات إضافية"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createSaleMutation.isPending}>
                    {createSaleMutation.isPending ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>فواتير المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل البيانات...</div>
          ) : sales?.length === 0 ? (
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
                {sales?.map((sale: any) => {
                  const client = clients?.find((c: any) => c.id === sale.clientId);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{client?.name || 'غير محدد'}</TableCell>
                      <TableCell>{parseFloat(sale.total).toFixed(2)} ر.س</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{sale.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
    </div>
  );
}
