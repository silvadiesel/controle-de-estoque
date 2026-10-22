# Segurança: supply chain + acesso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar o vetor de supply chain dos worms npm de out/2026 e as brechas de acesso achadas na varredura de 22/10/2026, num PR único para `main`.

**Architecture:** Lockfile versionado + `ignore-scripts` + deps atualizadas; guards de permissão/status no servidor (better-auth `databaseHooks` + `requireRoutePermission`); RLS ligado no schema Drizzle; código de cadastro de 8 caracteres gerado com `node:crypto`; validação de imagem no servidor.

**Tech Stack:** Next 16 (App Router, `proxy.ts`), better-auth 1.7.5, Drizzle 0.45 + drizzle-kit 0.31 (`db:push`, sem pasta `drizzle/`), Supabase Postgres, npm 11.

**Branch:** `fix/seguranca-supply-chain-acesso` (criada da `main` atualizada em 8d1c3a7).

## Design aprovado

Um PR para `main`, quatro blocos:

1. **Dependências:** versionar `package-lock.json` (sai do `.gitignore`), script `clear` não apaga lockfile; `next` → 16.3.8 (advisory crítico 16.0.0–16.3.7) e `eslint-config-next` → 16.3.8; `sharp` ≥0.35.5 e `source-map-js` 1.2.2 via lockfile; `shadcn` sai do devDeps (é só CLI, traz msw/MCP SDK/hono vulneráveis; usar `npx shadcn@3.8.5` quando precisar); `.npmrc` do projeto com `ignore-scripts=true`, validado com `npm ci` + `next build` limpos.
2. **Acesso:** `GET /api/movimentacoes/[id]` exige `view_movimentacoes`; usuário com `status=false` não loga (hook de sessão), é barrado em `requireRoutePermission`/`requirePagePermission` e tem as sessões apagadas ao ser desativado; cron recusa quando `CRON_SECRET` está vazio.
3. **RLS:** checagem read-only em `pg_class`, depois `.enableRLS()` em todas as tabelas e `db:push`. App não é afetada (conecta como `postgres`, dono das tabelas; heartbeat REST usa `service_role`).
4. **Endurecimento:** código de cadastro com 8 caracteres maiúsculos sem ambíguos (sem 0/O/1/I), gerado com `node:crypto` nos três geradores, comparação case-insensitive, regex/input/coluna `varchar(8)` ajustados; `imagem` aceita só `null` ou data URL `image/jpeg|png|webp` até 5.000.000 caracteres.

Ordem de deploy: `db:push` (alarga coluna + RLS) antes do merge; o código de 4 dígitos atual continua válido até o admin regenerar após o deploy.

Fora do escopo: sessão de 1 ano (decisão documentada em `lib/auth.ts`), CSP.

## Global Constraints

- Nada de `git commit`/push/PR: a Larissa pede quando quiser.
- `better-auth` continua exato `1.7.5`.
- O único banco é produção (Supabase `silva-diesel-estoque`). Qualquer escrita nele (`db:push`, criar usuário de teste) é PARADA: pedir aprovação antes.
- UI segue `CLAUDE.md` do projeto (tokens, Tailwind nativo, labels de modal).
- Harness: `node:test` + `node:assert/strict`, arquivos `*.test.ts` colocados ao lado do módulo, rodados com `npx tsx --test <arquivo>` (não há script `test`). Funções puras novas ganham teste visto falhando. Resto: `npx tsc --noEmit`, `npm run lint`, `npm run build`, curl e browser.
- Read cada arquivo antes de Edit; se o Edit falhar, re-Read; não commitar.

## Review Focus

- Cookie de sessão forjado (`better-auth.session_token=x`) em qualquer `app/api/**` → 401, nunca dados. Task 2 cobre `movimentacoes/[id]`; o grep do Step 2.1 cobre o resto.
- Usuário desativado com sessão já aberta → próxima chamada de API dá 403 e a página redireciona para `/login`.
- Código digitado em minúsculas ou com espaços no cadastro → aceito (normalização no hook, não só no front).
- Admin edita o código à mão em Configurações com caractere ambíguo (`0`, `O`, `1`, `I`) ou tamanho ≠ 8 → 400 com mensagem clara.
- Build da Vercel com `ignore-scripts=true` → binários nativos (esbuild, unrs-resolver, sharp) funcionam pelos pacotes opcionais de plataforma.

