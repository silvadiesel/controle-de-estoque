'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { CheckCircle2, Clock3, XCircle } from 'lucide-react';

type OrdemStatus = 'ativa' | 'fechada' | 'cancelada';

const statusConfig = {
  ativa: {
    label: 'Ativa',
    icon: Clock3,
    className: 'border-primary/20 bg-primary/10 text-primary'
  },
  fechada: {
    label: 'Fechada',
    icon: CheckCircle2,
    className: 'border-success/20 bg-success/10 text-success'
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'border-destructive/20 bg-destructive/10 text-destructive'
  }
} satisfies Record<
  OrdemStatus,
  { label: string; icon: typeof Clock3; className: string }
>;

interface OrdemStatusBadgeProps {
  status: OrdemStatus;
  className?: string;
}

export function OrdemStatusBadge({ status, className }: OrdemStatusBadgeProps) {
  const { label, icon: Icon, className: toneClassName } = statusConfig[status];

  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1.5 px-2.5 py-1 text-[10px]  rounded-sm uppercase tracking-[0.08em]',
        toneClassName,
        className
      )}>
      <Icon />
      {label}
    </Badge>
  );
}
