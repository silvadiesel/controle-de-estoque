'use client';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import type { ChartDay } from '../_lib/chart-data';
import type { DashboardBlockState } from '../_lib/dashboard-types';
import { ChartColumnIncreasing } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Recharts renders SVG directly and does not accept Tailwind/CSS classes.
const CHART_TICK_SIZE = 11;
const CHART_TOOLTIP_SIZE = 12;
const CHART_HEIGHT = 'h-[200px]';

interface ChartBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDay;
}

function ChartBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload
}: ChartBarShapeProps) {
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

interface MovementsChartInnerProps {
  data: ChartDay[];
  isLoading?: boolean;
  state?: DashboardBlockState;
}

export default function MovementsChartInner({
  data,
  isLoading = false,
  state = 'ready'
}: MovementsChartInnerProps) {
  return (
    <div className='flex-[1.5] bg-card border border-border rounded-xl p-5'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold leading-tight text-foreground'>
            Movimentações
          </h2>
          <p className='text-xs text-muted-foreground mt-0.5'>Últimos 7 dias</p>
        </div>
        <div className='size-8 rounded-md flex items-center justify-center border border-border bg-elevated text-primary'>
          <ChartColumnIncreasing size={16} aria-hidden='true' />
        </div>
      </div>

      {state === 'unavailable' ? (
        <Empty className={`border-border bg-card ${CHART_HEIGHT}`}>
          <EmptyHeader>
            <EmptyTitle>Dados indisponíveis</EmptyTitle>
            <EmptyDescription>
              Esse bloco não pode ser carregado agora.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <Skeleton className={`${CHART_HEIGHT} w-full rounded-md`} />
      ) : data.every((day) => day.count === 0) ? (
        <div className={`flex items-center justify-center ${CHART_HEIGHT}`}>
          <p className='text-xs text-muted-foreground'>
            Nenhuma movimentação nos últimos 7 dias
          </p>
        </div>
      ) : (
        <div
          className={CHART_HEIGHT}
          role='img'
          aria-label='Gráfico de barras com movimentações dos últimos 7 dias'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='var(--border)'
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
                    fontSize={CHART_TICK_SIZE}
                    fill={
                      data[index]?.isToday
                        ? 'var(--primary)'
                        : 'var(--muted-foreground)'
                    }
                    fontWeight={data[index]?.isToday ? 700 : 400}>
                    {payload.value}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: CHART_TICK_SIZE,
                  fill: 'var(--muted-foreground)'
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{
                  fill: 'color-mix(in srgb, var(--primary) 6%, transparent)'
                }}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: CHART_TOOLTIP_SIZE,
                  color: 'var(--foreground)'
                }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number) => [value, 'Movimentações']}
              />
              <Bar dataKey='count' shape={<ChartBarShape />} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
