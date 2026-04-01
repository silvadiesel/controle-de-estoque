'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogShell } from '@/components/ui/dialog-shell';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Peca } from '@/db/schema';
import { Package } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

interface ModalVincularPecaProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pecasDisponiveis: Peca[];
  onVincular: (pecaId: number) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ModalVincularPeca({
  isOpen, setIsOpen, pecasDisponiveis, onVincular, isLoading, trigger
}: ModalVincularPecaProps) {
  const [selectedPecaId, setSelectedPecaId] = useState<string>('');

  const options = pecasDisponiveis.map((p) => ({
    value: String(p.id),
    label: p.name_peca,
    sublabel: `${p.codigo} · ${formatCurrency(p.preco)}`
  }));

  const handleOpenChange = (open: boolean) => {
    if (!open) setSelectedPecaId('');
    setIsOpen(open);
  };

  const handleSubmit = async () => {
    if (!selectedPecaId) return;
    const didSave = await onVincular(Number(selectedPecaId));
    if (didSave) {
      setSelectedPecaId('');
      setIsOpen(false);
    }
  };

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      icon={Package}
      title='Vincular peça'
      description='Selecione uma peça para vincular a este fornecedor.'
      trigger={trigger}
      footer={
        <>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!selectedPecaId || isLoading}>
            {isLoading ? 'Vinculando...' : 'Vincular'}
          </Button>
        </>
      }
    >
      <SearchableSelect
        options={options}
        value={selectedPecaId}
        onValueChange={setSelectedPecaId}
        placeholder='Selecione uma peça...'
        searchPlaceholder='Buscar peça...'
        emptyText='Nenhuma peça disponível'
      />
    </DialogShell>
  );
}
