'use client';

import { useState } from 'react';

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from '@/hooks/usePagination';

import { ModalClientes } from './_components/modal-clientes';
import { ModalVeiculos } from './_components/modal-veiculos';
import { useClientes, useVeiculos } from './_hooks';
import {
  Building2,
  Car,
  ChevronDown,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
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

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Clientes</h2>
          <p className='text-muted-foreground'>
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
            <Button className='bg-primary hover:bg-primary/90'>
              <Plus className='h-4 w-4 mr-2' />
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
          className='pl-10 bg-input border-border'
        />
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='bg-card border-border'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Users className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {clientes.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total de Clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
                <Car className='h-5 w-5 text-emerald-500' />
              </div>
              <div>
                {isInitialLoading ? (
                  <div className='h-8 w-12 animate-pulse rounded bg-muted'></div>
                ) : (
                  <p className='text-2xl font-bold text-foreground animate-in fade-in duration-300'>
                    {getTotalVeiculos()}
                  </p>
                )}
                <p className='text-sm text-muted-foreground'>
                  Veículos Cadastrados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-foreground'>Lista de Clientes</CardTitle>
          <CardDescription>
            {searchFilteredClientes.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              <span className='ml-2 text-muted-foreground'>
                Carregando clientes...
              </span>
            </div>
          ) : searchFilteredClientes.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              Nenhum cliente encontrado
            </div>
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
                  <div className='rounded-lg border border-border bg-muted/30 overflow-hidden transition-all hover:bg-muted/50'>
                    {/* Client Row */}
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center gap-4'>
                        {/* Avatar */}
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                          <User className='h-6 w-6 text-primary' />
                        </div>

                        {/* Client Info */}
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-semibold text-foreground'>
                              {cliente.name_cliente}
                            </p>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Building2 className='h-3 w-3' />
                            <span>{cliente.nome_empresa}</span>
                          </div>
                          <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                            {cliente.cpf && <span>CPF: {cliente.cpf}</span>}
                            {cliente.cnpj && <span>CNPJ: {cliente.cnpj}</span>}
                            {cliente.telefone && (
                              <span className='flex items-center gap-1'>
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
                          <Button variant='outline' size='sm' className='gap-2'>
                            <Car className='h-4 w-4' />
                            <span className='hidden sm:inline'>Veículos</span>
                            <Badge
                              variant='secondary'
                              className='ml-1 transition-all duration-200'>
                              {veiculos.length}
                            </Badge>
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
                              onClick={() => {
                                setDeleteId(cliente.id);
                                setIsDeleteOpen(true);
                              }}>
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {/* Vehicles Section (Expandable) */}
                    <CollapsibleContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 overflow-hidden transition-all duration-300 ease-in-out'>
                      <div className='border-t border-border bg-background/50 p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-sm font-medium text-foreground flex items-center gap-2'>
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
                                onClick={() => setCurrentClienteId(cliente.id)}>
                                <Plus className='h-3 w-3 mr-1' />
                                Adicionar Veículo
                              </Button>
                            }
                          />
                        </div>

                        {/* Loading Skeleton */}
                        {isLoadingVeiculos && (
                          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border'>
                                <div className='flex items-center gap-3'>
                                  <Skeleton className='h-10 w-10 rounded-lg' />
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
                          <div className='text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg'>
                            <Car className='h-8 w-8 mx-auto mb-2 opacity-50' />
                            Nenhum veículo cadastrado para este cliente
                          </div>
                        )}

                        {/* Vehicles Grid */}
                        {!isLoadingVeiculos && veiculos.length > 0 && (
                          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                            {veiculos.map((veiculo) => (
                              <div
                                key={veiculo.id}
                                className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors'>
                                <div className='flex items-center gap-3'>
                                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                                    <Car className='h-5 w-5 text-primary' />
                                  </div>
                                  <div>
                                    <p className='font-medium text-foreground'>
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
                                        className='h-8 w-8'
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
                                        className='h-8 w-8'
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
        </CardContent>
      </Card>
    </div>
  );
}
