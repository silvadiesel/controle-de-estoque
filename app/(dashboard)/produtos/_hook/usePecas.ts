import { useCallback, useEffect, useState } from 'react';

import type { PecaFormValues } from '@/app/utils/validators';
import type { Categorias, Fornecedor, Peca } from '@/db/schema';
import type { SearchableSelectOption } from '@/components/ui/searchable-select';

import { toast } from 'sonner';

export function usePecas() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categories, setCategories] = useState<Categorias[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('all');

  // GET: Listar
  const fetchPecas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: Peca[] = await res.json();

      setPecas(
        data.map((item) => ({
          ...item,
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

  // Options para SearchableSelect
  const categoryOptions: SearchableSelectOption[] = categories.map((cat) => ({
    value: String(cat.id),
    label: cat.name
  }));

  const supplierOptions: SearchableSelectOption[] = fornecedores.map((f) => ({
    value: String(f.id),
    label: f.name_empresa
  }));

  // Filtros
  const filteredPecas = pecas.filter(
    (peca) =>
      peca.name_peca.toLowerCase().includes(search.toLowerCase()) ||
      peca.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = filteredPecas.filter((peca) => {
    const matchesCategory =
      categoryFilter === 'all' ||
      peca.categoria_id?.toString() === categoryFilter;
    const matchesFornecedor =
      fornecedorFilter === 'all' ||
      peca.fornecedor_id?.toString() === fornecedorFilter;
    return matchesCategory && matchesFornecedor;
  });

  // POST: Criar
  const createPeca = async (
    data: PecaFormValues,
    image: string | null
  ) => {
    const localizacao =
      data.estante || data.prateleira
        ? [data.estante || '', data.prateleira || '']
        : null;

    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_peca: data.name_peca,
        codigo: data.codigo,
        categoria_id: data.categoria_id,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao,
        imagem: image,
        alerta: data.alerta ?? 1
      })
    });

    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.error);
    }
    if (!res.ok) throw new Error('Erro ao criar peça');
    await fetchPecas();
  };

  // PUT: Editar
  const updatePeca = async (
    id: number,
    data: PecaFormValues,
    image: string | null
  ) => {
    const localizacao =
      data.estante || data.prateleira
        ? [data.estante || '', data.prateleira || '']
        : null;

    const res = await fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_peca: data.name_peca,
        codigo: data.codigo,
        categoria_id: data.categoria_id,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao,
        imagem: image,
        alerta: data.alerta ?? 1
      })
    });

    if (res.ok) await fetchPecas();
    else throw new Error('Erro ao atualizar peça');
  };

  // DELETE: Remover
  const deletePeca = async (id: number) => {
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchPecas();
    } else {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Erro ao deletar peça');
    }
  };

  // Handlers
  const handleSubmit = async (
    data: PecaFormValues,
    image: string | null
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const codigoNovo = data.codigo.trim().toUpperCase();
      const duplicado = pecas.some(
        (p) =>
          p.id !== editingPeca?.id &&
          p.codigo.trim().toUpperCase() === codigoNovo
      );
      if (duplicado) {
        toast.error(
          `Já existe uma peça cadastrada com o código '${data.codigo}'`
        );
        return false;
      }

      if (editingPeca) {
        await updatePeca(editingPeca.id, data, image);
        toast.success('Peça atualizada com sucesso!');
      } else {
        await createPeca(data, image);
        toast.success('Peça adicionada com sucesso!');
      }

      setEditingPeca(null);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao salvar peça';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (peca: Peca) => {
    setEditingPeca(peca);
    setIsAddOpen(true);
  };

  const handleDeletePeca = async (id: number) => {
    setIsLoading(true);
    try {
      await deletePeca(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Peça deletada com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar peça';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsAddOpen(open);
      if (!open) {
        setEditingPeca(null);
      }
    },
    []
  );

  return {
    pecas,
    isLoading,
    search,
    setSearch,
    filteredProducts,
    isAddOpen,
    editingPeca,
    handleSubmit,
    handleEdit,
    handleDeletePeca,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    categoryFilter,
    setCategoryFilter,
    fornecedorFilter,
    setFornecedorFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    handleOpenChange,
    categoryOptions,
    supplierOptions
  };
}
