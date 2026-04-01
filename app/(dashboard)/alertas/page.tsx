'use client';

import { AlertTriangle, Bell, CheckCircle, ShieldAlert } from 'lucide-react';

import { PaginationControls } from '@/components/pagination-controls';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { usePagination } from '@/hooks/usePagination';

import { AlertaGrid } from './_components/alerta-grid';
import { useAlerta } from './_hooks/useAlerta';

export default function Alertas() {
  const { pecasCriticas, pecasAtencao, pecasEmAlerta, isLoading } = useAlerta();

  const criticasPagination = usePagination({ items: pecasCriticas, itemsPerPage: 10 });
  const atencaoPagination = usePagination({ items: pecasAtencao, itemsPerPage: 10 });

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <p className='text-muted-foreground'>Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-foreground'>Alertas</h1>
        <p className='text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* StatCards — padrão Dashboard */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          label='Sem Estoque'
          value={pecasCriticas.length}
          subtitle='Peças com quantidade zero'
          icon={AlertTriangle}
          isLoading={false}
        />
        <StatCard
          label='Estoque Baixo'
          value={pecasAtencao.length}
          subtitle='Abaixo do nível mínimo'
          icon={Bell}
          isLoading={false}
        />
        <StatCard
          label='Total Monitorado'
          value={pecasEmAlerta.length}
          subtitle='Produtos em alerta ativo'
          icon={ShieldAlert}
          isLoading={false}
        />
      </div>

      {/* Lista de alertas */}
      {pecasEmAlerta.length === 0 ? (
        <Card className='bg-card border-border'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-success/20 bg-success/8'>
              <CheckCircle className='h-8 w-8 text-success' />
            </div>
            <h3 className='mb-2 text-lg font-bold text-foreground'>
              Tudo em dia!
            </h3>
            <p className='text-center text-sm text-muted-foreground'>
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className='bg-card border-border overflow-hidden'>
          <CardContent className='p-0'>
            {/* Seção: Sem Estoque */}
            {pecasCriticas.length > 0 && (
              <>
                <div className='bg-muted px-4 py-2.5 flex items-center gap-2 border-b border-border'>
                  <div className='flex size-[22px] items-center justify-center rounded-md border border-border bg-elevated'>
                    <AlertTriangle className='h-3 w-3 text-muted-foreground' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground'>
                    Sem Estoque
                  </span>
                  <span className='ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5 bg-destructive/12 text-destructive'>
                    {pecasCriticas.length}{' '}
                    {pecasCriticas.length === 1 ? 'peça' : 'peças'}
                  </span>
                </div>
                <AlertaGrid pecas={criticasPagination.paginatedItems} tipo='critica' />
                <div className='px-3 pb-3'>
                  <PaginationControls
                    currentPage={criticasPagination.currentPage}
                    totalPages={criticasPagination.totalPages}
                    totalItems={criticasPagination.totalItems}
                    startItem={criticasPagination.startItem}
                    endItem={criticasPagination.endItem}
                    pageItems={criticasPagination.pageItems}
                    isFirstPage={criticasPagination.isFirstPage}
                    isLastPage={criticasPagination.isLastPage}
                    onPageChange={criticasPagination.goToPage}
                    onNextPage={criticasPagination.goToNextPage}
                    onPreviousPage={criticasPagination.goToPreviousPage}
                    itemLabel='peças'
                  />
                </div>
              </>
            )}

            {/* Seção: Estoque Baixo */}
            {pecasAtencao.length > 0 && (
              <>
                <div className='bg-muted px-4 py-2.5 flex items-center gap-2 border-t border-b border-border'>
                  <div className='flex size-[22px] items-center justify-center rounded-md border border-border bg-elevated'>
                    <Bell className='h-3 w-3 text-muted-foreground' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground'>
                    Estoque Baixo
                  </span>
                  <span className='ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5 bg-primary/12 text-primary'>
                    {pecasAtencao.length}{' '}
                    {pecasAtencao.length === 1 ? 'peça' : 'peças'}
                  </span>
                </div>
                <AlertaGrid pecas={atencaoPagination.paginatedItems} tipo='atencao' />
                <div className='px-3 pb-3'>
                  <PaginationControls
                    currentPage={atencaoPagination.currentPage}
                    totalPages={atencaoPagination.totalPages}
                    totalItems={atencaoPagination.totalItems}
                    startItem={atencaoPagination.startItem}
                    endItem={atencaoPagination.endItem}
                    pageItems={atencaoPagination.pageItems}
                    isFirstPage={atencaoPagination.isFirstPage}
                    isLastPage={atencaoPagination.isLastPage}
                    onPageChange={atencaoPagination.goToPage}
                    onNextPage={atencaoPagination.goToNextPage}
                    onPreviousPage={atencaoPagination.goToPreviousPage}
                    itemLabel='peças'
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
