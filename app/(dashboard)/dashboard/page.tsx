// app/(dashboard)/dashboard/page.tsx
import { StatCard } from '@/components/ui/stat-card';

import { ActivityFeed } from './_components/activity-feed';
import { LastOrders } from './_components/last-orders';
import { MovementsChart } from './_components/movements-chart';
import { getDashboardData } from './_data/getDashboardData';
import { AlertTriangle, Package, ShoppingCart, Users } from 'lucide-react';

export default async function DashboardPage() {
  const {
    dashboardState,
    totalProdutos,
    totalClientes,
    ordensAtivas,
    alertasEstoque,
    produtosState,
    clientesState,
    movimentacoesState,
    servicoState,
    vendaState,
    ordensServico,
    ordensVenda,
    movimentacoes,
    chartData
  } = await getDashboardData();

  return (
    <div
      className='flex flex-1 flex-col gap-4 p-4 lg:p-6'
      data-dashboard-state={dashboardState}>
      {/* Header */}
      <div className='flex flex-col gap-0.5'>
        <h1 className='text-xl font-bold text-foreground'>Dashboard</h1>
        <p className='text-xs text-muted-foreground'>Visão geral do sistema</p>
      </div>

      {/* Stat Cards */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Peças'
          value={totalProdutos}
          subtitle='itens em estoque'
          icon={Package}
          isLoading={false}
          state={produtosState}
        />
        <StatCard
          label='Clientes'
          value={totalClientes}
          subtitle='cadastrados'
          icon={Users}
          isLoading={false}
          state={clientesState}
        />
        <StatCard
          label='Ordens Ativas'
          value={ordensAtivas}
          subtitle='em andamento'
          icon={ShoppingCart}
          isLoading={false}
          state={
            servicoState === 'unavailable' || vendaState === 'unavailable'
              ? 'unavailable'
              : 'ready'
          }
        />
        <StatCard
          label='Alertas de Estoque'
          value={alertasEstoque}
          subtitle='peças com estoque baixo'
          icon={AlertTriangle}
          isLoading={false}
          state={produtosState}
        />
      </div>

      {/* Chart + Activity */}
      <div className='flex flex-col lg:flex-row gap-4'>
        <MovementsChart data={chartData} state={movimentacoesState} />
        <ActivityFeed
          movimentacoes={movimentacoes}
          state={movimentacoesState}
        />
      </div>

      {/* Last Orders */}
      <LastOrders
        ordensServico={ordensServico}
        ordensVenda={ordensVenda}
        isLoading={false}
        servicoState={servicoState}
        vendaState={vendaState}
      />
    </div>
  );
}
