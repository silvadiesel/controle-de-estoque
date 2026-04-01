'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import type { UserWithoutPassword } from '../_hooks/useUsers';
import { Loader2, UserCog } from 'lucide-react';

interface ModalUsuariosProps {
  data: UserWithoutPassword | null;
  setData: (data: UserWithoutPassword | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalUsuarios({
  data,
  setData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalUsuariosProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {data && (
        <DialogContent className='bg-card border-border rounded-xl max-w-[540px] p-0'>
          <DialogHeader className='p-6 pb-4 border-b border-border'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/12'>
                <UserCog className='h-4 w-4 text-primary' />
              </div>
              <div>
                <DialogTitle className='text-base font-semibold text-foreground'>
                  Editar Usuário
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Altere os dados do usuário no sistema
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className='p-6'>
            <p className='text-[10px] uppercase tracking-[0.8px] text-muted-foreground font-semibold mb-3'>DADOS DO USUÁRIO</p>
            <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='user-name' className='text-xs text-muted-foreground'>Nome</Label>
              <Input
                id='user-name'
                value={data.name || ''}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder='Nome do usuário'
                className='bg-input border-border rounded-md'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='user-email' className='text-xs text-muted-foreground'>Email</Label>
              <Input
                id='user-email'
                type='email'
                value={data.email || ''}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder='email@exemplo.com'
                className='bg-input border-border rounded-md'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='user-cargo' className='text-xs text-muted-foreground'>Cargo</Label>
              <Select
                value={data.cargo}
                onValueChange={(value: 'atendente' | 'estoquista' | 'admin') =>
                  setData({ ...data, cargo: value })
                }>
                <SelectTrigger className='bg-input border-border w-full'>
                  <SelectValue placeholder='Selecione o cargo' />
                </SelectTrigger>
                <SelectContent className='bg-popover border-border'>
                  <SelectItem value='atendente'>Atendente</SelectItem>
                  <SelectItem value='estoquista'>Estoquista</SelectItem>
                  <SelectItem value='admin'>Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='user-status' className='text-xs text-muted-foreground'>Status</Label>
                <p className='text-sm text-muted-foreground'>
                  {data.status ? 'Usuário ativo' : 'Usuário inativo'}
                </p>
              </div>
              <Switch
                id='user-status'
                checked={data.status}
                onCheckedChange={(checked) =>
                  setData({ ...data, status: checked })
                }
              />
            </div>
          </div>
          </div>
          <DialogFooter className='px-6 py-4 border-t border-border'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
