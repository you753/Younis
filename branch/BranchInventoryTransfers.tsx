import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Send, Package, Trash2, CheckCircle2, ArrowRight, ArrowDown, ShoppingBag } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

const formatNumber = (num: number | string) => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  return Math.round(number).toString();
};

interface BranchInventoryTransfersProps {
  branchId: number;
}

export default function BranchInventoryTransfers({ branchId }: BranchInventoryTransfersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('send');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);

  const [sendForm, setSendForm] = useState({
    toBranchId: '',
    productId: '',
    quantity: '',
    notes: ''
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  const { data: allProducts = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const products = allProducts.filter(p => p.branchId === branchId || p.branchId === null);

  const { data: transfers = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory-transfers'],
    refetchInterval: 3000,
    select: (data) => data.filter(t => 
      t.fromBranchId === branchId || t.toBranchId === branchId
    )
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/inventory-transfers/send', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم إرسال المخزون بنجاح',
        description: 'تم خصم الكمية من مخزون الفرع',
        className: 'bg-green-50 border-green-200'
      });
      setShowSendDialog(false);
      setSendForm({ toBranchId: '', productId: '', quantity: '', notes: '' });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الإرسال',
        description: error.message || 'فشل في إرسال المخزون',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const receiveMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return await apiRequest('POST', `/api/inventory-transfers/${transferId}/receive`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم الاستلام بنجاح',
        description: 'تم إضافة الكمية لمخزون الفرع',
        className: 'bg-green-50 border-green-200'
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الاستلام',
        description: error.message || 'فشل في استلام المخزون',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return await apiRequest(`/api/inventory-transfers/${transferId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: '✅ تم الحذف بنجاح',
        description: 'تم حذف العملية واسترجاع الكمية',
        className: 'bg-green-50 border-green-200'
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الحذف',
        description: error.message || 'فشل في حذف العملية',
        variant: 'destructive'
      });
    }
  });

  const handleSendSubmit = () => {
    if (!sendForm.toBranchId || !sendForm.productId || !sendForm.quantity) {
      toast({
        title: '⚠️ بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    sendMutation.mutate({
      fromBranchId: branchId,
      toBranchId: parseInt(sendForm.toBranchId),
      productId: parseInt(sendForm.productId),
      quantity: parseInt(sendForm.quantity),
      notes: sendForm.notes
    });
  };

  const getProductName = (productId: number) => {
    const product = allProducts.find(p => p.id === productId);
    return product?.name || 'غير معروف';
  };

  const getProductDetails = (productId: number) => {
    return allProducts.find(p => p.id === productId);
  };

  const getBranchName = (branchIdToFind: number | null) => {
    if (!branchIdToFind) return 'المخزون الرئيسي';
    const branch = branches.find(b => b.id === branchIdToFind);
    return branch?.name || 'غير معروف';
  };

  const sentTransfers = transfers.filter(t => t.fromBranchId === branchId && t.status === 'sent');
  const receivedTransfers = transfers.filter(t => t.toBranchId === branchId && t.status === 'received');
  const pendingReceive = transfers.filter(t => t.toBranchId === branchId && t.status === 'sent');

  const { currentPage: sentPage, setCurrentPage: setSentPage, pageCount: sentPageCount, paginatedData: paginatedSent, startIndex: sentStart, endIndex: sentEnd } = usePagination({
    data: sentTransfers,
    itemsPerPage: 10,
    resetTriggers: []
  });

  const { currentPage: receivedPage, setCurrentPage: setReceivedPage, pageCount: receivedPageCount, paginatedData: paginatedReceived, startIndex: receivedStart, endIndex: receivedEnd } = usePagination({
    data: receivedTransfers,
    itemsPerPage: 10,
    resetTriggers: []
  });

  const { currentPage: pendingPage, setCurrentPage: setPendingPage, pageCount: pendingPageCount, paginatedData: paginatedPending, startIndex: pendingStart, endIndex: pendingEnd } = usePagination({
    data: pendingReceive,
    itemsPerPage: 10,
    resetTriggers: []
  });

  const selectedBranch = branches.find(b => b.id === parseInt(sendForm.toBranchId));
  const selectedProduct = products.find(p => p.id === parseInt(sendForm.productId));

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            إرسال واستقبال المخزون
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            إدارة نقل المخزون بين الفروع
          </p>
        </div>
        
        <Button
          onClick={() => setShowSendDialog(true)}
          className="w-full md:w-auto px-6 shadow-lg hover:shadow-xl transition-all bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
          data-testid="button-send-inventory"
        >
          <Send className="h-4 w-4 ml-2" />
          إرسال مخزون
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">تم الإرسال</p>
                <p className="text-3xl font-bold text-white mt-1">{sentTransfers.length}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Send className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100 font-medium">قيد الاستلام</p>
                <p className="text-3xl font-bold text-white mt-1">{pendingReceive.length}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 font-medium">تم الاستلام</p>
                <p className="text-3xl font-bold text-white mt-1">{receivedTransfers.length}</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
              <TabsTrigger 
                value="send" 
                className="text-base data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                data-testid="tab-sent"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                تم الإرسال ({sentTransfers.length})
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                data-testid="tab-pending"
              >
                <Package className="h-4 w-4 ml-2" />
                قيد الاستلام ({pendingReceive.length})
              </TabsTrigger>
              <TabsTrigger 
                value="received" 
                className="text-base data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-testid="tab-received"
              >
                <ArrowDown className="h-4 w-4 ml-2" />
                مستلم ({receivedTransfers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send">
              <div className="space-y-4">
                {sentTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">لم يتم إرسال أي مخزون بعد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right text-gray-700 font-bold">رقم العملية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">المنتج</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">الكمية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">إلى</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">التاريخ</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSent.map((transfer) => {
                          const product = getProductDetails(transfer.productId);
                          return (
                            <TableRow key={transfer.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-900">{transfer.transferNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded bg-blue-50">
                                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-gray-900 font-medium">{getProductName(transfer.productId)}</p>
                                    {product && (
                                      <p className="text-xs text-gray-500">
                                        السعر: {formatNumber(product.price)} ريال
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-700 border-0">
                                  {formatNumber(transfer.quantity)} قطعة
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {getBranchName(transfer.toBranchId)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(transfer.sentAt).toLocaleDateString('en-GB')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(transfer.id)}
                                  disabled={deleteMutation.isPending}
                                  className="shadow-sm"
                                  data-testid={`button-delete-${transfer.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {sentTransfers.length > 10 && (
                  <PaginationControls
                    currentPage={sentPage}
                    pageCount={sentPageCount}
                    totalItems={sentTransfers.length}
                    startIndex={sentStart}
                    endIndex={sentEnd}
                    onPageChange={setSentPage}
                    itemName="تحويلة"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingReceive.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد عمليات قيد الاستلام</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right text-gray-700 font-bold">رقم العملية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">المنتج</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">الكمية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">من</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">التاريخ</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPending.map((transfer) => {
                          const product = getProductDetails(transfer.productId);
                          return (
                            <TableRow key={transfer.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-900">{transfer.transferNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded bg-orange-50">
                                    <ShoppingBag className="h-4 w-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-gray-900 font-medium">{getProductName(transfer.productId)}</p>
                                    {product && (
                                      <p className="text-xs text-gray-500">
                                        السعر: {formatNumber(product.price)} ريال
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-orange-100 text-orange-700 border-0">
                                  {formatNumber(transfer.quantity)} قطعة
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {getBranchName(transfer.fromBranchId)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(transfer.sentAt).toLocaleDateString('en-GB')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => receiveMutation.mutate(transfer.id)}
                                  disabled={receiveMutation.isPending}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-sm"
                                  data-testid={`button-receive-${transfer.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 ml-1" />
                                  استلام
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {pendingReceive.length > 10 && (
                  <PaginationControls
                    currentPage={pendingPage}
                    pageCount={pendingPageCount}
                    totalItems={pendingReceive.length}
                    startIndex={pendingStart}
                    endIndex={pendingEnd}
                    onPageChange={setPendingPage}
                    itemName="تحويلة"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="received">
              <div className="space-y-4">
                {receivedTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد عمليات مستلمة</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right text-gray-700 font-bold">رقم العملية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">المنتج</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">الكمية</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">من</TableHead>
                          <TableHead className="text-right text-gray-700 font-bold">تاريخ الاستلام</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReceived.map((transfer) => {
                          const product = getProductDetails(transfer.productId);
                          return (
                            <TableRow key={transfer.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-900">{transfer.transferNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded bg-green-50">
                                    <ShoppingBag className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-gray-900 font-medium">{getProductName(transfer.productId)}</p>
                                    {product && (
                                      <p className="text-xs text-gray-500">
                                        السعر: {formatNumber(product.price)} ريال
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  {formatNumber(transfer.quantity)} قطعة
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {getBranchName(transfer.fromBranchId)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(transfer.receivedAt).toLocaleDateString('en-GB')}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {receivedTransfers.length > 10 && (
                  <PaginationControls
                    currentPage={receivedPage}
                    pageCount={receivedPageCount}
                    totalItems={receivedTransfers.length}
                    startIndex={receivedStart}
                    endIndex={receivedEnd}
                    onPageChange={setReceivedPage}
                    itemName="تحويلة"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md border-0 shadow-2xl bg-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-gray-900">
              <Send className="h-5 w-5 text-yellow-500" />
              إرسال مخزون
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-700 mb-2 block">الفرع المستلم *</Label>
              <Popover open={openBranch} onOpenChange={setOpenBranch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-gray-50 border-gray-300 text-gray-900"
                  >
                    {selectedBranch ? selectedBranch.name : "اختر الفرع"}
                    <ArrowDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border-gray-200">
                  <Command className="bg-white">
                    <CommandInput placeholder="ابحث عن فرع..." className="text-gray-900" />
                    <CommandEmpty className="text-gray-500 p-4">لا يوجد فرع</CommandEmpty>
                    <CommandGroup>
                      {branches.filter(b => b.id !== branchId).map((branch) => (
                        <CommandItem
                          key={branch.id}
                          onSelect={() => {
                            setSendForm({ ...sendForm, toBranchId: branch.id.toString() });
                            setOpenBranch(false);
                          }}
                          className="text-gray-900 hover:bg-gray-100"
                        >
                          <Check
                            className={`ml-2 h-4 w-4 ${
                              sendForm.toBranchId === branch.id.toString() ? "opacity-100" : "opacity-0"
                            }`}
                            style={{ color: '#EAB308' }}
                          />
                          {branch.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">المنتج *</Label>
              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-gray-50 border-gray-300 text-gray-900"
                  >
                    {selectedProduct ? (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-yellow-500" />
                        <span>{selectedProduct.name}</span>
                      </div>
                    ) : (
                      "اختر المنتج"
                    )}
                    <ArrowDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border-gray-200">
                  <Command className="bg-white">
                    <CommandInput placeholder="ابحث عن منتج..." className="text-gray-900" />
                    <CommandEmpty className="text-gray-500 p-4">لا يوجد منتج</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => {
                            setSendForm({ ...sendForm, productId: product.id.toString() });
                            setOpenProduct(false);
                          }}
                          className="text-gray-900 hover:bg-gray-100"
                        >
                          <Check
                            className={`ml-2 h-4 w-4 ${
                              sendForm.productId === product.id.toString() ? "opacity-100" : "opacity-0"
                            }`}
                            style={{ color: '#EAB308' }}
                          />
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-yellow-500" />
                              <span>{product.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              متوفر: {formatNumber(product.quantity)}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">الكمية *</Label>
              <Input
                type="number"
                min="1"
                value={sendForm.quantity}
                onChange={(e) => setSendForm({ ...sendForm, quantity: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-900"
                placeholder="أدخل الكمية"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">ملاحظات</Label>
              <Input
                value={sendForm.notes}
                onChange={(e) => setSendForm({ ...sendForm, notes: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-900"
                placeholder="ملاحظات إضافية (اختياري)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg"
                data-testid="button-submit-send"
              >
                <Send className="h-4 w-4 ml-2" />
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال المخزون'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSendDialog(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
