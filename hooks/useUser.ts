'use client';

import { useSession } from '@/lib/auth-client';
import {
  type AppPermission,
  hasPermission as roleHasPermission,
  hasRoutePermission
} from '@/lib/permissions';
import type { Cargo } from '@/lib/types/auth';
import { CARGO_HIERARCHY } from '@/lib/types/auth';

/**
 * Hook para acessar dados do usuário logado e suas permissões
 *
 * @example
 * ```tsx
 * const { user, cargo, isAdmin, canAccess } = useUser();
 *
 * if (isAdmin) {
 *   // mostrar controles de admin
 * }
 *
 * if (canAccess('estoquista')) {
 *   // mostrar controles de estoque
 * }
 * ```
 */
export function useUser() {
  const { data: session, isPending, error } = useSession();

  const user = session?.user;
  const cargo: Cargo | null = user ? (user.cargo as Cargo) : null;

  /**
   * Verifica se o usuário tem acesso ao cargo mínimo especificado
   * Usa hierarquia: admin > estoquista > atendente
   */
  const canAccess = (minimumCargo: Cargo): boolean => {
    if (!user || !cargo) return false;
    return CARGO_HIERARCHY[cargo] >= CARGO_HIERARCHY[minimumCargo];
  };

  /**
   * Verifica se o usuário tem exatamente um dos cargos especificados
   */
  const hasRole = (...roles: Cargo[]): boolean => {
    if (!user || !cargo) return false;
    return roles.includes(cargo);
  };

  const hasPermission = (permission: AppPermission): boolean => {
    if (!user || !cargo) return false;
    return roleHasPermission(cargo, permission);
  };

  const canAccessRoute = (pathname: string): boolean => {
    if (!user || !cargo) return false;
    return hasRoutePermission(cargo, pathname);
  };

  return {
    // Dados do usuário
    user,
    cargo,

    // Helpers booleanos para verificação rápida
    isAdmin: cargo === 'admin',
    isEstoquista: cargo === 'estoquista',
    isAtendente: cargo === 'atendente',

    // Verificações de hierarquia
    canAccessAdmin: canAccess('admin'),
    canAccessEstoque: canAccess('estoquista'),

    // Funções utilitárias
    canAccess,
    hasRole,
    hasPermission,
    canAccessRoute,
    canViewFornecedoresPage: hasPermission('view_fornecedores_page'),
    canManageFornecedores: hasPermission('manage_fornecedores'),
    canViewConfiguracoes: hasPermission('view_configuracoes'),
    canManageCategorias: hasPermission('manage_categorias'),
    canManageUsers: hasPermission('manage_users'),
    canViewProdutos: hasPermission('view_produtos'),
    canManageProdutos: hasPermission('manage_produtos'),
    canEditProdutoImagem: hasPermission('manage_produto_imagem'),
    canReadFornecedorContext: hasPermission('read_fornecedor_context'),
    canReadCategoriaContext: hasPermission('read_categoria_context'),

    // Estado do usuário
    isAuthenticated: !!user,
    isActive: user?.status ?? false,

    // Estado da requisição
    isPending,
    error
  };
}
