import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function SearchBox({ 
  placeholder = "ابحث في المبيعات، العملاء، المبلغ...", 
  value, 
  onChange, 
  onClear,
  className = ""
}: SearchBoxProps) {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          dir="rtl"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => {
              onChange('');
              onClear?.();
            }}
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
}