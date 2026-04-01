# Plano: Migrar Fornecedor↔Peça para relação muitos-para-muitos

> **Objetivo:** Permitir que uma peça tenha múltiplos fornecedores, cada relação com sua própria quantidade (ex: "Filtro de Óleo — 5 da Fornecedor A, 12 da Fornecedor B").

---

## 1. Situação atual

### Schema no banco

```
pecas
├── id (serial PK)
├── name_peca
├── codigo
├── categoria_id → categorias.id
├── quantidade (estoque total)
├── preco (centavos)
├── fornecedor_id → fornecedor.id   ← FK simples, 1 peça = 1 fornecedor
├── localizacao (text[])
├── imagem
├── alerta
└── data_cadastro
```

**Limitação:** `pecas.fornecedor_id` é uma FK direta — cada peça só pode pertencer a **um** fornecedor. Não existe campo de quantidade nessa relação.

### Arquivo de schema Drizzle

```
db/schema/pecas.ts  →  fornecedor_id: integer('fornecedor_id').references(() => fornecedor.id)
```

---

## 2. Schema proposto

### Nova tabela: `fornecedor_pecas` (junction table)

```sql
CREATE TABLE fornecedor_pecas (
  id            SERIAL PRIMARY KEY,
  fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id) ON DELETE CASCADE,
  peca_id       INTEGER NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
  quantidade    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(fornecedor_id, peca_id)   -- evita duplicatas
);
```

**Novo arquivo Drizzle:** `db/schema/fornecedor-pecas.ts`
```typescript
import { fornecedor } from './fornecedor';
import { pecas } from './pecas';
import { integer, pgTable, serial, timestamp, unique } from 'drizzle-orm/pg-core';

export const fornecedorPecas = pgTable('fornecedor_pecas', {
  id: serial('id').primaryKey(),
  fornecedor_id: integer('fornecedor_id').notNull().references(() => fornecedor.id, { onDelete: 'cascade' }),
  peca_id: integer('peca_id').notNull().references(() => pecas.id, { onDelete: 'cascade' }),
  quantidade: integer('quantidade').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow()
}, (t) => [
  unique().on(t.fornecedor_id, t.peca_id)
]);

export type FornecedorPeca = typeof fornecedorPecas.$inferSelect;
export type NewFornecedorPeca = typeof fornecedorPecas.$inferInsert;
```

### Alteração em `pecas`

**Remover** a coluna `fornecedor_id` da tabela `pecas`. A relação agora vive na junction table.

> ⚠️ **ATENÇÃO:** Remover a coluna só **depois** de migrar os dados existentes para a junction table.

---

## 3. Plano de migration (ordem crítica)

```
Passo 1: Criar tabela fornecedor_pecas         (migration: add)
Passo 2: Migrar dados existentes               (migration: data)
         INSERT INTO fornecedor_pecas (fornecedor_id, peca_id, quantidade)
         SELECT fornecedor_id, id, 0
         FROM pecas
         WHERE fornecedor_id IS NOT NULL;
Passo 3: Remover coluna pecas.fornecedor_id     (migration: drop)
```

**Como executar com Drizzle:**
1. Adicionar o novo schema em `db/schema/fornecedor-pecas.ts`
2. Exportar de `db/schema/index.ts`
3. Rodar `npx drizzle-kit generate` → vai gerar SQL de criação da junction
4. **Antes de rodar `drizzle-kit push`**, inserir o SQL de migração de dados manualmente no migration file gerado
5. Só então remover `fornecedor_id` de `db/schema/pecas.ts` e gerar nova migration
6. Rodar `drizzle-kit push` ou `drizzle-kit migrate`

**Alternativa mais segura:** Manter `pecas.fornecedor_id` como coluna deprecada por um tempo (nullable, não usada pelo código), migrar os dados, e só dropar a coluna depois de confirmar que tudo funciona. Isso evita rollback destrutivo.

---

## 4. Mapa de impacto — arquivo por arquivo

### 4.1 Schema & DB

