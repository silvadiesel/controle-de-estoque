# CLAUDE.md — Core Controler

Convenções e decisões de arquitetura do projeto. Leia antes de qualquer tarefa de UI.

---

## Cores

- Todas as cores via CSS variables HEX definidas em `app/globals.css` (`:root`)
- Usar sempre tokens Tailwind: `bg-card`, `text-foreground`, `border-border`, `text-primary`, etc.
- **Nunca** usar hex direto (`#18181b`, `#27272a`, etc.) em componentes — usar o token correspondente
- O projeto é **dark mode only** — não existe modo claro

## Tipografia

- **Apenas classes Tailwind nativas**: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
- **Nunca criar classes CSS customizadas** em `globals.css` — usar Tailwind nativo
- Para `text-[10px]` (badges pequenos, timestamps): manter como `text-[10px]` — não há equivalente nativo
- Referência de mapeamento:
  - `text-[12px]` → `text-xs`
  - `text-[13px]` → `text-sm`
  - `text-[14px]` → `text-sm`
  - `text-[16px]` → `text-base`
  - `text-[18px]` → `text-lg`
  - `text-[20px]` → `text-xl`

## Spacing & Border Radius

- Usar escala Tailwind padrão — evitar `p-[14px]`, `h-[9px]`, etc.
- Border radius: `rounded-md` (10px), `rounded-lg` (12px), `rounded-xl` (16px)
- Nunca usar `rounded-[Xpx]`

## Spacing & Layout

- `text-[22px]` → `text-2xl`
- Valores arbitrários de espaço (`left-[4px]`, `mt-[4px]`) → escala Tailwind: `left-1`, `mt-1`

## Componentes Reutilizáveis

- **`StatCard`** (`components/ui/stat-card.tsx`) — padrão para métricas. Nunca reinventar inline.
- **`SearchableSelect`** (`components/ui/searchable-select.tsx`) — obrigatório quando a lista tem > 8 itens ou precisa de busca. Substitui `<Select>` nesses casos.
- **`PaginationControls`** (`components/pagination-controls.tsx`) — padrão para paginação em todas as listas.

## Padrões de Modal

Estrutura obrigatória: `DialogHeader` (ícone + título + descrição) → `<ScrollArea>` → `DialogFooter`.

- Fundo: `bg-card border-border rounded-xl`
- Header/footer separados por `border-b/t border-border`, padding `p-6`
- Labels de campo: `text-muted-foreground uppercase text-[10px] tracking-wider font-medium`

## Padrões de Formulário

- Validação: `FieldErrors` por campo — mensagem inline abaixo do input + toast com resumo no `submit`
- Re-validar em tempo real após a primeira tentativa (`submitted` flag)
- Campos com lista longa (clientes, peças): usar `SearchableSelect`
- Seleção de peças em ordens: adicionar a lista local com controles `+/-`, validar estoque no momento da seleção (não só no submit)

## Responsividade

- Tabelas com muitas colunas: esconder colunas secundárias em mobile (`hidden sm:flex`)
- Sempre visíveis em mobile: identidade principal + status + ação
- Sempre escondidos em mobile: contexto secundário (veículo/pagamento), data

## Design System

- Tokens completos em `app/globals.css`
- Contexto de design em `.impeccable.md`
- Dark mode only, azul-acero (`--primary: #5376b8`), sem gradientes decorativos, sem glow
