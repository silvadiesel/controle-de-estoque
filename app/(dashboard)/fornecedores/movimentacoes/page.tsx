'use client';

import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useStockStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import {
  ArrowUpDown,
  Plus,
  Search,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export default function Movimentacoes() {
  const { products, movements, addMovement } = useStockStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entrada' as 'entrada' | 'saida',
    quantity: 1,
    reason: '',
    user: 'João Silva'
  });

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.productName.toLowerCase().includes(search.toLowerCase()) ||
      movement.reason.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === formData.productId);
    if (!product) return;

    addMovement({
      productId: formData.productId,
      productName: product.name,
      type: formData.type,
      quantity: formData.quantity,
      reason: formData.reason,
      user: formData.user
    });

    setFormData({
      productId: '',
      type: 'entrada',
      quantity: 1,
      reason: '',
      user: 'João Silva'
    });
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <div className='h-7 w-1 rounded-full bg-primary' />
            <h1 className='text-2xl font-bold text-foreground'>Movimentações</h1>
          </div>
          <p className='pl-3.5 text-sm text-muted-foreground'>
            Registre entradas e saídas do estoque
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
              <Plus className='mr-2 h-4 w-4' />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-card border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                Registrar Movimentação
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'entrada' | 'saida') =>
                      setFormData({ ...formData, type: value })
                    }>
                    <SelectTrigger className='bg-input border-border'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-popover border-border'>
                      <SelectItem value='entrada'>
                        <div className='flex items-center gap-2'>
                          <TrendingUp className='h-4 w-4 text-chart-2' />
                          Entrada
                        </div>
                      </SelectItem>
                      <SelectItem value='saida'>
                        <div className='flex items-center gap-2'>
                          <TrendingDown className='h-4 w-4 text-primary' />
                          Saída
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Quantidade</Label>
                  <Input
                    type='number'
                    min='1'
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number.parseInt(e.target.value) || 1
                      })
                    }
                    className='bg-input border-border'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Produto</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }>
                  <SelectTrigger className='bg-input border-border'>
                    <SelectValue placeholder='Selecione o produto' />
                  </SelectTrigger>
                  <SelectContent className='bg-popover border-border max-h-60'>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className='flex items-center justify-between gap-4'>
                          <span>{product.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            (Estoque: {product.quantity})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Motivo / Observação</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className='bg-input border-border min-h-20'
                  placeholder='Ex: Manutenção preventiva - Caminhão ABC-1234'
                />
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className={cn(
                    formData.type === 'entrada'
                      ? 'bg-chart-2 hover:bg-chart-2/90'
                      : 'bg-primary hover:bg-primary/90',
                    'text-primary-foreground'
                  )}
                  disabled={!formData.productId}>
                  {formData.type === 'entrada'
                    ? 'Registrar Entrada'
                    : 'Registrar Saída'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card
          className='bg-chart-2/10 border-chart-2/30 cursor-pointer hover:bg-chart-2/20 transition-colors'
          onClick={() => {
            setFormData({ ...formData, type: 'entrada' });
            setIsOpen(true);
          }}>
          <CardContent className='flex items-center gap-4 p-6'>
            <div className='h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center'>
              <TrendingUp className='h-6 w-6 text-chart-2' />
            </div>
            <div>
              <p className='text-lg font-semibold text-foreground'>
                Entrada Rápida
              </p>
              <p className='text-sm text-muted-foreground'>
                Adicionar itens ao estoque
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className='bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors'
          onClick={() => {
            setFormData({ ...formData, type: 'saida' });
            setIsOpen(true);
          }}>
          <CardContent className='flex items-center gap-4 p-6'>
            <div className='h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center'>
              <TrendingDown className='h-6 w-6 text-primary' />
            </div>
            <div>
              <p className='text-lg font-semibold text-foreground'>
                Saída Rápida
              </p>
              <p className='text-sm text-muted-foreground'>
                Retirar itens do estoque
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='bg-card border-border'>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar movimentações...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='bg-input border-border pl-10'
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-input border-border'>
                <SelectValue placeholder='Tipo' />
              </SelectTrigger>
              <SelectContent className='bg-popover border-border'>
                <SelectItem value='all'>Todos os tipos</SelectItem>
                <SelectItem value='entrada'>Entradas</SelectItem>
                <SelectItem value='saida'>Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card className='bg-card border-border'>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>Tipo</TableHead>
                  <TableHead className='text-muted-foreground'>
                    Produto
                  </TableHead>
                  <TableHead className='text-muted-foreground text-center'>
                    Qtd.
                  </TableHead>
                  <TableHead className='text-muted-foreground'>
                    Motivo
                  </TableHead>
                  <TableHead className='text-muted-foreground'>
                    Usuário
                  </TableHead>
                  <TableHead className='text-muted-foreground'>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='h-32 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <ArrowUpDown className='h-8 w-8' />
                        <p>Nenhuma movimentação encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow
                      key={movement.id}
                      className='border-border hover:bg-secondary/50'>
                      <TableCell>
                        <div
                          className={cn(
                            'flex items-center gap-2 rounded-full px-3 py-1 w-fit text-xs font-medium',
                            movement.type === 'entrada'
                              ? 'bg-chart-2/20 text-chart-2'
                              : 'bg-primary/20 text-primary'
                          )}>
                          {movement.type === 'entrada' ? (
                            <TrendingUp className='h-3 w-3' />
                          ) : (
                            <TrendingDown className='h-3 w-3' />
                          )}
                          {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </div>
                      </TableCell>
                      <TableCell className='font-medium text-foreground'>
                        {movement.productName}
                      </TableCell>
                      <TableCell className='text-center'>
                        <span
                          className={cn(
                            'font-bold',
                            movement.type === 'entrada'
                              ? 'text-chart-2'
                              : 'text-primary'
                          )}>
                          {movement.type === 'entrada' ? '+' : '-'}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-xs truncate'>
                        {movement.reason}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {movement.user}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {formatDate(movement.date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
