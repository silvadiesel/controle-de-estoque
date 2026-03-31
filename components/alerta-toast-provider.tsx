'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useAlertaCount } from '@/hooks/useAlertaCount';

import { createAlertaToastOptions } from './alerta-toast-provider-options';
import { toast } from 'sonner';

type AlertaToastProviderProps = {
  toastClassName?: string;
};

export function AlertaToastProvider({
  toastClassName
}: AlertaToastProviderProps) {
  const { totalAlertas, isLoading } = useAlertaCount();
  const pathname = usePathname();
  const hasShown = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (pathname === '/alertas') return;
    if (hasShown.current) return;
    if (totalAlertas === 0) return;

    hasShown.current = true;

    toast.warning(
      totalAlertas === 1
        ? '1 produto com estoque abaixo do mínimo'
        : `${totalAlertas} produtos com estoque abaixo do mínimo`,
      createAlertaToastOptions(toastClassName)
    );
  }, [isLoading, totalAlertas, pathname, toastClassName]);

  return null;
}
