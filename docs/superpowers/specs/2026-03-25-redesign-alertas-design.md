# Redesign — Página de Alertas

**Data:** 2026-03-25
**Branch:** tela-alerta-estoques
**Status:** Aprovado pelo usuário

---

## Objetivo

Repaginar a página `/alertas` para ter visual moderno e limpo, eliminando o aspecto "cara de IA" (cards com gradientes coloridos pesados, ícones grandes em círculos coloridos). A nova página mantém os mesmos dados reais mas com hierarquia visual mais clara e componentes mais compactos.

---

## Layout aprovado

### Estrutura geral

```
┌─────────────────────────────────┐
│  Header (título + subtítulo)    │
├──────────┬──────────┬───────────┤
│ Card     │ Card     │ Card      │
│ Crítico  │ Atenção  │ Total     │
├─────────────────────────────────┤  ← seção crítico aparece se pecasCriticas.length > 0
│  ● ESTOQUE ZERADO — CRÍTICO (n) │
│  ┌─ item ───────────── 0 un. ─┐ │
│  │ borda vermelha    mín. 5  [Repor]│
│  └────────────────────────────┘ │
│  ┌─ item ──...                 │ │
├─────────────────────────────────┤  ← seção atenção aparece se pecasAtencao.length > 0
│  ● ESTOQUE BAIXO — ATENÇÃO (n) │
│  ┌─ item ──────── ██░░ 2 un. ─┐ │
│  │ borda laranja  mín. 10 [Repor]│
│  └────────────────────────────┘ │
└─────────────────────────────────┘

Estado misto (ambas as seções): as duas seções aparecem empilhadas com gap-4 entre elas,
crítico sempre acima de atenção.
```

### Cards de resumo (topo)

Três cards em grid `sm:grid-cols-3` usando `shadcn/ui Card`:
- **Crítico** — contagem de `pecasCriticas`, cor `destructive`, borda superior vermelha (`border-t-2 border-destructive`)
- **Atenção** — contagem de `pecasAtencao`, cor laranja via classe Tailwind `text-orange-400`, borda superior `border-t-2 border-orange-400`
- **Total** — contagem de `pecasEmAlerta`, cor `foreground`, borda superior `border-t-2 border-muted-foreground/30`

> **Nota de tema:** usar classes `orange-400` diretamente (não variável de tema) é intencional — o design usa laranja como cor semântica de "atenção" independente do tema claro/escuro.

Sem ícones grandes. Label uppercase pequeno + número grande + descrição tiny abaixo.

### Seção Crítico

Aparece apenas quando `pecasCriticas.length > 0`. A separação crítico/atenção já é feita pelo hook (`quantidade === 0` → crítico; `quantidade > 0 && quantidade <= alerta` → atenção) — nenhuma lógica adicional na page.

O Card wrapper da seção usa `className="bg-card border-border"` (padrão shadcn, sem borda colorida na borda externa).

Header estrutura JSX (dentro de `<CardHeader>`):
```tsx
<div className="flex items-center gap-2">
  <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
  <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
    Estoque Zerado — Crítico
  </span>
  <Badge variant="outline" className="border-destructive text-destructive">
    {pecasCriticas.length}
  </Badge>
</div>
```

> **Nota tailwind-merge:** a sobreposição de cor via `className` funciona pois o projeto usa `tailwind-merge` no `cn()`, que resolve conflitos de utilidade por último declarado — `text-destructive` sobrescreve o `text-foreground` padrão do `variant="outline"`.

Cada item:
- `border-l-2 border-destructive` na esquerda (sem fundo colorido pesado)
- Nome da peça + código
- Quantidade em destaque (`text-destructive`) + "mín. X" abaixo
- Botão `Repor` (`variant="outline" size="sm"`) **sem ícone** que navega para `/movimentacoes`. **Mudança intencional** em relação ao botão atual (que usa variant default/sólido com ícone `TrendingUp`) — o novo design minimalista usa outline sem ícone em ambas as seções.
- Container do item: `className="flex items-center justify-between rounded-lg border-l-2 border-destructive bg-card p-4"` — remove o fundo colorido (`bg-destructive/10`) e o `border` perimetral do design anterior.

### Seção Atenção

Aparece apenas quando `pecasAtencao.length > 0`.

Mesmo padrão do Crítico. Card wrapper: `className="bg-card border-border"`. Header estrutura:
```tsx
<div className="flex items-center gap-2">
  <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
  <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
    Estoque Baixo — Atenção
  </span>
  <Badge variant="outline" className="border-orange-400 text-orange-400">
    {pecasAtencao.length}
  </Badge>
</div>
```
(Não existe variante nativa laranja no shadcn/ui; tailwind-merge garante a sobrescrita correta.)

Cada item tem adicionalmente:
- Mini progress bar: mantém as dimensões do código atual (`h-2 w-32`), cor de trilho `bg-secondary`, cor de preenchimento `bg-orange-400`, mostrando `(quantidade / alerta) * 100`%
- Container do item: `className="flex items-center justify-between rounded-lg border-l-2 border-orange-400 bg-card p-4"`

### Estado de loading

Enquanto `isLoading === true`: retorna early com `<div className="flex flex-1 items-center justify-center p-4"><p className="text-muted-foreground">Carregando alertas...</p></div>` — sem o wrapper externo da página. Comportamento idêntico ao código atual.

### Estado vazio

Quando `pecasEmAlerta.length === 0`: card simples centralizado com ícone `CheckCircle` e mensagem "Tudo certo!". O círculo `bg-muted` em torno do ícone (`h-16 w-16 rounded-full bg-muted`) é mantido — é uma exceção aceitável pois representa um estado positivo/comemorativo, não um alerta. Sem alteração visual neste estado.

---

## Componentes e dependências

| Elemento | Origem |
|---|---|
| `Card`, `CardContent`, `CardHeader`, `CardTitle` | `shadcn/ui` — já instalado |
| `Button` | `shadcn/ui` — já instalado |
| `Badge` | `shadcn/ui` — já instalado (usado nos badges de contagem de cada seção) |
| Ícones (`CheckCircle`, `Package`) | `lucide-react` — já instalado (`TrendingUp`, `AlertTriangle`, `Bell` são removidos) |
| Hook de dados | `useAlerta` existente — sem alterações |
| Navegação | `useRouter` do Next.js — já em uso |

Nenhuma nova dependência necessária.

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `app/(dashboard)/alertas/page.tsx` | Reescrita completa do JSX |
| `app/(dashboard)/alertas/_hooks/useAlerta.ts` | Sem alteração |

---

## O que NÃO muda

- Hook `useAlerta` e lógica de fetch
- Rota `/movimentacoes` para o botão "Repor"
- Estrutura de dados (`pecasCriticas`, `pecasAtencao`, `pecasEmAlerta`)
- Estado de loading e estado vazio

---

## O que muda

- Remoção dos gradientes coloridos (`bg-destructive/10`, `bg-primary/10`)
- Remoção dos ícones grandes em círculos coloridos nos cards
- Cards de resumo com borda superior colorida (sutil) em vez de fundo
- Itens da lista com borda esquerda fina em vez de fundo colorido
- Label uppercase pequeno nos cabeçalhos de seção + badge de contagem
- Mini progress bar nos itens de "Atenção" (já existia, mantém)
