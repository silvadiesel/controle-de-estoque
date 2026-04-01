# Alertas & Movimentações — Refatoração de Layout

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar o layout das páginas `/alertas` e `/movimentacoes` para seguir os padrões visuais do Dashboard, eliminar cores hex hardcoded e melhorar a densidade de informação.

**Architecture:** Promover `StatCard` para `components/ui/` (compartilhado), criar subcomponentes locais `AlertaGrid` e `MovimentacaoTimeline`, e reescrever as duas pages usando os novos componentes.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Lucide React, TypeScript

---

## Mapa de arquivos

| Operação | Arquivo |
|---|---|
| Criar (mover de) | `components/ui/stat-card.tsx` |
| Deletar | `app/(dashboard)/dashboard/_components/stat-card.tsx` |
| Modificar | `app/(dashboard)/dashboard/page.tsx` — atualizar import |
| Criar | `app/(dashboard)/alertas/_components/alerta-grid.tsx` |
| Reescrever | `app/(dashboard)/alertas/page.tsx` |
| Criar | `app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx` |
| Reescrever | `app/(dashboard)/movimentacoes/page.tsx` |

---

## Task 1: Promover StatCard para components/ui

**Files:**
- Create: `components/ui/stat-card.tsx`
- Delete: `app/(dashboard)/dashboard/_components/stat-card.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Criar `components/ui/stat-card.tsx`** com o conteúdo exato do arquivo atual:

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  isLoading: boolean;
  state?: 'ready' | 'unavailable';
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  state = 'ready'
}: StatCardProps) {
  return (
    <div className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-label text-muted-foreground'>{label}</p>
          {isLoading ? (
            <Skeleton className='mt-3 h-8 w-20' />
          ) : (
            <p className='mt-3 text-data text-foreground'>{value}</p>
          )}
        </div>
        <div className='flex size-9 rounded-md items-center justify-center border border-border bg-elevated text-primary'>
          <Icon size={20} />
        </div>
      </div>
      <p className='text-sm text-muted-foreground'>
        {state === 'unavailable' ? 'Dado indisponível no momento' : subtitle}
      </p>
    </div>
  );
}
```

- [ ] **Atualizar import em `app/(dashboard)/dashboard/page.tsx`** — mudar linha 14:

```tsx
// Antes:
import { StatCard } from './_components/stat-card';

// Depois:
import { StatCard } from '@/components/ui/stat-card';
```

- [ ] **Deletar o arquivo original:**

```bash
rm app/(dashboard)/dashboard/_components/stat-card.tsx
```

- [ ] **Verificar que o TypeScript compila sem erros:**

```bash
pnpm tsc --noEmit
```

Esperado: sem erros.

- [ ] **Commit:**

```bash
git add components/ui/stat-card.tsx app/(dashboard)/dashboard/page.tsx
git rm app/(dashboard)/dashboard/_components/stat-card.tsx
git commit -m "refactor: promover StatCard para components/ui (compartilhado)"
```

---

## Task 2: Criar componente AlertaGrid

**Files:**
- Create: `app/(dashboard)/alertas/_components/alerta-grid.tsx`

- [ ] **Criar `app/(dashboard)/alertas/_components/alerta-grid.tsx`:**

```tsx
'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { type AlertaPeca } from '../_hooks/useAlerta';

interface AlertaGridProps {
  pecas: AlertaPeca[];
  tipo: 'critica' | 'atencao';
}

export function AlertaGrid({ pecas, tipo }: AlertaGridProps) {
  const router = useRouter();
  const isCritica = tipo === 'critica';

  return (
    <div className='grid grid-cols-2 gap-2 p-3'>
      {pecas.map((peca) => {
        const percentage = isCritica
          ? 0
          : Math.min((peca.quantidade / peca.alerta) * 100, 100);

        return (
          <div
            key={peca.id}
            className='bg-elevated border border-border rounded-lg p-3'>
            {/* Nome + dot */}
            <div className='flex items-center gap-2 mb-1'>
              <span
                className={`block h-2 w-2 rounded-full shrink-0 ${
                  isCritica ? 'bg-destructive' : 'bg-primary'
                }`}
              />
              <p className='text-xs font-semibold text-foreground truncate'>
                {peca.name_peca}
              </p>
            </div>

            {/* Código */}
            <p className='text-[10px] text-muted-foreground mb-2 pl-4'>
              {peca.codigo}
            </p>

            {/* Barra de progresso */}
            <div className='h-1 w-full bg-border rounded-full overflow-hidden mb-2'>
              <div
                className={`h-full rounded-full transition-all ${
                  isCritica ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Rodapé: quantidade + botão */}
            <div className='flex items-center justify-between'>
              <p className='text-[11px]'>
                <span
                  className={`font-bold ${
                    isCritica ? 'text-destructive' : 'text-primary'
                  }`}>
                  {peca.quantidade}
                </span>
                <span className='text-muted-foreground'> / {peca.alerta}</span>
              </p>
              <Button
                size='sm'
                className='h-6 px-2.5 text-[10px] font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
                onClick={() => router.push('/produtos')}>
                Repor
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Verificar TypeScript:**

