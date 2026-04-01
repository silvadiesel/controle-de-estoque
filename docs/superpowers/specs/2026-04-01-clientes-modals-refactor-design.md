# Refatoração dos Modais de Clientes

## Contexto

A seção de Clientes possui 2 modais (ModalClientes, ModalVeiculos) com:
- **2 erros de TypeScript** causados por divergência entre `ClienteFormValues` (derivado do DB, `cpf`/`cnpj` como `string`) e o Zod schema (onde são `string | undefined`)
- **Inconsistências de layout** com o padrão estabelecido na `OrdemDialogShell` (ícone, padding, ScrollArea height, max-width)

O objetivo é corrigir os erros de tipagem e alinhar visualmente os modais com o padrão do projeto.

---

## Decisões de Design

### 1. DialogShell genérica (`components/ui/dialog-shell.tsx`)

Extraída da `OrdemDialogShell`, com estas diferenças:
- **Default max-w**: `560px` (override via `contentClassName`)
- Precisa de `max-w-[560px] sm:max-w-[560px]` porque `DialogContent` base tem `sm:max-w-lg` (512px) que sobrescreveria

Estrutura interna idêntica:
- Header: `px-6 py-5`, ícone `size-10 rounded-lg border border-border bg-elevated text-primary`
- Body: `ScrollArea max-h-[68vh]` → `div px-6 py-5`
- Footer: `border-t border-border px-6 py-4`
- Animações: `data-[state=open]:duration-300 data-[state=closed]:duration-200`

Props: `open`, `onOpenChange`, `icon`, `title`, `description`, `children`, `footer`, `trigger?`, `contentClassName?`, `bodyClassName?`

### 2. Fix TypeScript via `z.infer`

`ClienteFormValues` muda de `Pick<Cliente, ...>` para `z.infer<typeof clienteSchema>`:
- `cpf`/`cnpj` passam a ser `string | undefined` (alinhado com o Zod resolver)
- Os hooks já tratam `data.cpf || ''` antes da API — seguro
- `VeiculoFormValues` também migra para `z.infer<typeof veiculoSchema>` (consistência, embora sem erro hoje)
- Import: `import { z, ZodError } from 'zod'` (unificar imports existentes)

### 3. FieldLabel — NÃO aplicar uppercase/tracking-wider

Os modais de Ordens (padrão de referência) usam `FieldLabel` com estilo padrão (sem uppercase, sem tracking-wider). O padrão CLAUDE.md `text-[10px] uppercase tracking-wider` aplica-se a labels de seção/info blocks, não a form field labels. Manter consistência com Ordens.

### 4. OrdemDialogShell → DialogShell (atualizar imports)

3 arquivos consomem `OrdemDialogShell`:
- `modal-ordem-servico.tsx` (1 uso)
- `modal-ordem-venda.tsx` (1 uso)
- `modal-detalhes-ordem.tsx` (2 usos)

Todos mudam import para `@/components/ui/dialog-shell` e passam `contentClassName='max-w-[720px] sm:max-w-[720px]'`. O arquivo original é deletado.

### 5. ModalDelete — ajuste mínimo

Ícone `size-9` → `size-10`. Cores e borda destructive mantidas (são intencionais para ação destrutiva). Não usar DialogShell (não tem body/ScrollArea).

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `components/ui/dialog-shell.tsx` | **Criar** — componente novo |
| `app/(dashboard)/clientes/_hooks/useClientes.ts` | **Editar** — `ClienteFormValues` → `z.infer` |
| `app/(dashboard)/clientes/_hooks/useVeiculos.ts` | **Editar** — `VeiculoFormValues` → `z.infer` |
| `app/(dashboard)/clientes/_components/modal-clientes.tsx` | **Editar** — usar `DialogShell` |
| `app/(dashboard)/clientes/_components/modal-veiculos.tsx` | **Editar** — usar `DialogShell` |
| `app/(dashboard)/ordens/_components/ordem-dialog-shell.tsx` | **Deletar** |
| `app/(dashboard)/ordens/_components/modal-ordem-servico.tsx` | **Editar** — import |
| `app/(dashboard)/ordens/_components/modal-ordem-venda.tsx` | **Editar** — import |
| `app/(dashboard)/ordens/_components/modal-detalhes-ordem.tsx` | **Editar** — import |
| `components/modal-delete.tsx` | **Editar** — ícone size-9 → size-10 |

---

## Ordem de Implementação

1. **Fix tipos** — zero mudança visual, resolve erros de compilação
2. **Criar DialogShell** — novo componente, sem impacto em código existente
3. **Migrar consumidores de OrdemDialogShell** — mudança mecânica de imports, sem delta visual
4. **Deletar OrdemDialogShell** — agora sem consumidores
5. **Refatorar ModalClientes** — usar DialogShell
6. **Refatorar ModalVeiculos** — usar DialogShell
7. **Ajustar ModalDelete** — ícone size-10
8. **Verificar build** — `npx tsc --noEmit` = 0 erros

---

## Verificação

- `npx tsc --noEmit` deve retornar 0 erros
- Abrir cada modal no browser e verificar visualmente:
  - ícone size-10 com border
  - padding consistente (px-6 py-5 no body)
  - ScrollArea com max-h-[68vh]
  - Footer com border-t
- Testar criar/editar/deletar cliente e veículo (fluxo completo)
- Verificar que modais de Ordens continuam funcionando normalmente
