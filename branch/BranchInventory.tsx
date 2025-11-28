import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, AlertTriangle, TrendingUp, BarChart3, FileSpreadsheet, Upload, Download } from 'lucide-react';
import ProtectedSection from '@/components/ProtectedSection';

interface BranchInventoryProps {
  branchId?: number;
}

export default function BranchInventory({ branchId }: BranchInventoryProps) {
  if (!branchId) return null;
  
  return (
    <ProtectedSection branchId={branchId} section="inventory">
      <BranchInventoryContent branchId={branchId} />
    </ProtectedSection>
  );
}

function BranchInventoryContent({ branchId }: { branchId: number }) {
  const [showExcelDialog, setShowExcelDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // وظيفة تحميل قالب Excel
  const downloadTemplate = () => {
    const csvContent = 'اسم المنتج,الكود,الكمية الافتتاحية,سعر الوحدة,إجمالي القيمة\n' +
                      'لابتوب HP,LAP001,10,5000,50000\n' +
                      'طابعة Canon,PRT001,5,800,4000\n' +
                      'ماوس Logitech,MOU001,50,150,7500';
    
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'قالب_الرصيد_الافتتاحي.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // وظيفة رفع ملف Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  // وظيفة استيراد البيانات
  const handleImport = async () => {
    if (!importFile) return;
    
    setImporting(true);
    
    try {
      // محاكاة عملية الاستيراد
      setTimeout(() => {
        const mockResults = [
          { name: 'لابتوب HP', code: 'LAP001', quantity: 10, price: 5000, total: 50000 },
          { name: 'طابعة Canon', code: 'PRT001', quantity: 5, price: 800, total: 4000 },
          { name: 'ماوس Logitech', code: 'MOU001', quantity: 50, price: 150, total: 7500 }
        ];
        setImportResults(mockResults);
        setImporting(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ في الاستيراد:', error);
      setImporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
            <p className="text-gray-600">مراقبة مخزون الفرع - رقم الفرع: {branchId}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={downloadTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            تحميل قالب Excel
          </Button>
          
          <Dialog open={showExcelDialog} onOpenChange={setShowExcelDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                استيراد الرصيد الافتتاحي
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">استيراد الرصيد الافتتاحي من Excel</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">اسحب ملف Excel هنا أو انقر للاختيار</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      اختيار ملف
                    </label>
                  </div>
                  {importFile && (
                    <p className="mt-2 text-sm text-green-600">تم اختيار: {importFile.name}</p>
                  )}
                </div>

                {importResults.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-3">نتائج الاستيراد ({importResults.length} منتج)</h3>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-1">المنتج</th>
                            <th className="text-right py-1">الكمية</th>
                            <th className="text-right py-1">القيمة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResults.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-1">{item.name}</td>
                              <td className="py-1">{item.quantity}</td>
                              <td className="py-1">{item.total.toLocaleString()} ريال</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2"
                  >
                    {importing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الاستيراد...
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        استيراد البيانات
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowExcelDialog(false)}
                    variant="outline"
                    className="px-6 py-2"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">45</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيمة المخزون</p>
                <p className="text-2xl font-bold text-green-600">125,000 ريال</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مخزون منخفض</p>
                <p className="text-2xl font-bold text-orange-600">7</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نفد المخزون</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">كود المنتج</th>
                  <th className="text-right p-2">اسم المنتج</th>
                  <th className="text-right p-2">الكمية</th>
                  <th className="text-right p-2">سعر الشراء</th>
                  <th className="text-right p-2">سعر البيع</th>
                  <th className="text-right p-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">HP001</td>
                  <td className="p-2">لابتوب HP EliteBook</td>
                  <td className="p-2">10</td>
                  <td className="p-2">3,000 ريال</td>
                  <td className="p-2">3,500 ريال</td>
                  <td className="p-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">متوفر</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">CAN001</td>
                  <td className="p-2">طابعة Canon</td>
                  <td className="p-2">3</td>
                  <td className="p-2">800 ريال</td>
                  <td className="p-2">950 ريال</td>
                  <td className="p-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">منخفض</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}