```bash
pnpm tsc --noEmit
```

Esperado: sem erros.

- [ ] **Commit:**

```bash
git add app/(dashboard)/alertas/_components/alerta-grid.tsx
git commit -m "feat: criar componente AlertaGrid (grid 2 colunas de mini-cards)"
```

---

## Task 3: Reescrever página de Alertas

**Files:**
- Modify: `app/(dashboard)/alertas/page.tsx`

- [ ] **Substituir o conteúdo completo de `app/(dashboard)/alertas/page.tsx`:**

```tsx
'use client';

import { AlertTriangle, Bell, CheckCircle, ShieldAlert } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';

import { AlertaGrid } from './_components/alerta-grid';
import { useAlerta } from './_hooks/useAlerta';

export default function Alertas() {
  const { pecasCriticas, pecasAtencao, pecasEmAlerta, isLoading } = useAlerta();

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <p className='text-muted-foreground'>Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='text-[22px] font-bold text-foreground'>Alertas</h1>
        <p className='text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* StatCards — padrão Dashboard */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          label='Sem Estoque'
          value={pecasCriticas.length}
          subtitle='Peças com quantidade zero'
          icon={AlertTriangle}
          isLoading={false}
        />
        <StatCard
          label='Estoque Baixo'
          value={pecasAtencao.length}
          subtitle='Abaixo do nível mínimo'
          icon={Bell}
          isLoading={false}
        />
        <StatCard
          label='Total Monitorado'
          value={pecasEmAlerta.length}
          subtitle='Produtos em alerta ativo'
          icon={ShieldAlert}
          isLoading={false}
        />
      </div>

      {/* Lista de alertas */}
      {pecasEmAlerta.length === 0 ? (
        <Card className='bg-card border-border'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-success/20 bg-success/8'>
              <CheckCircle className='h-8 w-8 text-success' />
            </div>
            <h3 className='mb-2 text-lg font-bold text-foreground'>
              Tudo em dia!
            </h3>
            <p className='text-center text-sm text-muted-foreground'>
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className='bg-card border-border overflow-hidden'>
          <CardContent className='p-0'>
            {/* Seção: Sem Estoque */}
            {pecasCriticas.length > 0 && (
              <>
                <div className='bg-muted px-4 py-2.5 flex items-center gap-2 border-b border-border'>
                  <div className='flex size-[22px] items-center justify-center rounded-md border border-border bg-elevated'>
                    <AlertTriangle className='h-3 w-3 text-muted-foreground' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground'>
                    Sem Estoque
                  </span>
                  <span className='ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5 bg-destructive/12 text-destructive'>
                    {pecasCriticas.length}{' '}
                    {pecasCriticas.length === 1 ? 'peça' : 'peças'}
                  </span>
                </div>
                <AlertaGrid pecas={pecasCriticas} tipo='critica' />
              </>
            )}

            {/* Seção: Estoque Baixo */}
            {pecasAtencao.length > 0 && (
              <>
                <div className='bg-muted px-4 py-2.5 flex items-center gap-2 border-t border-b border-border'>
                  <div className='flex size-[22px] items-center justify-center rounded-md border border-border bg-elevated'>
                    <Bell className='h-3 w-3 text-muted-foreground' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground'>
                    Estoque Baixo
                  </span>
                  <span className='ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5 bg-primary/12 text-primary'>
                    {pecasAtencao.length}{' '}
                    {pecasAtencao.length === 1 ? 'peça' : 'peças'}
                  </span>
                </div>
                <AlertaGrid pecas={pecasAtencao} tipo='atencao' />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Verificar TypeScript:**

```bash
pnpm tsc --noEmit
```

Esperado: sem erros.

- [ ] **Commit:**

```bash
git add app/(dashboard)/alertas/page.tsx
git commit -m "feat: refatorar layout da página de Alertas (grid, tokens semânticos, bug fix dot)"
```

---

## Task 4: Criar componente MovimentacaoTimeline

**Files:**
- Create: `app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx`

- [ ] **Criar `app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx`:**

```tsx
import {
  Car,
  Factory,
  FilePenLine,
  Package,
  PackagePlus,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  UserCog,
  Wrench
} from 'lucide-react';

