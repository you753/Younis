import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Check } from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchSelectorProps {
  selectedBranchId: number | null;
  onBranchChange: (branchId: number | null) => void;
  showMainBranch?: boolean;
}

export default function BranchSelector({ 
  selectedBranchId, 
  onBranchChange, 
  showMainBranch = true 
}: BranchSelectorProps) {
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches']
  });

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">الفرع الحالي:</span>
      </div>
      
      <Select
        value={selectedBranchId?.toString() || 'main'}
        onValueChange={(value) => {
          if (value === 'main') {
            onBranchChange(null);
          } else {
            onBranchChange(parseInt(value));
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="اختر فرع">
            <div className="flex items-center gap-2">
              {selectedBranchId === null ? (
                <>
                  <Building className="h-4 w-4" />
                  <span>الفرع الرئيسي</span>
                  <Badge variant="default" className="text-xs">رئيسي</Badge>
                </>
              ) : selectedBranch ? (
                <>
                  <Building className="h-4 w-4" />
                  <span>{selectedBranch.name}</span>
                  <Badge variant="outline" className="text-xs">{selectedBranch.code}</Badge>
                </>
              ) : (
                <span>اختر فرع</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showMainBranch && (
            <SelectItem value="main">
              <div className="flex items-center gap-2 w-full">
                <Building className="h-4 w-4" />
                <span>الفرع الرئيسي</span>
                <Badge variant="default" className="text-xs ml-auto">رئيسي</Badge>
                {selectedBranchId === null && <Check className="h-4 w-4 text-green-600" />}
              </div>
            </SelectItem>
          )}
          {branches
            .filter(branch => branch.isActive)
            .map((branch) => (
              <SelectItem key={branch.id} value={branch.id.toString()}>
                <div className="flex items-center gap-2 w-full">
                  <Building className="h-4 w-4" />
                  <span>{branch.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">{branch.code}</Badge>
                  {selectedBranchId === branch.id && <Check className="h-4 w-4 text-green-600" />}
                </div>
              </SelectItem>
            ))}
          {branches.length === 0 && !isLoading && (
            <SelectItem value="no-branches" disabled>
              <span className="text-gray-500">لا توجد فروع متاحة</span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {selectedBranch && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>•</span>
          <span>{selectedBranch.address || 'لا يوجد عنوان'}</span>
        </div>
      )}
    </div>
  );
}