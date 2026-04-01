'use client';

import type { AppPermission } from '@/lib/permissions';
import { useUser } from '@/hooks/useUser';
import type { Cargo } from '@/lib/types/auth';

interface RoleGuardProps {
  /** Cargos permitidos para visualizar o conteúdo */
  roles?: Cargo[];
  /** Cargo mínimo na hierarquia (admin > estoquista > atendente) */
  minRole?: Cargo;
  /** Permissão explícita necessária para visualizar o conteúdo */
  permission?: AppPermission;
  /** Conteúdo a ser exibido se autorizado */
  children: React.ReactNode;
  /** Conteúdo alternativo se não autorizado (opcional) */
  fallback?: React.ReactNode;
}

/**
 * Componente para controle declarativo de exibição baseado em cargo
 *
 * @example
 * ```tsx
 * // Exibir apenas para admin
 * <RoleGuard roles={['admin']}>
 *   <BotaoExcluir />
 * </RoleGuard>
 *
 * // Exibir para estoquista ou superior
 * <RoleGuard minRole="estoquista">
 *   <PainelEstoque />
 * </RoleGuard>
 *
 * // Com fallback
 * <RoleGuard roles={['admin']} fallback={<span>Sem permissão</span>}>
 *   <ConfiguracoesAdmin />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  roles,
  minRole,
  permission,
  children,
  fallback = null
}: RoleGuardProps) {
  const { hasRole, canAccess, hasPermission, isAuthenticated } = useUser();

  // Se não está autenticado, não mostra nada
  if (!isAuthenticated) {
    return fallback;
  }

  // Verificação por cargo mínimo (hierarquia)
  if (minRole && !canAccess(minRole)) {
    return fallback;
  }

  // Verificação por lista de cargos
  if (roles && !hasRole(...roles)) {
    return fallback;
  }

  // Verificação por permissão explícita
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  return children;
}

/**
 * Componente para exibir conteúdo apenas para admins
 */
export function AdminOnly({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard roles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para exibir conteúdo para estoquistas ou superior
 */
export function EstoqueAccess({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard minRole='estoquista' fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function PermissionGuard({
  permission,
  children,
  fallback = null
}: {
  permission: AppPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard permission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