| Arquivo | Mudança | Detalhe |
|---------|---------|---------|
| `db/schema/fornecedor-pecas.ts` | **CRIAR** | Nova junction table conforme seção 2 |
| `db/schema/pecas.ts` | **MODIFICAR** | Remover linha `fornecedor_id: integer(...)` |
| `db/schema/index.ts` | **MODIFICAR** | Adicionar `export * from './fornecedor-pecas'` |
| `db/seed.ts` | **MODIFICAR** | Linha 394: hoje faz `fornecedor_id: pickOne(...)`. Mudar para: inserir peças sem `fornecedor_id`, depois popular `fornecedor_pecas` com INSERT separado |

### 4.2 API — Endpoints

| Arquivo | Mudança | Detalhe |
|---------|---------|---------|
| `app/api/fornecedor-pecas/route.ts` | **CRIAR** | Novo endpoint CRUD da relação |
| `app/api/fornecedor-pecas/[id]/route.ts` | **CRIAR** | PUT (alterar quantidade), DELETE (desvincular) |
| `app/api/produtos/route.ts` | **MODIFICAR** | GET: o filtro `?fornecedor_id=X` hoje faz `where(eq(pecas.fornecedor_id, X))`. Precisa mudar para JOIN com `fornecedor_pecas` |
| `app/api/produtos/route.ts` | **MODIFICAR** | POST: hoje aceita `fornecedor_id` no body. Remover — vínculo agora é via API separada |
| `app/api/produtos/[id]/route.ts` | **MODIFICAR** | PUT: hoje aceita `fornecedor_id` no body. Remover campo do `.set()` |

**Novo endpoint `GET /api/fornecedor-pecas?fornecedor_id=X`:**
```typescript
// Retorna peças vinculadas a um fornecedor, com quantidade
const result = await db
  .select({
    id: fornecedorPecas.id,
    fornecedor_id: fornecedorPecas.fornecedor_id,
    peca_id: fornecedorPecas.peca_id,
    quantidade: fornecedorPecas.quantidade,
    peca: {
      name_peca: pecas.name_peca,
      codigo: pecas.codigo,
      preco: pecas.preco
    }
  })
  .from(fornecedorPecas)
  .innerJoin(pecas, eq(fornecedorPecas.peca_id, pecas.id))
  .where(eq(fornecedorPecas.fornecedor_id, Number(fornecedorId)));
```

**Novo endpoint `POST /api/fornecedor-pecas`:**
```typescript
// Body: { fornecedor_id, peca_id, quantidade }
// Insere na junction. Retorna 409 se já existe.
```

**Novo endpoint `PUT /api/fornecedor-pecas/[id]`:**
```typescript
// Body: { quantidade }
// Atualiza a quantidade da relação existente.
```

**Novo endpoint `DELETE /api/fornecedor-pecas/[id]`:**
```typescript
// Remove a relação (desvincular).
```

### 4.3 Hooks (frontend)

| Arquivo | Mudança | Detalhe |
|---------|---------|---------|
| `app/(dashboard)/fornecedores/_hooks/usePecasByFornecedor.ts` | **REESCREVER** | Hoje faz GET/PUT em `/api/produtos/[id]` manipulando `fornecedor_id`. Mudar para usar `/api/fornecedor-pecas`. Adicionar handler de alterar quantidade |
| `app/(dashboard)/produtos/_hook/usePecas.ts` | **MODIFICAR** | Múltiplos pontos afetados (ver detalhe abaixo) |

**Detalhes `usePecas.ts`:**

| Linha | Código atual | O que muda |
|-------|-------------|------------|
| 62 | `fornecedor_id: null` em `pecaVazia` | Remover campo |
| 131-134 | `fornecedorItems` para ComboboxSearch | Avaliar: manter como filtro de lista? Ou remover o dropdown de fornecedor do modal? |
| 143-151 | `filteredProducts` filtra por `peca.fornecedor_id` | Precisa de JOIN: buscar as relações da junction table e filtrar por elas |
| 186 | `createPeca` envia `fornecedor_id` no POST | Remover campo do body |
| 213 | `updatePeca` envia `fornecedor_id` no PUT | Remover campo do body |
| 332 | `handleEdit` copia `fornecedor_id` da peça | Remover campo |
| 346-350 | `getFornecedorName(fornecedorId)` | Mudar: uma peça agora pode ter N fornecedores. Retornar lista de nomes ou o primeiro |

