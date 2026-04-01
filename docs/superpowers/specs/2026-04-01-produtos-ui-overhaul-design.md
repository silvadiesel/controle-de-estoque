# Produtos — UI Overhaul

Data: 2026-04-01
Branch: `ui-produtos`

## Contexto

A seção de Produtos está com vários problemas de consistência visual comparada ao restante do sistema (especialmente Clientes, que serve como referência):

- Inputs quase invisíveis (`bg-input/60` no `input.tsx` base)
- Cards usando `bg-secondary` em vez de `bg-card`
- Modal construído manualmente em vez de usar `DialogShell`
- Sem validação de formulário (sem `react-hook-form` / `zod`)
- Labels de seção com `text-xs` (12px) em vez de `text-[10px]` per spec
- Sem paginação, sem ícone no search, skeleton loading genérico
- Usa `ComboboxSearch` em vez de `SearchableSelect` (obrigatório per CLAUDE.md)

## Decisões

| Decisão | Escolha |
|---------|---------|
| Layout de listagem | Grid de Cards (melhorado) |
| Estrutura do modal | DialogShell largo (720px via `contentClassName`) |
| Inputs escuros | Correção global em `input.tsx` |
| Escopo | Overhaul completo (visual + estrutural + forms) |
| StatCards | Não incluídos nesta iteração |
| Paginação | A partir de 20 itens |

---

## 1. Correção Global: `input.tsx`

**Arquivo:** `components/ui/input.tsx`

**Mudança:** Alterar `bg-input/60` para `bg-input` na classe base do componente.

Isso resolve o problema de inputs invisíveis em toda a aplicação. Componentes que já passam `className='bg-input border-border'` (como Clientes) não são afetados.

---

## 2. Cards de Produtos: `card-pecas.tsx`

**Arquivo:** `app/(dashboard)/produtos/_components/card-pecas.tsx`

**Mudanças:**
- `bg-secondary` → `bg-card` no container principal
- Botão "Editar" de `bg-border` para `variant='outline'` padrão do Button
- Manter layout, imagem e lógica de stock indicators (já corretos)
- Garantir que imagem placeholder usa `bg-background` (já correto)

---

## 3. Modal: Rewrite com DialogShell

**Arquivo:** `app/(dashboard)/produtos/_components/modal-peças.tsx`

### Estrutura

```
DialogShell (contentClassName='sm:max-w-[720px]')
  ├── Header: icon=Package, título dinâmico, descrição dinâmica
  ├── ScrollArea (automática via DialogShell, max-h-[68vh])
  │   └── Grid 12-cols (md:col-span-4 imagem + md:col-span-8 form)
  │       ├── Imagem: dropzone com bg-background, border-dashed, hover:border-primary
  │       └── Form (react-hook-form + zodResolver)
  │           ├── Seção "Identificação": nome (required) + código (required)
  │           ├── Seção "Localização no Estoque": estante + prateleira
  │           ├── Seção "Classificação": categoria (SearchableSelect) + fornecedor (SearchableSelect)
  │           ├── Seção "Estoque e Preço": quantidade + preço (R$)
  │           └── Seção "Alertas": quantidade para alerta + FieldDescription
  └── Footer: Cancelar (variant='outline') + Adicionar/Salvar (default)
```

### Formulário

- **Validação:** `react-hook-form` com `zodResolver(pecaSchema)`
- **Schema zod:** novo `pecaSchema` em `app/utils/validators.ts`
  - `name_peca`: `z.string().min(1, 'Nome é obrigatório')`
  - `codigo`: `z.string().min(1, 'Código é obrigatório')`
  - `estante`: `z.string().optional()` (campo separado, merge com `prateleira` → `localizacao` no submit)
  - `prateleira`: `z.string().optional()` (campo separado, merge com `estante` → `localizacao` no submit)
  - `categoria_id`: `z.number().nullable().optional()`
  - `fornecedor_id`: `z.number().nullable().optional()`
  - `quantidade`: `z.number().min(0).optional()`
  - `preco`: `z.number().min(0).optional()` (usar Controller com máscara monetária no onChange, como Clientes faz com CPF/CNPJ)
  - `alerta`: `z.number().min(0).optional()`
- **Erros:** `FieldError` inline abaixo de cada campo com `aria-invalid`
- **Re-validação:** `mode: 'onSubmit'`, `reValidateMode: 'onChange'` (padrão Clientes)
- **Reset:** form.reset no open e no submit bem-sucedido

### Labels de seção

Todas usam: `text-[10px] uppercase tracking-wider text-muted-foreground font-medium`

(Mudança de `text-xs` para `text-[10px]` e de `font-semibold` para `font-medium` per spec)

