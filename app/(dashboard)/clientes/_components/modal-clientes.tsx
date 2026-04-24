'use client';

import { useEffect } from 'react';

import { formatCEP, formatCNPJ, formatCPF, formatPhone } from '@/app/utils/formatters';
import { clienteSchema } from '@/app/utils/validators';
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
import type { Cliente } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ClienteFormValues } from '../_hooks/useClientes';
import { Users } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

interface ModalClientesProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Cliente>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: ClienteFormValues) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

function getDefaultValues(initialData?: Partial<Cliente>): ClienteFormValues {
  return {
    nome_empresa: initialData?.nome_empresa ?? '',
    cpf: initialData?.cpf ?? '',
    cnpj: initialData?.cnpj ?? '',
    telefone: initialData?.telefone ?? '',
    rua: initialData?.rua ?? '',
    numero: initialData?.numero ?? '',
    bairro: initialData?.bairro ?? '',
    cidade: initialData?.cidade ?? '',
    estado: initialData?.estado ?? '',
    cep: initialData?.cep ?? ''
  };
}

export function ModalClientes({
  mode,
  initialData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalClientesProps) {
  const isEdit = mode === 'edit';
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
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
      icon={Users}
      title={isEdit ? 'Editar cliente' : 'Adicionar cliente'}
      description={
        isEdit
          ? 'Atualize os dados principais do cliente.'
          : 'Cadastre um novo cliente para atendimento e operação.'
      }
      trigger={trigger}
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='cliente-form' disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form id='cliente-form' onSubmit={handleFormSubmit}>
        <FieldGroup className='flex flex-col gap-4'>
          <Field>
            <FieldLabel htmlFor='nome_empresa'>Empresa</FieldLabel>
            <Input
              id='nome_empresa'
              placeholder='Transportadora Silva'
              className='bg-input border-border'
              aria-invalid={!!errors.nome_empresa}
              {...register('nome_empresa')}
            />
            <FieldError errors={[errors.nome_empresa]} />
          </Field>

          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='cpf'>CPF</FieldLabel>
              <Controller
                name='cpf'
                control={control}
                render={({ field }) => (
                  <Input
                    id='cpf'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(formatCPF(event.target.value))
                    }
                    placeholder='000.000.000-00'
                    className='bg-input border-border'
                    aria-invalid={!!errors.cpf}
                  />
                )}
              />

              <FieldError errors={[errors.cpf]} />
            </FieldContent>

            <FieldContent>
              <FieldLabel htmlFor='cnpj'>CNPJ</FieldLabel>
              <Controller
                name='cnpj'
                control={control}
                render={({ field }) => (
                  <Input
                    id='cnpj'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(formatCNPJ(event.target.value))
                    }
                    placeholder='00.000.000/0001-00'
                    className='bg-input border-border'
                    aria-invalid={!!errors.cnpj}
                  />
                )}
              />

              <FieldError errors={[errors.cnpj]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.telefone}>
            <FieldLabel htmlFor='telefone'>Telefone</FieldLabel>
            <Controller
              name='telefone'
              control={control}
              render={({ field }) => (
                <Input
                  id='telefone'
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(formatPhone(event.target.value))
                  }
                  placeholder='(11) 99999-9999'
                  className='bg-input border-border'
                  aria-invalid={!!errors.telefone}
                />
              )}
            />
            <FieldError errors={[errors.telefone]} />
          </Field>

          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='cep'>CEP</FieldLabel>
              <Controller
                name='cep'
                control={control}
                render={({ field }) => (
                  <Input
                    id='cep'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(formatCEP(event.target.value))
                    }
                    placeholder='00000-000'
                    className='bg-input border-border'
                    aria-invalid={!!errors.cep}
                  />
                )}
              />
              <FieldError errors={[errors.cep]} />
            </FieldContent>

            <FieldContent>
              <FieldLabel htmlFor='rua'>Rua</FieldLabel>
              <Input
                id='rua'
                placeholder='Av. Brasil'
                className='bg-input border-border'
                {...register('rua')}
              />
              <FieldError errors={[errors.rua]} />
            </FieldContent>
          </Field>

          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='numero'>Número</FieldLabel>
              <Input
                id='numero'
                placeholder='123'
                className='bg-input border-border'
                {...register('numero')}
              />
              <FieldError errors={[errors.numero]} />
            </FieldContent>

            <FieldContent>
              <FieldLabel htmlFor='bairro'>Bairro</FieldLabel>
              <Input
                id='bairro'
                placeholder='Centro'
                className='bg-input border-border'
                {...register('bairro')}
              />
              <FieldError errors={[errors.bairro]} />
            </FieldContent>
          </Field>

          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='cidade'>Cidade</FieldLabel>
              <Input
                id='cidade'
                placeholder='Porto Alegre'
                className='bg-input border-border'
                {...register('cidade')}
              />
              <FieldError errors={[errors.cidade]} />
            </FieldContent>

            <FieldContent>
              <FieldLabel htmlFor='estado'>Estado (UF)</FieldLabel>
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <Input
                    id='estado'
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2)
                      )
                    }
                    placeholder='RS'
                    maxLength={2}
                    className='bg-input border-border'
                    aria-invalid={!!errors.estado}
                  />
                )}
              />
              <FieldError errors={[errors.estado]} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </form>
    </DialogShell>
  );
}