### 4.4 Componentes (frontend)

| Arquivo | Mudança | Detalhe |
|---------|---------|---------|
| `app/(dashboard)/fornecedores/page.tsx` | **MODIFICAR** | Adicionar controle de quantidade (input numérico ou `+`/`-`) no card de cada peça vinculada. O card hoje mostra `codigo · R$ preço` — adicionar `× quantidade` |
| `app/(dashboard)/fornecedores/_components/modal-vincular-peca.tsx` | **MODIFICAR** | Adicionar campo de quantidade no modal (input numérico). Hoje vincula sem quantidade |
| `app/(dashboard)/produtos/_components/modal-peças.tsx` | **MODIFICAR** | Linha 255-272: campo "Fornecedor" com `ComboboxSearch` seleção única. Decisão necessária (ver seção 5) |
| `app/(dashboard)/produtos/_components/card-pecas.tsx` | **MODIFICAR** | Linha 13/64: `supplierName: string` → mudar para `supplierNames: string[]` ou `string` com múltiplos nomes concatenados |
| `app/(dashboard)/fornecedores/page.tsx` (linha 196) | **MODIFICAR** | `allPecas.filter(p => p.fornecedor_id === null)` → Mudar: uma peça "disponível" agora é qualquer peça (ela pode ter N fornecedores). Ou filtrar as que já estão vinculadas ao fornecedor específico |

### 4.5 Validators

| Arquivo | Mudança | Detalhe |
|---------|---------|---------|
| `app/utils/validators.ts` (linha 222) | **MODIFICAR** | `fornecedor_id: z.number().optional().nullable()` no `pecaSchema` — remover este campo |
| `app/utils/validators.ts` | **ADICIONAR** | Novo schema: `fornecedorPecaSchema = z.object({ fornecedor_id: z.number(), peca_id: z.number(), quantidade: z.number().min(0).int() })` |

---

## 5. Decisões de design pendentes

### 5.1 Modal de peças — campo "Fornecedor"

Hoje o modal de criar/editar peça (`modal-peças.tsx`) tem um campo "Fornecedor" com seleção única. Com a junction table, esse campo perde sentido como FK direta.

**Opções:**
- **A) Remover o campo do modal.** Vínculo fornecedor↔peça acontece exclusivamente na tela de Fornecedores. Modal de peça fica mais simples.
- **B) Transformar em multi-select.** Permitir selecionar múltiplos fornecedores e quantidade de cada um direto no modal de peça. Mais complexo, mas centraliza.
- **C) Manter como "fornecedor principal" (informativo).** Não salva na junction — é só uma referência visual. Confuso e inconsistente.

**Recomendação:** Opção **A** — mais limpa, menos risco de inconsistência. Vínculo fica na tela de Fornecedores onde tem contexto.

### 5.2 Filtro por fornecedor na tela de Produtos

Hoje a tela de Produtos tem um filtro dropdown "por fornecedor" que filtra `peca.fornecedor_id`. Com a junction table:

**Opções:**
- **A) Manter o filtro** — mas agora faz JOIN com `fornecedor_pecas`. Uma peça aparece se tem pelo menos uma relação com o fornecedor selecionado.
- **B) Remover o filtro** — simplifica, mas perde funcionalidade.

**Recomendação:** Opção **A** — o filtro é útil, só muda a query por trás.

### 5.3 Card de peça — nome do fornecedor

Hoje o `CardPecas` mostra `supplierName` (1 nome). Com N fornecedores:

**Opções:**
- **A) Mostrar o primeiro fornecedor + badge "+N"** — ex: `AutoPeças Brasil +2`
- **B) Mostrar todos separados por vírgula** — pode truncar em nomes longos
- **C) Não mostrar fornecedor no card** — informação vive na tela de Fornecedores

**Recomendação:** Opção **A** — informativo sem poluir.

### 5.4 "Peças disponíveis" para vincular

Hoje: `allPecas.filter(p => p.fornecedor_id === null)` — só mostra peças sem nenhum fornecedor.

Com junction table: uma peça pode ter fornecedor A e ainda ser vinculável ao fornecedor B.

