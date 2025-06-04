import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, ArrowLeft, Eye, Edit, Trash2, Save, Package, ShoppingCart } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// Schema for return items
const returnItemSchema = z.object({
  productId: z.number().min(1, 'يجب اختيار منتج'),
  productName: z.string(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون صفر أو أكبر'),
  total: z.number().min(0),
});

// Schema for form validation
const salesReturnFormSchema = z.object({
  saleId: z.number().optional(),
  returnNumber: z.string().min(1, 'رقم المرتجع مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  reason: z.string().min(1, 'سبب الإرجاع مطلوب'),
  status: z.string().default('pending'),
  notes: z.string().optional(),
  items: z.array(returnItemSchema).optional(),
});

type SalesReturnForm = z.infer<typeof salesReturnFormSchema>;

export default function SalesReturns() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('مرتجعات المبيعات');
  }, [setCurrentPage]);

  // Fetch sales returns data
  const { data: salesReturns = [], isLoading } = useQuery({
    queryKey: ['/api/sales-returns'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const form = useForm<SalesReturnForm>({
    resolver: zodResolver(salesReturnFormSchema),
    defaultValues: {
      returnNumber: '',
      total: '',
      reason: '',
      status: 'pending',
      notes: '',
      items: [],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createReturnMutation = useMutation({
    mutationFn: (data: SalesReturnForm) => apiRequest({
      url: '/api/sales-returns',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم إضافة المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المرتجع",
        variant: "destructive",
      });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SalesReturnForm> }) => 
      apiRequest({
        url: `/api/sales-returns/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      setEditingReturn(null);
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم تحديث المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المرتجع",
        variant: "destructive",
      });
    },
  });

  const deleteReturnMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/sales-returns/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-returns'] });
      toast({
        title: "نجح",
        description: "تم حذف المرتجع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المرتجع",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SalesReturnForm) => {
    if (editingReturn) {
      updateReturnMutation.mutate({ id: editingReturn.id, data });
    } else {
      createReturnMutation.mutate(data);
    }
  };

  const handleEdit = (salesReturn: any) => {
    setEditingReturn(salesReturn);
    form.reset({
      saleId: salesReturn.saleId,
      returnNumber: salesReturn.returnNumber,
      total: salesReturn.total,
      reason: salesReturn.reason,
      status: salesReturn.status,
      notes: salesReturn.notes || '',
      items: salesReturn.items || [],
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف المرتجع؟')) {
      deleteReturnMutation.mutate(id);
    }
  };

  const addNewItem = () => {
    appendItem({
      productId: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  const calculateItemTotal = (index: number) => {
    const quantity = form.watch(`items.${index}.quantity`);
    const unitPrice = form.watch(`items.${index}.unitPrice`);
    const total = quantity * unitPrice;
    form.setValue(`items.${index}.total`, total);
    calculateGrandTotal();
  };

  const calculateGrandTotal = () => {
    const items = form.watch('items') || [];
    const grandTotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    form.setValue('total', grandTotal.toFixed(2));
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = Array.isArray(products) ? products.find((p: any) => p.id === productId) : null;
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.salePrice));
      calculateItemTotal(index);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      approved: { label: 'موافق عليه', variant: 'default' as const },
      completed: { label: 'مكتمل', variant: 'default' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowLeft className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مرتجعات المبيعات</h2>
              <p className="text-gray-600">إدارة مرتجعات المبيعات والاسترداد</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مرتجع
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">مرتجعات اليوم</p>
                <p className="text-2xl font-bold text-red-700">0</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">قيمة المرتجعات</p>
                <p className="text-2xl font-bold text-orange-700">0.00 ر.س</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">مرتجعات معلقة</p>
                <p className="text-2xl font-bold text-yellow-700">0</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <ArrowLeft className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة مرتجعات المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">رقم المرتجع</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">السبب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد مرتجعات مبيعات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  salesReturns.map((returnItem: any) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-medium">#{returnItem.id}</TableCell>
                      <TableCell>{new Date(returnItem.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{returnItem.clientName}</TableCell>
                      <TableCell>{parseFloat(returnItem.total).toFixed(2)} ر.س</TableCell>
                      <TableCell>{returnItem.reason}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          returnItem.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {returnItem.status === 'approved' ? 'مُعتمد' : 'معلق'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}