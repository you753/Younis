import { useState, useEffect } from 'react';

interface PermissionActions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

interface Permission {
  id: string;
  name: string;
  enabled: boolean;
  actions: PermissionActions;
}

interface Section {
  id: string;
  name: string;
  enabled: boolean;
  permissions: Permission[];
}

export function useBranchPermissions(branchId: number) {
  const [permissions, setPermissions] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = () => {
      const key = `branchPermissions_${branchId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPermissions(parsed);
        } catch (error) {
          console.error('خطأ في قراءة الصلاحيات:', error);
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
      
      setLoading(false);
    };

    loadPermissions();
  }, [branchId]);

  const isSectionEnabled = (sectionId: string): boolean => {
    const section = permissions.find(s => s.id === sectionId);
    return section ? section.enabled : true; // افتراضياً مفعل إذا لم توجد صلاحيات
  };

  const isPermissionEnabled = (sectionId: string, permissionId: string): boolean => {
    const section = permissions.find(s => s.id === sectionId);
    if (!section || !section.enabled) return false;
    
    const permission = section.permissions.find(p => p.id === permissionId);
    return permission ? permission.enabled : true;
  };

  const hasAction = (sectionId: string, permissionId: string, action: keyof PermissionActions): boolean => {
    const section = permissions.find(s => s.id === sectionId);
    if (!section || !section.enabled) return false;
    
    const permission = section.permissions.find(p => p.id === permissionId);
    if (!permission || !permission.enabled) return false;
    
    return permission.actions[action] || false;
  };

  return {
    permissions,
    loading,
    isSectionEnabled,
    isPermissionEnabled,
    hasAction
  };
}
