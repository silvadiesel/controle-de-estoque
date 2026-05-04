'use client';

import { useEffect } from 'react';

import { formatPlaca } from '@/app/utils/formatters';
import { veiculoSchema } from '@/app/utils/validators';
import { Button } from '@/components/ui/button';
import { DialogShell } from '@/components/ui/dialog-shell';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Veiculo } from '@/db/schema';
import { handleEnterAsTab } from '@/hooks/use-enter-as-tab';

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
    <DialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      icon={Car}
      title={isEdit ? 'Editar veículo' : 'Adicionar veículo'}
      description={
        isEdit
          ? 'Atualize os dados do veículo vinculado a este cliente.'
          : 'Cadastre um novo veículo para manter o histórico completo.'
      }
      trigger={trigger}
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='veiculo-form' data-submit-button disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form id='veiculo-form' onSubmit={handleFormSubmit} onKeyDown={handleEnterAsTab}>
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
    </DialogShell>
  );
}
