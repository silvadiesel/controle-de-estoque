# Sistema de Cargos e Permissões

Documentação oficial do controle de acesso do sistema.

## Visão Geral

O projeto usa o campo `cargo` do usuário autenticado para derivar permissões de:

- navegação
- visualização de páginas
- ações de UI
- acesso a endpoints da API

O núcleo dessa regra fica centralizado em [lib/permissions.ts](/home/larissa/Documentos/projects/controle-de-estoque/lib/permissions.ts). A regra não deve ser reimplementada com `if (cargo === ...)` espalhado pela aplicação.

## Cargos

| Cargo | Descrição |
| --- | --- |
| `admin` | Acesso total ao sistema |
| `estoquista` | Acesso total, exceto `configuracoes` |
| `atendente` | Acesso operacional normal, com restrições em `fornecedores`, `configuracoes` e mutações de `produtos` |

## Matriz de Permissões

### Admin

- acessa todas as páginas
- executa todas as ações
- consome todos os endpoints protegidos

### Estoquista

- acessa `dashboard`, `produtos`, `clientes`, `ordens`, `movimentacoes`, `fornecedores`, `alertas`
- não acessa `configuracoes`
- pode criar, editar e excluir `produtos`
- pode criar, editar e excluir `fornecedores`
- não pode gerenciar usuários nem categorias em `configuracoes`

### Atendente

- acessa `dashboard`, `produtos`, `clientes`, `ordens`, `movimentacoes`, `alertas`
- não acessa a página `fornecedores`
- não acessa `configuracoes`
- em `produtos`, pode apenas visualizar
- não pode criar, editar nem excluir `produtos`
- pode continuar vendo contexto de fornecedor e categoria usado na tela de `produtos`

## Permissões Técnicas

As capabilities públicas do sistema são:

```ts
type AppPermission =
  | 'view_dashboard'
  | 'view_clientes'
  | 'view_ordens'
  | 'view_movimentacoes'
  | 'view_alertas'
  | 'view_produtos'
  | 'manage_produtos'
  | 'view_fornecedores_page'
  | 'manage_fornecedores'
  | 'view_configuracoes'
  | 'manage_categorias'
  | 'manage_users'
  | 'read_fornecedor_context'
  | 'read_categoria_context';
```

`read_fornecedor_context` e `read_categoria_context` existem para permitir leitura contextual em telas como `produtos`, sem liberar a página administrativa correspondente.

## Hooks Client-Side

### `useUser()`

Arquivo: [hooks/useUser.ts](/home/larissa/Documentos/projects/controle-de-estoque/hooks/useUser.ts)

Continua sendo o hook base de sessão e cargo. Agora também expõe:

- `hasPermission(permission)`
- `canAccessRoute(pathname)`

Exemplo:

```tsx
const { cargo, hasPermission } = useUser();

if (hasPermission('manage_produtos')) {
  // Renderizar criar/editar/excluir produto
}
```

### Flags diretas em `useUser()`

As flags de uso diário ficam no próprio [hooks/useUser.ts](/home/larissa/Documentos/projects/controle-de-estoque/hooks/useUser.ts). Além de `hasPermission`, ele expõe:

- `canViewFornecedoresPage`
- `canManageFornecedores`
- `canViewConfiguracoes`
- `canManageCategorias`
- `canManageUsers`
- `canViewProdutos`
- `canManageProdutos`
- `canReadFornecedorContext`
- `canReadCategoriaContext`

Exemplo:

```tsx
const { canManageProdutos } = useUser();

return canManageProdutos ? <BotaoNovoProduto /> : null;
```

## Guards de Componente

Arquivo: [components/role-guard.tsx](/home/larissa/Documentos/projects/controle-de-estoque/components/role-guard.tsx)

O `RoleGuard` suporta três formas de proteção:

- `roles`
- `minRole`
- `permission`

Exemplo por permissão:

```tsx
<RoleGuard permission='manage_produtos'>
  <BotaoExcluirProduto />
</RoleGuard>
```

Também existe o atalho `PermissionGuard`:

```tsx
<PermissionGuard permission='view_configuracoes'>
  <PainelAdministrativo />
</PermissionGuard>
```

## Proteção de Páginas

