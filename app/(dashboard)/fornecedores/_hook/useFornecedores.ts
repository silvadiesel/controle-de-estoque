import { useCallback, useEffect, useState } from 'react';

import { fornecedorSchema } from '@/app/utils/validators';
import type { Fornecedor } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

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
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.error);
    }
    if (!res.ok) throw new Error('Erro ao adicionar fornecedor');
    await fetchFornecedores();
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
    setIsLoading(true);
    try {
      fornecedorSchema.parse(newFornecedor);

      const cnpjNovo = newFornecedor.cnpj?.replace(/\D/g, '');
      const duplicado = fornecedores.some(
        (f) => f.cnpj.replace(/\D/g, '') === cnpjNovo
      );
      if (duplicado) {
        toast.error('Já existe um fornecedor cadastrado com este CNPJ');
        return;
      }

      await createFornecedor(newFornecedor);
      setNewFornecedor(fornecedorVazio);
      setIsAddOpen(false);
      toast.success('Fornecedor adicionado com sucesso!');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar fornecedor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFornecedor = async () => {
    if (!editingFornecedor) return;

    setIsLoading(true);
    try {
      fornecedorSchema.parse(editingFornecedor);

      const cnpjEditado = editingFornecedor.cnpj?.replace(/\D/g, '');
      const duplicado = fornecedores.some(
        (f) => f.id !== editingFornecedor.id && f.cnpj.replace(/\D/g, '') === cnpjEditado
      );
      if (duplicado) {
        toast.error('Já existe outro fornecedor cadastrado com este CNPJ');
        return;
      }

      await updateFornecedor(editingFornecedor.id, editingFornecedor);
      setEditingFornecedor(null);
      toast.success('Fornecedor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar fornecedor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFornecedor = async (id: number) => {
    await deleteFornecedor(id);
    setIsDeleteOpen(false);
    setDeleteId(null);
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
    handleDeleteFornecedor,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  };
}
