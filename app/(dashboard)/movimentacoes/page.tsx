'use client';

import { useState } from 'react';

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
import { usePagination } from '@/hooks/usePagination';

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

type TipoAcao = 'criacao' | 'edicao' | 'exclusao';
type Entidade =
  | 'produto'
  | 'cliente'
  | 'fornecedor'
  | 'categoria'
  | 'veiculo'
  | 'ordem_venda'
  | 'ordem_servico'
  | 'usuario';

interface Movimentacao {
  id: number;
  tipo_acao: TipoAcao;
  entidade: Entidade;
  entidade_id: string;
  descricao: string;
  autor: string;
  created_at: string;
}

const MOCK_MOVIMENTACOES: Movimentacao[] = [
  {
    id: 1,
    tipo_acao: 'criacao',
    entidade: 'produto',
    entidade_id: 'prd-001',
    descricao:
      'Produto "Filtro de Óleo Mann HU 718/5" foi cadastrado no sistema',
    autor: 'Larissa Souza',
    created_at: '2026-03-02T10:23:00Z'
  },
  {
    id: 2,
    tipo_acao: 'edicao',
    entidade: 'cliente',
    entidade_id: 'cli-012',
    descricao:
      'Dados do cliente "João Carlos Pereira" foram atualizados (telefone e endereço)',
    autor: 'Marcos Alves',
    created_at: '2026-03-02T09:55:00Z'
  },
  {
    id: 3,
    tipo_acao: 'exclusao',
    entidade: 'fornecedor',
    entidade_id: 'for-007',
    descricao: 'Fornecedor "Auto Peças Brasil LTDA" foi removido do sistema',
    autor: 'Larissa Souza',
    created_at: '2026-03-02T09:10:00Z'
  },
  {
    id: 4,
    tipo_acao: 'criacao',
    entidade: 'ordem_servico',
    entidade_id: 'os-0234',
    descricao:
      'Ordem de Serviço #234 criada para veículo Toyota Corolla (ABC-1234)',
    autor: 'Felipe Martins',
    created_at: '2026-03-01T17:42:00Z'
  },
  {
    id: 5,
    tipo_acao: 'edicao',
    entidade: 'produto',
    entidade_id: 'prd-032',
    descricao:
      'Estoque do produto "Pastilha de Freio Bosch" atualizado de 15 para 28 unidades',
    autor: 'Marcos Alves',
    created_at: '2026-03-01T16:30:00Z'
  },
  {
    id: 6,
    tipo_acao: 'criacao',
    entidade: 'cliente',
    entidade_id: 'cli-089',
    descricao:
      'Novo cliente "Maria Fernanda Lima" cadastrado com veículo Honda Civic',
    autor: 'Felipe Martins',
    created_at: '2026-03-01T14:15:00Z'
  },
  {
    id: 7,
    tipo_acao: 'edicao',
    entidade: 'ordem_venda',
    entidade_id: 'ov-0198',
    descricao: 'Ordem de Venda #198 teve status alterado para "Concluída"',
    autor: 'Larissa Souza',
    created_at: '2026-03-01T11:50:00Z'
  },
  {
    id: 8,
    tipo_acao: 'criacao',
    entidade: 'veiculo',
    entidade_id: 'vei-045',
    descricao:
      'Veículo Fiat Strada (DEF-5678) vinculado ao cliente "Roberto Santos"',
    autor: 'Marcos Alves',
    created_at: '2026-03-01T10:05:00Z'
  },
  {
    id: 9,
    tipo_acao: 'exclusao',
    entidade: 'produto',
    entidade_id: 'prd-018',
    descricao:
      'Produto "Correia Dentada Gates" removido por duplicidade no cadastro',
    autor: 'Larissa Souza',
    created_at: '2026-02-28T15:33:00Z'
  },
  {
    id: 10,
    tipo_acao: 'criacao',
    entidade: 'categoria',
    entidade_id: 'cat-011',
    descricao: 'Nova categoria "Suspensão e Direção" adicionada ao sistema',
    autor: 'Felipe Martins',
    created_at: '2026-02-28T14:20:00Z'
  },
  {
    id: 11,
    tipo_acao: 'edicao',
    entidade: 'usuario',
    entidade_id: 'usr-003',
    descricao:
      'Permissões do usuário "Carlos Eduardo" atualizadas para nível Gerente',
    autor: 'Larissa Souza',
    created_at: '2026-02-28T11:00:00Z'
  },
  {
    id: 12,
    tipo_acao: 'criacao',
    entidade: 'fornecedor',
    entidade_id: 'for-021',
    descricao:
      'Fornecedor "Distribuidora Pneus Sul" cadastrado com CNPJ 12.456.789/0001-55',
    autor: 'Marcos Alves',
    created_at: '2026-02-28T09:45:00Z'
  },
  {
    id: 13,
    tipo_acao: 'edicao',
    entidade: 'veiculo',
    entidade_id: 'vei-031',
    descricao:
      'Quilometragem do veículo VW Gol (GHI-9012) atualizada para 87.500 km',
    autor: 'Felipe Martins',
    created_at: '2026-02-27T16:10:00Z'
  },
  {
    id: 14,
    tipo_acao: 'exclusao',
    entidade: 'ordem_servico',
    entidade_id: 'os-0211',
    descricao: 'Ordem de Serviço #211 cancelada e removida a pedido do cliente',
    autor: 'Larissa Souza',
    created_at: '2026-02-27T14:55:00Z'
  },
  {
    id: 15,
    tipo_acao: 'criacao',
    entidade: 'produto',
    entidade_id: 'prd-067',
    descricao:
      'Produto "Amortecedor Dianteiro Monroe" cadastrado na categoria Suspensão',
    autor: 'Marcos Alves',
    created_at: '2026-02-27T10:30:00Z'
  }
];

