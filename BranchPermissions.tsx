import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Building,
  Shield,
  Save,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Eye,
  Plus,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define permissions structure
interface Permission {
  id: string;
  name: string;
  enabled: boolean;
  actions?: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface Section {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  permissions: Permission[];
}

const defaultSections: Section[] = [
  {
    id: 'products',
    name: 'الأصناف',
    icon: Package,
    enabled: true,
    permissions: [
      {
        id: 'products-main',
        name: 'إدارة الأصناف',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'products-categories',
        name: 'فئات الأصناف',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'products-barcodes',
        name: 'الباركود',
        enabled: true,
        actions: { view: true, add: false, edit: false, delete: false }
      }
    ]
  },
  {
    id: 'sales',
    name: 'المبيعات',
    icon: ShoppingCart,
    enabled: true,
    permissions: [
      {
        id: 'sales-invoices',
        name: 'فواتير المبيعات',
        enabled: true,
        actions: { view: true, add: true, edit: false, delete: true }
      },
      {
        id: 'sales-returns',
        name: 'مرتجعات المبيعات',
        enabled: true,
        actions: { view: true, add: true, edit: false, delete: true }
      },
      {
        id: 'sales-quotes',
        name: 'عروض الأسعار',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      }
    ]
  },
  {
    id: 'purchases',
    name: 'المشتريات',
    icon: Truck,
    enabled: true,
    permissions: [
      {
        id: 'purchases-invoices',
        name: 'فواتير المشتريات',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'purchases-returns',
        name: 'مرتجعات المشتريات',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      }
    ]
  },
  {
    id: 'inventory',
    name: 'المخزون',
    icon: Package,
    enabled: true,
    permissions: [
      {
        id: 'inventory-status',
        name: 'حالة المخزون',
        enabled: true,
        actions: { view: true, add: false, edit: false, delete: false }
      },
      {
        id: 'inventory-movement',
        name: 'حركة المخزون',
        enabled: true,
        actions: { view: true, add: false, edit: false, delete: false }
      },
      {
        id: 'inventory-transfers',
        name: 'إرسال واستقبال المخزون',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      }
    ]
  },
  {
    id: 'clients',
    name: 'العملاء',
    icon: Users,
    enabled: true,
    permissions: [
      {
        id: 'clients-main',
        name: 'قائمة العملاء',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'clients-accounts',
        name: 'حسابات العملاء',
        enabled: true,
        actions: { view: true, add: false, edit: false, delete: false }
      }
    ]
  },
  {
    id: 'suppliers',
    name: 'الموردين',
    icon: Truck,
    enabled: true,
    permissions: [
      {
        id: 'suppliers-main',
        name: 'قائمة الموردين',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'suppliers-accounts',
        name: 'حسابات الموردين',
        enabled: true,
        actions: { view: true, add: false, edit: false, delete: false }
      }
    ]
  },
  {
    id: 'employees',
    name: 'الموظفين',
    icon: Users,
    enabled: true,
    permissions: [
      {
        id: 'employees-main',
        name: 'إدارة الموظفين',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'employees-salaries',
        name: 'الرواتب',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      },
      {
        id: 'employees-deductions',
        name: 'الخصومات والديون',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      }
    ]
  },
  {
    id: 'expenses',
    name: 'المصروفات اليومية',
    icon: Receipt,
    enabled: true,
    permissions: [
      {
        id: 'expenses-main',
        name: 'إدارة المصروفات',
        enabled: true,
        actions: { view: true, add: true, edit: true, delete: true }
      }
    ]
  }
];

export default function BranchPermissions() {
  const { toast } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [sections, setSections] = useState<Section[]>(defaultSections);

  // Fetch branches
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  // Load permissions from localStorage when branch is selected
  useEffect(() => {
    if (selectedBranchId) {
      const savedPermissions = localStorage.getItem(`branchPermissions_${selectedBranchId}`);
      if (savedPermissions) {
        try {
          const parsed = JSON.parse(savedPermissions);
          // Merge saved permissions with default sections to preserve icons
          const mergedSections = defaultSections.map(defaultSection => {
            const saved = parsed.find((s: Section) => s.id === defaultSection.id);
            if (saved) {
              return {
                ...defaultSection,
                enabled: saved.enabled,
                permissions: saved.permissions
              };
            }
            return defaultSection;
          });
          setSections(mergedSections);
        } catch (error) {
          console.error('خطأ في قراءة الصلاحيات:', error);
          setSections(defaultSections);
        }
      } else {
        setSections(defaultSections);
      }
    }
  }, [selectedBranchId]);

  // Toggle section enabled/disabled
  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  // Toggle permission enabled/disabled
  const togglePermission = (sectionId: string, permissionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            permissions: section.permissions.map(perm =>
              perm.id === permissionId
                ? { ...perm, enabled: !perm.enabled }
                : perm
            )
          }
        : section
    ));
  };

  // Toggle action (view, add, edit, delete)
  const toggleAction = (sectionId: string, permissionId: string, action: keyof NonNullable<Permission['actions']>) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            permissions: section.permissions.map(perm =>
              perm.id === permissionId && perm.actions
                ? { 
                    ...perm, 
                    actions: { 
                      ...perm.actions, 
                      [action]: !perm.actions[action] 
                    } 
                  }
                : perm
            )
          }
        : section
    ));
  };

  // Save permissions
  const savePermissions = () => {
    if (!selectedBranchId) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار فرع أولاً',
        variant: 'destructive'
      });
      return;
    }

    // Save only the necessary data (without icons which can't be serialized)
    const permissionsToSave = sections.map(section => ({
      id: section.id,
      name: section.name,
      enabled: section.enabled,
      permissions: section.permissions
    }));

    localStorage.setItem(`branchPermissions_${selectedBranchId}`, JSON.stringify(permissionsToSave));
    toast({
      title: '✓ تم الحفظ بنجاح',
      description: 'تم حفظ صلاحيات الفرع بنجاح',
    });
  };

  // Reset to defaults
  const resetPermissions = () => {
    setSections(defaultSections);
    toast({
      title: '✓ تم الاستعادة',
      description: 'تم استعادة الصلاحيات الافتراضية',
    });
  };

  const selectedBranch = branches.find(b => b.id.toString() === selectedBranchId);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            صلاحيات الفروع
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            التحكم الكامل بصلاحيات كل فرع والأقسام والأزرار
          </p>
        </div>
        <Building className="h-12 w-12 text-blue-600" />
      </div>

      {/* Branch Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            اختيار الفرع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label>اختر الفرع</Label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="mt-1" data-testid="select-branch-permissions">
                  <SelectValue placeholder="اختر الفرع..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBranch && (
              <div className="flex items-end gap-2">
                <Button
                  onClick={savePermissions}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-save-permissions"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الصلاحيات
                </Button>
                <Button
                  onClick={resetPermissions}
                  variant="outline"
                  data-testid="button-reset-permissions"
                >
                  <Settings className="h-4 w-4 ml-2" />
                  استعادة الافتراضي
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Configuration */}
      {selectedBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              إعدادات الصلاحيات - {selectedBranch.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full" defaultValue={sections.map(s => s.id)}>
              {sections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full ml-4">
                        <div className="flex items-center gap-3">
                          <SectionIcon className={cn(
                            "h-5 w-5",
                            section.enabled ? "text-blue-600" : "text-gray-400"
                          )} />
                          <span className={cn(
                            "font-semibold text-lg",
                            !section.enabled && "text-gray-400"
                          )}>
                            {section.name}
                          </span>
                        </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-sm">
                          {section.enabled ? 'مفعّل' : 'معطّل'}
                        </Label>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                          data-testid={`switch-section-${section.id}`}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {section.permissions.map((permission) => (
                        <Card key={permission.id} className={cn(
                          "border-2",
                          !section.enabled && "opacity-50",
                          permission.enabled ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-200"
                        )}>
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              {/* Permission Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{permission.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">
                                    {permission.enabled ? 'مفعّل' : 'معطّل'}
                                  </Label>
                                  <Switch
                                    checked={permission.enabled}
                                    onCheckedChange={() => togglePermission(section.id, permission.id)}
                                    disabled={!section.enabled}
                                    data-testid={`switch-permission-${permission.id}`}
                                  />
                                </div>
                              </div>

                              {/* Actions */}
                              {permission.actions && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                                  <div className={cn(
                                    "flex items-center justify-between p-2 rounded-lg",
                                    permission.actions.view ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <Eye className={cn(
                                        "h-4 w-4",
                                        permission.actions.view ? "text-green-600" : "text-gray-400"
                                      )} />
                                      <span className="text-sm font-medium">عرض</span>
                                    </div>
                                    <Switch
                                      checked={permission.actions.view}
                                      onCheckedChange={() => toggleAction(section.id, permission.id, 'view')}
                                      disabled={!section.enabled || !permission.enabled}
                                      data-testid={`switch-action-view-${permission.id}`}
                                    />
                                  </div>

                                  <div className={cn(
                                    "flex items-center justify-between p-2 rounded-lg",
                                    permission.actions.add ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <Plus className={cn(
                                        "h-4 w-4",
                                        permission.actions.add ? "text-blue-600" : "text-gray-400"
                                      )} />
                                      <span className="text-sm font-medium">إضافة</span>
                                    </div>
                                    <Switch
                                      checked={permission.actions.add}
                                      onCheckedChange={() => toggleAction(section.id, permission.id, 'add')}
                                      disabled={!section.enabled || !permission.enabled}
                                      data-testid={`switch-action-add-${permission.id}`}
                                    />
                                  </div>

                                  <div className={cn(
                                    "flex items-center justify-between p-2 rounded-lg",
                                    permission.actions.edit ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-gray-50 dark:bg-gray-800"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <Edit className={cn(
                                        "h-4 w-4",
                                        permission.actions.edit ? "text-yellow-600" : "text-gray-400"
                                      )} />
                                      <span className="text-sm font-medium">تعديل</span>
                                    </div>
                                    <Switch
                                      checked={permission.actions.edit}
                                      onCheckedChange={() => toggleAction(section.id, permission.id, 'edit')}
                                      disabled={!section.enabled || !permission.enabled}
                                      data-testid={`switch-action-edit-${permission.id}`}
                                    />
                                  </div>

                                  <div className={cn(
                                    "flex items-center justify-between p-2 rounded-lg",
                                    permission.actions.delete ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <Trash2 className={cn(
                                        "h-4 w-4",
                                        permission.actions.delete ? "text-red-600" : "text-gray-400"
                                      )} />
                                      <span className="text-sm font-medium">حذف</span>
                                    </div>
                                    <Switch
                                      checked={permission.actions.delete}
                                      onCheckedChange={() => toggleAction(section.id, permission.id, 'delete')}
                                      disabled={!section.enabled || !permission.enabled}
                                      data-testid={`switch-action-delete-${permission.id}`}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* No Branch Selected */}
      {!selectedBranchId && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                الرجاء اختيار فرع لإدارة الصلاحيات
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
