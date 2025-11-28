import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Settings, ChevronDown, Check } from 'lucide-react';
import type { Branch } from '@shared/schema';
import BranchPermissions from '@/pages/branch/BranchPermissions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BranchPermissionsMain() {
  const { setCurrentPage } = useAppStore();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage('إعدادات الصلاحيات');
  }, [setCurrentPage]);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches']
  });

  // اختيار أول فرع تلقائياً
  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

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

  if (branches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">إعدادات الصلاحيات</h2>
          <p className="text-gray-600">إدارة صلاحيات الأقسام لجميع الفروع</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فروع</h3>
            <p className="text-gray-500">لم يتم إنشاء أي فروع بعد</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إعدادات الصلاحيات</h2>
            <p className="text-gray-600">إدارة صلاحيات الأقسام لجميع الفروع</p>
          </div>
        </div>

        {/* قائمة اختيار الفرع */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-600" />
                <span>{selectedBranch?.name || 'اختر فرعاً'}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className="cursor-pointer"
              >
                <Building className="h-4 w-4 ml-2 text-green-600" />
                <span className="flex-1">{branch.name}</span>
                {selectedBranchId === branch.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* عرض الصلاحيات للفرع المحدد */}
      {selectedBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              إعدادات صلاحيات {selectedBranch.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BranchPermissions branchId={selectedBranch.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
