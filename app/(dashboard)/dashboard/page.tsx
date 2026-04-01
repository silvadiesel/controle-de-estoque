// app/(dashboard)/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AlertTriangle, Package, ShoppingCart, Users } from 'lucide-react';

import { type Cliente } from '@/db/schema/cliente';
import { type Peca } from '@/db/schema/pecas';

import { ActivityFeed, type MovimentacaoAPI } from './_components/activity-feed';
import { buildLast7Days, MovementsChart } from './_components/movements-chart';
import { LastOrders, type OrdemServicoItem, type OrdemVendaItem } from './_components/last-orders';
import { StatCard } from '@/components/ui/stat-card';
import { deriveDashboardState, type RequestBucket } from './_lib/dashboard-state';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardState, setDashboardState] = useState<'loading' | 'ready' | 'partial-error' | 'total-error'>('loading');

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [ordensAtivas, setOrdensAtivas] = useState(0);
  const [alertasEstoque, setAlertasEstoque] = useState(0);

  const [produtosState, setProdutosState] = useState<'ready' | 'unavailable'>('ready');
  const [clientesState, setClientesState] = useState<'ready' | 'unavailable'>('ready');
  const [movimentacoesState, setMovimentacoesState] = useState<'ready' | 'unavailable'>('ready');
  const [servicoState, setServicoState] = useState<'ready' | 'unavailable'>('ready');
  const [vendaState, setVendaState] = useState<'ready' | 'unavailable'>('ready');

  const [ordensServico, setOrdensServico] = useState<OrdemServicoItem[]>([]);
  const [ordensVenda, setOrdensVenda] = useState<OrdemVendaItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAPI[]>([]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setDashboardState('loading');

    const results = await Promise.allSettled([
      fetch('/api/produtos').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch('/api/clientes').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch('/api/ordens/servico').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch('/api/ordens/venda').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch('/api/movimentacoes').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    ]);

    const toBucket = <T,>(result: PromiseSettledResult<unknown>): RequestBucket<T> => ({
      ok: result.status === 'fulfilled' && Array.isArray(result.value),
      data: result.status === 'fulfilled' && Array.isArray(result.value) ? (result.value as T[]) : []
    });

    const buckets = {
      produtos: toBucket<Peca>(results[0]),
      clientes: toBucket<Cliente>(results[1]),
      servico: toBucket<OrdemServicoItem>(results[2]),
      venda: toBucket<OrdemVendaItem>(results[3]),
      movimentacoes: toBucket<MovimentacaoAPI>(results[4])
    };

    const nextState = deriveDashboardState(buckets);
    setDashboardState(nextState.pageState);
    setTotalProdutos(nextState.cards.produtos.value);
    setTotalClientes(nextState.cards.clientes.value);
    setProdutosState(nextState.cards.produtos.state);
    setClientesState(nextState.cards.clientes.state);
    setMovimentacoesState(buckets.movimentacoes.ok ? 'ready' : 'unavailable');
    setServicoState(buckets.servico.ok ? 'ready' : 'unavailable');
    setVendaState(buckets.venda.ok ? 'ready' : 'unavailable');
    setOrdensAtivas(
      (buckets.servico.ok ? buckets.servico.data.filter((o) => o.status === 'ativa').length : 0) +
        (buckets.venda.ok ? buckets.venda.data.filter((o) => o.status === 'ativa').length : 0)
    );
    setAlertasEstoque(
      buckets.produtos.data.filter((p) => p.quantidade <= p.alerta).length
    );
    setOrdensServico(buckets.servico.data);
    setOrdensVenda(buckets.venda.data);
    setMovimentacoes(buckets.movimentacoes.data);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchAll é assíncrono; os setState ocorrem após o primeiro await, não no corpo síncrono do efeito
    fetchAll();
  }, [fetchAll]);

  const chartData = useMemo(() => buildLast7Days(movimentacoes), [movimentacoes]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6" data-dashboard-state={dashboardState}>
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-sm">Visão geral do sistema</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produtos"
          value={totalProdutos}
          subtitle="itens em estoque"
          icon={Package}
          isLoading={isLoading}
          state={produtosState}
        />
        <StatCard
          label="Clientes"
          value={totalClientes}
          subtitle="cadastrados"
          icon={Users}
          isLoading={isLoading}
          state={clientesState}
        />
        <StatCard
          label="Ordens Ativas"
          value={ordensAtivas}
          subtitle="em andamento"
          icon={ShoppingCart}
          isLoading={isLoading}
          state={servicoState === 'unavailable' || vendaState === 'unavailable' ? 'unavailable' : 'ready'}
        />
        <StatCard
          label="Alertas de Estoque"
          value={alertasEstoque}
          subtitle="produtos com estoque baixo"
          icon={AlertTriangle}
          isLoading={isLoading}
          state={produtosState}
        />
      </div>

      {/* Chart + Activity */}
      <div className="flex flex-col lg:flex-row gap-4">
        <MovementsChart data={chartData} isLoading={isLoading} state={movimentacoesState} />
        <ActivityFeed movimentacoes={movimentacoes} isLoading={isLoading} state={movimentacoesState} />
      </div>

      {/* Last Orders */}
      <LastOrders
        ordensServico={ordensServico}
        ordensVenda={ordensVenda}
        isLoading={isLoading}
        servicoState={servicoState}
        vendaState={vendaState}
      />
    </div>
  );
}
