import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  Plus, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface BranchPermissionsSettingsProps {
  branchId?: number;
}

interface Permission {
  sectionId: string;
  subsectionId: string | null;
  isEnabled: boolean;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function BranchPermissionsSettings({ branchId }: BranchPermissionsSettingsProps) {
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [localPermissions, setLocalPermissions] = useState<Record<string, Permission>>({});

  // جلب الصلاحيات الحالية
  const { data: permissions = [], isLoading } = useQuery<Permission[]>({
    queryKey: [`/api/branches/${branchId}/permissions`],
    enabled: !!branchId,
  });

  // تحديث الصلاحيات المحلية عند تحميل البيانات
  useState(() => {
    const permissionsMap: Record<string, Permission> = {};
    permissions.forEach(p => {
      const key = `${p.sectionId}-${p.subsectionId || ''}`;
      permissionsMap[key] = p;
    });
    setLocalPermissions(permissionsMap);
  });

  // حفظ الصلاحيات
  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      const permissionsArray = Object.values(localPermissions);
      return apiRequest(`/api/branches/${branchId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permissions: permissionsArray }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/branches/${branchId}/permissions`] });
      toast({
        title: "تم حفظ الإعدادات بنجاح ✅",
        description: "تم تحديث صلاحيات الفرع",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  // قائمة جميع الأقسام (نفس القائمة من StandaloneBranchSystem)
  const sections = [
    { 
      id: 'suppliers', 
      name: 'الموردين',
      subsections: [
        { id: 'suppliers-management', name: 'إدارة الموردين' },
        { id: 'suppliers-statement', name: 'كشف حساب جديد' },
        { id: 'suppliers-payments', name: 'سندات الصرف' }
      ]
    },
    { 
      id: 'clients', 
      name: 'العملاء',
      subsections: [
        { id: 'clients-management', name: 'إدارة العملاء' },
        { id: 'clients-statement', name: 'كشف حساب جديد' },
        { id: 'clients-receipts', name: 'سندات القبض' }
      ]
    },
    { 
      id: 'products', 
      name: 'الأصناف',
      subsections: [
        { id: 'products-list', name: 'قائمة الأصناف' },
        { id: 'products-categories', name: 'فئات الأصناف' },
        { id: 'products-barcode', name: 'الباركود' }
      ]
    },
    { 
      id: 'purchases', 
      name: 'المشتريات',
      subsections: [
        { id: 'purchases-invoices', name: 'فواتير المشتريات' },
        { id: 'goods-receipt', name: 'سندات إدخال البضاعة' },
        { id: 'purchases-returns', name: 'مرتجعات المشتريات' }
      ]
    },
    { 
      id: 'sales', 
      name: 'المبيعات',
      subsections: [
        { id: 'sales-invoices', name: 'فواتير المبيعات' },
        { id: 'sales-quotes', name: 'عروض الأسعار' },
        { id: 'sales-returns', name: 'مرتجعات المبيعات' },
        { id: 'goods-issue', name: 'سند إخراج بضاعة' },
        { id: 'sales-receipt-vouchers', name: 'سندات قبض المبيعات' }
      ]
    },
    { 
      id: 'inventory', 
      name: 'المخزون',
      subsections: [
        { id: 'new-inventory-status', name: 'حالة المخزون' },
        { id: 'inventory-count', name: 'جرد المخزون' },
        { id: 'new-branch-transfers', name: 'تحويل المخزون' }
      ]
    },
    { 
      id: 'employees', 
      name: 'الموظفين',
      subsections: [
        { id: 'employees-management', name: 'إدارة الموظفين' },
        { id: 'employee-statement', name: 'كشف حساب الموظف' },
        { id: 'employees-debts', name: 'الديون' },
        { id: 'employees-salaries', name: 'الرواتب' },
        { id: 'deductions-list', name: 'قائمة الخصومات' }
      ]
    },
    { 
      id: 'daily-expenses', 
      name: 'المصروفات اليومية',
      subsections: [
        { id: 'daily-expenses-management', name: 'إدارة المصروفات' }
      ]
    },
  ];

  // دالة التوسع
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // دالة تحديث الصلاحية
  const updatePermission = (
    sectionId: string,
    subsectionId: string | null,
    field: keyof Permission,
    value: boolean
  ) => {
    const key = `${sectionId}-${subsectionId || ''}`;
    setLocalPermissions(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {
          sectionId,
          subsectionId,
          isEnabled: true,
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
        }),
        [field]: value,
      },
    }));
  };

  // دالة الحصول على صلاحية
  const getPermission = (sectionId: string, subsectionId: string | null): Permission => {
    const key = `${sectionId}-${subsectionId || ''}`;
    return localPermissions[key] || {
      sectionId,
      subsectionId,
      isEnabled: true,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* العنوان */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إعدادات الصلاحيات</h1>
              <p className="text-sm text-gray-600">التحكم في صلاحيات الأقسام للفرع</p>
            </div>
          </div>
          <Button 
            onClick={() => savePermissionsMutation.mutate()}
            disabled={savePermissionsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-save-permissions"
          >
            {savePermissionsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 ml-2" />
            )}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* قائمة الأقسام */}
      <div className="space-y-4">
        {sections.map(section => {
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <Card key={section.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
                data-testid={`section-header-${section.id}`}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    {section.name}
                  </CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-3">
                  {section.subsections.map(subsection => {
                    const perm = getPermission(section.id, subsection.id);
                    
                    return (
                      <div 
                        key={subsection.id} 
                        className="border rounded-lg p-4 bg-gray-50"
                        data-testid={`subsection-${subsection.id}`}
                      >
                        {/* اسم القسم الفرعي */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{subsection.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">مفعّل</span>
                            <Switch
                              checked={perm.isEnabled}
                              onCheckedChange={(checked) =>
                                updatePermission(section.id, subsection.id, 'isEnabled', checked)
                              }
                              data-testid={`switch-enabled-${subsection.id}`}
                            />
                          </div>
                        </div>

                        {/* الصلاحيات */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 p-2 rounded bg-white">
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">عرض</span>
                            <Switch
                              checked={perm.canView}
                              disabled={!perm.isEnabled}
                              onCheckedChange={(checked) =>
                                updatePermission(section.id, subsection.id, 'canView', checked)
                              }
                              data-testid={`switch-view-${subsection.id}`}
                            />
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded bg-white">
                            <Plus className="h-4 w-4 text-green-600" />
                            <span className="text-sm">إضافة</span>
                            <Switch
                              checked={perm.canAdd}
                              disabled={!perm.isEnabled}
                              onCheckedChange={(checked) =>
                                updatePermission(section.id, subsection.id, 'canAdd', checked)
                              }
                              data-testid={`switch-add-${subsection.id}`}
                            />
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded bg-white">
                            <Edit className="h-4 w-4 text-amber-600" />
                            <span className="text-sm">تعديل</span>
                            <Switch
                              checked={perm.canEdit}
                              disabled={!perm.isEnabled}
                              onCheckedChange={(checked) =>
                                updatePermission(section.id, subsection.id, 'canEdit', checked)
                              }
                              data-testid={`switch-edit-${subsection.id}`}
                            />
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded bg-white">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-sm">حذف</span>
                            <Switch
                              checked={perm.canDelete}
                              disabled={!perm.isEnabled}
                              onCheckedChange={(checked) =>
                                updatePermission(section.id, subsection.id, 'canDelete', checked)
                              }
                              data-testid={`switch-delete-${subsection.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
