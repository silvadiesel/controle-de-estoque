# Design: Refatoração de Layout — Alertas e Movimentações

**Data:** 2026-03-31
**Status:** Aprovado

## Contexto

As páginas `/alertas` e `/movimentacoes` tinham muito espaço vazio, cores hex hardcoded inconsistentes com o design system, e layouts que não seguiam os padrões já estabelecidos no Dashboard. O objetivo é alinhar visualmente as duas páginas ao Dashboard, melhorar a densidade de informação e corrigir bugs de cor.

---

## Abordagem de Componentes

**Approach B**: Promover `StatCard` para componente compartilhado + subcomponentes locais por página.

- Mover `app/(dashboard)/dashboard/_components/stat-card.tsx` → `components/ui/stat-card.tsx`
- Atualizar importação no Dashboard
- Criar `app/(dashboard)/alertas/_components/alerta-grid.tsx`
- Criar `app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx`

---

## Página de Alertas

### StatCards (topo)
- 3 cards: "Sem Estoque", "Estoque Baixo", "Total Monitorado"
- Padrão exato do Dashboard `StatCard`: `rounded-xl border border-border bg-card p-5`
- Ícone: `size-9 rounded-md border border-border bg-elevated text-primary` — uniforme para os três
- Ícones Lucide: `AlertTriangle`, `Bell`, `ShieldAlert`
- Valor: `text-data text-foreground` (neutro, sem cor semântica)
- Subtítulo: `text-sm text-muted-foreground`

### Section Headers
- Container: `bg-muted px-4 py-2.5 flex items-center gap-2`
- Ícone da seção: `size-[22px] rounded-md border border-border bg-elevated` com ícone em `text-muted-foreground`
- Label: `text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground`
- Badge de contagem: `text-[10px] font-semibold rounded-full px-2 py-0.5 ml-auto`
  - Sem Estoque: `bg-destructive/12 text-destructive`
  - Estoque Baixo: `bg-primary/12 text-primary`
- **Sem** fundos tintados, **sem** bordas laterais coloridas

### Grid de Alertas (`alerta-grid.tsx`)
- Layout: `grid grid-cols-2 gap-2 p-3`
- Mini-card: `bg-elevated border border-border rounded-lg p-3`
- Linha do topo: dot (8px `rounded-full`) + nome da peça (`text-xs font-semibold text-foreground truncate`)
- Código: `text-[10px] text-muted-foreground` abaixo do nome
- Barra de progresso: `h-1 bg-border rounded-full` com fill semântico
- Rodapé: quantidade + botão "Repor" (`bg-primary/10 border-primary/30 text-primary`)
- Cores dos dots e barras:
  - Sem Estoque: `bg-destructive` (**bug fix**: era `bg-primary`)
  - Estoque Baixo: `bg-primary`

### Substituição de tokens hardcoded
| Antes | Depois |
|---|---|
| `bg-[#18181b]` | `bg-card` |
| `border-[#27272a]` | `border-border` |
| `bg-[#131316]` | `bg-muted` |
| `bg-[#27272a]` (ícone) | `bg-elevated` |
| `text-[#71717a]` | `text-muted-foreground` |
| `text-[#a1a1aa]` | `text-muted-foreground` |
| `bg-[#3f3f46]` (dot atenção) | `bg-primary` |

---

## Página de Movimentações

### StatCards (topo)
- Reutiliza `StatCard` promovido para `components/ui/stat-card.tsx`
- 4 cards: Total (`Activity`), Criações (`PackagePlus`), Edições (`FilePenLine`), Exclusões (`Trash2`)
- Layout: `grid grid-cols-2 lg:grid-cols-4 gap-3` (substitui `flex gap-4 md:flex-row flex-col`)

