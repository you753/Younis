import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Mic, FileText, TrendingUp, DollarSign } from 'lucide-react';

export default function VoiceNotes() {
  const { setCurrentPage } = useAppStore();
  const [totalNotes, setTotalNotes] = useState(0);
  const [todayNotes, setTodayNotes] = useState(0);

  useEffect(() => {
    setCurrentPage('المساعد الصوتي');
  }, [setCurrentPage]);

  const handleNoteAdded = () => {
    setTotalNotes(prev => prev + 1);
    setTodayNotes(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Volume2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">المساعد الصوتي للملاحظات المالية</h2>
            <p className="text-gray-600">سجل ملاحظاتك المالية صوتياً واحصل على تحليل ذكي فوري</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">إجمالي الملاحظات</p>
                <p className="text-2xl font-bold text-purple-700">{totalNotes}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">ملاحظات اليوم</p>
                <p className="text-2xl font-bold text-blue-700">{todayNotes}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Mic className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">ملاحظات مالية</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">مهام عاجلة</p>
                <p className="text-2xl font-bold text-orange-700">0</p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-right text-indigo-800">كيفية استخدام المساعد الصوتي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-indigo-700">
            <div className="space-y-3">
              <h4 className="font-semibold">خطوات التسجيل:</h4>
              <ul className="space-y-2 text-sm">
                <li>• اضغط على زر "بدء التسجيل"</li>
                <li>• تحدث بوضوح عن ملاحظتك المالية</li>
                <li>• اضغط "إيقاف التسجيل" عند الانتهاء</li>
                <li>• انتظر التحليل الذكي للمحتوى</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">أمثلة على الملاحظات:</h4>
              <ul className="space-y-2 text-sm">
                <li>• "بيع منتج A بمبلغ 1500 ريال للعميل أحمد"</li>
                <li>• "شراء مواد خام بقيمة 800 ريال من المورد سالم"</li>
                <li>• "تذكير: دفع فاتورة الكهرباء 450 ريال"</li>
                <li>• "مصروف وقود للشاحنة 200 ريال"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Assistant Component */}
      <VoiceAssistant onNoteAdded={handleNoteAdded} />
    </div>
  );
}