import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProtectedSectionProps {
  branchId: string | number;
  section: string;
  children: React.ReactNode;
}

interface BranchPermission {
  id: number;
  branch_id: number;
  section_name: string;
  is_enabled: boolean;
}

export default function ProtectedSection({ branchId, section, children }: ProtectedSectionProps) {
  const { data: permissions = [], isLoading } = useQuery<BranchPermission[]>({
    queryKey: [`/api/branches/${branchId}/permissions`],
  });

  // Show loading state to prevent transient access
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const permission = permissions.find(p => p.section_name === section);
  const isEnabled = permission?.is_enabled ?? true;

  if (!isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full p-8 text-center space-y-6">
          {/* Lock Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-full shadow-2xl">
                <Lock className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              تم إيقاف القسم
            </h2>
            <p className="text-gray-600 text-lg">
              من قبل النظام الرئيسي
            </p>
          </div>

          {/* Description */}
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4 shadow-lg">
            <p className="text-sm text-red-800">
              هذا القسم غير متاح حالياً. يرجى الاتصال بمدير النظام لتفعيله.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
