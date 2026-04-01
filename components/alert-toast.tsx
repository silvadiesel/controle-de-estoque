'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { Alert } from '@/components/ui/alert';
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
        <Alert className='min-w-md border-border bg-popover shadow-lg flex flex-col gap-1'>
          <div className='flex mb-2 items-center justify-between w-full gap-3'>
            {hasCriticalItems ? (
              <AlertTriangle size={17} color='#e7000b' />
            ) : (
              <BellRing size={17} color='#ffd700' />
            )}
            <span className='flex-1 text-sm font-medium text-popover-foreground'>
              {hasCriticalItems
                ? 'Estoque exigindo reposição'
                : 'Estoque em alerta'}
            </span>
            <Button
              size='sm'
              className=' h-6 rounded-sm'
              onClick={() => {
                router.push('/alertas');
                toast.dismiss(STOCK_ALERT_TOAST_ID);
              }}>
              Ver alertas
            </Button>
          </div>
          <div className='text-sm text-muted-foreground'>{description}</div>
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
