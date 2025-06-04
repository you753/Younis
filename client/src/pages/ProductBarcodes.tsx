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
    // Create a more realistic Code 128-like barcode pattern
    const width = 320;
    const height = 80;
    const patterns = [];
    
    // Add start pattern (quiet zone and start bars)
    patterns.push(
      { width: 3, color: 'white' },  // Quiet zone
      { width: 2, color: 'black' },
      { width: 1, color: 'white' },
      { width: 1, color: 'black' },
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

  const printBarcodes = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    if (selectedProductsData.length === 0) {
      alert('يرجى اختيار منتجات للطباعة');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>طباعة باركود الأصناف</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: 'Arial', 'Tahoma', sans-serif; 
                padding: 15mm;
                background: white;
                direction: rtl;
              }
              
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
              }
              
              .print-header h1 {
                font-size: 24px;
                color: #333;
                margin-bottom: 5px;
              }
              
              .print-header p {
                color: #666;
                font-size: 14px;
              }
              
              .barcode-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
                gap: 15px;
                margin-top: 20px;
              }
              
              .barcode-item { 
                border: 2px solid #e0e0e0; 
                border-radius: 8px;
                padding: 20px; 
                text-align: center; 
                page-break-inside: avoid;
                background: #fafafa;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .product-name { 
                font-weight: bold; 
                font-size: 16px;
                margin-bottom: 12px;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
              }
              
              .barcode-image { 
                margin: 15px 0;
                background: white;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #ddd;
              }
              
              .barcode-image img {
                max-width: 100%;
                height: auto;
              }
              
              .product-details {
                font-size: 14px;
                color: #555;
                line-height: 1.6;
              }
              
              .product-details div {
                margin: 5px 0;
              }
              
              .price {
                font-weight: bold;
                color: #2563eb;
                font-size: 16px;
              }
              
              .print-footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 15px;
              }
              
              @media print { 
                body { 
                  margin: 0; 
                  padding: 10mm;
                }
                .barcode-grid { 
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
                }
                .barcode-item {
                  border: 1px solid #333;
                  box-shadow: none;
                  background: white;
                }
                .print-header h1 {
                  font-size: 20px;
                }
              }
              
              @page {
                size: A4;
                margin: 15mm;
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>باركود الأصناف</h1>
              <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')} | عدد الأصناف: ${selectedProductsData.length}</p>
            </div>
            
            <div class="barcode-grid">
              ${selectedProductsData.map(product => `
                <div class="barcode-item">
                  <div class="product-name">${product.name}</div>
                  ${product.barcode ? `
                    <div class="barcode-image">
                      <img src="${generateBarcodeImage(product.barcode)}" alt="barcode for ${product.name}" />
                    </div>
                  ` : '<div style="color: #dc2626; font-weight: bold;">لا يوجد باركود</div>'}
                  <div class="product-details">
                    <div><strong>الكود:</strong> ${product.code || 'غير محدد'}</div>
                    <div><strong>الباركود:</strong> ${product.barcode || 'غير محدد'}</div>
                    <div><strong>الفئة:</strong> ${product.category || 'غير محدد'}</div>
                    <div class="price"><strong>السعر:</strong> ${product.salePrice} ر.س</div>
                    <div><strong>الكمية:</strong> ${product.quantity || 0} قطعة</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="print-footer">
              <p>تم إنشاؤها بواسطة نظام المحاسبة المتكامل</p>
            </div>
            
            <script>
              window.onload = function() { 
                // تأخير قصير للتأكد من تحميل الصور
                setTimeout(() => {
                  window.print(); 
                  setTimeout(() => window.close(), 2000);
                }, 500);
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