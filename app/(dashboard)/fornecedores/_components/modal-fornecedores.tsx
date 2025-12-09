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
import type { Fornecedor } from '@/db/schema';

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
      <DialogContent className='bg-card border-border max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            {isEdit ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os dados do fornecedor'
              : 'Cadastre um novo fornecedor no sistema'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Nome / Razão Social *</Label>
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
              <Label>CNPJ *</Label>
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
              <Label>Telefone</Label>
              <Input
                value={data.telefone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder='(11) 99999-9999'
                className='bg-input border-border'
              />
            </div>
            <div className='space-y-2'>
              <Label>Email</Label>
              <Input
                value={data.email || ''}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder='vendas@fornecedor.com'
                className='bg-input border-border'
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className='bg-primary hover:bg-primary/90'
            disabled={isLoading}>
            {isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
