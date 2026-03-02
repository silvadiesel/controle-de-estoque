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
  useMovimentacoes
} from './_hook/useMovimentacoes';
import {
  Activity,
  Car,
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
  { label: string; icon: React.ElementType; className: string }
> = {
  criacao: {
    label: 'Criação',
    icon: PackagePlus,
    className:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10'
  },
  edicao: {
    label: 'Edição',
    icon: FilePenLine,
    className:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/10'
  },
  exclusao: {
    label: 'Exclusão',
    icon: Trash2,
    className:
      'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/10'
  }
};

const entidadeConfig: Record<
  Entidade,
  { label: string; icon: React.ElementType }
> = {
  produto: { label: 'Produto', icon: Package },
  cliente: { label: 'Cliente', icon: Users },
  fornecedor: { label: 'Fornecedor', icon: Factory },
  categoria: { label: 'Categoria', icon: Tag },
  veiculo: { label: 'Veículo', icon: Car },
  ordem_venda: { label: 'Ordem de Venda', icon: ShoppingCart },
  ordem_servico: { label: 'Ordem de Serviço', icon: Wrench },
  usuario: { label: 'Usuário', icon: UserCog }
};

// ---------------------------------------------------------------------------
// Helpers de formatação visual
// ---------------------------------------------------------------------------

function obterIniciais(nomeCompleto: string): string {
  return nomeCompleto
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function formatarDataHora(isoDate: string): { data: string; hora: string } {
  const date = new Date(isoDate);
  return {
    data: date.toLocaleDateString('pt-BR'),
    hora: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

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
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold text-foreground'>Movimentações</h2>
        <p className='text-muted-foreground'>
          Histórico de ações realizadas no sistema
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Activity className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalRegistros}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total de Registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
                <PackagePlus className='h-5 w-5 text-emerald-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalCriacoes}
                </p>
                <p className='text-sm text-muted-foreground'>Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalEdicoes}
                </p>
                <p className='text-sm text-muted-foreground'>Edições</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10'>
                <Trash2 className='h-5 w-5 text-red-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {isLoading ? '—' : estatisticas.totalExclusoes}
                </p>
                <p className='text-sm text-muted-foreground'>Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className='flex flex-col gap-3'>
        {/* Linha 1: busca + tipo de ação + entidade */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar por descrição ou autor...'
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className='pl-10 bg-input border-border'
            />
          </div>

          <div className='flex gap-2 flex-wrap'>
            <Select value={filtroTipoAcao} onValueChange={setFiltroTipoAcao}>
              <SelectTrigger className='w-37.5 bg-input border-border'>
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
              <SelectTrigger className='w-42.5 bg-input border-border'>
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
          </div>
        </div>

        {/* Linha 2: filtros de data */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          {/* Mês / Ano */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Mês/Ano:
            </span>
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
          </div>

          <div className='hidden sm:block h-5 w-px bg-border' />

          {/* Período personalizado */}
          <div className='flex items-center gap-2 flex-wrap'>
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
      </div>

      {/* Tabela */}
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-foreground'>
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='text-muted-foreground'>Ação</TableHead>
                  <TableHead className='text-muted-foreground hidden sm:table-cell'>
                    Entidade
                  </TableHead>
                  <TableHead className='text-muted-foreground'>
                    Descrição
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden md:table-cell'>
                    Autor
                  </TableHead>
                  <TableHead className='text-muted-foreground hidden lg:table-cell text-right'>
                    Data / Hora
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground'>
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : movimentacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhuma movimentação encontrada
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
                      <TableRow key={movimentacao.id} className='border-border'>
                        {/* Tipo de ação */}
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={`gap-1 font-medium whitespace-nowrap ${configAcao.className}`}>
                            <configAcao.icon className='h-3 w-3' />
                            {configAcao.label}
                          </Badge>
                        </TableCell>

                        {/* Entidade */}
                        <TableCell className='hidden sm:table-cell'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <IconeEntidade className='h-3.5 w-3.5 shrink-0' />
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
                            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0'>
                              {obterIniciais(movimentacao.autor)}
                            </div>
                            <span className='text-sm text-foreground whitespace-nowrap'>
                              {movimentacao.autor}
                            </span>
                          </div>
                        </TableCell>

                        {/* Data e hora */}
                        <TableCell className='hidden lg:table-cell text-right'>
                          <div className='flex flex-col items-end gap-0.5'>
                            <span className='text-sm text-foreground'>
                              {data}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {hora}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
