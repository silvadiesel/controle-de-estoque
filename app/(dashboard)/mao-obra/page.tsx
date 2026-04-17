'use client';

import { useDeferredValue, useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { usePagination } from '@/hooks/usePagination';
import { useUser } from '@/hooks/useUser';

import { ModalMaoObra } from './_components/modal-mao-obra';
import { useMaoObra } from './_hooks/useMaoObra';
import {
  HardHat,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Wrench
} from 'lucide-react';

const formatCurrency = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

export default function MaoObraPage() {
  const {
    itens,
    stats,
    isLoading,
    isSaving,
    isAddOpen,
    setIsAddOpen,
    editingItem,
    setEditingItem,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem
  } = useMaoObra();

  const { hasPermission } = useUser();
  const canManage = hasPermission('manage_mao_obra');

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const filteredItens = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    if (!term) return itens;
    return itens.filter(
      (item) =>
        item.nome.toLowerCase().includes(term) ||
        (item.descricao?.toLowerCase().includes(term) ?? false)
    );
  }, [deferredSearch, itens]);

  const metrics = useMemo(() => {
    return { total: itens.length };
  }, [itens]);

  const pagination = usePagination({ items: filteredItens, itemsPerPage: 10 });

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold text-foreground'>Mão de Obra</h1>
          <p className='text-sm text-muted-foreground'>
            Cadastre serviços reutilizáveis para usar nas ordens de serviço.
          </p>
        </div>

        {canManage ? (
          <ModalMaoObra
            mode='create'
            isOpen={isAddOpen}
            setIsOpen={setIsAddOpen}
            onSubmit={handleAddItem}
            isLoading={isSaving}
            trigger={
              <Button className='w-full sm:w-auto'>
                <Plus data-icon='inline-start' />
                Nova mão de obra
              </Button>
            }
          />
        ) : null}
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <StatCard
          label='Cadastradas'
          value={metrics.total}
          subtitle='Itens disponíveis no catálogo'
          icon={HardHat}
          isLoading={isLoading}
        />
        <StatCard
          label='Faturamento do mês'
          value={formatCurrency(stats.faturamento_mes)}
          subtitle='Mão de obra aplicada nas ordens deste mês'
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      <Card className='gap-0 overflow-hidden border-border bg-card shadow-none'>
        <CardHeader className='gap-4 pb-0!'>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-base font-semibold'>
              Catálogo de mão de obra
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Busque por nome ou descrição.
            </p>
          </div>
          <div className='relative'>
            <Search className='pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por nome ou descrição...'
              aria-label='Buscar mão de obra'
              className='pl-10 bg-input border-border'
            />
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className='flex flex-col gap-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='rounded-xl border border-border bg-card px-5 py-4'>
              <div className='flex items-center gap-4'>
                <Skeleton className='size-10 rounded-lg' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-3 w-64' />
                </div>
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          ))}
        </div>
      ) : pagination.paginatedItems.length === 0 ? (
        <Empty className='border-border bg-card'>
          <EmptyMedia variant='icon'>
            <HardHat />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {itens.length === 0
                ? 'Nenhuma mão de obra cadastrada'
                : 'Nenhum resultado para a busca'}
            </EmptyTitle>
            <EmptyDescription>
              {itens.length === 0
                ? 'Cadastre a primeira mão de obra para reutilizar nas ordens de serviço.'
                : 'Ajuste a busca para encontrar um serviço cadastrado.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='flex flex-col gap-3'>
          {pagination.paginatedItems.map((item) => (
            <div
              key={item.id}
              className='rounded-xl border border-border bg-card px-5 py-4'>
              <div className='flex items-start gap-4'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-primary'>
                  <Wrench className='size-4' />
                </div>

                <div className='flex min-w-0 flex-1 flex-col justify-center gap-1'>
                  <p className='truncate text-sm font-semibold text-foreground'>
                    {item.nome}
                  </p>
                  {item.descricao ? (
                    <p className='truncate text-sm text-muted-foreground'>
                      {item.descricao}
                    </p>
                  ) : null}
                </div>

                <div className='flex shrink-0 items-center gap-3'>
                  <span className='min-w-24 text-right text-sm font-semibold text-foreground'>
                    {formatCurrency(item.valor)}
                  </span>

                  {canManage ? (
                    <div className='flex items-center gap-1'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Editar ${item.nome}`}
                            onClick={() => setEditingItem(item)}>
                            <Pencil />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Excluir ${item.nome}`}
                            onClick={() => {
                              setDeleteId(item.id);
                              setIsDeleteOpen(true);
                            }}>
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={filteredItens.length}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        pageItems={pagination.pageItems}
        isFirstPage={pagination.isFirstPage}
        isLastPage={pagination.isLastPage}
        onPageChange={pagination.goToPage}
        onNextPage={pagination.goToNextPage}
        onPreviousPage={pagination.goToPreviousPage}
        itemLabel='mãos de obra'
      />

      {canManage && editingItem ? (
        <ModalMaoObra
          mode='edit'
          initialData={editingItem}
          isOpen={Boolean(editingItem)}
          setIsOpen={(open) => !open && setEditingItem(null)}
          onSubmit={(data) => handleUpdateItem(editingItem.id, data)}
          isLoading={isSaving}
        />
      ) : null}

      {canManage && deleteId ? (
        <ModalDelete
          isOpen={isDeleteOpen}
          setIsOpen={(open) => {
            setIsDeleteOpen(open);
            if (!open) setDeleteId(null);
          }}
          onConfirm={() => handleDeleteItem(deleteId)}
          isLoading={isSaving}
          title='Excluir mão de obra'
          description='Tem certeza que deseja excluir esta mão de obra? Se ela estiver em uso em alguma ordem, a exclusão será bloqueada.'
        />
      ) : null}
    </div>
  );
}
