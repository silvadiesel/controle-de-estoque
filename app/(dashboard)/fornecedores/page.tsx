'use client';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';

import { ModalFornecedores } from './_components/modal-fornecedores';
import { useFornecedores } from './_hook/useFornecedores';
import {
  Factory,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2
} from 'lucide-react';

export default function Fornecedores() {
  const {
    fornecedores,
    isLoading,
    search,
    setSearch,
    filteredFornecedores,
    isAddOpen,
    setIsAddOpen,
    editingFornecedor,
    setEditingFornecedor,
    newFornecedor,
    setNewFornecedor,
    handleAddFornecedor,
    handleUpdateFornecedor,
    handleDeleteFornecedor,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  } = useFornecedores();

  const {
    paginatedItems: paginatedFornecedores,
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
  } = usePagination({ items: filteredFornecedores, itemsPerPage: 7 });

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <div className='h-7 w-1 rounded-full bg-primary' />
            <h1 className='text-2xl font-bold text-foreground'>Fornecedores</h1>
          </div>
          <p className='pl-3.5 text-sm text-muted-foreground'>
            Gerencie os fornecedores de peças
          </p>
        </div>
        <ModalFornecedores
          mode='create'
          data={newFornecedor}
          setData={setNewFornecedor}
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          onSubmit={handleAddFornecedor}
          isLoading={isLoading}
          trigger={
            <Button>
              <Plus className='h-4 w-4' />
              Novo Fornecedor
            </Button>
          }
        />
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Buscar por nome, CNPJ ou contato...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-10 bg-input border-border'
        />
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='bg-secondary border border-border rounded-lg px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12'>
              <Factory className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {fornecedores.length}
              </p>
              <p className='text-sm text-muted-foreground'>Total de Fornecedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Card List */}
      <div className='flex flex-col gap-2'>
        {isLoading ? (
          <div className='flex items-center justify-center py-16 text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Loader2 className='h-5 w-5 animate-spin' />
              Carregando fornecedores...
            </div>
          </div>
        ) : filteredFornecedores.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <Factory className='h-8 w-8 mb-2 opacity-25' />
            <p className='text-sm'>Nenhum fornecedor encontrado</p>
          </div>
        ) : (
          paginatedFornecedores.map((fornecedor) => (
            <div
              key={fornecedor.id}
              className='bg-secondary border border-border rounded-lg p-4'>
              <div className='flex items-center gap-4'>
                {/* Avatar */}
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12'>
                  <Factory className='h-5 w-5 text-primary' />
                </div>

                {/* Name + CNPJ */}
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-foreground truncate'>
                    {fornecedor.name_empresa}
                  </p>
                  <p className='text-sm text-muted-foreground'>{fornecedor.cnpj}</p>
                </div>

                {/* Contact */}
                <div className='hidden md:flex items-center gap-4'>
                  <div className='flex items-center gap-1.5 text-sm text-primary font-medium'>
                    <Phone className='h-3.5 w-3.5' />
                    {fornecedor.telefone || '-'}
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-primary font-medium'>
                    <Mail className='h-3.5 w-3.5' />
                    {fornecedor.email || '-'}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-1'>
                  <ModalFornecedores
                    mode='edit'
                    data={editingFornecedor || {}}
                    setData={(data) =>
                      setEditingFornecedor(data as typeof fornecedor)
                    }
                    isOpen={editingFornecedor?.id === fornecedor.id}
                    setIsOpen={(open) => !open && setEditingFornecedor(null)}
                    onSubmit={handleUpdateFornecedor}
                    isLoading={isLoading}
                    trigger={
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={`Editar fornecedor ${fornecedor.name_empresa}`}
                        onClick={() => setEditingFornecedor(fornecedor)}>
                        <Pencil className='h-4 w-4 text-muted-foreground' />
                      </Button>
                    }
                  />
                  <ModalDelete
                    isOpen={isDeleteOpen && deleteId === fornecedor.id}
                    setIsOpen={(open) => {
                      setIsDeleteOpen(open);
                      if (!open) setDeleteId(null);
                    }}
                    onConfirm={() => handleDeleteFornecedor(fornecedor.id)}
                    isLoading={isLoading}
                    title='Excluir Fornecedor'
                    description={`Tem certeza que deseja excluir o fornecedor "${fornecedor.name_empresa}"? Esta ação não pode ser desfeita.`}
                    trigger={
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={`Excluir fornecedor ${fornecedor.name_empresa}`}
                        onClick={() => {
                          setDeleteId(fornecedor.id);
                          setIsDeleteOpen(true);
                        }}>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Mobile contact info */}
              <div className='flex md:hidden items-center gap-4 mt-3 pt-3 border-t border-border'>
                <div className='flex items-center gap-1.5 text-sm text-primary font-medium'>
                  <Phone className='h-3.5 w-3.5' />
                  {fornecedor.telefone || '-'}
                </div>
                <div className='flex items-center gap-1.5 text-sm text-primary font-medium'>
                  <Mail className='h-3.5 w-3.5' />
                  {fornecedor.email || '-'}
                </div>
              </div>
            </div>
          ))
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
        itemLabel='fornecedores'
      />
    </div>
  );
}
