import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Truck, 
  ArrowRight, 
  Save,
  Phone,
  Mail,
  MapPin,
  FileText,
  User
} from 'lucide-react';

interface BranchSupplierAddProps {
  branchId: number;
}

export default function BranchSupplierAdd({ branchId }: BranchSupplierAddProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    taxNumber: '',
    notes: '',
    isActive: true
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "تم إضافة المورد بنجاح",
        description: "تم حفظ بيانات المورد الجديد",
      });
      setLocation(`/branch-app/${branchId}/suppliers`);
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة المورد",
        description: "حدث خطأ أثناء حفظ بيانات المورد",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم المورد",
        variant: "destructive"
      });
      return;
    }
    createSupplierMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation(`/branch-app/${branchId}/suppliers`)}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لقائمة الموردين
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة مورد جديد</h1>
          <p className="text-gray-600">إضافة مورد جديد لفرع {branchId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المورد *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ادخل اسم المورد"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">الشخص المسؤول</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="اسم الشخص المسؤول"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="رقم الهاتف"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="البريد الإلكتروني"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                الرقم الضريبي
              </Label>
              <Input
                id="taxNumber"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                placeholder="الرقم الضريبي للمورد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                العنوان
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="عنوان المورد"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="ملاحظات إضافية"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">مورد نشط</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={createSupplierMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createSupplierMutation.isPending ? 'جاري الحفظ...' : 'حفظ المورد'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setLocation(`/branch-app/${branchId}/suppliers`)}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}