---

### Task 1: Dependências e supply chain

**Files:**
- Modify: `.gitignore` (remover a linha `package-lock.json`; manter os lockfiles dos outros gerenciadores)
- Modify: `package.json` (`next`, `eslint-config-next`, remover `shadcn`, script `clear` sem os `rm -rf` de lockfile)
- Create: `.npmrc` (`ignore-scripts=true`)
- Modify: `package-lock.json` (regenerado)

- [ ] **Step 0:** Para `next@16.3.8`, `eslint-config-next@16.3.8`, e as versões que `npm view sharp@^0.35.5 version` / `source-map-js@1.2.2` resolveriam: `npm view <pkg>@<ver> time --json` (ou `npm view <pkg> time --json | grep '"<ver>"'`). Versão publicada há menos de 7 dias (hoje = 2026-10-22) → parar e reportar, não instalar.
- [ ] **Step 1:** `npm install next@16.3.8 eslint-config-next@16.3.8 && npm uninstall shadcn && npm update sharp source-map-js`
- [ ] **Step 2:** Criar `.npmrc` com `ignore-scripts=true`; editar `.gitignore` e o script `clear`.
- [ ] **Step 3 (Bash isolado):** `rm -rf node_modules .next`
- [ ] **Step 4:** `npm ci && npm run build` → build OK. Se falhar por binário nativo, parar e reportar (não remover o `.npmrc` sozinho).
- [ ] **Step 5:** `npm audit --omit=dev` → 0 critical/high. `npm audit` completo: listar o residual (esperado só `drizzle-kit`/esbuild-kit e possivelmente `eslint-config-next`/fast-glob, ambos dev-only).
- [ ] **Step 6:** `git status --short` mostra `package-lock.json` como untracked (não ignorado).

### Task 2: Brechas de acesso

**Files:**
- Modify: `app/api/movimentacoes/[id]/route.ts` (guard `view_movimentacoes`, igual a `app/api/movimentacoes/route.ts`)
- Modify: `lib/auth.ts` (`databaseHooks.session.create.before`)
- Modify: `lib/server/access-control.ts` (`requireRoutePermission`, `requirePagePermission`)
- Modify: `app/api/users/[id]/route.ts` (PUT apaga sessões quando `status === false`)
- Modify: `app/(auth)/login/page.tsx` (`getLoginErrorMessage`)
- Modify: `app/api/cron/heartbeat/route.ts`, `app/api/cron/cleanup/route.ts`

**Interfaces:** nenhuma nova exportada.

- [ ] **Step 1:** `rg --files-without-match "requireRoutePermission" app/api --glob route.ts` → só `auth/[...all]` e `cron/*` podem aparecer depois da task. Antes: aparece também `movimentacoes/[id]` (registrar a saída como "falha").
- [ ] **Step 2:** `movimentacoes/[id]` GET chama `requireRoutePermission(request, 'view_movimentacoes')` e retorna a Response se for Response.
- [ ] **Step 3:** Em `lib/auth.ts`, `databaseHooks.session.create.before(session)`: busca `user.status` por `session.userId`; se `false`, `throw new APIError('FORBIDDEN', { message: 'Usuário inativo' })`.
- [ ] **Step 4:** Em `access-control.ts`: `session.user.status === false` → `requireRoutePermission` retorna 403 `{ error: 'Usuário inativo' }`; `requirePagePermission` faz `redirect('/login')`.
- [ ] **Step 5:** PUT de `users/[id]`: quando `status === false`, `db.delete(schema.session).where(eq(schema.session.userId, id))` após o update.
- [ ] **Step 6:** `getLoginErrorMessage`: se a mensagem contém `inativo`, retornar `'Usuário inativo. Fale com o administrador.'` (antes das outras checagens).
- [ ] **Step 7:** Crons: `const secret = process.env.CRON_SECRET; if (!secret || auth !== \`Bearer ${secret}\`)` → 401.
- [ ] **Step 8:** `npx tsc --noEmit && npm run lint` limpos nos arquivos tocados; Step 1 de novo → só `auth` e `cron`.
- [ ] **Step 9:** Com dev server (`/dev-up`): `curl -s -o /dev/null -w '%{http_code}' -H 'Cookie: better-auth.session_token=x' localhost:<porta>/api/movimentacoes/1` → `401` (antes do fix: `200`/`404`). Login real continua funcionando no browser (usuário ativo).
- [ ] **Step 10 (PARADA):** Testar inativo exige usuário de teste no banco de produção. Perguntar à Larissa antes.

