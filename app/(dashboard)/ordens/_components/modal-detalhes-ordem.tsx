'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import type {
  OrdemServicoCompleta,
  OrdemVendaCompleta
} from '../_hooks/useOrdens';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Wrench,
  XCircle
} from 'lucide-react';

import { OrdemDialogShell } from './ordem-dialog-shell';
import { OrdemStatusBadge } from './ordem-status-badge';

interface ModalDetalhesOrdemProps {
  type: 'servico' | 'venda';
  ordem: OrdemServicoCompleta | OrdemVendaCompleta | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdateStatus?: (status: 'ativa' | 'fechada' | 'cancelada') => void;
  isLoading?: boolean;
}

const paymentMethodLabel: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cheque: 'Cheque',
  debito: 'Débito',
  credito: 'Crédito',
  dinheiro: 'Dinheiro'
};

const formatCurrency = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const formatDate = (value: string | null | undefined) =>
  value
    ? format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : '-';

function InfoBlock({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-lg border border-border bg-background/60 px-3 py-3'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
        {label}
      </p>
      <p className='mt-1 text-sm text-foreground'>{value}</p>
    </div>
  );
}

export function ModalDetalhesOrdem({
  type,
  ordem,
  isOpen,
  setIsOpen,
  onUpdateStatus,
  isLoading
}: ModalDetalhesOrdemProps) {
  const isServico = type === 'servico';
  const orderIcon = isServico ? Wrench : CreditCard;

  if (!ordem) {
    return (
      <OrdemDialogShell
        open={isOpen}
        onOpenChange={setIsOpen}
        icon={ClipboardList}
        title='Carregando ordem'
        description='Buscando os detalhes da ordem selecionada.'
        footer={
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        }
      >
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full rounded-xl' />
          <Skeleton className='h-48 w-full rounded-xl' />
          <Skeleton className='h-28 w-full rounded-xl' />
        </div>
      </OrdemDialogShell>
    );
  }

  return (
    <OrdemDialogShell
      open={isOpen}
      onOpenChange={setIsOpen}
      icon={orderIcon}
      title={`${isServico ? 'Ordem de serviço' : 'Ordem de venda'} #${ordem.id}`}
      description={`Criada em ${formatDate(ordem.data_criacao)}`}
      bodyClassName='flex flex-col gap-6'
      footer={
        <>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          {ordem.status === 'ativa' && onUpdateStatus ? (
            <>
              <Button
                variant='outline'
                onClick={() => onUpdateStatus('cancelada')}
                disabled={isLoading}
                className='border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive'
              >
                <XCircle data-icon='inline-start' />
                Cancelar
              </Button>
              <Button
                onClick={() => onUpdateStatus('fechada')}
                disabled={isLoading}
                className='bg-success text-success-foreground hover:bg-success/90'
              >
                <CheckCircle2 data-icon='inline-start' />
                Finalizar
              </Button>
            </>
          ) : null}
        </>
      }
    >
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <InfoBlock
          label='Cliente'
          value={
            ordem.cliente?.nome_empresa
              ? `${ordem.cliente.name_cliente} · ${ordem.cliente.nome_empresa}`
              : ordem.cliente?.name_cliente || 'Não informado'
          }
        />
        <InfoBlock
          label='Status'
          value={(() => {
            switch (ordem.status) {
              case 'ativa':
                return 'Ativa';
              case 'fechada':
                return 'Fechada';
              default:
                return 'Cancelada';
            }
          })()}
        />
        {isServico ? (
          <>
            <InfoBlock
              label='Veículo'
              value={
                [
                  (ordem as OrdemServicoCompleta).veiculo?.placa,
                  (ordem as OrdemServicoCompleta).veiculo?.modelo
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Não informado'
              }
            />
            <InfoBlock
              label='Responsável'
              value={
                (ordem as OrdemServicoCompleta).funcionario_responsavel?.name ||
                'Não informado'
              }
            />
          </>
        ) : (
          <>
            <InfoBlock
              label='Pagamento'
              value={
                paymentMethodLabel[
                  (ordem as OrdemVendaCompleta).metodo_pagamento ?? ''
                ] || 'Não informado'
              }
            />
            <InfoBlock
              label='Pagamento / previsão'
              value={formatDate(
                (ordem as OrdemVendaCompleta).data_pagamento ??
                  (ordem as OrdemVendaCompleta).data_previsao_pagamento
              )}
            />
          </>
        )}
      </div>

      <div className='flex items-center gap-3'>
        <OrdemStatusBadge status={ordem.status} />
        <span className='text-sm text-muted-foreground'>
          Total: {formatCurrency(ordem.valor_total)}
        </span>
      </div>

      {ordem.observacao ? (
        <div className='rounded-lg border border-border bg-background/60 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
            Observação
          </p>
          <p className='mt-1 text-sm text-foreground'>{ordem.observacao}</p>
        </div>
      ) : null}

      <div className='overflow-hidden rounded-xl border border-border'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead>Item</TableHead>
              <TableHead className='text-center'>Qtd</TableHead>
              <TableHead className='text-right'>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordem.pecas.length > 0 ? (
              ordem.pecas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm text-foreground'>
                        {item.peca?.name_peca || 'Peça não encontrada'}
                      </span>
                      {item.peca?.codigo ? (
                        <span className='text-xs text-muted-foreground'>
                          {item.peca.codigo}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className='text-center text-foreground'>
                    {item.quantidade}
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    {formatCurrency((item.peca?.preco || 0) * item.quantidade)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='py-8 text-center text-sm text-muted-foreground'
                >
                  Nenhum item vinculado a esta ordem.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </OrdemDialogShell>
  );
}
