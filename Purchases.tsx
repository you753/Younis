import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ShoppingCart, TrendingDown, DollarSign, Trash2, Search, FileText, Printer, Send } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import PurchaseFormComponent from '@/components/forms/PurchaseForm';
import PurchaseInvoice from '@/components/PurchaseInvoice';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProtectedSection from '@/components/ProtectedSection';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface PurchasesProps {
  branchId?: number;
}

export default function Purchases({ branchId }: PurchasesProps = {}) {
  if (!branchId) {
    return <PurchasesContent branchId={branchId} />;
  }
  
  return (
    <ProtectedSection branchId={branchId} section="purchases">
      <PurchasesContent branchId={branchId} />
    </ProtectedSection>
  );
}

function PurchasesContent({ branchId }: { branchId?: number }) {
  const { setCurrentPage } = useAppStore();
  const { format: formatAmount } = useCurrency();
  const [showForm, setShowForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('المشتريات');
  }, [setCurrentPage]);

  // Fetch data
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: branchId ? ['/api/purchases', branchId] : ['/api/purchases'],
    queryFn: async () => {
      const url = branchId ? `/api/purchases?branchId=${branchId}` : '/api/purchases';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return response.json();
    }
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: branchId ? ['/api/suppliers', branchId] : ['/api/suppliers'],
    queryFn: async () => {
      const url = branchId ? `/api/suppliers?branchId=${branchId}` : '/api/suppliers';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    }
  });

  // Fetch purchase returns
  const { data: purchaseReturns = [] } = useQuery({
    queryKey: ['/api/purchase-returns'],
  });

  // حساب الكمية المرتجعة لمنتج معين في فاتورة معينة
  const getReturnedQuantity = (purchaseId: number, productId: number): number => {
    if (!purchaseReturns || !Array.isArray(purchaseReturns) || purchaseReturns.length === 0) {
      return 0;
    }
    
    const relatedReturns = (purchaseReturns as any[]).filter((pr: any) => 
      Number(pr.purchaseId) === Number(purchaseId)
    );
    
    let totalReturned = 0;
    
    relatedReturns.forEach((pr: any) => {
      if (pr.items && Array.isArray(pr.items)) {
        pr.items.forEach((item: any) => {
          if (Number(item.productId) === Number(productId)) {
            const qty = Number(item.quantity || 0);
            totalReturned += qty;
          }
        });
      }
    });
    
    return totalReturned;
  };

  // Filter purchases based on search query
  const filteredPurchases = Array.isArray(purchases) ? purchases.filter((purchase: any) => {
    // تصفية حسب البحث
    if (!searchQuery.trim()) return true;
    
    const searchTerms = searchQuery.toLowerCase().trim().split(' ');
    const supplier = Array.isArray(suppliers) ? suppliers.find((s: any) => s.id === purchase.supplierId) : null;
    const searchText = `${purchase.id || ''} ${purchase.total || ''} ${purchase.date || ''} ${purchase.notes || ''} ${supplier?.name || ''}`.toLowerCase();
    
    return searchTerms.every(term => searchText.includes(term));
  }) : [];

  // تطبيق pagination على الفواتير
  const {
    currentPage,
    setCurrentPage: setPage,
    pageCount,
    paginatedData: paginatedPurchases,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredPurchases,
    itemsPerPage: 10,
    resetTriggers: [searchQuery]
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      toast({
        title: "نجح",
        description: "تم حذف المشتريات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المشتريات",
        variant: "destructive",
      });
    },
  });

  // Send to supplier account mutation
  const sendToSupplierAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/purchases/${id}/send-to-supplier-account`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "✅ تم الترحيل بنجاح",
        description: data.message || "تم إضافة رصيد الفاتورة إلى حساب المورد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "فشل في ترحيل الفاتورة",
        variant: "destructive",
      });
    },
  });



  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف فاتورة المشتريات؟')) {
      deletePurchaseMutation.mutate(id);
    }
  };

  const handleSendToSupplierAccount = (purchase: any) => {
    const supplier = Array.isArray(suppliers) ? suppliers.find((s: any) => s.id === purchase.supplierId) : null;
    const supplierName = supplier?.name || 'مورد افتراضي';
    
    if (confirm(`هل تريد إضافة رصيد هذه الفاتورة (${formatAmount(parseFloat(purchase.total))}) إلى حساب ${supplierName}؟`)) {
      sendToSupplierAccountMutation.mutate(purchase.id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  if (isLoading) return <div className="p-6">جاري تحميل البيانات...</div>;

  // Calculate stats
  const totalPurchases = Array.isArray(purchases) ? purchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.total || 0), 0) : 0;
  const monthlyPurchases = Array.isArray(purchases) ? purchases.filter((purchase: any) => {
    const purchaseDate = new Date(purchase.createdAt);
    const currentDate = new Date();
    return purchaseDate.getMonth() === currentDate.getMonth() && 
           purchaseDate.getFullYear() === currentDate.getFullYear();
  }) : [];

  const averageOrderValue = Array.isArray(purchases) && purchases.length > 0 ? totalPurchases / purchases.length : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">المشتريات</h1>
          <p className="text-muted-foreground">إدارة فواتير المشتريات والموردين</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة فاتورة مشتريات
        </Button>
      </div>

      {/* Search Box */}
      <div className="mt-4">
        <SearchBox
          placeholder="ابحث في المشتريات، الموردين، المبالغ..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
        />
        
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            عرض {filteredPurchases.length} من أصل {Array.isArray(purchases) ? purchases.length : 0} فاتورة
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المشتريات</p>
                <p className="text-2xl font-bold text-blue-700">{formatAmount(totalPurchases)}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">عدد الفواتير</p>
                <p className="text-2xl font-bold text-green-700">{Array.isArray(purchases) ? purchases.length : 0}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">مشتريات هذا الشهر</p>
                <p className="text-2xl font-bold text-purple-700">{monthlyPurchases.length}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">متوسط قيمة الفاتورة</p>
                <p className="text-2xl font-bold text-orange-700">{formatAmount(averageOrderValue)}</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة فواتير المشتريات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>ملاحظات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(paginatedPurchases) && paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((purchase: any) => {
                  const supplier = Array.isArray(suppliers) ? suppliers.find((s: any) => s.id === purchase.supplierId) : null;
                  
                  // حساب المبلغ بناءً على الكمية الباقية
                  const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items || '[]') : (purchase.items || []);
                  
                  console.log('🔍 Purchase #' + purchase.id + ' items:', items);
                  
                  const remainingTotal = Array.isArray(items) ? items.reduce((sum: number, item: any) => {
                    const returned = getReturnedQuantity(purchase.id, item.productId);
                    const remaining = parseFloat(item.quantity) - returned;
                    const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
                    
                    console.log('📊 Product #' + item.productId + ':', {
                      quantity: item.quantity,
                      returned,
                      remaining,
                      unitPrice,
                      total: remaining * unitPrice
                    });
                    
                    return sum + (remaining * unitPrice);
                  }, 0) : 0;
                  
                  console.log('💰 Purchase #' + purchase.id + ' remaining total:', remainingTotal);
                  
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">#{purchase.id}</TableCell>
                      <TableCell>{supplier?.name || 'غير محدد'}</TableCell>
                      <TableCell>{formatAmount(remainingTotal)}</TableCell>
                      <TableCell>
                        {purchase.date ? new Date(purchase.date).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell>{purchase.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {purchase.supplierId && !purchase.sentToSupplierAccount && purchase.paymentMethod === 'آجل' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendToSupplierAccount(purchase)}
                              disabled={sendToSupplierAccountMutation.isPending}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                              title="ترحيل الرصيد إلى حساب المورد"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {purchase.sentToSupplierAccount && (
                            <div
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex items-center gap-1 border border-green-300"
                              title={`تم الترحيل: ${purchase.sentToSupplierAccountAt ? new Date(purchase.sentToSupplierAccountAt).toLocaleDateString('en-GB') : ''}`}
                            >
                              <span className="text-green-600">✓</span>
                              <span>مُرحل</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setShowInvoice(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            title="معاينة الفاتورة"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(purchase.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            title="حذف الفاتورة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد فواتير مشتريات حتى الآن
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* عناصر التحكم في الصفحات */}
          <PaginationControls
            currentPage={currentPage}
            pageCount={pageCount}
            totalItems={filteredPurchases.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
            itemName="فاتورة مشتريات"
          />
        </CardContent>
      </Card>

      {/* Purchase Invoice Dialog */}
      {selectedPurchase && (
        <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>فاتورة مشتريات رقم #{selectedPurchase.id}</DialogTitle>
            </DialogHeader>
            <PurchaseInvoice 
              purchase={selectedPurchase}
              supplier={Array.isArray(suppliers) ? suppliers.find((s: any) => s.id === selectedPurchase.supplierId) : null}
              onClose={() => setShowInvoice(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Purchase Form */}
      <PurchaseFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleFormSuccess}
        branchId={branchId}
      />
    </div>
  );
}