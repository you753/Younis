import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Settings, ShoppingCart, Package, Warehouse, Users, Truck, UsersRound, DollarSign } from 'lucide-react';

interface BranchPermissionsProps {
  branchId?: number;
}

interface BranchPermission {
  id: number;
  branch_id: number;
  section_name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const SECTION_CONFIG = {
  products: { label: 'الأصناف', icon: Package },
  sales: { label: 'المبيعات', icon: ShoppingCart },
  purchases: { label: 'المشتريات', icon: Truck },
  inventory: { label: 'المخزون', icon: Warehouse },
  clients: { label: 'العملاء', icon: Users },
  suppliers: { label: 'الموردين', icon: Truck },
  employees: { label: 'الموظفين', icon: UsersRound },
  expenses: { label: 'المصروفات اليومية', icon: DollarSign },
};

export default function BranchPermissions({ branchId }: BranchPermissionsProps) {
  const { toast } = useToast();
  
  if (!branchId) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl">
        <div className="text-lg text-red-500">خطأ: لم يتم تحديد الفرع</div>
      </div>
    );
  }

  const { data: permissions = [], isLoading } = useQuery<BranchPermission[]>({
    queryKey: [`/api/branches/${branchId}/permissions`],
  });

  const { data: branch } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ section, is_enabled }: { section: string; is_enabled: boolean }) => {
      return apiRequest('PUT', `/api/branches/${branchId}/permissions/${section}`, { is_enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/permissions`] });
      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث الصلاحيات بنجاح',
      });
    },
    onError: (error: any) => {
      console.error('Permission update error:', error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: error.message || 'فشل في تحديث الصلاحيات',
      });
    },
  });

  const handleToggle = (section: string, currentValue: boolean) => {
    updateMutation.mutate({ section, is_enabled: !currentValue });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الصلاحيات</h1>
          <p className="text-sm text-muted-foreground">
            {branch?.name || 'الفرع'}
          </p>
        </div>
      </div>

      {/* Permissions Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            <CardTitle>إعدادات الصلاحيات</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(SECTION_CONFIG).map(([key, config]) => {
              const permission = permissions.find(p => p.section_name === key);
              const isEnabled = permission?.is_enabled ?? true;
              const Icon = config.icon;

              return (
                <div 
                  key={key}
                  className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {isEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(key, isEnabled)}
                      disabled={updateMutation.isPending}
                      data-testid={`switch-${key}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
