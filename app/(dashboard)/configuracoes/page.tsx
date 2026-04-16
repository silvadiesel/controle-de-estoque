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
import { useCategories, useEmpresa, useUsers } from './_hooks';
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
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

  // Empresa Hook
  const {
    empresa,
    isLoading: isLoadingEmpresa,
    isSaving: isSavingEmpresa,
    isRegenerating: isRegeneratingCodigo,
    formData: empresaForm,
    updateField: updateEmpresaField,
    fetchEmpresa,
    handleUpdateEmpresa,
    handleRegenerateCodigo
  } = useEmpresa();

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
    fetchEmpresa();
  }, [fetchCategories, fetchUsers, fetchEmpresa]);

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
          <TabsTrigger
            value='empresa'
            className='  flex bg-muted  text-muted-foreground data-[state=active]:border-primary/70! data-[state=active]:bg-muted!'>
            <Building2 className='h-4 w-4' />
            Dados Cadastrais
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações Gerais */}
        <TabsContent value='general'>
          {/* Categories - single card with list rows */}
          <Card className='bg-card border-border flex flex-col'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-foreground flex items-center gap-2'>
                    <Tags className='h-5 w-5 text-primary' />
                    Categorias das Peças
                  </CardTitle>
                  <CardDescription className='text-muted-foreground'>
                    Gerencie as categorias das peças disponíveis
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
                        Crie uma nova categoria para organizar suas peças
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

        {/* Tab: Dados Cadastrais */}
        <TabsContent value='empresa'>
          <Card className='bg-card border-border mt-4'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <Building2 className='h-5 w-5 text-primary' />
                Dados Cadastrais da Empresa
              </CardTitle>
              <CardDescription className='text-muted-foreground'>
                Informações da empresa dona deste sistema. O código de
                verificação é usado por novos funcionários ao se cadastrarem.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {isLoadingEmpresa ? (
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : !empresa ? (
                <div className='text-center py-12 text-muted-foreground'>
                  <Building2 className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Empresa não cadastrada</p>
                  <p className='text-sm'>
                    Rode o script <code>pnpm db:seed:empresa</code> para criar
                    o registro inicial.
                  </p>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2 md:col-span-2'>
                      <Label
                        htmlFor='empresa-nome'
                        className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>
                        Nome Fantasia
                      </Label>
                      <Input
                        id='empresa-nome'
                        value={empresaForm.nomeFantasia}
                        onChange={(e) =>
                          updateEmpresaField('nomeFantasia', e.target.value)
                        }
                        className='bg-input border-border'
                        placeholder='Ex: Silva Diesel'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor='empresa-cnpj'
                        className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>
                        CNPJ
                      </Label>
                      <Input
                        id='empresa-cnpj'
                        value={empresaForm.cnpj}
                        onChange={(e) =>
                          updateEmpresaField('cnpj', e.target.value)
                        }
                        className='bg-input border-border'
                        placeholder='00.000.000/0000-00'
                      />
                    </div>

                    <div className='grid grid-cols-[1fr_auto] gap-2 items-end'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='empresa-cidade'
                          className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>
                          Cidade
                        </Label>
                        <Input
                          id='empresa-cidade'
                          value={empresaForm.cidade}
                          onChange={(e) =>
                            updateEmpresaField('cidade', e.target.value)
                          }
                          className='bg-input border-border'
                        />
                      </div>
                      <div className='space-y-2 w-20'>
                        <Label
                          htmlFor='empresa-estado'
                          className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>
                          UF
                        </Label>
                        <Input
                          id='empresa-estado'
                          value={empresaForm.estado}
                          onChange={(e) =>
                            updateEmpresaField(
                              'estado',
                              e.target.value.toUpperCase()
                            )
                          }
                          maxLength={2}
                          className='bg-input border-border uppercase'
                        />
                      </div>
                    </div>

                    <div className='space-y-2 md:col-span-2'>
                      <Label
                        htmlFor='empresa-codigo'
                        className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>
                        Código de Verificação
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='empresa-codigo'
                          value={empresaForm.codigoVerificacao}
                          onChange={(e) =>
                            updateEmpresaField(
                              'codigoVerificacao',
                              e.target.value.replace(/\D/g, '').slice(0, 4)
                            )
                          }
                          maxLength={4}
                          className='bg-input border-border font-mono tracking-widest max-w-[160px] text-lg'
                          placeholder='1234'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          onClick={handleRegenerateCodigo}
                          disabled={isRegeneratingCodigo || isSavingEmpresa}>
                          {isRegeneratingCodigo ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className='h-4 w-4 mr-2' />
                              Regenerar
                            </>
                          )}
                        </Button>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        4 dígitos numéricos. Compartilhe com novos funcionários
                        para que possam se cadastrar.
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-end border-t border-border pt-4'>
                    <Button
                      onClick={handleUpdateEmpresa}
                      className='bg-primary text-primary-foreground hover:bg-primary/90'
                      disabled={isSavingEmpresa || isRegeneratingCodigo}>
                      {isSavingEmpresa ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
