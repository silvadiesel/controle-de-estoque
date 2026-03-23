'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useAlertaCount } from '@/hooks/useAlertaCount';

import { toast } from 'sonner';

export function AlertaToastProvider() {
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
      {
        description: 'Acesse a página de Alertas para ver os detalhes.',
        duration: 6000,
        action: {
          label: 'Ver alertas',
          onClick: () => {
            window.location.href = '/alertas';
          }
        }
      }
    );
  }, [isLoading, totalAlertas, pathname]);

  return null;
}
