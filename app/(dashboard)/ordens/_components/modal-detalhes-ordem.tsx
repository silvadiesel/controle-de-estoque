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
  ClipboardList,
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
    className: 'bg-[#27272a] text-[#a1a1aa]'
  },
  fechada: {
    label: 'Fechada',
    icon: CheckCircle,
    className: 'bg-[#1c1c22] text-[#71717a]'
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-[#1c1c22] text-[#71717a] opacity-50 line-through'
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='bg-[#18181b] border-[#27272a] rounded-[12px] max-w-[680px] p-0'>
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
            <DialogHeader className='p-6 pb-4 border-b border-[#27272a]'>
              <div className='flex items-center gap-3 mb-1'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(91,127,165,0.12)]'>
                  <ClipboardList className='h-4.5 w-4.5 text-[#5b7fa5]' />
                </div>
                <div>
                  <DialogTitle className='text-[#e4e4e7]'>
                    {isServico ? 'Ordem de Serviço' : 'Ordem de Venda'} #{ordem.id}
                  </DialogTitle>
                  <DialogDescription className='text-[#71717a]'>
                    Criada em {formatDate(ordem.data_criacao)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className='max-h-[60vh]'>
              <div className='space-y-4 p-6 pt-4'>
                {/* Info Grid */}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='w-full'>
                    <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>Cliente</p>
                    <p className='text-[#e4e4e7] font-medium'>
                      {ordem.cliente?.name_cliente || 'Cliente não encontrado'}
                    </p>
                    {ordem.cliente?.nome_empresa && (
                      <p className='text-sm text-[#71717a]'>
                        {ordem.cliente.nome_empresa}
                      </p>
                    )}
                  </div>

                  {isServico && ordemServico && (
                    <div className='w-full'>
                      <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>Veículo</p>
                      <p className='text-[#e4e4e7] font-medium'>
                        {ordemServico.veiculo?.placa || '-'}
                      </p>
                      <p className='text-sm text-[#71717a]'>
                        {ordemServico.veiculo?.modelo || '-'}
                      </p>
                    </div>
                  )}

                  {!isServico && ordemVenda && (
                    <div>
                      <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>
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
                                <Icon className='h-4 w-4 text-[#5b7fa5]' />
                                <span className='text-[#e4e4e7]'>
                                  {config.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className='text-[#71717a]'>Não informado</p>
                      )}
                    </div>
                  )}
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>Status</p>
                    <Badge
                      variant='secondary'
                      className={status?.className || ''}>
                      {status?.icon && <status.icon className='h-3 w-3 mr-1' />}
                      {status?.label || ''}
                    </Badge>
                  </div>

                  {isServico && ordemServico && (
                    <div>
                      <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>
                        Funcionário
                      </p>
                      <p className='text-[#e4e4e7]'>
                        {ordemServico.funcionario?.name || 'Não informado'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Datas */}
                {isServico && ordemServico && (
                  <div>
                    <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>
                      Data de Chegada
                    </p>
                    <p className='text-[#e4e4e7]'>
                      {formatDate(ordemServico.data_chegada)}
                    </p>
                  </div>
                )}

                {!isServico && ordemVenda && ordemVenda.data_pagamento && (
                  <div>
                    <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>
                      Previsão de Pagamento
                    </p>
                    <p className='text-[#e4e4e7]'>
                      {formatDate(ordemVenda.data_pagamento)}
                    </p>
                  </div>
                )}

                {/* Observação */}
                {ordem.observacao && (
                  <div>
                    <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-1'>Observação</p>
                    <p className='text-[#e4e4e7]'>{ordem.observacao}</p>
                  </div>
                )}

                {/* Peças */}
                <div>
                  <p className='text-[10px] text-[#52525b] uppercase tracking-wider font-medium mb-2'>Itens</p>
                  <div className='rounded-lg border border-[#27272a] overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='border-[#27272a] hover:bg-transparent'>
                          <TableHead className='text-[#71717a]'>
                            Peça
                          </TableHead>
                          <TableHead className='text-[#71717a] text-center'>
                            Qtd
                          </TableHead>
                          <TableHead className='text-[#71717a] text-right'>
                            Subtotal
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordem.pecas.map((item, idx) => (
                          <TableRow
                            key={idx}
                            className='border-[#27272a] hover:bg-[#1c1c22]/30'>
                            <TableCell className='text-[#e4e4e7]'>
                              {item.peca?.name_peca || 'Peça não encontrada'}
                              {item.peca?.codigo && (
                                <span className='text-xs text-[#71717a] ml-2'>
                                  ({item.peca.codigo})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-center text-[#e4e4e7]'>
                              {item.quantidade}
                            </TableCell>
                            <TableCell className='text-right text-[#e4e4e7]'>
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
                <div className='rounded-lg bg-[#131316] border border-[#27272a] p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-[#71717a] uppercase tracking-wider'>
                      Total
                    </span>
                    <span className='text-[22px] font-bold text-[#5b7fa5]'>
                      {formatCurrency(ordem.valor_total)}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className='flex-col sm:flex-row gap-2 px-6 py-2 border-t border-[#27272a]'>
              <Button variant='outline' onClick={() => setIsOpen(false)} className='w-32'>
                Fechar
              </Button>

              {ordem.status === 'ativa' && onUpdateStatus && (
                <>
                  <Button
                    variant='outline'
                    onClick={() => onUpdateStatus('fechada')}
                    disabled={isLoading}
                    className='bg-success/10 hover:bg-success/20 text-success border-success/30'>
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
