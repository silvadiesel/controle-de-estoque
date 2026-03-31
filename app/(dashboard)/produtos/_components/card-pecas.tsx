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
  onEdit: (peca: Peca) => void;
  onDelete: (peca: Peca) => void;
}

export const CardPecas = memo(function CardPecas({
  peca,
  categoryName,
  supplierName,
  formattedPrice,
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
    <div className='flex flex-col bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden'>
      {/* Image area */}
      <div className='relative h-[140px] bg-[#131316] border-b border-[#27272a] flex items-center justify-center'>
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
          <Package className='h-12 w-12 text-[#27272a]' />
        )}
      </div>

      {/* Body */}
      <div className='p-[14px] flex flex-col'>
        <h3 className='text-[14px] font-medium text-[#e4e4e7] line-clamp-1'>
          {peca.name_peca}
        </h3>
        <p className='text-[11px] text-[#3f3f46] mt-0.5'>
          {peca.codigo ? `Cod: ${peca.codigo}` : '\u00A0'}
        </p>
        <p className='text-[12px] text-[#52525b] mt-1 line-clamp-1'>
          {categoryName}{supplierName ? ` \u00B7 ${supplierName}` : ''}
        </p>

        {/* Separator + Price/Qty */}
        <div className='border-t border-[#27272a] mt-3 pt-3 flex items-center justify-between'>
          <span className='text-[17px] font-bold text-[#5b7fa5]'>
            {formattedPrice}
          </span>
          <span
            className={`text-[12px] ${
              isOutOfStock
                ? 'text-destructive font-medium'
                : isLowStock
                  ? 'text-[#eab308]'
                  : 'text-[#a1a1aa]'
            }`}>
            {quantityDisplay}
          </span>
        </div>

        {/* Actions */}
        <div className='flex gap-2 mt-3'>
          <Button
            variant='ghost'
            size='sm'
            className='flex-1 h-8 bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] text-[12px] rounded-[6px]'
            onClick={() => onEdit(peca)}>
            <Edit className='mr-1.5 h-3 w-3' />
            Editar
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 text-[#52525b] hover:text-destructive hover:bg-destructive/10 rounded-[6px]'
            onClick={() => onDelete(peca)}
            aria-label={`Excluir produto ${peca.name_peca}`}>
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
});
