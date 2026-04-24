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
import type { Cliente, MaoObra, Peca, Veiculo } from '@/db/schema';
import { useUser } from '@/hooks/useUser';

import {
  type MaoDeObraItem,
  MaoDeObraBuilder
} from './mao-de-obra-builder';
import {
  type OrdemItemBuilderValue,
  OrdemItemsBuilder
} from './ordem-items-builder';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface OrdemServicoFormData {
  data_chegada: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  veiculo_id: number;
  funcionario_id: string;
  funcionario_responsavel_id: string;
  observacao: string;
  valor_total: number;
  valor_mao_obra: number;
  pecas: OrdemItemBuilderValue[];
  mao_obra: MaoDeObraItem[];
}

interface Funcionario {
  id: string;
  name: string;
}

interface ModalOrdemServicoProps {
  mode: 'create' | 'edit';
  initialData?: Partial<OrdemServicoFormData>;
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  maoObras: MaoObra[];
  funcionarios: Funcionario[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: OrdemServicoFormData) => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
  getVeiculosByCliente: (clienteId: number) => Veiculo[];
}

interface FieldErrors {
  cliente_id?: string;
  veiculo_id?: string;
  data_chegada?: string;
  funcionario_responsavel_id?: string;
}

const emptyFormData: OrdemServicoFormData = {
  data_chegada: new Date().toISOString().split('T')[0],
  status: 'ativa',
  cliente_id: 0,
  veiculo_id: 0,
  funcionario_id: '',
  funcionario_responsavel_id: '',
  observacao: '',
  valor_total: 0,
  valor_mao_obra: 0,
  pecas: [],
  mao_obra: []
};

