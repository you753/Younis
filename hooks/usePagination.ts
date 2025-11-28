import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  resetTriggers?: any[];
}

interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageCount: number;
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
  resetTriggers = []
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, data.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [...resetTriggers]);

  useEffect(() => {
    if (data.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > pageCount && pageCount > 0) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount, data.length]);

  return {
    currentPage,
    setCurrentPage,
    pageCount,
    paginatedData,
    startIndex,
    endIndex
  };
}
