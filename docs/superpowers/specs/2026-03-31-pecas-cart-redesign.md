# Redesign da Seção de Peças — Estilo Carrinho

**Data:** 2026-03-31
**Status:** Aprovado

## Contexto

A seção "Peças Utilizadas" nos modais de Nova Ordem de Serviço e Nova Ordem de Venda apresentava dois problemas:

1. **Overflow horizontal**: a linha `[SearchableSelect | Input w-20 | + Button]` somada à tabela de 5 colunas (Peça, Qtd, Preço Unit., Subtotal, X) ultrapassava a largura do modal (`max-w-[680px]`), causando quebra de layout.
2. **UX fragmentada**: o fluxo de 3 etapas — selecionar peça → digitar quantidade → clicar "+" — tinha um botão icon-only sem texto que não comunicava a ação com clareza.

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `app/(dashboard)/ordens/_components/modal-ordem-servico.tsx` | Substituir seção de peças |
| `app/(dashboard)/ordens/_components/modal-ordem-venda.tsx` | Substituir seção de peças (idêntico) |

## Design Aprovado — Opção B (Cart-style)

### Estrutura da UI

```
[SearchableSelect — "Buscar e selecionar peça..." — largura total]

[Nome da peça          R$ XX,XX · Estoque: N]  [−] [2] [+]  R$ XX,XX  [✕]
[Nome da peça 2        R$ XX,XX · Estoque: N]  [−] [1] [+]  R$ XX,XX  [✕]

[Total da Ordem ·································· R$ XXX,XX]
```

- O `<Input type="number">` separado é **removido**
- O botão `+` (ícone) standalone é **removido**
- A `<Table>` HTML é **removida**
- Os itens são renderizados como **flex rows** individuais

### Comportamento de Interação

**Adicionar peça:**
1. Usuário abre o `SearchableSelect` e seleciona uma peça
2. Se a peça **não está na lista** → adiciona com `quantidade = 1`
3. Se a peça **já está na lista** → incrementa `quantidade += 1` (validando estoque)
4. O `SearchableSelect` reseta para o placeholder após a seleção
5. Validação de estoque: se `totalSolicitado > peca.quantidade`, mostra `toast.error` e não adiciona

**Ajuste de quantidade nas linhas:**
- Botão `+` na linha incrementa qty em 1 (validando estoque)
- Botão `−` na linha decrementa qty em 1
  - **Desabilitado** quando `quantidade === 1` (botão fica `opacity-50 cursor-not-allowed`)
  - Para remover, o usuário usa o botão `✕`
- Botão `+` **desabilitado** quando `quantidade === peca.quantidade` (estoque esgotado)

**Remover peça:**
- Botão `✕` remove a linha imediatamente (sem confirmação)

**Estado vazio:**
- Quando `formData.pecas.length === 0`, exibe placeholder dashed:
  ```
  Nenhuma peça adicionada.
  Selecione no campo acima para adicionar.
  ```

### Layout de cada linha de peça

```tsx
<div className="flex items-center gap-3 p-3 bg-[#131316] border border-[#27272a] rounded-lg">
  {/* Info — item.peca pode ser null se a peça foi deletada do estoque */}
  <div className="flex-1 min-w-0">
    <p className="text-sm truncate">
      {item.peca?.name_peca ?? 'Peça não encontrada'}
    </p>
    <p className="text-xs text-[#71717a]">
      {formatCurrency(item.peca?.preco ?? 0)} · Estoque: {item.peca?.quantidade ?? 0}
    </p>
  </div>

  {/* Controles de quantidade */}
  <div className="flex items-center gap-2 shrink-0">
    <Button − disabled={item.quantidade <= 1} />
    <span className="w-5 text-center text-sm">{item.quantidade}</span>
    <Button + disabled={item.quantidade >= (item.peca?.quantidade ?? 0)} />
  </div>

  {/* Subtotal */}
  <span className="shrink-0 w-[64px] text-right font-semibold text-sm">
    {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
  </span>

  {/* Remover */}
  <Button ✕ variant="ghost" size="icon" onClick={() => handleRemovePeca(item.peca_id)} />
</div>
```

### Handlers de quantidade nas linhas

```ts
const handleIncrementPeca = (pecaId: number) => {
  const item = formData.pecas.find(p => p.peca_id === pecaId);
  if (!item || !item.peca) return;
  if (item.quantidade >= item.peca.quantidade) return; // segurança (botão já estará disabled)
  const updated = formData.pecas.map(p =>
    p.peca_id === pecaId ? { ...p, quantidade: p.quantidade + 1 } : p
  );
  setFormData({ ...formData, pecas: updated });
};

const handleDecrementPeca = (pecaId: number) => {
  const item = formData.pecas.find(p => p.peca_id === pecaId);
  if (!item || item.quantidade <= 1) return; // segurança (botão já estará disabled)
  const updated = formData.pecas.map(p =>
    p.peca_id === pecaId ? { ...p, quantidade: p.quantidade - 1 } : p
  );
  setFormData({ ...formData, pecas: updated });
};
```

### Estado inicial ao selecionar (handler `onValueChange` do SearchableSelect)

O `SearchableSelect` precisa de uma prop `onValueChange` que:
1. Recebe o `value` (string com o ID da peça)
2. Executa a lógica de adicionar/incrementar
3. Chama `setSelectedPecaId('')` para resetar o select

```ts
const handleSelectPeca = (pecaId: string) => {
  if (!pecaId) return;
  const id = parseInt(pecaId);
  const peca = pecas.find(p => p.id === id);
  if (!peca) return;

  const existingIndex = formData.pecas.findIndex(p => p.peca_id === id);
  if (existingIndex >= 0) {
    const item = formData.pecas[existingIndex];
    const novaQtd = item.quantidade + 1;
    if (novaQtd > peca.quantidade) {
      toast.error(`Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}`);
      return;
    }
    const updated = [...formData.pecas];
    updated[existingIndex] = { ...updated[existingIndex], quantidade: novaQtd };
    setFormData({ ...formData, pecas: updated });
  } else {
    setFormData({
      ...formData,
      pecas: [...formData.pecas, { peca_id: id, quantidade: 1, peca }]
    });
  }
  setSelectedPecaId('');
};
```

## Estado Local Afetado

- `selectedPecaId: string` — continua existindo, mas agora serve apenas para o `SearchableSelect` controlled
- `pecaQuantidade: number` e `setPecaQuantidade` — **removidos** (não são mais necessários)
- `handleAddPeca` — **removido**, substituído por `handleSelectPeca` e `handleIncrementPeca` / `handleDecrementPeca`

## Imports a Remover

Nos dois modais, após a mudança:
- `Table, TableBody, TableCell, TableHead, TableHeader, TableRow` — verificar se ainda usados; se não, remover do import

## O que NÃO muda

- A lógica de cálculo de total (`calcularTotal()`) permanece igual
- O campo `formData.pecas` e sua estrutura permanecem iguais
- O `SearchableSelect` com `pecaOptions` permanece igual
- A validação de estoque continua presente (só muda onde é chamada)
- O total exibido no rodapé do modal permanece igual
- Tudo fora da seção de peças (cliente, veículo, funcionário, datas, status) permanece intacto
