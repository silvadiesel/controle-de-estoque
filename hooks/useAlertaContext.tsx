'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useAlerta, type UseAlertaReturn } from '@/hooks/useAlerta';

const AlertaContext = createContext<UseAlertaReturn | null>(null);

export function AlertaProvider({ children }: { children: ReactNode }) {
  const value = useAlerta();

  return (
    <AlertaContext.Provider value={value}>{children}</AlertaContext.Provider>
  );
}

export function useAlertaCtx(): UseAlertaReturn {
  const ctx = useContext(AlertaContext);

  if (!ctx) {
    throw new Error('useAlertaCtx precisa estar dentro de <AlertaProvider>');
  }

  return ctx;
}

export function useAlertaCountCtx(): {
  totalAlertas: number;
  isLoading: boolean;
} {
  const { totalAlertas, isLoading } = useAlertaCtx();
  return { totalAlertas, isLoading };
}
