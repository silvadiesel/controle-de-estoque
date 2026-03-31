'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente, Peca } from '@/db/schema';

import {
  Banknote,
  CreditCard,
  Plus,
  QrCode,
  Receipt,
  ShoppingCart,
  Wallet,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface PecaItem {
  peca_id: number;
  quantidade: number;
  peca: Peca | null;
}

interface OrdemVendaFormData {
  data_previsao_pagamento?: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  observacao: string;
  valor_total: number;
  metodo_pagamento?:
    | 'pix'
    | 'boleto'
    | 'cheque'
    | 'debito'
    | 'credito'
    | 'dinheiro';
  pecas: PecaItem[];
}

interface ModalOrdemVendaProps {
  mode: 'create' | 'edit';
  initialData?: Partial<OrdemVendaFormData>;
  clientes: Cliente[];
  pecas: Peca[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: OrdemVendaFormData) => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

const formatCurrency = (value: number) => {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const metodoPagamentoConfig = {
  pix: { label: 'PIX', icon: QrCode },
  boleto: { label: 'Boleto', icon: Receipt },
  cheque: { label: 'Cheque', icon: Receipt },
  debito: { label: 'Débito', icon: CreditCard },
  credito: { label: 'Crédito', icon: CreditCard },
  dinheiro: { label: 'Dinheiro', icon: Banknote }
};

const dataVazia: OrdemVendaFormData = {
  data_previsao_pagamento: '',
  status: 'ativa',
  cliente_id: 0,
  observacao: '',
  valor_total: 0,
  metodo_pagamento: undefined,
  pecas: []
};

interface FieldErrors {
  cliente_id?: string;
  pecas?: string;
}

export function ModalOrdemVenda({
  mode,
  initialData,
  clientes,
  pecas,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalOrdemVendaProps) {
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<OrdemVendaFormData>(() => ({
    ...dataVazia,
    ...initialData
  }));

  const [selectedPecaId, setSelectedPecaId] = useState<string>('');
  const [pecaQuantidade, setPecaQuantidade] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...dataVazia,
        ...(initialData || {})
      });
      setSelectedPecaId('');
      setPecaQuantidade(1);
      setErrors({});
      setSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validate = (data: OrdemVendaFormData): FieldErrors => {
    const errs: FieldErrors = {};
    if (!data.cliente_id) errs.cliente_id = 'Selecione um cliente';
    if (data.pecas.length === 0)
      errs.pecas = 'Adicione pelo menos uma peça à venda';
    return errs;
  };

  // Re-validate on change after first submit attempt
  useEffect(() => {
    if (submitted) {
      setErrors(validate(formData));
    }
  }, [formData, submitted]);

  const handleAddPeca = () => {
    if (!selectedPecaId || pecaQuantidade <= 0) return;

    const pecaId = parseInt(selectedPecaId);
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === pecaId);
    const quantidadeJaAdicionada =
      existingIndex >= 0 ? formData.pecas[existingIndex].quantidade : 0;
    const totalSolicitado = quantidadeJaAdicionada + pecaQuantidade;

    if (totalSolicitado > peca.quantidade) {
      toast.error(
        `Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}, Solicitado: ${totalSolicitado}`
      );
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...formData.pecas];
      updated[existingIndex].quantidade += pecaQuantidade;
      setFormData({ ...formData, pecas: updated });
    } else {
      setFormData({
        ...formData,
        pecas: [
          ...formData.pecas,
          { peca_id: pecaId, quantidade: pecaQuantidade, peca }
        ]
      });
    }

    setSelectedPecaId('');
    setPecaQuantidade(1);
  };

  const handleRemovePeca = (pecaId: number) => {
    setFormData({
      ...formData,
      pecas: formData.pecas.filter((p) => p.peca_id !== pecaId)
    });
  };

  const calcularTotal = () => {
    return formData.pecas.reduce((total, item) => {
      const preco = item.peca?.preco || 0;
      return total + preco * item.quantidade;
    }, 0);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const campos = Object.values(errs);
      toast.error(`Preencha os campos obrigatórios: ${campos.join(', ')}`);
      return;
    }

    const total = calcularTotal();
    await onSubmit({
      ...formData,
      valor_total: total,
      pecas: formData.pecas.map((p) => ({
        peca_id: p.peca_id,
        quantidade: p.quantidade,
        peca: p.peca
      }))
    });
  };

  const hasError = (field: keyof FieldErrors) => submitted && !!errors[field];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        key={isOpen ? 'open' : 'closed'}
        className='bg-[#18181b] border-[#27272a] rounded-[12px] max-w-[680px] p-0'>
        <DialogHeader className='p-6 pb-4 border-b border-[#27272a]'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(91,127,165,0.12)]'>
              <ShoppingCart className='h-4.5 w-4.5 text-[#5b7fa5]' />
            </div>
            <div>
              <DialogTitle className='text-[#e4e4e7]'>
                {isEdit ? 'Editar Ordem de Venda' : 'Nova Ordem de Venda'}
              </DialogTitle>
              <DialogDescription className='text-[#71717a]'>
                {isEdit
                  ? 'Atualize os dados da ordem de venda'
                  : 'Crie uma nova ordem de venda de peças'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] overflow-y-auto'>
          <div className='grid gap-4 p-6 pt-4'>
            {/* Cliente */}
            <div className='space-y-2'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                Cliente *
              </Label>
              <Select
                value={
                  formData.cliente_id ? formData.cliente_id.toString() : ''
                }
                onValueChange={(v) =>
                  setFormData({ ...formData, cliente_id: parseInt(v) })
                }>
                <SelectTrigger
                  aria-describedby={
                    hasError('cliente_id') ? 'error-cliente-venda' : undefined
                  }
                  className={`bg-[#131316] w-full ${hasError('cliente_id') ? 'border-destructive' : 'border-[#27272a]'}`}>
                  <SelectValue placeholder='Selecione um cliente' />
                </SelectTrigger>
                <SelectContent className='bg-[#18181b] border-[#27272a] w-fit'>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      <span className='truncate max-w-[200px] block'>
                        {cliente.name_cliente}
                        {cliente.nome_empresa && ` - ${cliente.nome_empresa}`}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError('cliente_id') && (
                <p
                  id='error-cliente-venda'
                  className='text-xs text-destructive'>
                  {errors.cliente_id}
                </p>
              )}
            </div>

            {/* Método de Pagamento e Data */}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2 w-full'>
                <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                  Método de Pagamento
                </Label>
                <Select
                  value={formData.metodo_pagamento || ''}
                  onValueChange={(
                    v:
                      | 'pix'
                      | 'boleto'
                      | 'cheque'
                      | 'debito'
                      | 'credito'
                      | 'dinheiro'
                  ) => setFormData({ ...formData, metodo_pagamento: v })}>
                  <SelectTrigger className='bg-[#131316] border-[#27272a] w-full'>
                    <SelectValue placeholder='Selecione o método'>
                      {formData.metodo_pagamento && (
                        <div className='flex items-center gap-2'>
                          <Wallet className='h-4 w-4' />
                          {
                            metodoPagamentoConfig[formData.metodo_pagamento]
                              .label
                          }
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className='bg-[#18181b] border-[#27272a] w-full'>
                    {Object.entries(metodoPagamentoConfig).map(
                      ([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className='flex items-center gap-2 w-full'>
                              <Icon className='h-4 w-4' />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2 w-full'>
                <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                  Previsão de Pagamento
                </Label>
                <DatePicker
                  value={
                    formData.data_previsao_pagamento
                      ? new Date(formData.data_previsao_pagamento + 'T12:00:00')
                      : undefined
                  }
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      data_previsao_pagamento: date
                        ? date.toISOString().split('T')[0]
                        : ''
                    })
                  }
                  placeholder='Previsão de pagamento'
                  className='w-full'
                />
              </div>
            </div>

            {/* Status */}
            {isEdit && (
              <div className='space-y-2'>
                <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: 'ativa' | 'fechada' | 'cancelada') =>
                    setFormData({ ...formData, status: v })
                  }>
                  <SelectTrigger className='bg-[#131316] border-[#27272a]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#18181b] border-[#27272a]'>
                    <SelectItem value='ativa'>Ativa</SelectItem>
                    <SelectItem value='fechada'>Fechada</SelectItem>
                    <SelectItem value='cancelada'>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observação */}
            <div className='space-y-2'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                Observação
              </Label>
              <Textarea
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
                placeholder='Observações sobre a venda...'
                className='bg-[#131316] border-[#27272a] min-h-[80px] resize-none'
              />
            </div>

            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>
                Peças *
              </Label>
              <div className='flex gap-2'>
                <Select
                  value={selectedPecaId}
                  onValueChange={setSelectedPecaId}>
                  <SelectTrigger
                    aria-describedby={
                      hasError('pecas') ? 'error-pecas-venda' : undefined
                    }
                    className={`bg-[#131316] flex-1 ${hasError('pecas') ? 'border-destructive' : 'border-[#27272a]'}`}>
                    <SelectValue placeholder='Selecione uma peça' />
                  </SelectTrigger>
                  <SelectContent className='bg-[#18181b] border-[#27272a] max-h-60'>
                    {pecas.map((peca) => (
                      <SelectItem key={peca.id} value={peca.id.toString()}>
                        {peca.name_peca} - {formatCurrency(peca.preco)}{' '}
                        (Estoque: {peca.quantidade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type='number'
                  min={1}
                  value={pecaQuantidade || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPecaQuantidade(val === '' ? 0 : parseInt(val));
                  }}
                  onBlur={() => {
                    if (!pecaQuantidade || pecaQuantidade < 1)
                      setPecaQuantidade(1);
                  }}
                  className='bg-[#131316] border-[#27272a] w-20'
                />
                <Button type='button' onClick={handleAddPeca} variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              {hasError('pecas') && (
                <p id='error-pecas-venda' className='text-xs text-destructive'>
                  {errors.pecas}
                </p>
              )}

              {/* Lista de Peças */}
              {formData.pecas.length > 0 && (
                <div className='rounded-lg border border-[#27272a] overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='border-[#27272a] hover:bg-transparent'>
                        <TableHead className='text-[#71717a]'>Peça</TableHead>
                        <TableHead className='text-[#71717a] text-center'>
                          Qtd
                        </TableHead>
                        <TableHead className='text-[#71717a] text-right'>
                          Preço Unit.
                        </TableHead>
                        <TableHead className='text-[#71717a] text-right'>
                          Subtotal
                        </TableHead>
                        <TableHead className='text-[#71717a] w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.pecas.map((item) => (
                        <TableRow
                          key={item.peca_id}
                          className='border-[#27272a] hover:bg-[#1c1c22]/30'>
                          <TableCell className='text-[#e4e4e7]'>
                            {item.peca?.name_peca || 'Peça não encontrada'}
                          </TableCell>
                          <TableCell className='text-center text-[#e4e4e7]'>
                            {item.quantidade}
                          </TableCell>
                          <TableCell className='text-right text-[#71717a]'>
                            {formatCurrency(item.peca?.preco || 0)}
                          </TableCell>
                          <TableCell className='text-right text-[#e4e4e7] font-medium'>
                            {formatCurrency(
                              (item.peca?.preco || 0) * item.quantidade
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              aria-label={`Remover peça ${item.peca?.name_peca || ''}`}
                              onClick={() => handleRemovePeca(item.peca_id)}>
                              <X className='h-4 w-4 text-destructive' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Total */}
            <div className='rounded-lg bg-[#131316] border border-[#27272a] p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-[#71717a] uppercase tracking-wider'>
                  Total da Venda
                </span>
                <span className='text-[22px] font-bold text-[#5b7fa5]'>
                  {formatCurrency(calcularTotal())}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='px-6 py-4 border-t border-[#27272a]'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            className='w-32'>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-[#5b7fa5] hover:bg-[#5b7fa5]/90 text-[#09090B] w-32'>
            {isLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
