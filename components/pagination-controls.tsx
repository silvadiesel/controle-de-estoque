'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from './ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[];
  isFirstPage: boolean;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  itemLabel?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  pageItems,
  isFirstPage,
  isLastPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  itemLabel = 'itens'
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='mt-4 flex flex-col items-center justify-center gap-3'>
      <p className='text-center text-sm text-muted-foreground'>
        {endItem - startItem + 1} de {totalItems} {itemLabel}
      </p>

      <Pagination className='mx-0 w-auto justify-center'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPreviousPage}
              className={isFirstPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pageItems.map((item) =>
            typeof item === 'number' ? (
              <PaginationItem key={item}>
                <PaginationLink
                  onClick={() => onPageChange(item)}
                  isActive={item === currentPage}
                  className='cursor-pointer'
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={onNextPage}
              className={isLastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
