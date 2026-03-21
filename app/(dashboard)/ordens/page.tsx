'use client';

import { useMemo, useState } from 'react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Peca } from '@/db/schema/pecas';
import { usePagination } from '@/hooks/usePagination';

import {
  ModalDetalhesOrdem,
  ModalOrdemServico,
  ModalOrdemVenda
} from './_components';
import {
  type NovaOrdemServico,
  type NovaOrdemVenda,
  type OrdemServicoCompleta,
  type OrdemVendaCompleta,
  useOrdens
} from './_hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Wrench,
  XCircle
} from 'lucide-react';

type OrdemUnificada =
  | (OrdemServicoCompleta & { tipo: 'servico' })
  | (OrdemVendaCompleta & { tipo: 'venda' });

const statusConfig = {
  ativa: {
    label: 'Ativa',
    icon: Clock,
    className: 'bg-yellow-700/20 text-yellow-500'
  },
  fechada: {
    label: 'Fechada',
    icon: CheckCircle,
    className: 'bg-emerald-500/20 text-emerald-400'
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-destructive/20 text-destructive'
  }
};

const formatCurrency = (value: number) => {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export default function Ordens() {
  const {
    ordensServico,
    ordensVenda,
    clientes,
    veiculos,
    pecas,
    isLoading,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    isAddServicoOpen,
    setIsAddServicoOpen,
    editingServico,
    setEditingServico,
    viewingServico,
    setViewingServico,
    isAddVendaOpen,
    setIsAddVendaOpen,
    editingVenda,
    setEditingVenda,
    viewingVenda,
    setViewingVenda,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddOrdemServico,
    handleUpdateOrdemServico,
    handleAddOrdemVenda,
    handleUpdateOrdemVenda,
    handleDelete,
    stats,
    getVeiculosByCliente
  } = useOrdens();

  // Estado para controle do dropdown de nova ordem
  const [isNewOrderMenuOpen, setIsNewOrderMenuOpen] = useState(false);

  // Combinar e filtrar ordens
  const ordensUnificadas = useMemo(() => {
    const servicos: OrdemUnificada[] = ordensServico.map((o) => ({
      ...o,
      tipo: 'servico' as const
    }));
    const vendas: OrdemUnificada[] = ordensVenda.map((o) => ({
      ...o,
      tipo: 'venda' as const
    }));
    const todas = [...servicos, ...vendas];

    // Ordenar por data de criação (mais recentes primeiro)
    todas.sort(
      (a, b) =>
        new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    );

    return todas;
  }, [ordensServico, ordensVenda]);

  const ordensFiltradas = useMemo(() => {
    return ordensUnificadas.filter((ordem) => {
      // Filtro de busca
      const searchLower = search.toLowerCase();
      const matchesSearch =
        ordem.cliente?.name_cliente.toLowerCase().includes(searchLower) ||
        ordem.cliente?.nome_empresa.toLowerCase().includes(searchLower) ||
        ordem.id.toString().includes(search) ||
        (ordem.tipo === 'servico' &&
          (ordem as OrdemServicoCompleta).veiculo?.placa
            .toLowerCase()
            .includes(searchLower));

      // Filtro de tipo
      const matchesType = filterType === 'all' || ordem.tipo === filterType;

      // Filtro de status
      const matchesStatus =
        filterStatus === 'all' || ordem.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [ordensUnificadas, search, filterType, filterStatus]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    startItem,
    endItem,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage,
    isLastPage,
    pageItems
  } = usePagination({ items: ordensFiltradas, itemsPerPage: 10 });

  // Handlers para ações de status
  const handleStatusChange = async (
    tipo: 'servico' | 'venda',
    id: number,
    newStatus: 'ativa' | 'fechada' | 'cancelada'
  ) => {
    if (tipo === 'servico') {
      await handleUpdateOrdemServico(id, { status: newStatus });
    } else {
      await handleUpdateOrdemVenda(id, { status: newStatus });
    }
  };

  // Handler para abrir modal de edição
  const handleEdit = (ordem: OrdemUnificada) => {
    if (ordem.tipo === 'servico') {
      setEditingServico(ordem as OrdemServicoCompleta);
    } else {
      setEditingVenda(ordem as OrdemVendaCompleta);
    }
  };

  // Handler para abrir modal de visualização
  const handleView = (ordem: OrdemUnificada) => {
    if (ordem.tipo === 'servico') {
      setViewingServico(ordem as OrdemServicoCompleta);
    } else {
      setViewingVenda(ordem as OrdemVendaCompleta);
    }
  };

  // Handler para confirmar exclusão
  const handleConfirmDelete = (tipo: 'servico' | 'venda', id: number) => {
    setDeleteId({ type: tipo, id });
    setIsDeleteOpen(true);
  };

  // Preparar dados para modais de edição
  const getServicoInitialData = (ordem: OrdemServicoCompleta | null) => {
    if (!ordem) return undefined;
    return {
      data_chegada: ordem.data_chegada.split('T')[0],
      data_saida: ordem.data_saida?.split('T')[0] || '',
      status: ordem.status,
      cliente_id: ordem.cliente_id,
      veiculo_id: ordem.veiculo_id,
      funcionario_id: ordem.funcionario_id,
      observacao: ordem.observacao || '',
      valor_total: ordem.valor_total,
      pecas: ordem.pecas.map((p) => ({
        peca_id: p.peca_id,
        quantidade: p.quantidade,
        peca: p.peca
          ? ({ ...p.peca, preco: p.peca.preco } as Peca | null)
          : null
      }))
    };
  };

  const getVendaInitialData = (ordem: OrdemVendaCompleta | null) => {
    if (!ordem) return undefined;
    return {
      data_pagamento: ordem.data_pagamento?.split('T')[0] || '',
      status: ordem.status,
      cliente_id: ordem.cliente_id,
      observacao: ordem.observacao || '',
      valor_total: ordem.valor_total,
      metodo_pagamento: ordem.metodo_pagamento || undefined,
      pecas: ordem.pecas.map((p) => ({
        peca_id: p.peca_id,
        quantidade: p.quantidade,
        peca: p.peca ? ({ ...p.peca, preco: p.peca.preco } as Peca) : null
      }))
    };
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>
            Ordens de Serviço e Venda
          </h2>
          <p className='text-muted-foreground'>
            Gerencie serviços e vendas de peças
          </p>
        </div>

        <DropdownMenu
          open={isNewOrderMenuOpen}
          onOpenChange={setIsNewOrderMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button className='bg-primary hover:bg-primary/90 w-32'>
              <Plus className='h-4 w-4 ' />
              Nova Ordem
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='bg-card border-border'>
            <DropdownMenuItem
              onClick={() => {
                setIsNewOrderMenuOpen(false);
                setIsAddServicoOpen(true);
              }}
              className='cursor-pointer'>
              <Wrench className='h-4 w-4 mr-2 text-primary' />
              Ordem de Serviço
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsNewOrderMenuOpen(false);
                setIsAddVendaOpen(true);
              }}
              className='cursor-pointer'>
              <ShoppingCart className='h-4 w-4 mr-2 text-primary' />
              Ordem de Venda
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Buscar por cliente, placa ou ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10 bg-input border-border'
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v: 'all' | 'servico' | 'venda') => setFilterType(v)}>
          <SelectTrigger className='bg-input border-border w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Todos os Tipos</SelectItem>
            <SelectItem value='servico'>Serviços</SelectItem>
            <SelectItem value='venda'>Vendas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='bg-input border-border w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            <SelectItem value='all'>Todos os Status</SelectItem>
            <SelectItem value='ativa'>Ativa</SelectItem>
            <SelectItem value='fechada'>Fechada</SelectItem>
            <SelectItem value='cancelada'>Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-4'>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Clock className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.ativas}
                </p>
                <p className='text-sm text-muted-foreground'>Ordens Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.fechadas}
                </p>
                <p className='text-sm text-muted-foreground'>Ordens Fechadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary'>
                <Wrench className='h-5 w-5 text-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.totalServico}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Ordens de Serviço
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary'>
                <ShoppingCart className='h-5 w-5 text-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.totalVenda}
                </p>
                <p className='text-sm text-muted-foreground'>Ordens de Venda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-foreground'>Lista de Ordens</CardTitle>
          <CardDescription>
            {ordensFiltradas.length} ordem(ns) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>Ordem</TableHead>
                  <TableHead className='text-muted-foreground hidden md:table-cell'>
                    Cliente
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden lg:table-cell'>
                    Veículo/Itens
                  </TableHead>
                  <TableHead className='text-muted-foreground text-center'>
                    Status
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right hidden sm:table-cell'>
                    Total
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right'>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className='border-border'>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Skeleton className='h-4 w-4' />
                          <div className='space-y-1'>
                            <Skeleton className='h-4 w-12' />
                            <Skeleton className='h-3 w-24' />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='space-y-1'>
                          <Skeleton className='h-4 w-32' />
                          <Skeleton className='h-3 w-24' />
                        </div>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        <Skeleton className='h-4 w-20' />
                      </TableCell>
                      <TableCell className='text-center'>
                        <Skeleton className='h-5 w-16 mx-auto' />
                      </TableCell>
                      <TableCell className='text-right hidden sm:table-cell'>
                        <Skeleton className='h-4 w-20 ml-auto' />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Skeleton className='h-8 w-8 ml-auto' />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((ordem) => {
                    const status = statusConfig[ordem.status];
                    const StatusIcon = status.icon;
                    const isServico = ordem.tipo === 'servico';

                    return (
                      <TableRow
                        key={`${ordem.tipo}-${ordem.id}`}
                        className='border-border'>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {isServico ? (
                              <Wrench className='h-4 w-4 text-primary' />
                            ) : (
                              <ShoppingCart className='h-4 w-4 text-primary' />
                            )}
                            <div>
                              <p className='font-medium text-foreground'>
                                #{ordem.id}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {formatDate(ordem.data_criacao)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          <p className='text-foreground'>
                            {ordem.cliente?.name_cliente || '-'}
                          </p>
                          {ordem.cliente?.nome_empresa && (
                            <p className='text-xs text-muted-foreground'>
                              {ordem.cliente.nome_empresa}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          {isServico ? (
                            <div>
                              <p className='text-foreground'>
                                {(ordem as OrdemServicoCompleta).veiculo
                                  ?.placa || '-'}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {(ordem as OrdemServicoCompleta).veiculo
                                  ?.modelo || '-'}
                              </p>
                            </div>
                          ) : (
                            <p className='text-muted-foreground'>
                              {ordem.pecas.length} item(ns)
                            </p>
                          )}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant='secondary'
                            className={status.className}>
                            <StatusIcon className='h-3 w-3 mr-1' />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right hidden sm:table-cell'>
                          <span className='font-medium text-foreground'>
                            {formatCurrency(ordem.valor_total)}
                          </span>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='h-4 w-4 text-muted-foreground' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='bg-card border-border w-40'>
                              <DropdownMenuItem
                                onClick={() => handleView(ordem)}
                                className='cursor-pointer'>
                                <Eye className='h-4 w-4 mr-2' />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {ordem.status === 'ativa' && (
                                <DropdownMenuItem
                                  onClick={() => handleEdit(ordem)}
                                  className='cursor-pointer'>
                                  <Pencil className='h-4 w-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                              )}

                              {ordem.status === 'ativa' && (
                                <>
                                  <DropdownMenuSeparator className='bg-border' />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        ordem.tipo,
                                        ordem.id,
                                        'fechada'
                                      )
                                    }
                                    className='cursor-pointer text-emerald-400'>
                                    <CheckCircle className='h-4 w-4 mr-2' />
                                    Finalizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        ordem.tipo,
                                        ordem.id,
                                        'cancelada'
                                      )
                                    }
                                    className='cursor-pointer text-destructive'>
                                    <XCircle className='h-4 w-4 mr-2' />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuSeparator className='bg-border' />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleConfirmDelete(ordem.tipo, ordem.id)
                                }
                                className='cursor-pointer text-destructive'>
                                <Trash2 className='h-4 w-4 mr-2' />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {ordensFiltradas.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          totalItems={ordensFiltradas.length}
          onPageChange={goToPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          pageItems={pageItems}
          itemLabel='ordens'
        />
      )}

      {/* Modais */}
      {/* Modal Nova Ordem de Serviço */}
      <ModalOrdemServico
        mode='create'
        clientes={clientes}
        veiculos={veiculos}
        pecas={pecas}
        isOpen={isAddServicoOpen}
        setIsOpen={setIsAddServicoOpen}
        onSubmit={async (data) => {
          await handleAddOrdemServico(data as NovaOrdemServico);
        }}
        isLoading={isLoading}
        getVeiculosByCliente={getVeiculosByCliente}
      />

      {/* Modal Editar Ordem de Serviço */}
      <ModalOrdemServico
        mode='edit'
        initialData={getServicoInitialData(editingServico)}
        clientes={clientes}
        veiculos={veiculos}
        pecas={pecas}
        isOpen={!!editingServico}
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

      {/* Modal Nova Ordem de Venda */}
      <ModalOrdemVenda
        mode='create'
        clientes={clientes}
        pecas={pecas}
        isOpen={isAddVendaOpen}
        setIsOpen={setIsAddVendaOpen}
        onSubmit={async (data) => {
          await handleAddOrdemVenda(data as NovaOrdemVenda);
        }}
        isLoading={isLoading}
      />

      {/* Modal Editar Ordem de Venda */}
      <ModalOrdemVenda
        mode='edit'
        initialData={getVendaInitialData(editingVenda)}
        clientes={clientes}
        pecas={pecas}
        isOpen={!!editingVenda}
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

      {/* Modal Detalhes Ordem de Serviço */}
      <ModalDetalhesOrdem
        type='servico'
        ordem={viewingServico}
        isOpen={!!viewingServico}
        setIsOpen={(open) => !open && setViewingServico(null)}
        onUpdateStatus={(status) => {
          if (viewingServico) {
            handleUpdateOrdemServico(viewingServico.id, { status });
          }
        }}
        isLoading={isLoading}
      />

      {/* Modal Detalhes Ordem de Venda */}
      <ModalDetalhesOrdem
        type='venda'
        ordem={viewingVenda}
        isOpen={!!viewingVenda}
        setIsOpen={(open) => !open && setViewingVenda(null)}
        onUpdateStatus={(status) => {
          if (viewingVenda) {
            handleUpdateOrdemVenda(viewingVenda.id, { status });
          }
        }}
        isLoading={isLoading}
      />

      {/* Modal Delete */}
      <ModalDelete
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title='Excluir Ordem'
        description='Tem certeza que deseja excluir esta ordem? Esta ação não pode ser desfeita.'
      />
    </div>
  );
}
