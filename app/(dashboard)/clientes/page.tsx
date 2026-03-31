'use client';

import { useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from '@/hooks/usePagination';

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

import { ModalClientes } from './_components/modal-clientes';
import { ModalVeiculos } from './_components/modal-veiculos';
import { useClientes, useVeiculos } from './_hooks';
import {
  Car,
  ChevronDown,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';

export default function Clientes() {
  const {
    clientes,
    isLoading,
    search,
    setSearch,
    filteredClientes,
    isAddOpen,
    setIsAddOpen,
    editingCliente,
    setEditingCliente,
    newCliente,
    setNewCliente,
    handleAddCliente,
    handleUpdateCliente,
    handleDeleteCliente,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  } = useClientes();

  const {
    isAddOpen: isVeiculoAddOpen,
    setIsAddOpen: setIsVeiculoAddOpen,
    editingVeiculo,
    setEditingVeiculo,
    newVeiculo,
    setNewVeiculo,
    currentClienteId,
    setCurrentClienteId,
    deleteVeiculoId,
    setDeleteVeiculoId,
    isDeleteOpen: isVeiculoDeleteOpen,
    setIsDeleteOpen: setIsVeiculoDeleteOpen,
    isSaving,
    fetchVeiculosByCliente,
    handleAddVeiculo,
    handleUpdateVeiculo,
    handleDeleteVeiculo,
    getVeiculosForCliente,
    isLoadingCliente,
    getTotalVeiculos,
    isInitialLoading
  } = useVeiculos();

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
  } = usePagination({ items: filteredClientes, itemsPerPage: 10 });

  // Track which clients have their vehicles section expanded
  const [expandedClientes, setExpandedClientes] = useState<Set<number>>(
    new Set()
  );

  const toggleExpandCliente = (clienteId: number) => {
    setExpandedClientes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clienteId)) {
        newSet.delete(clienteId);
      } else {
        newSet.add(clienteId);
        // Fetch vehicles when expanding
        fetchVeiculosByCliente(clienteId);
        setCurrentClienteId(clienteId);
      }
      return newSet;
    });
  };

  // Search also by vehicle plate
  const searchFilteredClientes = filteredClientes.filter((cliente) => {
    const veiculos = getVeiculosForCliente(cliente.id);
    const matchesVeiculo = veiculos.some((v) =>
      v.placa.toLowerCase().includes(search.toLowerCase())
    );
    return matchesVeiculo || filteredClientes.includes(cliente);
  });

  // Get initials from client name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-[20px] font-semibold text-foreground'>
            Clientes
          </h1>
          <p className='text-[13px] text-muted-foreground'>
            Gerencie os clientes e seus veículos
          </p>
        </div>
        <ModalClientes
          mode='create'
          data={newCliente}
          setData={setNewCliente}
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          onSubmit={handleAddCliente}
          isLoading={isLoading}
          trigger={
            <Button className='bg-primary hover:bg-primary/90 text-primary-foreground w-32'>
              <Plus className='h-4 w-4' />
              Novo Cliente
            </Button>
          }
        />
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Buscar por nome, documento ou placa...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='bg-card border border-border rounded-xl p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/12'>
              <Users className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {clientes.length}
              </p>
              <p className='text-[12px] text-muted-foreground'>Total de Clientes</p>
            </div>
          </div>
        </div>
        <div className='bg-card border border-border rounded-xl p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-[10px] bg-success/12'>
              <Car className='h-5 w-5 text-success' />
            </div>
            <div>
              {isInitialLoading ? (
                <div className='h-8 w-12 animate-pulse rounded bg-muted'></div>
              ) : (
                <p className='text-2xl font-bold text-foreground animate-in fade-in duration-300'>
                  {getTotalVeiculos()}
                </p>
              )}
              <p className='text-[12px] text-muted-foreground'>
                Veículos Cadastrados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-[13px] text-muted-foreground'>
            {searchFilteredClientes.length} cliente(s) encontrado(s)
          </p>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='ml-2 text-muted-foreground'>
              Carregando clientes...
            </span>
          </div>
        ) : searchFilteredClientes.length === 0 ? (
          <Empty className='border-border bg-card'>
            <EmptyHeader>
              <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
              <EmptyDescription>Tente outra busca ou revise os filtros aplicados.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          paginatedClientes.map((cliente) => {
            const isExpanded = expandedClientes.has(cliente.id);
            const veiculos = getVeiculosForCliente(cliente.id);
            const isLoadingVeiculos = isLoadingCliente(cliente.id);

            return (
              <Collapsible
                key={cliente.id}
                open={isExpanded}
                onOpenChange={() => toggleExpandCliente(cliente.id)}>
                <div className='bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border-hover'>
                  {/* Client Row */}
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex min-w-0 items-center gap-4'>
                      {/* Avatar — shrink-0 para não ser comprimido */}
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12'>
                        <span className='text-sm font-semibold text-primary'>
                          {getInitials(cliente.name_cliente)}
                        </span>
                      </div>

                      {/* Client Info — min-w-0 permite truncate */}
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium text-foreground'>
                          {cliente.name_cliente}
                        </p>
                        <div className='flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                          {cliente.cpf && <span className='truncate'>CPF: {cliente.cpf}</span>}
                          {cliente.cnpj && <span className='truncate'>CNPJ: {cliente.cnpj}</span>}
                          {cliente.telefone && (
                            <span className='flex items-center gap-1 text-primary font-medium'>
                              <Phone className='h-3 w-3' />
                              {cliente.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2'>
                      {/* Vehicles Toggle */}
                      <CollapsibleTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='gap-1.5 text-[12px] text-muted-foreground font-medium hover:text-foreground'>
                          <Car className='h-4 w-4' />
                          <span className='hidden sm:inline'>Veículos</span>
                          <span className='text-[12px] text-muted-foreground font-medium'>
                            {veiculos.length}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>

                      {/* Edit */}
                      <ModalClientes
                        mode='edit'
                        data={editingCliente || {}}
                        setData={(data) =>
                          setEditingCliente(data as typeof cliente)
                        }
                        isOpen={editingCliente?.id === cliente.id}
                        setIsOpen={(open) => !open && setEditingCliente(null)}
                        onSubmit={handleUpdateCliente}
                        isLoading={isLoading}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon'
                            aria-label={`Editar cliente ${cliente.name_cliente}`}
                            onClick={() => setEditingCliente(cliente)}>
                            <Pencil className='h-4 w-4 text-muted-foreground' />
                          </Button>
                        }
                      />

                      {/* Delete */}
                      <ModalDelete
                        isOpen={isDeleteOpen && deleteId === cliente.id}
                        setIsOpen={(open) => {
                          setIsDeleteOpen(open);
                          if (!open) setDeleteId(null);
                        }}
                        onConfirm={() => handleDeleteCliente(cliente.id)}
                        isLoading={isLoading}
                        title='Excluir Cliente'
                        description={`Tem certeza que deseja excluir o cliente "${cliente.name_cliente}"? Todos os veículos associados também serão removidos. Esta ação não pode ser desfeita.`}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon'
                            aria-label={`Excluir cliente ${cliente.name_cliente}`}
                            onClick={() => {
                              setDeleteId(cliente.id);
                              setIsDeleteOpen(true);
                            }}>
                            <Trash2 className='h-4 w-4 text-muted-foreground' />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Vehicles Section (Expandable) */}
                  <CollapsibleContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 overflow-hidden transition-all duration-300 ease-in-out'>
                    <div className='border-t border-border bg-background p-4'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-[13px] font-medium text-muted-foreground flex items-center gap-2'>
                          <Car className='h-4 w-4' />
                          Veículos do Cliente
                        </h4>
                        <ModalVeiculos
                          mode='create'
                          data={newVeiculo}
                          setData={setNewVeiculo}
                          isOpen={
                            isVeiculoAddOpen &&
                            currentClienteId === cliente.id
                          }
                          setIsOpen={(open) => {
                            setCurrentClienteId(cliente.id);
                            setIsVeiculoAddOpen(open);
                          }}
                          onSubmit={handleAddVeiculo}
                          isLoading={isSaving}
                          trigger={
                            <Button
                              variant='outline'
                              size='sm'
                              className='border-border text-muted-foreground hover:text-foreground'
                              onClick={() => setCurrentClienteId(cliente.id)}>
                              <Plus className='h-3 w-3 mr-1' />
                              Adicionar Veículo
                            </Button>
                          }
                        />
                      </div>

                      {/* Loading Skeleton */}
                      {isLoadingVeiculos && (
                        <div className='grid gap-3 sm:grid-cols-2'>
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className='flex items-center justify-between p-3 rounded-lg bg-card border border-border'>
                              <div className='flex items-center gap-3'>
                                <Skeleton className='h-10 w-10 rounded-[8px]' />
                                <div className='space-y-2'>
                                  <Skeleton className='h-4 w-20' />
                                  <Skeleton className='h-3 w-16' />
                                </div>
                              </div>
                              <div className='flex gap-1'>
                                <Skeleton className='h-8 w-8 rounded' />
                                <Skeleton className='h-8 w-8 rounded' />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty State */}
                      {!isLoadingVeiculos && veiculos.length === 0 && (
                        <Empty className='border-border bg-card'>
                          <EmptyHeader>
                            <EmptyTitle>Nenhum veículo</EmptyTitle>
                            <EmptyDescription>Nenhum veículo cadastrado para este cliente.</EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}

                      {/* Vehicles Grid */}
                      {!isLoadingVeiculos && veiculos.length > 0 && (
                        <div className='grid gap-3 sm:grid-cols-2'>
                          {veiculos.map((veiculo) => (
                            <div
                              key={veiculo.id}
                              className='flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-border-hover transition-colors'>
                              <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12'>
                                  <Car className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                  <p className='text-[13px] font-semibold text-foreground'>
                                    {veiculo.placa}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {veiculo.modelo}
                                  </p>
                                </div>
                              </div>
                              <div className='flex gap-1'>
                                {/* Edit Vehicle */}
                                <ModalVeiculos
                                  mode='edit'
                                  data={editingVeiculo || {}}
                                  setData={(data) =>
                                    setEditingVeiculo(data as typeof veiculo)
                                  }
                                  isOpen={editingVeiculo?.id === veiculo.id}
                                  setIsOpen={(open) =>
                                    !open && setEditingVeiculo(null)
                                  }
                                  onSubmit={handleUpdateVeiculo}
                                  isLoading={isSaving}
                                  trigger={
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      aria-label={`Editar veículo ${veiculo.placa}`}
                                      onClick={() => {
                                        setCurrentClienteId(cliente.id);
                                        setEditingVeiculo(veiculo);
                                      }}>
                                      <Pencil className='h-3 w-3 text-muted-foreground' />
                                    </Button>
                                  }
                                />
                                {/* Delete Vehicle */}
                                <ModalDelete
                                  isOpen={
                                    isVeiculoDeleteOpen &&
                                    deleteVeiculoId === veiculo.id
                                  }
                                  setIsOpen={(open) => {
                                    setIsVeiculoDeleteOpen(open);
                                    if (!open) setDeleteVeiculoId(null);
                                  }}
                                  onConfirm={() =>
                                    handleDeleteVeiculo(veiculo.id)
                                  }
                                  isLoading={isSaving}
                                  title='Excluir Veículo'
                                  description={`Tem certeza que deseja excluir o veículo "${veiculo.placa}"?`}
                                  trigger={
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      aria-label={`Excluir veículo ${veiculo.placa}`}
                                      onClick={() => {
                                        setCurrentClienteId(cliente.id);
                                        setDeleteVeiculoId(veiculo.id);
                                        setIsVeiculoDeleteOpen(true);
                                      }}>
                                      <Trash2 className='h-3 w-3 text-destructive' />
                                    </Button>
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
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
    </div>
  );
}
