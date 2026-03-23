# Alertas Funcionais — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a página de alertas funcional consumindo a API real, adicionar badge de notificação na sidebar quando há alertas, e exibir toasts de aviso ao navegar pelo sistema fora da aba de alertas.

**Architecture:** O hook `useAlerta.ts` encapsula toda a lógica de negócio (fetch da API, classificação crítico/atenção, contagem de alertas). A `page.tsx` só renderiza o que recebe do hook. A sidebar exibe um badge reativo com a contagem, usando um hook global leve compartilhado. Toasts são disparados quando alertas existem e o usuário está em outra rota.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Sonner (toast já configurado globalmente), Drizzle ORM (API REST já existente `/api/produtos`), Tailwind CSS, shadcn/ui, Lucide React.

---

## Contexto do codebase

### Fonte de verdade

As peças ficam no banco (`db/schema/pecas.ts`), acessadas via `GET /api/produtos`. Campos relevantes:
- `quantidade: number` — estoque atual
- `alerta: number` — quantidade mínima de alerta (padrão: 1)

Regra: peça em alerta = `quantidade <= alerta`. Peça crítica = `quantidade === 0`.

### O que já existe
- `app/(dashboard)/alertas/page.tsx` — 229 linhas com lógica inline usando Zustand mock (será substituída)
- `app/(dashboard)/alertas/_hooks/useAlerta.ts` — arquivo vazio, será preenchido
- `components/app-sidebar.tsx` — sidebar client-side com `usePathname`
- `app/layout.tsx` — tem `<Toaster />` global (sonner)
- `app/(dashboard)/layout.tsx` — layout server-side com auth guard

### Padrão de hook do projeto
- Hooks fazem `fetch('/api/...')` diretamente
- Usam `toast.error` / `toast.success` do sonner para feedback
- Retornam interface tipada explícita
- Sem `'use client'` nos hooks (são usados em componentes client)

---

## Mapeamento de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `app/(dashboard)/alertas/_hooks/useAlerta.ts` | **Preencher** | Toda lógica: fetch, classificação, tipo retornado |
| `app/(dashboard)/alertas/page.tsx` | **Substituir** | Só renderização, zero lógica — consume `useAlerta` |
| `hooks/useAlertaCount.ts` | **Criar** | Hook compartilhado leve para count de alertas (usado na sidebar e toasts) |
| `components/app-sidebar.tsx` | **Modificar** | Badge de contagem no item "Alertas" |
| `components/alerta-toast-provider.tsx` | **Criar** | Componente client que dispara toast de aviso quando fora de /alertas |
| `app/(dashboard)/layout.tsx` | **Modificar** | Inclui `AlertaToastProvider` |

---

## Task 1: Hook `useAlerta` — lógica e fetch

**Files:**
- Modify: `app/(dashboard)/alertas/_hooks/useAlerta.ts`

- [ ] **Step 1: Escrever o hook `useAlerta`**

```typescript
// app/(dashboard)/alertas/_hooks/useAlerta.ts
import { useCallback, useEffect, useState } from 'react';

import type { Peca } from '@/db/schema';
import { toast } from 'sonner';

export interface AlertaPeca {
  id: number;
  name_peca: string;
  codigo: string;
  quantidade: number;
  alerta: number;
  localizacao: string[] | null;
  categoria_id: number | null;
  fornecedor_id: number | null;
}

export interface UseAlertaReturn {
  pecasEmAlerta: AlertaPeca[];
  pecasCriticas: AlertaPeca[];      // quantidade === 0
  pecasAtencao: AlertaPeca[];       // 0 < quantidade <= alerta
  totalAlertas: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useAlerta(): UseAlertaReturn {
  const [pecas, setPecas] = useState<AlertaPeca[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: Peca[] = await res.json();

      const emAlerta = data.filter(
        (p) => p.quantidade <= p.alerta
      ) as AlertaPeca[];

      setPecas(emAlerta);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      toast.error('Erro ao carregar alertas de estoque');
      setPecas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const pecasCriticas = pecas.filter((p) => p.quantidade === 0);
  const pecasAtencao = pecas.filter((p) => p.quantidade > 0);

  return {
    pecasEmAlerta: pecas,
    pecasCriticas,
    pecasAtencao,
    totalAlertas: pecas.length,
    isLoading,
    refetch: fetchAlertas,
  };
}
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sem erros relacionados a `useAlerta.ts`

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/alertas/_hooks/useAlerta.ts
git commit -m "feat: implementa hook useAlerta consumindo API real"
```

