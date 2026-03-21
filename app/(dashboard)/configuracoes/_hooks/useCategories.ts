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
  isDeleting: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  editingCategory: Categorias | null;
  setEditingCategory: Dispatch<SetStateAction<Categorias | null>>;
  deletingCategoryId: number | null;
  setDeletingCategoryId: (id: number | null) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  fetchCategories: () => Promise<void>;
  handleAddCategory: () => Promise<void>;
  handleUpdateCategory: () => Promise<void>;
  confirmDeleteCategory: () => Promise<boolean>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Categorias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorias | null>(
    null
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
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
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    const duplicada = categories.some(
      (cat) => cat.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (duplicada) {
      toast.error(`Já existe uma categoria com o nome '${newCategoryName.trim()}'`);
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
  }, [newCategoryName, fetchCategories, categories]);

  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory?.name.trim()) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    const duplicada = categories.some(
      (cat) =>
        cat.id !== editingCategory.id &&
        cat.name.trim().toLowerCase() === editingCategory.name.trim().toLowerCase()
    );
    if (duplicada) {
      toast.error(`Já existe outra categoria com o nome '${editingCategory.name.trim()}'`);
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
  }, [editingCategory, fetchCategories, categories]);

  const confirmDeleteCategory = useCallback(async (): Promise<boolean> => {
    if (!deletingCategoryId) {
      return false;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/categorias/${deletingCategoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao excluir categoria');
      }

      await fetchCategories();
      setDeletingCategoryId(null);
      toast.success('Categoria excluída com sucesso!');
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao excluir categoria'
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [deletingCategoryId, fetchCategories]);

  return {
    categories,
    isLoading,
    isSaving,
    isDeleting,
    isAddOpen,
    setIsAddOpen,
    editingCategory,
    setEditingCategory,
    deletingCategoryId,
    setDeletingCategoryId,
    newCategoryName,
    setNewCategoryName,
    fetchCategories,
    handleAddCategory,
    handleUpdateCategory,
    confirmDeleteCategory
  };
}
