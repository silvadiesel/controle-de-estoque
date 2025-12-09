'use client';

import { useCallback, useEffect, useState } from 'react';

import { clienteSchema } from '@/app/utils/validators';
import type { Cliente } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

export interface UseClientesReturn {
  clientes: Cliente[];
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
  filteredClientes: Cliente[];
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingCliente: Cliente | null;
  setEditingCliente: (cliente: Cliente | null) => void;
  newCliente: Partial<Cliente>;
  setNewCliente: (data: Partial<Cliente>) => void;
  handleAddCliente: () => Promise<void>;
  handleUpdateCliente: () => Promise<void>;
  handleDeleteCliente: (id: number) => Promise<void>;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
}

const clienteVazio: Partial<Cliente> = {
  name_cliente: '',
  nome_empresa: '',
  cnpj: '',
  cpf: '',
  telefone: ''
};

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [newCliente, setNewCliente] = useState<Partial<Cliente>>(clienteVazio);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // GET: Listar
  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clientes');
      const data: Cliente[] = await res.json();

      setClientes(
        data.map((item) => ({
          id: item.id,
          name_cliente: item.name_cliente,
          nome_empresa: item.nome_empresa,
          cnpj: item.cnpj,
          cpf: item.cpf,
          telefone: item.telefone,
          status: item.status,
          id_veiculos: item.id_veiculos
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
    fetchClientes();
  }, [fetchClientes]);

  // Filtered clientes - searches by name, empresa, cpf, cnpj
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.name_cliente.toLowerCase().includes(search.toLowerCase()) ||
      cliente.nome_empresa.toLowerCase().includes(search.toLowerCase()) ||
      cliente.cpf.includes(search) ||
      (cliente.cnpj && cliente.cnpj.includes(search)) ||
      (cliente.telefone && cliente.telefone.includes(search))
  );

  // POST: Criar
  const createCliente = async (data: Partial<Cliente>) => {
    const res = await fetch('/api/clientes', {
      method: 'POST',
      body: JSON.stringify({
        name_cliente: data.name_cliente,
        nome_empresa: data.nome_empresa,
        cnpj: data.cnpj || '',
        cpf: data.cpf,
        telefone: data.telefone,
        status: true
      })
    });
    if (res.ok) await fetchClientes();
  };

  // PUT: Editar
  const updateCliente = async (id: number, data: Partial<Cliente>) => {
    const res = await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name_cliente: data.name_cliente,
        nome_empresa: data.nome_empresa,
        cnpj: data.cnpj || '',
        cpf: data.cpf,
        telefone: data.telefone,
        status: data.status ?? true
      })
    });
    if (res.ok) await fetchClientes();
  };

  // DELETE: Remover
  const deleteCliente = async (id: number) => {
    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchClientes();
  };

  // Handlers
  const handleAddCliente = async () => {
    setIsLoading(true);
    try {
      clienteSchema.parse(newCliente);

      await createCliente(newCliente);
      setNewCliente(clienteVazio);
      setIsAddOpen(false);
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('Erro ao adicionar cliente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCliente = async () => {
    if (!editingCliente) return;

    setIsLoading(true);
    try {
      clienteSchema.parse(editingCliente);

      await updateCliente(editingCliente.id, editingCliente);
      setEditingCliente(null);
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('Erro ao atualizar cliente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCliente = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteCliente(id);
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clientes,
    isLoading,
    search,
    setSearch,
    filteredClientes,
    isAddOpen,
    setIsAddOpen,
    editingCliente,
    setEditingCliente,
    newCliente,
    setNewCliente,
    handleAddCliente,
    handleUpdateCliente,
    handleDeleteCliente,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen
  };
}
