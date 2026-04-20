'use client';

import { useCallback, useEffect, useState } from 'react';

import { clienteSchema } from '@/app/utils/validators';
import type { Cliente } from '@/db/schema';

import { toast } from 'sonner';
import { type z, ZodError } from 'zod';

export type ClienteFormValues = z.infer<typeof clienteSchema>;

export interface UseClientesReturn {
  clientes: Cliente[];
  isLoading: boolean;
  isSaving: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingCliente: Cliente | null;
  setEditingCliente: (cliente: Cliente | null) => void;
  handleAddCliente: (data: ClienteFormValues) => Promise<boolean>;
  handleUpdateCliente: (clienteId: number, data: ClienteFormValues) => Promise<boolean>;
  handleDeleteCliente: (id: number) => Promise<boolean>;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
}

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clientes');
      const data: Cliente[] = await response.json();

      setClientes(
        data.map((item) => ({
          id: item.id,
          name_cliente: item.name_cliente,
          nome_empresa: item.nome_empresa,
          cnpj: item.cnpj,
          cpf: item.cpf,
          telefone: item.telefone,
          status: item.status,
          id_veiculos: item.id_veiculos,
          rua: item.rua,
          numero: item.numero,
          bairro: item.bairro,
          cidade: item.cidade,
          estado: item.estado,
          cep: item.cep
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClientes();
  }, [fetchClientes]);

  const createCliente = async (data: ClienteFormValues) => {
    const response = await fetch('/api/clientes', {
      method: 'POST',
      body: JSON.stringify({
        name_cliente: data.name_cliente,
        nome_empresa: data.nome_empresa || '',
        cnpj: data.cnpj || '',
        cpf: data.cpf || '',
        telefone: data.telefone,
        rua: data.rua || null,
        numero: data.numero || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        cep: data.cep || null,
        status: true
      })
    });

    if (response.status === 409) {
      const body = await response.json();
      throw new Error(body.error);
    }

    if (!response.ok) {
      throw new Error('Erro ao adicionar cliente');
    }

    await fetchClientes();
  };

  const updateCliente = async (id: number, data: ClienteFormValues) => {
    const response = await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name_cliente: data.name_cliente,
        nome_empresa: data.nome_empresa || '',
        cnpj: data.cnpj || '',
        cpf: data.cpf || '',
        telefone: data.telefone,
        rua: data.rua || null,
        numero: data.numero || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        cep: data.cep || null,
        status: true
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar cliente');
    }

    await fetchClientes();
  };

  const deleteCliente = async (id: number) => {
    const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao excluir cliente');
    }

    await fetchClientes();
  };

  const validateUniqueDocument = (data: ClienteFormValues, clienteId?: number) => {
    const cpf = data.cpf?.replace(/\D/g, '');
    const cnpj = data.cnpj?.replace(/\D/g, '');

    if (cpf) {
      const hasDuplicateCpf = clientes.some(
        (cliente) =>
          cliente.id !== clienteId && cliente.cpf?.replace(/\D/g, '') === cpf
      );

      if (hasDuplicateCpf) {
        throw new Error(
          clienteId
            ? 'Já existe outro cliente cadastrado com este CPF'
            : 'Já existe um cliente cadastrado com este CPF'
        );
      }
    }

    if (cnpj) {
      const hasDuplicateCnpj = clientes.some(
        (cliente) =>
          cliente.id !== clienteId && cliente.cnpj?.replace(/\D/g, '') === cnpj
      );

      if (hasDuplicateCnpj) {
        throw new Error(
          clienteId
            ? 'Já existe outro cliente cadastrado com este CNPJ'
            : 'Já existe um cliente cadastrado com este CNPJ'
        );
      }
    }
  };

  const handleAddCliente = async (data: ClienteFormValues) => {
    setIsSaving(true);
    try {
      clienteSchema.parse(data);
      validateUniqueDocument(data);
      await createCliente(data);
      setIsAddOpen(false);
      toast.success('Cliente adicionado com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar cliente');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCliente = async (
    clienteId: number,
    data: ClienteFormValues
  ) => {
    setIsSaving(true);
    try {
      clienteSchema.parse(data);
      validateUniqueDocument(data, clienteId);
      await updateCliente(clienteId, data);
      setEditingCliente(null);
      toast.success('Cliente atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar cliente');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCliente = async (id: number) => {
    setIsSaving(true);
    try {
      await deleteCliente(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Cliente excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir cliente';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    clientes,
    isLoading,
    isSaving,
    isAddOpen,
    setIsAddOpen,
    editingCliente,
    setEditingCliente,
    handleAddCliente,
    handleUpdateCliente,
    handleDeleteCliente,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  };
}
