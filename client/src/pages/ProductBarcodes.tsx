import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

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
    // Create a Code 128-like barcode pattern
    const width = 250;
    const height = 60;
    const patterns = [];
    
    // Generate alternating black/white bars based on barcode digits
    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]) || 0;
      // Each digit creates 3-4 bars of varying widths
      const barPattern = [
        { width: digit % 3 + 1, color: 'black' },
        { width: digit % 2 + 1, color: 'white' },
        { width: (digit + 1) % 3 + 1, color: 'black' },
        { width: digit % 2 + 1, color: 'white' }
      ];
      patterns.push(...barPattern);
    }
    
    let xPos = 10;
    const bars = patterns.map(bar => {
      const rect = `<rect x="${xPos}" y="10" width="${bar.width * 2}" height="${height - 20}" fill="${bar.color}"/>`;
      xPos += bar.width * 2;
      return rect;
    }).join('');
    
    const svgContent = `
      <svg width="${width}" height="${height + 30}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height + 30}" fill="white" stroke="#ddd" stroke-width="1"/>
        ${bars}
        <text x="${width/2}" y="${height + 20}" text-anchor="middle" font-family="monospace" font-size="14" fill="black">${barcode}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const printBarcodes = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة الباركود</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .barcode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
              .barcode-item { 
                border: 1px solid #ddd; 
                padding: 15px; 
                text-align: center; 
                page-break-inside: avoid;
              }
              .product-name { font-weight: bold; margin-bottom: 10px; }
              .barcode-image { margin: 10px 0; }
              @media print { 
                .no-print { display: none; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="barcode-grid">
              ${selectedProductsData.map(product => `
                <div class="barcode-item">
                  <div class="product-name">${product.name}</div>
                  ${product.barcode ? `
                    <div class="barcode-image">
                      <img src="${generateBarcodeImage(product.barcode)}" alt="barcode" />
                    </div>
                  ` : '<div>لا يوجد باركود</div>'}
                  <div>الكود: ${product.code || 'غير محدد'}</div>
                  <div>السعر: ${product.salePrice} ر.س</div>
                </div>
              `).join('')}
            </div>
            <script>
              window.onload = function() { 
                window.print(); 
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
    }
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
              <Printer className="ml-2 h-4 w-4" />
              طباعة الباركود ({selectedProducts.length})
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
                        src={generateBarcodeImage(product.barcode)} 
                        alt="barcode"
                        className="mx-auto border rounded"
                      />
                      <div className="text-xs text-gray-600 mt-1">{product.barcode}</div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <ScanBarcode className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm">لا يوجد باركود</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-3 w-3 ml-1" />
                        إضافة باركود
                      </Button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 ml-1" />
                    تعديل
                  </Button>
                  {product.barcode && (
                    <Button variant="outline" size="sm" className="flex-1">
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