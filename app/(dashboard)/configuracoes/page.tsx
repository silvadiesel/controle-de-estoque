'use client';

import { useEffect } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/usePagination';

import { ModalUsuarios } from './_components/modal-usuarios';
import { useCategories, useUsers } from './_hooks';
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings,
  Tags,
  Trash2,
  Users
} from 'lucide-react';

export default function Configuracoes() {
  // Categories Hook
  const {
    categories,
    isLoading: isLoadingCategories,
    isSaving: isSavingCategory,
    isDeleting: isDeletingCategory,
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

  // Users Hook
  const {
    users,
    isLoading: isLoadingUsers,
    isSaving: isSavingUser,
    isDeleting: isDeletingUser,
    search,
    setSearch,
    filteredUsers,
    editingUser,
    setEditingUser,
    deletingUserId,
    setDeletingUserId,
    fetchUsers,
    handleUpdateUser,
    handleDeleteUser
  } = useUsers();

  // Pagination for categories
  const {
    paginatedItems: paginatedCategories,
    totalPages: totalPagesCategories,
    totalItems: totalItemsCategories,
    startItem: startItemCategories,
    endItem: endItemCategories,
    isFirstPage: isFirstPageCategories,
    isLastPage: isLastPageCategories,
    currentPage: currentPageCategories,
    pageItems: pageItemsCategories,
    goToPage: goToPageCategories,
    goToNextPage: goToNextPageCategories,
    goToPreviousPage: goToPreviousPageCategories
  } = usePagination({ items: categories, itemsPerPage: 7 });

  // Pagination for users
  const {
    paginatedItems: paginatedUsers,
    totalPages: totalPagesUsers,
    totalItems: totalItemsUsers,
    startItem: startItemUsers,
    endItem: endItemUsers,
    isFirstPage: isFirstPageUsers,
    isLastPage: isLastPageUsers,
    currentPage: currentPageUsers,
    pageItems: pageItemsUsers,
    goToPage: goToPageUsers,
    goToNextPage: goToNextPageUsers,
    goToPreviousPage: goToPreviousPageUsers
  } = usePagination({ items: filteredUsers, itemsPerPage: 10 });

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, [fetchCategories, fetchUsers]);

  const getCargoLabel = (cargo: string) => {
    switch (cargo) {
      case 'admin':
        return 'Administrador';
      case 'estoquista':
        return 'Estoquista';
      case 'atendente':
        return 'Atendente';
      default:
        return cargo;
    }
  };

  const getCargoVariant = (cargo: string) => {
    switch (cargo) {
      case 'admin':
        return 'default';
      case 'estoquista':
        return 'secondary';
      case 'atendente':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      <div>
        <h2 className='text-2xl font-bold text-foreground'>Configurações</h2>
        <p className='text-muted-foreground'>
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      <Tabs defaultValue='general' className='w-full'>
        <TabsList>
          <TabsTrigger
            value='general'
            className='gap-2 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground'>
            <Settings className='h-4 w-4' />
            Configurações Gerais
          </TabsTrigger>
          <TabsTrigger
            value='users'
            className='gap-2 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground'>
            <Users className='h-4 w-4' />
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações Gerais */}
        <TabsContent value='general'>
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
                            if (e.key === 'Enter' && !isSavingCategory) {
                              handleAddCategory();
                            }
                          }}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant='secondary'
                          onClick={() => setIsAddOpen(false)}
                          disabled={isSavingCategory}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddCategory}
                          className='bg-primary hover:bg-primary/90'
                          disabled={isSavingCategory}>
                          {isSavingCategory ? (
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
                {isLoadingCategories ? (
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
                          {paginatedCategories.map((category) => (
                            <TableRow
                              key={category.id}
                              className='border-border'>
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
                                              if (
                                                e.key === 'Enter' &&
                                                !isSavingCategory
                                              ) {
                                                handleUpdateCategory();
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant='outline'
                                          onClick={() =>
                                            setEditingCategory(null)
                                          }
                                          disabled={isSavingCategory}>
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={handleUpdateCategory}
                                          className='bg-primary hover:bg-primary/90'
                                          disabled={isSavingCategory}>
                                          {isSavingCategory ? (
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
                                    isLoading={isDeletingCategory}
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
                      currentPage={currentPageCategories}
                      totalPages={totalPagesCategories}
                      totalItems={totalItemsCategories}
                      startItem={startItemCategories}
                      endItem={endItemCategories}
                      pageItems={pageItemsCategories}
                      isFirstPage={isFirstPageCategories}
                      isLastPage={isLastPageCategories}
                      onPageChange={goToPageCategories}
                      onNextPage={goToNextPageCategories}
                      onPreviousPage={goToPreviousPageCategories}
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
                <CardDescription>
                  Configure os dados da sua oficina
                </CardDescription>
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
        </TabsContent>

        {/* Tab: Usuários */}
        <TabsContent value='users'>
          <Card className='bg-card border-border'>
            <CardHeader>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <CardTitle className='text-foreground flex items-center gap-2'>
                    <Users className='h-5 w-5 text-primary' />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie os usuários do sistema e suas permissões
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Search */}
              <div className='relative max-w-md'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nome ou email...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-10 bg-input border-border'
                />
              </div>

              {/* Users Table */}
              {isLoadingUsers ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : users.length === 0 ? (
                <div className='text-center py-12 text-muted-foreground'>
                  <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhum usuário cadastrado</p>
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  <div className='rounded-lg border border-border overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='border-border hover:bg-transparent'>
                          <TableHead className='text-muted-foreground'>
                            Nome
                          </TableHead>
                          <TableHead className='text-muted-foreground'>
                            Email
                          </TableHead>
                          <TableHead className='text-muted-foreground'>
                            Cargo
                          </TableHead>
                          <TableHead className='text-muted-foreground'>
                            Status
                          </TableHead>
                          <TableHead className='text-muted-foreground text-right'>
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow key={user.id} className='border-border'>
                            <TableCell className='font-medium text-foreground'>
                              {user.name}
                            </TableCell>
                            <TableCell className='text-muted-foreground'>
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getCargoVariant(user.cargo) as
                                    | 'default'
                                    | 'secondary'
                                    | 'outline'
                                    | 'destructive'
                                }>
                                {getCargoLabel(user.cargo)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.status ? 'default' : 'destructive'
                                }
                                className={
                                  user.status
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : ''
                                }>
                                {user.status ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <ModalUsuarios
                                  data={editingUser}
                                  setData={setEditingUser}
                                  isOpen={editingUser?.id === user.id}
                                  setIsOpen={(open) =>
                                    !open && setEditingUser(null)
                                  }
                                  onSubmit={handleUpdateUser}
                                  isLoading={isSavingUser}
                                  trigger={
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => setEditingUser(user)}>
                                      <Pencil className='h-4 w-4 text-muted-foreground' />
                                    </Button>
                                  }
                                />

                                <ModalDelete
                                  isOpen={deletingUserId === user.id}
                                  setIsOpen={(open) =>
                                    setDeletingUserId(open ? user.id : null)
                                  }
                                  onConfirm={handleDeleteUser}
                                  isLoading={isDeletingUser}
                                  title='Excluir Usuário'
                                  description={`Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita e removerá todas as sessões e contas associadas.`}
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
                    currentPage={currentPageUsers}
                    totalPages={totalPagesUsers}
                    totalItems={totalItemsUsers}
                    startItem={startItemUsers}
                    endItem={endItemUsers}
                    pageItems={pageItemsUsers}
                    isFirstPage={isFirstPageUsers}
                    isLastPage={isLastPageUsers}
                    onPageChange={goToPageUsers}
                    onNextPage={goToNextPageUsers}
                    onPreviousPage={goToPreviousPageUsers}
                    itemLabel='usuários'
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
