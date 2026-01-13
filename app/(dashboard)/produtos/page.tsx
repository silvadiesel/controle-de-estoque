'use client';

import { ModalDelete } from '@/components/modal-delete';
import { Button } from '@/components/ui/button';
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
    categoryFilter,
    setCategoryFilter,
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
    <div className='flex flex-1 flex-col gap-8 p-4 lg:p-8 min-h-screen'>
      {/* Header + Filtros Compactos */}
      <div className='flex flex-col gap-6'>
        {/* Título e Botão Novo */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h2 className='text-3xl font-bold text-foreground tracking-tight'>
              Produtos
            </h2>
            <p className='text-muted-foreground'>Gerencie o estoque</p>
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

        {/* Filtros Limpos (Sem Card em volta) */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative w-full sm:max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar produto...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='bg-card border-border pl-9 h-10 w-full shadow-sm'
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-full sm:w-[200px] bg-card border-border h-10 shadow-sm'>
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
      </div>

      {/* Grid de Produtos Largos */}
      <div className='flex-1'>
        {isLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='h-40 bg-card/50 rounded-xl border border-border animate-pulse'
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed border-border/60'>
            <PackageOpen className='h-16 w-16 text-muted-foreground/30 mb-4' />
            <h3 className='text-lg font-semibold text-foreground'>
              Nada encontrado
            </h3>
            <p className='text-sm text-muted-foreground'>Tente outra busca.</p>
          </div>
        ) : (
          /* GRID RESPONSIVO: 1 coluna no mobile, 2 colunas em telas grandes */
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 pb-10'>
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