import {
  type Entidade,
  type Movimentacao,
  type TipoAcao
} from '../_hook/useMovimentacoes';

const ENTIDADE_CONFIG: Record<
  Entidade,
  { label: string; icon: React.ElementType; className: string }
> = {
  produto: {
    label: 'Produto',
    icon: Package,
    className: 'bg-orange-500/10 text-orange-300'
  },
  cliente: {
    label: 'Cliente',
    icon: User,
    className: 'bg-violet-500/10 text-violet-300'
  },
  fornecedor: {
    label: 'Fornecedor',
    icon: Factory,
    className: 'bg-amber-500/10 text-amber-300'
  },
  categoria: {
    label: 'Categoria',
    icon: Tag,
    className: 'bg-pink-500/10 text-pink-300'
  },
  veiculo: {
    label: 'Veículo',
    icon: Car,
    className: 'bg-sky-500/10 text-sky-300'
  },
  ordem_venda: {
    label: 'Ordem de Venda',
    icon: ShoppingCart,
    className: 'bg-teal-500/10 text-teal-300'
  },
  ordem_servico: {
    label: 'Ordem de Serviço',
    icon: Wrench,
    className: 'bg-indigo-500/10 text-indigo-300'
  },
  usuario: {
    label: 'Usuário',
    icon: UserCog,
    className: 'bg-rose-500/10 text-rose-300'
  }
};

const ACAO_CONFIG: Record<
  TipoAcao,
  { label: string; icon: React.ElementType; className: string; dotColor: string }
