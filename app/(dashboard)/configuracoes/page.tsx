'use client';

import { useEffect } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { usePagination } from '@/hooks/usePagination';

import { useCategories } from './_hooks';
import { Building2, Loader2, Pencil, Plus, Tags, Trash2 } from 'lucide-react';

export default function Configuracoes() {
  const {
    categories,
    isLoading,
    isSaving,
    isDeleting,
    isAddOpen,
    setIsAddOpen,
    editingCategory,
    setEditingCategory,
    deletingCategoryId,
    setDeletingCategoryId,
    newCategoryName,
    setNewCategoryName,
    fetchCategories,
    handleAddCategory,
    handleUpdateCategory,
    confirmDeleteCategory
  } = useCategories();

  const {
    paginatedItems,
    totalPages,
    totalItems,
    startItem,
    endItem,
    isFirstPage,
    isLastPage,
    currentPage,
    pageItems,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = usePagination({ items: categories, itemsPerPage: 7 });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      <div>
        <h2 className='text-2xl font-bold text-foreground'>Configurações</h2>
        <p className='text-muted-foreground'>
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      <div className='grid gap-6'>
        <Card className='bg-card border-border h-150 flex flex-col'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <Tags className='h-5 w-5 text-primary' />
                  Categorias dos Produtos
                </CardTitle>
                <CardDescription>
                  Gerencie as categorias dos produtos disponíveis
                </CardDescription>
              </div>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className='bg-primary hover:bg-primary/90'>
                    <Plus className='h-4 w-4 mr-2' />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className='bg-card border-border'>
                  <DialogHeader>
                    <DialogTitle className='text-foreground'>
                      Adicionar Categoria
                    </DialogTitle>
                    <DialogDescription>
                      Crie uma nova categoria para organizar seus produtos
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-2'>
                    <Label htmlFor='cat-name'>Nome da Categoria</Label>
                    <Input
                      id='cat-name'
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder='Ex: Pneus'
                      className='bg-input border-border'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSaving) {
                          handleAddCategory();
                        }
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant='secondary'
                      onClick={() => setIsAddOpen(false)}
                      disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddCategory}
                      className='bg-primary hover:bg-primary/90'
                      disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Salvando...
                        </>
                      ) : (
                        'Adicionar'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className='flex flex-col flex-1'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : categories.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Tags className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Nenhuma categoria cadastrada</p>
                <p className='text-sm'>
                  Clique em{' '}
                  <span className='font-semibold'>Nova Categoria</span> para
                  começar
                </p>
              </div>
            ) : (
              <div className='flex flex-col flex-1 justify-between'>
                <div className='rounded-lg border border-border overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='border-border hover:bg-transparent'>
                        <TableHead className='text-muted-foreground'>
                          ID
                        </TableHead>
                        <TableHead className='text-muted-foreground'>
                          Nome
                        </TableHead>
                        <TableHead className='text-muted-foreground text-right'>
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((category) => (
                        <TableRow key={category.id} className='border-border'>
                          <TableCell className='text-muted-foreground'>
                            {category.id}
                          </TableCell>
                          <TableCell className='font-medium text-foreground'>
                            {category.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Dialog
                                open={editingCategory?.id === category.id}
                                onOpenChange={(open) =>
                                  !open && setEditingCategory(null)
                                }>
                                <DialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() =>
                                      setEditingCategory(category)
                                    }>
                                    <Pencil className='h-4 w-4 text-muted-foreground' />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className='bg-card border-border'>
                                  <DialogHeader>
                                    <DialogTitle className='text-foreground'>
                                      Editar Categoria
                                    </DialogTitle>
                                    <DialogDescription>
                                      Altere os dados da categoria
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className='space-y-4 py-4'>
                                    <div className='space-y-2'>
                                      <Label htmlFor='edit-cat-name'>
                                        Nome da Categoria
                                      </Label>
                                      <Input
                                        id='edit-cat-name'
                                        value={editingCategory?.name || ''}
                                        onChange={(e) =>
                                          setEditingCategory((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  name: e.target.value
                                                }
                                              : null
                                          )
                                        }
                                        className='bg-input border-border'
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !isSaving) {
                                            handleUpdateCategory();
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant='outline'
                                      onClick={() => setEditingCategory(null)}
                                      disabled={isSaving}>
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={handleUpdateCategory}
                                      className='bg-primary hover:bg-primary/90'
                                      disabled={isSaving}>
                                      {isSaving ? (
                                        <>
                                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                          Salvando...
                                        </>
                                      ) : (
                                        'Salvar'
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <ModalDelete
                                isOpen={deletingCategoryId === category.id}
                                setIsOpen={(open) =>
                                  setDeletingCategoryId(
                                    open ? category.id : null
                                  )
                                }
                                onConfirm={confirmDeleteCategory}
                                isLoading={isDeleting}
                                title='Excluir Categoria'
                                description={`Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`}
                                trigger={
                                  <Button variant='ghost' size='icon'>
                                    <Trash2 className='h-4 w-4 text-destructive' />
                                  </Button>
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  itemLabel='categorias'
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Building2 className='h-5 w-5 text-primary' />
              Informações da Empresa
            </CardTitle>
            <CardDescription>Configure os dados da sua oficina</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='company'>Nome da Empresa</Label>
                <Input
                  id='company'
                  defaultValue='Oficina de Caminhões Silva'
                  className='bg-input border-border'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='cnpj'>CNPJ</Label>
                <Input
                  id='cnpj'
                  defaultValue='12.345.678/0001-90'
                  className='bg-input border-border'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Endereço</Label>
              <Input
                id='address'
                defaultValue='Av. das Indústrias, 1234 - Distrito Industrial'
                className='bg-input border-border'
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
