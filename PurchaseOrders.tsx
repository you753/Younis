import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Clock, CheckCircle, XCircle, FileText, Edit, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SearchBox from '@/components/SearchBox';

export default function PurchaseOrders() {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('طلبات الشراء');
  }, [setCurrentPage]);

  // Fetch data from API
  const { data: purchaseOrders = [], isLoading } = useQuery({
    queryKey: ['/api/purchase-orders'],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/purchase-orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "نجح",
        description: "تم إضافة طلب الشراء بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error creating purchase order:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة طلب الشراء",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/purchase-orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "نجح",
        description: "تم تحديث طلب الشراء بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Error updating purchase order:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث طلب الشراء",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/purchase-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "نجح",
        description: "تم حذف طلب الشراء بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف طلب الشراء",
        variant: "destructive",
      });
    },
  });

  // Sample fallback data if no data from API
  const sampleOrders = [
    {
      id: 1,
      orderNumber: 'PO-2025-001',
      supplierId: 1,
      supplierName: 'مورد الأجهزة الإلكترونية',
      total: 15000,
      status: 'pending',
      createdAt: new Date('2025-01-15'),
      requestedBy: 'أحمد محمد',
      notes: 'طلب عاجل للأجهزة الجديدة',
      items: [
        { productName: 'جهاز كمبيوتر', quantity: 5, unitPrice: 3000 }
      ]
    },
    {
      id: 2,
      orderNumber: 'PO-2025-002',
      supplierId: 2,
      supplierName: 'مورد القرطاسية',
      total: 2500,
      status: 'approved',
      createdAt: new Date('2025-01-16'),
      requestedBy: 'فاطمة أحمد',
      notes: 'لوازم المكتب الشهرية',
      items: [
        { productName: 'أوراق A4', quantity: 20, unitPrice: 50 },
        { productName: 'أقلام', quantity: 100, unitPrice: 15 }
      ]
    },
    {
      id: 3,
      orderNumber: 'PO-2025-003',
      supplierId: 3,
      supplierName: 'مورد الأثاث',
      total: 8500,
      status: 'received',
      createdAt: new Date('2025-01-17'),
      requestedBy: 'محمد علي',
      notes: 'أثاث المكتب الجديد',
      items: [
        { productName: 'مكتب', quantity: 3, unitPrice: 2000 },
        { productName: 'كرسي', quantity: 5, unitPrice: 500 }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle className="h-3 w-3 mr-1" />معتمد</Badge>;
      case 'received':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />مستلم</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Use API data if available, otherwise use sample data
  const ordersData = Array.isArray(purchaseOrders) && purchaseOrders.length > 0 ? purchaseOrders : sampleOrders;
  
  const filteredOrders = ordersData.filter((order: any) => {
    const matchesSearch = !searchQuery.trim() || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter((order: any) => order.status === 'pending').length;
  const approvedOrders = ordersData.filter((order: any) => order.status === 'approved').length;
  const totalValue = ordersData.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0);

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDelete = (orderId: number) => {
    if (confirm('هل أنت متأكد من حذف طلب الشراء؟')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleView = (order: any) => {
    // Here you would show order details
    toast({
      title: "عرض الطلب",
      description: `عرض تفاصيل طلب الشراء ${order.orderNumber}`,
    });
  };

  const handleFormSuccess = (formData: any) => {
    if (editingOrder) {
      updateOrderMutation.mutate({ id: editingOrder.id, data: formData });
    } else {
      createOrderMutation.mutate(formData);
    }
    setEditingOrder(null);
    setShowForm(false);
  };

  if (isLoading) return <div className="p-6">جاري تحميل البيانات...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">طلبات الشراء</h1>
          <p className="text-muted-foreground">إدارة طلبات الشراء والموافقات</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          طلب شراء جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingOrders}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">معتمد</p>
                <p className="text-2xl font-bold text-green-700">{approvedOrders}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-purple-700">{formatAmount(totalValue)}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="البحث في طلبات الشراء..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                الكل
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                في الانتظار
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
              >
                معتمد
              </Button>
              <Button
                variant={statusFilter === 'received' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('received')}
              >
                مستلم
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة طلبات الشراء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الطلب</TableHead>
                <TableHead>طالب الشراء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{formatAmount(order.total)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {format(order.createdAt, 'yyyy-MM-dd', { locale: ar })}
                    </TableCell>
                    <TableCell>{order.requestedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(order)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    لا توجد طلبات شراء تطابق البحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purchase Order Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingOrder ? 'تعديل طلب الشراء' : 'طلب شراء جديد'}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4 purchase-order-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الطلب</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    defaultValue={editingOrder?.orderNumber || `PO-${Date.now()}`}
                    id="order-number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المورد</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    defaultValue={editingOrder?.supplierId || ''}
                    id="supplier-select"
                  >
                    <option value="">اختر المورد</option>
                    {Array.isArray(suppliers) && suppliers.map((supplier: any) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">طالب الشراء</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    defaultValue={editingOrder?.requestedBy || ''}
                    placeholder="اسم طالب الشراء"
                    id="requested-by"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ الطلب</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-md"
                    defaultValue={editingOrder ? format(editingOrder.createdAt, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea 
                  className="w-full p-2 border rounded-md" 
                  rows={3}
                  defaultValue={editingOrder?.notes || ''}
                  placeholder="ملاحظات إضافية..."
                  id="notes"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => {
                  const form = document.querySelector('.purchase-order-form') as any;
                  const formData = {
                    orderNumber: form.querySelector('#order-number').value,
                    supplierId: parseInt(form.querySelector('#supplier-select').value) || undefined,
                    supplierName: form.querySelector('#supplier-select option:checked').textContent || undefined,
                    requestedBy: form.querySelector('#requested-by').value,
                    notes: form.querySelector('#notes').value,
                    status: 'pending',
                    total: '0.00'
                  };
                  handleFormSuccess(formData);
                }}>
                  {editingOrder ? 'تحديث' : 'حفظ'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}