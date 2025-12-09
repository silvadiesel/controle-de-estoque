import { useCallback, useEffect, useState } from 'react';

import type { Fornecedor } from '@/db/schema';

export interface UseFornecedoresReturn {
  fornecedores: Fornecedor[];
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
  filteredFornecedores: Fornecedor[];
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingFornecedor: Fornecedor | null;
  setEditingFornecedor: (fornecedor: Fornecedor | null) => void;
  newFornecedor: Partial<Fornecedor>;
  setNewFornecedor: (data: Partial<Fornecedor>) => void;
  handleAddFornecedor: () => Promise<void>;
  handleUpdateFornecedor: () => Promise<void>;
  handleDeleteFornecedor: (id: number) => Promise<void>;
}

const fornecedorVazio: Partial<Fornecedor> = {
  name_empresa: '',
  cnpj: '',
  telefone: '',
  email: ''
};

export function useFornecedores(): UseFornecedoresReturn {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(
    null
  );
  const [newFornecedor, setNewFornecedor] =
    useState<Partial<Fornecedor>>(fornecedorVazio);

  // GET: Listar
  const fetchFornecedores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fornecedores');
      const data: Fornecedor[] = await res.json();

      setFornecedores(
        data.map((item) => ({
          id: item.id,
          name_empresa: item.name_empresa,
          cnpj: item.cnpj,
          telefone: item.telefone,
          email: item.email,
          status: item.status,
          createdAt: item.createdAt ? new Date(item.createdAt) : null
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  // Filtered fornecedores
  const filteredFornecedores = fornecedores.filter(
    (fornecedor) =>
      fornecedor.name_empresa.toLowerCase().includes(search.toLowerCase()) ||
      fornecedor.cnpj.includes(search) ||
      (fornecedor.telefone && fornecedor.telefone.includes(search)) ||
      (fornecedor.email &&
        fornecedor.email.toLowerCase().includes(search.toLowerCase()))
  );

  // POST: Criar
  const createFornecedor = async (data: Partial<Fornecedor>) => {
    const res = await fetch('/api/fornecedores', {
      method: 'POST',
      body: JSON.stringify({
        name_empresa: data.name_empresa,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        status: true
      })
    });
    if (res.ok) await fetchFornecedores();
  };

  // PUT: Editar
  const updateFornecedor = async (id: number, data: Partial<Fornecedor>) => {
    const res = await fetch(`/api/fornecedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name_empresa: data.name_empresa,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        status: true
      })
    });
    if (res.ok) await fetchFornecedores();
  };

  // DELETE: Remover
  const deleteFornecedor = async (id: number) => {
    const res = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchFornecedores();
  };

  // Handlers
  const handleAddFornecedor = async () => {
    if (newFornecedor.name_empresa?.trim() && newFornecedor.cnpj?.trim()) {
      await createFornecedor(newFornecedor);
      setNewFornecedor(fornecedorVazio);
      setIsAddOpen(false);
    }
  };

  const handleUpdateFornecedor = async () => {
    if (editingFornecedor && editingFornecedor.name_empresa.trim()) {
      await updateFornecedor(editingFornecedor.id, editingFornecedor);
      setEditingFornecedor(null);
    }
  };

  const handleDeleteFornecedor = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteFornecedor(id);
    }
  };

  return {
    fornecedores,
    isLoading,
    search,
    setSearch,
    filteredFornecedores,
    isAddOpen,
    setIsAddOpen,
    editingFornecedor,
    setEditingFornecedor,
    newFornecedor,
    setNewFornecedor,
    handleAddFornecedor,
    handleUpdateFornecedor,
    handleDeleteFornecedor
  };
}
