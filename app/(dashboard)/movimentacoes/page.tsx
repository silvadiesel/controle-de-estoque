'use client';

import { Activity, FilePenLine, PackagePlus, Search, Trash2, X } from 'lucide-react';

import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';

import { useMovimentacoes } from './_hook/useMovimentacoes';
import { MovimentacaoTimeline } from './_components/movimentacao-timeline';

export default function Movimentacoes() {
  const {
    movimentacoesPaginadas,
    estatisticas,
    opcoesMessAno,
    isLoading,
    temFiltroDeData,
    termoBusca,
    setTermoBusca,
    filtroTipoAcao,
    setFiltroTipoAcao,
    filtroEntidade,
    setFiltroEntidade,
    filtroMesAno,
    filtroDataInicial,
    filtroDataFinal,
    handleMesAnoChange,
    handleDataInicialChange,
    handleDataFinalChange,
    limparFiltrosDeData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    pageItems,
    isFirstPage,
    isLastPage,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = useMovimentacoes();

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='text-[22px] font-bold text-foreground'>Movimentações</h1>
        <p className='text-sm text-muted-foreground'>
          Histórico de ações realizadas no sistema
        </p>
      </div>

      {/* StatCards — padrão Dashboard */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Total'
          value={estatisticas.totalRegistros}
          subtitle='registros no período'
          icon={Activity}
          isLoading={isLoading}
        />
        <StatCard
          label='Criações'
          value={estatisticas.totalCriacoes}
          subtitle='novos registros'
          icon={PackagePlus}
          isLoading={isLoading}
        />
        <StatCard
          label='Edições'
          value={estatisticas.totalEdicoes}
          subtitle='atualizações'
          icon={FilePenLine}
          isLoading={isLoading}
        />
        <StatCard
          label='Exclusões'
          value={estatisticas.totalExclusoes}
          subtitle='remoções'
          icon={Trash2}
          isLoading={isLoading}
        />
      </div>

      {/* Filtros — linha única, busca ≥ 1/3 */}
      <div className='flex items-center gap-2 flex-wrap'>
        <div className='relative flex-1 min-w-[33%]'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Buscar por descrição ou autor...'
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className='pl-9 bg-input border-border'
          />
        </div>
        <Select value={filtroTipoAcao} onValueChange={setFiltroTipoAcao}>
          <SelectTrigger className='w-40 bg-input border-border'>
            <SelectValue placeholder='Tipo de ação' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todas'>Todas as ações</SelectItem>
            <SelectItem value='criacao'>Criação</SelectItem>
            <SelectItem value='edicao'>Edição</SelectItem>
            <SelectItem value='exclusao'>Exclusão</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroEntidade} onValueChange={setFiltroEntidade}>
          <SelectTrigger className='w-40 bg-input border-border'>
            <SelectValue placeholder='Entidade' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todas'>Todas as entidades</SelectItem>
            <SelectItem value='produto'>Produto</SelectItem>
            <SelectItem value='cliente'>Cliente</SelectItem>
            <SelectItem value='fornecedor'>Fornecedor</SelectItem>
            <SelectItem value='categoria'>Categoria</SelectItem>
            <SelectItem value='veiculo'>Veículo</SelectItem>
            <SelectItem value='ordem_venda'>Ordem de Venda</SelectItem>
            <SelectItem value='ordem_servico'>Ordem de Serviço</SelectItem>
            <SelectItem value='usuario'>Usuário</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroMesAno} onValueChange={handleMesAnoChange}>
          <SelectTrigger className='w-40 bg-input border-border'>
            <SelectValue placeholder='Filtrar por mês' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos os meses</SelectItem>
            {opcoesMessAno.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='hidden md:flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            Período:
          </span>
          <DatePicker
            value={filtroDataInicial}
            onChange={handleDataInicialChange}
            placeholder='Data inicial'
            className='w-40'
          />
          <span className='text-sm text-muted-foreground'>até</span>
          <DatePicker
            value={filtroDataFinal}
            onChange={handleDataFinalChange}
            placeholder='Data final'
            className='w-40'
          />
        </div>
        {temFiltroDeData && (
          <Button
            variant='ghost'
            size='sm'
            onClick={limparFiltrosDeData}
            className='gap-1.5 text-muted-foreground hover:text-foreground'>
            <X className='h-3.5 w-3.5' />
            Limpar datas
          </Button>
        )}
      </div>

      {/* Card da timeline */}
      <div className='rounded-xl border border-border bg-card overflow-hidden'>
        {/* Header do card */}
        <div className='px-5 py-4 border-b border-border flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-base font-semibold text-foreground'>
              Histórico de Atividades
            </h2>
            <p className='text-sm text-muted-foreground mt-0.5'>
              {isLoading
                ? 'Carregando...'
                : `${totalItems} registros · página ${currentPage} de ${totalPages}`}
            </p>
          </div>
          <div className='size-8 rounded-md flex items-center justify-center border border-border bg-elevated text-primary'>
            <Activity size={16} />
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className='flex flex-col'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center px-5 py-3 border-b border-border last:border-0'>
                <div className='w-6 flex justify-center mr-3'>
                  <div className='h-2 w-2 rounded-full bg-secondary animate-pulse' />
                </div>
                <div className='flex flex-1 gap-4'>
                  <div className='flex-[2] h-4 bg-secondary rounded animate-pulse' />
                  <div className='flex-1 h-4 bg-secondary rounded animate-pulse' />
                  <div className='flex-1 h-4 bg-secondary rounded animate-pulse' />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MovimentacaoTimeline movimentacoes={movimentacoesPaginadas} />
        )}

        {/* Paginação */}
        {!isLoading && totalPages > 1 && (
          <div className='border-t border-border px-5 py-3'>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              pageItems={pageItems}
              isFirstPage={isFirstPage}
              isLastPage={isLastPage}
              onPageChange={goToPage}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              itemLabel='movimentações'
            />
          </div>
        )}
      </div>
    </div>
  );
}
