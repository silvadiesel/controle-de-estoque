'use client';

import { formatCNPJ, formatCPF, formatPhone } from '@/app/utils/formatters';
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
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Cliente } from '@/db/schema';
import { Users } from 'lucide-react';

interface ModalClientesProps {
  mode: 'create' | 'edit';
  data: Partial<Cliente>;
  setData: (data: Partial<Cliente>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalClientes({
  mode,
  data,
  setData,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  trigger
}: ModalClientesProps) {
  const isEdit = mode === 'edit';

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setData({ ...data, cpf: formatted });
  };

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
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12'>
              <Users className='h-4 w-4 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-[16px] font-bold text-foreground'>
                {isEdit ? 'Editar Cliente' : 'Adicionar Cliente'}
              </DialogTitle>
              <DialogDescription className='text-[12px] text-muted-foreground'>
                {isEdit
                  ? 'Altere os dados do cliente'
                  : 'Cadastre um novo cliente no sistema'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='p-6 pt-4'>
            <FieldGroup>
              <Field orientation='responsive'>
                <FieldContent>
                  <FieldLabel htmlFor='name_cliente'>Nome do Cliente *</FieldLabel>
                  <Input
                    id='name_cliente'
                    value={data.name_cliente || ''}
                    onChange={(e) =>
                      setData({ ...data, name_cliente: e.target.value })
                    }
                    placeholder='João Silva'
                  />
                </FieldContent>
                <FieldContent>
                  <FieldLabel htmlFor='nome_empresa'>Nome da Empresa *</FieldLabel>
                  <Input
                    id='nome_empresa'
                    value={data.nome_empresa || ''}
                    onChange={(e) =>
                      setData({ ...data, nome_empresa: e.target.value })
                    }
                    placeholder='Transportadora Silva'
                  />
                </FieldContent>
              </Field>
              <Field orientation='responsive'>
                <FieldContent>
                  <FieldLabel htmlFor='cpf'>CPF (ou informe CNPJ)</FieldLabel>
                  <Input
                    id='cpf'
                    value={data.cpf || ''}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder='000.000.000-00'
                  />
                </FieldContent>
                <FieldContent>
                  <FieldLabel htmlFor='cnpj'>CNPJ (ou informe CPF)</FieldLabel>
                  <Input
                    id='cnpj'
                    value={data.cnpj || ''}
                    onChange={(e) => handleCNPJChange(e.target.value)}
                    placeholder='00.000.000/0001-00'
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor='telefone'>Telefone *</FieldLabel>
                <Input
                  id='telefone'
                  value={data.telefone || ''}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder='(11) 99999-9999'
                />
              </Field>
            </FieldGroup>
          </div>
        </ScrollArea>
        <DialogFooter className='px-6 py-4 border-t border-border'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            className='w-32 border-border text-muted-foreground'>
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