---

## Task 2: Refatorar `page.tsx` de alertas — só renderização

**Files:**
- Modify: `app/(dashboard)/alertas/page.tsx`

A `page.tsx` atual tem lógica inline (importa `useStockStore`, filtra produtos, etc). Precisamos **substituir todo o conteúdo** mantendo a mesma aparência visual mas sem nenhuma lógica.

- [ ] **Step 1: Substituir o conteúdo de `page.tsx`**

Substitua o arquivo inteiro por:

```tsx
// app/(dashboard)/alertas/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Package,
  TrendingUp
} from 'lucide-react';

import { useAlerta } from './_hooks/useAlerta';

export default function Alertas() {
  const router = useRouter();
  const { pecasCriticas, pecasAtencao, pecasEmAlerta, isLoading } = useAlerta();

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <p className='text-muted-foreground'>Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h2 className='text-2xl font-bold text-foreground'>Alertas</h2>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>
          Monitore os níveis críticos de estoque
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='bg-destructive/10 py-3 border-destructive/30'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-destructive'>Crítico</p>
                <p className='text-3xl font-bold text-destructive'>
                  {pecasCriticas.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Estoque zerado
                </p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-primary/10 py-3 border-primary/30'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-primary'>Atenção</p>
                <p className='text-3xl font-bold text-primary'>
                  {pecasAtencao.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Abaixo do mínimo
                </p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center'>
                <Bell className='h-6 w-6 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-muted/50 py-3 border-border'>
          <CardContent className='px-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total em alerta</p>
                <p className='text-3xl font-bold text-foreground'>
                  {pecasEmAlerta.length}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>Peças monitoradas</p>
              </div>
              <div className='h-12 w-12 rounded-lg bg-muted flex items-center justify-center'>
                <Package className='h-6 w-6 text-muted-foreground' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {pecasEmAlerta.length === 0 ? (
        <Card className='bg-card border-border'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4'>
              <CheckCircle className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              Tudo certo!
            </h3>
            <p className='text-muted-foreground text-center'>
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {/* Critical Alerts */}
          {pecasCriticas.length > 0 && (
            <Card className='bg-card border-border'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-destructive' />
                  Estoque Zerado — Crítico
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {pecasCriticas.map((peca) => (
                  <div
                    key={peca.id}
                    className='flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/30 p-4'>
                    <div className='flex items-center gap-4'>
                      <div className='h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-destructive' />
                      </div>
                      <div>
                        <p className='font-medium text-foreground'>
                          {peca.name_peca}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {peca.codigo}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-destructive'>0</p>
                        <p className='text-xs text-muted-foreground'>
                          Mín: {peca.alerta}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={() => router.push('/movimentacoes')}>
                        <TrendingUp className='h-4 w-4 mr-1' />
                        Repor
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warning Alerts */}
          {pecasAtencao.length > 0 && (
            <Card className='bg-card border-border gap-3'>
              <CardHeader>
                <CardTitle className='text-foreground flex items-center gap-2'>
                  <Bell className='h-5 w-5 text-primary' />
                  Estoque Baixo — Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {pecasAtencao.map((peca) => {
                  const percentage = (peca.quantidade / peca.alerta) * 100;

                  return (
                    <div
                      key={peca.id}
                      className='flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                          <Package className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>
                            {peca.name_peca}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {peca.codigo}
                          </p>
                          <div className='mt-2 w-32 h-2 bg-secondary rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-primary rounded-full transition-all'
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-primary'>
                            {peca.quantidade}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Mín: {peca.alerta}
                          </p>
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-primary text-primary hover:bg-primary/10 bg-transparent w-28'
                          onClick={() => router.push('/movimentacoes')}>
                          <TrendingUp className='h-4 w-4' />
                          Repor
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que não há lógica na `page.tsx`**

```bash
grep -n "useStockStore\|getLowStockProducts\|\.filter\|useState\|useEffect" app/(dashboard)/alertas/page.tsx
```

Expected: nenhuma linha retornada

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sem erros

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/alertas/page.tsx
git commit -m "refactor: página de alertas sem lógica, apenas renderização"
```

