'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Cliente, Peca, Veiculo } from '@/db/schema';

import { toast } from 'sonner';

// Tipos para as ordens com dados relacionados
export interface OrdemPeca {
  id: number;
  peca_id: number;
  quantidade: number;
  peca: {
    id: number;
    name_peca: string;
    codigo: string;
    preco: number;
  } | null;
}

export interface OrdemServicoCompleta {
  id: number;
  data_criacao: string;
  data_chegada: string;
  data_saida: string | null;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  veiculo_id: number;
  funcionario_id: string;
  observacao: string | null;
  valor_total: number;
  cliente: {
    id: number;
    name_cliente: string;
    nome_empresa: string;
  } | null;
  veiculo: {
    id: number;
    placa: string;
    modelo: string;
  } | null;
  funcionario: {
    id: string;
    name: string;
  } | null;
  pecas: OrdemPeca[];
}

export interface OrdemVendaCompleta {
  id: number;
  data_criacao: string;
  data_pagamento: string | null;
  status: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  observacao: string | null;
  valor_total: number;
  metodo_pagamento: 'pix' | 'boleto' | 'cheque' | 'debito' | 'credito' | 'dinheiro' | null;
  cliente: {
    id: number;
    name_cliente: string;
    nome_empresa: string;
  } | null;
  pecas: OrdemPeca[];
}

export interface NovaOrdemServico {
  data_chegada: string;
  data_saida?: string;
  status?: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  veiculo_id: number;
  funcionario_id: string;
  observacao?: string;
  valor_total: number;
  pecas: { peca_id: number; quantidade: number }[];
}

export interface NovaOrdemVenda {
  data_pagamento?: string;
  status?: 'ativa' | 'fechada' | 'cancelada';
  cliente_id: number;
  observacao?: string;
  valor_total: number;
  metodo_pagamento?: 'pix' | 'boleto' | 'cheque' | 'debito' | 'credito' | 'dinheiro';
  pecas: { peca_id: number; quantidade: number }[];
}

export interface UseOrdensReturn {
  // Dados
  ordensServico: OrdemServicoCompleta[];
  ordensVenda: OrdemVendaCompleta[];
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  isLoading: boolean;

  // Filtros
  search: string;
  setSearch: (search: string) => void;
  filterType: 'all' | 'servico' | 'venda';
  setFilterType: (type: 'all' | 'servico' | 'venda') => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;

  // Modal Ordem Serviço
  isAddServicoOpen: boolean;
  setIsAddServicoOpen: (open: boolean) => void;
  editingServico: OrdemServicoCompleta | null;
  setEditingServico: (ordem: OrdemServicoCompleta | null) => void;
  viewingServico: OrdemServicoCompleta | null;
  setViewingServico: (ordem: OrdemServicoCompleta | null) => void;

  // Modal Ordem Venda
  isAddVendaOpen: boolean;
  setIsAddVendaOpen: (open: boolean) => void;
  editingVenda: OrdemVendaCompleta | null;
  setEditingVenda: (ordem: OrdemVendaCompleta | null) => void;
  viewingVenda: OrdemVendaCompleta | null;
  setViewingVenda: (ordem: OrdemVendaCompleta | null) => void;

