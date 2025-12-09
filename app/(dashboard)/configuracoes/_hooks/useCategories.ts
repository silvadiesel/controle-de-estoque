/**
 * Hook personalizado para gerenciamento de Categorias
 * ====================================================
 *
 * O que é um Custom Hook?
 * -----------------------
 * Custom Hooks são funções JavaScript que começam com "use" e podem usar
 * outros hooks do React. Eles permitem extrair lógica reutilizável de componentes.
 *
 * Benefícios:
 * -----------
 * 1. Separação de responsabilidades - lógica separada da UI
 * 2. Reutilização - mesma lógica em diferentes componentes
 * 3. Testabilidade - mais fácil testar lógica isoladamente
 * 4. Manutenção - código mais organizado e fácil de atualizar
 */
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState
} from 'react';

import type { Categorias } from '@/db/schema';

/**
 * Interface que define o retorno do hook
 */
export interface UseCategoriesReturn {
  // Dados
  categories: Categorias[];

  // Estados de loading
  isLoading: boolean;
  isSaving: boolean;

  // Tratamento de erros
  error: string | null;
  setError: (error: string | null) => void;

  // Estados dos dialogs
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  editingCategory: Categorias | null;
  setEditingCategory: Dispatch<SetStateAction<Categorias | null>>;

  // Formulário de nova categoria
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;

  // Operações CRUD
  fetchCategories: () => Promise<void>;
  handleAddCategory: () => Promise<void>;
  handleUpdateCategory: () => Promise<void>;
  handleDeleteCategory: (id: number) => Promise<boolean>;
}

/**
 * Hook para gerenciar o CRUD de categorias
 *
 * @example
 * ```tsx
 * const {
 *   categories,
 *   isLoading,
 *   handleAddCategory,
 *   // ... outros retornos
 * } = useCategories();
 * ```
 */
export function useCategories(): UseCategoriesReturn {
  // ============================================
  // ESTADOS
  // ============================================

  const [categories, setCategories] = useState<Categorias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorias | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState('');

  // ============================================
  // FUNÇÕES DE API
  // ============================================

  /**
   * Busca todas as categorias da API
   */
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/categorias');

      if (!response.ok) {
        throw new Error('Falha ao carregar categorias');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categorias'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cria uma nova categoria
   */
  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      setError('O nome da categoria é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar categoria');
      }

      // Recarrega a lista
      await fetchCategories();

      // Limpa o formulário e fecha o dialog
      setNewCategoryName('');
      setIsAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
    } finally {
      setIsSaving(false);
    }
  }, [newCategoryName, fetchCategories]);

  /**
   * Atualiza uma categoria existente
   */
  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory?.name.trim()) {
      setError('O nome da categoria é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      );
    } finally {
      setIsSaving(false);
    }
  }, [editingCategory, fetchCategories]);

  /**
   * Remove uma categoria
   * @returns true se a categoria foi deletada
   */
  const handleDeleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return false;
      }

      try {
        setError(null);

        const response = await fetch(`/api/categorias/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Falha ao excluir categoria');
        }

        await fetchCategories();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao excluir categoria'
        );
        return false;
      }
    },
    [fetchCategories]
  );

  // ============================================
  // RETORNO
  // ============================================

  return {
    categories,
    isLoading,
    isSaving,
    error,
    setError,
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