const tipoAcaoConfig: Record<
  TipoAcao,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
    className: string;
  }
> = {
  criacao: {
    label: 'Criação',
    variant: 'default',
    icon: PackagePlus,
    className:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10'
  },
  edicao: {
    label: 'Edição',
    variant: 'secondary',
    icon: FilePenLine,
    className:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/10'
  },
  exclusao: {
    label: 'Exclusão',
    variant: 'destructive',
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

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

const MESES_ANOS = Array.from(
  new Set(
    MOCK_MOVIMENTACOES.map((m) => {
      const d = new Date(m.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })
  )
)
  .sort((a, b) => b.localeCompare(a))
  .map((val) => {
    const [year, month] = val.split('-');
    const label = new Date(
      Number(year),
      Number(month) - 1,
      1
    ).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
    return {
      value: val,
      label: label.charAt(0).toUpperCase() + label.slice(1)
    };
  });

export default function Movimentacoes() {
  const [search, setSearch] = useState('');
  const [filterAcao, setFilterAcao] = useState<string>('todas');
  const [filterEntidade, setFilterEntidade] = useState<string>('todas');
  const [filterMesAno, setFilterMesAno] = useState<string>('todos');
  const [filterDataDe, setFilterDataDe] = useState<Date | undefined>(undefined);
  const [filterDataAte, setFilterDataAte] = useState<Date | undefined>(
    undefined
  );

  function handleMesAnoChange(value: string) {
    setFilterMesAno(value);
    setFilterDataDe(undefined);
    setFilterDataAte(undefined);
  }

  function handleDataDeChange(date: Date | undefined) {
    setFilterDataDe(date);
    setFilterMesAno('todos');
  }

  function handleDataAteChange(date: Date | undefined) {
    setFilterDataAte(date);
    setFilterMesAno('todos');
  }

  function clearDateFilters() {
    setFilterMesAno('todos');
    setFilterDataDe(undefined);
    setFilterDataAte(undefined);
  }

  const hasDateFilter =
    filterMesAno !== 'todos' ||
    filterDataDe !== undefined ||
    filterDataAte !== undefined;

  const filtered = MOCK_MOVIMENTACOES.filter((mov) => {
    const matchSearch =
      mov.descricao.toLowerCase().includes(search.toLowerCase()) ||
      mov.autor.toLowerCase().includes(search.toLowerCase());
    const matchAcao = filterAcao === 'todas' || mov.tipo_acao === filterAcao;
    const matchEntidade =
      filterEntidade === 'todas' || mov.entidade === filterEntidade;

    let matchData = true;
    const movDate = new Date(mov.created_at);

    if (filterMesAno !== 'todos') {
      const [year, month] = filterMesAno.split('-');
      matchData =
        movDate.getFullYear() === Number(year) &&
        movDate.getMonth() + 1 === Number(month);
    } else if (filterDataDe || filterDataAte) {
      const start = filterDataDe
        ? new Date(filterDataDe.setHours(0, 0, 0, 0))
        : null;
      const end = filterDataAte
        ? new Date(filterDataAte.setHours(23, 59, 59, 999))
        : null;
      if (start) matchData = matchData && movDate >= start;
      if (end) matchData = matchData && movDate <= end;
    }

    return matchSearch && matchAcao && matchEntidade && matchData;
  });

  const totalCriacoes = MOCK_MOVIMENTACOES.filter(
    (m) => m.tipo_acao === 'criacao'
  ).length;
  const totalEdicoes = MOCK_MOVIMENTACOES.filter(
    (m) => m.tipo_acao === 'edicao'
  ).length;
  const totalExclusoes = MOCK_MOVIMENTACOES.filter(
    (m) => m.tipo_acao === 'exclusao'
  ).length;

  const {
    paginatedItems,
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
  } = usePagination({ items: filtered, itemsPerPage: 8 });

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold text-foreground'>Movimentações</h2>
        <p className='text-muted-foreground'>
          Histórico de ações realizadas no sistema
        </p>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Activity className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {MOCK_MOVIMENTACOES.length}
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
                  {totalCriacoes}
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
                  {totalEdicoes}
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
                  {totalExclusoes}
                </p>
                <p className='text-sm text-muted-foreground'>Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3'>
        {/* Row 1: search + action + entity */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar por descrição ou autor...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 bg-input border-border'
            />
          </div>
          <div className='flex gap-2 flex-wrap'>
            <Select value={filterAcao} onValueChange={setFilterAcao}>
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

            <Select value={filterEntidade} onValueChange={setFilterEntidade}>
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
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Mês/Ano:
            </span>
            <Select value={filterMesAno} onValueChange={handleMesAnoChange}>
              <SelectTrigger className='w-44 bg-input border-border'>
                <SelectValue placeholder='Filtrar por mês' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todos'>Todos os meses</SelectItem>
                {MESES_ANOS.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Período:
            </span>
            <DatePicker
              value={filterDataDe}
              onChange={handleDataDeChange}
              placeholder='Data inicial'
              className='w-40'
            />
            <span className='text-sm text-muted-foreground'>até</span>
            <DatePicker
              value={filterDataAte}
              onChange={handleDataAteChange}
              placeholder='Data final'
              className='w-40'
            />
          </div>

          {hasDateFilter && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearDateFilters}
              className='gap-1.5 text-muted-foreground hover:text-foreground'>
              <X className='h-3.5 w-3.5' />
              Limpar datas
            </Button>
          )}
        </div>
      </div>
      {/* Table */}
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground'>
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((mov) => {
                    const acaoConfig = tipoAcaoConfig[mov.tipo_acao];
                    const entConfig = entidadeConfig[mov.entidade];
                    const EntIcon = entConfig.icon;
                    const { date, time } = formatDateTime(mov.created_at);

                    return (
                      <TableRow key={mov.id} className='border-border'>
                        {/* Ação */}
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={`gap-1 font-medium whitespace-nowrap ${acaoConfig.className}`}>
                            <acaoConfig.icon className='h-3 w-3' />
                            {acaoConfig.label}
                          </Badge>
                        </TableCell>

                        {/* Entidade */}
                        <TableCell className='hidden sm:table-cell'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <EntIcon className='h-3.5 w-3.5 shrink-0' />
                            <span>{entConfig.label}</span>
                          </div>
                        </TableCell>

                        {/* Descrição */}
                        <TableCell>
                          <p className='text-sm text-foreground leading-snug max-w-90'>
                            {mov.descricao}
                          </p>
                        </TableCell>

                        {/* Autor */}
                        <TableCell className='hidden md:table-cell'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0'>
                              {getInitials(mov.autor)}
                            </div>
                            <span className='text-sm text-foreground whitespace-nowrap'>
                              {mov.autor}
                            </span>
                          </div>
                        </TableCell>

                        {/* Data / Hora */}
                        <TableCell className='hidden lg:table-cell text-right'>
                          <div className='flex flex-col items-end gap-0.5'>
                            <span className='text-sm text-foreground'>
                              {date}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {time}
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