  // Delete
  deleteId: { type: 'servico' | 'venda'; id: number } | null;
  setDeleteId: (data: { type: 'servico' | 'venda'; id: number } | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;

  // Handlers
  handleAddOrdemServico: (data: NovaOrdemServico) => Promise<void>;
  handleUpdateOrdemServico: (id: number, data: Partial<NovaOrdemServico>) => Promise<void>;
  handleDeleteOrdemServico: (id: number) => Promise<void>;
  handleAddOrdemVenda: (data: NovaOrdemVenda) => Promise<void>;
  handleUpdateOrdemVenda: (id: number, data: Partial<NovaOrdemVenda>) => Promise<void>;
  handleDeleteOrdemVenda: (id: number) => Promise<void>;
  handleDelete: () => Promise<void>;

  // Stats
  stats: {
    totalServico: number;
    totalVenda: number;
    ativas: number;
    fechadas: number;
  };

  // Helpers
  getVeiculosByCliente: (clienteId: number) => Veiculo[];
  refreshData: () => Promise<void>;
}

export function useOrdens(): UseOrdensReturn {
  // Dados principais
  const [ordensServico, setOrdensServico] = useState<OrdemServicoCompleta[]>([]);
  const [ordensVenda, setOrdensVenda] = useState<OrdemVendaCompleta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'servico' | 'venda'>('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modais Ordem Serviço
  const [isAddServicoOpen, setIsAddServicoOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<OrdemServicoCompleta | null>(null);
  const [viewingServico, setViewingServico] = useState<OrdemServicoCompleta | null>(null);

  // Modais Ordem Venda
  const [isAddVendaOpen, setIsAddVendaOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<OrdemVendaCompleta | null>(null);
  const [viewingVenda, setViewingVenda] = useState<OrdemVendaCompleta | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<{ type: 'servico' | 'venda'; id: number } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch data
  const fetchOrdensServico = useCallback(async () => {
    try {
      const res = await fetch('/api/ordens/servico');
      const data: OrdemServicoCompleta[] = await res.json();
      setOrdensServico(data);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      toast.error('Erro ao carregar ordens de serviço');
    }
  }, []);

  const fetchOrdensVenda = useCallback(async () => {
    try {
      const res = await fetch('/api/ordens/venda');
      const data: OrdemVendaCompleta[] = await res.json();
      setOrdensVenda(data);
    } catch (error) {
      console.error('Erro ao buscar ordens de venda:', error);
      toast.error('Erro ao carregar ordens de venda');
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes');
      const data: Cliente[] = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  }, []);

  const fetchVeiculos = useCallback(async () => {
    try {
      const res = await fetch('/api/veiculos');
      const data: Veiculo[] = await res.json();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  }, []);

  const fetchPecas = useCallback(async () => {
    try {
      const res = await fetch('/api/produtos');
      const data: Peca[] = await res.json();
      setPecas(data);
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchOrdensServico(),
      fetchOrdensVenda(),
      fetchClientes(),
      fetchVeiculos(),
      fetchPecas()
    ]);
    setIsLoading(false);
  }, [fetchOrdensServico, fetchOrdensVenda, fetchClientes, fetchVeiculos, fetchPecas]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handlers Ordem Serviço
  const handleAddOrdemServico = async (data: NovaOrdemServico) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ordens/servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Erro ao criar ordem de serviço');

      await fetchOrdensServico();
      setIsAddServicoOpen(false);
      toast.success('Ordem de serviço criada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar ordem de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrdemServico = async (id: number, data: Partial<NovaOrdemServico>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ordens/servico/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Erro ao atualizar ordem de serviço');

      await fetchOrdensServico();
      setEditingServico(null);
      setViewingServico(null);
      toast.success('Ordem de serviço atualizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar ordem de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrdemServico = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ordens/servico/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao excluir ordem de serviço');

      await fetchOrdensServico();
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Ordem de serviço excluída com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir ordem de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers Ordem Venda
  const handleAddOrdemVenda = async (data: NovaOrdemVenda) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ordens/venda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Erro ao criar ordem de venda');

      await fetchOrdensVenda();
      setIsAddVendaOpen(false);
      toast.success('Ordem de venda criada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar ordem de venda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrdemVenda = async (id: number, data: Partial<NovaOrdemVenda>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ordens/venda/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Erro ao atualizar ordem de venda');

      await fetchOrdensVenda();
      setEditingVenda(null);
      setViewingVenda(null);
      toast.success('Ordem de venda atualizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar ordem de venda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrdemVenda = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ordens/venda/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao excluir ordem de venda');

      await fetchOrdensVenda();
      setIsDeleteOpen(false);
      setDeleteId(null);
      toast.success('Ordem de venda excluída com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir ordem de venda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    if (deleteId.type === 'servico') {
      await handleDeleteOrdemServico(deleteId.id);
    } else {
      await handleDeleteOrdemVenda(deleteId.id);
    }
  };

  // Stats
  const stats = {
    totalServico: ordensServico.length,
    totalVenda: ordensVenda.length,
    ativas:
      ordensServico.filter((o) => o.status === 'ativa').length +
      ordensVenda.filter((o) => o.status === 'ativa').length,
    fechadas:
      ordensServico.filter((o) => o.status === 'fechada').length +
      ordensVenda.filter((o) => o.status === 'fechada').length
  };

  // Helpers
  const getVeiculosByCliente = (clienteId: number) => {
    return veiculos.filter((v) => v.cliente_id === clienteId);
  };

  return {
    ordensServico,
    ordensVenda,
    clientes,
    veiculos,
    pecas,
    isLoading,

    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,

    isAddServicoOpen,
    setIsAddServicoOpen,
    editingServico,
    setEditingServico,
    viewingServico,
    setViewingServico,

    isAddVendaOpen,
    setIsAddVendaOpen,
    editingVenda,
    setEditingVenda,
    viewingVenda,
    setViewingVenda,

    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,

    handleAddOrdemServico,
    handleUpdateOrdemServico,
    handleDeleteOrdemServico,
    handleAddOrdemVenda,
    handleUpdateOrdemVenda,
    handleDeleteOrdemVenda,
    handleDelete,

    stats,
    getVeiculosByCliente,
    refreshData
  };
}
