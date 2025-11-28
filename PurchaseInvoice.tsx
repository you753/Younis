import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import UnifiedPrintTemplate from '@/components/shared/UnifiedPrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PurchaseInvoiceProps {
  purchase: any;
  supplier: any;
  onClose: () => void;
}

export default function PurchaseInvoice({ purchase, supplier, onClose }: PurchaseInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // جلب مرتجعات المشتريات لحساب الكميات المتبقية
  const { data: purchaseReturns = [] } = useQuery({
    queryKey: ['/api/purchase-returns'],
  });

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `فاتورة مشتريات ${purchase.id}`,
  });

  const getPurchaseItems = (purchase: any) => {
    if (!purchase.items) return [];
    
    try {
      const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  };

  const items = getPurchaseItems(purchase);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>فاتورة مشتريات رقم {purchase.id}</span>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 ml-2" />
                إغلاق
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef}>
          <UnifiedPrintTemplate
            title="فاتورة مشتريات"
            invoiceNumber={purchase.id?.toString() || ''}
            date={purchase.date || new Date()}
            client={supplier}
            items={items}
            total={purchase.total || '0'}
            notes={purchase.notes}
            branchId={purchase.branchId}
            purchaseReturns={purchaseReturns}
            showVAT={false}
            extraInfo={{
              subtitle: "فاتورة مشتريات",
              type: "purchase"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}