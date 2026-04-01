import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { hasPermission, type AppPermission } from '@/lib/permissions';
import type { Cargo } from '@/lib/types/auth';

function getCargoFromSession(
  session: Awaited<ReturnType<typeof auth.api.getSession>>
): Cargo {
  return (session?.user?.cargo as Cargo | undefined) ?? 'atendente';
}

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requirePagePermission(permission: AppPermission) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const cargo = getCargoFromSession(session);

  if (!hasPermission(cargo, permission)) {
    redirect('/dashboard');
  }

  return {
    session,
    cargo
  };
}

export async function requireRoutePermission(
  request: Request,
  permission: AppPermission
) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const cargo = getCargoFromSession(session);

  if (!hasPermission(cargo, permission)) {
    return NextResponse.json(
      { error: 'Sem permissão para executar esta ação' },
      { status: 403 }
    );
  }

  return {
    session,
    cargo
  };
}
