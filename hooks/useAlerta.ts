'use client';

import { useCallback, useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { useSession } from '@/lib/auth-client';

import { toast } from 'sonner';

export interface AlertaPeca {
  id: number;
  name_peca: string;
  codigo: string;
  quantidade: number;
  alerta: number;
}

export interface UseAlertaReturn {
  pecasEmAlerta: AlertaPeca[];
  pecasCriticas: AlertaPeca[];
  pecasAtencao: AlertaPeca[];
  totalAlertas: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

interface UseAlertaOptions {
  showErrorToast?: boolean;
}

export function useAlerta({
  showErrorToast = true
}: UseAlertaOptions = {}): UseAlertaReturn {
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = useSession();
  const hasSession = !!session && !isSessionPending;
  const [pecas, setPecas] = useState<AlertaPeca[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produtos/alertas');
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }

      const data: AlertaPeca[] = await res.json();
      setPecas(data);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      if (showErrorToast) {
        toast.error('Erro ao carregar alertas de estoque');
      }
      setPecas([]);
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    // Aguarda o Better Auth resolver a sessão: sem este gate, o primeiro
    // fetch pós-login sai antes do cookie estar disponível e cai em 401.
    if (!hasSession) {
      setIsLoading(false);
      return;
    }
    void fetchAlertas();
  }, [fetchAlertas, pathname, hasSession]);

  useEffect(() => {
    if (!hasSession) return;

    const handleFocus = () => {
      void fetchAlertas();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchAlertas();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAlertas, hasSession]);

  const pecasCriticas = pecas.filter((p) => p.quantidade === 0);
  const pecasAtencao = pecas.filter((p) => p.quantidade > 0);

  return {
    pecasEmAlerta: pecas,
    pecasCriticas,
    pecasAtencao,
    totalAlertas: pecas.length,
    isLoading,
    refetch: fetchAlertas
  };
}
