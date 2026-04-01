'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import { type Peca } from '@/db/schema';

import { Minus, Package2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type OrdemItemPeca = Pick<Peca, 'id' | 'name_peca' | 'quantidade' | 'preco'>;

export interface OrdemItemBuilderValue {
  peca_id: number;
  quantidade: number;
  peca: OrdemItemPeca | null;
}

interface OrdemItemsBuilderProps {
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  items: OrdemItemBuilderValue[];
  pecas: Peca[];
  onChange: (items: OrdemItemBuilderValue[]) => void;
  error?: string;
  required?: boolean;
}

const formatCurrency = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

export function OrdemItemsBuilder({
  label,
  emptyTitle,
  emptyDescription,
  items,
  pecas,
  onChange,
  error,
  required = false
}: OrdemItemsBuilderProps) {
  const [selectedPecaId, setSelectedPecaId] = useState('');

  const pecaOptions = useMemo(
    () =>
      pecas.map((peca) => ({
        value: peca.id.toString(),
        label: peca.name_peca,
        sublabel: `${formatCurrency(peca.preco)} · Estoque: ${peca.quantidade}`
      })),
    [pecas]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.peca?.preco ?? 0) * item.quantidade,
        0
      ),
    [items]
  );

  const updateItemQuantity = (pecaId: number, delta: 1 | -1) => {
    const currentItem = items.find((item) => item.peca_id === pecaId);
    const estoque = currentItem?.peca?.quantidade ?? 0;

    if (!currentItem) return;

    const nextQuantity = currentItem.quantidade + delta;

    if (nextQuantity < 1) {
      onChange(items.filter((item) => item.peca_id !== pecaId));
      return;
    }

    if (nextQuantity > estoque) {
      toast.error(
        `Estoque insuficiente para "${currentItem.peca?.name_peca ?? 'peça'}". Disponível: ${estoque}`
      );
      return;
    }

    onChange(
      items.map((item) =>
        item.peca_id === pecaId ? { ...item, quantidade: nextQuantity } : item
      )
    );
  };

  const handleSelectPeca = (pecaId: string) => {
    const parsedId = Number(pecaId);
    const selectedPeca = pecas.find((peca) => peca.id === parsedId);

    if (!selectedPeca) return;
    if (selectedPeca.quantidade === 0) {
      toast.error(`"${selectedPeca.name_peca}" está sem estoque.`);
      return;
    }

    const existingItem = items.find((item) => item.peca_id === parsedId);

    if (existingItem) {
      updateItemQuantity(parsedId, 1);
    } else {
      onChange([
        ...items,
        {
          peca_id: parsedId,
          quantidade: 1,
          peca: selectedPeca
        }
      ]);
    }

    setSelectedPecaId('');
  };

  return (
    <FieldGroup>
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel>
          {label}
          {required ? ' *' : null}
        </FieldLabel>
        <FieldContent>
          <SearchableSelect
            options={pecaOptions}
            value={selectedPecaId}
            onValueChange={handleSelectPeca}
            placeholder='Buscar e adicionar peça'
            searchPlaceholder='Buscar peça...'
            emptyText='Nenhuma peça encontrada'
            hasError={Boolean(error)}
          />
          <FieldDescription>
            O estoque é validado no momento da seleção e do ajuste de quantidade.
          </FieldDescription>
          <FieldError>{error}</FieldError>
        </FieldContent>
      </Field>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border bg-input/40 px-5 py-6 text-center'>
          <div className='mx-auto mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-muted-foreground'>
            <Package2 />
          </div>
          <p className='text-sm font-medium text-foreground'>{emptyTitle}</p>
          <p className='mt-1 text-sm text-muted-foreground'>{emptyDescription}</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {items.map((item) => (
            <div
              key={item.peca_id}
              className='rounded-xl border border-border bg-input/60 px-4 py-3 transition-colors hover:border-border-hover'
            >
              <div className='flex flex-col gap-3 md:flex-row md:items-center'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>
                    {item.peca?.name_peca ?? 'Peça não encontrada'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatCurrency(item.peca?.preco ?? 0)} · Estoque:{' '}
                    {item.peca?.quantidade ?? 0}
                  </p>
                </div>

                <div className='flex items-center justify-between gap-3 md:justify-end'>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon-sm'
                      onClick={() => updateItemQuantity(item.peca_id, -1)}
                      aria-label={`Diminuir quantidade de ${item.peca?.name_peca ?? 'peça'}`}
                    >
                      <Minus />
                    </Button>
                    <span className='min-w-8 text-center text-sm font-semibold tabular-nums'>
                      {item.quantidade}
                    </span>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon-sm'
                      onClick={() => updateItemQuantity(item.peca_id, 1)}
                      aria-label={`Aumentar quantidade de ${item.peca?.name_peca ?? 'peça'}`}
                    >
                      <Plus />
                    </Button>
                  </div>

                  <div className='min-w-24 text-right text-sm font-semibold text-foreground'>
                    {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
                  </div>

                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    onClick={() =>
                      onChange(items.filter((entry) => entry.peca_id !== item.peca_id))
                    }
                    aria-label={`Remover ${item.peca?.name_peca ?? 'peça'}`}
                    className='text-destructive hover:text-destructive'
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div
            className={cn(
              'flex items-center justify-between rounded-xl border border-border bg-elevated/70 px-4 py-3',
              'transition-colors'
            )}
          >
            <span className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
              Total dos itens
            </span>
            <span className='text-lg font-semibold text-primary'>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}
    </FieldGroup>
  );
}
