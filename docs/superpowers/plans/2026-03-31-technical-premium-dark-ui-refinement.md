# Technical Premium Dark UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the app into a cohesive technical-premium dark UI with stronger operational readability, safer states, and less local styling drift while preserving the existing structure.

**Architecture:** The implementation is split into three waves: base theme primitives, navigation/dashboard, and auth/forms/lists. Most of the visual work stays inside existing files, while dashboard state handling is extracted into a small pure helper that can be covered by automated tests. Visual correctness is verified with explicit manual scenarios because the project currently has no UI test harness.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui, TypeScript, `node:test` with `tsx` for pure helper coverage, Bun, ESLint for regression checks.

---

### Task 1: Rebuild Theme Foundations

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/app/globals.css`
- Modify: `/home/othavio/Work/controle-de-estoque/app/layout.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/button.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/input.tsx`

- [ ] **Step 1: Capture the current lint baseline for the shared UI files**

Run:

```bash
bun run lint -- app/layout.tsx components/ui/button.tsx components/ui/input.tsx
```

Expected:

```text
No new errors in the touched files, or a clear baseline list to preserve during refactor.
```

- [ ] **Step 2: Replace the global dark theme tokens with a tighter semantic set**

Update `/home/othavio/Work/controle-de-estoque/app/globals.css` so the base block moves toward this structure:

```css
:root {
  --radius: 0.75rem;
  --background: oklch(0.14 0.01 260);
  --foreground: oklch(0.94 0.01 260);
  --card: oklch(0.18 0.01 260);
  --elevated: oklch(0.22 0.012 255);
  --popover: oklch(0.18 0.01 260);
  --primary: oklch(0.57 0.11 262);
  --primary-foreground: oklch(0.97 0.01 260);
  --secondary: oklch(0.22 0.01 260);
  --muted: oklch(0.2 0.01 260);
  --muted-foreground: oklch(0.72 0.01 260);
  --border: oklch(0.28 0.01 260);
  --border-hover: oklch(0.36 0.015 260);
  --input: oklch(0.17 0.01 260);
  --ring: transparent;
  --success: oklch(0.7 0.15 150);
  --warning: oklch(0.79 0.14 90);
  --destructive: oklch(0.64 0.2 28);
  --sidebar: oklch(0.16 0.012 258);
  --sidebar-border: oklch(0.24 0.012 258);
}

.text-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.text-body {
  font-size: 0.9375rem;
  line-height: 1.45;
}

.text-heading {
  font-size: 1.125rem;
  line-height: 1.2;
  font-weight: 600;
}

.text-data {
  font-size: clamp(1.625rem, 1.3rem + 1vw, 2rem);
  line-height: 1;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Align the font contract in the root layout**

Update `/home/othavio/Work/controle-de-estoque/app/layout.tsx` so the app uses a single UI family consistently:

```tsx
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

<body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
```

Also ensure `--font-sans` in `app/globals.css` resolves to Geist only, not `Inter`.

- [ ] **Step 4: Remove visible ring styling from base Button and Input while preserving focus contrast**

Adjust `/home/othavio/Work/controle-de-estoque/components/ui/button.tsx` and `/home/othavio/Work/controle-de-estoque/components/ui/input.tsx` toward this behavior:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:border-border-hover focus-visible:bg-elevated focus-visible:shadow-[inset_0_0_0_1px_var(--border-hover)]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/92',
        outline: 'border border-border bg-card hover:border-border-hover hover:bg-elevated',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }
    }
  }
)
```

```tsx
className={cn(
  "border-input bg-input/60 text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm transition-[border-color,background-color,box-shadow] outline-none",
  "focus-visible:border-border-hover focus-visible:bg-card focus-visible:shadow-[inset_0_0_0_1px_var(--border-hover)]",
  className
)}
```

- [ ] **Step 5: Re-run lint after the base theme refactor**

Run:

```bash
bun run lint -- app/layout.tsx components/ui/button.tsx components/ui/input.tsx
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 6: Manual verification for the base layer**

Check in the browser:

