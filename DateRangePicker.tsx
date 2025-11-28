import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export default function DateRangePicker({ onDateRangeChange, className = '' }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // تعيين التاريخ الحالي كافتراضي
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const handleApplyFilter = () => {
    const start = startDate || firstDayOfMonth;
    const end = endDate || today;
    onDateRangeChange(start, end);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange('', '');
  };

  const setQuickRange = (range: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let start: Date;
    let end = today;

    switch (range) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        start = today;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  return (
    <Card className={`bg-blue-600 text-white ${className}`} dir="rtl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-white">تحديد نطاق التاريخ</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* من تاريخ */}
          <div className="space-y-2">
            <Label className="text-white font-medium">من تاريخ:</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white text-black border-white"
              placeholder="اختر تاريخ البداية"
            />
          </div>

          {/* إلى تاريخ */}
          <div className="space-y-2">
            <Label className="text-white font-medium">إلى تاريخ:</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white text-black border-white"
              placeholder="اختر تاريخ النهاية"
            />
          </div>

          {/* أزرار سريعة */}
          <div className="space-y-2">
            <Label className="text-white font-medium">اختيار سريع:</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setQuickRange('today')}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-xs"
              >
                اليوم
              </Button>
              <Button
                onClick={() => setQuickRange('week')}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-xs"
              >
                أسبوع
              </Button>
              <Button
                onClick={() => setQuickRange('month')}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-xs"
              >
                شهر
              </Button>
            </div>
          </div>

          {/* أزرار التطبيق */}
          <div className="space-y-2">
            <Label className="text-white font-medium">تطبيق الفلتر:</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFilter}
                className="bg-white text-blue-600 hover:bg-blue-50"
                size="sm"
              >
                <Filter className="h-4 w-4 ml-1" />
                تطبيق
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>

        {/* عرض النطاق المحدد */}
        {(startDate || endDate) && (
          <div className="mt-4 p-3 bg-blue-700 rounded-lg">
            <p className="text-sm text-white">
              النطاق المحدد: {startDate || 'غير محدد'} إلى {endDate || 'غير محدد'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}