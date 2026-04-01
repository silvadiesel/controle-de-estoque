'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { DialogShell } from '@/components/ui/dialog-shell';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente, Peca } from '@/db/schema';

import {
  type OrdemItemBuilderValue,
  OrdemItemsBuilder
} from './ordem-items-builder';
import {
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';

interface OrdemVendaFormData {
  data_pagamento: string;
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
  pecas: OrdemItemBuilderValue[];
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

interface FieldErrors {
  cliente_id?: string;
  pecas?: string;
}

const paymentOptions = {
  pix: { label: 'PIX', icon: QrCode },
  boleto: { label: 'Boleto', icon: Receipt },
  cheque: { label: 'Cheque', icon: Receipt },
  debito: { label: 'Débito', icon: CreditCard },
  credito: { label: 'Crédito', icon: CreditCard },
  dinheiro: { label: 'Dinheiro', icon: Banknote }
} as const;

const emptyFormData: OrdemVendaFormData = {
  data_pagamento: '',
  status: 'ativa',
  cliente_id: 0,
  observacao: '',
  valor_total: 0,
  metodo_pagamento: undefined,
  pecas: []
};

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

  const [formData, setFormData] = useState<OrdemVendaFormData>({
    ...emptyFormData,
    ...initialData
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- o modal precisa reinicializar o snapshot local sempre que abre com novos dados
    setFormData({
      ...emptyFormData,
      ...initialData
    });
    setSubmitted(false);
  }, [initialData, isOpen]);

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        value: cliente.id.toString(),
        label: `${cliente.name_cliente}${cliente.nome_empresa ? ` - ${cliente.nome_empresa}` : ''}`
      })),
    [clientes]
  );

  const validate = (data: OrdemVendaFormData): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!data.cliente_id) nextErrors.cliente_id = 'Selecione um cliente';
    if (data.pecas.length === 0) {
      nextErrors.pecas = 'Adicione pelo menos uma peça à venda';
    }

    return nextErrors;
  };

  const errors = submitted ? validate(formData) : {};

  const handleSubmit = async () => {
    setSubmitted(true);

    const nextErrors = validate(formData);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        `Preencha os campos obrigatórios: ${Object.values(nextErrors).join(', ')}`
      );
      return;
    }

    const valor_total = formData.pecas.reduce(
      (acc, item) => acc + (item.peca?.preco ?? 0) * item.quantidade,
      0
    );

    await onSubmit({
      ...formData,
      valor_total,
      pecas: formData.pecas
    });
  };

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={setIsOpen}
      contentClassName='max-w-[720px] sm:max-w-[720px]'
      icon={ShoppingCart}
      title={isEdit ? 'Editar ordem de venda' : 'Nova ordem de venda'}
      description={
        isEdit
          ? 'Atualize cliente, pagamento e itens vinculados à venda.'
          : 'Registre uma nova venda com cliente, método de pagamento e itens selecionados.'
      }
      trigger={trigger}
      bodyClassName='flex flex-col gap-6'
      footer={
        <>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : isEdit
                ? 'Atualizar venda'
                : 'Criar venda'}
          </Button>
        </>
      }>
      <FieldGroup>
        <Field data-invalid={submitted && Boolean(errors.cliente_id)}>
          <FieldLabel>Cliente *</FieldLabel>
          <FieldContent>
            <SearchableSelect
              options={clienteOptions}
              value={formData.cliente_id ? String(formData.cliente_id) : ''}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  cliente_id: Number(value)
                }))
              }
              placeholder='Selecione um cliente'
              searchPlaceholder='Buscar cliente...'
              emptyText='Nenhum cliente encontrado'
              hasError={submitted && Boolean(errors.cliente_id)}
            />
            <FieldError>{errors.cliente_id}</FieldError>
          </FieldContent>
        </Field>

        <div className='grid gap-4 md:grid-cols-2'>
          <Field>
            <FieldLabel>Método de pagamento</FieldLabel>
            <FieldContent>
              <Select
                value={formData.metodo_pagamento || ''}
                onValueChange={(
                  value:
                    | 'pix'
                    | 'boleto'
                    | 'cheque'
                    | 'debito'
                    | 'credito'
                    | 'dinheiro'
                ) =>
                  setFormData((current) => ({
                    ...current,
                    metodo_pagamento: value
                  }))
                }>
                <SelectTrigger className='w-full bg-input'>
                  <SelectValue placeholder='Selecione o método' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(paymentOptions).map(([key, option]) => {
                      const Icon = option.icon;

                      return (
                        <SelectItem key={key} value={key}>
                          <Icon />
                          {option.label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Pagamento / previsão</FieldLabel>
            <FieldContent>
              <DatePicker
                value={
                  formData.data_pagamento
                    ? new Date(`${formData.data_pagamento}T12:00:00`)
                    : undefined
                }
                onChange={(date) =>
                  setFormData((current) => ({
                    ...current,
                    data_pagamento: date ? date.toISOString().split('T')[0] : ''
                  }))
                }
                placeholder='Selecione a data'
              />
            </FieldContent>
          </Field>
        </div>

        {isEdit ? (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <FieldContent>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativa' | 'fechada' | 'cancelada') =>
                  setFormData((current) => ({ ...current, status: value }))
                }>
                <SelectTrigger className='w-full bg-input'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='ativa'>Ativa</SelectItem>
                    <SelectItem value='fechada'>Fechada</SelectItem>
                    <SelectItem value='cancelada'>Cancelada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        ) : null}

        <Field>
          <FieldLabel>Observação</FieldLabel>
          <FieldContent>
            <Textarea
              value={formData.observacao}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  observacao: event.target.value
                }))
              }
              placeholder='Inclua contexto de retirada, entrega ou negociação, se necessário.'
              className='min-h-24 resize-none bg-input! border-border!'
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <OrdemItemsBuilder
        label='Itens da venda'
        required
        error={submitted ? errors.pecas : undefined}
        emptyTitle='Nenhum item selecionado'
        emptyDescription='Adicione pelo menos uma peça para registrar a venda.'
        items={formData.pecas}
        pecas={pecas}
        onChange={(items) =>
          setFormData((current) => ({ ...current, pecas: items }))
        }
      />
    </DialogShell>
  );
}