export function ModalOrdemServico({
  mode,
  initialData,
  clientes,
  veiculos,
  pecas,
  maoObras,
  funcionarios,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger,
  getVeiculosByCliente
}: ModalOrdemServicoProps) {
  const { user } = useUser();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<OrdemServicoFormData>({
    ...emptyFormData,
    funcionario_id: user?.id || '',
    ...initialData
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- o modal precisa reinicializar o snapshot local sempre que abre com novos dados
    setFormData({
      ...emptyFormData,
      funcionario_id: user?.id || '',
      ...initialData
    });
    setSubmitted(false);
  }, [initialData, isOpen, user?.id]);

  const veiculosDisponiveis = useMemo(
    () =>
      formData.cliente_id
        ? getVeiculosByCliente(formData.cliente_id)
        : veiculos,
    [formData.cliente_id, getVeiculosByCliente, veiculos]
  );

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        value: cliente.id.toString(),
        label: cliente.nome_empresa
      })),
    [clientes]
  );

  const validate = (data: OrdemServicoFormData): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!data.cliente_id) nextErrors.cliente_id = 'Selecione um cliente';
    if (!data.veiculo_id) nextErrors.veiculo_id = 'Selecione um veículo';
    if (!data.data_chegada)
      nextErrors.data_chegada = 'Informe a data de chegada';
    if (!data.funcionario_responsavel_id) {
      nextErrors.funcionario_responsavel_id =
        'Selecione o funcionário responsável';
    }

    return nextErrors;
  };

  const errors = submitted ? validate(formData) : {};

  const handleClienteChange = (clienteId: string) => {
    const parsedId = Number(clienteId);
    const clienteVeiculos = getVeiculosByCliente(parsedId);

    setFormData((current) => ({
      ...current,
      cliente_id: parsedId,
      veiculo_id: clienteVeiculos.length === 1 ? clienteVeiculos[0].id : 0
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const nextErrors = validate(formData);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        `Preencha os campos obrigatórios: ${Object.values(nextErrors).join(', ')}`
      );
      return;
    }

    const funcionarioId = formData.funcionario_id || user?.id || '';

    if (!funcionarioId) {
      toast.error(
        'Não foi possível identificar seu usuário. Recarregue a página e tente novamente.'
      );
      return;
    }

    const valor_total = formData.pecas.reduce(
      (acc, item) => acc + (item.peca?.preco ?? 0) * item.quantidade,
      0
    );

    const valor_mao_obra = formData.mao_obra.reduce(
      (acc, item) => acc + item.valor,
      0
    );

    await onSubmit({
      ...formData,
      funcionario_id: funcionarioId,
      valor_total,
      valor_mao_obra,
      pecas: formData.pecas,
      mao_obra: formData.mao_obra
    });
  };

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={setIsOpen}
      contentClassName='max-w-[720px] sm:max-w-[720px]'
      icon={Wrench}
      title={isEdit ? 'Editar ordem de serviço' : 'Nova ordem de serviço'}
      description={
        isEdit
          ? 'Atualize os dados operacionais, responsáveis e itens utilizados.'
          : 'Registre uma nova ordem com contexto do veículo, responsável e peças aplicadas.'
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
                ? 'Atualizar ordem'
                : 'Criar ordem'}
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
              onValueChange={handleClienteChange}
              placeholder='Selecione um cliente'
              searchPlaceholder='Buscar cliente...'
              emptyText='Nenhum cliente encontrado'
              hasError={submitted && Boolean(errors.cliente_id)}
            />
            <FieldError>{errors.cliente_id}</FieldError>
          </FieldContent>
        </Field>

        <div className='grid gap-4 md:grid-cols-3'>
          <Field
            data-invalid={submitted && Boolean(errors.data_chegada)}
            className='md:col-span-1'>
            <FieldLabel>Data de chegada *</FieldLabel>
            <FieldContent>
              <DatePicker
                value={
                  formData.data_chegada
                    ? new Date(`${formData.data_chegada}T12:00:00`)
                    : undefined
                }
                onChange={(date) =>
                  setFormData((current) => ({
                    ...current,
                    data_chegada: date ? date.toISOString().split('T')[0] : ''
                  }))
                }
                placeholder='Selecione a data'
                className={
                  submitted && errors.data_chegada
                    ? 'border-destructive'
                    : undefined
                }
              />
              <FieldError>{errors.data_chegada}</FieldError>
            </FieldContent>
          </Field>

          <Field
            data-invalid={
              submitted && Boolean(errors.funcionario_responsavel_id)
            }
            className='md:col-span-2'>
            <FieldLabel>Responsável técnico *</FieldLabel>
            <FieldContent>
              <Select
                value={formData.funcionario_responsavel_id}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    funcionario_responsavel_id: value
                  }))
                }>
                <SelectTrigger
                  className='w-full bg-input'
                  aria-invalid={
                    submitted && Boolean(errors.funcionario_responsavel_id)
                  }>
                  <SelectValue placeholder='Selecione o responsável' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {funcionarios.map((funcionario) => (
                      <SelectItem key={funcionario.id} value={funcionario.id}>
                        {funcionario.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FieldError>{errors.funcionario_responsavel_id}</FieldError>
            </FieldContent>
          </Field>
        </div>

        <div className='grid gap-4'>
          <Field data-invalid={submitted && Boolean(errors.veiculo_id)}>
            <FieldLabel>Veículo *</FieldLabel>
            <FieldContent>
              <Select
                value={formData.veiculo_id ? String(formData.veiculo_id) : ''}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    veiculo_id: Number(value)
                  }))
                }
                disabled={!formData.cliente_id}>
                <SelectTrigger
                  className='w-full bg-input'
                  aria-invalid={submitted && Boolean(errors.veiculo_id)}>
                  <SelectValue
                    placeholder={
                      formData.cliente_id
                        ? 'Selecione o veículo'
                        : 'Selecione um cliente primeiro'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {veiculosDisponiveis.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={String(veiculo.id)}>
                        {veiculo.placa} · {veiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.veiculo_id}</FieldError>
            </FieldContent>
          </Field>

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
        </div>

        <Field>
          <FieldLabel>Descrição do serviço</FieldLabel>
          <FieldContent>
            <Textarea
              value={formData.observacao}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  observacao: event.target.value
                }))
              }
              placeholder='Descreva o serviço executado ou o contexto operacional da ordem.'
              className='min-h-24 resize-none bg-input! border-border!'
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <MaoDeObraBuilder
        items={formData.mao_obra}
        maoObras={maoObras}
        onChange={(items) =>
          setFormData((current) => ({ ...current, mao_obra: items }))
        }
      />

      <OrdemItemsBuilder
        label='Peças utilizadas'
        emptyTitle='Nenhuma peça adicionada'
        emptyDescription='Adicione os itens usados na ordem para calcular o total automaticamente.'
        items={formData.pecas}
        pecas={pecas}
        onChange={(items) =>
          setFormData((current) => ({ ...current, pecas: items }))
        }
      />
    </DialogShell>
  );
}
