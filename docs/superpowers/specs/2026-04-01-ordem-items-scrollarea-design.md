# Ordem Card — Itens com ScrollArea (eliminar modal de detalhes)

## Contexto

Na seção de ordens, quando uma ordem tem mais de 2 itens, o card expandido mostra apenas 2 e exibe "+X itens adicionais". O usuário precisa clicar "Ver detalhes" para abrir um modal que exibe todos os itens. Esse fluxo exige cliques desnecessários e esconde informação.

**Objetivo:** Mostrar todos os itens diretamente no card expandido usando uma `ScrollArea` com altura para ~4 itens, e eliminar completamente o modal de detalhes.

## Design

### Card expandido — seção de itens

- **Remove** o `previewItems = ordem.pecas.slice(0, 2)` e o texto "+X itens adicionais"
- **Remove** o botão "Ver detalhes" (`<Button onClick={onViewDetails}>`)
- **Envolve** a lista completa de itens (`ordem.pecas.map(...)`) em `<ScrollArea className="max-h-[220px]">`
- Cada item mantém o layout existente (nome, qtd, subtotal em row)
- Para ordens com ≤4 itens, nenhum scroll aparece — comportamento idêntico a uma lista normal
- Para ordens com >4 itens, scrollbar vertical aparece à direita

### ScrollArea — ajuste de cor do thumb

O componente `ScrollBar` em `components/ui/scroll-area.tsx` usa `bg-border` no thumb, que é `#26292e` — escuro demais contra fundos como `bg-input/30`. Ajustar para melhor contraste:

- **Thumb:** `bg-border-hover` (`#393d45`) — visível sem ser intrusivo
- **Thumb hover:** `bg-muted-foreground/50` — feedback visual no hover

### Remoção do modal de detalhes

Arquivos e referências a remover:

1. **`modal-detalhes-ordem.tsx`** — deletar arquivo inteiro
2. **`_components/index.ts`** — remover export do `ModalDetalhesOrdem`
3. **`page.tsx`** — remover:
   - Import de `ModalDetalhesOrdem`
   - As 2 instâncias de `<ModalDetalhesOrdem>` (linhas 673-697)
   - Props `onViewDetails` nos `<OrdemCard>` (linhas 458 e 496)
4. **`useOrdens.ts`** — remover:
   - Estado `viewingServico` / `setViewingServico`
   - Estado `viewingVenda` / `setViewingVenda`
   - Retornos correspondentes no objeto de retorno do hook
5. **`ordem-card.tsx`** — remover:
   - Prop `onViewDetails` da interface `OrdemCardProps`
   - Destructuring de `onViewDetails`
   - Import de `ClipboardList`

### Arquivos impactados

| Arquivo | Ação |
|---|---|
| `components/ui/scroll-area.tsx` | Ajustar cor do thumb |
| `app/(dashboard)/ordens/_components/ordem-card.tsx` | Remover truncamento, adicionar ScrollArea, remover botão "Ver detalhes" e prop `onViewDetails` |
| `app/(dashboard)/ordens/_components/modal-detalhes-ordem.tsx` | **Deletar** |
| `app/(dashboard)/ordens/_components/index.ts` | Remover export |
| `app/(dashboard)/ordens/page.tsx` | Remover modal instances, imports, e props `onViewDetails` |
| `app/(dashboard)/ordens/_hooks/useOrdens.ts` | Remover estado `viewing*` |

## Verificação

1. Abrir a página de ordens
2. Expandir um card com ≤4 itens → todos visíveis sem scroll
3. Expandir um card com >4 itens → scroll suave aparece, thumb com cor visível
4. Confirmar que o botão "Ver detalhes" não existe mais
5. Confirmar que o modal de detalhes não aparece em nenhum lugar
6. Confirmar que os botões de ação (Editar, Finalizar, Cancelar, Excluir) continuam funcionando no card
7. Testar responsividade mobile
8. `npm run build` sem erros de TypeScript
