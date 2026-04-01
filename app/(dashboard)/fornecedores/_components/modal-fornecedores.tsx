import { formatCNPJ, formatPhone } from '@/app/utils/formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Fornecedor } from '@/db/schema';
import { Factory } from 'lucide-react';

interface ModalFornecedoresProps {
  mode: 'create' | 'edit';
  data: Partial<Fornecedor>;
  setData: (data: Partial<Fornecedor>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalFornecedores({
  mode,
  data,
  setData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalFornecedoresProps) {
  const isEdit = mode === 'edit';

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setData({ ...data, cnpj: formatted });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setData({ ...data, telefone: formatted });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='bg-card border-border rounded-xl max-w-[540px] p-0'>
        <DialogHeader className='p-6 pb-4 border-b border-border'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12'>
              <Factory className='h-4.5 w-4.5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-foreground'>
                {isEdit ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                {isEdit
                  ? 'Altere os dados do fornecedor'
                  : 'Cadastre um novo fornecedor no sistema'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='grid gap-4 p-6 pt-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Nome / Razão Social *</Label>
                <Input
                  value={data.name_empresa || ''}
                  onChange={(e) =>
                    setData({ ...data, name_empresa: e.target.value })
                  }
                  placeholder='AutoPeças Brasil'
                  className='bg-input border-border'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>CNPJ *</Label>
                <Input
                  value={data.cnpj || ''}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  placeholder='00.000.000/0001-00'
                  className='bg-input border-border'
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Telefone</Label>
                <Input
                  value={data.telefone || ''}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder='(11) 99999-9999'
                  className='bg-input border-border'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-muted-foreground uppercase text-[10px] tracking-wider font-medium'>Email</Label>
                <Input
                  value={data.email || ''}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder='vendas@fornecedor.com'
                  className='bg-input border-border'
                />
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className='px-6 py-4 border-t border-border'>
          <Button variant='outline' onClick={() => setIsOpen(false)} className='w-32'>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className='bg-primary hover:bg-primary/90 text-primary-foreground w-32'
            disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
