import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';
import { updateUserServerSchema } from '@/app/utils/validators';

import { eq } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    _request,
    'manage_users'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id } = await params;

  const user = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      cargo: schema.user.cargo,
      status: schema.user.status,
      createdAt: schema.user.createdAt
    })
    .from(schema.user)
    .where(eq(schema.user.id, id));
  return new Response(JSON.stringify(user));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_users');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id } = await params;
  const parsed = updateUserServerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, cargo, status } = parsed.data;

  const updatedUser = await db
    .update(schema.user)
    .set({
      name,
      email,
      cargo,
      status,
      updatedAt: new Date()
    })
    .where(eq(schema.user.id, id))
    .returning();

  await logAction(request, 'edicao', 'usuario', id, `Usuário '${updatedUser[0]?.name}' atualizado`);
  return new Response(JSON.stringify(updatedUser));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_users');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id } = await params;

  // Delete user sessions first (cascade should handle this, but being explicit)
  await db.delete(schema.session).where(eq(schema.session.userId, id));

  // Delete user accounts
  await db.delete(schema.account).where(eq(schema.account.userId, id));

  // Delete the user
  await db.delete(schema.user).where(eq(schema.user.id, id));

  await logAction(request, 'exclusao', 'usuario', id, `Usuário #${id} excluído`);
  return new Response(JSON.stringify({ message: 'User deleted successfully' }));
}
