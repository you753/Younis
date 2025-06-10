import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BranchSettings() {
  const [editingBranch, setEditingBranch] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['/api/branches'],
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل في تحديث الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setEditingBranch(null);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث إعدادات الفرع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الفرع",
        variant: "destructive",
      });
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل في إضافة الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setShowAddForm(false);
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الفرع الجديد بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الفرع",
        variant: "destructive",
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف الفرع');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفرع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الفرع",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, branchId?: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      managerName: formData.get('managerName'),
      managerPhone: formData.get('managerPhone'),
      isActive: formData.get('isActive') === 'on',
      notes: formData.get('notes'),
    };

    if (branchId) {
      updateBranchMutation.mutate({ id: branchId, data });
    } else {
      createBranchMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      deleteBranchMutation.mutate(id);
    }
  };

  const BranchForm = ({ branch, onCancel }: { branch?: any; onCancel: () => void }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {branch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, branch?.id)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم الفرع</Label>
              <Input
                id="name"
                name="name"
                defaultValue={branch?.name || ''}
                required
                placeholder="أدخل اسم الفرع"
              />
            </div>
            <div>
              <Label htmlFor="code">كود الفرع</Label>
              <Input
                id="code"
                name="code"
                defaultValue={branch?.code || ''}
                required
                placeholder="أدخل كود الفرع"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={branch?.phone || ''}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={branch?.email || ''}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">العنوان</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={branch?.address || ''}
              placeholder="أدخل عنوان الفرع"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="managerName">اسم المدير</Label>
              <Input
                id="managerName"
                name="managerName"
                defaultValue={branch?.managerName || ''}
                placeholder="أدخل اسم مدير الفرع"
              />
            </div>
            <div>
              <Label htmlFor="managerPhone">هاتف المدير</Label>
              <Input
                id="managerPhone"
                name="managerPhone"
                type="tel"
                defaultValue={branch?.managerPhone || ''}
                placeholder="أدخل رقم هاتف المدير"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={branch?.notes || ''}
              placeholder="أدخل أي ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={branch?.isActive !== false}
            />
            <Label htmlFor="isActive">الفرع نشط</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={updateBranchMutation.isPending || createBranchMutation.isPending}>
              <Save className="ml-2 h-4 w-4" />
              {branch ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">جاري تحميل إعدادات الفروع...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الفروع</h1>
          <p className="text-gray-600">إدارة وتكوين فروع الشركة</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة فرع جديد
        </Button>
      </div>

      {showAddForm && (
        <BranchForm onCancel={() => setShowAddForm(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch: any) => (
          <Card key={branch.id} className="relative">
            {editingBranch === branch.id ? (
              <BranchForm
                branch={branch}
                onCancel={() => setEditingBranch(null)}
              />
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {branch.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? (
                          <>
                            <CheckCircle className="ml-1 h-3 w-3" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="ml-1 h-3 w-3" />
                            غير نشط
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">{branch.code}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {branch.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{branch.address}</span>
                      </div>
                    )}
                    
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{branch.phone}</span>
                      </div>
                    )}
                    
                    {branch.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{branch.email}</span>
                      </div>
                    )}
                    
                    {branch.managerName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          المدير: {branch.managerName}
                          {branch.managerPhone && ` - ${branch.managerPhone}`}
                        </span>
                      </div>
                    )}
                    
                    {branch.openingDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          تاريخ الافتتاح: {new Date(branch.openingDate).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}
                    
                    {branch.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{branch.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingBranch(branch.id)}
                      disabled={editingBranch !== null}
                    >
                      <Edit className="ml-1 h-3 w-3" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/branch-app/${branch.id}`}
                    >
                      <Settings className="ml-1 h-3 w-3" />
                      إدارة الفرع
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                      disabled={deleteBranchMutation.isPending}
                    >
                      <Trash2 className="ml-1 h-3 w-3" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فروع</h3>
            <p className="text-gray-600 mb-4">ابدأ بإضافة أول فرع للشركة</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فرع جديد
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}