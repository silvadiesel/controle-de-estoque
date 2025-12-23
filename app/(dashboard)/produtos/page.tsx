'use client';

import type React from 'react';

import { ModalDelete } from '@/components/modal-delete';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

import { ModalPecas } from './_components/modal-peças';
import { usePecas } from './_hook/usePecas';
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react';

export default function Products() {
  const {
    isLoading,
    search,
    setSearch,
    filteredProducts,
    isAddOpen,
    editingPeca,
    newPeca,
    setNewPeca,
    handleSubmit,
    handleEdit,
    handleDeletePeca,
    deleteId,
    setDeleteId,
    isDeleteOpen,
    setIsDeleteOpen,
    categories,
    fornecedores,
    categoryFilter,
    setCategoryFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    handleOpenChange
  } = usePecas();

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header da página */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Produtos</h2>
          <p className='text-muted-foreground'>
            Gerencie seu catálogo de peças
          </p>
        </div>

        <ModalPecas
          editingPeca={editingPeca}
          newPeca={newPeca}
          setNewPeca={setNewPeca}
          isOpen={isAddOpen}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          categories={categories}
          fornecedores={fornecedores}
          handleOpenChange={handleOpenChange}
          trigger={
            <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
              <Plus className='mr-2 h-4 w-4' />
              Novo Produto
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card className='bg-card border-border'>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome ou código...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='bg-input border-border pl-10'
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-full sm:w-48 bg-input border-border'>
                <SelectValue placeholder='Categoria' />
              </SelectTrigger>
              <SelectContent className='bg-popover border-border'>
                <SelectItem value='all'>Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className='bg-card border-border'>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>
                    Produto
                  </TableHead>
                  <TableHead className='text-muted-foreground'>
                    Código
                  </TableHead>
                  <TableHead className='text-muted-foreground'>
                    Categoria
                  </TableHead>
                  <TableHead className='text-muted-foreground text-center'>
                    Qtd.
                  </TableHead>
                  <TableHead className='text-muted-foreground'>Preço</TableHead>
                  <TableHead className='text-muted-foreground'>
                    Fornecedor
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right'>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <Package className='h-8 w-8 animate-pulse' />
                        <p>Carregando...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <Package className='h-8 w-8' />
                        <p>Nenhum produto encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((peca) => (
                    <TableRow
                      key={peca.id}
                      className='border-border hover:bg-secondary/50'>
                      <TableCell className='font-medium text-foreground'>
                        {peca.name_peca}
                      </TableCell>
                      <TableCell className='text-muted-foreground font-mono text-sm'>
                        {peca.codigo}
                      </TableCell>
                      <TableCell>
                        <span className='rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground'>
                          {getCategoryName(peca.categoria_id)}
                        </span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='font-bold text-chart-2'>
                          {peca.quantidade}
                        </span>
                      </TableCell>
                      <TableCell className='text-foreground'>
                        {formatPrice(peca.preco)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {getFornecedorName(peca.fornecedor_id)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(peca)}
                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                            disabled={isLoading}>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <ModalDelete
                            isOpen={isDeleteOpen && deleteId === peca.id}
                            setIsOpen={(open) => {
                              setIsDeleteOpen(open);
                              if (!open) setDeleteId(null);
                            }}
                            onConfirm={() => handleDeletePeca(peca.id)}
                            isLoading={isLoading}
                            title='Excluir Produto'
                            description={`Tem certeza que deseja excluir o produto "${peca.name_peca}"? Esta ação não pode ser desfeita.`}
                            trigger={
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  setDeleteId(peca.id);
                                  setIsDeleteOpen(true);
                                }}
                                className='h-8 w-8 text-muted-foreground hover:text-destructive'
                                disabled={isLoading}>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            }
                          />
                        </div>
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
