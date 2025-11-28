import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

interface BranchTransferInvoiceProps {
  transferId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface TransferData {
  id: number;
  transferNumber: string;
  fromBranchId: number;
  toBranchId: number;
  status: string;
  notes?: string;
  sentAt: string;
  totalItems: number;
  items?: Array<{
    id: number;
    productId: number;
    productName: string;
    productCode?: string;
    productBarcode?: string;
    quantity: number;
  }>;
}

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export default function BranchTransferInvoice({
  transferId,
  isOpen,
  onClose,
}: BranchTransferInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // جلب بيانات التحويل
  const { data: transfer } = useQuery<TransferData>({
    queryKey: [`/api/branch-transfers/${transferId}`],
    enabled: isOpen && !!transferId,
    queryFn: async () => {
      const response = await fetch(`/api/branch-transfers?branchId=all`);
      const transfers = await response.json();
      return transfers.find((t: any) => t.id === transferId);
    },
  });

  // جلب بيانات الفروع
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
    enabled: isOpen,
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `إرسالية_${transfer?.transferNumber}`,
  });

  if (!transfer) return null;

  const fromBranch = branches.find((b) => b.id === transfer.fromBranchId);
  const toBranch = branches.find((b) => b.id === transfer.toBranchId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">فاتورة تحويل مخزون</DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                size="sm"
                className="gap-2"
                data-testid="button-print-invoice"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                data-testid="button-close-invoice"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* منطقة الطباعة */}
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
          <div className="border-4 border-black p-6 mb-6">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold mb-2">إرسالية تحويل مخزون</h1>
              <p className="text-lg">INVENTORY TRANSFER INVOICE</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="border-2 border-black p-4">
                <h3 className="font-bold text-lg mb-3 border-b-2 border-black pb-2">
                  الفرع المرسل
                </h3>
                <p className="font-bold text-xl mb-1">{fromBranch?.name}</p>
                <p className="text-sm">الرمز: {fromBranch?.code}</p>
                {fromBranch?.address && <p className="text-sm">العنوان: {fromBranch.address}</p>}
                {fromBranch?.phone && <p className="text-sm">الهاتف: {fromBranch.phone}</p>}
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold text-lg mb-3 border-b-2 border-black pb-2">
                  الفرع المستقبل
                </h3>
                <p className="font-bold text-xl mb-1">{toBranch?.name}</p>
                <p className="text-sm">الرمز: {toBranch?.code}</p>
                {toBranch?.address && <p className="text-sm">العنوان: {toBranch.address}</p>}
                {toBranch?.phone && <p className="text-sm">الهاتف: {toBranch.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div className="border-2 border-black p-3">
                <p className="text-xs mb-1">رقم الإرسالية</p>
                <p className="font-bold text-lg">{transfer.transferNumber}</p>
              </div>
              <div className="border-2 border-black p-3">
                <p className="text-xs mb-1">التاريخ</p>
                <p className="font-bold text-lg">
                  {format(new Date(transfer.sentAt), "dd/MM/yyyy")}
                </p>
              </div>
              <div className="border-2 border-black p-3">
                <p className="text-xs mb-1">عدد المنتجات</p>
                <p className="font-bold text-lg">{transfer.totalItems || transfer.items?.length || 1}</p>
              </div>
            </div>
          </div>

          {/* جدول المنتجات */}
          <div className="border-2 border-black mb-6">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black bg-gray-100">
                  <TableHead className="text-center border-r-2 border-black text-black font-bold">#</TableHead>
                  <TableHead className="text-right border-r-2 border-black text-black font-bold">
                    اسم المنتج
                  </TableHead>
                  <TableHead className="text-center border-r-2 border-black text-black font-bold">
                    الكود / الباركود
                  </TableHead>
                  <TableHead className="text-center border-black text-black font-bold">
                    الكمية
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items && transfer.items.length > 0 ? (
                  transfer.items.map((item, index) => (
                    <TableRow key={item.id} className="border-b border-black">
                      <TableCell className="text-center border-r-2 border-black font-bold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="border-r-2 border-black font-bold">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-center border-r-2 border-black">
                        {item.productCode || item.productBarcode || "-"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-lg">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-b border-black">
                    <TableCell className="text-center border-r-2 border-black font-bold">
                      1
                    </TableCell>
                    <TableCell className="border-r-2 border-black font-bold">
                      {transfer.productName || "منتج غير محدد"}
                    </TableCell>
                    <TableCell className="text-center border-r-2 border-black">
                      -
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg">
                      {transfer.quantity || 0}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="border-t-2 border-black bg-gray-100">
                  <TableCell colSpan={3} className="text-right border-r-2 border-black font-bold text-lg">
                    إجمالي عدد المنتجات
                  </TableCell>
                  <TableCell className="text-center font-bold text-xl">
                    {transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || transfer.quantity || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* الملاحظات */}
          {transfer.notes && (
            <div className="border-2 border-black p-4 mb-6">
              <h3 className="font-bold mb-2 border-b-2 border-black pb-2">ملاحظات:</h3>
              <p className="text-sm">{transfer.notes}</p>
            </div>
          )}

          {/* التوقيعات */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="border-2 border-black p-6 text-center">
              <p className="font-bold mb-16">المرسل</p>
              <div className="border-t-2 border-black pt-2">
                <p className="text-sm">التوقيع والختم</p>
              </div>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <p className="font-bold mb-16">المستلم</p>
              <div className="border-t-2 border-black pt-2">
                <p className="text-sm">التوقيع والختم</p>
              </div>
            </div>
          </div>

          {/* تذييل */}
          <div className="text-center mt-8 text-xs border-t-2 border-black pt-4">
            <p>هذه الفاتورة تم إصدارها بواسطة نظام إدارة المخزون</p>
            <p>تاريخ الطباعة: {format(new Date(), "dd/MM/yyyy - HH:mm")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
