'use client';

import { useEffect } from 'react';

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Cliente } from '@/db/schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import type { ClienteFormValues } from '../_hooks/useClientes';
import { clienteSchema } from '@/app/utils/validators';
import { Users } from 'lucide-react';

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
    name_cliente: initialData?.name_cliente ?? '',
    nome_empresa: initialData?.nome_empresa ?? '',
    cpf: initialData?.cpf ?? '',
    cnpj: initialData?.cnpj ?? '',
    telefone: initialData?.telefone ?? ''
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className='max-w-[560px] gap-0 rounded-xl border-border bg-card p-0'>
        <DialogHeader className='border-b border-border p-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary/12'>
              <Users className='size-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {isEdit ? 'Editar cliente' : 'Adicionar cliente'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {isEdit
                  ? 'Atualize os dados principais do cliente.'
                  : 'Cadastre um novo cliente para atendimento e operação.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <form
            id='cliente-form'
            onSubmit={handleFormSubmit}
            className='p-6 pt-4'>
            <FieldGroup>
              <Field orientation='responsive'>
                <FieldContent>
                  <FieldLabel htmlFor='name_cliente'>Nome do cliente</FieldLabel>
                  <Input
                    id='name_cliente'
                    placeholder='João Silva'
                    aria-invalid={!!errors.name_cliente}
                    {...register('name_cliente')}
                  />
                  <FieldError errors={[errors.name_cliente]} />
                </FieldContent>

                <FieldContent>
                  <FieldLabel htmlFor='nome_empresa'>Empresa</FieldLabel>
                  <Input
                    id='nome_empresa'
                    placeholder='Transportadora Silva'
                    aria-invalid={!!errors.nome_empresa}
                    {...register('nome_empresa')}
                  />
                  <FieldError errors={[errors.nome_empresa]} />
                </FieldContent>
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
                        aria-invalid={!!errors.cpf}
                      />
                    )}
                  />
                  <FieldDescription>
                    Informe CPF ou CNPJ para concluir o cadastro.
                  </FieldDescription>
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
                        aria-invalid={!!errors.cnpj}
                      />
                    )}
                  />
                  <FieldDescription>
                    Se o cliente for pessoa jurídica, prefira o CNPJ.
                  </FieldDescription>
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
                      aria-invalid={!!errors.telefone}
                    />
                  )}
                />
                <FieldError errors={[errors.telefone]} />
              </Field>
            </FieldGroup>
          </form>
        </ScrollArea>

        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='cliente-form' disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
