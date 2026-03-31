'use client';

import { PaginationControls } from '@/components/pagination-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

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
    className: string;
    bar: string;
    pct: string;
  }
> = {
  criacao: {
    label: 'Criação',
    icon: PackagePlus,
    className:
      'bg-transparent text-success border-success/40 hover:bg-success/5',
    bar: 'bg-success',
    pct: 'text-success bg-success/10'
  },
  edicao: {
    label: 'Edição',
    icon: FilePenLine,
    className:
      'bg-transparent text-primary border-primary/40 hover:bg-primary/5',
    bar: 'bg-primary',
    pct: 'text-primary bg-primary/10'
  },
  exclusao: {
    label: 'Exclusão',
    icon: Trash2,
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
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h1 className='text-2xl font-bold text-foreground'>Movimentações</h1>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>
          Histórico de ações realizadas no sistema
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className='flex gap-4 w-full md:flex-row flex-col'>
        {/* Total */}
        <Card className='bg-card w-full border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-primary/50' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0'>
                <Activity className='h-5 w-5 text-primary' />
              </div>
              <div className='min-w-0'>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalRegistros}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Total de Registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Criações */}
        <Card className='bg-card w-full border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-success/60' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 shrink-0'>
                <PackagePlus className='h-5 w-5 text-success' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalCriacoes}
                </p>
                <p className='text-xs text-muted-foreground'>Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edições */}
        <Card className='bg-card w-full border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-primary/60' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0'>
                <TrendingUp className='h-5 w-5 text-primary' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalEdicoes}
                </p>
                <p className='text-xs text-muted-foreground'>Edições</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exclusões */}
        <Card className='bg-card w-full border-border relative overflow-hidden'>
          <div className='absolute inset-x-0 top-0 h-0.5 bg-destructive/60' />
          <CardContent className='px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0'>
                <Trash2 className='h-5 w-5 text-destructive' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalExclusoes}
                </p>
                <p className='text-xs text-muted-foreground'>Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className='flex flex-col w-full gap-3'>
        <div className='relative flex-1 w-full'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Buscar por descrição ou autor...'
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className='pl-10 bg-input border-border'
          />
        </div>
        <div className='flex gap-3 flex-wrap'>
          <Select value={filtroTipoAcao} onValueChange={setFiltroTipoAcao}>
            <SelectTrigger className='w-44 bg-input border-border'>
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
            <SelectTrigger className='w-44 bg-input border-border'>
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
            <SelectTrigger className='w-44 bg-input border-border'>
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
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Período:
            </span>
            <DatePicker
              value={filtroDataInicial}
              onChange={handleDataInicialChange}
              placeholder='Data inicial'
              className='w-44'
            />
            <span className='text-sm text-muted-foreground'>até</span>
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
              className='gap-1.5 text-muted-foreground hover:text-foreground'>
              <X className='h-3.5 w-3.5' />
              Limpar datas
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base text-foreground'>
              Histórico de Atividades
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent bg-muted/40'>
                  <TableHead className='text-muted-foreground font-medium text-xs uppercase tracking-wide pl-4 w-[110px]'>
                    Ação
                  </TableHead>
                  <TableHead className='text-muted-foreground font-medium text-xs uppercase tracking-wide hidden sm:table-cell w-[150px]'>
                    Entidade
                  </TableHead>
                  <TableHead className='text-muted-foreground font-medium text-xs uppercase tracking-wide'>
                    Descrição
                  </TableHead>
                  <TableHead className='text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell w-[160px]'>
                    Autor
                  </TableHead>
                  <TableHead className='text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell text-right pr-4 w-[120px]'>
                    Data / Hora
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className='border-border border-l-muted'>
                      <TableCell className='pl-4'>
                        <div className='h-6 w-20 rounded-full bg-muted animate-pulse' />
                      </TableCell>
                      <TableCell className='hidden sm:table-cell'>
                        <div className='h-6 w-28 rounded-md bg-muted animate-pulse' />
                      </TableCell>
                      <TableCell>
                        <div className='h-4 w-full max-w-xs rounded bg-muted animate-pulse' />
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='flex items-center gap-2'>
                          <div className='h-7 w-7 rounded-full bg-muted animate-pulse shrink-0' />
                          <div className='h-4 w-24 rounded bg-muted animate-pulse' />
                        </div>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        <div className='flex flex-col items-end gap-1.5'>
                          <div className='h-4 w-20 rounded bg-muted animate-pulse' />
                          <div className='h-3 w-12 rounded bg-muted animate-pulse' />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : movimentacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-32 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <Activity className='h-8 w-8 opacity-25' />
                        <p className='text-sm'>
                          Nenhuma movimentação encontrada
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
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
                      <TableRow
                        key={movimentacao.id}
                        className={`border-border md:h-14 h-16 transition-colors hover:bg-muted/40 group`}>
                        {/* Tipo de ação */}
                        <TableCell className='pl-3'>
                          <Badge
                            variant='outline'
                            className={`gap-1.5 font-medium whitespace-nowrap text-xs ${configAcao.className}`}>
                            <configAcao.icon className='h-3 w-3' />
                            {configAcao.label}
                          </Badge>
                        </TableCell>

                        {/* Entidade */}
                        <TableCell className='hidden sm:table-cell'>
                          <div
                            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit ${configEntidade.color}`}>
                            <IconeEntidade className='h-3 w-3 shrink-0' />
                            <span>{configEntidade.label}</span>
                          </div>
                        </TableCell>

                        {/* Descrição */}
                        <TableCell>
                          <p className='text-sm text-foreground leading-snug max-w-90'>
                            {movimentacao.descricao}
                          </p>
                        </TableCell>

                        {/* Autor */}
                        <TableCell className='hidden md:table-cell'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 bg-muted text-white'>
                              {obterIniciais(movimentacao.autor)}
                            </div>
                            <span className='text-sm text-foreground whitespace-nowrap'>
                              {movimentacao.autor}
                            </span>
                          </div>
                        </TableCell>

                        {/* Data e hora */}
                        <TableCell className='hidden lg:table-cell text-right pr-4'>
                          <div className='flex flex-col items-end gap-1'>
                            <div className='flex items-center gap-1 text-xs text-foreground'>
                              <Calendar className='h-3 w-3 text-muted-foreground shrink-0' />
                              <span>{data}</span>
                            </div>
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <Clock className='h-3 w-3 shrink-0' />
                              <span>{hora}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className='border-t border-border px-4'>
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
        </CardContent>
      </Card>
    </div>
  );
}
