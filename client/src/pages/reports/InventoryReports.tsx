import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Warehouse, Download, AlertTriangle, Package, TrendingUp, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Product, ProductCategory } from '@shared/schema';

export default function InventoryReports() {
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 60000,
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['/api/product-categories'],
    staleTime: 60000,
  });

  const filteredProducts = products.filter(product => {
    const quantity = product.quantity || 0;
    const stockMatch = stockFilter === 'all' || 
      (stockFilter === 'low' && quantity <= 10 && quantity > 0) ||
      (stockFilter === 'out' && quantity === 0) ||
      (stockFilter === 'available' && quantity > 10);
    
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    
    const searchMatch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return stockMatch && categoryMatch && searchMatch;
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.quantity || 0) <= 10 && (p.quantity || 0) > 0).length;
  const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0).length;
  const totalInventoryValue = products.reduce((sum, product) => 
    sum + (parseFloat(product.purchasePrice || '0') * (product.quantity || 0)), 0
  );

  const generateInventoryReportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('inventory-report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.setFontSize(20);
      pdf.text(`تقرير المخزون - ${new Date().toLocaleDateString('ar-SA')}`, 105, 20, { align: 'center' });
      
      position = 30;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-المخزون-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">تقارير المخزون</h1>
            <p className="text-gray-600">تحليل شامل لحالة المخزون والمنتجات</p>
          </div>
        </div>
        <Button
          onClick={generateInventoryReportPDF}
          disabled={isGeneratingPDF}
          className="bg-green-600 hover:bg-green-700"
        >
          {isGeneratingPDF ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isGeneratingPDF ? 'جاري الإنشاء...' : 'حفظ PDF'}
        </Button>
      </div>

      {/* Report Content */}
      <div id="inventory-report-content">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">نفد من المخزون</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-green-600">{totalInventoryValue.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              فلاتر التقرير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">البحث</Label>
                <Input
                  id="search"
                  placeholder="اسم المنتج أو الرمز"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stock">حالة المخزون</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة المخزون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المنتجات</SelectItem>
                    <SelectItem value="available">متوفر (أكثر من 10)</SelectItem>
                    <SelectItem value="low">مخزون منخفض (10 أو أقل)</SelectItem>
                    <SelectItem value="out">نفد من المخزون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المنتجات</CardTitle>
            <CardDescription>
              عرض {filteredProducts.length} من أصل {totalProducts} منتج
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المنتج</TableHead>
                    <TableHead className="text-right">الرمز</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">سعر الشراء</TableHead>
                    <TableHead className="text-right">سعر البيع</TableHead>
                    <TableHead className="text-right">القيمة الإجمالية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const quantity = product.quantity || 0;
                    const purchasePrice = parseFloat(product.purchasePrice || '0');
                    const salePrice = parseFloat(product.salePrice || '0');
                    const totalValue = quantity * purchasePrice;
                    
                    let stockStatus = 'متوفر';
                    let statusColor = 'bg-green-100 text-green-800';
                    
                    if (quantity === 0) {
                      stockStatus = 'نفد من المخزون';
                      statusColor = 'bg-red-100 text-red-800';
                    } else if (quantity <= 10) {
                      stockStatus = 'مخزون منخفض';
                      statusColor = 'bg-orange-100 text-orange-800';
                    }

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name || '-'}</TableCell>
                        <TableCell>{product.code || '-'}</TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell>{quantity}</TableCell>
                        <TableCell>{purchasePrice.toFixed(2)} ر.س</TableCell>
                        <TableCell>{salePrice.toFixed(2)} ر.س</TableCell>
                        <TableCell>{totalValue.toFixed(2)} ر.س</TableCell>
                        <TableCell>
                          <Badge className={statusColor}>{stockStatus}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500">لا توجد منتجات تطابق المعايير المحددة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')} الساعة {new Date().toLocaleTimeString('ar-SA')}</p>
          <p className="mt-1">نظام المحاسب الأعظم - إدارة المخزون</p>
        </div>
      </div>
    </div>
  );
}