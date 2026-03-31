'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import {
  Activity,
  AlertTriangle,
  Package,
  ShoppingCart,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  totalProdutos: number;
  totalClientes: number;
  ordensAtivas: number;
  alertasEstoque: number;
}

interface MovimentacaoAPI {
  id: number;
  tipo_acao: 'criacao' | 'edicao' | 'exclusao';
  entidade: string;
  entidade_id: string | null;
  descricao: string;
  created_at: string;
  usuario: { id: string; name: string } | null;
}

interface ChartDay {
  label: string;
  fullDate: string;
  count: number;
  isToday: boolean;
}

interface FeedItem {
  id: number;
  tipo_acao: 'criacao' | 'edicao' | 'exclusao';
  entidade: string;
  descricao: string;
  created_at: string;
  autor: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ENTIDADE_LABELS: Record<string, string> = {
  produto: 'Produto',
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  categoria: 'Categoria',
  veiculo: 'Veículo',
  ordem_venda: 'Ordem de Venda',
  ordem_servico: 'Ordem de Serviço',
  usuario: 'Usuário'
};

const ACAO_LABELS: Record<string, string> = {
  criacao: 'criou',
  edicao: 'editou',
  exclusao: 'excluiu'
};

const DOT_COLORS: Record<string, string> = {
  criacao: '#22c55e',
  edicao: '#eab308',
  exclusao: '#ef4444'
};

function buildLast7Days(movimentacoes: MovimentacaoAPI[]): ChartDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: ChartDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: DAY_NAMES[d.getDay()],
      fullDate: key,
      count: 0,
      isToday: i === 0
    });
  }

  for (const mov of movimentacoes) {
    const key = mov.created_at.slice(0, 10);
    const day = days.find((d) => d.fullDate === key);
    if (day) day.count++;
  }

  return days;
}

function timeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ontem';
  return `${diffD}d atrás`;
}

// ---------------------------------------------------------------------------
// Custom bar shape — highlights current day
// ---------------------------------------------------------------------------

