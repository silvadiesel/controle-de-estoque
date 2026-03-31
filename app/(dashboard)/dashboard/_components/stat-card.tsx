import { type LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <p className="mt-3 text-data text-foreground">{value}</p>
          )}
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-elevated text-primary">
          <Icon />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {state === 'unavailable' ? 'Dado indisponível no momento' : subtitle}
      </p>
    </div>
  );
}
