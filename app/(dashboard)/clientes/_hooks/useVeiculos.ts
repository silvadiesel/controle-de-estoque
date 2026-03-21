'use client';

import { useCallback, useEffect, useState } from 'react';

import { veiculoSchema } from '@/app/utils/validators';
import type { Veiculo } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

export interface UseVeiculosReturn {
  veiculosByCliente: Map<number, Veiculo[]>;
  loadingClientes: Set<number>;
  isInitialLoading: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingVeiculo: Veiculo | null;
  setEditingVeiculo: (veiculo: Veiculo | null) => void;
  newVeiculo: Partial<Veiculo>;
  setNewVeiculo: (data: Partial<Veiculo>) => void;
  currentClienteId: number | null;
  setCurrentClienteId: (id: number | null) => void;
  deleteVeiculoId: number | null;
  setDeleteVeiculoId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  isSaving: boolean;
  fetchVeiculosByCliente: (clienteId: number) => Promise<void>;
  handleAddVeiculo: () => Promise<void>;
  handleUpdateVeiculo: () => Promise<void>;
  handleDeleteVeiculo: (id: number) => Promise<void>;
  getVeiculosForCliente: (clienteId: number) => Veiculo[];
  isLoadingCliente: (clienteId: number) => boolean;
  getTotalVeiculos: () => number;
}

const veiculoVazio: Partial<Veiculo> = {
  placa: '',
  modelo: ''
};

export function useVeiculos(): UseVeiculosReturn {
  const [veiculosByCliente, setVeiculosByCliente] = useState<
    Map<number, Veiculo[]>
  >(new Map());
  const [loadingClientes, setLoadingClientes] = useState<Set<number>>(
    new Set()
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [newVeiculo, setNewVeiculo] = useState<Partial<Veiculo>>(veiculoVazio);
  const [currentClienteId, setCurrentClienteId] = useState<number | null>(null);
  const [deleteVeiculoId, setDeleteVeiculoId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar TODOS os veículos ao inicializar e agrupar por cliente_id
  const fetchAllVeiculos = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await fetch('/api/veiculos');
      const data: Veiculo[] = await res.json();

      // Agrupar por cliente_id
      const grouped = new Map<number, Veiculo[]>();
      data.forEach((veiculo) => {
        if (veiculo.cliente_id) {
          const existing = grouped.get(veiculo.cliente_id) || [];
          grouped.set(veiculo.cliente_id, [...existing, veiculo]);
        }
      });

      setVeiculosByCliente(grouped);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Carregar todos os veículos ao montar o componente
  useEffect(() => {
    fetchAllVeiculos();
  }, [fetchAllVeiculos]);

  // GET: Buscar veículos de um cliente
  const fetchVeiculosByCliente = useCallback(async (clienteId: number) => {
    setLoadingClientes((prev) => new Set(prev).add(clienteId));
    try {
      const res = await fetch(`/api/veiculos?cliente_id=${clienteId}`);
      const data: Veiculo[] = await res.json();

      setVeiculosByCliente((prev) => {
        const newMap = new Map(prev);
        newMap.set(clienteId, data);
        return newMap;
      });
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoadingClientes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clienteId);
        return newSet;
      });
    }
  }, []);

  // POST: Criar veículo
  const createVeiculo = async (data: Partial<Veiculo>, clienteId: number) => {
    const res = await fetch('/api/veiculos', {
      method: 'POST',
      body: JSON.stringify({
        placa: data.placa,
        modelo: data.modelo,
        status: true,
        cliente_id: clienteId
      })
    });
    if (res.status === 409) {
      const body = await res.json();
      throw new Error(body.error);
    }
    if (!res.ok) throw new Error('Erro ao adicionar veículo');
    await fetchVeiculosByCliente(clienteId);
  };

  // PUT: Editar veículo
  const updateVeiculo = async (
    id: number,
    data: Partial<Veiculo>,
    clienteId: number
  ) => {
    const res = await fetch(`/api/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        placa: data.placa,
        modelo: data.modelo,
        status: data.status ?? true
      })
    });
    if (res.ok) await fetchVeiculosByCliente(clienteId);
  };

  // DELETE: Remover veículo
  const deleteVeiculo = async (id: number, clienteId: number) => {
    const res = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchVeiculosByCliente(clienteId);
  };

  // Helpers para verificar duplicata de placa globalmente
  const getAllVeiculos = (): Veiculo[] => {
    const all: Veiculo[] = [];
    veiculosByCliente.forEach((veiculos) => all.push(...veiculos));
    return all;
  };

  // Handlers
  const handleAddVeiculo = async () => {
    if (!currentClienteId) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    setIsSaving(true);
    try {
      veiculoSchema.parse(newVeiculo);

      const placaNova = newVeiculo.placa?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const duplicada = getAllVeiculos().some(
        (v) => v.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === placaNova
      );
      if (duplicada) {
        toast.error(`Já existe um veículo cadastrado com a placa '${newVeiculo.placa}'`);
        return;
      }

      await createVeiculo(newVeiculo, currentClienteId);
      setNewVeiculo(veiculoVazio);
      setIsAddOpen(false);
      toast.success('Veículo adicionado com sucesso!');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar veículo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateVeiculo = async () => {
    if (!editingVeiculo || !editingVeiculo.cliente_id) return;

    setIsSaving(true);
    try {
      veiculoSchema.parse(editingVeiculo);

      const placaEditada = editingVeiculo.placa?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const duplicada = getAllVeiculos().some(
        (v) =>
          v.id !== editingVeiculo.id &&
          v.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === placaEditada
      );
      if (duplicada) {
        toast.error(`Já existe outro veículo cadastrado com a placa '${editingVeiculo.placa}'`);
        return;
      }

      await updateVeiculo(
        editingVeiculo.id,
        editingVeiculo,
        editingVeiculo.cliente_id
      );
      setEditingVeiculo(null);
      toast.success('Veículo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar veículo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVeiculo = async (id: number) => {
    if (!currentClienteId) return;

    setIsSaving(true);
    try {
      await deleteVeiculo(id, currentClienteId);
      setIsDeleteOpen(false);
      setDeleteVeiculoId(null);
      toast.success('Veículo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir veículo');
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers
  const getVeiculosForCliente = (clienteId: number): Veiculo[] => {
    return veiculosByCliente.get(clienteId) || [];
  };

  const isLoadingCliente = (clienteId: number): boolean => {
    return loadingClientes.has(clienteId);
  };

  const getTotalVeiculos = (): number => {
    let total = 0;
    veiculosByCliente.forEach((veiculos) => {
      total += veiculos.length;
    });
    return total;
  };

  return {
    veiculosByCliente,
    loadingClientes,
    isInitialLoading,
    isAddOpen,
    setIsAddOpen,
    editingVeiculo,
    setEditingVeiculo,
    newVeiculo,
    setNewVeiculo,
    currentClienteId,
    setCurrentClienteId,
    deleteVeiculoId,
    setDeleteVeiculoId,
    isDeleteOpen,
    setIsDeleteOpen,
    isSaving,
    fetchVeiculosByCliente,
    handleAddVeiculo,
    handleUpdateVeiculo,
    handleDeleteVeiculo,
    getVeiculosForCliente,
    isLoadingCliente,
    getTotalVeiculos
  };
}
