// hooks/useAlertaCount.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Peca } from '@/db/schema';

export interface UseAlertaCountReturn {
  totalAlertas: number;
  isLoading: boolean;
}

export function useAlertaCount(): UseAlertaCountReturn {
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) return;
      const data: Peca[] = await res.json();
      const count = data.filter((p) => p.quantidade <= p.alerta).length;
      setTotalAlertas(count);
    } catch {
      // silencioso — não queremos erros visíveis na sidebar
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { totalAlertas, isLoading };
}
