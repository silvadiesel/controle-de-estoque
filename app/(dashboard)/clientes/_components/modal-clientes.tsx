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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Cliente } from '@/db/schema';
import { Users } from 'lucide-react';

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
      <DialogContent className='bg-[#18181b] border-[#27272a] rounded-[12px] max-w-[540px] p-0'>
        <DialogHeader className='p-6 pb-4 border-b border-[#27272a]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/12'>
              <Users className='h-4 w-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-[16px] font-bold text-foreground'>
                {isEdit ? 'Editar Cliente' : 'Adicionar Cliente'}
              </DialogTitle>
              <DialogDescription className='text-[12px] text-muted-foreground'>
                {isEdit
                  ? 'Altere os dados do cliente'
                  : 'Cadastre um novo cliente no sistema'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='grid gap-4 p-6 pt-4'>
            <p className='text-[10px] uppercase tracking-[0.8px] text-muted-foreground font-semibold mb-3'>DADOS DO CLIENTE</p>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>
                  Nome do Cliente *
                </Label>
                <Input
                  value={data.name_cliente || ''}
                  onChange={(e) =>
                    setData({ ...data, name_cliente: e.target.value })
                  }
                  placeholder='João Silva'
                  className='bg-[#131316] border-[#27272a] rounded-[8px]'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>
                  Nome da Empresa *
                </Label>
                <Input
                  value={data.nome_empresa || ''}
                  onChange={(e) =>
                    setData({ ...data, nome_empresa: e.target.value })
                  }
                  placeholder='Transportadora Silva'
                  className='bg-[#131316] border-[#27272a] rounded-[8px]'
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>
                  CPF (ou informe CNPJ)
                </Label>
                <Input
                  value={data.cpf || ''}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder='000.000.000-00'
                  className='bg-[#131316] border-[#27272a] rounded-[8px]'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>
                  CNPJ (ou informe CPF)
                </Label>
                <Input
                  value={data.cnpj || ''}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  placeholder='00.000.000/0001-00'
                  className='bg-[#131316] border-[#27272a] rounded-[8px]'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-[12px] text-[#a1a1aa]'>Telefone *</Label>
              <Input
                value={data.telefone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder='(11) 99999-9999'
                className='bg-[#131316] border-[#27272a] rounded-[8px]'
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className='px-6 py-4 border-t border-[#27272a]'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            className='w-32 border-[#27272a] text-[#a1a1aa]'>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className='bg-primary hover:bg-primary/90 text-primary-foreground w-32'
            disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
