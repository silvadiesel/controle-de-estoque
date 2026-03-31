'use client';

import { Activity } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';

export interface ChartDay {
  label: string;
  fullDate: string;
  count: number;
  isToday: boolean;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function buildLast7Days(
  movimentacoes: { created_at: string }[]
): ChartDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: ChartDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: i === 0 ? 'Hoje' : DAY_NAMES[d.getDay()],
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

interface ChartBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDay;
}

function ChartBarShape({ x = 0, y = 0, width = 0, height = 0, payload }: ChartBarShapeProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill={
        payload?.isToday
          ? 'color-mix(in srgb, var(--primary) 70%, transparent)'
          : 'color-mix(in srgb, var(--primary) 30%, transparent)'
      }
    />
  );
}

interface MovementsChartProps {
  data: ChartDay[];
  isLoading: boolean;
  state?: 'ready' | 'unavailable';
}

export function MovementsChart({ data, isLoading, state = 'ready' }: MovementsChartProps) {
  return (
    <div className="flex-[1.5] bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-heading text-foreground">
            Movimentações
          </h2>
          <p className="text-muted-sm mt-0.5">Últimos 7 dias</p>
        </div>
        <div className="h-8 w-8 rounded-[6px] flex items-center justify-center bg-primary/12">
          <Activity size={14} className="text-primary" />
        </div>
      </div>

      {state === 'unavailable' ? (
        <Empty className="border-border bg-card h-[200px]">
          <EmptyHeader>
            <EmptyTitle>Dados indisponíveis</EmptyTitle>
            <EmptyDescription>Esse bloco não pode ser carregado agora.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-[8px]" />
      ) : data.every((d) => d.count === 0) ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-muted-sm">Nenhuma movimentação nos últimos 7 dias</p>
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
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
                    textAnchor="middle"
                    fontSize={11}
                    fill={data[index]?.isToday ? 'var(--primary)' : 'var(--muted-foreground)'}
                    fontWeight={data[index]?.isToday ? 700 : 400}
                  >
                    {payload.value}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'color-mix(in srgb, var(--primary) 6%, transparent)' }}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--foreground)'
                }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number) => [value, 'Movimentações']}
              />
              <Bar
                dataKey="count"
                shape={<ChartBarShape />}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
