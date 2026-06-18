import { memo, useRef, useState } from 'react';

import Image from 'next/image';

import { blockNonNumericKeyDown } from '@/app/utils/formatters';
import { Button } from '@/components/ui/button';
import type { Peca } from '@/db/schema';

import {
  Check,
  Edit,
  ImagePlus,
  Minus,
  Package,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface CardPecasProps {
  peca: Peca;
  categoryName: string;
  supplierName: string;
  formattedPrice: string;
  canManage: boolean;
  canEditImagem?: boolean;
  onEdit: (peca: Peca) => void;
  onEditImagem?: (peca: Peca) => void;
  onDelete: (peca: Peca) => void;
  onRestock: (peca: Peca, quantityToAdd: number) => Promise<void>;
}

export const CardPecas = memo(function CardPecas({
  peca,
  categoryName,
  supplierName,
  formattedPrice,
  canManage,
  canEditImagem = false,
  onEdit,
  onEditImagem,
  onDelete,
  onRestock
}: CardPecasProps) {
  const [isRestocking, setIsRestocking] = useState(false);
  const [addQuantity, setAddQuantity] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveQuantity = Number(addQuantity) || 1;

  const isLowStock =
    peca.quantidade > 0 && peca.quantidade <= (peca.alerta ?? 1);
  const isOutOfStock = peca.quantidade === 0;

  const handleSaveRestock = async () => {
    setIsSaving(true);
    try {
      await onRestock(peca, effectiveQuantity);
    } finally {
      setIsSaving(false);
      setIsRestocking(false);
      setAddQuantity('1');
    }
  };

  const cancelRestock = () => {
    setIsRestocking(false);
    setAddQuantity('1');
  };

  const quantityDisplay = isOutOfStock
    ? 'Sem estoque'
    : isLowStock
      ? `${peca.quantidade} un. \u2193`
      : `${peca.quantidade} un.`;

  return (
    <div className='flex flex-col bg-card border border-border rounded-lg overflow-hidden'>
      {/* Image area */}
      <div className='relative h-36 bg-background border-b border-border flex items-center justify-center'>
        {peca.imagem ? (
          <Image
            src={peca.imagem}
            alt={peca.name_peca}
            fill
            sizes='(max-width: 640px) 100vw, 400px'
            className='object-cover'
            loading='lazy'
            unoptimized
          />
        ) : (
          <Package
            className='h-12 w-12 text-muted-foreground'
            aria-hidden='true'
          />
        )}
      </div>

      {/* Body */}
      <div className='p-3.5 flex flex-col'>
        <h3 className='text-sm font-medium text-foreground line-clamp-1'>
          {peca.name_peca}
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {peca.codigo ? `Cod: ${peca.codigo}` : '\u00A0'}
        </p>
        <p className='text-xs text-muted-foreground mt-1 line-clamp-1'>
          {categoryName}
          {supplierName ? ` \u00B7 ${supplierName}` : ''}
        </p>

        {/* Separator + Price/Qty */}
        <div className='border-t border-border mt-3 pt-3 flex items-center justify-between'>
          <span className='text-lg font-bold text-primary'>
            {formattedPrice}
          </span>
          <span
            className={`text-xs ${
              isOutOfStock
                ? 'text-destructive font-medium'
                : isLowStock
                  ? 'text-warning'
                  : 'text-muted-foreground'
            }`}>
            {quantityDisplay}
          </span>
        </div>

        {canManage ? (
          isRestocking ? (
            <div
              className='mt-3'
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelRestock();
              }}>
              <div className='flex items-center gap-1.5'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  disabled={effectiveQuantity <= 1}
                  onClick={() =>
                    setAddQuantity(String(Math.max(1, effectiveQuantity - 1)))
                  }
                  aria-label='Diminuir quantidade'>
                  <Minus className='h-3.5 w-3.5' aria-hidden='true' />
                </Button>
                <input
                  ref={inputRef}
                  type='text'
                  inputMode='numeric'
                  value={addQuantity}
                  onKeyDown={blockNonNumericKeyDown}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAddQuantity(val);
                  }}
                  onBlur={() => {
                    if (!addQuantity || Number(addQuantity) < 1)
                      setAddQuantity('1');
                  }}
                  className='h-8 w-full min-w-0 rounded-md border border-border bg-background text-center text-sm font-semibold tabular-nums text-foreground outline-none focus:border-primary'
                  aria-label='Quantidade a adicionar'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  onClick={() => setAddQuantity(String(effectiveQuantity + 1))}
                  aria-label='Aumentar quantidade'>
                  <Plus className='h-3.5 w-3.5' aria-hidden='true' />
                </Button>
                <Button
                  type='button'
                  size='sm'
                  className=' bg-success text-white hover:bg-success/90'
                  disabled={isSaving}
                  onClick={handleSaveRestock}
                  aria-label='Confirmar reposição'>
                  <Check className='h-3.5 w-3.5' aria-hidden='true' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  className='text-muted-foreground border border-red-800/60 hover:text-destructive hover:bg-destructive/10'
                  onClick={cancelRestock}
                  aria-label='Cancelar reposição'>
                  <X className='h-3.5 w-3.5' aria-hidden='true' />
                </Button>
              </div>
              <p className='mt-1.5 text-center text-xs text-muted-foreground'>
                {peca.quantidade} + {effectiveQuantity} ={' '}
                <span className='font-semibold text-success'>
                  {peca.quantidade + effectiveQuantity} un.
                </span>
              </p>
            </div>
          ) : (
            <div className='flex gap-2 mt-3'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 h-8 text-xs'
                onClick={() => onEdit(peca)}>
                <Edit className='mr-1.5 h-3 w-3' aria-hidden='true' />
                Editar
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 text-success hover:text-success hover:bg-success/10 rounded-md'
                onClick={() => {
                  setIsRestocking(true);
                  setTimeout(() => inputRef.current?.select(), 0);
                }}
                aria-label={`Repor estoque de ${peca.name_peca}`}>
                <Plus className='h-3.5 w-3.5' aria-hidden='true' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md'
                onClick={() => onDelete(peca)}
                aria-label={`Excluir peça ${peca.name_peca}`}>
                <Trash2 className='h-3.5 w-3.5' aria-hidden='true' />
              </Button>
            </div>
          )
        ) : canEditImagem ? (
          <div className='flex mt-3'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 h-8 text-xs'
              onClick={() => onEditImagem?.(peca)}>
              <ImagePlus className='mr-1.5 h-3 w-3' aria-hidden='true' />
              Editar imagem
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
});
