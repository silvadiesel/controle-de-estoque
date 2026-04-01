'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Peca } from '@/db/schema';
import { toast } from 'sonner';

export interface UsePecasByFornecedorReturn {
  pecasByFornecedor: Map<number, Peca[]>;
  allPecas: Peca[];
  isInitialLoading: boolean;
  isSaving: boolean;
  isVincularOpen: boolean;
  setIsVincularOpen: (open: boolean) => void;
  activeFornecedorIdForVincular: number | null;
  setActiveFornecedorIdForVincular: (id: number | null) => void;
  fetchPecasByFornecedor: (fornecedorId: number) => Promise<void>;
  handleVincular: (fornecedorId: number, pecaId: number) => Promise<boolean>;
  handleDesvincular: (fornecedorId: number, pecaId: number) => Promise<boolean>;
  getTotalPecas: () => number;
  isLoadingFornecedor: (id: number) => boolean;
}

export function usePecasByFornecedor(): UsePecasByFornecedorReturn {
  const [pecasByFornecedor, setPecasByFornecedor] = useState<Map<number, Peca[]>>(new Map());
  const [allPecas, setAllPecas] = useState<Peca[]>([]);
  const [loadingFornecedores, setLoadingFornecedores] = useState<Set<number>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVincularOpen, setIsVincularOpen] = useState(false);
  const [activeFornecedorIdForVincular, setActiveFornecedorIdForVincular] = useState<number | null>(null);

  const fetchAllPecas = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await fetch('/api/produtos');
      const data: Peca[] = await res.json();
      setAllPecas(data);

      const grouped = new Map<number, Peca[]>();
      data.forEach((peca) => {
        if (!peca.fornecedor_id) return;
        const current = grouped.get(peca.fornecedor_id) ?? [];
        grouped.set(peca.fornecedor_id, [...current, peca]);
      });
      setPecasByFornecedor(grouped);
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAllPecas(); }, [fetchAllPecas]);

  const fetchPecasByFornecedor = useCallback(async (fornecedorId: number) => {
    setLoadingFornecedores((prev) => new Set(prev).add(fornecedorId));
    try {
      const res = await fetch(`/api/produtos?fornecedor_id=${fornecedorId}`);
      const data: Peca[] = await res.json();
      setPecasByFornecedor((prev) => {
        const updated = new Map(prev);
        updated.set(fornecedorId, data);
        return updated;
      });
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
      toast.error('Erro ao carregar peças');
    } finally {
      setLoadingFornecedores((prev) => {
        const updated = new Set(prev);
        updated.delete(fornecedorId);
        return updated;
      });
    }
  }, []);

  const handleVincular = async (fornecedorId: number, pecaId: number) => {
    setIsSaving(true);
    try {
      const getRes = await fetch(`/api/produtos/${pecaId}`);
      const pecaArr: Peca[] = await getRes.json();
      const peca = pecaArr[0];
      if (!peca) throw new Error('Peça não encontrada');

      const putRes = await fetch(`/api/produtos/${pecaId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...peca, fornecedor_id: fornecedorId })
      });
      if (!putRes.ok) throw new Error('Erro ao vincular peça');

      await Promise.all([fetchPecasByFornecedor(fornecedorId), fetchAllPecas()]);
      setIsVincularOpen(false);
      setActiveFornecedorIdForVincular(null);
      toast.success('Peça vinculada com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao vincular peça';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesvincular = async (fornecedorId: number, pecaId: number) => {
    setIsSaving(true);
    try {
      const getRes = await fetch(`/api/produtos/${pecaId}`);
      const pecaArr: Peca[] = await getRes.json();
      const peca = pecaArr[0];
      if (!peca) throw new Error('Peça não encontrada');

      const putRes = await fetch(`/api/produtos/${pecaId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...peca, fornecedor_id: null })
      });
      if (!putRes.ok) throw new Error('Erro ao desvincular peça');

      await Promise.all([fetchPecasByFornecedor(fornecedorId), fetchAllPecas()]);
      toast.success('Peça desvinculada com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desvincular peça';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalPecas = () => {
    let total = 0;
    pecasByFornecedor.forEach((pecas) => { total += pecas.length; });
    return total;
  };

  const isLoadingFornecedor = (id: number) => loadingFornecedores.has(id);

  return {
    pecasByFornecedor, allPecas, isInitialLoading, isSaving,
    isVincularOpen, setIsVincularOpen,
    activeFornecedorIdForVincular, setActiveFornecedorIdForVincular,
    fetchPecasByFornecedor,
    handleVincular, handleDesvincular,
    getTotalPecas, isLoadingFornecedor
  };
}
