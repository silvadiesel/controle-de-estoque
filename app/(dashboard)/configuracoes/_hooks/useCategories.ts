'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState
} from 'react';

import type { Categorias } from '@/db/schema';

import { toast } from 'sonner';

export interface UseCategoriesReturn {
  categories: Categorias[];
  isLoading: boolean;
  isSaving: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  editingCategory: Categorias | null;
  setEditingCategory: Dispatch<SetStateAction<Categorias | null>>;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  fetchCategories: () => Promise<void>;
  handleAddCategory: () => Promise<void>;
  handleUpdateCategory: () => Promise<void>;
  handleDeleteCategory: (id: number) => Promise<boolean>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Categorias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorias | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categorias');

      if (!response.ok) {
        throw new Error('Falha ao carregar categorias');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao carregar categorias'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      toast.warning('O nome da categoria é obrigatório');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar categoria');
      }

      await fetchCategories();
      setNewCategoryName('');
      setIsAddOpen(false);
      toast.success('Categoria criada com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao criar categoria'
      );
    } finally {
      setIsSaving(false);
    }
  }, [newCategoryName, fetchCategories]);

  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory?.name.trim()) {
      toast.warning('O nome da categoria é obrigatório');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/categorias/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategory.name.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar categoria');
      }

      await fetchCategories();
      setEditingCategory(null);
      toast.success('Categoria atualizada com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      );
    } finally {
      setIsSaving(false);
    }
  }, [editingCategory, fetchCategories]);

  const handleDeleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return false;
      }

      try {
        const response = await fetch(`/api/categorias/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Falha ao excluir categoria');
        }

        await fetchCategories();
        toast.success('Categoria excluída com sucesso!');
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Erro ao excluir categoria'
        );
        return false;
      }
    },
    [fetchCategories]
  );

  return {
    categories,
    isLoading,
    isSaving,
    isAddOpen,
    setIsAddOpen,
    editingCategory,
    setEditingCategory,
    newCategoryName,
    setNewCategoryName,
    fetchCategories,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  };
}
