import { Skeleton } from '@/components/ui/skeleton';

import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  isLoading: boolean;
  state?: 'ready' | 'unavailable';
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  state = 'ready'
}: StatCardProps) {
  return (
    <div className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-label text-muted-foreground'>{label}</p>
          {isLoading ? (
            <Skeleton className='mt-3 h-8 w-20' />
          ) : (
            <p className='mt-3 text-data text-foreground'>{value}</p>
          )}
        </div>
        <div className='flex size-9 rounded-md items-center justify-center border border-border bg-elevated text-primary'>
          <Icon size={20} aria-hidden='true' />
        </div>
      </div>
      <p className='text-sm text-muted-foreground'>
        {state === 'unavailable' ? 'Dado indisponível no momento' : subtitle}
      </p>
    </div>
  );
}
