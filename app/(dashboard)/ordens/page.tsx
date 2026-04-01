'use client';

import { startTransition, useDeferredValue, useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Peca } from '@/db/schema/pecas';
import { usePagination } from '@/hooks/usePagination';

import {
  ModalOrdemServico,
  ModalOrdemVenda
} from './_components';
import { OrdemCard } from './_components/ordem-card';
import {
  type NovaOrdemServico,
  type NovaOrdemVenda,
  type OrdemServicoCompleta,
  type OrdemVendaCompleta,
  useOrdens
} from './_hooks';
import {
  type OrdemFilters,
  buildAvailableMonths,
  buildOrdensMetrics,
  buildVendaFormInitialData,
  filterOrdens
} from './_lib/ordens-view';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock3,
  PackageSearch,
  Search,
  ShoppingCart,
  Wrench,
  X
} from 'lucide-react';

type SectionType = 'servico' | 'venda';

const createDefaultFilters = (): OrdemFilters => ({
  search: '',
  status: 'all',
  month: 'all'
});

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const label = format(new Date(Number(year), Number(month) - 1), 'MMMM yyyy', {
    locale: ptBR
  });

  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const hasActiveFilters = (filters: OrdemFilters) =>
  Boolean(filters.search) ||
  filters.status !== 'all' ||
  filters.month !== 'all';

