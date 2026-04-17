'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { MaoObra } from '@/db/schema';
import { cn } from '@/lib/utils';

import { Plus, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export interface MaoDeObraItem {
  mao_obra_id: number | null;
  descricao: string;
  valor: number;
}

interface MaoDeObraBuilderProps {
  items: MaoDeObraItem[];
  maoObras: MaoObra[];
  onChange: (items: MaoDeObraItem[]) => void;
}

const formatCurrency = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const parseCurrencyInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  return Number(digits);
};

const formatCurrencyInput = (centavos: number): string => {
  if (centavos === 0) return '';
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function MaoDeObraBuilder({
  items,
  maoObras,
  onChange
}: MaoDeObraBuilderProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [valorCentavos, setValorCentavos] = useState(0);

  const maoObraMap = useMemo(
    () => new Map(maoObras.map((item) => [item.id, item])),
    [maoObras]
  );

  const options = useMemo(
    () =>
      maoObras.map((item) => ({
        value: String(item.id),
        label: item.nome,
        sublabel: formatCurrency(item.valor)
      })),
    [maoObras]
  );

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.valor, 0),
    [items]
  );

  const handleSelectChange = (value: string) => {
    setSelectedId(value);
    const selected = maoObraMap.get(Number(value));
    if (selected) {
      setValorCentavos(selected.valor);
    }
  };

  const handleValorChange = (raw: string) => {
    setValorCentavos(parseCurrencyInput(raw));
  };

  const handleAdd = () => {
    if (!selectedId) {
      toast.error('Selecione uma mão de obra do catálogo.');
      return;
    }

    if (valorCentavos <= 0) {
      toast.error('Informe um valor maior que zero.');
      return;
    }

    const selected = maoObraMap.get(Number(selectedId));
    if (!selected) {
      toast.error('Mão de obra não encontrada.');
      return;
    }

    onChange([
      ...items,
      {
        mao_obra_id: selected.id,
        descricao: selected.nome,
        valor: valorCentavos
      }
    ]);
    setSelectedId('');
    setValorCentavos(0);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const emptyCatalog = maoObras.length === 0;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Mão de obra</FieldLabel>
        <FieldContent>
          <div className='grid grid-cols-[1fr_140px_40px] gap-2'>
            <SearchableSelect
              options={options}
              value={selectedId}
              onValueChange={handleSelectChange}
              placeholder={
                emptyCatalog
                  ? 'Cadastre uma mão de obra primeiro'
                  : 'Selecione do catálogo...'
              }
              searchPlaceholder='Buscar mão de obra...'
              emptyText='Nenhuma mão de obra encontrada'
              disabled={emptyCatalog}
            />
            <Input
              value={formatCurrencyInput(valorCentavos)}
              onChange={(e) => handleValorChange(e.target.value)}
              placeholder='R$ 0,00'
              className='bg-input text-right'
              inputMode='numeric'
              disabled={!selectedId}
            />
            <Button
              type='button'
              variant='default'
              size='icon'
              onClick={handleAdd}
              aria-label='Adicionar mão de obra'
              disabled={!selectedId || valorCentavos <= 0}>
              <Plus />
            </Button>
          </div>
          <FieldDescription>
            {emptyCatalog
              ? 'Cadastre uma mão de obra na página "Mão de Obra" antes de usar aqui.'
              : 'Selecione do catálogo · o valor vem preenchido mas pode ser ajustado.'}
          </FieldDescription>
        </FieldContent>
      </Field>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border bg-input/40 px-5 py-6 text-center'>
          <div className='mx-auto mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-muted-foreground'>
            <Wrench />
          </div>
          <p className='text-sm font-medium text-foreground'>
            Nenhuma mão de obra adicionada
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Selecione uma mão de obra do catálogo para registrar o custo da
            ordem.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {items.map((item, index) => {
            const catalog = item.mao_obra_id
              ? maoObraMap.get(item.mao_obra_id)
              : null;
            const isAdjusted = catalog ? catalog.valor !== item.valor : false;

            return (
              <div
                key={index}
                className='rounded-xl border border-border bg-input/60 px-4 py-3 transition-colors hover:border-border-hover'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-foreground'>
                      {item.descricao}
                    </p>
                    {catalog ? (
                      <p className='text-xs text-muted-foreground'>
                        Catálogo · valor padrão {formatCurrency(catalog.valor)}
                        {isAdjusted ? ' · ajustado nesta ordem' : ''}
                      </p>
                    ) : (
                      <p className='text-xs text-muted-foreground'>
                        Item legado (sem vínculo com catálogo)
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-3'>
                    {isAdjusted ? (
                      <span className='rounded-full bg-warning/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-warning'>
                        Ajustado
                      </span>
                    ) : null}

                    <span className='min-w-24 text-right text-sm font-semibold text-foreground'>
                      {formatCurrency(item.valor)}
                    </span>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      onClick={() => handleRemove(index)}
                      aria-label={`Remover ${item.descricao}`}
                      className='text-destructive hover:text-destructive'>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            className={cn(
              'flex items-center justify-between rounded-xl border border-border bg-elevated/70 px-4 py-3',
              'transition-colors'
            )}>
            <span className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
              Total mão de obra
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
