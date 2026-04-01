'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <div className='rounded-lg border border-border bg-background/60 px-3 py-2.5'>
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

  return (
    <Collapsible
      open={expanded}
      onOpenChange={onToggle}
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card transition-[border-color,transform] duration-200 ease-out',
        'hover:border-border-hover',
        expanded && 'border-border-hover'
      )}>
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-200 ease-out sm:items-center justify-between',
            'hover:bg-elevated/40'
          )}>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-lg border border-border bg-elevated text-primary'>
              <Icon />
              <span className='sr-only'>{tipo}</span>
            </div>

            <div className='min-w-20 shrink-0'>
              <div className='flex flex-col items-start justify-center'>
                <p className='text-[10px] uppercase tracking-[0.08em] text-muted-foreground'>
                  {cardLabel}
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  #{ordem.id}
                </p>
              </div>
            </div>
          </div>

          <div className='min-w-0 w-1/4 sm:basis-1/4 sm:shrink-0'>
            <p className='truncate text-sm font-semibold text-foreground'>
              {ordem.cliente?.name_cliente || 'Cliente não encontrado'}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {headerMeta}
            </p>
          </div>

          <div className='min-w-0 flex w-1/4 flex-col items-start justify-center'>
            <p className='text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:hidden'>
              Contexto operacional
            </p>
            <p className='truncate text-sm font-medium text-foreground'>
              {tipo === 'servico'
                ? [ordem.veiculo?.placa, ordem.veiculo?.modelo]
                    .filter(Boolean)
                    .join(' · ') || 'Veículo não informado'
                : (paymentMethodLabel[ordem.metodo_pagamento ?? ''] ??
                  'Método não informado')}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {tipo === 'servico'
                ? `Resp. ${ordem.funcionario_responsavel?.name ?? 'Sem responsável'}`
                : ordem.cliente?.nome_empresa || 'Cliente sem empresa'}
            </p>
          </div>

          <div className='hidden w-1/12 shrink-0 md:block '>
            <OrdemStatusBadge status={ordem.status} />
          </div>

          <div className='shrink-0 text-right w-1/12'>
            <p className='text-[10px] uppercase tracking-[0.08em] text-muted-foreground'>
              Total
            </p>
            <p className='text-sm font-semibold text-foreground'>
              {formatCurrency(ordem.valor_total)}
            </p>
          </div>

          <ChevronDown
            className={cn(
              'shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
              expanded && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className='overflow-hidden border-t border-border data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
        <div className='flex flex-col gap-4 bg-input/30 px-4 py-4'>
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
                    [props.ordem.veiculo?.placa, props.ordem.veiculo?.modelo]
                      .filter(Boolean)
                      .join(' · ') || 'Não informado'
                  }
                />
                <OrdemInfoBlock
                  label='Responsável'
                  value={
                    props.ordem.funcionario_responsavel?.name || 'Não informado'
                  }
                />
                <OrdemInfoBlock
                  label='Chegada'
                  value={formatDate(props.ordem.data_chegada)}
                />
              </>
            ) : (
              <>
                <OrdemInfoBlock
                  label='Pagamento'
                  value={
                    paymentMethodLabel[props.ordem.metodo_pagamento ?? ''] ??
                    'Não informado'
                  }
                />
                <OrdemInfoBlock
                  label='Previsão'
                  value={formatDate(
                    props.ordem.data_pagamento ??
                      props.ordem.data_previsao_pagamento
                  )}
                />
                <OrdemInfoBlock
                  label='Criada em'
                  value={formatDate(props.ordem.data_criacao)}
                />
              </>
            )}
          </div>

          {ordem.observacao ? (
            <div className='rounded-lg border border-border bg-background/60 px-3 py-3'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
                Observação
              </p>
              <p className='mt-1 text-sm text-foreground'>{ordem.observacao}</p>
            </div>
          ) : null}

          <div className='flex flex-col gap-4'>
            <div className='pl-2'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
                Itens (
                <span className='text-primary'>{ordem.pecas.length}</span>)
              </p>
            </div>

            {ordem.pecas.length > 0 ? (
              <ScrollArea className='max-h-[220px]'>
                <div className='flex flex-col gap-2'>
                  {ordem.pecas.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm text-foreground'>
                          {item.peca?.name_peca || 'Peça não encontrada'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Qtd: {item.quantidade}
                        </p>
                      </div>
                      <span className='text-sm font-medium text-foreground'>
                        {formatCurrency(
                          (item.peca?.preco || 0) * item.quantidade
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className='rounded-lg border border-dashed border-border bg-background/40 px-3 py-4 text-sm text-muted-foreground'>
                Nenhum item vinculado a esta ordem.
              </div>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-end gap-2'>
            {ordem.status === 'ativa' ? (
              <>
                <Button
                  variant='outline'
                  onClick={onEdit}
                  className='border-border'>
                  <Pencil data-icon='inline-start' />
                  Editar
                </Button>
                <Button
                  variant='default'
                  onClick={onFinalize}
                  disabled={isBusy}
                  className='bg-success text-success-foreground hover:bg-success/90'>
                  <CheckCircle2 data-icon='inline-start' />
                  Finalizar
                </Button>
                <Button
                  variant='destructive'
                  onClick={onCancel}
                  disabled={isBusy}>
                  <XCircle data-icon='inline-start' />
                  Cancelar
                </Button>
              </>
            ) : null}
            <Button variant='destructive' onClick={onDelete} disabled={isBusy}>
              <Trash2 data-icon='inline-start' />
              Excluir
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
