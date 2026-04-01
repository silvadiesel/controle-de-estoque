'use client';

import { useEffect } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { usePagination } from '@/hooks/usePagination';

import { CardPecas } from './_components/card-pecas';
import { ModalPecas } from './_components/modal-peças';
import { usePecas } from './_hook/usePecas';
import { PackageOpen, Plus, Search } from 'lucide-react';

export default function Products() {
  const {
    isLoading,
    search,
    setSearch,
    filteredProducts,
    isAddOpen,
    editingPeca,
    handleSubmit,
    handleEdit,
    handleDeletePeca,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    categoryFilter,
    setCategoryFilter,
    fornecedorFilter,
    setFornecedorFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    handleOpenChange,
    categoryOptions,
    supplierOptions
  } = usePecas();

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    pageItems,
    isFirstPage,
    isLastPage,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = usePagination({
    items: filteredProducts,
    itemsPerPage: 20
  });

  // Reset paginação quando filtros/search mudam
  useEffect(() => {
    goToPage(1);
  }, [search, categoryFilter, fornecedorFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryFilterOptions = [
    { value: 'all', label: 'Todas as categorias' },
    ...categoryOptions
  ];

  const supplierFilterOptions = [
    { value: 'all', label: 'Todos os fornecedores' },
    ...supplierOptions
  ];

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-xl font-semibold text-foreground'>Produtos</h1>
            <p className='text-sm text-muted-foreground'>Gerencie o estoque</p>
          </div>

          <ModalPecas
            mode={editingPeca ? 'edit' : 'create'}
            initialData={editingPeca ?? undefined}
            isOpen={isAddOpen}
            setIsOpen={handleOpenChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            categoryOptions={categoryOptions}
            supplierOptions={supplierOptions}
            trigger={
              <Button className='w-full sm:w-auto'>
                <Plus data-icon='inline-start' />
                Novo Produto
              </Button>
            }
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative w-full '>
            <Search className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Procurar por nome, código ou categoria...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10'
              aria-label='Buscar produto'
            />
          </div>

          <SearchableSelect
            options={categoryFilterOptions}
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            placeholder='Categoria'
            searchPlaceholder='Buscar categoria...'
            emptyText='Nenhuma categoria encontrada.'
            className='w-full sm:w-[200px]'
          />

          <SearchableSelect
            options={supplierFilterOptions}
            value={fornecedorFilter}
            onValueChange={setFornecedorFilter}
            placeholder='Fornecedor'
            searchPlaceholder='Buscar fornecedor...'
            emptyText='Nenhum fornecedor encontrado.'
            className='w-full sm:w-[200px]'
          />
        </div>
      </div>

      <div className='flex-1'>
        {isLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-[300px] bg-card rounded-lg border border-border animate-pulse'
              />
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          <Empty className='border-border bg-card'>
            <EmptyMedia variant='icon'>
              <PackageOpen />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nada encontrado</EmptyTitle>
              <EmptyDescription>
                Tente outra busca ou revise os filtros aplicados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3'>
            {paginatedItems.map((peca) => (
              <CardPecas
                key={peca.id}
                peca={peca}
                categoryName={getCategoryName(peca.categoria_id)}
                supplierName={getFornecedorName(peca.fornecedor_id)}
                formattedPrice={formatPrice(peca.preco)}
                onEdit={handleEdit}
                onDelete={(p) => {
                  setDeleteId(p.id);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        pageItems={pageItems}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        onPageChange={goToPage}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        itemLabel='produtos'
      />

      <ModalDelete
        isOpen={isDeleteOpen}
        setIsOpen={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => deleteId && handleDeletePeca(deleteId)}
        isLoading={isLoading}
        title='Excluir Produto'
        description='Esta ação não pode ser desfeita.'
      />
    </div>
  );
}
