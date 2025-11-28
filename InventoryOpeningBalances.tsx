import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Edit, Trash2, Calculator, DollarSign, Archive, Search, Upload } from 'lucide-react';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { InventoryOpeningBalance, Product } from '@shared/schema';

const openingBalanceSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  openingQuantity: z.string().min(1, 'يجب إدخال الكمية الافتتاحية'),
  unitCost: z.string().min(1, 'يجب إدخال تكلفة الوحدة'),
  location: z.string().optional(),
  notes: z.string().optional(),
  dateRecorded: z.string().min(1, 'يجب تحديد تاريخ التسجيل'),
});

type OpeningBalanceForm = z.infer<typeof openingBalanceSchema>;

export default function InventoryOpeningBalances() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState<InventoryOpeningBalance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('الأرصدة الافتتاحية للمخزون');
  }, [location, setCurrentPage]);

  const { data: balances = [], isLoading: balancesLoading } = useQuery<InventoryOpeningBalance[]>({
    queryKey: ['/api/inventory-opening-balances']
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const form = useForm<OpeningBalanceForm>({
    resolver: zodResolver(openingBalanceSchema),
    defaultValues: {
      productId: editingBalance?.productId || 0,
      openingQuantity: editingBalance?.openingQuantity || '',
      unitCost: editingBalance?.unitCost || '',
      location: editingBalance?.location || '',
      notes: editingBalance?.notes || '',
      dateRecorded: editingBalance?.dateRecorded || new Date().toISOString().split('T')[0],
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: OpeningBalanceForm) => {
      const openingValue = (parseFloat(data.openingQuantity) * parseFloat(data.unitCost)).toString();
      const response = await fetch('/api/inventory-opening-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          openingValue
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create opening balance');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-opening-balances'] });
      toast({
        title: "تم إنشاء الرصيد الافتتاحي بنجاح",
        description: "تم حفظ الرصيد الافتتاحي للمنتج في النظام",
      });
      setShowForm(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error('Error creating opening balance:', error);
      toast({
        title: "خطأ في إنشاء الرصيد الافتتاحي",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: OpeningBalanceForm) => {
      if (!editingBalance) throw new Error('No balance to update');
      const openingValue = (parseFloat(data.openingQuantity) * parseFloat(data.unitCost)).toString();
      const response = await fetch(`/api/inventory-opening-balances/${editingBalance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          openingValue
        }),
      });
      if (!response.ok) throw new Error('Failed to update opening balance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-opening-balances'] });
      toast({
        title: "تم تحديث الرصيد الافتتاحي بنجاح",
        description: "تم حفظ التغييرات على الرصيد الافتتاحي",
      });
      setShowForm(false);
      setEditingBalance(null);
      form.reset();
    },
    onError: (error) => {
      console.error('Error updating opening balance:', error);
      toast({
        title: "خطأ في تحديث الرصيد الافتتاحي",
        description: "حدث خطأ أثناء تحديث الرصيد الافتتاحي",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/inventory-opening-balances/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete opening balance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-opening-balances'] });
      toast({
        title: "تم حذف الرصيد الافتتاحي بنجاح",
        description: "تم حذف الرصيد الافتتاحي من النظام",
      });
    },
    onError: (error) => {
      console.error('Error deleting opening balance:', error);
      toast({
        title: "خطأ في حذف الرصيد الافتتاحي",
        description: "حدث خطأ أثناء حذف الرصيد الافتتاحي",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    setEditingBalance(null);
    form.reset({
      productId: 0,
      openingQuantity: '',
      unitCost: '',
      location: '',
      notes: '',
      dateRecorded: new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleEdit = (balance: InventoryOpeningBalance) => {
    setEditingBalance(balance);
    form.reset({
      productId: balance.productId,
      openingQuantity: balance.openingQuantity,
      unitCost: balance.unitCost,
      location: balance.location || '',
      notes: balance.notes || '',
      dateRecorded: balance.dateRecorded,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الرصيد الافتتاحي؟')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: OpeningBalanceForm) => {
    if (editingBalance) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'غير محدد';
  };

  const getProductCode = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.code || '-';
  };

  // Filter balances based on search query
  const filteredBalances = balances.filter(balance => {
    const productName = getProductName(balance.productId).toLowerCase();
    const productCode = getProductCode(balance.productId).toLowerCase();
    const location = (balance.location || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return productName.includes(query) || 
           productCode.includes(query) || 
           location.includes(query);
  });

  // Calculate totals
  const totalQuantity = filteredBalances.reduce((sum, balance) => sum + parseFloat(balance.openingQuantity || '0'), 0);
  const totalValue = filteredBalances.reduce((sum, balance) => sum + parseFloat(balance.openingValue || '0'), 0);
  const totalProducts = filteredBalances.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الأرصدة الافتتاحية للمخزون</h2>
          <p className="text-gray-600">إدارة الأرصدة الافتتاحية للمنتجات والمخزون</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowImportDialog(true)} 
            variant="outline" 
            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
          >
            <Upload className="ml-2 h-4 w-4" />
            استيراد من Excel
          </Button>
          <Button onClick={handleAdd} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة رصيد افتتاحي
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-700">{totalProducts}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">إجمالي الكمية</p>
                <p className="text-2xl font-bold text-green-700">{totalQuantity.toLocaleString('en-US')}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Archive className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-purple-700">
                  {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="بحث في المنتجات أو المواقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Opening Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأرصدة الافتتاحية</CardTitle>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="text-center py-8">جاري تحميل الأرصدة الافتتاحية...</div>
          ) : filteredBalances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Archive className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>{searchQuery ? 'لا توجد أرصدة افتتاحية تطابق البحث' : 'لا توجد أرصدة افتتاحية مسجلة'}</p>
              <Button onClick={handleAdd} className="mt-4">
                إضافة أول رصيد افتتاحي
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود المنتج</TableHead>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الكمية الافتتاحية</TableHead>
                  <TableHead>تكلفة الوحدة</TableHead>
                  <TableHead>القيمة الإجمالية</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell className="font-medium">{getProductCode(balance.productId)}</TableCell>
                    <TableCell>{getProductName(balance.productId)}</TableCell>
                    <TableCell>{parseFloat(balance.openingQuantity || '0').toLocaleString('en-US')}</TableCell>
                    <TableCell>
                      {parseFloat(balance.unitCost || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell className="font-bold">
                      {parseFloat(balance.openingValue || '0').toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell>{balance.location || '-'}</TableCell>
                    <TableCell>{new Date(balance.dateRecorded).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(balance)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(balance.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingBalance ? 'تعديل الرصيد الافتتاحي' : 'إضافة رصيد افتتاحي جديد'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنتج</FormLabel>
                      <Select 
                        value={field.value.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.code} - {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكمية الافتتاحية</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.001" 
                          placeholder="أدخل الكمية" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تكلفة الوحدة</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="أدخل تكلفة الوحدة" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموقع (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="مخزن رئيسي، مخزن فرعي، إلخ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateRecorded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ التسجيل</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Calculated Total Value */}
              {form.watch('openingQuantity') && form.watch('unitCost') && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">القيمة المحسوبة</h4>
                  </div>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {(parseFloat(form.watch('openingQuantity') || '0') * parseFloat(form.watch('unitCost') || '0')).toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'SAR' 
                    })}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل أي ملاحظات إضافية..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-accounting-primary"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : editingBalance ? 'تحديث الرصيد' : 'إضافة الرصيد'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        title="استيراد الأرصدة الافتتاحية من Excel"
        instructions="يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية: رمز المنتج أو اسم المنتج، الكمية الافتتاحية، تكلفة الوحدة، الموقع، ملاحظات، تاريخ التسجيل"
        apiEndpoint="/api/inventory-opening-balances/import-excel"
        templateData={[{
          'رمز المنتج': 'PRD001',
          'اسم المنتج': 'منتج تجريبي',
          'الكمية الافتتاحية': '100',
          'تكلفة الوحدة': '25.50',
          'الموقع': 'المستودع الرئيسي',
          'ملاحظات': 'رصيد افتتاحي',
          'تاريخ التسجيل': new Date().toISOString().split('T')[0]
        }]}
        templateName="نموذج_استيراد_الأرصدة_الافتتاحية.xlsx"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/inventory-opening-balances'] })}
      />
    </div>
  );
}