'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';

import { ModalClientes } from './_components/modal-clientes';
import { ModalVeiculos } from './_components/modal-veiculos';
import { useClientes, useVeiculos } from './_hooks';
import {
  deriveClientesViewModel,
  resolveExpandedClienteIds,
  toggleExpandedCliente
} from './_lib/clientes-view-model';
import { formatCNPJ, formatCPF, formatPhone } from '@/app/utils/formatters';
import {
  Building2,
  Car,
  ChevronDown,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users
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

export default function Clientes() {
  const {
    clientes,
    isLoading,
    isSaving: isSavingCliente,
    isAddOpen,
    setIsAddOpen,
    editingCliente,
    setEditingCliente,
    handleAddCliente,
    handleUpdateCliente,
    handleDeleteCliente,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  } = useClientes();
  const {
    veiculosByCliente,
    isAddOpen: isVeiculoAddOpen,
    setIsAddOpen: setIsVeiculoAddOpen,
    editingVeiculo,
    setEditingVeiculo,
    deleteVeiculoId,
    setDeleteVeiculoId,
    isDeleteOpen: isVeiculoDeleteOpen,
    setIsDeleteOpen: setIsVeiculoDeleteOpen,
    isSaving,
    fetchVeiculosByCliente,
    handleAddVeiculo,
    handleUpdateVeiculo,
    handleDeleteVeiculo,
    getTotalVeiculos,
    isInitialLoading,
    isLoadingCliente
  } = useVeiculos();

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeClienteIdForNewVeiculo, setActiveClienteIdForNewVeiculo] =
    useState<number | null>(null);
  const [manuallyExpandedClienteIds, setManuallyExpandedClienteIds] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT);
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const viewModel = useMemo(
    () =>
      deriveClientesViewModel({
        clientes,
        veiculosByCliente,
        search: deferredSearch
      }),
    [clientes, deferredSearch, veiculosByCliente]
  );

  const expandedClienteIds = useMemo(
    () =>
      resolveExpandedClienteIds({
        manualExpandedClienteIds: manuallyExpandedClienteIds,
        autoExpandedClienteIds: viewModel.autoExpandedClienteIds,
        allowMultiple: isDesktop
      }),
    [isDesktop, manuallyExpandedClienteIds, viewModel.autoExpandedClienteIds]
  );

  const {
    paginatedItems: paginatedClientes,
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
  } = usePagination({ items: viewModel.results, itemsPerPage: 10 });

  const handleToggleCliente = (clienteId: number) => {
    const isCurrentlyExpanded = expandedClienteIds.has(clienteId);

    setManuallyExpandedClienteIds((currentExpandedClienteIds) =>
      toggleExpandedCliente({
        currentExpandedClienteIds,
        clienteId,
        allowMultiple: isDesktop
      })
    );

    if (!isCurrentlyExpanded) {
      void fetchVeiculosByCliente(clienteId);
    }
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold text-foreground'>Clientes</h1>
          <p className='text-sm text-muted-foreground'>
            Encontre clientes rápido e gerencie seus veículos sem sair da lista.
          </p>
        </div>

        <ModalClientes
          mode='create'
          initialData={undefined}
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          onSubmit={handleAddCliente}
          isLoading={isSavingCliente}
          trigger={
            <Button className='w-full sm:w-auto'>
              <Plus data-icon='inline-start' />
              Novo cliente
            </Button>
          }
        />
      </div>

      <div className='grid gap-3 lg:grid-cols-2'>
        <StatCard
          label='Clientes'
          value={viewModel.totalClientes}
          subtitle='Cadastros disponíveis para atendimento e operação'
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label='Veículos'
          value={getTotalVeiculos()}
          subtitle='Veículos associados aos clientes cadastrados'
          icon={Car}
          isLoading={isInitialLoading}
        />
      </div>

      <Card className='gap-0 overflow-hidden border-border bg-card shadow-none'>
        <CardHeader className='gap-4 pb-0!'>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-base font-semibold'>
              Base de clientes
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Busque por nome, empresa, documento, telefone ou placa.
            </p>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar cliente ou placa...'
              aria-label='Buscar cliente ou placa'
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
                <Skeleton className='size-11 rounded-lg' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-56' />
                </div>
                <Skeleton className='h-9 w-20 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      ) : totalItems === 0 ? (
        <Empty className='border-border bg-muted/20'>
          <EmptyMedia variant='icon'>
            <Users />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
            <EmptyDescription>
              Ajuste a busca para localizar um cliente ou uma placa específica.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='flex flex-col gap-3'>
          {paginatedClientes.map((result) => {
            const { cliente, matchedVehicleIds, veiculos, vehicleCount } =
              result;
            const isExpanded = expandedClienteIds.has(cliente.id);
            const isLoadingVeiculos = isLoadingCliente(cliente.id);

            return (
              <Collapsible key={cliente.id} open={isExpanded}>
                <div className='overflow-hidden rounded-xl border border-border bg-card'>
                  <div className='flex items-start gap-4 px-5 py-4'>
                    <button
                      type='button'
                      onClick={() => handleToggleCliente(cliente.id)}
                      className='group flex min-w-0 flex-1 items-start gap-4 text-left outline-none transition-colors hover:text-foreground focus-visible:text-foreground'>
                      <div className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-sm font-semibold text-primary transition-colors group-hover:border-border-hover'>
                        {getInitials(cliente.nome_empresa)}
                      </div>

                      <div className='flex min-w-0 flex-1 flex-col gap-2'>
                        <div className='flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between'>
                          <div className='min-w-0'>
                            <div className='flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground'>
                              <Building2 className='size-3.5 shrink-0 text-muted-foreground' />
                              <span className='truncate'>
                                {cliente.nome_empresa}
                              </span>
                            </div>
                          </div>

                          <div className='flex shrink-0 items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='border-border bg-background text-muted-foreground'>
                              {vehicleCount}{' '}
                              {vehicleCount === 1 ? 'veículo' : 'veículos'}
                            </Badge>
                            <ChevronDown
                              className={cn(
                                'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
                                isExpanded && 'rotate-180 text-foreground'
                              )}
                            />
                          </div>
                        </div>

                        <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                          {cliente.telefone ? (
                            <span className='inline-flex items-center gap-1.5'>
                              <Phone className='size-3.5' />
                              {formatPhone(cliente.telefone)}
                            </span>
                          ) : null}
                          {cliente.cpf ? <span>CPF {formatCPF(cliente.cpf)}</span> : null}
                          {cliente.cnpj ? (
                            <span>CNPJ {formatCNPJ(cliente.cnpj)}</span>
                          ) : null}
                          {cliente.cidade || cliente.estado ? (
                            <span className='inline-flex items-center gap-1.5'>
                              <MapPin className='size-3.5' />
                              {[cliente.cidade, cliente.estado].filter(Boolean).join('/')}
                            </span>
                          ) : null}
                        </div>

                        {matchedVehicleIds.length > 0 ? (
                          <p className='text-xs font-medium text-primary'>
                            Busca encontrou {matchedVehicleIds.length}{' '}
                            {matchedVehicleIds.length === 1
                              ? 'placa vinculada'
                              : 'placas vinculadas'}
                            .
                          </p>
                        ) : null}
                      </div>
                    </button>

                    <div className='flex shrink-0 items-center gap-1'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Editar cliente ${cliente.nome_empresa}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingCliente(cliente);
                            }}>
                            <Pencil />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <ModalClientes
                        mode='edit'
                        initialData={editingCliente || undefined}
                        isOpen={editingCliente?.id === cliente.id}
                        setIsOpen={(open) => !open && setEditingCliente(null)}
                        onSubmit={(data) =>
                          handleUpdateCliente(cliente.id, data)
                        }
                        isLoading={isSavingCliente}
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Excluir cliente ${cliente.nome_empresa}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteId(cliente.id);
                              setIsDeleteOpen(true);
                            }}>
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                      <ModalDelete
                        isOpen={isDeleteOpen && deleteId === cliente.id}
                        setIsOpen={(open) => {
                          setIsDeleteOpen(open);
                          if (!open) {
                            setDeleteId(null);
                          }
                        }}
                        onConfirm={() => handleDeleteCliente(cliente.id)}
                        isLoading={isSavingCliente}
                        title='Excluir cliente'
                        description={`Tem certeza que deseja excluir o cliente "${cliente.nome_empresa}"? Todos os veículos associados também serão removidos.`}
                      />
                    </div>
                  </div>

                  <CollapsibleContent className='border-t border-border bg-background/50'>
                    <div className='px-5 py-4'>
                      <div className='mb-3 flex items-center justify-between'>
                        <div>
                          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                            Veículos do cliente
                          </p>
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {vehicleCount}{' '}
                            {vehicleCount === 1
                              ? 'veículo cadastrado'
                              : 'veículos cadastrados'}
                          </p>
                        </div>

                        <ModalVeiculos
                          mode='create'
                          initialData={undefined}
                          isOpen={
                            isVeiculoAddOpen &&
                            activeClienteIdForNewVeiculo === cliente.id
                          }
                          setIsOpen={(open) => {
                            setIsVeiculoAddOpen(open);
                            if (!open) {
                              setActiveClienteIdForNewVeiculo(null);
                            }
                          }}
                          onSubmit={(data) =>
                            handleAddVeiculo(cliente.id, data)
                          }
                          isLoading={isSaving}
                          trigger={
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setActiveClienteIdForNewVeiculo(cliente.id)
                              }>
                              <Plus data-icon='inline-start' />
                              Adicionar veículo
                            </Button>
                          }
                        />
                      </div>

                      {isLoadingVeiculos ||
                      (isInitialLoading && veiculos.length === 0) ? (
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          {Array.from({ length: 2 }).map((_, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between rounded-lg border border-border bg-card p-3'>
                              <div className='flex items-center gap-3'>
                                <Skeleton className='size-9 rounded-md' />
                                <div className='flex flex-col gap-2'>
                                  <Skeleton className='h-3.5 w-20' />
                                  <Skeleton className='h-3 w-28' />
                                </div>
                              </div>
                              <div className='flex gap-1'>
                                <Skeleton className='size-8 rounded-md' />
                                <Skeleton className='size-8 rounded-md' />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : veiculos.length === 0 ? (
                        <Empty className='border-border bg-card py-8'>
                          <EmptyMedia variant='icon'>
                            <Car />
                          </EmptyMedia>
                          <EmptyHeader>
                            <EmptyTitle>Nenhum veículo cadastrado</EmptyTitle>
                            <EmptyDescription>
                              Adicione o primeiro veículo para manter o
                              histórico deste cliente completo.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          {veiculos.map((veiculo) => {
                            const isMatchedVehicle = matchedVehicleIds.includes(
                              veiculo.id
                            );

                            return (
                              <div
                                key={veiculo.id}
                                className={cn(
                                  'flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors',
                                  isMatchedVehicle &&
                                    'border-primary/40 bg-primary/5'
                                )}>
                                <div className='flex min-w-0 items-center gap-3'>
                                  <div className='flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-primary'>
                                    <Car className='size-4' />
                                  </div>
                                  <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-foreground'>
                                      {veiculo.placa}
                                    </p>
                                    <p className='truncate text-sm text-muted-foreground'>
                                      {veiculo.modelo}
                                    </p>
                                  </div>
                                </div>

                                <div className='flex shrink-0 items-center gap-1'>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        aria-label={`Editar veículo ${veiculo.placa}`}
                                        onClick={() => {
                                          setEditingVeiculo(veiculo);
                                        }}>
                                        <Pencil />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <ModalVeiculos
                                    mode='edit'
                                    initialData={editingVeiculo || undefined}
                                    isOpen={editingVeiculo?.id === veiculo.id}
                                    setIsOpen={(open) =>
                                      !open && setEditingVeiculo(null)
                                    }
                                    onSubmit={(data) =>
                                      handleUpdateVeiculo(
                                        veiculo.id,
                                        cliente.id,
                                        data
                                      )
                                    }
                                    isLoading={isSaving}
                                  />

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        aria-label={`Excluir veículo ${veiculo.placa}`}
                                        onClick={() => {
                                          setDeleteVeiculoId(veiculo.id);
                                          setIsVeiculoDeleteOpen(true);
                                        }}>
                                        <Trash2 />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                  <ModalDelete
                                    isOpen={
                                      isVeiculoDeleteOpen &&
                                      deleteVeiculoId === veiculo.id
                                    }
                                    setIsOpen={(open) => {
                                      setIsVeiculoDeleteOpen(open);
                                      if (!open) {
                                        setDeleteVeiculoId(null);
                                      }
                                    }}
                                    onConfirm={() =>
                                      handleDeleteVeiculo(
                                        veiculo.id,
                                        cliente.id
                                      )
                                    }
                                    isLoading={isSaving}
                                    title='Excluir veículo'
                                    description={`Tem certeza que deseja excluir o veículo "${veiculo.placa}"?`}
                                  />
                                </div>
                              </div>
                            );
                          })}
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
        itemLabel='clientes'
      />
    </div>
  );
}
