import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Send, TrendingUp, ArrowLeftRight, Search, Download, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

interface BranchTransfersReportProps {
  branchId?: number;
}

interface BranchTransfer {
  id: number;
  transferNumber: string;
  fromBranchId: number;
  toBranchId: number;
  status: 'sent' | 'received' | 'cancelled';
  sentAt: string;
  receivedAt?: string;
  notes?: string;
  totalItems?: number;
  items?: Array<{
    id: number;
    productId: number;
    productName: string;
    productCode?: string;
    quantity: number;
  }>;
}

interface Branch {
  id: number;
  name: string;
  code: string;
}

export default function BranchTransfersReport({ branchId }: BranchTransfersReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // جلب بيانات الفرع
  const { data: branch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId,
  });

  // جلب التحويلات
  const { data: transfers = [], isLoading } = useQuery<BranchTransfer[]>({
    queryKey: ["/api/branch-transfers", branchId],
    queryFn: async () => {
      const response = await fetch(`/api/branch-transfers?branchId=${branchId}`);
      if (!response.ok) throw new Error("Failed to fetch transfers");
      return response.json();
    },
    enabled: !!branchId,
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

  // تصنيف التحويلات
  const sentTransfers = transfers.filter(t => t.fromBranchId === branchId);
  const receivedTransfers = transfers.filter(t => t.toBranchId === branchId);

  // تصفية البيانات
  const filterTransfers = (transfersList: BranchTransfer[]) => {
    return transfersList.filter(transfer => {
      // فلتر البحث
      const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.items?.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      // فلتر التاريخ
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const transferDate = new Date(transfer.sentAt);
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          matchesDate = transferDate >= fromDate && transferDate <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDate = transferDate >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo);
          matchesDate = transferDate <= toDate;
        }
      }

      return matchesSearch && matchesDate;
    });
  };

  const filteredSentTransfers = filterTransfers(sentTransfers);
  const filteredReceivedTransfers = filterTransfers(receivedTransfers);

  // حساب الإحصائيات
  const totalSent = filteredSentTransfers.length;
  const totalReceived = filteredReceivedTransfers.length;
  const totalItemsSent = filteredSentTransfers.reduce((sum, t) => 
    sum + (t.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
  const totalItemsReceived = filteredReceivedTransfers.reduce((sum, t) => 
    sum + (t.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `تقرير_تحويلات_المخزون_${branch?.name || branchId}_${format(new Date(), 'yyyy-MM-dd')}`,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-500">تم الإرسال</Badge>;
      case 'received':
        return <Badge className="bg-green-500">تم الاستلام</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-full">
            <ArrowLeftRight className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير تحويلات المخزون</h1>
            <p className="text-gray-600">تقرير شامل لتحويلات المخزون - {branch?.name || `الفرع ${branchId}`}</p>
            {(dateFrom || dateTo) && (
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {dateFrom && dateTo 
                    ? `من ${format(new Date(dateFrom), "dd/MM/yyyy")} إلى ${format(new Date(dateTo), "dd/MM/yyyy")}`
                    : dateFrom 
                    ? `من ${format(new Date(dateFrom), "dd/MM/yyyy")}`
                    : `حتى ${format(new Date(dateTo), "dd/MM/yyyy")}`}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700" data-testid="button-print-report">
          <Download className="h-4 w-4 ml-2" />
          طباعة التقرير
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التحويلات المرسلة</p>
                <p className="text-2xl font-bold text-blue-600">{totalSent}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التحويلات الواردة</p>
                <p className="text-2xl font-bold text-green-600">{totalReceived}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المنتجات المرسلة</p>
                <p className="text-2xl font-bold text-orange-600">{totalItemsSent}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المنتجات المستلمة</p>
                <p className="text-2xl font-bold text-purple-600">{totalItemsReceived}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث برقم التحويل أو اسم المنتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                data-testid="input-search"
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="من تاريخ"
              data-testid="input-date-from"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="إلى تاريخ"
              data-testid="input-date-to"
            />
          </div>
        </CardContent>
      </Card>

      {/* الجداول */}
      <Tabs defaultValue="sent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">التحويلات المرسلة ({totalSent})</TabsTrigger>
          <TabsTrigger value="received">التحويلات الواردة ({totalReceived})</TabsTrigger>
        </TabsList>

        {/* التحويلات المرسلة */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>التحويلات المرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : filteredSentTransfers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد تحويلات مرسلة</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-right p-3 font-semibold">رقم التحويل</th>
                        <th className="text-right p-3 font-semibold">إلى الفرع</th>
                        <th className="text-right p-3 font-semibold">عدد المنتجات</th>
                        <th className="text-right p-3 font-semibold">الحالة</th>
                        <th className="text-right p-3 font-semibold">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSentTransfers.map((transfer) => (
                        <tr key={transfer.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{transfer.transferNumber}</td>
                          <td className="p-3">
                            {branches.find(b => b.id === transfer.toBranchId)?.name || `فرع ${transfer.toBranchId}`}
                          </td>
                          <td className="p-3">{transfer.totalItems || transfer.items?.length || 1}</td>
                          <td className="p-3">{getStatusBadge(transfer.status)}</td>
                          <td className="p-3">{format(new Date(transfer.sentAt), "dd/MM/yyyy")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التحويلات الواردة */}
        <TabsContent value="received">
          <Card>
            <CardHeader>
              <CardTitle>التحويلات الواردة</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : filteredReceivedTransfers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد تحويلات واردة</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-right p-3 font-semibold">رقم التحويل</th>
                        <th className="text-right p-3 font-semibold">من الفرع</th>
                        <th className="text-right p-3 font-semibold">عدد المنتجات</th>
                        <th className="text-right p-3 font-semibold">الحالة</th>
                        <th className="text-right p-3 font-semibold">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReceivedTransfers.map((transfer) => (
                        <tr key={transfer.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{transfer.transferNumber}</td>
                          <td className="p-3">
                            {branches.find(b => b.id === transfer.fromBranchId)?.name || `فرع ${transfer.fromBranchId}`}
                          </td>
                          <td className="p-3">{transfer.totalItems || transfer.items?.length || 1}</td>
                          <td className="p-3">{getStatusBadge(transfer.status)}</td>
                          <td className="p-3">{format(new Date(transfer.sentAt), "dd/MM/yyyy")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* منطقة الطباعة (مخفية) */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white text-black">
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            `}
          </style>

          {/* الرأسية */}
          <div className="text-center border-4 border-black p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{branch?.name}</h1>
            <h2 className="text-2xl font-bold mb-4">تقرير تحويلات المخزون</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-right">
                <p className="font-bold">تاريخ التقرير: {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-left">
                {(dateFrom || dateTo) && (
                  <p className="font-bold">
                    الفترة: {dateFrom && dateTo 
                      ? `${format(new Date(dateFrom), "dd/MM/yyyy")} - ${format(new Date(dateTo), "dd/MM/yyyy")}`
                      : dateFrom 
                      ? `من ${format(new Date(dateFrom), "dd/MM/yyyy")}`
                      : `حتى ${format(new Date(dateTo), "dd/MM/yyyy")}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="border-2 border-black p-4 text-center">
              <p className="text-sm mb-1">التحويلات المرسلة</p>
              <p className="text-2xl font-bold">{totalSent}</p>
            </div>
            <div className="border-2 border-black p-4 text-center">
              <p className="text-sm mb-1">التحويلات الواردة</p>
              <p className="text-2xl font-bold">{totalReceived}</p>
            </div>
            <div className="border-2 border-black p-4 text-center">
              <p className="text-sm mb-1">المنتجات المرسلة</p>
              <p className="text-2xl font-bold">{totalItemsSent}</p>
            </div>
            <div className="border-2 border-black p-4 text-center">
              <p className="text-sm mb-1">المنتجات المستلمة</p>
              <p className="text-2xl font-bold">{totalItemsReceived}</p>
            </div>
          </div>

          {/* التحويلات المرسلة */}
          {filteredSentTransfers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 border-b-2 border-black pb-2">التحويلات المرسلة</h3>
              <table className="w-full border-2 border-black">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100">
                    <th className="text-right p-2 border-r-2 border-black font-bold">#</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">رقم التحويل</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">إلى الفرع</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">عدد المنتجات</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">الحالة</th>
                    <th className="text-right p-2 font-bold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSentTransfers.map((transfer, index) => (
                    <tr key={transfer.id} className="border-b border-black">
                      <td className="p-2 border-r-2 border-black">{index + 1}</td>
                      <td className="p-2 border-r-2 border-black font-bold">{transfer.transferNumber}</td>
                      <td className="p-2 border-r-2 border-black">
                        {branches.find(b => b.id === transfer.toBranchId)?.name || `فرع ${transfer.toBranchId}`}
                      </td>
                      <td className="p-2 border-r-2 border-black text-center">
                        {transfer.totalItems || transfer.items?.length || 1}
                      </td>
                      <td className="p-2 border-r-2 border-black">
                        {transfer.status === 'sent' ? 'تم الإرسال' : transfer.status === 'received' ? 'تم الاستلام' : 'ملغي'}
                      </td>
                      <td className="p-2">{format(new Date(transfer.sentAt), "dd/MM/yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* التحويلات الواردة */}
          {filteredReceivedTransfers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 border-b-2 border-black pb-2">التحويلات الواردة</h3>
              <table className="w-full border-2 border-black">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100">
                    <th className="text-right p-2 border-r-2 border-black font-bold">#</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">رقم التحويل</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">من الفرع</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">عدد المنتجات</th>
                    <th className="text-right p-2 border-r-2 border-black font-bold">الحالة</th>
                    <th className="text-right p-2 font-bold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceivedTransfers.map((transfer, index) => (
                    <tr key={transfer.id} className="border-b border-black">
                      <td className="p-2 border-r-2 border-black">{index + 1}</td>
                      <td className="p-2 border-r-2 border-black font-bold">{transfer.transferNumber}</td>
                      <td className="p-2 border-r-2 border-black">
                        {branches.find(b => b.id === transfer.fromBranchId)?.name || `فرع ${transfer.fromBranchId}`}
                      </td>
                      <td className="p-2 border-r-2 border-black text-center">
                        {transfer.totalItems || transfer.items?.length || 1}
                      </td>
                      <td className="p-2 border-r-2 border-black">
                        {transfer.status === 'sent' ? 'تم الإرسال' : transfer.status === 'received' ? 'تم الاستلام' : 'ملغي'}
                      </td>
                      <td className="p-2">{format(new Date(transfer.sentAt), "dd/MM/yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* التذييل */}
          <div className="text-center mt-8 text-xs border-t-2 border-black pt-4">
            <p>تاريخ الطباعة: {format(new Date(), "dd/MM/yyyy - HH:mm")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
