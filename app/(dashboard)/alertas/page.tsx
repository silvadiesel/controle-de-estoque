// app/(dashboard)/alertas/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAlerta } from './_hooks/useAlerta';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Package,
  TrendingUp
} from 'lucide-react';

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
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h2 className='text-2xl font-bold text-foreground'>Alertas</h2>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='bg-destructive/10 py-3 border-destructive/30'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-destructive'>Crítico</p>
                <p className='text-3xl font-bold text-destructive'>
                  {pecasCriticas.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Estoque zerado
                </p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-primary/10 py-3 border-primary/30'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-primary'>Atenção</p>
                <p className='text-3xl font-bold text-primary'>
                  {pecasAtencao.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Abaixo do mínimo
                </p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center'>
                <Bell className='h-6 w-6 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-muted/50 py-3 border-border'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total em alerta</p>
                <p className='text-3xl font-bold text-foreground'>
                  {pecasEmAlerta.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Peças monitoradas
                </p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-muted flex items-center justify-center'>
                <Package className='h-6 w-6 text-muted-foreground' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {pecasEmAlerta.length === 0 ? (
        <Card className='bg-card border-border'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4'>
              <CheckCircle className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              Tudo certo!
            </h3>
            <p className='text-muted-foreground text-center'>
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {/* Critical Alerts */}
          {pecasCriticas.length > 0 && (
            <Card className='bg-card border-border'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-destructive' />
                  Estoque Zerado — Crítico
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {pecasCriticas.map((peca) => (
                  <div
                    key={peca.id}
                    className='flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/30 p-4'>
                    <div className='flex items-center gap-4'>
                      <div className='h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-destructive' />
                      </div>
                      <div>
                        <p className='font-medium text-foreground'>
                          {peca.name_peca}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {peca.codigo}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-destructive'>
                          {peca.quantidade}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Mín: {peca.alerta}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={() => router.push('/movimentacoes')}>
                        <TrendingUp className='h-4 w-4 mr-1' />
                        Repor
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warning Alerts */}
          {pecasAtencao.length > 0 && (
            <Card className='bg-card border-border gap-3'>
              <CardHeader>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <Bell className='h-5 w-5 text-primary' />
                  Estoque Baixo — Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {pecasAtencao.map((peca) => {
                  const percentage = (peca.quantidade / peca.alerta) * 100;

                  return (
                    <div
                      key={peca.id}
                      className='flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                          <Package className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>
                            {peca.name_peca}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {peca.codigo}
                          </p>
                          <div className='mt-2 w-32 h-2 bg-secondary rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-primary rounded-full transition-all'
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-primary'>
                            {peca.quantidade}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Mín: {peca.alerta}
                          </p>
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-primary text-primary hover:bg-primary/10 bg-transparent w-28'
                          onClick={() => router.push('/movimentacoes')}>
                          <TrendingUp className='h-4 w-4' />
                          Repor
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
