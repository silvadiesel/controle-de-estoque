# Theme Contrast Fix — Design Spec

## Problema

Textos com contraste insuficiente em tema escuro. `#52525b` sobre `#09090B` falha WCAG AA (~3.2:1). Labels, hovers e ícones praticamente invisíveis.

## Decisões

- **Tema escuro mantido**, contraste aumentado
- **Primária**: `#5b7fa5` → `#4656b3`
- **Hierarquia de texto**: 3 níveis (bright, secondary, muted) — todos legíveis
- **Hovers**: fundo sutil `#27272a`, texto clareia para branco

## Tokens Atualizados

| Token | Antes | Depois |
|---|---|---|
| `--primary` | `#5b7fa5` | `#4656b3` |
| `--primary-foreground` | `#09090B` | `#ffffff` |
| `--foreground` | `#e4e4e7` | `#f4f4f5` |
| `--text-bright` | `#e4e4e7` | `#f4f4f5` |
| `--text-primary` | `#d4d4d8` | `#f4f4f5` |
| `--text-secondary` | `#71717a` | `#a1a1aa` |
| `--text-muted` | `#52525b` | `#71717a` |
| `--muted-foreground` | `#52525b` | `#71717a` |
| `--accent` | `#1c1c22` | `#27272a` |
| `--sidebar-accent` | `#18181b` | `#27272a` |
| `--ring` | `#5b7fa5` | `#4656b3` |
| `--sidebar-primary` | `#5b7fa5` | `#4656b3` |
| `--sidebar-ring` | `#5b7fa5` | `#4656b3` |
| `--chart-1` | `#5b7fa5` | `#4656b3` |
| `--chart-2..5` | `rgba(91,127,165,...)` | `rgba(70,86,179,...)` |

## Componentes — Hardcoded → Tokens

- `text-[#52525b]` → `text-muted-foreground`
- `text-[#3f3f46]` → `text-muted-foreground`
- `text-[#27272a]` → `text-muted-foreground`
- `text-[#e4e4e7]` → `text-foreground`
- `text-[#a1a1aa]` → `text-text-tertiary`
- `bg-[#5b7fa5]` / `from-[#5b7fa5]` / `to-[#4a6b8a]` → tokens primários
- `hover:bg-[#18181b]/50` → `hover:bg-accent`
- `hover:bg-[#1f1f23]` → `hover:bg-accent`

## Escopo

~15 arquivos: globals.css, app-sidebar, dashboard page, stat-card, last-orders, activity-feed, movements-chart, produtos, clientes, ordens, movimentações, alertas, configurações, modais, pagination.
