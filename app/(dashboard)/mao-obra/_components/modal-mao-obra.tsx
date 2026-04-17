'use client';

import { useEffect } from 'react';

import { maoObraSchema } from '@/app/utils/validators';
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
import { Textarea } from '@/components/ui/textarea';
import type { MaoObra } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';

import type { MaoObraFormValues } from '../_hooks/useMaoObra';
import { Wrench } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

interface ModalMaoObraProps {
  mode: 'create' | 'edit';
  initialData?: Partial<MaoObra>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: MaoObraFormValues) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

const parseCurrencyInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  return Number(digits);
};

const formatCurrencyInput = (centavos: number): string => {
  if (centavos === 0) return '';
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

function getDefaultValues(initialData?: Partial<MaoObra>): MaoObraFormValues {
  return {
    nome: initialData?.nome ?? '',
    valor: initialData?.valor ?? 0,
    descricao: initialData?.descricao ?? ''
  };
}

export function ModalMaoObra({
  mode,
  initialData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalMaoObraProps) {
  const isEdit = mode === 'edit';
  const form = useForm<MaoObraFormValues>({
    resolver: zodResolver(maoObraSchema),
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
      icon={Wrench}
      title={isEdit ? 'Editar mão de obra' : 'Adicionar mão de obra'}
      description={
        isEdit
          ? 'Atualize os dados da mão de obra cadastrada.'
          : 'Cadastre um serviço reutilizável para usar nas ordens.'
      }
      trigger={trigger}
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='mao-obra-form' disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form id='mao-obra-form' onSubmit={handleFormSubmit}>
        <FieldGroup className='flex flex-col gap-4'>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor='nome'>Nome</FieldLabel>
              <Input
                id='nome'
                placeholder='Troca de óleo'
                className='bg-input border-border'
                aria-invalid={!!errors.nome}
                {...register('nome')}
              />
              <FieldError errors={[errors.nome]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel htmlFor='valor'>Valor (R$)</FieldLabel>
              <Controller
                name='valor'
                control={control}
                render={({ field }) => (
                  <Input
                    id='valor'
                    value={formatCurrencyInput(field.value ?? 0)}
                    onChange={(event) =>
                      field.onChange(parseCurrencyInput(event.target.value))
                    }
                    placeholder='R$ 0,00'
                    className='bg-input border-border'
                    inputMode='numeric'
                    aria-invalid={!!errors.valor}
                  />
                )}
              />
              <FieldError errors={[errors.valor]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel htmlFor='descricao'>Descrição (opcional)</FieldLabel>
              <Textarea
                id='descricao'
                placeholder='Detalhe o que está incluído no serviço...'
                className='bg-input border-border min-h-24'
                {...register('descricao')}
              />
              <FieldError errors={[errors.descricao]} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </form>
    </DialogShell>
  );
}
