import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Phone, MapPin, Building, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  managerName?: string;
  openingDate?: string;
}

interface BranchForm {
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
  managerName: string;
  openingDate: string;
}

export default function Branches() {
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchForm>({
    name: '',
    code: '',
    address: '',
    phone: '',
    isActive: true,
    managerName: '',
    openingDate: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['/api/branches'],
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
      resetForm();
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
      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      isActive: true,
      managerName: '',
      openingDate: ''
    });
  };

  const openAddForm = () => {
    resetForm();
    setEditingBranch(null);
    setShowForm(true);
  };

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      isActive: branch.isActive,
      managerName: branch.managerName || '',
      openingDate: branch.openingDate || ''
    });
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">إدارة الفروع</h1>
            <p className="text-gray-600">إضافة وإدارة فروع الشركة</p>
          </div>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={openAddForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الفرع *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">كود الفرع *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="managerName">اسم المدير</Label>
                  <Input
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="openingDate">تاريخ الافتتاح</Label>
                  <Input
                    id="openingDate"
                    type="date"
                    value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">فرع نشط</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
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
          </DialogContent>
        </Dialog>
      </div>

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
                <TableHead>المدير</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>دخول الفرع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(branches) && branches.length > 0 ? (
                branches.map((branch: Branch) => (
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
                    <TableCell>{branch.managerName || 'غير محدد'}</TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    لا توجد فروع حتى الآن
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}