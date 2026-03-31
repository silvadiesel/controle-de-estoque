import type { ChangeEvent, FormEvent } from 'react';

import Image from 'next/image';

import { ComboboxSearch } from '@/components/combobox-search';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Peca } from '@/db/schema';

import { CloudDownload, Package, Trash2 } from 'lucide-react';

interface ComboItem {
  id: number;
  label: string;
}

interface ModalPecasProps {
  editingPeca: Peca | null;
  newPeca: Partial<Peca> & { imagem?: string | null };
  setNewPeca: (data: Partial<Peca>) => void;
  isOpen: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  isLoading: boolean;
  handleOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  categoryItems: ComboItem[];
  fornecedorItems: ComboItem[];
  precoInput: string;
  handlePrecoChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function ModalPecas({
  editingPeca,
  newPeca,
  setNewPeca,
  isOpen,
  onSubmit,
  isLoading,
  handleOpenChange,
  trigger,
  handleImageChange,
  handleRemoveImage,
  categoryItems,
  fornecedorItems,
  precoInput,
  handlePrecoChange
}: ModalPecasProps) {
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className='bg-card border-border rounded-xl sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-5 pb-4 border-b border-border'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12'>
              <Package className='h-4 w-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {editingPeca ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </DialogTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {editingPeca ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='p-5'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
            <div className='md:col-span-4 flex flex-col gap-2'>
              <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                Imagem do Produto
              </span>

              {newPeca.imagem ? (
                <div className='relative flex flex-col items-center justify-center w-full h-52 md:h-full min-h-[200px] border border-border rounded-lg overflow-hidden bg-background'>
                  <Image
                    src={newPeca.imagem}
                    alt='Previa do produto'
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
                    aria-label='Remover imagem do produto'>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor='dropzone-file'
                  className='flex flex-col items-center justify-center w-full h-52 md:h-full min-h-[200px] border border-dashed rounded-lg cursor-pointer bg-background border-border hover:border-primary transition-colors group'>
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

            <div className='md:col-span-8'>
              <form
                id='peca-form'
                onSubmit={onSubmit}
                className='flex flex-col gap-5'>
                <div>
                  <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                    Identificacao
                  </span>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-2'>
                    <div className='md:col-span-2'>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor='name'>Nome do produto</FieldLabel>
                          <Input
                            id='name'
                            value={newPeca.name_peca || ''}
                            onChange={(e) =>
                              setNewPeca({ ...newPeca, name_peca: e.target.value })
                            }
                            required
                          />
                        </Field>
                      </FieldGroup>
                    </div>
                    <div>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor='code'>Codigo</FieldLabel>
                          <Input
                            id='code'
                            value={newPeca.codigo || ''}
                            onChange={(e) =>
                              setNewPeca({ ...newPeca, codigo: e.target.value })
                            }
                            required
                          />
                        </Field>
                      </FieldGroup>
                    </div>
                  </div>
                </div>

                <div>
                  <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                    Localizacao no Estoque
                  </span>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='estante'>Estante</FieldLabel>
                        <Input
                          id='estante'
                          value={
                            Array.isArray(newPeca.localizacao)
                              ? String(newPeca.localizacao[0] || '')
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const prat = Array.isArray(newPeca.localizacao)
                              ? newPeca.localizacao[1]
                              : '';
                            setNewPeca({
                              ...newPeca,
                              localizacao:
                                val || prat ? [val, String(prat || '')] : null
                            });
                          }}
                          placeholder='Ex: A1'
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='prateleira'>Prateleira</FieldLabel>
                        <Input
                          id='prateleira'
                          value={
                            Array.isArray(newPeca.localizacao)
                              ? String(newPeca.localizacao[1] || '')
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const est = Array.isArray(newPeca.localizacao)
                              ? newPeca.localizacao[0]
                              : '';
                            setNewPeca({
                              ...newPeca,
                              localizacao:
                                est || val ? [String(est || ''), val] : null
                            });
                          }}
                          placeholder='Ex: 3'
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </div>

                <div>
                  <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                    Classificacao
                  </span>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='category'>Categoria</FieldLabel>
                        <ComboboxSearch
                          items={categoryItems}
                          value={newPeca.categoria_id}
                          onSelect={(value) =>
                            setNewPeca({
                              ...newPeca,
                              categoria_id: value ?? undefined
                            })
                          }
                          placeholder='Selecione a categoria'
                          searchPlaceholder='Buscar...'
                          emptyMessage='Nada encontrado.'
                          className='h-10'
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='supplier'>Fornecedor</FieldLabel>
                        <ComboboxSearch
                          items={fornecedorItems}
                          value={newPeca.fornecedor_id}
                          onSelect={(value) =>
                            setNewPeca({ ...newPeca, fornecedor_id: value })
                          }
                          placeholder='Selecione o fornecedor'
                          searchPlaceholder='Buscar...'
                          emptyMessage='Nada encontrado.'
                          allowNone
                          noneLabel='Nenhum'
                          className='h-10'
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </div>

                <div>
                  <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                    Estoque e Preco
                  </span>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='quantity'>Quantidade</FieldLabel>
                        <Input
                          id='quantity'
                          type='number'
                          value={newPeca.quantidade || ''}
                          onChange={(e) =>
                            setNewPeca({
                              ...newPeca,
                              quantidade: Number(e.target.value) || undefined
                            })
                          }
                          placeholder='0'
                          className='font-mono'
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='price'>Preco (R$)</FieldLabel>
                        <Input
                          id='price'
                          inputMode='decimal'
                          value={precoInput}
                          onChange={handlePrecoChange}
                          placeholder='0,00'
                          className='font-mono'
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </div>

                <div>
                  <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                    Alertas
                  </span>
                  <div className='mt-2'>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor='alerta'>Quantidade para Alerta</FieldLabel>
                        <Input
                          id='alerta'
                          type='number'
                          value={newPeca.alerta ?? ''}
                          onChange={(e) =>
                            setNewPeca({
                              ...newPeca,
                              alerta: e.target.value
                                ? Number(e.target.value)
                                : undefined
                            })
                          }
                          placeholder='1'
                          min='0'
                          className='font-mono'
                        />
                        <FieldDescription>
                          Alerta sera exibido quando a quantidade estiver abaixo deste valor
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-3 p-5 border-t border-border'>
          <Button
            type='button'
            variant='ghost'
            size='default'
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className='text-sm text-muted-foreground hover:text-foreground'>
            Cancelar
          </Button>
          <Button
            type='submit'
            form='peca-form'
            size='default'
            className='bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-6'
            disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : editingPeca
                ? 'Salvar Alteracoes'
                : 'Adicionar Produto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
