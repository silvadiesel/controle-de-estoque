import { memo } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import type { Peca } from '@/db/schema';

import { Edit, Package, Trash2 } from 'lucide-react';

interface CardPecasProps {
  peca: Peca;
  categoryName: string;
  supplierName: string;
  formattedPrice: string;
  canManage: boolean;
  onEdit: (peca: Peca) => void;
  onDelete: (peca: Peca) => void;
}

export const CardPecas = memo(function CardPecas({
  peca,
  categoryName,
  supplierName,
  formattedPrice,
  canManage,
  onEdit,
  onDelete
}: CardPecasProps) {
  const isLowStock = peca.quantidade > 0 && peca.quantidade <= (peca.alerta ?? 1);
  const isOutOfStock = peca.quantidade === 0;

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
          <Package className='h-12 w-12 text-muted-foreground' aria-hidden='true' />
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
          {categoryName}{supplierName ? ` \u00B7 ${supplierName}` : ''}
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
              className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md'
              onClick={() => onDelete(peca)}
              aria-label={`Excluir peça ${peca.name_peca}`}>
              <Trash2 className='h-3.5 w-3.5' aria-hidden='true' />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
});