```text
1. Buttons, inputs and links still show a visible keyboard focus state without a bright ring.
2. Body text no longer reads like 12/13px microcopy in the main screens.
3. Background, card and elevated surfaces are visually distinct in dark mode.
4. No element relies on pure white, pure black or raw zinc classes to stay readable.
```

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx components/ui/button.tsx components/ui/input.tsx
git commit -m "feat: rebuild dark theme foundations"
```

### Task 2: Refine Sidebar Navigation and Shared Sidebar States

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/components/app-sidebar.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/sidebar.tsx`

- [ ] **Step 1: Run lint on the sidebar files before changes**

Run:

```bash
bun run lint -- components/app-sidebar.tsx components/ui/sidebar.tsx
```

Expected:

```text
No blocking errors before the refactor starts.
```

- [ ] **Step 2: Remove ornamental styling and normalize typography in the app sidebar**

Refactor `/home/othavio/Work/controle-de-estoque/components/app-sidebar.tsx` so it moves toward this pattern:

```tsx
<SidebarHeader className="border-b border-sidebar-border bg-sidebar px-4 py-4">
  <div className="flex items-center gap-3">
    <div className="flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-elevated text-primary">
      <Truck />
    </div>
    <div className="min-w-0">
      <h1 className="truncate text-sm font-semibold text-sidebar-foreground">Igne System</h1>
      <p className="truncate text-xs text-muted-foreground">Controle tecnico do estoque</p>
    </div>
  </div>
</SidebarHeader>
```

Also replace manual `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]` values with the shared typographic roles or `text-xs` / `text-sm` only where needed.

- [ ] **Step 3: Make sidebar hover, focus and active states explicit in the primitive**

Adjust `/home/othavio/Work/controle-de-estoque/components/ui/sidebar.tsx` only where the primitive is preventing the intended states. The target is:

```tsx
className={cn(
  "data-[slot=sidebar-inner]:bg-sidebar text-sidebar-foreground",
  "[&_[data-sidebar=menu-button]]:transition-colors",
  "[&_[data-sidebar=menu-button][data-active=true]]:bg-elevated",
  "[&_[data-sidebar=menu-button][data-active=true]]:text-foreground",
  "[&_[data-sidebar=menu-button]:focus-visible]:bg-elevated",
  "[&_[data-sidebar=menu-button]:focus-visible]:shadow-[inset_0_0_0_1px_var(--border-hover)]",
  className
)}
```

Do not widen the scope beyond hover/focus/active behavior.

- [ ] **Step 4: Re-run lint after the sidebar changes**

Run:

```bash
bun run lint -- components/app-sidebar.tsx components/ui/sidebar.tsx
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 5: Manual verification for navigation**

Check in the browser:

```text
1. Active sidebar items are readable and clearly stronger than idle items.
2. Keyboard focus on sidebar items is obvious without a ring halo.
3. User name and email truncate cleanly in the footer.
4. The logo block looks functional, not decorative.
```

- [ ] **Step 6: Commit**

```bash
git add components/app-sidebar.tsx components/ui/sidebar.tsx
git commit -m "feat: refine sidebar navigation states"
```

### Task 3: Extract and Test Dashboard Data-State Logic

**Files:**
- Create: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_lib/dashboard-state.ts`
- Create: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_lib/dashboard-state.test.ts`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Write the failing tests for dashboard state derivation**

Create `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_lib/dashboard-state.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveDashboardState } from './dashboard-state';

test('marks a card as unavailable when its request fails', () => {
  const result = deriveDashboardState({
    produtos: { ok: false, data: [] },
    clientes: { ok: true, data: [{ id: 1 }] },
    servico: { ok: true, data: [] },
    venda: { ok: true, data: [] },
    movimentacoes: { ok: true, data: [] }
  });

  assert.equal(result.cards.produtos.state, 'unavailable');
  assert.equal(result.pageState, 'partial-error');
});

