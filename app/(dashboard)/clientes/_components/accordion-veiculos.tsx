'use client';

import { useEffect } from 'react';

import { ModalDelete } from '@/components/modal-delete';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { Veiculo } from '@/db/schema';

import { ModalVeiculos } from './modal-veiculos';
import { Car, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

interface AccordionVeiculosProps {
  clienteId: number;
  veiculos: Veiculo[];
  isLoading: boolean;
  onExpand: () => void;
  // Veiculos CRUD handlers
  newVeiculo: Partial<Veiculo>;
  setNewVeiculo: (data: Partial<Veiculo>) => void;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  onAddSubmit: () => Promise<void>;
  editingVeiculo: Veiculo | null;
  setEditingVeiculo: (veiculo: Veiculo | null) => void;
  onEditSubmit: () => Promise<void>;
  deleteVeiculoId: number | null;
  setDeleteVeiculoId: (id: number | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  onDeleteConfirm: (id: number) => Promise<void>;
  isSaving: boolean;
  setCurrentClienteId: (id: number | null) => void;
}

export function AccordionVeiculos({
  clienteId,
  veiculos,
  isLoading,
  onExpand,
  newVeiculo,
  setNewVeiculo,
  isAddOpen,
  setIsAddOpen,
  onAddSubmit,
  editingVeiculo,
  setEditingVeiculo,
  onEditSubmit,
  deleteVeiculoId,
  setDeleteVeiculoId,
  isDeleteOpen,
  setIsDeleteOpen,
  onDeleteConfirm,
  isSaving,
  setCurrentClienteId
}: AccordionVeiculosProps) {
  // Reset newVeiculo when modal opens for this client
  useEffect(() => {
    if (isAddOpen) {
      setNewVeiculo({ placa: '', modelo: '' });
    }
  }, [isAddOpen, setNewVeiculo]);

  const handleAccordionChange = (value: string) => {
    if (value === `veiculos-${clienteId}`) {
      setCurrentClienteId(clienteId);
      onExpand();
    }
  };

  return (
    <Accordion
      type='single'
      collapsible
      onValueChange={handleAccordionChange}
      className='w-full'>
      <AccordionItem value={`veiculos-${clienteId}`} className='border-none'>
        <AccordionTrigger className='py-2 hover:no-underline'>
          <div className='flex items-center gap-2'>
            <Car className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium text-muted-foreground'>
              Veículos
            </span>
            <span className='text-xs text-muted-foreground font-medium ml-1'>
              {veiculos.length}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className='space-y-3 pt-2'>
            {/* Add Vehicle Button */}
            <ModalVeiculos
              mode='create'
              data={newVeiculo}
              setData={setNewVeiculo}
              isOpen={isAddOpen}
              setIsOpen={setIsAddOpen}
              onSubmit={onAddSubmit}
              isLoading={isSaving}
              trigger={
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-border text-muted-foreground hover:text-foreground'
                  onClick={() => setCurrentClienteId(clienteId)}>
                  <Plus className='h-3 w-3 mr-1' />
                  Adicionar Veículo
                </Button>
              }
            />

            {/* Loading */}
            {isLoading && (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                <span className='ml-2 text-sm text-muted-foreground'>
                  Carregando veículos...
                </span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && veiculos.length === 0 && (
              <div className='text-center py-4 text-sm text-muted-foreground'>
                Nenhum veículo cadastrado
              </div>
            )}

            {/* Vehicles List */}
            {!isLoading && veiculos.length > 0 && (
              <div className='space-y-2'>
                {veiculos.map((veiculo) => (
                  <div
                    key={veiculo.id}
                    className='flex items-center justify-between p-3 rounded-md bg-secondary border border-border hover:border-border-hover transition-colors'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/12'>
                        <Car className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-foreground'>
                          {veiculo.placa}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {veiculo.modelo}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      {/* Edit Button */}
                      <ModalVeiculos
                        mode='edit'
                        data={editingVeiculo || {}}
                        setData={(data) => setEditingVeiculo(data as Veiculo)}
                        isOpen={editingVeiculo?.id === veiculo.id}
                        setIsOpen={(open) => !open && setEditingVeiculo(null)}
                        onSubmit={onEditSubmit}
                        isLoading={isSaving}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            aria-label={`Editar veículo ${veiculo.placa}`}
                            onClick={() => setEditingVeiculo(veiculo)}>
                            <Pencil className='h-3 w-3 text-muted-foreground' />
                          </Button>
                        }
                      />
                      {/* Delete Button */}
                      <ModalDelete
                        isOpen={isDeleteOpen && deleteVeiculoId === veiculo.id}
                        setIsOpen={(open) => {
                          setIsDeleteOpen(open);
                          if (!open) setDeleteVeiculoId(null);
                        }}
                        onConfirm={() => onDeleteConfirm(veiculo.id)}
                        isLoading={isSaving}
                        title='Excluir Veículo'
                        description={`Tem certeza que deseja excluir o veículo "${veiculo.placa}"?`}
                        trigger={
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            aria-label={`Excluir veículo ${veiculo.placa}`}
                            onClick={() => {
                              setCurrentClienteId(clienteId);
                              setDeleteVeiculoId(veiculo.id);
                              setIsDeleteOpen(true);
                            }}>
                            <Trash2 className='h-3 w-3 text-destructive' />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
