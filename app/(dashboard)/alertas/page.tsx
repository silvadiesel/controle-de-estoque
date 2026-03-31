// app/(dashboard)/alertas/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useAlerta } from './_hooks/useAlerta';
import { AlertTriangle, Bell, CheckCircle, Package, ShieldAlert } from 'lucide-react';

export default function Alertas() {
  const router = useRouter();
  const { pecasCriticas, pecasAtencao, pecasEmAlerta, isLoading } = useAlerta();

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <p className='text-muted-foreground'>Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-foreground'>Alertas</h1>
        <p className='text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* Summary Cards - 3 cols with icon+number+label */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='bg-card border-border'>
          <CardContent className='px-5 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0'>
                <AlertTriangle className='h-5 w-5 text-destructive' />
              </div>
              <div>
                <p className='text-2xl font-bold text-destructive'>
                  {pecasCriticas.length}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Sem estoque
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-5 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 shrink-0'>
                <Bell className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-primary'>
                  {pecasAtencao.length}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Estoque baixo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-5 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-border shrink-0'>
                <ShieldAlert className='h-5 w-5 text-muted-foreground' />
              </div>
              <div>
                <p className='text-2xl font-bold text-muted-foreground'>
                  {pecasEmAlerta.length}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Total monitorado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas - ALL in ONE card */}
      {pecasEmAlerta.length === 0 ? (
        <Card className='bg-card border-border'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-success/20 bg-success/8'>
              <CheckCircle className='h-8 w-8 text-success' />
            </div>
            <h3 className='mb-2 text-lg font-bold text-foreground'>
              Tudo em dia!
            </h3>
            <p className='text-center text-sm text-muted-foreground'>
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className='bg-card border-border overflow-hidden'>
          <CardContent className='p-0'>
            {/* SEM ESTOQUE section */}
            {pecasCriticas.length > 0 && (
              <>
                <div className='bg-input px-5 py-3 flex items-center gap-2'>
                  <span className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                    Sem Estoque
                  </span>
                  <span className='text-[11px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded'>
                    {pecasCriticas.length}
                  </span>
                </div>

                {pecasCriticas.map((peca, index) => (
                  <div
                    key={peca.id}
                    className={`px-5 py-4 flex items-center gap-4 ${index < pecasCriticas.length - 1 || pecasAtencao.length > 0 ? 'border-b border-border' : ''}`}>
                    {/* Dot - critical = primary */}
                    <span className='block h-2 w-2 rounded-full bg-primary shrink-0' />

                    {/* Icon */}
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-border'>
                      <Package className='h-4 w-4 text-muted-foreground' />
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm text-foreground'>
                        {peca.name_peca}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {peca.codigo}
                      </p>
                      {/* Progress bar */}
                      <div className='mt-2 max-w-[200px]'>
                        <div className='h-1 w-full overflow-hidden rounded-full bg-border'>
                          <div
                            className='h-full rounded-full bg-primary'
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Count */}
                    <div className='shrink-0 text-right'>
                      <p className='text-sm'>
                        <span className='font-bold text-foreground'>{peca.quantidade}</span>
                        <span className='text-muted-foreground'> / {peca.alerta}</span>
                      </p>
                    </div>

                    {/* Repor button */}
                    <Button
                      size='sm'
                      className='shrink-0 bg-primary/12 border border-primary/25 text-primary hover:bg-primary/20'
                      onClick={() => router.push('/produtos')}>
                      Repor
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* ESTOQUE BAIXO section */}
            {pecasAtencao.length > 0 && (
              <>
                <div className='bg-input px-5 py-3 flex items-center gap-2'>
                  <span className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                    Estoque Baixo
                  </span>
                  <span className='text-[11px] font-medium text-primary bg-primary/12 px-1.5 py-0.5 rounded'>
                    {pecasAtencao.length}
                  </span>
                </div>

                {pecasAtencao.map((peca, index) => {
                  const percentage = Math.min(
                    (peca.quantidade / peca.alerta) * 100,
                    100
                  );

                  return (
                    <div
                      key={peca.id}
                      className={`px-5 py-4 flex items-center gap-4 ${index < pecasAtencao.length - 1 ? 'border-b border-border' : ''}`}>
                      {/* Dot - attention = #3f3f46 */}
                      <span className='block h-2 w-2 rounded-full bg-border-hover shrink-0' />

                      {/* Icon */}
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-border'>
                        <Package className='h-4 w-4 text-muted-foreground' />
                      </div>

                      {/* Info */}
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-sm text-foreground'>
                          {peca.name_peca}
                        </p>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {peca.codigo}
                        </p>
                        {/* Progress bar */}
                        <div className='mt-2 max-w-[200px]'>
                          <div className='h-1 w-full overflow-hidden rounded-full bg-border'>
                            <div
                              className='h-full rounded-full bg-primary transition-all'
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Count */}
                      <div className='shrink-0 text-right'>
                        <p className='text-sm'>
                          <span className='font-bold text-foreground'>{peca.quantidade}</span>
                          <span className='text-muted-foreground'> / {peca.alerta}</span>
                        </p>
                      </div>

                      {/* Repor button */}
                      <Button
                        size='sm'
                        className='shrink-0 bg-primary/12 border border-primary/25 text-primary hover:bg-primary/20'
                        onClick={() => router.push('/produtos')}>
                        Repor
                      </Button>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