**Nova lógica:** Mostrar todas as peças **que ainda não estão vinculadas ao fornecedor específico sendo expandido**:
```typescript
const pecasJaVinculadas = pecasByFornecedor.get(fornecedorId) ?? [];
const idsVinculados = new Set(pecasJaVinculadas.map(p => p.peca_id));
const pecasDisponiveis = allPecas.filter(p => !idsVinculados.has(p.id));
```

### 5.5 Quantidade — o que ela representa?

**Esclarecer com o usuário:**
- É a **quantidade que o fornecedor pode fornecer** (capacidade)?
- É a **quantidade comprada do fornecedor** (histórico)?
- É a **quantidade em estoque que veio desse fornecedor** (rastreabilidade)?

Isso define se o campo é editável livremente, se é incrementado por compras, ou se é calculado.

**Premissa atual:** Quantidade editável manualmente — o usuário define "compro X desse fornecedor". Pode ser alterada a qualquer momento.

---

## 6. Estimativa de esforço

| Etapa | Tempo estimado | Risco |
|-------|---------------|-------|
| Schema + migration | 30 min | Médio — migration de dados precisa de cuidado |
| Novos endpoints API | 30 min | Baixo |
| Reescrever `usePecasByFornecedor` | 30 min | Baixo |
| Adaptar `usePecas` (produtos) | 30 min | Médio — vários pontos de contato |
| Adaptar modal-peças | 15 min | Baixo (se opção A: remover campo) |
| Adaptar fornecedores/page (qty controls) | 30 min | Baixo |
| Adaptar card-pecas e filtro produtos | 15 min | Baixo |
| Seed + validators | 15 min | Baixo |
| Testes manuais e ajustes | 30 min | — |
| **Total** | **~3–4 horas** | |

---

## 7. Ordem de execução recomendada

```
1. db/schema/fornecedor-pecas.ts          — criar junction table
2. db/schema/index.ts                     — exportar novo schema
3. drizzle-kit generate + migration       — criar tabela + migrar dados
4. db/schema/pecas.ts                     — remover fornecedor_id (depois de migrar)
5. app/utils/validators.ts                — remover fornecedor_id de pecaSchema, adicionar fornecedorPecaSchema
6. app/api/fornecedor-pecas/              — criar endpoints CRUD
7. app/api/produtos/route.ts              — remover fornecedor_id do POST, adaptar GET
8. app/api/produtos/[id]/route.ts         — remover fornecedor_id do PUT
9. fornecedores/_hooks/usePecasByFornecedor.ts — reescrever para nova API
10. fornecedores/_components/modal-vincular-peca.tsx — adicionar campo quantidade
11. fornecedores/page.tsx                 — adicionar controle de quantidade nos cards
12. produtos/_hook/usePecas.ts            — remover refs a fornecedor_id, adaptar filtro
13. produtos/_components/modal-peças.tsx  — remover campo Fornecedor (opção A)
14. produtos/_components/card-pecas.tsx   — adaptar supplierName
15. db/seed.ts                            — adaptar para junction table
16. Build + teste manual
```

---

## 8. Riscos e pontos de atenção

1. **Migration destrutiva:** Dropar `pecas.fornecedor_id` antes de migrar dados = perda de dados. Seguir a ordem da seção 3 rigorosamente.
2. **Dados existentes:** Se já existem peças com `fornecedor_id` em produção, a migration de dados precisa funcionar. Testar com dump do banco antes.
3. **Performance:** A junction table adiciona JOINs. Para o volume desse sistema (dezenas/centenas de peças), impacto é zero. Não precisa de índice extra além da UNIQUE constraint.
4. **Quantidade vs estoque:** A `quantidade` na junction table é **separada** de `pecas.quantidade` (estoque). São conceitos diferentes. `pecas.quantidade` = quanto tem no estoque total. `fornecedor_pecas.quantidade` = quanto se compra/recebe daquele fornecedor.
5. **Ordens de serviço/venda:** As tabelas `ordem_servico` e `ordem_venda` **não referenciam** `fornecedor_id` diretamente — elas referenciam peças por `peca_id`. Então não são afetadas pela mudança.
6. **Movimentações:** A tabela `movimentacoes` é um log genérico (entidade + entidade_id + descrição). O valor `'fornecedor'` no enum é só para logar ações no fornecedor em si — não referencia `pecas.fornecedor_id`. Não é afetada.

