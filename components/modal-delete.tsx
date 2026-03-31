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
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='bg-[#18181b] border-[#27272a] rounded-[12px] max-w-[540px]'>
        <DialogHeader className='border-b border-[#27272a] pb-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-[8px] bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='h-4 w-4 text-destructive' />
            </div>
            <div>
              <DialogTitle className='text-[16px] font-bold text-foreground'>
                {title}
              </DialogTitle>
              <DialogDescription className='text-[12px] text-muted-foreground'>
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className='border-t border-[#27272a] pt-4'>
          <Button
            variant='ghost'
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
