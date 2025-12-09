'use client';

import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { type Supplier, useStockStore } from '@/lib/store';

import {
  Factory,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User
} from 'lucide-react';

const emptySupplier = {
  name: '',
  cnpj: '',
  phone: '',
  email: '',
  address: '',
  contact: '',
  notes: ''
};

// SupplierForm moved outside to prevent re-creation on every render
const SupplierForm = ({
  data,
  setData
}: {
  data: typeof emptySupplier | Supplier;
  setData: (data: typeof emptySupplier | Supplier) => void;
}) => (
  <div className='grid gap-4 py-4'>
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Nome / Razão Social *</Label>
        <Input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder='AutoPeças Brasil'
          className='bg-input border-border'
        />
      </div>
      <div className='space-y-2'>
        <Label>CNPJ *</Label>
        <Input
          value={data.cnpj}
          onChange={(e) => setData({ ...data, cnpj: e.target.value })}
          placeholder='00.000.000/0001-00'
          className='bg-input border-border'
        />
      </div>
    </div>
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Telefone</Label>
        <Input
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          placeholder='(11) 3333-4444'
          className='bg-input border-border'
        />
      </div>
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder='vendas@fornecedor.com'
          className='bg-input border-border'
        />
      </div>
    </div>
    <div className='space-y-2'>
      <Label>Endereço</Label>
      <Input
        value={data.address}
        onChange={(e) => setData({ ...data, address: e.target.value })}
        placeholder='Rua, número, bairro, cidade'
        className='bg-input border-border'
      />
    </div>
    <div className='space-y-2'>
      <Label>Pessoa de Contato</Label>
      <Input
        value={data.contact}
        onChange={(e) => setData({ ...data, contact: e.target.value })}
        placeholder='Nome do vendedor/representante'
        className='bg-input border-border'
      />
    </div>
    <div className='space-y-2'>
      <Label>Observações</Label>
      <Textarea
        value={data.notes}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        placeholder='Prazo de entrega, condições de pagamento, etc.'
        className='bg-input border-border min-h-[80px]'
      />
    </div>
  </div>
);

export default function Fornecedores() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, products } =
    useStockStore();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState(emptySupplier);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.cnpj.includes(search) ||
      supplier.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSupplier = () => {
    if (newSupplier.name.trim() && newSupplier.cnpj.trim()) {
      addSupplier(newSupplier);
      setNewSupplier(emptySupplier);
      setIsAddOpen(false);
    }
  };

  const handleUpdateSupplier = () => {
    if (editingSupplier && editingSupplier.name.trim()) {
      updateSupplier(editingSupplier.id, editingSupplier);
      setEditingSupplier(null);
    }
  };

  const getProductCountBySupplier = (supplierName: string) => {
    return products.filter((p) => p.supplier === supplierName).length;
  };

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
            <SupplierForm
              data={newSupplier}
              setData={
                setNewSupplier as (
                  data: typeof emptySupplier | Supplier
                ) => void
              }
            />
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddSupplier}
                className='bg-primary hover:bg-primary/90'>
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
                  {suppliers.length}
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
            {filteredSuppliers.length} fornecedor(es) encontrado(s)
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
                    Responsável
                  </TableHead>
                  <TableHead className='text-muted-foreground text-center hidden sm:table-cell'>
                    Produtos
                  </TableHead>
                  <TableHead className='text-muted-foreground text-right'>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className='border-border'>
                    <TableCell>
                      <div>
                        <p className='font-medium text-foreground'>
                          {supplier.name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {supplier.cnpj}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Phone className='h-3 w-3' />
                          {supplier.phone || '-'}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Mail className='h-3 w-3' />
                          {supplier.email || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm text-foreground'>
                          {supplier.contact || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-center hidden sm:table-cell'>
                      <span className='inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground'>
                        {getProductCountBySupplier(supplier.name)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Dialog
                          open={editingSupplier?.id === supplier.id}
                          onOpenChange={(open) =>
                            !open && setEditingSupplier(null)
                          }>
                          <DialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setEditingSupplier(supplier)}>
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
                            {editingSupplier && (
                              <SupplierForm
                                data={editingSupplier}
                                setData={
                                  setEditingSupplier as (
                                    data: typeof emptySupplier | Supplier
                                  ) => void
                                }
                              />
                            )}
                            <DialogFooter>
                              <Button
                                variant='outline'
                                onClick={() => setEditingSupplier(null)}>
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleUpdateSupplier}
                                className='bg-primary hover:bg-primary/90'>
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => deleteSupplier(supplier.id)}>
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
