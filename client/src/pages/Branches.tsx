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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Building, Edit, Trash2, MapPin, Phone, User, Upload, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Branch } from '@shared/schema';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  code: z.string().min(1, 'كود الفرع مطلوب'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  managerName: z.string().optional(),
  managerPhone: z.string().optional(),
  openingDate: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BranchForm = z.infer<typeof branchSchema>;

export default function Branches() {
  const [location] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('الفروع');
  }, [location, setCurrentPage]);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches']
  });

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      managerName: '',
      managerPhone: '',
      openingDate: '',
      notes: '',
      isActive: true,
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: BranchForm) => {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create branch');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "تم إنشاء الفرع بنجاح",
        description: "تم إضافة الفرع الجديد إلى النظام",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating branch:', error);
      toast({
        title: "خطأ في إنشاء الفرع",
        description: error.message || "حدث خطأ أثناء إنشاء الفرع",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BranchForm) => {
      const response = await fetch(`/api/branches/${editingBranch?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update branch');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowForm(false);
      setEditingBranch(null);
      form.reset();
      toast({
        title: "تم تحديث الفرع بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating branch:', error);
      toast({
        title: "خطأ في تحديث الفرع",
        description: error.message || "حدث خطأ أثناء تحديث الفرع",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete branch');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم حذف الفرع بنجاح",
        description: "تم حذف الفرع من النظام",
      });
    },
    onError: (error) => {
      console.error('Error deleting branch:', error);
      toast({
        title: "خطأ في حذف الفرع",
        description: "حدث خطأ أثناء حذف الفرع",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    setEditingBranch(null);
    form.reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      managerName: '',
      managerPhone: '',
      openingDate: '',
      notes: '',
      isActive: true,
    });
    setShowForm(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      managerPhone: branch.managerPhone || '',
      openingDate: branch.openingDate || '',
      notes: branch.notes || '',
      isActive: branch.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: BranchForm) => {
    if (editingBranch) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter branches based on search query
  const filteredBranches = branches.filter((branch: Branch) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      branch.name.toLowerCase().includes(searchTerm) ||
      branch.code.toLowerCase().includes(searchTerm) ||
      (branch.address && branch.address.toLowerCase().includes(searchTerm)) ||
      (branch.managerName && branch.managerName.toLowerCase().includes(searchTerm))
    );
  });

  // Calculate stats
  const activeBranches = branches.filter(branch => branch.isActive).length;
  const inactiveBranches = branches.filter(branch => !branch.isActive).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفروع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الفروع</h2>
          <p className="text-gray-600">إدارة فروع الشركة والمواقع</p>
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
            إضافة فرع جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي الفروع</p>
                <p className="text-2xl font-bold text-blue-700">{branches.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Building className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">الفروع النشطة</p>
                <p className="text-2xl font-bold text-green-700">{activeBranches}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Building className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">الفروع غير النشطة</p>
                <p className="text-2xl font-bold text-red-700">{inactiveBranches}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <Building className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث عن فرع (الاسم، الكود، العنوان، اسم المدير...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              النتائج: {filteredBranches.length} من أصل {branches.length} فرع
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفروع</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBranches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'لا توجد فروع تطابق البحث' : 'لا توجد فروع مسجلة'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الفرع</TableHead>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">المدير</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{branch.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {branch.address || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-gray-400" />
                        {branch.managerName || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {branch.phone || 'غير محدد'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(branch.id)}
                          disabled={deleteMutation.isPending}
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

      {/* Branch Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الفرع</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم الفرع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود الفرع</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل كود الفرع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الفرع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل رقم الهاتف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل البريد الإلكتروني" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المدير</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم مدير الفرع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="managerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>هاتف المدير</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل رقم هاتف المدير" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="openingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الافتتاح</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">الفرع نشط</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        تفعيل أو إلغاء تفعيل الفرع
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                  {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : editingBranch ? 'تحديث الفرع' : 'إضافة الفرع'}
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
        title="استيراد الفروع من Excel"
        instructions="يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية: اسم الفرع، كود الفرع، العنوان، الهاتف، البريد الإلكتروني، اسم المدير، هاتف المدير، تاريخ الافتتاح، ملاحظات"
        apiEndpoint="/api/branches/import-excel"
        templateData={[{
          'اسم الفرع': 'الفرع الرئيسي',
          'كود الفرع': 'BR001',
          'العنوان': 'الرياض، المملكة العربية السعودية',
          'الهاتف': '0112345678',
          'البريد الإلكتروني': 'main@company.com',
          'اسم المدير': 'أحمد محمد',
          'هاتف المدير': '0501234567',
          'تاريخ الافتتاح': '2024-01-01',
          'ملاحظات': 'الفرع الرئيسي للشركة'
        }]}
        templateName="نموذج_استيراد_الفروع.xlsx"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/branches'] })}
      />
    </div>
  );
}