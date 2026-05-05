'use client';

import { useEffect } from 'react';
import { formatCNPJ, formatPhone } from '@/app/utils/formatters';
import { fornecedorSchema } from '@/app/utils/validators';
import { Button } from '@/components/ui/button';
import { DialogShell } from '@/components/ui/dialog-shell';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Fornecedor } from '@/db/schema';
import { handleEnterAsTab } from '@/hooks/use-enter-as-tab';
import { zodResolver } from '@hookform/resolvers/zod';
import { Factory } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { FornecedorFormValues } from '../_hooks';

interface ModalFornecedoresProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Fornecedor>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: FornecedorFormValues) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

function getDefaultValues(initialData?: Partial<Fornecedor>): FornecedorFormValues {
  return {
    name_empresa: initialData?.name_empresa ?? '',
    cnpj: initialData?.cnpj ?? '',
    telefone: initialData?.telefone ?? '',
    email: initialData?.email ?? ''
  };
}

export function ModalFornecedores({
  mode, initialData, isOpen, setIsOpen, onSubmit, isLoading, trigger
}: ModalFornecedoresProps) {
  const isEdit = mode === 'edit';
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: getDefaultValues(initialData),
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  const { control, formState: { errors }, handleSubmit, register, reset } = form;

  useEffect(() => {
    if (isOpen) reset(getDefaultValues(initialData));
  }, [initialData, isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) reset(getDefaultValues(initialData));
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
      icon={Factory}
      title={isEdit ? 'Editar fornecedor' : 'Adicionar fornecedor'}
      description={isEdit ? 'Atualize os dados do fornecedor.' : 'Cadastre um novo fornecedor no sistema.'}
      trigger={trigger}
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type='submit' form='fornecedor-form' data-submit-button disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form id='fornecedor-form' onSubmit={handleFormSubmit} onKeyDown={handleEnterAsTab}>
        <FieldGroup className='flex flex-col gap-4'>
          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='name_empresa'>Nome / Razão Social</FieldLabel>
              <Input
                id='name_empresa'
                placeholder='AutoPeças Brasil'
                className='bg-input border-border'
                aria-invalid={!!errors.name_empresa}
                {...register('name_empresa')}
              />
              <FieldError errors={[errors.name_empresa]} />
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
                    onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                    placeholder='00.000.000/0001-00'
                    className='bg-input border-border'
                    aria-invalid={!!errors.cnpj}
                  />
                )}
              />
              <FieldError errors={[errors.cnpj]} />
            </FieldContent>
          </Field>

          <Field orientation='responsive'>
            <FieldContent>
              <FieldLabel htmlFor='telefone'>Telefone</FieldLabel>
              <Controller
                name='telefone'
                control={control}
                render={({ field }) => (
                  <Input
                    id='telefone'
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    placeholder='(11) 99999-9999'
                    className='bg-input border-border'
                    aria-invalid={!!errors.telefone}
                  />
                )}
              />
              <FieldError errors={[errors.telefone]} />
            </FieldContent>
            <FieldContent>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                placeholder='vendas@fornecedor.com'
                className='bg-input border-border'
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </form>
    </DialogShell>
  );
}
