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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Peca } from '@/db/schema';

import { CloudDownload, Trash2 } from 'lucide-react';

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

      <DialogContent className='bg-card border-border sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-6 pb-2 border-b border-border/10'>
          <DialogTitle className='text-2xl font-bold text-foreground'>
            {editingPeca ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-8'>
            <div className='md:col-span-4 flex flex-col gap-3'>
              <Label className='text-lg font-semibold'>Imagem do Produto</Label>

              {newPeca.imagem ? (
                <div className='relative flex flex-col items-center justify-center w-full h-64 md:h-full min-h-[250px] border-2 border-border rounded-xl overflow-hidden bg-black/5'>
                  <Image
                    src={newPeca.imagem}
                    alt='Prévia do produto'
                    fill
                    className='object-contain'
                    unoptimized
                  />
                  <Button
                    type='button'
                    variant='destructive'
                    size='icon'
                    className='absolute top-2 right-2 h-10 w-10 rounded-full shadow-md hover:scale-105 transition-transform'
                    onClick={handleRemoveImage}
                    title='Remover imagem'>
                    <Trash2 className='h-5 w-5' />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor='dropzone-file'
                  className='flex flex-col items-center justify-center w-full h-64 md:h-full min-h-[250px] border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 border-muted-foreground/30 hover:bg-muted/50 hover:border-primary transition-colors group'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6 text-center px-4'>
                    <CloudDownload className='w-16 h-16 text-muted-foreground mb-4 group-hover:text-primary transition-colors' />
                    <p className='mb-2 text-base text-muted-foreground font-medium'>
                      <span className='font-bold text-foreground'>
                        Clique para adicionar foto
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
                className='flex flex-col gap-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2 flex flex-col gap-2'>
                    <Label htmlFor='name' className='text-base'>
                      Nome do produto
                    </Label>
                    <Input
                      id='name'
                      value={newPeca.name_peca || ''}
                      onChange={(e) =>
                        setNewPeca({ ...newPeca, name_peca: e.target.value })
                      }
                      className='bg-input border-border h-12 text-lg'
                      required
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='code' className='text-base'>
                      Código
                    </Label>
                    <Input
                      id='code'
                      value={newPeca.codigo || ''}
                      onChange={(e) =>
                        setNewPeca({ ...newPeca, codigo: e.target.value })
                      }
                      className='bg-input border-border h-12 text-lg'
                      required
                    />
                  </div>
                </div>

                <div className='p-4 border rounded-lg bg-muted/10'>
                  <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
                    Localização no Estoque
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor='estante' className='text-base'>
                        Estante
                      </Label>
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
                        className='bg-input border-border h-12 text-lg'
                        placeholder='Ex: A1'
                      />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor='prateleira' className='text-base'>
                        Prateleira
                      </Label>
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
                        className='bg-input border-border h-12 text-lg'
                        placeholder='Ex: 3'
                      />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='category' className='text-base'>
                      Categoria
                    </Label>
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
                      className='h-12'
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='supplier' className='text-base'>
                      Fornecedor
                    </Label>
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
                      className='h-12'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='quantity' className='text-base'>
                      Quantidade
                    </Label>
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
                      className='bg-input border-border h-12 text-lg font-mono'
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='price' className='text-base'>
                      Preço (R$)
                    </Label>
                    <Input
                      id='price'
                      inputMode='decimal'
                      value={precoInput}
                      onChange={handlePrecoChange}
                      placeholder='0,00'
                      className='bg-input border-border h-12 text-lg font-mono'
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-4 p-6 border-t border-border bg-muted/20'>
          <Button
            type='button'
            variant='outline'
            size='lg'
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className='text-base'>
            Cancelar
          </Button>
          <Button
            type='submit'
            form='peca-form'
            size='lg'
            className='bg-primary text-primary-foreground text-base px-8'
            disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : editingPeca
                ? 'Salvar Alterações'
                : 'Adicionar Produto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
