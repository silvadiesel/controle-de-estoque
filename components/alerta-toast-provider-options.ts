import { cn } from '@/lib/utils';

export function createAlertaToastOptions(toastClassName?: string) {
  return {
    description: 'Acesse a página de Alertas para ver os detalhes.',
    duration: 6000,
    unstyled: true,
    classNames: {
      toast: cn(
        'grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg',
        toastClassName
      ),
      icon: 'mt-0.5',
      content: 'flex min-w-0 flex-col gap-1',
      title: 'text-sm font-medium',
      description: 'text-muted-foreground text-sm',
      actionButton:
        'col-start-2 row-start-2 inline-flex w-fit items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90',
      closeButton:
        'rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
    },
    action: {
      label: 'Ver alertas',
      onClick: () => {
        window.location.href = '/alertas';
      }
    }
  };
}
