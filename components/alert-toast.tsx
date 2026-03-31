'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAlerta } from '@/hooks/useAlerta';

import { AlertTriangle, BellRing } from 'lucide-react';
import { toast } from 'sonner';

const STOCK_ALERT_TOAST_ID = 'stock-alert-toast';

function buildDescription(criticos: number, atencao: number) {
  if (criticos > 0 && atencao > 0) {
    return `${criticos} produto${criticos > 1 ? 's' : ''} sem estoque e ${atencao} com estoque baixo.`;
  }

  if (criticos > 0) {
    return `${criticos} produto${criticos > 1 ? 's' : ''} sem estoque no momento.`;
  }

  return `${atencao} produto${atencao > 1 ? 's' : ''} com estoque próximo do mínimo.`;
}

export function AlertToast() {
  const pathname = usePathname();
  const router = useRouter();
  const { pecasCriticas, pecasAtencao, totalAlertas, isLoading } = useAlerta();

  useEffect(() => {
    if (isLoading || pathname === '/alertas' || totalAlertas === 0) {
      toast.dismiss(STOCK_ALERT_TOAST_ID);
      return;
    }

    const hasCriticalItems = pecasCriticas.length > 0;
    const description = buildDescription(
      pecasCriticas.length,
      pecasAtencao.length
    );

    toast.custom(
      () => (
        <Alert className='max-w-360 border-border bg-popover shadow-lg'>
          {hasCriticalItems ? (
            <AlertTriangle color='#e7000b' />
          ) : (
            <BellRing color='#ffd700' />
          )}
          <AlertTitle className='text-popover-foreground'>
            {hasCriticalItems
              ? 'Estoque exigindo reposição'
              : 'Estoque em alerta'}
          </AlertTitle>
          <AlertDescription className='gap-3 text-muted-foreground'>
            <p>{description}</p>
            <Button
              size='sm'
              onClick={() => {
                router.push('/alertas');
                toast.dismiss(STOCK_ALERT_TOAST_ID);
              }}>
              Ver alertas
            </Button>
          </AlertDescription>
        </Alert>
      ),
      {
        id: STOCK_ALERT_TOAST_ID
      }
    );

    return () => {
      toast.dismiss(STOCK_ALERT_TOAST_ID);
    };
  }, [
    isLoading,
    pathname,
    pecasAtencao.length,
    pecasCriticas.length,
    router,
    totalAlertas
  ]);

  return null;
}
