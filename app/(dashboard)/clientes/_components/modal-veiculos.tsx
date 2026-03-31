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
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
      <DialogContent className='bg-card border-border rounded-xl max-w-[540px] p-0'>
        <DialogHeader className='p-6 pb-4 border-b border-border'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12'>
              <Car className='h-4 w-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {isEdit ? 'Editar Veículo' : 'Adicionar Veículo'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {isEdit
                  ? 'Altere os dados do veículo'
                  : 'Cadastre um novo veículo para este cliente'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='p-6 pt-4'>
            <FieldGroup>
              <Field orientation='responsive'>
                <FieldContent>
                  <FieldLabel htmlFor='placa'>Placa *</FieldLabel>
                  <Input
                    id='placa'
                    value={data.placa || ''}
                    onChange={(e) => handlePlacaChange(e.target.value)}
                    placeholder='ABC-1234'
                    className='uppercase'
                  />
                </FieldContent>
                <FieldContent>
                  <FieldLabel htmlFor='modelo'>Modelo *</FieldLabel>
                  <Input
                    id='modelo'
                    value={data.modelo || ''}
                    onChange={(e) => setData({ ...data, modelo: e.target.value })}
                    placeholder='Scania R450'
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>
        </ScrollArea>
        <DialogFooter className='px-6 py-4 border-t border-border'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            className='w-32 border-border text-muted-foreground'>
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
