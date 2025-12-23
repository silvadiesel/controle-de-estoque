import type { FormEvent } from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { Categorias, Fornecedor, Peca } from '@/db/schema';

interface ModalPecasProps {
  editingPeca: Peca | null;
  newPeca: Partial<Peca>;
  setNewPeca: (data: Partial<Peca>) => void;
  isOpen: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  isLoading: boolean;
  categories: Categorias[];
  fornecedores: Fornecedor[];
  handleOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ModalPecas({
  editingPeca,
  newPeca,
  setNewPeca,
  isOpen,
  onSubmit,
  isLoading,
  categories,
  fornecedores,
  handleOpenChange,
  trigger
}: ModalPecasProps) {
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            {editingPeca ? 'Editar Produto' : 'Adicionar Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='name'>Nome do produto</Label>
              <Input
                id='name'
                value={newPeca.name_peca || ''}
                onChange={(e) =>
                  setNewPeca({ ...newPeca, name_peca: e.target.value })
                }
                className='bg-input border-border'
                required
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='code'>Código do produto</Label>
              <Input
                id='code'
                value={newPeca.codigo || ''}
                onChange={(e) =>
                  setNewPeca({ ...newPeca, codigo: e.target.value })
                }
                className='bg-input border-border'
                required
              />
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='estante'>Estante</Label>
              <Input
                id='estante'
                type='text'
                value={
                  Array.isArray(newPeca.localizacao) &&
                  newPeca.localizacao.length > 0 &&
                  newPeca.localizacao[0] !== null &&
                  newPeca.localizacao[0] !== undefined
                    ? String(newPeca.localizacao[0])
                    : ''
                }
                onChange={(e) => {
                  const estanteValue = e.target.value.trim();
                  const prateleira =
                    Array.isArray(newPeca.localizacao) &&
                    newPeca.localizacao.length > 1 &&
                    newPeca.localizacao[1] !== null &&
                    newPeca.localizacao[1] !== undefined
                      ? String(newPeca.localizacao[1])
                      : '';
                  setNewPeca({
                    ...newPeca,
                    localizacao:
                      estanteValue || prateleira
                        ? [estanteValue, prateleira]
                        : null
                  });
                }}
                className='bg-input border-border'
                placeholder='Ex: 1, A1, E-2'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='prateleira'>Prateleira</Label>
              <Input
                id='prateleira'
                type='text'
                value={
                  Array.isArray(newPeca.localizacao) &&
                  newPeca.localizacao.length > 1 &&
                  newPeca.localizacao[1] !== null &&
                  newPeca.localizacao[1] !== undefined
                    ? String(newPeca.localizacao[1])
                    : ''
                }
                onChange={(e) => {
                  const prateleiraValue = e.target.value.trim();
                  const estante =
                    Array.isArray(newPeca.localizacao) &&
                    newPeca.localizacao.length > 0 &&
                    newPeca.localizacao[0] !== null &&
                    newPeca.localizacao[0] !== undefined
                      ? String(newPeca.localizacao[0])
                      : '';
                  setNewPeca({
                    ...newPeca,
                    localizacao:
                      estante || prateleiraValue
                        ? [estante, prateleiraValue]
                        : null
                  });
                }}
                className='bg-input border-border'
                placeholder='Ex: 2, B3, P-5'
              />
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='category'>Categoria</Label>
              <Select
                value={newPeca.categoria_id?.toString() || ''}
                onValueChange={(value) =>
                  setNewPeca({
                    ...newPeca,
                    categoria_id: Number.parseInt(value) || undefined
                  })
                }>
                <SelectTrigger className='bg-input border-border'>
                  <SelectValue placeholder='Selecione' />
                </SelectTrigger>
                <SelectContent className='bg-popover border-border'>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='supplier'>Fornecedor</Label>
              <Select
                value={
                  newPeca.fornecedor_id === null
                    ? 'none'
                    : newPeca.fornecedor_id
                      ? newPeca.fornecedor_id.toString()
                      : undefined
                }
                onValueChange={(value) =>
                  setNewPeca({
                    ...newPeca,
                    fornecedor_id:
                      value === 'none' ? null : Number.parseInt(value)
                  })
                }>
                <SelectTrigger className='bg-input border-border'>
                  <SelectValue placeholder='Selecione' />
                </SelectTrigger>
                <SelectContent className='bg-popover border-border'>
                  <SelectItem value='none'>Nenhum</SelectItem>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem
                      key={fornecedor.id}
                      value={fornecedor.id.toString()}>
                      {fornecedor.name_empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='quantity'>Quantidade</Label>
              <Input
                id='quantity'
                type='number'
                value={newPeca.quantidade || ''}
                onChange={(e) =>
                  setNewPeca({
                    ...newPeca,
                    quantidade:
                      e.target.value === ''
                        ? undefined
                        : Number.parseInt(e.target.value) || undefined
                  })
                }
                placeholder='Ex: 10'
                className='bg-input border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='price'>Preço (R$)</Label>
              <Input
                id='price'
                type='text'
                inputMode='decimal'
                value={
                  newPeca.preco && newPeca.preco > 0
                    ? (newPeca.preco / 100).toString()
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewPeca({
                      ...newPeca,
                      preco: undefined
                    });
                    return;
                  }

                  // Remove caracteres não numéricos exceto ponto e vírgula
                  const cleanValue = value
                    .replace(/[^\d.,]/g, '')
                    .replace(',', '.');

                  // Permite apenas um ponto decimal
                  const parts = cleanValue.split('.');
                  const formattedValue =
                    parts.length > 2
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : cleanValue;

                  if (formattedValue === '' || formattedValue === '.') {
                    setNewPeca({
                      ...newPeca,
                      preco: undefined
                    });
                    return;
                  }

                  const numValue = Number.parseFloat(formattedValue);
                  if (!isNaN(numValue) && numValue >= 0) {
                    setNewPeca({
                      ...newPeca,
                      preco: Math.round(numValue * 100)
                    });
                  }
                }}
                placeholder='Ex: 25.50'
                className='bg-input border-border'
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type='submit'
              className='bg-primary text-primary-foreground'
              disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingPeca ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
