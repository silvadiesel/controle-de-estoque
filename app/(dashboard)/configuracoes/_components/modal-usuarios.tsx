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
import { Loader2 } from 'lucide-react';

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
        <DialogContent className='bg-card border-border max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-foreground'>
              Editar Usuário
            </DialogTitle>
            <DialogDescription>
              Altere os dados do usuário no sistema
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='user-name'>Nome</Label>
              <Input
                id='user-name'
                value={data.name || ''}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder='Nome do usuário'
                className='bg-input border-border'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='user-email'>Email</Label>
              <Input
                id='user-email'
                type='email'
                value={data.email || ''}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder='email@exemplo.com'
                className='bg-input border-border'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='user-cargo'>Cargo</Label>
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
                <Label htmlFor='user-status'>Status</Label>
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
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className='bg-primary hover:bg-primary/90'
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
