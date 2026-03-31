'use client';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
            <Button className='bg-primary hover:bg-primary/90'>
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
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Factory className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {fornecedores.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total de Fornecedores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-foreground'>
            Lista de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>
                    Fornecedor
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden md:table-cell'>
                    Contato
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden lg:table-cell'>
                    Data de Cadastro
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right'>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-24 text-center text-muted-foreground'>
                      <div className='flex items-center justify-center gap-2'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        Carregando fornecedores...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFornecedores.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFornecedores.map((fornecedor) => (
                    <TableRow key={fornecedor.id} className='border-border'>
                      <TableCell>
                        <div>
                          <p className='font-medium text-foreground'>
                            {fornecedor.name_empresa}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {fornecedor.cnpj}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Phone className='h-3 w-3' />
                            {fornecedor.telefone || '-'}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Mail className='h-3 w-3' />
                            {fornecedor.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        <span className='text-sm text-foreground'>
                          {fornecedor.createdAt
                            ? new Date(fornecedor.createdAt).toLocaleDateString(
                                'pt-BR'
                              )
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <ModalFornecedores
                            mode='edit'
                            data={editingFornecedor || {}}
                            setData={(data) =>
                              setEditingFornecedor(data as typeof fornecedor)
                            }
                            isOpen={editingFornecedor?.id === fornecedor.id}
                            setIsOpen={(open) =>
                              !open && setEditingFornecedor(null)
                            }
                            onSubmit={handleUpdateFornecedor}
                            isLoading={isLoading}
                            trigger={
                              <Button
                                variant='ghost'
                                size='icon'
                                aria-label={`Editar fornecedor ${fornecedor.name_empresa}`}
                                onClick={() =>
                                  setEditingFornecedor(fornecedor)
                                }>
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
                            onConfirm={() =>
                              handleDeleteFornecedor(fornecedor.id)
                            }
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
        </CardContent>
      </Card>
    </div>
  );
}
