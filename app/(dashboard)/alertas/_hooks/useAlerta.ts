import { useCallback, useEffect, useState } from 'react';

import type { Peca } from '@/db/schema';

import { toast } from 'sonner';

export interface AlertaPeca {
  id: number;
  name_peca: string;
  codigo: string;
  quantidade: number;
  alerta: number;
  localizacao: string[] | null;
  categoria_id: number | null;
  fornecedor_id: number | null;
}

export interface UseAlertaReturn {
  pecasEmAlerta: AlertaPeca[];
  pecasCriticas: AlertaPeca[]; // quantidade === 0
  pecasAtencao: AlertaPeca[]; // 0 < quantidade <= alerta
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

      const emAlerta = data.filter(
        (p) => p.quantidade <= p.alerta
      ) as AlertaPeca[];

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
