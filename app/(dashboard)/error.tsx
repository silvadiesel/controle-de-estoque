'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Card className='max-w-md w-full bg-card border-border'>
        <CardContent className='flex flex-col items-center gap-4 py-12'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
            <AlertTriangle className='h-7 w-7 text-destructive' />
          </div>
          <div className='text-center space-y-2'>
            <h2 className='text-lg font-semibold text-foreground'>
              Algo deu errado
            </h2>
            <p className='text-sm text-muted-foreground'>
              Ocorreu um erro ao carregar esta página. Tente novamente ou entre
              em contato com o suporte.
            </p>
            {error.digest && (
              <p className='text-xs text-muted-foreground/60'>
                Código: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
