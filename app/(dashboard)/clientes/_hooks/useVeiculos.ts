'use client';

import { useCallback, useEffect, useState } from 'react';

import { veiculoSchema } from '@/app/utils/validators';
import type { Veiculo } from '@/db/schema';

import { toast } from 'sonner';
import { ZodError } from 'zod';

export type VeiculoFormValues = Pick<Veiculo, 'placa' | 'modelo'>;

export interface UseVeiculosReturn {
  veiculosByCliente: Map<number, Veiculo[]>;
  loadingClientes: Set<number>;
  isInitialLoading: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  editingVeiculo: Veiculo | null;
  setEditingVeiculo: (veiculo: Veiculo | null) => void;
  deleteVeiculoId: number | null;
  setDeleteVeiculoId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  isSaving: boolean;
  fetchVeiculosByCliente: (clienteId: number) => Promise<void>;
  handleAddVeiculo: (clienteId: number, data: VeiculoFormValues) => Promise<boolean>;
  handleUpdateVeiculo: (veiculoId: number, clienteId: number, data: VeiculoFormValues) => Promise<boolean>;
  handleDeleteVeiculo: (veiculoId: number, clienteId: number) => Promise<boolean>;
  getTotalVeiculos: () => number;
  isLoadingCliente: (clienteId: number) => boolean;
}

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
  const [deleteVeiculoId, setDeleteVeiculoId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllVeiculos = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch('/api/veiculos');
      const data: Veiculo[] = await response.json();

      const grouped = new Map<number, Veiculo[]>();

      data.forEach((veiculo) => {
        if (!veiculo.cliente_id) {
          return;
        }

        const currentVeiculos = grouped.get(veiculo.cliente_id) ?? [];
        grouped.set(veiculo.cliente_id, [...currentVeiculos, veiculo]);
      });

      setVeiculosByCliente(grouped);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllVeiculos();
  }, [fetchAllVeiculos]);

  const fetchVeiculosByCliente = useCallback(async (clienteId: number) => {
    setLoadingClientes((previous) => new Set(previous).add(clienteId));
    try {
      const response = await fetch(`/api/veiculos?cliente_id=${clienteId}`);
      const data: Veiculo[] = await response.json();

      setVeiculosByCliente((previous) => {
        const updated = new Map(previous);
        updated.set(clienteId, data);
        return updated;
      });
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoadingClientes((previous) => {
        const updated = new Set(previous);
        updated.delete(clienteId);
        return updated;
      });
    }
  }, []);

  const createVeiculo = async (clienteId: number, data: VeiculoFormValues) => {
    const response = await fetch('/api/veiculos', {
      method: 'POST',
      body: JSON.stringify({
        placa: data.placa,
        modelo: data.modelo,
        status: true,
        cliente_id: clienteId
      })
    });

    if (response.status === 409) {
      const body = await response.json();
      throw new Error(body.error);
    }

    if (!response.ok) {
      throw new Error('Erro ao adicionar veículo');
    }

    await fetchVeiculosByCliente(clienteId);
  };

  const updateVeiculo = async (
    veiculoId: number,
    clienteId: number,
    data: VeiculoFormValues
  ) => {
    const response = await fetch(`/api/veiculos/${veiculoId}`, {
      method: 'PUT',
      body: JSON.stringify({
        placa: data.placa,
        modelo: data.modelo,
        status: true
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar veículo');
    }

    await fetchVeiculosByCliente(clienteId);
  };

  const deleteVeiculo = async (veiculoId: number, clienteId: number) => {
    const response = await fetch(`/api/veiculos/${veiculoId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir veículo');
    }

    await fetchVeiculosByCliente(clienteId);
  };

  const getAllVeiculos = () => {
    const veiculos: Veiculo[] = [];
    veiculosByCliente.forEach((currentVeiculos) => {
      veiculos.push(...currentVeiculos);
    });
    return veiculos;
  };

  const validateUniquePlate = (placa: string, veiculoId?: number) => {
    const normalizedPlate = placa
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    const hasDuplicatePlate = getAllVeiculos().some((veiculo) => {
      const currentPlate = veiculo.placa
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();

      return veiculo.id !== veiculoId && currentPlate === normalizedPlate;
    });

    if (hasDuplicatePlate) {
      throw new Error(
        veiculoId
          ? `Já existe outro veículo cadastrado com a placa '${placa}'`
          : `Já existe um veículo cadastrado com a placa '${placa}'`
      );
    }
  };

  const handleAddVeiculo = async (
    clienteId: number,
    data: VeiculoFormValues
  ) => {
    setIsSaving(true);
    try {
      veiculoSchema.parse(data);
      validateUniquePlate(data.placa);
      await createVeiculo(clienteId, data);
      setIsAddOpen(false);
      toast.success('Veículo adicionado com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar veículo');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateVeiculo = async (
    veiculoId: number,
    clienteId: number,
    data: VeiculoFormValues
  ) => {
    setIsSaving(true);
    try {
      veiculoSchema.parse(data);
      validateUniquePlate(data.placa, veiculoId);
      await updateVeiculo(veiculoId, clienteId, data);
      setEditingVeiculo(null);
      toast.success('Veículo atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message ?? 'Dados inválidos');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar veículo');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVeiculo = async (veiculoId: number, clienteId: number) => {
    setIsSaving(true);
    try {
      await deleteVeiculo(veiculoId, clienteId);
      setIsDeleteOpen(false);
      setDeleteVeiculoId(null);
      toast.success('Veículo excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalVeiculos = () => {
    let total = 0;
    veiculosByCliente.forEach((veiculos) => {
      total += veiculos.length;
    });
    return total;
  };

  const isLoadingCliente = (clienteId: number) => loadingClientes.has(clienteId);

  return {
    veiculosByCliente,
    loadingClientes,
    isInitialLoading,
    isAddOpen,
    setIsAddOpen,
    editingVeiculo,
    setEditingVeiculo,
    deleteVeiculoId,
    setDeleteVeiculoId,
    isDeleteOpen,
    setIsDeleteOpen,
    isSaving,
    fetchVeiculosByCliente,
    handleAddVeiculo,
    handleUpdateVeiculo,
    handleDeleteVeiculo,
    getTotalVeiculos,
    isLoadingCliente
  };
}
