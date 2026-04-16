'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { type AlertaPeca } from '../_hooks/useAlerta';

interface AlertaGridProps {
  pecas: AlertaPeca[];
  tipo: 'critica' | 'atencao';
}

export function AlertaGrid({ pecas, tipo }: AlertaGridProps) {
  const router = useRouter();
  const isCritica = tipo === 'critica';

  return (
    <div className='grid grid-cols-2 gap-2 p-3'>
      {pecas.map((peca) => {
        const percentage = isCritica
          ? 0
          : Math.min((peca.quantidade / peca.alerta) * 100, 100);

        return (
          <div
            key={peca.id}
            className='bg-elevated border border-border rounded-lg p-3'>
            {/* Nome + dot */}
            <div className='flex items-center gap-2 mb-1'>
              <span
                className={`block h-2 w-2 rounded-full shrink-0 ${
                  isCritica ? 'bg-destructive' : 'bg-primary'
                }`}
              />
              <p className='text-xs font-semibold text-foreground truncate'>
                {peca.name_peca}
              </p>
            </div>

            {/* Código */}
            <p className='text-[10px] text-muted-foreground mb-2 pl-4'>
              {peca.codigo}
            </p>

            {/* Barra de progresso */}
            <div className='h-1 w-full bg-border rounded-full overflow-hidden mb-2'>
              <div
                className={`h-full rounded-full transition-all ${
                  isCritica ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Rodapé: quantidade + botão */}
            <div className='flex items-center justify-between'>
              <p className='text-[11px]'>
                <span
                  className={`font-bold ${
                    isCritica ? 'text-destructive' : 'text-primary'
                  }`}>
                  {peca.quantidade}
                </span>
                <span className='text-muted-foreground'> / {peca.alerta}</span>
              </p>
              <Button
                size='sm'
                className='h-6 px-2.5 text-[10px] font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
                onClick={() => router.push('/pecas')}>
                Repor
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