### Task 3: RLS no Supabase

**Files:**
- Modify: todos os `pgTable(...)` de `db/schema/*.ts` (19 tabelas: `auth.ts` ×5, `veiculo`, `pecas`, `ordem-venda` ×2, `ordem-servico` ×3, `movimentacoes`, `mao-obra`, `heartbeat`, `fornecedor`, `empresa`, `cliente`, `categorias`) → `.enableRLS()` (API da 0.45; `pgTable.withRLS` é da v1).

- [ ] **Step 1 (read-only):** `select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by 1;` via `psql` (credenciais conforme memória do projeto). Registrar o resultado aqui. Se o classifier negar, entregar o comando para ela rodar com `!`.
- [ ] **Step 2:** Adicionar `.enableRLS()` às 19 tabelas.
- [ ] **Step 3:** `npx tsc --noEmit` limpo; `npx drizzle-kit push --verbose --strict` mostra só `ENABLE ROW LEVEL SECURITY` (+ o `ALTER COLUMN` da Task 4) — **PARADA antes de confirmar o push**: mostrar o SQL à Larissa.
- [ ] **Step 4 (após aprovação):** push; repetir Step 1 → `relrowsecurity = t` em todas; `/api/cron/heartbeat` com Bearer local → `ok: true` (prova que `service_role` e a conexão `postgres` não foram bloqueadas).

### Task 4: Código de cadastro de 8 caracteres

**Files:**
- Create: `lib/codigo-verificacao.ts` (client-safe)
- Create: `lib/server/codigo-verificacao.ts` (gerador com `node:crypto`)
- Modify: `db/schema/empresa.ts:25` (`length: 8`)
- Modify: `lib/auth.ts` (comparação normalizada no hook de sign-up)
- Modify: `app/api/empresa/route.ts:77-96`, `app/api/empresa/regenerate-codigo/route.ts`
- Modify: `scripts/seed-empresa.ts`, `scripts/create-tenant.ts` (trocar `gerarCodigo` local)
- Modify: `app/(dashboard)/configuracoes/page.tsx:~706-716`, `app/(auth)/register/page.tsx:~192-201`

**Interfaces:**
- `lib/codigo-verificacao.ts` produz: `CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'`, `CODIGO_LENGTH = 8`, `CODIGO_REGEX = /^[A-HJ-NP-Z2-9]{8}$/`, `normalizarCodigo(valor: string): string` (trim + toUpperCase + remove espaços).
- `lib/server/codigo-verificacao.ts` produz: `gerarCodigoVerificacao(): string` (8× `randomInt(CODIGO_ALFABETO.length)`).

- [ ] **Step 1:** Criar os dois módulos. Checagem rápida: `npx tsx -e "import('./lib/server/codigo-verificacao.ts').then(m=>{const c=m.gerarCodigoVerificacao();console.log(c, /^[A-HJ-NP-Z2-9]{8}$/.test(c))})"` → `XXXXXXXX true`.
- [ ] **Step 2:** Hook de sign-up compara `normalizarCodigo(codigo) === row.codigo` (o banco guarda já normalizado; o código de 4 dígitos atual continua batendo).
- [ ] **Step 3:** `app/api/empresa/route.ts`: normaliza e valida com `CODIGO_REGEX`; erro 400 `'Código deve ter 8 caracteres (letras A-Z sem I/O e números 2-9)'`. `regenerate-codigo` e os dois scripts usam `gerarCodigoVerificacao`.
- [ ] **Step 4:** Configurações: `onChange` aplica `normalizarCodigo(...)` filtrando fora do alfabeto e `.slice(0, CODIGO_LENGTH)`; `maxLength={CODIGO_LENGTH}`; placeholder `'K7QM2XPA'`. Cadastro: `maxLength={CODIGO_LENGTH}`, classe `uppercase`, `autoCapitalize='characters'`.
- [ ] **Step 5:** `db/schema/empresa.ts` `varchar(..., { length: 8 })` (o push vai junto com a Task 3, mesma PARADA).
- [ ] **Step 6:** `npx tsc --noEmit && npm run lint` limpos; `rg -n "Math.random|\\\\d\\{4\\}|length: 4" scripts app lib db` → nada relacionado ao código.
- [ ] **Step 7:** Browser (`/dev-up`): Configurações mostra o input aceitando 8 caracteres e rejeitando `0`/`O`; `/register` converte para maiúsculas. Salvar/regenerar só depois do push (PARADA da Task 3).