---

## 9. Pontos fáceis de esquecer (revisão crítica)

### 9.1 Página órfã: `fornecedores/movimentacoes/page.tsx`

Existe uma página em `app/(dashboard)/fornecedores/movimentacoes/page.tsx` que usa `useStockStore` (Zustand com dados mocados em `lib/store.ts`) — **não usa o banco de dados real**. É um resquício de um protótipo antigo. Ela tem:
- `Product`, `StockMovement`, `Supplier` — tipos locais do Zustand, não do Drizzle
- `addMovement` — grava em localStorage, não no banco
- UI com padrão antigo (Dialog manual, sem DialogShell)

**Decisão necessária:**
- **A) Deletar** — se movimentações de estoque real já existem em `/movimentacoes` (que usa a tabela `movimentacoes` do banco)
- **B) Migrar** — se a funcionalidade de "entrada/saída rápida por fornecedor" faz sentido, reconstruir usando os dados reais
- **C) Integrar com a junction table** — registrar compra de fornecedor = criar movimentação + incrementar `pecas.quantidade` + registrar na junction. Escopo grande mas seria o fluxo ideal

**Risco de esquecer:** essa página vai continuar usando `useStockStore` (dados fake) enquanto o resto do sistema usa Drizzle. Inconsistência silenciosa.

### 9.2 `lib/store.ts` — Zustand store legado

O arquivo `lib/store.ts` define `Product`, `Supplier`, `StockMovement`, `Category`, `Client` como tipos Zustand com persist (localStorage). É o sistema antigo antes da migração para Drizzle. Contém:
- `supplier: string` dentro de `Product` (string, não FK)
- Toda a lógica de CRUD duplicada em memória

**Ponto cego:** Qualquer página que ainda use `useStockStore` está operando com dados completamente separados do banco. Hoje pelo menos `fornecedores/movimentacoes/page.tsx` usa. Podem existir outros.

### 9.3 Preço por fornecedor

O plano atual adiciona só `quantidade` na junction table. Mas na prática, **fornecedores diferentes cobram preços diferentes pela mesma peça**. Exemplo:
- Filtro de óleo: R$ 45 na Fornecedor A, R$ 38 na Fornecedor B

**Se não adicionar `preco` na junction agora**, vai ter que fazer outra migration depois. Considerar:
```sql
fornecedor_pecas
├── ...
├── quantidade INTEGER NOT NULL DEFAULT 0
├── preco_unitario INTEGER          -- centavos, nullable (nem sempre sabe o preço)
└── ...
```

**Impacto:** Muda o card de peça no collapsible de fornecedores — em vez de mostrar o preço global da peça, mostraria o preço daquele fornecedor específico.

### 9.4 Workflow: compra de fornecedor → estoque

Hoje não existe conexão entre "vincular peça a fornecedor" e "dar entrada no estoque". São ações isoladas. Com a junction table + quantidade, surge a pergunta natural:

> "Se eu comprei 10 unidades do fornecedor A, isso deveria incrementar `pecas.quantidade` automaticamente?"

**Se sim:** vincular/atualizar quantidade na junction = criar movimentação de entrada + somar em `pecas.quantidade`. É uma transaction.
**Se não:** quantidade na junction é apenas informativa (capacidade, referência), e entrada de estoque continua manual.

**Recomendação:** Manter separado por agora (quantidade na junction é informativa). Integrar com movimentações é um feature à parte, bem mais complexa, que envolve fluxo de compra (nota fiscal, data, lote, etc).

### 9.5 Enum de `entidade` em movimentações

A tabela `movimentacoes` tem um enum de entidades:
```typescript
pgEnum('entidade', ['produto', 'cliente', 'fornecedor', 'categoria', 'veiculo', 'ordem_venda', 'ordem_servico', 'usuario'])
```

