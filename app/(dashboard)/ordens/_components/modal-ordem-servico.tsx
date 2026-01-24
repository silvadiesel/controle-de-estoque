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
import type { Cliente, Peca, Veiculo } from '@/db/schema';
import { useUser } from '@/hooks/useUser';

import { Plus, X } from 'lucide-react';

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
  observacao: string;
  valor_total: number;
  pecas: PecaItem[];
}

interface ModalOrdemServicoProps {
  mode: 'create' | 'edit';
  initialData?: Partial<OrdemServicoFormData>;
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
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
  observacao: '',
  valor_total: 0,
  pecas: []
};

export function ModalOrdemServico({
  mode,
  initialData,
  clientes,
  veiculos,
  pecas,
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
  const [pecaQuantidade, setPecaQuantidade] = useState(1);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...dataVazia,
        funcionario_id: user?.id || '',
        ...(initialData || {})
      });
      setSelectedPecaId('');
      setPecaQuantidade(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const handleAddPeca = () => {
    if (!selectedPecaId || pecaQuantidade <= 0) return;

    const pecaId = parseInt(selectedPecaId);
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === pecaId);
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
    if (!formData.cliente_id || !formData.veiculo_id) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        key={isOpen ? 'open' : 'closed'}
        className='bg-card border-border max-w-3xl p-0 overflow-y-auto'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle className='text-foreground'>
            {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados da ordem de serviço'
              : 'Crie uma nova ordem de serviço para um veículo'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <div className='grid gap-4 p-6 pt-4'>
            {/* Cliente e Veículo */}
            <div className='grid space-y-2 sm:grid-cols-1 '>
                <Label>Cliente *</Label>
                <Select
                  value={
                    formData.cliente_id ? formData.cliente_id.toString() : ''
                  }
                  onValueChange={handleClienteChange}>
                
                  <SelectTrigger className='bg-input border-border w-full'>
                    <SelectValue placeholder='Selecione um cliente' />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border max-h-60 w-fit'>
                    {clientes.map((cliente) => (
                      <SelectItem
                        key={cliente.id}
                        value={cliente.id.toString()}>
                        <span className='truncate w-full block'>
                          {cliente.name_cliente}
                          {cliente.nome_empresa && ` - ${cliente.nome_empresa}`}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
           
            </div>
            <div className='grid gap-4 sm:grid-cols-2 '>
            {/* Data de Chegada */}
            <div className='space-y-2 w-full'>
              <Label>Data de Chegada *</Label>
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
                placeholder='Selecione a data de chegada'
              />
            </div>
      
                   {/* Status */}
              {isEdit && (
              <div className='space-y-2'>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: 'ativa' | 'fechada' | 'cancelada') =>
                    setFormData({ ...formData, status: v })
                  }>
                  <SelectTrigger className='bg-input border-border w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border'>
                    <SelectItem value='ativa'>Ativa</SelectItem>
                    <SelectItem value='fechada'>Fechada</SelectItem>
                    <SelectItem value='cancelada'>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            </div>
            {/* Veículo */}
            <div className='space-y-2 w-full'>
                <Label>Veículo *</Label>
                <Select
                  value={
                    formData.veiculo_id ? formData.veiculo_id.toString() : ''
                  }
                  onValueChange={(v) =>
                    setFormData({ ...formData, veiculo_id: parseInt(v) })
                  }
                  disabled={!formData.cliente_id}>
                  <SelectTrigger className='bg-input border-border w-full'>
                    <SelectValue
                      placeholder={
                        formData.cliente_id
                          ? 'Selecione um veículo'
                          : 'Selecione um cliente primeiro'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border'>
                    {veiculosDisponiveis.map((veiculo) => (
                      <SelectItem
                        key={veiculo.id}
                        value={veiculo.id.toString()}>
                        <span className='truncate block'>
                          {veiculo.placa} - {veiculo.modelo}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
       

            {/* Observação */}
            <div className='space-y-2'>
              <Label>Observação / Descrição do Serviço</Label>
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
              <Label>Peças Utilizadas</Label>
              <div className='flex gap-2'>
                <Select
                  value={selectedPecaId}
                  onValueChange={setSelectedPecaId}>
                  <SelectTrigger className='bg-input border-border flex-1 '>
                    <SelectValue placeholder='Selecione uma peça' />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border max-h-60'>
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
                  value={pecaQuantidade}
                  onChange={(e) =>
                    setPecaQuantidade(parseInt(e.target.value) || 1)
                  }
                  className='bg-input border-border w-20'
                />
                <Button type='button' onClick={handleAddPeca} variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              {/* Lista de Peças */}
              {formData.pecas.length > 0 && (
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
                          Preço Unit.
                        </TableHead>
                        <TableHead className='text-muted-foreground text-right'>
                          Subtotal
                        </TableHead>
                        <TableHead className='text-muted-foreground w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.pecas.map((item) => (
                        <TableRow
                          key={item.peca_id}
                          className='border-border hover:bg-muted/30'>
                          <TableCell className='text-foreground'>
                            {item.peca?.name_peca || 'Peça não encontrada'}
                          </TableCell>
                          <TableCell className='text-center text-foreground'>
                            {item.quantidade}
                          </TableCell>
                          <TableCell className='text-right text-muted-foreground'>
                            {formatCurrency(item.peca?.preco || 0)}
                          </TableCell>
                          <TableCell className='text-right text-foreground font-medium'>
                            {formatCurrency(
                              (item.peca?.preco || 0) * item.quantidade
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
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
            <div className='rounded-lg bg-secondary/50 p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-medium text-foreground'>
                  Total da Ordem
                </span>
                <span className='text-2xl font-bold text-primary'>
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
            disabled={isLoading || !formData.cliente_id || !formData.veiculo_id}
            className='bg-primary hover:bg-primary/90 w-32'>
            {isLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Ordem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
