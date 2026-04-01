import { AlertTriangle } from 'lucide-react';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';

interface ModalDeleteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
}

export function ModalDelete({
  isOpen,
  setIsOpen,
  onConfirm,
  isLoading = false,
  title = 'Confirmar exclusão',
  description = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
  trigger
}: ModalDeleteProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className='max-w-[540px] gap-0 rounded-xl border-border bg-card p-0'>
        <DialogHeader className='border-b border-border p-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-destructive/12'>
              <AlertTriangle className='size-4 text-destructive' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {title}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant='destructive'
            disabled={isLoading}>
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
