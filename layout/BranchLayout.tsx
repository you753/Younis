import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import BranchTopBar from './BranchTopBar';
import { Card } from '@/components/ui/card';
import { Building, AlertCircle } from 'lucide-react';
import type { Branch } from '@shared/schema';

interface BranchLayoutProps {
  branchId: number;
  children: ReactNode;
  title?: string;
}

export default function BranchLayout({ branchId, children, title }: BranchLayoutProps) {
  const { data: branch, isLoading, error } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchId}`]
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الفرع...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل الفرع</h2>
          <p className="text-gray-600">لم يتم العثور على الفرع المطلوب أو حدث خطأ في التحميل</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* الشريط العلوي للفرع */}
      <div className="sticky top-0 z-50">
        <BranchTopBar branchId={branchId} />
      </div>
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto">
        {/* هيدر الصفحة */}
        {title && (
          <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>الفرع:</span>
                  <span className="font-medium text-green-700">{branch.name}</span>
                  <span className="text-gray-400">({branch.code})</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* محتوى الصفحة */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}