export default function OrdensPage() {
  const {
    ordensServico,
    ordensVenda,
    clientes,
    veiculos,
    pecas,
    funcionarios,
    isLoading,
    isAddServicoOpen,
    setIsAddServicoOpen,
    editingServico,
    setEditingServico,
    isAddVendaOpen,
    setIsAddVendaOpen,
    editingVenda,
    setEditingVenda,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddOrdemServico,
    handleUpdateOrdemServico,
    handleAddOrdemVenda,
    handleUpdateOrdemVenda,
    handleDelete,
    getVeiculosByCliente
  } = useOrdens();

  const [serviceFilters, setServiceFilters] =
    useState<OrdemFilters>(createDefaultFilters);
  const [saleFilters, setSaleFilters] =
    useState<OrdemFilters>(createDefaultFilters);
  const [activeTab, setActiveTab] = useState<SectionType>('servico');
  const [expandedBySection, setExpandedBySection] = useState<
    Record<SectionType, string | null>
  >({
    servico: null,
    venda: null
  });

  const deferredServiceSearch = useDeferredValue(serviceFilters.search);
  const deferredSaleSearch = useDeferredValue(saleFilters.search);

  const normalizedServiceFilters = useMemo(
    () => ({ ...serviceFilters, search: deferredServiceSearch }),
    [deferredServiceSearch, serviceFilters]
  );
  const normalizedSaleFilters = useMemo(
    () => ({ ...saleFilters, search: deferredSaleSearch }),
    [deferredSaleSearch, saleFilters]
  );

  const serviceMetrics = useMemo(
    () => buildOrdensMetrics(ordensServico),
    [ordensServico]
  );
  const saleMetrics = useMemo(
    () => buildOrdensMetrics(ordensVenda),
    [ordensVenda]
  );

  const serviceMonths = useMemo(
    () => buildAvailableMonths(ordensServico),
    [ordensServico]
  );
  const saleMonths = useMemo(
    () => buildAvailableMonths(ordensVenda),
    [ordensVenda]
  );

  const filteredServiceOrders = useMemo(
    () => filterOrdens(ordensServico, normalizedServiceFilters),
    [normalizedServiceFilters, ordensServico]
  );
  const filteredSaleOrders = useMemo(
    () => filterOrdens(ordensVenda, normalizedSaleFilters),
    [normalizedSaleFilters, ordensVenda]
  );

  const servicePagination = usePagination({
    items: filteredServiceOrders,
    itemsPerPage: 10
  });
  const salePagination = usePagination({
    items: filteredSaleOrders,
    itemsPerPage: 10
  });

  const isInitialLoading =
    isLoading && ordensServico.length === 0 && ordensVenda.length === 0;

  const statsCards = [
    {
      label: 'Serviço',
      value: serviceMetrics.total,
      icon: Wrench
    },
    {
      label: 'Venda',
      value: saleMetrics.total,
      icon: ShoppingCart
    },
    {
      label: 'Ativas',
      value: serviceMetrics.ativas + saleMetrics.ativas,
      icon: Clock3
    },
    {
      label: 'Fechadas',
      value: serviceMetrics.fechadas + saleMetrics.fechadas,
      icon: CheckCircle2
    }
  ];

  const getAdjustedPecas = (ordemPecas: { peca_id: number; quantidade: number }[]) => {
    const ordemMap = new Map(ordemPecas.map((p) => [p.peca_id, p.quantidade]));
    return pecas.map((peca) => {
      const qtdNaOrdem = ordemMap.get(peca.id) ?? 0;
      return qtdNaOrdem > 0 ? { ...peca, quantidade: peca.quantidade + qtdNaOrdem } : peca;
    });
  };

  const getServicoInitialData = (ordem: OrdemServicoCompleta | null) => {
    if (!ordem) return undefined;

    return {
      data_chegada: ordem.data_chegada.split('T')[0],
      status: ordem.status,
      cliente_id: ordem.cliente_id,
      veiculo_id: ordem.veiculo_id,
      funcionario_id: ordem.funcionario_id,
      funcionario_responsavel_id: ordem.funcionario_responsavel_id,
      observacao: ordem.observacao || '',
      valor_total: ordem.valor_total,
      pecas: ordem.pecas.map((item) => {
        const pecaBanco = pecas.find((p) => p.id === item.peca_id);
        const estoqueEfetivo = (pecaBanco?.quantidade ?? item.peca?.quantidade ?? 0) + item.quantidade;

        return {
          peca_id: item.peca_id,
          quantidade: item.quantidade,
          peca: item.peca
            ? { ...item.peca, quantidade: estoqueEfetivo, preco: item.peca.preco }
            : null
        };
      })
    };
  };

  const getVendaInitialData = (ordem: OrdemVendaCompleta | null) =>
    ordem ? buildVendaFormInitialData(ordem, pecas) : undefined;

  const updateFilters = (
    section: SectionType,
    nextFilters: Partial<OrdemFilters>
  ) => {
    startTransition(() => {
      if (section === 'servico') {
        setServiceFilters((current) => ({
          ...current,
          ...nextFilters
        }));
        return;
      }

      setSaleFilters((current) => ({
        ...current,
        ...nextFilters
      }));
    });
  };

  const resetFilters = (section: SectionType) => {
    const next = createDefaultFilters();

    if (section === 'servico') {
      setServiceFilters(next);
      return;
    }

    setSaleFilters(next);
  };

  const toggleExpanded = (section: SectionType, orderId: number) => {
    const key = `${section}-${orderId}`;

    setExpandedBySection((current) => ({
      ...current,
      [section]: current[section] === key ? null : key
    }));
  };

  const handleStatusChange = async (
    tipo: SectionType,
    id: number,
    status: 'ativa' | 'fechada' | 'cancelada'
  ) => {
    if (tipo === 'servico') {
      await handleUpdateOrdemServico(id, { status });
      return;
    }

    await handleUpdateOrdemVenda(id, { status });
  };

  const renderFilters = (section: SectionType, months: string[]) => {
    const filters = section === 'servico' ? serviceFilters : saleFilters;

    return (
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative  flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={filters.search}
            onChange={(event) =>
              updateFilters(section, {
                search: event.target.value
              })
            }
            placeholder={
              section === 'servico'
                ? 'Buscar por cliente, placa, responsável ou ID...'
                : 'Buscar por cliente, empresa, pagamento ou ID...'
            }
            className=' bg-input border-border pl-9'
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value: OrdemFilters['status']) =>
            updateFilters(section, { status: value })
          }>
          <SelectTrigger className='w-full bg-input! border-border h-10! sm:w-44'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos os status</SelectItem>
            <SelectItem value='ativa'>Ativas</SelectItem>
            <SelectItem value='fechada'>Fechadas</SelectItem>
            <SelectItem value='cancelada'>Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.month}
          onValueChange={(value) => updateFilters(section, { month: value })}>
          <SelectTrigger className='w-full bg-input! border-border h-10! sm:w-48'>
            <SelectValue placeholder='Mês' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos os meses</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters(filters) ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => resetFilters(section)}
            className='gap-1.5 text-muted-foreground hover:text-foreground'>
            <X className='h-3.5 w-3.5' />
            Limpar
          </Button>
        ) : null}
      </div>
    );
  };

  const renderEmpty = (section: SectionType) => {
    const filters = section === 'servico' ? serviceFilters : saleFilters;
    const filtered = hasActiveFilters(filters);

    return (
      <Empty className='border-border bg-card'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <PackageSearch />
          </EmptyMedia>
          <EmptyTitle>
            {filtered
              ? 'Nenhuma ordem encontrada'
              : section === 'servico'
                ? 'Nenhuma ordem de serviço cadastrada'
                : 'Nenhuma ordem de venda cadastrada'}
          </EmptyTitle>
          <EmptyDescription>
            {filtered
              ? 'Ajuste os filtros ou limpe a busca para voltar a ver resultados.'
              : section === 'servico'
                ? 'Crie a primeira ordem de serviço.'
                : 'Crie a primeira ordem de venda.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {filtered ? (
            <Button variant='outline' onClick={() => resetFilters(section)}>
              Limpar filtros
            </Button>
          ) : (
            <Button
              onClick={() =>
                section === 'servico'
                  ? setIsAddServicoOpen(true)
                  : setIsAddVendaOpen(true)
              }>
              {section === 'servico' ? (
                <Wrench data-icon='inline-start' />
              ) : (
                <ShoppingCart data-icon='inline-start' />
              )}
              {section === 'servico'
                ? 'Nova ordem de serviço'
                : 'Nova ordem de venda'}
            </Button>
          )}
        </EmptyContent>
      </Empty>
    );
  };

  const renderLoadingCards = () => (
    <div className='flex flex-col gap-3'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='rounded-xl border border-border bg-card px-4 py-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-lg' />
            <Skeleton className='h-10 w-14 rounded-md' />
            <div className='flex-1'>
              <Skeleton className='h-4 w-40 rounded-md' />
              <Skeleton className='mt-2 h-3 w-56 rounded-md' />
            </div>
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-9 w-20 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSectionContent = (section: SectionType) => {
    const months = section === 'servico' ? serviceMonths : saleMonths;
    const filteredOrders =
      section === 'servico' ? filteredServiceOrders : filteredSaleOrders;
    const pagination =
      section === 'servico' ? servicePagination : salePagination;
    const isServiceSection = section === 'servico';

    return (
      <section className='flex flex-col gap-4 pt-4'>
        {renderFilters(section, months)}

        {isInitialLoading ? (
          renderLoadingCards()
        ) : filteredOrders.length === 0 ? (
          renderEmpty(section)
        ) : (
          <>
            <div className='flex flex-col gap-3'>
              {isServiceSection
                ? pagination.paginatedItems.map((ordem) => {
                    const serviceOrder = ordem as OrdemServicoCompleta;

                    return (
                      <OrdemCard
                        key={serviceOrder.id}
                        tipo='servico'
                        ordem={serviceOrder}
                        expanded={
                          expandedBySection.servico ===
                          `servico-${serviceOrder.id}`
                        }
                        onToggle={() =>
                          toggleExpanded('servico', serviceOrder.id)
                        }
                        onEdit={() => setEditingServico(serviceOrder)}
                        onDelete={() => {
                          setDeleteId({ type: 'servico', id: serviceOrder.id });
                          setIsDeleteOpen(true);
                        }}
                        onFinalize={() =>
                          handleStatusChange(
                            'servico',
                            serviceOrder.id,
                            'fechada'
                          )
                        }
                        onCancel={() =>
                          handleStatusChange(
                            'servico',
                            serviceOrder.id,
                            'cancelada'
                          )
                        }
                        isBusy={isLoading}
                      />
                    );
                  })
                : pagination.paginatedItems.map((ordem) => {
                    const saleOrder = ordem as OrdemVendaCompleta;

                    return (
                      <OrdemCard
                        key={saleOrder.id}
                        tipo='venda'
                        ordem={saleOrder}
                        expanded={
                          expandedBySection.venda === `venda-${saleOrder.id}`
                        }
                        onToggle={() => toggleExpanded('venda', saleOrder.id)}
                        onEdit={() => setEditingVenda(saleOrder)}
                        onDelete={() => {
                          setDeleteId({ type: 'venda', id: saleOrder.id });
                          setIsDeleteOpen(true);
                        }}
                        onFinalize={() =>
                          handleStatusChange('venda', saleOrder.id, 'fechada')
                        }
                        onCancel={() =>
                          handleStatusChange('venda', saleOrder.id, 'cancelada')
                        }
                        isBusy={isLoading}
                      />
                    );
                  })}
            </div>

            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              totalItems={filteredOrders.length}
              onPageChange={pagination.goToPage}
              onNextPage={pagination.goToNextPage}
              onPreviousPage={pagination.goToPreviousPage}
              isFirstPage={pagination.isFirstPage}
              isLastPage={pagination.isLastPage}
              pageItems={pagination.pageItems}
              itemLabel='ordens'
            />
          </>
        )}
      </section>
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-6'>
      <div className='animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-6 duration-300'>
        <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-bold text-foreground'>
              Ordens de Serviço e Venda
            </h1>
            <p className='text-sm text-muted-foreground'>
              Operação organizada em filas independentes.
            </p>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button onClick={() => setIsAddServicoOpen(true)}>
              <Wrench data-icon='inline-start' />
              Nova ordem de serviço
            </Button>
            <Button onClick={() => setIsAddVendaOpen(true)}>
              <ShoppingCart data-icon='inline-start' />
              Nova ordem de venda
            </Button>
          </div>
        </header>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {statsCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              isLoading={isInitialLoading}
            />
          ))}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SectionType)}
          className='w-full gap-0 p-0'>
          <TabsList className='h-11 w-full gap-2! bg-transparent! flex p-0'>
            <TabsTrigger
              value='servico'
              className='  flex  bg-muted  text-muted-foreground data-[state=active]:border-primary/70! data-[state=active]:bg-muted!'>
              <Wrench className='h-4 w-4' />
              Serviço
            </TabsTrigger>
            <TabsTrigger
              value='venda'
              className='  flex bg-muted  text-muted-foreground data-[state=active]:border-primary/70! data-[state=active]:bg-muted!'>
              <ShoppingCart className='h-4 w-4' />
              Venda
            </TabsTrigger>
          </TabsList>

          <TabsContent value='servico'>
            {renderSectionContent('servico')}
          </TabsContent>

          <TabsContent value='venda'>
            {renderSectionContent('venda')}
          </TabsContent>
        </Tabs>
      </div>

      <ModalOrdemServico
        mode='create'
        clientes={clientes}
        veiculos={veiculos}
        pecas={pecas}
        funcionarios={funcionarios}
        isOpen={isAddServicoOpen}
        setIsOpen={setIsAddServicoOpen}
        onSubmit={async (data) => {
          try {
            await handleAddOrdemServico(data as NovaOrdemServico);
            setIsAddServicoOpen(false);
          } catch {
            // erro já tratado no hook
          }
        }}
        isLoading={isLoading}
        getVeiculosByCliente={getVeiculosByCliente}
      />

      <ModalOrdemServico
        mode='edit'
        initialData={getServicoInitialData(editingServico)}
        clientes={clientes}
        veiculos={veiculos}
        pecas={getAdjustedPecas(editingServico?.pecas ?? [])}
        funcionarios={funcionarios}
        isOpen={Boolean(editingServico)}
        setIsOpen={(open) => !open && setEditingServico(null)}
        onSubmit={async (data) => {
          if (editingServico) {
            await handleUpdateOrdemServico(
              editingServico.id,
              data as NovaOrdemServico
            );
          }
        }}
        isLoading={isLoading}
        getVeiculosByCliente={getVeiculosByCliente}
      />

      <ModalOrdemVenda
        mode='create'
        clientes={clientes}
        pecas={pecas}
        isOpen={isAddVendaOpen}
        setIsOpen={setIsAddVendaOpen}
        onSubmit={async (data) => {
          try {
            await handleAddOrdemVenda(data as NovaOrdemVenda);
            setIsAddVendaOpen(false);
          } catch {
            // erro já tratado no hook
          }
        }}
        isLoading={isLoading}
      />

      <ModalOrdemVenda
        mode='edit'
        initialData={getVendaInitialData(editingVenda)}
        clientes={clientes}
        pecas={getAdjustedPecas(editingVenda?.pecas ?? [])}
        isOpen={Boolean(editingVenda)}
        setIsOpen={(open) => !open && setEditingVenda(null)}
        onSubmit={async (data) => {
          if (editingVenda) {
            await handleUpdateOrdemVenda(
              editingVenda.id,
              data as NovaOrdemVenda
            );
          }
        }}
        isLoading={isLoading}
      />

      <ModalDelete
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title='Excluir ordem'
        description='Tem certeza que deseja excluir esta ordem? Esta ação não pode ser desfeita.'
      />
    </div>
  );
}
