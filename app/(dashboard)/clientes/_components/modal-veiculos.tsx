'use client';

import { useEffect } from 'react';

import { formatPlaca } from '@/app/utils/formatters';
import { veiculoSchema } from '@/app/utils/validators';
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
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Veiculo } from '@/db/schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import type { VeiculoFormValues } from '../_hooks/useVeiculos';
import { Car } from 'lucide-react';

interface ModalVeiculosProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Veiculo>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: VeiculoFormValues) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

function getDefaultValues(initialData?: Partial<Veiculo>): VeiculoFormValues {
  return {
    placa: initialData?.placa ?? '',
    modelo: initialData?.modelo ?? ''
  };
}

export function ModalVeiculos({
  mode,
  initialData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalVeiculosProps) {
  const isEdit = mode === 'edit';
  const form = useForm<VeiculoFormValues>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: getDefaultValues(initialData),
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = form;

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(initialData));
    }
  }, [initialData, isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset(getDefaultValues(initialData));
    }

    setIsOpen(open);
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const didSave = await onSubmit(values);

    if (didSave) {
      reset(getDefaultValues());
      setIsOpen(false);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className='max-w-[560px] gap-0 rounded-xl border-border bg-card p-0'>
        <DialogHeader className='border-b border-border p-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary/12'>
              <Car className='size-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {isEdit ? 'Editar veículo' : 'Adicionar veículo'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {isEdit
                  ? 'Atualize os dados do veículo vinculado a este cliente.'
                  : 'Cadastre um novo veículo para manter o histórico completo.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <form
            id='veiculo-form'
            onSubmit={handleFormSubmit}
            className='p-6 pt-4'>
            <FieldGroup>
              <Field orientation='responsive'>
                <FieldContent>
                  <FieldLabel htmlFor='placa'>Placa</FieldLabel>
                  <Controller
                    name='placa'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='placa'
                        value={field.value ?? ''}
                        onChange={(event) =>
                          field.onChange(formatPlaca(event.target.value))
                        }
                        placeholder='ABC-1234'
                        aria-invalid={!!errors.placa}
                        className='uppercase'
                      />
                    )}
                  />
                  <FieldError errors={[errors.placa]} />
                </FieldContent>

                <FieldContent>
                  <FieldLabel htmlFor='modelo'>Modelo</FieldLabel>
                  <Input
                    id='modelo'
                    placeholder='Scania R450'
                    aria-invalid={!!errors.modelo}
                    {...register('modelo')}
                  />
                  <FieldError errors={[errors.modelo]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </form>
        </ScrollArea>

        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='veiculo-form' disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
