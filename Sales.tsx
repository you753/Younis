import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, FileText, TrendingUp, DollarSign, Edit, Trash2, Printer, Download, ArrowLeft, Percent, Calculator as CalcIcon, Search, Eye, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import SimpleSaleForm from '@/components/forms/SimpleSaleForm';
import Calculator from '@/components/Calculator';
import SearchBox from '@/components/SearchBox';
import PrintActionsDropdown from '@/components/PrintActionsDropdown';

export default function Sales() {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [editingSale, setEditingSale] = useState<any>(null);
  const [previewSale, setPreviewSale] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // تحديد نوع الصفحة حسب المسار
  const getPageInfo = () => {
    switch (location) {
      case '/sales-returns':
        return { 
          title: 'مرتجعات المبيعات', 
          description: 'إدارة مرتجعات المبيعات والاسترداد',
          icon: ArrowLeft,
          buttonText: 'إضافة مرتجع'
        };
      case '/quotes':
        return { 
          title: 'عروض الأسعار', 
          description: 'إنشاء وإدارة عروض الأسعار للعملاء',
          icon: FileText,
          buttonText: 'إضافة عرض سعر'
        };

      default:
        return { 
          title: 'فواتير المبيعات', 
          description: 'إدارة فواتير المبيعات والعمليات التجارية',
          icon: FileText,
          buttonText: 'إضافة فاتورة'
        };
    }
  };

  const pageInfo = getPageInfo();

  useEffect(() => {
    setCurrentPage(pageInfo.title);
  }, [setCurrentPage, pageInfo.title]);

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

  // Fetch branches for invoice display
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  // فلترة المبيعات حسب البحث المحلي
  const filteredSales = Array.isArray(sales) ? sales.filter((sale: any) => {
    const searchQuery = localSearchQuery || searchTerm;
    if (!searchQuery.trim()) return true;
    
    const searchTerms = searchQuery.toLowerCase().trim().split(' ');
    const client = Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null;
    const searchText = `${sale.id || ''} ${sale.total || ''} ${sale.date || ''} ${sale.notes || ''} ${client?.name || ''} ${client?.phone || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  const totalSales = filteredSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);

  // Delete mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف الفاتورة');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفاتورة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الفاتورة",
        variant: "destructive",
      });
    },
  });

  // Send to client account mutation
  const sendToClientAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/sales/${id}/send-to-client-account`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "✅ تم إرسال الرصيد بنجاح",
        description: data.message || "تم إضافة رصيد الفاتورة إلى حساب العميل",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في إرسال الرصيد",
        description: error.message || "حدث خطأ أثناء إرسال رصيد الفاتورة إلى حساب العميل",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = (sale: any) => {
    if (confirm(`هل أنت متأكد من حذف الفاتورة #${sale.id}؟`)) {
      deleteSaleMutation.mutate(sale.id);
    }
  };

  const handlePreview = (sale: any) => {
    setPreviewSale(sale);
    setShowPreview(true);
  };

  const handleSendToClientAccount = (sale: any) => {
    const client = Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null;
    const clientName = sale.clientId === 16 ? 'عميل افتراضي' : (client?.name || 'عميل افتراضي');
    
    if (confirm(`هل تريد إضافة رصيد هذه الفاتورة (${formatAmount(parseFloat(sale.total))}) إلى حساب ${clientName}؟`)) {
      sendToClientAccountMutation.mutate(sale.id);
    }
  };

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

        {/* شريط البحث */}
        <div className="mt-4">
          <SearchBox
            placeholder="ابحث في المبيعات، العملاء، المبالغ..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
          />
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              عرض {filteredSales.length} من أصل {Array.isArray(sales) ? sales.length : 0} فاتورة
            </p>
          )}
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
              <p className="text-2xl font-bold text-gray-900">{formatAmount(totalSales)}</p>
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
                {sales.length ? formatAmount(totalSales / sales.length) : formatAmount(0)}
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
      {showForm && <SimpleSaleForm onClose={() => setShowForm(false)} />}

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
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج للبحث</h3>
                  <p className="text-gray-600 mb-4">جرب البحث بكلمات مختلفة</p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    مسح البحث
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد فواتير مبيعات</h3>
                  <p className="text-gray-600 mb-4">ابدأ بإضافة أول فاتورة مبيعات</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة فاتورة جديدة
                  </Button>
                </>
              )}
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
                {filteredSales.map((sale: any, index: number) => {
                  const client = Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null;
                  const clientName = sale.clientId === 16 ? 'عميل افتراضي' : (client?.name || 'عميل افتراضي');
                  return (
                    <TableRow key={`sale-${sale.id}-${index}`}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{clientName}</TableCell>
                      <TableCell>{formatAmount(parseFloat(sale.total))}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{sale.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {sale.clientId && !sale.sentToClientAccount && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendToClientAccount(sale)}
                              disabled={sendToClientAccountMutation.isPending}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                              title="إرسال الرصيد إلى حساب العميل"
                              data-testid={`button-send-to-client-${sale.id}`}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {sale.sentToClientAccount && (
                            <div 
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex items-center gap-1 border border-green-300"
                              title={`تم الإرسال: ${sale.sentToClientAccountAt ? new Date(sale.sentToClientAccountAt).toLocaleDateString('en-GB') : ''}`}
                            >
                              <span className="text-green-600">✓</span>
                              <span>مُرسل</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePreview(sale)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            title="معاينة الفاتورة"
                            data-testid={`button-preview-${sale.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PrintActionsDropdown
                            sale={sale}
                            client={Array.isArray(clients) ? clients.find((c: any) => c.id === sale.clientId) : null}
                            products={Array.isArray(products) ? products : []}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(sale)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            title="تعديل الفاتورة"
                            data-testid={`button-edit-${sale.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleDelete(sale)}
                            disabled={deleteSaleMutation.isPending}
                            title="حذف الفاتورة"
                            data-testid={`button-delete-${sale.id}`}
                          >
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



      {/* Simple Professional Preview Modal */}
      {showPreview && previewSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">معاينة الفاتورة</h3>
                  <p className="text-sm text-gray-600">فاتورة رقم #{previewSale.id}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">رقم الفاتورة</label>
                    <p className="text-lg font-semibold text-gray-900">#{previewSale.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">العميل</label>
                    <p className="text-gray-900">
                      {Array.isArray(clients) ? 
                        clients.find((c: any) => c.id === previewSale.clientId)?.name || 'غير محدد' : 
                        'غير محدد'
                      }
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">التاريخ</label>
                    <p className="text-gray-900">{new Date(previewSale.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">إجمالي المبلغ</label>
                    <p className="text-xl font-bold text-green-600">{formatAmount(parseFloat(previewSale.total))}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {previewSale.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ملاحظات</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{previewSale.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                >
                  إغلاق
                </Button>
                <Button 
                  onClick={() => {
                    setShowPreview(false);
                    handleEdit(previewSale);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Component */}
      <Calculator />
    </div>
  );
}