Se no futuro quiser logar ações de vincular/desvincular (ex: "Peça X vinculada ao Fornecedor Y"), pode precisar de um novo valor no enum, como `'fornecedor_peca'`. Migration de enum no Postgres é chata (ALTER TYPE ADD VALUE). Anotar como possibilidade futura.

### 9.6 Seed (`db/seed.ts`) — relação N:N

Hoje o seed faz:
```typescript
fornecedor_id: pickOne(insertedSuppliers, random).id  // 1 fornecedor por peça
```

Com a junction, cada peça precisa de 1 a 3 relações na `fornecedor_pecas`. O seed precisa:
1. Inserir peças **sem** `fornecedor_id`
2. Depois inserir relações na junction com quantidades aleatórias
3. Evitar duplicatas (mesma peça + mesmo fornecedor)

### 9.7 `Content-Type` header ausente em alguns fetches

Nos hooks atuais (`usePecasByFornecedor.ts`, `useFornecedores.ts`), os `fetch` com `POST`/`PUT` não enviam `Content-Type: application/json`. Hoje funciona porque Next.js infere, mas é uma bomba-relógio:
```typescript
// Atual (sem header)
body: JSON.stringify({ ... })

// Correto
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ ... })
```

Aproveitar a migration pra corrigir em todos os hooks.

### 9.8 ON DELETE CASCADE — implicações

O schema proposto usa `ON DELETE CASCADE` na junction:
- Deletar fornecedor → deleta todas as relações (OK, faz sentido)
- Deletar peça → deleta todas as relações (OK)

Mas a API de deletar fornecedor (`app/api/fornecedores/[id]/route.ts`) pode ter validação que impede deletar se tem peças vinculadas. Revisar: com CASCADE, a validação não é mais necessária? Ou o comportamento esperado é bloquear a exclusão?

### 9.9 Tipo `Peca` muda (breaking change no tipo TypeScript)

Ao remover `fornecedor_id` de `pecas`, o tipo `Peca` inferido pelo Drizzle perde esse campo. Todo código que faz `peca.fornecedor_id` vai dar erro de tipo no build. Os locais já estão mapeados na seção 4, mas é fácil esquecer de:
- Props de componentes que passam `Peca` inteira (ex: `CardPecas` recebe `peca: Peca`)
- Destructuring em hooks que espalham `{ ...peca }` — se `fornecedor_id` sumiu do tipo, o spread não inclui mais, mas `JSON.stringify` pode ter restos

### 9.10 Ordens de serviço/venda já usam junction tables — usar como referência

Detalhe importante que estava subnotado: **o projeto já tem duas junction tables funcionando**:

```
ordem_servico_pecas (ordem_servico_id, peca_id, quantidade)
ordem_venda_pecas   (ordem_venda_id,   peca_id, quantidade)
```

Ambas seguem exatamente o mesmo padrão que a `fornecedor_pecas` vai seguir. Isso é bom:
- **A nova junction pode copiar a estrutura** (`id serial PK`, `FK NOT NULL`, `FK NOT NULL`, `quantidade NOT NULL`)
- As queries de JOIN nos endpoints de ordens (`app/api/ordens/servico/route.ts`, `app/api/ordens/venda/route.ts`) são referência direta pro novo endpoint

Mas também significa: **se a `fornecedor_pecas` for modelada diferente** (ex: com `preco_unitario`, `created_at`), ela fica inconsistente com as outras junction tables do projeto. Decidir se vale normalizar todas ou aceitar a diferença.

### 9.11 `OrdemItemsBuilder` e `useOrdens` consomem tipo `Peca` inteiro

O componente `OrdemItemsBuilder` recebe `pecas: Peca[]` para montar o seletor de peças nas ordens. O `useOrdens.ts` faz `fetch('/api/produtos')` e guarda como `Peca[]`.

**O tipo `Peca` muda** quando `fornecedor_id` é removido. Esses componentes **não acessam** `peca.fornecedor_id` diretamente, então não vão quebrar em runtime. Mas:
- O TypeScript vai parar de inferir `fornecedor_id` do tipo — qualquer `Pick<Peca, ...>` que inclua `fornecedor_id` quebra
- Verificar `ordens-view.ts` linhas 81-82: `Pick<Peca, 'id' | 'name_peca' | 'preco'>` — esse está OK, não pega `fornecedor_id`

