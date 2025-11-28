import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Printer, Search, Trash2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BranchReceiptVoucher } from '@shared/schema';

interface BranchReceiptVouchersProps {
  branchId: number;
}

export default function BranchReceiptVouchers({ branchId }: BranchReceiptVouchersProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<BranchReceiptVoucher | null>(null);

  const [formData, setFormData] = useState({
    receiptNumber: '',
    payerName: '',
    receiverName: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'check' | 'transfer',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { data: rawVouchers = [], isLoading: vouchersLoading } = useQuery<any[]>({
    queryKey: [`/api/client-receipt-vouchers?branchId=${branchId}`],
  });

  const { data: allClients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const isLoading = vouchersLoading || clientsLoading;

  // Transform vouchers to match BranchReceiptVoucher interface
  const vouchers = rawVouchers.map(v => {
    // Prioritize client_name from API (with JOIN), then payer field, then client lookup
    const clientName = v.client_name || v.payer || '';
    const clientId = v.client_id || v.clientId;
    const client = allClients.find(c => c.id === clientId);
    const finalClientName = clientName || client?.name || 'غير محدد';
    
    return {
      id: v.id,
      receiptNumber: v.voucher_number || v.voucherNumber || v.receiptNumber || '',
      payerName: finalClientName,
      receiverName: v.receiver || v.receiverName || '',
      amount: v.amount || '0',
      paymentMethod: (v.payment_method || v.paymentMethod || 'cash').includes('نقدي') ? 'cash' : 'transfer',
      description: v.description || '',
      notes: v.notes || '',
      date: v.receipt_date || v.receiptDate || new Date().toISOString().split('T')[0]
    } as BranchReceiptVoucher;
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest(`/api/branches/${branchId}/receipt-vouchers`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/client-receipt-vouchers?branchId=${branchId}`] });
      toast({ title: 'تم إنشاء سند القبض بنجاح' });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'فشل في إنشاء سند القبض', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/branches/${branchId}/receipt-vouchers/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/client-receipt-vouchers?branchId=${branchId}`] });
      toast({ title: 'تم حذف سند القبض بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل في حذف سند القبض', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      receiptNumber: `RV-${Date.now()}`,
      payerName: '',
      receiverName: '',
      amount: '',
      paymentMethod: 'cash',
      description: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = () => {
    if (!formData.payerName || !formData.receiverName || !formData.amount || !formData.description) {
      toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const handlePrint = (voucher: BranchReceiptVoucher) => {
    setSelectedVoucher(voucher);
    setIsPrintDialogOpen(true);
  };

  const printVoucher = () => {
    window.print();
  };

  const filteredVouchers = vouchers.filter((v: BranchReceiptVoucher) => {
    const payerName = v.payerName || '';
    const receiverName = v.receiverName || '';
    const receiptNum = v.receiptNumber || '';
    return payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           receiptNum.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedVouchers,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredVouchers,
    itemsPerPage: 10,
    resetTriggers: [searchQuery]
  });

  const totalAmount = vouchers.reduce((sum, v) => sum + parseFloat(v.amount?.toString() || '0'), 0);

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      {/* Header - بسيط ونظيف */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سندات القبض</h1>
            <p className="text-sm text-gray-500 mt-1">إدارة سندات القبض</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setFormData(prev => ({ ...prev, receiptNumber: `RV-${Date.now()}` }));
              setIsCreateDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-create-voucher"
          >
            <Plus className="h-4 w-4 ml-2" />
            سند جديد
          </Button>
        </div>

        {/* إحصائيات بسيطة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">العدد الإجمالي</div>
              <div className="text-2xl font-bold text-gray-900">{vouchers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">المبلغ الإجمالي</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalAmount.toLocaleString()} ر.س
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">هذا الشهر</div>
              <div className="text-2xl font-bold text-gray-900">
                {vouchers.filter(v => {
                  const vDate = new Date(v.date);
                  const now = new Date();
                  return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* بحث بسيط */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="بحث بالاسم أو رقم السند..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* جدول بسيط وعملي */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">جاري التحميل...</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-lg font-medium">لا توجد سندات قبض</p>
            <p className="text-sm mt-1">قم بإنشاء سند جديد للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-bold">رقم السند</TableHead>
                    <TableHead className="text-right font-bold">التاريخ</TableHead>
                    <TableHead className="text-right font-bold">الدافع</TableHead>
                    <TableHead className="text-right font-bold">المستلم</TableHead>
                    <TableHead className="text-right font-bold">المبلغ</TableHead>
                    <TableHead className="text-right font-bold">طريقة الدفع</TableHead>
                    <TableHead className="text-right font-bold">البيان</TableHead>
                    <TableHead className="text-center font-bold">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVouchers.map((voucher: BranchReceiptVoucher) => {
                    const payerName = voucher.payerName || 'غير محدد';
                    const receiverName = voucher.receiverName || 'غير محدد';
                    return (
                    <TableRow key={voucher.id} className="hover:bg-gray-50" data-testid={`row-voucher-${voucher.id}`}>
                      <TableCell className="font-medium">{voucher.receiptNumber}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(voucher.date).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-sm">{payerName}</TableCell>
                      <TableCell className="text-sm">{receiverName}</TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {parseFloat(voucher.amount?.toString() || '0').toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          voucher.paymentMethod === 'cash' 
                            ? 'bg-green-100 text-green-800' 
                            : voucher.paymentMethod === 'check' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {voucher.paymentMethod === 'cash' ? 'نقدي' : voucher.paymentMethod === 'check' ? 'شيك' : 'تحويل'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {voucher.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(voucher)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            data-testid={`button-print-${voucher.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(voucher.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-${voucher.id}`}
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
            </div>
            
            {/* شريط التنقل بين الصفحات */}
            {filteredVouchers.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                pageCount={pageCount}
                totalItems={filteredVouchers.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                itemName="سند قبض"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* نموذج إنشاء سند - بسيط */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>سند قبض جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>رقم السند *</Label>
              <Input
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                data-testid="input-receipt-number"
              />
            </div>
            <div>
              <Label>التاريخ *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <div>
              <Label>اسم الدافع *</Label>
              <Input
                value={formData.payerName}
                onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                placeholder="الشخص الدافع"
                data-testid="input-payer-name"
              />
            </div>
            <div>
              <Label>اسم المستلم *</Label>
              <Input
                value={formData.receiverName}
                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                placeholder="الشخص المستلم"
                data-testid="input-receiver-name"
              />
            </div>
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                data-testid="input-amount"
              />
            </div>
            <div>
              <Label>طريقة الدفع *</Label>
              <Select value={formData.paymentMethod} onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                  <SelectItem value="transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>البيان *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="سبب القبض..."
                rows={2}
                data-testid="input-description"
              />
            </div>
            <div className="col-span-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية..."
                rows={2}
                data-testid="input-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ السند'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نموذج الطباعة */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-3xl print:max-w-full" dir="rtl">
          <div className="print:p-8">
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
              <h1 className="text-3xl font-bold text-gray-900">سند قبض</h1>
              <p className="text-gray-600 text-sm mt-1">RECEIPT VOUCHER</p>
            </div>
            
            {selectedVoucher && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-500 text-sm">رقم السند</div>
                    <div className="font-bold text-lg">{selectedVoucher.receiptNumber}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-gray-500 text-sm">التاريخ</div>
                    <div className="font-bold text-lg">{new Date(selectedVoucher.date).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-600 text-sm">استلمنا من السيد/ة</div>
                      <div className="font-bold text-lg">{selectedVoucher.payerName}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">استلمه السيد/ة</div>
                      <div className="font-bold text-lg">{selectedVoucher.receiverName}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded text-center border-2 border-gray-300">
                  <div className="text-gray-700 text-sm mb-1">المبلغ</div>
                  <div className="text-4xl font-bold text-gray-900">
                    {parseFloat(selectedVoucher.amount?.toString() || '0').toLocaleString()} ر.س
                  </div>
                </div>

                <div>
                  <div className="text-gray-600 text-sm mb-2">البيان</div>
                  <div className="border p-3 rounded bg-gray-50">
                    <p className="text-gray-900">{selectedVoucher.description}</p>
                  </div>
                </div>

                {selectedVoucher.notes && (
                  <div>
                    <div className="text-gray-600 text-sm mb-2">ملاحظات</div>
                    <div className="border p-3 rounded bg-gray-50">
                      <p className="text-gray-700 text-sm">{selectedVoucher.notes}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2 mt-12">
                      <p className="text-gray-700 text-sm">المستلم</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2 mt-12">
                      <p className="text-gray-700 text-sm">المحاسب</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2 mt-12">
                      <p className="text-gray-700 text-sm">المدير</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={printVoucher} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
