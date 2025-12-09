'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Fornecedor } from '@/db/schema';

import { modalFornecedores } from './_components/modal-fornecedores';
import { useFornecedores } from './_hook/useFornecedores';
import {
  Factory,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2
} from 'lucide-react';

export default function Fornecedores() {
  const {
    fornecedores,
    isLoading,
    search,
    setSearch,
    filteredFornecedores,
    isAddOpen,
    setIsAddOpen,
    editingFornecedor,
    setEditingFornecedor,
    newFornecedor,
    setNewFornecedor,
    handleAddFornecedor,
    handleUpdateFornecedor,
    handleDeleteFornecedor
  } = useFornecedores();

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Fornecedores</h2>
          <p className='text-muted-foreground'>
            Gerencie os fornecedores de peças
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className='bg-primary hover:bg-primary/90'>
              <Plus className='h-4 w-4 mr-2' />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-card border-border max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                Adicionar Fornecedor
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo fornecedor no sistema
              </DialogDescription>
            </DialogHeader>
            {modalFornecedores({
              data: newFornecedor,
              setData: setNewFornecedor
            })}
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddFornecedor}
                className='bg-primary hover:bg-primary/90'
                disabled={isLoading}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Buscar por nome, CNPJ ou contato...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-10 bg-input border-border'
        />
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='bg-card border-border'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Factory className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {fornecedores.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total de Fornecedores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-foreground'>
            Lista de Fornecedores
          </CardTitle>
          <CardDescription>
            {filteredFornecedores.length} fornecedor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>
                    Fornecedor
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden md:table-cell'>
                    Contato
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden lg:table-cell'>
                    Data de Cadastro
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right'>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-24 text-center text-muted-foreground'>
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredFornecedores.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFornecedores.map((fornecedor) => (
                    <TableRow key={fornecedor.id} className='border-border'>
                      <TableCell>
                        <div>
                          <p className='font-medium text-foreground'>
                            {fornecedor.name_empresa}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {fornecedor.cnpj}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Phone className='h-3 w-3' />
                            {fornecedor.telefone || '-'}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Mail className='h-3 w-3' />
                            {fornecedor.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        <span className='text-sm text-foreground'>
                          {fornecedor.createdAt
                            ? new Date(fornecedor.createdAt).toLocaleDateString(
                                'pt-BR'
                              )
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Dialog
                            open={editingFornecedor?.id === fornecedor.id}
                            onOpenChange={(open) =>
                              !open && setEditingFornecedor(null)
                            }>
                            <DialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() =>
                                  setEditingFornecedor(fornecedor)
                                }>
                                <Pencil className='h-4 w-4 text-muted-foreground' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='bg-card border-border max-w-2xl'>
                              <DialogHeader>
                                <DialogTitle className='text-foreground'>
                                  Editar Fornecedor
                                </DialogTitle>
                                <DialogDescription>
                                  Altere os dados do fornecedor
                                </DialogDescription>
                              </DialogHeader>
                              {editingFornecedor &&
                                modalFornecedores({
                                  data: editingFornecedor,
                                  setData: (data) =>
                                    setEditingFornecedor(data as Fornecedor)
                                })}
                              <DialogFooter>
                                <Button
                                  variant='outline'
                                  onClick={() => setEditingFornecedor(null)}>
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleUpdateFornecedor}
                                  className='bg-primary hover:bg-primary/90'
                                  disabled={isLoading}>
                                  Salvar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              handleDeleteFornecedor(fornecedor.id)
                            }>
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
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
