import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { pecaSchema } from '@/app/utils/validators';
import type { Categorias, Fornecedor, Peca } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

interface ComboItem {
  id: number;
  label: string;
}

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
  fornecedorFilter: string;
  setFornecedorFilter: (filter: string) => void;
  getCategoryName: (categoriaId?: number | null) => string;
  getFornecedorName: (fornecedorId?: number | null) => string;
  formatPrice: (price: number) => string;
  formatLocalizacao: (localizacao: string[] | null | undefined) => string;
  handleOpenChange: (open: boolean) => void;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  categoryItems: ComboItem[];
  fornecedorItems: ComboItem[];
  precoInput: string;
  handlePrecoChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const pecaVazia: Partial<Peca> = {
  name_peca: '',
  codigo: '',
  categoria_id: undefined,
  quantidade: 0,
  preco: 0,
  fornecedor_id: null,
  localizacao: null,
  imagem: null
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
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('all');
  const [precoInput, setPrecoInput] = useState('');

  // GET: Listar
  const fetchPecas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pecas');
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

  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    label: cat.name
  }));

  const fornecedorItems = fornecedores.map((f) => ({
    id: f.id,
    label: f.name_empresa
  }));

  // Filtered pecas
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewPeca((prev) => ({
          ...prev,
          imagem: reader.result as string
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewPeca((prev) => ({ ...prev, imagem: null }));
  };

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
        localizacao: data.localizacao,
        imagem: data.imagem
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
        localizacao: data.localizacao,
        imagem: data.imagem
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
      pecaSchema.parse(newPeca);

      await updatePeca(editingPeca.id, newPeca);
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
      localizacao: peca.localizacao,
      imagem: peca.imagem || null
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

  useEffect(() => {
    if (isAddOpen) {
      const initialValue = newPeca.preco
        ? (newPeca.preco / 100).toString().replace('.', ',')
        : '';
      setPrecoInput(initialValue);
    } else {
      setPrecoInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddOpen, editingPeca?.id]);

  const handlePrecoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const sanitized = input.replace(/[^\d.,]/g, '');
    const parts = sanitized.split(/[.,]/);
    const formatted =
      parts.length > 2
        ? parts[0] + ',' + parts.slice(1).join('')
        : sanitized.replace('.', ',');

    setPrecoInput(formatted);

    const normalized = formatted.replace(',', '.');
    const num = parseFloat(normalized);

    if (!isNaN(num)) {
      setNewPeca({ ...newPeca, preco: Math.round(num * 100) });
    } else if (formatted === '') {
      setNewPeca({ ...newPeca, preco: undefined });
    }
  };

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
    fornecedorFilter,
    setFornecedorFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    formatLocalizacao,
    handleOpenChange,
    handleImageChange,
    handleRemoveImage,
    categoryItems,
    fornecedorItems,
    precoInput,
    handlePrecoChange
  };
}
