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
    <div className='flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-4'>
      <p className='text-[12px] text-[#52525b] text-center sm:text-left'>
        Mostrando {startItem} a {endItem} de {totalItems} {itemLabel}
      </p>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPreviousPage}
              className={`bg-[#18181b] border border-[#27272a] text-[#71717a] h-8 rounded-[6px] ${
                isFirstPage
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }`}
            />
          </PaginationItem>

          {pageItems.map((item) =>
            typeof item === 'number' ? (
              <PaginationItem key={item}>
                <PaginationLink
                  onClick={() => onPageChange(item)}
                  isActive={item === currentPage}
                  className={`cursor-pointer ${
                    item === currentPage
                      ? 'bg-[#5b7fa5] text-[#09090B] font-semibold border-none h-8 w-8 rounded-[6px]'
                      : 'bg-[#18181b] border border-[#27272a] text-[#71717a] h-8 w-8 rounded-[6px]'
                  }`}>
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
              className={`bg-[#18181b] border border-[#27272a] text-[#71717a] h-8 rounded-[6px] ${
                isLastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
