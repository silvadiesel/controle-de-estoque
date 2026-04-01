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
  } = usePagination({ items: categories, itemsPerPage: 10 });

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
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-foreground'>Configurações</h1>
        <p className='text-sm text-muted-foreground'>
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      <Tabs defaultValue='general' className='w-full gap-0'>
        <TabsList className='h-11 w-full gap-2! bg-transparent! flex p-0'>
          <TabsTrigger
            value='general'
            className='  flex bg-muted  text-muted-foreground data-[state=active]:border-primary/70! data-[state=active]:bg-muted!'>
            <Settings className='h-4 w-4' />
            Configurações Gerais
          </TabsTrigger>
          <TabsTrigger
            value='users'
            className='  flex bg-muted  text-muted-foreground data-[state=active]:border-primary/70! data-[state=active]:bg-muted!'>
            <Users className='h-4 w-4' />
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações Gerais */}
        <TabsContent value='general'>
          <div className='grid gap-6 mt-4'>
            {/* Categories - single card with list rows */}
            <Card className='bg-card border-border flex flex-col'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-foreground flex items-center gap-2'>
                      <Tags className='h-5 w-5 text-primary' />
                      Categorias dos Produtos
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Gerencie as categorias dos produtos disponíveis
                    </CardDescription>
                  </div>

                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
                        <Plus className='h-4 w-4 mr-2' />
                        Nova Categoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-card border-border max-w-[540px]'>
                      <DialogHeader>
                        <DialogTitle className='text-foreground'>
                          Adicionar Categoria
                        </DialogTitle>
                        <DialogDescription className='text-muted-foreground'>
                          Crie uma nova categoria para organizar seus produtos
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='cat-name'
                          className='text-muted-foreground'>
                          Nome da Categoria
                        </Label>
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
                          className='bg-primary text-primary-foreground hover:bg-primary/90'
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
                    {/* List rows instead of table */}
                    <div className='rounded-lg border border-border overflow-hidden divide-y divide-border'>
                      {paginatedCategories.map((category) => (
                        <div
                          key={category.id}
                          className='flex items-center justify-between px-4 py-3 hover:bg-input transition-colors'>
                          <div className='flex items-center gap-3'>
                            <span className='text-xs text-muted-foreground w-8'>
                              #{category.id}
                            </span>
                            <span className='font-medium text-foreground'>
                              {category.name}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Dialog
                              open={editingCategory?.id === category.id}
                              onOpenChange={(open) =>
                                !open && setEditingCategory(null)
                              }>
                              <DialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  aria-label={`Editar categoria ${category.name}`}
                                  onClick={() => setEditingCategory(category)}>
                                  <Pencil className='h-4 w-4 text-muted-foreground' />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='bg-card border-border max-w-[540px]'>
                                <DialogHeader>
                                  <DialogTitle className='text-foreground'>
                                    Editar Categoria
                                  </DialogTitle>
                                  <DialogDescription className='text-muted-foreground'>
                                    Altere os dados da categoria
                                  </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4 py-4'>
                                  <div className='space-y-2'>
                                    <Label
                                      htmlFor='edit-cat-name'
                                      className='text-muted-foreground'>
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
                                    onClick={() => setEditingCategory(null)}
                                    disabled={isSavingCategory}>
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleUpdateCategory}
                                    className='bg-primary text-primary-foreground hover:bg-primary/90'
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
                                setDeletingCategoryId(open ? category.id : null)
                              }
                              onConfirm={confirmDeleteCategory}
                              isLoading={isDeletingCategory}
                              title='Excluir Categoria'
                              description={`Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`}
                              trigger={
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  aria-label={`Excluir categoria ${category.name}`}>
                                  <Trash2 className='h-4 w-4 text-destructive' />
                                </Button>
                              }
                            />
                          </div>
                        </div>
                      ))}
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

            {/* Company section - disabled with opacity */}
            <Card className='bg-card border-border opacity-40'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-foreground flex items-center gap-2'>
                      <Building2 className='h-5 w-5 text-primary' />
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Configure os dados da sua oficina
                    </CardDescription>
                  </div>
                  <Badge
                    variant='outline'
                    className='text-muted-foreground border-border'>
                    Em breve
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='company' className='text-muted-foreground'>
                      Nome da Empresa
                    </Label>
                    <Input
                      id='company'
                      defaultValue='Oficina de Caminhões Silva'
                      className='bg-input border-border'
                      disabled
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='cnpj' className='text-muted-foreground'>
                      CNPJ
                    </Label>
                    <Input
                      id='cnpj'
                      defaultValue='12.345.678/0001-90'
                      className='bg-input border-border'
                      disabled
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='address' className='text-muted-foreground'>
                    Endereço
                  </Label>
                  <Input
                    id='address'
                    defaultValue='Av. das Indústrias, 1234 - Distrito Industrial'
                    className='bg-input border-border'
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Usuários */}
        <TabsContent value='users'>
          <Card className='bg-card border-border mt-4'>
            <CardHeader>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <CardTitle className='text-foreground flex items-center gap-2'>
                    <Users className='h-5 w-5 text-primary' />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription className='text-muted-foreground'>
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

              {/* Users list */}
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
                  <div className='rounded-lg border border-border overflow-hidden divide-y divide-border'>
                    {paginatedUsers.map((user) => (
                      <div
                        key={user.id}
                        className='flex items-center justify-between px-4 py-3 hover:bg-input transition-colors'>
                        <div className='flex items-center gap-4 flex-1 min-w-0'>
                          {/* Avatar */}
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-border text-xs font-bold text-muted-foreground shrink-0'>
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-foreground text-sm'>
                              {user.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {user.email}
                            </p>
                          </div>
                          <div className='flex items-center gap-2 shrink-0'>
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
                            <Badge
                              variant={user.status ? 'default' : 'destructive'}
                              className={
                                user.status
                                  ? 'bg-success/10 text-success border-success/20'
                                  : ''
                              }>
                              {user.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <div className='flex items-center gap-1 ml-4'>
                          <ModalUsuarios
                            data={editingUser}
                            setData={setEditingUser}
                            isOpen={editingUser?.id === user.id}
                            setIsOpen={(open) => !open && setEditingUser(null)}
                            onSubmit={handleUpdateUser}
                            isLoading={isSavingUser}
                            trigger={
                              <Button
                                variant='ghost'
                                size='icon'
                                aria-label={`Editar usuário ${user.name}`}
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
                              <Button
                                variant='ghost'
                                size='icon'
                                aria-label={`Excluir usuário ${user.name}`}>
                                <Trash2 className='h-4 w-4 text-destructive' />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}
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
