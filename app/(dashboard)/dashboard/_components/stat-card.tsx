import { type LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  isLoading: boolean;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  isLoading
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-[10px] p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-label text-muted-foreground">
          {label}
        </span>
        <div className="h-8 w-8 rounded-[6px] flex items-center justify-center bg-[rgba(91,127,165,0.12)]">
          <Icon size={14} className="text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      ) : (
        <>
          <p className="text-data text-foreground">
            {value}
          </p>
          <p className="text-muted-sm mt-1">{subtitle}</p>
        </>
      )}
    </div>
  );
}
