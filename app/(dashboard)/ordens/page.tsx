'use client';

import { useMemo, useState } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Pencil,
  Search,
  ShoppingCart,
  Trash2,
  Wrench,
  XCircle
} from 'lucide-react';

type OrdemUnificada =
  | (OrdemServicoCompleta & { tipo: 'servico' })
  | (OrdemVendaCompleta & { tipo: 'venda' });

const formatCurrency = (value: number) => {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const formatDateShort = (date: string) => {
  return format(new Date(date), 'dd/MM/yy', { locale: ptBR });
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
    filterMonth,
    setFilterMonth,
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

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();
    ordensUnificadas.forEach((ordem) => {
      const date = new Date(ordem.data_criacao);
      meses.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      );
    });
    return Array.from(meses).sort().reverse();
  }, [ordensUnificadas]);

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
            .includes(searchLower)) ||
        (ordem.tipo === 'servico' &&
          ((ordem as OrdemServicoCompleta).funcionario?.name
            ?.toLowerCase()
            .includes(searchLower) ||
            (ordem as OrdemServicoCompleta).funcionario_responsavel?.name
              ?.toLowerCase()
              .includes(searchLower)));
      const matchesType = filterType === 'all' || ordem.tipo === filterType;
      const matchesStatus =
        filterStatus === 'all' || ordem.status === filterStatus;
      const matchesMonth =
        filterMonth === 'all' ||
        (() => {
          const date = new Date(ordem.data_criacao);
          const ordemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return ordemMonth === filterMonth;
        })();
      return matchesSearch && matchesType && matchesStatus && matchesMonth;
    });
  }, [ordensUnificadas, search, filterType, filterStatus, filterMonth]);

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
    <div className='flex flex-1 flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <div className='h-7 w-1 rounded-full bg-primary' />
            <h1 className='text-2xl font-bold text-foreground'>
              Ordens de Serviço e Venda
            </h1>
          </div>
          <p className='pl-3.5 text-sm text-[#71717a]'>
            Gerencie serviços e vendas de peças
          </p>
        </div>

        <div className='flex flex-col md:flex-row gap-2'>
          <Button onClick={() => setIsAddServicoOpen(true)}>
            <Wrench className='h-4 w-4' />
            Nova Ordem de Serviço
          </Button>
          <Button onClick={() => setIsAddVendaOpen(true)}>
            <ShoppingCart className='h-4 w-4' />
            Nova Ordem de Venda
          </Button>
        </div>
      </div>

      {/* Stats - 4 cols, simple label+number */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-[#18181b] border border-[#27272a] rounded-[10px] px-4 py-3'>
          <p className='text-sm text-[#71717a]'>Ativas</p>
          <p className='text-2xl font-bold text-foreground'>{stats.ativas}</p>
        </div>
        <div className='bg-[#18181b] border border-[#27272a] rounded-[10px] px-4 py-3'>
          <p className='text-sm text-[#71717a]'>Fechadas</p>
          <p className='text-2xl font-bold text-foreground'>{stats.fechadas}</p>
        </div>
        <div className='bg-[#18181b] border border-[#27272a] rounded-[10px] px-4 py-3'>
          <p className='text-sm text-[#71717a]'>Serviço</p>
          <p className='text-2xl font-bold text-foreground'>
            {stats.totalServico}
          </p>
        </div>
        <div className='bg-[#18181b] border border-[#27272a] rounded-[10px] px-4 py-3'>
          <p className='text-sm text-[#71717a]'>Venda</p>
          <p className='text-2xl font-bold text-foreground'>
            {stats.totalVenda}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]' />
          <Input
            placeholder='Buscar por cliente, funcionário, placa ou ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10 bg-[#131316] border-[#27272a]'
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v: 'all' | 'servico' | 'venda') => setFilterType(v)}>
          <SelectTrigger className='bg-[#131316] md:flex hidden border-[#27272a] w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-[#18181b] border-[#27272a]'>
            <SelectItem value='all'>Todos os Tipos</SelectItem>
            <SelectItem value='servico'>Serviços</SelectItem>
            <SelectItem value='venda'>Vendas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='bg-[#131316] border-[#27272a] w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-[#18181b] border-[#27272a]'>
            <SelectItem value='all'>Todos os Status</SelectItem>
            <SelectItem value='ativa'>Ativa</SelectItem>
            <SelectItem value='fechada'>Fechada</SelectItem>
            <SelectItem value='cancelada'>Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className='bg-[#131316] border-[#27272a] w-full sm:w-48'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-[#18181b] border-[#27272a]'>
            <SelectItem value='all'>Todos os Meses</SelectItem>
            {mesesDisponiveis.map((mes) => {
              const [year, month] = mes.split('-');
              const date = new Date(Number(year), Number(month) - 1);
              const label = format(date, 'MMMM yyyy', { locale: ptBR });
              return (
                <SelectItem key={mes} value={mes}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className='flex flex-col gap-2'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='bg-[#18181b] border border-[#27272a] rounded-[10px] p-4'>
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
          <div className='flex flex-col items-center justify-center py-16 text-[#71717a]'>
            <Package className='h-8 w-8 mb-2 opacity-25' />
            <p className='text-sm'>Nenhuma ordem encontrada</p>
          </div>
        ) : (
          paginatedItems.map((ordem) => {
            const key = `${ordem.tipo}-${ordem.id}`;
            const isExpanded = expandedId === key;
            const isServico = ordem.tipo === 'servico';
            const ordemServico = isServico
              ? (ordem as OrdemServicoCompleta)
              : null;
            const isCancelada = ordem.status === 'cancelada';

            return (
              <div
                key={key}
                className={`bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden ${isCancelada ? 'opacity-50' : ''}`}>
                {/* Card header */}
                <div
                  className='flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#1c1c22]/50 transition-colors'
                  onClick={() => toggleExpand(key)}>
                  {/* Left side bar + Type badge */}
                  <div
                    className={`self-stretch w-[3px] rounded-full shrink-0 ${isServico ? 'bg-primary' : 'bg-[#71717a]'}`}
                  />

                  {/* Type badge */}
                  {isServico ? (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary shrink-0'>
                      <Clock className='h-3 w-3' />
                      Serviço
                    </span>
                  ) : (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[rgba(113,113,122,0.15)] text-[#a1a1aa] shrink-0'>
                      <ShoppingCart className='h-3 w-3' />
                      Venda
                    </span>
                  )}

                  {/* Number */}
                  <span
                    className={`text-[15px] font-bold text-foreground shrink-0 ${isCancelada ? 'line-through' : ''}`}>
                    #{ordem.id}
                  </span>

                  {/* Cliente */}
                  <div className='flex-1 min-w-0'>
                    <p
                      className={`text-sm text-foreground truncate ${isCancelada ? 'line-through' : ''}`}>
                      {ordem.cliente?.name_cliente || '-'}
                    </p>
                  </div>

                  {/* Status */}
                  {ordem.status === 'ativa' && (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[#27272a] text-[#a1a1aa] shrink-0'>
                      Ativa
                    </span>
                  )}
                  {ordem.status === 'fechada' && (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[#1c1c22] text-[#71717a] shrink-0'>
                      Fechada
                    </span>
                  )}
                  {ordem.status === 'cancelada' && (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[#1c1c22] text-[#71717a] shrink-0 line-through'>
                      Cancelada
                    </span>
                  )}

                  {/* Valor */}
                  <div className='min-w-[100px] text-right'>
                    <span
                      className={`text-[18px] font-bold ${
                        isCancelada
                          ? 'text-[#71717a] line-through'
                          : 'text-primary'
                      }`}>
                      {formatCurrency(ordem.valor_total)}
                    </span>
                  </div>

                  {/* Chevron */}
                  {isExpanded ? (
                    <ChevronUp className='h-5 w-5 text-[#71717a] shrink-0' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-[#71717a] shrink-0' />
                  )}
                </div>

                {/* Info grid below header */}
                {!isExpanded && (
                  <div className='px-5 pb-3 -mt-1'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      {isServico && ordemServico ? (
                        <>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Cliente
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Veículo
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {ordemServico.veiculo?.placa || '-'}{' '}
                              {ordemServico.veiculo?.modelo
                                ? `- ${ordemServico.veiculo.modelo}`
                                : ''}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Responsável
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {funcionarios.find(
                                (f) =>
                                  f.id ===
                                  ordemServico?.funcionario_responsavel_id
                              )?.name || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Data
                            </p>
                            <p className='text-xs text-[#a1a1aa]'>
                              {formatDateShort(ordem.data_criacao)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Cliente
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Pagamento
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {(
                                ordem as OrdemVendaCompleta
                              ).metodo_pagamento?.toUpperCase() || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Responsável
                            </p>
                            <p className='text-xs text-[#a1a1aa] truncate'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                              Data
                            </p>
                            <p className='text-xs text-[#a1a1aa]'>
                              {formatDateShort(ordem.data_criacao)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className='border-t border-[#27272a] px-5 py-4 bg-[#131316]/50'>
                    {/* Info row */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                      {isServico && ordemServico ? (
                        <>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Cliente
                            </p>
                            <p className='text-sm text-foreground'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Veículo
                            </p>
                            <p className='text-sm text-foreground'>
                              {ordemServico.veiculo?.placa || '-'}{' '}
                              {ordemServico.veiculo?.modelo
                                ? `- ${ordemServico.veiculo.modelo}`
                                : ''}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Responsável
                            </p>
                            <p className='text-sm text-foreground'>
                              {funcionarios.find(
                                (f) =>
                                  f.id ===
                                  ordemServico?.funcionario_responsavel_id
                              )?.name || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Data Chegada
                            </p>
                            <p className='text-sm text-foreground'>
                              {formatDateFull(ordemServico.data_chegada)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Cliente
                            </p>
                            <p className='text-sm text-foreground'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Pagamento
                            </p>
                            <p className='text-sm text-foreground'>
                              {(
                                ordem as OrdemVendaCompleta
                              ).metodo_pagamento?.toUpperCase() || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Responsável
                            </p>
                            <p className='text-sm text-foreground'>
                              {ordem.cliente?.name_cliente || '-'}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                              Data
                            </p>
                            <p className='text-sm text-foreground'>
                              {formatDateFull(ordem.data_criacao)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Criado por + Observação */}
                    <div className='flex gap-6 mb-4 flex-wrap'>
                      {isServico && ordemServico && (
                        <div>
                          <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
                            Criado por
                          </p>
                          <p className='text-sm text-foreground'>
                            {ordemServico.funcionario?.name || '-'}
                          </p>
                        </div>
                      )}
                      {ordem.observacao && (
                        <div className='flex-1 min-w-[200px]'>
                          <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1'>
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
                        <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5'>
                          <Package className='h-3.5 w-3.5' />
                          Peças ({ordem.pecas.length})
                        </p>
                        <div className='flex flex-col gap-1.5'>
                          {ordem.pecas.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className='flex justify-between items-center bg-[#09090B]/60 px-4 py-2.5 rounded-md'>
                              <span className='text-sm text-foreground'>
                                {item.peca?.name_peca || 'Peça não encontrada'}
                              </span>
                              <div className='flex gap-5'>
                                <span className='text-xs text-[#71717a]'>
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
                              className='text-xs text-primary py-2 border border-dashed border-[#27272a] rounded-md hover:bg-[#1c1c22]/30 transition-colors'>
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
                            <CheckCircle className='h-4 w-4 text-success' />
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
