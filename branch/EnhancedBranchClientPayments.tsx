import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Receipt, DollarSign, Calendar, CreditCard, Search, Plus, Eye, FileText, Download, CheckCircle, Clock, AlertTriangle, Users, Banknote, Printer, Trash2, Edit, Check, ChevronsUpDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/branch/PaginationControls';

interface BranchClientPaymentsProps {
  branchId?: number;
}

interface ReceiptVoucher {
  id: number;
  voucherNumber: string;
  clientId: number;
  amount: number;
  paymentMethod: string;
  date: string;
  status: string;
  description: string;
  invoiceNumber?: string;
}

interface Client {
  id: number;
  name: string;
  code: string;
  balance: number;
  openingBalance: number;
}

interface Sale {
  id: number;
  invoiceNumber: string;
  clientId: number;
  total: number;
  date: string;
  isPaid: boolean;
}

export default function EnhancedBranchClientPayments({ branchId }: BranchClientPaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [branch, setBranch] = useState<any>(null);
  const [clientComboOpen, setClientComboOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [newReceipt, setNewReceipt] = useState({
    clientId: '',
    amount: 0,
    paymentMethod: 'cash',
    receiptDate: new Date().toISOString().split('T')[0],
    description: '',
    invoiceNumber: '',
    bankAccount: '',
    referenceNumber: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (branchId) {
      loadBranchData();
    }
  }, [branchId]);

  const loadBranchData = async () => {
    if (!branchId) return;
    try {
      const response = await fetch(`/api/branches/${branchId}`);
      if (response.ok) {
        const branchData = await response.json();
        setBranch(branchData);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات الفرع:', error);
    }
  };

  // جلب البيانات - فقط بيانات هذا الفرع
  const { data: receipts = [], isLoading: loadingReceipts } = useQuery({
    queryKey: ['/api/client-receipt-vouchers', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/client-receipt-vouchers${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['/api/clients', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/clients${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['/api/sales', branchId],
    queryFn: async () => {
      const response = await fetch(`/api/sales${branchId ? `?branchId=${branchId}` : ''}`);
      return response.json();
    },
    enabled: !!branchId,
    refetchInterval: 2000
  });

  // إنشاء سند قبض جديد
  const createReceiptMutation = useMutation({
    mutationFn: async (receiptData: any) => {
      console.log("إرسال البيانات:", receiptData);
      const response = await apiRequest('POST', '/api/client-receipt-vouchers', receiptData);
      return response;
    },
    onSuccess: (data) => {
      console.log("تم إنشاء السند بنجاح:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      setShowAddDialog(false);
      setNewReceipt({
        clientId: '',
        amount: 0,
        paymentMethod: 'cash',
        receiptDate: new Date().toISOString().split('T')[0],
        description: '',
        invoiceNumber: '',
        bankAccount: '',
        referenceNumber: ''
      });
      toast({
        title: "تم إنشاء سند القبض بنجاح",
        description: "تم خصم المبلغ من رصيد العميل تلقائياً",
      });
    },
    onError: (error) => {
      console.error("خطأ في إنشاء السند:", error);
      toast({
        title: "خطأ في إنشاء سند القبض",
        description: "حدث خطأ أثناء إنشاء سند القبض",
        variant: "destructive",
      });
    }
  });

  // تعديل سند قبض
  const updateReceiptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/client-receipt-vouchers/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      setShowEditDialog(false);
      setEditingReceipt(null);
      toast({
        title: "تم تعديل سند القبض بنجاح",
        description: "تم تحديث البيانات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في التعديل",
        description: "حدث خطأ أثناء تعديل سند القبض",
        variant: "destructive",
      });
    }
  });

  // حذف سند قبض
  const deleteReceiptMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      await apiRequest('DELETE', `/api/client-receipt-vouchers/${receiptId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-receipt-vouchers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', branchId] });
      toast({
        title: "تم حذف سند القبض",
        description: "تم استرداد المبلغ إلى رصيد العميل",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف سند القبض",
        variant: "destructive",
      });
    }
  });

  // دالة طباعة سند القبض الاحترافية
  const printReceiptVoucher = (receipt: any) => {
    const client = (clients as Client[]).find((c: Client) => c.id === receipt.clientId);
    const clientName = client?.name || receipt.clientName || 'غير محدد';
    const branchName = branch?.name || '';
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast({
        title: "خطأ في الطباعة",
        description: "تعذر فتح نافذة الطباعة",
        variant: "destructive"
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB');
    const receiptDate = receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString('en-GB') : currentDate;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>سند قبض - ${receipt.voucherNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #000;
            background: white;
          }
          
          .voucher-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            border: 2px solid #000;
          }
          
          .header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #000;
          }
          
          .branch-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2563eb;
          }
          
          .voucher-title {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          
          .voucher-number {
            font-size: 14px;
            font-weight: bold;
          }
          
          .content {
            padding: 30px;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .info-table td {
            padding: 12px;
            border: 1px solid #000;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            background: #f5f5f5;
            width: 30%;
          }
          
          .amount-section {
            text-align: center;
            padding: 15px;
            border: 2px solid #000;
            margin: 20px 0;
          }
          
          .amount-label {
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .amount-value {
            font-size: 24px;
            font-weight: bold;
          }
          
          .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
          }
          
          .signature-box {
            display: table-cell;
            text-align: center;
            padding: 30px 10px 10px 10px;
            border-top: 1px solid #000;
            width: 50%;
          }
          
          .signature-label {
            font-weight: bold;
          }
          
          .footer {
            border-top: 1px solid #000;
            padding: 10px;
            text-align: center;
            font-size: 11px;
          }
          
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="voucher-container">
          <div class="header">
            ${branchName ? `<div class="branch-name">${branchName}</div>` : ''}
            <div class="voucher-title">سند قبض</div>
            <div class="voucher-number">رقم السند: ${receipt.voucherNumber}</div>
          </div>
          
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="info-label">اسم العميل</td>
                <td>${clientName}</td>
              </tr>
              <tr>
                <td class="info-label">تاريخ السند</td>
                <td>${receiptDate}</td>
              </tr>
              <tr>
                <td class="info-label">طريقة الدفع</td>
                <td>${receipt.paymentMethod || 'نقدي'}</td>
              </tr>
              <tr>
                <td class="info-label">رقم المرجع</td>
                <td>${receipt.referenceNumber || '-'}</td>
              </tr>
              ${receipt.description ? `
              <tr>
                <td class="info-label">تفاصيل السند</td>
                <td>${receipt.description}</td>
              </tr>
              ` : ''}
            </table>
            
            <div class="amount-section">
              <div class="amount-label">المبلغ المستلم</div>
              <div class="amount-value">${Number(receipt.amount).toLocaleString('en-US')} ريال</div>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">توقيع المستلم</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">توقيع المسؤول</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            تم إنشاء هذا السند في: ${currentDate} - نظام المحاسب الأعظم
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    toast({
      title: "تم تحضير الطباعة",
      description: "تم إرسال سند القبض للطباعة بنجاح",
    });
  };

  const handleSubmit = () => {
    if (!newReceipt.clientId || newReceipt.amount <= 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار العميل وإدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    const receiptData = {
      ...newReceipt,
      clientId: parseInt(newReceipt.clientId),
      voucherNumber: `REC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      branchId: branchId
    };

    createReceiptMutation.mutate(receiptData);
  };

  // تصفية البيانات - التأكد من أن receipts هو مصفوفة
  const receiptsArray = Array.isArray(receipts) ? receipts : [];
  const clientsArray = Array.isArray(clients) ? clients : [];
  const salesArray = Array.isArray(sales) ? sales : [];

  const enrichedReceipts = receiptsArray.map((receipt: any) => {
    // استخدام اسم العميل من البيانات مباشرة (من SQL JOIN) أو البحث عنه
    const clientName = receipt.client_name || receipt.clientName;
    const client = clientsArray.find((c: Client) => c.id === receipt.clientId || c.id === receipt.client_id);
    return {
      ...receipt,
      clientId: receipt.clientId || receipt.client_id,
      clientName: clientName || client?.name || 'عميل غير محدد',
      clientCode: client?.code || ''
    };
  });

  console.log("البيانات الخام:", receipts);
  console.log("البيانات المحسّنة:", enrichedReceipts);

  const filteredReceipts = enrichedReceipts.filter((receipt: any) => {
    const voucherNumber = receipt.voucherNumber || '';
    const clientName = receipt.clientName || '';
    const invoiceNumber = receipt.invoiceNumber || '';
    
    const matchesSearch = voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // تطبيق pagination
  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData: paginatedReceipts,
    startIndex,
    endIndex
  } = usePagination({
    data: filteredReceipts,
    itemsPerPage: 10,
    resetTriggers: [searchTerm, filterStatus]
  });

  console.log("البيانات المصفاة:", filteredReceipts);

  // الفواتير غير المدفوعة للعميل المحدد
  const getUnpaidInvoicesForClient = (clientId: number) => {
    return salesArray.filter((sale: Sale) => sale.clientId === clientId && !sale.isPaid);
  };

  // إحصائيات السندات
  const stats = {
    totalReceipts: receiptsArray.length,
    confirmedReceipts: receiptsArray.filter((r: ReceiptVoucher) => r.status === 'confirmed').length,
    totalAmount: receiptsArray.reduce((sum: number, r: ReceiptVoucher) => sum + (r.amount || 0), 0),
    pendingReceipts: receiptsArray.filter((r: ReceiptVoucher) => r.status === 'pending').length
  };

  if (loadingReceipts || loadingClients || loadingSales) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-yellow-600">جاري تحميل سندات القبض...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان والإجراءات */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سندات القبض</h1>
            <p className="text-gray-600">إدارة احترافية لسندات قبض العملاء مع التكامل مع الفواتير</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Receipt className="h-5 w-5 ml-2" />
                سند قبض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900">
              <DialogHeader>
                <DialogTitle className="text-gray-900 text-lg font-bold">إنشاء سند قبض جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-gray-700 font-medium">العميل *</Label>
                  <Popover open={clientComboOpen} onOpenChange={setClientComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={clientComboOpen}
                        className="w-full justify-between bg-white border-gray-300 text-gray-900 h-12 hover:bg-gray-50"
                      >
                        {newReceipt.clientId
                          ? (clients as Client[]).find((client: Client) => client.id.toString() === newReceipt.clientId)?.name
                          : "ابحث عن العميل..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="ابحث عن العميل..." 
                          value={clientSearchTerm}
                          onValueChange={setClientSearchTerm}
                          className="h-12"
                        />
                        <CommandEmpty>لا توجد نتائج</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {(clients as Client[])
                            .filter((client: Client) => 
                              client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              client.code?.toLowerCase().includes(clientSearchTerm.toLowerCase())
                            )
                            .map((client: Client) => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  setNewReceipt({...newReceipt, clientId: client.id.toString()});
                                  setSelectedClient(client);
                                  setClientComboOpen(false);
                                  setClientSearchTerm('');
                                }}
                                className="flex items-center justify-between py-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <Check
                                    className={`h-4 w-4 ${
                                      newReceipt.clientId === client.id.toString() ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div>
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-gray-500">{client.code}</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {client.balance?.toLocaleString('en-US')} ر.س
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700 font-medium">المبلغ *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newReceipt.amount}
                    onChange={(e) => setNewReceipt({...newReceipt, amount: Number(e.target.value)})}
                    className="bg-white border-gray-300 text-gray-900 h-12 text-lg"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptDate" className="text-gray-700 font-medium">التاريخ *</Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    value={newReceipt.receiptDate}
                    onChange={(e) => setNewReceipt({...newReceipt, receiptDate: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">طريقة الدفع</Label>
                  <Select 
                    value={newReceipt.paymentMethod} 
                    onValueChange={(value) => setNewReceipt({...newReceipt, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12">
                      <SelectValue placeholder="نقدي" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                      <SelectItem value="شيك">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber" className="text-gray-700 font-medium">رقم المرجع (اختياري)</Label>
                  <Input
                    id="referenceNumber"
                    value={newReceipt.referenceNumber}
                    onChange={(e) => setNewReceipt({...newReceipt, referenceNumber: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 h-12"
                    placeholder="رقم التحويل أو الشيك"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">تفاصيل إضافية عن السند</Label>
                  <Textarea
                    id="description"
                    value={newReceipt.description}
                    onChange={(e) => setNewReceipt({...newReceipt, description: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="وصف السند"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createReceiptMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2 disabled:opacity-50"
                >
                  {createReceiptMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      حفظ السند الاحترافي
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي السندات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalReceipts}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">سندات مؤكدة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmedReceipts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-purple-600">{Number(stats.totalAmount || 0).toLocaleString('en-US')} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">سندات معلقة</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReceipts}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والتصفية */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في السندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-white border-gray-300 text-gray-900 h-11"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 h-11 bg-white border-gray-300">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* قائمة سندات القبض */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">سندات القبض ({filteredReceipts.length})</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {paginatedReceipts.map((receipt: any) => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{receipt.voucherNumber}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          receipt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {receipt.status === 'confirmed' ? 'مؤكد' : receipt.status === 'pending' ? 'معلق' : 'ملغي'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">العميل: </span>
                          <span className="text-[13px] text-[#000000] font-normal">{receipt.clientName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">التاريخ: </span>
                          <span className="text-gray-900 font-medium">
                            {(receipt.receiptDate || receipt.receipt_date || receipt.date) ? new Date(receipt.receiptDate || receipt.receipt_date || receipt.date).toLocaleDateString('en-GB') : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">المبلغ: </span>
                          <span className="text-green-600 font-bold">{Number(receipt.amount || 0).toLocaleString('en-US')} ر.س</span>
                        </div>
                        <div>
                          <span className="text-gray-600">طريقة الدفع: </span>
                          <span className="text-blue-600">{receipt.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-full border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                        onClick={() => printReceiptVoucher(receipt)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                        onClick={() => {
                          setEditingReceipt(receipt);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => deleteReceiptMutation.mutate(receipt.id)}
                        disabled={deleteReceiptMutation.isPending}
                        className="h-10 w-10 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredReceipts.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد سندات قبض</h3>
                  <p className="text-gray-500">لم يتم العثور على سندات قبض مطابقة للبحث</p>
                </div>
              )}
            </div>
            
            {/* شريط التنقل بين الصفحات */}
            {filteredReceipts.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                pageCount={pageCount}
                totalItems={filteredReceipts.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                itemName="سند قبض"
              />
            )}
          </div>
        </div>

        {/* حوار التعديل */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-lg font-bold flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                تعديل سند القبض
              </DialogTitle>
            </DialogHeader>
            {editingReceipt && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount" className="text-gray-700 font-medium">المبلغ *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingReceipt.amount}
                    onChange={(e) => setEditingReceipt({...editingReceipt, amount: Number(e.target.value)})}
                    className="bg-white border-gray-300 text-gray-900 h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-gray-700 font-medium">التاريخ *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingReceipt.receiptDate || editingReceipt.receipt_date || editingReceipt.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditingReceipt({...editingReceipt, receiptDate: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-paymentMethod" className="text-gray-700 font-medium">طريقة الدفع</Label>
                  <Select 
                    value={editingReceipt.paymentMethod} 
                    onValueChange={(value) => setEditingReceipt({...editingReceipt, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                      <SelectItem value="شيك">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-reference" className="text-gray-700 font-medium">رقم المرجع</Label>
                  <Input
                    id="edit-reference"
                    value={editingReceipt.reference || ''}
                    onChange={(e) => setEditingReceipt({...editingReceipt, reference: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-gray-700 font-medium">الوصف</Label>
                  <Textarea
                    id="edit-description"
                    value={editingReceipt.description || ''}
                    onChange={(e) => setEditingReceipt({...editingReceipt, description: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-gray-700 font-medium">الحالة</Label>
                  <Select 
                    value={editingReceipt.status} 
                    onValueChange={(value) => setEditingReceipt({...editingReceipt, status: value})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingReceipt(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  if (editingReceipt) {
                    updateReceiptMutation.mutate({
                      id: editingReceipt.id,
                      data: editingReceipt
                    });
                  }
                }}
                disabled={updateReceiptMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2 disabled:opacity-50"
              >
                {updateReceiptMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}