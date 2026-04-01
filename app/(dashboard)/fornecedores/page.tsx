'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';
import { formatCNPJ, formatPhone } from '@/app/utils/formatters';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

import { ModalFornecedores } from './_components/modal-fornecedores';
import { ModalVincularPeca } from './_components/modal-vincular-peca';
import { useFornecedores, usePecasByFornecedor } from './_hooks';

import {
  ChevronDown, Factory, Mail, Package,
  Pencil, Phone, Plus, Search, Trash2, Unlink
} from 'lucide-react';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Fornecedores() {
  const {
    fornecedores, isLoading, isSaving: isSavingFornecedor,
    isAddOpen, setIsAddOpen,
    editingFornecedor, setEditingFornecedor,
    handleAddFornecedor, handleUpdateFornecedor, handleDeleteFornecedor,
    deleteId, setDeleteId,
    isDeleteOpen, setIsDeleteOpen
  } = useFornecedores();

  const {
    pecasByFornecedor, allPecas, isInitialLoading,
    isSaving: isSavingPeca,
    isVincularOpen, setIsVincularOpen,
    activeFornecedorIdForVincular, setActiveFornecedorIdForVincular,
    fetchPecasByFornecedor,
    handleVincular, handleDesvincular,
    getTotalPecas, isLoadingFornecedor
  } = usePecasByFornecedor();

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isDesktop, setIsDesktop] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_BREAKPOINT);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const filteredFornecedores = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    if (!q) return fornecedores;
    return fornecedores.filter((f) =>
      f.name_empresa.toLowerCase().includes(q) ||
      f.cnpj.includes(q) ||
      (f.telefone && f.telefone.includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q))
    );
  }, [fornecedores, deferredSearch]);

  const {
    paginatedItems: paginatedFornecedores,
    currentPage, totalPages, totalItems,
    startItem, endItem, pageItems,
    isFirstPage, isLastPage,
    goToPage, goToNextPage, goToPreviousPage
  } = usePagination({ items: filteredFornecedores, itemsPerPage: 10 });

  const handleToggleFornecedor = (id: number) => {
    const isExpanded = expandedIds.has(id);
    setExpandedIds((prev) => {
      const next = isDesktop ? new Set(prev) : new Set<number>();
      if (isExpanded) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (!isExpanded) void fetchPecasByFornecedor(id);
  };

  const ativos = fornecedores.filter((f) => f.status).length;
  const inativos = fornecedores.length - ativos;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold text-foreground'>Fornecedores</h1>
          <p className='text-sm text-muted-foreground'>
            Gerencie fornecedores e as peças que cada um fornece.
          </p>
        </div>

        <ModalFornecedores
          mode='create'
          initialData={undefined}
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          onSubmit={handleAddFornecedor}
          isLoading={isSavingFornecedor}
          trigger={
            <Button className='w-full sm:w-auto'>
              <Plus data-icon='inline-start' />
              Novo fornecedor
            </Button>
          }
        />
      </div>

      {/* StatCards */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard label='Total' value={fornecedores.length} subtitle='Fornecedores cadastrados' icon={Factory} isLoading={isLoading} />
        <StatCard label='Ativos' value={ativos} subtitle='Fornecedores ativos' icon={Factory} isLoading={isLoading} />
        <StatCard label='Inativos' value={inativos} subtitle='Fornecedores inativos' icon={Factory} isLoading={isLoading} />
        <StatCard label='Peças vinculadas' value={getTotalPecas()} subtitle='Peças associadas a fornecedores' icon={Package} isLoading={isInitialLoading} />
      </div>

      {/* Search */}
      <Card className='gap-0 overflow-hidden border-border bg-card shadow-none'>
        <CardHeader className='gap-4 pb-0!'>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-base font-semibold'>Base de fornecedores</CardTitle>
            <p className='text-sm text-muted-foreground'>Busque por nome, CNPJ, telefone ou email.</p>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar fornecedor...'
              className='pl-10 bg-input border-border'
            />
          </div>
        </CardHeader>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className='flex flex-col gap-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='rounded-xl border border-border bg-card px-5 py-4'>
              <div className='flex items-center gap-4'>
                <Skeleton className='size-11 rounded-lg' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-56' />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : totalItems === 0 ? (
        <Empty className='border-border bg-muted/20'>
          <EmptyMedia variant='icon'><Factory /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Nenhum fornecedor encontrado</EmptyTitle>
            <EmptyDescription>Ajuste a busca ou cadastre um novo fornecedor.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='flex flex-col gap-3'>
          {paginatedFornecedores.map((fornecedor) => {
            const isExpanded = expandedIds.has(fornecedor.id);
            const pecas = pecasByFornecedor.get(fornecedor.id) ?? [];
            const pecaCount = pecas.length;
            const isLoadingPecas = isLoadingFornecedor(fornecedor.id);
            const pecasDisponiveis = allPecas.filter((p) => p.fornecedor_id === null);

            return (
              <Collapsible key={fornecedor.id} open={isExpanded}>
                <div className='overflow-hidden rounded-xl border border-border bg-card'>
                  <div className='flex items-start gap-4 px-5 py-4'>
                    {/* Toggle area */}
                    <button
                      type='button'
                      onClick={() => handleToggleFornecedor(fornecedor.id)}
                      className='group flex min-w-0 flex-1 items-start gap-4 text-left outline-none transition-colors hover:text-foreground focus-visible:text-foreground'>
                      {/* Avatar iniciais */}
                      <div className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-sm font-semibold text-primary transition-colors group-hover:border-border-hover'>
                        {getInitials(fornecedor.name_empresa)}
                      </div>

                      <div className='flex min-w-0 flex-1 flex-col gap-2'>
                        <div className='flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between'>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-foreground'>
                              {fornecedor.name_empresa}
                            </p>
                            <p className='mt-0.5 truncate text-sm text-muted-foreground'>
                              {fornecedor.cnpj ? formatCNPJ(fornecedor.cnpj) : '—'}
                            </p>
                          </div>

                          <div className='flex shrink-0 items-center gap-2'>
                            <Badge
                              variant='outline'
                              className={fornecedor.status
                                ? 'border-success/20 bg-success/10 text-success'
                                : 'border-destructive/20 bg-destructive/10 text-destructive'
                              }>
                              {fornecedor.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant='outline' className='border-border bg-background text-muted-foreground'>
                              {pecaCount} {pecaCount === 1 ? 'peça' : 'peças'}
                            </Badge>
                            <ChevronDown
                              className={cn(
                                'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
                                isExpanded && 'rotate-180 text-foreground'
                              )}
                            />
                          </div>
                        </div>

                        {/* Contato */}
                        <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                          {fornecedor.telefone ? (
                            <span className='inline-flex items-center gap-1.5'>
                              <Phone className='size-3.5' />
                              {formatPhone(fornecedor.telefone)}
                            </span>
                          ) : null}
                          {fornecedor.email ? (
                            <span className='inline-flex items-center gap-1.5'>
                              <Mail className='size-3.5' />
                              {fornecedor.email}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>

                    {/* Ações */}
                    <div className='flex shrink-0 items-center gap-1'>
                      <ModalFornecedores
                        mode='edit'
                        initialData={editingFornecedor || undefined}
                        isOpen={editingFornecedor?.id === fornecedor.id}
                        setIsOpen={(open) => !open && setEditingFornecedor(null)}
                        onSubmit={(data) => handleUpdateFornecedor(fornecedor.id, data)}
                        isLoading={isSavingFornecedor}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Editar ${fornecedor.name_empresa}`}
                            onClick={(e) => { e.stopPropagation(); setEditingFornecedor(fornecedor); }}>
                            <Pencil />
                          </Button>
                        }
                      />

                      <ModalDelete
                        isOpen={isDeleteOpen && deleteId === fornecedor.id}
                        setIsOpen={(open) => { setIsDeleteOpen(open); if (!open) setDeleteId(null); }}
                        onConfirm={() => handleDeleteFornecedor(fornecedor.id)}
                        isLoading={isSavingFornecedor}
                        title='Excluir fornecedor'
                        description={`Tem certeza que deseja excluir "${fornecedor.name_empresa}"? Esta ação não pode ser desfeita.`}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Excluir ${fornecedor.name_empresa}`}
                            onClick={(e) => { e.stopPropagation(); setDeleteId(fornecedor.id); setIsDeleteOpen(true); }}>
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Collapsible — Peças */}
                  <CollapsibleContent className='overflow-hidden border-t border-border bg-background/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-200'>
                    <div className='px-5 py-4'>
                      <div className='mb-3 flex items-center justify-between'>
                        <div>
                          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Peças do fornecedor</p>
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {pecaCount} {pecaCount === 1 ? 'peça vinculada' : 'peças vinculadas'}
                          </p>
                        </div>

                        <ModalVincularPeca
                          isOpen={isVincularOpen && activeFornecedorIdForVincular === fornecedor.id}
                          setIsOpen={(open) => {
                            setIsVincularOpen(open);
                            if (!open) setActiveFornecedorIdForVincular(null);
                          }}
                          pecasDisponiveis={pecasDisponiveis}
                          onVincular={(pecaId) => handleVincular(fornecedor.id, pecaId)}
                          isLoading={isSavingPeca}
                          trigger={
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setActiveFornecedorIdForVincular(fornecedor.id)}>
                              <Plus data-icon='inline-start' />
                              Vincular peça
                            </Button>
                          }
                        />
                      </div>

                      {isLoadingPecas || (isInitialLoading && pecas.length === 0) ? (
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className='flex items-center justify-between rounded-lg border border-border bg-card p-3'>
                              <div className='flex items-center gap-3'>
                                <Skeleton className='size-9 rounded-md' />
                                <div className='flex flex-col gap-2'>
                                  <Skeleton className='h-3.5 w-20' />
                                  <Skeleton className='h-3 w-28' />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : pecas.length === 0 ? (
                        <Empty className='border-border bg-card py-8'>
                          <EmptyMedia variant='icon'><Package /></EmptyMedia>
                          <EmptyHeader>
                            <EmptyTitle>Nenhuma peça vinculada</EmptyTitle>
                            <EmptyDescription>Vincule peças para registrar quais itens este fornecedor provê.</EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          {pecas.map((peca) => (
                            <div key={peca.id} className='flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors'>
                              <div className='flex min-w-0 items-center gap-3'>
                                <div className='flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-primary'>
                                  <Package className='size-4' />
                                </div>
                                <div className='min-w-0'>
                                  <p className='text-sm font-semibold text-foreground'>{peca.name_peca}</p>
                                  <p className='truncate text-sm text-muted-foreground'>
                                    {peca.codigo} · {formatCurrency(peca.preco)}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label={`Desvincular ${peca.name_peca}`}
                                onClick={() => handleDesvincular(fornecedor.id, peca.id)}>
                                <Unlink />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      <PaginationControls
        currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
        startItem={startItem} endItem={endItem} pageItems={pageItems}
        isFirstPage={isFirstPage} isLastPage={isLastPage}
        onPageChange={goToPage} onNextPage={goToNextPage} onPreviousPage={goToPreviousPage}
        itemLabel='fornecedores'
      />
    </div>
  );
}
