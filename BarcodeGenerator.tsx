import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  format?: string;
  className?: string;
}

export default function BarcodeGenerator({ 
  value, 
  width = 2, 
  height = 100, 
  displayValue = true, 
  format = 'CODE128',
  className = ''
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: 20,
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 2,
          fontOptions: 'bold',
          font: 'monospace',
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, width, height, displayValue, format]);

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        
        printWindow.document.write(`
          <html>
            <head>
              <title>طباعة الباركود</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  text-align: center; 
                  font-family: Arial, sans-serif;
                }
                .barcode-container {
                  display: inline-block;
                  border: 2px dashed #ccc;
                  padding: 20px;
                  margin: 10px;
                }
                .product-info {
                  margin-top: 10px;
                  font-size: 14px;
                  color: #666;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <img src="${dataURL}" alt="Barcode" style="max-width: 100%; height: auto;">
                <div class="product-info">كود المنتج: ${value}</div>
              </div>
              <div class="no-print" style="margin-top: 20px;">
                <button onclick="window.print()">طباعة</button>
                <button onclick="window.close()">إغلاق</button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
      }
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `barcode-${value}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  if (!value) {
    return (
      <div className="flex items-center justify-center h-24 bg-gray-100 rounded border-2 border-dashed border-gray-300">
        <span className="text-gray-500">لا يوجد باركود</span>
      </div>
    );
  }

  return (
    <div className={`barcode-container ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <canvas ref={canvasRef} className="border rounded" />
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            تحميل
          </Button>
        </div>
      </div>
    </div>
  );
}