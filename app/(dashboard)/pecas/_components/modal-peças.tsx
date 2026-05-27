'use client';

import type { ChangeEvent } from 'react';

import Image from 'next/image';

import { blockNonNumericKeyDown } from '@/app/utils/formatters';
import { handleEnterAsTab } from '@/hooks/use-enter-as-tab';
import type { PecaFormValues } from '@/app/utils/validators';
import { pecaFormSchema } from '@/app/utils/validators';
import { useModalPecaState } from '@/app/(dashboard)/pecas/_hook/useModalPecaState';
import { compressImage } from '@/lib/image-compress';
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

import { CloudDownload, Package, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
  const formKey = `${mode}-${initialData?.id ?? 'new'}-${isOpen ? 'open' : 'closed'}`;

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={setIsOpen}
      icon={Package}
      title={isEdit ? 'Editar Peça' : 'Adicionar Nova Peça'}
      description={
        isEdit
          ? 'Atualize as informações da peça.'
          : 'Preencha os dados da nova peça.'
      }
      trigger={trigger}
      contentClassName='sm:max-w-[720px]'
      bodyClassName='px-0'
      footer={
        <>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='peca-form' data-submit-button disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : isEdit
                ? 'Salvar Alterações'
                : 'Adicionar Peça'}
          </Button>
        </>
      }>
      {isOpen ? (
        <ModalPecasForm
          key={formKey}
          initialData={initialData}
          onSubmit={onSubmit}
          onClose={() => setIsOpen(false)}
          categoryOptions={categoryOptions}
          supplierOptions={supplierOptions}
        />
      ) : null}
    </DialogShell>
  );
}

function ModalPecasForm({
  initialData,
  onSubmit,
  onClose,
  categoryOptions,
  supplierOptions
}: {
  initialData?: Partial<Peca>;
  onSubmit: (data: PecaFormValues, image: string | null) => Promise<boolean>;
  onClose: () => void;
  categoryOptions: SearchableSelectOption[];
  supplierOptions: SearchableSelectOption[];
}) {
  const { initialState, image, setImage, precoDisplay, setPrecoDisplay } =
    useModalPecaState(initialData);

  const form = useForm<PecaFormValues>({
    resolver: zodResolver(pecaFormSchema),
    defaultValues: initialState.defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    register
  } = form;

  const handleFormSubmit = handleSubmit(async (values) => {
    const didSave = await onSubmit(values, image);
    if (didSave) {
      onClose();
    }
  });

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao processar imagem.';
      toast.error(message);
    } finally {
      // Limpa o input para permitir reescolher o mesmo arquivo após erro
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const supplierOptionsWithNone: SearchableSelectOption[] = [
    { value: '', label: 'Nenhum' },
    ...supplierOptions
  ];

  const categoryOptionsWithNone: SearchableSelectOption[] = [
    { value: '', label: 'Nenhuma' },
    ...categoryOptions
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 px-6'>
      {/* Image column */}
      <div className='md:col-span-4 flex flex-col gap-2 md:sticky md:top-0 md:self-start'>
        <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
          Imagem da Peça
        </span>

        {image ? (
          <div className='relative flex flex-col items-center justify-center w-full h-52 border border-border rounded-lg overflow-hidden bg-background'>
            <Image
              src={image}
              alt='Prévia da peça'
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
              aria-label='Remover imagem da peça'>
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <label
            htmlFor='dropzone-file'
            className='flex flex-col items-center justify-center w-full h-52 border border-dashed rounded-lg cursor-pointer bg-background border-border hover:border-primary transition-colors group'>
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
          onKeyDown={handleEnterAsTab}
          className='flex flex-col gap-5'>
            {/* Identificação */}
            <div>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
                Identificação
              </span>
              <FieldGroup className='mt-2'>
                <Field orientation='responsive'>
                  <FieldContent>
                    <FieldLabel htmlFor='name_peca'>Nome da peça</FieldLabel>
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
                          options={categoryOptionsWithNone}
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(v) =>
                            field.onChange(v ? Number(v) : null)
                          }
                          placeholder='Selecione a categoria'
                          searchPlaceholder='Buscar...'
                          emptyText='Nenhuma categoria encontrada.'
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
                        value={field.value || ''}
                        onKeyDown={blockNonNumericKeyDown}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          field.onChange(val ? Number(val) : 0);
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
  );
}
