import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Sale, Client, Product } from '@shared/schema';
import SalesInvoicePrint from '@/components/SalesInvoicePrint';

interface PrintActionsDropdownProps {
  sale: Sale;
  client?: Client;
  products: Product[];
}

const PrintActionsDropdown: React.FC<PrintActionsDropdownProps> = ({
  sale,
  client,
  products
}) => {
  const salesInvoiceRef = useRef<HTMLDivElement>(null);

  const handleSalesInvoicePrint = useReactToPrint({
    contentRef: salesInvoiceRef,
    documentTitle: `فاتورة-مبيعات-${sale.id}`,
  });

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleSalesInvoicePrint}
      >
        <Printer className="h-4 w-4" />
        طباعة فاتورة تفصيلية
      </Button>

      {/* Hidden print component */}
      <div style={{ display: 'none' }}>
        <div ref={salesInvoiceRef}>
          <SalesInvoicePrint 
            sale={sale} 
            client={client} 
            products={products}
          />
        </div>
      </div>
    </>
  );
};

export default PrintActionsDropdown;