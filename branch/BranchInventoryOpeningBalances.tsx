import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import * as XLSX from 'xlsx';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calculator,
  TrendingUp,
  Warehouse,
  Upload,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface BranchInventoryOpeningBalancesProps {
  branchId: number;
}

const BranchInventoryOpeningBalances = ({ branchId }: BranchInventoryOpeningBalancesProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // جلب المنتجات من قاعدة البيانات
  const { data: existingProducts = [], refetch: refetchProducts } = useQuery({
    queryKey: ['/api/products']
  });

  // إضافة منتج جديد mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      refetchProducts();
    }
  });

  // وظائف استيراد Excel
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const errors: string[] = [];
        let successCount = 0;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any;
          setImportProgress(((i + 1) / jsonData.length) * 80); // 80% للمعالجة، 20% للحفظ

          try {
            // التحقق من الحقول المطلوبة
            const productName = row['اسم المنتج'] || row['Product Name'] || row['name'];
            const productCode = row['كود المنتج'] || row['Product Code'] || row['code'];
            const quantity = parseFloat(row['الكمية الافتتاحية'] || row['Opening Quantity'] || row['quantity'] || '0');
            const purchasePrice = parseFloat(row['تكلفة الوحدة'] || row['Unit Cost'] || row['cost'] || '0');
            const salePrice = parseFloat(row['سعر البيع'] || row['Sale Price'] || row['salePrice'] || purchasePrice * 1.2);
            const category = row['الفئة'] || row['Category'] || row['category'] || 'غير محدد';
            const description = row['الوصف'] || row['Description'] || row['description'] || '';
            const minStock = parseFloat(row['الحد الأدنى'] || row['Min Stock'] || row['minStock'] || '5');

            if (!productName) {
              errors.push(`السطر ${i + 2}: اسم المنتج مطلوب`);
              continue;
            }

            if (!productCode) {
              errors.push(`السطر ${i + 2}: كود المنتج مطلوب`);
              continue;
            }

            // التحقق من عدم وجود كود منتج مكرر
            const existingProduct = existingProducts.find((p: any) => p.code === productCode);
            if (existingProduct) {
              errors.push(`السطر ${i + 2}: كود المنتج ${productCode} موجود مسبقاً`);
              continue;
            }

            if (isNaN(quantity) || quantity < 0) {
              errors.push(`السطر ${i + 2}: كمية غير صحيحة`);
              continue;
            }

            if (isNaN(purchasePrice) || purchasePrice < 0) {
              errors.push(`السطر ${i + 2}: تكلفة وحدة غير صحيحة`);
              continue;
            }

            // إنشاء المنتج
            const newProduct = {
              name: productName,
              code: productCode,
              description: description,
              category: category,
              purchasePrice: purchasePrice,
              salePrice: salePrice,
              quantity: quantity,
              minStock: minStock,
              barcode: productCode, // استخدام كود المنتج كباركود مؤقت
              unit: 'قطعة'
            };

            // حفظ المنتج في قاعدة البيانات
            await addProductMutation.mutateAsync(newProduct);
            successCount++;

          } catch (error: any) {
            errors.push(`السطر ${i + 2}: ${error.message || 'خطأ في معالجة البيانات'}`);
          }
        }

        // تحديث التقدم إلى 100%
        setImportProgress(100);

        setImportResults({ success: successCount, errors });
        
        if (successCount > 0) {
          toast({
            title: 'تم الاستيراد والحفظ بنجاح!',
            description: `تم إضافة ${successCount} منتج جديد إلى النظام مع الأرصدة الافتتاحية`,
          });
          
          // إعادة تحميل قائمة المنتجات
          refetchProducts();
        }

        if (errors.length > 0) {
          toast({
            title: 'تحذير',
            description: `${errors.length} خطأ في الاستيراد`,
            variant: 'destructive'
          });
        }

      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في قراءة ملف Excel',
          variant: 'destructive'
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'اسم المنتج': 'لابتوب HP',
        'كود المنتج': 'LAP001',
        'الوصف': 'لابتوب HP EliteBook 15 انش',
        'الفئة': 'إلكترونيات',
        'الكمية الافتتاحية': 10,
        'تكلفة الوحدة': 2500.00,
        'سعر البيع': 3000.00,
        'الحد الأدنى': 5
      },
      {
        'اسم المنتج': 'طابعة Canon',
        'كود المنتج': 'PRT002',
        'الوصف': 'طابعة Canon Pixma متعددة الوظائف',
        'الفئة': 'إلكترونيات',
        'الكمية الافتتاحية': 20,
        'تكلفة الوحدة': 800.00,
        'سعر البيع': 950.00,
        'الحد الأدنى': 3
      },
      {
        'اسم المنتج': 'ثوب قطني',
        'كود المنتج': 'CLO003',
        'الوصف': 'ثوب رجالي قطني مقاس متوسط',
        'الفئة': 'ملابس',
        'الكمية الافتتاحية': 50,
        'تكلفة الوحدة': 80.00,
        'سعر البيع': 120.00,
        'الحد الأدنى': 10
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب المنتجات');
    XLSX.writeFile(wb, 'قالب_استيراد_المنتجات_شامل.xlsx');
    
    toast({
      title: 'تم التحميل',
      description: 'تم تحميل قالب Excel بنجاح',
      variant: 'default'
    });
  };

  // بيانات تجريبية للأرصدة الافتتاحية
  const openingBalances = [
    {
      id: 1,
      productName: 'ثوب صيفي قطني',
      productCode: 'TH001',
      category: 'ملابس صيفية',
      openingQuantity: 50,
      unitCost: 65.00,
      totalValue: 3250.00,
      date: '2025-01-01',
      location: 'رف A1',
      notes: 'رصيد افتتاحي للعام الجديد',
      enteredBy: 'أحمد محمد',
      status: 'مفعل'
    },
    {
      id: 2,
      productName: 'عباءة مطرزة',
      productCode: 'AB002',
      category: 'ملابس نسائية',
      openingQuantity: 25,
      unitCost: 140.00,
      totalValue: 3500.00,
      date: '2025-01-01',
      location: 'رف B2',
      notes: 'تم جرد المخزون',
      enteredBy: 'فاطمة أحمد',
      status: 'مفعل'
    },
    {
      id: 3,
      productName: 'حذاء جلدي',
      productCode: 'SH003',
      category: 'أحذية',
      openingQuantity: 15,
      unitCost: 110.00,
      totalValue: 1650.00,
      date: '2025-01-01',
      location: 'رف C3',
      notes: 'مخزون جديد',
      enteredBy: 'محمد علي',
      status: 'مفعل'
    },
    {
      id: 4,
      productName: 'قميص قطني',
      productCode: 'QM004',
      category: 'ملابس رجالية',
      openingQuantity: 40,
      unitCost: 35.00,
      totalValue: 1400.00,
      date: '2025-01-01',
      location: 'رف D1',
      notes: 'رصيد افتتاحي معتمد',
      enteredBy: 'سارة محمود',
      status: 'مفعل'
    }
  ];

  // إحصائيات الأرصدة الافتتاحية
  const stats = {
    totalProducts: openingBalances.length,
    totalQuantity: openingBalances.reduce((sum, item) => sum + item.openingQuantity, 0),
    totalValue: openingBalances.reduce((sum, item) => sum + item.totalValue, 0),
    averageCost: openingBalances.reduce((sum, item) => sum + item.totalValue, 0) / openingBalances.reduce((sum, item) => sum + item.openingQuantity, 0)
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'مفعل': { className: 'bg-green-100 text-green-800 border-green-200', text: 'مفعل' },
      'معلق': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'معلق' },
      'محذوف': { className: 'bg-red-100 text-red-800 border-red-200', text: 'محذوف' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['مفعل'];
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const filteredData = openingBalances.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الأرصدة الافتتاحية</h1>
          <p className="text-gray-600 mt-1">الفرع {branchId}</p>
        </div>
        <div className="flex gap-3">
          {/* زر استيراد من Excel */}
          <Button 
            onClick={() => setShowImportDialog(true)}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4" />
            استيراد منتجات من Excel
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                إضافة رصيد افتتاحي
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة رصيد افتتاحي جديد</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>اسم المنتج</Label>
                  <Input placeholder="أدخل اسم المنتج" />
                </div>
                <div className="space-y-2">
                  <Label>رمز المنتج</Label>
                  <Input placeholder="أدخل رمز المنتج" />
                </div>
                <div className="space-y-2">
                  <Label>الكمية الافتتاحية</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>تكلفة الوحدة</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>موقع التخزين</Label>
                  <Input placeholder="رف A1" />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الرصيد</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>ملاحظات</Label>
                  <Textarea placeholder="أدخل أي ملاحظات إضافية" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  حفظ الرصيد الافتتاحي
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الكمية</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalQuantity}</p>
              </div>
              <Warehouse className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString('en-US')} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">متوسط التكلفة</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageCost.toFixed(2)} ر.س</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">قائمة الأرصدة</TabsTrigger>
          <TabsTrigger value="summary">ملخص بالفئات</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* البحث */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث عن منتج أو رمز المنتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  تصفية متقدمة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* جدول الأرصدة الافتتاحية */}
          <Card>
            <CardHeader>
              <CardTitle>الأرصدة الافتتاحية التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium text-gray-700">المنتج</th>
                      <th className="text-right p-3 font-medium text-gray-700">رمز المنتج</th>
                      <th className="text-right p-3 font-medium text-gray-700">الفئة</th>
                      <th className="text-right p-3 font-medium text-gray-700">الكمية</th>
                      <th className="text-right p-3 font-medium text-gray-700">تكلفة الوحدة</th>
                      <th className="text-right p-3 font-medium text-gray-700">إجمالي القيمة</th>
                      <th className="text-right p-3 font-medium text-gray-700">التاريخ</th>
                      <th className="text-right p-3 font-medium text-gray-700">الموقع</th>
                      <th className="text-right p-3 font-medium text-gray-700">الحالة</th>
                      <th className="text-right p-3 font-medium text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">بواسطة: {item.enteredBy}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{item.productCode}</Badge>
                        </td>
                        <td className="p-3 text-gray-600">{item.category}</td>
                        <td className="p-3 font-bold text-blue-600">{item.openingQuantity}</td>
                        <td className="p-3 font-medium">{item.unitCost.toLocaleString('en-US')} ر.س</td>
                        <td className="p-3 font-bold text-green-600">{item.totalValue.toLocaleString('en-US')} ر.س</td>
                        <td className="p-3 text-gray-600">{item.date}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{item.location}</Badge>
                        </td>
                        <td className="p-3">{getStatusBadge(item.status)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الأرصدة الافتتاحية بالفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* توزيع الفئات */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">توزيع القيمة حسب الفئة</h3>
                  <div className="space-y-4">
                    {['ملابس صيفية', 'ملابس نسائية', 'أحذية', 'ملابس رجالية'].map((category) => {
                      const categoryItems = openingBalances.filter(item => item.category === category);
                      const categoryValue = categoryItems.reduce((sum, item) => sum + item.totalValue, 0);
                      const percentage = (categoryValue / stats.totalValue * 100).toFixed(1);
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category}</span>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{categoryValue.toLocaleString('en-US')} ر.س</p>
                              <p className="text-sm text-gray-500">{percentage}%</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* إحصائيات تفصيلية */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">إحصائيات تفصيلية</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">أعلى قيمة منتج</span>
                        <span className="font-bold text-blue-800">
                          {Math.max(...openingBalances.map(item => item.totalValue)).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 font-medium">أقل قيمة منتج</span>
                        <span className="font-bold text-green-800">
                          {Math.min(...openingBalances.map(item => item.totalValue)).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-medium">أعلى كمية</span>
                        <span className="font-bold text-purple-800">
                          {Math.max(...openingBalances.map(item => item.openingQuantity))} وحدة
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-700 font-medium">متوسط قيمة المنتج</span>
                        <span className="font-bold text-orange-800">
                          {(stats.totalValue / stats.totalProducts).toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* نافذة حوار استيراد Excel */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>استيراد المنتجات من Excel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* تحميل القالب */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">تحميل قالب Excel</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                قم بتحميل قالب Excel أولاً لمعرفة تنسيق البيانات المطلوب
              </p>
              <Button 
                onClick={downloadTemplate}
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل القالب
              </Button>
            </div>

            {/* رفع الملف */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر ملف Excel للاستيراد
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="block w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              {/* شريط التقدم */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>جاري الاستيراد...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}

              {/* نتائج الاستيراد */}
              {importResults && (
                <div className="space-y-3">
                  {importResults.success > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          تم استيراد {importResults.success} منتج بنجاح
                        </span>
                      </div>
                    </div>
                  )}

                  {importResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">
                          أخطاء في الاستيراد ({importResults.errors.length})
                        </span>
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <p key={index} className="text-sm text-red-700">
                            • {error}
                          </p>
                        ))}
                        {importResults.errors.length > 5 && (
                          <p className="text-sm text-red-600 mt-1">
                            ... و {importResults.errors.length - 5} خطأ آخر
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* تعليمات */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">تعليمات الاستيراد:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>الأعمدة المطلوبة:</strong> اسم المنتج، كود المنتج، الكمية الافتتاحية، تكلفة الوحدة</li>
                <li>• <strong>الأعمدة الاختيارية:</strong> الوصف، الفئة، سعر البيع، الحد الأدنى</li>
                <li>• سيتم إضافة المنتجات فعلياً إلى قاعدة البيانات مع الأرصدة الافتتاحية</li>
                <li>• تأكد من عدم تكرار أكواد المنتجات الموجودة مسبقاً</li>
                <li>• استخدم القالب المحدث للحصول على التنسيق الصحيح</li>
                <li>• سيتم حساب سعر البيع تلقائياً إذا لم يتم توفيره (تكلفة + 20%)</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowImportDialog(false);
                setImportResults(null);
                setImportProgress(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchInventoryOpeningBalances;