'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type {
  OrdemServicoCompleta,
  OrdemVendaCompleta
} from '../_hooks/useOrdens';
import { OrdemStatusBadge } from './ordem-status-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  Package,
  Pencil,
  ShoppingCart,
  Trash2,
  Wrench,
  XCircle
} from 'lucide-react';

type OrdemCardProps =
  | {
      tipo: 'servico';
      ordem: OrdemServicoCompleta;
      expanded: boolean;
      onToggle: () => void;
      onEdit: () => void;
      onDelete: () => void;
      onFinalize: () => void;
      onCancel: () => void;
      isBusy?: boolean;
    }
  | {
      tipo: 'venda';
      ordem: OrdemVendaCompleta;
      expanded: boolean;
      onToggle: () => void;
      onEdit: () => void;
      onDelete: () => void;
      onFinalize: () => void;
      onCancel: () => void;
      isBusy?: boolean;
    };

const formatCurrency = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const formatDate = (
  date: string | null | undefined,
  formatter = 'dd/MM/yyyy'
) => (date ? format(new Date(date), formatter, { locale: ptBR }) : '-');

const paymentMethodLabel: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cheque: 'Cheque',
  debito: 'Débito',
  credito: 'Crédito',
  dinheiro: 'Dinheiro'
};

function OrdemInfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-card px-3 py-2.5'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
        {label}
      </p>
      <p className='mt-1 text-sm text-foreground'>{value}</p>
    </div>
  );
}

