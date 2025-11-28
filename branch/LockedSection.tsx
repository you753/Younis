import { Lock, AlertCircle, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LockedSectionProps {
  sectionName: string;
  message?: string;
  onSettingsClick?: () => void;
}

export default function LockedSection({ 
  sectionName, 
  message = 'تم تعطيل هذا القسم من قبل المسؤول',
  onSettingsClick 
}: LockedSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-red-200">
        <CardContent className="p-12 text-center">
          {/* أيقونة القفل الكبيرة */}
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-full shadow-xl">
              <Lock className="h-24 w-24 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* العنوان */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {sectionName}
          </h1>

          {/* الرسالة */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="text-right flex-1">
                <p className="text-lg text-red-800 font-semibold mb-2">
                  الوصول محظور
                </p>
                <p className="text-red-700">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              للوصول إلى هذا القسم، يرجى التواصل مع المسؤول لتفعيل الصلاحيات المناسبة من قسم
              <span className="font-bold text-blue-600 mx-1">صلاحيات الفروع</span>
              في النظام الرئيسي.
            </p>
          </div>

          {/* زر الإعدادات (اختياري) */}
          {onSettingsClick && (
            <Button
              onClick={onSettingsClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Settings className="h-5 w-5 ml-2" />
              إعدادات الصلاحيات
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
