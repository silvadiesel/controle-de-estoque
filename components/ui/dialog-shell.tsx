'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { type LucideIcon } from 'lucide-react';

interface DialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  trigger?: React.ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
}

export function DialogShell({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  children,
  footer,
  trigger,
  contentClassName,
  bodyClassName
}: DialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          'max-w-[560px] gap-0 overflow-hidden rounded-xl border-border bg-card p-0 sm:max-w-[560px]',
          'data-[state=open]:duration-300 data-[state=closed]:duration-200',
          contentClassName
        )}
      >
        <DialogHeader className='border-b border-border px-6 py-5'>
          <div className='flex items-start gap-3'>
            <div className='flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-primary'>
              <Icon />
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : (
                <DialogDescription className='sr-only'>
                  {`Diálogo: ${title}`}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[68vh]'>
          <div className={cn('px-6 py-5', bodyClassName)}>{children}</div>
        </ScrollArea>

        <DialogFooter className='border-t border-border px-6 py-4'>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
