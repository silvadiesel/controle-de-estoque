'use client';

import { formatCNPJ, formatCPF, formatPhone } from '@/app/utils/formatters';
import { Button } from '@/components/ui/button';
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
import type { Cliente } from '@/db/schema';

interface ModalClientesProps {
  mode: 'create' | 'edit';
  data: Partial<Cliente>;
  setData: (data: Partial<Cliente>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalClientes({
  mode,
  data,
  setData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalClientesProps) {
  const isEdit = mode === 'edit';

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setData({ ...data, cpf: formatted });
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setData({ ...data, cnpj: formatted });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setData({ ...data, telefone: formatted });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='bg-card border-border max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            {isEdit ? 'Editar Cliente' : 'Adicionar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os dados do cliente'
              : 'Cadastre um novo cliente no sistema'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Nome do Cliente *</Label>
              <Input
                value={data.name_cliente || ''}
                onChange={(e) =>
                  setData({ ...data, name_cliente: e.target.value })
                }
                placeholder='João Silva'
                className='bg-input border-border'
              />
            </div>
            <div className='space-y-2'>
              <Label>Nome da Empresa *</Label>
              <Input
                value={data.nome_empresa || ''}
                onChange={(e) =>
                  setData({ ...data, nome_empresa: e.target.value })
                }
                placeholder='Transportadora Silva'
                className='bg-input border-border'
              />
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>CPF (ou informe CNPJ)</Label>
              <Input
                value={data.cpf || ''}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder='000.000.000-00'
                className='bg-input border-border'
              />
            </div>
            <div className='space-y-2'>
              <Label>CNPJ (ou informe CPF)</Label>
              <Input
                value={data.cnpj || ''}
                onChange={(e) => handleCNPJChange(e.target.value)}
                placeholder='00.000.000/0001-00'
                className='bg-input border-border'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Telefone *</Label>
            <Input
              value={data.telefone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder='(11) 99999-9999'
              className='bg-input border-border'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className='bg-primary hover:bg-primary/90'
            disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
