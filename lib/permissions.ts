import type { Cargo } from '@/lib/types/auth';

export type AppPermission =
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
  | 'manage_empresa'
  | 'read_users_context'
  | 'read_fornecedor_context'
  | 'read_categoria_context';

export const ROLE_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'view_clientes',
    'view_ordens',
    'view_movimentacoes',
    'view_alertas',
    'view_produtos',
    'manage_produtos',
    'view_fornecedores_page',
    'manage_fornecedores',
    'view_configuracoes',
    'manage_categorias',
    'manage_users',
    'manage_empresa',
    'read_users_context',
    'read_fornecedor_context',
    'read_categoria_context'
  ],
  estoquista: [
    'view_dashboard',
    'view_clientes',
    'view_ordens',
    'view_movimentacoes',
    'view_alertas',
    'view_produtos',
    'manage_produtos',
    'view_fornecedores_page',
    'manage_fornecedores',
    'read_users_context',
    'read_fornecedor_context',
    'read_categoria_context'
  ],
  atendente: [
    'view_dashboard',
    'view_clientes',
    'view_ordens',
    'view_movimentacoes',
    'view_alertas',
    'view_produtos',
    'read_users_context',
    'read_fornecedor_context',
    'read_categoria_context'
  ]
} as const satisfies Record<Cargo, readonly AppPermission[]>;

export const APP_ROUTE_PERMISSIONS = {
  '/dashboard': 'view_dashboard',
  '/clientes': 'view_clientes',
  '/ordens': 'view_ordens',
  '/movimentacoes': 'view_movimentacoes',
  '/alertas': 'view_alertas',
  '/produtos': 'view_produtos',
  '/fornecedores': 'view_fornecedores_page',
  '/configuracoes': 'view_configuracoes'
} as const satisfies Partial<Record<string, AppPermission>>;

function getPermissionSet(cargo: Cargo) {
  return new Set<AppPermission>(ROLE_PERMISSIONS[cargo]);
}

export function hasPermission(cargo: Cargo, permission: AppPermission) {
  return getPermissionSet(cargo).has(permission);
}

export function hasAnyPermission(
  cargo: Cargo,
  permissions: readonly AppPermission[]
) {
  const permissionSet = getPermissionSet(cargo);
  return permissions.some((permission) => permissionSet.has(permission));
}

export function getRoutePermission(pathname: string) {
  const routes = Object.keys(APP_ROUTE_PERMISSIONS) as Array<
    keyof typeof APP_ROUTE_PERMISSIONS
  >;

  const matchedRoute = routes
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  return matchedRoute ? APP_ROUTE_PERMISSIONS[matchedRoute] : null;
}

export function hasRoutePermission(cargo: Cargo, pathname: string) {
  const permission = getRoutePermission(pathname);
  if (!permission) return true;
  return hasPermission(cargo, permission);
}
