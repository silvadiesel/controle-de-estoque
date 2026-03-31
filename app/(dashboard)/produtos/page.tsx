'use client';

import { ModalDelete } from '@/components/modal-delete';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { CardPecas } from './_components/card-pecas';
import { ModalPecas } from './_components/modal-peças';
import { usePecas } from './_hook/usePecas';
import { PackageOpen, Plus, Search } from 'lucide-react';

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
    fornecedorFilter,
    setFornecedorFilter,
    getCategoryName,
    getFornecedorName,
    formatPrice,
    handleOpenChange,
    handleImageChange,
    handleRemoveImage,
    categoryItems,
    fornecedorItems,
    precoInput,
    handlePrecoChange
  } = usePecas();

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-[20px] font-semibold text-foreground'>
              Produtos
            </h1>
            <p className='text-[13px] text-muted-foreground'>
              Gerencie o estoque
            </p>
          </div>

          <ModalPecas
            editingPeca={editingPeca}
            newPeca={newPeca}
            setNewPeca={setNewPeca}
            isOpen={isAddOpen}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            handleOpenChange={handleOpenChange}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            categoryItems={categoryItems}
            fornecedorItems={fornecedorItems}
            precoInput={precoInput}
            handlePrecoChange={handlePrecoChange}
            trigger={
              <Button className='bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'>
                <Plus className='mr-2 h-4 w-4' />
                Novo Produto
              </Button>
            }
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative w-full max-w-[280px]'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar produto...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-full sm:w-[200px]'>
              <SelectValue placeholder='Categoria' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
            <SelectTrigger className='w-full sm:w-[200px]'>
              <SelectValue placeholder='Fornecedor' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os fornecedores</SelectItem>
              {fornecedores.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.name_empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex-1'>
        {isLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='h-[300px] bg-card/50 rounded-xl border border-border animate-pulse'
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Empty className='border-border bg-card'>
            <EmptyMedia variant='icon'>
              <PackageOpen />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nada encontrado</EmptyTitle>
              <EmptyDescription>
                Tente outra busca ou revise os filtros aplicados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 pb-10'>
            {filteredProducts.map((peca) => (
              <CardPecas
                key={peca.id}
                peca={peca}
                categoryName={getCategoryName(peca.categoria_id)}
                supplierName={getFornecedorName(peca.fornecedor_id)}
                formattedPrice={formatPrice(peca.preco)}
                onEdit={handleEdit}
                onDelete={(p) => {
                  setDeleteId(p.id);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ModalDelete
        isOpen={isDeleteOpen}
        setIsOpen={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => deleteId && handleDeletePeca(deleteId)}
        isLoading={isLoading}
        title='Excluir Produto'
        description='Esta ação não pode ser desfeita.'
      />
    </div>
  );
}
