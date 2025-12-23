# Sistema de Cargos e Permissões

Sistema de controle de acesso baseado em cargos para o Igne System.

## Visão Geral

O sistema utiliza o campo `cargo` do usuário para controlar a exibição de componentes e validar permissões em toda a aplicação.

### Cargos Disponíveis

| Cargo        | Nível | Descrição                                       |
| ------------ | ----- | ----------------------------------------------- |
| `admin`      | 3     | Acesso total ao sistema                         |
| `estoquista` | 2     | Acesso a funcionalidades de estoque + atendente |
| `atendente`  | 1     | Acesso básico                                   |

---

## Uso Básico

### Hook `useUser()`

O hook principal para acessar informações do usuário logado e suas permissões.

```tsx
import { useUser } from '@/hooks/useUser';

function MeuComponente() {
  const {
    user, // Dados do usuário
    cargo, // 'atendente' | 'estoquista' | 'admin'
    isAdmin, // true se cargo === 'admin'
    isEstoquista, // true se cargo === 'estoquista'
    canAccess, // Função para verificar hierarquia
    hasRole, // Função para verificar cargos específicos
    isPending // true enquanto carrega a sessão
  } = useUser();

  if (isPending) return <Loading />;

  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <p>Seu cargo: {cargo}</p>

      {isAdmin && <BotaoConfig />}
    </div>
  );
}
```

### Verificação por Hierarquia

Use `canAccess()` quando quiser permitir cargos superiores automaticamente:

```tsx
const { canAccess } = useUser();

// Admin pode acessar tudo
// Estoquista pode acessar estoque e atendente
// Atendente só pode acessar atendente

if (canAccess('estoquista')) {
  // Permite: admin, estoquista
  // Bloqueia: atendente
}

if (canAccess('admin')) {
  // Permite: admin
  // Bloqueia: estoquista, atendente
}
```

### Verificação por Cargo Específico

Use `hasRole()` quando quiser permitir apenas cargos específicos:

```tsx
const { hasRole } = useUser();

if (hasRole('admin', 'estoquista')) {
  // Permite APENAS admin e estoquista
  // Não usa hierarquia
}
```

---

## Componentes de Controle de Acesso

### `<RoleGuard>`

Componente declarativo para controlar exibição baseada em cargo.

```tsx
import { RoleGuard } from '@/components/role-guard';

// Por lista de cargos
<RoleGuard roles={['admin', 'estoquista']}>
  <BotaoExcluir />
</RoleGuard>

// Por cargo mínimo (usa hierarquia)
<RoleGuard minRole="estoquista">
  <PainelEstoque />
</RoleGuard>

// Com fallback
<RoleGuard roles={['admin']} fallback={<span>Sem permissão</span>}>
  <ConfigAdmin />
</RoleGuard>
```

### `<AdminOnly>`

Atalho para conteúdo exclusivo de admin:

```tsx
import { AdminOnly } from '@/components/role-guard';

<AdminOnly>
  <BotaoExcluirUsuario />
</AdminOnly>

<AdminOnly fallback={<span>Apenas admins</span>}>
  <PainelAdmin />
</AdminOnly>
```

### `<EstoqueAccess>`

Atalho para conteúdo de estoquista ou superior:

```tsx
import { EstoqueAccess } from '@/components/role-guard';

<EstoqueAccess>
  <ControlesEstoque />
</EstoqueAccess>;
```

---

## Tipos TypeScript

### Importando Tipos

```tsx
import type { Cargo, ExtendedUser } from '@/lib/types/auth';
import { CARGO_COLORS, CARGO_HIERARCHY, CARGO_LABELS } from '@/lib/types/auth';
```

### Constantes Úteis

```tsx
// Labels para exibição
CARGO_LABELS['admin']; // 'Administrador'
CARGO_LABELS['estoquista']; // 'Estoquista'
CARGO_LABELS['atendente']; // 'Atendente'

// Cores para badges (Tailwind)
CARGO_COLORS['admin']; // 'bg-emerald-100 text-emerald-800 ...'

// Hierarquia numérica
CARGO_HIERARCHY['admin']; // 3
CARGO_HIERARCHY['estoquista']; // 2
CARGO_HIERARCHY['atendente']; // 1
```

### Exemplo: Badge de Cargo

```tsx
import { useUser } from '@/hooks/useUser';
import { CARGO_COLORS, CARGO_LABELS } from '@/lib/types/auth';

function CargoBadge() {
  const { cargo } = useUser();

  return (
    <span className={`px-2 py-1 rounded text-sm ${CARGO_COLORS[cargo]}`}>
      {CARGO_LABELS[cargo]}
    </span>
  );
}
```

---

## Exemplos Práticos

### Botão Condicional na Sidebar

```tsx
function Sidebar() {
  const { isAdmin } = useUser();

  return (
    <nav>
      <Link href='/dashboard'>Dashboard</Link>
      <Link href='/clientes'>Clientes</Link>

      {isAdmin && <Link href='/configuracoes'>Configurações</Link>}
    </nav>
  );
}
```

### Tabela com Ações Condicionais

```tsx
function TabelaUsuarios({ usuarios }) {
  return (
    <table>
      {usuarios.map((usuario) => (
        <tr key={usuario.id}>
          <td>{usuario.name}</td>
          <td>{usuario.email}</td>
          <td>
            <BotaoEditar />

            <AdminOnly>
              <BotaoExcluir />
            </AdminOnly>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### Página com Verificação de Acesso

```tsx
function PaginaEstoque() {
  const { canAccess, isPending } = useUser();

  if (isPending) return <Loading />;

  if (!canAccess('estoquista')) {
    return <AcessoNegado />;
  }

  return (
    <div>
      <h1>Controle de Estoque</h1>
      {/* conteúdo */}
    </div>
  );
}
```

---

## Arquivos do Sistema

| Arquivo                     | Descrição                                 |
| --------------------------- | ----------------------------------------- |
| `lib/types/auth.ts`         | Tipos e constantes (Cargo, labels, cores) |
| `lib/auth.ts`               | Configuração do better-auth (servidor)    |
| `lib/auth-client.ts`        | Cliente de autenticação (navegador)       |
| `hooks/useUser.ts`          | Hook principal para acesso a permissões   |
| `components/role-guard.tsx` | Componentes de controle de exibição       |
