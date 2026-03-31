import { memo } from 'react';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { Peca } from '@/db/schema';

import { Edit, Layers, MapPin, Trash2, Truck, Wrench } from 'lucide-react';

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
  const estante = Array.isArray(peca.localizacao) ? peca.localizacao[0] : null;
  const prateleira = Array.isArray(peca.localizacao)
    ? peca.localizacao[1]
    : null;
  return (
    <Card className='group overflow-hidden flex flex-col sm:flex-row hover:border-primary/50 bg-card border-border'>
      <div className='relative w-full sm:w-48 h-48 sm:h-auto bg-muted/20 border-b sm:border-b-0 sm:border-r border-border shrink-0'>
        {peca.imagem ? (
          <Image
            src={peca.imagem}
            alt={peca.name_peca}
            fill
            sizes='(max-width: 640px) 100vw, 192px'
            className='object-contain p-3'
            loading='lazy'
            unoptimized
          />
        ) : (
          <div className='absolute inset-0 bg-muted m-3 flex items-center justify-center'>
            <Wrench className='h-20 w-20 text-muted-foreground/50' />
          </div>
        )}

        <div className='absolute top-2 left-2 flex flex-col gap-1'>
          <Badge
            variant={peca.quantidade > 0 ? 'secondary' : 'destructive'}
            className='font-bold shadow-sm text-xs bg-background/80 backdrop-blur-sm border-border'>
            {peca.quantidade} un.
          </Badge>
          {peca.quantidade <= (peca.alerta ?? 1) && (
            <Badge
              variant='destructive'
              className='font-bold shadow-sm text-xs bg-destructive/90 backdrop-blur-sm border-border'>
              ⚠️ Estoque Baixo
            </Badge>
          )}
        </div>
      </div>

      <div className='flex-col flex-1 p-4 justify-between flex gap-4'>
        <div className='flex flex-col justify-between items-start gap-2'>
          <div>
            <h3 className='font-bold text-xl text-foreground line-clamp-2'>
              {peca.name_peca}
            </h3>
            <p className='text-sm text-muted-foreground font-mono'>
              Cód:{peca.codigo}
            </p>
          </div>
          <h3 className='text-xl font-bold text-primary whitespace-nowrap'>
            {formattedPrice}
          </h3>
        </div>

        <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Layers className='h-4 w-4 text-primary/60 cursor-help' />
              </TooltipTrigger>
              <TooltipContent>Categoria</TooltipContent>
            </Tooltip>
            <span className='truncate'>{categoryName}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <MapPin className='h-4 w-4 text-primary/60 cursor-help' />
              </TooltipTrigger>
              <TooltipContent>Localização</TooltipContent>
            </Tooltip>
            <span className='truncate'>
              {estante || prateleira ? (
                <>
                  Estante: {estante || '-'} | Prateleira: {prateleira || '-'}
                </>
              ) : (
                '-'
              )}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm truncate mt-1'>
            <Truck className='h-4 w-4 text-primary/60' />
            <span>Fornecedor: {supplierName}</span>
          </div>
        </div>

        <div className='flex gap-2 mt-1 pt-3 border-t border-border/50'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-9'
            onClick={() => onEdit(peca)}>
            <Edit className='mr-2 h-3.5 w-3.5' />
            Editar
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            onClick={() => onDelete(peca)}
            aria-label={`Excluir produto ${peca.name_peca}`}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </Card>
  );
});
