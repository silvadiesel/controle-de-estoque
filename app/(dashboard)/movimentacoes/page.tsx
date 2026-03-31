'use client';

import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  type Entidade,
  type TipoAcao,
  formatarDataHora,
  obterIniciais,
  useMovimentacoes
} from './_hook/useMovimentacoes';
import {
  Activity,
  Calendar,
  Car,
  Clock,
  Factory,
  FilePenLine,
  Package,
  PackagePlus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wrench,
  X
} from 'lucide-react';

const tipoAcaoConfig: Record<
  TipoAcao,
  {
    label: string;
    icon: React.ElementType;
    dotColor: string;
    className: string;
    bar: string;
    pct: string;
  }
> = {
  criacao: {
    label: 'Criação',
    icon: PackagePlus,
    dotColor: 'bg-[#22c55e]',
    className:
      'bg-transparent text-success border-success/40 hover:bg-success/5',
    bar: 'bg-success',
    pct: 'text-success bg-success/10'
  },
  edicao: {
    label: 'Edição',
    icon: FilePenLine,
    dotColor: 'bg-[#5b7fa5]',
    className:
      'bg-transparent text-primary border-primary/40 hover:bg-primary/5',
    bar: 'bg-primary',
    pct: 'text-primary bg-primary/10'
  },
  exclusao: {
    label: 'Exclusão',
    icon: Trash2,
    dotColor: 'bg-[#ef4444]',
    className:
      'bg-transparent text-destructive border-destructive/40 hover:bg-destructive/5',
    bar: 'bg-destructive',
    pct: 'text-destructive bg-destructive/10'
  }
};

const entidadeConfig: Record<
  Entidade,
  { label: string; icon: React.ElementType; color: string }
> = {
  produto: {
    label: 'Produto',
    icon: Package,
    color: 'text-orange-300 bg-orange-500/10 border border-orange-500/20'
  },
  cliente: {
    label: 'Cliente',
    icon: Users,
    color: 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
  },
  fornecedor: {
    label: 'Fornecedor',
    icon: Factory,
    color: 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
  },
  categoria: {
    label: 'Categoria',
    icon: Tag,
    color: 'text-pink-300 bg-pink-500/10 border border-pink-500/20'
  },
  veiculo: {
    label: 'Veículo',
    icon: Car,
    color: 'text-muted-foreground bg-sky-500/10 border border-sky-500/20'
  },
  ordem_venda: {
    label: 'Ordem de Venda',
    icon: ShoppingCart,
    color: 'text-muted-foreground bg-teal-500/10 border border-teal-500/20'
  },
  ordem_servico: {
    label: 'Ordem de Serviço',
    icon: Wrench,
    color: 'text-muted-foreground bg-indigo-500/10 border border-indigo-500/20'
  },
  usuario: {
    label: 'Usuário',
    icon: UserCog,
    color: 'text-muted-foreground bg-rose-500/10 border border-rose-500/20'
  }
};