### Barra de Filtros
- Estrutura: linha horizontal única (`flex items-center gap-2 mb-5`)
- Campo busca: `flex: 1 1 0; min-width: 33%` — garante ≥ 1/3 da largura
- Selects: `flex-shrink-0` — Tipo de ação, Entidade, Mês
- Separador visual: `w-px h-5 bg-border`
- Datepickers: Data inicial + seta `ArrowRight` + Data final
- Botão "Limpar datas" aparece somente quando `temFiltroDeData === true`

### Timeline de Movimentações (`movimentacao-timeline.tsx`)
Substitui os cards individuais (`bg-card border rounded-[10px] p-4`) por linhas de timeline.

**Estrutura por item:**
```
[tl-track: dot 8px + linha vertical bg-border]
[tl-row: flex items-center]
  ├── .tl-desc    flex:2  — descrição truncada (1/3 da largura)
  ├── .tl-entity  flex:1  — badge entidade com ícone Lucide
  ├── .tl-action  flex:1  — badge ação com ícone Lucide
  ├── .tl-author  flex:1  — nome do autor (text-muted-foreground)
  └── .tl-datetime flex:1 — data · hora (text-muted-foreground, text-right)
```

**Cores dos dots** (alinhado com `ActivityFeed` do Dashboard):
- `criacao` → `var(--success)` (era `bg-[#22c55e]`)
- `edicao` → `var(--warning)`
- `exclusao` → `var(--destructive)` (era `bg-[#ef4444]`)

**Badges de entidade** (ícones Lucide, sem emojis):
| Entidade | Ícone | Cor |
|---|---|---|
| produto | `Package` | `bg-orange-500/10 text-orange-300` |
| cliente | `User` | `bg-violet-500/10 text-violet-300` |
| fornecedor | `Factory` | `bg-amber-500/10 text-amber-300` |
| categoria | `Tag` | `bg-pink-500/10 text-pink-300` |
| veiculo | `Car` | `bg-sky-500/10 text-sky-300` |
| ordem_venda | `ShoppingCart` | `bg-teal-500/10 text-teal-300` |
| ordem_servico | `Wrench` | `bg-indigo-500/10 text-indigo-300` |
| usuario | `UserCog` | `bg-rose-500/10 text-rose-300` |

**Badges de ação** (ícones Lucide):
| Ação | Ícone | Cor |
|---|---|---|
| criacao | `PackagePlus` | `bg-success/10 text-success` |
| edicao | `FilePenLine` | `bg-primary/10 text-primary` |
| exclusao | `Trash2` | `bg-destructive/10 text-destructive` |

**Container da timeline:**
- `bg-card border border-border rounded-xl overflow-hidden`
- Header: título + subtítulo com contagem + ícone `Activity` em `bg-elevated border-border text-primary`
- Hover por item: `hover:bg-elevated transition-colors`
- Paginação no rodapé: `border-t border-border px-5 py-3`

---

## Arquivos a modificar

| Arquivo | Operação |
|---|---|
| `app/(dashboard)/dashboard/_components/stat-card.tsx` | Mover para `components/ui/stat-card.tsx` |
| `app/(dashboard)/dashboard/page.tsx` | Atualizar importação do StatCard |
| `app/(dashboard)/alertas/page.tsx` | Refatorar layout completo |
| `app/(dashboard)/alertas/_components/alerta-grid.tsx` | Criar |
| `app/(dashboard)/movimentacoes/page.tsx` | Refatorar layout completo |
| `app/(dashboard)/movimentacoes/_components/movimentacao-timeline.tsx` | Criar |

---

## Verificação

1. Rodar `pnpm dev` e navegar para `/alertas` — confirmar grid 2 colunas, seções com badges, sem hex hardcoded
2. Navegar para `/movimentacoes` — confirmar StatCards, filtros em linha única (busca ≥ 1/3), timeline com 5 colunas
3. Verificar Dashboard (`/dashboard`) — StatCard ainda funciona após mudança de caminho
4. Checar no DevTools que não há `#18181b`, `#27272a`, `#131316`, `#22c55e`, `#ef4444` nos estilos inline ou classes
