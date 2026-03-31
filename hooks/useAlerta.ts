'use client';

import { useCallback, useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import type { Peca } from '@/db/schema';

import { toast } from 'sonner';

export type AlertaPeca = Pick<
  Peca,
  | 'id'
  | 'name_peca'
  | 'codigo'
  | 'quantidade'
  | 'alerta'
  | 'localizacao'
  | 'categoria_id'
  | 'fornecedor_id'
>;

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
  const [pecas, setPecas] = useState<AlertaPeca[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }

      const data: Peca[] = await res.json();
      const emAlerta: AlertaPeca[] = data
        .filter((p) => p.quantidade <= p.alerta)
        .map(
          ({
            id,
            name_peca,
            codigo,
            quantidade,
            alerta,
            localizacao,
            categoria_id,
            fornecedor_id
          }) => ({
            id,
            name_peca,
            codigo,
            quantidade,
            alerta,
            localizacao,
            categoria_id,
            fornecedor_id
          })
        );

      setPecas(emAlerta);
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
    fetchAlertas();
  }, [fetchAlertas, pathname]);

  useEffect(() => {
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
  }, [fetchAlertas]);

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
