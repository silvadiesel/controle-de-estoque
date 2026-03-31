'use client';

import { Button } from '@/components/ui/button';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AuthError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div className='flex flex-col items-center gap-4 max-w-md text-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
          <AlertTriangle className='h-7 w-7 text-destructive' />
        </div>
        <h2 className='text-lg font-semibold text-foreground'>
          Algo deu errado
        </h2>
        <p className='text-sm text-muted-foreground'>
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        {error.digest && (
          <p className='text-xs text-muted-foreground/60'>
            Código: {error.digest}
          </p>
        )}
        <Button onClick={reset} className='gap-2'>
          <RefreshCw className='h-4 w-4' />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
