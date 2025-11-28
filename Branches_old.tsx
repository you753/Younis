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
import { Plus, Building, Edit, Trash2, MapPin, Phone, RefreshCw, LogIn, ExternalLink } from 'lucide-react';
import BranchHealthIndicator from '@/components/ui/BranchHealthIndicator';

// Component to fetch and display health data for individual branch
function BranchHealthCard({ branch }: { branch: Branch }) {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: [`/api/branches/${branch.id}/health`],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (healthLoading) {
    return (
      <div className="h-32 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">جاري تحميل البيانات...</span>
      </div>
    );
  }

  const metrics = healthData || {
    healthScore: 0,
    salesPerformance: 0,
    inventoryHealth: 0,
    customerSatisfaction: 0,
  };

  return (
    <BranchHealthIndicator
      branchName={branch.name}
      metrics={metrics}
    />
  );
}
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Branch } from '@shared/schema';

const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  code: z.string().min(1, 'كود الفرع مطلوب'),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BranchForm = z.infer<typeof branchSchema>;

export default function Branches() {
  const [location, setLocation] = useLocation();
  const { setCurrentPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage('الفروع');
  }, [location, setCurrentPage]);

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      isActive: true,
    },
  });

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  // Health metrics mutations
  const updateHealthMutation = useMutation({
    mutationFn: () =>
      fetch('/api/branches/update-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم تحديث مؤشرات الصحة",
        description: "تم تحديث مؤشرات صحة جميع الفروع بنجاح",
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: BranchForm) => 
      fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "تم إضافة الفرع بنجاح",
        description: "تم إضافة الفرع الجديد بنجاح",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BranchForm }) =>
      fetch(`/api/branches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowForm(false);
      setEditingBranch(null);
      form.reset();
      toast({
        title: "تم تحديث الفرع بنجاح",
        description: "تم تحديث بيانات الفرع بنجاح",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/branches/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم حذف الفرع بنجاح",
        description: "تم حذف الفرع بنجاح",
      });
    },
  });

  const onSubmit = (data: BranchForm) => {
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      isActive: branch.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      deleteMutation.mutate(id);
    }
  };

  const openAddForm = () => {
    setEditingBranch(null);
    form.reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      isActive: true,
    });
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">إدارة الفروع</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => updateHealthMutation.mutate()}
            disabled={updateHealthMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${updateHealthMutation.isPending ? 'animate-spin' : ''}`} />
            تحديث مؤشرات الصحة
          </Button>
          <Button onClick={openAddForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة فرع جديد
          </Button>
        </div>
      </div>



      {/* Branch Health Indicators Section */}
      {branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات صحة الفروع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <BranchHealthCard key={`health-${branch.id}`} branch={branch} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفروع</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الكود</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>دخول الفرع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(branches as Branch[]).map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {branch.address || 'غير محدد'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {branch.phone || 'غير محدد'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setLocation(`/branch/${branch.id}`)}
                      disabled={!branch.isActive}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      دخول
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أدخل عنوان الفرع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">حالة الفرع</FormLabel>
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

              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {editingBranch ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}