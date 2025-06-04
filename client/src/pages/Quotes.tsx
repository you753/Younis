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
import { Plus, FileText, Eye, Edit, Trash2, Send, Save, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import QuoteFormComponent from '@/components/forms/QuoteForm';

// Schema for form validation
const quoteFormSchema = z.object({
  clientId: z.number().optional(),
  quoteNumber: z.string().min(1, 'رقم العرض مطلوب'),
  total: z.string().min(1, 'المبلغ الإجمالي مطلوب'),
  tax: z.string().optional(),
  discount: z.string().optional(),
  status: z.string().default('pending'),
  validUntil: z.string().min(1, 'تاريخ انتهاء الصلاحية مطلوب'),
  notes: z.string().optional(),
});

type QuoteForm = z.infer<typeof quoteFormSchema>;

export default function Quotes() {
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('عروض الأسعار');
  }, [setCurrentPage]);

  // Fetch quotes data
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['/api/quotes'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const form = useForm<QuoteForm>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      quoteNumber: '',
      total: '',
      tax: '0',
      discount: '0',
      status: 'pending',
      validUntil: '',
      notes: '',
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: (data: QuoteForm) => apiRequest({
      url: '/api/quotes',
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم إضافة عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة عرض السعر",
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuoteForm> }) => 
      apiRequest({
        url: `/api/quotes/${id}`,
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setEditingQuote(null);
      setShowForm(false);
      form.reset();
      toast({
        title: "نجح",
        description: "تم تحديث عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث عرض السعر",
        variant: "destructive",
      });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/quotes/${id}`,
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "نجح",
        description: "تم حذف عرض السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف عرض السعر",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteForm) => {
    if (editingQuote) {
      updateQuoteMutation.mutate({ id: editingQuote.id, data });
    } else {
      createQuoteMutation.mutate(data);
    }
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    form.reset({
      clientId: quote.clientId,
      quoteNumber: quote.quoteNumber,
      total: quote.total,
      tax: quote.tax || '0',
      discount: quote.discount || '0',
      status: quote.status,
      validUntil: quote.validUntil ? format(new Date(quote.validUntil), 'yyyy-MM-dd') : '',
      notes: quote.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف عرض السعر؟')) {
      deleteQuoteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      accepted: { label: 'مقبول', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
      expired: { label: 'منتهي الصلاحية', variant: 'outline' as const },
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
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">عروض الأسعار</h2>
              <p className="text-gray-600">إنشاء وإدارة عروض الأسعار للعملاء</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="btn-accounting-primary">
            <Plus className="ml-2 h-4 w-4" />
            إضافة عرض سعر
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">عروض جديدة</p>
                <p className="text-2xl font-bold text-blue-700">0</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">عروض مقبولة</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">عروض معلقة</p>
                <p className="text-2xl font-bold text-yellow-700">0</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">قيمة العروض</p>
                <p className="text-2xl font-bold text-purple-700">0.00 ر.س</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة عروض الأسعار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">رقم العرض</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">صالح حتى</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد عروض أسعار حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote: any) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">Q#{quote.id}</TableCell>
                      <TableCell>{new Date(quote.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{parseFloat(quote.total).toFixed(2)} ر.س</TableCell>
                      <TableCell>{new Date(quote.validUntil).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          quote.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : quote.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {quote.status === 'accepted' ? 'مقبول' : 
                           quote.status === 'pending' ? 'معلق' : 'مرفوض'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
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

      {/* Quote Form */}
      <QuoteFormComponent
        open={showForm}
        onOpenChange={setShowForm}
        editingQuote={editingQuote}
        onSuccess={() => {
          setEditingQuote(null);
          setShowForm(false);
        }}
      />
    </div>
  );
}