# CLAUDE.md — Igne System

Convenções e decisões de arquitetura do projeto. Leia antes de qualquer tarefa de UI.

---

## Cores

- Todas as cores via CSS variables HEX definidas em `app/globals.css` (`:root`)
- Usar sempre tokens Tailwind: `bg-card`, `text-foreground`, `border-border`, `text-primary`, etc.
- **Nunca** usar hex direto (`#18181b`, `#27272a`, etc.) em componentes — usar o token correspondente
- O projeto é **dark mode only** — não existe modo claro

## Tipografia

- **Preferir classes Tailwind nativas**: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- **Nunca criar novas utilities tipográficas** em `globals.css` — usar Tailwind nativo
- As utilities existentes (`.text-label`, `.text-heading`, `.text-body`, `.text-muted-sm`) podem permanecer onde já estão em uso, mas não devem ser expandidas nem aplicadas em novos componentes
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

## Design System

- Tokens completos em `app/globals.css`
- Contexto de design em `.impeccable.md`
- Dark mode only, azul-acero (`--primary: #5376b8`), sem gradientes decorativos, sem glow
