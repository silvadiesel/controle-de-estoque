# Redesign da Tela de Alertas

**Data:** 2026-03-23
**Status:** Aprovado

---

## Objetivo

Modernizar a tela de alertas (`/alertas`) do Igne System, que atualmente tem aparência genérica e sem vida. O redesign deve seguir o layout e a identidade visual do site (paleta laranja/âmbar, modo escuro, shadcn/ui, Tailwind v4), tornando a tela mais agradável, expressiva e fácil de acompanhar.

---

## Decisões de Design

| Aspecto                    | Decisão                                              |
| -------------------------- | ---------------------------------------------------- |
| Estrutura dos grupos       | Seções separadas verticalmente (Crítico / Atenção)   |
| Formato dos itens          | Card com barra de progresso visual                   |
| Cards de resumo            | Borda lateral colorida + dot de status com glow      |
| Estado vazio               | Ícone check verde centralizado com mensagem positiva |
| Abordagem de implementação | Refatoração com componentização leve (Abordagem B)   |

---

## Estrutura Visual

### Header

Mantém o padrão existente do site:

- Barra vertical laranja (`bg-primary`, altura `h-7`, largura `w-1`, `rounded-full`)
- Título `text-2xl font-bold`
- Subtítulo `text-sm text-muted-foreground` com `pl-3.5`

### Cards de Resumo (topo)

Grid de 3 colunas. Cada card usa:

- **Borda esquerda** colorida e espessa (`border-l-[3px]`) como accent principal
- **Dot de status** pequeno com glow (`box-shadow`) indicando severidade
- **Label** em uppercase, letra pequena, na cor semântica
- **Número** grande e bold (fonte pesada)
- **Descrição** discreta em `text-muted-foreground`

Cores por severidade:

- Crítico: `border-destructive`, `text-destructive`, fundo `bg-destructive/[0.06]`
- Atenção: `border-primary`, `text-primary`, fundo `bg-primary/[0.06]`
- Total: `border-border`, `text-muted-foreground`, fundo `bg-muted/[0.03]`

### Seções de Alertas

Cada grupo (Crítico / Atenção) tem seu próprio card-container com:

- **Header da seção**: ícone em container colorido + título + contador de itens (`X produtos`)
- **Lista de itens** com gap entre eles

### Itens de Alerta

Layout horizontal com 4 áreas:

1. **Ícone** — container arredondado com cor semântica
2. **Informações** — nome (bold), código SKU (muted), barra de progresso com label
3. **Quantidade** — número grande na cor semântica + "mín: X" abaixo
4. **Botão Repor** — primário (filled) para crítico, outline para atenção. Comportamento preservado: redireciona para `/movimentacoes` (mesmo comportamento atual)

Barra de progresso:

- Track: `bg-secondary` ou `bg-muted`, altura `h-1.5`, `rounded-full`
- Fill: cor semântica, largura = `(quantidade / alerta) * 100%`, capped em 100%
- Label abaixo: `X / Y unidades mínimas` em `text-xs text-muted-foreground`

### Estado Vazio

Centralizado na tela, dentro de um card:

- Ícone `CheckCircle` dentro de container circular verde (`bg-green-500/10 border border-green-500/20`)
- Título "Tudo em dia!" — `text-lg font-bold`
- Descrição neutra — `text-muted-foreground text-center`

### Loading State

Substitui o parágrafo simples atual por skeletons que espelham a estrutura real da tela (cards de resumo + itens de lista).

---

## Componentização

Novos subcomponentes em `app/(dashboard)/alertas/_components/`:

| Componente              | Responsabilidade                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `AlertaResumoCard`      | Card de resumo do topo (recebe: label, count, variant: 'critico' \| 'atencao' \| 'total') |
| `AlertaItem`            | Item individual da lista (recebe: peca, variant: 'critico' \| 'atencao', onRepor)         |
| `AlertaSecao`           | Seção com header + lista de itens (recebe: titulo, icone, items, variant)                 |
| `AlertaEmptyState`      | Estado vazio (sem props)                                                                  |
| `AlertaLoadingSkeleton` | Skeleton de carregamento (sem props)                                                      |

A página `page.tsx` orquestra os componentes, mantendo toda a lógica no hook `useAlerta` existente — sem alterações em hooks ou API.

---

## Tokens CSS (globals.css)

Adicionar valores aos tokens já declarados mas vazios — verificar existência antes de adicionar para evitar duplicatas:

```css
--success: oklch(0.627 0.194 145.6);
--success-foreground: oklch(0.98 0.02 145.6);
--warning: oklch(
  0.705 0.213 47.604
); /* mesmo valor de --primary, mas semânticamente distinto */
--warning-foreground: oklch(0.98 0.016 73.684);
```

---

## Arquivos Alterados

| Arquivo                                                         | Tipo de mudança                             |
| --------------------------------------------------------------- | ------------------------------------------- |
| `app/(dashboard)/alertas/page.tsx`                              | Reescrita (usa novos subcomponentes)        |
| `app/(dashboard)/alertas/_components/AlertaResumoCard.tsx`      | Novo                                        |
| `app/(dashboard)/alertas/_components/AlertaItem.tsx`            | Novo                                        |
| `app/(dashboard)/alertas/_components/AlertaSecao.tsx`           | Novo                                        |
| `app/(dashboard)/alertas/_components/AlertaEmptyState.tsx`      | Novo                                        |
| `app/(dashboard)/alertas/_components/AlertaLoadingSkeleton.tsx` | Novo                                        |
| `app/globals.css`                                               | Adição dos tokens `--success` e `--warning` |

**Sem alterações em:** hooks, API, sidebar, toast provider, outros componentes.

---

## Critérios de Aceitação

- [ ] Cards de resumo usam borda lateral colorida com dot de status
- [ ] Itens de alerta exibem barra de progresso indicando nível vs mínimo
- [ ] Seção Crítico usa vermelho (`destructive`), Atenção usa laranja (`primary`)
- [ ] Estado vazio exibe check verde com mensagem positiva
- [ ] Loading exibe skeletons no lugar do texto simples
- [ ] Nenhuma lógica de dados foi alterada (hooks e API intactos)
- [ ] Segue os padrões visuais do restante do site (header, spacing, border-radius)
