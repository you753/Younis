import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export function PaginationControls({
  currentPage,
  pageCount,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  itemName = 'عنصر'
}: PaginationControlsProps) {
  if (totalItems === 0 || pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t" data-testid="pagination-controls">
      <div className="text-sm text-gray-600" data-testid="pagination-info">
        عرض {startIndex} - {endIndex} من {totalItems} {itemName}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3"
          data-testid="pagination-previous"
        >
          السابق
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 font-semibold ${
                currentPage === page 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              data-testid={`pagination-page-${page}`}
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          className="px-3"
          data-testid="pagination-next"
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