Arquivo server-side: [lib/server/access-control.ts](/home/larissa/Documentos/projects/controle-de-estoque/lib/server/access-control.ts)

Use `requirePagePermission(permission)` em layouts ou páginas server-side.

Comportamento:

- sem sessão: redireciona para `/login`
- com sessão mas sem permissão: redireciona para `/dashboard`

Exemplo:

```tsx
export default async function ConfiguracoesLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requirePagePermission('view_configuracoes');
  return children;
}
```

Layouts protegidos atuais:

- [app/(dashboard)/fornecedores/layout.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/fornecedores/layout.tsx)
- [app/(dashboard)/configuracoes/layout.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/configuracoes/layout.tsx)

## Proteção de API

Use `requireRoutePermission(request, permission)` no início dos Route Handlers.

Comportamento:

- sem sessão válida: `401`
- com sessão mas sem permissão: `403`

Exemplo:

```ts
export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_produtos'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  // restante da lógica
}
```

## Regras Aplicadas Hoje

### Sidebar

Arquivo: [components/app-sidebar.tsx](/home/larissa/Documentos/projects/controle-de-estoque/components/app-sidebar.tsx)

- itens do menu têm permissão declarada
- grupos vazios não são renderizados
- `atendente` não vê `Fornecedores` nem `Configuracoes`
- `estoquista` não vê `Configuracoes`

### Produtos

Arquivos:

- [app/(dashboard)/produtos/page.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/produtos/page.tsx)
- [app/(dashboard)/produtos/_components/card-pecas.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/produtos/_components/card-pecas.tsx)

Regra:

- `atendente` pode abrir a página e visualizar listagem, filtros e contexto de fornecedor
- `atendente` não vê botão `Novo Produto`
- `atendente` não vê ações de `Editar` e `Excluir`
- mesmo que tente chamar a API manualmente, recebe `403` nas mutações

### Fornecedores

Arquivos:

- [app/(dashboard)/fornecedores/layout.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/fornecedores/layout.tsx)
- [app/api/fornecedores/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/fornecedores/route.ts)
- [app/api/fornecedores/[id]/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/fornecedores/[id]/route.ts)

Regra:

- `atendente` não entra na página
- `atendente` ainda pode ler contexto de fornecedor em endpoints usados por `produtos`
- criação, edição e exclusão de fornecedor exigem `manage_fornecedores`

### Configurações

Arquivos:

- [app/(dashboard)/configuracoes/layout.tsx](/home/larissa/Documentos/projects/controle-de-estoque/app/(dashboard)/configuracoes/layout.tsx)
- [app/api/users/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/users/route.ts)
- [app/api/users/[id]/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/users/[id]/route.ts)
- [app/api/categorias/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/categorias/route.ts)
- [app/api/categorias/[id]/route.ts](/home/larissa/Documentos/projects/controle-de-estoque/app/api/categorias/[id]/route.ts)

Regra:

- página disponível só para `admin`
- `users` é admin only
- `categorias` permite leitura contextual autenticada, mas mutações exigem `manage_categorias`

## Arquivos Principais

| Arquivo | Responsabilidade |
| --- | --- |
| [lib/permissions.ts](/home/larissa/Documentos/projects/controle-de-estoque/lib/permissions.ts) | Matriz central e helpers puros |
| [lib/server/access-control.ts](/home/larissa/Documentos/projects/controle-de-estoque/lib/server/access-control.ts) | Proteção server-side de página e API |
| [hooks/useUser.ts](/home/larissa/Documentos/projects/controle-de-estoque/hooks/useUser.ts) | Sessão, cargo, flags e helpers gerais |
| [components/role-guard.tsx](/home/larissa/Documentos/projects/controle-de-estoque/components/role-guard.tsx) | Guards declarativos em componentes |
| [components/app-sidebar.tsx](/home/larissa/Documentos/projects/controle-de-estoque/components/app-sidebar.tsx) | Filtragem de navegação por permissão |

## Boas Práticas

- Use `hasPermission()` ou as flags de `useUser()` na UI
- Use `requirePagePermission()` em páginas ou layouts server-side
- Use `requireRoutePermission()` em Route Handlers
- Não replique a matriz de permissões em componentes ou endpoints
- Se surgir uma nova regra de acesso, atualize primeiro `lib/permissions.ts`
