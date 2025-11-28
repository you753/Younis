import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onClear: () => void;
}

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 text-blue-700 font-semibold">
        <Calendar className="h-5 w-5" />
        <span>الفترة الزمنية:</span>
      </div>
      <div className="flex flex-col md:flex-row gap-3 flex-1">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">من تاريخ:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="flex-1"
            data-testid="input-date-from"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">إلى تاريخ:</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="flex-1"
            data-testid="input-date-to"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="outline"
            onClick={onClear}
            className="whitespace-nowrap"
            data-testid="button-clear-dates"
          >
            مسح التاريخ
          </Button>
        )}
      </div>
    </div>
  );
}

export function formatDateRange(dateFrom: string, dateTo: string): string {
  if (dateFrom && dateTo) {
    return `الفترة من ${new Date(dateFrom).toLocaleDateString('en-GB')} إلى ${new Date(dateTo).toLocaleDateString('en-GB')}`;
  } else if (dateFrom) {
    return `من تاريخ ${new Date(dateFrom).toLocaleDateString('en-GB')}`;
  } else if (dateTo) {
    return `حتى تاريخ ${new Date(dateTo).toLocaleDateString('en-GB')}`;
  }
  return 'جميع الفترات';
}

export function filterByDateRange<T extends { date?: string; createdAt?: string; saleDate?: string; purchaseDate?: string; paymentDate?: string }>(
  items: T[],
  dateFrom: string,
  dateTo: string
): T[] {
  let filtered = items;

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date || item.saleDate || item.purchaseDate || item.paymentDate || item.createdAt || '');
      return itemDate >= fromDate;
    });
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date || item.saleDate || item.purchaseDate || item.paymentDate || item.createdAt || '');
      return itemDate <= toDate;
    });
  }

  return filtered;
}
