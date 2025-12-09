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
      <DialogContent className='bg-card border-border max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
