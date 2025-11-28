import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Product, Branch } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Package, 
  Search,
  Plus,
  Trash2,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface TransferItem {
  id: string;
  productId: number;
  productName: string;
  productCode?: string;
  quantity: number;
  availableQuantity: number;
}

export default function InventoryTransfer() {
  const [toBranchId, setToBranchId] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const { toast } = useToast();

  // Fetch branches
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Send transfer mutation
  const sendTransfer = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/inventory-transfers/send', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: '✅ تم إرسال المخزون بنجاح',
        description: `تم إرسال ${transferItems.length} منتج إلى الفرع`,
      });
      
      // Reset form
      setToBranchId('');
      setTransferItems([]);
      setNotes('');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '❌ فشل إرسال المخزون',
        description: error.message || 'حدث خطأ أثناء إرسال المخزون',
      });
    },
  });

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addTransferItem = (product: Product) => {
    const existingItem = transferItems.find(item => item.productId === product.id);
    if (existingItem) {
      toast({
        title: '⚠️ المنتج موجود مسبقاً',
        description: 'يمكنك تعديل الكمية من الجدول',
      });
      return;
    }
    
    const newItem: TransferItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name || 'منتج',
      productCode: product.code || undefined,
      quantity: 1,
      availableQuantity: product.quantity || 0
    };
    setTransferItems(items => [...items, newItem]);
    setSearchTerm('');
    setShowProductDialog(false);
    
    toast({
      title: '✅ تم إضافة المنتج',
      description: product.name || 'منتج',
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = transferItems.find(i => i.id === itemId);
    if (item && quantity > item.availableQuantity) {
      toast({
        variant: 'destructive',
        title: '❌ الكمية غير متوفرة',
        description: `الكمية المتوفرة: ${item.availableQuantity}`,
      });
      return;
    }
    
    setTransferItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setTransferItems(items => items.filter(item => item.id !== itemId));
  };

  const submitTransfer = async () => {
    if (!toBranchId || transferItems.length === 0) {
      toast({
        variant: 'destructive',
        title: '❌ بيانات ناقصة',
        description: 'يرجى اختيار الفرع المستهدف وإضافة منتجات للإرسال',
      });
      return;
    }

    // Check if any item exceeds available quantity
    const invalidItem = transferItems.find(item => item.quantity > item.availableQuantity);
    if (invalidItem) {
      toast({
        variant: 'destructive',
        title: '❌ كمية غير متوفرة',
        description: `المنتج "${invalidItem.productName}" الكمية المتوفرة: ${invalidItem.availableQuantity}`,
      });
      return;
    }

    // Prepare transfers data - one transfer per product
    const transfers = transferItems.map(item => ({
      transferNumber: `TR-${Date.now()}-${item.productId}`,
      fromBranchId: null, // Main warehouse (null means main)
      toBranchId: parseInt(toBranchId),
      productId: item.productId,
      quantity: item.quantity,
      status: 'pending',
      notes: notes || `إرسال ${item.productName}`,
    }));

    sendTransfer.mutate(transfers);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedBranch = branches.find((b: Branch) => b.id.toString() === toBranchId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Send className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إرسال واستقبال المخزون</h1>
              <p className="text-amber-100 mt-1">نقل المنتجات بين الفروع المختلفة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Transfer Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Branch Selection */}
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Building className="h-5 w-5" />
                تفاصيل الإرسال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الفرع المستهدف *</label>
                <Select value={toBranchId} onValueChange={setToBranchId}>
                  <SelectTrigger className="border-2" data-testid="select-branch">
                    <SelectValue placeholder="اختر الفرع المستلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: Branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">{branch.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBranch && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <p className="text-xs text-gray-600">العنوان: {selectedBranch.address || 'غير محدد'}</p>
                    <p className="text-xs text-gray-600">الهاتف: {selectedBranch.phone || 'غير محدد'}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">ملاحظات</label>
                <Textarea
                  placeholder="أدخل ملاحظات حول الإرسال..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border-2"
                  data-testid="input-notes"
                />
              </div>

              {/* Statistics */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  ملخص الإرسال
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">عدد المنتجات:</span>
                    <Badge variant="outline" className="bg-white">{transferItems.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">إجمالي الكميات:</span>
                    <Badge variant="outline" className="bg-white">
                      {transferItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Product Button */}
          <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                size="lg"
                data-testid="button-add-product"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="h-6 w-6 text-amber-600" />
                  إضافة منتج للإرسال
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن منتج بالاسم أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 border-2"
                    data-testid="input-search-product"
                  />
                </div>

                <div className="border-2 border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد منتجات مطابقة</p>
                    </div>
                  ) : (
                    filteredProducts.map((product: Product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-amber-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => addTransferItem(product)}
                        data-testid={`product-item-${product.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">الكود: {product.code || 'غير محدد'}</p>
                          </div>
                          <div className="text-left space-y-1">
                            <Badge 
                              variant={product.quantity && product.quantity > 0 ? 'default' : 'destructive'}
                              className="mb-2"
                            >
                              متوفر: {product.quantity || 0}
                            </Badge>
                            <div>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column - Transfer Items */}
        <Card className="lg:col-span-2 border-2 border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-900">
                <Package className="h-5 w-5" />
                المنتجات المحددة للإرسال ({transferItems.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {transferItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-amber-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">ابدأ بإضافة المنتجات التي تريد إرسالها</p>
                <Button 
                  onClick={() => setShowProductDialog(true)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منتج الآن
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold">#</TableHead>
                        <TableHead className="font-bold">اسم المنتج</TableHead>
                        <TableHead className="font-bold">الكود</TableHead>
                        <TableHead className="font-bold">المتوفر</TableHead>
                        <TableHead className="font-bold">الكمية</TableHead>
                        <TableHead className="font-bold">الحالة</TableHead>
                        <TableHead className="font-bold">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferItems.map((item, index) => (
                        <TableRow key={item.id} className="hover:bg-amber-50">
                          <TableCell className="font-bold">{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.productCode || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.availableQuantity}</Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={item.availableQuantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-24 border-2"
                              data-testid={`input-quantity-${item.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            {item.quantity <= item.availableQuantity ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                                جاهز
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-300">
                                <AlertCircle className="h-3 w-3 ml-1" />
                                غير متوفر
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Submit Button */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <Button 
                    onClick={submitTransfer}
                    disabled={!toBranchId || transferItems.length === 0 || sendTransfer.isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg h-14 text-lg"
                    data-testid="button-submit-transfer"
                  >
                    {sendTransfer.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الإرسال...
                      </span>
                    ) : (
                      <>
                        <Send className="h-5 w-5 ml-2" />
                        إرسال المخزون ({transferItems.length} منتج)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