**Veredicto:** Ordens **não quebram**, mas precisa verificar no build.

### 9.12 API GET `/api/produtos` retorna dados para TODOS os consumidores

Hoje o `GET /api/produtos` retorna `pecas.*` incluindo `fornecedor_id`. Quem consome:

| Consumidor | O que usa | Quebra? |
|-----------|----------|---------|
| `usePecas` (produtos) | `peca.fornecedor_id` para filtro e modal | ✅ SIM |
| `usePecasByFornecedor` (fornecedores) | `peca.fornecedor_id` para agrupar | ✅ SIM |
| `useOrdens` (ordens) | `peca.id`, `peca.name_peca`, `peca.preco`, `peca.quantidade` | ❌ NÃO |
| `OrdemItemsBuilder` | `peca.id`, `peca.name_peca`, `peca.preco`, `peca.quantidade` | ❌ NÃO |

Os dois que quebram precisam migrar para usar o novo endpoint `/api/fornecedor-pecas`.

### 9.13 DELETE de fornecedor — sem proteção contra peças vinculadas

Hoje `DELETE /api/fornecedores/[id]` faz:
```typescript
await db.delete(schema.fornecedor).where(eq(schema.fornecedor.id, id));
```

**Sem nenhuma verificação** se o fornecedor tem peças vinculadas. Hoje isso funciona porque `pecas.fornecedor_id` é uma FK simples nullable — o Postgres permite o DELETE porque a FK não tem `ON DELETE RESTRICT`.

Com a junction table usando `ON DELETE CASCADE`, deletar um fornecedor vai deletar silenciosamente todas as relações `fornecedor_pecas`. Isso pode ser:
- **Desejado:** "deletou o fornecedor, limpa tudo"
- **Perigoso:** "deletou sem querer e perdeu todas as relações de peças"

Compare com `DELETE /api/produtos/[id]`:
```typescript
// Antes de deletar, verifica se a peça está em alguma ordem
const referenciada = await db
  .select().from(schema.ordemServicoPecas)
  .where(eq(schema.ordemServicoPecas.peca_id, id)).limit(1);
if (referenciada.length > 0) {
  return Response({ error: 'Não é possível excluir...' }, { status: 409 });
}
```

**Recomendação:** Adicionar verificação similar no DELETE de fornecedor — se tem peças vinculadas na junction, bloquear ou avisar.

### 9.14 `db:push` vs `db:migrate` — sem diretório `drizzle/`

O projeto não tem diretório `drizzle/` (migrations). Isso significa que usa `drizzle-kit push` (sincronização direta, sem migration files). Implicações:

- **`push` não suporta migração de dados** — ele só sincroniza o schema. Não tem como inserir `INSERT INTO fornecedor_pecas SELECT ... FROM pecas` dentro de um `push`
- A migração de dados precisa ser feita **manualmente**: rodar um script SQL ou um script Node.js que leia os dados antigos e insira na junction
- Se o `push` remover `fornecedor_id` antes da migração de dados, os dados se perdem

**Ordem segura com `push`:**
1. Adicionar `fornecedor_pecas` ao schema → `push` (cria tabela nova)
2. Rodar script manual de migração de dados
3. Remover `fornecedor_id` de `pecas` → `push` (dropa coluna)

**Risco:** Se fizer tudo de uma vez no schema e rodar `push`, o Drizzle vai criar a junction E dropar a coluna simultaneamente, antes de migrar dados.

### 9.15 Sidebar / navegação — `fornecedores/movimentacoes` aparece?

Verificar se a sidebar tem link para `fornecedores/movimentacoes`. Se sim, está apontando para a página órfã com dados Zustand (seção 9.1). Se não, a página é acessível apenas por URL direta — dead route.

### 9.16 Testes — `ordens-view.test.ts`

Existe um arquivo de teste `app/(dashboard)/ordens/_lib/ordens-view.test.ts` que testa funções de view de ordens. Os testes criam objetos mock com `pecas: []`. Como as ordens não usam `fornecedor_id`, esses testes **não devem quebrar**, mas vale rodar depois da migration para confirmar.
