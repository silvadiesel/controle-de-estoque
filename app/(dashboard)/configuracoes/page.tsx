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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { type Category, useStockStore } from '@/lib/store';

import {
  Bell,
  Building2,
  Database,
  Download,
  Palette,
  Pencil,
  Plus,
  Shield,
  Tags,
  Trash2
} from 'lucide-react';

export default function Configuracoes() {
  const {
    products,
    movements,
    categories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useStockStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const handleExportData = () => {
    const data = {
      products,
      movements,
      categories,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      setIsAddOpen(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description
      });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const productsUsingCategory = products.filter(
      (p) => p.category === categories.find((c) => c.id === id)?.name
    );
    if (productsUsingCategory.length > 0) {
      alert(
        `Não é possível excluir esta categoria. ${productsUsingCategory.length} produto(s) estão usando ela.`
      );
      return;
    }
    deleteCategory(id);
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-8'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-foreground'>Configurações</h2>
        <p className='text-muted-foreground'>
          Personalize o sistema conforme sua necessidade
        </p>
      </div>

      <div className='grid gap-6'>
        <Card className='bg-card border-border'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <Tags className='h-5 w-5 text-primary' />
                  Categorias de Produtos
                </CardTitle>
                <CardDescription>
                  Gerencie as categorias disponíveis para os produtos
                </CardDescription>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className='bg-primary hover:bg-primary/90'>
                    <Plus className='h-4 w-4 mr-2' />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className='bg-card border-border'>
                  <DialogHeader>
                    <DialogTitle className='text-foreground'>
                      Adicionar Categoria
                    </DialogTitle>
                    <DialogDescription>
                      Crie uma nova categoria para organizar seus produtos
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='cat-name'>Nome da Categoria</Label>
                      <Input
                        id='cat-name'
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value
                          })
                        }
                        placeholder='Ex: Pneus'
                        className='bg-input border-border'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='cat-desc'>Descrição</Label>
                      <Input
                        id='cat-desc'
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value
                          })
                        }
                        placeholder='Ex: Pneus e acessórios'
                        className='bg-input border-border'
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setIsAddOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddCategory}
                      className='bg-primary hover:bg-primary/90'>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-lg border border-border overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='border-border hover:bg-transparent'>
                    <TableHead className='text-muted-foreground'>
                      Nome
                    </TableHead>
                    <TableHead className='text-muted-foreground'>
                      Descrição
                    </TableHead>
                    <TableHead className='text-muted-foreground text-center'>
                      Produtos
                    </TableHead>
                    <TableHead className='text-muted-foreground text-right'>
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const productCount = products.filter(
                      (p) => p.category === category.name
                    ).length;
                    return (
                      <TableRow key={category.id} className='border-border'>
                        <TableCell className='font-medium text-foreground'>
                          {category.name}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {category.description}
                        </TableCell>
                        <TableCell className='text-center'>
                          <span className='inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground'>
                            {productCount}
                          </span>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Dialog
                              open={editingCategory?.id === category.id}
                              onOpenChange={(open) =>
                                !open && setEditingCategory(null)
                              }>
                              <DialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => setEditingCategory(category)}>
                                  <Pencil className='h-4 w-4 text-muted-foreground' />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='bg-card border-border'>
                                <DialogHeader>
                                  <DialogTitle className='text-foreground'>
                                    Editar Categoria
                                  </DialogTitle>
                                  <DialogDescription>
                                    Altere os dados da categoria
                                  </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4 py-4'>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-cat-name'>
                                      Nome da Categoria
                                    </Label>
                                    <Input
                                      id='edit-cat-name'
                                      value={editingCategory?.name || ''}
                                      onChange={(e) =>
                                        setEditingCategory((prev) =>
                                          prev
                                            ? { ...prev, name: e.target.value }
                                            : null
                                        )
                                      }
                                      className='bg-input border-border'
                                    />
                                  </div>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-cat-desc'>
                                      Descrição
                                    </Label>
                                    <Input
                                      id='edit-cat-desc'
                                      value={editingCategory?.description || ''}
                                      onChange={(e) =>
                                        setEditingCategory((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                description: e.target.value
                                              }
                                            : null
                                        )
                                      }
                                      className='bg-input border-border'
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant='outline'
                                    onClick={() => setEditingCategory(null)}>
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleUpdateCategory}
                                    className='bg-primary hover:bg-primary/90'>
                                    Salvar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Building2 className='h-5 w-5 text-primary' />
              Informações da Empresa
            </CardTitle>
            <CardDescription>Configure os dados da sua oficina</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='company'>Nome da Empresa</Label>
                <Input
                  id='company'
                  defaultValue='Oficina de Caminhões Silva'
                  className='bg-input border-border'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='cnpj'>CNPJ</Label>
                <Input
                  id='cnpj'
                  defaultValue='12.345.678/0001-90'
                  className='bg-input border-border'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Endereço</Label>
              <Input
                id='address'
                defaultValue='Av. das Indústrias, 1234 - Distrito Industrial'
                className='bg-input border-border'
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Bell className='h-5 w-5 text-primary' />
              Notificações
            </CardTitle>
            <CardDescription>
              Gerencie alertas e avisos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>
                  Alerta de estoque baixo
                </p>
                <p className='text-sm text-muted-foreground'>
                  Receber notificação quando um produto atingir o nível mínimo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className='bg-border' />
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>
                  Alerta de estoque zerado
                </p>
                <p className='text-sm text-muted-foreground'>
                  Notificação urgente quando o estoque zerar
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className='bg-border' />
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Relatório semanal</p>
                <p className='text-sm text-muted-foreground'>
                  Receber resumo das movimentações toda semana
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Database className='h-5 w-5 text-primary' />
              Gerenciamento de Dados
            </CardTitle>
            <CardDescription>Backup e exportação de dados</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Exportar dados</p>
                <p className='text-sm text-muted-foreground'>
                  Baixar backup completo em formato JSON
                </p>
              </div>
              <Button
                variant='outline'
                className='border-border bg-transparent'
                onClick={handleExportData}>
                <Download className='h-4 w-4 mr-2' />
                Exportar
              </Button>
            </div>
            <Separator className='bg-border' />
            <div className='rounded-lg bg-secondary/50 p-4'>
              <div className='flex items-center gap-3'>
                <Shield className='h-5 w-5 text-primary' />
                <div>
                  <p className='font-medium text-foreground'>
                    Dados salvos localmente
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Seus dados são armazenados no navegador. {products.length}{' '}
                    produtos e {movements.length} movimentações salvas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Palette className='h-5 w-5 text-primary' />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Tema escuro</p>
                <p className='text-sm text-muted-foreground'>
                  Visual otimizado para ambientes com pouca luz
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator className='bg-border' />
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Modo compacto</p>
                <p className='text-sm text-muted-foreground'>
                  Reduzir espaçamentos para ver mais informações
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
