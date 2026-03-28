'use client';

import { useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Pencil,
  Search,
  ShoppingCart,
  Trash2,
  User,
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

const formatDateShort = (date: string) => {
  return format(new Date(date), 'dd/MM', { locale: ptBR });
};

const formatDateFull = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

export default function Ordens() {
  const {
    ordensServico,
    ordensVenda,
    clientes,
    veiculos,
    pecas,
    funcionarios,
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

  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    todas.sort(
      (a, b) =>
        new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    );
    return todas;
  }, [ordensServico, ordensVenda]);

  const ordensFiltradas = useMemo(() => {
    return ordensUnificadas.filter((ordem) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        ordem.cliente?.name_cliente.toLowerCase().includes(searchLower) ||
        ordem.cliente?.nome_empresa.toLowerCase().includes(searchLower) ||
        ordem.id.toString().includes(search) ||
        (ordem.tipo === 'servico' &&
          (ordem as OrdemServicoCompleta).veiculo?.placa
            .toLowerCase()
            .includes(searchLower));
      const matchesType = filterType === 'all' || ordem.tipo === filterType;
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

  const handleEdit = (ordem: OrdemUnificada) => {
    if (ordem.tipo === 'servico') {
      setEditingServico(ordem as OrdemServicoCompleta);
    } else {
      setEditingVenda(ordem as OrdemVendaCompleta);
    }
  };

  const handleView = (ordem: OrdemUnificada) => {
    if (ordem.tipo === 'servico') {
      setViewingServico(ordem as OrdemServicoCompleta);
    } else {
      setViewingVenda(ordem as OrdemVendaCompleta);
    }
  };

  const handleConfirmDelete = (tipo: 'servico' | 'venda', id: number) => {
    setDeleteId({ type: tipo, id });
    setIsDeleteOpen(true);
  };

  const getServicoInitialData = (ordem: OrdemServicoCompleta | null) => {
    if (!ordem) return undefined;
    return {
      data_chegada: ordem.data_chegada.split('T')[0],
      data_saida: ordem.data_saida?.split('T')[0] || '',
      status: ordem.status,
      cliente_id: ordem.cliente_id,
      veiculo_id: ordem.veiculo_id,
      funcionario_id: ordem.funcionario_id,
      funcionario_responsavel_id: ordem.funcionario_responsavel_id,
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

  const toggleExpand = (key: string) => {
    setExpandedId((prev) => (prev === key ? null : key));
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <div className='h-7 w-1 rounded-full bg-primary' />
            <h2 className='text-2xl font-bold text-foreground'>
              Ordens de Serviço e Venda
            </h2>
          </div>
          <p className='pl-3.5 text-sm text-muted-foreground'>
            Gerencie serviços e vendas de peças
          </p>
        </div>

        <div className='flex gap-2'>
          <Button
            onClick={() => setIsAddServicoOpen(true)}
            className='bg-primary hover:bg-primary/90'>
            <Wrench className='h-4 w-4' />
            Nova Ordem de Serviço
          </Button>
          <Button variant='outline' onClick={() => setIsAddVendaOpen(true)}>
            <ShoppingCart className='h-4 w-4' />
            Nova Ordem de Venda
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-4'>
        <Card className='bg-card border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-yellow-500/50' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10'>
                <Clock className='h-5 w-5 text-yellow-500' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.ativas}
                </p>
                <p className='text-sm text-muted-foreground'>Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-emerald-500/50' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.fechadas}
                </p>
                <p className='text-sm text-muted-foreground'>Fechadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-primary/40' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
                <Wrench className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.totalServico}
                </p>
                <p className='text-sm text-muted-foreground'>Serviço</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-primary/40' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
                <ShoppingCart className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.totalVenda}
                </p>
                <p className='text-sm text-muted-foreground'>Venda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row'>
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

      {/* Orders List */}
      <div className='flex flex-col gap-2'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='bg-card border border-border rounded-lg p-4'>
              <div className='flex items-center gap-4'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-5 w-12' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-24 hidden lg:block' />
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-4 w-24 hidden md:block' />
                <Skeleton className='h-5 w-20 ml-auto' />
              </div>
            </div>
          ))
        ) : paginatedItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <Package className='h-8 w-8 mb-2 opacity-25' />
            <p className='text-sm'>Nenhuma ordem encontrada</p>
          </div>
        ) : (
          paginatedItems.map((ordem) => {
            const key = `${ordem.tipo}-${ordem.id}`;
            const isExpanded = expandedId === key;
            const status = statusConfig[ordem.status];
            const StatusIcon = status.icon;
            const isServico = ordem.tipo === 'servico';
            const ordemServico = isServico
              ? (ordem as OrdemServicoCompleta)
              : null;

            return (
              <div
                key={key}
                className='bg-card border border-border rounded-lg overflow-hidden'>
                {/* Card header */}
                <div
                  className='flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors'
                  onClick={() => toggleExpand(key)}>
                  {/* Tipo + Numero */}
                  <div className='flex items-center gap-2.5 min-w-[85px]'>
                    {isServico ? (
                      <Wrench className='h-5 w-5 text-primary shrink-0' />
                    ) : (
                      <ShoppingCart className='h-5 w-5 text-teal-400 shrink-0' />
                    )}
                    <div>
                      <p className='text-base font-semibold text-foreground'>
                        #{ordem.id}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDateShort(ordem.data_criacao)}
                      </p>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-foreground truncate'>
                      {ordem.cliente?.name_cliente || '-'}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {ordem.cliente?.nome_empresa || '—'}
                    </p>
                  </div>

                  {/* Veiculo (OS) ou Itens (OV) */}
                  <div className='hidden lg:flex items-center gap-2 min-w-[140px]'>
                    {isServico && ordemServico ? (
                      <>
                        <Car className='h-4 w-4 text-muted-foreground shrink-0' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            {ordemServico.veiculo?.placa || '-'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {ordemServico.veiculo?.modelo || '-'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        {ordem.pecas.length}{' '}
                        {ordem.pecas.length === 1 ? 'item' : 'itens'}
                        {(ordem as OrdemVendaCompleta).metodo_pagamento &&
                          ` · ${(ordem as OrdemVendaCompleta).metodo_pagamento?.toUpperCase()}`}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <Badge
                    variant='secondary'
                    className={`${status.className} text-xs gap-1.5 shrink-0 py-1 px-2.5`}>
                    <StatusIcon className='h-3.5 w-3.5' />
                    {status.label}
                  </Badge>

                  {/* Responsavel */}
                  <div className='hidden md:flex items-center gap-2 min-w-[120px]'>
                    <User className='h-4 w-4 text-muted-foreground shrink-0' />
                    <span className='text-sm text-muted-foreground truncate'>
                      {isServico
                        ? funcionarios.find((f) => f.id === ordemServico?.funcionario_responsavel_id)?.name || '-'
                        : ordem.cliente?.name_cliente || '-'}
                    </span>
                  </div>

                  {/* Valor */}
                  <div className='min-w-[100px] text-right'>
                    <span
                      className={`text-base font-semibold ${
                        ordem.status === 'cancelada'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}>
                      {formatCurrency(ordem.valor_total)}
                    </span>
                  </div>

                  {/* Chevron */}
                  {isExpanded ? (
                    <ChevronUp className='h-5 w-5 text-muted-foreground shrink-0' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-muted-foreground shrink-0' />
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className='border-t border-border px-5 py-4 bg-muted/20'>
                    {/* Info row */}
                    <div className='flex gap-6 mb-4 flex-wrap'>
                      {isServico && ordemServico && (
                        <>
                          <div>
                            <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>
                              Data Chegada
                            </p>
                            <p className='text-sm text-foreground'>
                              {formatDateFull(ordemServico.data_chegada)}
                            </p>
                          </div>
                          <div className='lg:hidden'>
                            <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>
                              Veículo
                            </p>
                            <p className='text-sm text-foreground'>
                              {ordemServico.veiculo?.placa || '-'}{' '}
                              {ordemServico.veiculo?.modelo
                                ? `- ${ordemServico.veiculo.modelo}`
                                : ''}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>
                          Criado por
                        </p>
                        <p className='text-sm text-foreground'>
                          {isServico
                            ? ordemServico?.funcionario?.name || '-'
                            : '-'}
                        </p>
                      </div>
                      {ordem.observacao && (
                        <div className='flex-1 min-w-[200px]'>
                          <p className='text-xs text-muted-foreground uppercase tracking-wider mb-1'>
                            Observação
                          </p>
                          <p className='text-sm text-foreground'>
                            {ordem.observacao}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pecas */}
                    {ordem.pecas.length > 0 && (
                      <div>
                        <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5'>
                          <Package className='h-3.5 w-3.5' />
                          Peças ({ordem.pecas.length})
                        </p>
                        <div className='flex flex-col gap-1.5'>
                          {ordem.pecas.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className='flex justify-between items-center bg-background/60 px-4 py-2.5 rounded-md'>
                              <span className='text-sm text-foreground'>
                                {item.peca?.name_peca || 'Peça não encontrada'}
                              </span>
                              <div className='flex gap-5'>
                                <span className='text-xs text-muted-foreground'>
                                  x{item.quantidade}
                                </span>
                                <span className='text-sm text-foreground font-medium min-w-[80px] text-right'>
                                  {formatCurrency(
                                    (item.peca?.preco || 0) * item.quantidade
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                          {ordem.pecas.length > 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(ordem);
                              }}
                              className='text-xs text-primary py-2 border border-dashed border-border rounded-md hover:bg-muted/30 transition-colors'>
                              +{ordem.pecas.length - 2}{' '}
                              {ordem.pecas.length - 2 === 1 ? 'peça' : 'peças'}{' '}
                              — Ver detalhes completos
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex gap-2 mt-4 items-center justify-end'>
                      {ordem.status === 'ativa' && (
                        <Button
                          variant='outline'
                          size='default'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(ordem);
                          }}>
                          <Pencil className='h-3.5 w-3.5' />
                          Editar
                        </Button>
                      )}
                      {ordem.status === 'ativa' && (
                        <>
                          <Button
                            variant='outline'
                            size='default'
                            title='Finalizar'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                ordem.tipo,
                                ordem.id,
                                'fechada'
                              );
                            }}>
                            <CheckCircle className='h-4 w-4 text-emerald-500' />
                            Finalizar
                          </Button>
                          <Button
                            variant='outline'
                            size='default'
                            title='Cancelar'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                ordem.tipo,
                                ordem.id,
                                'cancelada'
                              );
                            }}>
                            <XCircle className='h-4 w-4 text-destructive' />
                            Cancelar
                          </Button>
                        </>
                      )}
                      <Button
                        variant='outline'
                        size='default'
                        title='Excluir'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(ordem.tipo, ordem.id);
                        }}>
                        <Trash2 className='h-4 w-4 text-destructive' />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
            // erro já tratado pelo hook
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
        pecas={pecas}
        funcionarios={funcionarios}
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
            // erro já tratado pelo hook
          }
        }}
        isLoading={isLoading}
      />

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