---

## Task 3: Hook compartilhado `useAlertaCount`

A sidebar e o sistema de toasts precisam da contagem de alertas. Hook leve que faz fetch uma vez só.

**Files:**
- Create: `hooks/useAlertaCount.ts`

- [ ] **Step 1: Criar o arquivo `hooks/useAlertaCount.ts`**

```typescript
// hooks/useAlertaCount.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Peca } from '@/db/schema';

export interface UseAlertaCountReturn {
  totalAlertas: number;
  isLoading: boolean;
}

export function useAlertaCount(): UseAlertaCountReturn {
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/produtos');
      if (!res.ok) return;
      const data: Peca[] = await res.json();
      const count = data.filter((p) => p.quantidade <= p.alerta).length;
      setTotalAlertas(count);
    } catch {
      // silencioso — não queremos erros visíveis na sidebar
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { totalAlertas, isLoading };
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sem erros

- [ ] **Step 3: Commit**

```bash
git add hooks/useAlertaCount.ts
git commit -m "feat: hook useAlertaCount para contagem global de alertas"
```

---

## Task 4: Badge de notificação na sidebar

**Files:**
- Modify: `components/app-sidebar.tsx`

O item "Alertas" na sidebar precisa exibir um badge vermelho quando `totalAlertas > 0`.

- [ ] **Step 1: Adicionar import do `useAlertaCount` no topo do arquivo**

Após os imports existentes, adicionar:

```typescript
import { useAlertaCount } from '@/hooks/useAlertaCount';
```

- [ ] **Step 2: Usar o hook dentro do componente `AppSidebar`**

Após `const { data: session } = useSession();`, adicionar:

```typescript
const { totalAlertas } = useAlertaCount();
```

- [ ] **Step 3: Modificar o `SidebarMenuButton` para exibir badge quando `item.id === 'alertas'`**

Localizar o trecho existente (linha ~147-158 em `components/app-sidebar.tsx`):

```tsx
<SidebarMenuButton
  asChild
  isActive={isActive}
  className={`h-9 ${isActive ? 'bg-primary! text-white!' : ''}`}
  tooltip={item.label}>
  <a href={item.href}>
    <Icon className='h-4 w-4' />
    <span>{item.label}</span>
  </a>
</SidebarMenuButton>
```

Substituir por:

```tsx
<SidebarMenuButton
  asChild
  isActive={isActive}
  className={`h-9 ${isActive ? 'bg-primary! text-white!' : ''}`}
  tooltip={item.label}>
  <a href={item.href}>
    <Icon className='h-4 w-4' />
    <span>{item.label}</span>
    {item.id === 'alertas' && totalAlertas > 0 && (
      <span className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground'>
        {totalAlertas > 99 ? '99+' : totalAlertas}
      </span>
    )}
  </a>
</SidebarMenuButton>
```

- [ ] **Step 4: Verificar que compila sem erros**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sem erros

- [ ] **Step 5: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: badge de alertas na sidebar com contagem em tempo real"
```

---

## Task 5: Toast de aviso ao navegar em outras rotas

