import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, Package, Trash2, CheckCircle2, XCircle, Clock, Plus, Check, ChevronsUpDown, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BranchTransferInvoice from "./BranchTransferInvoice";

interface BranchTransfer {
  id: number;
  transferNumber: string;
  fromBranchId: number;
  toBranchId: number;
  productId?: number;
  productName?: string;
  productCode?: string;
  productBarcode?: string;
  quantity?: number;
  status: 'sent' | 'received' | 'cancelled';
  notes?: string;
  sentBy?: number;
  receivedBy?: number;
  receivedProductId?: number;
  sentAt: string;
  receivedAt?: string;
  createdAt: string;
  totalItems?: number;
  items?: Array<{
    id: number;
    productId: number;
    productName: string;
    productCode?: string;
    productBarcode?: string;
    quantity: number;
  }>;
}

interface Product {
  id: number;
  name: string;
  code?: string;
  barcode?: string;
  quantity: number;
  branchId?: number;
}

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface TransferItem {
  productId: number;
  productName: string;
  productCode?: string;
  productBarcode?: string;
  quantity: number;
  availableQuantity: number;
}

export default function NewBranchTransfers({ branchId }: { branchId: number }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedToBranchId, setSelectedToBranchId] = useState<string>("");
  const [transferDate, setTransferDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<TransferItem[]>([]);
  
  // للبحث عن المنتجات
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [itemQuantity, setItemQuantity] = useState("");

  // للطباعة
  const [printTransferId, setPrintTransferId] = useState<number | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  // للبحث
  const [sentSearchQuery, setSentSearchQuery] = useState("");
  const [receivedSearchQuery, setReceivedSearchQuery] = useState("");

  const handlePrintTransfer = (transferId: number) => {
    setPrintTransferId(transferId);
    setIsPrintDialogOpen(true);
  };

  // جلب التحويلات
  const { data: transfers = [], isLoading: loadingTransfers } = useQuery<BranchTransfer[]>({
    queryKey: ["/api/branch-transfers", branchId],
    queryFn: async () => {
      const response = await fetch(`/api/branch-transfers?branchId=${branchId}`);
      if (!response.ok) throw new Error("Failed to fetch transfers");
      return response.json();
    },
  });

  // جلب المنتجات
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", branchId],
    queryFn: async () => {
      const response = await fetch(`/api/products?branchId=${branchId}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // جلب الفروع
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
    queryFn: async () => {
      const response = await fetch("/api/branches");
      if (!response.ok) throw new Error("Failed to fetch branches");
      return response.json();
    },
  });

  // إرسال تحويل
  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/branch-transfers/send-multiple", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers", branchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", branchId] });
      toast({
        title: "✅ تم الإرسال بنجاح",
        description: "تم إرسال المنتجات إلى الفرع المستهدف",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال التحويل",
        variant: "destructive",
      });
    },
  });

  // استلام تحويل
  const receiveMutation = useMutation({
    mutationFn: async ({ id, receivedBy }: { id: number; receivedBy?: number }) => {
      return apiRequest("POST", `/api/branch-transfers/${id}/receive`, { receivedBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers", branchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", branchId] });
      toast({
        title: "✅ تم الاستلام بنجاح",
        description: "تم استلام المنتج وإضافته للمخزون",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في الاستلام",
        description: error.message || "حدث خطأ أثناء استلام التحويل",
        variant: "destructive",
      });
    },
  });

  // حذف تحويل
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/branch-transfers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers", branchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", branchId] });
      toast({
        title: "✅ تم الحذف بنجاح",
        description: "تم حذف التحويل وإرجاع الكمية للمخزون",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف التحويل",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedToBranchId("");
    setTransferDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setItems([]);
    setSelectedProductId(null);
    setItemQuantity("");
  };

  const handleAddItem = () => {
    if (!selectedProductId || !itemQuantity) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى اختيار المنتج وإدخال الكمية",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(itemQuantity);
    if (qty <= 0) {
      toast({
        title: "⚠️ تنبيه",
        description: "الكمية يجب أن تكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    // التحقق من عدم تكرار المنتج
    if (items.some(item => item.productId === selectedProductId)) {
      toast({
        title: "⚠️ تنبيه",
        description: "هذا المنتج موجود بالفعل في القائمة",
        variant: "destructive",
      });
      return;
    }

    if (product.quantity < qty) {
      toast({
        title: "❌ خطأ",
        description: `الكمية المتاحة: ${product.quantity} فقط`,
        variant: "destructive",
      });
      return;
    }

    setItems([...items, {
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productBarcode: product.barcode,
      quantity: qty,
      availableQuantity: product.quantity,
    }]);

    setSelectedProductId(null);
    setItemQuantity("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!selectedToBranchId || items.length === 0) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى اختيار الفرع المستهدف وإضافة منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    sendMutation.mutate({
      fromBranchId: branchId,
      toBranchId: parseInt(selectedToBranchId),
      transferDate,
      notes: notes || undefined,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      sentBy: 1,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" /> تم الإرسال</Badge>;
      case 'received':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> تم الاستلام</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sentTransfers = transfers.filter(t => t.fromBranchId === branchId);
  const receivedTransfers = transfers.filter(t => t.toBranchId === branchId);

  // فلترة التحويلات المرسلة حسب البحث
  const filteredSentTransfers = sentTransfers.filter(transfer => {
    if (!sentSearchQuery) return true;
    const query = sentSearchQuery.toLowerCase();
    const toBranchName = branches.find(b => b.id === transfer.toBranchId)?.name || "";
    const productNames = transfer.items?.map(i => i.productName).join(" ") || transfer.productName || "";
    
    return (
      transfer.transferNumber.toLowerCase().includes(query) ||
      toBranchName.toLowerCase().includes(query) ||
      productNames.toLowerCase().includes(query)
    );
  });

  // فلترة التحويلات الواردة حسب البحث
  const filteredReceivedTransfers = receivedTransfers.filter(transfer => {
    if (!receivedSearchQuery) return true;
    const query = receivedSearchQuery.toLowerCase();
    const fromBranchName = branches.find(b => b.id === transfer.fromBranchId)?.name || "";
    const productNames = transfer.items?.map(i => i.productName).join(" ") || transfer.productName || "";
    
    return (
      transfer.transferNumber.toLowerCase().includes(query) ||
      fromBranchName.toLowerCase().includes(query) ||
      productNames.toLowerCase().includes(query)
    );
  });

  const availableProducts = products.filter(p => p.quantity > 0);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">نظام تحويل المخزون الجديد</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-transfer">
              <Send className="w-4 h-4 ml-2" />
              إرسال منتج لفرع آخر
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إرسال منتج لفرع آخر</DialogTitle>
              <DialogDescription>
                اختر المنتج والفرع المستهدف والكمية المطلوبة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transferDate">التاريخ *</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    data-testid="input-transfer-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toBranch">الفرع المستهدف *</Label>
                  <Select value={selectedToBranchId} onValueChange={setSelectedToBranchId}>
                    <SelectTrigger data-testid="select-branch">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.filter(b => b.id !== branchId).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <h3 className="font-semibold text-sm">إضافة منتج</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>المنتج *</Label>
                    <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productSearchOpen}
                          className="w-full justify-between"
                          data-testid="button-search-product"
                        >
                          {selectedProduct
                            ? `${selectedProduct.name} (${selectedProduct.code || selectedProduct.barcode || 'بدون كود'})`
                            : "ابحث عن المنتج..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command dir="rtl">
                          <CommandInput placeholder="ابحث عن المنتج..." />
                          <CommandList>
                            <CommandEmpty>لا توجد منتجات</CommandEmpty>
                            <CommandGroup>
                              {availableProducts.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={`${product.name} ${product.code || ''} ${product.barcode || ''}`}
                                  onSelect={() => {
                                    setSelectedProductId(product.id);
                                    setProductSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div>{product.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {product.code || product.barcode || 'بدون كود'} - الكمية المتاحة: {product.quantity}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemQuantity">الكمية *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="itemQuantity"
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="الكمية"
                        data-testid="input-item-quantity"
                      />
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        size="icon"
                        data-testid="button-add-item"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">الكود</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">المتاح</TableHead>
                        <TableHead className="text-right w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.productCode || item.productBarcode || '-'}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.availableQuantity}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              data-testid={`button-remove-item-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل ملاحظات إضافية"
                  data-testid="input-notes"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending || items.length === 0}
                className="w-full"
                data-testid="button-confirm-send"
              >
                {sendMutation.isPending ? "جاري الإرسال..." : `إرسال الآن (${items.length} منتج)`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التحويلات المرسلة */}
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-950">
            <div className="space-y-3">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                التحويلات المرسلة ({filteredSentTransfers.length})
              </CardTitle>
              <Input
                placeholder="بحث في رقم التحويل، المنتج، أو الفرع المستهدف..."
                value={sentSearchQuery}
                onChange={(e) => setSentSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800"
                data-testid="input-search-sent"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTransfers ? (
              <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
            ) : filteredSentTransfers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {sentSearchQuery ? "لا توجد نتائج للبحث" : "لا توجد تحويلات مرسلة"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم التحويل</TableHead>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">إلى</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSentTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                      <TableCell>
                        <div>{transfer.productName}</div>
                        {transfer.productCode && (
                          <div className="text-xs text-muted-foreground">كود: {transfer.productCode}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {branches.find(b => b.id === transfer.toBranchId)?.name || `فرع ${transfer.toBranchId}`}
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transfer.sentAt), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        {transfer.status === 'sent' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(transfer.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${transfer.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* التحويلات الواردة */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950">
            <div className="space-y-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                التحويلات الواردة ({filteredReceivedTransfers.length})
              </CardTitle>
              <Input
                placeholder="بحث في رقم التحويل، المنتج، أو الفرع المرسل..."
                value={receivedSearchQuery}
                onChange={(e) => setReceivedSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800"
                data-testid="input-search-received"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTransfers ? (
              <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
            ) : filteredReceivedTransfers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {receivedSearchQuery ? "لا توجد نتائج للبحث" : "لا توجد تحويلات واردة"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم التحويل</TableHead>
                    <TableHead className="text-right">المنتجات</TableHead>
                    <TableHead className="text-right">من</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivedTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                      <TableCell>
                        {transfer.items && transfer.items.length > 0 ? (
                          <div>
                            <div className="font-medium">{transfer.totalItems || transfer.items.length} منتج</div>
                            <div className="text-xs text-muted-foreground">
                              {transfer.items.slice(0, 2).map(item => item.productName).join(", ")}
                              {transfer.items.length > 2 && "..."}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div>{transfer.productName || "منتج واحد"}</div>
                            {transfer.productCode && (
                              <div className="text-xs text-muted-foreground">كود: {transfer.productCode}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {branches.find(b => b.id === transfer.fromBranchId)?.name || `فرع ${transfer.fromBranchId}`}
                      </TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transfer.sentAt), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintTransfer(transfer.id)}
                            data-testid={`button-print-${transfer.id}`}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          {transfer.status === 'sent' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => receiveMutation.mutate({ id: transfer.id, receivedBy: 1 })}
                              disabled={receiveMutation.isPending}
                              data-testid={`button-receive-${transfer.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-1" />
                              استلام
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* نافذة الطباعة */}
      {printTransferId && (
        <BranchTransferInvoice
          transferId={printTransferId}
          isOpen={isPrintDialogOpen}
          onClose={() => {
            setIsPrintDialogOpen(false);
            setPrintTransferId(null);
          }}
        />
      )}
    </div>
  );
}