test('marks the page as total-error when every request fails', () => {
  const result = deriveDashboardState({
    produtos: { ok: false, data: [] },
    clientes: { ok: false, data: [] },
    servico: { ok: false, data: [] },
    venda: { ok: false, data: [] },
    movimentacoes: { ok: false, data: [] }
  });

  assert.equal(result.pageState, 'total-error');
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
bunx tsx --test "app/(dashboard)/dashboard/_lib/dashboard-state.test.ts"
```

Expected:

```text
FAIL because deriveDashboardState does not exist yet.
```

- [ ] **Step 3: Implement the minimal pure helper**

Create `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_lib/dashboard-state.ts`:

```ts
type RequestBucket<T> = { ok: boolean; data: T[] };
type DashboardBuckets = {
  produtos: RequestBucket<{ quantidade?: number; alerta?: number }>;
  clientes: RequestBucket<unknown>;
  servico: RequestBucket<{ status: string }>;
  venda: RequestBucket<{ status: string }>;
  movimentacoes: RequestBucket<unknown>;
};

export function deriveDashboardState(buckets: DashboardBuckets) {
  const allFailed = Object.values(buckets).every((bucket) => !bucket.ok);
  const hasAnyFailure = Object.values(buckets).some((bucket) => !bucket.ok);

  return {
    pageState: allFailed ? 'total-error' : hasAnyFailure ? 'partial-error' : 'ready',
    cards: {
      produtos: {
        state: buckets.produtos.ok ? 'ready' : 'unavailable',
        value: buckets.produtos.data.length
      },
      clientes: {
        state: buckets.clientes.ok ? 'ready' : 'unavailable',
        value: buckets.clientes.data.length
      }
    }
  } as const;
}
```

- [ ] **Step 4: Refactor the dashboard page to use the helper instead of treating failures as zeros**

Update `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/page.tsx` so the fetch pipeline moves toward:

```tsx
const buckets = {
  produtos: toBucket<Peca>(results[0]),
  clientes: toBucket<Cliente>(results[1]),
  servico: toBucket<OrdemServicoItem>(results[2]),
  venda: toBucket<OrdemVendaItem>(results[3]),
  movimentacoes: toBucket<MovimentacaoAPI>(results[4])
};

const nextState = deriveDashboardState(buckets);
setDashboardState(nextState);
setTotalProdutos(nextState.cards.produtos.value);
setTotalClientes(nextState.cards.clientes.value);
```

The page must now distinguish loading, `partial-error` and `total-error`.

- [ ] **Step 5: Re-run the automated test**

Run:

```bash
bunx tsx --test "app/(dashboard)/dashboard/_lib/dashboard-state.test.ts"
```

Expected:

```text
PASS
```

- [ ] **Step 6: Run lint for the dashboard state files**

Run:

```bash
bun run lint -- "app/(dashboard)/dashboard/page.tsx" "app/(dashboard)/dashboard/_lib/dashboard-state.ts" "app/(dashboard)/dashboard/_lib/dashboard-state.test.ts"
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx" "app/(dashboard)/dashboard/_lib/dashboard-state.ts" "app/(dashboard)/dashboard/_lib/dashboard-state.test.ts"
git commit -m "feat: make dashboard data states explicit"
```

### Task 4: Rework Dashboard Presentation Components

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/stat-card.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/movements-chart.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/activity-feed.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/last-orders.tsx`
- Optional Modify: `/home/othavio/Work/controle-de-estoque/components/ui/empty.tsx`

- [ ] **Step 1: Replace decorative card styling with a more instrumental visual rhythm**

Refactor `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/stat-card.tsx` toward this shape:

```tsx
export function StatCard({ label, value, subtitle, icon: Icon, isLoading, state = 'ready' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-muted-foreground">{label}</p>
          {isLoading ? <Skeleton className="mt-3 h-8 w-20" /> : <p className="mt-3 text-data text-foreground">{value}</p>}
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-elevated text-primary">
          <Icon />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{state === 'unavailable' ? 'Dado indisponivel no momento' : subtitle}</p>
    </div>
  );
}
```

- [ ] **Step 2: Replace raw empty/error copy with explicit empty vs unavailable messaging**

In `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/activity-feed.tsx`, `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/movements-chart.tsx` and `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/last-orders.tsx`, introduce distinct states like:

```tsx
if (state === 'unavailable') {
  return (
    <Empty className="border-border bg-card">
      <EmptyHeader>
        <EmptyTitle>Dados indisponiveis</EmptyTitle>
        <EmptyDescription>Esse bloco nao pode ser carregado agora.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
```

Also replace raw hex status colors in `last-orders.tsx` with semantic class combinations backed by theme tokens or badge variants.

- [ ] **Step 3: Run lint after the dashboard visual refactor**

Run:

```bash
bun run lint -- "app/(dashboard)/dashboard/_components/stat-card.tsx" "app/(dashboard)/dashboard/_components/movements-chart.tsx" "app/(dashboard)/dashboard/_components/activity-feed.tsx" "app/(dashboard)/dashboard/_components/last-orders.tsx"
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 4: Manual verification for dashboard states**

Check in the browser:

```text
1. Stat cards still align cleanly at desktop and mobile widths.
2. Activity, chart and orders show different UI for empty vs unavailable data.
3. Dashboard partial failures never show a healthy-looking "0" without context.
4. Tab labels, timestamps and status pills remain readable in dark mode.
```

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/dashboard/_components/stat-card.tsx" "app/(dashboard)/dashboard/_components/movements-chart.tsx" "app/(dashboard)/dashboard/_components/activity-feed.tsx" "app/(dashboard)/dashboard/_components/last-orders.tsx" components/ui/empty.tsx
git commit -m "feat: refine dashboard presentation states"
```

### Task 5: Align Auth Pages with the System and Harden Their States

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/app/(auth)/login/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(auth)/register/page.tsx`
- Optional Modify: `/home/othavio/Work/controle-de-estoque/components/ui/field.tsx`

- [ ] **Step 1: Refactor auth forms to use the field primitives instead of raw label stacks**

Move the auth form structure toward:

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" aria-invalid={!!error} disabled={loading} />
  </Field>
  <Field>
    <FieldLabel htmlFor="password">Senha</FieldLabel>
    <div className="relative">
      <Input id="password" type={showPassword ? 'text' : 'password'} aria-invalid={!!error} disabled={loading} />
    </div>
  </Field>
  <FieldError>{error}</FieldError>
</FieldGroup>
```

Do not keep `space-y-*` wrappers in the new structure.

- [ ] **Step 2: Add semantic error and submit behavior**

Ensure both auth pages follow this behavior:

```tsx
{error ? (
  <Alert variant="destructive" role="alert" aria-live="polite">
    <AlertCircle />
    <AlertTitle>Falha ao entrar</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
) : null}

<Button type="submit" disabled={loading}>
  {loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
  {loading ? 'Entrando...' : 'Entrar'}
</Button>
```

Also disable secondary actions that should not fire during submit.

- [ ] **Step 3: Run lint after auth refactor**

Run:

```bash
bun run lint -- "app/(auth)/login/page.tsx" "app/(auth)/register/page.tsx"
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 4: Manual verification for auth**

Check in the browser:

```text
1. Keyboard focus on email, password and links is visible without rings.
2. Error copy is announced and remains readable on dark surfaces.
3. Submitting twice is prevented.
4. Auth still feels like the same product as the dashboard.
```

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/register/page.tsx" components/ui/field.tsx
git commit -m "feat: align auth forms with theme system"
```

### Task 6: Harden Dense Lists and Priority Modals

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/_components/modal-peças.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-clientes.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-veiculos.tsx`

- [ ] **Step 1: Fix row overflow and touch target issues in dense lists**

Refactor `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/page.tsx` and `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/page.tsx` toward:

```tsx
<div className="flex min-w-0 items-center gap-4">
  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
    <Users />
  </div>
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm font-medium text-foreground">{cliente.name_cliente}</p>
    <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="truncate">CPF: {cliente.cpf}</span>
      <span className="truncate">{cliente.telefone}</span>
    </div>
  </div>
</div>
```

Icon-only actions should move from `h-8 w-8` to at least the shared `size-9` / button `icon` pattern unless a denser but still safe target is proven.

- [ ] **Step 2: Rebuild modals around `FieldGroup` and responsive stacks**

Update `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-clientes.tsx`, `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-veiculos.tsx` and `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/_components/modal-peças.tsx` with these constraints:

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="name_cliente">Nome do Cliente *</FieldLabel>
    <Input id="name_cliente" value={data.name_cliente || ''} />
  </Field>
  <Field orientation="responsive">
    <FieldContent>
      <FieldLabel htmlFor="cpf">CPF</FieldLabel>
      <Input id="cpf" value={data.cpf || ''} />
    </FieldContent>
    <FieldContent>
      <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
      <Input id="cnpj" value={data.cnpj || ''} />
    </FieldContent>
  </Field>
</FieldGroup>
```

For `modal-peças.tsx`, convert hardcoded `grid-cols-2` sections to mobile-first stacks that only split when the content can breathe.

- [ ] **Step 3: Add explicit empty and loading language to the dense list screens**

Replace custom empty placeholders in `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/page.tsx` and `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/page.tsx` with the shared `Empty` primitive:

```tsx
<Empty className="border-border bg-card">
  <EmptyHeader>
    <EmptyTitle>Nada encontrado</EmptyTitle>
    <EmptyDescription>Tente outra busca ou revise os filtros aplicados.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

- [ ] **Step 4: Run lint after the list and modal changes**

Run:

```bash
bun run lint -- "app/(dashboard)/clientes/page.tsx" "app/(dashboard)/produtos/page.tsx" "app/(dashboard)/produtos/_components/modal-peças.tsx" "app/(dashboard)/clientes/_components/modal-clientes.tsx" "app/(dashboard)/clientes/_components/modal-veiculos.tsx"
```

Expected:

```text
0 errors in the touched files.
```

- [ ] **Step 5: Manual verification for dense data**

Check in the browser:

```text
1. Cliente com nome acima de 60 caracteres nao empurra as acoes para fora.
2. CPF, CNPJ, telefone, placa e modelo longos nao quebram a linha principal.
3. Modais ainda ficam usaveis em largura estreita.
4. Upload e remocao de imagem em produtos continuam funcionando.
5. Empty, loading and destructive flows still read clearly in dark mode.
```

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/clientes/page.tsx" "app/(dashboard)/produtos/page.tsx" "app/(dashboard)/produtos/_components/modal-peças.tsx" "app/(dashboard)/clientes/_components/modal-clientes.tsx" "app/(dashboard)/clientes/_components/modal-veiculos.tsx"
git commit -m "feat: harden dense lists and priority modals"
```

### Task 7: Final Consistency Pass

**Files:**
- Modify: `/home/othavio/Work/controle-de-estoque/app/globals.css`
- Modify: `/home/othavio/Work/controle-de-estoque/app/layout.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/button.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/input.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/ui/sidebar.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/components/app-sidebar.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_lib/dashboard-state.ts`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/stat-card.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/movements-chart.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/activity-feed.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/dashboard/_components/last-orders.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(auth)/login/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(auth)/register/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/page.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/produtos/_components/modal-peças.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-clientes.tsx`
- Modify: `/home/othavio/Work/controle-de-estoque/app/(dashboard)/clientes/_components/modal-veiculos.tsx`

- [ ] **Step 1: Run the automated dashboard-state tests**

Run:

```bash
bunx tsx --test "app/(dashboard)/dashboard/_lib/dashboard-state.test.ts"
```

Expected:

```text
PASS
```

- [ ] **Step 2: Run the project lint pass**

Run:

```bash
bun run lint
```

Expected:

```text
No new lint errors introduced by the UI refinement work.
```

- [ ] **Step 3: Run the final manual acceptance checklist**

Check in the browser:

```text
1. Dashboard, sidebar and auth now look like one product.
2. Keyboard focus remains visible everywhere without bright rings.
3. Partial dashboard failures never look like valid zero data.
4. Dense operational rows survive long real-world content.
5. Empty, loading and error states are visually and semantically distinct.
```

- [ ] **Step 4: Commit the final pass**

```bash
git add app components docs/superpowers/specs/2026-03-31-technical-premium-dark-ui-refinement-design.md
git commit -m "feat: finalize technical premium dark UI refinement"
```
