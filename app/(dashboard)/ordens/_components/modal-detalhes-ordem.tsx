'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  QrCode,
  Receipt,
  XCircle
} from 'lucide-react';

interface ModalDetalhesOrdemProps {
  type: 'servico' | 'venda';
  ordem: OrdemServicoCompleta | OrdemVendaCompleta | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdateStatus?: (status: 'ativa' | 'fechada' | 'cancelada') => void;
  isLoading?: boolean;
}

const statusConfig = {
  ativa: {
    label: 'Ativa',
    icon: Clock,
    className: 'bg-secondary text-secondary-foreground'
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

const metodoPagamentoConfig = {
  pix: { label: 'PIX', icon: QrCode },
  boleto: { label: 'Boleto', icon: Receipt },
  cheque: { label: 'Cheque', icon: Receipt },
  debito: { label: 'Débito', icon: CreditCard },
  credito: { label: 'Crédito', icon: CreditCard },
  dinheiro: { label: 'Dinheiro', icon: Banknote }
};

const formatCurrency = (value: number) => {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export function ModalDetalhesOrdem({
  type,
  ordem,
  isOpen,
  setIsOpen,
  onUpdateStatus,
  isLoading
}: ModalDetalhesOrdemProps) {
  const isServico = type === 'servico';
  const ordemServico =
    ordem && isServico ? (ordem as OrdemServicoCompleta) : null;
  const ordemVenda = ordem && !isServico ? (ordem as OrdemVendaCompleta) : null;

  const status = ordem ? statusConfig[ordem.status] : null;
  const StatusIcon = status?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='bg-card border-border max-w-2xl p-0'>
        {!ordem ? (
          <div className='p-6 space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-48 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        ) : (
          <>
            <DialogHeader className='p-6 pb-0'>
              <DialogTitle className='text-foreground'>
                {isServico ? 'Ordem de Serviço' : 'Ordem de Venda'} #{ordem.id}
              </DialogTitle>
              <DialogDescription>
                Criada em {formatDate(ordem.data_criacao)}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className='max-h-[60vh]'>
              <div className='space-y-4 p-6 pt-4'>
                {/* Info Grid */}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='w-full'>
                    <p className='text-sm text-muted-foreground'>Cliente</p>
                    <p className='text-foreground font-medium'>
                      {ordem.cliente?.name_cliente || 'Cliente não encontrado'}
                    </p>
                    {ordem.cliente?.nome_empresa && (
                      <p className='text-sm text-muted-foreground'>
                        {ordem.cliente.nome_empresa}
                      </p>
                    )}
                  </div>

                  {isServico && ordemServico && (
                    <div className='w-full'>
                      <p className='text-sm text-muted-foreground'>Veículo</p>
                      <p className='text-foreground font-medium'>
                        {ordemServico.veiculo?.placa || '-'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {ordemServico.veiculo?.modelo || '-'}
                      </p>
                    </div>
                  )}

                  {!isServico && ordemVenda && (
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Método de Pagamento
                      </p>
                      {ordemVenda.metodo_pagamento ? (
                        <div className='flex items-center gap-2'>
                          {(() => {
                            const config =
                              metodoPagamentoConfig[
                                ordemVenda.metodo_pagamento
                              ];
                            const Icon = config.icon;
                            return (
                              <>
                                <Icon className='h-4 w-4 text-primary' />
                                <span className='text-foreground'>
                                  {config.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className='text-muted-foreground'>Não informado</p>
                      )}
                    </div>
                  )}
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <Badge
                      variant='secondary'
                      className={status?.className || ''}>
                      {status?.icon && <status.icon className='h-3 w-3 mr-1' />}
                      {status?.label || ''}
                    </Badge>
                  </div>

                  {isServico && ordemServico && (
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Funcionário
                      </p>
                      <p className='text-foreground'>
                        {ordemServico.funcionario?.name || 'Não informado'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Datas */}
                {isServico && ordemServico && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Data de Chegada
                    </p>
                    <p className='text-foreground'>
                      {formatDate(ordemServico.data_chegada)}
                    </p>
                  </div>
                )}

                {!isServico && ordemVenda && ordemVenda.data_pagamento && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Previsão de Pagamento
                    </p>
                    <p className='text-foreground'>
                      {formatDate(ordemVenda.data_pagamento)}
                    </p>
                  </div>
                )}

                {/* Observação */}
                {ordem.observacao && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Observação</p>
                    <p className='text-foreground'>{ordem.observacao}</p>
                  </div>
                )}

                {/* Peças */}
                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Itens</p>
                  <div className='rounded-lg border border-border overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='border-border hover:bg-transparent'>
                          <TableHead className='text-muted-foreground'>
                            Peça
                          </TableHead>
                          <TableHead className='text-muted-foreground text-center'>
                            Qtd
                          </TableHead>
                          <TableHead className='text-muted-foreground text-right'>
                            Subtotal
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordem.pecas.map((item, idx) => (
                          <TableRow
                            key={idx}
                            className='border-border hover:bg-muted/30'>
                            <TableCell className='text-foreground'>
                              {item.peca?.name_peca || 'Peça não encontrada'}
                              {item.peca?.codigo && (
                                <span className='text-xs text-muted-foreground ml-2'>
                                  ({item.peca.codigo})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-center text-foreground'>
                              {item.quantidade}
                            </TableCell>
                            <TableCell className='text-right text-foreground'>
                              {formatCurrency(
                                (item.peca?.preco || 0) * item.quantidade
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Total */}
                <div className='rounded-lg bg-secondary/50 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-medium text-foreground'>
                      Total
                    </span>
                    <span className='text-2xl font-bold text-primary'>
                      {formatCurrency(ordem.valor_total)}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className='flex-col sm:flex-row gap-2 px-6 py-2 border-t border-border'>
              <Button variant='outline' onClick={() => setIsOpen(false)} className='w-32'>
                Fechar
              </Button>

              {ordem.status === 'ativa' && onUpdateStatus && (
                <>
                  <Button
                    variant='outline'
                    onClick={() => onUpdateStatus('fechada')}
                    disabled={isLoading}
                    className='bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Finalizar
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => onUpdateStatus('cancelada')}
                    disabled={isLoading}
                    className='bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30'>
                    <XCircle className='h-4 w-4 mr-2' />
                    Cancelar
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
