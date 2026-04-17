'use client';

import { useCallback, useEffect, useState } from 'react';

import { maoObraSchema, type MaoObraFormValues } from '@/app/utils/validators';
import type { MaoObra } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

export type { MaoObraFormValues };

export interface MaoObraStats {
  faturamento_mes: number;
}

export interface UseMaoObraReturn {
  itens: MaoObra[];
  stats: MaoObraStats;
  isLoading: boolean;
  isSaving: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingItem: MaoObra | null;
  setEditingItem: (item: MaoObra | null) => void;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  handleAddItem: (data: MaoObraFormValues) => Promise<boolean>;
  handleUpdateItem: (id: number, data: MaoObraFormValues) => Promise<boolean>;
  handleDeleteItem: (id: number) => Promise<boolean>;
}

export function useMaoObra(): UseMaoObraReturn {
  const [itens, setItens] = useState<MaoObra[]>([]);
  const [stats, setStats] = useState<MaoObraStats>({ faturamento_mes: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaoObra | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchItens = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itensRes, statsRes] = await Promise.all([
        fetch('/api/mao-obra'),
        fetch('/api/mao-obra/stats')
      ]);
      const itensData: MaoObra[] = await itensRes.json();
      const statsData: MaoObraStats = await statsRes.json();
      setItens(itensData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar mãos de obra:', error);
      toast.error('Erro ao carregar mãos de obra');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItens();
  }, [fetchItens]);

  const createItem = async (data: MaoObraFormValues) => {
    const response = await fetch('/api/mao-obra', {
      method: 'POST',
      body: JSON.stringify({
        nome: data.nome,
        valor: data.valor,
        descricao: data.descricao ?? ''
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao adicionar mão de obra');
    }

    await fetchItens();
  };

  const updateItem = async (id: number, data: MaoObraFormValues) => {
    const response = await fetch(`/api/mao-obra/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: data.nome,
        valor: data.valor,
        descricao: data.descricao ?? ''
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao atualizar mão de obra');
    }

    await fetchItens();
  };

  const deleteItem = async (id: number) => {
    const response = await fetch(`/api/mao-obra/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao excluir mão de obra');
    }

    await fetchItens();
  };

  const handleAddItem = async (data: MaoObraFormValues) => {
    setIsSaving(true);
    try {
      maoObraSchema.parse(data);
      await createItem(data);
      setIsAddOpen(false);
      toast.success('Mão de obra adicionada com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar mão de obra');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = async (id: number, data: MaoObraFormValues) => {
    setIsSaving(true);
    try {
      maoObraSchema.parse(data);
      await updateItem(id, data);
      setEditingItem(null);
      toast.success('Mão de obra atualizada com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar mão de obra');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    setIsSaving(true);
    try {
      await deleteItem(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Mão de obra excluída com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir mão de obra';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    itens,
    stats,
    isLoading,
    isSaving,
    isAddOpen,
    setIsAddOpen,
    editingItem,
    setEditingItem,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem
  };
}
