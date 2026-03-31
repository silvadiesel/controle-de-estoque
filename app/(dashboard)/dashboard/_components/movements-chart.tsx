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

function ChartBarShape(props: Record<string, unknown>) {
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
      fill={
        payload?.isToday
          ? 'rgba(91,127,165,0.7)'
          : 'rgba(91,127,165,0.3)'
      }
    />
  );
}

interface MovementsChartProps {
  data: ChartDay[];
  isLoading: boolean;
}

export function MovementsChart({ data, isLoading }: MovementsChartProps) {
  return (
    <div className="flex-[1.5] bg-card border border-border rounded-[10px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-heading" style={{ color: 'var(--text-bright)' }}>
            Movimentações
          </h2>
          <p className="text-muted-sm mt-0.5">Últimos 7 dias</p>
        </div>
        <div className="h-8 w-8 rounded-[6px] flex items-center justify-center bg-[rgba(91,127,165,0.12)]">
          <Activity size={14} className="text-primary" />
        </div>
      </div>

      {isLoading ? (
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
                stroke="#27272a"
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
                    fill={data[index]?.isToday ? '#5b7fa5' : '#52525b'}
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
