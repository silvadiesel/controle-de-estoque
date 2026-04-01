# Peças Cart Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a seção de peças nos dois modais de ordem (servico e venda) pelo padrão cart-style — sem tabela, sem input de quantidade separado, sem botão "+", com flex rows e controles ±.

**Architecture:** Cada modal terá um `SearchableSelect` que, ao selecionar uma peça, adiciona diretamente com qty=1 (ou incrementa se já existe). Cada item da lista é um flex row com botões `−/+` inline e botão `✕` para remover. O estado `pecaQuantidade` e o handler `handleAddPeca` são removidos; três novos handlers (`handleSelectPeca`, `handleIncrementPeca`, `handleDecrementPeca`) substituem a lógica.

**Tech Stack:** Next.js 15, TypeScript, Shadcn/UI, Tailwind CSS, Lucide React, Sonner (toast)

---

## Mapa de Arquivos

| Arquivo | Mudanças |
|---------|----------|
| `app/(dashboard)/ordens/_components/modal-ordem-servico.tsx` | Remover Table imports, adicionar Minus, remover estado + handler, reescrever JSX das peças |
| `app/(dashboard)/ordens/_components/modal-ordem-venda.tsx` | Idem |

---

## Task 1: Atualizar `modal-ordem-servico.tsx`

**Files:**
- Modify: `app/(dashboard)/ordens/_components/modal-ordem-servico.tsx`

- [ ] **Step 1: Atualizar import do lucide-react — adicionar `Minus`**

Localizar (linha ~38):
```tsx
import { Plus, Wrench, X } from 'lucide-react';
```
Substituir por:
```tsx
import { Minus, Plus, Wrench, X } from 'lucide-react';
```

- [ ] **Step 2: Remover imports de `Table` (linhas ~27–34)**

Localizar:
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
```
Deletar o bloco inteiro.

- [ ] **Step 3: Remover estado `pecaQuantidade` (linha ~130)**

Localizar:
```tsx
  const [pecaQuantidade, setPecaQuantidade] = useState(1);
```
Deletar a linha.

- [ ] **Step 4: Remover `setPecaQuantidade(1)` do reset do useEffect (linha ~143)**

Localizar dentro do `useEffect` de reset:
```tsx
      setSelectedPecaId('');
      setPecaQuantidade(1);
```
Substituir por:
```tsx
      setSelectedPecaId('');
```

- [ ] **Step 5: Substituir `handleAddPeca` pelos três novos handlers**

Localizar e remover todo o bloco `handleAddPeca` (linhas ~187–219):
```tsx
  const handleAddPeca = () => {
    if (!selectedPecaId || pecaQuantidade <= 0) return;

    const pecaId = parseInt(selectedPecaId);
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === pecaId);
    const quantidadeJaAdicionada = existingIndex >= 0 ? formData.pecas[existingIndex].quantidade : 0;
    const totalSolicitado = quantidadeJaAdicionada + pecaQuantidade;

    if (totalSolicitado > peca.quantidade) {
      toast.error(`Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}, Solicitado: ${totalSolicitado}`);
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...formData.pecas];
      updated[existingIndex].quantidade += pecaQuantidade;
      setFormData({ ...formData, pecas: updated });
    } else {
      setFormData({
        ...formData,
        pecas: [
          ...formData.pecas,
          { peca_id: pecaId, quantidade: pecaQuantidade, peca }
        ]
      });
    }

    setSelectedPecaId('');
    setPecaQuantidade(1);
  };
```

Substituir por:
```tsx
  const handleSelectPeca = (pecaId: string) => {
    if (!pecaId) return;
    const id = parseInt(pecaId);
    const peca = pecas.find((p) => p.id === id);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === id);
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

  const handleIncrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || !item.peca) return;
    if (item.quantidade >= item.peca.quantidade) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade + 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
  };

  const handleDecrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || item.quantidade <= 1) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade - 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
  };