**Files:**
- Create: `components/alerta-toast-provider.tsx`
- Modify: `app/(dashboard)/layout.tsx`

O toast aparece uma vez por montagem quando `totalAlertas > 0` e `pathname !== '/alertas'`. `useRef` garante que não repete.

- [ ] **Step 1: Criar `components/alerta-toast-provider.tsx`**

```tsx
// components/alerta-toast-provider.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { useAlertaCount } from '@/hooks/useAlertaCount';

export function AlertaToastProvider() {
  const { totalAlertas, isLoading } = useAlertaCount();
  const pathname = usePathname();
  const hasShown = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (pathname === '/alertas') return;
    if (hasShown.current) return;
    if (totalAlertas === 0) return;

    hasShown.current = true;

    toast.warning(
      totalAlertas === 1
        ? '1 produto com estoque abaixo do mínimo'
        : `${totalAlertas} produtos com estoque abaixo do mínimo`,
      {
        description: 'Acesse a página de Alertas para ver os detalhes.',
        duration: 6000,
        action: {
          label: 'Ver alertas',
          onClick: () => {
            window.location.href = '/alertas';
          },
        },
      }
    );
  }, [isLoading, totalAlertas, pathname]);

  return null;
}
```

- [ ] **Step 2: Adicionar `AlertaToastProvider` ao layout do dashboard**

No arquivo `app/(dashboard)/layout.tsx`, adicionar o import:

```typescript
import { AlertaToastProvider } from '@/components/alerta-toast-provider';
```

E no JSX, adicionar dentro de `SidebarInset`:

Antes:
```tsx
<SidebarInset>{children}</SidebarInset>
```

Depois:
```tsx
<SidebarInset>
  <AlertaToastProvider />
  {children}
</SidebarInset>
```

- [ ] **Step 3: Verificar que compila sem erros**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sem erros

- [ ] **Step 4: Commit**

```bash
git add components/alerta-toast-provider.tsx app/(dashboard)/layout.tsx
git commit -m "feat: toast de aviso de alertas ao navegar no dashboard"
```

---

## Task 6: Verificação final

- [ ] **Step 1: Subir o servidor de desenvolvimento**

```bash
npm run dev
```

- [ ] **Step 2: Verificar a página de alertas com dados reais**

1. Acesse `/alertas`
2. Cards de Crítico/Atenção devem refletir dados da API
3. Produtos com `quantidade === 0` → seção "Crítico"
4. Produtos com `0 < quantidade <= alerta` → seção "Atenção"

- [ ] **Step 3: Verificar badge na sidebar**

1. Se houver peças em alerta: badge vermelho no item "Alertas" com número
2. Se não houver: sem badge

- [ ] **Step 4: Verificar toasts**

1. Acesse `/dashboard` (ou qualquer rota que não seja `/alertas`)
2. Se houver peças em alerta: toast de aviso aparece uma única vez
3. Toast tem botão "Ver alertas" que redireciona para `/alertas`

- [ ] **Step 5: Verificar que `page.tsx` não tem lógica**

```bash
grep -n "useStockStore\|getLowStockProducts\|\.filter\|useState\|useEffect" app/(dashboard)/alertas/page.tsx
```

Expected: zero linhas

---

## Resumo dos arquivos tocados

| Arquivo | Ação |
|---------|------|
| `app/(dashboard)/alertas/_hooks/useAlerta.ts` | Preenchido — lógica completa de fetch e classificação |
| `app/(dashboard)/alertas/page.tsx` | Substituído — zero lógica, só renderização |
| `hooks/useAlertaCount.ts` | Criado — hook leve compartilhado para contagem |
| `components/app-sidebar.tsx` | Modificado — badge de notificação no item Alertas |
| `components/alerta-toast-provider.tsx` | Criado — toast de aviso ao navegar fora de /alertas |
| `app/(dashboard)/layout.tsx` | Modificado — inclui `AlertaToastProvider` |
