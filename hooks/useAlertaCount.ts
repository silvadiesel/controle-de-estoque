'use client';

import { useAlerta } from '@/hooks/useAlerta';

export interface UseAlertaCountReturn {
  totalAlertas: number;
  isLoading: boolean;
}

export function useAlertaCount(): UseAlertaCountReturn {
  const { totalAlertas, isLoading } = useAlerta({ showErrorToast: false });
  return { totalAlertas, isLoading };
}