export default function Movimentacoes() {
  const {
    movimentacoesFiltradas,
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
        <h1 className='text-2xl font-bold text-[#e4e4e7]'>Movimentações</h1>
        <p className='text-sm text-[#52525b]'>
          Histórico de ações realizadas no sistema
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className='flex gap-4 w-full md:flex-row flex-col'>
        {/* Total */}
        <Card className='bg-[#18181b] border-[#27272a] w-full'>
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0'>
                <Activity className='h-5 w-5 text-primary' />
              </div>
              <div className='min-w-0'>
                <p className='text-2xl font-bold text-[#e4e4e7]'>
                  {isLoading ? '—' : estatisticas.totalRegistros}
                </p>
                <p className='text-xs text-[#52525b]'>
                  Total de Registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Criações */}
        <Card className='bg-[#18181b] border-[#27272a] w-full'>
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 shrink-0'>
                <PackagePlus className='h-5 w-5 text-success' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-[#e4e4e7]'>
                  {isLoading ? '—' : estatisticas.totalCriacoes}
                </p>
                <p className='text-xs text-[#52525b]'>Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edições */}
        <Card className='bg-[#18181b] border-[#27272a] w-full'>
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0'>
                <TrendingUp className='h-5 w-5 text-primary' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-[#e4e4e7]'>
                  {isLoading ? '—' : estatisticas.totalEdicoes}
                </p>
                <p className='text-xs text-[#52525b]'>Edições</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exclusões */}
        <Card className='bg-[#18181b] border-[#27272a] w-full'>
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0'>
                <Trash2 className='h-5 w-5 text-destructive' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-[#e4e4e7]'>
                  {isLoading ? '—' : estatisticas.totalExclusoes}
                </p>
                <p className='text-xs text-[#52525b]'>Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className='flex flex-col w-full gap-3'>
        <div className='relative flex-1 w-full'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525b]' />
          <Input
            placeholder='Buscar por descrição ou autor...'
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className='pl-10 bg-[#131316] border-[#27272a]'
          />
        </div>
        <div className='flex gap-3 flex-wrap'>
          <Select value={filtroTipoAcao} onValueChange={setFiltroTipoAcao}>
            <SelectTrigger className='w-44 bg-[#131316] border-[#27272a]'>
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
            <SelectTrigger className='w-44 bg-[#131316] border-[#27272a]'>
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
            <SelectTrigger className='w-44 bg-[#131316] border-[#27272a]'>
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
          <div className='md:flex items-center gap-2 flex-wrap hidden'>
            <span className='text-sm text-[#52525b] whitespace-nowrap'>
              Período:
            </span>
            <DatePicker
              value={filtroDataInicial}
              onChange={handleDataInicialChange}
              placeholder='Data inicial'
              className='w-44'
            />
            <span className='text-sm text-[#52525b]'>até</span>
            <DatePicker
              value={filtroDataFinal}
              onChange={handleDataFinalChange}
              placeholder='Data final'
              className='w-44'
            />
          </div>
          {temFiltroDeData && (
            <Button
              variant='ghost'
              size='sm'
              onClick={limparFiltrosDeData}
              className='gap-1.5 text-[#52525b] hover:text-[#e4e4e7]'>
              <X className='h-3.5 w-3.5' />
              Limpar datas
            </Button>
          )}
        </div>
      </div>

      {/* Card-based list */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between px-1'>
          <h2 className='text-base font-semibold text-[#e4e4e7]'>
            Histórico de Atividades
          </h2>
        </div>

        <div className='flex flex-col gap-2'>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='bg-[#18181b] border border-[#27272a] rounded-[10px] p-4 animate-pulse'>
                <div className='flex items-center gap-4'>
                  <div className='h-2.5 w-2.5 rounded-full bg-[#27272a]' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-3/4 rounded bg-[#27272a]' />
                    <div className='h-3 w-1/2 rounded bg-[#27272a]' />
                  </div>
                  <div className='h-6 w-20 rounded-full bg-[#27272a]' />
                </div>
              </div>
            ))
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className='bg-[#18181b] border border-[#27272a] rounded-[10px] p-8'>
              <div className='flex flex-col items-center gap-2 text-[#52525b]'>
                <Activity className='h-8 w-8 opacity-25' />
                <p className='text-sm'>
                  Nenhuma movimentação encontrada
                </p>
              </div>
            </div>
          ) : (
            movimentacoesPaginadas.map((movimentacao) => {
              const configAcao = tipoAcaoConfig[movimentacao.tipo_acao];
              const configEntidade =
                entidadeConfig[movimentacao.entidade];
              const IconeEntidade = configEntidade.icon;
              const { data, hora } = formatarDataHora(
                movimentacao.created_at
              );

              return (
                <div
                  key={movimentacao.id}
                  className='bg-[#18181b] border border-[#27272a] rounded-[10px] p-4 transition-colors hover:border-[#3f3f46]'>
                  <div className='flex items-start gap-3'>
                    {/* Colored dot */}
                    <div className='flex items-center pt-1.5'>
                      <span
                        className={`block h-1.5 w-1.5 rounded-full ${configAcao.dotColor}`}
                      />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          {/* Description with entity badge */}
                          <div className='flex items-center gap-2 flex-wrap'>
                            <p className='text-sm text-[#e4e4e7] leading-snug'>
                              {movimentacao.descricao}
                            </p>
                          </div>

                          {/* Entity name + badges */}
                          <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
                            <div
                              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md w-fit ${configEntidade.color}`}>
                              <IconeEntidade className='h-3 w-3 shrink-0' />
                              <span>{configEntidade.label}</span>
                            </div>
                            <Badge
                              variant='outline'
                              className={`gap-1 text-xs font-medium ${configAcao.className}`}>
                              <configAcao.icon className='h-3 w-3' />
                              {configAcao.label}
                            </Badge>
                          </div>

                          {/* Author + timestamp */}
                          <div className='flex items-center gap-3 mt-2 text-[#52525b]'>
                            <div className='flex items-center gap-1.5'>
                              <div className='flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 bg-[#27272a] text-[#71717a]'>
                                {obterIniciais(movimentacao.autor)}
                              </div>
                              <span className='text-xs'>
                                {movimentacao.autor}
                              </span>
                            </div>
                            <div className='flex items-center gap-1 text-xs'>
                              <Calendar className='h-3 w-3 shrink-0' />
                              <span>{data}</span>
                            </div>
                            <div className='flex items-center gap-1 text-xs'>
                              <Clock className='h-3 w-3 shrink-0' />
                              <span>{hora}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && movimentacoesFiltradas.length > 0 && (
          <div className='mt-2'>
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