export function OrdemCard(props: OrdemCardProps) {
  const {
    ordem,
    tipo,
    expanded,
    onToggle,
    onEdit,
    onDelete,
    onFinalize,
    onCancel,
    isBusy = false
  } = props;

  const headerMeta = useMemo(() => {
    if (tipo === 'servico') {
      const responsavel =
        props.ordem.funcionario_responsavel?.name ?? 'Sem responsável';
      const veiculo = [props.ordem.veiculo?.placa, props.ordem.veiculo?.modelo]
        .filter(Boolean)
        .join(' · ');

      return [veiculo, `Resp. ${responsavel}`].filter(Boolean).join(' · ');
    }

    return [
      paymentMethodLabel[props.ordem.metodo_pagamento ?? ''] ??
        'Método não informado',
      props.ordem.cliente?.nome_empresa || 'Cliente sem empresa'
    ]
      .filter(Boolean)
      .join(' · ');
  }, [props, tipo]);

  const Icon = tipo === 'servico' ? Wrench : ShoppingCart;
  const cardLabel = tipo === 'servico' ? 'OS' : 'OV';
  const isActive = ordem.status === 'ativa';

  return (
    <Collapsible open={expanded}>
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-card transition-colors',
          'hover:border-border-hover',
          expanded && 'border-border-hover'
        )}>
        {/* Header */}
        <div className='flex items-start gap-4 px-5 py-4'>
          {/* Toggle area */}
          <button
            type='button'
            onClick={onToggle}
            className='group flex min-w-0 flex-1 items-start gap-4 text-left outline-none transition-colors hover:text-foreground focus-visible:text-foreground'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-sm font-semibold text-primary transition-colors group-hover:border-border-hover'>
              <Icon className='size-4' />
            </div>

            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              {/* Primary row */}
              <div className='flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-foreground'>
                    {cardLabel} #{ordem.id} ·{' '}
                    {ordem.cliente?.name_cliente || 'Cliente não encontrado'}
                  </p>
                  <p className='mt-1 truncate text-sm text-muted-foreground'>
                    {headerMeta}
                  </p>
                </div>

                <div className='flex shrink-0 items-center gap-3'>
                  <OrdemStatusBadge status={ordem.status} />
                  <div className='text-right'>
                    <p className='text-[10px] uppercase tracking-[0.08em] text-muted-foreground'>
                      Total
                    </p>
                    <p className='text-sm font-semibold text-foreground'>
                      {formatCurrency(ordem.valor_total)}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
                      expanded && 'rotate-180 text-foreground'
                    )}
                  />
                </div>
              </div>

              {/* Secondary row */}
              <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                <span>
                  {tipo === 'servico'
                    ? `Chegada ${formatDate((props.ordem as OrdemServicoCompleta).data_chegada)}`
                    : `Criada ${formatDate(ordem.data_criacao)}`}
                </span>
                <span>
                  {ordem.pecas.length}{' '}
                  {ordem.pecas.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>
          </button>

          {/* Desktop actions */}
          <div className='hidden shrink-0 items-center gap-1 lg:flex'>
            {isActive && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      onClick={onEdit}
                      aria-label='Editar ordem'>
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
                      onClick={onFinalize}
                      disabled={isBusy}
                      aria-label='Finalizar ordem'>
                      <CheckCircle2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Finalizar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      onClick={onCancel}
                      disabled={isBusy}
                      aria-label='Cancelar ordem'>
                      <XCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancelar</TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={onDelete}
                  disabled={isBusy}
                  aria-label='Excluir ordem'>
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile actions */}
          <div className='flex shrink-0 items-center lg:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label='Ações da ordem'>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='bg-card border-border rounded-xl p-1.5'>
                {isActive && (
                  <>
                    <DropdownMenuItem
                      onClick={onEdit}
                      className='rounded-lg px-3 py-2'>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onFinalize}
                      disabled={isBusy}
                      className='rounded-lg px-3 py-2'>
                      <CheckCircle2 />
                      Finalizar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onCancel}
                      disabled={isBusy}
                      className='rounded-lg px-3 py-2'>
                      <XCircle />
                      Cancelar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className='bg-border' />
                  </>
                )}
                <DropdownMenuItem
                  variant='destructive'
                  onClick={onDelete}
                  disabled={isBusy}
                  className='rounded-lg px-3 py-2'>
                  <Trash2 />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded content */}
        <CollapsibleContent className='overflow-hidden border-t border-border bg-background/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-200'>
          <div className='flex flex-col gap-4 px-5 py-4'>
            {/* Info blocks */}
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              <OrdemInfoBlock
                label='Cliente'
                value={
                  ordem.cliente?.nome_empresa
                    ? `${ordem.cliente.name_cliente} · ${ordem.cliente.nome_empresa}`
                    : ordem.cliente?.name_cliente || 'Não informado'
                }
              />

              {tipo === 'servico' ? (
                <>
                  <OrdemInfoBlock
                    label='Veículo'
                    value={
                      [
                        (props.ordem as OrdemServicoCompleta).veiculo?.placa,
                        (props.ordem as OrdemServicoCompleta).veiculo?.modelo
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Não informado'
                    }
                  />
                  <OrdemInfoBlock
                    label='Responsável'
                    value={
                      (props.ordem as OrdemServicoCompleta)
                        .funcionario_responsavel?.name || 'Não informado'
                    }
                  />
                  <OrdemInfoBlock
                    label='Chegada'
                    value={formatDate(
                      (props.ordem as OrdemServicoCompleta).data_chegada
                    )}
                  />
                </>
              ) : (
                <>
                  <OrdemInfoBlock
                    label='Pagamento'
                    value={
                      paymentMethodLabel[
                        (props.ordem as OrdemVendaCompleta).metodo_pagamento ??
                          ''
                      ] ?? 'Não informado'
                    }
                  />
                  <OrdemInfoBlock
                    label='Previsão'
                    value={formatDate(
                      (props.ordem as OrdemVendaCompleta).data_pagamento ??
                        (props.ordem as OrdemVendaCompleta)
                          .data_previsao_pagamento
                    )}
                  />
                  <OrdemInfoBlock
                    label='Criada em'
                    value={formatDate(props.ordem.data_criacao)}
                  />
                </>
              )}
            </div>

            {/* Observação */}
            {ordem.observacao ? (
              <div className='rounded-lg border border-border bg-card px-3 py-3'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
                  Observação
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {ordem.observacao}
                </p>
              </div>
            ) : null}

            {/* Items — padrão visual de veículos (Clientes) */}
            <div className='flex flex-col gap-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Itens da ordem
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {ordem.pecas.length}{' '}
                  {ordem.pecas.length === 1
                    ? 'item vinculado'
                    : 'itens vinculados'}
                </p>
              </div>

              {ordem.pecas.length > 0 ? (
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {ordem.pecas.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-primary'>
                          <Package className='size-4' />
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-foreground'>
                            {item.peca?.name_peca || 'Peça não encontrada'}
                          </p>
                          <p className='truncate text-sm text-muted-foreground'>
                            Qtd: {item.quantidade} ·{' '}
                            {formatCurrency(item.peca?.preco || 0)} un.
                          </p>
                        </div>
                      </div>
                      <span className='shrink-0 pl-2 text-sm font-semibold text-foreground'>
                        {formatCurrency(
                          (item.peca?.preco || 0) * item.quantidade
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-lg border border-dashed border-border bg-background/40 px-3 py-4 text-sm text-muted-foreground'>
                  Nenhum item vinculado a esta ordem.
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