function ChartBar(props: Record<string, unknown>) {
  const { x, y, width, height, payload } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    payload: ChartDay;
  };
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill={payload?.isToday ? 'rgba(91,127,165,0.7)' : 'rgba(91,127,165,0.3)'}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAPI[]>([]);
  const [isLoadingMov, setIsLoadingMov] = useState(true);

  // ---- existing fetch logic (unchanged) ----
  const fetchStats = useCallback(async () => {
    try {
      const [produtosRes, clientesRes, ordensServicoRes, ordensVendaRes] =
        await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/clientes'),
          fetch('/api/ordens/servico'),
          fetch('/api/ordens/venda')
        ]);

      const produtos = await produtosRes.json();
      const clientes = await clientesRes.json();
      const ordensServico = await ordensServicoRes.json();
      const ordensVenda = await ordensVendaRes.json();

      const produtosArr = Array.isArray(produtos) ? produtos : [];
      const ordensServicoArr = Array.isArray(ordensServico)
        ? ordensServico
        : [];
      const ordensVendaArr = Array.isArray(ordensVenda) ? ordensVenda : [];

      const ordensAtivas =
        ordensServicoArr.filter((o: { status: string }) => o.status === 'ativa')
          .length +
        ordensVendaArr.filter((o: { status: string }) => o.status === 'ativa')
          .length;

      const alertas = produtosArr.filter(
        (p: { quantidade: number; alerta: number | null }) =>
          p.quantidade <= (p.alerta ?? 0)
      ).length;

      setStats({
        totalProdutos: produtosArr.length,
        totalClientes: Array.isArray(clientes) ? clientes.length : 0,
        ordensAtivas,
        alertasEstoque: alertas
      });
    } catch {
      // Silently fail — show zeros
      setStats({
        totalProdutos: 0,
        totalClientes: 0,
        ordensAtivas: 0,
        alertasEstoque: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---- new fetch for movimentacoes ----
  const fetchMovimentacoes = useCallback(async () => {
    try {
      const res = await fetch('/api/movimentacoes');
      if (!res.ok) throw new Error('fetch failed');
      const data: MovimentacaoAPI[] = await res.json();
      setMovimentacoes(Array.isArray(data) ? data : []);
    } catch {
      setMovimentacoes([]);
    } finally {
      setIsLoadingMov(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchMovimentacoes();
  }, [fetchStats, fetchMovimentacoes]);

  // ---- derived data ----
  const chartData = useMemo(
    () => buildLast7Days(movimentacoes),
    [movimentacoes]
  );

  const feedItems: FeedItem[] = useMemo(() => {
    return [...movimentacoes]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 8)
      .map((m) => ({
        id: m.id,
        tipo_acao: m.tipo_acao,
        entidade: m.entidade,
        descricao: m.descricao,
        created_at: m.created_at,
        autor: m.usuario?.name ?? 'Usuário removido'
      }));
  }, [movimentacoes]);

  // ---- stat cards config ----
  const statCards = [
    {
      label: 'Produtos',
      value: stats?.totalProdutos ?? 0,
      icon: Package,
      isAlert: false
    },
    {
      label: 'Clientes',
      value: stats?.totalClientes ?? 0,
      icon: Users,
      isAlert: false
    },
    {
      label: 'Ordens Ativas',
      value: stats?.ordensAtivas ?? 0,
      icon: ShoppingCart,
      isAlert: false
    },
    {
      label: 'Alertas de Estoque',
      value: stats?.alertasEstoque ?? 0,
      icon: AlertTriangle,
      isAlert: true
    }
  ];

  const hasAlerts = (stats?.alertasEstoque ?? 0) > 0;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-6'>
      {/* Header */}
      <div className='flex flex-col gap-0.5'>
        <h1 className='text-[20px] font-semibold text-[#e4e4e7]'>Dashboard</h1>
        <p className='text-[13px] text-[#52525b]'>Visão geral do seu sistema</p>
      </div>

      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((card) => {
          const Icon = card.icon;
          const alertActive = card.isAlert && hasAlerts;
          return (
            <div
              key={card.label}
              className='bg-[#18181b] border border-[#27272a] rounded-[10px] p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <p className='text-[11px] uppercase tracking-wide text-[#52525b]'>
                    {card.label}
                  </p>
                  {isLoading ? (
                    <Skeleton className='h-8 w-14' />
                  ) : (
                    <p
                      className={`text-[24px] font-bold ${
                        alertActive ? 'text-[#ef4444]' : 'text-[#e4e4e7]'
                      }`}>
                      {card.value}
                    </p>
                  )}
                </div>
                <div
                  className={`h-10 w-10 rounded-[8px] flex items-center justify-center ${
                    alertActive
                      ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                      : 'bg-[rgba(91,127,165,0.1)] text-[#5b7fa5]'
                  }`}>
                  <Icon className='h-[18px] w-[18px]' />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity Feed */}
      <div className='flex flex-col lg:flex-row gap-4'>
        {/* Chart */}
        <div className='flex-[1.5] bg-[#18181b] border border-[#27272a] rounded-[10px] p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-[15px] font-medium text-[#e4e4e7]'>
                Movimentações
              </h2>
              <p className='text-[12px] text-[#52525b]'>Últimos 7 dias</p>
            </div>
            <div className='h-8 w-8 rounded-[6px] flex items-center justify-center bg-[rgba(91,127,165,0.1)]'>
              <Activity className='h-4 w-4 text-[#5b7fa5]' />
            </div>
          </div>

          {isLoadingMov ? (
            <Skeleton className='h-[200px] w-full rounded-[8px]' />
          ) : chartData.every((d) => d.count === 0) ? (
            <div className='flex items-center justify-center h-[200px]'>
              <p className='text-[13px] text-[#52525b]'>
                Nenhuma movimentação nos últimos 7 dias
              </p>
            </div>
          ) : (
            <div className='h-[200px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#27272a'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='label'
                    tick={({
                      x,
                      y,
                      payload,
                      index
                    }: {
                      x: number;
                      y: number;
                      payload: { value: string };
                      index: number;
                    }) => (
                      <text
                        x={x}
                        y={y + 12}
                        textAnchor='middle'
                        fontSize={11}
                        fill={chartData[index]?.isToday ? '#5b7fa5' : '#52525b'}
                        fontWeight={chartData[index]?.isToday ? 700 : 400}>
                        {payload.value}
                      </text>
                    )}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#52525b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(91,127,165,0.06)' }}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#e4e4e7'
                    }}
                    labelStyle={{ color: '#52525b' }}
                    formatter={(value: number) => [value, 'Movimentações']}
                  />
                  <Bar dataKey='count' shape={<ChartBar />} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className='flex-1 bg-[#18181b] border border-[#27272a] rounded-[10px] p-5'>
          <h2 className='text-[15px] font-medium text-[#e4e4e7] mb-4'>
            Atividade recente
          </h2>

          {isLoadingMov ? (
            <div className='flex flex-col gap-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-10 w-full rounded-[6px]' />
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className='flex items-center justify-center h-32'>
              <p className='text-[13px] text-[#52525b]'>
                Nenhuma atividade recente
              </p>
            </div>
          ) : (
            <div className='relative'>
              {feedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className='relative flex gap-3 pb-4 last:pb-0'>
                  {/* Timeline line */}
                  {idx < feedItems.length - 1 && (
                    <div className='absolute left-[4.5px] top-[14px] bottom-0 w-px bg-[#27272a]' />
                  )}

                  {/* Dot */}
                  <div className='relative mt-[5px] shrink-0'>
                    <div
                      className='h-[9px] w-[9px] rounded-full'
                      style={{
                        backgroundColor: DOT_COLORS[item.tipo_acao] ?? '#52525b'
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    <p className='text-[12px] text-[#d4d4d8] leading-snug'>
                      {item.autor}{' '}
                      <span className='text-[#52525b]'>
                        {ACAO_LABELS[item.tipo_acao] ?? item.tipo_acao}
                      </span>{' '}
                      <span className='text-[#5b7fa5] font-medium'>
                        {ENTIDADE_LABELS[item.entidade] ?? item.entidade}
                      </span>
                    </p>
                    <p className='text-[10px] text-[#3f3f46] mt-0.5'>
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