> = {
  criacao: {
    label: 'Criação',
    icon: PackagePlus,
    className: 'bg-success/10 text-success',
    dotColor: 'var(--success)'
  },
  edicao: {
    label: 'Edição',
    icon: FilePenLine,
    className: 'bg-primary/10 text-primary',
    dotColor: 'var(--warning)'
  },
  exclusao: {
    label: 'Exclusão',
    icon: Trash2,
    className: 'bg-destructive/10 text-destructive',
    dotColor: 'var(--destructive)'
  }
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface MovimentacaoTimelineProps {
  movimentacoes: Movimentacao[];
}

export function MovimentacaoTimeline({
  movimentacoes
}: MovimentacaoTimelineProps) {
  if (movimentacoes.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-sm text-muted-foreground'>
          Nenhuma movimentação encontrada
        </p>
      </div>
    );
  }

  return (
    <div>
      {movimentacoes.map((mov, idx) => {
        const entidade = ENTIDADE_CONFIG[mov.entidade];
        const acao = ACAO_CONFIG[mov.tipo_acao];
        const EntidadeIcon = entidade?.icon;
        const AcaoIcon = acao?.icon;
        const isLast = idx === movimentacoes.length - 1;

        return (
          <div
            key={mov.id}
            className='flex items-center px-5 hover:bg-elevated transition-colors'>
            {/* Trilho da timeline */}
            <div className='flex flex-col items-center w-6 shrink-0 self-stretch'>
              <div
                className={`flex-1 w-px ${idx === 0 ? 'bg-transparent' : 'bg-border'}`}
              />
              <div
                className='h-2 w-2 rounded-full shrink-0'
                style={{
                  backgroundColor:
                    acao?.dotColor ?? 'var(--muted-foreground)'
                }}
              />
              <div
                className={`flex-1 w-px ${isLast ? 'bg-transparent' : 'bg-border'}`}
              />
            </div>

            {/* Row com 5 colunas proporcionais */}
            <div
              className={`flex flex-1 items-center py-2.5 pl-3 ${
                !isLast ? 'border-b border-border' : ''
              }`}>
              {/* Col 1: Descrição — flex:2 ≈ 1/3 da largura total */}
              <p className='flex-[2] min-w-0 text-[13px] text-foreground truncate pr-4'>
                {mov.descricao}
              </p>

              {/* Col 2: Entidade — flex:1 */}
              <div className='flex-1 min-w-0 pr-3'>
                {entidade && EntidadeIcon && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${entidade.className}`}>
                    <EntidadeIcon size={10} />
                    {entidade.label}
                  </span>
                )}
              </div>

              {/* Col 3: Ação — flex:1 */}
              <div className='flex-1 min-w-0 pr-3'>
                {acao && AcaoIcon && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${acao.className}`}>
                    <AcaoIcon size={10} />
                    {acao.label}
                  </span>
                )}
              </div>

              {/* Col 4: Autor — flex:1 */}
              <p className='flex-1 min-w-0 text-[12px] text-muted-foreground truncate pr-3'>
                {mov.autor}
              </p>

              {/* Col 5: Data · Hora — flex:1, alinhado à direita */}
              <p className='flex-1 min-w-0 text-[11px] text-muted-foreground text-right'>
                {formatDate(mov.created_at)} · {formatTime(mov.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Verificar TypeScript:**

```bash
pnpm tsc --noEmit
```

Esperado: sem erros.

- [ ] **Commit:**

```bash
git add app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx
git commit -m "feat: criar componente MovimentacaoTimeline (lista inline estilo tabela)"
```

---

## Task 5: Reescrever página de Movimentações

**Files:**
- Modify: `app/(dashboard)/movimentacoes/page.tsx`

- [ ] **Substituir o conteúdo completo de `app/(dashboard)/movimentacoes/page.tsx`:**

```tsx
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
            <h2 className='text-heading text-foreground'>
              Histórico de Atividades
            </h2>
            <p className='text-muted-sm mt-0.5'>
              {isLoading
                ? 'Carregando...'
                : `${totalItems} registros · página ${pageItems} de ${totalPages}`}
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
          <div className='border-t border-border px-5 py-3 flex items-center justify-between'>
            <p className='text-[11px] text-muted-foreground'>
              Exibindo {startItem}–{endItem} de {totalItems} registros
            </p>
            <PaginationControls
              currentPage={pageItems}
              totalPages={totalPages}
              isFirstPage={isFirstPage}
              isLastPage={isLastPage}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              onGoToPage={goToPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Verificar TypeScript:**

```bash
pnpm tsc --noEmit
```

Esperado: sem erros.

- [ ] **Commit:**

```bash
git add app/(dashboard)/movimentacoes/page.tsx
git commit -m "feat: refatorar layout da página de Movimentações (timeline, filtros inline, StatCard)"
```

---

## Task 6: Verificação final

- [ ] **Rodar o servidor de dev:**

```bash
pnpm dev
```

- [ ] **Verificar `/alertas`:**
  - 3 StatCards com ícones em `bg-elevated border-border text-primary`
  - Grid 2 colunas de mini-cards dentro de cada seção
  - Section headers com badge colorido, sem fundo tintado, sem borda lateral
  - Dot dos itens "Sem Estoque" = vermelho (destructive), não azul

- [ ] **Verificar `/movimentacoes`:**
  - 4 StatCards em grid `sm:grid-cols-2 lg:grid-cols-4`
  - Barra de filtros em linha única com busca ocupando ≥ 1/3
  - Timeline com 5 colunas: descrição (1/3) · entidade · ação · autor · data/hora
  - Ícones Lucide nas badges (sem emojis)
  - Dot amarelo para edição, verde para criação, vermelho para exclusão

- [ ] **Verificar `/dashboard`:**
  - StatCards continuam funcionando normalmente após mudança de import

- [ ] **Confirmar ausência de hex hardcoded nos arquivos modificados:**

```bash
grep -rn "#18181b\|#27272a\|#131316\|#22c55e\|#ef4444\|#3f3f46" \
  app/(dashboard)/alertas/ \
  app/(dashboard)/movimentacoes/ \
  components/ui/stat-card.tsx
```

Esperado: nenhum resultado.

- [ ] **Commit final de verificação (se necessário ajuste):**

```bash
git add -p
git commit -m "fix: ajustes pós-verificação visual"
```
