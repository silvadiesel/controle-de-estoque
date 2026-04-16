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
import { cn } from '@/lib/utils';

import { Plus, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export interface MaoDeObraItem {
  descricao: string;
  valor: number; // centavos
}

interface MaoDeObraBuilderProps {
  items: MaoDeObraItem[];
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

export function MaoDeObraBuilder({ items, onChange }: MaoDeObraBuilderProps) {
  const [descricao, setDescricao] = useState('');
  const [valorCentavos, setValorCentavos] = useState(0);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.valor, 0),
    [items]
  );

  const handleValorChange = (raw: string) => {
    setValorCentavos(parseCurrencyInput(raw));
  };

  const handleAdd = () => {
    const desc = descricao.trim();

    if (!desc) {
      toast.error('Informe a descrição da mão de obra.');
      return;
    }

    if (valorCentavos <= 0) {
      toast.error('Informe um valor maior que zero.');
      return;
    }

    onChange([...items, { descricao: desc, valor: valorCentavos }]);
    setDescricao('');
    setValorCentavos(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Mão de obra</FieldLabel>
        <FieldContent>
          <div className='flex gap-2'>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Descrição do serviço...'
              className='flex-1 bg-input'
            />
            <Input
              value={formatCurrencyInput(valorCentavos)}
              onChange={(e) => handleValorChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='R$ 0,00'
              className='w-32 bg-input text-right'
              inputMode='numeric'
            />
            <Button
              type='button'
              variant='default'
              size='icon'
              onClick={handleAdd}
              aria-label='Adicionar mão de obra'>
              <Plus />
            </Button>
          </div>
          <FieldDescription>
            Adicione os serviços de mão de obra com descrição e valor.
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
            Adicione os serviços realizados para registrar o custo de mão de
            obra.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {items.map((item, index) => (
            <div
              key={index}
              className='rounded-xl border border-border bg-input/60 px-4 py-3 transition-colors hover:border-border-hover'>
              <div className='flex items-center justify-between'>
                <p className='truncate text-sm font-medium text-foreground'>
                  {item.descricao}
                </p>

                <div className='flex items-center gap-3'>
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
          ))}

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
