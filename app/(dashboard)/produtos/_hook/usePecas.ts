import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { pecaSchema } from '@/app/utils/validators';
import type { Categorias, Fornecedor, Peca } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

export interface UsePecasReturn {
  pecas: Peca[];
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
  filteredPecas: Peca[];
  filteredProducts: Peca[];
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingPeca: Peca | null;
  setEditingPeca: (peca: Peca | null) => void;
  newPeca: Partial<Peca>;
  setNewPeca: (data: Partial<Peca>) => void;
  handleAddPeca: () => Promise<void>;
  handleUpdatePeca: () => Promise<void>;
  handleDeletePeca: (id: number) => Promise<void>;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleEdit: (peca: Peca) => void;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  categories: Categorias[];
  fornecedores: Fornecedor[];
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  getCategoryName: (categoriaId?: number | null) => string;
  getFornecedorName: (fornecedorId?: number | null) => string;
  formatPrice: (price: number) => string;
  formatLocalizacao: (localizacao: string[] | null | undefined) => string;
  handleOpenChange: (open: boolean) => void;
}

const pecaVazia: Partial<Peca> = {
  name_peca: '',
  codigo: '',
  categoria_id: undefined,
  quantidade: 0,
  preco: 0,
  fornecedor_id: null,
  localizacao: null
};

export function usePecas(): UsePecasReturn {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [newPeca, setNewPeca] = useState<Partial<Peca>>(pecaVazia);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categories, setCategories] = useState<Categorias[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // GET: Listar
  const fetchPecas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pecas');

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta não é JSON válido');
      }

      const data: Peca[] = await res.json();

      setPecas(
        data.map((item) => ({
          id: item.id,
          name_peca: item.name_peca,
          codigo: item.codigo,
          categoria_id: item.categoria_id,
          quantidade: item.quantidade,
          preco: item.preco,
          fornecedor_id: item.fornecedor_id,
          localizacao: item.localizacao,
          data_cadastro: item.data_cadastro
            ? new Date(item.data_cadastro)
            : null
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
      toast.error('Erro ao carregar peças');
      setPecas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPecas();
  }, [fetchPecas]);

  // Buscar categorias e fornecedores
  useEffect(() => {
    fetch('/api/categorias')
      .then((res) => res.json())
      .then((data) =>
        setCategories(data.filter((cat: Categorias) => cat.status))
      )
      .catch(console.error);

    fetch('/api/fornecedores')
      .then((res) => res.json())
      .then((data) => setFornecedores(data))
      .catch(console.error);
  }, []);

  // Filtered pecas
  const filteredPecas = pecas.filter(
    (peca) =>
      peca.name_peca.toLowerCase().includes(search.toLowerCase()) ||
      peca.codigo.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered products (com filtro de categoria)
  const filteredProducts = filteredPecas.filter((peca) => {
    const matchesCategory =
      categoryFilter === 'all' ||
      peca.categoria_id?.toString() === categoryFilter;
    return matchesCategory;
  });

  // POST: Criar
  const createPeca = async (data: Partial<Peca>) => {
    const res = await fetch('/api/pecas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name_peca: data.name_peca,
        codigo: data.codigo,
        categoria_id: data.categoria_id,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao: data.localizacao
      })
    });
    if (res.ok) await fetchPecas();
    else throw new Error('Erro ao criar peça');
  };

  // PUT: Editar
  const updatePeca = async (id: number, data: Partial<Peca>) => {
    const res = await fetch(`/api/pecas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name_peca: data.name_peca,
        codigo: data.codigo,
        categoria_id: data.categoria_id,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao: data.localizacao
      })
    });
    if (res.ok) await fetchPecas();
    else throw new Error('Erro ao atualizar peça');
  };

  // DELETE: Remover
  const deletePeca = async (id: number) => {
    const res = await fetch(`/api/pecas/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchPecas();
    else throw new Error('Erro ao deletar peça');
  };

  // Handlers
  const handleAddPeca = async () => {
    setIsLoading(true);
    try {
      pecaSchema.parse(newPeca);

      await createPeca(newPeca);
      setNewPeca(pecaVazia);
      setIsAddOpen(false);
      toast.success('Peça adicionada com sucesso!');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('Erro ao adicionar peça');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePeca = async () => {
    if (!editingPeca) return;

    setIsLoading(true);
    try {
      pecaSchema.parse(editingPeca);

      await updatePeca(editingPeca.id, editingPeca);
      setEditingPeca(null);
      setIsAddOpen(false);
      toast.success('Peça atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('Erro ao atualizar peça');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePeca = async (id: number) => {
    setIsLoading(true);
    try {
      await deletePeca(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Peça deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar peça');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingPeca) {
      await handleUpdatePeca();
    } else {
      await handleAddPeca();
    }
  };

  const handleEdit = (peca: Peca) => {
    setEditingPeca(peca);
    setNewPeca({
      name_peca: peca.name_peca,
      codigo: peca.codigo,
      categoria_id: peca.categoria_id,
      quantidade: peca.quantidade,
      preco: peca.preco,
      fornecedor_id: peca.fornecedor_id,
      localizacao: peca.localizacao
    });
    setIsAddOpen(true);
  };

  const getCategoryName = (categoriaId?: number | null) => {
    if (!categoriaId) return '-';
    const category = categories.find((cat) => cat.id === categoriaId);
    return category?.name || '-';
  };

  const getFornecedorName = (fornecedorId?: number | null) => {
    if (!fornecedorId) return '-';
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
    return fornecedor?.name_empresa || '-';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const formatLocalizacao = (localizacao: string[] | null | undefined) => {
    if (!localizacao || !Array.isArray(localizacao) || localizacao.length < 2) {
      return '-';
    }
    return `E${localizacao[0]} P${localizacao[1]}`;
  };

  const handleOpenChange = useCallback((open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingPeca(null);
      setNewPeca(pecaVazia);
    }
  }, []);

  return {
    pecas,
    isLoading,
    search,
    setSearch,
    filteredPecas,
    filteredProducts,
    isAddOpen,
    setIsAddOpen,
    editingPeca,
    setEditingPeca,
    newPeca,
    setNewPeca,
    handleAddPeca,
    handleUpdatePeca,
    handleDeletePeca,
    handleSubmit,
    handleEdit,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    categories,
    fornecedores,
    categoryFilter,
    setCategoryFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    formatLocalizacao,
    handleOpenChange
  };
}
