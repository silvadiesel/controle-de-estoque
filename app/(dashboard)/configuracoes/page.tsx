/**
 * Página de Configurações - Gerenciamento de Categorias
 * ======================================================
 *
 * Esta página permite gerenciar as categorias de produtos.
 *
 * Conceitos demonstrados:
 * -----------------------
 * 1. Client Component ('use client') - necessário para usar hooks
 * 2. Custom Hook (useCategories) - lógica CRUD separada da UI
 * 3. Paginação inline com useMemo - cálculos otimizados
 * 4. Componente Pagination do shadcn para UI
 */
'use client';

import { useEffect, useMemo, useState } from 'react';

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
// Componente de UI do shadcn para exibir a paginação
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

// Custom hook para lógica CRUD de categorias
import { useCategories } from './_hooks';
import { Building2, Loader2, Pencil, Plus, Tags, Trash2 } from 'lucide-react';

// ============================================
// CONSTANTES
// ============================================

/** Quantidade de itens por página */
const ITEMS_PER_PAGE = 7;

export default function Configuracoes() {
  // ============================================
  // CUSTOM HOOK PARA CRUD
  // ============================================

  const {
    categories,
    isLoading,
    isSaving,
    error,
    setError,
    isAddOpen,
    setIsAddOpen,
    editingCategory,
    setEditingCategory,
    newCategoryName,
    setNewCategoryName,
    fetchCategories,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  } = useCategories();

  // ============================================
  // ESTADO DE PAGINAÇÃO (simples e direto)
  // ============================================

  const [currentPage, setCurrentPage] = useState(1);

  // ============================================
  // CÁLCULOS DE PAGINAÇÃO (otimizado com useMemo)
  // ============================================

  /**
   * Calcula a página atual válida derivativamente.
   * Se a página atual ficou inválida (ex: após deletar itens), ajusta automaticamente.
   * Isso evita chamar setState dentro de useEffect, prevenindo cascatas de renders.
   */
  const validCurrentPage = useMemo(() => {
    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    if (totalPages === 0) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [categories.length, currentPage]);

  /**
   * Calcula os dados de paginação baseados nas categorias atuais.
   * useMemo evita recalcular a cada render se as dependências não mudaram.
   */
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = categories.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    return {
      totalPages,
      paginatedItems,
      totalItems: categories.length,
      startItem: categories.length > 0 ? startIndex + 1 : 0,
      endItem: Math.min(startIndex + ITEMS_PER_PAGE, categories.length)
    };
  }, [categories, validCurrentPage]);

  /**
   * Gera os números das páginas para navegação.
   * Mostra no máximo 5 páginas para não poluir a UI.
   */
  const pageNumbers = useMemo(() => {
    const { totalPages } = paginationData;
    const pages: number[] = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, validCurrentPage - 2);
      let end = Math.min(totalPages, validCurrentPage + 2);

      if (validCurrentPage <= 3) end = maxButtons;
      if (validCurrentPage >= totalPages - 2)
        start = totalPages - maxButtons + 1;

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [validCurrentPage, paginationData]);

  // ============================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(validPage);
  };

  // ============================================
  // EFEITOS
  // ============================================

  /** Carrega as categorias quando o componente monta */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (id: number) => {
    await handleDeleteCategory(id);
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  const isFirstPage = validCurrentPage === 1;
  const isLastPage = validCurrentPage === paginationData.totalPages;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header da página */}
      <div>
        <h2 className='text-2xl font-bold text-foreground'>Configurações</h2>
        <p className='text-muted-foreground'>
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
          {error}
          <button
            onClick={() => setError(null)}
            className='ml-2 underline hover:no-underline'>
            Fechar
          </button>
        </div>
      )}

      <div className='grid gap-6'>
        {/* Card de Categorias */}
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

              {/* Dialog para adicionar */}
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
                {/* Tabela */}
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
                      {paginationData.paginatedItems.map((category) => (
                        <TableRow key={category.id} className='border-border'>
                          <TableCell className='text-muted-foreground'>
                            {category.id}
                          </TableCell>
                          <TableCell className='font-medium text-foreground'>
                            {category.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              {/* Dialog de edição */}
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

                              {/* Botão excluir */}
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleDelete(category.id)}>
                                <Trash2 className='h-4 w-4 text-destructive' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação - usa o componente shadcn para UI */}
                {paginationData.totalPages > 1 && (
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-4'>
                    <p className='text-sm text-muted-foreground'>
                      Mostrando {paginationData.startItem} a{' '}
                      {paginationData.endItem} de {paginationData.totalItems}{' '}
                      categorias
                    </p>

                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => goToPage(validCurrentPage - 1)}
                            className={
                              isFirstPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {pageNumbers.map((pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => goToPage(pageNum)}
                              isActive={pageNum === validCurrentPage}
                              className='cursor-pointer'>
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => goToPage(validCurrentPage + 1)}
                            className={
                              isLastPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Info */}
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