### Task 5: Validação de imagem no servidor

**Files:**
- Create: `lib/server/imagem.ts`
- Modify: `app/api/produtos/[id]/imagem/route.ts`, `app/api/produtos/[id]/route.ts:~83`, `app/api/produtos/route.ts:~88`

**Interfaces:**
- Produz: `isImagemValida(valor: unknown): valor is string | null` — `null`/`undefined` válido; string precisa casar `/^data:image\/(jpeg|png|webp);base64,/` e ter `length <= 5_000_000`.

- [ ] **Step 1:** Checagem: `npx tsx -e "import('./lib/server/imagem.ts').then(m=>console.log(m.isImagemValida(null), m.isImagemValida('data:image/jpeg;base64,AAAA'), m.isImagemValida('https://x.com/a.png'), m.isImagemValida('data:text/html;base64,AA'), m.isImagemValida('data:image/jpeg;base64,'+'A'.repeat(5_000_001))))"` → `true true false false false` (antes de criar: erro de módulo = "falha").
- [ ] **Step 2:** Os três handlers retornam 400 `{ error: 'Imagem inválida' }` quando `!isImagemValida(data.imagem)`.
- [ ] **Step 3:** `npx tsc --noEmit && npm run lint` limpos; no browser, trocar a imagem de uma peça continua funcionando — **escreve em produção: PARADA**, perguntar antes.

### Task 6: Fechamento

- [ ] Review do diff inteiro (`git diff` + untracked) por um reviewer.
- [ ] `npm run build` final limpo; `npm audit --omit=dev` 0 critical/high.
- [ ] Atualizar a memória `project_controle_de_estoque` (lockfile agora versionado; `.npmrc` com ignore-scripts; código de 8 chars).
- [ ] Reportar à Larissa: o que ficou rodando, as PARADAS pendentes (push no banco, teste com usuário inativo, troca de imagem), e o passo pós-deploy (regenerar o código em Configurações).

## Status (2026-10-22)

- Task 1 — feita. Desvio: `.npmrc` também com `min-release-age=7`; `npm install --before=2026-10-15` não alterou o lock (árvore toda ≥7 dias).
- Task 2 — feita. Desvio: layouts `(dashboard)` e `(print)` também barram `status=false`; review final adicionou guard em `/dashboard/page.tsx` (vazamento RSC pré-existente reproduzido e fechado) e 400 ao admin se autodesativar. Pendente: teste com usuário inativo (PARADA).
- Task 3 — feita. Checagem read-only (Larissa): 19 tabelas, owner postgres, rolbypassrls t, 0 imagens fora do padrão. Desvio: `drizzle-kit push` 0.31.10 quebra na introspecção de CHECK (`checkValue` undefined) → DDL manual em transação (RLS nas 19 + varchar(8)), verificado; heartbeat local ok:true.
- Task 4 — feita, com testes `node:test`. Desvio: `useEmpresa.ts` também mudou; `maxLength` removido dos dois inputs. Coluna varchar(8) aplicada. Pendente: regenerar código após deploy.
- Task 5 — feita, com teste `node:test`. Pendente: query de imagens legadas antes do deploy.
- Task 6 — review final feito; build ok; `npm audit --omit=dev` 0 high/critical (4 moderate, cadeia drizzle-kit/esbuild); teste `useModalPecaState` falha igual no commit base (pré-existente).
