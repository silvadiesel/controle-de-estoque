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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente, Peca, Veiculo } from '@/db/schema';
import { useUser } from '@/hooks/useUser';

import { Minus, Plus, Wrench, X } from 'lucide-react';
import { toast } from 'sonner';

interface PecaItem {
  peca_id: number;
  quantidade: number;
  peca: Peca | null;
}

interface OrdemServicoFormData {
  data_chegada: string;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  veiculo_id: number;
  funcionario_id: string;
  funcionario_responsavel_id: string;
  observacao: string;
  valor_total: number;
  pecas: PecaItem[];
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
  funcionarios: Funcionario[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: OrdemServicoFormData) => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
  getVeiculosByCliente: (clienteId: number) => Veiculo[];
}

const formatCurrency = (value: number) => {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const dataVazia: OrdemServicoFormData = {
  data_chegada: new Date().toISOString().split('T')[0],
  status: 'ativa',
  cliente_id: 0,
  veiculo_id: 0,
  funcionario_id: '',
  funcionario_responsavel_id: '',
  observacao: '',
  valor_total: 0,
  pecas: []
};

interface FieldErrors {
  cliente_id?: string;
  veiculo_id?: string;
  data_chegada?: string;
  funcionario_responsavel_id?: string;
}

export function ModalOrdemServico({
  mode,
  initialData,
  clientes,
  veiculos,
  pecas,
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

  const [formData, setFormData] = useState<OrdemServicoFormData>(() => ({
    ...dataVazia,
    funcionario_id: user?.id || '',
    ...initialData
  }));

  const [selectedPecaId, setSelectedPecaId] = useState<string>('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...dataVazia,
        funcionario_id: user?.id || '',
        ...(initialData || {})
      });
      setSelectedPecaId('');
      setErrors({});
      setSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Atualiza funcionario_id quando user carrega após o modal abrir
  useEffect(() => {
    if (user?.id && !formData.funcionario_id) {
      setFormData((prev) => ({ ...prev, funcionario_id: user.id }));
    }
  }, [formData.funcionario_id, user?.id]);

  const validate = (data: OrdemServicoFormData): FieldErrors => {
    const errs: FieldErrors = {};
    if (!data.cliente_id) errs.cliente_id = 'Selecione um cliente';
    if (!data.veiculo_id) errs.veiculo_id = 'Selecione um veículo';
    if (!data.data_chegada) errs.data_chegada = 'Informe a data de chegada';
    if (!data.funcionario_responsavel_id) errs.funcionario_responsavel_id = 'Selecione o funcionário responsável';
    return errs;
  };

  // Re-validate on change after first submit attempt
  useEffect(() => {
    if (submitted) {
      setErrors(validate(formData));
    }
  }, [formData, submitted]);

  const veiculosDisponiveis = formData.cliente_id
    ? getVeiculosByCliente(formData.cliente_id)
    : veiculos;

  const handleClienteChange = (clienteId: string) => {
    const id = parseInt(clienteId);
    const clienteVeiculos = getVeiculosByCliente(id);
    setFormData({
      ...formData,
      cliente_id: id,
      veiculo_id: clienteVeiculos.length === 1 ? clienteVeiculos[0].id : 0
    });
  };

  const handleSelectPeca = (pecaId: string) => {
    if (!pecaId) return;
    const id = parseInt(pecaId);
    const peca = pecas.find((p) => p.id === id);
    if (!peca) return;
    if (peca.quantidade === 0) {
      toast.error(`"${peca.name_peca}" está sem estoque.`);
      return;
    }

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === id);
    if (existingIndex >= 0) {
      const item = formData.pecas[existingIndex];
      const novaQtd = item.quantidade + 1;
      if (novaQtd > peca.quantidade) {
        toast.error(`Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}`);
        return;
      }
      const updated = [...formData.pecas];
      updated[existingIndex] = { ...updated[existingIndex], quantidade: novaQtd };
      setFormData({ ...formData, pecas: updated });
    } else {
      setFormData({
        ...formData,
        pecas: [...formData.pecas, { peca_id: id, quantidade: 1, peca }]
      });
    }
    setSelectedPecaId('');
  };

  const handleIncrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || !item.peca) return;
    if (item.quantidade >= item.peca.quantidade) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade + 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
  };

  const handleDecrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || !item.peca || item.quantidade <= 1) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade - 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
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

    if (!formData.funcionario_id) {
      toast.error('Não foi possível identificar seu usuário. Recarregue a página e tente novamente.');
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

  const clienteOptions = clientes.map((c) => ({
    value: c.id.toString(),
    label: `${c.name_cliente}${c.nome_empresa ? ` - ${c.nome_empresa}` : ''}`
  }));

  const pecaOptions = pecas.map((p) => ({
    value: p.id.toString(),
    label: p.name_peca,
    sublabel: `${formatCurrency(p.preco)} · Estoque: ${p.quantidade}`
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        key={isOpen ? 'open' : 'closed'}
        className='bg-card border-border rounded-xl max-w-[680px] p-0 overflow-y-auto'>
        <DialogHeader className='p-6 pb-4 border-b border-border'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12'>
              <Wrench className='h-4.5 w-4.5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-foreground'>
                {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                {isEdit
                  ? 'Atualize os dados da ordem de serviço'
                  : 'Crie uma nova ordem de serviço para um veículo'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <div className='grid gap-4 p-6 pt-4'>
            {/* Cliente */}
            <div className='space-y-2'>
              <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Cliente *</Label>
              <SearchableSelect
                options={clienteOptions}
                value={formData.cliente_id ? formData.cliente_id.toString() : ''}
                onValueChange={handleClienteChange}
                placeholder="Selecione um cliente"
                searchPlaceholder="Buscar cliente..."
                emptyText="Nenhum cliente encontrado"
                hasError={hasError('cliente_id')}
                aria-describedby={hasError('cliente_id') ? 'error-cliente-servico' : undefined}
              />
              {hasError('cliente_id') && (
                <p id='error-cliente-servico' className='text-xs text-destructive'>{errors.cliente_id}</p>
              )}
            </div>

            {/* Data de Chegada + Funcionário Responsável */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2 col-span-1'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Data de Chegada *</Label>
                <div className={hasError('data_chegada') ? '[&>button]:border-destructive' : ''}>
                  <DatePicker
                    value={
                      formData.data_chegada
                        ? new Date(formData.data_chegada + 'T12:00:00')
                        : undefined
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        data_chegada: date ? date.toISOString().split('T')[0] : ''
                      })
                    }
                    placeholder='Selecione a data'
                  />
                </div>
                {hasError('data_chegada') && (
                  <p id='error-data-chegada' className='text-xs text-destructive'>{errors.data_chegada}</p>
                )}
              </div>

              <div className='space-y-2 col-span-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Funcionário Responsável *</Label>
                <Select
                  value={formData.funcionario_responsavel_id || ''}
                  onValueChange={(v) =>
                    setFormData({ ...formData, funcionario_responsavel_id: v })
                  }>
                  <SelectTrigger
                    aria-describedby={hasError('funcionario_responsavel_id') ? 'error-funcionario-servico' : undefined}
                    className={`bg-input w-full ${hasError('funcionario_responsavel_id') ? 'border-destructive' : 'border-border'}`}>
                    <SelectValue placeholder='Selecione o funcionário responsável' />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasError('funcionario_responsavel_id') && (
                  <p id='error-funcionario-servico' className='text-xs text-destructive'>{errors.funcionario_responsavel_id}</p>
                )}
              </div>
            </div>

            {/* Veículo */}
            <div className='space-y-2 w-full'>
              <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Veículo *</Label>
              <Select
                value={formData.veiculo_id ? formData.veiculo_id.toString() : ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, veiculo_id: parseInt(v) })
                }
                disabled={!formData.cliente_id}>
                <SelectTrigger
                  aria-describedby={hasError('veiculo_id') ? 'error-veiculo-servico' : undefined}
                  className={`bg-input w-full ${hasError('veiculo_id') ? 'border-destructive' : 'border-border'}`}>
                  <SelectValue
                    placeholder={
                      formData.cliente_id
                        ? 'Selecione um veículo'
                        : 'Selecione um cliente primeiro'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {veiculosDisponiveis.map((veiculo) => (
                    <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                      <span className='truncate block'>
                        {veiculo.placa} - {veiculo.modelo}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError('veiculo_id') && (
                <p id='error-veiculo-servico' className='text-xs text-destructive'>{errors.veiculo_id}</p>
              )}
            </div>

            {/* Status (apenas edição) */}
            {isEdit && (
              <div className='space-y-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: 'ativa' | 'fechada' | 'cancelada') =>
                    setFormData({ ...formData, status: v })
                  }>
                  <SelectTrigger className='bg-input border-border w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ativa'>Ativa</SelectItem>
                    <SelectItem value='fechada'>Fechada</SelectItem>
                    <SelectItem value='cancelada'>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observação */}
            <div className='space-y-2'>
              <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Observação / Descrição do Serviço</Label>
              <Textarea
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
                placeholder='Descreva o serviço a ser realizado...'
                className='bg-input border-border min-h-[80px] resize-none'
              />
            </div>

            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Peças Utilizadas</Label>
              <SearchableSelect
                options={pecaOptions}
                value={selectedPecaId}
                onValueChange={handleSelectPeca}
                placeholder="Buscar e selecionar peça..."
                searchPlaceholder="Buscar peça..."
                emptyText="Nenhuma peça encontrada"
              />

              {formData.pecas.length === 0 ? (
                <div className='border border-dashed border-border rounded-lg p-5 text-center'>
                  <p className='text-sm text-muted-foreground'>Nenhuma peça adicionada.</p>
                  <p className='text-xs text-muted-foreground/60 mt-1'>Selecione no campo acima para adicionar.</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {formData.pecas.map((item) => (
                    <div key={item.peca_id} className='flex items-center gap-3 p-3 bg-input border border-border rounded-lg'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm truncate text-foreground'>
                          {item.peca?.name_peca ?? 'Peça não encontrada'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatCurrency(item.peca?.preco ?? 0)} · Estoque: {item.peca?.quantidade ?? 0}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade <= 1}
                          onClick={() => handleDecrementPeca(item.peca_id)}
                          aria-label='Diminuir quantidade'
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <span className='w-8 text-center text-sm font-medium'>{item.quantidade}</span>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade >= (item.peca?.quantidade ?? 0)}
                          onClick={() => handleIncrementPeca(item.peca_id)}
                          aria-label='Aumentar quantidade'
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                      <span className='shrink-0 w-[80px] text-right text-sm font-semibold'>
                        {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 shrink-0'
                        aria-label={`Remover peça ${item.peca?.name_peca ?? ''}`}
                        onClick={() => handleRemovePeca(item.peca_id)}
                      >
                        <X className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className='rounded-lg bg-input border border-border p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>Total da Ordem</span>
                <span className='text-xl font-bold text-primary'>
                  {formatCurrency(calcularTotal())}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='px-6 py-4 border-t border-border'>
          <Button variant='outline' onClick={() => setIsOpen(false)} className='w-32'>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-primary hover:bg-primary/90 text-primary-foreground w-32'>
            {isLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Ordem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
