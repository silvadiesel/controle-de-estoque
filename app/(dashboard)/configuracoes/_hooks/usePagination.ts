'use client';

import { useMemo, useState } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  totalItems: number;
  startItem: number;
  endItem: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[];
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function usePagination<T>({
  items,
  itemsPerPage = 7
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const validCurrentPage = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (totalPages === 0) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [items.length, currentPage, itemsPerPage]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

    return {
      totalPages,
      paginatedItems,
      totalItems: items.length,
      startItem: items.length > 0 ? startIndex + 1 : 0,
      endItem: Math.min(startIndex + itemsPerPage, items.length)
    };
  }, [items, validCurrentPage, itemsPerPage]);

  const pageItems = useMemo(() => {
    const { totalPages } = paginationData;
    const result: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    result.push(1);

    if (validCurrentPage <= 3) {
      result.push(2, 3);
      result.push('ellipsis-end');
    } else if (validCurrentPage >= totalPages - 2) {
      result.push('ellipsis-start');
      result.push(totalPages - 2, totalPages - 1);
    } else {
      result.push('ellipsis-start');
      result.push(validCurrentPage - 1, validCurrentPage, validCurrentPage + 1);
      result.push('ellipsis-end');
    }

    result.push(totalPages);
    return result;
  }, [validCurrentPage, paginationData]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(validPage);
  };

  const goToNextPage = () => goToPage(validCurrentPage + 1);
  const goToPreviousPage = () => goToPage(validCurrentPage - 1);

  return {
    currentPage: validCurrentPage,
    totalPages: paginationData.totalPages,
    paginatedItems: paginationData.paginatedItems,
    totalItems: paginationData.totalItems,
    startItem: paginationData.startItem,
    endItem: paginationData.endItem,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === paginationData.totalPages,
    pageItems,
    goToPage,
    goToNextPage,
    goToPreviousPage
  };
}
