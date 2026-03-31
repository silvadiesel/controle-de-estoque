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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Veiculo } from '@/db/schema';
import { Car } from 'lucide-react';

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
      <DialogContent className='bg-[#18181b] border-[#27272a] rounded-[12px] max-w-[540px] p-0'>
        <DialogHeader className='p-6 pb-4 border-b border-[#27272a]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-[8px] bg-[rgba(91,127,165,0.12)]'>
              <Car className='h-4 w-4 text-[#5b7fa5]' />
            </div>
            <div>
              <DialogTitle className='text-[16px] font-bold text-[#e4e4e7]'>
                {isEdit ? 'Editar Veículo' : 'Adicionar Veículo'}
              </DialogTitle>
              <DialogDescription className='text-[12px] text-[#52525b]'>
                {isEdit
                  ? 'Altere os dados do veículo'
                  : 'Cadastre um novo veículo para este cliente'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='grid gap-4 p-6 pt-4'>
            <p className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold mb-3'>DADOS DO VEÍCULO</p>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>Placa *</Label>
                <Input
                  value={data.placa || ''}
                  onChange={(e) => handlePlacaChange(e.target.value)}
                  placeholder='ABC-1234'
                  className='bg-[#131316] border-[#27272a] rounded-[8px] uppercase'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-[12px] text-[#a1a1aa]'>Modelo *</Label>
                <Input
                  value={data.modelo || ''}
                  onChange={(e) => setData({ ...data, modelo: e.target.value })}
                  placeholder='Scania R450'
                  className='bg-[#131316] border-[#27272a] rounded-[8px]'
                />
              </div>
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
            className='bg-[#5b7fa5] hover:bg-[#5b7fa5]/90 text-[#09090B] w-32'
            disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