### Selects

- `ComboboxSearch` → `SearchableSelect`
- Adaptar interface: `{id: number, label: string}` → `{value: string, label: string}`
- Conversão: `value={String(formValue)}`, `onValueChange={(v) => field.onChange(Number(v))}`
- Para "Nenhum" no fornecedor: adicionar opção manual `{value: '', label: 'Nenhum'}` no array de options, já que `SearchableSelect` não tem `allowNone` nativo. Tratar `''` como `null` no submit.

### Componente: `DialogShell` override

Usar a prop `contentClassName` que já existe:
```tsx
<DialogShell
  contentClassName='sm:max-w-[720px]'
  bodyClassName='p-0'
  ...
>
```

O body precisa de `bodyClassName='p-0'` para permitir o grid de 12 colunas ocupar a largura total, com padding interno em cada coluna.

---

## 4. Página: `page.tsx`

**Arquivo:** `app/(dashboard)/produtos/page.tsx`

### Search input

Adicionar ícone `Search` com o mesmo padrão de Clientes:
```
<div className='relative'>
  <Search className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
  <Input ... className='pl-10 bg-input border-border' />
</div>
```

Remover `max-w-[280px]` — usar largura completa dentro do card de busca, ou manter responsivo com `w-full sm:max-w-xs`.

### Filtros

Trocar os dois `<Select>` (Categoria e Fornecedor) por `SearchableSelect`:
- Converter options de `{id, name}` para `{value: string, label: string}`
- Manter valor "all" como opção padrão (ou omitir e tratar string vazia como "todos")

### Paginação

Usar `PaginationControls` do `components/pagination-controls.tsx`:
- `itemsPerPage = 20`
- Calcular `totalPages = Math.ceil(filteredProducts.length / 20)`
- Slice do array: `filteredProducts.slice(startIndex, endIndex)`
- Mostrar "Mostrando X a Y de Z produtos"
- Reset para página 1 quando search/filtros mudam

### Skeleton loading

Manter 6 cards mas corrigir:
- `bg-card/50` → `bg-card` (consistente)
- Proporção de altura alinhada com card real (~300px)
- Adicionar `rounded-lg` (mesmo que card real)

---

## 5. Hook: `usePecas.ts`

**Arquivo:** `app/(dashboard)/produtos/_hook/usePecas.ts`

### Adaptações

- Remover state de formulário inline (`newPeca`, `setNewPeca`, etc.)
- O formulário agora é controlado por `react-hook-form` dentro do modal
- `handleSubmit` recebe `PecaFormValues` do form (tipado pelo zod schema)
- Manter: `handleEdit` (popula `initialData`), `handleDeletePeca`, filtros, `isLoading`
- Adicionar: estado de paginação (`currentPage`, `setCurrentPage`)
- Manter: `handleImageChange`, `handleRemoveImage` (imagem não é campo do form, controlado via state separado)
- Preço: controlado dentro do RHF via `Controller` com máscara monetária no onChange (padrão CPF/CNPJ de Clientes)

### Estado simplificado

```ts
// Antes: ~15 estados dispersos
// Depois: 
const [isAddOpen, setIsAddOpen] = useState(false);
const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
const [currentPage, setCurrentPage] = useState(1);
// ... filtros e delete continuam iguais
```

---

## Arquivos impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `components/ui/input.tsx` | bg-input/60 → bg-input |
| `app/(dashboard)/produtos/_components/card-pecas.tsx` | bg-secondary → bg-card + botões |
| `app/(dashboard)/produtos/_components/modal-peças.tsx` | Rewrite completo |
| `app/(dashboard)/produtos/page.tsx` | Search icon + paginação + skeleton + SearchableSelect |
| `app/utils/validators.ts` | Novo schema `pecaSchema` |
| `app/(dashboard)/produtos/_hook/usePecas.ts` | Adaptar para RHF + paginação |

---

## Verificação

1. **Visual:** Abrir Produtos e confirmar que cards usam `bg-card`, inputs visíveis
2. **Modal:** Abrir "Novo Produto", verificar DialogShell, ScrollArea, header com ícone em `bg-elevated`
3. **Validação:** Submeter form vazio, verificar FieldError em nome e código
4. **SearchableSelect:** Abrir categoria/fornecedor, verificar busca e seleção
5. **Paginação:** Com > 20 produtos, verificar paginação aparece e navega corretamente
6. **Responsivo:** Verificar modal em mobile (image empilha sobre form), cards em 1 coluna
7. **Inputs globais:** Verificar que inputs em Clientes e Ordens continuam funcionando após mudança global
8. **Edição:** Abrir modal de edição, verificar que dados populam corretamente
