import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Trash2, FileText, Receipt, Search, DollarSign, Calendar, TrendingUp, Printer, Edit, Check, ChevronsUpDown, AlertTriangle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProtectedSection from '@/components/ProtectedSection';

// Simple number formatting function
const formatNumber = (num: number | string) => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  return Math.round(number).toString();
};

interface BranchSalesProps {
  branchId: number;
}

export default function BranchSales({ branchId }: BranchSalesProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="sales">
      <BranchSalesContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchSalesContent({ branchId }: { branchId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialogs and selected items
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [editingPriceSale, setEditingPriceSale] = useState<any>(null);
  const [saleToDelete, setSaleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{[key: number]: boolean}>({});
  const [priceEditForm, setPriceEditForm] = useState({
    total: 0,
    discount: 0,
    tax: 0
  });

  const ITEMS_PER_PAGE = 10;

  // Form state for new sale
  const [newSale, setNewSale] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      { productId: '', quantity: 1, price: 0 }
    ],
    discount: 0,
    tax: 0,
    notes: '',
    status: 'completed',
    paymentMethod: 'نقداً'
  });

  // Fetch branch data
  const { data: branch } = useQuery<any>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // Fetch sales data
  const { data: sales = [], isLoading: salesLoading } = useQuery<any[]>({
    queryKey: branchId ? ['/api/sales', branchId] : ['/api/sales'],
    queryFn: async () => {
      const url = branchId ? `/api/sales?branchId=${branchId}` : '/api/sales';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    refetchInterval: 3000
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: branchId ? ['/api/clients', branchId] : ['/api/clients'],
    queryFn: async () => {
      const url = branchId ? `/api/clients?branchId=${branchId}` : '/api/clients';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    refetchInterval: 2000
  });

  // Fetch products
  const { data: products = [] } = useQuery<any[]>({
    queryKey: branchId ? ['/api/products', branchId] : ['/api/products'],
    queryFn: async () => {
      const url = branchId ? `/api/products?branchId=${branchId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    refetchInterval: 2000
  });

  // Fetch sales returns
  const { data: salesReturns = [] } = useQuery<any[]>({
    queryKey: ['/api/sales-returns'],
    refetchInterval: 3000
  });

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // حساب الكمية المرتجعة لمنتج معين في فاتورة معينة
  const getReturnedQuantity = (saleId: number, productId: number): number => {
    if (!salesReturns || salesReturns.length === 0) {
      return 0;
    }
    
    const relatedReturns = salesReturns.filter((sr: any) => 
      Number(sr.saleId) === Number(saleId)
    );
    
    let totalReturned = 0;
    
    console.log('🔍 DEBUG - Getting returned quantity for:', { 
      saleId: Number(saleId), 
      productId: Number(productId),
      relatedReturnsCount: relatedReturns.length
    });
    
    relatedReturns.forEach((sr: any) => {
      console.log('🔍 DEBUG - Processing return ID:', sr.id, 'Items:', sr.items);
      
      if (sr.items && Array.isArray(sr.items)) {
        sr.items.forEach((item: any) => {
          console.log('🔍 DEBUG - Checking item productId:', item.productId, 'vs', productId);
          
          if (Number(item.productId) === Number(productId)) {
            const qty = Number(item.quantity || 0);
            console.log('✅ DEBUG - Match found! Adding quantity:', qty);
            totalReturned += qty;
          }
        });
      }
    });
    
    console.log('📊 DEBUG - Final total returned quantity:', totalReturned);
    return totalReturned;
  };

  // Add sale mutation
  const addSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      console.log('إرسال البيانات إلى الخادم:', saleData);
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      
      console.log('استجابة الخادم:', response.status);
      const result = await response.json();
      console.log('بيانات الاستجابة:', result);
      
      if (!response.ok) {
        console.error('فشل في إنشاء الفاتورة:', result);
        throw new Error(result.message || 'Failed to create sale');
      }
      return result;
    },
    onSuccess: (data) => {
      console.log('تم حفظ الفاتورة بنجاح:', data);
      toast({ title: 'تم حفظ الفاتورة بنجاح', description: `فاتورة رقم ${data.invoiceNumber}` });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAddDialog(false);
      setNewSale({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ productId: '', quantity: 1, price: 0 }],
        discount: 0,
        tax: 0,
        notes: '',
        status: 'completed'
      });
    },
    onError: (error: any) => {
      console.error('خطأ في حفظ الفاتورة:', error);
      toast({ 
        title: 'خطأ في حفظ الفاتورة', 
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive' 
      });
    }
  });

  // Send to client account mutation
  const sendToClientAccountMutation = useMutation({
    mutationFn: async (saleId: number) => {
      const response = await fetch(`/api/sales/${saleId}/send-to-client-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في إرسال الرصيد');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ تم إرسال الرصيد بنجاح",
        description: data.message || "تم إضافة رصيد الفاتورة إلى حساب العميل",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في إرسال الرصيد",
        description: error.message || "حدث خطأ أثناء إرسال رصيد الفاتورة إلى حساب العميل",
        variant: "destructive",
      });
    },
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      const response = await fetch(`/api/sales/${saleId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete sale');
      return response.json();
    },
    onSuccess: (data, saleId) => {
      const deletedSale = saleToDelete;
      toast({ 
        title: '✓ تم الحذف بنجاح',
        description: deletedSale ? `تم حذف الفاتورة "${deletedSale.invoiceNumber}" بنجاح` : 'تم حذف الفاتورة بنجاح'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowDeleteDialog(false);
      setSaleToDelete(null);
      setIsDeleting(false);
    },
    onError: () => {
      toast({ title: 'خطأ في حذف الفاتورة', variant: 'destructive' });
      setIsDeleting(false);
    }
  });

  // Edit sale mutation
  const editSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch(`/api/sales/${saleData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (!response.ok) throw new Error('Failed to edit sale');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'تم تعديل الفاتورة بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setShowEditDialog(false);
      setEditingSale(null);
    },
    onError: () => {
      toast({ title: 'خطأ في تعديل الفاتورة', variant: 'destructive' });
    }
  });

  // Edit sale price mutation
  const editSalePriceMutation = useMutation({
    mutationFn: async (priceData: any) => {
      const response = await fetch(`/api/sales/${editingPriceSale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingPriceSale,
          total: priceData.total,
          grandTotal: priceData.total,
          discount: priceData.discount,
          tax: priceData.tax
        })
      });
      if (!response.ok) throw new Error('Failed to edit sale price');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'تم تعديل السعر بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setShowEditPriceDialog(false);
      setEditingPriceSale(null);
    },
    onError: () => {
      toast({ title: 'خطأ في تعديل السعر', variant: 'destructive' });
    }
  });

  // Helper functions
  const getClientName = (clientId: string | number | null | undefined) => {
    if (!clientId || clientId === '' || clientId === 'null') {
      return 'عميل افتراضي';
    }
    const client = clients.find((c: any) => c.id.toString() === clientId.toString());
    // إذا كان العميل رقم 16 (العميل الافتراضي)، نعرض "عميل افتراضي"
    if (clientId.toString() === '16') {
      return 'عميل افتراضي';
    }
    return client?.name || `عميل رقم ${clientId}`;
  };

  const handleEdit = (sale: any) => {
    setEditingSale({
      ...sale,
      clientId: sale.clientId.toString(),
      items: sale.items?.map((item: any) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.unitPrice || item.price
      })) || [{ productId: '', quantity: 1, price: 0 }]
    });
    setShowEditDialog(true);
  };

  const handleEditSalePrice = (sale: any) => {
    setEditingPriceSale(sale);
    setPriceEditForm({
      total: parseFloat(sale.total || sale.grandTotal) || 0,
      discount: parseFloat(sale.discount) || 0,
      tax: parseFloat(sale.tax) || 0
    });
    setShowEditPriceDialog(true);
  };

  const confirmDeleteSale = (sale: any) => {
    setSaleToDelete(sale);
    setShowDeleteDialog(true);
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;
    
    setIsDeleting(true);
    deleteSaleMutation.mutate(saleToDelete.id);
  };

  const handleSendToClientAccount = (sale: any) => {
    const clientName = getClientName(sale.clientId);
    if (confirm(`هل تريد إضافة رصيد هذه الفاتورة (${formatNumber(parseFloat(sale.total))} ريال) إلى حساب ${clientName}؟`)) {
      sendToClientAccountMutation.mutate(sale.id);
    }
  };

  const addItemToSale = () => {
    setNewSale({
      ...newSale,
      items: [...newSale.items, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItemFromSale = (index: number) => {
    if (newSale.items.length > 1) {
      setNewSale({
        ...newSale,
        items: newSale.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    console.log('🔄 تحديث المنتج:', { index, field, value });
    const updatedItems = [...newSale.items];
    
    // الحفاظ على productId الحالي عند تحديث حقول أخرى
    const currentItem = updatedItems[index];
    updatedItems[index] = { ...currentItem, [field]: value };
    
    console.log('📋 المنتج قبل التحديث:', currentItem);
    console.log('📋 المنتج بعد التحديث:', updatedItems[index]);
    
    const updatedSale = { ...newSale, items: updatedItems };
    console.log('✅ حالة الفاتورة الجديدة:', updatedSale);
    setNewSale(updatedSale);
  };

  const calculateTotal = () => {
    const subtotal = newSale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return subtotal - newSale.discount + newSale.tax;
  };

  // Filter sales based on search term
  const filteredSales = useMemo(() => {
    console.log('🔍 تصفية الفواتير:', {
      sales: sales,
      salesLength: sales?.length || 0,
      searchTerm: searchTerm,
      isArray: Array.isArray(sales),
      rawSales: JSON.stringify(sales?.slice(0, 2))
    });
    
    if (!Array.isArray(sales)) {
      console.warn('⚠️ المبيعات ليست مصفوفة!');
      return [];
    }
    
    if (!searchTerm) return sales;
    return sales.filter((sale: any) => 
      sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(sale.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm, clients]);

  // Calculate statistics
  console.log('📊 حساب الإحصائيات:', {
    salesForStats: sales,
    salesLength: sales?.length || 0,
    filteredSalesLength: filteredSales?.length || 0
  });
  
  const totalSales = Array.isArray(sales) ? sales.reduce((sum: number, sale: any) => sum + (parseFloat(sale.total || sale.grandTotal) || 0), 0) : 0;
  const completedSales = Array.isArray(sales) ? sales.filter((sale: any) => sale.status === 'completed' || sale.status === 'unpaid').length : 0;
  const averageSale = Array.isArray(sales) && sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">إجمالي الفواتير</p>
                <p className="text-xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">إجمالي المبيعات</p>
                <p className="text-xl font-bold text-green-600">{formatNumber(Math.round(totalSales))} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">متوسط الفاتورة</p>
                <p className="text-xl font-bold text-purple-600">{formatNumber(Math.round(averageSale))} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">الفواتير المكتملة</p>
                <p className="text-xl font-bold text-orange-600">{completedSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with search and add button */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">فواتير المبيعات</h2>
            <p className="text-gray-600">إدارة فواتير المبيعات والتحكم بالمبيعات</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 w-full sm:w-auto"
            data-testid="button-add-sale"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة فاتورة
          </Button>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الفواتير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search-sales"
            />
          </div>
        </div>
      </div>

      {/* Add Sale Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة فاتورة مبيعات جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Client Selection */}
            <div>
              <Label>العميل (اختياري)</Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between mt-1",
                      !newSale.clientId && "text-muted-foreground"
                    )}
                    data-testid="client-search-button"
                  >
                    {newSale.clientId
                      ? clients.find((c: any) => c.id.toString() === newSale.clientId.toString())?.name || "عميل افتراضي"
                      : "عميل افتراضي"}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن عميل..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {clients && clients.length > 0 ? (
                          clients.map((client: any) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => {
                                console.log('🔵 اختيار العميل:', client.id);
                                setNewSale({...newSale, clientId: client.id.toString()});
                                setClientSearchOpen(false);
                              }}
                              data-testid={`client-option-${client.id}`}
                            >
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4",
                                  client.id.toString() === newSale.clientId.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name} - {client.phone || 'بدون هاتف'}
                            </CommandItem>
                          ))
                        ) : (
                          <CommandItem disabled>لا توجد عملاء</CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Field */}
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={newSale.date}
                onChange={(e) => setNewSale({...newSale, date: e.target.value})}
                className="mt-1"
                data-testid="input-sale-date"
              />
            </div>

            {/* Payment Method Field */}
            <div>
              <Label>طريقة الدفع</Label>
              <Select
                value={newSale.paymentMethod}
                onValueChange={(value) => setNewSale({...newSale, paymentMethod: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقداً">نقداً</SelectItem>
                  <SelectItem value="شبكة">شبكة</SelectItem>
                  <SelectItem value="آجل">آجل</SelectItem>
                  <SelectItem value="تحويل">تحويل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-semibold">منتجات الفاتورة</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('➕ إضافة منتج جديد...');
                    const newItem = { productId: '', quantity: 1, price: 0 };
                    const updatedSale = {...newSale, items: [...newSale.items, newItem]};
                    setNewSale(updatedSale);
                    console.log('✅ تم إضافة منتج جديد:', updatedSale);
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-700"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة منتج
                </Button>
              </div>
              
              <div className="space-y-3">
                {newSale.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs">المنتج</Label>
                      <Popover 
                        open={productSearchOpen[index]} 
                        onOpenChange={(open) => setProductSearchOpen({...productSearchOpen, [index]: open})}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !item.productId && "text-muted-foreground"
                            )}
                            data-testid={`product-search-button-${index}`}
                          >
                            {item.productId
                              ? products.find((p: any) => p.id.toString() === item.productId.toString())?.name || "اختر المنتج"
                              : "اختر المنتج"}
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="ابحث عن منتج..." />
                            <CommandList>
                              <CommandEmpty>لا توجد نتائج</CommandEmpty>
                              <CommandGroup>
                                {products && products.length > 0 ? (
                                  products.map((product: any) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.name}
                                      onSelect={() => {
                                        console.log('🔵 اختيار منتج:', product.id);
                                        const price = parseFloat(product?.salePrice || product?.price) || 0;
                                        console.log('💰 سعر المنتج:', price);
                                        
                                        const updatedItems = [...newSale.items];
                                        updatedItems[index] = { 
                                          ...updatedItems[index], 
                                          productId: product.id.toString(), 
                                          price: price 
                                        };
                                        setNewSale({ ...newSale, items: updatedItems });
                                        setProductSearchOpen({...productSearchOpen, [index]: false});
                                        console.log('✅ تم تحديث المنتج والسعر معاً:', updatedItems[index]);
                                      }}
                                      data-testid={`product-option-${product.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "ml-2 h-4 w-4",
                                          product.id.toString() === item.productId.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {product.name} - {formatNumber(parseFloat(product.salePrice || product.price) || 0)} ريال
                                    </CommandItem>
                                  ))
                                ) : (
                                  <CommandItem disabled>لا توجد منتجات</CommandItem>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="w-24">
                      <Label className="text-xs">الكمية</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    
                    <div className="w-32">
                      <Label className="text-xs">السعر</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateSaleItem(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="w-32">
                      <Label className="text-xs">الإجمالي</Label>
                      <Input
                        value={formatNumber(item.quantity * item.price)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    {newSale.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemFromSale(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount and totals */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الخصم (ريال)</Label>
                <Input
                  type="number"
                  value={newSale.discount}
                  onChange={(e) => setNewSale({...newSale, discount: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>الإجمالي النهائي</Label>
                <Input
                  value={`${formatNumber(calculateTotal())} ريال`}
                  disabled
                  className="mt-1 bg-green-50 font-bold text-green-700"
                />
              </div>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Input
                value={newSale.notes}
                onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                placeholder="ملاحظات إضافية..."
                className="mt-1"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={async () => {
                  try {
                    console.log('🔵 بدء عملية حفظ الفاتورة...');
                    console.log('📋 البيانات الحالية:', newSale);
                    
                    // التحقق من البيانات المدخلة
                    console.log('🔍 فحص البيانات المدخلة:', {
                      clientId: newSale.clientId,
                      items: newSale.items,
                      firstItem: newSale.items[0]
                    });
                    
                    if (!newSale.items[0].productId || newSale.items[0].productId === '') {
                      toast({ title: 'يجب اختيار منتج صحيح', variant: 'destructive' });
                      return;
                    }
                    
                    const clientId = newSale.clientId || null;
                    const items = newSale.items;
                    
                    console.log('🔄 معالجة البيانات...');
                    
                    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                    const vat = Math.round(total * 0.15);
                    
                    const invoiceData = {
                      clientId: clientId ? parseInt(clientId) : 16,
                      branchId: branchId || null,
                      items: items.map(item => {
                        // تحويل productId إلى رقم صحيح مع التعامل مع النصوص
                        let productId;
                        if (typeof item.productId === 'string') {
                          productId = parseInt(item.productId);
                        } else {
                          productId = item.productId;
                        }
                        
                        const product = products.find((p: any) => p.id === productId);
                        console.log('🔍 معالجة المنتج:', { 
                          originalId: item.productId, 
                          convertedId: productId, 
                          product: product,
                          foundName: product?.name 
                        });
                        
                        return {
                          productId: productId,
                          productName: product?.name || `منتج رقم ${productId}`,
                          quantity: item.quantity,
                          unitPrice: item.price,
                          total: item.quantity * item.price
                        };
                      }),
                      total: total,
                      vat: vat,
                      grandTotal: total + vat,
                      discount: newSale.discount || 0,
                      tax: newSale.tax || 0,
                      notes: newSale.notes || 'فاتورة من النظام',
                      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
                      date: newSale.date || new Date().toISOString().split('T')[0],
                      status: 'unpaid',
                      paymentMethod: newSale.paymentMethod || 'نقداً'
                    };
                    
                    console.log('✅ إرسال البيانات النهائية:', invoiceData);
                    addSaleMutation.mutate(invoiceData);
                  } catch (error) {
                    console.error('❌ خطأ في المعالجة:', error);
                    toast({ title: 'خطأ في المعالجة', variant: 'destructive' });
                  }
                }}
                disabled={addSaleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
              >
                {addSaleMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </span>
                ) : 'حفظ الفاتورة'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قائمة فواتير المبيعات
            <Badge variant="outline" className="mr-auto">
              {filteredSales.length} فاتورة
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري تحميل فواتير المبيعات...</p>
            </div>
          ) : !sales || sales.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد فواتير مبيعات</p>
              <p className="text-gray-400 text-sm">ابدأ بإضافة فاتورة مبيعات جديدة</p>
              <div className="mt-4 text-xs text-gray-400">
                البيانات المحملة: {sales?.length || 0} فاتورة
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-3 font-semibold">رقم الفاتورة</th>
                    <th className="text-right p-3 font-semibold">العميل</th>
                    <th className="text-right p-3 font-semibold">التاريخ</th>
                    <th className="text-right p-3 font-semibold">المبلغ</th>
                    <th className="text-center p-3 font-semibold">العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredSales || sales || [])
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((sale: any, index: number) => (
                    <tr key={`sale-${sale.id}-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-blue-600">{sale.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">#{sale.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{getClientName(sale.clientId)}</div>
                        {sale.clientId && (
                          <div className="text-xs text-gray-500">عميل رقم: {sale.clientId}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {sale.date ? new Date(sale.date).toLocaleDateString('en-GB') : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.date ? new Date(sale.date).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false
                          }) : '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-bold text-green-600">
                            {formatNumber(
                              (sale.items?.reduce((sum: number, item: any) => {
                                const returned = getReturnedQuantity(sale.id, item.productId);
                                const remaining = parseFloat(item.quantity) - returned;
                                const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
                                return sum + (remaining * unitPrice);
                              }, 0) || 0) - (parseFloat(sale.discount) || 0)
                            )} ريال
                          </div>
                          {(parseFloat(sale.discount) || 0) > 0 && (
                            <div className="text-xs text-orange-600">
                              خصم: {formatNumber(parseFloat(sale.discount) || 0)} ريال
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {sale.clientId && !sale.sentToClientAccount && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToClientAccount(sale)}
                              disabled={sendToClientAccountMutation.isPending}
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                              title="إرسال الرصيد إلى حساب العميل"
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
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // جلب اسم الفرع الحالي من البيانات المحملة
                              const currentBranchName = branch?.name || '';
                              
                              // Print invoice
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html dir="rtl">
                                    <head>
                                      <title>فاتورة ${sale.invoiceNumber}</title>
                                      <style>
                                        body { font-family: Arial; margin: 20px; }
                                        .header { text-align: center; border-bottom: 2px solid #000; padding: 20px 0; margin-bottom: 20px; }
                                        .invoice-info { display: flex; justify-content: space-between; margin: 20px 0; }
                                        .items-table { width: 100%; border-collapse: collapse; }
                                        .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: center; }
                                        .total { text-align: left; margin-top: 20px; font-weight: bold; }
                                        @media print { .no-print { display: none; } }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        ${currentBranchName ? `<h2 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">${currentBranchName}</h2>` : ''}
                                        <h3 style="margin: 0; font-size: 24px;">فاتورة مبيعات</h3>
                                      </div>
                                      <div class="invoice-info">
                                        <div>
                                          <strong>رقم الفاتورة:</strong> ${sale.invoiceNumber}<br>
                                          <strong>التاريخ:</strong> ${new Date(sale.date || sale.createdAt).toLocaleDateString('en-GB')}<br>
                                          <strong>العميل:</strong> ${getClientName(sale.clientId)}<br>
                                          <strong>طريقة الدفع:</strong> ${sale.paymentMethod || 'نقداً'}
                                        </div>
                                      </div>
                                      <table class="items-table">
                                        <thead>
                                          <tr>
                                            <th>المنتج</th>
                                            <th>الكمية</th>
                                            <th style="color: #dc2626;">المرتجع</th>
                                            <th style="color: #16a34a;">الباقي</th>
                                            <th>السعر</th>
                                            <th>المجموع</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          ${sale.items?.map((item: any) => {
                                            const returned = getReturnedQuantity(sale.id, item.productId);
                                            const remaining = parseFloat(item.quantity) - returned;
                                            const remainingTotal = remaining * (parseFloat(item.unitPrice) || 0);
                                            return `
                                            <tr>
                                              <td>${item.productName}</td>
                                              <td>${item.quantity}</td>
                                              <td style="color: #dc2626;">${returned > 0 ? returned : '-'}</td>
                                              <td style="color: #16a34a; font-weight: bold;">${remaining}</td>
                                              <td>${item.unitPrice} ريال</td>
                                              <td>${Math.round(remainingTotal)} ريال</td>
                                            </tr>
                                          `}).join('') || ''}
                                        </tbody>
                                      </table>
                                      <div class="total">
                                        <p>المجموع الفرعي: ${Math.round(sale.items?.reduce((sum: number, item: any) => {
                                          const returned = getReturnedQuantity(sale.id, item.productId);
                                          const remaining = parseFloat(item.quantity) - returned;
                                          return sum + (remaining * (parseFloat(item.unitPrice) || 0));
                                        }, 0) || 0)} ريال</p>
                                        <p>الخصم: ${sale.discount || 0} ريال</p>
                                        <p><strong>المجموع الكلي: ${Math.round((sale.items?.reduce((sum: number, item: any) => {
                                          const returned = getReturnedQuantity(sale.id, item.productId);
                                          const remaining = parseFloat(item.quantity) - returned;
                                          return sum + (remaining * (parseFloat(item.unitPrice) || 0));
                                        }, 0) || 0) - (parseFloat(sale.discount) || 0))} ريال</strong></p>
                                      </div>
                                      <script>
                                        window.onload = function() {
                                          window.print();
                                          window.onafterprint = function() {
                                            window.close();
                                          }
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }
                            }}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowViewDialog(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="عرض الفاتورة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDeleteSale(sale)}
                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                            title="حذف الفاتورة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredSales.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSales.length)} من {filteredSales.length}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3"
                >
                  السابق
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(filteredSales.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSales.length / ITEMS_PER_PAGE), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredSales.length / ITEMS_PER_PAGE)}
                  className="px-3"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View sale dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>عرض فاتورة المبيعات</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">معلومات الفاتورة</h3>
                    <p><strong>رقم الفاتورة:</strong> {selectedSale.invoiceNumber}</p>
                    <p><strong>التاريخ:</strong> {new Date(selectedSale.createdAt || selectedSale.date).toLocaleDateString('en-GB')}</p>
                    <p><strong>الوقت:</strong> {new Date(selectedSale.createdAt || selectedSale.date).toLocaleTimeString('en-US')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">معلومات العميل</h3>
                    <p><strong>اسم العميل:</strong> {getClientName(selectedSale.clientId)}</p>
                    <p><strong>رقم العميل:</strong> {selectedSale.clientId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">تفاصيل المنتجات</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-right p-3 border-b">المنتج</th>
                        <th className="text-right p-3 border-b">الكمية</th>
                        <th className="text-right p-3 border-b text-red-600">المرتجع</th>
                        <th className="text-right p-3 border-b text-green-600">الباقي</th>
                        <th className="text-right p-3 border-b">السعر</th>
                        <th className="text-right p-3 border-b">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item: any, index: number) => {
                        const product = products.find((p: any) => p.id === item.productId);
                        const returned = getReturnedQuantity(selectedSale.id, item.productId);
                        const remaining = parseFloat(item.quantity) - returned;
                        const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
                        const remainingTotal = remaining * unitPrice;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-3">{product?.name || item.productName || `منتج رقم ${item.productId}`}</td>
                            <td className="p-3">{formatNumber(parseFloat(item.quantity) || 0)}</td>
                            <td className="p-3 text-red-600 font-semibold">{returned > 0 ? formatNumber(returned) : '-'}</td>
                            <td className="p-3 text-green-600 font-bold">{formatNumber(remaining)}</td>
                            <td className="p-3">{formatNumber(unitPrice)} ريال</td>
                            <td className="p-3 font-semibold">{formatNumber(remainingTotal)} ريال</td>
                          </tr>
                        );
                      }) || (
                        <tr>
                          <td colSpan={6} className="p-3 text-center text-gray-500">لا توجد منتجات مسجلة</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>المجموع الفرعي:</strong> {formatNumber(
                      selectedSale.items?.reduce((sum: number, item: any) => {
                        const returned = getReturnedQuantity(selectedSale.id, item.productId);
                        const remaining = parseFloat(item.quantity) - returned;
                        const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
                        return sum + (remaining * unitPrice);
                      }, 0) || 0
                    )} ريال</p>
                    <p><strong>الخصم:</strong> {formatNumber(parseFloat(selectedSale.discount) || 0)} ريال</p>
                    <p><strong>الضريبة:</strong> {formatNumber(parseFloat(selectedSale.tax) || 0)} ريال</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-700">
                      <strong>المجموع النهائي:</strong> {formatNumber(
                        (selectedSale.items?.reduce((sum: number, item: any) => {
                          const returned = getReturnedQuantity(selectedSale.id, item.productId);
                          const remaining = parseFloat(item.quantity) - returned;
                          const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
                          return sum + (remaining * unitPrice);
                        }, 0) || 0) - (parseFloat(selectedSale.discount) || 0)
                      )} ريال
                    </p>
                  </div>
                </div>
                {selectedSale.notes && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p><strong>ملاحظات:</strong> {selectedSale.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowViewDialog(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit sale dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل فاتورة المبيعات</DialogTitle>
          </DialogHeader>
          
          {editingSale && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العميل</Label>
                  <Select 
                    value={editingSale.clientId} 
                    onValueChange={(value) => setEditingSale({...editingSale, clientId: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر عميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">المنتجات</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSale({
                        ...editingSale,
                        items: [...editingSale.items, { productId: '', quantity: 1, price: 0 }]
                      });
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة منتج
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-xs">المنتج</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => {
                            const product = products.find((p: any) => p.id.toString() === value);
                            const updatedItems = [...editingSale.items];
                            updatedItems[index] = { 
                              ...updatedItems[index], 
                              productId: value,
                              price: product?.salePrice || product?.purchasePrice || 0
                            };
                            setEditingSale({ ...editingSale, items: updatedItems });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24">
                        <Label className="text-xs">الكمية</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...editingSale.items];
                            updatedItems[index] = { ...updatedItems[index], quantity: parseInt(e.target.value) || 0 };
                            setEditingSale({ ...editingSale, items: updatedItems });
                          }}
                          min="1"
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label className="text-xs">السعر</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updatedItems = [...editingSale.items];
                            updatedItems[index] = { ...updatedItems[index], price: parseFloat(e.target.value) || 0 };
                            setEditingSale({ ...editingSale, items: updatedItems });
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label className="text-xs">الإجمالي</Label>
                        <Input
                          value={formatNumber(item.quantity * item.price)}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      
                      {editingSale.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedItems = editingSale.items.filter((_: any, i: number) => i !== index);
                            setEditingSale({ ...editingSale, items: updatedItems });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الخصم (ريال)</Label>
                  <Input
                    type="number"
                    value={editingSale.discount || 0}
                    onChange={(e) => setEditingSale({...editingSale, discount: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>الإجمالي النهائي</Label>
                  <Input
                    value={`${formatNumber(
                      editingSale.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) - (editingSale.discount || 0)
                    )} ريال`}
                    disabled
                    className="mt-1 bg-green-50 font-bold text-green-700"
                  />
                </div>
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Input
                  value={editingSale.notes || ''}
                  onChange={(e) => setEditingSale({...editingSale, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const total = editingSale.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
                      const finalTotal = total - (editingSale.discount || 0);
                      
                      const updatedSale = {
                        ...editingSale,
                        total: finalTotal,
                        grandTotal: finalTotal,
                        items: editingSale.items.map((item: any) => ({
                          ...item,
                          productName: products.find((p: any) => p.id.toString() === item.productId.toString())?.name || 'منتج غير محدد',
                          unitPrice: item.price,
                          total: item.quantity * item.price
                        }))
                      };
                      
                      editSaleMutation.mutate(updatedSale);
                    } catch (error) {
                      toast({ title: 'خطأ في التعديل', variant: 'destructive' });
                    }
                  }}
                  disabled={editSaleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {editSaleMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديل'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingSale(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit price dialog */}
      <Dialog open={showEditPriceDialog} onOpenChange={setShowEditPriceDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل سعر الفاتورة</DialogTitle>
          </DialogHeader>
          
          {editingPriceSale && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>رقم الفاتورة</Label>
                <Input
                  value={editingPriceSale.invoiceNumber || editingPriceSale.id}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div>
                <Label>المبلغ الأساسي</Label>
                <Input
                  type="number"
                  value={priceEditForm.total}
                  onChange={(e) => setPriceEditForm({
                    ...priceEditForm,
                    total: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label>الخصم</Label>
                <Input
                  type="number"
                  value={priceEditForm.discount}
                  onChange={(e) => setPriceEditForm({
                    ...priceEditForm,
                    discount: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label>الضريبة</Label>
                <Input
                  type="number"
                  value={priceEditForm.tax}
                  onChange={(e) => setPriceEditForm({
                    ...priceEditForm,
                    tax: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label>المبلغ النهائي</Label>
                <Input
                  value={`${formatNumber(priceEditForm.total - priceEditForm.discount + priceEditForm.tax)} ريال`}
                  disabled
                  className="mt-1 bg-green-50 font-bold text-green-700"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    editSalePriceMutation.mutate(priceEditForm);
                  }}
                  disabled={editSalePriceMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {editSalePriceMutation.isPending ? 'جاري الحفظ...' : 'حفظ السعر'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditPriceDialog(false);
                    setEditingPriceSale(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">تأكيد حذف الفاتورة</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 pr-2">
              {saleToDelete && (
                <div className="space-y-3">
                  <p>هل أنت متأكد من حذف الفاتورة التالية؟</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      {saleToDelete.invoiceNumber}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <strong>العميل:</strong> {getClientName(saleToDelete.clientId)}
                      </p>
                      <p className="text-gray-600">
                        <strong>التاريخ:</strong> {new Date(saleToDelete.createdAt || saleToDelete.date).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-green-600 font-semibold">
                        <strong>المبلغ:</strong> {formatNumber(parseFloat(saleToDelete.total || saleToDelete.grandTotal) || 0)} ريال
                      </p>
                      {saleToDelete.items && saleToDelete.items.length > 0 && (
                        <p className="text-orange-600 mt-2 font-medium">
                          تحذير: تحتوي الفاتورة على {saleToDelete.items.length} منتج
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-red-600 font-medium">
                    ⚠️ سيتم حذف الفاتورة واسترجاع الكميات للمخزون وتحديث رصيد العميل!
                  </p>
                  <p className="text-red-600 font-medium">
                    هذا الإجراء لا يمكن التراجع عنه!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel 
              className="flex-1"
              disabled={isDeleting}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSale}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="ml-2">جاري الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف نهائي
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}