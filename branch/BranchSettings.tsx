import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface BranchSettingsProps {
  branchId?: number;
}

export default function BranchSettings({ branchId }: BranchSettingsProps) {
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الفرع</h1>
          <p className="text-gray-600">إدارة بيانات ومعلومات الفرع - رقم الفرع: {branchId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الفرع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الفرع
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="اسم الفرع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كود الفرع
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="كود الفرع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="عنوان الفرع"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="رقم الهاتف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المدير
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="مدير الفرع"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}