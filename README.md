# 📦 Controle Peças — Controle de Estoque

Sistema de **gestão de estoque e ordens de serviço/venda** pensado para uso misto entre operação (chão de oficina/loja) e administrativo. Foco em leitura rápida, identificação imediata de estados e densidade suficiente para tomada de decisão sob pressão.

> 🎯 **Para quem é?** Pequenas e médias operações que precisam controlar peças, mão de obra, clientes, fornecedores, ordens e movimentações de estoque em um único lugar — com permissões por função.

---

## ✨ O que o sistema faz

- 📊 **Dashboard** — visão geral com métricas operacionais (estoque, ordens, alertas).
- 🔩 **Peças** — cadastro, categorias, controle de estoque mínimo.
- 👷 **Mão de Obra** — catálogo de serviços com preço e duração.
- 👥 **Clientes & 🚗 Veículos** — cadastro com histórico de ordens.
- 🏭 **Fornecedores** — vínculo de fornecedores ↔ peças (junction com preço/lead time).
- 📋 **Ordens** — ordens de serviço e ordens de venda, com seleção de peças validando estoque em tempo real.
- 🔄 **Movimentações** — entrada/saída de estoque com histórico auditável (timeline).
- ⚠️ **Alertas** — estoque baixo, itens críticos, pendências.
- 🔐 **Autenticação & Permissões** — login + controle de acesso granular por função (RBAC).
- 🖨️ **Impressão** — rotas dedicadas (`app/(print)/`) para gerar PDFs de ordens via `@react-pdf/renderer`.

---

## 🧱 Stack

| Camada           | Tecnologia                                        |
| ---------------- | ------------------------------------------------- |
| 🖥️ Framework     | **Next.js 16** (App Router) + **React 19**        |
| 💅 UI            | **Tailwind CSS 4** + **shadcn/ui** + **Radix UI** |
| 🗄️ ORM           | **Drizzle ORM** + **drizzle-kit**                 |
| 🐘 Banco         | **PostgreSQL** (driver `postgres`)                |
| 🔐 Auth          | **better-auth**                                   |
| 📝 Formulários   | **react-hook-form** + **zod**                     |
| 📈 Gráficos      | **Recharts**                                      |
| 🍞 Notificações  | **sonner**                                        |
| 🧠 Estado global | **Zustand**                                       |
| 📄 PDF           | **@react-pdf/renderer**                           |
| 🧪 Tooling       | TypeScript • ESLint • Prettier                    |

---

### 🔐 Permissões

A navegação e o acesso a rotas são governados por **`AppPermission`** (ver `lib/permissions.ts`). Cada item da sidebar (`components/sidebar-items.ts`) declara qual permissão é necessária para vê-lo. Use `<RoleGuard>` para condicionar partes da UI a uma permissão específica.

---

## 🚀 Como rodar

### 1️⃣ Pré-requisitos

- **Node.js** 20+
- **PostgreSQL** acessível (local ou remoto)

### 2️⃣ Instalação

```bash
npm install
```

### 3️⃣ Variáveis de ambiente

Crie um `.env` na raiz com pelo menos:

```bash
DATABASE_URL="postgres://user:pass@localhost:5432/core_controler"
BETTER_AUTH_SECRET="uma-string-secreta-bem-aleatoria"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4️⃣ Banco de dados

```bash
npm run db:generate     # Gera migrations a partir do schema
npm run db:migrate      # Aplica migrations no banco
npm run db:seed:empresa # Cria a linha singleton de empresa
npm run db:studio       # 🔍 Abre o Drizzle Studio (GUI)
```

### 5️⃣ Dev server

```bash
npm run dev
```

Abra **http://localhost:3000** 🎉

---

## 📜 Scripts úteis

| Script                    | O que faz                                   |
| ------------------------- | ------------------------------------------- |
| `npm run dev`             | 🔥 Sobe o Next em modo dev                  |
| `npm run build`           | 📦 Build de produção                        |
| `npm run start`           | ▶️ Sobe o build de produção                 |
| `npm run lint`            | 🧹 Roda o ESLint                            |
| `npm run format`          | 💅 Formata o projeto com Prettier           |
| `npm run db:generate`     | 🧬 Gera migrations Drizzle                  |
| `npm run db:migrate`      | 📥 Aplica migrations no banco               |
| `npm run db:push`         | ⚡ Push direto do schema (sem migration)    |
| `npm run db:studio`       | 🔍 GUI do banco (Drizzle Studio)            |
| `npm run db:seed:empresa` | 🌱 Cria empresa singleton                   |
| `npm run create-tenant`   | 🏢 Cria um novo tenant via CLI              |
| `npm run clear`           | 🧨 Limpa `node_modules`, `.next`, lockfiles |

---

## 🎨 Design System

O projeto é **dark mode only** com acento azul-aço. Princípios e tokens estão documentados em:

- 🎨 **`app/globals.css`** — tokens CSS (cores, espaçamentos)
- 🧭 **`.impeccable.md`** — contexto de design, padrões de componentes e anti-patterns
- 📐 **`CLAUDE.md`** — convenções (cores via token, tipografia Tailwind nativa, spacing)

Regras principais:

- ✅ Sempre usar tokens (`bg-card`, `text-foreground`, `border-border`)
- ❌ Nunca hex direto em componentes
- ✅ Tipografia: classes Tailwind nativas (`text-xs` ... `text-2xl`)
- ❌ Nunca prefixo `dark:` — não existe modo claro
- ✅ Listas longas → `SearchableSelect`; métricas → `StatCard`

---

Feito com ☕ e ⚙️.