```

- [ ] **Step 6: Substituir a seção JSX de peças**

Localizar o bloco inteiro da seção de peças no JSX:
```tsx
            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>Peças Utilizadas</Label>
              <div className='flex gap-2'>
                <SearchableSelect
                  options={pecaOptions}
                  value={selectedPecaId}
                  onValueChange={setSelectedPecaId}
                  placeholder="Selecione uma peça"
                  searchPlaceholder="Buscar peça..."
                  emptyText="Nenhuma peça encontrada"
                  className="flex-1"
                />
                <Input
                  type='number'
                  min={1}
                  value={pecaQuantidade || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPecaQuantidade(val === '' ? 0 : parseInt(val));
                  }}
                  onBlur={() => {
                    if (!pecaQuantidade || pecaQuantidade < 1) setPecaQuantidade(1);
                  }}
                  className='bg-[#131316] border-[#27272a] w-20'
                />
                <Button type='button' onClick={handleAddPeca} variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              {/* Lista de Peças */}
              {formData.pecas.length > 0 && (
                <div className='rounded-lg border border-[#27272a] overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='border-[#27272a] hover:bg-transparent'>
                        <TableHead className='text-[#71717a]'>Peça</TableHead>
                        <TableHead className='text-[#71717a] text-center'>Qtd</TableHead>
                        <TableHead className='text-[#71717a] text-right'>Preço Unit.</TableHead>
                        <TableHead className='text-[#71717a] text-right'>Subtotal</TableHead>
                        <TableHead className='text-[#71717a] w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.pecas.map((item) => (
                        <TableRow key={item.peca_id} className='border-[#27272a] hover:bg-[#1c1c22]/30'>
                          <TableCell className='text-foreground'>
                            {item.peca?.name_peca || 'Peça não encontrada'}
                          </TableCell>
                          <TableCell className='text-center text-foreground'>
                            {item.quantidade}
                          </TableCell>
                          <TableCell className='text-right text-[#71717a]'>
                            {formatCurrency(item.peca?.preco || 0)}
                          </TableCell>
                          <TableCell className='text-right text-foreground font-medium'>
                            {formatCurrency((item.peca?.preco || 0) * item.quantidade)}
                          </TableCell>
                          <TableCell>
                            <Button type='button' variant='ghost' size='icon' aria-label={`Remover peça ${item.peca?.name_peca || ''}`} onClick={() => handleRemovePeca(item.peca_id)}>
                              <X className='h-4 w-4 text-destructive' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
```

Substituir por:
```tsx
            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>Peças Utilizadas</Label>
              <SearchableSelect
                options={pecaOptions}
                value={selectedPecaId}
                onValueChange={handleSelectPeca}
                placeholder="Buscar e selecionar peça..."
                searchPlaceholder="Buscar peça..."
                emptyText="Nenhuma peça encontrada"
              />

              {formData.pecas.length === 0 ? (
                <div className='border border-dashed border-[#27272a] rounded-lg p-5 text-center'>
                  <p className='text-sm text-[#52525b]'>Nenhuma peça adicionada.</p>
                  <p className='text-xs text-[#3f3f46] mt-1'>Selecione no campo acima para adicionar.</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {formData.pecas.map((item) => (
                    <div key={item.peca_id} className='flex items-center gap-3 p-3 bg-[#131316] border border-[#27272a] rounded-lg'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm truncate text-foreground'>
                          {item.peca?.name_peca ?? 'Peça não encontrada'}
                        </p>
                        <p className='text-xs text-[#71717a]'>
                          {formatCurrency(item.peca?.preco ?? 0)} · Estoque: {item.peca?.quantidade ?? 0}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade <= 1}
                          onClick={() => handleDecrementPeca(item.peca_id)}
                          aria-label='Diminuir quantidade'
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <span className='w-5 text-center text-sm font-medium'>{item.quantidade}</span>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade >= (item.peca?.quantidade ?? 0)}
                          onClick={() => handleIncrementPeca(item.peca_id)}
                          aria-label='Aumentar quantidade'
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                      <span className='shrink-0 w-[64px] text-right text-sm font-semibold'>
                        {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 shrink-0'
                        aria-label={`Remover peça ${item.peca?.name_peca ?? ''}`}
                        onClick={() => handleRemovePeca(item.peca_id)}
                      >
                        <X className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
```

- [ ] **Step 7: Remover import do `Input` se não usado em mais nada no arquivo**

Verificar se `Input` aparece em outro lugar no arquivo (além da linha removida). Se NÃO aparecer, remover:
```tsx
import { Input } from '@/components/ui/input';
```

> Nota: no `modal-ordem-servico.tsx`, `Input` é usado também no campo `pecaQuantidade` que foi removido. Verifique se não há outro `Input` no arquivo antes de remover o import.

---

## Task 2: Atualizar `modal-ordem-venda.tsx`

**Files:**
- Modify: `app/(dashboard)/ordens/_components/modal-ordem-venda.tsx`

- [ ] **Step 1: Atualizar import do lucide-react — adicionar `Minus`**

Localizar (linha ~37):
```tsx
import {
  Banknote,
  CreditCard,
  Plus,
  QrCode,
  Receipt,
  ShoppingCart,
  Wallet,
  X
} from 'lucide-react';
```
Substituir por:
```tsx
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  Receipt,
  ShoppingCart,
  Wallet,
  X
} from 'lucide-react';
```

- [ ] **Step 2: Remover imports de `Table` (linhas ~26–34)**

Localizar:
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
```
Deletar o bloco inteiro.

- [ ] **Step 3: Remover estado `pecaQuantidade` (linha ~134)**

Localizar:
```tsx
  const [pecaQuantidade, setPecaQuantidade] = useState(1);
```
Deletar a linha.

- [ ] **Step 4: Remover `setPecaQuantidade(1)` do reset do useEffect (linha ~146)**

Localizar dentro do `useEffect` de reset:
```tsx
      setSelectedPecaId('');
      setPecaQuantidade(1);
```
Substituir por:
```tsx
      setSelectedPecaId('');
```

- [ ] **Step 5: Substituir `handleAddPeca` pelos três novos handlers**

Localizar e remover todo o bloco `handleAddPeca` (linhas ~167–199):
```tsx
  const handleAddPeca = () => {
    if (!selectedPecaId || pecaQuantidade <= 0) return;

    const pecaId = parseInt(selectedPecaId);
    const peca = pecas.find((p) => p.id === pecaId);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === pecaId);
    const quantidadeJaAdicionada = existingIndex >= 0 ? formData.pecas[existingIndex].quantidade : 0;
    const totalSolicitado = quantidadeJaAdicionada + pecaQuantidade;

    if (totalSolicitado > peca.quantidade) {
      toast.error(`Estoque insuficiente para "${peca.name_peca}". Disponível: ${peca.quantidade}, Solicitado: ${totalSolicitado}`);
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...formData.pecas];
      updated[existingIndex].quantidade += pecaQuantidade;
      setFormData({ ...formData, pecas: updated });
    } else {
      setFormData({
        ...formData,
        pecas: [
          ...formData.pecas,
          { peca_id: pecaId, quantidade: pecaQuantidade, peca }
        ]
      });
    }

    setSelectedPecaId('');
    setPecaQuantidade(1);
  };
```

Substituir por:
```tsx
  const handleSelectPeca = (pecaId: string) => {
    if (!pecaId) return;
    const id = parseInt(pecaId);
    const peca = pecas.find((p) => p.id === id);
    if (!peca) return;

    const existingIndex = formData.pecas.findIndex((p) => p.peca_id === id);
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

  const handleIncrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || !item.peca) return;
    if (item.quantidade >= item.peca.quantidade) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade + 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
  };

  const handleDecrementPeca = (pecaId: number) => {
    const item = formData.pecas.find((p) => p.peca_id === pecaId);
    if (!item || item.quantidade <= 1) return;
    const updated = formData.pecas.map((p) =>
      p.peca_id === pecaId ? { ...p, quantidade: p.quantidade - 1 } : p
    );
    setFormData({ ...formData, pecas: updated });
  };
```

- [ ] **Step 6: Substituir a seção JSX de peças**

Localizar o bloco inteiro da seção de peças no JSX:
```tsx
            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>Peças *</Label>
              <div className='flex gap-2'>
                <SearchableSelect
                  options={pecaOptions}
                  value={selectedPecaId}
                  onValueChange={setSelectedPecaId}
                  placeholder="Selecione uma peça"
                  searchPlaceholder="Buscar peça..."
                  emptyText="Nenhuma peça encontrada"
                  hasError={hasError('pecas')}
                  aria-describedby={hasError('pecas') ? 'error-pecas-venda' : undefined}
                  className="flex-1"
                />
                <Input
                  type='number'
                  min={1}
                  value={pecaQuantidade || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPecaQuantidade(val === '' ? 0 : parseInt(val));
                  }}
                  onBlur={() => {
                    if (!pecaQuantidade || pecaQuantidade < 1) setPecaQuantidade(1);
                  }}
                  className='bg-[#131316] border-[#27272a] w-20'
                />
                <Button type='button' onClick={handleAddPeca} variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              {hasError('pecas') && (
                <p id='error-pecas-venda' className='text-xs text-destructive'>{errors.pecas}</p>
              )}

              {/* Lista de Peças */}
              {formData.pecas.length > 0 && (
                <div className='rounded-lg border border-[#27272a] overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='border-[#27272a] hover:bg-transparent'>
                        <TableHead className='text-[#71717a]'>Peça</TableHead>
                        <TableHead className='text-[#71717a] text-center'>Qtd</TableHead>
                        <TableHead className='text-[#71717a] text-right'>Preço Unit.</TableHead>
                        <TableHead className='text-[#71717a] text-right'>Subtotal</TableHead>
                        <TableHead className='text-[#71717a] w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.pecas.map((item) => (
                        <TableRow key={item.peca_id} className='border-[#27272a] hover:bg-[#1c1c22]/30'>
                          <TableCell className='text-foreground'>
                            {item.peca?.name_peca || 'Peça não encontrada'}
                          </TableCell>
                          <TableCell className='text-center text-foreground'>
                            {item.quantidade}
                          </TableCell>
                          <TableCell className='text-right text-[#71717a]'>
                            {formatCurrency(item.peca?.preco || 0)}
                          </TableCell>
                          <TableCell className='text-right text-foreground font-medium'>
                            {formatCurrency((item.peca?.preco || 0) * item.quantidade)}
                          </TableCell>
                          <TableCell>
                            <Button type='button' variant='ghost' size='icon' aria-label={`Remover peça ${item.peca?.name_peca || ''}`} onClick={() => handleRemovePeca(item.peca_id)}>
                              <X className='h-4 w-4 text-destructive' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
```

Substituir por:
```tsx
            {/* Adicionar Peças */}
            <div className='space-y-3'>
              <Label className='text-[#a1a1aa] uppercase text-[10px] tracking-wider font-medium'>Peças *</Label>
              <SearchableSelect
                options={pecaOptions}
                value={selectedPecaId}
                onValueChange={handleSelectPeca}
                placeholder="Buscar e selecionar peça..."
                searchPlaceholder="Buscar peça..."
                emptyText="Nenhuma peça encontrada"
              />
              {hasError('pecas') && (
                <p id='error-pecas-venda' className='text-xs text-destructive'>{errors.pecas}</p>
              )}

              {formData.pecas.length === 0 ? (
                <div className='border border-dashed border-[#27272a] rounded-lg p-5 text-center'>
                  <p className='text-sm text-[#52525b]'>Nenhuma peça adicionada.</p>
                  <p className='text-xs text-[#3f3f46] mt-1'>Selecione no campo acima para adicionar.</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {formData.pecas.map((item) => (
                    <div key={item.peca_id} className='flex items-center gap-3 p-3 bg-[#131316] border border-[#27272a] rounded-lg'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm truncate text-foreground'>
                          {item.peca?.name_peca ?? 'Peça não encontrada'}
                        </p>
                        <p className='text-xs text-[#71717a]'>
                          {formatCurrency(item.peca?.preco ?? 0)} · Estoque: {item.peca?.quantidade ?? 0}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade <= 1}
                          onClick={() => handleDecrementPeca(item.peca_id)}
                          aria-label='Diminuir quantidade'
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <span className='w-5 text-center text-sm font-medium'>{item.quantidade}</span>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-7 w-7'
                          disabled={item.quantidade >= (item.peca?.quantidade ?? 0)}
                          onClick={() => handleIncrementPeca(item.peca_id)}
                          aria-label='Aumentar quantidade'
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                      <span className='shrink-0 w-[64px] text-right text-sm font-semibold'>
                        {formatCurrency((item.peca?.preco ?? 0) * item.quantidade)}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 shrink-0'
                        aria-label={`Remover peça ${item.peca?.name_peca ?? ''}`}
                        onClick={() => handleRemovePeca(item.peca_id)}
                      >
                        <X className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
```

- [ ] **Step 7: Remover import do `Input` se não usado em mais nada no arquivo**

Verificar se `Input` aparece em outro lugar no arquivo além do campo de quantidade removido. Se NÃO aparecer, remover:
```tsx
import { Input } from '@/components/ui/input';
```

---

## Task 3: Verificação manual

- [ ] **Step 1: Iniciar servidor de desenvolvimento**

```bash
pnpm dev
```

- [ ] **Step 2: Testar modal de Ordem de Serviço**

1. Abrir "Nova Ordem de Serviço"
2. Clicar no campo "Peças Utilizadas" → popover abre
3. Buscar e selecionar uma peça → item aparece na lista com qty=1, select reseta
4. Selecionar a mesma peça novamente → qty incrementa para 2
5. Clicar `+` no item → qty vira 3; clicar `−` → volta para 2
6. Reduzir qty até 1 → botão `−` fica desabilitado (opaco, não clicável)
7. Adicionar uma peça com estoque=1, tentar clicar `+` → botão `+` fica desabilitado
8. Clicar `✕` num item → remove da lista
9. Remover todos os itens → estado vazio dashed aparece
10. Confirmar que total atualiza corretamente a cada mudança
11. Sem itens o modal submete normalmente (peças não é campo obrigatório no servico)

- [ ] **Step 3: Testar modal de Ordem de Venda**

1. Repetir passos 1–10 acima
2. Tentar submeter sem nenhuma peça → erro "Adicione pelo menos uma peça à venda" aparece abaixo do SearchableSelect
3. Adicionar ao menos 1 peça → erro some e submit funciona

- [ ] **Step 4: Verificar modo Edição**

1. Abrir "Editar" em uma ordem existente com peças
2. Confirmar que as peças já salvas aparecem na lista (com qtd correta)
3. Ajustar quantidade e salvar → dados persistidos corretamente

- [ ] **Step 5: Confirmar que não há erros de TypeScript no terminal do servidor**

Verificar no output do `pnpm dev` que não há erros de compilação TypeScript relacionados aos arquivos modificados.
