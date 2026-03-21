import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { eq } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
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
  const { id } = await params;
  const data = await request.json();

  const updatedUser = await db
    .update(schema.user)
    .set({
      name: data.name,
      email: data.email,
      cargo: data.cargo,
      status: data.status,
      updatedAt: new Date()
    })
    .where(eq(schema.user.id, id))
    .returning();

  await logAction(request, 'edicao', 'usuario', id, `Usuário '${updatedUser[0]?.name}' atualizado`);
  return new Response(JSON.stringify(updatedUser));
}

export async function DELETE(request: Request, { params }: Params) {
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
