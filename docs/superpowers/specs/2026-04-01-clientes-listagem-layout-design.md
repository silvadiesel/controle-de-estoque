# Redesign: Listagem de Clientes

## Contexto

A listagem "Base de clientes" usa um padrão de lista contínua com `border-b` como separador, resultando em fraca separação visual entre itens. A seção expandida de veículos usa uma lista vertical simples que não aproveita bem o espaço horizontal. O objetivo é alinhar com o padrão de cards individuais (como Ordens) e usar grid para veículos.

---

## Decisões de Design

### 1. Client items → Cards individuais

**Antes:** Lista contínua dentro de um `Card > CardContent`, itens separados por `border-b`.

**Depois:** Cada cliente é um card independente com `rounded-xl border border-border bg-card`, empilhados com `gap-3`.

A estrutura da página muda de:
```
Card (header + busca + lista de clientes)
```
Para:
```
Card (header + busca)
div.gap-3 (client cards individuais)
PaginationControls
```

**Detalhes do card de cliente:**
- Container: `overflow-hidden rounded-xl border border-border bg-card`
- Header row: `px-5 py-4`, `gap-4` entre avatar e content
- Avatar: `size-11 rounded-lg border border-border bg-elevated` (inalterado)
- Remove `bg-muted/10` do parent quando expandido (desnecessário — o card É a unidade)
- Hover: `transition-colors hover:border-border-hover` no card (botão de toggle)
- Expanded: seção de veículos fica dentro do mesmo card

### 2. Veículos expandidos → Grid 2 colunas

**Antes:** `flex-col gap-2` (lista vertical single-column).

**Depois:** `grid grid-cols-1 sm:grid-cols-2 gap-2`.

**Header da seção:**
- Layout: `flex items-center justify-between mb-3`
- Label: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Subtitle: `text-xs text-muted-foreground` com contagem de veículos
- Botão "Adicionar": `variant='outline' size='sm'`

**Vehicle card:**
- Container: `rounded-lg border border-border bg-card p-3`
- Layout: `flex items-center justify-between`
- Left: icon (`size-9 rounded-md border border-border bg-elevated`) + placa (font-semibold) + modelo (muted)
- Right: edit/delete buttons (`gap-1`)
- Highlight em busca: `border-primary/40 bg-primary/5` (inalterado)

**Seção expandida wrapper:**
- `border-t border-border bg-background/50`
- Padding: `px-5 py-4`
- Animações: mantém as existentes (slide + fade)

### 3. Skeleton e Empty states

**Skeleton:** Adaptar para refletir a nova estrutura de grid (2 colunas de skeletons no lugar de lista vertical).

**Empty state:** Sem mudança (já está bom com `Empty` component).

### 4. Mobile

- Grid de veículos: `grid-cols-1` em mobile, `sm:grid-cols-2` em desktop
- Client cards: `gap-3` mantido (funciona em ambos)
- Padding: `px-5` em ambos (removendo a variação `px-4 sm:px-6`)

---

## Arquivo Afetado

| Arquivo | Ação |
|---------|------|
| `app/(dashboard)/clientes/page.tsx` | **Editar** — refactor de layout puro |

**Nenhuma mudança de lógica, tipos ou hooks.** Apenas reestruturação de JSX e classes Tailwind.

---

## Mudanças CSS Específicas

| Elemento | Antes | Depois |
|----------|-------|--------|
| Lista container | `flex flex-col` (dentro de CardContent) | `flex flex-col gap-3` (fora do Card) |
| Client item | `border-b border-border last:border-b-0` | `rounded-xl border border-border bg-card overflow-hidden` |
| Item padding | `px-4 py-4 sm:px-6` | `px-5 py-4` |
| Avatar↔content gap | `gap-3` | `gap-4` |
| Expanded parent bg | `bg-muted/10` (condicional) | removido |
| Expanded section bg | `bg-background/60` | `bg-background/50` |
| Expanded padding | `px-4 py-4 sm:px-6` | `px-5 py-4` |
| Vehicles layout | `flex flex-col gap-2` | `grid grid-cols-1 sm:grid-cols-2 gap-2` |
| Vehicle header | `flex-col gap-3 sm:flex-row` | `flex items-center justify-between mb-3` |

---

## Verificação

- Verificar visualmente: cards separados com gap
- Verificar grid de veículos: 1 coluna em mobile, 2 colunas em desktop
- Testar expand/collapse: animação preservada
- Testar busca: highlight de veículos funciona no grid
- Testar skeleton: reflete a estrutura de grid
- Testar empty state: funciona sem mudanças
- `npx tsc --noEmit` = 0 erros (só mudanças de JSX/CSS)
