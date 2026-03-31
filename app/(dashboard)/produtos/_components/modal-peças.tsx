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

      <DialogContent className='bg-[#18181b] border-[#27272a] rounded-[12px] sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-5 pb-4 border-b border-[#27272a]'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-[8px] bg-[rgba(91,127,165,0.1)] flex items-center justify-center'>
              <Package className='h-4 w-4 text-[#5b7fa5]' />
            </div>
            <div>
              <DialogTitle className='text-[16px] font-bold text-[#e4e4e7]'>
                {editingPeca ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </DialogTitle>
              <p className='text-[12px] text-[#52525b] mt-0.5'>
                {editingPeca ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='p-5'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
            <div className='md:col-span-4 flex flex-col gap-2'>
              <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                Imagem do Produto
              </span>

              {newPeca.imagem ? (
                <div className='relative flex flex-col items-center justify-center w-full h-52 md:h-full min-h-[200px] border border-[#27272a] rounded-[8px] overflow-hidden bg-[#131316]'>
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
                  className='flex flex-col items-center justify-center w-full h-52 md:h-full min-h-[200px] border border-dashed rounded-[8px] cursor-pointer bg-[#131316] border-[#3f3f46] hover:border-[#5b7fa5] transition-colors group'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6 text-center px-4'>
                    <CloudDownload className='w-10 h-10 text-[#3f3f46] mb-3 group-hover:text-[#5b7fa5] transition-colors' />
                    <p className='mb-1 text-[13px] text-[#a1a1aa] font-medium'>
                      <span className='font-semibold text-[#e4e4e7]'>
                        Clique para adicionar
                      </span>
                    </p>
                    <p className='text-[11px] text-[#52525b]'>(Opcional)</p>
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
                  <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                    Identificacao
                  </span>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-2'>
                    <div className='md:col-span-2 flex flex-col gap-1.5'>
                      <Label htmlFor='name' className='text-[12px] text-[#a1a1aa]'>
                        Nome do produto
                      </Label>
                      <Input
                        id='name'
                        value={newPeca.name_peca || ''}
                        onChange={(e) =>
                          setNewPeca({ ...newPeca, name_peca: e.target.value })
                        }
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10'
                        required
                      />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='code' className='text-[12px] text-[#a1a1aa]'>
                        Codigo
                      </Label>
                      <Input
                        id='code'
                        value={newPeca.codigo || ''}
                        onChange={(e) =>
                          setNewPeca({ ...newPeca, codigo: e.target.value })
                        }
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                    Localizacao no Estoque
                  </span>
                  <div className='grid grid-cols-2 gap-3 mt-2'>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='estante' className='text-[12px] text-[#a1a1aa]'>
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
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10'
                        placeholder='Ex: A1'
                      />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='prateleira' className='text-[12px] text-[#a1a1aa]'>
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
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10'
                        placeholder='Ex: 3'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                    Classificacao
                  </span>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-2'>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='category' className='text-[12px] text-[#a1a1aa]'>
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
                        className='h-10'
                      />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='supplier' className='text-[12px] text-[#a1a1aa]'>
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
                        className='h-10'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                    Estoque e Preco
                  </span>
                  <div className='grid grid-cols-2 gap-3 mt-2'>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='quantity' className='text-[12px] text-[#a1a1aa]'>
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
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10 font-mono'
                      />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='price' className='text-[12px] text-[#a1a1aa]'>
                        Preco (R$)
                      </Label>
                      <Input
                        id='price'
                        inputMode='decimal'
                        value={precoInput}
                        onChange={handlePrecoChange}
                        placeholder='0,00'
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10 font-mono'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className='text-[10px] uppercase tracking-[0.8px] text-[#52525b] font-semibold'>
                    Alertas
                  </span>
                  <div className='mt-2'>
                    <div className='flex flex-col gap-1.5'>
                      <Label htmlFor='alerta' className='text-[12px] text-[#a1a1aa]'>
                        Quantidade para Alerta
                      </Label>
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
                        className='bg-[#131316] border-[#27272a] rounded-[8px] h-10 font-mono'
                      />
                      <p className='text-[11px] text-[#52525b]'>
                        Alerta sera exibido quando a quantidade estiver abaixo deste
                        valor
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-3 p-5 border-t border-[#27272a]'>
          <Button
            type='button'
            variant='ghost'
            size='default'
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className='text-[13px] text-[#a1a1aa] hover:text-[#e4e4e7]'>
            Cancelar
          </Button>
          <Button
            type='submit'
            form='peca-form'
            size='default'
            className='bg-[#5b7fa5] text-[#09090B] hover:bg-[#5b7fa5]/90 text-[13px] px-6'
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
