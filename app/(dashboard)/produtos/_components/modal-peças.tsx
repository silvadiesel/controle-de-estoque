'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import Image from 'next/image';

import { pecaFormSchema } from '@/app/utils/validators';
import { blockNonNumericKeyDown } from '@/app/utils/formatters';
import { Button } from '@/components/ui/button';
import { DialogShell } from '@/components/ui/dialog-shell';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SearchableSelect,
  type SearchableSelectOption
} from '@/components/ui/searchable-select';
import type { Peca } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';

import type { PecaFormValues } from '@/app/utils/validators';
import { CloudDownload, Package, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

interface ModalPecasProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Peca>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: PecaFormValues, image: string | null) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
  categoryOptions: SearchableSelectOption[];
  supplierOptions: SearchableSelectOption[];
}

function getDefaultValues(initialData?: Partial<Peca>): PecaFormValues {
  return {
    name_peca: initialData?.name_peca ?? '',
    codigo: initialData?.codigo ?? '',
    estante: Array.isArray(initialData?.localizacao)
      ? String(initialData.localizacao[0] || '')
      : '',
    prateleira: Array.isArray(initialData?.localizacao)
      ? String(initialData.localizacao[1] || '')
      : '',
    categoria_id: initialData?.categoria_id ?? 0,
    fornecedor_id: initialData?.fornecedor_id ?? null,
    quantidade: initialData?.quantidade ?? 0,
    preco: initialData?.preco ?? 0,
    alerta: initialData?.alerta ?? 1
  };
}

