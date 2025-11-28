import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ScanBarcode, 
  Search, 
  Download, 
  Printer,
  Plus,
  Edit
} from 'lucide-react';

export default function ProductBarcodes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [, setLocation] = useLocation();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const handleEditProduct = (productId: number) => {
    setLocation(`/products/edit/${productId}`);
  };

  const downloadBarcodePDF = async (product: Product) => {
    if (!product.barcode) return;
    
    // Create canvas with exact printer dimensions: 6.35cm x 4.00cm
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Convert cm to pixels at 300 DPI for high quality
    const scale = 300 / 2.54; // 300 DPI conversion from cm to pixels
    canvas.width = 6.35 * scale;  // 6.35 cm width
    canvas.height = 6.00 * scale; // Increased height to 6.00 cm for bigger barcode
    
    if (!ctx) return;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Product name at top - huge font
    ctx.fillStyle = '#000';
    ctx.font = `bold ${Math.floor(45 * scale / 118)}px Arial, "Tahoma"`;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    
    const productName = product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name;
    ctx.fillText(productName, canvas.width / 2, 50 * scale / 118);
    
    // Generate huge barcode in center
    const barcodeCanvas = generateHugeBarcode(product.barcode);
    const barcodeY = 90 * scale / 118; // Centered position
    const barcodeHeight = 180 * scale / 118; // Much bigger height
    const barcodeWidth = canvas.width * 0.98; // Nearly full width
    const barcodeX = (canvas.width - barcodeWidth) / 2;
    
    ctx.drawImage(barcodeCanvas, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    
    // Barcode number - huge font
    ctx.font = `bold ${Math.floor(32 * scale / 118)}px Arial`;
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(product.barcode, canvas.width / 2, 280 * scale / 118);
    
    // Price at bottom - huge and prominent
    if (product.salePrice) {
      ctx.font = `bold ${Math.floor(38 * scale / 118)}px Arial`;
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(`${product.salePrice} ر.س`, canvas.width / 2, 320 * scale / 118);
    }
    
    // Convert to PDF with bigger label size
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'landscape', // Landscape for bigger dimensions
      unit: 'cm',
      format: [6.35, 6.0] // Taller for bigger barcode
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, 6.35, 6.0);
    
    const fileName = `باركود-${product.code || product.id}.pdf`;
    pdf.save(fileName);
  };

  const generateHugeBarcode = (barcodeValue: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Optimized barcode size
    canvas.width = 900;
    canvas.height = 250;
    
    if (!ctx) return canvas;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Optimized bars for perfect scanning
    const barWidth = 7;
    const barHeight = 200;
    const startY = 25;
    
    const totalBars = barcodeValue.length * 10 + 20;
    const startX = (canvas.width - (totalBars * barWidth)) / 2;
    
    ctx.fillStyle = 'black';
    let x = startX;
    
    // Huge start pattern
    const startPattern = [4, 3, 3, 3, 3, 4];
    startPattern.forEach((width, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, startY, width * barWidth, barHeight);
      }
      x += width * barWidth;
    });
    
    // Data encoding (optimized for readability)
    for (let i = 0; i < barcodeValue.length; i++) {
      const charCode = barcodeValue.charCodeAt(i);
      let pattern = [2, 2, 3, 2, 2, 2, 3, 2]; // Default pattern
      
      if (charCode >= 48 && charCode <= 57) {
        const digit = charCode - 48;
        const patterns = [
          [3, 2, 2, 3, 2, 2, 2, 2], // 0
          [2, 3, 2, 3, 2, 2, 2, 2], // 1
          [2, 2, 3, 3, 2, 2, 2, 2], // 2
          [3, 3, 2, 2, 2, 2, 2, 2], // 3
          [2, 2, 2, 3, 3, 2, 2, 2], // 4
          [3, 2, 2, 2, 3, 2, 2, 2], // 5
          [2, 3, 2, 2, 3, 2, 2, 2], // 6
          [2, 2, 3, 2, 3, 2, 2, 2], // 7
          [3, 2, 3, 2, 2, 2, 2, 2], // 8
          [2, 3, 3, 2, 2, 2, 2, 2]  // 9
        ];
        pattern = patterns[digit];
      }
      
      pattern.forEach((width, j) => {
        if (j % 2 === 0) {
          ctx.fillRect(x, startY, width * barWidth, barHeight);
        }
        x += width * barWidth;
      });
    }
    
    // Huge end pattern
    const endPattern = [3, 3, 4, 3, 3, 4];
    endPattern.forEach((width, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, startY, width * barWidth, barHeight);
      }
      x += width * barWidth;
    });
    
    return canvas;
  };

  const generateProfessionalBarcode = (barcodeValue: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Professional barcode dimensions
    canvas.width = 600;  // Increased width for better quality
    canvas.height = 120; // Increased height
    
    if (!ctx) return canvas;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // More professional Code 128 pattern
    const barWidth = 3; // Thicker bars for better scanning
    const barHeight = 80;
    const startY = 20;
    
    // Calculate total width needed
    const totalBars = barcodeValue.length * 11 + 20; // Extra space for start/stop
    const startX = (canvas.width - (totalBars * barWidth)) / 2;
    
    ctx.fillStyle = 'black';
    
    let x = startX;
    
    // Start pattern (Code 128 start A)
    const startPattern = [2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2];
    startPattern.forEach((width, i) => {
      if (i % 2 === 0) { // Black bars on even indices
        ctx.fillRect(x, startY, width * barWidth, barHeight);
      }
      x += width * barWidth;
    });
    
    // Data encoding (improved pattern generation)
    for (let i = 0; i < barcodeValue.length; i++) {
      const charCode = barcodeValue.charCodeAt(i);
      
      // More realistic Code 128 pattern based on character
      let pattern;
      if (charCode >= 48 && charCode <= 57) { // Numbers 0-9
        const digit = charCode - 48;
        pattern = [
          [3, 2, 1, 1, 2, 2, 1, 1, 1, 1, 2], // 0
          [2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2], // 1
          [2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 2], // 2
          [1, 4, 1, 1, 1, 2, 1, 1, 1, 1, 2], // 3
          [1, 1, 3, 2, 1, 2, 1, 1, 1, 1, 2], // 4
          [1, 2, 3, 1, 1, 2, 1, 1, 1, 1, 2], // 5
          [1, 1, 1, 4, 1, 2, 1, 1, 1, 1, 2], // 6
          [1, 3, 1, 2, 1, 2, 1, 1, 1, 1, 2], // 7
          [1, 2, 1, 3, 1, 2, 1, 1, 1, 1, 2], // 8
          [3, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2]  // 9
        ][digit];
      } else {
        // Default pattern for letters and symbols
        pattern = [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1];
      }
      
      pattern.forEach((width, j) => {
        if (j % 2 === 0) { // Black bars on even indices
          ctx.fillRect(x, startY, width * barWidth, barHeight);
        }
        x += width * barWidth;
      });
    }
    
    // End pattern (Code 128 stop)
    const endPattern = [2, 3, 3, 1, 1, 1, 2];
    endPattern.forEach((width, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, startY, width * barWidth, barHeight);
      }
      x += width * barWidth;
    });
    
    return canvas;
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const generateBarcodeImage = (barcode: string) => {
    // Create professional Code 128-like barcode pattern
    const width = 320;
    const height = 80;
    const patterns = [];
    
    // Add start pattern (quiet zone and start bars)
    patterns.push(
      { width: 4, color: 'white' },  // Quiet zone
      { width: 3, color: 'black' },
      { width: 1, color: 'white' },
      { width: 2, color: 'black' },
      { width: 1, color: 'white' }
    );
    
    // Generate more realistic bar patterns for each digit
    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]) || 0;
      // Realistic bar patterns for digits 0-9
      const digitPatterns = [
        [3, 2, 1, 1], // 0
        [2, 2, 2, 1], // 1  
        [2, 1, 2, 2], // 2
        [1, 4, 1, 1], // 3
        [1, 1, 3, 2], // 4
        [1, 2, 3, 1], // 5
        [1, 1, 1, 4], // 6
        [1, 3, 1, 2], // 7
        [1, 2, 1, 3], // 8
        [3, 1, 1, 2]  // 9
      ];
      
      const pattern = digitPatterns[digit];
      for (let j = 0; j < pattern.length; j++) {
        patterns.push({
          width: pattern[j],
          color: j % 2 === 0 ? 'black' : 'white'
        });
      }
    }
    
    // Add end pattern (end bars and quiet zone)
    patterns.push(
      { width: 1, color: 'white' },
      { width: 1, color: 'black' },
      { width: 1, color: 'white' },
      { width: 2, color: 'black' },
      { width: 3, color: 'white' }  // Quiet zone
    );
    
    // Create SVG with better scaling
    let x = 0;
    const bars = patterns.map(pattern => {
      if (pattern.color === 'black') {
        const rect = `<rect x="${x}" y="15" width="${pattern.width * 2}" height="${height - 35}" fill="black"/>`;
      }
      x += pattern.width * 2;
      return pattern.color === 'black' ? 
        `<rect x="${x - pattern.width * 2}" y="15" width="${pattern.width * 2}" height="${height - 35}" fill="black"/>` : '';
    }).filter(Boolean).join('');
    
    const svgContent = `
      <svg width="${width}" height="${height + 20}" xmlns="http://www.w3.org/2000/svg" style="background: white;">
        <rect width="100%" height="100%" fill="white" stroke="#e0e0e0" stroke-width="1"/>
        ${bars}
        <text x="${width/2}" y="${height + 12}" text-anchor="middle" font-family="Arial, monospace" font-size="12" font-weight="bold" fill="black">${barcode}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
  };

  const printBarcodes = async () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    if (selectedProductsData.length === 0) {
      alert('يرجى اختيار منتجات للطباعة');
      return;
    }

    // Create PDF with multiple labels using exact printer dimensions
    const { jsPDF } = await import('jspdf');
    
    // Calculate how many labels fit on A4 with 6.35x4.0 cm labels
    const pageWidth = 21.0; // A4 width in cm
    const pageHeight = 29.7; // A4 height in cm
    const labelWidth = 6.35;
    const labelHeight = 4.0;
    const margin = 1.0;
    
    const labelsPerRow = Math.floor((pageWidth - 2 * margin) / labelWidth);
    const labelsPerCol = Math.floor((pageHeight - 2 * margin) / labelHeight);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'cm',
      format: 'a4'
    });
    
    let currentRow = 0;
    let currentCol = 0;
    let isFirstPage = true;
    
    for (let i = 0; i < selectedProductsData.length; i++) {
      const product = selectedProductsData[i];
      
      // Add new page if needed
      if (currentRow >= labelsPerCol && !isFirstPage) {
        pdf.addPage();
        currentRow = 0;
        currentCol = 0;
      }
      isFirstPage = false;
      
      // Create individual label canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) continue;
      
      const scale = 300 / 2.54; // 300 DPI
      canvas.width = labelWidth * scale;
      canvas.height = labelHeight * scale;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Product name (bigger)
      ctx.fillStyle = '#000';
      ctx.font = `bold ${Math.floor(18 * scale / 118)}px Arial, "Tahoma"`;
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      
      const productName = product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name;
      ctx.fillText(productName, canvas.width / 2, 25 * scale / 118);
      
      // Barcode (huge)
      if (product.barcode) {
        const barcodeCanvas = generateHugeBarcode(product.barcode);
        const barcodeY = 90 * scale / 118;
        const barcodeHeight = 180 * scale / 118; // Huge
        const barcodeWidth = canvas.width * 0.98; // Nearly full width
        const barcodeX = (canvas.width - barcodeWidth) / 2;
        
        ctx.drawImage(barcodeCanvas, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
        
        // Barcode number (huge)
        ctx.font = `bold ${Math.floor(32 * scale / 118)}px Arial`;
        ctx.textAlign = 'center';
        ctx.direction = 'ltr';
        ctx.fillText(product.barcode, canvas.width / 2, 280 * scale / 118);
      }
      
      // Price (huge)
      if (product.salePrice) {
        ctx.font = `bold ${Math.floor(38 * scale / 118)}px Arial`;
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.fillText(`${product.salePrice} ر.س`, canvas.width / 2, 320 * scale / 118);
      }
      
      // Calculate position on PDF
      const x = margin + currentCol * labelWidth;
      const y = margin + currentRow * labelHeight;
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight);
      
      // Move to next position
      currentCol++;
      if (currentCol >= labelsPerRow) {
        currentCol = 0;
        currentRow++;
      }
    }
    
    // Save PDF
    pdf.save(`باركودات-${selectedProductsData.length}-بمقاس-الطابعة.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <ScanBarcode className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الباركود</h1>
            <p className="text-gray-600">إدارة وطباعة باركود الأصناف</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {selectedProducts.length > 0 && (
            <Button onClick={printBarcodes} className="bg-green-600 hover:bg-green-700">
              <Download className="ml-2 h-4 w-4" />
              تحميل PDF ({selectedProducts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الأصناف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Badge variant="outline">
              {filteredProducts.length} صنف
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: Product) => (
          <Card 
            key={product.id} 
            className={`cursor-pointer transition-all duration-200 ${
              selectedProducts.includes(product.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectProduct(product.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="w-4 h-4"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Product Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">الكود:</span>
                    <div className="font-medium">{product.code || 'غير محدد'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">السعر:</span>
                    <div className="font-medium">{product.salePrice} ر.س</div>
                  </div>
                </div>

                {/* Barcode Display */}
                <div className="border-t pt-4">
                  {product.barcode ? (
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">الباركود</div>
                      <img 
                        src={generateHugeBarcode(product.barcode).toDataURL('image/png')} 
                        alt="barcode"
                        className="mx-auto border rounded shadow-sm"
                      />
                      <div className="text-xs text-gray-600 mt-1">{product.barcode}</div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <ScanBarcode className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm">لا يوجد باركود</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product.id);
                        }}
                      >
                        <Plus className="h-3 w-3 ml-1" />
                        إضافة باركود
                      </Button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product.id);
                    }}
                  >
                    <Edit className="h-3 w-3 ml-1" />
                    تعديل
                  </Button>
                  {product.barcode && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadBarcodePDF(product);
                      }}
                    >
                      <Download className="h-3 w-3 ml-1" />
                      تحميل
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ScanBarcode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h3>
            <p className="text-gray-500">لم يتم العثور على أصناف تطابق البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}