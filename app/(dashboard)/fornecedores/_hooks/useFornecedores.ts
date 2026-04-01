'use client';

import { useCallback, useEffect, useState } from 'react';
import { fornecedorSchema } from '@/app/utils/validators';
import type { Fornecedor } from '@/db/schema';
import { toast } from 'sonner';
import { type z, ZodError } from 'zod';

export type FornecedorFormValues = z.infer<typeof fornecedorSchema>;

export interface UseFornecedoresReturn {
  fornecedores: Fornecedor[];
  isLoading: boolean;
  isSaving: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  editingFornecedor: Fornecedor | null;
  setEditingFornecedor: (f: Fornecedor | null) => void;
  handleAddFornecedor: (data: FornecedorFormValues) => Promise<boolean>;
  handleUpdateFornecedor: (id: number, data: FornecedorFormValues) => Promise<boolean>;
  handleDeleteFornecedor: (id: number) => Promise<boolean>;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
}

export function useFornecedores(): UseFornecedoresReturn {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchFornecedores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fornecedores');
      const data: Fornecedor[] = await res.json();
      setFornecedores(data.map((item) => ({
        id: item.id,
        name_empresa: item.name_empresa,
        cnpj: item.cnpj,
        telefone: item.telefone,
        email: item.email,
        status: item.status,
        createdAt: item.createdAt ? new Date(item.createdAt) : null
      })));
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchFornecedores(); }, [fetchFornecedores]);

  const createFornecedor = async (data: FornecedorFormValues) => {
    const res = await fetch('/api/fornecedores', {
      method: 'POST',
      body: JSON.stringify({ ...data, status: true })
    });
    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.error);
    }
    if (!res.ok) throw new Error('Erro ao adicionar fornecedor');
    await fetchFornecedores();
  };

  const updateFornecedor = async (id: number, data: FornecedorFormValues) => {
    const res = await fetch(`/api/fornecedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, status: true })
    });
    if (!res.ok) throw new Error('Erro ao atualizar fornecedor');
    await fetchFornecedores();
  };

  const deleteFornecedor = async (id: number) => {
    const res = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Erro ao excluir fornecedor');
    }
    await fetchFornecedores();
  };

  const validateUniqueCnpj = (cnpj: string, fornecedorId?: number) => {
    const clean = cnpj.replace(/\D/g, '');
    const duplicate = fornecedores.some(
      (f) => f.id !== fornecedorId && f.cnpj.replace(/\D/g, '') === clean
    );
    if (duplicate) {
      throw new Error(fornecedorId
        ? 'Já existe outro fornecedor cadastrado com este CNPJ'
        : 'Já existe um fornecedor cadastrado com este CNPJ'
      );
    }
  };

  const handleAddFornecedor = async (data: FornecedorFormValues) => {
    setIsSaving(true);
    try {
      validateUniqueCnpj(data.cnpj);
      await createFornecedor(data);
      setIsAddOpen(false);
      toast.success('Fornecedor adicionado com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar fornecedor');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFornecedor = async (id: number, data: FornecedorFormValues) => {
    setIsSaving(true);
    try {
      validateUniqueCnpj(data.cnpj, id);
      await updateFornecedor(id, data);
      setEditingFornecedor(null);
      toast.success('Fornecedor atualizado com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar fornecedor');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFornecedor = async (id: number) => {
    setIsSaving(true);
    try {
      await deleteFornecedor(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Fornecedor excluído com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir fornecedor';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fornecedores, isLoading, isSaving,
    isAddOpen, setIsAddOpen,
    editingFornecedor, setEditingFornecedor,
    handleAddFornecedor, handleUpdateFornecedor, handleDeleteFornecedor,
    deleteId, setDeleteId,
    isDeleteOpen, setIsDeleteOpen
  };
}
