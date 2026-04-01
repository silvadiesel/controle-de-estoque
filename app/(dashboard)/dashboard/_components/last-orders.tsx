// app/(dashboard)/dashboard/_components/last-orders.tsx
'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';

export interface OrdemServicoItem {
  id: number;
  data_criacao: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente: { name_cliente: string; nome_empresa: string | null } | null;
  veiculo: { placa: string; modelo: string } | null;
}

export interface OrdemVendaItem {
  id: number;
  data_criacao: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  metodo_pagamento:
    | 'pix'
    | 'boleto'
    | 'cheque'
    | 'debito'
    | 'credito'
    | 'dinheiro'
    | null;
  cliente: { name_cliente: string; nome_empresa: string | null } | null;
}

const STATUS_STYLES: Record<string, string> = {
  ativa: 'bg-success/15 text-success',
  fechada: 'bg-primary/15 text-primary',
  cancelada: 'bg-destructive/15 text-destructive'
};

const STATUS_LABELS: Record<string, string> = {
  ativa: 'Ativa',
  fechada: 'Fechada',
  cancelada: 'Cancelada'
};

const PAGAMENTO_LABELS: Record<string, string> = {
  pix: 'Pix',
  boleto: 'Boleto',
  cheque: 'Cheque',
  debito: 'Débito',
  credito: 'Crédito',
  dinheiro: 'Dinheiro'
};

function formatDate(isoDate: string): string {
  return format(new Date(isoDate), 'dd/MM/yy', { locale: ptBR });
}

function getClientName(
  cliente: { name_cliente: string; nome_empresa: string | null } | null
): string {
  if (!cliente) return '—';
  return cliente.nome_empresa ?? cliente.name_cliente;
}

interface LastOrdersProps {
  ordensServico: OrdemServicoItem[];
  ordensVenda: OrdemVendaItem[];
  isLoading: boolean;
  servicoState?: 'ready' | 'unavailable';
  vendaState?: 'ready' | 'unavailable';
}

type Tab = 'servico' | 'venda';

const HEADER_CELL = 'text-xs font-semibold tracking-wider uppercase py-2' as const;
const COL_CLIENTE = 'flex-[2]' as const;
const COL_CONTEXT = 'hidden sm:block flex-[1.5]' as const;
const COL_DATA = 'hidden sm:block flex-1' as const;
const COL_STATUS = 'flex-1' as const;
const COL_ARROW = 'w-7 flex-shrink-0' as const;

export function LastOrders({
  ordensServico,
  ordensVenda,
  isLoading,
  servicoState = 'ready',
  vendaState = 'ready'
}: LastOrdersProps) {
  const [tab, setTab] = useState<Tab>('servico');

  const servicoItems = ordensServico.slice(0, 5);
  const vendaItems = ordensVenda.slice(0, 5);

  const activeState = tab === 'servico' ? servicoState : vendaState;

  return (
    <div className='bg-card border border-border rounded-xl p-5'>
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold leading-tight text-foreground'>Últimas Ordens</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>5 mais recentes</p>
        </div>
        <Link
          href='/ordens'
          className='text-sm text-primary hover:underline flex items-center gap-1'>
          Ver todas
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Tabs */}
      <div role='tablist' className='flex gap-1 border-b border-border mb-4'>
        <button
          type='button'
          role='tab'
          aria-selected={tab === 'servico'}
          onClick={() => setTab('servico')}
          className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
            tab === 'servico'
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-primary'
          }`}>
          Serviço
        </button>
        <button
          type='button'
          role='tab'
          aria-selected={tab === 'venda'}
          onClick={() => setTab('venda')}
          className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
            tab === 'venda'
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-primary'
          }`}>
          Venda
        </button>
      </div>

      {/* Table Header */}
      {activeState === 'ready' &&
        (tab === 'servico'
          ? servicoItems.length > 0
          : vendaItems.length > 0) && (
          <div className='flex gap-3 px-2.5 mb-1 text-muted-foreground'>
            <span className={`${HEADER_CELL} ${COL_CLIENTE}`}>Cliente</span>
            <span className={`${HEADER_CELL} ${COL_CONTEXT}`}>
              {tab === 'servico' ? 'Veículo' : 'Pagamento'}
            </span>
            <span className={`${HEADER_CELL} ${COL_DATA}`}>Data</span>
            <span className={`${HEADER_CELL} ${COL_STATUS}`}>Status</span>
            <span className={COL_ARROW} />
          </div>
        )}

      {/* Rows */}
      {isLoading ? (
        <div className='flex flex-col gap-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-9 w-full rounded-md' />
          ))}
        </div>
      ) : activeState === 'unavailable' ? (
        <Empty className='border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Dados indisponíveis</EmptyTitle>
            <EmptyDescription>
              Esse bloco não pode ser carregado agora.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : tab === 'servico' ? (
        servicoItems.length === 0 ? (
          <p className='text-xs text-muted-foreground py-8 text-center'>
            Nenhuma ordem de serviço encontrada
          </p>
        ) : (
          <div className='flex flex-col'>
            {servicoItems.map((ordem) => (
              <Link
                key={ordem.id}
                href='/ordens'
                aria-label={`Ver ordem de serviço #${ordem.id}`}
                className='flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent transition-colors group'>
                <span
                  className={`${COL_CLIENTE} text-sm text-foreground truncate`}>
                  {getClientName(ordem.cliente)}
                </span>
                <span
                  className={`${COL_CONTEXT} text-sm text-muted-foreground truncate`}>
                  {ordem.veiculo
                    ? `${ordem.veiculo.modelo} · ${ordem.veiculo.placa}`
                    : '—'}
                </span>
                <span className={`${COL_DATA} text-sm text-muted-foreground`}>
                  {formatDate(ordem.data_criacao)}
                </span>
                <span className={COL_STATUS}>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[ordem.status] ?? ''}`}>
                    {STATUS_LABELS[ordem.status] ?? ordem.status}
                  </span>
                </span>
                <span className={`${COL_ARROW} flex justify-end`}>
                  <ArrowRight
                    size={13}
                    className='text-primary opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </span>
              </Link>
            ))}
          </div>
        )
      ) : vendaItems.length === 0 ? (
        <p className='text-xs text-muted-foreground py-8 text-center'>
          Nenhuma ordem de venda encontrada
        </p>
      ) : (
        <div className='flex flex-col'>
          {vendaItems.map((ordem) => (
            <Link
              key={ordem.id}
              href='/ordens'
              aria-label={`Ver ordem de venda #${ordem.id}`}
              className='flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent transition-colors group'>
              <span
                className={`${COL_CLIENTE} text-sm text-foreground truncate`}>
                {getClientName(ordem.cliente)}
              </span>
              <span
                className={`${COL_CONTEXT} text-sm text-muted-foreground truncate`}>
                {ordem.metodo_pagamento
                  ? (PAGAMENTO_LABELS[ordem.metodo_pagamento] ??
                    ordem.metodo_pagamento)
                  : '—'}
              </span>
              <span className={`${COL_DATA} text-sm text-muted-foreground`}>
                {formatDate(ordem.data_criacao)}
              </span>
              <span className={COL_STATUS}>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[ordem.status] ?? ''}`}>
                  {STATUS_LABELS[ordem.status] ?? ordem.status}
                </span>
              </span>
              <span className={`${COL_ARROW} flex justify-end`}>
                <ArrowRight
                  size={13}
                  className='text-primary opacity-0 group-hover:opacity-100 transition-opacity'
                />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
