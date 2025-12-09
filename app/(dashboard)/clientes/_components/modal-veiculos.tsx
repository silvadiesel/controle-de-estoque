'use client';

import { formatPlaca } from '@/app/utils/formatters';
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
import type { Veiculo } from '@/db/schema';

interface ModalVeiculosProps {
  mode: 'create' | 'edit';
  data: Partial<Veiculo>;
  setData: (data: Partial<Veiculo>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalVeiculos({
  mode,
  data,
  setData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalVeiculosProps) {
  const isEdit = mode === 'edit';

  const handlePlacaChange = (value: string) => {
    const formatted = formatPlaca(value);
    setData({ ...data, placa: formatted });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='bg-card border-border max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            {isEdit ? 'Editar Veículo' : 'Adicionar Veículo'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os dados do veículo'
              : 'Cadastre um novo veículo para este cliente'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label>Placa *</Label>
            <Input
              value={data.placa || ''}
              onChange={(e) => handlePlacaChange(e.target.value)}
              placeholder='ABC-1234'
              className='bg-input border-border uppercase'
            />
          </div>
          <div className='space-y-2'>
            <Label>Modelo *</Label>
            <Input
              value={data.modelo || ''}
              onChange={(e) => setData({ ...data, modelo: e.target.value })}
              placeholder='Scania R450'
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
