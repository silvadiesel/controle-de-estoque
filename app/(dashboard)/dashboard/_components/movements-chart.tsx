'use client';

import dynamic from 'next/dynamic';

import type { ChartDay } from '../_lib/chart-data';
import type { DashboardBlockState } from '../_lib/dashboard-types';

export interface MovementsChartProps {
  data: ChartDay[];
  isLoading?: boolean;
  state?: DashboardBlockState;
}

const LineChartBlock = dynamic(() => import('./movements-chart.inner'), {
  ssr: false,
  loading: () => (
    <div className='h-64 w-full animate-pulse rounded-lg bg-muted' />
  )
});

export function MovementsChart(props: MovementsChartProps) {
  return <LineChartBlock {...props} />;
}