export function ModalPecas({
  mode,
  initialData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger,
  categoryOptions,
  supplierOptions
}: ModalPecasProps) {
  const isEdit = mode === 'edit';
  const [image, setImage] = useState<string | null>(null);
  const [precoDisplay, setPrecoDisplay] = useState('');

  const form = useForm<PecaFormValues>({
    resolver: zodResolver(pecaFormSchema),
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
      setImage(initialData?.imagem ?? null);

      const preco = initialData?.preco;
      if (preco) {
        setPrecoDisplay((preco / 100).toString().replace('.', ','));
      } else {
        setPrecoDisplay('');
      }
    }
  }, [initialData, isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset(getDefaultValues());
      setImage(null);
      setPrecoDisplay('');
    }
    setIsOpen(open);
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const didSave = await onSubmit(values, image);
    if (didSave) {
      reset(getDefaultValues());
      setImage(null);
      setPrecoDisplay('');
      setIsOpen(false);
    }
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const supplierOptionsWithNone: SearchableSelectOption[] = [
    { value: '', label: 'Nenhum' },
    ...supplierOptions
  ];

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      icon={Package}
      title={isEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
      description={
        isEdit
          ? 'Atualize as informações do produto.'
          : 'Preencha os dados do novo produto.'
      }
      trigger={trigger}
      contentClassName='sm:max-w-[720px]'
      bodyClassName='px-0'
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='peca-form' disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : isEdit
                ? 'Salvar Alterações'
                : 'Adicionar Produto'}
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 md:grid-cols-12 gap-6 px-6'>
        {/* Image column */}
        <div className='md:col-span-4 flex flex-col gap-2 md:sticky md:top-0 md:self-start'>
          <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
            Imagem do Produto
          </span>

          {image ? (
            <div className='relative flex flex-col items-center justify-center w-full h-52 border border-border rounded-lg overflow-hidden bg-background'>
              <Image
                src={image}
                alt='Prévia do produto'
                fill
                className='object-contain'
                unoptimized
              />
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-md hover:scale-105 transition-transform'
                onClick={handleRemoveImage}
                aria-label='Remover imagem do produto'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <label
              htmlFor='dropzone-file'
              className='flex flex-col items-center justify-center w-full h-52 border border-dashed rounded-lg cursor-pointer bg-background border-border hover:border-primary transition-colors group'
            >
              <div className='flex flex-col items-center justify-center pt-5 pb-6 text-center px-4'>
                <CloudDownload className='w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors' />
                <p className='mb-1 text-sm text-muted-foreground font-medium'>
                  <span className='font-semibold text-foreground'>
                    Clique para adicionar
                  </span>
                </p>
                <p className='text-xs text-muted-foreground'>(Opcional)</p>
              </div>
              <input
                id='dropzone-file'
                type='file'
                className='hidden'
                accept='image/*'
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Form column */}
        <div className='md:col-span-8'>
          <form
            id='peca-form'
            onSubmit={handleFormSubmit}
            className='flex flex-col gap-5'
          >
            {/* Identificação */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Identificação
              </span>
              <FieldGroup className='mt-2'>
                <Field orientation='responsive'>
                  <FieldContent>
                    <FieldLabel htmlFor='name_peca'>Nome do produto</FieldLabel>
                    <Input
                      id='name_peca'
                      placeholder='Filtro de Óleo'
                      aria-invalid={!!errors.name_peca}
                      {...register('name_peca')}
                    />
                    <FieldError errors={[errors.name_peca]} />
                  </FieldContent>

                  <FieldContent>
                    <FieldLabel htmlFor='codigo'>Código</FieldLabel>
                    <Input
                      id='codigo'
                      placeholder='FO-001'
                      aria-invalid={!!errors.codigo}
                      {...register('codigo')}
                    />
                    <FieldError errors={[errors.codigo]} />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>

            {/* Localização no Estoque */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Localização no Estoque
              </span>
              <FieldGroup className='mt-2'>
                <Field orientation='responsive'>
                  <FieldContent>
                    <FieldLabel htmlFor='estante'>Estante</FieldLabel>
                    <Input
                      id='estante'
                      placeholder='Ex: A1'
                      {...register('estante')}
                    />
                  </FieldContent>

                  <FieldContent>
                    <FieldLabel htmlFor='prateleira'>Prateleira</FieldLabel>
                    <Input
                      id='prateleira'
                      placeholder='Ex: 3'
                      {...register('prateleira')}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>

            {/* Classificação */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Classificação
              </span>
              <FieldGroup className='mt-2'>
                <Field orientation='responsive'>
                  <FieldContent>
                    <FieldLabel htmlFor='categoria'>Categoria</FieldLabel>
                    <Controller
                      name='categoria_id'
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={categoryOptions}
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(v) =>
                            field.onChange(v ? Number(v) : undefined)
                          }
                          placeholder='Selecione a categoria'
                          searchPlaceholder='Buscar...'
                          emptyText='Nenhuma categoria encontrada.'
                          hasError={!!errors.categoria_id}
                        />
                      )}
                    />
                    <FieldError errors={[errors.categoria_id]} />
                  </FieldContent>

                  <FieldContent>
                    <FieldLabel htmlFor='fornecedor'>Fornecedor</FieldLabel>
                    <Controller
                      name='fornecedor_id'
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={supplierOptionsWithNone}
                          value={
                            field.value === null || field.value === undefined
                              ? ''
                              : String(field.value)
                          }
                          onValueChange={(v) =>
                            field.onChange(v ? Number(v) : null)
                          }
                          placeholder='Selecione o fornecedor'
                          searchPlaceholder='Buscar...'
                          emptyText='Nenhum fornecedor encontrado.'
                        />
                      )}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>

            {/* Estoque e Preço */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Estoque e Preço
              </span>
              <FieldGroup className='mt-2'>
                <Field orientation='responsive'>
                  <FieldContent>
                    <FieldLabel htmlFor='quantidade'>Quantidade</FieldLabel>
                    <Controller
                      name='quantidade'
                      control={control}
                      render={({ field }) => (
                        <Input
                          id='quantidade'
                          inputMode='numeric'
                          value={field.value ?? ''}
                          onKeyDown={blockNonNumericKeyDown}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            field.onChange(val ? Number(val) : 0);
                          }}
                          placeholder='0'
                          className='font-mono'
                          aria-invalid={!!errors.quantidade}
                        />
                      )}
                    />
                    <FieldError errors={[errors.quantidade]} />
                  </FieldContent>

                  <FieldContent>
                    <FieldLabel htmlFor='preco'>Preço (R$)</FieldLabel>
                    <Controller
                      name='preco'
                      control={control}
                      render={({ field }) => (
                        <Input
                          id='preco'
                          inputMode='decimal'
                          value={precoDisplay}
                          onChange={(e) => {
                            const input = e.target.value.replace(
                              /[^\d.,]/g,
                              ''
                            );
                            const parts = input.split(/[.,]/);
                            const formatted =
                              parts.length > 2
                                ? parts[0] + ',' + parts.slice(1).join('')
                                : input.replace('.', ',');
                            setPrecoDisplay(formatted);

                            const normalized = formatted.replace(',', '.');
                            const num = parseFloat(normalized);
                            if (!isNaN(num)) {
                              field.onChange(Math.round(num * 100));
                            } else if (formatted === '') {
                              field.onChange(0);
                            }
                          }}
                          placeholder='0,00'
                          className='font-mono'
                          aria-invalid={!!errors.preco}
                        />
                      )}
                    />
                    <FieldError errors={[errors.preco]} />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>

            {/* Alertas */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Alertas
              </span>
              <FieldGroup className='mt-2'>
                <Field>
                  <FieldLabel htmlFor='alerta'>
                    Quantidade para Alerta
                  </FieldLabel>
                  <Controller
                    name='alerta'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='alerta'
                        inputMode='numeric'
                        value={field.value ?? ''}
                        onKeyDown={blockNonNumericKeyDown}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          field.onChange(val ? Number(val) : 1);
                        }}
                        placeholder='1'
                        className='font-mono'
                        aria-invalid={!!errors.alerta}
                      />
                    )}
                  />
                  <FieldDescription>
                    Alerta será exibido quando a quantidade estiver abaixo deste
                    valor
                  </FieldDescription>
                  <FieldError errors={[errors.alerta]} />
                </Field>
              </FieldGroup>
            </div>
          </form>
        </div>
      </div>
    </DialogShell>
  );
}
