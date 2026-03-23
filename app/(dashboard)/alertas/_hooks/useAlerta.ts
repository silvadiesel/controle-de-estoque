'use client';

import { useCallback, useEffect, useState } from 'react';

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

export function useAlerta(): UseAlertaReturn {
  const [pecas, setPecas] = useState<AlertaPeca[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
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
      toast.error('Erro ao carregar alertas de estoque');
      setPecas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const pecasCriticas = pecas.filter((p) => p.quantidade === 0);
  const pecasAtencao = pecas.filter((p) => p.quantidade > 0); // já garantido <= alerta pelo fetch

  return {
    pecasEmAlerta: pecas,
    pecasCriticas,
    pecasAtencao,
    totalAlertas: pecas.length,
    isLoading,
    refetch: fetchAlertas
  };
}
