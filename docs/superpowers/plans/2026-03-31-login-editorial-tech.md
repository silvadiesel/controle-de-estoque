# Login Editorial Tech Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** atualizar login e cadastro para o conceito editorial tech aprovado, com copy comercial mais forte, logo real e fluxos de autenticacao preservados.

**Architecture:** a implementacao usa uma base visual compartilhada em `app/(auth)/auth-shell.tsx` para evitar duplicacao entre login e cadastro. Os formularios continuam client-side, preservando os fluxos existentes e reutilizando os componentes de UI do projeto.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui, lucide-react.

---

### Task 1: Documentar e preparar

**Files:**

- Modify: `.impeccable.md`
- Create: `docs/superpowers/specs/2026-03-31-login-editorial-tech-design.md`
- Create: `docs/superpowers/plans/2026-03-31-login-editorial-tech.md`

- [ ] Registrar o contexto visual aprovado pelo usuario.
- [ ] Salvar a spec com a direcao do redesign.
- [ ] Salvar o plano de implementacao sem etapa de commit, porque o usuario pediu explicitamente `sem commitar`.

### Task 2: Atualizar a tela de login

**Files:**

- Create: `app/(auth)/auth-shell.tsx`
- Modify: `app/(auth)/login/page.tsx`

- [ ] Definir a estrutura visual compartilhada e a copy comercial do hero.
- [ ] Atualizar o login com a nova copy e manter o fluxo de autenticacao.
- [ ] Preservar acessibilidade basica: labels visiveis, botao de mostrar senha com `aria-label`, estados `disabled` e responsividade.

### Task 3: Alinhar a tela de cadastro

**Files:**

- Modify: `app/(auth)/register/page.tsx`

- [ ] Aplicar a mesma base visual do login no cadastro.
- [ ] Ajustar apenas titulo, subtitulo, campos, CTA e textos de apoio do formulario.
- [ ] Preservar validacoes e mensagens atuais do cadastro.

### Task 4: Verificar

**Files:**

- Verify: `app/(auth)/login/page.tsx`
- Verify: `app/(auth)/register/page.tsx`
- Verify: `app/(auth)/auth-shell.tsx`

- [ ] Rodar `npx eslint "app/(auth)/login/page.tsx" "app/(auth)/register/page.tsx" "app/(auth)/auth-shell.tsx"` e corrigir eventuais erros.
- [ ] Rodar `npm run build` para validar que a pagina continua compilando no projeto real.
- [ ] Revisar visualmente a diff final e confirmar que nao houve commit.
