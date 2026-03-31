// app/(dashboard)/alertas/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useAlerta } from './_hooks/useAlerta';
import { AlertTriangle, Bell, CheckCircle, Package } from 'lucide-react';

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
    <div className='flex flex-1 flex-col gap-4 p-4  '>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h1 className='text-2xl font-bold text-foreground'>Alertas</h1>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* Summary Cards */}
      <div className='flex gap-3 w-full'>
        <Card className='border-t-2 border-t-destructive py-3 w-full md:w-1/3'>
          <CardContent className='w-full py-0'>
            <div className='flex items-start gap-3'>
              <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive' />
              <div>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Crítico
                </p>
                <p className='mt-1 text-3xl font-bold text-destructive'>
                  {pecasCriticas.length}
                </p>
                <p className='mt-1 text-xs text-muted-foreground/60'>
                  estoque zerado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-t-2 border-t-primary py-3 w-full md:w-1/3'>
          <CardContent className='w-full py-0'>
            <div className='flex items-start gap-3'>
              <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-primary' />
              <div>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Atenção
                </p>
                <p className='mt-1 text-3xl font-bold text-primary'>
                  {pecasAtencao.length}
                </p>
                <p className='mt-1 text-xs text-muted-foreground/60'>
                  abaixo do mínimo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-t-2 border-t-muted-foreground/30 py-3 w-full md:w-1/3'>
          <CardContent className='w-full py-0'>
            <div className='flex items-start gap-3'>
              <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40' />
              <div>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Total
                </p>
                <p className='mt-1 text-3xl font-bold text-muted-foreground'>
                  {pecasEmAlerta.length}
                </p>
                <p className='mt-1 text-xs text-muted-foreground/60'>
                  peças monitoradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {pecasEmAlerta.length === 0 ? (
        <Card>
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
        <div className='flex gap-4 flex-wrap justify-center w-full'>
          {/* Seção Crítico */}
          {pecasCriticas.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 px-0.5'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/8'>
                  <AlertTriangle className='h-3.5 w-3.5 text-destructive' />
                </div>
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Estoque Zerado — Crítico
                </span>
                <Badge
                  variant='outline'
                  className='border-border text-muted-foreground'>
                  {pecasCriticas.length}
                </Badge>
              </div>

              {pecasCriticas.map((peca) => (
                <Card key={peca.id} className='border-l-2 border-l-destructive'>
                  <CardContent className='flex items-center gap-4 px-5 py-4'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted'>
                      <Package className='h-5 w-5 text-muted-foreground' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-foreground'>
                        {peca.name_peca}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {peca.codigo}
                      </p>
                      <div className='mt-2'>
                        <div className='h-1.5 w-40 overflow-hidden rounded-full bg-secondary'>
                          <div
                            className='h-full rounded-full bg-destructive'
                            style={{ width: '0%' }}
                          />
                        </div>
                        <p className='mt-1 text-xs text-muted-foreground/60'>
                          0 / {peca.alerta} unidades mínimas
                        </p>
                      </div>
                    </div>

                    <div className='shrink-0 text-right'>
                      <p className='text-xl font-bold text-destructive'>
                        {peca.quantidade}
                      </p>
                      <p className='text-xs text-muted-foreground'>unid.</p>
                      <p className='text-xs text-muted-foreground/60 mt-0.5'>
                        mín: {peca.alerta}
                      </p>
                    </div>

                    <Button
                      size='sm'
                      variant='outline'
                      className='shrink-0'
                      onClick={() => router.push('/produtos')}>
                      Repor
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Seção Atenção */}
          {pecasAtencao.length > 0 && (
            <div className='flex flex-col gap-4 w-full'>
              <div className='flex items-center gap-2 px-0.5'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/8'>
                  <Bell className='h-3.5 w-3.5 text-primary' />
                </div>
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Estoque Baixo — Atenção
                </span>
                <Badge
                  variant='outline'
                  className='border-border text-muted-foreground'>
                  {pecasAtencao.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {pecasAtencao.map((peca) => {
                  const percentage = Math.min(
                    (peca.quantidade / peca.alerta) * 100,
                    100
                  );

                  return (
                    <Card key={peca.id} className='py-2 w-full'>
                      <CardContent className='flex items-center gap-4 px-5 py-0'>
                        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted'>
                          <Package className='h-5 w-5 text-muted-foreground' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-foreground'>
                            {peca.name_peca}
                          </p>
                          <p className='text-xs text-muted-foreground mt-0.5'>
                            {peca.codigo}
                          </p>
                          <div className='mt-2'>
                            <div className='h-1.5 w-40 overflow-hidden rounded-full bg-secondary'>
                              <div
                                className='h-full rounded-full bg-primary transition-all'
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className='mt-1 text-xs text-muted-foreground/60'>
                              {peca.quantidade} / {peca.alerta} unidades mínimas
                            </p>
                          </div>
                        </div>

                        <div className='shrink-0 text-right'>
                          <p className='text-xl font-bold text-primary'>
                            {peca.quantidade}
                          </p>
                          <p className='text-xs text-muted-foreground'>unid.</p>
                          <p className='text-xs text-muted-foreground/60 mt-0.5'>
                            mín: {peca.alerta}
                          </p>
                        </div>

                        <Button
                          size='sm'
                          variant='outline'
                          className='shrink-0'
                          onClick={() => router.push('/produtos')}>
                          Repor
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
