// app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

import { AlertTriangle, Package, ShoppingCart, Users } from 'lucide-react';

import { type Cliente } from '@/db/schema/cliente';
import { type Peca } from '@/db/schema/pecas';

import { ActivityFeed, type MovimentacaoAPI } from './_components/activity-feed';
import { LastOrders, type OrdemServicoItem, type OrdemVendaItem } from './_components/last-orders';
import { buildLast7Days, MovementsChart } from './_components/movements-chart';
import { StatCard } from './_components/stat-card';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [ordensAtivas, setOrdensAtivas] = useState(0);
  const [alertasEstoque, setAlertasEstoque] = useState(0);

  const [ordensServico, setOrdensServico] = useState<OrdemServicoItem[]>([]);
  const [ordensVenda, setOrdensVenda] = useState<OrdemVendaItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAPI[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.allSettled([
        fetch('/api/produtos').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        fetch('/api/clientes').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        fetch('/api/ordens/servico').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        fetch('/api/ordens/venda').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        fetch('/api/movimentacoes').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      ]);

      const produtos: Peca[] = results[0].status === 'fulfilled' && Array.isArray(results[0].value)
        ? results[0].value
        : [];
      const clientes: Cliente[] = results[1].status === 'fulfilled' && Array.isArray(results[1].value)
        ? results[1].value
        : [];
      const servico: OrdemServicoItem[] =
        results[2].status === 'fulfilled' && Array.isArray(results[2].value)
          ? results[2].value
          : [];
      const venda: OrdemVendaItem[] =
        results[3].status === 'fulfilled' && Array.isArray(results[3].value)
          ? results[3].value
          : [];
      const movs: MovimentacaoAPI[] =
        results[4].status === 'fulfilled' && Array.isArray(results[4].value)
          ? results[4].value
          : [];

      setTotalProdutos(produtos.length);
      setTotalClientes(clientes.length);
      setOrdensAtivas(
        servico.filter((o) => o.status === 'ativa').length +
          venda.filter((o) => o.status === 'ativa').length
      );
      setAlertasEstoque(
        produtos.filter((p) => p.quantidade <= p.alerta).length
      );
      setOrdensServico(servico);
      setOrdensVenda(venda);
      setMovimentacoes(movs);
      setIsLoading(false);
    }

    void fetchAll();
  }, []);

  const chartData = useMemo(() => buildLast7Days(movimentacoes), [movimentacoes]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-bright)' }}>
          Dashboard
        </h1>
        <p className="text-muted-sm">Visão geral do sistema</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produtos"
          value={totalProdutos}
          subtitle="itens em estoque"
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          label="Clientes"
          value={totalClientes}
          subtitle="cadastrados"
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="Ordens Ativas"
          value={ordensAtivas}
          subtitle="em andamento"
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          label="Alertas de Estoque"
          value={alertasEstoque}
          subtitle="produtos com estoque baixo"
          icon={AlertTriangle}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <MovementsChart data={chartData} isLoading={isLoading} />
        <ActivityFeed movimentacoes={movimentacoes} isLoading={isLoading} />
      </div>

      <LastOrders
        ordensServico={ordensServico}
        ordensVenda={ordensVenda}
        isLoading={isLoading}
      />
    </div>
  );
}
